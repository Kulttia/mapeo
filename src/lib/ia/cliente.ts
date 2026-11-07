import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

/**
 * Modelo de la IA. Por defecto Claude Haiku 5.5, el más económico: el piloto prioriza
 * costo. Para más calidad se cambia con MAPEO_MODELO_IA (p. ej. claude-sonnet-5-5).
 */
export const MODELO_IA = process.env.MAPEO_MODELO_IA || "claude-haiku-5-5";

export type RespuestaIa<T> = { datos: T; modelo: string; tokensEntrada: number; tokensSalida: number };

function revisar(mensaje: Anthropic.Message) {
  if (mensaje.stop_reason === "refusal") throw new Error("El modelo declinó la solicitud.");
  if (mensaje.stop_reason === "max_tokens") throw new Error("La respuesta se cortó por longitud; quedó incompleta.");
}

function consumo(mensaje: Anthropic.Message) {
  return {
    modelo: mensaje.model,
    tokensEntrada:
      mensaje.usage.input_tokens + (mensaje.usage.cache_read_input_tokens ?? 0) + (mensaje.usage.cache_creation_input_tokens ?? 0),
    tokensSalida: mensaje.usage.output_tokens,
  };
}

/** Saca el primer objeto JSON del texto, aunque venga dentro de un bloque ```json. */
function extraerJson(texto: string) {
  const inicio = texto.indexOf("{");
  const fin = texto.lastIndexOf("}");
  if (inicio === -1 || fin <= inicio) throw new Error("La respuesta no trae JSON.");
  return JSON.parse(texto.slice(inicio, fin + 1));
}

/**
 * Pide a Claude una respuesta que cumpla `esquema`. Usa salidas estructuradas; si la API
 * rechaza el esquema (400), reintenta pidiendo JSON en texto y lo valida con el mismo esquema.
 */
export async function pedirJson<S extends z.ZodType>(entrada: {
  esquema: S;
  sistema: string;
  contenido: string;
  maxTokens: number;
}): Promise<RespuestaIa<z.infer<S>>> {
  const client = new Anthropic();
  const sistema = [{ type: "text" as const, text: entrada.sistema, cache_control: { type: "ephemeral" as const } }];

  try {
    const mensaje = await client.messages
      .stream({
        model: MODELO_IA,
        max_tokens: entrada.maxTokens,
        system: sistema,
        output_config: { effort: "medium", format: zodOutputFormat(entrada.esquema) },
        messages: [{ role: "user", content: entrada.contenido }],
      })
      .finalMessage();
    revisar(mensaje);
    if (!mensaje.parsed_output) throw new Error("La respuesta no cumplió el esquema.");
    return { datos: mensaje.parsed_output as z.infer<S>, ...consumo(mensaje) };
  } catch (err) {
    if (!(err instanceof Anthropic.BadRequestError)) throw err;
    console.warn("Salida estructurada rechazada; se reintenta con JSON en texto.", err.message);
  }

  const mensaje = await client.messages
    .stream({
      model: MODELO_IA,
      max_tokens: entrada.maxTokens,
      system: sistema,
      output_config: { effort: "medium" },
      messages: [
        {
          role: "user",
          content: `${entrada.contenido}\n\nResponde únicamente con un objeto JSON válido que cumpla este JSON Schema, sin texto adicional:\n${JSON.stringify(z.toJSONSchema(entrada.esquema))}`,
        },
      ],
    })
    .finalMessage();
  revisar(mensaje);
  const texto = mensaje.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  return { datos: entrada.esquema.parse(extraerJson(texto)), ...consumo(mensaje) };
}

import { formatoMinuto } from "@/lib/transcripcion/vtt";
import { Levantamiento } from "./esquemas";
import { MODELO_IA, pedirJson } from "./cliente";
import { NUCLEO } from "./nucleo";

export { MODELO_IA };

const INSTRUCCIONES = `Etapa: extraer el levantamiento AS IS de una sesión.

Recibes la transcripción de una reunión de levantamiento, el glosario del área y, si existe, el levantamiento acumulado de sesiones anteriores. Devuelve el levantamiento COMPLETO y actualizado del proceso:

- Ficha: cada campo con su valor, certeza y citas. Lo que nadie dijo queda con valor null y certeza "pendiente".
- Actividades en orden, con responsable, sistema y transacción (corrige errores de transcripción con el glosario: "efe ciento diez" es F110). Usa secuencias como "8-A1" para variantes de una actividad.
- Casuísticas: variantes, errores, rechazos, excepciones y controles, ligados a la secuencia de la actividad cuando aplica.
- Diagnóstico: cuellos de botella, manualidad, duplicidades, reprocesos, esperas, problemas de datos y operación paralela (Excel locales, chats, correos).
- Hallazgos: campos por definir, contradicciones (con las citas de cada versión), supuestos que hiciste, errores de transcripción que corregiste y preguntas para la próxima sesión.

Si hay levantamiento anterior: consérvalo, intégrale lo nuevo, corrige lo que esta sesión rectifica y marca como "resuelto" el hallazgo que esta sesión aclare (cita dónde se aclaró). No borres citas de sesiones anteriores que siguen vigentes.`;

export type SegmentoEntrada = { sesion: number; orden: number; inicio: number; hablante: string; texto: string };
export type TerminoGlosario = { termino: string; definicion: string | null; variantes: string[] };

function formatearTranscripcion(segmentos: SegmentoEntrada[]) {
  return segmentos
    .map((s) => `[S${s.sesion}-${s.orden}] ${formatoMinuto(s.inicio)} ${s.hablante}: ${s.texto}`)
    .join("\n");
}

function formatearGlosario(glosario: TerminoGlosario[]) {
  return glosario
    .map((g) => `- ${g.termino}: ${g.definicion ?? ""} (Teams puede escribirlo como: ${g.variantes.join(", ")})`)
    .join("\n");
}

export type ResultadoLevantamiento = {
  levantamiento: Levantamiento;
  modelo: string;
  tokensEntrada: number;
  tokensSalida: number;
};

export async function extraerLevantamiento(entrada: {
  proceso: { codigo: string; nombre: string };
  sesion: { numero: number; titulo: string; fecha: Date };
  segmentos: SegmentoEntrada[];
  glosario: TerminoGlosario[];
  anterior: Levantamiento | null;
}): Promise<ResultadoLevantamiento> {

  const contexto = [
    `Proceso: ${entrada.proceso.codigo} · ${entrada.proceso.nombre}`,
    `Sesión ${entrada.sesion.numero}: ${entrada.sesion.titulo} (${entrada.sesion.fecha.toISOString().slice(0, 10)})`,
    `<glosario>\n${formatearGlosario(entrada.glosario)}\n</glosario>`,
    entrada.anterior
      ? `<levantamiento_anterior>\n${JSON.stringify(entrada.anterior)}\n</levantamiento_anterior>`
      : "No hay levantamiento anterior: esta es la primera sesión.",
    `<transcripcion>\n${formatearTranscripcion(entrada.segmentos)}\n</transcripcion>`,
  ].join("\n\n");

  const r = await pedirJson({
    esquema: Levantamiento,
    sistema: `${NUCLEO}\n\n${INSTRUCCIONES}`,
    contenido: contexto,
    maxTokens: 64000,
  });
  return { levantamiento: r.datos, modelo: r.modelo, tokensEntrada: r.tokensEntrada, tokensSalida: r.tokensSalida };
}

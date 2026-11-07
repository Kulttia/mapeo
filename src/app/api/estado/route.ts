import Anthropic from "@anthropic-ai/sdk";
import { connection } from "next/server";
import { MODELO_IA } from "@/lib/ia/levantamiento";

/**
 * Diagnóstico de configuración para el piloto. Nunca devuelve valores de las
 * variables: solo si existen y si la API de Claude acepta la clave.
 */
export async function GET() {
  await connection();
  const claveApi = Boolean(process.env.ANTHROPIC_API_KEY);
  let api: "ok" | "sin_clave" | "rechazada" | "error" = claveApi ? "ok" : "sin_clave";
  if (claveApi) {
    try {
      await new Anthropic().models.retrieve(MODELO_IA);
    } catch (err) {
      api = err instanceof Anthropic.AuthenticationError ? "rechazada" : "error";
    }
  }
  return Response.json({
    modelo: MODELO_IA,
    api,
    clavePiloto: Boolean(process.env.MAPEO_CLAVE_PILOTO),
    baseDatos: Boolean(process.env.DATABASE_URL),
  });
}

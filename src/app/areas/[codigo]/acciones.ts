"use server";

import { refresh } from "next/cache";
import { generarMapa } from "@/lib/mapa/servicio";
import { verificarClavePiloto } from "@/lib/piloto";

export type EstadoMapa = { error?: string } | null;

export async function integrarConIa(codigo: string, _prev: EstadoMapa, form: FormData): Promise<EstadoMapa> {
  const errorClave = verificarClavePiloto(form.get("clave"));
  if (errorClave) return { error: errorClave };
  if (!process.env.ANTHROPIC_API_KEY) return { error: "Falta ANTHROPIC_API_KEY en este entorno." };
  try {
    await generarMapa(codigo);
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
  refresh();
  return null;
}

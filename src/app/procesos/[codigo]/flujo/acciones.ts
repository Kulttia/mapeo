"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db, schema } from "@/db";
import { generarModelo, guardarModelo, modeloVigente } from "@/lib/bpmn/servicio";

async function procesoPorCodigo(codigo: string) {
  const [p] = await db.select().from(schema.proceso).where(eq(schema.proceso.codigo, codigo));
  if (!p) throw new Error(`No existe el proceso ${codigo}`);
  return p;
}

export type EstadoFlujo = { error?: string } | null;

export async function generarFlujo(codigo: string): Promise<EstadoFlujo> {
  try {
    await generarModelo(await procesoPorCodigo(codigo));
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
  refresh();
  return null;
}

/** Guarda lo que la persona ajustó en el editor como una versión nueva. */
export async function guardarFlujo(codigo: string, xml: string): Promise<EstadoFlujo> {
  if (!xml.includes("bpmn:definitions") && !xml.includes("<definitions")) return { error: "El diagrama no es BPMN válido." };
  if (xml.length > 2_000_000) return { error: "El diagrama es demasiado grande." };
  await guardarModelo(await procesoPorCodigo(codigo), xml, "en_revision", "editar_bpmn");
  refresh();
  return null;
}

export async function validarFlujo(codigo: string, validado: boolean) {
  const p = await procesoPorCodigo(codigo);
  const m = await modeloVigente(p.id);
  if (!m) return;
  const estado = validado ? "validado" : "en_revision";
  await db.update(schema.modeloBpmn).set({ estado }).where(eq(schema.modeloBpmn.id, m.id));
  await db.update(schema.proceso).set({ estadoModelo: estado }).where(eq(schema.proceso.id, p.id));
  refresh();
}

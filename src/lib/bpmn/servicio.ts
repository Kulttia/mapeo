import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { ContenidoFicha, Levantamiento } from "@/lib/ia/esquemas";
import { fichaVigente } from "@/lib/levantamiento/servicio";
import { generarBpmn } from "./generar";

const { proceso, modeloBpmn, auditoria } = schema;

/** Quita lo que la persona rechazó en la revisión: no debe llegar al flujo. */
export function sinRechazados({ levantamiento: l, revision }: ContenidoFicha): Levantamiento {
  const vale = (lista: string, i: number) => revision[`${lista}.${i}`] !== "rechazado";
  return {
    ...l,
    actividades: l.actividades.filter((_, i) => vale("actividades", i)),
    casuisticas: l.casuisticas.filter((_, i) => vale("casuisticas", i)),
    diagnostico: l.diagnostico.filter((_, i) => vale("diagnostico", i)),
  };
}

export async function modeloVigente(procesoId: string) {
  const [m] = await db
    .select()
    .from(modeloBpmn)
    .where(eq(modeloBpmn.procesoId, procesoId))
    .orderBy(desc(modeloBpmn.version))
    .limit(1);
  return m ?? null;
}

/** Genera el BPMN desde el levantamiento vigente (sin IA: reglas fijas, mismo resultado siempre). */
export async function generarModelo(p: typeof proceso.$inferSelect) {
  const ficha = await fichaVigente(p.id);
  if (!ficha) throw new Error("Primero procesa y revisa el levantamiento.");
  const l = sinRechazados(ficha.contenido);
  if (!l.actividades.length) throw new Error("El levantamiento no tiene actividades para modelar.");
  const xml = generarBpmn(l, { id: p.codigo, nombre: p.nombre });
  await guardarModelo(p, xml, "borrador_ia", "generar_bpmn");
}

export async function guardarModelo(
  p: typeof proceso.$inferSelect,
  xml: string,
  estado: "borrador_ia" | "en_revision" | "validado",
  accion: string,
) {
  const anterior = await modeloVigente(p.id);
  await db.insert(modeloBpmn).values({ procesoId: p.id, version: (anterior?.version ?? 0) + 1, xml, estado });
  await db.update(proceso).set({ estadoModelo: estado }).where(eq(proceso.id, p.id));
  await db.insert(auditoria).values({ accion, entidad: "proceso", entidadId: p.id, detalle: { version: (anterior?.version ?? 0) + 1 } });
}

import { and, asc, desc, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db";
import type { ContenidoFicha } from "@/lib/ia/esquemas";
import { extraerLevantamiento, MODELO_IA } from "@/lib/ia/levantamiento";

const { proceso, sesion, transcripcion, segmento, glosario, fichaVersion, ejecucionIa, auditoria } = schema;

/** Una corrida "en curso" más vieja que esto se considera caída y no bloquea otra. */
const EJECUCION_VENCIDA_MS = 15 * 60 * 1000;

export async function fichaVigente(procesoId: string) {
  const [v] = await db
    .select()
    .from(fichaVersion)
    .where(eq(fichaVersion.procesoId, procesoId))
    .orderBy(desc(fichaVersion.version))
    .limit(1);
  return v ? { ...v, contenido: v.contenido as ContenidoFicha } : null;
}

/** Sesión que falta procesar: la primera posterior a la última que ya alimentó la ficha. */
export async function siguienteSesionPendiente(procesoId: string) {
  const sesiones = await db.select().from(sesion).where(eq(sesion.procesoId, procesoId)).orderBy(asc(sesion.numero));
  const vigente = await fichaVigente(procesoId);
  const ultima = sesiones.find((s) => s.id === vigente?.sesionId)?.numero ?? 0;
  return sesiones.find((s) => s.numero > ultima) ?? null;
}

export async function ejecucionEnCurso(procesoId: string) {
  const [e] = await db
    .select()
    .from(ejecucionIa)
    .where(
      and(
        eq(ejecucionIa.procesoId, procesoId),
        eq(ejecucionIa.estado, "en_curso"),
        gt(ejecucionIa.creadoEn, new Date(Date.now() - EJECUCION_VENCIDA_MS)),
      ),
    )
    .limit(1);
  return e ?? null;
}

/** Valida y registra la corrida. Lo pesado va en completarProcesamiento, fuera de la petición. */
export async function iniciarProcesamiento(procesoId: string) {
  if (await ejecucionEnCurso(procesoId)) throw new Error("Ya hay un procesamiento en curso para este proceso.");
  const pendiente = await siguienteSesionPendiente(procesoId);
  if (!pendiente) throw new Error("Todas las sesiones ya están procesadas.");

  const [e] = await db
    .insert(ejecucionIa)
    .values({ procesoId, sesionId: pendiente.id, etapa: "levantamiento", modelo: MODELO_IA })
    .returning();
  return e;
}

export async function completarProcesamiento(ejecucionId: string) {
  const inicio = Date.now();
  const [e] = await db.select().from(ejecucionIa).where(eq(ejecucionIa.id, ejecucionId));
  try {
    const [p] = await db.select().from(proceso).where(eq(proceso.id, e.procesoId));
    const [s] = await db.select().from(sesion).where(eq(sesion.id, e.sesionId));
    const segmentos = await db
      .select({ orden: segmento.orden, inicio: segmento.inicio, hablante: segmento.hablante, texto: segmento.texto })
      .from(segmento)
      .innerJoin(transcripcion, eq(segmento.transcripcionId, transcripcion.id))
      .where(eq(transcripcion.sesionId, s.id))
      .orderBy(asc(segmento.orden));
    const terminos = await db.select().from(glosario).where(eq(glosario.areaId, p.areaId));
    const vigente = await fichaVigente(p.id);

    const r = await extraerLevantamiento({
      proceso: p,
      sesion: s,
      segmentos: segmentos.map((x) => ({ ...x, sesion: s.numero })),
      glosario: terminos,
      anterior: vigente?.contenido.levantamiento ?? null,
    });

    const contenido: ContenidoFicha = { levantamiento: r.levantamiento, revision: {} };
    await db.insert(fichaVersion).values({
      procesoId: p.id,
      version: (vigente?.version ?? 0) + 1,
      contenido,
      sesionId: s.id,
      autor: `IA · ${r.modelo}`,
    });
    await db.update(proceso).set({ estadoLevantamiento: "borrador_ia" }).where(eq(proceso.id, p.id));
    await db
      .update(ejecucionIa)
      .set({
        estado: "completada",
        modelo: r.modelo,
        tokensEntrada: r.tokensEntrada,
        tokensSalida: r.tokensSalida,
        duracionMs: Date.now() - inicio,
      })
      .where(eq(ejecucionIa.id, ejecucionId));
    await db.insert(auditoria).values({
      accion: "levantamiento_ia",
      entidad: "proceso",
      entidadId: p.id,
      detalle: { sesion: s.numero, modelo: r.modelo },
    });
  } catch (err) {
    await db
      .update(ejecucionIa)
      .set({ estado: "error", error: err instanceof Error ? err.message : String(err), duracionMs: Date.now() - inicio })
      .where(eq(ejecucionIa.id, ejecucionId));
    throw err;
  }
}

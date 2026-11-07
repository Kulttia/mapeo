import { asc, count, desc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db, schema } from "@/db";
import { ejecucionEnCurso, fichaVigente, siguienteSesionPendiente } from "@/lib/levantamiento/servicio";

const { area, proceso, sesion, transcripcion, segmento, ejecucionIa } = schema;

export async function listarAreasConProcesos() {
  await connection();
  const areas = await db.select().from(area).orderBy(asc(area.nombre));
  const procesos = await db
    .select({
      id: proceso.id,
      areaId: proceso.areaId,
      codigo: proceso.codigo,
      nombre: proceso.nombre,
      estadoLevantamiento: proceso.estadoLevantamiento,
      estadoModelo: proceso.estadoModelo,
      sesiones: count(sesion.id),
    })
    .from(proceso)
    .leftJoin(sesion, eq(sesion.procesoId, proceso.id))
    .groupBy(proceso.id)
    .orderBy(asc(proceso.codigo));

  return areas.map((a) => ({ ...a, procesos: procesos.filter((p) => p.areaId === a.id) }));
}

export async function obtenerProceso(codigo: string) {
  await connection();
  const [p] = await db.select().from(proceso).where(eq(proceso.codigo, codigo));
  if (!p) return null;
  const sesiones = await db
    .select({
      id: sesion.id,
      numero: sesion.numero,
      titulo: sesion.titulo,
      fecha: sesion.fecha,
      participantes: sesion.participantes,
      transcripcionId: transcripcion.id,
      duracionSegundos: transcripcion.duracionSegundos,
    })
    .from(sesion)
    .leftJoin(transcripcion, eq(transcripcion.sesionId, sesion.id))
    .where(eq(sesion.procesoId, p.id))
    .orderBy(asc(sesion.numero));
  return { ...p, sesiones };
}

export async function obtenerSegmentos(transcripcionId: string) {
  await connection();
  return db
    .select()
    .from(segmento)
    .where(eq(segmento.transcripcionId, transcripcionId))
    .orderBy(asc(segmento.orden));
}

/** Todo lo que necesita la vista de revisión: ficha vigente, sesiones con sus segmentos y estado de la IA. */
export async function obtenerRevision(codigo: string) {
  await connection();
  const p = await obtenerProceso(codigo);
  if (!p) return null;
  const [vigente, pendiente, enCurso, ultimas] = await Promise.all([
    fichaVigente(p.id),
    siguienteSesionPendiente(p.id),
    ejecucionEnCurso(p.id),
    db.select().from(ejecucionIa).where(eq(ejecucionIa.procesoId, p.id)).orderBy(desc(ejecucionIa.creadoEn)).limit(1),
  ]);
  return { proceso: p, vigente, pendiente, enCurso, ultima: ultimas[0] ?? null };
}

export async function obtenerSegmentosProceso(sesiones: { numero: number; transcripcionId: string | null }[]) {
  await connection();
  const porSesion = await Promise.all(
    sesiones.map(async (s) => ({
      numero: s.numero,
      segmentos: s.transcripcionId
        ? (await obtenerSegmentos(s.transcripcionId)).map(({ orden, inicio, hablante, texto }) => ({ orden, inicio, hablante, texto }))
        : [],
    })),
  );
  return porSesion;
}

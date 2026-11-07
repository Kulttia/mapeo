import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Levantamiento } from "@/lib/ia/esquemas";
import { integrarArea, type MapaIntegrado } from "@/lib/ia/mapa";
import { fichaVigente } from "@/lib/levantamiento/servicio";

const { area, proceso, mapaArea, relacionProceso, auditoria } = schema;

export type ContenidoMapa = { mapa: MapaIntegrado; procesos: string[]; modelo: string };

/** Área con sus procesos, el levantamiento vigente de cada uno y el último mapa integrado. */
export async function cargarArea(codigo: string) {
  const [a] = await db.select().from(area).where(eq(area.codigo, codigo));
  if (!a) return null;
  const procesos = await db.select().from(proceso).where(eq(proceso.areaId, a.id)).orderBy(asc(proceso.codigo));
  const conFicha = await Promise.all(
    procesos.map(async (p) => ({ ...p, levantamiento: (await fichaVigente(p.id))?.contenido.levantamiento ?? null })),
  );
  const [m] = await db.select().from(mapaArea).where(eq(mapaArea.areaId, a.id)).orderBy(desc(mapaArea.version)).limit(1);
  return { area: a, procesos: conFicha, mapa: m ? { ...m, contenido: m.contenido as ContenidoMapa } : null };
}

/** Genera una nueva versión del mapa con la IA y guarda las relaciones encontradas. */
export async function generarMapa(codigo: string) {
  const datos = await cargarArea(codigo);
  if (!datos) throw new Error("El área no existe.");
  const conLevantamiento = datos.procesos.filter((p): p is typeof p & { levantamiento: Levantamiento } => !!p.levantamiento);
  if (conLevantamiento.length < 2) throw new Error("Se necesitan al menos dos procesos con levantamiento para integrar el área.");

  const { mapa, modelo } = await integrarArea(
    datos.area.nombre,
    conLevantamiento.map((p) => ({ codigo: p.codigo, nombre: p.nombre, levantamiento: p.levantamiento })),
  );
  const contenido: ContenidoMapa = { mapa, procesos: conLevantamiento.map((p) => p.codigo), modelo };
  await db.insert(mapaArea).values({ areaId: datos.area.id, version: (datos.mapa?.version ?? 0) + 1, contenido });

  const idPorCodigo = new Map(datos.procesos.map((p) => [p.codigo, p.id]));
  for (const p of datos.procesos) await db.delete(relacionProceso).where(eq(relacionProceso.origenId, p.id));
  if (mapa.relaciones.length) {
    await db.insert(relacionProceso).values(
      mapa.relaciones.map((r) => ({
        origenId: idPorCodigo.get(r.origen)!,
        destinoId: idPorCodigo.get(r.destino)!,
        tipo: r.tipo,
        objeto: r.objeto,
        certeza: r.certeza,
      })),
    );
  }
  await db.insert(auditoria).values({ accion: "mapa_ia", entidad: "area", entidadId: datos.area.id, detalle: { modelo } });
}

/** Matriz elemento × proceso contando actividades, p. ej. responsables o sistemas. */
export function matriz(procesos: { codigo: string; levantamiento: Levantamiento | null }[], campo: "responsable" | "sistema") {
  const filas = new Map<string, Record<string, number>>();
  for (const p of procesos) {
    for (const a of p.levantamiento?.actividades ?? []) {
      const clave = a[campo]?.trim();
      if (!clave) continue;
      const fila = filas.get(clave) ?? {};
      fila[p.codigo] = (fila[p.codigo] ?? 0) + 1;
      filas.set(clave, fila);
    }
  }
  return [...filas.entries()].sort(([a], [b]) => a.localeCompare(b, "es"));
}

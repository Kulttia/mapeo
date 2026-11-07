"use server";

import { and, desc, eq, like } from "drizzle-orm";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db, schema } from "@/db";
import { completarProcesamiento, iniciarProcesamiento } from "@/lib/levantamiento/servicio";
import { verificarClavePiloto } from "@/lib/piloto";
import { leerTranscripcion } from "@/lib/transcripcion/leer";

const { area, proceso, sesion, transcripcion, segmento, auditoria } = schema;

export type EstadoSubida = { error?: string } | null;

const MAX_BYTES = 4 * 1024 * 1024;

/** "Gestión Humana" → "GH"; si ya existe, agrega un número. */
async function codigoArea(nombre: string) {
  const base =
    nombre
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .split(/\s+/)
      .filter((p) => p.length > 2)
      .map((p) => p[0].toUpperCase())
      .join("")
      .slice(0, 4) || "AR";
  let codigo = base;
  for (let i = 2; (await db.select().from(area).where(eq(area.codigo, codigo))).length; i++) codigo = `${base}${i}`;
  return codigo;
}

/** Siguiente código de proceso del área: P-FIN-05. */
async function codigoProceso(codigoArea: string) {
  const prefijo = `P-${codigoArea}-`;
  const existentes = await db.select({ codigo: proceso.codigo }).from(proceso).where(like(proceso.codigo, `${prefijo}%`));
  const max = Math.max(0, ...existentes.map((p) => Number(p.codigo.slice(prefijo.length)) || 0));
  return `${prefijo}${String(max + 1).padStart(2, "0")}`;
}

/**
 * Sube una transcripción de Teams: crea área y proceso si son nuevos, agrega la sesión
 * y, si se pidió, lanza la IA de inmediato.
 */
export async function subirTranscripcion(_prev: EstadoSubida, form: FormData): Promise<EstadoSubida> {
  const errorClave = verificarClavePiloto(form.get("clave"));
  if (errorClave) return { error: errorClave };

  const archivo = form.get("archivo");
  if (!(archivo instanceof File) || !archivo.size) return { error: "Elige el archivo de la transcripción." };
  if (archivo.size > MAX_BYTES) return { error: "El archivo pesa más de 4 MB." };

  let segmentos, formato;
  try {
    ({ segmentos, formato } = await leerTranscripcion(archivo.name, await archivo.arrayBuffer()));
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo leer el archivo." };
  }

  const texto = (k: string) => String(form.get(k) ?? "").trim();
  const areaId = texto("areaId");
  const areaNueva = texto("areaNueva");
  const procesoId = texto("procesoId");
  const procesoNuevo = texto("procesoNuevo");
  const titulo = texto("titulo") || archivo.name.replace(/\.[^.]+$/, "");
  const fecha = texto("fecha") ? new Date(`${texto("fecha")}T12:00:00-05:00`) : new Date();

  // Área
  let a;
  if (areaId && areaId !== "nueva") {
    [a] = await db.select().from(area).where(eq(area.id, areaId));
  } else {
    if (!areaNueva) return { error: "Escribe el nombre del área." };
    [a] = await db.insert(area).values({ codigo: await codigoArea(areaNueva), nombre: areaNueva }).returning();
  }
  if (!a) return { error: "El área no existe." };

  // Proceso
  let p;
  if (procesoId && procesoId !== "nuevo") {
    [p] = await db.select().from(proceso).where(and(eq(proceso.id, procesoId), eq(proceso.areaId, a.id)));
  } else {
    if (!procesoNuevo) return { error: "Escribe el nombre del proceso." };
    [p] = await db
      .insert(proceso)
      .values({ areaId: a.id, codigo: await codigoProceso(a.codigo), nombre: procesoNuevo })
      .returning();
  }
  if (!p) return { error: "El proceso no pertenece al área elegida." };

  // Sesión y transcripción
  const [ultima] = await db
    .select({ numero: sesion.numero })
    .from(sesion)
    .where(eq(sesion.procesoId, p.id))
    .orderBy(desc(sesion.numero))
    .limit(1);
  const [s] = await db
    .insert(sesion)
    .values({
      procesoId: p.id,
      numero: (ultima?.numero ?? 0) + 1,
      titulo,
      fecha,
      participantes: [...new Set(segmentos.map((x) => x.hablante))],
    })
    .returning();
  const [tr] = await db
    .insert(transcripcion)
    .values({
      sesionId: s.id,
      nombreArchivo: archivo.name,
      formato,
      duracionSegundos: Math.round(segmentos.at(-1)?.fin ?? 0),
    })
    .returning();
  for (let i = 0; i < segmentos.length; i += 200) {
    await db.insert(segmento).values(segmentos.slice(i, i + 200).map((x) => ({ ...x, transcripcionId: tr.id })));
  }
  await db.insert(auditoria).values({
    accion: "subir_transcripcion",
    entidad: "sesion",
    entidadId: s.id,
    detalle: { archivo: archivo.name, formato, segmentos: segmentos.length },
  });

  if (form.get("procesar") === "on" && process.env.ANTHROPIC_API_KEY) {
    try {
      const e = await iniciarProcesamiento(p.id);
      after(() => completarProcesamiento(e.id).catch((err) => console.error("Levantamiento IA falló", err)));
    } catch {
      // Si ya había una corrida o la sesión no es la siguiente pendiente, el usuario la lanza desde el proceso.
    }
  }

  redirect(`/procesos/${p.codigo}`);
}

"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { after } from "next/server";
import { db, schema } from "@/db";
import type { ContenidoFicha, EstadoRevision } from "@/lib/ia/esquemas";
import { completarProcesamiento, fichaVigente, iniciarProcesamiento } from "@/lib/levantamiento/servicio";
import { verificarClavePiloto } from "@/lib/piloto";

const { proceso, fichaVersion, auditoria } = schema;

async function procesoPorCodigo(codigo: string) {
  const [p] = await db.select().from(proceso).where(eq(proceso.codigo, codigo));
  if (!p) throw new Error(`No existe el proceso ${codigo}`);
  return p;
}

export type EstadoAccion = { error?: string; ok?: string } | null;

/** Lanza la IA sobre la siguiente sesión pendiente. Protegida con la clave del piloto porque gasta API. */
export async function procesarConIa(codigo: string, _prev: EstadoAccion, form: FormData): Promise<EstadoAccion> {
  const errorClave = verificarClavePiloto(form.get("clave"));
  if (errorClave) return { error: errorClave };
  if (!process.env.ANTHROPIC_API_KEY) return { error: "Falta ANTHROPIC_API_KEY en este entorno." };

  try {
    const p = await procesoPorCodigo(codigo);
    const e = await iniciarProcesamiento(p.id);
    after(() => completarProcesamiento(e.id).catch((err) => console.error("Levantamiento IA falló", err)));
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
  refresh();
  return { ok: "Procesando. Tarda unos minutos; esta página se actualiza sola." };
}

/** Aplica un cambio sobre la ficha vigente sin crear versión nueva (las versiones las crea la IA). */
async function modificarFicha(codigo: string, accion: string, cambio: (c: ContenidoFicha) => void, detalle: object) {
  const p = await procesoPorCodigo(codigo);
  const vigente = await fichaVigente(p.id);
  if (!vigente) throw new Error("Este proceso aún no tiene levantamiento.");
  const contenido = structuredClone(vigente.contenido);
  cambio(contenido);
  await db.update(fichaVersion).set({ contenido }).where(eq(fichaVersion.id, vigente.id));
  if (p.estadoLevantamiento === "borrador_ia") {
    await db.update(proceso).set({ estadoLevantamiento: "en_revision" }).where(eq(proceso.id, p.id));
  }
  await db.insert(auditoria).values({ accion, entidad: "ficha_version", entidadId: vigente.id, detalle });
  refresh();
}

/** Navega una ruta como "actividades.3.responsable" dentro del levantamiento. */
function asignar(raiz: Record<string, unknown>, ruta: string, valor: unknown) {
  const partes = ruta.split(".");
  const ultimo = partes.pop()!;
  let nodo = raiz as Record<string, unknown>;
  for (const parte of partes) nodo = nodo[parte] as Record<string, unknown>;
  if (!nodo || !(ultimo in nodo)) throw new Error(`Ruta inválida: ${ruta}`);
  nodo[ultimo] = valor;
}

export async function marcarRevision(codigo: string, clave: string, estado: EstadoRevision | null) {
  await modificarFicha(
    codigo,
    "revision",
    (c) => {
      if (estado) c.revision[clave] = estado;
      else delete c.revision[clave];
    },
    { clave, estado },
  );
}

/**
 * Corrige un texto. `ruta` apunta al valor dentro del levantamiento y `clave` al elemento
 * revisado ("ficha.dueno" o "actividades.3"). Un campo de ficha corregido pasa a confirmado.
 */
export async function editarValor(codigo: string, clave: string, ruta: string, valor: string) {
  const limpio = valor.trim() || null;
  await modificarFicha(
    codigo,
    "edicion",
    (c) => {
      asignar(c.levantamiento as unknown as Record<string, unknown>, ruta, limpio);
      if (ruta.startsWith("ficha.")) {
        asignar(c.levantamiento as unknown as Record<string, unknown>, ruta.replace(/\.valor$/, ".certeza"), limpio ? "confirmado" : "pendiente");
      }
      c.revision[clave] = "editado";
    },
    { ruta, valor: limpio },
  );
}

export async function cambiarEstadoHallazgo(codigo: string, indice: number, estado: "abierto" | "resuelto") {
  await modificarFicha(
    codigo,
    "hallazgo",
    (c) => {
      c.levantamiento.hallazgos[indice].estado = estado;
    },
    { indice, estado },
  );
}

export async function cambiarEstadoLevantamiento(codigo: string, estado: "en_revision" | "validado") {
  const p = await procesoPorCodigo(codigo);
  await db.update(proceso).set({ estadoLevantamiento: estado }).where(eq(proceso.id, p.id));
  await db.insert(auditoria).values({ accion: "estado_levantamiento", entidad: "proceso", entidadId: p.id, detalle: { estado } });
  refresh();
}

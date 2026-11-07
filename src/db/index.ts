import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import * as schema from "./schema";

/**
 * Con DATABASE_URL (Vercel / Neon) usa Postgres real.
 * Sin ella usa PGlite en ~/.mapeo/pglite para trabajar en local sin instalar nada
 * (fuera de OneDrive: la sincronización bloquea los archivos de la base).
 */
function crearDb() {
  const url = process.env.DATABASE_URL;
  if (url) return drizzleNeon(neon(url), { schema, casing: "snake_case" });
  if (process.env.VERCEL) throw new Error("Falta DATABASE_URL en el entorno de Vercel.");
  const dir = process.env.PGLITE_DIR ?? join(homedir(), ".mapeo", "pglite");
  mkdirSync(dir, { recursive: true });
  return drizzlePglite(dir, { schema, casing: "snake_case" });
}

type Db = ReturnType<typeof crearDb>;

const global = globalThis as unknown as { __mapeoDb?: Db };

// Perezosa: el build importa este módulo en varios workers y no debe abrir la base.
export const db = new Proxy({} as Db, {
  get(_, prop) {
    const real = (global.__mapeoDb ??= crearDb());
    const valor = Reflect.get(real, prop, real);
    return typeof valor === "function" ? valor.bind(real) : valor;
  },
});

export { schema };

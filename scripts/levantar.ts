import "dotenv/config";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { db, schema } from "../src/db";
import { completarProcesamiento, iniciarProcesamiento, siguienteSesionPendiente } from "../src/lib/levantamiento/servicio";

config({ path: ".env.local" });

/**
 * Procesa con IA las sesiones pendientes de un proceso, en orden.
 * Uso: npm run levantar -- P-FIN-01 [--una]
 */
async function main() {
  const codigo = process.argv[2];
  if (!codigo) throw new Error("Indica el código del proceso, p. ej. P-FIN-01");
  const una = process.argv.includes("--una");

  const [p] = await db.select().from(schema.proceso).where(eq(schema.proceso.codigo, codigo));
  if (!p) throw new Error(`No existe el proceso ${codigo}`);

  while (await siguienteSesionPendiente(p.id)) {
    const e = await iniciarProcesamiento(p.id);
    const t = Date.now();
    console.log(`${codigo}: procesando sesión…`);
    await completarProcesamiento(e.id);
    const [fin] = await db.select().from(schema.ejecucionIa).where(eq(schema.ejecucionIa.id, e.id));
    console.log(
      `  listo en ${Math.round((Date.now() - t) / 1000)} s · ${fin.tokensEntrada} tokens de entrada, ${fin.tokensSalida} de salida`,
    );
    if (una) break;
  }
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);

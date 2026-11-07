import { config } from "dotenv";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "../src/db";
import { generarModelo } from "../src/lib/bpmn/servicio";
import { fichaVigente } from "../src/lib/levantamiento/servicio";
import { generarMapa } from "../src/lib/mapa/servicio";

config({ path: [".env.development.local", ".env.local"] });

/**
 * Genera el flujo BPMN de cada proceso con levantamiento y, con --mapa, integra el área con IA.
 * Uso: npm run modelar -- FIN [--mapa]
 */
async function main() {
  const codigo = process.argv[2];
  if (!codigo) throw new Error("Indica el código del área, p. ej. FIN");
  const [a] = await db.select().from(schema.area).where(eq(schema.area.codigo, codigo));
  if (!a) throw new Error(`No existe el área ${codigo}`);

  const procesos = await db.select().from(schema.proceso).where(eq(schema.proceso.areaId, a.id)).orderBy(asc(schema.proceso.codigo));
  for (const p of procesos) {
    if (!(await fichaVigente(p.id))) {
      console.log(`${p.codigo}: sin levantamiento, se omite`);
      continue;
    }
    await generarModelo(p);
    console.log(`${p.codigo}: flujo BPMN generado`);
  }

  if (process.argv.includes("--mapa")) {
    const t = Date.now();
    await generarMapa(codigo);
    console.log(`Mapa del área integrado en ${Math.round((Date.now() - t) / 1000)} s`);
  }
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);

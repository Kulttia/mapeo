import { config } from "dotenv";
config({ path: [".env.development.local", ".env.local"] });
import { eq } from "drizzle-orm";
import { db, schema } from "../src/db";
import type { ContenidoFicha } from "../src/lib/ia/esquemas";
import { fichaVigente } from "../src/lib/levantamiento/servicio";

/** Resumen legible del levantamiento vigente de un proceso. Uso: npx tsx scripts/resumen-levantamiento.ts P-FIN-02 */
async function main() {
  const codigo = process.argv[2];
  const [p] = await db.select().from(schema.proceso).where(eq(schema.proceso.codigo, codigo));
  const v = await fichaVigente(p.id);
  if (!v) return console.log("sin levantamiento");
  const { levantamiento: l } = v.contenido as ContenidoFicha;
  console.log(`# ${codigo} v${v.version} (${v.autor})`);
  for (const [k, c] of Object.entries(l.ficha)) console.log(`ficha.${k} [${c.certeza}] ${c.valor ?? "—"} ${c.citas.map((x) => `S${x.sesion}-${x.segmento}`).join(",")}`);
  console.log(`\n## Actividades (${l.actividades.length})`);
  for (const a of l.actividades) console.log(`${a.secuencia}. ${a.nombre} | ${a.responsable} | ${a.sistema ?? ""} ${a.transaccion ?? ""} [${a.certeza}]`);
  console.log(`\n## Casuísticas (${l.casuisticas.length})`);
  for (const c of l.casuisticas) console.log(`(${c.secuenciaActividad ?? "-"}) ${c.condicion} → ${c.tratamiento ?? ""}`);
  console.log(`\n## Diagnóstico (${l.diagnostico.length})`);
  for (const d of l.diagnostico) console.log(`${d.categoria}: ${d.descripcion}`);
  console.log(`\n## Hallazgos (${l.hallazgos.length})`);
  for (const h of l.hallazgos) console.log(`${h.tipo} [${h.estado}]: ${h.texto}`);
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });

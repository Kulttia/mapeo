import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { db, schema } from "../src/db";
import { parseVtt } from "../src/lib/transcripcion/vtt";

/**
 * Carga el área financiera de prueba: usuarios, procesos, sesiones y
 * transcripciones (fixtures/). Borra antes el área FIN para poder repetirse.
 */

type Fixture = {
  area: { codigo: string; nombre: string; descripcion: string };
  usuarios: { correo: string; nombre: string; cargo: string; rol: "administrador" | "analista" | "validador" | "lector" }[];
  procesos: {
    codigo: string;
    nombre: string;
    macroproceso: string;
    sesiones: { numero: number; titulo: string; fecha: string; archivo: string }[];
  }[];
};

const FIXTURES = join(process.cwd(), "fixtures");
const leer = (ruta: string) => readFileSync(join(FIXTURES, ruta), "utf8");

async function main() {
  const fx: Fixture = JSON.parse(leer("area-financiera.json"));
  const glosario: { termino: string; definicion: string; variantes: string[] }[] = JSON.parse(
    leer("glosario-financiera.json"),
  );

  await db.delete(schema.area).where(eq(schema.area.codigo, fx.area.codigo));
  const [area] = await db.insert(schema.area).values(fx.area).returning();

  for (const u of fx.usuarios) {
    const [usuario] = await db
      .insert(schema.usuario)
      .values({ correo: u.correo, nombre: u.nombre, cargo: u.cargo })
      .onConflictDoUpdate({ target: schema.usuario.correo, set: { nombre: u.nombre, cargo: u.cargo } })
      .returning();
    await db.insert(schema.membresia).values({ areaId: area.id, usuarioId: usuario.id, rol: u.rol });
  }

  await db.insert(schema.glosario).values(glosario.map((g) => ({ ...g, areaId: area.id })));

  for (const p of fx.procesos) {
    const [proceso] = await db
      .insert(schema.proceso)
      .values({ areaId: area.id, codigo: p.codigo, nombre: p.nombre, macroproceso: p.macroproceso })
      .returning();

    for (const s of p.sesiones) {
      const ruta = join("transcripciones", s.archivo);
      if (!existsSync(join(FIXTURES, ruta))) {
        console.warn(`  · Falta ${ruta}; se omite la sesión.`);
        continue;
      }
      const segmentos = parseVtt(leer(ruta));
      const participantes = [...new Set(segmentos.map((x) => x.hablante))];

      const [sesion] = await db
        .insert(schema.sesion)
        .values({ procesoId: proceso.id, numero: s.numero, titulo: s.titulo, fecha: new Date(s.fecha), participantes })
        .returning();
      const [tr] = await db
        .insert(schema.transcripcion)
        .values({
          sesionId: sesion.id,
          nombreArchivo: s.archivo,
          formato: "vtt",
          duracionSegundos: Math.round(segmentos.at(-1)?.fin ?? 0),
        })
        .returning();

      // Lotes pequeños: neon-http limita el tamaño de cada petición.
      for (let i = 0; i < segmentos.length; i += 200) {
        await db
          .insert(schema.segmento)
          .values(segmentos.slice(i, i + 200).map((x) => ({ ...x, transcripcionId: tr.id })));
      }
      console.log(`  ${p.codigo} sesión ${s.numero}: ${segmentos.length} segmentos, ${participantes.length} participantes`);
    }
  }

  console.log(`Área ${fx.area.nombre} cargada.`);
}

main().then(() => process.exit(0), (e) => {
  console.error(e);
  process.exit(1);
});

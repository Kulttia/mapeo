import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { parseVtt } from "../src/lib/transcripcion/vtt";

/**
 * Genera fixtures/transcripciones/ejemplo-teams.docx a partir del VTT de
 * P-FIN-02, con el formato actual de Teams: título, fecha/duración, y por cada
 * intervención un párrafo "Nombre   m:ss" seguido del párrafo de texto.
 * Uso: npx tsx scripts/generar-docx-ejemplo.ts
 */

const DIR = join(process.cwd(), "fixtures", "transcripciones");

function horaTeams(segundos: number) {
  const total = Math.floor(segundos);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

async function main() {
  const segmentos = parseVtt(readFileSync(join(DIR, "P-FIN-02-sesion-1.vtt"), "utf8"));
  const ultimo = segmentos[segmentos.length - 1];
  const duracion = Math.ceil(ultimo.fin);

  const parrafos: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: "Levantamiento conciliación bancaria-20261014_140000-Grabación de la reunión", bold: true, size: 32 })] }),
    new Paragraph({ children: [new TextRun({ text: "14 de octubre de 2026, 2:00p. m.", color: "616161" })] }),
    new Paragraph({ children: [new TextRun({ text: `${Math.floor(duracion / 60)}m ${duracion % 60}s`, color: "616161" })] }),
    new Paragraph({ children: [new TextRun({ text: `${segmentos[0].hablante} inició la transcripción`, italics: true, color: "616161" })] }),
  ];

  for (const s of segmentos) {
    parrafos.push(
      new Paragraph({
        spacing: { before: 240 },
        children: [
          new TextRun({ text: s.hablante, bold: true }),
          new TextRun({ text: "   " }),
          new TextRun({ text: horaTeams(s.inicio), color: "616161" }),
        ],
      }),
      new Paragraph({ children: [new TextRun(s.texto)] }),
    );
  }

  parrafos.push(
    new Paragraph({ children: [new TextRun({ text: `${segmentos[0].hablante} detuvo la transcripción`, italics: true, color: "616161" })] }),
  );

  const doc = new Document({ sections: [{ children: parrafos }] });
  const destino = join(DIR, "ejemplo-teams.docx");
  writeFileSync(destino, await Packer.toBuffer(doc));
  console.log(`Generado ${destino} con ${segmentos.length} intervenciones.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

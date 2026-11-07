import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Document, Packer, Paragraph, TextRun } from "docx";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { parseDocx } from "./docx";
import { parseVtt } from "./vtt";

const escapar = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** docx mínimo con jszip: solo word/document.xml, un <w:p> por línea. */
async function docxMinimo(lineas: string[]) {
  const cuerpo = lineas
    .map((l) => `<w:p><w:pPr><w:tabs><w:tab w:val="left" w:pos="720"/></w:tabs></w:pPr><w:r><w:t xml:space="preserve">${escapar(l)}</w:t></w:r></w:p>`)
    .join("");
  const zip = new JSZip();
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${cuerpo}<w:p/></w:body></w:document>`,
  );
  return zip.generateAsync({ type: "uint8array" });
}

describe("parseDocx", () => {
  it("formato actual de Teams (Packer de docx): encabezado nombre + hora y texto debajo", async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph("Levantamiento conciliación bancaria-20261014_140000-Grabación de la reunión"),
            new Paragraph("14 de octubre de 2026, 2:00p. m."),
            new Paragraph("42m 10s"),
            new Paragraph("Sara Montoya started transcription"),
            new Paragraph({ children: [new TextRun({ text: "Sara Montoya", bold: true }), new TextRun("   "), new TextRun("0:03")] }),
            new Paragraph("Buenos días a todos."),
            new Paragraph("Gracias por el espacio & la agenda."),
            new Paragraph({ children: [new TextRun("Andrés Cárdenas de la Hoz"), new TextRun({ text: "\t1:02:05" })] }),
            new Paragraph("Hola, ¿me escuchan?"),
            new Paragraph("Sara Montoya inició la transcripción"),
            new Paragraph("0:10 Paula Gaviria"),
            new Paragraph("Sí, perfecto."),
            new Paragraph("Camilo Zapata 12:30"),
          ],
        },
      ],
    });
    const s = await parseDocx(await Packer.toBuffer(doc));
    expect(s).toHaveLength(3);
    expect(s[0]).toEqual({
      orden: 0,
      inicio: 3,
      fin: 3725,
      hablante: "Sara Montoya",
      texto: "Buenos días a todos. Gracias por el espacio & la agenda.",
    });
    expect(s[1]).toMatchObject({ orden: 1, inicio: 3725, fin: 10, hablante: "Andrés Cárdenas de la Hoz", texto: "Hola, ¿me escuchan?" });
    expect(s[2]).toMatchObject({ orden: 2, inicio: 10, fin: 15, hablante: "Paula Gaviria", texto: "Sí, perfecto." });
  });

  it("formato antiguo: bloques tipo VTT dentro del Word", async () => {
    const datos = await docxMinimo([
      "00:00:03.120 --> 00:00:07.450",
      "Sara Montoya",
      "Buenos días a todos.",
      "00:00:08.000 --> 00:00:10.500",
      "<v Julián Restrepo>Eso se causa por la <i>mi ro</i>.</v>",
      "01:02:05.000 --> 01:02:09.500",
      "Sólo texto sin nombre",
    ]);
    const s = await parseDocx(datos);
    expect(s).toHaveLength(3);
    expect(s[0]).toMatchObject({ orden: 0, hablante: "Sara Montoya", texto: "Buenos días a todos." });
    expect(s[0].inicio).toBeCloseTo(3.12);
    expect(s[0].fin).toBeCloseTo(7.45);
    expect(s[1]).toMatchObject({ hablante: "Julián Restrepo", texto: "Eso se causa por la mi ro.", inicio: 8, fin: 10.5 });
    expect(s[2]).toMatchObject({ hablante: "Desconocido", inicio: 3725, fin: 3729.5 });
  });

  it("líneas con hora, nombre y dos puntos", async () => {
    const datos = await docxMinimo([
      "Transcripción reunión tesorería",
      "[00:01:23] Sara Montoya: Arrancamos con la conciliación.",
      "Seguimos con los extractos.",
      "00:02:00 Paula Gaviria: Listo, comparto pantalla.",
    ]);
    const s = await parseDocx(datos);
    expect(s).toEqual([
      { orden: 0, inicio: 83, fin: 120, hablante: "Sara Montoya", texto: "Arrancamos con la conciliación. Seguimos con los extractos." },
      { orden: 1, inicio: 120, fin: 125, hablante: "Paula Gaviria", texto: "Listo, comparto pantalla." },
    ]);
  });

  it("rechaza archivos que no son Word", async () => {
    await expect(parseDocx(new TextEncoder().encode("hola"))).rejects.toThrow(/Word/);
  });

  it("el fixture generado coincide con el VTT de origen", async () => {
    const dir = join(process.cwd(), "fixtures", "transcripciones");
    const vtt = parseVtt(readFileSync(join(dir, "P-FIN-02-sesion-1.vtt"), "utf8"));
    const docx = await parseDocx(new Uint8Array(readFileSync(join(dir, "ejemplo-teams.docx"))));
    expect(docx).toHaveLength(vtt.length);
    expect(docx.map((s) => s.hablante)).toEqual(vtt.map((s) => s.hablante));
    expect(docx.map((s) => s.texto)).toEqual(vtt.map((s) => s.texto));
    expect(docx.map((s) => s.inicio)).toEqual(vtt.map((s) => Math.floor(s.inicio)));
  });
});

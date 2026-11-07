import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { leerTranscripcion } from "./leer";

const DIR = join(process.cwd(), "fixtures", "transcripciones");
const texto = (t: string) => new TextEncoder().encode(t);

describe("leerTranscripcion", () => {
  it("enruta .vtt al lector WebVTT", async () => {
    const r = await leerTranscripcion("sesion.VTT", readFileSync(join(DIR, "P-FIN-02-sesion-1.vtt")));
    expect(r.formato).toBe("vtt");
    expect(r.segmentos[0]).toMatchObject({ orden: 0, hablante: "Sara Montoya" });
  });

  it("enruta .docx al lector de Word", async () => {
    const r = await leerTranscripcion("Reunión.Docx", new Uint8Array(readFileSync(join(DIR, "ejemplo-teams.docx"))));
    expect(r.formato).toBe("docx");
    expect(r.segmentos.length).toBeGreaterThan(10);
  });

  it(".txt acepta WebVTT y el formato de líneas de Teams", async () => {
    const vtt = await leerTranscripcion("a.txt", texto("﻿WEBVTT\r\n\r\n00:00:01.000 --> 00:00:02.000\r\n<v Ana Gómez>Hola</v>\r\n"));
    expect(vtt).toMatchObject({ formato: "txt", segmentos: [{ hablante: "Ana Gómez", texto: "Hola", inicio: 1, fin: 2 }] });

    const lineas = await leerTranscripcion("b.TXT", texto("Ana Gómez   0:05\r\nHola a todos\r\n\r\nLuis Peña   0:09\r\nBuenas\r\n"));
    expect(lineas.segmentos).toEqual([
      { orden: 0, inicio: 5, fin: 9, hablante: "Ana Gómez", texto: "Hola a todos" },
      { orden: 1, inicio: 9, fin: 14, hablante: "Luis Peña", texto: "Buenas" },
    ]);
  });

  it("lanza un error claro si no hay intervenciones", async () => {
    await expect(leerTranscripcion("vacio.txt", new Uint8Array())).rejects.toThrow(/No se encontraron intervenciones con hablante y hora/);
    await expect(leerTranscripcion("vacio.docx", new ArrayBuffer(0))).rejects.toThrow(/No se encontraron intervenciones/);
    await expect(leerTranscripcion("notas.txt", texto("Solo unas notas sueltas."))).rejects.toThrow(/No se encontraron intervenciones/);
  });

  it("rechaza extensiones no soportadas", async () => {
    await expect(leerTranscripcion("audio.mp3", texto("x"))).rejects.toThrow(/Formato no soportado/);
  });
});

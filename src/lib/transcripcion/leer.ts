import { parseDocx, parseLineas } from "./docx";
import { parseVtt, type Segmento } from "./vtt";

export type FormatoTranscripcion = "vtt" | "docx" | "txt";

function aTexto(datos: ArrayBuffer | Uint8Array) {
  return new TextDecoder("utf-8").decode(datos).replace(/^﻿/, "");
}

/** Punto de entrada único: decide el lector por la extensión del archivo. */
export async function leerTranscripcion(
  nombreArchivo: string,
  datos: ArrayBuffer | Uint8Array,
): Promise<{ formato: FormatoTranscripcion; segmentos: Segmento[] }> {
  const extension = /\.([^.]+)$/.exec(nombreArchivo.trim())?.[1]?.toLowerCase();
  if (extension !== "vtt" && extension !== "docx" && extension !== "txt") {
    throw new Error(`Formato no soportado para "${nombreArchivo}". Sube la transcripción de Teams en .vtt, .docx o .txt.`);
  }

  let segmentos: Segmento[] = [];
  if (datos.byteLength > 0) {
    if (extension === "docx") segmentos = await parseDocx(datos);
    else {
      const texto = aTexto(datos);
      segmentos = extension === "vtt" || /^\s*WEBVTT/.test(texto) ? parseVtt(texto) : parseLineas(texto.split(/\r\n?|\n/));
    }
  }

  if (!segmentos.length) {
    throw new Error(
      `No se encontraron intervenciones con hablante y hora en el archivo "${nombreArchivo}". Verifica que sea la transcripción descargada de Teams.`,
    );
  }
  return { formato: extension, segmentos };
}

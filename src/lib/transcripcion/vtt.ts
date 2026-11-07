export type Segmento = {
  orden: number;
  /** Segundos desde el inicio de la reunión. */
  inicio: number;
  fin: number;
  hablante: string;
  texto: string;
};

const TIEMPO = /^(\d{1,2}:)?(\d{1,2}):(\d{2})[.,](\d{1,3})\s+-->\s+(\d{1,2}:)?(\d{1,2}):(\d{2})[.,](\d{1,3})/;
const VOZ = /<v\s+([^>]+)>([\s\S]*?)(?:<\/v>|$)/;

function aSegundos(h: string | undefined, m: string, s: string, ms: string) {
  return (h ? parseInt(h, 10) * 3600 : 0) + parseInt(m, 10) * 60 + parseInt(s, 10) + parseInt(ms.padEnd(3, "0"), 10) / 1000;
}

/**
 * Lee un WebVTT de Teams. Cada bloque trae un id opcional, la línea de tiempo y
 * el texto con la etiqueta de voz `<v Nombre>…</v>`. Bloques seguidos del mismo
 * hablante se mantienen separados para no perder la marca de tiempo exacta.
 */
export function parseVtt(contenido: string): Segmento[] {
  const bloques = contenido.replace(/^﻿/, "").replace(/\r\n?/g, "\n").split(/\n{2,}/);
  const segmentos: Segmento[] = [];

  for (const bloque of bloques) {
    const lineas = bloque.split("\n").map((l) => l.trim()).filter(Boolean);
    const i = lineas.findIndex((l) => TIEMPO.test(l));
    if (i === -1) continue;

    const t = TIEMPO.exec(lineas[i])!;
    const cuerpo = lineas.slice(i + 1).join(" ");
    if (!cuerpo) continue;

    const voz = VOZ.exec(cuerpo);
    const hablante = voz ? voz[1].trim() : "Desconocido";
    const texto = (voz ? voz[2] : cuerpo).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!texto) continue;

    segmentos.push({
      orden: segmentos.length,
      inicio: aSegundos(t[1]?.slice(0, -1), t[2], t[3], t[4]),
      fin: aSegundos(t[5]?.slice(0, -1), t[6], t[7], t[8]),
      hablante,
      texto,
    });
  }

  return segmentos;
}

/** 125.4 → "02:05"; 3725 → "1:02:05". Es el formato con el que se citan minutos. */
export function formatoMinuto(segundos: number) {
  const total = Math.floor(segundos);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mmss = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return h ? `${h}:${mmss}` : mmss;
}

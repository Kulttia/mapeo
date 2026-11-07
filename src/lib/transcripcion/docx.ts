import JSZip from "jszip";
import type { Segmento } from "./vtt";

const FLECHA = /^(\d{1,2}:)?(\d{1,2}):(\d{2})[.,](\d{1,3})\s+-->\s+(\d{1,2}:)?(\d{1,2}):(\d{2})[.,](\d{1,3})/;
const VOZ = /^<v\s+([^>]+)>([\s\S]*?)(?:<\/v>)?$/;
const ID_CUE = /^([0-9a-f-]{16,}(\/\d+-\d+)?|\d+)$/i;
const HORA = String.raw`\d{1,2}:\d{2}(?::\d{2})?`;
const NOMBRE = String.raw`\p{Lu}[\p{L}\p{M}.'’-]*(?:\s+(?:\p{Lu}[\p{L}\p{M}.'’-]*|de|del|la|las|los|y|da|do|dos|van|von))*(?:\s*\([^)]{1,40}\))?`;
const ENCABEZADO_NOMBRE_HORA = new RegExp(String.raw`^(${NOMBRE})\s+(${HORA})$`, "u");
const ENCABEZADO_HORA_NOMBRE = new RegExp(String.raw`^(${HORA})\s+(${NOMBRE})$`, "u");
const LINEA_CON_DOS_PUNTOS = new RegExp(String.raw`^\[?(${HORA})\]?\s+([^:\[\]]{1,80}?):\s*(.*)$`, "u");
const SISTEMA = /\b(started|stopped|ended) transcription\b|\b(inici[óo]|detuvo|finaliz[óo]|termin[óo]) la transcripci[óo]n\b/i;

function hmsASegundos(valor: string) {
  return valor.split(":").reduce((total, parte) => total * 60 + parseInt(parte, 10), 0);
}

function flechaASegundos(h: string | undefined, m: string, s: string, ms: string) {
  return (h ? parseInt(h, 10) * 3600 : 0) + parseInt(m, 10) * 60 + parseInt(s, 10) + parseInt(ms.padEnd(3, "0"), 10) / 1000;
}

function limpiar(texto: string) {
  return texto.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function desescapar(texto: string) {
  return texto.replace(/&(lt|gt|amp|quot|apos|#\d+|#x[0-9a-f]+);/gi, (_, e: string) => {
    const nombre = e.toLowerCase();
    if (nombre === "lt") return "<";
    if (nombre === "gt") return ">";
    if (nombre === "amp") return "&";
    if (nombre === "quot") return '"';
    if (nombre === "apos") return "'";
    const codigo = nombre.startsWith("#x") ? parseInt(nombre.slice(2), 16) : parseInt(nombre.slice(1), 10);
    return String.fromCodePoint(codigo);
  });
}

/** Un párrafo de Word por línea; los saltos manuales (<w:br/>) también parten línea. */
export function lineasDeDocumentXml(xml: string): string[] {
  const lineas: string[] = [];
  const parrafos = xml.match(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g) ?? [];
  for (const parrafo of parrafos) {
    const cuerpo = parrafo.replace(/<w:pPr>[\s\S]*?<\/w:pPr>/g, "");
    let actual = "";
    for (const m of cuerpo.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>|<w:(tab|br|cr)\b[^>]*\/>/g)) {
      if (m[2] === "tab") actual += "\t";
      else if (m[2]) {
        lineas.push(actual);
        actual = "";
      } else actual += desescapar(m[1]);
    }
    lineas.push(actual);
  }
  return lineas.map((l) => l.trim()).filter(Boolean);
}

type Borrador = { inicio: number; fin?: number; hablante: string; partes: string[] };

function cerrar(borradores: Borrador[]): Segmento[] {
  const utiles = borradores
    .map((b) => ({ ...b, texto: limpiar(b.partes.join(" ")) }))
    .filter((b) => b.texto);
  return utiles.map((b, i) => ({
    orden: i,
    inicio: b.inicio,
    fin: b.fin ?? (i + 1 < utiles.length ? utiles[i + 1].inicio : b.inicio + 5),
    hablante: b.hablante,
    texto: b.texto,
  }));
}

/** Bloques tipo VTT pegados en Word: tiempo --> tiempo, nombre (o <v Nombre>) y texto. */
function lineasEstiloVtt(lineas: string[]): Segmento[] {
  const borradores: Borrador[] = [];
  let actual: (Borrador & { lineas: string[] }) | null = null;
  const volcar = () => {
    if (!actual) return;
    const [primera, ...resto] = actual.lineas;
    const voz = primera ? VOZ.exec([primera, ...resto].join(" ")) : null;
    if (voz) {
      actual.hablante = voz[1].trim();
      actual.partes = [voz[2]];
    } else if (resto.length) {
      actual.hablante = primera;
      actual.partes = resto;
    } else if (primera) {
      actual.partes = [primera];
    }
    borradores.push(actual);
  };

  for (const linea of lineas) {
    const t = FLECHA.exec(linea);
    if (t) {
      volcar();
      actual = {
        inicio: flechaASegundos(t[1]?.slice(0, -1), t[2], t[3], t[4]),
        fin: flechaASegundos(t[5]?.slice(0, -1), t[6], t[7], t[8]),
        hablante: "Desconocido",
        partes: [],
        lineas: [],
      };
    } else if (actual && !ID_CUE.test(linea) && linea !== "WEBVTT") {
      actual.lineas.push(linea);
    }
  }
  volcar();
  return cerrar(borradores);
}

/**
 * Reconoce las líneas de una transcripción de Teams exportada como texto:
 * encabezados "Nombre 0:03" / "0:03 Nombre" seguidos del texto, líneas
 * "[00:01:23] Nombre: texto" y bloques tipo VTT. Ignora títulos y avisos de sistema.
 */
export function parseLineas(lineas: string[]): Segmento[] {
  const limpias = lineas.map((l) => l.trim()).filter(Boolean);
  if (limpias.some((l) => FLECHA.test(l))) return lineasEstiloVtt(limpias);

  const borradores: Borrador[] = [];
  let actual: Borrador | null = null;
  for (const linea of limpias) {
    if (SISTEMA.test(linea)) continue;
    const plana = linea.replace(/\s+/g, " ");

    const conDosPuntos = LINEA_CON_DOS_PUNTOS.exec(plana);
    if (conDosPuntos && /\p{L}/u.test(conDosPuntos[2])) {
      actual = { inicio: hmsASegundos(conDosPuntos[1]), hablante: conDosPuntos[2].trim(), partes: [conDosPuntos[3]] };
      borradores.push(actual);
      continue;
    }

    const nombreHora = ENCABEZADO_NOMBRE_HORA.exec(plana);
    const horaNombre = nombreHora ? null : ENCABEZADO_HORA_NOMBRE.exec(plana);
    if (nombreHora || horaNombre) {
      const [hablante, hora] = nombreHora ? [nombreHora[1], nombreHora[2]] : [horaNombre![2], horaNombre![1]];
      actual = { inicio: hmsASegundos(hora), hablante: hablante.trim(), partes: [] };
      borradores.push(actual);
      continue;
    }

    actual?.partes.push(linea);
  }
  return cerrar(borradores);
}

export async function parseDocx(datos: ArrayBuffer | Uint8Array): Promise<Segmento[]> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(datos);
  } catch {
    throw new Error("No se pudo abrir el archivo de Word: no parece un .docx válido.");
  }
  const documento = zip.file("word/document.xml");
  if (!documento) throw new Error("El archivo de Word no tiene contenido (falta word/document.xml).");
  return parseLineas(lineasDeDocumentXml(await documento.async("string")));
}

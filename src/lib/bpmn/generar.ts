import type { Actividad, Casuistica, Levantamiento } from "../ia/esquemas";

/**
 * Genera BPMN 2.0 XML (con BPMNDI) a partir de un levantamiento, sin IA.
 * Metodología: carriles por responsable, una compuerta por actividad con
 * casuísticas o variantes. El layout es por columnas de izquierda a derecha.
 */

type TipoNodo = "startEvent" | "endEvent" | "task" | "userTask" | "exclusiveGateway";

type Nodo = {
  id: string;
  tipo: TipoNodo;
  nombre: string;
  lane: number;
  col: number;
  fila: number;
  doc?: string;
  porDefecto?: string;
};

type ClaseFlujo = "normal" | "rama" | "retorno";

type Flujo = { id: string; origen: Nodo; destino: Nodo; nombre?: string; clase: ClaseFlujo };

type Rama = { nombre: string; tareas: { nombre: string; lane: number; doc?: string; sistema: boolean }[] };

const COL = 160;
const FILA = 120;
const ALTO_LANE = 140;
const CABECERA = 30;
const ORIGEN_X = 100;
const ORIGEN_Y = 60;
const MARGEN = 20;
const MAX_CONDICION = 60;

const TAMANOS: Record<TipoNodo, [number, number]> = {
  startEvent: [36, 36],
  endEvent: [36, 36],
  task: [120, 80],
  userTask: [120, 80],
  exclusiveGateway: [50, 50],
};

export function escaparXml(texto: string) {
  return texto
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** "P-FIN-01" → "P_FIN_01"; garantiza un NCName válido. */
export function normalizarId(texto: string) {
  const limpio = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return /^[A-Za-z_]/.test(limpio) ? limpio : `P_${limpio}`;
}

function limpiar(texto: string | null | undefined) {
  return (texto ?? "").replace(/\s+/g, " ").trim();
}

function recortar(texto: string, max = MAX_CONDICION) {
  const t = limpiar(texto);
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

const MAX_TAREA = 55;

/**
 * Nombre corto para la caja: la IA a veces describe la actividad con una frase larga.
 * Se corta en el primer ";", ":" o paréntesis y se limita a MAX_TAREA; el texto completo va a la documentación.
 */
function nombreTarea(texto: string) {
  const t = limpiar(texto);
  const corte = t.search(/;|: | \(| - /);
  return recortar(corte >= 12 ? t.slice(0, corte) : t, MAX_TAREA);
}

function conDescripcion(completo: string, doc: string | undefined) {
  const t = limpiar(completo);
  return nombreTarea(t) === t ? doc : [`Descripción: ${t}`, doc].filter(Boolean).join(" · ");
}

function documentacion(a: Actividad) {
  const partes: [string, string | null][] = [
    ["Sistema", a.sistema],
    ["Transacción", a.transaccion],
    ["Insumo", a.insumo],
    ["Salida", a.salida],
  ];
  const texto = partes
    .filter(([, v]) => limpiar(v))
    .map(([k, v]) => `${k}: ${limpiar(v)}`)
    .join(" · ");
  return texto || undefined;
}

/** "8" → principal 8; "8-A1" / "8B" → variante del 8, grupo "A", paso 1. */
function analizarSecuencia(secuencia: string) {
  const s = limpiar(secuencia);
  if (/^\d+$/.test(s)) return { base: parseInt(s, 10), variante: null };
  const m = /^(\d+)\s*-?\s*([A-Za-z]*)\s*-?\s*(\d*)(.*)$/.exec(s);
  if (!m || (!m[2] && !m[3] && !m[4])) return { base: null, variante: null };
  return {
    base: parseInt(m[1], 10),
    variante: { grupo: (m[2] || m[3] + m[4]).toUpperCase(), paso: m[2] && m[3] ? parseInt(m[3], 10) : 0 },
  };
}

export function generarBpmn(l: Levantamiento, opciones: { id: string; nombre: string }): string {
  const pid = normalizarId(opciones.id || "Proceso");
  const nombreProceso = limpiar(opciones.nombre) || limpiar(opciones.id) || "Proceso";

  // Lanes por responsable en orden de primera aparición.
  const lanes: string[] = [];
  const indiceLane = new Map<string, number>();
  const laneDe = (responsable: string | null) => {
    // Un carril por persona o rol principal: "Camilo Zapata (aviso); Julián…" → "Camilo Zapata".
    const nombre = recortar(limpiar(responsable).split(/;| \(/)[0], 40) || "Sin responsable";
    const clave = nombre.toLowerCase();
    if (!indiceLane.has(clave)) {
      indiceLane.set(clave, lanes.length);
      lanes.push(nombre);
    }
    return indiceLane.get(clave)!;
  };
  for (const a of l.actividades) laneDe(a.responsable);

  // Principales y variantes. Las variantes sin actividad base se tratan como principales.
  const principales: { a: Actividad; orden: number; idx: number }[] = [];
  const variantesCrudas: { a: Actividad; base: number; grupo: string; paso: number; idx: number }[] = [];
  l.actividades.forEach((a, idx) => {
    const { base, variante } = analizarSecuencia(a.secuencia);
    if (base !== null && variante) variantesCrudas.push({ a, base, ...variante, idx });
    else principales.push({ a, orden: base ?? Number.MAX_SAFE_INTEGER, idx });
  });
  const basesExistentes = new Set(principales.filter((p) => p.orden !== Number.MAX_SAFE_INTEGER).map((p) => p.orden));
  const variantes = variantesCrudas.filter((v) => {
    if (basesExistentes.has(v.base)) return true;
    principales.push({ a: v.a, orden: v.base, idx: v.idx });
    return false;
  });
  principales.sort((x, y) => x.orden - y.orden || x.idx - y.idx);

  const nodos: Nodo[] = [];
  const flujos: Flujo[] = [];
  const contadores = { tarea: 0, compuerta: 0, flujo: 0 };
  const nuevoNodo = (n: Omit<Nodo, "id">, id?: string) => {
    const tipoId = n.tipo === "exclusiveGateway" ? "Compuerta" : "Tarea";
    const nodo = { ...n, id: id ?? `${pid}_${tipoId}_${n.tipo === "exclusiveGateway" ? ++contadores.compuerta : ++contadores.tarea}` };
    nodos.push(nodo);
    return nodo;
  };
  const conectar = (origen: Nodo, destino: Nodo, clase: ClaseFlujo, nombre?: string) => {
    const f = { id: `${pid}_Flujo_${++contadores.flujo}`, origen, destino, clase, nombre };
    flujos.push(f);
    return f;
  };

  const laneInicial = principales.length ? laneDe(principales[0].a.responsable) : laneDe(null);
  const inicio = nuevoNodo(
    { tipo: "startEvent", nombre: limpiar(l.ficha.disparador.valor) || "Inicio", lane: laneInicial, col: 0, fila: 0 },
    `${pid}_Inicio`,
  );

  // Filas extra por lane que necesita cada compuerta; el alto del lane es el máximo.
  const filasExtra = lanes.map(() => 0);
  let col = 1;
  let anterior: Nodo = inicio;
  let pendientes: { nodo: Nodo; flujo?: Omit<Flujo, "id" | "origen" | "destino">; porDefecto?: boolean }[] = [{ nodo: inicio }];

  // El flujo "Normal" de cada compuerta (camino principal) es su flujo por defecto.
  const enlazarPendientes = (destino: Nodo) => {
    for (const p of pendientes) {
      const f = conectar(p.nodo, destino, p.flujo?.clase ?? "normal", p.flujo?.nombre);
      if (p.porDefecto) p.nodo.porDefecto = f.id;
    }
    pendientes = [];
  };

  for (const { a } of principales) {
    const lane = laneDe(a.responsable);
    const tarea = nuevoNodo({
      tipo: limpiar(a.sistema) ? "userTask" : "task",
      nombre: nombreTarea(a.nombre) || `Actividad ${limpiar(a.secuencia)}`,
      lane,
      col,
      fila: 0,
      doc: conDescripcion(a.nombre, documentacion(a)),
    });
    enlazarPendientes(tarea);
    anterior = tarea;
    col++;

    const sec = limpiar(a.secuencia);
    const base = analizarSecuencia(sec).base;
    const ramas: Rama[] = [];

    const grupos = new Map<string, typeof variantes>();
    for (const v of variantes.filter((v) => v.base === base && /^\d+$/.test(sec))) {
      grupos.set(v.grupo, [...(grupos.get(v.grupo) ?? []), v]);
    }
    for (const grupo of grupos.values()) {
      grupo.sort((x, y) => x.paso - y.paso || x.idx - y.idx);
      ramas.push({
        nombre: recortar(`Variante: ${limpiar(grupo[0].a.nombre) || limpiar(grupo[0].a.secuencia)}`),
        tareas: grupo.map((v) => ({
          nombre: nombreTarea(v.a.nombre) || `Actividad ${limpiar(v.a.secuencia)}`,
          lane: laneDe(v.a.responsable),
          doc: conDescripcion(v.a.nombre, documentacion(v.a)),
          sistema: !!limpiar(v.a.sistema),
        })),
      });
    }
    for (const c of l.casuisticas.filter((c: Casuistica) => limpiar(c.secuenciaActividad) === sec)) {
      const docCaso = [`Casuística: ${limpiar(c.condicion)}`, limpiar(c.frecuencia) && `Frecuencia: ${limpiar(c.frecuencia)}`]
        .filter(Boolean)
        .join(" · ");
      ramas.push({
        nombre: recortar(c.condicion) || "Casuística",
        tareas: [
          {
            nombre: nombreTarea(c.tratamiento ?? "") || nombreTarea(c.condicion) || "Tratamiento",
            lane,
            doc: conDescripcion(c.tratamiento ?? "", docCaso),
            sistema: false,
          },
        ],
      });
    }

    if (!ramas.length) {
      pendientes = [{ nodo: tarea }];
      continue;
    }

    const compuerta = nuevoNodo({ tipo: "exclusiveGateway", nombre: "", lane, col, fila: 0 });
    conectar(tarea, compuerta, "normal");
    const colRamas = col + 1;
    // La fila 0 del lane de la compuerta lleva el flujo "Normal"; en los demás lanes está libre.
    const filasUsadas = lanes.map((_, i) => (i === lane ? 0 : -1));
    pendientes = [];
    let largo = 0;
    for (const rama of ramas) {
      const filaEn = new Map<number, number>();
      let previo: Nodo = compuerta;
      rama.tareas.forEach((t, j) => {
        if (!filaEn.has(t.lane)) filaEn.set(t.lane, ++filasUsadas[t.lane]);
        const nodo = nuevoNodo({
          tipo: t.sistema ? "userTask" : "task",
          nombre: t.nombre,
          lane: t.lane,
          col: colRamas + j,
          fila: filaEn.get(t.lane)!,
          doc: t.doc,
        });
        if (j === 0) conectar(compuerta, nodo, "rama", rama.nombre);
        else conectar(previo, nodo, "normal");
        previo = nodo;
      });
      largo = Math.max(largo, rama.tareas.length);
      pendientes.push({ nodo: previo, flujo: { clase: "retorno" } });
    }
    filasUsadas.forEach((n, i) => (filasExtra[i] = Math.max(filasExtra[i], n)));
    pendientes.unshift({ nodo: compuerta, flujo: { clase: "normal", nombre: "Normal" }, porDefecto: true });
    anterior = compuerta;
    col = colRamas + largo;
  }

  const fin = nuevoNodo(
    { tipo: "endEvent", nombre: limpiar(l.ficha.hitoCierre.valor) || "Fin", lane: anterior.lane, col, fila: 0 },
    `${pid}_Fin`,
  );
  enlazarPendientes(fin);

  // Geometría.
  const columnas = col + 1;
  const altosLane = filasExtra.map((n) => ALTO_LANE + n * FILA);
  const topesLane: number[] = [];
  altosLane.reduce((y, alto, i) => ((topesLane[i] = y), y + alto), ORIGEN_Y);
  const anchoPool = 2 * CABECERA + 2 * MARGEN + columnas * COL;
  const altoPool = altosLane.reduce((s, h) => s + h, 0);
  const x0 = ORIGEN_X + 2 * CABECERA + MARGEN;

  const caja = (n: Nodo) => {
    const [w, h] = TAMANOS[n.tipo];
    const cx = x0 + n.col * COL + COL / 2;
    const cy = topesLane[n.lane] + ALTO_LANE / 2 + n.fila * FILA;
    return { x: cx - w / 2, y: cy - h / 2, w, h, cx, cy };
  };

  const ruta = (f: Flujo): [number, number][] => {
    const s = caja(f.origen);
    const t = caja(f.destino);
    if (s.cy === t.cy) return [[s.x + s.w, s.cy], [t.x, t.cy]];
    if (f.clase === "rama") {
      const ys = t.cy > s.cy ? s.y + s.h : s.y;
      return [[s.cx, ys], [s.cx, t.cy], [t.x, t.cy]];
    }
    if (f.clase === "retorno") {
      const yt = t.cy > s.cy ? t.y : t.y + t.h;
      return [[s.x + s.w, s.cy], [t.cx, s.cy], [t.cx, yt]];
    }
    const mx = t.x - 25;
    return [[s.x + s.w, s.cy], [mx, s.cy], [mx, t.cy], [t.x, t.cy]];
  };

  const etiqueta = (f: Flujo, puntos: [number, number][]) => {
    const [ax] = puntos[puntos.length - 2];
    const [bx, by] = puntos[puntos.length - 1];
    const [px, py] = f.clase === "rama" ? [Math.min(ax, bx), by] : [puntos[0][0], puntos[0][1]];
    const ancho = f.clase === "rama" ? Math.max(40, Math.abs(bx - ax) - 6) : 60;
    return `<bpmndi:BPMNLabel><dc:Bounds x="${px + 4}" y="${py - 30}" width="${ancho}" height="27" /></bpmndi:BPMNLabel>`;
  };

  const entradas = new Map<string, string[]>();
  const salidas = new Map<string, string[]>();
  for (const f of flujos) {
    salidas.set(f.origen.id, [...(salidas.get(f.origen.id) ?? []), f.id]);
    entradas.set(f.destino.id, [...(entradas.get(f.destino.id) ?? []), f.id]);
  }

  const x: string[] = [];
  x.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  x.push(
    `<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="${pid}_Definiciones" targetNamespace="http://comfama.com/mapeo/bpmn" exporter="Mapeo" exporterVersion="1.0">`,
  );
  x.push(`  <bpmn:collaboration id="${pid}_Colaboracion">`);
  x.push(`    <bpmn:participant id="${pid}_Pool" name="${escaparXml(nombreProceso)}" processRef="${pid}_Proceso" />`);
  x.push(`  </bpmn:collaboration>`);
  x.push(`  <bpmn:process id="${pid}_Proceso" name="${escaparXml(nombreProceso)}" isExecutable="false">`);
  x.push(`    <bpmn:laneSet id="${pid}_Carriles">`);
  lanes.forEach((nombre, i) => {
    x.push(`      <bpmn:lane id="${pid}_Lane_${i + 1}" name="${escaparXml(nombre)}">`);
    for (const n of nodos.filter((n) => n.lane === i)) x.push(`        <bpmn:flowNodeRef>${n.id}</bpmn:flowNodeRef>`);
    x.push(`      </bpmn:lane>`);
  });
  x.push(`    </bpmn:laneSet>`);
  for (const n of nodos) {
    const atributos = [`id="${n.id}"`];
    if (n.nombre) atributos.push(`name="${escaparXml(n.nombre)}"`);
    if (n.porDefecto) atributos.push(`default="${n.porDefecto}"`);
    x.push(`    <bpmn:${n.tipo} ${atributos.join(" ")}>`);
    if (n.doc) x.push(`      <bpmn:documentation>${escaparXml(n.doc)}</bpmn:documentation>`);
    for (const id of entradas.get(n.id) ?? []) x.push(`      <bpmn:incoming>${id}</bpmn:incoming>`);
    for (const id of salidas.get(n.id) ?? []) x.push(`      <bpmn:outgoing>${id}</bpmn:outgoing>`);
    x.push(`    </bpmn:${n.tipo}>`);
  }
  for (const f of flujos) {
    const nombre = f.nombre ? ` name="${escaparXml(f.nombre)}"` : "";
    x.push(`    <bpmn:sequenceFlow id="${f.id}"${nombre} sourceRef="${f.origen.id}" targetRef="${f.destino.id}" />`);
  }
  x.push(`  </bpmn:process>`);

  x.push(`  <bpmndi:BPMNDiagram id="${pid}_Diagrama">`);
  x.push(`    <bpmndi:BPMNPlane id="${pid}_Plano" bpmnElement="${pid}_Colaboracion">`);
  x.push(
    `      <bpmndi:BPMNShape id="${pid}_Pool_di" bpmnElement="${pid}_Pool" isHorizontal="true"><dc:Bounds x="${ORIGEN_X}" y="${ORIGEN_Y}" width="${anchoPool}" height="${altoPool}" /></bpmndi:BPMNShape>`,
  );
  lanes.forEach((_, i) => {
    x.push(
      `      <bpmndi:BPMNShape id="${pid}_Lane_${i + 1}_di" bpmnElement="${pid}_Lane_${i + 1}" isHorizontal="true"><dc:Bounds x="${ORIGEN_X + CABECERA}" y="${topesLane[i]}" width="${anchoPool - CABECERA}" height="${altosLane[i]}" /></bpmndi:BPMNShape>`,
    );
  });
  for (const n of nodos) {
    const c = caja(n);
    const marcador = n.tipo === "exclusiveGateway" ? ` isMarkerVisible="true"` : "";
    const etiquetaEvento =
      n.tipo === "startEvent" || n.tipo === "endEvent"
        ? `<bpmndi:BPMNLabel><dc:Bounds x="${c.cx - 50}" y="${c.y + c.h + 4}" width="100" height="27" /></bpmndi:BPMNLabel>`
        : "";
    x.push(
      `      <bpmndi:BPMNShape id="${n.id}_di" bpmnElement="${n.id}"${marcador}><dc:Bounds x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" />${etiquetaEvento}</bpmndi:BPMNShape>`,
    );
  }
  for (const f of flujos) {
    const puntos = ruta(f);
    const wps = puntos.map(([px, py]) => `<di:waypoint x="${px}" y="${py}" />`).join("");
    x.push(`      <bpmndi:BPMNEdge id="${f.id}_di" bpmnElement="${f.id}">${wps}${f.nombre ? etiqueta(f, puntos) : ""}</bpmndi:BPMNEdge>`);
  }
  x.push(`    </bpmndi:BPMNPlane>`);
  x.push(`  </bpmndi:BPMNDiagram>`);
  x.push(`</bpmn:definitions>`);
  return x.join("\n") + "\n";
}

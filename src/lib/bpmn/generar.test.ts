import { BpmnModdle, type ElementoModdle } from "bpmn-moddle";
import { describe, expect, it } from "vitest";
import type { Actividad, Casuistica, CampoFicha, Ficha, Levantamiento } from "../ia/esquemas";
import { CAMPOS_FICHA } from "../ia/esquemas";
import { generarBpmn, normalizarId } from "./generar";

type E = ElementoModdle & { name?: string };

const campo = (valor: string | null = null): CampoFicha => ({ valor, certeza: "confirmado", citas: [], nota: null });

function ficha(valores: Partial<Record<keyof Ficha, string>> = {}): Ficha {
  return Object.fromEntries(Object.keys(CAMPOS_FICHA).map((k) => [k, campo(valores[k as keyof Ficha] ?? null)])) as Ficha;
}

function actividad(secuencia: string, nombre: string, responsable: string | null, extra: Partial<Actividad> = {}): Actividad {
  return {
    secuencia,
    nombre,
    responsable,
    sistema: null,
    transaccion: null,
    insumo: null,
    salida: null,
    certeza: "confirmado",
    citas: [],
    ...extra,
  };
}

function casuistica(secuenciaActividad: string | null, condicion: string, tratamiento: string | null = null): Casuistica {
  return { secuenciaActividad, condicion, tratamiento, frecuencia: null, certeza: "confirmado", citas: [] };
}

function levantamiento(actividades: Actividad[], casuisticas: Casuistica[] = [], f = ficha()): Levantamiento {
  return { ficha: f, actividades, casuisticas, diagnostico: [], hallazgos: [] };
}

const lista = (v: unknown) => (v ?? []) as E[];

/** Importa con bpmn-moddle y valida lo estructural común a todos los casos. */
async function verificar(xml: string) {
  const { rootElement, warnings } = await new BpmnModdle().fromXML(xml);
  expect(warnings).toEqual([]);

  const ids = [...xml.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  expect(new Set(ids).size).toBe(ids.length);
  for (const id of ids) expect(id).toMatch(/^[A-Za-z_][A-Za-z0-9_.-]*$/);

  const raices = lista(rootElement.rootElements);
  const proceso = raices.find((r) => r.$type === "bpmn:Process")!;
  const colaboracion = raices.find((r) => r.$type === "bpmn:Collaboration")!;
  const participantes = lista(colaboracion.participants);
  expect(participantes).toHaveLength(1);
  expect(participantes[0].processRef).toBe(proceso);

  const elementos = lista(proceso.flowElements);
  const flujos = elementos.filter((e) => e.$type === "bpmn:SequenceFlow");
  const nodos = elementos.filter((e) => e.$type !== "bpmn:SequenceFlow");
  const lanes = lista(lista(proceso.laneSets)[0].lanes);

  for (const n of nodos) {
    const refs = lanes.filter((l) => lista(l.flowNodeRef).includes(n));
    expect(refs, `lanes de ${n.id}`).toHaveLength(1);
  }

  const plano = lista(rootElement.diagrams)[0].plane as E;
  expect((plano.bpmnElement as E).id).toBe(colaboracion.id);
  const di = new Map(lista(plano.planeElement).map((p) => [(p.bpmnElement as E).id, p]));
  for (const e of [...elementos, ...lanes, participantes[0]]) expect(di.has(e.id), `DI de ${e.id}`).toBe(true);

  for (const f of flujos) {
    const borde = di.get(f.id)!;
    expect(borde.$type).toBe("bpmndi:BPMNEdge");
    const puntos = lista(borde.waypoint) as unknown as { x: number; y: number }[];
    expect(puntos.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < puntos.length; i++) {
      expect(puntos[i].x === puntos[i - 1].x || puntos[i].y === puntos[i - 1].y, `${f.id} ortogonal`).toBe(true);
    }
  }

  const caja = (e: E) => di.get(e.id)!.bounds as { x: number; y: number; width: number; height: number };
  const pool = caja(participantes[0]);
  for (const l of lanes) {
    const c = caja(l);
    expect(c.x).toBeGreaterThanOrEqual(pool.x);
    expect(c.y).toBeGreaterThanOrEqual(pool.y);
    expect(c.x + c.width).toBeLessThanOrEqual(pool.x + pool.width);
    expect(c.y + c.height).toBeLessThanOrEqual(pool.y + pool.height);
    expect(c.height).toBeGreaterThanOrEqual(140);
    for (const n of nodos.filter((n) => lista(l.flowNodeRef).includes(n))) {
      const b = caja(n);
      expect(b.y).toBeGreaterThanOrEqual(c.y);
      expect(b.y + b.height).toBeLessThanOrEqual(c.y + c.height);
      expect(b.x + b.width).toBeLessThanOrEqual(c.x + c.width);
    }
  }

  const contar = (tipo: string) => elementos.filter((e) => e.$type === tipo).length;
  const porNombre = (nombre: string) => nodos.find((n) => n.name === nombre)!;
  return { proceso, participantes, elementos, flujos, nodos, lanes, contar, porNombre };
}

describe("generarBpmn", () => {
  it("modela un proceso simple de 3 actividades en 2 lanes, en orden numérico", async () => {
    const l = levantamiento(
      [
        actividad("10", "Archivar soporte", "Analista"),
        actividad("1", "Recibir solicitud", "Analista", { sistema: "SAP", transaccion: "FB60", salida: "Radicado" }),
        actividad("2", "Aprobar", "Coordinador"),
      ],
      [],
      ficha({ disparador: "Llega la factura", hitoCierre: "Factura pagada" }),
    );
    const xml = generarBpmn(l, { id: "P-FIN-01", nombre: "Pago de facturas" });
    const r = await verificar(xml);

    expect(r.participantes[0].name).toBe("Pago de facturas");
    expect(r.lanes.map((x) => x.name)).toEqual(["Analista", "Coordinador"]);
    expect(r.contar("bpmn:UserTask")).toBe(1);
    expect(r.contar("bpmn:Task")).toBe(2);
    expect(r.contar("bpmn:ExclusiveGateway")).toBe(0);
    expect(r.flujos).toHaveLength(4);

    const inicio = r.porNombre("Llega la factura");
    expect(inicio.$type).toBe("bpmn:StartEvent");
    expect(r.porNombre("Factura pagada").$type).toBe("bpmn:EndEvent");

    const cadena: string[] = [];
    let actual: E | undefined = inicio;
    while (actual) {
      cadena.push(actual.name as string);
      const salida: E | undefined = r.flujos.find((f) => f.sourceRef === actual);
      actual = salida?.targetRef as E | undefined;
    }
    expect(cadena).toEqual(["Llega la factura", "Recibir solicitud", "Aprobar", "Archivar soporte", "Factura pagada"]);

    const doc = lista(r.porNombre("Recibir solicitud").documentation)[0].text;
    expect(doc).toBe("Sistema: SAP · Transacción: FB60 · Salida: Radicado");
    expect(r.proceso.id).toBe("P_FIN_01_Proceso");
  });

  it("crea una compuerta por actividad con casuísticas y cuelga la variante 2-A1", async () => {
    const larga = "Cuando el proveedor no tiene RUT actualizado y además la factura supera el tope autorizado";
    const l = levantamiento(
      [
        actividad("1", "Recibir", "Analista"),
        actividad("2", "Validar", "Coordinador", { sistema: "SAP" }),
        actividad("2-A1", "Validar manualmente", "Auxiliar"),
        actividad("3", "Pagar", "Analista"),
      ],
      [
        casuistica("2", "Factura sin orden de compra", "Solicitar OC al área"),
        casuistica("2", larga),
        casuistica("3", "Pago rechazado por el banco", "Reprocesar pago"),
        casuistica(null, "Sin actividad"),
        casuistica("99", "Actividad inexistente"),
      ],
    );
    const r = await verificar(generarBpmn(l, { id: "P-FIN-02", nombre: "Pagos" }));

    expect(r.lanes.map((x) => x.name)).toEqual(["Analista", "Coordinador", "Auxiliar"]);
    expect(r.contar("bpmn:ExclusiveGateway")).toBe(2);
    expect(r.contar("bpmn:Task") + r.contar("bpmn:UserTask")).toBe(7);
    expect(r.flujos).toHaveLength(14);

    const compuertas = r.nodos.filter((n) => n.$type === "bpmn:ExclusiveGateway");
    const g1 = compuertas.find((g) => r.flujos.some((f) => f.targetRef === g && (f.sourceRef as E).name === "Validar"))!;
    const salidas = r.flujos.filter((f) => f.sourceRef === g1);
    const nombres = salidas.map((f) => f.name as string);
    expect(nombres).toHaveLength(4);
    expect(nombres).toEqual(expect.arrayContaining(["Normal", "Variante: Validar manualmente", "Factura sin orden de compra"]));
    expect(nombres.find((n) => n.startsWith("Cuando"))).toMatch(/…$/);
    expect((g1.default as E).name).toBe("Normal");
    expect(((g1.default as E).targetRef as E).name).toBe("Pagar");
    for (const f of salidas) expect((f.name as string).length).toBeLessThanOrEqual(60);

    const tratamiento = r.porNombre("Solicitar OC al área");
    const laneDe = (n: E) => r.lanes.find((x) => lista(x.flowNodeRef).includes(n))!.name;
    expect(laneDe(tratamiento)).toBe("Coordinador");
    expect(laneDe(r.porNombre("Validar manualmente"))).toBe("Auxiliar");
    expect((r.flujos.find((f) => f.sourceRef === tratamiento)!.targetRef as E).name).toBe("Pagar");
    expect(r.porNombre(larga).$type).toBe("bpmn:Task");

    const fin = r.nodos.find((n) => n.$type === "bpmn:EndEvent")!;
    expect(fin.name).toBe("Fin");
    expect(r.flujos.filter((f) => f.targetRef === fin)).toHaveLength(2);
  });

  it("escapa &, <, > y comillas en nombres, condiciones y documentación", async () => {
    const l = levantamiento(
      [
        actividad("1", 'Revisar "soporte" & <anexos>', "Jefe de Cartera & Cobro", { insumo: "Factura <PDF>" }),
        actividad("2", "Notificar a O'Brien", null),
      ],
      [casuistica("1", "Monto > 10 & < 20", "Escalar a <Gerencia>")],
      ficha({ disparador: "Solicitud <urgente>" }),
    );
    const xml = generarBpmn(l, { id: "Fín & Cía #1", nombre: "Pagos & <Cobros>" });
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
    const r = await verificar(xml);

    expect(r.participantes[0].name).toBe("Pagos & <Cobros>");
    expect(r.lanes.map((x) => x.name)).toEqual(["Jefe de Cartera & Cobro", "Sin responsable"]);
    expect(r.porNombre('Revisar "soporte" & <anexos>').$type).toBe("bpmn:Task");
    expect(r.porNombre("Notificar a O'Brien")).toBeDefined();
    expect(r.porNombre("Escalar a <Gerencia>")).toBeDefined();
    expect(r.porNombre("Solicitud <urgente>").$type).toBe("bpmn:StartEvent");
    expect(r.flujos.some((f) => f.name === "Monto > 10 & < 20")).toBe(true);
    expect(lista(r.porNombre('Revisar "soporte" & <anexos>').documentation)[0].text).toBe("Insumo: Factura <PDF>");
    expect(r.contar("bpmn:ExclusiveGateway")).toBe(1);
    expect(r.proceso.id).toBe("Fin_Cia_1_Proceso");
  });

  it("normaliza ids a NCName", () => {
    expect(normalizarId("P-FIN-01")).toBe("P_FIN_01");
    expect(normalizarId("01 Pagos")).toBe("P_01_Pagos");
    expect(normalizarId("")).toBe("P_");
  });

  it("genera un diagrama válido aun sin actividades", async () => {
    const r = await verificar(generarBpmn(levantamiento([]), { id: "X", nombre: "Vacío" }));
    expect(r.lanes.map((x) => x.name)).toEqual(["Sin responsable"]);
    expect(r.flujos).toHaveLength(1);
  });
});

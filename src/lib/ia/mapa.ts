import { z } from "zod";
import type { Levantamiento } from "./esquemas";
import { pedirJson } from "./cliente";
import { NUCLEO } from "./nucleo";

export const TIPOS_INCONSISTENCIA = {
  plazo: "Plazos que no cuadran",
  rol: "Mismo rol con nombres distintos",
  duplicidad: "Actividad duplicada",
  salida_sin_receptor: "Salida que nadie recibe",
  entrada_no_reconocida: "Entrada que el receptor no reconoce",
  regla: "Reglas contradictorias",
  otro: "Otra",
} as const;

export const MapaIntegrado = z.object({
  relaciones: z.array(
    z.object({
      origen: z.string().describe("Código del proceso que entrega o dispara"),
      destino: z.string().describe("Código del proceso que recibe"),
      tipo: z.enum(["entrega", "dispara", "depende_de"]),
      objeto: z.string().describe("Qué pasa de un proceso al otro, p. ej. 'archivo de pagos ejecutados'"),
      certeza: z.enum(["confirmado", "inferido"]),
      evidencia: z.string().describe("Qué dato de cada levantamiento lo respalda"),
    }),
  ),
  inconsistencias: z.array(
    z.object({
      tipo: z.enum(["plazo", "rol", "duplicidad", "salida_sin_receptor", "entrada_no_reconocida", "regla", "otro"]),
      descripcion: z.string(),
      procesos: z.array(z.string()).describe("Códigos de los procesos involucrados"),
    }),
  ),
  rolesEquivalentes: z.array(
    z.object({
      nombre: z.string().describe("Nombre recomendado para el rol"),
      variantes: z.array(z.string()).describe("Nombres con que aparece en los levantamientos"),
    }),
  ),
});
export type MapaIntegrado = z.infer<typeof MapaIntegrado>;

const INSTRUCCIONES = `Etapa: integrar los procesos de un área en un mapa.

Recibes el levantamiento AS IS de cada proceso del área. Encuentra:
- Relaciones entre procesos: qué salida de uno es entrada de otro, qué proceso dispara a otro y qué proceso depende de otro. Usa los códigos de proceso exactos.
- Inconsistencias entre procesos: plazos que no cuadran entre quien entrega y quien recibe, el mismo rol nombrado distinto, actividades duplicadas en dos procesos, salidas que ningún proceso dice recibir, entradas que el proceso receptor no reconoce, reglas que se contradicen.
- Roles equivalentes: grupos de nombres distintos que se refieren al mismo rol o persona.

Solo relaciona procesos de la lista. Si algo es una deducción tuya, la relación es "inferido".`;

function resumir(codigo: string, nombre: string, l: Levantamiento) {
  const f = l.ficha;
  return {
    codigo,
    nombre,
    ficha: Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.valor])),
    actividades: l.actividades.map((a) => ({
      secuencia: a.secuencia,
      nombre: a.nombre,
      responsable: a.responsable,
      sistema: a.sistema,
      insumo: a.insumo,
      salida: a.salida,
    })),
    casuisticas: l.casuisticas.map((c) => `${c.condicion} → ${c.tratamiento ?? "?"}`),
    pendientes: l.hallazgos.filter((h) => h.estado === "abierto").map((h) => `${h.tipo}: ${h.texto}`),
  };
}

export async function integrarArea(area: string, procesos: { codigo: string; nombre: string; levantamiento: Levantamiento }[]) {
  const r = await pedirJson({
    esquema: MapaIntegrado,
    sistema: `${NUCLEO}\n\n${INSTRUCCIONES}`,
    contenido: `Área: ${area}\n\n<procesos>\n${JSON.stringify(procesos.map((p) => resumir(p.codigo, p.nombre, p.levantamiento)))}\n</procesos>`,
    maxTokens: 32000,
  });
  const mapa = r.datos;
  const codigos = new Set(procesos.map((p) => p.codigo));
  // Descarta relaciones con códigos inventados.
  mapa.relaciones = mapa.relaciones.filter((x) => codigos.has(x.origen) && codigos.has(x.destino) && x.origen !== x.destino);
  return { mapa, modelo: r.modelo };
}

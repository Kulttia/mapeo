import { z } from "zod";

/**
 * Contratos de salida de las etapas del pipeline de IA. La IA responde con
 * JSON que cumple estos esquemas; lo que no valida no entra a la base de datos.
 */

export const Certeza = z.enum(["confirmado", "inferido", "pendiente"]);
export type Certeza = z.infer<typeof Certeza>;

/** Segmento de transcripción que respalda un dato: número de sesión y orden del segmento. */
export const Cita = z.object({
  sesion: z.number().int(),
  segmento: z.number().int(),
});
export type Cita = z.infer<typeof Cita>;

const Citas = z.array(Cita);

export const CampoFicha = z.object({
  valor: z.string().nullable(),
  certeza: Certeza,
  citas: Citas,
  nota: z.string().nullable().describe("Por qué es inferido o qué falta; null si no aplica"),
});
export type CampoFicha = z.infer<typeof CampoFicha>;

export const CAMPOS_FICHA = {
  nombre: "Nombre del proceso",
  codigo: "Código",
  macroproceso: "Macroproceso",
  objetivo: "Objetivo",
  dueno: "Dueño del proceso",
  disparador: "Disparador",
  antecesor: "Proceso antecesor",
  hitoCierre: "Hito de cierre",
  sucesor: "Proceso sucesor",
  ans: "ANS",
  kpiActual: "KPI actual",
  volumetria: "Volumetría",
  noAplica: "Qué no incluye",
} as const;
export type CampoFichaClave = keyof typeof CAMPOS_FICHA;

export const Ficha = z.object(
  Object.fromEntries(Object.keys(CAMPOS_FICHA).map((k) => [k, CampoFicha])) as Record<
    CampoFichaClave,
    typeof CampoFicha
  >,
);
export type Ficha = z.infer<typeof Ficha>;

export const Actividad = z.object({
  secuencia: z.string().describe('Número de secuencia; variantes como "8-A1"'),
  nombre: z.string(),
  responsable: z.string().nullable(),
  sistema: z.string().nullable(),
  transaccion: z.string().nullable(),
  insumo: z.string().nullable(),
  salida: z.string().nullable(),
  certeza: Certeza,
  citas: Citas,
});
export type Actividad = z.infer<typeof Actividad>;

export const Casuistica = z.object({
  secuenciaActividad: z.string().nullable(),
  condicion: z.string(),
  tratamiento: z.string().nullable(),
  frecuencia: z.string().nullable(),
  certeza: Certeza,
  citas: Citas,
});
export type Casuistica = z.infer<typeof Casuistica>;

export const TIPOS_HALLAZGO = {
  por_definir: "Por definir",
  contradiccion: "Contradicción",
  supuesto: "Supuesto",
  pregunta: "Pregunta para la próxima sesión",
  error_transcripcion: "Error de transcripción",
} as const;

export const Hallazgo = z.object({
  tipo: z.enum(["por_definir", "contradiccion", "supuesto", "pregunta", "error_transcripcion"]),
  texto: z.string(),
  estado: z.enum(["abierto", "resuelto"]).describe("resuelto si una sesión posterior lo aclaró"),
  citas: Citas,
});
export type Hallazgo = z.infer<typeof Hallazgo>;

export const CATEGORIAS_DIAGNOSTICO = {
  cuello_botella: "Cuello de botella",
  manualidad: "Manualidad",
  duplicidad: "Duplicidad",
  reproceso: "Reproceso",
  espera: "Espera",
  datos: "Datos y sistemas",
  operacion_paralela: "Operación paralela",
} as const;

export const Diagnostico = z.object({
  categoria: z.enum([
    "cuello_botella",
    "manualidad",
    "duplicidad",
    "reproceso",
    "espera",
    "datos",
    "operacion_paralela",
  ]),
  descripcion: z.string(),
  citas: Citas,
});
export type Diagnostico = z.infer<typeof Diagnostico>;

/** Salida de la etapa "extraer levantamiento" (antes skill levantamiento-proceso-as-is). */
export const Levantamiento = z.object({
  ficha: Ficha,
  actividades: z.array(Actividad),
  casuisticas: z.array(Casuistica),
  diagnostico: z.array(Diagnostico),
  hallazgos: z.array(Hallazgo),
});
export type Levantamiento = z.infer<typeof Levantamiento>;

/** Estado de revisión humana por elemento, con claves como "ficha.dueno" o "actividades.3". */
export type EstadoRevision = "aceptado" | "rechazado" | "editado";
export type Revision = Record<string, EstadoRevision>;

/** Lo que se guarda en ficha_version.contenido. */
export type ContenidoFicha = { levantamiento: Levantamiento; revision: Revision };

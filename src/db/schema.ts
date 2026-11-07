import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Catálogos -----------------------------------------------------------------

export const rolEnum = pgEnum("rol", ["administrador", "analista", "validador", "lector"]);

export const estadoArtefactoEnum = pgEnum("estado_artefacto", [
  "borrador_ia",
  "en_revision",
  "validado",
  "publicado",
]);

/** Cómo de seguro es un dato extraído de una transcripción. */
export const certezaEnum = pgEnum("certeza", ["confirmado", "inferido", "pendiente"]);

export const origenSesionEnum = pgEnum("origen_sesion", ["carga", "teams"]);

export const tipoHallazgoEnum = pgEnum("tipo_hallazgo", [
  "por_definir",
  "contradiccion",
  "supuesto",
  "pregunta",
  "error_transcripcion",
]);

export const estadoHallazgoEnum = pgEnum("estado_hallazgo", ["abierto", "resuelto", "descartado"]);

export const tipoRelacionEnum = pgEnum("tipo_relacion", ["dispara", "entrega", "depende_de"]);

const creado = () => timestamp("creado_en", { withTimezone: true }).defaultNow().notNull();

// Organización --------------------------------------------------------------

export const usuario = pgTable("usuario", {
  id: uuid().primaryKey().defaultRandom(),
  correo: text().notNull().unique(),
  nombre: text().notNull(),
  cargo: text(),
  creadoEn: creado(),
});

export const area = pgTable("area", {
  id: uuid().primaryKey().defaultRandom(),
  codigo: text().notNull().unique(),
  nombre: text().notNull(),
  descripcion: text(),
  creadoEn: creado(),
});

export const membresia = pgTable(
  "membresia",
  {
    id: uuid().primaryKey().defaultRandom(),
    areaId: uuid("area_id").notNull().references(() => area.id, { onDelete: "cascade" }),
    usuarioId: uuid("usuario_id").notNull().references(() => usuario.id, { onDelete: "cascade" }),
    rol: rolEnum().notNull(),
  },
  (t) => [uniqueIndex("membresia_area_usuario").on(t.areaId, t.usuarioId)],
);

/** Términos del área para corregir errores de transcripción (p. ej. "efe ciento diez" → F110). */
export const glosario = pgTable("glosario", {
  id: uuid().primaryKey().defaultRandom(),
  areaId: uuid("area_id").references(() => area.id, { onDelete: "cascade" }),
  termino: text().notNull(),
  definicion: text(),
  variantes: jsonb().$type<string[]>().default([]).notNull(),
});

// Procesos y sesiones -------------------------------------------------------

export const proceso = pgTable("proceso", {
  id: uuid().primaryKey().defaultRandom(),
  areaId: uuid("area_id").notNull().references(() => area.id, { onDelete: "cascade" }),
  codigo: text().notNull().unique(),
  nombre: text().notNull(),
  macroproceso: text(),
  dueno: text(),
  estadoLevantamiento: estadoArtefactoEnum("estado_levantamiento"),
  estadoModelo: estadoArtefactoEnum("estado_modelo"),
  creadoEn: creado(),
});

export const sesion = pgTable("sesion", {
  id: uuid().primaryKey().defaultRandom(),
  procesoId: uuid("proceso_id").notNull().references(() => proceso.id, { onDelete: "cascade" }),
  numero: integer().notNull(),
  titulo: text().notNull(),
  fecha: timestamp({ withTimezone: true }).notNull(),
  origen: origenSesionEnum().default("carga").notNull(),
  /** Id de la reunión en Microsoft Graph cuando se importa desde Teams. */
  reunionTeamsId: text("reunion_teams_id"),
  participantes: jsonb().$type<string[]>().default([]).notNull(),
  creadoEn: creado(),
});

export const transcripcion = pgTable("transcripcion", {
  id: uuid().primaryKey().defaultRandom(),
  sesionId: uuid("sesion_id").notNull().references(() => sesion.id, { onDelete: "cascade" }),
  nombreArchivo: text("nombre_archivo").notNull(),
  formato: text().notNull(),
  duracionSegundos: integer("duracion_segundos"),
  creadoEn: creado(),
});

export const segmento = pgTable("segmento", {
  id: uuid().primaryKey().defaultRandom(),
  transcripcionId: uuid("transcripcion_id")
    .notNull()
    .references(() => transcripcion.id, { onDelete: "cascade" }),
  orden: integer().notNull(),
  inicio: real().notNull(),
  fin: real().notNull(),
  hablante: text().notNull(),
  texto: text().notNull(),
});

// Ficha viva ----------------------------------------------------------------

/** Cada versión guarda la ficha completa; la última es la vigente. */
export const fichaVersion = pgTable("ficha_version", {
  id: uuid().primaryKey().defaultRandom(),
  procesoId: uuid("proceso_id").notNull().references(() => proceso.id, { onDelete: "cascade" }),
  version: integer().notNull(),
  contenido: jsonb().notNull(),
  sesionId: uuid("sesion_id").references(() => sesion.id),
  autor: text().notNull(),
  creadoEn: creado(),
});

export const actividad = pgTable("actividad", {
  id: uuid().primaryKey().defaultRandom(),
  procesoId: uuid("proceso_id").notNull().references(() => proceso.id, { onDelete: "cascade" }),
  secuencia: text().notNull(),
  nombre: text().notNull(),
  responsable: text(),
  sistema: text(),
  transaccion: text(),
  insumo: text(),
  salida: text(),
  certeza: certezaEnum().default("pendiente").notNull(),
});

export const casuistica = pgTable("casuistica", {
  id: uuid().primaryKey().defaultRandom(),
  procesoId: uuid("proceso_id").notNull().references(() => proceso.id, { onDelete: "cascade" }),
  actividadId: uuid("actividad_id").references(() => actividad.id, { onDelete: "set null" }),
  condicion: text().notNull(),
  tratamiento: text(),
  frecuencia: text(),
  certeza: certezaEnum().default("pendiente").notNull(),
});

export const hallazgo = pgTable("hallazgo", {
  id: uuid().primaryKey().defaultRandom(),
  procesoId: uuid("proceso_id").notNull().references(() => proceso.id, { onDelete: "cascade" }),
  tipo: tipoHallazgoEnum().notNull(),
  texto: text().notNull(),
  estado: estadoHallazgoEnum().default("abierto").notNull(),
  sesionId: uuid("sesion_id").references(() => sesion.id),
  creadoEn: creado(),
});

/** Enlaza cualquier dato extraído con el segmento de la transcripción que lo respalda. */
export const cita = pgTable("cita", {
  id: uuid().primaryKey().defaultRandom(),
  entidad: text().notNull(),
  entidadId: uuid("entidad_id").notNull(),
  segmentoId: uuid("segmento_id").notNull().references(() => segmento.id, { onDelete: "cascade" }),
});

// Modelado e integración ----------------------------------------------------

export const modeloBpmn = pgTable("modelo_bpmn", {
  id: uuid().primaryKey().defaultRandom(),
  procesoId: uuid("proceso_id").notNull().references(() => proceso.id, { onDelete: "cascade" }),
  version: integer().notNull(),
  xml: text().notNull(),
  estado: estadoArtefactoEnum().default("borrador_ia").notNull(),
  creadoEn: creado(),
});

export const relacionProceso = pgTable("relacion_proceso", {
  id: uuid().primaryKey().defaultRandom(),
  origenId: uuid("origen_id").notNull().references(() => proceso.id, { onDelete: "cascade" }),
  destinoId: uuid("destino_id").notNull().references(() => proceso.id, { onDelete: "cascade" }),
  tipo: tipoRelacionEnum().notNull(),
  objeto: text(),
  certeza: certezaEnum().default("pendiente").notNull(),
});

export const mapaArea = pgTable("mapa_area", {
  id: uuid().primaryKey().defaultRandom(),
  areaId: uuid("area_id").notNull().references(() => area.id, { onDelete: "cascade" }),
  version: integer().notNull(),
  contenido: jsonb().notNull(),
  creadoEn: creado(),
});

export const estadoEjecucionEnum = pgEnum("estado_ejecucion", ["en_curso", "completada", "error"]);

/** Cada corrida del pipeline de IA sobre una sesión: estado, modelo y consumo. */
export const ejecucionIa = pgTable("ejecucion_ia", {
  id: uuid().primaryKey().defaultRandom(),
  procesoId: uuid("proceso_id").notNull().references(() => proceso.id, { onDelete: "cascade" }),
  sesionId: uuid("sesion_id").notNull().references(() => sesion.id, { onDelete: "cascade" }),
  etapa: text().notNull(),
  estado: estadoEjecucionEnum().default("en_curso").notNull(),
  modelo: text().notNull(),
  tokensEntrada: integer("tokens_entrada"),
  tokensSalida: integer("tokens_salida"),
  duracionMs: integer("duracion_ms"),
  error: text(),
  creadoEn: creado(),
});

export const auditoria = pgTable("auditoria", {
  id: uuid().primaryKey().defaultRandom(),
  usuarioCorreo: text("usuario_correo"),
  accion: text().notNull(),
  entidad: text().notNull(),
  entidadId: uuid("entidad_id"),
  detalle: jsonb(),
  creadoEn: creado(),
});

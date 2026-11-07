CREATE TYPE "public"."certeza" AS ENUM('confirmado', 'inferido', 'pendiente');--> statement-breakpoint
CREATE TYPE "public"."estado_artefacto" AS ENUM('borrador_ia', 'en_revision', 'validado', 'publicado');--> statement-breakpoint
CREATE TYPE "public"."estado_hallazgo" AS ENUM('abierto', 'resuelto', 'descartado');--> statement-breakpoint
CREATE TYPE "public"."origen_sesion" AS ENUM('carga', 'teams');--> statement-breakpoint
CREATE TYPE "public"."rol" AS ENUM('administrador', 'analista', 'validador', 'lector');--> statement-breakpoint
CREATE TYPE "public"."tipo_hallazgo" AS ENUM('por_definir', 'contradiccion', 'supuesto', 'pregunta', 'error_transcripcion');--> statement-breakpoint
CREATE TYPE "public"."tipo_relacion" AS ENUM('dispara', 'entrega', 'depende_de');--> statement-breakpoint
CREATE TABLE "actividad" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proceso_id" uuid NOT NULL,
	"secuencia" text NOT NULL,
	"nombre" text NOT NULL,
	"responsable" text,
	"sistema" text,
	"transaccion" text,
	"insumo" text,
	"salida" text,
	"certeza" "certeza" DEFAULT 'pendiente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "area" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "area_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "auditoria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_correo" text,
	"accion" text NOT NULL,
	"entidad" text NOT NULL,
	"entidad_id" uuid,
	"detalle" jsonb,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "casuistica" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proceso_id" uuid NOT NULL,
	"actividad_id" uuid,
	"condicion" text NOT NULL,
	"tratamiento" text,
	"frecuencia" text,
	"certeza" "certeza" DEFAULT 'pendiente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cita" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entidad" text NOT NULL,
	"entidad_id" uuid NOT NULL,
	"segmento_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ficha_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proceso_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"contenido" jsonb NOT NULL,
	"sesion_id" uuid,
	"autor" text NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "glosario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"area_id" uuid,
	"termino" text NOT NULL,
	"definicion" text,
	"variantes" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hallazgo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proceso_id" uuid NOT NULL,
	"tipo" "tipo_hallazgo" NOT NULL,
	"texto" text NOT NULL,
	"estado" "estado_hallazgo" DEFAULT 'abierto' NOT NULL,
	"sesion_id" uuid,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mapa_area" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"area_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"contenido" jsonb NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membresia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"area_id" uuid NOT NULL,
	"usuario_id" uuid NOT NULL,
	"rol" "rol" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modelo_bpmn" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proceso_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"xml" text NOT NULL,
	"estado" "estado_artefacto" DEFAULT 'borrador_ia' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proceso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"area_id" uuid NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"macroproceso" text,
	"dueno" text,
	"estado_levantamiento" "estado_artefacto",
	"estado_modelo" "estado_artefacto",
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proceso_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "relacion_proceso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origen_id" uuid NOT NULL,
	"destino_id" uuid NOT NULL,
	"tipo" "tipo_relacion" NOT NULL,
	"objeto" text,
	"certeza" "certeza" DEFAULT 'pendiente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "segmento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transcripcion_id" uuid NOT NULL,
	"orden" integer NOT NULL,
	"inicio" real NOT NULL,
	"fin" real NOT NULL,
	"hablante" text NOT NULL,
	"texto" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sesion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proceso_id" uuid NOT NULL,
	"numero" integer NOT NULL,
	"titulo" text NOT NULL,
	"fecha" timestamp with time zone NOT NULL,
	"origen" "origen_sesion" DEFAULT 'carga' NOT NULL,
	"reunion_teams_id" text,
	"participantes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transcripcion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sesion_id" uuid NOT NULL,
	"nombre_archivo" text NOT NULL,
	"formato" text NOT NULL,
	"duracion_segundos" integer,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"correo" text NOT NULL,
	"nombre" text NOT NULL,
	"cargo" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuario_correo_unique" UNIQUE("correo")
);
--> statement-breakpoint
ALTER TABLE "actividad" ADD CONSTRAINT "actividad_proceso_id_proceso_id_fk" FOREIGN KEY ("proceso_id") REFERENCES "public"."proceso"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casuistica" ADD CONSTRAINT "casuistica_proceso_id_proceso_id_fk" FOREIGN KEY ("proceso_id") REFERENCES "public"."proceso"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casuistica" ADD CONSTRAINT "casuistica_actividad_id_actividad_id_fk" FOREIGN KEY ("actividad_id") REFERENCES "public"."actividad"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cita" ADD CONSTRAINT "cita_segmento_id_segmento_id_fk" FOREIGN KEY ("segmento_id") REFERENCES "public"."segmento"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ficha_version" ADD CONSTRAINT "ficha_version_proceso_id_proceso_id_fk" FOREIGN KEY ("proceso_id") REFERENCES "public"."proceso"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ficha_version" ADD CONSTRAINT "ficha_version_sesion_id_sesion_id_fk" FOREIGN KEY ("sesion_id") REFERENCES "public"."sesion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glosario" ADD CONSTRAINT "glosario_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hallazgo" ADD CONSTRAINT "hallazgo_proceso_id_proceso_id_fk" FOREIGN KEY ("proceso_id") REFERENCES "public"."proceso"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hallazgo" ADD CONSTRAINT "hallazgo_sesion_id_sesion_id_fk" FOREIGN KEY ("sesion_id") REFERENCES "public"."sesion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mapa_area" ADD CONSTRAINT "mapa_area_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membresia" ADD CONSTRAINT "membresia_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membresia" ADD CONSTRAINT "membresia_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modelo_bpmn" ADD CONSTRAINT "modelo_bpmn_proceso_id_proceso_id_fk" FOREIGN KEY ("proceso_id") REFERENCES "public"."proceso"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proceso" ADD CONSTRAINT "proceso_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relacion_proceso" ADD CONSTRAINT "relacion_proceso_origen_id_proceso_id_fk" FOREIGN KEY ("origen_id") REFERENCES "public"."proceso"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relacion_proceso" ADD CONSTRAINT "relacion_proceso_destino_id_proceso_id_fk" FOREIGN KEY ("destino_id") REFERENCES "public"."proceso"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segmento" ADD CONSTRAINT "segmento_transcripcion_id_transcripcion_id_fk" FOREIGN KEY ("transcripcion_id") REFERENCES "public"."transcripcion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesion" ADD CONSTRAINT "sesion_proceso_id_proceso_id_fk" FOREIGN KEY ("proceso_id") REFERENCES "public"."proceso"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcripcion" ADD CONSTRAINT "transcripcion_sesion_id_sesion_id_fk" FOREIGN KEY ("sesion_id") REFERENCES "public"."sesion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "membresia_area_usuario" ON "membresia" USING btree ("area_id","usuario_id");
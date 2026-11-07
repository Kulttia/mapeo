CREATE TYPE "public"."estado_ejecucion" AS ENUM('en_curso', 'completada', 'error');--> statement-breakpoint
CREATE TABLE "ejecucion_ia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proceso_id" uuid NOT NULL,
	"sesion_id" uuid NOT NULL,
	"etapa" text NOT NULL,
	"estado" "estado_ejecucion" DEFAULT 'en_curso' NOT NULL,
	"modelo" text NOT NULL,
	"tokens_entrada" integer,
	"tokens_salida" integer,
	"duracion_ms" integer,
	"error" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ejecucion_ia" ADD CONSTRAINT "ejecucion_ia_proceso_id_proceso_id_fk" FOREIGN KEY ("proceso_id") REFERENCES "public"."proceso"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ejecucion_ia" ADD CONSTRAINT "ejecucion_ia_sesion_id_sesion_id_fk" FOREIGN KEY ("sesion_id") REFERENCES "public"."sesion"("id") ON DELETE cascade ON UPDATE no action;
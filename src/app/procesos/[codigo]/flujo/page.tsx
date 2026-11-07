import { eq } from "drizzle-orm";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { db, schema } from "@/db";
import { EncabezadoProceso } from "@/components/proceso/encabezado";
import { modeloVigente } from "@/lib/bpmn/servicio";
import { obtenerRevision } from "@/lib/datos";
import { BotonesFlujo } from "./botones";

const EditorBpmn = dynamic(() => import("@/components/flujo/editor-bpmn").then((m) => m.EditorBpmn));

async function Flujo({ params }: PageProps<"/procesos/[codigo]/flujo">) {
  await connection();
  const { codigo } = await params;
  const datos = await obtenerRevision(codigo);
  if (!datos) notFound();
  const { proceso, vigente } = datos;
  const [area] = await db.select().from(schema.area).where(eq(schema.area.id, proceso.areaId));
  const modelo = await modeloVigente(proceso.id);
  const validado = proceso.estadoLevantamiento === "validado";

  return (
    <div className="space-y-6">
      <EncabezadoProceso
        proceso={proceso}
        areaCodigo={area.codigo}
        sesiones={proceso.sesiones.length}
        activo="flujo"
        acciones={modelo && <BotonesFlujo codigo={codigo} estado={modelo.estado} hayLevantamiento={Boolean(vigente)} />}
      />

      {!vigente ? (
        <p className="rounded-media bg-alerta-suave p-5 text-sm text-alerta">
          Este proceso aún no tiene levantamiento. Procesa una transcripción con IA en la pestaña Levantamiento.
        </p>
      ) : !modelo ? (
        <div className="space-y-4 rounded-media bg-lavanda p-6">
          <p className="font-bold text-titulo">Convertir el levantamiento en un flujo BPMN</p>
          <p className="text-sm text-texto-suave">
            Mapeo dibuja un carril por responsable, una tarea por actividad y una compuerta por cada casuística. Lo que
            rechazaste en la revisión no entra. Después puedes ajustarlo a mano y descargarlo para Bizagi.
          </p>
          {!validado && (
            <p className="text-sm text-alerta">
              El levantamiento todavía no está validado. Puedes generar el flujo igual, pero lo recomendado es validarlo
              primero.
            </p>
          )}
          <BotonesFlujo codigo={codigo} estado={null} hayLevantamiento />
        </div>
      ) : (
        <>
          <p className="text-xs text-texto-suave">
            Flujo versión {modelo.version} · {modelo.creadoEn.toLocaleDateString("es-CO", { dateStyle: "medium" })}
          </p>
          <EditorBpmn key={modelo.id} codigo={codigo} xml={modelo.xml} />
        </>
      )}
    </div>
  );
}

export default function Pagina(props: PageProps<"/procesos/[codigo]/flujo">) {
  return (
    <Suspense fallback={<p className="text-texto-suave">Cargando flujo…</p>}>
      <Flujo {...props} />
    </Suspense>
  );
}

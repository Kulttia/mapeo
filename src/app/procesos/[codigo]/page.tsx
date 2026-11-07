import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icono } from "@/components/icono";
import { PanelIa } from "@/components/levantamiento/panel-ia";
import { RevisionLevantamiento } from "@/components/levantamiento/revision";
import { EncabezadoProceso } from "@/components/proceso/encabezado";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { obtenerRevision, obtenerSegmentos, obtenerSegmentosProceso } from "@/lib/datos";
import { formatoMinuto } from "@/lib/transcripcion/vtt";
import { BotonValidar } from "./boton-validar";

// La IA corre en segundo plano (after) dentro del tiempo de esta ruta.
export const maxDuration = 300;

async function Transcripcion({ transcripcionId }: { transcripcionId: string }) {
  const segmentos = await obtenerSegmentos(transcripcionId);
  return (
    <ol className="divide-y divide-borde">
      {segmentos.map((s) => (
        <li key={s.id} id={`s${s.orden}`} className="grid grid-cols-[4rem_1fr] gap-3 py-2.5 text-sm leading-5">
          <span className="pt-px font-mono text-xs text-texto-tenue">{formatoMinuto(s.inicio)}</span>
          <p>
            <span className="font-bold text-titulo">{s.hablante}: </span>
            {s.texto}
          </p>
        </li>
      ))}
    </ol>
  );
}

/** Antes de la IA: lista de sesiones y la transcripción seleccionada. */
async function VistaTranscripciones({
  proceso,
  sesionParam,
}: {
  proceso: NonNullable<Awaited<ReturnType<typeof obtenerRevision>>>["proceso"];
  sesionParam?: string;
}) {
  const numero = Number(sesionParam ?? proceso.sesiones[0]?.numero);
  const actual = proceso.sesiones.find((s) => s.numero === numero);
  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <nav className="space-y-2">
        <h2 className="text-sm font-bold text-titulo">Sesiones</h2>
        {proceso.sesiones.map((s) => (
          <Link
            key={s.id}
            href={`/procesos/${proceso.codigo}?sesion=${s.numero}`}
            className={`block rounded-baldosa border p-3 text-sm ${
              s.numero === actual?.numero
                ? "border-primario bg-primario-suave"
                : "border-borde-baldosa bg-baldosa hover:border-primario"
            }`}
          >
            <span className="font-bold text-titulo">
              Sesión {s.numero} · {s.titulo}
            </span>
            <span className="block text-xs text-texto-suave">
              {s.fecha.toLocaleDateString("es-CO", { dateStyle: "medium" })}
              {s.duracionSegundos ? ` · ${formatoMinuto(s.duracionSegundos)}` : ""}
            </span>
          </Link>
        ))}
      </nav>

      <section className="rounded-media border border-borde bg-pagina p-5">
        {actual?.transcripcionId ? (
          <>
            <header className="mb-2 border-b border-borde pb-3">
              <h2 className="flex items-center gap-2 font-bold text-titulo">
                <Icono nombre="file-alt1" className="text-primario" /> Transcripción
              </h2>
              <p className="mt-1 text-xs text-texto-suave">Participantes: {actual.participantes.join(", ")}</p>
            </header>
            <Suspense fallback={<p className="text-texto-suave">Cargando transcripción…</p>}>
              <Transcripcion transcripcionId={actual.transcripcionId} />
            </Suspense>
          </>
        ) : (
          <p className="text-texto-suave">Este proceso aún no tiene transcripciones.</p>
        )}
      </section>
    </div>
  );
}

async function DetalleProceso({ params, searchParams }: PageProps<"/procesos/[codigo]">) {
  const { codigo } = await params;
  const { sesion: sesionParam } = await searchParams;
  const datos = await obtenerRevision(codigo);
  if (!datos) notFound();
  const { proceso, vigente, pendiente, enCurso, ultima } = datos;
  const [area] = await db.select().from(schema.area).where(eq(schema.area.id, proceso.areaId));

  const sesionesVista = vigente
    ? (await obtenerSegmentosProceso(proceso.sesiones)).map((s) => ({
        ...s,
        titulo: proceso.sesiones.find((x) => x.numero === s.numero)?.titulo ?? "",
      }))
    : [];
  const sesionVersion = proceso.sesiones.find((s) => s.id === vigente?.sesionId);

  return (
    <div className="space-y-6">
      <EncabezadoProceso
        proceso={proceso}
        areaCodigo={area.codigo}
        sesiones={proceso.sesiones.length}
        activo="levantamiento"
        acciones={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/nuevo?area=${proceso.areaId}&proceso=${proceso.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-primario px-5 text-sm font-bold text-primario hover:bg-primario hover:text-white"
            >
              <Icono nombre="plus" /> Agregar sesión
            </Link>
            {vigente && <BotonValidar codigo={proceso.codigo} estado={proceso.estadoLevantamiento} />}
          </div>
        }
      />

      <PanelIa
        codigo={proceso.codigo}
        pendiente={pendiente && { numero: pendiente.numero, titulo: pendiente.titulo }}
        enCurso={Boolean(enCurso)}
        ultimoError={ultima?.estado === "error" ? ultima.error : null}
      />

      {vigente ? (
        <>
          <p className="text-xs text-texto-suave">
            Levantamiento versión {vigente.version}
            {sesionVersion && `, actualizado con la sesión ${sesionVersion.numero}`} · propuesto por {vigente.autor} ·{" "}
            {vigente.creadoEn.toLocaleDateString("es-CO", { dateStyle: "medium" })}
          </p>
          <RevisionLevantamiento
            codigo={proceso.codigo}
            levantamiento={vigente.contenido.levantamiento}
            revision={vigente.contenido.revision}
            sesiones={sesionesVista}
          />
        </>
      ) : (
        <VistaTranscripciones proceso={proceso} sesionParam={typeof sesionParam === "string" ? sesionParam : undefined} />
      )}
    </div>
  );
}

export default function Pagina(props: PageProps<"/procesos/[codigo]">) {
  return (
    <Suspense fallback={<p className="text-texto-suave">Cargando proceso…</p>}>
      <DetalleProceso {...props} />
    </Suspense>
  );
}

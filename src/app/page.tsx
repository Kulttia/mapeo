import Link from "next/link";
import { Suspense } from "react";
import { Icono } from "@/components/icono";
import { PasosProceso } from "@/components/pasos-proceso";
import { listarAreasConProcesos } from "@/lib/datos";

async function Areas() {
  const areas = await listarAreasConProcesos();

  if (!areas.length) {
    return (
      <p className="rounded-media border border-dashed border-borde-input p-6 text-texto-suave">
        Aún no hay áreas. Carga los datos de prueba con <code>npm run db:setup</code>.
      </p>
    );
  }

  return areas.map((a) => (
    <section key={a.id} className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[23px] leading-[30px] font-bold text-titulo">{a.nombre}</h2>
          {a.descripcion && <p className="mt-1 text-sm text-texto-suave">{a.descripcion}</p>}
        </div>
        <Link
          href={`/areas/${a.codigo}`}
          className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-primario px-5 text-sm font-bold text-primario hover:bg-primario hover:text-white"
        >
          <Icono nombre="sitemap" /> Mapa del área
        </Link>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {a.procesos.map((p) => (
          <li key={p.id}>
            <Link
              href={`/procesos/${p.codigo}`}
              className="group block space-y-4 rounded-media bg-lavanda p-5 hover:bg-primario-suave"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-primario">{p.codigo}</span>
                  <h3 className="mt-0.5 font-bold leading-snug text-titulo">{p.nombre}</h3>
                  <p className="mt-1 text-sm text-texto-suave">
                    {p.sesiones} {p.sesiones === 1 ? "sesión" : "sesiones"} de levantamiento
                  </p>
                </div>
                <Icono
                  nombre="arrow-right"
                  className="mt-1 text-lg text-primario transition-transform group-hover:translate-x-1"
                />
              </div>
              <PasosProceso sesiones={p.sesiones} levantamiento={p.estadoLevantamiento} modelo={p.estadoModelo} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  ));
}

export default function Inicio() {
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        <p className="text-lg font-bold text-primario">Excelencia Operativa</p>
        <h1 className="mt-2 text-[33px] leading-[43px] font-bold text-titulo">Procesos por área</h1>
        <p className="mt-3 text-texto-suave">
          Levanta el proceso desde la reunión de Teams, modélalo en BPMN e intégralo al mapa del área.
        </p>
      </div>
        <Link
          href="/nuevo"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-primario px-7 font-bold text-white hover:bg-primario-hover"
        >
          <Icono nombre="upload" /> Subir transcripción
        </Link>
      </div>
      <Suspense fallback={<p className="text-texto-suave">Cargando procesos…</p>}>
        <Areas />
      </Suspense>
    </div>
  );
}

import Link from "next/link";
import { Suspense } from "react";
import { Icono } from "@/components/icono";
import { listarAreasConProcesos } from "@/lib/datos";
import { FormularioSubida } from "./formulario";

async function Formulario({ searchParams }: PageProps<"/nuevo">) {
  const { area, proceso } = await searchParams;
  const areas = await listarAreasConProcesos();
  return (
    <FormularioSubida
      areas={areas.map((a) => ({
        id: a.id,
        nombre: a.nombre,
        procesos: a.procesos.map((p) => ({ id: p.id, codigo: p.codigo, nombre: p.nombre })),
      }))}
      areaInicial={typeof area === "string" ? area : undefined}
      procesoInicial={typeof proceso === "string" ? proceso : undefined}
    />
  );
}

export default function Nuevo(props: PageProps<"/nuevo">) {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-primario hover:text-primario-hover">
          <Icono nombre="arrow-left" /> Procesos
        </Link>
        <p className="text-lg font-bold text-primario">Nuevo levantamiento</p>
        <h1 className="text-[33px] leading-[43px] font-bold text-titulo">Sube la reunión con el área</h1>
        <p className="text-texto-suave">
          Mapeo lee la transcripción de Teams y propone el levantamiento del proceso. Tú lo revisas, lo validas y luego lo
          conviertes en flujo BPMN.
        </p>
      </div>
      <Suspense fallback={<p className="text-texto-suave">Cargando áreas…</p>}>
        <Formulario {...props} />
      </Suspense>
    </div>
  );
}

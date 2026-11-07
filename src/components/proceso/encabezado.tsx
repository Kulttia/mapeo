import Link from "next/link";
import { Icono } from "@/components/icono";
import { PasosProceso } from "@/components/pasos-proceso";

type Estado = "borrador_ia" | "en_revision" | "validado" | "publicado" | null;

type Props = {
  proceso: {
    codigo: string;
    nombre: string;
    macroproceso: string | null;
    areaId: string;
    estadoLevantamiento: Estado;
    estadoModelo: Estado;
  };
  areaCodigo: string;
  sesiones: number;
  activo: "levantamiento" | "flujo";
  acciones?: React.ReactNode;
};

/** Título del proceso, sus tres pasos y las pestañas Levantamiento / Flujo modelado / Mapa del área. */
export function EncabezadoProceso({ proceso, areaCodigo, sesiones, activo, acciones }: Props) {
  const pestanas = [
    { id: "levantamiento", texto: "Levantamiento", href: `/procesos/${proceso.codigo}`, icono: "microphone" },
    { id: "flujo", texto: "Flujo modelado", href: `/procesos/${proceso.codigo}/flujo`, icono: "code-branch" },
    { id: "mapa", texto: "Mapa del área", href: `/areas/${areaCodigo}`, icono: "sitemap" },
  ];
  return (
    <div className="space-y-4">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-primario hover:text-primario-hover">
        <Icono nombre="arrow-left" /> Procesos
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="text-sm font-bold text-primario">{proceso.codigo}</span>
          <h1 className="mt-1 text-[27px] leading-[35px] font-bold text-titulo sm:text-[33px] sm:leading-[43px]">
            {proceso.nombre}
          </h1>
          {proceso.macroproceso && <p className="text-sm text-texto-suave">{proceso.macroproceso}</p>}
        </div>
        {acciones}
      </div>
      <PasosProceso sesiones={sesiones} levantamiento={proceso.estadoLevantamiento} modelo={proceso.estadoModelo} />
      <nav className="-mb-px flex gap-1 overflow-x-auto border-b border-borde [scrollbar-width:none]">
        {pestanas.map((p) => (
          <Link
            key={p.id}
            href={p.href}
            aria-current={p.id === activo ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${
              p.id === activo ? "border-primario text-primario" : "border-transparent text-texto-suave hover:text-primario"
            }`}
          >
            <Icono nombre={p.icono} /> {p.texto}
          </Link>
        ))}
      </nav>
    </div>
  );
}

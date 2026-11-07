import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Icono } from "@/components/icono";
import { destinoSeguro } from "@/lib/sesion";
import { FormularioIngreso } from "./formulario";

export const metadata: Metadata = { title: "Ingresar · Mapeo · Comfama" };

async function Formulario({ searchParams }: { searchParams: PageProps<"/ingresar">["searchParams"] }) {
  const { desde } = await searchParams;
  return <FormularioIngreso desde={destinoSeguro(desde)} />;
}

const pasos = [
  { icono: "microphone", texto: "Sube la reunión de Teams" },
  { icono: "code-branch", texto: "Revisa el flujo que propone la IA" },
  { icono: "sitemap", texto: "Mira el mapa completo del área" },
];

/** Cubre toda la pantalla (incluido el encabezado de la app) mientras no hay sesión. */
export default function PaginaIngreso(props: PageProps<"/ingresar">) {
  return (
    <div className="pantalla-ingreso fixed inset-0 z-50 grid overflow-y-auto bg-pagina md:grid-cols-[1.1fr_1fr]">
      <section className="relative flex flex-col justify-between gap-10 overflow-hidden bg-primario px-6 py-8 text-white md:px-12 md:py-12">
        <div aria-hidden className="absolute -right-24 -bottom-24 size-80 rounded-full bg-white/10" />
        <div aria-hidden className="absolute -top-16 -left-16 size-48 rounded-full bg-white/10" />
        <Image src="/brand/logo-comfama-white.svg" alt="Comfama" width={150} height={26} priority className="relative h-auto" />
        <div className="relative space-y-4">
          <h1 className="text-3xl leading-tight font-bold md:text-5xl">Mapeo</h1>
          <p className="max-w-md text-lg text-white/90 md:text-xl">
            De la reunión de Teams al mapa de procesos del área, en minutos.
          </p>
          <ul className="hidden space-y-3 pt-4 md:block">
            {pasos.map((p) => (
              <li key={p.texto} className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-white/15">
                  <Icono nombre={p.icono} />
                </span>
                {p.texto}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative hidden text-sm text-white/75 md:block">Piloto · datos ficticios</p>
      </section>

      <section className="flex items-center justify-center px-6 py-10 md:px-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-titulo">Ingresa a tu cuenta</h2>
            <p className="text-texto-suave">Usa el usuario y la contraseña que te compartió el equipo del piloto.</p>
          </div>
          <Suspense fallback={<div className="h-64" />}>
            <Formulario searchParams={props.searchParams} />
          </Suspense>
          <p className="rounded-baldosa bg-lavanda px-4 py-3 text-sm text-terciario">
            <Icono nombre="lock" className="mr-2" />
            Este ingreso es una simulación. Más adelante se usará la cuenta corporativa de Comfama.
          </p>
        </div>
      </section>
    </div>
  );
}

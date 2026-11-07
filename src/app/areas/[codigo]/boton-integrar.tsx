"use client";

import { useActionState } from "react";
import { Icono } from "@/components/icono";
import { integrarConIa, type EstadoMapa } from "./acciones";

export function BotonIntegrar({ codigo, hayMapa }: { codigo: string; hayMapa: boolean }) {
  const [estado, accion, enviando] = useActionState<EstadoMapa, FormData>(integrarConIa.bind(null, codigo), null);
  return (
    <form action={accion} className="space-y-2 rounded-media bg-lavanda p-5">
      <p className="flex items-center gap-2 font-bold text-titulo">
        <Icono nombre="sitemap" className="text-primario" />
        {hayMapa ? "Actualizar el mapa con la IA" : "Integrar los procesos con la IA"}
      </p>
      <p className="text-sm text-texto-suave">
        La IA cruza los levantamientos: qué entrega cada proceso a otro, roles con nombres distintos, actividades
        duplicadas, plazos que no cuadran y salidas que nadie recibe. Tarda menos de un minuto.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="clave-mapa" className="sr-only">
          Clave del piloto
        </label>
        <input
          id="clave-mapa"
          name="clave"
          type="password"
          required
          autoComplete="off"
          placeholder="Clave del piloto"
          className="h-11 min-w-0 flex-1 rounded-lg border border-borde-input bg-pagina px-3 text-sm sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primario px-6 text-sm font-bold text-white hover:bg-primario-hover disabled:opacity-60"
        >
          {enviando && <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {enviando ? "Integrando…" : "Integrar con IA"}
        </button>
      </div>
      {estado?.error && <p className="rounded-lg bg-error-suave px-3 py-2 text-sm text-error">{estado.error}</p>}
    </form>
  );
}

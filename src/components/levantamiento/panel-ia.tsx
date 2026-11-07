"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { procesarConIa, type EstadoAccion } from "@/app/procesos/[codigo]/acciones";
import { Icono } from "@/components/icono";

type Props = {
  codigo: string;
  pendiente: { numero: number; titulo: string } | null;
  enCurso: boolean;
  ultimoError: string | null;
};

/** Lanza la IA sobre la sesión pendiente y, mientras corre, refresca la página cada 10 s. */
export function PanelIa({ codigo, pendiente, enCurso, ultimoError }: Props) {
  const router = useRouter();
  const [estado, accion, enviando] = useActionState<EstadoAccion, FormData>(procesarConIa.bind(null, codigo), null);

  useEffect(() => {
    if (!enCurso) return;
    const t = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(t);
  }, [enCurso, router]);

  if (enCurso) {
    return (
      <div className="flex items-center gap-3 rounded-media bg-lavanda p-5" role="status">
        <span className="size-5 animate-spin rounded-full border-2 border-primario border-t-transparent" aria-hidden />
        <div>
          <p className="font-bold text-titulo">La IA está leyendo la transcripción</p>
          <p className="text-sm text-texto-suave">Tarda entre 2 y 4 minutos. Esta página se actualiza sola.</p>
        </div>
      </div>
    );
  }

  if (!pendiente) return null;

  return (
    <form action={accion} className="space-y-3 rounded-media bg-lavanda p-5">
      <div className="flex items-start gap-3">
        <Icono nombre="microphone" className="mt-0.5 text-xl text-primario" />
        <div>
          <p className="font-bold text-titulo">
            Procesar la sesión {pendiente.numero} con IA
          </p>
          <p className="text-sm text-texto-suave">
            {pendiente.titulo}. La IA propone ficha, actividades, casuísticas y pendientes; tú los revisas.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="clave">
          Clave del piloto
        </label>
        <input
          id="clave"
          name="clave"
          type="password"
          required
          placeholder="Clave del piloto"
          autoComplete="off"
          className="h-11 min-w-0 flex-1 rounded-lg border border-borde-input bg-pagina px-3 text-sm sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={enviando}
          className="h-11 rounded-full bg-primario px-6 text-sm font-bold text-white hover:bg-primario-hover disabled:opacity-60"
        >
          {enviando ? "Iniciando…" : "Procesar con IA"}
        </button>
      </div>
      {(estado?.error || ultimoError) && (
        <p className="rounded-lg bg-error-suave px-3 py-2 text-sm text-error">
          {estado?.error ?? `El último intento falló: ${ultimoError}`}
        </p>
      )}
      {estado?.ok && <p className="text-sm text-exito">{estado.ok}</p>}
    </form>
  );
}

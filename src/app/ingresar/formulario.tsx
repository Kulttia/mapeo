"use client";

import { useActionState, useState } from "react";
import { Icono } from "@/components/icono";
import { ingresar, type EstadoIngreso } from "./acciones";

const campo =
  "h-12 w-full rounded-lg border border-borde-input bg-pagina pl-11 pr-3 text-base text-texto outline-none transition focus:border-primario focus:ring-2 focus:ring-primario/20";

export function FormularioIngreso({ desde }: { desde: string }) {
  const [estado, accion, enviando] = useActionState<EstadoIngreso, FormData>(ingresar, null);
  const [verClave, setVerClave] = useState(false);

  return (
    <form action={accion} className="space-y-5" noValidate>
      <input type="hidden" name="desde" value={desde} />
      <div className="space-y-1.5">
        <label htmlFor="usuario" className="block text-sm font-bold text-titulo">
          Usuario
        </label>
        <div className="relative">
          <Icono nombre="user" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-texto-tenue" />
          <input
            id="usuario"
            name="usuario"
            autoComplete="username"
            autoCapitalize="none"
            required
            defaultValue={estado?.usuario}
            placeholder="Tu usuario"
            className={campo}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="clave" className="block text-sm font-bold text-titulo">
          Contraseña
        </label>
        <div className="relative">
          <Icono nombre="lock" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-texto-tenue" />
          <input
            id="clave"
            name="clave"
            type={verClave ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Tu contraseña"
            className={`${campo} pr-12`}
          />
          <button
            type="button"
            onClick={() => setVerClave((v) => !v)}
            aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-texto-suave hover:bg-lavanda"
          >
            <Icono nombre={verClave ? "eye-slash" : "eye"} />
          </button>
        </div>
      </div>

      {estado?.error && (
        <p role="alert" className="rounded-lg bg-error-suave px-4 py-3 text-sm text-error">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="h-12 w-full rounded-full bg-primario font-bold text-white transition hover:bg-primario-hover disabled:opacity-60"
      >
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

"use client";

import { useTransition } from "react";
import { Icono } from "@/components/icono";
import { cambiarEstadoLevantamiento } from "./acciones";

type Estado = "borrador_ia" | "en_revision" | "validado" | "publicado" | null;

/** Cierra la revisión: el levantamiento queda validado y listo para modelar. */
export function BotonValidar({ codigo, estado }: { codigo: string; estado: Estado }) {
  const [pendiente, iniciar] = useTransition();

  if (estado === "validado" || estado === "publicado") {
    return (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-exito-suave px-3 py-1.5 text-sm font-bold text-exito">
          <Icono nombre="check-circle" /> Levantamiento validado
        </span>
        <button
          type="button"
          disabled={pendiente}
          onClick={() => iniciar(() => cambiarEstadoLevantamiento(codigo, "en_revision"))}
          className="text-sm font-medium text-primario underline hover:text-primario-hover"
        >
          Reabrir
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      disabled={pendiente}
      onClick={() => iniciar(() => cambiarEstadoLevantamiento(codigo, "validado"))}
      className="h-11 rounded-full border-2 border-primario px-6 text-sm font-bold text-primario hover:bg-primario hover:text-white disabled:opacity-60"
    >
      Validar levantamiento
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Icono } from "@/components/icono";
import { generarFlujo, validarFlujo } from "./acciones";

type Estado = "borrador_ia" | "en_revision" | "validado" | "publicado" | null;

export function BotonesFlujo({ codigo, estado, hayLevantamiento }: { codigo: string; estado: Estado; hayLevantamiento: boolean }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const generar = () =>
    iniciar(async () => {
      const r = await generarFlujo(codigo);
      setError(r?.error ?? null);
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {estado === "validado" ? (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-exito-suave px-3 py-1.5 text-sm font-bold text-exito">
            <Icono nombre="check-circle" /> Flujo validado
          </span>
          <button type="button" disabled={pendiente} onClick={() => iniciar(() => validarFlujo(codigo, false))} className="text-sm font-medium text-primario underline">
            Reabrir
          </button>
        </>
      ) : (
        estado && (
          <button
            type="button"
            disabled={pendiente}
            onClick={() => iniciar(() => validarFlujo(codigo, true))}
            className="h-11 rounded-full border-2 border-primario px-5 text-sm font-bold text-primario hover:bg-primario hover:text-white"
          >
            Validar flujo
          </button>
        )
      )}
      {hayLevantamiento && (
        <button
          type="button"
          disabled={pendiente}
          onClick={generar}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primario px-6 text-sm font-bold text-white hover:bg-primario-hover disabled:opacity-60"
        >
          <Icono nombre="code-branch" />
          {pendiente ? "Generando…" : estado ? "Regenerar desde el levantamiento" : "Generar flujo BPMN"}
        </button>
      )}
      {error && <p className="w-full rounded-lg bg-error-suave px-3 py-2 text-sm text-error">{error}</p>}
    </div>
  );
}

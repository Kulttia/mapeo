"use client";

import { useActionState, useState } from "react";
import { Icono } from "@/components/icono";
import { subirTranscripcion, type EstadoSubida } from "./acciones";

type Area = { id: string; nombre: string; procesos: { id: string; codigo: string; nombre: string }[] };

const campo = "h-11 w-full rounded-lg border border-borde-input bg-pagina px-3 text-sm";
const etiqueta = "block text-sm font-bold text-titulo";

function Paso({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-media bg-lavanda p-5">
      <legend className="sr-only">{titulo}</legend>
      <p className="flex items-center gap-3 font-bold text-titulo" aria-hidden>
        <span className="grid size-7 place-items-center rounded-full bg-primario text-sm text-white">{n}</span>
        {titulo}
      </p>
      {children}
    </fieldset>
  );
}

export function FormularioSubida({ areas, areaInicial, procesoInicial }: { areas: Area[]; areaInicial?: string; procesoInicial?: string }) {
  const [estado, accion, enviando] = useActionState<EstadoSubida, FormData>(subirTranscripcion, null);
  const [areaId, setAreaId] = useState(areaInicial ?? areas[0]?.id ?? "nueva");
  const [procesoId, setProcesoId] = useState(procesoInicial ?? "nuevo");
  const [archivo, setArchivo] = useState<string | null>(null);
  const procesos = areas.find((a) => a.id === areaId)?.procesos ?? [];

  return (
    <form action={accion} className="space-y-5">
      <Paso n={1} titulo="¿De qué área y proceso es la reunión?">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="areaId" className={etiqueta}>
              Área
            </label>
            <select
              id="areaId"
              name="areaId"
              value={areaId}
              onChange={(e) => {
                setAreaId(e.target.value);
                setProcesoId("nuevo");
              }}
              className={campo}
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
              <option value="nueva">+ Nueva área</option>
            </select>
            {areaId === "nueva" && (
              <input name="areaNueva" required placeholder="Nombre del área, p. ej. Gestión Humana" className={campo} />
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="procesoId" className={etiqueta}>
              Proceso
            </label>
            <select id="procesoId" name="procesoId" value={procesoId} onChange={(e) => setProcesoId(e.target.value)} className={campo}>
              <option value="nuevo">+ Nuevo proceso</option>
              {procesos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} · {p.nombre}
                </option>
              ))}
            </select>
            {procesoId === "nuevo" ? (
              <input name="procesoNuevo" required placeholder="Nombre del proceso, p. ej. Pago de incapacidades" className={campo} />
            ) : (
              <p className="text-xs text-texto-suave">Se agregará como una nueva sesión de este proceso.</p>
            )}
          </div>
        </div>
      </Paso>

      <Paso n={2} titulo="Sube la transcripción de Teams">
        <label
          htmlFor="archivo"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-media border-2 border-dashed border-borde-input bg-pagina p-8 text-center hover:border-primario"
        >
          <Icono nombre="upload" className="text-3xl text-primario" />
          <span className="font-bold text-titulo">{archivo ?? "Elige el archivo"}</span>
          <span className="text-sm text-texto-suave">
            En Teams: reunión → Resumen → Transcripción → Descargar (.docx o .vtt)
          </span>
          <input
            id="archivo"
            name="archivo"
            type="file"
            required
            accept=".vtt,.docx,.txt"
            className="sr-only"
            onChange={(e) => setArchivo(e.target.files?.[0]?.name ?? null)}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="titulo" className={etiqueta}>
              Título de la sesión <span className="font-normal text-texto-suave">(opcional)</span>
            </label>
            <input id="titulo" name="titulo" placeholder="Levantamiento con el área" className={campo} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="fecha" className={etiqueta}>
              Fecha de la reunión
            </label>
            <input id="fecha" name="fecha" type="date" className={campo} />
          </div>
        </div>
      </Paso>

      <Paso n={3} titulo="Confirma y procesa">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="procesar" defaultChecked className="mt-0.5 size-4 accent-[var(--cf-primary)]" />
          <span>
            <span className="font-bold text-titulo">Procesar con IA apenas se suba.</span>{" "}
            <span className="text-texto-suave">La IA propone la ficha, actividades, casuísticas y pendientes en 1 a 3 minutos.</span>
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="clave" className="sr-only">
            Clave del piloto
          </label>
          <input
            id="clave"
            name="clave"
            type="password"
            required
            autoComplete="off"
            placeholder="Clave del piloto"
            className={`${campo} min-w-0 flex-1 sm:max-w-xs`}
          />
          <button
            type="submit"
            disabled={enviando}
            className="h-11 rounded-full bg-primario px-8 text-sm font-bold text-white hover:bg-primario-hover disabled:opacity-60"
          >
            {enviando ? "Subiendo…" : "Subir transcripción"}
          </button>
        </div>
        {estado?.error && <p className="rounded-lg bg-error-suave px-3 py-2 text-sm text-error">{estado.error}</p>}
      </Paso>
    </form>
  );
}

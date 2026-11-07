"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  cambiarEstadoHallazgo,
  editarValor,
  marcarRevision,
} from "@/app/procesos/[codigo]/acciones";
import { Icono } from "@/components/icono";
import {
  CAMPOS_FICHA,
  CATEGORIAS_DIAGNOSTICO,
  TIPOS_HALLAZGO,
  type CampoFichaClave,
  type Certeza as TipoCerteza,
  type Cita,
  type EstadoRevision,
  type Levantamiento,
  type Revision,
} from "@/lib/ia/esquemas";
import { formatoMinuto } from "@/lib/transcripcion/vtt";

type SegmentoVista = { orden: number; inicio: number; hablante: string; texto: string };
type SesionVista = { numero: number; titulo: string; segmentos: SegmentoVista[] };

type Props = {
  codigo: string;
  levantamiento: Levantamiento;
  revision: Revision;
  sesiones: SesionVista[];
};

// Piezas pequeñas ---------------------------------------------------------------

const ESTILO_CERTEZA: Record<TipoCerteza, string> = {
  confirmado: "bg-exito-suave text-exito",
  inferido: "bg-info-suave text-info",
  pendiente: "bg-alerta-suave text-alerta",
};

function Certeza({ valor }: { valor: TipoCerteza }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${ESTILO_CERTEZA[valor]}`}>
      {valor[0].toUpperCase() + valor.slice(1)}
    </span>
  );
}

function Citas({ citas, sesiones, onCita }: { citas: Cita[]; sesiones: SesionVista[]; onCita: (c: Cita) => void }) {
  if (!citas.length) return null;
  const varias = sesiones.length > 1;
  return (
    <span className="flex flex-wrap gap-1">
      {citas.map((c) => {
        const seg = sesiones.find((s) => s.numero === c.sesion)?.segmentos.find((s) => s.orden === c.segmento);
        return (
          <button
            key={`${c.sesion}-${c.segmento}`}
            type="button"
            onClick={() => onCita(c)}
            title={seg ? `${seg.hablante}: ${seg.texto}` : "Segmento no encontrado"}
            className="inline-flex items-center gap-1 rounded-md border border-borde-baldosa bg-baldosa px-1.5 py-0.5 font-mono text-[11px] text-terciario hover:border-primario hover:text-primario"
          >
            <Icono nombre="quote-left" className="text-[9px]" />
            {varias && `S${c.sesion} · `}
            {seg ? formatoMinuto(seg.inicio) : `#${c.segmento}`}
          </button>
        );
      })}
    </span>
  );
}

function AccionesRevision({ codigo, clave, estado }: { codigo: string; clave: string; estado?: EstadoRevision }) {
  const [pendiente, iniciar] = useTransition();
  const marcar = (e: EstadoRevision | null) => iniciar(() => marcarRevision(codigo, clave, e));

  if (estado) {
    const texto = { aceptado: "Aceptado", rechazado: "Rechazado", editado: "Corregido" }[estado];
    const color = { aceptado: "text-exito", rechazado: "text-error", editado: "text-info" }[estado];
    return (
      <span className="flex items-center gap-2 text-xs">
        <span className={`font-bold ${color}`}>{texto}</span>
        <button type="button" disabled={pendiente} onClick={() => marcar(null)} className="text-texto-tenue hover:text-primario">
          <Icono nombre="undo" /> <span className="sr-only">Deshacer</span>
        </button>
      </span>
    );
  }
  return (
    <span className="flex gap-1">
      <button
        type="button"
        disabled={pendiente}
        onClick={() => marcar("aceptado")}
        aria-label="Aceptar"
        title="Aceptar"
        className="grid size-8 place-items-center rounded-full border border-borde text-texto-suave hover:border-exito hover:bg-exito-suave hover:text-exito"
      >
        <Icono nombre="check" />
      </button>
      <button
        type="button"
        disabled={pendiente}
        onClick={() => marcar("rechazado")}
        aria-label="Rechazar"
        title="Rechazar"
        className="grid size-8 place-items-center rounded-full border border-borde text-texto-suave hover:border-error hover:bg-error-suave hover:text-error"
      >
        <Icono nombre="times" />
      </button>
    </span>
  );
}

/** Texto que se corrige en el sitio: lápiz → campo → Enter guarda, Esc cancela. */
function Editable({
  codigo,
  clave,
  ruta,
  valor,
  vacio = "Sin dato",
  className = "",
}: {
  codigo: string;
  clave: string;
  ruta: string;
  valor: string | null;
  vacio?: string;
  className?: string;
}) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(valor ?? "");
  const [pendiente, iniciar] = useTransition();

  if (editando) {
    const guardar = () =>
      iniciar(async () => {
        await editarValor(codigo, clave, ruta, texto);
        setEditando(false);
      });
    return (
      <span className="flex w-full gap-2">
        <input
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") guardar();
            if (e.key === "Escape") setEditando(false);
          }}
          className="h-9 min-w-0 flex-1 rounded-lg border border-borde-input px-2 text-sm"
        />
        <button
          type="button"
          disabled={pendiente}
          onClick={guardar}
          className="rounded-full bg-primario px-4 text-xs font-bold text-white hover:bg-primario-hover"
        >
          Guardar
        </button>
      </span>
    );
  }
  return (
    <span className={`group/editable inline ${className}`}>
      {valor ?? <span className="italic text-texto-tenue">{vacio}</span>}{" "}
      <button
        type="button"
        onClick={() => {
          setTexto(valor ?? "");
          setEditando(true);
        }}
        aria-label="Corregir"
        className="text-texto-tenue opacity-60 hover:text-primario group-hover/editable:opacity-100"
      >
        <Icono nombre="pencil-alt" className="text-xs" />
      </button>
    </span>
  );
}

function Seccion({ id, titulo, conteo, children }: { id: string; titulo: string; conteo?: number; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 space-y-3">
      <h2 className="flex items-baseline gap-2 text-[23px] leading-[30px] font-bold text-titulo">
        {titulo}
        {conteo !== undefined && <span className="text-base font-medium text-texto-tenue">{conteo}</span>}
      </h2>
      {children}
    </section>
  );
}

const atenuado = (estado?: EstadoRevision) => (estado === "rechazado" ? "opacity-50 line-through" : "");

// Panel de transcripción ------------------------------------------------------

function PanelTranscripcion({
  sesiones,
  cita,
  activa,
  setActiva,
}: {
  sesiones: SesionVista[];
  cita: Cita | null;
  activa: number;
  setActiva: (n: number) => void;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const sesion = sesiones.find((s) => s.numero === activa) ?? sesiones[0];

  useEffect(() => {
    if (!cita || cita.sesion !== activa) return;
    const el = contenedor.current?.querySelector<HTMLElement>(`[data-orden="${cita.segmento}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [cita, activa]);

  return (
    <aside className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-media border border-borde bg-pagina lg:sticky lg:top-4">
      <header className="space-y-2 border-b border-borde p-4">
        <h2 className="flex items-center gap-2 font-bold text-titulo">
          <Icono nombre="file-alt1" className="text-primario" /> Transcripción
        </h2>
        {sesiones.length > 1 && (
          <div className="flex gap-1" role="tablist">
            {sesiones.map((s) => (
              <button
                key={s.numero}
                role="tab"
                aria-selected={s.numero === activa}
                onClick={() => setActiva(s.numero)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  s.numero === activa ? "bg-primario text-white" : "bg-baldosa text-terciario hover:text-primario"
                }`}
              >
                Sesión {s.numero}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-texto-suave">Toca una cita para ver dónde se dijo.</p>
      </header>
      <div ref={contenedor} className="overflow-y-auto px-4 py-2">
        <ol className="divide-y divide-borde">
          {sesion?.segmentos.map((s) => {
            const marcado = cita?.sesion === sesion.numero && cita.segmento === s.orden;
            return (
              <li
                key={s.orden}
                data-orden={s.orden}
                className={`grid grid-cols-[3.25rem_1fr] gap-2 py-2 text-[13px] leading-5 transition-colors ${
                  marcado ? "-mx-2 rounded-lg bg-primario-suave px-2" : ""
                }`}
              >
                <span className="pt-px font-mono text-[11px] text-texto-tenue">{formatoMinuto(s.inicio)}</span>
                <p>
                  <span className="font-bold text-titulo">{s.hablante}: </span>
                  {s.texto}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}

// Vista principal -------------------------------------------------------------

export function RevisionLevantamiento({ codigo, levantamiento: l, revision, sesiones }: Props) {
  const [cita, setCita] = useState<Cita | null>(null);
  const [activa, setActiva] = useState(sesiones.at(-1)?.numero ?? 1);
  // Una cita nueva aunque sea la misma: así un segundo clic vuelve a desplazar el panel.
  const verCita = (c: Cita) => {
    setActiva(c.sesion);
    setCita({ ...c });
  };
  const [pendienteHallazgo, iniciar] = useTransition();

  const campos = Object.keys(CAMPOS_FICHA) as CampoFichaClave[];
  const conteo = { confirmado: 0, inferido: 0, pendiente: 0 };
  for (const k of campos) conteo[l.ficha[k].certeza]++;
  const abiertos = l.hallazgos.filter((h) => h.estado === "abierto").length;
  const contradicciones = l.hallazgos.filter((h) => h.tipo === "contradiccion" && h.estado === "abierto").length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="min-w-0 space-y-10">
        {/* Resumen */}
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Campos confirmados", `${conteo.confirmado}/${campos.length}`],
            ["Actividades", l.actividades.length],
            ["Pendientes abiertos", abiertos],
            ["Contradicciones", contradicciones],
          ].map(([t, v]) => (
            <div key={t} className="rounded-baldosa border border-borde-baldosa bg-baldosa p-3">
              <dt className="text-xs text-texto-suave">{t}</dt>
              <dd className="text-[23px] leading-[30px] font-bold text-titulo">{v}</dd>
            </div>
          ))}
        </dl>

        <nav className="flex flex-wrap gap-2 text-sm">
          {[
            ["ficha", "Ficha"],
            ["actividades", "Actividades"],
            ["casuisticas", "Casuísticas"],
            ["diagnostico", "Diagnóstico"],
            ["pendientes", "Pendientes"],
          ].map(([id, t]) => (
            <a key={id} href={`#${id}`} className="rounded-full border border-borde-input px-3 py-1 font-medium text-primario hover:bg-primario-suave">
              {t}
            </a>
          ))}
        </nav>

        <Seccion id="ficha" titulo="Ficha del proceso">
          <ul className="divide-y divide-borde rounded-media border border-borde">
            {campos.map((k) => {
              const c = l.ficha[k];
              const clave = `ficha.${k}`;
              return (
                <li key={k} className={`grid gap-2 p-4 sm:grid-cols-[10rem_1fr_auto] ${atenuado(revision[clave])}`}>
                  <span className="text-sm font-bold text-titulo">{CAMPOS_FICHA[k]}</span>
                  <div className="min-w-0 space-y-1.5 text-sm">
                    <Editable codigo={codigo} clave={clave} ruta={`ficha.${k}.valor`} valor={c.valor} vacio="No se mencionó" />
                    {c.nota && <p className="text-xs text-texto-suave">{c.nota}</p>}
                    <div className="flex flex-wrap items-center gap-2">
                      <Certeza valor={c.certeza} />
                      <Citas citas={c.citas} sesiones={sesiones} onCita={verCita} />
                    </div>
                  </div>
                  <AccionesRevision codigo={codigo} clave={clave} estado={revision[clave]} />
                </li>
              );
            })}
          </ul>
        </Seccion>

        <Seccion id="actividades" titulo="Actividades" conteo={l.actividades.length}>
          <ol className="space-y-3">
            {l.actividades.map((a, i) => {
              const clave = `actividades.${i}`;
              return (
                <li key={clave} className={`space-y-2 rounded-media bg-lavanda p-4 ${atenuado(revision[clave])}`}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-lg bg-primario px-2 py-0.5 text-xs font-bold text-white">{a.secuencia}</span>
                    <div className="min-w-0 flex-1 font-bold text-titulo">
                      <Editable codigo={codigo} clave={clave} ruta={`actividades.${i}.nombre`} valor={a.nombre} />
                    </div>
                    <AccionesRevision codigo={codigo} clave={clave} estado={revision[clave]} />
                  </div>
                  <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                    {(
                      [
                        ["responsable", "Responsable"],
                        ["sistema", "Sistema"],
                        ["transaccion", "Transacción"],
                        ["insumo", "Insumo"],
                        ["salida", "Salida"],
                      ] as const
                    ).map(([campo, t]) => (
                      <div key={campo} className="flex gap-1.5">
                        <dt className="text-texto-suave">{t}:</dt>
                        <dd className="min-w-0">
                          <Editable codigo={codigo} clave={clave} ruta={`actividades.${i}.${campo}`} valor={a[campo]} vacio="—" />
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="flex flex-wrap items-center gap-2">
                    <Certeza valor={a.certeza} />
                    <Citas citas={a.citas} sesiones={sesiones} onCita={verCita} />
                  </div>
                </li>
              );
            })}
          </ol>
        </Seccion>

        <Seccion id="casuisticas" titulo="Casuísticas" conteo={l.casuisticas.length}>
          <ul className="divide-y divide-borde rounded-media border border-borde">
            {l.casuisticas.map((c, i) => {
              const clave = `casuisticas.${i}`;
              return (
                <li key={clave} className={`space-y-1.5 p-4 text-sm ${atenuado(revision[clave])}`}>
                  <div className="flex items-start gap-3">
                    {c.secuenciaActividad && (
                      <span className="mt-0.5 rounded-lg bg-baldosa px-2 py-0.5 text-xs font-bold text-terciario">
                        {c.secuenciaActividad}
                      </span>
                    )}
                    <p className="min-w-0 flex-1">
                      <span className="font-bold text-titulo">Si </span>
                      <Editable codigo={codigo} clave={clave} ruta={`casuisticas.${i}.condicion`} valor={c.condicion} />
                    </p>
                    <AccionesRevision codigo={codigo} clave={clave} estado={revision[clave]} />
                  </div>
                  <p className="text-texto-suave">
                    <span className="font-medium text-texto">Entonces: </span>
                    <Editable codigo={codigo} clave={clave} ruta={`casuisticas.${i}.tratamiento`} valor={c.tratamiento} />
                    {c.frecuencia && <span> · Frecuencia: {c.frecuencia}</span>}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Certeza valor={c.certeza} />
                    <Citas citas={c.citas} sesiones={sesiones} onCita={verCita} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Seccion>

        <Seccion id="diagnostico" titulo="Diagnóstico" conteo={l.diagnostico.length}>
          <ul className="grid gap-3 md:grid-cols-2">
            {l.diagnostico.map((d, i) => {
              const clave = `diagnostico.${i}`;
              return (
                <li key={clave} className={`space-y-2 rounded-media border border-borde p-4 text-sm ${atenuado(revision[clave])}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-primario">{CATEGORIAS_DIAGNOSTICO[d.categoria]}</span>
                    <AccionesRevision codigo={codigo} clave={clave} estado={revision[clave]} />
                  </div>
                  <p>{d.descripcion}</p>
                  <Citas citas={d.citas} sesiones={sesiones} onCita={verCita} />
                </li>
              );
            })}
          </ul>
        </Seccion>

        <Seccion id="pendientes" titulo="Pendientes y hallazgos" conteo={abiertos}>
          {(Object.keys(TIPOS_HALLAZGO) as (keyof typeof TIPOS_HALLAZGO)[]).map((tipo) => {
            const items = l.hallazgos.map((h, i) => ({ ...h, i })).filter((h) => h.tipo === tipo);
            if (!items.length) return null;
            return (
              <div key={tipo} className="space-y-2">
                <h3 className="text-sm font-bold text-titulo">{TIPOS_HALLAZGO[tipo]}</h3>
                <ul className="space-y-2">
                  {items.map((h) => (
                    <li
                      key={h.i}
                      className={`flex items-start gap-3 rounded-baldosa border p-3 text-sm ${
                        h.estado === "resuelto" ? "border-borde text-texto-tenue" : "border-borde-baldosa bg-baldosa"
                      }`}
                    >
                      <button
                        type="button"
                        disabled={pendienteHallazgo}
                        onClick={() =>
                          iniciar(() => cambiarEstadoHallazgo(codigo, h.i, h.estado === "resuelto" ? "abierto" : "resuelto"))
                        }
                        aria-label={h.estado === "resuelto" ? "Reabrir" : "Marcar resuelto"}
                        title={h.estado === "resuelto" ? "Reabrir" : "Marcar resuelto"}
                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border ${
                          h.estado === "resuelto" ? "border-exito bg-exito text-white" : "border-borde-input bg-pagina"
                        }`}
                      >
                        {h.estado === "resuelto" && <Icono nombre="check" className="text-[10px]" />}
                      </button>
                      <div className="min-w-0 space-y-1.5">
                        <p className={h.estado === "resuelto" ? "line-through" : "text-texto"}>{h.texto}</p>
                        <Citas citas={h.citas} sesiones={sesiones} onCita={verCita} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Seccion>
      </div>

      <PanelTranscripcion sesiones={sesiones} cita={cita} activa={activa} setActiva={setActiva} />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Icono } from "@/components/icono";
import { DiagramaArea } from "@/components/mapa/diagrama-area";
import { TIPOS_INCONSISTENCIA } from "@/lib/ia/mapa";
import { cargarArea, matriz } from "@/lib/mapa/servicio";
import { BotonIntegrar } from "./boton-integrar";

export const maxDuration = 300;

const ESTADO: Record<string, string> = {
  borrador_ia: "borrador IA",
  en_revision: "en revisión",
  validado: "validado",
  publicado: "publicado",
};

function Matriz({ titulo, filas, codigos }: { titulo: string; filas: [string, Record<string, number>][]; codigos: string[] }) {
  if (!filas.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-[23px] leading-[30px] font-bold text-titulo">{titulo}</h2>
      <div className="overflow-x-auto rounded-media border border-borde">
        <table className="w-full text-sm">
          <thead className="bg-baldosa">
            <tr>
              <th className="p-3 text-left font-bold text-titulo" />
              {codigos.map((c) => (
                <th key={c} className="p-3 text-center text-xs font-bold whitespace-nowrap text-primario">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {filas.map(([nombre, conteo]) => (
              <tr key={nombre}>
                <td className="p-3 text-titulo">{nombre}</td>
                {codigos.map((c) => (
                  <td key={c} className="p-3 text-center">
                    {conteo[c] ? (
                      <span className="inline-grid size-7 place-items-center rounded-full bg-primario-suave text-xs font-bold text-primario">
                        {conteo[c]}
                      </span>
                    ) : (
                      <span className="text-texto-tenue">·</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-texto-suave">Número de actividades de cada proceso.</p>
    </section>
  );
}

async function MapaArea({ params }: PageProps<"/areas/[codigo]">) {
  await connection();
  const { codigo } = await params;
  const datos = await cargarArea(codigo);
  if (!datos) notFound();
  const { area, procesos, mapa } = datos;
  const codigos = procesos.map((p) => p.codigo);
  const m = mapa?.contenido.mapa;
  const conLevantamiento = procesos.filter((p) => p.levantamiento).length;

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-primario hover:text-primario-hover">
          <Icono nombre="arrow-left" /> Procesos
        </Link>
        <p className="text-lg font-bold text-primario">Mapa del área</p>
        <h1 className="text-[33px] leading-[43px] font-bold text-titulo">{area.nombre}</h1>
        <p className="text-texto-suave">
          {procesos.length} procesos · {conLevantamiento} con levantamiento
          {mapa && ` · mapa versión ${mapa.version} del ${mapa.creadoEn.toLocaleDateString("es-CO", { dateStyle: "medium" })}`}
        </p>
      </div>

      {conLevantamiento >= 2 ? (
        <BotonIntegrar codigo={area.codigo} hayMapa={Boolean(mapa)} />
      ) : (
        <p className="rounded-media bg-alerta-suave p-5 text-sm text-alerta">
          Para integrar el área se necesitan al menos dos procesos con levantamiento. Procesa las transcripciones con IA
          primero.
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-[23px] leading-[30px] font-bold text-titulo">Cómo se conectan los procesos</h2>
        <DiagramaArea
          procesos={procesos.map((p) => ({
            codigo: p.codigo,
            nombre: p.nombre,
            estado: p.estadoLevantamiento ? ESTADO[p.estadoLevantamiento] : "sin levantamiento",
            actividades: p.levantamiento?.actividades.length ?? 0,
          }))}
          relaciones={(m?.relaciones ?? []).map((r) => ({ origen: r.origen, destino: r.destino, objeto: r.objeto, certeza: r.certeza }))}
        />
        <p className="text-xs text-texto-suave">
          Línea continua: relación confirmada en las reuniones. Punteada: deducida por la IA. Toca un proceso para abrirlo.
        </p>
        {m && m.relaciones.length > 0 && (
          <ul className="grid gap-2 md:grid-cols-2">
            {m.relaciones.map((r, i) => (
              <li key={i} className="rounded-baldosa border border-borde p-3 text-sm">
                <p className="font-bold text-titulo">
                  {r.origen} <Icono nombre="arrow-right" className="text-xs text-primario" /> {r.destino}
                </p>
                <p>{r.objeto}</p>
                <p className="mt-1 text-xs text-texto-suave">{r.evidencia}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {m && (
        <section className="space-y-3">
          <h2 className="flex items-baseline gap-2 text-[23px] leading-[30px] font-bold text-titulo">
            Inconsistencias entre procesos
            <span className="text-base font-medium text-texto-tenue">{m.inconsistencias.length}</span>
          </h2>
          {m.inconsistencias.length ? (
            <ul className="space-y-2">
              {m.inconsistencias.map((x, i) => (
                <li key={i} className="flex gap-3 rounded-baldosa border border-borde-baldosa bg-baldosa p-4 text-sm">
                  <Icono nombre="exclamation-triangle" className="mt-0.5 text-alerta" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primario">
                      {TIPOS_INCONSISTENCIA[x.tipo]} · {x.procesos.join(", ")}
                    </p>
                    <p>{x.descripcion}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-texto-suave">La IA no encontró inconsistencias.</p>
          )}
          {m.rolesEquivalentes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-titulo">Roles que parecen ser el mismo</h3>
              <ul className="space-y-1 text-sm">
                {m.rolesEquivalentes.map((r) => (
                  <li key={r.nombre}>
                    <span className="font-bold">{r.nombre}:</span> {r.variantes.join(" · ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <Matriz titulo="Quién participa en qué proceso" filas={matriz(procesos, "responsable")} codigos={codigos} />
      <Matriz titulo="Qué sistemas usa cada proceso" filas={matriz(procesos, "sistema")} codigos={codigos} />
    </div>
  );
}

export default function Pagina(props: PageProps<"/areas/[codigo]">) {
  return (
    <Suspense fallback={<p className="text-texto-suave">Cargando mapa…</p>}>
      <MapaArea {...props} />
    </Suspense>
  );
}

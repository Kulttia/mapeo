"use client";

import "@xyflow/react/dist/style.css";
import { Background, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react";
import { useRouter } from "next/navigation";

export type NodoProceso = { codigo: string; nombre: string; estado: string; actividades: number };
export type RelacionVista = { origen: string; destino: string; objeto: string; certeza: "confirmado" | "inferido" };

const ANCHO = 224;
const ALTO = 92;
const LADOS = [
  { id: "t", pos: Position.Top },
  { id: "r", pos: Position.Right },
  { id: "b", pos: Position.Bottom },
  { id: "l", pos: Position.Left },
] as const;

function TarjetaProceso({ data }: NodeProps<Node<NodoProceso>>) {
  return (
    <div className="w-56 rounded-baldosa border border-borde-baldosa bg-pagina p-3 shadow-[0_.5px_5px_rgba(48,48,48,.2)]">
      {LADOS.map((l) => (
        <Handle key={`s${l.id}`} id={`s${l.id}`} type="source" position={l.pos} className="!size-1.5 !border-0 !bg-transparent" />
      ))}
      {LADOS.map((l) => (
        <Handle key={`t${l.id}`} id={`t${l.id}`} type="target" position={l.pos} className="!size-1.5 !border-0 !bg-transparent" />
      ))}
      <p className="text-xs font-bold text-primario">{data.codigo}</p>
      <p className="text-sm leading-snug font-bold text-titulo">{data.nombre}</p>
      <p className="mt-1 text-xs text-texto-suave">
        {data.actividades} actividades · {data.estado}
      </p>
    </div>
  );
}

const tipos = { proceso: TarjetaProceso };

/** Procesos en círculo: así ninguna relación, aunque vaya y vuelva, cruza por encima de otro proceso. */
function ubicar(procesos: NodoProceso[]) {
  const n = procesos.length;
  if (n === 1) return new Map([[procesos[0].codigo, { x: 0, y: 0 }]]);
  const radio = Math.max(220, n * 70);
  return new Map(
    procesos.map((p, i) => {
      const angulo = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return [p.codigo, { x: Math.cos(angulo) * radio * 1.35, y: Math.sin(angulo) * radio }];
    }),
  );
}

/** Lado del nodo que mira hacia el otro. */
function lado(desde: { x: number; y: number }, hacia: { x: number; y: number }) {
  const dx = hacia.x - desde.x;
  const dy = hacia.y - desde.y;
  if (Math.abs(dx) * ALTO > Math.abs(dy) * ANCHO) return dx > 0 ? "r" : "l";
  return dy > 0 ? "b" : "t";
}

/** Una línea por par de procesos; si la relación va en ambos sentidos, flecha en los dos extremos. */
function agrupar(relaciones: RelacionVista[]) {
  const pares = new Map<string, { a: string; b: string; ida: number; vuelta: number; objetos: string[]; confirmado: boolean }>();
  for (const r of relaciones) {
    const [a, b] = [r.origen, r.destino].sort();
    const clave = `${a}|${b}`;
    const par = pares.get(clave) ?? { a, b, ida: 0, vuelta: 0, objetos: [], confirmado: false };
    if (r.origen === a) par.ida++;
    else par.vuelta++;
    par.objetos.push(r.objeto);
    par.confirmado ||= r.certeza === "confirmado";
    pares.set(clave, par);
  }
  return [...pares.values()];
}

const corto = (t: string, n = 34) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);

export function DiagramaArea({ procesos, relaciones }: { procesos: NodoProceso[]; relaciones: RelacionVista[] }) {
  const router = useRouter();
  const pos = ubicar(procesos);
  const nodes: Node<NodoProceso>[] = procesos.map((p) => ({
    id: p.codigo,
    type: "proceso",
    position: pos.get(p.codigo)!,
    data: p,
    // Tamaño inicial conocido: las flechas se dibujan aunque el nodo aún no se haya medido.
    initialWidth: ANCHO,
    initialHeight: ALTO,
  }));

  const flecha = { type: MarkerType.ArrowClosed, color: "#db0061" };
  const edges: Edge[] = agrupar(relaciones).map((par) => {
    const [origen, destino] = par.ida ? [par.a, par.b] : [par.b, par.a];
    const pa = pos.get(origen)!;
    const pb = pos.get(destino)!;
    const total = par.ida + par.vuelta;
    // Las líneas que cruzan por el centro se pisan entre sí: van sin etiqueta (el detalle está en la lista).
    const porElCentro = Math.hypot((pa.x + pb.x) / 2, (pa.y + pb.y) / 2) < 60;
    return {
      id: `${par.a}-${par.b}`,
      source: origen,
      target: destino,
      sourceHandle: `s${lado(pa, pb)}`,
      targetHandle: `t${lado(pb, pa)}`,
      label: porElCentro ? undefined : total > 1 ? `${total} relaciones` : corto(par.objetos[0]),
      type: "default",
      markerEnd: flecha,
      markerStart: par.ida && par.vuelta ? flecha : undefined,
      style: { stroke: "#db0061", strokeWidth: 1.5, strokeDasharray: par.confirmado ? undefined : "6 4" },
      labelStyle: { fontSize: 11, fill: "#303030", fontWeight: 500 },
      labelBgStyle: { fill: "#fdf3f7" },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 6,
    };
  });

  return (
    <div className="h-[480px] overflow-hidden rounded-media border border-borde bg-lavanda">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={tipos}
        fitView
        fitViewOptions={{ padding: 0.15, minZoom: 0.2 }}
        minZoom={0.2}
        nodesConnectable={false}
        onNodeClick={(_, n) => router.push(`/procesos/${n.id}`)}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#daddf5" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

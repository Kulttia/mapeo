"use client";

import "@xyflow/react/dist/style.css";
import { Background, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react";
import { useRouter } from "next/navigation";

export type NodoProceso = { codigo: string; nombre: string; estado: string; actividades: number };
export type RelacionVista = { origen: string; destino: string; objeto: string; certeza: "confirmado" | "inferido" };

function TarjetaProceso({ data }: NodeProps<Node<NodoProceso>>) {
  return (
    <div className="w-56 rounded-baldosa border border-borde-baldosa bg-pagina p-3 shadow-[0_.5px_5px_rgba(48,48,48,.2)]">
      <Handle type="target" position={Position.Left} className="!bg-primario" />
      <p className="text-xs font-bold text-primario">{data.codigo}</p>
      <p className="text-sm leading-snug font-bold text-titulo">{data.nombre}</p>
      <p className="mt-1 text-xs text-texto-suave">
        {data.actividades} actividades · {data.estado}
      </p>
      <Handle type="source" position={Position.Right} className="!bg-primario" />
    </div>
  );
}

const tipos = { proceso: TarjetaProceso };

/** Columnas por nivel: un proceso va una columna a la derecha de todo lo que lo alimenta. */
function ubicar(procesos: NodoProceso[], relaciones: RelacionVista[]) {
  // Sin relaciones todavía: cuadrícula de tres columnas.
  if (!relaciones.length) return procesos.map((p, i) => ({ codigo: p.codigo, x: (i % 3) * 300, y: Math.floor(i / 3) * 150 }));
  const nivel = new Map(procesos.map((p) => [p.codigo, 0]));
  for (let i = 0; i < procesos.length; i++) {
    for (const r of relaciones) {
      const n = (nivel.get(r.origen) ?? 0) + 1;
      if (n > (nivel.get(r.destino) ?? 0) && n < procesos.length) nivel.set(r.destino, n);
    }
  }
  const filas = new Map<number, number>();
  return procesos.map((p) => {
    const col = nivel.get(p.codigo) ?? 0;
    const fila = filas.get(col) ?? 0;
    filas.set(col, fila + 1);
    return { codigo: p.codigo, x: col * 320, y: fila * 150 + (col % 2) * 40 };
  });
}

export function DiagramaArea({ procesos, relaciones }: { procesos: NodoProceso[]; relaciones: RelacionVista[] }) {
  const router = useRouter();
  const posiciones = ubicar(procesos, relaciones);
  const nodes: Node<NodoProceso>[] = procesos.map((p) => {
    const pos = posiciones.find((x) => x.codigo === p.codigo)!;
    // Tamaño inicial conocido: las flechas se dibujan aunque el nodo aún no se haya medido.
    return { id: p.codigo, type: "proceso", position: { x: pos.x, y: pos.y }, data: p, initialWidth: 224, initialHeight: 92 };
  });
  const edges: Edge[] = relaciones.map((r, i) => ({
    id: `r${i}`,
    source: r.origen,
    target: r.destino,
    label: r.objeto.length > 42 ? `${r.objeto.slice(0, 40)}…` : r.objeto,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#db0061" },
    style: { stroke: "#db0061", strokeWidth: 1.5, strokeDasharray: r.certeza === "inferido" ? "6 4" : undefined },
    labelStyle: { fontSize: 11, fill: "#303030" },
    labelBgStyle: { fill: "#fdf3f7" },
  }));

  return (
    <div className="h-[460px] overflow-hidden rounded-media border border-borde bg-lavanda">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={tipos}
        fitView
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

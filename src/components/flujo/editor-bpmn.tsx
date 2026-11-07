"use client";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import type Modeler from "bpmn-js/lib/Modeler";
import { useEffect, useRef, useState, useTransition } from "react";
import { guardarFlujo } from "@/app/procesos/[codigo]/flujo/acciones";
import { Icono } from "@/components/icono";

function descargar(nombre: string, contenido: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const a = Object.assign(document.createElement("a"), { href: url, download: nombre });
  a.click();
  URL.revokeObjectURL(url);
}

const boton =
  "inline-flex h-10 items-center gap-2 rounded-full border-2 border-primario px-4 text-sm font-bold text-primario hover:bg-primario hover:text-white disabled:opacity-50";

/** Editor BPMN (bpmn-js). Las ediciones se guardan como versión nueva del flujo. */
export function EditorBpmn({ codigo, xml }: { codigo: string; xml: string }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const modeler = useRef<Modeler | null>(null);
  const [cambios, setCambios] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { default: BpmnModeler } = await import("bpmn-js/lib/Modeler");
      if (!vivo || !contenedor.current) return;
      const m = new BpmnModeler({ container: contenedor.current });
      modeler.current = m;
      try {
        await m.importXML(xml);
        (m.get("canvas") as { zoom: (z: string) => void }).zoom("fit-viewport");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo dibujar el diagrama.");
      }
      (m.get("eventBus") as { on: (e: string, f: () => void) => void }).on("commandStack.changed", () => setCambios(true));
    })();
    // Reencuadra cuando cambia el ancho (giro de pantalla, ventana redimensionada).
    const observador = new ResizeObserver(() => {
      const canvas = modeler.current?.get("canvas") as { resized: () => void; zoom: (z: string) => void } | undefined;
      canvas?.resized();
      canvas?.zoom("fit-viewport");
    });
    if (contenedor.current) observador.observe(contenedor.current);
    return () => {
      vivo = false;
      observador.disconnect();
      modeler.current?.destroy();
      modeler.current = null;
    };
  }, [xml]);

  const xmlActual = async () => (await modeler.current!.saveXML({ format: true })).xml ?? "";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={boton}
          disabled={!cambios || guardando}
          onClick={() =>
            iniciar(async () => {
              const r = await guardarFlujo(codigo, await xmlActual());
              if (r?.error) setError(r.error);
              else setCambios(false);
            })
          }
        >
          <Icono nombre="check" /> {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          className={boton}
          onClick={async () => descargar(`${codigo}.bpmn`, await xmlActual(), "application/xml")}
        >
          <Icono nombre="download" /> Descargar .bpmn
        </button>
        <button
          type="button"
          className={boton}
          onClick={async () => {
            const { svg } = await modeler.current!.saveSVG();
            descargar(`${codigo}.svg`, svg, "image/svg+xml");
          }}
        >
          <Icono nombre="file-image1" /> Descargar imagen
        </button>
        {cambios && <span className="text-xs text-alerta">Tienes cambios sin guardar</span>}
      </div>
      {error && <p className="rounded-lg bg-error-suave px-3 py-2 text-sm text-error">{error}</p>}
      <div ref={contenedor} className="h-[640px] overflow-hidden rounded-media border border-borde bg-pagina" />
      <p className="text-xs text-texto-suave">
        Arrastra para moverte, usa la rueda para acercar. La paleta de la izquierda agrega tareas, compuertas y eventos. El
        archivo .bpmn se abre en Bizagi Modeler (Archivo → Importar → BPMN).
      </p>
    </div>
  );
}

import { Icono } from "./icono";

type Estado = "borrador_ia" | "en_revision" | "validado" | "publicado" | null;

const ETIQUETA: Record<NonNullable<Estado>, string> = {
  borrador_ia: "Borrador IA",
  en_revision: "En revisión",
  validado: "Validado",
  publicado: "Publicado",
};

/** Los tres pasos de cada proceso: Levantar → Modelar → Integrar. */
export function PasosProceso({
  sesiones,
  levantamiento,
  modelo,
}: {
  sesiones: number;
  levantamiento: Estado;
  modelo: Estado;
}) {
  const pasos = [
    {
      nombre: "Levantar",
      icono: "microphone",
      detalle: sesiones ? (levantamiento ? ETIQUETA[levantamiento] : "Transcripción lista") : "Sin sesiones",
      activo: sesiones > 0,
    },
    { nombre: "Modelar", icono: "code-branch", detalle: modelo ? ETIQUETA[modelo] : "Pendiente", activo: Boolean(modelo) },
    { nombre: "Integrar", icono: "sitemap", detalle: "Pendiente", activo: false },
  ];

  return (
    <ol className="grid grid-cols-3 gap-2">
      {pasos.map((p) => (
        <li
          key={p.nombre}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
            p.activo ? "border-primario bg-pagina text-titulo" : "border-borde-baldosa bg-pagina text-texto-tenue"
          }`}
        >
          <Icono nombre={p.icono} className={`text-base ${p.activo ? "text-primario" : "text-texto-tenue"}`} />
          <span className="min-w-0">
            <span className="block font-bold">{p.nombre}</span>
            <span className="block truncate">{p.detalle}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

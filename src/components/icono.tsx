/** Un glifo de la fuente de íconos Comfama. Nombres en src/app/icons.css. */
export function Icono({ nombre, className = "" }: { nombre: string; className?: string }) {
  return <i className={`cf-icon icon-${nombre} ${className}`} aria-hidden />;
}

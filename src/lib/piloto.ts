/**
 * La app del piloto es pública y no tiene login todavía: toda acción que crea datos
 * o gasta API exige la clave del piloto (MAPEO_CLAVE_PILOTO).
 */
export function verificarClavePiloto(clave: FormDataEntryValue | null): string | null {
  const esperada = process.env.MAPEO_CLAVE_PILOTO;
  if (!esperada) return "Esta acción no está habilitada en este entorno (falta MAPEO_CLAVE_PILOTO).";
  if (typeof clave !== "string" || clave !== esperada) return "Clave del piloto incorrecta.";
  return null;
}

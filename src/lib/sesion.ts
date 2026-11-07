/**
 * Inicio de sesión simulado del piloto: un solo usuario de prueba y una cookie firmada.
 * No reemplaza el inicio de sesión real de Comfama (Microsoft Entra ID), que llega después.
 * Usa Web Crypto para funcionar igual en el proxy y en las acciones del servidor.
 */

export const COOKIE_SESION = "mapeo_sesion";
export const DURACION_SESION_S = 8 * 60 * 60; // una jornada

export function credencialesPiloto() {
  return {
    usuario: process.env.MAPEO_USUARIO || "prueba",
    clave: process.env.MAPEO_CLAVE || "prueba",
  };
}

function secreto() {
  return process.env.MAPEO_SECRETO_SESION || process.env.MAPEO_CLAVE_PILOTO || "mapeo-desarrollo-local";
}

async function firmar(texto: string) {
  const llave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secreto()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const firma = await crypto.subtle.sign("HMAC", llave, new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(firma), (b) => b.toString(16).padStart(2, "0")).join("");
}

function iguales(a: string, b: string) {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}

export async function crearToken(usuario: string, ahora = Date.now()) {
  const vence = Math.floor(ahora / 1000) + DURACION_SESION_S;
  const cuerpo = `${encodeURIComponent(usuario)}.${vence}`;
  return `${cuerpo}.${await firmar(cuerpo)}`;
}

/** Devuelve el usuario si el token es válido y no ha vencido. */
export async function verificarToken(token: string | undefined, ahora = Date.now()) {
  if (!token) return null;
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  const [usuario, vence, firma] = partes;
  if (!iguales(firma, await firmar(`${usuario}.${vence}`))) return null;
  if (Number(vence) * 1000 < ahora) return null;
  return decodeURIComponent(usuario);
}

export function credencialesValidas(usuario: string, clave: string) {
  const esperadas = credencialesPiloto();
  return iguales(usuario.trim().toLowerCase(), esperadas.usuario.toLowerCase()) && iguales(clave, esperadas.clave);
}

/** Solo rutas internas, para no redirigir a otro sitio. */
export function destinoSeguro(desde: unknown) {
  return typeof desde === "string" && desde.startsWith("/") && !desde.startsWith("//") && !desde.startsWith("/\\")
    ? desde
    : "/";
}

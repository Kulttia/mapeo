"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, DURACION_SESION_S, crearToken, credencialesValidas, destinoSeguro } from "@/lib/sesion";

export type EstadoIngreso = { error: string; usuario: string } | null;

export async function ingresar(_: EstadoIngreso, datos: FormData): Promise<EstadoIngreso> {
  const usuario = String(datos.get("usuario") ?? "");
  const clave = String(datos.get("clave") ?? "");
  if (!credencialesValidas(usuario, clave)) {
    return { error: "El usuario o la contraseña no coinciden. Revisa e intenta de nuevo.", usuario };
  }
  (await cookies()).set(COOKIE_SESION, await crearToken(usuario.trim().toLowerCase()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_S,
  });
  redirect(destinoSeguro(datos.get("desde")));
}

export async function salir() {
  (await cookies()).delete(COOKIE_SESION);
  redirect("/ingresar");
}

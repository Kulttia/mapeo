import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, verificarToken } from "@/lib/sesion";

/** Toda la plataforma pide iniciar sesión, salvo la página de ingreso y los archivos estáticos. */
export async function proxy(request: NextRequest) {
  const usuario = await verificarToken(request.cookies.get(COOKIE_SESION)?.value);
  const { pathname, search } = request.nextUrl;

  if (pathname === "/ingresar") {
    return usuario ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }
  if (usuario) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Inicia sesión para usar Mapeo." }, { status: 401 });
  }
  const destino = new URL("/ingresar", request.url);
  if (pathname !== "/") destino.searchParams.set("desde", pathname + search);
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand/|fonts/|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|webp|ttf|woff2?)$).*)"],
};

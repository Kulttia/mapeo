import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const roboto = localFont({
  variable: "--font-roboto",
  display: "swap",
  src: [
    { path: "./fonts/Roboto-Regular.ttf", weight: "400" },
    { path: "./fonts/Roboto-Medium.ttf", weight: "500" },
    { path: "./fonts/Roboto-Bold.ttf", weight: "700" },
  ],
});

export const metadata: Metadata = {
  title: "Mapeo · Comfama",
  description: "Levantamiento, modelado e integración de procesos a partir de reuniones de Teams.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${roboto.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-borde bg-pagina">
          <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4">
            <Link href="/" className="flex items-center gap-4" aria-label="Mapeo, inicio">
              <Image src="/brand/logo-comfama.svg" alt="Comfama" width={112} height={19} priority />
              <span className="h-6 w-px bg-borde" aria-hidden />
              <span className="text-lg font-bold text-titulo">Mapeo</span>
            </Link>
            <span className="ml-auto rounded-full bg-primario-suave px-3 py-1 text-xs font-medium text-primario">
              Piloto · datos ficticios
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-10">{children}</main>
      </body>
    </html>
  );
}

import { describe, expect, it } from "vitest";
import { crearToken, credencialesValidas, destinoSeguro, verificarToken } from "./sesion";

describe("sesión del piloto", () => {
  it("acepta prueba/prueba por defecto y rechaza otras", () => {
    expect(credencialesValidas("prueba", "prueba")).toBe(true);
    expect(credencialesValidas(" Prueba ", "prueba")).toBe(true);
    expect(credencialesValidas("prueba", "Prueba")).toBe(false);
    expect(credencialesValidas("otro", "prueba")).toBe(false);
  });

  it("valida el token firmado y detecta cambios y vencimiento", async () => {
    const token = await crearToken("prueba");
    expect(await verificarToken(token)).toBe("prueba");
    expect(await verificarToken(token.replace("prueba", "admin"))).toBeNull();
    expect(await verificarToken(token.slice(0, -1) + "0")).toBeNull();
    expect(await verificarToken(token, Date.now() + 9 * 60 * 60 * 1000)).toBeNull();
    expect(await verificarToken(undefined)).toBeNull();
  });

  it("solo redirige a rutas internas", () => {
    expect(destinoSeguro("/procesos/P-FIN-01")).toBe("/procesos/P-FIN-01");
    expect(destinoSeguro("//evil.com")).toBe("/");
    expect(destinoSeguro("https://evil.com")).toBe("/");
    expect(destinoSeguro(undefined)).toBe("/");
  });
});

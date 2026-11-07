import { describe, expect, it } from "vitest";
import { formatoMinuto, parseVtt } from "./vtt";

const MUESTRA = `WEBVTT

3f2a9c1e-1b2c-4d5e-8f90-a1b2c3d4e5f6/12-0
00:00:03.120 --> 00:00:07.450
<v Sara Montoya>Buenos días a todos,
gracias por el espacio.</v>

3f2a9c1e-1b2c-4d5e-8f90-a1b2c3d4e5f6/13-0
01:02:05.000 --> 01:02:09.500
<v Julián Restrepo>Eso se causa por la <i>mi ro</i>.</v>

00:10:00.000 --> 00:10:01.000

`;

describe("parseVtt", () => {
  it("lee hablante, texto y tiempos de los bloques de Teams", () => {
    const s = parseVtt(MUESTRA);
    expect(s).toHaveLength(2);
    expect(s[0]).toMatchObject({ orden: 0, hablante: "Sara Montoya", texto: "Buenos días a todos, gracias por el espacio." });
    expect(s[0].inicio).toBeCloseTo(3.12);
    expect(s[1]).toMatchObject({ hablante: "Julián Restrepo", texto: "Eso se causa por la mi ro." });
    expect(s[1].inicio).toBe(3725);
  });

  it("acepta CRLF y BOM", () => {
    const s = parseVtt("﻿" + MUESTRA.replace(/\n/g, "\r\n"));
    expect(s).toHaveLength(2);
  });
});

describe("formatoMinuto", () => {
  it("formatea mm:ss y h:mm:ss", () => {
    expect(formatoMinuto(125.4)).toBe("02:05");
    expect(formatoMinuto(3725)).toBe("1:02:05");
  });
});

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-032-gta-13-years/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Espera13, portadaEspera, type EstadoEspera } from "../../kit3d/objetos/Espera13";

// "Thirteen years between GTA V (2013) and GTA 6 (2026)": two year cards and thirteen blocks between
// them (the years) lighting up one by one; then the two delays (2025 → May 2026 → November 2026).
// Adaptado de 056-gta-trece-anios.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  trece: r.f(1),
  fechas: r.f(2),
  seis: r.w(2, "six"),
  larga: r.f(3),
  anunc: r.f(4),
  mayo: r.f(5),
  nov: r.f(6),
  cuenta: r.f(7),
  pregunta: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (frame: number, pares: [number, number][]) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of pares) {
    const xx = xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x;
    xs.push(xx);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const AMPLIA = { pos: [0, 2.0, 13.5] as [number, number, number], mira: [0, 1.6, 0] as [number, number, number], fov: 46 };

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 3.4, 11.5], mira: [0, 3.4, 0], fov: 46 },
  { f: E.trece, ...AMPLIA },
  { f: E.seis, pos: [0.2, 2.6, 12.4], mira: [0, 2.8, 0], fov: 46 },
  { f: E.larga, ...AMPLIA },
  { f: E.mayo, pos: [0, 1.4, 12.6], mira: [0, 1.0, 0], fov: 46 },
  { f: E.cuenta, ...AMPLIA },
  { f: E.cta, pos: [0, 2.2, 12.0], mira: [0, 2.2, 0], fov: 46 },
  { f: DURACION, pos: [0, 2.2, 11.8], mira: [0, 2.2, 0], fov: 46 },
];

const estado = (frame: number): EstadoEspera => ({
  frame,
  t13: k(frame, [[2, 0], [14, 1]]),
  t26: k(frame, [[E.seis - 2, 0], [E.seis + 8, 1]]),
  anios: k(frame, [[E.trece, 0], [E.fechas + 70, 13]]),
  ant: k(frame, [[E.anunc, 0], [E.anunc + 10, 1]]),
  p1: k(frame, [[E.mayo + 20, 0], [E.mayo + 30, 1]]),
  p2: k(frame, [[E.nov + 10, 0], [E.nov + 20, 1]]),
  en: true,
});

const DESTACAR = ["thirteen", "GTA", "2013", "2026", "2025", "delays", "Send", "years"];
const CIFRAS: [string, string][] = [
  ["twenty thirteen", "2013"],
  ["twenty twenty-five", "2025"],
  ["twenty twenty-six", "2026"],
  ["thirteen", "13"],
  ["six", "6"],
  ["five", "5"],
  ["two", "2"],
];

const efectos: Efecto[] = [
  [E.trece, "whoosh", 0.35],
  [E.fechas, "tic", 0.5],
  [E.seis, "ding", 0.5],
  [E.larga, "whoosh", 0.35],
  [E.anunc, "sello", 0.6],
  [E.mayo + 20, "sello", 0.6],
  [E.nov + 10, "sello", 0.7],
  [E.cuenta, "ding", 0.5],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const GtaThirteenEn032: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Espera13 e={e} />
        <PisoSombra y={0} opacidad={0.22} />
      </Estudio>
      <Chip desde={E.gancho + 40} hasta={E.trece} x={540} y={640}>
        GTA <span style={{ color: ACENTO }}>V</span> · <span style={{ color: ACENTO }}>2013</span>
      </Chip>
      <Chip desde={E.trece + 4} hasta={E.larga} x={540} y={640}>
        <span style={{ color: ACENTO }}>13 years</span> of waiting
      </Chip>
      <Chip desde={E.anunc + 4} hasta={E.mayo} x={540} y={640}>
        Rockstar · announced for <span style={{ color: ACENTO }}>2025</span>
      </Chip>
      <Chip desde={E.nov + 30} hasta={E.cuenta} x={540} y={640} color="#ff3a2e">
        <span style={{ color: "#ff3a2e" }}>2</span> delays
      </Chip>
      <Chip desde={E.cuenta + 4} hasta={E.pregunta} x={540} y={640}>
        <span style={{ color: ACENTO }}>13 years</span> and 2 months
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={640}>
        How old were <span style={{ color: ACENTO }}>you</span>?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who was already waiting when five came out" />
      <Audio src={staticFile("en-032-gta-13-years/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 3.4, 11.5], mira: [0, 3.0, 0], fov: 46 }];
export const PortadaEn032: React.FC = () => (
  <Portada arriba="GTA V to GTA 6" grande="13 years of waiting" sello="FACT" colorSello={C.azul} numero={32}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Espera13 e={{ ...portadaEspera(), en: true }} />
      <PisoSombra opacidad={0.2} />
    </Estudio>
  </Portada>
);

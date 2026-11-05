import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-024-heat-index/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Calor, type EstadoCalor } from "../../kit3d/objetos/Calor";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Heat index, en 3D (adaptado de 019-sensacion-termica). Los termómetros de Calor.tsx están en una escala
// interna 20–58 (placeholders sin números): 38 = 100 °F, 36 = 96 °F, 51 = 124 °F, 56 = "al sol". Los números
// en °F se ven solo en los chips.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  g0: r.f(0),
  treinta: r.w(0, "one"),
  ocho: r.w(0, "degrees"),
  mucho: r.w(0, "more"),
  s1: r.f(1),
  sudorW: r.w(1, "sweat"),
  s2: r.f(2),
  evaporaW: r.w(2, "evaporates"),
  seco: r.f(3),
  humedo: r.f(4),
  cocinando: r.w(4, "stew"),
  d: r.f(5),
  quince: r.w(5, "fifteen"),
  seis: r.w(5, "ninety"),
  cincuenta: r.w(5, "fifty"),
  uno: r.w(5, "twenty"),
  ojo: r.f(6),
  formula: r.w(6, "calculated"),
  sombra: r.f(7),
  sombraW: r.w(7, "shade"),
  solW: r.w(7, "sun"),
  misma: r.f(8),
  humedadW: r.w(8, "Humidity"),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** interpolación por tramos que tolera frames repetidos (frases muy pegadas) */
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

const ANCHO = 34;
const TOMAS: Toma[] = [
  { f: 0, pos: [-0.2, 1.8, 12.5], mira: [-0.15, 1.35, 0], fov: ANCHO },
  { f: E.mucho + 10, pos: [-0.3, 1.9, 11.2], mira: [-0.25, 1.5, 0], fov: ANCHO },
  { f: E.s1 + 8, pos: [0.4, 1.9, 9.4], mira: [0.5, 1.7, 0], fov: 32 },
  { f: E.s2 + 14, pos: [0.6, 1.9, 6.4], mira: [0.6, 1.8, 0], fov: 30 },
  { f: E.seco - 4, pos: [0.0, 1.8, 11.5], mira: [0, 1.35, 0], fov: ANCHO },
  { f: E.humedo + 30, pos: [0.0, 1.8, 11.0], mira: [0, 1.35, 0], fov: ANCHO },
  { f: E.d, pos: [-0.4, 2.0, 9.4], mira: [-0.35, 1.6, 0], fov: 32 },
  { f: E.uno + 20, pos: [-0.3, 2.0, 9.0], mira: [-0.3, 1.6, 0], fov: 32 },
  { f: E.ojo + 6, pos: [-0.2, 1.9, 11.5], mira: [-0.15, 1.45, 0], fov: ANCHO },
  { f: E.sombra, pos: [0.3, 2.5, 11.5], mira: [0.3, 2.0, 0], fov: ANCHO },
  { f: E.solW + 20, pos: [0.4, 2.4, 11.5], mira: [0.4, 1.9, 0], fov: ANCHO },
  { f: E.misma, pos: [-0.2, 1.8, 12.2], mira: [-0.15, 1.35, 0], fov: ANCHO },
  { f: DURACION, pos: [-0.2, 1.8, 12.5], mira: [-0.15, 1.35, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoCalor => ({
  frame,
  realOn: k(frame, [
    [0, 0],
    [10, 1],
  ]),
  real: k(frame, [
    [0, 20],
    [E.treinta, 20],
    [E.ocho + 6, 38],
  ]),
  sensOn: k(frame, [
    [E.mucho - 6, 0],
    [E.mucho + 8, 1],
  ]),
  sensacion: k(frame, [
    [E.mucho - 6, 38],
    [E.mucho + 30, 50],
    [E.seco, 50],
    [E.seco + 40, 36],
    [E.humedo, 36],
    [E.cocinando, 51],
    [E.quince - 4, 51],
    [E.quince + 16, 36],
    [E.cincuenta - 4, 36],
    [E.cincuenta + 16, 51],
    [E.solW, 51],
    [E.solW + 30, 56],
    [E.misma, 56],
    [E.misma + 14, 36],
    [E.humedadW - 2, 36],
    [E.humedadW + 14, 51],
  ]),
  calculado: k(frame, [
    [E.ojo + 2, 0],
    [E.formula + 4, 1],
  ]),
  humedad: k(frame, [
    [0, 0.3],
    [E.seco - 4, 0.3],
    [E.seco + 8, 0.15],
    [E.humedo, 0.15],
    [E.humedo + 16, 0.55],
    [E.quince - 4, 0.55],
    [E.quince + 8, 0.15],
    [E.cincuenta - 4, 0.15],
    [E.cincuenta + 8, 0.55],
    [E.misma, 0.55],
    [E.misma + 12, 0.15],
    [E.humedadW - 2, 0.15],
    [E.humedadW + 14, 0.55],
  ]),
  sudor: k(frame, [
    [E.s1 + 4, 0],
    [E.s1 + 26, 1],
  ]),
  evap: k(frame, [
    [0, 0.5],
    [E.s2, 0.5],
    [E.seco + 8, 1],
    [E.humedo, 1],
    [E.humedo + 16, 0],
    [E.quince - 4, 0],
    [E.quince + 8, 1],
    [E.cincuenta - 4, 1],
    [E.cincuenta + 8, 0],
    [E.misma, 0],
    [E.misma + 12, 1],
    [E.humedadW - 2, 1],
    [E.humedadW + 14, 0],
  ]),
  piel: k(frame, [
    [E.mucho, 0],
    [E.s1 + 20, 0.55],
    [E.seco + 8, 0.2],
    [E.humedo + 16, 0.8],
    [E.quince + 8, 0.25],
    [E.cincuenta + 8, 0.8],
    [E.solW, 0.8],
    [E.solW + 20, 1],
    [E.misma, 1],
    [E.misma + 12, 0.25],
    [E.humedadW + 14, 0.85],
  ]),
  sol: k(frame, [
    [E.solW - 2, 0.35],
    [E.solW + 12, 1],
    [E.misma, 1],
    [E.misma + 12, 0.35],
  ]),
  sombra: k(frame, [
    [E.sombraW - 4, 0],
    [E.sombraW + 8, 1],
    [E.solW - 8, 1],
    [E.solW, 0],
  ]),
});

const DESTACAR = ["sweat", "evaporates", "dry", "humid", "stew", "calculated", "shade", "sun", "Humidity", "Send", "more"];
const CIFRAS: [string, string][] = [
  ["one hundred twenty-four", "124"],
  ["one hundred", "100"],
  ["fifteen percent", "15 %"],
  ["fifty-five percent", "55 %"],
  ["ninety-six", "96"],
  ["fifteen", "15"],
  ["ninety", "90"],
];

const efectos: Efecto[] = [
  [E.treinta, "tic", 0.5],
  [E.ocho + 6, "ding", 0.5],
  [E.mucho, "whoosh", 0.4],
  [E.sudorW, "pop", 0.4],
  [E.seco, "whoosh", 0.3],
  [E.humedo, "whoosh", 0.3],
  [E.quince, "tic", 0.5],
  [E.seis, "ding", 0.5],
  [E.cincuenta, "tic", 0.5],
  [E.uno, "ding", 0.55],
  [E.formula, "sello", 0.5],
  [E.sombraW, "pop", 0.4],
  [E.solW, "whoosh", 0.4],
  [E.humedadW, "tic", 0.5],
  [E.cta, "whoosh", 0.35],
];

export const HeatIndexEn024: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Calor e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.treinta} hasta={E.mucho - 2} x={540} y={270}>
        Reads <span style={{ color: ACENTO }}>100 °F</span>
      </Chip>
      <Chip desde={E.mucho} hasta={E.s1} x={540} y={270} color="#ff5a4a">
        Feels like <span style={{ color: "#ff8a7a" }}>way more</span>
      </Chip>
      <Chip desde={E.sudorW - 2} hasta={E.s2 - 2} x={540} y={270}>
        It's your <span style={{ color: ACENTO }}>sweat</span>
      </Chip>
      <Chip desde={E.evaporaW - 6} hasta={E.seco - 2} x={540} y={270}>
        If it <span style={{ color: ACENTO }}>evaporates</span>, it cools
      </Chip>
      <Chip desde={E.seco} hasta={E.humedo - 2} x={540} y={270} color="#5fd2ff">
        <span style={{ color: "#5fd2ff" }}>Dry</span> air: cools you
      </Chip>
      <Chip desde={E.humedo} hasta={E.d - 2} x={540} y={270} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>Humid</span> air: you stew
      </Chip>
      <Chip desde={E.quince - 6} hasta={E.cincuenta - 6} x={540} y={270} color="#5fd2ff">
        100 °F · <span style={{ color: "#5fd2ff" }}>15 %</span> humidity
      </Chip>
      <Chip desde={E.cincuenta - 6} hasta={E.ojo - 2} x={540} y={270} color="#ff5a4a">
        100 °F · <span style={{ color: "#ff8a7a" }}>55 %</span> humidity
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.sombra - 2} x={540} y={270}>
        It's <span style={{ color: ACENTO }}>calculated</span>
      </Chip>
      <Chip desde={E.sombraW - 4} hasta={E.solW - 6} x={540} y={270}>
        Values in the <span style={{ color: ACENTO }}>shade</span>
      </Chip>
      <Chip desde={E.solW} hasta={E.misma - 2} x={540} y={270} color="#ff5a4a">
        In <span style={{ color: "#ff8a7a" }}>sun</span>: up to +15 °F
      </Chip>
      <Chip desde={E.misma + 4} hasta={E.cta - 2} x={540} y={270}>
        Same temp, other <span style={{ color: ACENTO }}>humidity</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who says 'it's only ninety'" />
      <Audio src={staticFile("en-024-heat-index/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [-0.1, 1.9, 10.5], mira: [-0.1, 1.5, 0], fov: 34 }];
export const PortadaEn024: React.FC = () => (
  <Portada arriba="why 100° feels like more" grande="the humidity" sello="SCIENCE" colorSello={C.verde} numero={24}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Calor
        e={{
          ...estado(0),
          frame: 20,
          realOn: 1,
          sensOn: 1,
          real: 38,
          sensacion: 51,
          calculado: 0,
          humedad: 0.55,
          sudor: 1,
          evap: 0,
          piel: 0.85,
          sol: 1,
          sombra: 0,
        }}
      />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

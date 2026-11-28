import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/086-perito-moreno/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Glaciar, estadoPortadaGlaciar, type EstadoGlaciar } from "../../kit3d/objetos/Glaciar";

// Mundo: el frente de un glaciar sobre el lago (ilustración). El frente retrocede; una línea roja marca dónde estaba;
// dos barras comparan 0,34 m/año contra 5,5 m/año. Fuente: Koch et al. 2025, Communications Earth & Environment.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  ya: r.f(1),
  decadas: r.f(2),
  estudio: r.f(3),
  lento: r.f(4),
  rapido: r.f(5),
  veces: r.f(6),
  ojo: r.f(7),
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

const ANCHO = { pos: [0, 2.8, 10] as [number, number, number], mira: [0, 0.8, 0] as [number, number, number], fov: 36 };
const FRENTE = { pos: [0.6, 2.2, 9] as [number, number, number], mira: [0, 0.6, 0] as [number, number, number], fov: 36 };
const BARRAS = { pos: [0, 2.0, 8] as [number, number, number], mira: [0, 0.4, 1] as [number, number, number], fov: 36 };
const TOMAS: Toma[] = [
  { f: 0, ...ANCHO },
  { f: E.ya, ...ANCHO },
  { f: E.decadas + 6, pos: [-1.0, 2.5, 9.5], mira: [0, 0.8, 0], fov: 36 },
  { f: E.estudio + 6, ...FRENTE },
  { f: E.lento - 2, ...FRENTE },
  { f: E.lento + 10, ...BARRAS },
  { f: E.veces - 2, ...BARRAS },
  { f: E.veces + 10, ...ANCHO },
  { f: E.ojo + 6, pos: [0.6, 2.6, 9.5], mira: [0, 0.8, 0], fov: 36 },
  { f: DURACION, pos: [0.3, 2.8, 10.5], mira: [0, 0.8, 0], fov: 36 },
];

const estado = (frame: number): EstadoGlaciar => ({
  frame,
  retro: k(frame, [
    [E.ya - 2, 0],
    [E.ya + 40, 0.5],
    [E.decadas, 0.5],
    [E.rapido, 0.5],
    [E.rapido + 40, 1],
  ]),
  linea: k(frame, [[E.ya + 10, 0], [E.ya + 26, 1]]),
  barraA: k(frame, [[E.lento + 4, 0], [E.lento + 24, 1]]),
  barraB: k(frame, [[E.rapido + 4, 0], [E.rapido + 28, 1]]),
  resalta: k(frame, [[E.ojo, 0], [E.ojo + 16, 1], [E.pregunta, 1], [E.pregunta + 12, 0]]),
});

const DESTACAR = ["Perito", "Moreno", "derrite", "estables", "estudio", "centímetros", "metros", "dieciséis", "Ojo:", "enorme", "año", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["dos mil diecinueve", "2019"],
  ["dos mil veinticuatro", "2024"],
  ["dos mil veinticinco", "2025"],
  ["dos mil", "2000"],
  ["treinta y cuatro", "34"],
  ["cinco metros y medio", "5,5 m"],
  ["dieciséis", "16"],
];

const efectos: Efecto[] = [
  [E.gancho, "whoosh", 0.3],
  [E.ya, "scratch", 0.4],
  [E.ya + 26, "ding", 0.4],
  [E.estudio, "whoosh", 0.35],
  [E.lento + 24, "tic", 0.4],
  [E.rapido + 28, "ding", 0.5],
  [E.veces, "sello", 0.4],
  [E.ojo, "pop", 0.35],
  [E.pregunta, "pop", 0.35],
];

export const PeritoMoreno3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Glaciar e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.gancho + 6} hasta={E.ya - 2} x={540} y={300}>
        Perito Moreno · <span style={{ color: ACENTO }}>"estable"</span>
      </Chip>
      <Chip desde={E.ya + 4} hasta={E.decadas - 2} x={540} y={300} color="#ff5a4a">
        Ya no es <span style={{ color: "#ff8a7a" }}>así</span>
      </Chip>
      <Chip desde={E.decadas + 4} hasta={E.estudio - 2} x={540} y={300}>
        Durante décadas · <span style={{ color: ACENTO }}>estable</span>
      </Chip>
      <Chip desde={E.estudio + 4} hasta={E.lento - 2} x={540} y={300}>
        Koch y otros · <span style={{ color: ACENTO }}>2025</span>
      </Chip>
      <Chip desde={E.lento + 2} hasta={E.rapido - 2} x={540} y={300}>
        2000-2019 · <span style={{ color: ACENTO }}>0,34 m/año</span>
      </Chip>
      <Chip desde={E.rapido + 2} hasta={E.veces - 2} x={540} y={300} color="#ff5a4a">
        2019-2024 · <span style={{ color: "#ff8a7a" }}>5,5 m/año</span>
      </Chip>
      <Chip desde={E.veces + 4} hasta={E.ojo - 2} x={540} y={300} color="#ff5a4a">
        Unas <span style={{ color: "#ff8a7a" }}>16 veces</span> más rápido
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.pregunta - 2} x={540} y={300}>
        Sigue ahí · <span style={{ color: ACENTO }}>ya no está quieto</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta - 2} x={540} y={300}>
        ¿Qué <span style={{ color: ACENTO }}>año</span> lo viste?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice que el Perito Moreno va a estar siempre" />
      <Audio src={staticFile("086-perito-moreno/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.6, 10], mira: [0, 0.8, 0], fov: 36 }];
export const Portada086: React.FC = () => (
  <Portada arriba="el glaciar que no se derretía" grande="ya retrocede" sello="DATO" colorSello={C.azul} numero={86}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Glaciar e={estadoPortadaGlaciar()} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

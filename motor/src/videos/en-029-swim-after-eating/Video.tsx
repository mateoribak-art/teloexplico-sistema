import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-029-swim-after-eating/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Pileta, type EstadoPileta } from "../../kit3d/objetos/Pileta";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: el borde de una pileta con un plato y un reloj (la espera) y una persona en el agua con el torso
// translúcido. La sangre va un poco al estómago, brazos y piernas siguen verdes. Cierra con la botella (alcohol).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  evidencia: r.f(1),
  calambre: r.f(2),
  idea: r.f(3),
  musculos: r.f(4),
  cruzroja: r.f(5),
  scouts: r.f(6),
  puntada: r.f(7),
  molesta: r.f(8),
  alcohol: r.f(9),
  cta: r.f(10),
  fin: r.fin(10),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (frame: number, pares: [number, number][]) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of pares) {
    xs.push(xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const ANCHO = 38;
const TOMAS: Toma[] = [
  { f: 0, pos: [0.8, 2.6, 14], mira: [0.8, 0.4, 0], fov: ANCHO },
  { f: E.evidencia, pos: [0.8, 2.2, 12], mira: [0.8, 0.6, 0], fov: 36 },
  { f: E.idea, pos: [1.2, 2.2, 8], mira: [1.2, 0.9, 0], fov: 34 },
  { f: E.cruzroja, pos: [0.8, 2.6, 14], mira: [0.8, 0.4, 0], fov: ANCHO },
  { f: E.scouts, pos: [-1.2, 2.2, 10], mira: [-1.2, 0.5, 0], fov: 35 },
  { f: E.puntada, pos: [1.2, 2.2, 8.5], mira: [1.2, 0.9, 0], fov: 34 },
  { f: E.alcohol, pos: [0.8, 2.6, 13], mira: [0.8, 0.4, 0], fov: 37 },
  { f: DURACION, pos: [0.8, 2.6, 14], mira: [0.8, 0.4, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoPileta => ({
  frame,
  plato: k(frame, [[0, 0.01], [8, 1]]),
  reloj: k(frame, [[2, 0.01], [12, 1], [E.evidencia, 1], [E.evidencia + 8, 0.01]]),
  persona: k(frame, [[E.evidencia, 0.01], [E.evidencia + 14, 1]]),
  sangre: k(frame, [[E.idea, 0], [E.idea + 12, 0.4], [E.musculos, 0.4], [E.cruzroja, 0]]),
  musculos: k(frame, [[E.musculos - 2, 0], [E.musculos + 12, 1], [E.scouts, 1], [E.scouts + 10, 0]]),
  libro: k(frame, [[E.scouts - 2, 0.01], [E.scouts + 12, 1], [E.puntada, 1], [E.puntada + 10, 0.01]]),
  puntada: k(frame, [[E.puntada, 0], [E.puntada + 8, 1], [E.alcohol - 4, 1], [E.alcohol, 0]]),
  botella: k(frame, [[E.alcohol, 0.01], [E.alcohol + 14, 1]]),
});

const DESTACAR = ["evidence", "otherwise", "Red", "Cross", "alcohol", "Heads", "Send"];
const CIFRAS: [string, string][] = [["thirty", "30"], ["nineteen oh eight", "1908"]];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.evidencia, "scratch", 0.4],
  [E.calambre, "pop", 0.35],
  [E.idea, "whoosh", 0.35],
  [E.musculos, "ding", 0.4],
  [E.cruzroja, "pop", 0.4],
  [E.scouts, "tic", 0.35],
  [E.puntada, "pop", 0.35],
  [E.alcohol, "scratch", 0.4],
  [E.cta, "pop", 0.4],
];

export const SwimAfterEatingEn029: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <Pileta e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.evidencia} x={540} y={300}>
        Wait <span style={{ color: ACENTO }}>30 min</span> to swim?
      </Chip>
      <Chip desde={E.evidencia} hasta={E.calambre} x={540} y={300}>
        The evidence says <span style={{ color: ACENTO }}>otherwise</span>
      </Chip>
      <Chip desde={E.calambre} hasta={E.idea} x={540} y={300}>
        No “digestion cramp” <span style={{ color: ACENTO }}>found</span>
      </Chip>
      <Chip desde={E.idea} hasta={E.musculos} x={540} y={300}>
        The old idea: blood <span style={{ color: ACENTO }}>to the stomach</span>
      </Chip>
      <Chip desde={E.musculos} hasta={E.cruzroja} x={540} y={300}>
        Swimmers weren’t <span style={{ color: ACENTO }}>held back</span>
      </Chip>
      <Chip desde={E.cruzroja} hasta={E.scouts} x={540} y={300}>
        American Red Cross · <span style={{ color: ACENTO }}>2011</span>
      </Chip>
      <Chip desde={E.scouts} hasta={E.puntada} x={540} y={300}>
        Often traced to <span style={{ color: ACENTO }}>1908</span>
      </Chip>
      <Chip desde={E.puntada} hasta={E.alcohol} x={540} y={300}>
        Side stitch: <span style={{ color: ACENTO }}>annoying</span>
      </Chip>
      <Chip desde={E.alcohol} hasta={E.cta} x={540} y={300}>
        Save it: <span style={{ color: ACENTO }}>skip the alcohol, not the swim</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who waited on the towel" />
      <Audio src={staticFile("en-029-swim-after-eating/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.6, 13], mira: [0, 0.6, 0], fov: 38 }];
export const PortadaEn029: React.FC = () => (
  <Portada arriba="swim after lunch?" grande="NO NEED TO WAIT" sello="SAYS THE RED CROSS" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Pileta e={{ frame: 40, plato: 1, reloj: 0, persona: 1, sangre: 0.4, musculos: 1, libro: 0, puntada: 0, botella: 0 }} />
    </Estudio>
  </Portada>
);

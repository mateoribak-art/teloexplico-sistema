import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/033-gracias-en-el-mate/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Mate, type EstadoMate } from "../../kit3d/objetos/Mate";

// Mundo: una ronda de mate (cinco personas sin cara en círculo) y un mate con bombilla que viaja de una a otra.
// La persona 2 dice "gracias": se marca con un aro y el mate la saltea. Fuentes: argentina.travel (Día del Mate), Matador (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  reves: r.f(1),
  guarda: r.f(2),
  oficial: r.f(3),
  saltea: r.f(4),
  bombilla: r.f(5),
  ojo: r.f(6),
  probalo: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
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

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 9, 8.5], mira: [0, 0.5, 0], fov: 38 },
  { f: E.reves, pos: [3, 8, 8], mira: [0, 0.5, 0], fov: 38 },
  { f: E.guarda, pos: [0, 11, 5], mira: [0, 0.3, 0], fov: 38 },
  { f: E.oficial, pos: [-3, 8.5, 8], mira: [-1, 0.5, 0], fov: 38 },
  { f: E.saltea, pos: [-4, 8, 7], mira: [-1.5, 0.8, -0.5], fov: 36 },
  { f: E.bombilla, pos: [0, 4.5, 6.5], mira: [0, 0.8, 1.6], fov: 34 },
  { f: E.ojo, pos: [0, 10, 7.5], mira: [0, 0.4, 0], fov: 38 },
  { f: E.probalo, pos: [3, 8, 8], mira: [0, 0.5, 0], fov: 38 },
  { f: DURACION, pos: [0, 9, 8.5], mira: [0, 0.5, 0], fov: 38 },
];

// vuelta: persona 0 → 1 → (2 se saltea) → 3 → 4
const estado = (frame: number): EstadoMate => ({
  frame,
  vuelta: k(frame, [
    [0, 0],
    [E.reves, 1],
    [E.guarda, 1.9],
    [E.oficial, 2.0],
    [E.saltea - 10, 2.0],
    [E.saltea + 40, 3.0],
    [E.bombilla - 4, 3.2],
    [E.cta, 4.2],
  ]),
  gracias: k(frame, [[E.gancho + 40, 0], [E.gancho + 60, 1], [E.guarda, 1], [E.guarda + 10, 0.6], [E.oficial, 1], [E.bombilla, 0.8], [E.ojo, 0]]),
  salteado: k(frame, [[E.saltea, 0], [E.saltea + 6, 1], [E.bombilla, 1], [E.bombilla + 1, 0]]),
  bombilla: k(frame, [[E.bombilla + 20, 0], [E.bombilla + 50, 1], [E.ojo - 20, 1], [E.ojo, 0]]),
  ronda: k(frame, [[0, 0.5], [20, 1]]),
  zoom: k(frame, [[E.bombilla - 4, 0], [E.bombilla + 10, 0.9], [E.ojo - 10, 0.9], [E.ojo, 0]]),
});

const DESTACAR = ["gracias", "mate", "saltea", "bombilla", "Ojo:", "costumbre", "Probalo"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.gancho + 60, "ding", 0.4],
  [E.reves, "whoosh", 0.35],
  [E.guarda, "whoosh", 0.35],
  [E.oficial, "whoosh", 0.35],
  [E.saltea + 6, "pop", 0.45],
  [E.bombilla, "whoosh", 0.35],
  [E.ojo, "pop", 0.4],
  [E.probalo, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const GraciasMate3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <Mate e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.reves} x={540} y={300}>
        <span style={{ color: ACENTO }}>Gracias</span> = no quiero más
      </Chip>
      <Chip desde={E.reves} hasta={E.guarda} x={540} y={300}>
        Al <span style={{ color: ACENTO }}>revés</span> de lo que te enseñaron
      </Chip>
      <Chip desde={E.guarda} hasta={E.oficial} x={540} y={300}>
        El gracias se <span style={{ color: ACENTO }}>guarda</span> para el final
      </Chip>
      <Chip desde={E.oficial} hasta={E.saltea} x={540} y={300}>
        argentina.travel · <span style={{ color: ACENTO }}>Día del Mate</span>
      </Chip>
      <Chip desde={E.saltea} hasta={E.bombilla} x={540} y={300}>
        Te <span style={{ color: ACENTO }}>saltean</span> en la próxima vuelta
      </Chip>
      <Chip desde={E.bombilla} hasta={E.ojo} x={540} y={300}>
        La <span style={{ color: ACENTO }}>bombilla</span> no se mueve
      </Chip>
      <Chip desde={E.ojo} hasta={E.probalo} x={540} y={300}>
        <span style={{ color: ACENTO }}>Costumbre</span>, no ley
      </Chip>
      <Chip desde={E.probalo} hasta={E.cta} x={540} y={300}>
        Guardate el <span style={{ color: ACENTO }}>gracias</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice gracias en cada vuelta" />
      <Audio src={staticFile("033-gracias-en-el-mate/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 4.5, 6.5], mira: [0, 0.9, 0], fov: 36 }];
export const Portada033: React.FC = () => (
  <Portada arriba="en la ronda de mate" grande="no digas gracias" sello="COSTUMBRE" colorSello={C.azul} numero={33}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mate e={{ frame: 40, vuelta: 1.5, gracias: 1, salteado: 1, bombilla: 0, ronda: 1, zoom: 0 }} />
    </Estudio>
  </Portada>
);

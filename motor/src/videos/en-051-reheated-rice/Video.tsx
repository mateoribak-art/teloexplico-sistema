import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-051-reheated-rice/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Arroz, type EstadoArroz } from "../../kit3d/objetos/Arroz";

// World: a pot of rice on the counter. Bacteria (green) multiply while it sits out and leave toxin (red);
// reheating (heat) doesn't remove it. Clock for the 2-hour rule, then the cold container in the fridge. Sources: USDA FSIS, CDC MMWR (see guion.json).
// Adapted from 034-arroz-recalentado.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  nolo: r.f(1),
  esporas: r.f(2),
  toxinas: r.f(3),
  usda: r.f(4),
  heladera: r.f(5),
  ojo: r.f(6),
  pregunta: r.f(7),
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
  { f: 0, pos: [0, 4.5, 7.5], mira: [0, 0.7, 0], fov: 38 },
  { f: E.nolo, pos: [2.5, 3.5, 5.5], mira: [0, 0.8, 0], fov: 34 },
  { f: E.esporas, pos: [0, 5.5, 3.8], mira: [0, 0.8, 0], fov: 34 },
  { f: E.toxinas, pos: [-2, 3.5, 5], mira: [0, 1.1, 0], fov: 34 },
  { f: E.usda, pos: [0, 4.2, 8], mira: [0, 1.2, 0], fov: 40 },
  { f: E.heladera, pos: [0.4, 5, 10], mira: [0.4, 0.6, 0], fov: 40 },
  { f: E.ojo, pos: [0, 4, 9], mira: [0.4, 0.8, 0], fov: 38 },
  { f: E.pregunta, pos: [0, 4.5, 8], mira: [0, 0.7, 0], fov: 38 },
  { f: DURACION, pos: [0, 4.5, 7.5], mira: [0, 0.7, 0], fov: 38 },
];

const estado = (frame: number): EstadoArroz => ({
  frame,
  bact: k(frame, [[E.esporas, 0], [E.toxinas + 60, 1], [E.heladera - 10, 1], [E.heladera + 20, 0.2], [E.ojo, 0.2]]),
  toxina: k(frame, [[E.toxinas, 0], [E.toxinas + 80, 1], [E.heladera - 10, 1], [E.heladera + 20, 0.3], [E.ojo, 0.3]]),
  reloj: k(frame, [[E.usda, 0], [E.usda + 90, 1], [E.heladera, 1], [E.heladera + 20, 0]]),
  calor: k(frame, [[E.gancho + 60, 0], [E.nolo, 1], [E.toxinas + 20, 1], [E.toxinas + 50, 0]]),
  tuper: k(frame, [[E.heladera, 0], [E.heladera + 25, 1], [E.pregunta + 60, 1]]),
  frio: k(frame, [[E.heladera + 10, 0], [E.heladera + 40, 1]]),
  fantasma: k(frame, [[E.esporas - 5, 0], [E.esporas + 15, 1], [E.usda, 0]]),
});

const DESTACAR = ["rice", "spores", "toxin", "USDA", "two hours", "one hour", "three to four days", "Heads up:", "fridge", "counter"];
const CIFRAS: [string, string][] = [
  ["two hours", "2 hours"],
  ["one hour", "1 hour"],
  ["ninety degrees", "90°F"],
  ["three to four days", "3-4 days"],
  ["one sixty-five", "165°F"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.nolo, "scratch", 0.4],
  [E.esporas, "whoosh", 0.35],
  [E.toxinas, "whoosh", 0.35],
  [E.usda, "ding", 0.4],
  [E.heladera, "whoosh", 0.35],
  [E.ojo, "pop", 0.4],
  [E.pregunta, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const ReheatedRiceEn051: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <Arroz e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.nolo} x={540} y={300}>
        All afternoon <span style={{ color: ACENTO }}>on the counter</span>
      </Chip>
      <Chip desde={E.nolo} hasta={E.esporas} x={540} y={300}>
        Reheating <span style={{ color: ACENTO }}>doesn't fix it</span>
      </Chip>
      <Chip desde={E.esporas} hasta={E.toxinas} x={540} y={300}>
        <span style={{ color: ACENTO }}>Spores</span> can survive cooking
      </Chip>
      <Chip desde={E.toxinas} hasta={E.usda} x={540} y={300}>
        Bacteria → <span style={{ color: ACENTO }}>toxin</span>
      </Chip>
      <Chip desde={E.usda} hasta={E.heladera} x={540} y={300}>
        USDA · fridge in <span style={{ color: ACENTO }}>2 hours</span>
      </Chip>
      <Chip desde={E.heladera} hasta={E.ojo} x={540} y={300}>
        Save: <span style={{ color: ACENTO }}>2 h · 3-4 days · 165°F</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.pregunta} x={540} y={300}>
        The problem is the <span style={{ color: ACENTO }}>time out</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={300}>
        How many <span style={{ color: ACENTO }}>hours</span> does yours sit out?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who leaves the rice pot on the counter" />
      <Audio src={staticFile("en-051-reheated-rice/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 4.2, 6.5], mira: [0, 0.8, 0], fov: 36 }];
export const PortadaEn051: React.FC = () => (
  <Portada arriba="reheated rice" grande="doesn't fix it" sello="HEADS UP" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Arroz e={{ frame: 60, bact: 1, toxina: 1, reloj: 0, calor: 0.8, tuper: 0, frio: 0, fantasma: 0 }} />
    </Estudio>
  </Portada>
);

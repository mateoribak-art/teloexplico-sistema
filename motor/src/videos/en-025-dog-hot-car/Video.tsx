import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-025-dog-hot-car/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { AutoCalor, type EstadoAutoCalor } from "../../kit3d/objetos/AutoCalor";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un auto oscuro al sol, de costado, con un perro adentro y un termómetro grande al lado.
// La ventana entreabierta no frena la subida; el interior se pone rojo y el termómetro sube
// (Pediatrics 2005: ~40 °F en una hora, 80 % en la primera media hora, 72–96 °F afuera; ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  rapido: r.f(1),
  estudio: r.f(2),
  cuarenta: r.f(3),
  ochenta: r.f(4),
  ojo: r.f(5),
  hoy: r.f(6),
  cta: r.f(7),
  fin: r.fin(7),
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

const ANCHO = 34;
const TOMAS: Toma[] = [
  { f: 0, pos: [1, 2.8, 20], mira: [1, 1.9, 0], fov: ANCHO },
  { f: E.rapido, pos: [-0.1, 2.2, 12.5], mira: [-0.1, 1.5, 0], fov: 32 },
  { f: E.estudio, pos: [1, 2.8, 20], mira: [1, 1.9, 0], fov: ANCHO },
  { f: E.cuarenta, pos: [2.2, 2.6, 15], mira: [2.2, 2.0, 0], fov: 32 },
  { f: E.ochenta, pos: [1, 2.8, 19], mira: [1, 1.9, 0], fov: ANCHO },
  { f: E.ojo, pos: [-0.1, 2.2, 12], mira: [-0.1, 1.5, 0], fov: 32 },
  { f: E.hoy, pos: [1, 2.8, 20], mira: [1, 1.8, 0], fov: ANCHO },
  { f: E.cta, pos: [1, 2.8, 21], mira: [1, 1.9, 0], fov: ANCHO },
  { f: DURACION, pos: [1, 2.8, 20], mira: [1, 1.9, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoAutoCalor => ({
  frame,
  sol: k(frame, [[0, 1]]),
  calor: k(frame, [[E.rapido - 10, 0.05], [E.cuarenta + 30, 0.6], [E.ochenta + 40, 1], [E.hoy - 6, 1], [E.hoy + 20, 0.2]]),
  ventana: k(frame, [[0, 1]]),
  perro: k(frame, [[0, 1]]),
  jadeo: k(frame, [[E.rapido, 0], [E.cuarenta, 0.6], [E.ochenta, 1], [E.hoy - 6, 1], [E.hoy + 10, 0]]),
  termo: k(frame, [[E.estudio, 0.05], [E.cuarenta + 20, 0.5], [E.ochenta + 20, 1], [E.hoy, 1], [E.hoy + 30, 0.1]]),
  termoOn: k(frame, [[E.estudio - 8, 0], [E.estudio + 8, 1], [E.fin, 1]]),
  puertaFuera: k(frame, [[E.hoy + 10, 0], [E.hoy + 70, 1]]),
});

const DESTACAR = ["minute", "fast", "Pediatrics", "forty", "eighty", "Heads", "heatstroke", "take", "Send"];
const CIFRAS: [string, string][] = [
  ["two thousand five", "2005"],
  ["seventy-two to ninety-six", "72 to 96"],
  ["forty degrees", "40 degrees"],
  ["eighty percent", "80%"],
  ["thirty minutes", "30 minutes"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.rapido, "scratch", 0.4],
  [E.estudio, "pop", 0.4],
  [E.cuarenta, "tic", 0.35],
  [E.ochenta, "ding", 0.4],
  [E.ojo, "pop", 0.4],
  [E.hoy, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const DogHotCarEn025: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <AutoCalor e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.rapido} x={540} y={300}>
        Just a <span style={{ color: ACENTO }}>minute</span>…
      </Chip>
      <Chip desde={E.rapido} hasta={E.estudio} x={540} y={300}>
        Cracked window = <span style={{ color: ACENTO }}>barely helps</span>
      </Chip>
      <Chip desde={E.estudio} hasta={E.cuarenta} x={540} y={300}>
        Pediatrics · U.S. · <span style={{ color: ACENTO }}>2005</span>
      </Chip>
      <Chip desde={E.cuarenta} hasta={E.ochenta} x={540} y={300}>
        72–96°F outside → <span style={{ color: ACENTO }}>+40°F</span> inside
      </Chip>
      <Chip desde={E.ochenta} hasta={E.ojo} x={540} y={300}>
        <span style={{ color: ACENTO }}>80%</span> in the first 30 min
      </Chip>
      <Chip desde={E.ojo} hasta={E.hoy} x={540} y={300}>
        Dog inside: <span style={{ color: ACENTO }}>heatstroke</span> risk
      </Chip>
      <Chip desde={E.hoy} hasta={E.cta} x={540} y={300}>
        Save it: <span style={{ color: ACENTO }}>+40°F in 1 hour</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who leaves the dog in the car" />
      <Audio src={staticFile("en-025-dog-hot-car/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [1, 2.8, 19], mira: [1, 1.9, 0], fov: 36 }];
export const PortadaEn025: React.FC = () => (
  <Portada arriba="dog in the car?" grande="A MINUTE IS TOO LONG" sello="+40°F / HOUR" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <AutoCalor e={{ frame: 40, sol: 1, calor: 0.9, ventana: 1, perro: 1, jadeo: 1, termo: 0.9, termoOn: 1, puertaFuera: 0 }} />
    </Estudio>
  </Portada>
);

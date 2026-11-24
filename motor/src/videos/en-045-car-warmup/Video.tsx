import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-045-car-warmup/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { AutoCalor, type EstadoAutoCalor } from "../../kit3d/objetos/AutoCalor";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un auto oscuro de costado en una mañana helada, con un termómetro grande al lado (azul = frío).
// Sin perro ni sol. Cuando la voz dice que el motor se calienta andando, el interior se entibia.
// Fuente: fueleconomy.gov, Fuel Economy in Cold Weather (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  atras: r.f(1),
  cero: r.f(2),
  treinta: r.f(3),
  quince: r.f(4),
  ojo: r.f(5),
  hoy: r.f(6),
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

const ANCHO = 34;
const TOMAS: Toma[] = [
  { f: 0, pos: [1, 2.8, 20], mira: [1, 1.9, 0], fov: ANCHO },
  { f: E.atras, pos: [-0.1, 2.2, 12.5], mira: [-0.1, 1.5, 0], fov: 32 },
  { f: E.cero, pos: [1, 2.8, 20], mira: [1, 1.9, 0], fov: ANCHO },
  { f: E.treinta, pos: [2.2, 2.6, 15], mira: [2.2, 2.0, 0], fov: 32 },
  { f: E.quince, pos: [1, 2.8, 19], mira: [1, 1.9, 0], fov: ANCHO },
  { f: E.ojo, pos: [-0.1, 2.2, 12], mira: [-0.1, 1.5, 0], fov: 32 },
  { f: E.hoy, pos: [1, 2.8, 20], mira: [1, 1.8, 0], fov: ANCHO },
  { f: E.cta, pos: [1, 2.8, 21], mira: [1, 1.9, 0], fov: ANCHO },
  { f: DURACION, pos: [1, 2.8, 20], mira: [1, 1.9, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoAutoCalor => ({
  frame,
  sol: 0,
  calor: k(frame, [[E.cero, 0], [E.cero + 90, 0.2], [E.treinta + 40, 0.5], [E.hoy, 0.5]]),
  ventana: 0,
  perro: 0,
  jadeo: 0,
  termo: k(frame, [[E.quince - 4, 0.05], [E.quince + 20, 0.0]]),
  termoOn: k(frame, [[E.quince - 8, 0], [E.quince + 8, 1], [E.hoy, 1], [E.hoy + 20, 0]]),
  puertaFuera: 0,
});

const DESTACAR = ["warm", "backwards", "zero", "thirty", "fifteen", "Heads", "Save", "Send", "Yes"];
const CIFRAS: [string, string][] = [
  ["thirty seconds", "30 seconds"],
  ["thirty", "30"],
  ["fifteen percent", "15%"],
  ["twenty degrees", "20°F"],
  ["seventy-seven", "77°F"],
  ["ten minutes", "10 minutes"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.atras, "scratch", 0.4],
  [E.cero, "pop", 0.4],
  [E.treinta, "tic", 0.35],
  [E.treinta + 60, "ding", 0.4],
  [E.quince, "whoosh", 0.35],
  [E.ojo, "pop", 0.4],
  [E.hoy, "whoosh", 0.35],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const CarWarmupEn045: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <AutoCalor e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.atras} x={540} y={300}>
        Warming up the car: <span style={{ color: ACENTO }}>needed?</span>
      </Chip>
      <Chip desde={E.atras} hasta={E.cero} x={540} y={300}>
        Department of Energy: <span style={{ color: ACENTO }}>backwards</span>
      </Chip>
      <Chip desde={E.cero} hasta={E.treinta} x={540} y={300}>
        Idling = <span style={{ color: ACENTO }}>0 mpg</span>
      </Chip>
      <Chip desde={E.treinta} hasta={E.quince} x={540} y={300}>
        Wait <span style={{ color: ACENTO }}>30 seconds</span>, drive gently
      </Chip>
      <Chip desde={E.quince} hasta={E.ojo} x={540} y={300}>
        20°F vs 77°F: <span style={{ color: ACENTO }}>~15% fewer mpg</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.hoy} x={540} y={300}>
        Check your <span style={{ color: ACENTO }}>owner's manual</span>
      </Chip>
      <Chip desde={E.hoy} hasta={E.pregunta} x={540} y={300}>
        Save it: <span style={{ color: ACENTO }}>start · 30 s · go</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={300}>
        Warm up your car: <span style={{ color: ACENTO }}>yes or no?</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who lets the car run ten minutes before leaving" />
      <Audio src={staticFile("en-045-car-warmup/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [1, 2.8, 19], mira: [1, 1.9, 0], fov: 36 }];
export const PortadaEn045: React.FC = () => (
  <Portada arriba="warming up your car?" grande="30 SECONDS IS ENOUGH" sello="DOE SAYS" colorSello={C.azul} numero={45}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <AutoCalor e={{ frame: 40, sol: 0, calor: 0.4, ventana: 0, perro: 0, jadeo: 0, termo: 0, termoOn: 1, puertaFuera: 0 }} />
    </Estudio>
  </Portada>
);

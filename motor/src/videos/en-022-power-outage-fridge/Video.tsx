import React from "react";
import { AbsoluteFill, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-022-power-outage-fridge/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Heladera, type EstadoHeladera } from "../../kit3d/objetos/Heladera";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { useCurrentFrame } from "remotion";

// Power outage: la heladera cerrada guarda el frío unas cuatro horas (USDA); cada vez que abrís la puerta se escapa.
// Reusa el objeto Heladera: puerta que se abre y se cierra, reloj (cuatro horas), freezer con escarcha, tuppers.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mira: r.w(0, "check"),
  cerrada: r.f(1),
  cuatro: r.f(2),
  cuatroW: r.w(2, "four"),
  freezer: r.f(3),
  mitad: r.w(3, "half"),
  ojo: r.f(4),
  termo: r.f(5),
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
    const xx = xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x;
    xs.push(xx);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const ANCHO = 34;
const TOMAS: Toma[] = [
  { f: 0, pos: [-0.5, 2.2, 14], mira: [-0.2, 1.6, 0], fov: ANCHO },
  { f: E.mira, pos: [0.4, 2.2, 10.5], mira: [0.6, 1.8, 0], fov: ANCHO },
  { f: E.cerrada, pos: [0.2, 2.3, 13], mira: [0.0, 1.8, 0], fov: ANCHO },
  { f: E.cuatro + 10, pos: [-0.7, 2.6, 11.5], mira: [-0.4, 2.1, 0], fov: ANCHO },
  { f: E.freezer - 4, pos: [1.2, 3.0, 8.4], mira: [0.9, 2.6, 0], fov: 30 },
  { f: E.ojo - 2, pos: [0.4, 2.3, 12], mira: [0.4, 1.9, 0], fov: ANCHO },
  { f: E.termo, pos: [0.7, 2.2, 9.2], mira: [0.8, 1.9, 0], fov: 32 },
  { f: E.cta, pos: [0.2, 2.4, 14.5], mira: [-0.3, 1.5, 0], fov: ANCHO },
  { f: DURACION, pos: [-0.5, 2.2, 14], mira: [-0.2, 1.6, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoHeladera => ({
  frame,
  puerta: k(frame, [
    [0, 0],
    [E.mira - 10, 0],
    [E.mira + 4, 0.8],
    [E.mira + 22, 0.8],
    [E.mira + 32, 0],
    [E.ojo, 0],
    [E.ojo + 14, 0.7],
    [E.termo - 4, 0.7],
    [E.termo + 8, 0],
    [E.fin, 0],
  ]),
  fantasmaPuerta: k(frame, [[E.cerrada, 0], [E.cerrada + 10, 0.8], [E.cuatro + 40, 0.8], [E.freezer, 0]]),
  ollaT: 0,
  tapa: 1,
  vapor: 0,
  tuppers: k(frame, [[0, 1]]),
  freezerT: 0,
  papel: 0,
  reloj: k(frame, [[E.cuatroW - 6, 0], [E.freezer - 6, 2]]),
  relojOn: k(frame, [[E.cuatro, 0], [E.cuatro + 12, 1], [E.freezer + 6, 1], [E.freezer + 20, 0]]),
  dias: 0,
  escarcha: k(frame, [[E.freezer - 4, 0], [E.freezer + 10, 1], [E.ojo, 1], [E.ojo + 12, 0]]),
});

const DESTACAR = ["shut", "four", "CDC", "forty-eight", "twenty-four", "Heads", "thermometer", "today", "Send"];
const CIFRAS: [string, string][] = [
  ["forty-eight", "48"],
  ["twenty-four", "24"],
  ["four", "4"],
  ["ten", "10"],
];

const efectos: Efecto[] = [
  [E.mira, "pop", 0.4],
  [E.cerrada, "scratch", 0.45],
  [E.cuatro, "whoosh", 0.35],
  [E.cuatroW, "ding", 0.4],
  [E.freezer, "whoosh", 0.35],
  [E.mitad, "pop", 0.4],
  [E.ojo, "sello", 0.5],
  [E.termo, "pop", 0.4],
  [E.hoy, "tic", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const PowerOutageEn022: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Heladera e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.gancho + 14} hasta={E.cerrada} x={540} y={300} color="#ff5a4a">
        Power out · <span style={{ color: "#ff8a7a" }}>door open</span>
      </Chip>
      <Chip desde={E.cerrada + 6} hasta={E.cuatro} x={540} y={300}>
        Every peek: <span style={{ color: ACENTO }}>cold escapes</span>
      </Chip>
      <Chip desde={E.cuatroW - 4} hasta={E.freezer} x={540} y={300} color="#5fd2ff">
        Closed fridge: about <span style={{ color: "#5fd2ff" }}>4 hours</span>
      </Chip>
      <Chip desde={E.freezer + 4} hasta={E.ojo} x={540} y={300} color="#5fd2ff">
        Freezer: <span style={{ color: "#5fd2ff" }}>48 h full · 24 h half</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.termo} x={540} y={300} color="#ff5a4a">
        No taste <span style={{ color: "#ff8a7a" }}>test</span>
      </Chip>
      <Chip desde={E.termo + 6} hasta={E.hoy} x={540} y={300}>
        Fridge <span style={{ color: ACENTO }}>thermometer</span>
      </Chip>
      <Chip desde={E.hoy + 4} hasta={E.cta} x={540} y={300}>
        Do it <span style={{ color: ACENTO }}>today</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who opens the fridge every ten minutes in a blackout" />
      <Audio src={staticFile("en-022-power-outage-fridge/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.4, 2.4, 11.5], mira: [0.5, 1.8, 0], fov: 38 }];
export const PortadaEn022: React.FC = () => (
  <Portada arriba="power's out. keep it shut." grande="4 hours" sello="CDC" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Heladera
        e={{ frame: 0, puerta: 0, fantasmaPuerta: 0, ollaT: 0, tapa: 1, vapor: 0, tuppers: 1, freezerT: 0, papel: 0, reloj: 1, relojOn: 1, dias: 0, escarcha: 1 }}
      />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

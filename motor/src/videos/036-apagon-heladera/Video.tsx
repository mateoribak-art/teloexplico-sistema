import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/036-apagon-heladera/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Heladera, type EstadoHeladera } from "../../kit3d/objetos/Heladera";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: la heladera de siempre (kit3d). Apagón: se abre la puerta y se escapa el frío (escarcha azul se apaga);
// cerrada, un reloj cuenta cuatro horas (USDA FSIS / FoodSafety.gov, ver guion.json); pasado ese tiempo los tuppers se tiran.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  escapa: r.f(1),
  cuatro: r.f(2),
  cuatroW: r.w(2, "cuatro"),
  tira: r.f(3),
  duda: r.f(4),
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
  { f: 0, pos: [-0.3, 2.4, 13], mira: [-0.2, 1.7, 0], fov: ANCHO },
  { f: E.escapa, pos: [0.6, 2.6, 9], mira: [0.9, 1.9, 0], fov: 32 },
  { f: E.cuatro, pos: [-0.3, 2.5, 12], mira: [-0.2, 1.9, 0], fov: ANCHO },
  { f: E.cuatroW + 20, pos: [-1.2, 2.6, 9.5], mira: [-1.1, 2.2, 0], fov: 32 },
  { f: E.tira, pos: [0.7, 2.3, 9.5], mira: [0.9, 2.0, 0], fov: 32 },
  { f: E.duda, pos: [0.4, 2.4, 12], mira: [0.3, 1.9, 0], fov: ANCHO },
  { f: E.ojo, pos: [0.8, 2.5, 8.8], mira: [0.9, 1.9, 0], fov: 32 },
  { f: E.hoy, pos: [-0.3, 2.5, 12], mira: [-0.2, 1.9, 0], fov: ANCHO },
  { f: E.cta, pos: [0.2, 2.4, 14.5], mira: [-0.3, 1.6, 0], fov: ANCHO },
  { f: DURACION, pos: [-0.3, 2.4, 13], mira: [-0.2, 1.7, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoHeladera => ({
  frame,
  puerta: k(frame, [
    [0, 0],
    [8, 1],
    [E.escapa + 70, 1],
    [E.cuatro - 6, 0],
    [E.ojo - 4, 0],
    [E.ojo + 8, 1],
    [E.ojo + 70, 1],
    [E.hoy - 6, 0],
  ]),
  fantasmaPuerta: k(frame, [[E.cuatro - 6, 0], [E.cuatro + 8, 0.85], [E.ojo, 0.85], [E.ojo + 8, 0], [E.hoy - 6, 0], [E.hoy + 8, 0.85]]),
  ollaT: 0,
  tapa: 1,
  vapor: 0,
  tuppers: k(frame, [[0, 1]]),
  freezerT: 0,
  papel: 0,
  reloj: k(frame, [[E.cuatro, 0], [E.tira - 10, 2], [E.fin, 2]]),
  relojOn: k(frame, [[E.cuatro, 0], [E.cuatro + 12, 1], [E.fin, 1]]),
  dias: 0,
  escarcha: k(frame, [[0, 1], [E.escapa - 6, 1], [E.escapa + 50, 0.1], [E.cuatro + 6, 0.1], [E.cuatro + 30, 1], [E.ojo, 1], [E.ojo + 50, 0.15], [E.hoy, 0.6]]),
});

const DESTACAR = ["cerrada", "cuatro horas", "4 horas", "tirala", "Ojo:", "puerta", "heladera", "frío", "Mandáselo"];
const CIFRAS: [string, string][] = [["cuatro horas", "4 horas"], ["cuatro", "4"], ["mil veces", "mil veces"]];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.escapa, "scratch", 0.4],
  [E.cuatro, "ding", 0.4],
  [E.tira, "whoosh", 0.35],
  [E.duda, "pop", 0.4],
  [E.ojo, "pop", 0.4],
  [E.hoy, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const ApagonHeladera3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <Heladera e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.escapa} x={540} y={300}>
        Apagón: ¿la <span style={{ color: ACENTO }}>abrís</span>?
      </Chip>
      <Chip desde={E.escapa} hasta={E.cuatro} x={540} y={300}>
        Abierta = se escapa el <span style={{ color: ACENTO }}>frío</span>
      </Chip>
      <Chip desde={E.cuatro} hasta={E.tira} x={540} y={300}>
        USDA · EE. UU. · cerrada: hasta <span style={{ color: ACENTO }}>4 horas</span>
      </Chip>
      <Chip desde={E.tira} hasta={E.duda} x={540} y={300}>
        Pasadas las <span style={{ color: ACENTO }}>4 h</span>: se tira
      </Chip>
      <Chip desde={E.duda} hasta={E.ojo} x={540} y={300}>
        Ante la duda, <span style={{ color: ACENTO }}>tirala</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.hoy} x={540} y={300}>
        Vale con la puerta <span style={{ color: ACENTO }}>cerrada</span>
      </Chip>
      <Chip desde={E.hoy} hasta={E.cta} x={540} y={300}>
        Guardalo: <span style={{ color: ACENTO }}>cerrada · 4 horas</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que abre la heladera en cada apagón" />
      <Audio src={staticFile("036-apagon-heladera/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.2, 2.5, 10], mira: [0.2, 1.9, 0], fov: 36 }];
export const Portada036: React.FC = () => (
  <Portada arriba="apagón" grande="no la abras" sello="4 HORAS" colorSello={C.azul} numero={36}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Heladera
        e={{ frame: 60, puerta: 0, fantasmaPuerta: 0.8, ollaT: 0, tapa: 1, vapor: 0, tuppers: 1, freezerT: 0, papel: 0, reloj: 2, relojOn: 1, dias: 0, escarcha: 1 }}
      />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-044-wet-hair/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { PeloMojado, type EstadoPeloMojado } from "../../kit3d/objetos/PeloMojado";

// Mundo: una persona sin cara con el pelo mojado, fondo oscuro. Los virus flotan alrededor y se acercan
// cuando la voz habla del virus; el pelo mojado solo gotea. Adaptado de 032-pelo-mojado-resfrio.
// Fuentes: CDC y Cardiff 2005 (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mom: r.f(1),
  cdc: r.f(2),
  cardiff: r.f(3),
  ojo: r.f(4),
  manos: r.f(5),
  pregunta: r.f(6),
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

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 2.0, 7.5], mira: [0, 1.7, 0], fov: 34 },
  { f: E.mom, pos: [0.3, 2.5, 5.5], mira: [0, 2.4, 0], fov: 34 },
  { f: E.cdc, pos: [0, 2.0, 8.0], mira: [0, 1.8, 0], fov: 34 },
  { f: E.cardiff, pos: [0, 1.5, 8.0], mira: [0, 1.3, 0], fov: 34 },
  { f: E.ojo, pos: [0, 2.0, 7.5], mira: [0, 1.7, 0], fov: 34 },
  { f: E.manos, pos: [0, 2.0, 7.5], mira: [0, 1.7, 0], fov: 34 },
  { f: E.pregunta, pos: [0.3, 2.5, 5.5], mira: [0, 2.4, 0], fov: 34 },
  { f: DURACION, pos: [0, 2.0, 8.0], mira: [0, 1.7, 0], fov: 34 },
];

const estado = (frame: number): EstadoPeloMojado => ({
  frame,
  gotas: k(frame, [[0, 1], [E.cdc - 10, 1], [E.cdc, 0.4], [E.cardiff - 10, 0.4], [E.cardiff, 0.3]]),
  virus: k(frame, [[E.mom + 20, 0], [E.cdc + 30, 1], [E.cardiff - 4, 1], [E.cardiff + 10, 0], [E.manos - 4, 0], [E.manos + 20, 0.6], [E.pregunta - 6, 0.6], [E.pregunta + 10, 0]]),
  acerca: k(frame, [[E.cdc, 0], [E.cdc + 60, 0.5], [E.cardiff - 4, 0.8], [E.cardiff + 8, 0]]),
  frio: k(frame, [[E.cardiff, 0], [E.cardiff + 40, 0.9], [E.ojo, 0.9], [E.manos, 0]]),
  campera: 0,
});

const DESTACAR = ["virus", "hair", "wet", "hundred", "Cardiff", "Thirteen", "five", "Heads", "hands", "dryer"];
const CIFRAS: [string, string][] = [
  ["two hundred", "200"],
  ["two thousand five", "2005"],
  ["ninety", "90"],
  ["Thirteen", "13"],
  ["five", "5"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.mom, "whoosh", 0.35],
  [E.cdc, "whoosh", 0.35],
  [E.cdc + 30, "ding", 0.4],
  [E.cardiff, "whoosh", 0.35],
  [E.cardiff + 120, "ding", 0.45],
  [E.ojo, "pop", 0.4],
  [E.manos, "whoosh", 0.35],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const WetHairEn044: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <PeloMojado e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.mom} x={540} y={300}>
        A cold is a <span style={{ color: ACENTO }}>virus</span>
      </Chip>
      <Chip desde={E.mom} hasta={E.cdc} x={540} y={300}>
        "<span style={{ color: ACENTO }}>Dry</span> your hair!"
      </Chip>
      <Chip desde={E.cdc} hasta={E.cardiff} x={540} y={300}>
        CDC: <span style={{ color: ACENTO }}>200+ viruses</span>
      </Chip>
      <Chip desde={E.cardiff} hasta={E.ojo} x={540} y={300}>
        Cardiff 2005: <span style={{ color: ACENTO }}>13 of 90</span> vs 5 of 90
      </Chip>
      <Chip desde={E.ojo} hasta={E.manos} x={540} y={300}>
        It was <span style={{ color: ACENTO }}>feet</span>, not hair
      </Chip>
      <Chip desde={E.manos} hasta={E.pregunta} x={540} y={300}>
        Wash your <span style={{ color: ACENTO }}>hands</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={300}>
        Hair dryer chase: <span style={{ color: ACENTO }}>yes or no?</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend whose mom still chases them with a hair dryer" />
      <Audio src={staticFile("en-044-wet-hair/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.2, 6.0], mira: [0, 1.8, 0], fov: 34 }];
export const PortadaEn044: React.FC = () => (
  <Portada arriba="wet hair = a cold?" grande="a virus does" sello="MYTH" colorSello={C.azul} numero={44}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <PeloMojado e={{ frame: 40, gotas: 1, virus: 0.7, acerca: 0.3, frio: 0, campera: 0 }} />
    </Estudio>
  </Portada>
);

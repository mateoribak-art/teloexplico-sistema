import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/032-pelo-mojado-resfrio/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { PeloMojado, type EstadoPeloMojado } from "../../kit3d/objetos/PeloMojado";

// Mundo: una persona sin cara con el pelo mojado, en fondo oscuro. Los virus (bolitas con púas) flotan alrededor
// y se acercan cuando la voz habla del virus; el pelo mojado solo gotea. Fuentes: CDC y Cardiff 2005 (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  vieja: r.f(1),
  cdc: r.f(2),
  sin: r.f(3),
  cardiff: r.f(4),
  ojo: r.f(5),
  manos: r.f(6),
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
  { f: E.vieja, pos: [0.3, 2.5, 5.5], mira: [0, 2.4, 0], fov: 34 },
  { f: E.cdc, pos: [0, 2.0, 8.0], mira: [0, 1.8, 0], fov: 34 },
  { f: E.sin, pos: [0, 2.5, 5.2], mira: [0, 2.4, 0], fov: 34 },
  { f: E.cardiff, pos: [0, 1.5, 8.0], mira: [0, 1.3, 0], fov: 34 },
  { f: E.ojo, pos: [0, 2.0, 7.5], mira: [0, 1.7, 0], fov: 34 },
  { f: E.manos, pos: [0, 2.0, 7.5], mira: [0, 1.7, 0], fov: 34 },
  { f: DURACION, pos: [0, 2.0, 8.0], mira: [0, 1.7, 0], fov: 34 },
];

const estado = (frame: number): EstadoPeloMojado => ({
  frame,
  gotas: k(frame, [[0, 1], [E.cdc - 10, 1], [E.cdc, 0.4], [E.sin, 1], [E.cardiff, 0.3]]),
  virus: k(frame, [[E.vieja + 20, 0], [E.cdc + 30, 1], [E.sin + 10, 0], [E.manos - 4, 0], [E.manos + 20, 0.6]]),
  acerca: k(frame, [[E.cdc, 0], [E.cdc + 60, 0.5], [E.sin - 4, 0.8], [E.sin + 8, 0]]),
  frio: k(frame, [[E.cardiff, 0], [E.cardiff + 40, 0.9], [E.ojo, 0.9], [E.manos, 0]]),
  campera: 0,
});

const DESTACAR = ["virus", "pelo", "mojado", "doscientos", "Cardiff", "Trece", "cinco", "Ojo:", "manos", "secador"];
const CIFRAS: [string, string][] = [
  ["doscientos", "200"],
  ["noventa", "90"],
  ["Trece", "13"],
  ["cinco", "5"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.vieja, "whoosh", 0.35],
  [E.cdc, "whoosh", 0.35],
  [E.cdc + 30, "ding", 0.4],
  [E.sin, "whoosh", 0.35],
  [E.cardiff, "whoosh", 0.35],
  [E.cardiff + 120, "ding", 0.45],
  [E.ojo, "pop", 0.4],
  [E.manos, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const PeloMojado3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <PeloMojado e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.vieja} x={540} y={300}>
        El <span style={{ color: ACENTO }}>virus</span>, no el pelo mojado
      </Chip>
      <Chip desde={E.vieja} hasta={E.cdc} x={540} y={300}>
        "¡<span style={{ color: ACENTO }}>Secate</span> el pelo!"
      </Chip>
      <Chip desde={E.cdc} hasta={E.sin} x={540} y={300}>
        CDC: más de <span style={{ color: ACENTO }}>200 virus</span>
      </Chip>
      <Chip desde={E.sin} hasta={E.cardiff} x={540} y={300}>
        Sin virus, <span style={{ color: ACENTO }}>no hay resfrío</span>
      </Chip>
      <Chip desde={E.cardiff} hasta={E.ojo} x={540} y={300}>
        Cardiff 2005: <span style={{ color: ACENTO }}>13 de 90</span> vs 5 de 90
      </Chip>
      <Chip desde={E.ojo} hasta={E.manos} x={540} y={300}>
        Fueron <span style={{ color: ACENTO }}>pies</span>, no pelo
      </Chip>
      <Chip desde={E.manos} hasta={E.cta} x={540} y={300}>
        Lavate las <span style={{ color: ACENTO }}>manos</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo a esa madre que te persigue con el secador" />
      <Audio src={staticFile("032-pelo-mojado-resfrio/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.2, 6.0], mira: [0, 1.8, 0], fov: 34 }];
export const Portada032: React.FC = () => (
  <Portada arriba="¿pelo mojado = resfrío?" grande="lo causa un virus" sello="MITO" colorSello={C.azul} numero={32}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <PeloMojado e={{ frame: 40, gotas: 1, virus: 0.7, acerca: 0.3, frio: 0, campera: 0 }} />
    </Estudio>
  </Portada>
);

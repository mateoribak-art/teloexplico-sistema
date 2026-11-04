import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-020-ac-sixty/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Aire, type EstadoAire } from "../../kit3d/objetos/Aire";

// Adaptado de 008-aire-en-17 (3D). Un aire split en la pared, un termómetro con dos marcas (normal y la baja) y una
// ventana. Mecanismo (ENERGY STAR): el equipo de una velocidad trabaja a pleno mientras el termostato pide frío y
// se apaga al llegar a la temperatura; un número más bajo solo cambia dónde para. Con la ventana abierta puede no llegar.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  catch: r.f(1),
  destino: r.f(2),
  pleno: r.f(3),
  apaga: r.f(4),
  para: r.f(5),
  ojo: r.f(6),
  regla: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
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

const ANCHO: Toma = { f: 0, pos: [0, 2.2, 20], mira: [0, 2.1, 0], fov: 40 };
const TOMAS: Toma[] = [
  { ...ANCHO, f: 0 },
  { f: E.catch, pos: [-0.2, 2.5, 14], mira: [-0.2, 2.3, 0], fov: 40 },
  { f: E.destino, pos: [-1.6, 2.2, 11], mira: [-1.6, 2.2, 0], fov: 40 },
  { f: E.pleno, pos: [0, 3.0, 12], mira: [0, 2.6, 0], fov: 40 },
  { f: E.apaga, pos: [-1.0, 2.2, 13], mira: [-1.0, 2.2, 0], fov: 40 },
  { f: E.para, pos: [0, 2.3, 18], mira: [0, 2.2, 0], fov: 40 },
  { f: E.ojo, pos: [1.3, 2.2, 13], mira: [1.3, 2.1, 0], fov: 40 },
  { ...ANCHO, f: E.regla },
  { ...ANCHO, f: DURACION },
];

const estado = (frame: number): EstadoAire => {
  const temp = k(frame, [
    [E.pleno, 29],
    [E.apaga, 24],
    [E.para - 10, 17],
    [E.ojo - 1, 17],
    [E.ojo, 27],
    [E.regla, 27],
    [E.regla + 30, 24],
  ]);
  return {
    frame,
    temp,
    sopla: k(frame, [[0, 0], [20, 1], [E.cta + 20, 1]]),
    marcas: k(frame, [[E.catch + 20, 0], [E.destino + 10, 1], [E.regla + 30, 1]]),
    ventana: k(frame, [[E.ojo - 1, 0], [E.ojo + 14, 1], [E.regla - 2, 1], [E.regla + 14, 0]]),
    rayo: k(frame, [[E.ojo, 0], [E.ojo + 14, 1], [E.regla, 1], [E.regla + 14, 0]]),
    led: k(frame, [[E.regla + 4, 1], [E.regla + 14, 0]]),
  };
};

const DESTACAR = ["catch:", "destination.", "blast", "stops,", "Heads", "never", "blinds.", "Send"];
const CIFRAS: [string, string][] = [["sixty", "60"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.catch, "scratch", 0.5],
  [r.w(1, "catch:"), "sello", 0.5],
  [E.destino, "whoosh", 0.35],
  [E.pleno, "whoosh", 0.35],
  [r.w(3, "blast"), "tic", 0.5],
  [E.apaga, "whoosh", 0.35],
  [r.w(4, "off"), "ding", 0.5],
  [E.ojo, "sello", 0.55],
  [E.regla, "whoosh", 0.35],
  [r.w(7, "blinds."), "pop", 0.5],
  [E.cta, "whoosh", 0.35],
];

export const AcSixtyEn020: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Aire e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.catch} hasta={E.destino} x={540} y={300}>
        60 doesn't cool <span style={{ color: ACENTO }}>faster</span>
      </Chip>
      <Chip desde={E.destino} hasta={E.pleno} x={540} y={300}>
        Thermostat = <span style={{ color: ACENTO }}>destination</span>
      </Chip>
      <Chip desde={E.pleno} hasta={E.apaga} x={540} y={300}>
        <span style={{ color: ACENTO }}>Full blast</span> either way
      </Chip>
      <Chip desde={E.apaga} hasta={E.ojo} x={540} y={300}>
        Lower number = <span style={{ color: ACENTO }}>stops later</span>
      </Chip>
      <Chip desde={E.regla} hasta={E.cta} x={540} y={300}>
        Normal setting + <span style={{ color: ACENTO }}>blinds closed</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the one who sets the AC to 60" />
      <Audio src={staticFile("en-020-ac-sixty/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.8, 15], mira: [0, 2.4, 0], fov: 40 }];
export const PortadaEn020: React.FC = () => (
  <Portada arriba="AC on 60 cools faster?" grande="it's a myth" sello="MYTH" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Aire e={{ frame: 40, temp: 17, sopla: 1, marcas: 1, ventana: 0, rayo: 0, led: 1 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

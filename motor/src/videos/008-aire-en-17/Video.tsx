import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/008-aire-en-17/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Aire, type EstadoAire } from "../../kit3d/objetos/Aire";

// 3D: un aire split en la pared, un termómetro con dos marcas (24 y 17) y una ventana. Mecanismo: el termostato
// es el destino, no la velocidad; la temperatura baja al mismo ritmo y solo cambia cuánto tiempo trabaja el equipo
// (y cuánto consume: la Secretaría de Energía dice ~8 % por grado). Con la ventana abierta no llega a ningún número.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  verso: r.f(1),
  destino: r.f(2),
  potencia: r.f(3),
  tiempo: r.f(4),
  plata: r.f(5),
  ocho: r.w(5, "ocho"),
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
  { f: E.verso, pos: [-0.2, 2.5, 14], mira: [-0.2, 2.3, 0], fov: 40 },
  { f: E.destino, pos: [-1.6, 2.2, 11], mira: [-1.6, 2.2, 0], fov: 40 },
  { f: E.potencia, pos: [0, 3.0, 12], mira: [0, 2.6, 0], fov: 40 },
  { f: E.tiempo, pos: [-1.0, 2.2, 13], mira: [-1.0, 2.2, 0], fov: 40 },
  { f: E.plata, pos: [0, 2.3, 18], mira: [0, 2.2, 0], fov: 40 },
  { f: E.ojo, pos: [1.3, 2.2, 13], mira: [1.3, 2.1, 0], fov: 40 },
  { ...ANCHO, f: E.regla },
  { ...ANCHO, f: DURACION },
];

const estado = (frame: number): EstadoAire => {
  const temp = k(frame, [
    [E.potencia, 29],
    [E.tiempo, 24],
    [E.plata - 10, 17],
    [E.ojo - 1, 17],
    [E.ojo, 27],
    [E.regla, 27],
    [E.regla + 30, 24],
  ]);
  return {
    frame,
    temp,
    sopla: k(frame, [[0, 0], [20, 1], [E.cta + 20, 1]]),
    marcas: k(frame, [[E.verso + 20, 0], [E.destino + 10, 1], [E.regla + 30, 1]]),
    ventana: k(frame, [[E.ojo - 1, 0], [E.ojo + 14, 1], [E.regla - 2, 1], [E.regla + 14, 0]]),
    rayo: k(frame, [[E.ojo, 0], [E.ojo + 14, 1], [E.regla, 1], [E.regla + 14, 0]]),
    led: k(frame, [[E.regla + 4, 1], [E.regla + 14, 0]]),
  };
};

const DESTACAR = ["verso", "destino", "toda", "tiempo", "ocho", "Ojo", "veinticuatro", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["diecisiete", "17"],
  ["veinticuatro", "24"],
  ["ocho", "8"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.verso, "scratch", 0.5],
  [r.w(1, "verso"), "sello", 0.5],
  [E.destino, "whoosh", 0.35],
  [E.potencia, "whoosh", 0.35],
  [r.w(3, "toda"), "tic", 0.5],
  [E.tiempo, "whoosh", 0.35],
  [E.ocho, "ding", 0.5],
  [E.ojo, "sello", 0.55],
  [E.regla, "whoosh", 0.35],
  [r.w(7, "veinticuatro"), "pop", 0.5],
  [E.cta, "whoosh", 0.35],
];

export const AireEn17008: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Aire e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.verso} hasta={E.destino} x={540} y={300}>
        17 no enfría <span style={{ color: ACENTO }}>más rápido</span>
      </Chip>
      <Chip desde={E.destino} hasta={E.potencia} x={540} y={300}>
        Termostato = <span style={{ color: ACENTO }}>destino</span>
      </Chip>
      <Chip desde={E.potencia} hasta={E.tiempo} x={540} y={300}>
        Misma potencia en <span style={{ color: ACENTO }}>17 y 24</span>
      </Chip>
      <Chip desde={E.ocho} hasta={E.ojo} x={540} y={300}>
        <span style={{ color: ACENTO }}>+8 %</span> de consumo por grado
      </Chip>
      <Chip desde={E.regla} hasta={E.cta} x={540} y={300}>
        <span style={{ color: ACENTO }}>24 °C</span> + todo cerrado
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que pone el aire en 17" />
      <Audio src={staticFile("008-aire-en-17/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.8, 15], mira: [0, 2.4, 0], fov: 40 }];
export const Portada008: React.FC = () => (
  <Portada arriba="¿el aire en 17 enfría más rápido?" grande="te comiste un verso" sello="MITO" colorSello={C.rojo} numero={8}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Aire e={{ frame: 40, temp: 17, sopla: 1, marcas: 1, ventana: 0, rayo: 0, led: 1 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

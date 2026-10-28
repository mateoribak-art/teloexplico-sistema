import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/024-granizo-corto/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Tormenta, type EstadoTormenta } from "../../kit3d/objetos/Tormenta";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Versión corta del granizo, en 3D (rehecha el 28/10 desde la 2D). Un corte de tormenta en vertical:
// el sol calienta el suelo, una columna de aire caliente sube y lleva una gota sobre el piso de aire
// bajo cero; ahí se congela y en cada vuelta suma una capa (cortada al medio se ve como una cebolla).
// Después cae la lluvia de granizo sobre un auto, que se salva si lo ponen bajo techo.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  fabrica: r.f(1),
  fabricaW: r.w(1, "fabrica"),
  sube: r.f(2),
  subeW: r.w(2, "sube"),
  lleva: r.f(3),
  km: r.w(3, "kilómetros"),
  frioW: r.w(3, "frío"),
  congela: r.f(4),
  congelan: r.w(4, "congelan"),
  cebolla: r.w(4, "cebolla"),
  cien: r.f(5),
  granizo: r.w(5, "granizo"),
  ciento: r.w(5, "ciento"),
  ojo: r.f(6),
  solo: r.w(6, "solo"),
  tambien: r.w(6, "También"),
  auto: r.f(7),
  techoW: r.w(7, "techo"),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** interpolación por tramos que tolera frames repetidos (frases muy pegadas) */
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
  // gancho: el corte entero, con la nube arriba y el sol abajo
  { f: 0, pos: [2.6, 4.2, 20], mira: [0, 4.0, 0], fov: ANCHO },
  { f: E.fabrica - 4, pos: [1.6, 4.0, 19], mira: [0, 3.9, 0], fov: ANCHO },
  // "el calor lo fabrica": baja a la columna caliente
  { f: E.fabrica + 14, pos: [0.8, 2.6, 12], mira: [0, 2.0, 0], fov: ANCHO },
  { f: E.sube - 2, pos: [-0.8, 2.4, 11], mira: [-0.1, 1.8, 0], fov: ANCHO },
  // "sube como un globo": acompaña el aire que sube
  { f: E.sube + 40, pos: [-0.4, 3.6, 12], mira: [0, 3.2, 0], fov: ANCHO },
  // "varios kilómetros de altura, bajo cero": plano abierto al piso de frío
  { f: E.lleva + 10, pos: [3.0, 4.6, 17], mira: [0, 4.0, 0], fov: ANCHO },
  { f: E.congela - 2, pos: [1.2, 5.0, 8.5], mira: [0, 4.7, 0], fov: 30 },
  // "cebolla de hielo": primer plano de la piedra
  { f: E.congelan, pos: [0.9, 5.2, 7.2], mira: [0, 4.75, 0], fov: 28 },
  { f: E.cebolla + 24, pos: [0.2, 5.2, 6.2], mira: [0, 4.7, 0], fov: 28 },
  // "cien por hora / ciento cincuenta": plano abierto, cae el granizo
  { f: E.cien + 10, pos: [3.2, 3.6, 19], mira: [0, 3.8, 0], fov: ANCHO },
  { f: E.ojo - 2, pos: [2.4, 3.6, 18], mira: [0, 3.7, 0], fov: ANCHO },
  // "ojo": el calor solo no alcanza, el frío de arriba
  { f: E.ojo + 20, pos: [-2.4, 4.6, 16], mira: [0, 4.4, 0], fov: ANCHO },
  { f: E.auto - 2, pos: [-1.6, 4.2, 17], mira: [0, 4.0, 0], fov: ANCHO },
  // consejo: el auto bajo techo
  { f: E.auto + 22, pos: [3.4, 2.2, 10.5], mira: [1.3, 1.4, 0], fov: 32 },
  { f: E.cta - 2, pos: [3.0, 2.4, 11.5], mira: [1.2, 1.6, 0], fov: 32 },
  // cierre: vuelve al plano del principio
  { f: E.cta + 20, pos: [2.8, 4.2, 20], mira: [0, 4.0, 0], fov: ANCHO },
  { f: DURACION, pos: [2.6, 4.2, 20], mira: [0, 4.0, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoTormenta => {
  // la piedra sube y baja entre vueltas mientras suma capas
  const t0 = E.congela;
  const vueltas = k(frame, [
    [t0, 5.0],
    [t0 + 22, 5.65],
    [t0 + 44, 5.0],
    [t0 + 66, 5.75],
    [t0 + 88, 5.05],
    [E.cebolla - 6, 5.55],
    [E.cien - 4, 5.2],
  ]);
  const subida = k(frame, [
    [E.lleva, 0.7],
    [E.frioW, 4.9],
    [t0, 5.0],
  ]);
  return {
    frame,
    calor: k(frame, [
      [E.fabricaW - 4, 0],
      [E.fabricaW + 8, 0.9],
      [E.cien - 4, 0.9],
      [E.cien + 6, 1],
      [E.ojo - 2, 1],
      [E.ojo + 6, 0.9],
      [E.auto, 0.9],
      [E.cta, 0.3],
    ]),
    frio: k(frame, [
      [E.lleva + 8, 0],
      [E.frioW, 1],
      [E.ojo, 1],
      [E.solo, 0],
      [E.tambien, 1],
    ]),
    nube: k(frame, [
      [E.lleva - 2, 1],
      [E.lleva + 14, 0.28],
      [E.cien + 6, 0.28],
      [E.cien + 22, 1],
    ]),
    piedraY: frame < t0 ? subida : vueltas,
    piedraOn: k(frame, [
      [E.lleva, 0],
      [E.lleva + 6, 1],
      [E.cien, 1],
      [E.cien + 14, 0],
    ]),
    capas: k(frame, [
      [t0 + 6, 0],
      [t0 + 12, 1],
      [E.cebolla - 2, 6],
    ]),
    corte: k(frame, [
      [E.cebolla, 0],
      [E.cebolla + 6, 1],
      [E.cien - 6, 1],
      [E.cien, 0],
    ]),
    lluvia: k(frame, [
      [E.granizo - 2, 0],
      [E.granizo + 8, 1],
      [E.solo, 1],
      [E.solo + 10, 0],
      [E.tambien, 0],
      [E.tambien + 10, 1],
    ]),
    techo: k(frame, [
      [E.auto + 20, 0],
      [E.techoW + 6, 1],
    ]),
    sol: k(frame, [
      [0, 1],
      [E.sube, 1],
      [E.ojo, 0.8],
    ]),
  };
};

const DESTACAR = ["granizo", "fabrica", "sube", "kilómetros", "congelan", "cebolla", "100", "150", "solo", "frío", "auto", "techo", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["ciento cincuenta", "150"],
  ["cien", "100"],
];

const efectos: Efecto[] = [
  [E.fabricaW - 2, "whoosh", 0.4],
  [E.fabricaW, "pop", 0.5],
  [E.sube, "whoosh", 0.35],
  [E.lleva, "whoosh", 0.35],
  [E.km, "tic", 0.4],
  [E.frioW, "ding", 0.4],
  [E.congela, "whoosh", 0.35],
  [E.congelan, "sello", 0.45],
  [E.cebolla, "pop", 0.5],
  [E.cien, "whoosh", 0.4],
  [E.granizo, "tic", 0.45],
  [E.ciento, "ding", 0.4],
  [E.ojo, "sello", 0.5],
  [E.tambien, "ding", 0.4],
  [E.auto, "whoosh", 0.35],
  [E.techoW, "sello", 0.5],
  [E.cta, "whoosh", 0.3],
];

export const GranizoCorto024: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Tormenta e={e} />
        <PisoSombra y={0.0} />
      </Estudio>
      <Chip desde={E.frioW} hasta={E.congela} x={540} y={300} color="#5fd2ff">
        Bajo cero: <span style={{ color: "#5fd2ff" }}>hielo</span>
      </Chip>
      <Chip desde={E.cien + 4} hasta={E.granizo} x={540} y={300}>
        Corriente: <span style={{ color: ACENTO }}>100 km/h</span>
      </Chip>
      <Chip desde={E.granizo} hasta={E.ojo} x={540} y={300} color="#5fd2ff">
        Granizo: <span style={{ color: "#5fd2ff" }}>150 km/h</span>
      </Chip>
      <Chip desde={E.ojo + 8} hasta={E.tambien} x={540} y={300} color="#ff5a4a">
        Solo calor: <span style={{ color: "#ff8a7a" }}>no alcanza</span>
      </Chip>
      <Chip desde={E.tambien} hasta={E.auto} x={540} y={300} color="#5fd2ff">
        Calor + frío arriba
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que grita ¿granizo con este calor?" />
      <Audio src={staticFile("024-granizo-corto/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

// Portada: el molde parejo de la grilla con la tormenta 3D abajo.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [2.8, 4.4, 21], mira: [0, 4.6, 0], fov: 34 }];
export const Portada024: React.FC = () => (
  <Portada arriba="¿por qué cae granizo cuando hace calor?" grande="el calor" sello="CIENCIA" colorSello={C.verde} numero={24}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Tormenta e={{ ...estado(E.cien + 30), frame: 20, nube: 1, frio: 1, piedraOn: 0, lluvia: 1 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

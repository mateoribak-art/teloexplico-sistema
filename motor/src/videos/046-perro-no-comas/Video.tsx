import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/046-perro-no-comas/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { PerroComida, X_ALIM, type EstadoPerroComida } from "../../kit3d/objetos/PerroComida";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un perro sentado mirando a cámara y delante una mesa baja. Primero el plato con un cachito;
// después aparecen chocolate, uvas y cebolla, cada uno con su cartel de prohibido (ASPCA; ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mal: r.f(1),
  aspca: r.f(2),
  choco: r.f(3),
  uvas: r.f(4),
  cebolla: r.f(5),
  ojo: r.f(6),
  hoy: r.f(7),
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

const ANCHO: Toma = { f: 0, pos: [0, 5.2, 17], mira: [0, 1.3, 1], fov: 34 };
const ancho = (f: number): Toma => ({ ...ANCHO, f });
// La cámara interpola entre tomas: cada toma se repite justo antes de la siguiente para sostenerla.
const sostener = (tomas: Toma[]): Toma[] =>
  tomas.flatMap((t, i) => {
    const sig = tomas[i + 1];
    return sig && sig.f - t.f > 20 ? [t, { ...t, f: sig.f - 14 }] : [t];
  });
const TOMAS: Toma[] = sostener([
  ancho(0),
  { f: E.mal, pos: [0, 4.0, 11.5], mira: [0, 1.5, 0.5], fov: 32 },
  ancho(E.aspca),
  { f: E.choco, pos: [X_ALIM.choco, 3.6, 11], mira: [X_ALIM.choco, 0.9, 2.9], fov: 32 },
  { f: E.uvas, pos: [X_ALIM.uvas, 3.6, 11], mira: [X_ALIM.uvas, 1.0, 2.9], fov: 32 },
  { f: E.cebolla, pos: [X_ALIM.cebolla, 3.6, 11], mira: [X_ALIM.cebolla, 0.9, 2.9], fov: 32 },
  { f: E.ojo, pos: [0, 4.0, 11.5], mira: [0, 1.7, 0], fov: 32 },
  ancho(E.hoy),
  { f: E.cta, pos: [0, 5.2, 18], mira: [0, 1.3, 1], fov: 34 },
  { f: DURACION, pos: [0, 5.2, 17], mira: [0, 1.3, 1], fov: 34 },
]);

const estado = (frame: number): EstadoPerroComida => ({
  frame,
  plato: k(frame, [[0, 1], [E.aspca - 6, 1], [E.aspca + 8, 0]]),
  choco: k(frame, [[E.aspca + 20, 0], [E.aspca + 34, 1]]),
  uvas: k(frame, [[E.aspca + 34, 0], [E.aspca + 48, 1]]),
  cebolla: k(frame, [[E.aspca + 48, 0], [E.aspca + 62, 1]]),
  noChoco: k(frame, [[E.choco, 0], [E.choco + 12, 1]]),
  noUvas: k(frame, [[E.uvas, 0], [E.uvas + 12, 1]]),
  noCebolla: k(frame, [[E.cebolla, 0], [E.cebolla + 12, 1]]),
  ruega: k(frame, [[0, 0.6], [E.mal, 1], [E.aspca, 0.4], [E.ojo, 0.4]]),
});

const DESTACAR = ["plato", "mal", "ASPCA", "chocolate", "uvas", "riñones", "cebolla", "anemia", "Ojo:", "veterinario", "acordate", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["Uno:", "1:"],
  ["Dos:", "2:"],
  ["Tres:", "3:"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.mal, "scratch", 0.4],
  [E.aspca, "pop", 0.4],
  [E.choco, "tic", 0.4],
  [E.uvas, "tic", 0.4],
  [E.cebolla, "tic", 0.4],
  [E.ojo, "pop", 0.4],
  [E.hoy, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const PerroNoComas3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <PerroComida e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.mal} x={540} y={300}>
        Un <span style={{ color: ACENTO }}>cachito</span> de tu plato…
      </Chip>
      <Chip desde={E.mal} hasta={E.aspca} x={540} y={300}>
        Le hace <span style={{ color: ACENTO }}>mal</span> de verdad
      </Chip>
      <Chip desde={E.aspca} hasta={E.choco} x={540} y={300}>
        ASPCA · EE. UU. · <span style={{ color: ACENTO }}>lista de alimentos</span>
      </Chip>
      <Chip desde={E.choco} hasta={E.uvas} x={540} y={300}>
        1 · <span style={{ color: ACENTO }}>Chocolate</span>
      </Chip>
      <Chip desde={E.uvas} hasta={E.cebolla} x={540} y={300}>
        2 · <span style={{ color: ACENTO }}>Uvas y pasas</span>
      </Chip>
      <Chip desde={E.cebolla} hasta={E.ojo} x={540} y={300}>
        3 · <span style={{ color: ACENTO }}>Cebolla, ajo, cebollín</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.hoy} x={540} y={300}>
        Si comió algo: <span style={{ color: ACENTO }}>llamá al veterinario</span>
      </Chip>
      <Chip desde={E.hoy} hasta={E.cta} x={540} y={300}>
        Guardalo: <span style={{ color: ACENTO }}>nunca</span> chocolate, uvas, cebolla
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que le da del plato" />
      <Audio src={staticFile("046-perro-no-comas/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 5.0, 14], mira: [0, 1.5, 1], fov: 36 }];
export const Portada046: React.FC = () => (
  <Portada arriba="tu perro" grande="no le des del plato" sello="CHOCOLATE · UVAS · CEBOLLA" colorSello={C.azul} numero={46}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <PerroComida e={{ frame: 40, plato: 0, choco: 1, uvas: 1, cebolla: 1, noChoco: 1, noUvas: 1, noCebolla: 1, ruega: 1 }} />
    </Estudio>
  </Portada>
);

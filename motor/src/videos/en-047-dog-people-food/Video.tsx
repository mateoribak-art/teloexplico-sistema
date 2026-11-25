import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-047-dog-people-food/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { PerroComida, X_ALIM, type EstadoPerroComida } from "../../kit3d/objetos/PerroComida";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Adaptación de 046-perro-no-comas. Mundo: un perro sentado mirando a cámara y delante una mesa baja.
// Primero el plato con un bocado; después chocolate, uvas y cebolla, cada uno con su cartel de prohibido
// (ASPCA, People Foods to Avoid Feeding Your Pets; ver guion.json).

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
  pregunta: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
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
  { f: E.pregunta, pos: [0, 4.0, 12.5], mira: [0, 1.5, 0.5], fov: 32 },
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

const DESTACAR = ["plate", "hurt", "ASPCA", "chocolate", "grapes", "kidney", "onions", "anemia", "Heads", "vet", "Save", "Send"];
const CIFRAS: [string, string][] = [
  ["One", "1"],
  ["Two", "2"],
  ["Three", "3"],
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
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const DogPeopleFoodEn047: React.FC = () => {
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
        A <span style={{ color: ACENTO }}>bite</span> off your plate…
      </Chip>
      <Chip desde={E.mal} hasta={E.aspca} x={540} y={300}>
        Some of it can <span style={{ color: ACENTO }}>hurt</span> them
      </Chip>
      <Chip desde={E.aspca} hasta={E.choco} x={540} y={300}>
        ASPCA · <span style={{ color: ACENTO }}>foods to avoid</span>
      </Chip>
      <Chip desde={E.choco} hasta={E.uvas} x={540} y={300}>
        1 · <span style={{ color: ACENTO }}>Chocolate</span>
      </Chip>
      <Chip desde={E.uvas} hasta={E.cebolla} x={540} y={300}>
        2 · <span style={{ color: ACENTO }}>Grapes and raisins</span>
      </Chip>
      <Chip desde={E.cebolla} hasta={E.ojo} x={540} y={300}>
        3 · <span style={{ color: ACENTO }}>Onions, garlic, chives</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.hoy} x={540} y={300}>
        If they ate some: <span style={{ color: ACENTO }}>call your vet</span>
      </Chip>
      <Chip desde={E.hoy} hasta={E.pregunta} x={540} y={300}>
        Save this: <span style={{ color: ACENTO }}>never</span> chocolate, grapes, onions
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={300}>
        Weirdest thing <span style={{ color: ACENTO }}>your dog ate?</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the person who feeds the dog under the table" />
      <Audio src={staticFile("en-047-dog-people-food/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 5.0, 14], mira: [0, 1.5, 1], fov: 36 }];
export const PortadaEn047: React.FC = () => (
  <Portada arriba="feeding your dog?" grande="NOT OFF YOUR PLATE" sello="CHOCOLATE · GRAPES · ONIONS" colorSello={C.azul} numero={47}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <PerroComida e={{ frame: 40, plato: 0, choco: 1, uvas: 1, cebolla: 1, noChoco: 1, noUvas: 1, noCebolla: 1, ruega: 1 }} />
    </Estudio>
  </Portada>
);

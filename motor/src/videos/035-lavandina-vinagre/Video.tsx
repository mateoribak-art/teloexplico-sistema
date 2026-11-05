import React from "react";
import { AbsoluteFill, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/035-lavandina-vinagre/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Lavandina, type EstadoLavandina } from "../../kit3d/objetos/Lavandina";

// Mundo: un balde con dos botellas (lavandina y vinagre) que se vuelcan adentro; sale gas verdoso.
// Mecanismo: ácido (vinagre) o amoníaco + lavandina = gas (cloro / cloraminas). Al final queda la lavandina sola con un tilde.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  gas: r.f(1),
  acido: r.f(2),
  amon: r.f(3),
  irrita: r.f(4),
  cdc: r.f(5),
  matiz: r.f(6),
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
    const xx = xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x;
    xs.push(xx);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const A = 36;
const TOMAS: Toma[] = [
  { f: 0, pos: [5.5, 4.2, 11.5], mira: [0, 1.1, 0], fov: A },
  { f: E.gas, pos: [3.5, 3.6, 10.5], mira: [0, 1.3, 0], fov: A },
  { f: E.acido, pos: [-1.5, 3.4, 9.0], mira: [0, 1.6, 0], fov: A },
  { f: E.amon, pos: [2.5, 3.4, 9.5], mira: [0.6, 1.5, -0.4], fov: A },
  { f: E.irrita, pos: [0, 4.0, 10.0], mira: [0, 1.9, 0], fov: A },
  { f: E.cdc, pos: [-3.0, 3.2, 11.0], mira: [0, 1.3, 0], fov: A },
  { f: E.matiz, pos: [-2.5, 2.6, 8.0], mira: [-1.5, 1.4, 0], fov: A },
  { f: E.hoy, pos: [-1.0, 2.8, 8.5], mira: [-1.5, 1.4, 0], fov: A },
  { f: DURACION, pos: [5.5, 4.2, 11.5], mira: [0, 1.1, 0], fov: A },
];

const estado = (frame: number): EstadoLavandina => ({
  frame,
  verter: k(frame, [
    [E.gancho + 25, 0],
    [E.gas - 6, 1],
    [E.matiz - 4, 1],
    [E.matiz + 8, 0],
  ]),
  mezcla: k(frame, [
    [E.gancho + 40, 0],
    [E.gas + 10, 1],
    [E.matiz, 1],
    [E.matiz + 10, 0],
  ]),
  gas: k(frame, [
    [E.gas, 0],
    [E.gas + 20, 0.8],
    [E.irrita + 20, 1],
    [E.matiz, 1],
    [E.matiz + 14, 0],
  ]),
  amon: k(frame, [
    [E.amon - 4, 0],
    [E.amon + 8, 1],
    [E.irrita, 1],
    [E.matiz, 1],
  ]),
  solo: k(frame, [
    [E.matiz + 4, 0],
    [E.matiz + 20, 1],
  ]),
  fantasma: k(frame, [
    [E.acido, 0],
    [E.acido + 12, 0.5],
    [E.irrita, 0.5],
    [E.irrita + 10, 0],
  ]),
});

const DESTACAR = ["gas", "ácido", "cloro", "tóxico", "amoníaco", "cloraminas", "irritan", "tos", "nunca", "sola", "ventilación", "Mandáselo"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gas, "sello", 0.7],
  [E.acido, "whoosh", 0.35],
  [E.amon, "whoosh", 0.35],
  [E.irrita, "pop", 0.4],
  [E.cdc, "whoosh", 0.35],
  [E.cdc + 12, "sello", 0.6],
  [E.matiz + 20, "ding", 0.5],
  [E.cta, "whoosh", 0.35],
];

export const LavandinaVinagre3D: React.FC = () => {
  const e = (f: number) => estado(f);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <LavandinaConFrame estado={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.gas} hasta={E.acido} x={540} y={320} color="#ff5a4a">
        Lavandina + vinagre = <span style={{ color: "#c4f03a" }}>gas</span>
      </Chip>
      <Chip desde={E.amon + 8} hasta={E.irrita} x={540} y={320}>
        Amoníaco + lavandina = <span style={{ color: ACENTO }}>cloraminas</span>
      </Chip>
      <Chip desde={E.cdc} hasta={E.matiz} x={540} y={320} color="#ff5a4a">
        CDC: <span style={{ color: "#ff8a7a" }}>nunca mezcles</span>
      </Chip>
      <Chip desde={E.matiz + 10} hasta={E.cta} x={540} y={320}>
        Lavandina <span style={{ color: ACENTO }}>sola</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que mezcla todo" />
      <Audio src={staticFile("035-lavandina-vinagre/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

import { useCurrentFrame } from "remotion";
const LavandinaConFrame: React.FC<{ estado: (f: number) => EstadoLavandina }> = ({ estado: est }) => {
  const frame = useCurrentFrame();
  return <Lavandina e={est(frame)} />;
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [5.0, 4.0, 12.5], mira: [0, 1.6, 0], fov: 36 }];
export const Portada035: React.FC = () => (
  <Portada arriba="¿lavandina con vinagre?" grande="es gas tóxico" sello="OJO" colorSello={C.rojo} numero={35}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Lavandina e={{ ...estado(0), frame: 20, verter: 1, mezcla: 1, gas: 1, amon: 0, solo: 0, fantasma: 0 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

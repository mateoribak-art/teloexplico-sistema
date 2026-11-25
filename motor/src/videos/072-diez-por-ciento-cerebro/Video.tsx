import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/072-diez-por-ciento-cerebro/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Cerebro, type EstadoCerebro } from "../../kit3d/objetos/Cerebro";

// Mito del 10 % del cerebro: un cerebro de diez zonas. Al principio solo una zona prendida (el mito);
// cuando la voz dice "según lo que hagas" se prenden todas en ola; después se achica y aparecen dos barras
// (peso 2 %, energía 20 %) sobre una escala de 100 %.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  hopkins: r.f(2),
  zonas: r.f(3),
  barras: r.f(4),
  ojo: r.f(5),
  guardar: r.f(6),
  pregunta: r.f(7),
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

const A = 40;
const TOMAS: Toma[] = [
  { f: 0, pos: [3.2, 2.2, 12], mira: [0, 0.8, 0], fov: A },
  { f: E.hopkins, pos: [-2.6, 1.8, 12], mira: [0, 0.8, 0], fov: A },
  { f: E.zonas, pos: [0, 1.4, 12], mira: [0, 0.8, 0], fov: A },
  { f: E.barras, pos: [0, 0.6, 13], mira: [0, 0.1, 0], fov: A },
  { f: E.ojo, pos: [2.4, 1.2, 12.5], mira: [0, 0.4, 0], fov: A },
  { f: E.guardar, pos: [-2.2, 1.6, 12], mira: [0, 0.7, 0], fov: A },
  { f: E.cta, pos: [3.2, 2.2, 12], mira: [0, 0.8, 0], fov: A },
  { f: DURACION, pos: [3.4, 2.2, 12.2], mira: [0, 0.8, 0], fov: A },
];

const estado = (frame: number): EstadoCerebro => ({
  frame,
  diez: k(frame, [
    [0, 0.6],
    [E.gancho + 10, 1],
  ]),
  todo: k(frame, [
    [E.zonas, 0],
    [E.zonas + 40, 1],
  ]),
  compacto: k(frame, [
    [E.barras - 2, 0],
    [E.barras + 12, 1],
    [E.ojo + 20, 1],
    [E.guardar, 0.3],
  ]),
  barras: k(frame, [
    [E.barras + 8, 0],
    [E.barras + 40, 1],
    [E.guardar, 1],
    [E.guardar + 14, 0],
  ]),
});

const DESTACAR = ["diez", "mito", "casi", "dos", "veinte", "Ojo:", "comentario", "superpoderes", "10", "20"];
const CIFRAS: [string, string][] = [
  ["diez por ciento", "10 %"],
  ["dos por ciento", "2 %"],
  ["veinte por ciento", "20 %"],
];

const efectos: Efecto[] = [
  [E.mito, "sello", 0.7],
  [E.hopkins, "whoosh", 0.35],
  [E.zonas, "whoosh", 0.4],
  [E.barras, "whoosh", 0.35],
  [E.barras + 30, "ding", 0.4],
  [E.ojo, "pop", 0.4],
  [E.guardar, "whoosh", 0.35],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const Cerebro3D072: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Cerebro e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.gancho + 6} hasta={E.mito} x={540} y={300}>
        Usás solo el <span style={{ color: ACENTO }}>10 %</span>
      </Chip>
      <Chip desde={E.mito} hasta={E.zonas} x={540} y={300} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>MITO</span>
      </Chip>
      <Chip desde={E.hopkins + 20} hasta={E.zonas} x={540} y={410}>
        Johns Hopkins · <span style={{ color: ACENTO }}>casi todo</span>
      </Chip>
      <Chip desde={E.zonas + 10} hasta={E.barras} x={540} y={300}>
        Según lo que hagas: <span style={{ color: ACENTO }}>otra zona</span>
      </Chip>
      <Chip desde={E.barras + 30} hasta={E.ojo} x={540} y={300} color="#5fd2ff">
        Peso: <span style={{ color: "#5fd2ff" }}>2 %</span> · Energía: <span style={{ color: ACENTO }}>20 %</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.guardar} x={540} y={300} color="#ff5a4a">
        No: <span style={{ color: "#ff8a7a" }}>más rápido</span>
      </Chip>
      <Chip desde={E.guardar + 6} hasta={E.pregunta} x={540} y={300}>
        Usamos <span style={{ color: ACENTO }}>casi todo</span>
      </Chip>
      <Chip desde={E.pregunta + 6} hasta={E.cta} x={540} y={300}>
        ¿Quién te dijo lo del <span style={{ color: ACENTO }}>10 %</span>?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice lo de los superpoderes" />
      <Audio src={staticFile("072-diez-por-ciento-cerebro/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [3.0, 2.4, 11.5], mira: [0, 1.1, 0], fov: 34 }];
export const Portada072: React.FC = () => (
  <Portada arriba="¿usamos solo el 10 % del cerebro?" grande="es un mito" sello="MITO" colorSello={C.azul} numero={72}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Cerebro e={{ frame: 20, diez: 1, todo: 1, compacto: 0, barras: 0 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

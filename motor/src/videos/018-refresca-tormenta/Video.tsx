import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/018-refresca-tormenta/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Descendente, type EstadoDescendente } from "../../kit3d/objetos/Descendente";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Rehecho en 3D (29/10). Corte de una tormenta en vertical: la nube arriba, las gotas se evaporan y
// enfrían el aire, esa columna de aire pesado cae y al llegar al suelo se desparrama por todos lados
// (vaso derramado / frente frío en miniatura). "Ojo": a veces el aire que baja llega caliente.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  refresca: r.w(0, "refresca"),
  lluvia: r.f(1),
  lluviaW: r.w(1, "lluvia"),
  evapora: r.f(2),
  evaporan: r.w(2, "evaporan"),
  pesa: r.f(3),
  pesaW: r.w(3, "pesa"),
  vaso: r.f(4),
  vasoW: r.w(4, "vaso"),
  miniatura: r.f(5),
  ojo: r.f(6),
  caliente: r.w(6, "caliente"),
  cta: r.f(7),
  fin: r.fin(7),
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

const ANCHO = 34;
const TOMAS: Toma[] = [
  { f: 0, pos: [2.4, 3.6, 19], mira: [0, 3.6, 0], fov: ANCHO },
  { f: E.lluvia - 4, pos: [1.6, 3.6, 18], mira: [0, 3.5, 0], fov: ANCHO },
  // la nube por dentro: gotas y vapor
  { f: E.evapora, pos: [0.4, 5.2, 10.5], mira: [-0.4, 5.1, 0], fov: 30 },
  { f: E.evaporan + 30, pos: [-0.2, 5.0, 9.5], mira: [-0.4, 4.9, 0], fov: 30 },
  // el aire pesado cae
  { f: E.pesa, pos: [1.6, 3.4, 15], mira: [-0.4, 3.0, 0], fov: ANCHO },
  { f: E.vaso - 4, pos: [2.0, 2.4, 14], mira: [-0.4, 1.8, 0], fov: ANCHO },
  // se desparrama por el suelo
  { f: E.vasoW, pos: [0.6, 1.6, 12], mira: [-0.2, 0.9, 0], fov: 32 },
  { f: E.miniatura + 20, pos: [0, 2.6, 17], mira: [0, 1.6, 0], fov: ANCHO },
  // ojo: aire caliente
  { f: E.ojo, pos: [-1.6, 3.8, 16], mira: [-0.4, 3.0, 0], fov: ANCHO },
  { f: E.cta - 4, pos: [-1.0, 3.2, 15], mira: [-0.4, 2.4, 0], fov: ANCHO },
  { f: E.cta + 20, pos: [2.4, 3.6, 19], mira: [0, 3.6, 0], fov: ANCHO },
  { f: DURACION, pos: [2.4, 3.6, 19], mira: [0, 3.6, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoDescendente => ({
  frame,
  nube: k(frame, [
    [E.evapora - 2, 1],
    [E.evapora + 14, 0.3],
    [E.pesa + 10, 0.3],
    [E.pesa + 30, 1],
  ]),
  gotas: k(frame, [
    [E.lluvia, 0],
    [E.lluvia + 10, 1],
    [E.evaporan + 20, 1],
    [E.pesa + 10, 0.2],
  ]),
  vapor: k(frame, [
    [E.evaporan - 2, 0],
    [E.evaporan + 12, 1],
    [E.pesa + 6, 1],
    [E.pesa + 24, 0],
  ]),
  cae: k(frame, [
    [E.pesaW, 0],
    [E.vaso - 8, 1],
    [E.ojo, 1],
    [E.ojo + 4, 0],
    [E.caliente, 0.1],
    [E.caliente + 28, 1],
  ]),
  esparce: k(frame, [
    [E.vasoW, 0],
    [E.vasoW + 40, 1],
    [E.ojo - 2, 1],
    [E.ojo + 4, 0],
    [E.caliente + 22, 0],
    [E.caliente + 44, 1],
  ]),
  caliente: k(frame, [
    [E.caliente - 6, 0],
    [E.caliente - 4, 1],
  ]),
  sol: k(frame, [
    [0, 1],
    [E.vasoW, 1],
    [E.vasoW + 40, 0.6],
  ]),
  frescor: k(frame, [
    [E.vasoW + 20, 0],
    [E.vasoW + 24, 1],
    [E.ojo, 1],
    [E.ojo + 1, 0],
  ]),
});

const DESTACAR = ["refresca", "lluvia", "evaporan", "calor", "pesa", "vaso", "frente", "frío", "caliente", "Mandáselo", "refrescó"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.refresca, "pop", 0.45],
  [E.lluvia, "whoosh", 0.4],
  [E.evapora, "whoosh", 0.35],
  [E.evaporan, "pop", 0.5],
  [E.pesa, "whoosh", 0.35],
  [E.pesaW, "ding", 0.4],
  [E.vaso, "whoosh", 0.4],
  [E.vasoW, "sello", 0.5],
  [E.miniatura, "ding", 0.4],
  [E.ojo, "sello", 0.5],
  [E.caliente, "tic", 0.45],
  [E.cta, "whoosh", 0.3],
];

export const RefrescaTormenta018: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Descendente e={e} />
        <PisoSombra y={0.0} />
      </Estudio>
      <Chip desde={E.evaporan} hasta={E.pesa} x={540} y={300} color="#5fd2ff">
        Gotas que se evaporan: <span style={{ color: "#5fd2ff" }}>frío</span>
      </Chip>
      <Chip desde={E.pesaW} hasta={E.vaso} x={540} y={300} color="#5fd2ff">
        Aire frío: <span style={{ color: ACENTO }}>pesa más</span>
      </Chip>
      <Chip desde={E.miniatura} hasta={E.ojo} x={540} y={300} color="#5fd2ff">
        Frente frío <span style={{ color: ACENTO }}>en miniatura</span>
      </Chip>
      <Chip desde={E.caliente} hasta={E.cta} x={540} y={300} color="#ff8a3d">
        Muy de vez en cuando: <span style={{ color: "#ff8a3d" }}>llega caliente</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice ya refrescó" />
      <Audio src={staticFile("018-refresca-tormenta/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [2.4, 3.6, 20], mira: [0, 3.8, 0], fov: 34 }];
export const Portada018: React.FC = () => (
  <Portada arriba="¿por qué refresca después de la tormenta?" grande="aire frío" sello="CIENCIA" colorSello={C.verde} numero={18}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Descendente e={{ ...estado(E.vasoW + 30), frame: 20, nube: 1, gotas: 1 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

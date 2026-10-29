import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/011-sal-agua-hierve/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Olla, type EstadoOlla } from "../../kit3d/objetos/Olla";

// 3D: una olla de acero con agua hirviendo en un estudio azul noche. Mecanismo: la sal que cae se disuelve
// y sube apenas el punto de ebullición (un décimo de grado con una cucharadita por litro; un grado
// entero pediría unos sesenta gramos por litro). Lo que sí acelera es la tapa.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  verso: r.f(1),
  mas: r.f(2),
  alta: r.w(2, "alta"),
  calentarse: r.f(3),
  fideos: r.f(4),
  cuenta: r.f(5),
  decimo: r.w(5, "décimo"),
  grado: r.f(6),
  sesenta: r.w(6, "sesenta"),
  ojo: r.f(7),
  tapa: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
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
  { f: 0, pos: [3.4, 3.4, 8.4], mira: [0, 0.8, 0], fov: ANCHO },
  { f: E.verso, pos: [2.6, 3.0, 7.6], mira: [0, 0.8, 0], fov: ANCHO },
  { f: E.mas, pos: [1.0, 2.0, 5.2], mira: [0, 0.7, 0], fov: 32 },
  { f: E.calentarse, pos: [0.6, 2.2, 5.6], mira: [0.2, 0.9, 0], fov: 32 },
  { f: E.fideos, pos: [0.4, 1.6, 4.0], mira: [0, 0.7, 0], fov: 30 },
  { f: E.cuenta, pos: [0.5, 1.5, 3.4], mira: [0.3, 0.8, 0], fov: 28 },
  { f: E.grado - 4, pos: [-0.9, 2.6, 12.5], mira: [-0.8, 0.8, 0], fov: 36 },
  { f: E.ojo - 4, pos: [-0.9, 2.6, 12.5], mira: [-0.8, 0.8, 0], fov: 36 },
  { f: E.ojo + 12, pos: [0.5, 3.0, 9.0], mira: [0, 0.8, 0], fov: ANCHO },
  { f: E.tapa - 2, pos: [1.6, 3.0, 8.0], mira: [0, 1.0, 0], fov: ANCHO },
  { f: E.cta + 18, pos: [3.4, 3.4, 8.4], mira: [0, 0.8, 0], fov: ANCHO },
  { f: DURACION, pos: [3.4, 3.4, 8.4], mira: [0, 0.8, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoOlla => ({
  frame,
  hierve: k(frame, [[0, 1], [E.tapa + 20, 1], [E.cta, 0.6]]),
  granos: k(frame, [
    [E.gancho, 0.2],
    [E.gancho + 20, 1],
    [E.verso, 1],
    [E.mas + 20, 0.4],
    [E.fideos, 0.4],
    [E.cuenta + 10, 0.1],
    [E.grado, 1],
    [E.grado + 40, 1],
    [E.ojo, 0],
  ]),
  pila: k(frame, [[E.grado - 2, 0], [E.sesenta, 1], [E.ojo, 1], [E.ojo + 12, 0]]),
  vapor: k(frame, [[0, 0.5], [E.mas, 0.8], [E.tapa - 4, 0.8], [E.tapa + 10, 0]]),
  tapa: k(frame, [[E.tapa + 2, 0], [E.tapa + 22, 1], [E.cta + 4, 1], [E.cta + 16, 0]]),
  termo: k(frame, [[E.mas, 0], [E.mas + 10, 1], [E.grado + 30, 1], [E.ojo, 0]]),
  fantasma: k(frame, [[E.mas, 0], [E.mas + 12, 0.7], [E.ojo, 0.7], [E.ojo + 10, 0], [E.cta + 6, 0], [E.cta + 16, 0]]),
});

const DESTACAR = ["verso", "alta", "calentarse", "fracción", "décimo", "grado", "sesenta", "tapa", "Mandáselo"];
const CIFRAS: [string, string][] = [["sesenta", "60"]];

const efectos: Efecto[] = [
  [E.verso, "scratch", 0.5],
  [E.mas, "whoosh", 0.35],
  [E.alta, "tic", 0.5],
  [E.cuenta, "whoosh", 0.35],
  [E.decimo, "ding", 0.5],
  [E.grado, "whoosh", 0.35],
  [E.sesenta, "pop", 0.5],
  [E.tapa + 10, "sello", 0.6],
  [E.cta, "whoosh", 0.35],
];

export const SalAgua011: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Olla e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.alta} hasta={E.fideos} x={540} y={300}>
        Hierve a <span style={{ color: ACENTO }}>más de 100 °C</span>
      </Chip>
      <Chip desde={E.decimo} hasta={E.grado} x={540} y={300}>
        1 cucharadita por litro: <span style={{ color: ACENTO }}>+0,1 °C</span>
      </Chip>
      <Chip desde={E.sesenta} hasta={E.ojo} x={540} y={300}>
        <span style={{ color: ACENTO }}>60 g</span> por litro: +1 °C
      </Chip>
      <Chip desde={E.tapa + 14} hasta={E.cta + 4} x={540} y={300} color="#5fd2ff">
        Con tapa: <span style={{ color: "#5fd2ff" }}>hierve antes</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que se queda mirando la olla" />
      <Audio src={staticFile("011-sal-agua-hierve/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [3.2, 4.2, 9.6], mira: [0, 1.5, 0], fov: 34 }];
export const Portada011: React.FC = () => (
  <Portada arriba="¿ponerle sal al agua la hace hervir más rápido?" grande="te comiste un verso" sello="MITO" colorSello={C.azul} numero={11}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Olla e={{ ...estado(0), frame: 40, granos: 1, hierve: 1, vapor: 0.8 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

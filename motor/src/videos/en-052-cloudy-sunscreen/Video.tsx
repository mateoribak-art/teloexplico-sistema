import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-052-cloudy-sunscreen/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { SolNube, type EstadoSolNube } from "../../kit3d/objetos/SolNube";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una persona de pie bajo una nube; el sol detrás. Rayos UV (violeta) que atraviesan la nube,
// la piel que se enrojece, rebote en el piso (nieve/agua) y una sombrilla como imagen de protección.
// Fuente: American Academy of Dermatology (ver guion.json). Adaptación visual de 039-sol-nublado.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  derm: r.f(1),
  ochenta: r.f(2),
  sentir: r.f(3),
  nieve: r.f(4),
  ojo: r.f(5),
  regla: r.f(6),
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
    xs.push(xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const ANCHO = 44;
const TOMAS: Toma[] = [
  { f: 0, pos: [-1.2, 3.4, 14], mira: [-1.2, 3.2, 0], fov: ANCHO },
  { f: E.derm, pos: [-1.2, 3.8, 12], mira: [-1.2, 3.8, 0], fov: 40 },
  { f: E.ochenta, pos: [-2.0, 5.0, 9], mira: [-2.0, 4.8, 0.5], fov: 38 },
  { f: E.sentir, pos: [0.9, 2.4, 10], mira: [0.9, 2.3, 0], fov: 34 },
  { f: E.nieve, pos: [-0.8, 2.4, 13], mira: [-0.8, 2.2, 0.5], fov: 42 },
  { f: E.ojo, pos: [-1.2, 3.4, 14], mira: [-1.2, 3.2, 0], fov: ANCHO },
  { f: E.regla, pos: [0.4, 3.4, 11], mira: [0.4, 3.0, 0], fov: 38 },
  { f: E.pregunta, pos: [-1.2, 3.4, 14], mira: [-1.2, 3.2, 0], fov: ANCHO },
  { f: DURACION, pos: [-1.2, 3.4, 14], mira: [-1.2, 3.2, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoSolNube => ({
  frame,
  nube: k(frame, [[E.gancho + 6, 0], [E.gancho + 26, 1]]),
  rayos: k(frame, [[E.ochenta + 4, 0], [E.ochenta + 20, 1], [E.ojo - 4, 1], [E.ojo + 10, 0.55], [E.regla, 0.55], [E.fin, 1]]),
  quemado: k(frame, [[E.sentir + 6, 0], [E.sentir + 50, 0.7], [E.ojo, 0.7], [E.regla + 10, 0.2], [E.regla + 30, 0]]),
  rebote: k(frame, [[E.nieve + 4, 0], [E.nieve + 24, 1], [E.ojo - 6, 1], [E.ojo + 8, 0]]),
  sombrilla: k(frame, [[E.regla + 20, 0], [E.regla + 44, 1], [E.fin, 1]]),
});

const DESTACAR = ["cloudy", "mistake", "eighty", "feel", "snow", "Heads", "thirty", "save", "Yes", "Send"];
const CIFRAS: [string, string][] = [
  ["eighty percent", "80%"],
  ["thirty", "30"],
  ["two hours", "2 hours"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.derm, "scratch", 0.4],
  [E.ochenta, "whoosh", 0.35],
  [E.sentir, "pop", 0.4],
  [E.nieve, "tic", 0.35],
  [E.ojo, "pop", 0.4],
  [E.regla, "ding", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const CloudySunscreenEn052: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <SolNube e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.derm} x={540} y={300}>
        “It's <span style={{ color: ACENTO }}>cloudy</span>, I'm fine”
      </Chip>
      <Chip desde={E.derm} hasta={E.ochenta} x={540} y={300}>
        Dermatologists: <span style={{ color: ACENTO }}>a mistake</span>
      </Chip>
      <Chip desde={E.ochenta} hasta={E.sentir} x={540} y={300}>
        AAD · up to <span style={{ color: ACENTO }}>80%</span> of UV gets through
      </Chip>
      <Chip desde={E.sentir} hasta={E.nieve} x={540} y={300}>
        You can't <span style={{ color: ACENTO }}>feel</span> UV
      </Chip>
      <Chip desde={E.nieve} hasta={E.ojo} x={540} y={300}>
        Snow <span style={{ color: ACENTO }}>reflects</span> it too
      </Chip>
      <Chip desde={E.ojo} hasta={E.regla} x={540} y={300}>
        Thick overcast = <span style={{ color: ACENTO }}>less</span> gets in
      </Chip>
      <Chip desde={E.regla} hasta={E.pregunta} x={540} y={300}>
        Save it: <span style={{ color: ACENTO }}>SPF 30+ · every 2 h</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={300}>
        Sunscreen when cloudy: <span style={{ color: ACENTO }}>yes or no?</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who says it's cloudy, I'm fine" />
      <Audio src={staticFile("en-052-cloudy-sunscreen/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [-1.2, 3.6, 14], mira: [-1.2, 3.4, 0], fov: 44 }];
export const PortadaEn052: React.FC = () => (
  <Portada arriba="sunscreen on cloudy days?" grande="UV GETS THROUGH" sello="UP TO 80%" colorSello={C.azul} numero={52}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <SolNube e={{ frame: 40, nube: 1, rayos: 1, quemado: 0.6, rebote: 0, sombrilla: 0 }} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/029-cataratas-por-segundo/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Cataratas, type EstadoCataratas } from "../../kit3d/objetos/Cataratas";

// Argentina en datos #3: una cortina de agua (Iguazú) y, delante, piletas olímpicas a escala 1:10 que se llenan.
// Una en ~2 s (caudal normal ~1.500 m³/s sobre 2.500 m³), después seis. Fondo oscuro, un acento.
// Fuentes: autoridades del Parque Nacional Iguazú citadas por la prensa (2020); medidas de la pileta olímpica (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  pileta: r.f(1),
  caudal: r.f(2),
  dos: r.f(3),
  seis: r.f(4),
  ojo: r.f(5),
  consejo: r.f(6),
  cta: r.f(7),
  fin: r.fin(7),
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

const TOMAS: Toma[] = [
  { f: 0, pos: [-1.0, 12.0, 18.0], mira: [-0.8, 0.5, 0.8], fov: 34 },
  { f: E.pileta, pos: [-0.8, 11.0, 15.0], mira: [-1.0, 0.2, 1.0], fov: 34 },
  { f: E.caudal, pos: [0, 9.0, 19.0], mira: [0, 1.0, -0.5], fov: 34 },
  { f: E.dos, pos: [-0.8, 11.0, 15.0], mira: [-1.0, 0.2, 1.0], fov: 34 },
  { f: E.seis, pos: [0, 20.0, 15.5], mira: [0, 0, 2.6], fov: 34 },
  { f: E.ojo, pos: [3.5, 12.0, 18.0], mira: [0, 0.5, 1.5], fov: 34 },
  { f: E.consejo, pos: [0, 13.0, 19.0], mira: [0, 0.5, 1.5], fov: 34 },
  { f: DURACION, pos: [-1.0, 12.0, 18.0], mira: [-0.8, 0.5, 0.8], fov: 34 },
];

const estado = (frame: number): EstadoCataratas => ({
  frame,
  cascada: k(frame, [[2, 0], [18, 1], [E.ojo, 1], [E.ojo + 14, 0.45], [E.consejo, 0.45], [E.consejo + 14, 1]]),
  piletas: k(frame, [[4, 0], [18, 1]]),
  // la primera se llena en ~2 s mientras se dice el gancho; después, las seis en unos 4 s
  llenas: k(frame, [[22, 0], [22 + 50, 1], [E.seis, 1], [E.seis + 100, 6]]),
  visibles: frame >= E.seis ? 6 : 1,
});

const DESTACAR = ["pileta", "olímpica", "Cataratas", "segundos", "segundo", "Ojo:", "metros", "seis", "treinta", "Brasil", "Parque"];
const CIFRAS: [string, string][] = [
  ["cincuenta metros por veinticinco", "50 × 25 m"],
  ["dos mil quinientos", "2.500"],
  ["mil quinientos", "1.500"],
  ["dos mil veinte", "2020"],
  ["treinta y seis", "36"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [22 + 40, "ding", 0.45],
  [E.pileta, "whoosh", 0.35],
  [E.caudal, "whoosh", 0.35],
  [E.caudal + 14, "pop", 0.4],
  [E.dos, "whoosh", 0.35],
  [E.dos + 20, "ding", 0.45],
  [E.seis, "whoosh", 0.4],
  [E.seis + 20, "pop", 0.4],
  [E.seis + 60, "pop", 0.4],
  [E.ojo, "whoosh", 0.35],
  [E.consejo, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const CataratasPorSegundo3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Cataratas e={e} />
        <PisoSombra opacidad={0.4} />
      </Estudio>
      <Chip desde={0} hasta={E.pileta} x={540} y={300}>
        Iguazú · <span style={{ color: ACENTO }}>1 pileta</span> olímpica
      </Chip>
      <Chip desde={E.pileta} hasta={E.caudal} x={540} y={300}>
        50 × 25 m · <span style={{ color: ACENTO }}>2.500 m³</span>
      </Chip>
      <Chip desde={E.caudal} hasta={E.dos} x={540} y={300}>
        Parque Nacional Iguazú · <span style={{ color: ACENTO }}>~1.500 m³/s</span>
      </Chip>
      <Chip desde={E.dos} hasta={E.seis} x={540} y={300}>
        1.500 ÷ 2.500 ≈ <span style={{ color: ACENTO }}>2 s</span> por pileta
      </Chip>
      <Chip desde={E.seis} hasta={E.ojo} x={540} y={300}>
        10 s = <span style={{ color: ACENTO }}>~6</span> · 1 min = <span style={{ color: ACENTO }}>~36</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.consejo} x={540} y={300} color="#5fd2ff">
        Sequía 2020 · crecidas: <span style={{ color: "#5fd2ff" }}>cambia mucho</span>
      </Chip>
      <Chip desde={E.consejo} hasta={E.cta} x={540} y={300}>
        Mirá el <span style={{ color: ACENTO }}>caudal del día</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice que las de Brasil se ven mejor" />
      <Audio src={staticFile("029-cataratas-por-segundo/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 14.0, 12.5], mira: [0, 0, 1.8], fov: 34 }];
export const Portada029: React.FC = () => (
  <Portada arriba="¿cuánta agua cae en Iguazú?" grande="una pileta cada 2 s" sello="DATO" colorSello={C.azul} numero={29}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Cataratas e={{ frame: 20, cascada: 1, piletas: 1, llenas: 3.5, visibles: 6 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

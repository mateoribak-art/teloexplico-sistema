import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-060-hot-water-hands/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { LavadoManos, type EstadoLavadoManos } from "../../kit3d/objetos/LavadoManos";

// Mundo: dos manos con gérmenes bajo un chorro, una con agua fría (azul) y otra caliente (roja), fondo oscuro.
// Los gérmenes bajan igual en las dos; después llega el jabón y el aro de 20 segundos.
// Fuentes: CDC Handwashing, Rutgers 2017 (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  cdc: r.f(2),
  rutgers: r.f(3),
  pasos: r.f(4),
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
    xs.push(xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 2.6, 14], mira: [0, 1.9, 0], fov: 34 },
  { f: E.cdc, pos: [0, 2.5, 13], mira: [0, 1.9, 0], fov: 34 },
  { f: E.rutgers, pos: [0, 2.8, 14], mira: [0, 2.0, 0], fov: 34 },
  { f: E.pasos, pos: [0, 2.9, 14], mira: [0, 2.2, 0], fov: 34 },
  { f: E.ojo, pos: [0, 2.6, 13.5], mira: [0, 1.9, 0], fov: 34 },
  { f: DURACION, pos: [0, 2.6, 14], mira: [0, 1.9, 0], fov: 34 },
];

const estado = (frame: number): EstadoLavadoManos => ({
  frame,
  agua: k(frame, [[E.gancho, 0], [E.gancho + 14, 1], [E.pasos - 6, 1], [E.pasos + 10, 0.5], [E.ojo, 0.5]]),
  germenes: k(frame, [[E.gancho, 1], [E.cdc, 1], [E.cdc + 70, 0.35], [E.pasos + 80, 0.0]]),
  jabon: k(frame, [[E.pasos, 0], [E.pasos + 24, 1], [E.ojo - 10, 1], [E.ojo + 8, 0.3]]),
  reloj: k(frame, [[E.pasos + 40, 0], [E.ojo - 6, 1], [E.ojo, 0]]),
});

const DESTACAR = ["hot", "CDC", "Rutgers", "soap", "twenty", "seconds", "Heads", "song", "Save"];
const CIFRAS: [string, string][] = [
  ["twenty seventeen", "2017"],
  ["sixty", "60"],
  ["one hundred", "100"],
  ["twenty", "20"],
  ["two", "2"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.golpe, "scratch", 0.4],
  [E.cdc, "whoosh", 0.35],
  [E.cdc + 70, "ding", 0.4],
  [E.rutgers, "whoosh", 0.35],
  [E.pasos, "pop", 0.4],
  [E.pasos + 80, "ding", 0.45],
  [E.ojo, "pop", 0.4],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const HotWaterEn060: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <LavadoManos e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.golpe} x={540} y={300}>
        Hot water kills <span style={{ color: ACENTO }}>germs</span>?
      </Chip>
      <Chip desde={E.golpe} hasta={E.cdc} x={540} y={300}>
        <span style={{ color: ACENTO }}>Myth</span>
      </Chip>
      <Chip desde={E.cdc} hasta={E.rutgers} x={540} y={300}>
        CDC: <span style={{ color: ACENTO }}>no difference</span>
      </Chip>
      <Chip desde={E.rutgers} hasta={E.pasos} x={540} y={300}>
        Rutgers 2017: <span style={{ color: ACENTO }}>60–100 °F</span>
      </Chip>
      <Chip desde={E.pasos} hasta={E.ojo} x={540} y={300}>
        Soap + <span style={{ color: ACENTO }}>20 seconds</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.guardar} x={540} y={300}>
        Comfortable <span style={{ color: ACENTO }}>water</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={300}>
        Wet · soap · scrub <span style={{ color: ACENTO }}>20 s</span> · rinse · dry
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={300}>
        Your <span style={{ color: ACENTO }}>20-second song</span>?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who rinses for two seconds and calls it clean" />
      <Audio src={staticFile("en-060-hot-water-hands/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.6, 12], mira: [0, 1.9, 0], fov: 34 }];
export const PortadaEn060: React.FC = () => (
  <Portada arriba="hot water = cleaner?" grande="no difference" sello="MYTH" colorSello={C.azul} numero={60}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <LavadoManos e={{ frame: 40, agua: 1, germenes: 0.6, jabon: 0, reloj: 0 }} />
    </Estudio>
  </Portada>
);

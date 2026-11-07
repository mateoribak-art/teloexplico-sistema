import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-028-turkey-sleepy/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { CenaPavo, type EstadoCenaPavo } from "../../kit3d/objetos/CenaPavo";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una mesa de Thanksgiving vista de frente. El pavo al centro se señala y no cambia nada;
// después los carbohidratos (relleno, puré, panecillos, pastel) brillan, los platos se llenan de más
// y el medidor de sueño sube (UNC Charlotte, 2024; ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  culpable: r.f(1),
  triptofano: r.f(2),
  aminoacido: r.f(3),
  carbos: r.f(4),
  exceso: r.f(5),
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

const ANCHO = 38;
const TOMAS: Toma[] = [
  { f: 0, pos: [0, 2.6, 14], mira: [0, 0.2, 0], fov: ANCHO },
  { f: E.culpable, pos: [0, 1.8, 8], mira: [0, 0.4, 0], fov: 34 },
  { f: E.triptofano, pos: [0, 1.9, 9], mira: [0, 0.4, 0], fov: 34 },
  { f: E.aminoacido, pos: [0, 2.6, 14], mira: [0, 0.2, 0], fov: ANCHO },
  { f: E.carbos, pos: [-0.4, 2.4, 11], mira: [-0.3, 0.3, 0], fov: 36 },
  { f: E.exceso, pos: [0, 2.6, 14], mira: [0, 0.2, 0], fov: ANCHO },
  { f: E.ojo, pos: [0, 2.6, 14], mira: [0, 0.2, 0], fov: ANCHO },
  { f: E.hoy, pos: [0, 2.6, 14.5], mira: [0, 0.2, 0], fov: ANCHO },
  { f: DURACION, pos: [0, 2.6, 14], mira: [0, 0.2, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoCenaPavo => ({
  frame,
  pavo: k(frame, [[0, 0.01], [8, 1]]),
  pavoFoco: k(frame, [[E.culpable - 6, 0], [E.culpable + 4, 1], [E.aminoacido - 4, 1], [E.aminoacido + 8, 0]]),
  comida: k(frame, [[E.triptofano, 0.01], [E.triptofano + 14, 1]]),
  comidaFoco: k(frame, [[E.carbos - 4, 0], [E.carbos + 8, 1], [E.exceso - 4, 1], [E.exceso + 10, 0.3]]),
  platos: k(frame, [[E.exceso - 6, 0], [E.exceso + 20, 1]]),
  medidor: k(frame, [[E.carbos, 0], [E.carbos + 40, 0.6], [E.exceso + 30, 1], [E.hoy, 1], [E.hoy + 30, 0.15]]),
});

const DESTACAR = ["turkey", "tryptophan", "carbs", "Heads", "walk", "Send"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.culpable, "scratch", 0.4],
  [E.triptofano, "pop", 0.4],
  [E.aminoacido, "pop", 0.35],
  [E.carbos, "ding", 0.4],
  [E.exceso, "tic", 0.35],
  [E.ojo, "pop", 0.4],
  [E.hoy, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const TurkeySleepyEn028: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <CenaPavo e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.culpable} x={540} y={300}>
        Nap after dinner = <span style={{ color: ACENTO }}>the turkey?</span>
      </Chip>
      <Chip desde={E.culpable} hasta={E.triptofano} x={540} y={300}>
        Not the <span style={{ color: ACENTO }}>culprit</span>
      </Chip>
      <Chip desde={E.triptofano} hasta={E.aminoacido} x={540} y={300}>
        Tryptophan: turkey ≈ <span style={{ color: ACENTO }}>chicken, beef, cheese</span>
      </Chip>
      <Chip desde={E.aminoacido} hasta={E.carbos} x={540} y={300}>
        UNC Charlotte · <span style={{ color: ACENTO }}>2024</span>
      </Chip>
      <Chip desde={E.carbos} hasta={E.exceso} x={540} y={300}>
        Main cause: <span style={{ color: ACENTO }}>carbs</span>
      </Chip>
      <Chip desde={E.exceso} hasta={E.ojo} x={540} y={300}>
        + overeating + <span style={{ color: ACENTO }}>alcohol</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.hoy} x={540} y={300}>
        Experts still <span style={{ color: ACENTO }}>debate</span> the mix
      </Chip>
      <Chip desde={E.hoy} hasta={E.cta} x={540} y={300}>
        Save it: <span style={{ color: ACENTO }}>blame the carbs, not the bird</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the uncle who blames the turkey" />
      <Audio src={staticFile("en-028-turkey-sleepy/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.6, 13], mira: [0, 0.2, 0], fov: 38 }];
export const PortadaEn028: React.FC = () => (
  <Portada arriba="sleepy after dinner?" grande="IT'S NOT THE TURKEY" sello="BLAME THE CARBS" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <CenaPavo e={{ frame: 40, pavo: 1, pavoFoco: 0, comida: 1, comidaFoco: 0.6, platos: 1, medidor: 0.9 }} />
    </Estudio>
  </Portada>
);

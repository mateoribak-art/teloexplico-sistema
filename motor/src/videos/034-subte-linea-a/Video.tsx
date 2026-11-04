import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/034-subte-linea-a/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Subte, type EstadoSubte } from "../../kit3d/objetos/Subte";

// Mundo: un túnel de subte con un coche antiguo de madera (tipo "Brujas") que avanza; un contador de años va de 1913 a 2013.
// Después llega un tren moderno por la otra vía. Fuentes: Billiken, Gobierno de la Ciudad (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  fecha: r.f(1),
  hasta: r.f(2),
  brujas: r.f(3),
  madera: r.f(4),
  nuevos: r.f(5),
  ojo: r.f(6),
  probalo: r.f(7),
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
  { f: 0, pos: [-1.5, 1.8, 15], mira: [0, 1.1, 0], fov: 38 },
  { f: E.fecha, pos: [3, 1.6, 12], mira: [0, 1.1, 0], fov: 36 },
  { f: E.hasta, pos: [0, 1.4, 15.5], mira: [0, 1.1, 0], fov: 38 },
  { f: E.brujas, pos: [-2.5, 1.2, 10], mira: [-0.5, 1.1, 0], fov: 34 },
  { f: E.madera, pos: [2, 1.5, 9.5], mira: [0.5, 1.1, 0], fov: 34 },
  { f: E.nuevos, pos: [0, 2.2, 16], mira: [0, 1, 0], fov: 38 },
  { f: E.ojo, pos: [0, 2, 15], mira: [0, 1, 0], fov: 38 },
  { f: E.probalo, pos: [-2, 1.3, 12], mira: [0, 1.1, 0], fov: 36 },
  { f: DURACION, pos: [-1.5, 1.8, 15], mira: [0, 1.1, 0], fov: 38 },
];

const estado = (frame: number): EstadoSubte => ({
  frame,
  avance: k(frame, [[0, -1.5], [E.fecha - 10, 0], [E.nuevos - 5, 0.3], [E.nuevos + 35, -13], [E.nuevos + 36, -13], [E.ojo + 25, -13],[E.ojo + 26, 13], [E.ojo + 60, 0]]),
  tunel: k(frame, [[0, 0.3], [30, 1]]),
  faro: k(frame, [[0, 1], [E.ojo, 1]]),
  corte: 0,
  nuevo: k(frame, [[E.nuevos + 15, 13], [E.nuevos + 65, 0], [E.ojo - 5, 0], [E.ojo + 25, -13]]),
  aro: k(frame, [[E.brujas, 0], [E.brujas + 12, 1], [E.madera, 1], [E.madera + 6, 0]]),
});

const DESTACAR = ["primera", "Latinoamérica", "trece", "madera", "Brujas", "Ojo:", "Londres", "cien"];
const CIFRAS: [string, string][] = [
  ["mil novecientos trece", "1913"],
  ["dos mil trece", "2013"],
  ["mil ochocientos sesenta y tres", "1863"],
  ["cien", "100"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.fecha, "whoosh", 0.35],
  [E.fecha + 8, "ding", 0.4],
  [E.hasta, "tic", 0.35],
  [E.hasta + 58, "ding", 0.4],
  [E.brujas, "whoosh", 0.35],
  [E.brujas + 10, "pop", 0.4],
  [E.madera, "whoosh", 0.35],
  [E.nuevos, "whoosh", 0.35],
  [E.ojo, "pop", 0.4],
  [E.probalo, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const SubteLineaA3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  const anio = Math.round(k(frame, [[E.hasta, 1913], [E.hasta + 55, 2013]]));
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <Subte e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.fecha} x={540} y={300}>
        <span style={{ color: ACENTO }}>Primera</span> línea de subte de Latinoamérica
      </Chip>
      <Chip desde={E.fecha} hasta={E.hasta} x={540} y={300}>
        <span style={{ color: ACENTO }}>1 dic 1913</span> · Buenos Aires
      </Chip>
      <Chip desde={E.hasta} hasta={E.brujas} x={540} y={300}>
        Año <span style={{ color: ACENTO }}>{anio}</span>
      </Chip>
      <Chip desde={E.brujas} hasta={E.madera} x={540} y={300}>
        Las <span style={{ color: ACENTO }}>Brujas</span> · según cuentan
      </Chip>
      <Chip desde={E.madera} hasta={E.nuevos} x={540} y={300}>
        Coches de <span style={{ color: ACENTO }}>madera</span> hasta 2013
      </Chip>
      <Chip desde={E.nuevos} hasta={E.ojo} x={540} y={300}>
        Hoy: trenes <span style={{ color: ACENTO }}>nuevos</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.probalo} x={540} y={300}>
        <span style={{ color: ACENTO }}>Londres</span> abrió en 1863
      </Chip>
      <Chip desde={E.probalo} hasta={E.cta} x={540} y={300}>
        Túnel de <span style={{ color: ACENTO }}>+100 años</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que se queja de la línea A" />
      <Audio src={staticFile("034-subte-linea-a/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [2, 1.8, 13], mira: [0, 1.1, 0], fov: 36 }];
export const Portada034: React.FC = () => (
  <Portada arriba="la línea A del subte" grande="tiene 1913" sello="HISTORIA" colorSello={C.azul} numero={34}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Subte e={{ frame: 40, avance: 0, tunel: 1, faro: 1, corte: 0, nuevo: 13, aro: 0 }} />
    </Estudio>
  </Portada>
);

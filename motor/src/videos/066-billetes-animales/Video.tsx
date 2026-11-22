import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/066-billetes-animales/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mapa de Argentina: cada animal de la familia de billetes (BCRA) se enciende en su región.
// Posiciones aproximadas (hornero Centro, yaguareté NEA, ballena mar, taruca NOA, cóndor Andes, guanaco Patagonia).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  casual: r.f(1),
  dosmil16: r.f(2),
  tres: r.f(3),
  tres2: r.f(4),
  regiones: r.f(5),
  bcra: r.f(6),
  ojo: r.f(7),
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

const LL: Record<string, LonLat> = {
  hornero: [-64, -32],
  yaguarete: [-58.5, -26.5],
  ballena: [-63.5, -42.8],
  taruca: [-65.5, -23.8],
  condor: [-69.5, -33.5],
  guanaco: [-69.5, -48],
};
const PT: Record<string, [number, number]> = {};
for (const n of Object.keys(LL)) PT[n] = enMapa(LL[n]) as [number, number];
const AMARILLO = "#ffd24a";
const MIRA: [number, number, number] = [PT.hornero[0] + 0.3, PT.hornero[1] - 1.2, 0];

const TOMAS: Toma[] = [
  { f: 0, pos: [MIRA[0], MIRA[1] - 3, 17], mira: MIRA, fov: 34 },
  { f: E.dosmil16, pos: [MIRA[0], MIRA[1] - 3, 15], mira: MIRA, fov: 34 },
  { f: E.tres, pos: [PT.yaguarete[0], PT.yaguarete[1] - 2.5, 11], mira: [PT.yaguarete[0], PT.yaguarete[1], 0], fov: 34 },
  { f: E.tres2, pos: [PT.condor[0] + 1, PT.condor[1] - 3, 12], mira: [PT.condor[0] + 1, PT.condor[1], 0], fov: 34 },
  { f: E.regiones, pos: [MIRA[0], MIRA[1] - 3, 18], mira: MIRA, fov: 34 },
  { f: E.pregunta, pos: [MIRA[0], MIRA[1] - 3, 16], mira: MIRA, fov: 34 },
  { f: DURACION, pos: [MIRA[0] + 0.4, MIRA[1] - 3, 16.5], mira: MIRA, fov: 34 },
];

const Halo: React.FC<{ x: number; y: number; v: number; color: string; tam?: number }> = ({ x, y, v, color, tam = 1 }) => {
  if (v <= 0) return null;
  return (
    <mesh position={[x, y, 0.75]} scale={[v * tam, v * tam, 1]}>
      <circleGeometry args={[0.5, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} blending={THREE.NormalBlending} toneMapped={false} />
    </mesh>
  );
};

// Momento (frame) en que se enciende cada animal, según la voz.
const T: Record<string, number> = {
  hornero: E.tres,
  yaguarete: E.tres + 52,
  ballena: E.tres + 105,
  taruca: E.tres2,
  condor: E.tres2 + 50,
  guanaco: E.tres2 + 95,
};

const DESTACAR = ["hornero", "yaguareté", "ballena", "taruca", "cóndor", "guanaco", "Ojo:", "Mandáselo", "animal", "prócer", "casualidad", "representados"];
const CIFRAS: [string, string][] = [
  ["Mil", "$1.000"],
  ["Quinientos", "$500"],
  ["Doscientos", "$200"],
  ["Cien", "$100"],
  ["Cincuenta", "$50"],
  ["Veinte", "$20"],
  ["dieciséis", "16"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.casual, "sello", 0.45],
  [E.dosmil16, "tic", 0.4],
  ...Object.values(T).map((f) => [f, "pop", 0.4] as Efecto),
  [E.regiones, "whoosh", 0.4],
  [E.bcra, "pop", 0.4],
  [E.ojo, "tic", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

const ITEMS: { n: string; val: string; animal: string; hasta: number }[] = [
  { n: "hornero", val: "$1.000", animal: "hornero", hasta: T.yaguarete },
  { n: "yaguarete", val: "$500", animal: "yaguareté", hasta: T.ballena },
  { n: "ballena", val: "$200", animal: "ballena franca austral", hasta: E.tres2 },
  { n: "taruca", val: "$100", animal: "taruca", hasta: T.condor },
  { n: "condor", val: "$50", animal: "cóndor", hasta: T.guanaco },
  { n: "guanaco", val: "$20", animal: "guanaco", hasta: E.regiones },
];

export const BilletesAnimales3D: React.FC = () => {
  const frame = useCurrentFrame();
  const alto = k(frame, [[2, 0.1], [14, 0.4]]);
  const v = (n: string) => k(frame, [[T[n], 0], [T[n] + 10, 1], [E.ojo, 1], [E.ojo + 10, 0.4]]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto } }} />
        {Object.keys(LL).map((n) => (
          <Halo key={n} x={PT[n][0]} y={PT[n][1]} v={v(n)} color={AMARILLO} tam={n === "ballena" ? 0.9 : 0.7} />
        ))}
      </Estudio>
      <Chip desde={0} hasta={E.casual} x={540} y={300}>
        Tu billete: <span style={{ color: ACENTO }}>¿prócer o animal?</span>
      </Chip>
      <Chip desde={E.casual} hasta={E.dosmil16} x={540} y={300}>
        No es <span style={{ color: ACENTO }}>casualidad</span>
      </Chip>
      <Chip desde={E.dosmil16} hasta={E.tres} x={540} y={300}>
        BCRA · 2016 · <span style={{ color: ACENTO }}>6 billetes</span>
      </Chip>
      {ITEMS.map((it) => (
        <Chip key={it.n} desde={T[it.n]} hasta={it.hasta} x={540} y={300} color={AMARILLO}>
          <span style={{ color: AMARILLO }}>{it.val}</span> · {it.animal}
        </Chip>
      ))}
      <Chip desde={E.regiones} hasta={E.bcra} x={540} y={300}>
        Cada animal = <span style={{ color: ACENTO }}>una región</span>
      </Chip>
      <Chip desde={E.bcra} hasta={E.ojo} x={540} y={300}>
        BCRA · <span style={{ color: ACENTO }}>todos representados</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.pregunta} x={540} y={300}>
        Según el año, <span style={{ color: ACENTO }}>puede que no te toque</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={300}>
        ¿Qué <span style={{ color: ACENTO }}>animal</span> te tocó?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice que la plata no tiene nada lindo" />
      <Audio src={staticFile("066-billetes-animales/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [MIRA[0], MIRA[1] - 3, 17], mira: MIRA, fov: 34 }];
export const Portada066: React.FC = () => (
  <Portada arriba="tu billete tiene" grande="un animal" sello="¿cuál te tocó?" colorSello={C.azul} numero={66}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto: 0.5 } }} />
      {Object.keys(LL).map((n) => (
        <Halo key={n} x={PT[n][0]} y={PT[n][1]} v={1} color={AMARILLO} tam={n === "ballena" ? 0.9 : 0.7} />
      ))}
    </Estudio>
  </Portada>
);

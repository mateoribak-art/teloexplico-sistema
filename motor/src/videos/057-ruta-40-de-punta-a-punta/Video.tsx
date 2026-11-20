import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/057-ruta-40-de-punta-a-punta/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Argentina en datos: mapa real; una línea dorada recorre la Ruta 40 de La Quiaca (Jujuy) a Cabo Vírgenes (Santa Cruz).
// Recorrido ESQUEMÁTICO (puntos de paso aproximados, no el trazado exacto). Fuentes: Vialidad Nacional, Billiken, Canal 26.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  sabes: r.f(1),
  cinco: r.f(2),
  va: r.f(3),
  once: r.f(4),
  ojo: r.f(5),
  finde: r.f(6),
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

// de norte a sur, aproximado
const RUTA: LonLat[] = [
  [-65.6, -22.1], // La Quiaca
  [-65.4, -24.8], // Salta
  [-66.0, -26.1], // Cafayate
  [-67.0, -27.6],
  [-67.5, -29.4],
  [-68.6, -31.5],
  [-68.9, -33.0],
  [-69.6, -35.5],
  [-70.0, -39.0],
  [-71.3, -41.1],
  [-71.3, -42.9],
  [-70.9, -46.6],
  [-72.3, -50.3],
  [-68.4, -52.3], // Cabo Vírgenes
];
const PUNTOS = RUTA.map((p) => enMapa(p));
const [nx, ny] = PUNTOS[0];
const [sx, sy] = PUNTOS[PUNTOS.length - 1];
const MIRA: [number, number, number] = [0.2, 0.3, 0];

const TOMAS: Toma[] = [
  { f: 0, pos: [0.2, -3.2, 15], mira: MIRA, fov: 34 },
  { f: E.cinco, pos: [0.2, -3.0, 13.5], mira: MIRA, fov: 34 },
  { f: E.va, pos: [nx + 0.4, ny - 2.2, 8.5], mira: [nx, ny, 0], fov: 34 },
  { f: E.once - 10, pos: [(nx + sx) / 2 + 0.4, -3.2, 14.5], mira: [(nx + sx) / 2, (ny + sy) / 2, 0], fov: 34 },
  { f: E.once + 40, pos: [sx + 0.4, sy - 2.2, 8.5], mira: [sx, sy, 0], fov: 34 },
  { f: E.ojo, pos: [0.2, -3.2, 15.5], mira: MIRA, fov: 34 },
  { f: DURACION, pos: [0.6, -3.2, 14], mira: MIRA, fov: 34 },
];

/** Línea dorada que se dibuja hasta `p` (0..1) a lo largo de los puntos, con una bolita en la punta. */
const Linea: React.FC<{ p: number }> = ({ p }) => {
  if (p <= 0) return null;
  const n = PUNTOS.length - 1;
  const t = p * n;
  const i = Math.min(n - 1, Math.floor(t));
  const f = t - i;
  const pts: [number, number][] = PUNTOS.slice(0, i + 1);
  const [ax, ay] = PUNTOS[i];
  const [bx, by] = PUNTOS[i + 1];
  pts.push([ax + (bx - ax) * f, ay + (by - ay) * f]);
  const punta = pts[pts.length - 1];
  const tramos = [];
  for (let j = 0; j < pts.length - 1; j++) {
    const [x1, y1] = pts[j];
    const [x2, y2] = pts[j + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 0.0001) continue;
    tramos.push(
      <mesh key={j} position={[(x1 + x2) / 2, (y1 + y2) / 2, 0.3]} rotation={[0, 0, Math.atan2(y2 - y1, x2 - x1)]}>
        <boxGeometry args={[len + 0.03, 0.07, 0.05]} />
        <meshBasicMaterial color="#ffc53d" toneMapped={false} />
      </mesh>,
    );
  }
  return (
    <group>
      {tramos}
      <mesh position={[punta[0], punta[1], 0.35]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshBasicMaterial color="#ff4d4d" toneMapped={false} />
      </mesh>
    </group>
  );
};

const Pin: React.FC<{ x: number; y: number; v: number; color: string }> = ({ x, y, v, color }) => {
  if (v <= 0) return null;
  return (
    <group position={[x, y, 0.25]} scale={v * 1.4}>
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.01, 0.6, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, 0.62]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
    </group>
  );
};

const Halo: React.FC<{ x: number; y: number; v: number }> = ({ x, y, v }) => {
  if (v <= 0) return null;
  return (
    <mesh position={[x, y, 0.75]} scale={[v, v, 1]}>
      <circleGeometry args={[0.35, 48]} />
      <meshBasicMaterial color="#ffc53d" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
};

const DESTACAR = ["ruta", "cuarenta", "5.000", "once", "provincias", "larga", "Ojo:", "Mandáselo", "tramo", "Jujuy", "Santa", "Cruz"];
const CIFRAS: [string, string][] = [
  ["cinco mil cien", "5.100"],
  ["cinco mil doscientos", "5.200"],
  ["cinco mil", "5.000"],
  ["once", "11"],
  ["cuarenta", "40"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.sabes, "whoosh", 0.35],
  [E.cinco, "ding", 0.5],
  [E.va, "whoosh", 0.4],
  [E.va + 10, "pop", 0.45],
  [E.once, "tic", 0.45],
  [E.once + 50, "pop", 0.45],
  [E.ojo, "whoosh", 0.35],
  [E.finde, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const Ruta40Punta3D: React.FC = () => {
  const frame = useCurrentFrame();
  const alto = k(frame, [[2, 0.1], [14, 0.5]]);
  const linea = k(frame, [[E.va + 8, 0], [E.once + 70, 1]]);
  const vN = k(frame, [[E.va + 4, 0], [E.va + 14, 1]]);
  const vS = k(frame, [[E.once + 60, 0], [E.once + 72, 1]]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto } }} />
        <Linea p={linea} />
        <Halo x={nx} y={ny} v={vN} />
        <Pin x={nx} y={ny} v={vN * 0.6} color="#ff4d4d" />
        <Halo x={sx} y={sy} v={vS} />
        <Pin x={sx} y={sy} v={vS * 0.6} color="#ff4d4d" />
      </Estudio>
      <Chip desde={0} hasta={E.cinco} x={540} y={300}>
        ¿Cuánto es la <span style={{ color: ACENTO }}>ruta 40</span>?
      </Chip>
      <Chip desde={E.cinco} hasta={E.va} x={540} y={300}>
        <span style={{ color: ACENTO }}>+5.000</span> kilómetros
      </Chip>
      <Chip desde={E.va} hasta={E.once} x={540} y={300}>
        La Quiaca <span style={{ color: ACENTO }}>→</span> Cabo Vírgenes
      </Chip>
      <Chip desde={E.once} hasta={E.ojo} x={540} y={300}>
        <span style={{ color: ACENTO }}>11</span> provincias · la más larga
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.finde} x={540} y={300}>
        Vialidad · Billiken · <span style={{ color: ACENTO }}>5.100–5.200 km</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={300}>
        ¿Qué <span style={{ color: ACENTO }}>tramo</span> hiciste?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice que este verano hacen la cuarenta" />
      <Audio src={staticFile("057-ruta-40-de-punta-a-punta/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.2, -3.2, 15], mira: MIRA, fov: 34 }];
export const Portada057: React.FC = () => (
  <Portada arriba="¿hacés la ruta 40 este verano?" grande="más de 5.000 km" sello="11 PROVINCIAS" colorSello={C.azul} numero={57}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto: 0.5 } }} />
      <Linea p={1} />
      <Pin x={nx} y={ny} v={0.6} color="#ff4d4d" />
      <Pin x={sx} y={sy} v={0.6} color="#ff4d4d" />
    </Estudio>
  </Portada>
);

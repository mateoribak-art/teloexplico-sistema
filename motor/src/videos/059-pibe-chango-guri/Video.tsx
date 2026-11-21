import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/059-pibe-chango-guri/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Argentina en datos: mapa real; tres zonas se iluminan con la palabra que se usa más en cada una
// (Billiken): pibe (Buenos Aires), chango (norte), gurí (Litoral). Posiciones aproximadas.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  nombre: r.f(1),
  pibe: r.f(2),
  chango: r.f(3),
  guri: r.f(4),
  guarani: r.f(5),
  ojo: r.f(6),
  guardalo: r.f(7),
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
  pibe: [-58.5, -34.7],
  chango: [-65.4, -25.3],
  guri: [-57.9, -28.6],
};
const PT = {
  pibe: enMapa(LL.pibe),
  chango: enMapa(LL.chango),
  guri: enMapa(LL.guri),
};
const COL = { pibe: "#ffc53d", chango: "#ff6a8a", guri: "#5fd2ff" };
const MIRA: [number, number, number] = [0.2, 0.3, 0];

const enf = (p: [number, number], z = 9): Toma["pos"] => [p[0] + 0.3, p[1] - 2.2, z];
const TOMAS: Toma[] = [
  { f: 0, pos: [0.2, -3.2, 15], mira: MIRA, fov: 34 },
  { f: E.pibe - 6, pos: [0.2, -3.0, 13.5], mira: MIRA, fov: 34 },
  { f: E.pibe + 6, pos: enf(PT.pibe), mira: [PT.pibe[0], PT.pibe[1], 0], fov: 34 },
  { f: E.chango + 6, pos: enf(PT.chango), mira: [PT.chango[0], PT.chango[1], 0], fov: 34 },
  { f: E.guri + 6, pos: enf(PT.guri), mira: [PT.guri[0], PT.guri[1], 0], fov: 34 },
  { f: E.guarani, pos: [0.2, -3.2, 14], mira: MIRA, fov: 34 },
  { f: DURACION, pos: [0.6, -3.2, 14.5], mira: MIRA, fov: 34 },
];

const Pin: React.FC<{ x: number; y: number; v: number; color: string }> = ({ x, y, v, color }) => {
  if (v <= 0) return null;
  return (
    <group position={[x, y, 0.25]} scale={v * 1.5}>
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.01, 0.6, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, 0.62]}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
    </group>
  );
};

const Halo: React.FC<{ x: number; y: number; v: number; color: string; tam?: number }> = ({ x, y, v, color, tam = 1 }) => {
  if (v <= 0) return null;
  return (
    <mesh position={[x, y, 0.75]} scale={[v * tam, v * tam, 1]}>
      <circleGeometry args={[0.5, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} blending={THREE.NormalBlending} toneMapped={false} />
    </mesh>
  );
};

const DESTACAR = ["pibe", "chango", "gurí", "guaraní", "Ojo:", "Guardalo", "Mandáselo", "provincia", "distinto"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.nombre, "whoosh", 0.35],
  [E.pibe, "pop", 0.5],
  [E.chango, "pop", 0.5],
  [E.guri, "pop", 0.5],
  [E.guarani, "whoosh", 0.35],
  [E.ojo, "tic", 0.4],
  [E.guardalo, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const PibeChangoGuri3D: React.FC = () => {
  const frame = useCurrentFrame();
  const alto = k(frame, [[2, 0.1], [14, 0.5]]);
  const vP = k(frame, [[E.pibe, 0], [E.pibe + 10, 1]]);
  const vC = k(frame, [[E.chango, 0], [E.chango + 10, 1]]);
  const vG = k(frame, [[E.guri, 0], [E.guri + 10, 1]]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto } }} />
        <Halo x={PT.pibe[0]} y={PT.pibe[1]} v={vP} color={COL.pibe} tam={1.1} />
        <Pin x={PT.pibe[0]} y={PT.pibe[1]} v={vP * 0.6} color={COL.pibe} />
        <Halo x={PT.chango[0]} y={PT.chango[1]} v={vC} color={COL.chango} tam={1.6} />
        <Pin x={PT.chango[0]} y={PT.chango[1]} v={vC * 0.6} color={COL.chango} />
        <Halo x={PT.guri[0]} y={PT.guri[1]} v={vG} color={COL.guri} tam={1.4} />
        <Pin x={PT.guri[0]} y={PT.guri[1]} v={vG * 0.6} color={COL.guri} />
      </Estudio>
      <Chip desde={0} hasta={E.nombre} x={540} y={300}>
        ¿<span style={{ color: ACENTO }}>Pibe</span>, chango o gurí?
      </Chip>
      <Chip desde={E.nombre} hasta={E.pibe} x={540} y={300}>
        Un chico, <span style={{ color: ACENTO }}>varios nombres</span>
      </Chip>
      <Chip desde={E.pibe} hasta={E.chango} x={540} y={300} color={COL.pibe}>
        <span style={{ color: COL.pibe }}>Pibe</span> · Buenos Aires
      </Chip>
      <Chip desde={E.chango} hasta={E.guri} x={540} y={300} color={COL.chango}>
        <span style={{ color: COL.chango }}>Chango</span> · el norte
      </Chip>
      <Chip desde={E.guri} hasta={E.guarani} x={540} y={300} color={COL.guri}>
        <span style={{ color: COL.guri }}>Gurí</span> · el Litoral
      </Chip>
      <Chip desde={E.guarani + 6} hasta={E.ojo} x={540} y={300}>
        Billiken · RAE · <span style={{ color: ACENTO }}>guaraní</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.guardalo} x={540} y={300}>
        Usos comunes, <span style={{ color: ACENTO }}>no fronteras</span>
      </Chip>
      <Chip desde={E.guardalo} hasta={E.pregunta} x={540} y={300}>
        <span style={{ color: COL.pibe }}>pibe</span> · <span style={{ color: COL.chango }}>chango</span> · <span style={{ color: COL.guri }}>gurí</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={300}>
        ¿Cómo le decís <span style={{ color: ACENTO }}>vos</span>?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice chango y no pibe" />
      <Audio src={staticFile("059-pibe-chango-guri/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.2, -3.2, 15], mira: MIRA, fov: 34 }];
export const Portada059: React.FC = () => (
  <Portada arriba="¿cómo le decís a un chico en tu provincia?" grande="pibe, chango o gurí" sello="MAPA" colorSello={C.azul} numero={59}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto: 0.5 } }} />
      <Halo x={PT.pibe[0]} y={PT.pibe[1]} v={1} color={COL.pibe} tam={1.1} />
      <Pin x={PT.pibe[0]} y={PT.pibe[1]} v={0.6} color={COL.pibe} />
      <Halo x={PT.chango[0]} y={PT.chango[1]} v={1} color={COL.chango} tam={1.6} />
      <Pin x={PT.chango[0]} y={PT.chango[1]} v={0.6} color={COL.chango} />
      <Halo x={PT.guri[0]} y={PT.guri[1]} v={1} color={COL.guri} tam={1.4} />
      <Pin x={PT.guri[0]} y={PT.guri[1]} v={0.6} color={COL.guri} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/063-che-origen/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mapa de Argentina: "che" y sus tres versiones de origen (todas sin confirmar).
// Mapuche (sur), guaraní (nordeste) y valenciano (solo en texto: España queda fuera del mapa). Posiciones aproximadas.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  experto: r.f(1),
  mapuche: r.f(2),
  guarani: r.f(3),
  valenciano: r.f(4),
  ojo: r.f(5),
  uso: r.f(6),
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

const LL: Record<string, LonLat> = {
  mapuche: [-70.5, -39.0],
  guarani: [-57.5, -26.5],
  uso: [-58.4, -34.6],
};
const PT = { mapuche: enMapa(LL.mapuche), guarani: enMapa(LL.guarani), uso: enMapa(LL.uso) };
const COL = { mapuche: "#ffc53d", guarani: "#5fd2ff", valenciano: "#ff6a8a" };
const MIRA: [number, number, number] = [0.2, 0.3, 0];

const enf = (p: [number, number], z = 9): Toma["pos"] => [p[0] + 0.3, p[1] - 2.2, z];
const TOMAS: Toma[] = [
  { f: 0, pos: [0.2, -3.2, 15], mira: MIRA, fov: 34 },
  { f: E.experto, pos: [0.2, -3.0, 13.5], mira: MIRA, fov: 34 },
  { f: E.mapuche + 6, pos: enf(PT.mapuche), mira: [PT.mapuche[0], PT.mapuche[1], 0], fov: 34 },
  { f: E.guarani + 6, pos: enf(PT.guarani), mira: [PT.guarani[0], PT.guarani[1], 0], fov: 34 },
  { f: E.valenciano, pos: [0.2, -3.2, 14.5], mira: MIRA, fov: 34 },
  { f: E.uso, pos: enf(PT.uso, 11), mira: [PT.uso[0], PT.uso[1], 0], fov: 34 },
  { f: E.pregunta, pos: [0.2, -3.2, 14], mira: MIRA, fov: 34 },
  { f: DURACION, pos: [0.6, -3.2, 14.5], mira: MIRA, fov: 34 },
];

const Halo: React.FC<{ x: number; y: number; v: number; color: string; tam?: number }> = ({ x, y, v, color, tam = 1 }) => {
  if (v <= 0) return null;
  return (
    <mesh position={[x, y, 0.75]} scale={[v * tam, v * tam, 1]}>
      <circleGeometry args={[0.5, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} blending={THREE.NormalBlending} toneMapped={false} />
    </mesh>
  );
};

const DESTACAR = ["che", "mapuche", "guaraní", "valenciano", "Ojo:", "Mandáselo", "gente", "mi", "confirmada"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.experto, "sello", 0.45],
  [E.mapuche, "pop", 0.5],
  [E.guarani, "pop", 0.5],
  [E.valenciano, "pop", 0.5],
  [E.ojo, "tic", 0.4],
  [E.uso, "whoosh", 0.35],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const CheOrigen3D: React.FC = () => {
  const frame = useCurrentFrame();
  const alto = k(frame, [[2, 0.1], [14, 0.5]]);
  const vM = k(frame, [[E.mapuche, 0], [E.mapuche + 10, 1], [E.ojo, 1], [E.ojo + 10, 0.5]]);
  const vG = k(frame, [[E.guarani, 0], [E.guarani + 10, 1], [E.ojo, 1], [E.ojo + 10, 0.5]]);
  const vU = k(frame, [[E.uso, 0], [E.uso + 10, 1]]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto } }} />
        <Halo x={PT.mapuche[0]} y={PT.mapuche[1]} v={vM} color={COL.mapuche} tam={1.5} />
        <Halo x={PT.guarani[0]} y={PT.guarani[1]} v={vG} color={COL.guarani} tam={1.4} />
        <Halo x={PT.uso[0]} y={PT.uso[1]} v={vU} color="#38e08c" tam={1.2} />
      </Estudio>
      <Chip desde={0} hasta={E.experto} x={540} y={300}>
        ¿De dónde sale el <span style={{ color: ACENTO }}>che</span>?
      </Chip>
      <Chip desde={E.experto} hasta={E.mapuche} x={540} y={300}>
        Kalinowski · <span style={{ color: ACENTO }}>origen inseguro</span>
      </Chip>
      <Chip desde={E.mapuche} hasta={E.guarani} x={540} y={300} color={COL.mapuche}>
        <span style={{ color: COL.mapuche }}>Mapuche</span> · che = gente
      </Chip>
      <Chip desde={E.guarani} hasta={E.valenciano} x={540} y={300} color={COL.guarani}>
        <span style={{ color: COL.guarani }}>Guaraní</span> · che = mi
      </Chip>
      <Chip desde={E.valenciano} hasta={E.ojo} x={540} y={300} color={COL.valenciano}>
        <span style={{ color: COL.valenciano }}>Valenciano</span> · una interjección
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.uso} x={540} y={300}>
        Tres versiones, <span style={{ color: ACENTO }}>ninguna confirmada</span>
      </Chip>
      <Chip desde={E.uso + 6} hasta={E.pregunta} x={540} y={300} color="#38e08c">
        RAE · <span style={{ color: "#38e08c" }}>Argentina, Paraguay y Uruguay</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={300}>
        <span style={{ color: COL.mapuche }}>mapuche</span> · <span style={{ color: COL.guarani }}>guaraní</span> · <span style={{ color: COL.valenciano }}>valenciano</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que no puede hablar sin decir che" />
      <Audio src={staticFile("063-che-origen/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.2, -3.2, 15], mira: MIRA, fov: 34 }];
export const Portada063: React.FC = () => (
  <Portada arriba="¿de dónde sale?" grande="el “che”" sello="tres versiones" colorSello={C.azul} numero={63}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto: 0.5 } }} />
      <Halo x={PT.mapuche[0]} y={PT.mapuche[1]} v={1} color={COL.mapuche} tam={1.5} />
      <Halo x={PT.guarani[0]} y={PT.guarani[1]} v={1} color={COL.guarani} tam={1.4} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/067-dulce-de-leche-origen/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mapa del Río de la Plata y Chile: Cañuelas (la leyenda de 1829) se enciende, después Uruguay y Chile reclaman el origen.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  discutido: r.f(1),
  canuelas: r.f(2),
  siesta: r.f(3),
  nacio: r.f(4),
  reclaman: r.f(5),
  ojo: r.f(6),
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
  canuelas: [-58.76, -35.05],
  uruguay: [-56, -32.8],
  chile: [-71, -33.5],
};
const PT: Record<string, [number, number]> = {};
for (const n of Object.keys(LL)) PT[n] = enMapa(LL[n]) as [number, number];
const AMARILLO = "#ffd24a";
const ROJO = "#ff6b5e";
const MIRA: [number, number, number] = [PT.canuelas[0] - 1.5, PT.canuelas[1] + 0.5, 0];

const TOMAS: Toma[] = [
  { f: 0, pos: [MIRA[0], MIRA[1] - 3, 17], mira: MIRA, fov: 34 },
  { f: E.canuelas, pos: [PT.canuelas[0], PT.canuelas[1] - 2, 8], mira: [PT.canuelas[0], PT.canuelas[1], 0], fov: 34 },
  { f: E.reclaman, pos: [MIRA[0], MIRA[1] - 3, 17], mira: MIRA, fov: 34 },
  { f: E.pregunta, pos: [MIRA[0], MIRA[1] - 3, 15], mira: MIRA, fov: 34 },
  { f: DURACION, pos: [MIRA[0] + 0.4, MIRA[1] - 3, 15.5], mira: MIRA, fov: 34 },
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

const DESTACAR = ["discutido", "Cañuelas", "Rosas", "Lavalle", "leyenda", "Uruguay", "Chile", "Ojo:", "Mandáselo", "cuchara", "pan"];
const CIFRAS: [string, string][] = [
  ["mil ochocientos veintinueve", "1829"],
  ["mil ochocientos catorce", "1814"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.discutido, "sello", 0.45],
  [E.canuelas, "whoosh", 0.4],
  [E.siesta, "pop", 0.4],
  [E.nacio, "tic", 0.4],
  [E.reclaman, "whoosh", 0.4],
  [E.reclaman + 60, "pop", 0.4],
  [E.reclaman + 110, "pop", 0.4],
  [E.ojo, "sello", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const DulceDeLeche3D: React.FC = () => {
  const frame = useCurrentFrame();
  const alto = k(frame, [[2, 0.1], [14, 0.4]]);
  const vC = k(frame, [[E.canuelas, 0], [E.canuelas + 10, 1], [E.reclaman, 1], [E.reclaman + 10, 0.5]]);
  const vU = k(frame, [[E.reclaman + 60, 0], [E.reclaman + 70, 1]]);
  const vCh = k(frame, [[E.reclaman + 110, 0], [E.reclaman + 120, 1]]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Mapa3D
          alcance={40}
          resaltar={{
            Argentina: { color: "#4d8fe0", alto },
            Uruguay: { color: vU > 0 ? ROJO : "#3a4a66", alto: vU > 0 ? 0.4 : 0.05 },
            Chile: { color: vCh > 0 ? ROJO : "#3a4a66", alto: vCh > 0 ? 0.4 : 0.05 },
          }}
        />
        <Halo x={PT.canuelas[0]} y={PT.canuelas[1]} v={vC} color={AMARILLO} tam={0.6} />
        <Halo x={PT.uruguay[0]} y={PT.uruguay[1]} v={vU} color={ROJO} tam={0.6} />
        <Halo x={PT.chile[0]} y={PT.chile[1]} v={vCh} color={ROJO} tam={0.6} />
      </Estudio>
      <Chip desde={0} hasta={E.discutido} x={540} y={300}>
        Dulce de leche: <span style={{ color: ACENTO }}>¿argentino?</span>
      </Chip>
      <Chip desde={E.discutido} hasta={E.canuelas} x={540} y={300}>
        Su origen está <span style={{ color: ACENTO }}>discutido</span>
      </Chip>
      <Chip desde={E.canuelas} hasta={E.nacio} x={540} y={300} color={AMARILLO}>
        <span style={{ color: AMARILLO }}>1829</span> · Cañuelas · leyenda
      </Chip>
      <Chip desde={E.nacio} hasta={E.reclaman} x={540} y={300}>
        Según la <span style={{ color: ACENTO }}>leyenda</span>
      </Chip>
      <Chip desde={E.reclaman} hasta={E.reclaman + 60} x={540} y={300}>
        Cartas de <span style={{ color: ACENTO }}>1814</span> · Balmaceda
      </Chip>
      <Chip desde={E.reclaman + 60} hasta={E.ojo} x={540} y={300} color={ROJO}>
        También lo reclaman: <span style={{ color: ROJO }}>Uruguay y Chile</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.pregunta} x={540} y={300}>
        Leyenda, <span style={{ color: ACENTO }}>no hecho comprobado</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={300}>
        ¿<span style={{ color: ACENTO }}>Cuchara</span> o <span style={{ color: ACENTO }}>pan</span>?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al uruguayo que dice que es de ellos" />
      <Audio src={staticFile("067-dulce-de-leche-origen/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [MIRA[0], MIRA[1] - 3, 16], mira: MIRA, fov: 34 }];
export const Portada067: React.FC = () => (
  <Portada arriba="el dulce de leche" grande="¿es nuestro?" sello="nadie lo probó" colorSello={C.azul} numero={67}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mapa3D
        alcance={40}
        resaltar={{
          Argentina: { color: "#4d8fe0", alto: 0.5 },
          Uruguay: { color: ROJO, alto: 0.4 },
          Chile: { color: ROJO, alto: 0.4 },
        }}
      />
      <Halo x={PT.canuelas[0]} y={PT.canuelas[1]} v={1} color={AMARILLO} tam={0.6} />
    </Estudio>
  </Portada>
);

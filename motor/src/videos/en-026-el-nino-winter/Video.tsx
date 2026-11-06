import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/en-026-el-nino-winter/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Weather explained #6: mapa real del Pacífico y EE. UU. Una mancha naranja de agua cálida sobre el ecuador
// (Niño-3.4, +2,1 °C), una ruta de tormentas que viaja hacia EE. UU., y dos zonas: Sur más húmedo, Norte más cálido.
// Fondo oscuro, un acento. Fuente: NOAA CPC, discusión ENSO del 8/10/2026 (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  vuelve: r.f(1),
  agua: r.f(2),
  noaa: r.f(3),
  ruta: r.f(4),
  zonas: r.f(5),
  ojo: r.f(6),
  consejo: r.f(7),
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

const CENTRO: LonLat = [-122, 20];
const PACIFICO: LonLat = [-145, 0];
const SUR: LonLat = [-95, 32];
const NORTE: LonLat = [-100, 45];
const mp = (ll: LonLat) => enMapa(ll, CENTRO);
const [px, py] = mp(PACIFICO);
const [ux, uy] = mp([-98, 38]);
const mx = (px + ux) / 2;
const my = (py + uy) / 2;

const TOMAS: Toma[] = [
  { f: 0, pos: [mx, my - 5, 27], mira: [mx, my, 0], fov: 34 },
  { f: E.vuelve + 6, pos: [px + 0.5, py - 3, 16], mira: [px, py, 0], fov: 34 },
  { f: E.agua + 6, pos: [px + 0.3, py - 3, 14.5], mira: [px, py, 0], fov: 34 },
  { f: E.noaa + 6, pos: [px + 0.8, py - 3, 16], mira: [px + 0.4, py + 0.4, 0], fov: 34 },
  { f: E.ruta + 6, pos: [mx, my - 5, 27], mira: [mx, my, 0], fov: 34 },
  { f: E.zonas + 8, pos: [ux, uy - 4, 23], mira: [ux, uy, 0], fov: 34 },
  { f: E.ojo + 10, pos: [ux, uy - 4, 25], mira: [ux, uy, 0], fov: 34 },
  { f: DURACION, pos: [mx + 0.3, my - 5, 27], mira: [mx, my, 0], fov: 34 },
];

const curva = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(px + 0.3, py + 0.4, 0.5),
  new THREE.Vector3((px + ux) / 2, (py + uy) / 2 + 1.6, 2.2),
  new THREE.Vector3(ux - 1.2, uy - 0.8, 0.5),
);

/** Ruta de tormentas: se dibuja con p de 0 a 1 y lleva un punto brillante. */
const Ruta: React.FC<{ p: number }> = ({ p }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(curva, 100, 0.05, 8, false), []);
  if (p <= 0) return null;
  geo.setDrawRange(0, Math.floor(geo.index!.count * p));
  const punta = curva.getPoint(p);
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color={ACENTO} transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh position={punta}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshBasicMaterial color="#fff1b8" toneMapped={false} />
      </mesh>
      <mesh position={punta}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial color="#ffc53d" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

/** Mancha luminosa sobre el mapa (agua cálida / zonas de EE. UU.). */
const Mancha: React.FC<{ en: LonLat; ancho: number; alto: number; color: string; v: number; z?: number }> = ({ en, ancho, alto, color, v, z = 0.55 }) => {
  if (v <= 0.01) return null;
  const [x, y] = mp(en);
  return (
    <group position={[x, y, z]} scale={[ancho * v, alto * v, 1]}>
      <mesh>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.55 * v} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[1.3, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.2 * v} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

const DESTACAR = ["El", "Niño", "back", "four", "NOAA", "strong", "storm", "track", "wetter", "warmer", "odds", "blizzard", "weather", "Send"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.vuelve, "whoosh", 0.35],
  [E.vuelve + 6, "pop", 0.45],
  [E.agua, "whoosh", 0.4],
  [E.agua + 10, "tic", 0.4],
  [E.noaa, "ding", 0.45],
  [E.ruta, "whoosh", 0.4],
  [E.zonas, "whoosh", 0.35],
  [E.zonas + 12, "pop", 0.45],
  [E.ojo, "whoosh", 0.35],
  [E.consejo, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const ElNinoWinterEn026: React.FC = () => {
  const frame = useCurrentFrame();
  const agua = k(frame, [[E.vuelve, 0], [E.vuelve + 14, 1], [E.ruta, 1], [E.ruta + 20, 0.6]]) * (1 + 0.06 * Math.sin(frame / 6));
  const p = k(frame, [[E.ruta + 4, 0], [E.ruta + 50, 1]]);
  const sur = k(frame, [[E.zonas + 6, 0], [E.zonas + 22, 1], [E.cta, 1], [E.cta + 10, 0.4]]);
  const norte = k(frame, [[E.zonas + 40, 0], [E.zonas + 56, 1], [E.cta, 1], [E.cta + 10, 0.4]]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Mapa3D centro={CENTRO} alcance={75} resaltar={{ "United States of America": { color: "#5b7fa8", alto: 0.3 } }} />
        <Mancha en={PACIFICO} ancho={1.5} alto={0.55} color="#ff7a2e" v={agua} />
        <Ruta p={p} />
        <Mancha en={SUR} ancho={1.7} alto={0.8} color="#2f8fff" v={sur} />
        <Mancha en={NORTE} ancho={1.7} alto={0.7} color="#ff8a2e" v={norte} />
      </Estudio>
      <Chip desde={0} hasta={E.vuelve} x={540} y={300}>
        Your winter, <span style={{ color: ACENTO }}>2026–27</span>
      </Chip>
      <Chip desde={E.vuelve} hasta={E.agua} x={540} y={300}>
        <span style={{ color: ACENTO }}>El Niño</span> · Advisory in effect
      </Chip>
      <Chip desde={E.agua} hasta={E.noaa} x={540} y={300}>
        Central Pacific: <span style={{ color: ACENTO }}>+2.1°C ≈ +4°F</span>
      </Chip>
      <Chip desde={E.noaa} hasta={E.ruta} x={540} y={300}>
        NOAA CPC · <span style={{ color: ACENTO }}>Oct 8, 2026</span>
      </Chip>
      <Chip desde={E.ruta} hasta={E.zonas} x={540} y={300}>
        Storm track <span style={{ color: ACENTO }}>shifts</span>
      </Chip>
      <Chip desde={E.zonas} hasta={E.ojo} x={540} y={300}>
        South <span style={{ color: "#6bb8ff" }}>wetter</span> · North <span style={{ color: ACENTO }}>warmer</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.consejo} x={540} y={300}>
        The odds, <span style={{ color: ACENTO }}>not a promise</span>
      </Chip>
      <Chip desde={E.consejo} hasta={E.cta} x={540} y={300}>
        Check <span style={{ color: ACENTO }}>weather.gov</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who already predicted the whole winter" />
      <Audio src={staticFile("en-026-el-nino-winter/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [mx, my - 5, 27], mira: [mx, my, 0], fov: 34 }];
export const PortadaEn026: React.FC = () => (
  <Portada arriba="your winter forecast starts here" grande="El Niño is back" sello="WEATHER" colorSello={C.azul} numero={26}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mapa3D centro={CENTRO} alcance={75} resaltar={{ "United States of America": { color: "#5b7fa8", alto: 0.3 } }} />
      <Mancha en={PACIFICO} ancho={1.5} alto={0.55} color="#ff7a2e" v={1} />
      <Ruta p={1} />
    </Estudio>
  </Portada>
);

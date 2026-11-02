import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/demo-hora-corrida/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Argentina en datos #1: el mapa real, la línea de la hora oficial (45° O) en el mar y el sol que cruza el país.
// Datos: mediodía solar calculado (ver guion.json). Fondo oscuro, un acento.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  tarde: r.f(1),
  linea: r.f(2),
  cruza: r.f(3),
  cordillera: r.w(3, "cordillera"),
  bsas: r.f(4),
  mendoza: r.f(5),
  ojo: r.f(6),
  sombra: r.f(7),
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

const LAT_SOL = -34.5;
const BSAS: LonLat = [-58.4, -34.6];
const MENDOZA: LonLat = [-68.8, -32.9];
const ESTE = -53.6;
const OESTE = -73.6;
const [bx, by] = enMapa(BSAS);
const [mx, my] = enMapa(MENDOZA);
const [lx] = enMapa([-45, LAT_SOL]);

const TOMAS: Toma[] = [
  { f: 0, pos: [1.6, -3.4, 13.5], mira: [1.1, -0.3, 0], fov: 34 },
  { f: E.tarde, pos: [1.4, -3.0, 12.4], mira: [1.0, -0.3, 0], fov: 34 },
  { f: E.linea + 10, pos: [lx - 0.2, -3.2, 10.5], mira: [lx - 0.6, -0.6, 0], fov: 34 },
  { f: E.cruza + 8, pos: [1.0, -3.6, 14.5], mira: [0.6, -0.3, 0], fov: 34 },
  { f: E.bsas - 4, pos: [0.6, -3.6, 14.2], mira: [0.4, -0.3, 0], fov: 34 },
  { f: E.bsas + 10, pos: [bx + 0.4, by - 2.6, 8.6], mira: [bx - 0.2, by, 0], fov: 34 },
  { f: E.mendoza + 10, pos: [mx + 0.6, my - 2.6, 8.6], mira: [mx + 0.2, my, 0], fov: 34 },
  { f: E.ojo + 14, pos: [1.2, -3.4, 13.8], mira: [0.9, -0.3, 0], fov: 34 },
  { f: DURACION, pos: [1.6, -3.4, 13.5], mira: [1.1, -0.3, 0], fov: 34 },
];

const lonSol = (f: number) =>
  k(f, [
    [E.cruza + 6, -45],
    [E.cordillera + 6, OESTE],
    [E.bsas - 2, OESTE],
    [E.bsas + 12, BSAS[0]],
    [E.mendoza, BSAS[0]],
    [E.mendoza + 12, MENDOZA[0]],
    [E.cta, MENDOZA[0]],
    [E.cta + 30, -45],
  ]);

const Sol: React.FC<{ lon: number }> = ({ lon }) => {
  const [x, y] = enMapa([lon, LAT_SOL]);
  return (
    <group position={[x, y, 0.75]}>
      <mesh>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshBasicMaterial color="#fff1b8" toneMapped={false} />
      </mesh>
      {[0.24, 0.34, 0.48].map((s, i) => (
        <mesh key={s}>
          <sphereGeometry args={[s, 32, 32]} />
          <meshBasicMaterial color="#ffc53d" transparent opacity={[0.3, 0.12, 0.05][i]} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      <pointLight color="#ffd27a" intensity={3} distance={3} decay={1.6} />
    </group>
  );
};

const Meridiano: React.FC<{ p: number; brillo: number }> = ({ p, brillo }) => {
  const geo = useMemo(() => {
    const pts = Array.from({ length: 27 }, (_, i) => {
      const [x, y] = enMapa([-45, -30 - i]);
      return new THREE.Vector3(x, y, 0.08);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.035, 8, false);
  }, []);
  if (p <= 0) return null;
  geo.setDrawRange(0, Math.floor(geo.index!.count * p));
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={ACENTO} transparent opacity={0.55 + 0.45 * brillo} toneMapped={false} />
    </mesh>
  );
};

const Pin: React.FC<{ en: LonLat; v: number }> = ({ en, v }) => {
  if (v <= 0) return null;
  const [x, y] = enMapa(en);
  return (
    <group position={[x, y, 0.25]} scale={v}>
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.01, 0.6, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, 0.62]}>
        <sphereGeometry args={[0.11, 24, 24]} />
        <meshStandardMaterial color="#ff4d4d" roughness={0.35} />
      </mesh>
    </group>
  );
};

const Minutos: React.FC = () => {
  const frame = useCurrentFrame();
  const lon = lonSol(frame);
  const v = frame < E.bsas - 2 ? Math.round(interpolate(lon, [OESTE, ESTE], [80, 0], clamp)) : 80;
  return (
    <Chip desde={E.cruza + 6} hasta={E.bsas} x={540} y={300}>
      De punta a punta: <span style={{ color: ACENTO }}>{v} min</span>
    </Chip>
  );
};

const DESTACAR = ["12", "tarde", "imaginaria", "este", "cordillera", "alto", "Mendoza", "reloj", "ritmo", "sombra", "achicando", "Mandáselo"];
const CIFRAS: [string, string][] = [["doce", "12"]];

const efectos: Efecto[] = [
  [E.tarde, "whoosh", 0.35],
  [E.linea, "whoosh", 0.4],
  [E.linea + 8, "tic", 0.4],
  [E.cruza + 6, "tic", 0.5],
  [E.cordillera + 6, "ding", 0.45],
  [E.bsas, "whoosh", 0.35],
  [E.bsas + 10, "pop", 0.45],
  [E.mendoza, "whoosh", 0.35],
  [E.mendoza + 10, "pop", 0.45],
  [E.ojo, "whoosh", 0.35],
  [E.sombra, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const MediodiaHoraCorrida3D: React.FC = () => {
  const frame = useCurrentFrame();
  const altoAr = k(frame, [
    [0, 0.25],
    [E.cruza, 0.25],
    [E.cruza + 10, 0.6],
    [E.ojo, 0.6],
    [E.ojo + 10, 0.25],
  ]);
  const brillo = k(frame, [
    [E.linea, 0],
    [E.linea + 8, 1],
    [E.cruza, 1],
    [E.cruza + 10, 0],
  ]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Mapa3D resaltar={{ Argentina: { color: "#4d8fe0", alto: altoAr } }} />
        <Meridiano p={1} brillo={brillo} />
        <Sol lon={lonSol(frame)} />
        <Pin en={BSAS} v={k(frame, [[E.bsas + 8, 0], [E.bsas + 14, 1]])} />
        <Pin en={MENDOZA} v={k(frame, [[E.mendoza + 8, 0], [E.mendoza + 14, 1]])} />
      </Estudio>
      <Chip desde={0} hasta={E.linea} x={540} y={300}>
        Reloj: <span style={{ color: ACENTO }}>12:00</span> · el sol, sobre el mar
      </Chip>
      <Chip desde={E.linea + 6} hasta={E.cruza} x={540} y={300}>
        Hora oficial: <span style={{ color: ACENTO }}>45° O</span>
      </Chip>
      <Minutos />
      <Chip desde={E.bsas + 8} hasta={E.mendoza} x={540} y={300}>
        Buenos Aires: <span style={{ color: ACENTO }}>12:37 a 13:08</span>
      </Chip>
      <Chip desde={E.mendoza + 8} hasta={E.ojo} x={540} y={300}>
        Mendoza: <span style={{ color: ACENTO }}>13:19 a 13:50</span>
      </Chip>
      <Chip desde={E.sombra} hasta={E.cta} x={540} y={300}>
        A las <span style={{ color: ACENTO }}>12:00</span> la sombra todavía se achica
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice que almorzar a la una es tarde" />
      <Audio src={staticFile("026-mediodia-hora-corrida/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [1.2, -3.4, 13.8], mira: [0.9, -0.3, 0], fov: 34 }];
export const Portada026: React.FC = () => (
  <Portada arriba="¿a qué hora es el mediodía?" grande="no es a las 12" sello="ARGENTINA" colorSello={C.azul} numero={26}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mapa3D resaltar={{ Argentina: { color: "#4d8fe0", alto: 0.6 } }} />
      <Sol lon={-45} />
    </Estudio>
  </Portada>
);

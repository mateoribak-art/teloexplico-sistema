import React from "react";
import { AbsoluteFill, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import tiemposJson from "../../../public/en-013-searing-juices/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Bife, ChispasCalor, Sarten, Vapor } from "../../kit3d/objetos/Bife";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un bife en una sartén de hierro, con una costra oscura que se forma y gotas de jugo que siguen escapando por los costados.
// Corte a una tabla con dos bifes: sellado primero / sellado al final, con charcos de jugo del mismo tamaño (ilustración, sin números).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  costra: r.f(2),
  sizzle: r.f(3),
  estudio: r.f(4),
  porque: r.f(5),
  ojo: r.f(6),
  consejo: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CRUDO = [0, 0, 0, 0, 0, 0];
const COCIDO = [0.9, 0.55, 0.3, 0.3, 0.55, 0.9];
const mezcla = (a: number[], b: number[], t: number) => a.map((x, i) => x + (b[i] - x) * t);

const TOMAS: Toma[] = [
  { f: 0, pos: [0.5, 3.4, 11.5], mira: [0.4, 0.3, 0], fov: 40 },
  { f: E.gancho + 20, pos: [0.3, 2.6, 8.5], mira: [0, 0.4, 0], fov: 38 },
  { f: E.mito, pos: [0.5, 3.4, 11.5], mira: [0.4, 0.3, 0], fov: 40 },
  { f: E.costra, pos: [0.2, 1.2, 6.5], mira: [0, 0.3, 0], fov: 36 },
  { f: E.sizzle, pos: [0.3, 1.6, 5.5], mira: [0, 0.5, 0], fov: 36 },
  { f: E.estudio - 2, pos: [0.3, 1.8, 6.5], mira: [0, 0.4, 0], fov: 38 },
  { f: E.estudio, pos: [0, 2.4, 11.5], mira: [0, 0.2, 0], fov: 38 },
  { f: E.porque - 2, pos: [0, 2.0, 9.5], mira: [0, 0.2, 0], fov: 38 },
  { f: E.porque, pos: [0.3, 2.8, 8.5], mira: [0, 0.4, 0], fov: 38 },
  { f: E.ojo, pos: [0.5, 3.4, 11.5], mira: [0.4, 0.3, 0], fov: 40 },
  { f: E.consejo, pos: [0.3, 2.6, 8.5], mira: [0, 0.4, 0], fov: 38 },
  { f: E.cta, pos: [0.5, 3.4, 11.5], mira: [0.4, 0.3, 0], fov: 40 },
  { f: DURACION, pos: [0.5, 3.4, 11.5], mira: [0.4, 0.3, 0], fov: 40 },
];

const enTabla = (f: number) => f >= E.estudio && f < E.porque;

/** gotas de jugo que salen por los costados del bife y caen a la sartén */
const Jugo: React.FC<{ frame: number; cantidad: number; ancho?: number }> = ({ frame, cantidad, ancho = 1.5 }) => {
  if (cantidad <= 0.02) return null;
  const n = Math.round(12 * cantidad);
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const t = (frame * (0.025 + random(`jv${i}`) * 0.015) + random(`jf${i}`)) % 1;
        const lado = i % 2 === 0 ? 1 : -1;
        const x = lado * (ancho / 2 + 0.02 + t * 0.12);
        const y = 0.3 - t * 0.2;
        return (
          <mesh key={i} position={[x, y, (random(`jz${i}`) - 0.5) * 0.8]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshBasicMaterial color="#ff6f8a" transparent opacity={0.95 * Math.sin(Math.PI * Math.min(1, t * 1.2))} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

const Tabla: React.FC = () => {
  const geo = React.useMemo(() => new RoundedBoxGeometry(5.0, 0.12, 2.4, 3, 0.05), []);
  return (
    <mesh geometry={geo} position={[0, -0.06, 0]} receiveShadow>
      <meshStandardMaterial color="#9a6b3f" roughness={0.75} />
    </mesh>
  );
};

const Charco: React.FC<{ x: number; t: number }> = ({ x, t }) => (
  <mesh position={[x, 0.006, 0.75]} rotation={[-Math.PI / 2, 0, 0]} scale={[t, t * 0.7, 1]}>
    <circleGeometry args={[0.55, 40]} />
    <meshBasicMaterial color="#ff6f8a" transparent opacity={0.85} depthWrite={false} />
  </mesh>
);

const Escena: React.FC<{ frame: number }> = ({ frame }) => {
  if (enTabla(frame)) {
    const t = interpolate(frame, [E.estudio, E.estudio + 24], [0, 1], clamp);
    const c = interpolate(frame, [E.estudio + 24, E.estudio + 70], [0, 1], clamp);
    return (
      <group>
        <Tabla />
        <group position={[-1.2, 0, -0.2]} scale={t}>
          <Bife e={{ frame, perfil: COCIDO, costra: 0.9, vueltas: [] }} ancho={1.6} />
        </group>
        <group position={[1.2, 0, -0.2]} scale={t}>
          <Bife e={{ frame, perfil: COCIDO, costra: 0.9, vueltas: [] }} ancho={1.6} />
        </group>
        <Charco x={-1.2} t={c} />
        <Charco x={1.2} t={c} />
      </group>
    );
  }
  const crudo = interpolate(frame, [0, E.costra], [0, 1], clamp);
  const costra = interpolate(frame, [0, E.sizzle], [0.05, 0.9], clamp);
  const perfil = mezcla(CRUDO, COCIDO, 0.15 + crudo * 0.5);
  const caliente = interpolate(frame, [0, 20], [0, 1], clamp);
  return (
    <group>
      <Sarten calor={caliente} />
      <group position={[0, 0.13, 0]}>
        <Bife e={{ frame, perfil, costra, vueltas: [] }} />
      </group>
      <ChispasCalor frame={frame} cantidad={caliente} y0={0.1} y1={0.15} />
      <Jugo frame={frame} cantidad={interpolate(frame, [E.mito, E.mito + 20], [0.3, 1], clamp)} />
      <Vapor frame={frame} intensidad={caliente * (frame >= E.sizzle ? 1.4 : 1)} y={0.55} />
    </group>
  );
};

const DESTACAR = ["myth", "waterproof", "sizzle", "steam", "same", "flavor", "crust", "isn't"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mito, "scratch", 0.5],
  [E.mito + 6, "sello", 0.5],
  [E.costra, "whoosh", 0.35],
  [E.sizzle, "whoosh", 0.35],
  [E.sizzle + 10, "pop", 0.4],
  [E.estudio, "whoosh", 0.4],
  [E.estudio + 24, "pop", 0.45],
  [E.estudio + 70, "ding", 0.45],
  [E.porque, "whoosh", 0.35],
  [E.ojo, "sello", 0.5],
  [E.consejo, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const SearingJuicesEn013: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Escena frame={frame} />
        <PisoSombra y={-0.0} />
      </Estudio>
      <Chip desde={E.gancho + 20} hasta={E.mito} x={540} y={330}>
        sear = <span style={{ color: ACENTO }}>seal</span>
      </Chip>
      <Chip desde={E.mito} hasta={E.costra} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>MYTH</span>
      </Chip>
      <Chip desde={E.costra + 8} hasta={E.sizzle} x={540} y={330}>
        crust ≠ <span style={{ color: ACENTO }}>waterproof</span>
      </Chip>
      <Chip desde={E.sizzle + 8} hasta={E.estudio} x={540} y={330} color="#5fd2ff">
        sizzle = <span style={{ color: "#5fd2ff" }}>steam</span>
      </Chip>
      <Chip desde={E.estudio + 70} hasta={E.porque} x={540} y={330} color="#5fd2ff">
        seared first = seared last: <span style={{ color: "#5fd2ff" }}>same juice</span>
      </Chip>
      <Chip desde={E.porque + 6} hasta={E.ojo} x={540} y={330}>
        sear = <span style={{ color: ACENTO }}>flavor + crust</span>
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.consejo} x={540} y={330} color="#ffb23d">
        still worth it · <span style={{ color: "#ff8a7a" }}>not a seal</span>
      </Chip>
      <Chip desde={E.consejo + 4} hasta={E.cta} x={540} y={330}>
        sear for the <span style={{ color: ACENTO }}>flavor</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who swears the sear locks it all in" />
      <Audio src={staticFile("en-013-searing-juices/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.4, 3.2, 9.5], mira: [0.3, 0.3, 0], fov: 38 }];
export const PortadaEn013: React.FC = () => (
  <Portada arriba="does searing seal in the juices?" grande="it's a myth" sello="MYTH" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Sarten calor={1} />
      <group position={[0, 0.13, 0]}>
        <Bife e={{ frame: 0, perfil: mezcla(CRUDO, COCIDO, 0.7), costra: 0.85, vueltas: [] }} />
      </group>
      <Jugo frame={20} cantidad={1} />
      <PisoSombra y={0} opacidad={0.25} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/en-014-birthday-pairs/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un anillo de gente sobre un disco oscuro. Cada par de personas se une con una línea fina: la cuenta de pares se ve crecer.
// Arranca con una multitud enorme (setenta), baja a veintitrés, dibuja las 253 líneas, sube a cuarenta y setenta, y vuelve a veintitrés con un par dorado.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  no: r.f(1),
  odds: r.f(2),
  truco: r.f(3),
  pares: r.f(4),
  cientos: r.w(4, "hundred"),
  cuarenta: r.f(5),
  setenta: r.w(5, "Seventy"),
  ojo: r.f(6),
  dos: r.f(7),
  fiesta: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GOLD = ACENTO;

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 9.5, 6.5], mira: [0, 0, 0.3], fov: 40 },
  { f: E.no, pos: [0, 8.2, 5.8], mira: [0, 0, 0.2], fov: 40 },
  { f: E.truco, pos: [0, 7.6, 5.6], mira: [0, 0, 0.1], fov: 40 },
  { f: E.cientos, pos: [0, 8.4, 4.6], mira: [0, 0, 0], fov: 40 },
  { f: E.cuarenta, pos: [0, 9.4, 6.4], mira: [0, 0, 0.3], fov: 40 },
  { f: E.ojo, pos: [0, 8.2, 5.8], mira: [0, 0, 0.2], fov: 40 },
  { f: E.dos, pos: [0.4, 6.4, 4.6], mira: [0.3, 0, 0], fov: 38 },
  { f: E.fiesta, pos: [0, 8.2, 5.8], mira: [0, 0, 0.2], fov: 40 },
  { f: DURACION, pos: [0, 9.2, 6.4], mira: [0, 0, 0.3], fov: 40 },
];

const RADIO = 1.9;

/** cantidad de personas en cada momento */
const personas = (f: number) => {
  if (f < E.no) return 70;
  if (f < E.cuarenta) return Math.round(interpolate(f, [E.no, E.no + 22], [70, 23], clamp));
  if (f < E.setenta) return Math.round(interpolate(f, [E.cuarenta, E.cuarenta + 14], [23, 40], clamp));
  if (f < E.ojo) return Math.round(interpolate(f, [E.setenta, E.setenta + 14], [40, 70], clamp));
  return Math.round(interpolate(f, [E.ojo, E.ojo + 20], [70, 23], clamp));
};

const pos = (i: number, n: number): [number, number] => {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(a) * RADIO, Math.sin(a) * RADIO];
};

const Persona: React.FC<{ x: number; z: number; s: number; color: string; alto?: number }> = ({ x, z, s, color, alto = 1 }) => (
  <group position={[x, 0, z]} scale={alto}>
    <mesh position={[0, 0.2 * s, 0]} castShadow>
      <capsuleGeometry args={[0.1 * s, 0.22 * s, 4, 10]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.5 * s, 0]} castShadow>
      <sphereGeometry args={[0.1 * s, 14, 12]} />
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  </group>
);

/** todas las líneas entre pares de n personas; `visible` (0–1) dibuja una parte */
const Pares: React.FC<{ n: number; visible: number; opacidad: number }> = ({ n, visible, opacidad }) => {
  const geo = React.useMemo(() => {
    const v: number[] = [];
    for (let i = 0; i < n; i++) {
      const [ax, az] = pos(i, n);
      for (let j = i + 1; j < n; j++) {
        const [bx, bz] = pos(j, n);
        v.push(ax, 0.04, az, bx, 0.04, bz);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, [n]);
  const total = (n * (n - 1)) / 2;
  geo.setDrawRange(0, Math.round(total * visible) * 2);
  if (visible <= 0) return null;
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#8fb4ff" transparent opacity={opacidad} depthWrite={false} />
    </lineSegments>
  );
};

/** el par que coincide: dos personas doradas y una barra dorada entre ellas */
const Coinciden: React.FC<{ n: number; a: number; b: number; t: number }> = ({ n, a, b, t }) => {
  const [ax, az] = pos(a, n);
  const [bx, bz] = pos(b, n);
  const dx = bx - ax;
  const dz = bz - az;
  const largo = Math.hypot(dx, dz);
  return (
    <group>
      <mesh position={[(ax + bx) / 2, 0.06, (az + bz) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]} scale={[largo * t, 1, 1]}>
        <boxGeometry args={[1, 0.05, 0.08]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
    </group>
  );
};

const Escena: React.FC<{ frame: number }> = ({ frame }) => {
  const n = personas(frame);
  const s = Math.min(1.6, Math.sqrt(23 / n) * 1.25);
  const visiblePares =
    frame < E.truco
      ? 0
      : frame < E.cuarenta
        ? interpolate(frame, [E.pares, E.pares + 55], [0, 1], clamp)
        : frame < E.ojo
          ? 1
          : interpolate(frame, [E.ojo, E.ojo + 14], [1, 0.35], clamp);
  const opacidad = n > 30 ? 0.18 : 0.4;
  const final = frame >= E.dos;
  const A = 3;
  const B = 14;
  const pop = final ? interpolate(frame, [E.dos, E.dos + 12], [0, 1], clamp) : 0;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[RADIO + 0.9, 64]} />
        <meshStandardMaterial color="#0f1a33" roughness={0.9} />
      </mesh>
      {Array.from({ length: n }, (_, i) => {
        const [x, z] = pos(i, n);
        const gold = final && (i === A || i === B);
        return <Persona key={i} x={x} z={z} s={s} color={gold ? GOLD : "#cfe0ff"} alto={gold ? 1 + 0.35 * pop : 1} />;
      })}
      <Pares n={n} visible={visiblePares} opacidad={opacidad} />
      {final && <Coinciden n={n} a={A} b={B} t={pop} />}
    </group>
  );
};

const DESTACAR = ["huge", "twenty-three", "fifty", "pairs", "pair", "match", "ninety", "ninety-nine", "equally", "any"];
const CIFRAS: [string, string][] = [
  ["Twenty-three", "23"],
  ["twenty-three", "23"],
  ["two hundred fifty-three", "253"],
  ["fifty percent", "50%"],
  ["ninety percent", "90%"],
  ["ninety-nine", "99%"],
  ["Forty", "40"],
  ["Seventy?", "70?"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.no, "scratch", 0.5],
  [E.no + 10, "pop", 0.4],
  [E.odds, "ding", 0.45],
  [E.truco, "whoosh", 0.35],
  [E.pares, "whoosh", 0.35],
  [E.pares + 55, "ding", 0.45],
  [E.cuarenta, "whoosh", 0.35],
  [E.setenta, "pop", 0.4],
  [E.ojo, "sello", 0.5],
  [E.dos, "pop", 0.45],
  [E.fiesta, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const BirthdayPairsEn014: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Escena frame={frame} />
        <PisoSombra y={-0.02} />
      </Estudio>
      <Chip desde={E.gancho + 14} hasta={E.no} x={540} y={330}>
        a <span style={{ color: ACENTO }}>huge</span> crowd?
      </Chip>
      <Chip desde={E.no} hasta={E.odds} x={540} y={330} color="#ff5a4a">
        <span style={{ color: ACENTO }}>23</span> people
      </Chip>
      <Chip desde={E.odds + 4} hasta={E.truco} x={540} y={330}>
        23 people → <span style={{ color: ACENTO }}>50.7%</span>
      </Chip>
      <Chip desde={E.truco + 4} hasta={E.pares} x={540} y={330} color="#5fd2ff">
        count the <span style={{ color: "#5fd2ff" }}>pairs</span>
      </Chip>
      <Chip desde={E.pares + 4} hasta={E.cuarenta} x={540} y={330}>
        23 people = <span style={{ color: ACENTO }}>253 pairs</span>
      </Chip>
      <Chip desde={E.cuarenta + 4} hasta={E.setenta} x={540} y={330}>
        40 people → <span style={{ color: ACENTO }}>~90%</span>
      </Chip>
      <Chip desde={E.setenta + 4} hasta={E.ojo} x={540} y={330}>
        70 people → <span style={{ color: ACENTO }}>99%+</span>
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.dos} x={540} y={330} color="#ffb23d">
        not every day is <span style={{ color: "#ff8a7a" }}>equal</span>
      </Chip>
      <Chip desde={E.dos + 4} hasta={E.fiesta} x={540} y={330}>
        any <span style={{ color: ACENTO }}>two</span> count
      </Chip>
      <Chip desde={E.fiesta + 4} hasta={E.cta} x={540} y={330}>
        23+ people: <span style={{ color: ACENTO }}>ask around</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who swears nobody in their group shares a birthday" />
      <Audio src={staticFile("en-014-birthday-pairs/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 8.6, 6.4], mira: [0, 0, 0.2], fov: 40 }];
export const PortadaEn014: React.FC = () => (
  <Portada arriba="how many people for a shared birthday?" grande="only 23" sello="MATH" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Escena frame={E.cuarenta - 1} />
      <PisoSombra y={0} opacidad={0.25} />
    </Estudio>
  </Portada>
);

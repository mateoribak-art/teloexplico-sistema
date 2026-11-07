import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/044-misa-fabrica-aviones/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Argentina en datos: mapa de Argentina, la cámara baja a Córdoba (pin + halo) donde es la misa (FAdeA),
// y un avioncito a reacción de primitivas cruza el halo cuando la voz nombra al Pulqui I (1947).
// Fuentes: Cadena 3, Perfil Córdoba, Boletín Oficial (decreto Pulqui I), Ámbito.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  predio: r.f(1),
  gente: r.f(2),
  que: r.f(3),
  y1927: r.f(4),
  pulqui: r.f(5),
  jet: r.f(6),
  ojo: r.f(7),
  anotalo: r.f(8),
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

const CORDOBA: LonLat = [-64.2, -31.4];
const [ox, oy] = enMapa(CORDOBA);
const MIRA: [number, number, number] = [0.2, 0.3, 0];

const TOMAS: Toma[] = [
  { f: 0, pos: [0.2, -3.2, 15], mira: MIRA, fov: 34 },
  { f: E.predio, pos: [ox + 0.5, oy - 2.6, 8.6], mira: [ox, oy, 0], fov: 34 },
  { f: E.que, pos: [ox + 0.3, oy - 2.2, 6.4], mira: [ox, oy, 0], fov: 34 },
  { f: E.jet, pos: [ox + 0.3, oy - 2.2, 5.6], mira: [ox, oy, 0], fov: 34 },
  { f: E.ojo, pos: [ox + 0.4, oy - 2.4, 8.4], mira: [ox, oy, 0], fov: 34 },
  { f: DURACION, pos: [0.6, -3.2, 14], mira: MIRA, fov: 34 },
];

const Pin: React.FC<{ en: LonLat; v: number; color: string }> = ({ en, v, color }) => {
  if (v <= 0) return null;
  const [x, y] = enMapa(en);
  return (
    <group position={[x, y, 0.25]} scale={v * 1.6}>
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

const Halo: React.FC<{ en: LonLat; v: number; radio: number; color: string }> = ({ en, v, radio, color }) => {
  if (v <= 0) return null;
  const [x, y] = enMapa(en);
  return (
    <mesh position={[x, y, 0.75]} scale={[v, v, 1]}>
      <circleGeometry args={[radio, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
};

/** Avioncito a reacción de primitivas (fuselaje, alas, cola, tobera). Apunta hacia +x. */
const Jet: React.FC<{ x: number; y: number; z: number; v: number }> = ({ x, y, z, v }) => {
  if (v <= 0) return null;
  return (
    <group position={[x, y, z]} scale={v * 0.7}>
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <capsuleGeometry args={[0.07, 0.5, 8, 16]} />
        <meshStandardMaterial color="#e8eef7" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[-0.05, 0, 0]}>
        <boxGeometry args={[0.22, 0.72, 0.02]} />
        <meshStandardMaterial color="#c9d4e4" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-0.3, 0, 0.06]}>
        <boxGeometry args={[0.12, 0.02, 0.14]} />
        <meshStandardMaterial color="#c9d4e4" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-0.3, 0, 0]}>
        <boxGeometry args={[0.1, 0.28, 0.02]} />
        <meshStandardMaterial color="#c9d4e4" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-0.38, 0, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#ffc53d" toneMapped={false} />
      </mesh>
    </group>
  );
};

const DESTACAR = ["martes", "fábrica", "aviones", "FAdeA", "Pulqui", "Ojo:", "Mandáselo", "cordobés", "diez", "Uno", "Dos"];
const CIFRAS: [string, string][] = [
  ["mil novecientos veintisiete", "1927"],
  ["mil novecientos cuarenta y siete", "1947"],
  ["diez", "10"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.predio, "whoosh", 0.4],
  [E.predio + 8, "ding", 0.45],
  [E.gente, "pop", 0.4],
  [E.que, "whoosh", 0.35],
  [E.y1927, "tic", 0.4],
  [E.pulqui, "whoosh", 0.4],
  [E.jet, "ding", 0.45],
  [E.ojo, "pop", 0.4],
  [E.anotalo, "ding", 0.4],
  [E.cta, "pop", 0.4],
];

export const MisaFabricaAviones3D: React.FC = () => {
  const frame = useCurrentFrame();
  const altoAr = k(frame, [[0, 0.5], [E.predio, 0.2]]);
  const vCba = k(frame, [[E.predio + 4, 0], [E.predio + 14, 1]]);
  const vGente = k(frame, [[E.gente, 1], [E.gente + 10, 1.35], [E.que, 1]]);
  const vJet = k(frame, [[E.pulqui, 0], [E.pulqui + 6, 1], [E.ojo, 1], [E.ojo + 8, 0]]);
  const jx = k(frame, [[E.pulqui, ox - 1.4], [E.ojo, ox + 1.4]]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto: altoAr } }} />
        <Halo en={CORDOBA} v={vCba * vGente} radio={0.35} color="#ffc53d" />
        <Pin en={CORDOBA} v={vCba * 0.6} color="#ff4d4d" />
        <Jet x={jx} y={oy + 0.45} z={1.1} v={vJet} />
      </Estudio>
      <Chip desde={0} hasta={E.predio} x={540} y={300}>
        Misa en una <span style={{ color: ACENTO }}>fábrica de aviones</span>
      </Chip>
      <Chip desde={E.predio} hasta={E.gente} x={540} y={300}>
        <span style={{ color: ACENTO }}>Mar 10</span> · 10 h · FAdeA, Córdoba
      </Chip>
      <Chip desde={E.gente} hasta={E.que} x={540} y={300}>
        <span style={{ color: ACENTO }}>Cientos de miles</span> esperados
      </Chip>
      <Chip desde={E.que} hasta={E.y1927} x={540} y={300}>
        ¿Qué es <span style={{ color: ACENTO }}>FAdeA</span>?
      </Chip>
      <Chip desde={E.y1927} hasta={E.pulqui} x={540} y={300}>
        Desde <span style={{ color: ACENTO }}>1927</span> · Fábrica Militar de Aviones
      </Chip>
      <Chip desde={E.pulqui} hasta={E.jet} x={540} y={300}>
        Pulqui I · voló en <span style={{ color: ACENTO }}>1947</span>
      </Chip>
      <Chip desde={E.jet} hasta={E.ojo} x={540} y={300}>
        Primer jet <span style={{ color: ACENTO }}>hecho en Latam</span> · Defensa
      </Chip>
      <Chip desde={E.ojo} hasta={E.anotalo} x={540} y={300}>
        Pulqui <span style={{ color: ACENTO }}>I</span> ≠ Pulqui <span style={{ color: ACENTO }}>II</span>
      </Chip>
      <Chip desde={E.anotalo} hasta={E.cta} x={540} y={300}>
        Mar <span style={{ color: ACENTO }}>10</span> · <span style={{ color: ACENTO }}>10 h</span> · FAdeA
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo a ese cordobés que va a ir" />
      <Audio src={staticFile("044-misa-fabrica-aviones/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [ox + 0.6, oy - 3.4, 10], mira: [ox, oy, 0], fov: 34 }];
export const Portada044: React.FC = () => (
  <Portada arriba="la misa de Córdoba" grande="es en una fábrica de aviones" sello="FAdeA" colorSello={C.azul} numero={44}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto: 0.5 } }} />
      <Halo en={CORDOBA} v={1} radio={0.35} color="#ffc53d" />
      <Pin en={CORDOBA} v={0.6} color="#ff4d4d" />
      <Jet x={ox + 0.9} y={oy + 0.45} z={1.1} v={1} />
    </Estudio>
  </Portada>
);

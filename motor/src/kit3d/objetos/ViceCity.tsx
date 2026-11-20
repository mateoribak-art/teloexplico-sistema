import React, { useMemo } from "react";
import * as THREE from "three";

// Escena "Vice City = Miami": atardecer neón (sol rosa, mar, palmeras, edificios art déco bajos)
// y un puente largo (Venetian Causeway) que se tiende de una isla a otra. Carteles pintados con
// CanvasTexture: "MIAMI = VICE CITY", "FLORIDA = LEONIDA", "Venetian Causeway" y un sello
// "¿CONFIRMADO POR ROCKSTAR?" con "NO". Todo por estado de frame (nada de useFrame).

export type EstadoVice = {
  frame: number;
  ciudad: number;   // 0..1 skyline y palmeras
  miami: number;    // 0..1 cartel MIAMI = VICE CITY
  florida: number;  // 0..1 cartel FLORIDA = LEONIDA
  puente: number;   // 0..1 el puente se tiende
  rotulo: number;   // 0..1 cartel "Venetian Causeway"
  duda: number;     // 0..1 sello "¿confirmado por Rockstar? NO"
};

const ROSA = "#ff4fa3";
const CIAN = "#38e1ff";
const AMARILLO = "#ffd23a";
const ROJO = "#ff3a2e";

const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};

const placa = (w: number, h: number, borde: string, lineas: { t: string; c: string; s: number }[]) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0e1324";
  rr(g, 0, 0, w, h, 34);
  g.fill();
  g.lineWidth = 10;
  g.strokeStyle = borde;
  rr(g, 8, 8, w - 16, h - 16, 28);
  g.stroke();
  g.textAlign = "center";
  g.textBaseline = "middle";
  const total = lineas.reduce((a, l) => a + l.s * 1.25, 0);
  let y = (h - total) / 2;
  for (const l of lineas) {
    g.fillStyle = l.c;
    g.font = `bold ${l.s}px Arial`;
    g.fillText(l.t, w / 2, y + (l.s * 1.25) / 2);
    y += l.s * 1.25;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const halo = (color: string) => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, color + "ff");
  grad.addColorStop(0.5, color + "66");
  grad.addColorStop(1, color + "00");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const Palmera: React.FC<{ x: number; z: number; alto: number; inc: number }> = ({ x, z, alto, inc }) => (
  <group position={[x, 0, z]} rotation={[0, 0, inc]}>
    <mesh position={[0, alto / 2, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.11, alto, 10]} />
      <meshStandardMaterial color="#5b3b2a" roughness={0.8} />
    </mesh>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <mesh key={i} position={[0, alto, 0]} rotation={[0.9, (i * Math.PI) / 3, 0]}>
        <coneGeometry args={[0.12, 0.9, 6]} />
        <meshStandardMaterial color="#1f9a6b" roughness={0.7} />
      </mesh>
    ))}
  </group>
);

const EDIF: { x: number; z: number; w: number; h: number; d: number; c: string }[] = [
  { x: -3.2, z: -2.6, w: 0.9, h: 1.7, d: 0.8, c: "#ff9ccd" },
  { x: -2.1, z: -2.9, w: 0.8, h: 2.5, d: 0.8, c: "#7fe9ff" },
  { x: -1.1, z: -2.6, w: 1.0, h: 1.4, d: 0.8, c: "#ffd6a8" },
  { x: 0.2, z: -3.0, w: 0.8, h: 2.9, d: 0.8, c: "#ff7bb5" },
  { x: 1.3, z: -2.7, w: 1.0, h: 1.8, d: 0.8, c: "#8cf0e0" },
  { x: 2.5, z: -2.9, w: 0.9, h: 2.3, d: 0.8, c: "#ffb4d6" },
  { x: 3.5, z: -2.6, w: 0.8, h: 1.5, d: 0.8, c: "#9fd0ff" },
];

const Ciudad: React.FC<{ e: EstadoVice }> = ({ e }) => {
  const sol = useMemo(() => halo(ROSA), []);
  if (e.ciudad <= 0.001) return null;
  const s = e.ciudad;
  return (
    <group>
      {/* sol neón detrás */}
      <mesh position={[0, 3.0, -4.5]} scale={0.8 + 0.2 * s}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial map={sol} transparent opacity={0.8 * s} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {EDIF.map((b, i) => (
        <mesh key={i} position={[b.x, (b.h * s) / 2, b.z]} castShadow>
          <boxGeometry args={[b.w, Math.max(0.001, b.h * s), b.d]} />
          <meshStandardMaterial color={b.c} emissive={b.c} emissiveIntensity={0.18} roughness={0.6} />
        </mesh>
      ))}
      {[-3.6, -1.6, 1.8, 3.8].map((x, i) => (
        <Palmera key={i} x={x} z={-0.6 + (i % 2) * 0.5} alto={1.4 * s} inc={(i % 2 ? 1 : -1) * 0.08} />
      ))}
      {/* mar */}
      <mesh position={[0, 0.01, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 7]} />
        <meshStandardMaterial color="#0b3b66" emissive="#12507f" emissiveIntensity={0.35} roughness={0.25} metalness={0.2} transparent opacity={0.9 * s} />
      </mesh>
    </group>
  );
};

const Puente: React.FC<{ e: EstadoVice }> = ({ e }) => {
  if (e.puente <= 0.001) return null;
  const largo = 8 * e.puente;
  return (
    <group position={[-4 + largo / 2, 0.3, 1.1]}>
      <mesh castShadow>
        <boxGeometry args={[largo, 0.12, 0.7]} />
        <meshStandardMaterial color="#cfd6e6" roughness={0.5} />
      </mesh>
      {Array.from({ length: Math.floor(largo / 0.8) }).map((_, i) => (
        <mesh key={i} position={[-largo / 2 + 0.4 + i * 0.8, -0.2, 0]}>
          <boxGeometry args={[0.12, 0.4, 0.5]} />
          <meshStandardMaterial color="#9aa6bf" roughness={0.6} />
        </mesh>
      ))}
      {/* luces del puente */}
      {Array.from({ length: Math.floor(largo / 1.6) }).map((_, i) => (
        <mesh key={`l${i}`} position={[-largo / 2 + 0.6 + i * 1.6, 0.25, 0.3]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshBasicMaterial color={AMARILLO} />
        </mesh>
      ))}
    </group>
  );
};

const Cartel: React.FC<{ pos: [number, number, number]; op: number; w: number; h: number; tex: THREE.Texture }> = ({ pos, op, w, h, tex }) => {
  if (op <= 0.001) return null;
  return (
    <mesh position={pos} scale={0.8 + 0.2 * op}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} transparent opacity={op} />
    </mesh>
  );
};

export const ViceCity: React.FC<{ e: EstadoVice }> = ({ e }) => {
  const tMiami = useMemo(
    () => placa(720, 300, ROSA, [{ t: "MIAMI", c: CIAN, s: 90 }, { t: "= VICE CITY", c: ROSA, s: 90 }]),
    [],
  );
  const tFlorida = useMemo(
    () => placa(720, 300, CIAN, [{ t: "FLORIDA", c: AMARILLO, s: 90 }, { t: "= LEONIDA", c: CIAN, s: 90 }]),
    [],
  );
  const tPuente = useMemo(
    () => placa(720, 260, AMARILLO, [{ t: "Venetian Causeway", c: "#ffffff", s: 72 }, { t: "Miami ↔ Miami Beach", c: AMARILLO, s: 52 }]),
    [],
  );
  const tDuda = useMemo(
    () => placa(720, 360, ROJO, [{ t: "¿confirmado", c: "#ffffff", s: 70 }, { t: "por Rockstar?", c: "#ffffff", s: 70 }, { t: "NO", c: ROJO, s: 110 }]),
    [],
  );
  return (
    <group>
      <Ciudad e={e} />
      <Puente e={e} />
      <Cartel pos={[0, 4.6, 1.5]} op={e.miami} w={4.2} h={1.75} tex={tMiami} />
      <Cartel pos={[0, 4.6, 1.5]} op={e.florida} w={4.2} h={1.75} tex={tFlorida} />
      <Cartel pos={[0, 2.5, 2.2]} op={e.rotulo} w={4.2} h={1.5} tex={tPuente} />
      <Cartel pos={[0, 4.4, 2.0]} op={e.duda} w={3.6} h={1.8} tex={tDuda} />
    </group>
  );
};

export const portadaVice = (): EstadoVice => ({ frame: 20, ciudad: 1, miami: 1, florida: 0, puente: 1, rotulo: 0, duda: 0 });

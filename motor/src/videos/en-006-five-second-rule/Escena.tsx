import React, { useMemo } from "react";
import { random } from "remotion";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Piso (baldosa / acero / madera / alfombra) con bacterias, y tres comidas que caen:
// sandía, pan y gomita. Las bacterias saltan del piso a la comida. Todo sale del frame.

export type Piso = "tile" | "steel" | "wood" | "carpet";
/** Un "episodio": las tres comidas caen sobre un piso y se cargan de bacterias. */
export type Episodio = { drops: [number, number, number]; piso: Piso; carga: [number, number, number]; hop: number };
export type EstadoEscena = { frame: number; episodios: Episodio[]; toss: number; sobrecarga?: number };

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const X_ITEM = [-1.05, 0, 1.05];
const MEDIDAS: [number, number, number][] = [
  [0.95, 0.4, 0.6],
  [0.85, 0.32, 0.65],
  [0.5, 0.3, 0.5],
];
const caja = (w: number, h: number, d: number, r = 0.04) => new RoundedBoxGeometry(w, h, d, 3, r);

const COLOR_PISO: Record<Piso, { color: string; rough: number; metal: number }> = {
  tile: { color: "#5d6e87", rough: 0.25, metal: 0.05 },
  steel: { color: "#7d8794", rough: 0.3, metal: 0.9 },
  wood: { color: "#8a5a34", rough: 0.7, metal: 0 },
  carpet: { color: "#3b6ea5", rough: 1, metal: 0 },
};

const Bacteria: React.FC<{ p: [number, number, number]; s: number; frame: number; i: number }> = ({ p, s, frame, i }) => {
  if (s <= 0.01) return null;
  const w = Math.sin(frame / 6 + i) * 0.015;
  return (
    <mesh position={[p[0] + w, p[1], p[2]]} scale={s}>
      <sphereGeometry args={[0.055, 14, 10]} />
      <meshStandardMaterial color="#7dff4a" emissive="#3fd21c" emissiveIntensity={0.9} roughness={0.4} />
    </mesh>
  );
};

/** Altura de la caída: cae, rebota un poquito y queda. */
const caida = (frame: number, t0: number) => {
  const p = (frame - t0) / 12;
  if (p < 0) return 4;
  if (p < 1) return 4 * (1 - p * p);
  const q = (frame - t0 - 12) / 8;
  return q < 1 ? 0.14 * Math.abs(Math.sin(q * Math.PI)) * (1 - q) : 0;
};

const Comida: React.FC<{ i: number; e: EstadoEscena }> = ({ i, e }) => {
  const [w, h, d] = MEDIDAS[i];
  const geo = useMemo(() => caja(w, h, d, 0.05), [w, h, d]);
  const rind = useMemo(() => caja(w + 0.02, 0.07, d + 0.02, 0.03), [w, d]);
  // episodio de esta comida: el último que ya empezó
  let k = -1;
  e.episodios.forEach((ep, j) => {
    if (ep.drops[i] <= e.frame) k = j;
  });
  if (k < 0) return null;
  const ep = e.episodios[k];
  // la sandía vuela a la basura
  let tp = 0;
  if (i === 0 && e.toss > 0) tp = clamp((e.frame - e.toss) / 16);
  if (tp >= 1) return null;
  const y = caida(e.frame, ep.drops[i]);
  const base = random(`b${i}-${k}`);
  const n = ep.carga[i];
  const yBase = h / 2 + y + tp * 3 - tp * tp * 0.5;
  return (
    <group position={[X_ITEM[i] + tp * 2.6, yBase, tp * 1.2]} rotation={[tp * 5, 0, tp * 3]} scale={1 - tp * 0.5}>
      {i === 0 && (
        <>
          <mesh geometry={geo} castShadow>
            <meshStandardMaterial color="#ff4f5e" roughness={0.35} />
          </mesh>
          <mesh geometry={rind} position={[0, -h / 2 + 0.035, 0]} castShadow>
            <meshStandardMaterial color="#2e8b3d" roughness={0.5} />
          </mesh>
          {[-0.28, -0.08, 0.14, 0.32].map((sx, j) => (
            <mesh key={j} position={[sx, h / 2 + 0.002, (j % 2 ? 0.1 : -0.1)]} scale={[1, 0.3, 1.6]}>
              <sphereGeometry args={[0.035, 8, 6]} />
              <meshStandardMaterial color="#1b1b1b" />
            </mesh>
          ))}
        </>
      )}
      {i === 1 && (
        <>
          <mesh geometry={geo} castShadow>
            <meshStandardMaterial color="#f2d9a6" roughness={0.9} />
          </mesh>
          <mesh geometry={caja(w - 0.02, 0.05, d - 0.02, 0.02)} position={[0, h / 2 - 0.01, 0]}>
            <meshStandardMaterial color="#c98f4a" roughness={0.9} />
          </mesh>
        </>
      )}
      {i === 2 && (
        <mesh geometry={geo} castShadow>
          <meshStandardMaterial color="#ff2f56" roughness={0.15} metalness={0.05} transparent opacity={0.88} />
        </mesh>
      )}
      {Array.from({ length: n }, (_, j) => {
        const t0 = ep.hop + j * 1.6 + base * 2;
        const q = clamp((e.frame - t0) / 9);
        if (q <= 0) return null;
        const cara = j % 2 ? 1 : -1;
        const rx = (random(`rx${i}-${j}-${k}`) - 0.5) * (w - 0.1);
        const ry = -h / 2 + 0.06 + random(`ry${i}-${j}-${k}`) * (h * 0.6);
        const rz = cara * (d / 2 + 0.005);
        // salta del piso (más afuera y abajo) hasta la comida
        const fx = rx + (random(`fx${i}-${j}-${k}`) - 0.5) * 1.1;
        const fz = rz + cara * (0.15 + random(`fz${i}-${j}-${k}`) * 0.4);
        const fy = -h / 2 - y + 0.055;
        const px = fx + (rx - fx) * q;
        const pz = fz + (rz - fz) * q;
        const py = fy + (ry - fy) * q + Math.sin(q * Math.PI) * 0.35;
        return <Bacteria key={j} p={[px, py, pz]} s={Math.min(1, q * 3)} frame={e.frame} i={j} />;
      })}
    </group>
  );
};

export const Escena: React.FC<{ e: EstadoEscena }> = ({ e }) => {
  let pisoActual: Piso = "tile";
  e.episodios.forEach((ep) => {
    if (ep.drops[0] <= e.frame) pisoActual = ep.piso;
  });
  const m = COLOR_PISO[pisoActual];
  const pisoBact = useMemo(
    () => Array.from({ length: 70 }, (_, i) => [(random(`fx${i}`) - 0.5) * 6.4, 0.045, (random(`fz${i}`) - 0.5) * 3.2] as [number, number, number]),
    [],
  );
  const lineas = [-2.4, -1.2, 0, 1.2, 2.4];
  return (
    <group>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[8, 0.24, 4.6]} />
        <meshStandardMaterial key={pisoActual} color={m.color} roughness={m.rough} metalness={m.metal} />
      </mesh>
      {pisoActual === "tile" &&
        lineas.map((x) => (
          <mesh key={`x${x}`} position={[x, 0.002, 0]}>
            <boxGeometry args={[0.03, 0.004, 4.6]} />
            <meshStandardMaterial color="#3b475a" />
          </mesh>
        ))}
      {pisoActual === "tile" &&
        [-1.5, 0, 1.5].map((z) => (
          <mesh key={`z${z}`} position={[0, 0.002, z]}>
            <boxGeometry args={[8, 0.004, 0.03]} />
            <meshStandardMaterial color="#3b475a" />
          </mesh>
        ))}
      {pisoBact.map((p, i) => (
        <Bacteria key={i} p={p} s={Math.min(1, e.frame / 8)} frame={e.frame} i={i} />
      ))}
      {[0, 1, 2].map((i) => (
        <Comida key={i} i={i} e={e} />
      ))}
    </group>
  );
};

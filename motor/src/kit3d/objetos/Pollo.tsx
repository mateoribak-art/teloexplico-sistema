import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Escena de la pileta: mesada con bacha de acero, canilla, una pechuga cruda, gotas que salpican,
// bacterias (puntitos verdes: ilustración) que se reparten, una ensaladera cerca, un termómetro y burbujas de jabón.
// Unidades: la mesada está en y = 0, la canilla atrás (z = -0.8), el pollo en el centro de la bacha.

export type EstadoPollo = {
  frame: number;
  agua: number; // 0..1 chorro de la canilla
  salpica: number; // 0..1 gotas saltando del pollo
  bacPollo: number; // 0..1 bacterias sobre el pollo
  bacRepartidas: number; // 0..1 bacterias en la bacha y la mesada
  contagio: number; // 0..1 bacterias llegan a la ensaladera
  cocido: number; // 0..1 el pollo se dora y las bacterias desaparecen
  termometro: number; // 0..1 sonda clavada en el pollo
  jabon: number; // 0..1 burbujas de jabón
};

export const PolloVacio: EstadoPollo = { frame: 0, agua: 0, salpica: 0, bacPollo: 0, bacRepartidas: 0, contagio: 0, cocido: 0, termometro: 0, jabon: 0 };

const VERDE = "#8be04e";
const caja = (w: number, h: number, d: number, r = 0.05) => new RoundedBoxGeometry(w, h, d, 4, r);
const mezcla = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t);

const Bacteria: React.FC<{ p: [number, number, number]; r: number }> = ({ p, r }) => (
  <mesh position={p} scale={[1, 0.8, 1]}>
    <sphereGeometry args={[r, 10, 8]} />
    <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.55} roughness={0.4} />
  </mesh>
);

const Canilla: React.FC<{ agua: number; frame: number }> = ({ agua, frame }) => (
  <group position={[0, 0, -0.85]}>
    <mesh position={[0, 0.7, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.12, 1.4, 24]} />
      <meshStandardMaterial color="#c9d3e0" metalness={0.9} roughness={0.2} />
    </mesh>
    <mesh position={[0, 1.4, 0.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.09, 0.09, 0.8, 24]} />
      <meshStandardMaterial color="#c9d3e0" metalness={0.9} roughness={0.2} />
    </mesh>
    <mesh position={[0, 1.4, 0.78]}>
      <sphereGeometry args={[0.1, 20, 14]} />
      <meshStandardMaterial color="#c9d3e0" metalness={0.9} roughness={0.2} />
    </mesh>
    {agua > 0.02 && (
      <mesh position={[0, 0.78, 0.78]} scale={[1, agua, 1]}>
        <cylinderGeometry args={[0.045 + 0.008 * Math.sin(frame / 2), 0.04, 1.2, 14]} />
        <meshStandardMaterial color="#8fd0ff" transparent opacity={0.65} roughness={0.05} emissive="#4aa8ff" emissiveIntensity={0.3} depthWrite={false} />
      </mesh>
    )}
  </group>
);

export const Pollo: React.FC<{ e: EstadoPollo }> = ({ e }) => {
  const f = e.frame;
  const mesada = useMemo(() => caja(6.2, 0.3, 2.6, 0.06), []);
  const bacha = useMemo(() => caja(2.4, 0.1, 1.5, 0.05), []);
  const borde = useMemo(() => caja(2.7, 0.06, 1.8, 0.04), []);
  const gotas = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        ang: random(`pa${i}`) * Math.PI * 2,
        alcance: 0.9 + random(`pr${i}`) * 2.4,
        alto: 0.6 + random(`ph${i}`) * 1.0,
        fase: random(`pf${i}`),
        vel: 0.022 + random(`pv${i}`) * 0.014,
        r: 0.035 + random(`ps${i}`) * 0.03,
      })),
    []
  );
  const manchas = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: (random(`mx${i}`) - 0.5) * 5.0,
        z: (random(`mz${i}`) - 0.5) * 2.0,
        r: 0.05 + random(`mr${i}`) * 0.04,
      })),
    []
  );
  const sobre = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        x: (random(`bx${i}`) - 0.5) * 1.4,
        y: 0.25 + random(`by${i}`) * 0.4,
        z: (random(`bz${i}`) - 0.5) * 0.7,
      })),
    []
  );
  const burbujas = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        x: -1.1 + random(`jx${i}`) * 2.2,
        z: 0.1 + random(`jz${i}`) * 0.9,
        r: 0.08 + random(`jr${i}`) * 0.12,
        fase: random(`jf${i}`) * 6.28,
        vel: 0.4 + random(`jv${i}`) * 0.6,
      })),
    []
  );
  const colorPollo = mezcla("#efb7a3", "#c98a45", e.cocido);
  const nBacMesada = Math.round(e.bacRepartidas * manchas.length);
  const nBacPollo = Math.round(e.bacPollo * sobre.length * (1 - e.cocido));
  const nGotas = Math.round(e.salpica * gotas.length);
  return (
    <group>
      <mesh geometry={mesada} position={[0, -0.15, 0]} receiveShadow>
        <meshStandardMaterial color="#cfd6e0" roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh geometry={borde} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial color="#aeb9c8" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh geometry={bacha} position={[0, 0.07, 0]} receiveShadow>
        <meshStandardMaterial color="#8c99ab" metalness={0.85} roughness={0.35} />
      </mesh>
      <Canilla agua={e.agua} frame={f} />

      {/* pechuga cruda: dos lóbulos de carne */}
      <group position={[0, 0.12, 0.05]}>
        <mesh position={[0, 0.25, 0]} scale={[1.0, 0.42, 0.62]} castShadow>
          <sphereGeometry args={[0.8, 36, 24]} />
          <meshStandardMaterial color={colorPollo} roughness={0.55} />
        </mesh>
        <mesh position={[0.45, 0.2, 0.1]} scale={[0.6, 0.32, 0.45]} castShadow>
          <sphereGeometry args={[0.6, 28, 20]} />
          <meshStandardMaterial color={colorPollo} roughness={0.55} />
        </mesh>
        {sobre.slice(0, nBacPollo).map((b, i) => (
          <Bacteria key={i} p={[b.x, b.y + 0.18, b.z]} r={0.06} />
        ))}
        {e.termometro > 0.02 && (
          <group position={[-0.1, 0.5 + (1 - e.termometro) * 1.2, 0]} rotation={[0, 0, -0.35]}>
            <mesh>
              <cylinderGeometry args={[0.025, 0.025, 1.0, 12]} />
              <meshStandardMaterial color="#dfe6ee" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <sphereGeometry args={[0.11, 18, 14]} />
              <meshStandardMaterial color="#ff5a4a" roughness={0.4} emissive="#ff3a2a" emissiveIntensity={0.3} />
            </mesh>
          </group>
        )}
      </group>

      {/* gotas que salen disparadas del chorro */}
      {gotas.slice(0, nGotas).map((g, i) => {
        const t = (f * g.vel + g.fase) % 1;
        const x = Math.cos(g.ang) * g.alcance * t;
        const z = 0.05 + Math.sin(g.ang) * g.alcance * 0.55 * t;
        const y = 0.45 + g.alto * 4 * t * (1 - t);
        return (
          <mesh key={i} position={[x, Math.max(0.05, y), z]}>
            <sphereGeometry args={[g.r, 10, 8]} />
            <meshStandardMaterial color="#bfe6ff" transparent opacity={0.85} roughness={0.05} emissive="#6fc3ff" emissiveIntensity={0.3} />
          </mesh>
        );
      })}

      {/* bacterias que quedan sobre la bacha y la mesada */}
      {manchas.slice(0, nBacMesada).map((m, i) => (
        <Bacteria key={i} p={[m.x, 0.06 + (Math.abs(m.x) < 1.2 && Math.abs(m.z) < 0.75 ? 0.07 : 0.02), m.z]} r={m.r * (1 - e.cocido)} />
      ))}

      {/* ensaladera con lechuga cerca de la bacha */}
      <group position={[2.15, 0, 0.5]}>
        <mesh position={[0, 0.3, 0]} scale={[1, 0.6, 1]} castShadow>
          <sphereGeometry args={[0.55, 28, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color="#f2f5fa" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.28, 0]} scale={[1, 0.55, 1]} castShadow>
          <sphereGeometry args={[0.46, 20, 14]} />
          <meshStandardMaterial color="#5fb44a" roughness={0.8} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[(i - 2) * 0.17, 0.5 + (i % 2) * 0.04, (i % 3) * 0.08 - 0.08]} castShadow>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#7fcf5e" roughness={0.8} />
          </mesh>
        ))}
        {e.contagio > 0.02 &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <Bacteria key={i} p={[(i - 2.5) * 0.14, 0.6 + (i % 2) * 0.03, ((i * 7) % 5) * 0.05 - 0.1]} r={0.05 * e.contagio} />
          ))}
      </group>

      {/* burbujas de jabón (manos) */}
      {e.jabon > 0.02 &&
        burbujas.slice(0, Math.round(e.jabon * burbujas.length)).map((b, i) => {
          const t = (f * 0.012 * b.vel + b.fase) % 1;
          return (
            <mesh key={i} position={[b.x + Math.sin(f / 20 + b.fase) * 0.06, 0.4 + t * 1.3, b.z]}>
              <sphereGeometry args={[b.r, 20, 14]} />
              <meshStandardMaterial color="#eaf6ff" transparent opacity={0.4} roughness={0.05} metalness={0.2} emissive="#9fd4ff" emissiveIntensity={0.2} depthWrite={false} />
            </mesh>
          );
        })}
    </group>
  );
};

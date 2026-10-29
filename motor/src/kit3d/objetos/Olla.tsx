import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Olla de acero con agua, burbujas de hervor, granos de sal que caen y se disuelven, pila de sal,
// termómetro y tapa. Todo sale del frame. El piso está en y = 0; la olla está centrada en el origen.

export type EstadoOlla = {
  frame: number;
  hierve: number; // 0..1 intensidad del hervor (burbujas)
  granos: number; // 0..1 cuántos granos de sal caen
  pila: number; // 0..1 tamaño de la pila de sal al costado
  vapor: number; // 0..1 vapor sobre la olla
  tapa: number; // 0..1 la tapa baja y cierra la olla
  termo: number; // 0..1 aparece el termómetro
  fantasma: number; // 0..1 las paredes se vuelven transparentes
};

export const OLLA = { r: 1.0, alto: 1.05, agua: 0.8 };

const perfil = [
  [0.0, 0.0],
  [0.94, 0.0],
  [1.0, 0.06],
  [1.0, 1.0],
  [1.04, 1.04],
].map(([x, y]) => new THREE.Vector2(x, y));

export const Olla: React.FC<{ e: EstadoOlla }> = ({ e }) => {
  const f = e.frame;
  const cuerpo = useMemo(() => new THREE.LatheGeometry(perfil, 64), []);
  const asa = useMemo(() => new RoundedBoxGeometry(0.4, 0.09, 0.14, 3, 0.04), []);
  const burbujas = useMemo(
    () => Array.from({ length: 34 }, (_, i) => ({ x: (random(`bx${i}`) - 0.5) * 1.6, z: (random(`bz${i}`) - 0.5) * 1.6, v: 0.018 + random(`bv${i}`) * 0.02, fase: random(`bf${i}`), r: 0.04 + random(`br${i}`) * 0.05 })),
    []
  );
  const sal = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({ x: (random(`sx${i}`) - 0.5) * 1.3, z: (random(`sz${i}`) - 0.5) * 1.3, v: 0.022 + random(`sv${i}`) * 0.01, fase: random(`sf${i}`), giro: random(`sg${i}`) * 3 })),
    []
  );
  const humo = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ x: (random(`hx${i}`) - 0.5) * 1.0, z: (random(`hz${i}`) - 0.5) * 1.0, v: 0.012 + random(`hv${i}`) * 0.01, fase: random(`hf${i}`) })),
    []
  );
  const opPared = 1 - 0.8 * e.fantasma;
  const nB = Math.round(e.hierve * burbujas.length);
  const nS = Math.round(e.granos * sal.length);
  const nH = Math.round(e.vapor * humo.length);
  const tapaY = 1.06 + (1 - e.tapa) * 2.6;
  const tapaX = (1 - e.tapa) * 1.8;
  return (
    <group>
      {/* cuerpo de acero */}
      <mesh geometry={cuerpo} castShadow receiveShadow>
        <meshStandardMaterial key={opPared < 1 ? "t" : "o"} color="#c9d1db" metalness={0.85} roughness={0.28} side={THREE.DoubleSide} transparent={opPared < 1} opacity={opPared} depthWrite={opPared >= 1} />
      </mesh>
      {/* asas */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={asa} position={[s * 1.2, 0.85, 0]} castShadow>
          <meshStandardMaterial color="#9aa4b0" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      {/* agua */}
      <mesh position={[0, OLLA.agua / 2 + 0.03, 0]}>
        <cylinderGeometry args={[0.97, 0.93, OLLA.agua, 48]} />
        <meshStandardMaterial color="#4aa8ff" transparent opacity={0.55} roughness={0.1} depthWrite={false} />
      </mesh>
      <mesh position={[0, OLLA.agua + 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.97, 48]} />
        <meshStandardMaterial color="#9fd4ff" transparent opacity={0.6} roughness={0.05} depthWrite={false} />
      </mesh>
      {/* burbujas */}
      {burbujas.slice(0, nB).map((b, i) => {
        const t = (f * b.v + b.fase) % 1;
        return (
          <mesh key={i} position={[b.x * (0.8 + 0.2 * t), 0.1 + t * (OLLA.agua - 0.05), b.z * (0.8 + 0.2 * t)]} scale={0.5 + t}>
            <sphereGeometry args={[b.r, 12, 10]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.7 * (1 - 0.4 * t)} roughness={0.05} depthWrite={false} />
          </mesh>
        );
      })}
      {/* granos de sal: caen y se disuelven al tocar el agua */}
      {sal.slice(0, nS).map((g, i) => {
        const t = (f * g.v + g.fase) % 1;
        const y = 3.4 - t * (3.4 - OLLA.agua - 0.03);
        return (
          <mesh key={i} position={[g.x, y, g.z]} rotation={[g.giro + f / 12, g.giro, 0]} scale={t > 0.97 ? 0.1 : 1}>
            <boxGeometry args={[0.07, 0.07, 0.07]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} emissive="#cfe0ff" emissiveIntensity={0.25} />
          </mesh>
        );
      })}
      {/* pila de sal al costado */}
      {e.pila > 0.01 && (
        <mesh position={[-2.0, 0.5 * e.pila, 0.9]} scale={[e.pila, e.pila, e.pila]} castShadow>
          <coneGeometry args={[0.7, 1.0, 28]} />
          <meshStandardMaterial color="#f4f7ff" roughness={0.55} emissive="#cfe0ff" emissiveIntensity={0.12} />
        </mesh>
      )}
      {/* termómetro dentro del agua */}
      {e.termo > 0.01 && (
        <group position={[0.45, 0, 0.35]} scale={[e.termo, e.termo, e.termo]}>
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.9, 16]} />
            <meshStandardMaterial color="#e6f2ff" transparent opacity={0.35} roughness={0.05} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.09, 18, 14]} />
            <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 1.4, 12]} />
            <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}
      {/* vapor */}
      {humo.slice(0, nH).map((h, i) => {
        const t = (f * h.v + h.fase) % 1;
        return (
          <mesh key={i} position={[h.x + Math.sin(f / 30 + i) * 0.1, 1.15 + t * 1.5, h.z]} scale={0.6 + 0.9 * t}>
            <sphereGeometry args={[0.2, 14, 10]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.14 * Math.sin(Math.PI * t) * e.vapor} depthWrite={false} />
          </mesh>
        );
      })}
      {/* tapa */}
      {e.tapa > 0.01 && (
        <group position={[tapaX, tapaY, 0]} rotation={[0, 0, (1 - e.tapa) * 0.5]}>
          <mesh castShadow>
            <cylinderGeometry args={[1.06, 1.06, 0.07, 56]} />
            <meshStandardMaterial color="#b9c2cd" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.13, 0]}>
            <sphereGeometry args={[0.13, 20, 14]} />
            <meshStandardMaterial color="#222a36" roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
};

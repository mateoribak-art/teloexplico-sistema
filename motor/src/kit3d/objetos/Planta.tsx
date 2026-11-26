import React from "react";
import * as THREE from "three";

// Planta en maceta con un termómetro al lado. `temp` 0→1 (altura del líquido: 1 = tibio, 0 = frío),
// `helada` 0→1 cristales de escarcha sobre las hojas, `cubierta` 0→1 una sábana que baja sobre la planta,
// `luna` 0→1 brillo de la noche. `frame` mueve los copos.

export type EstadoPlanta = {
  frame: number;
  temp: number;
  helada: number;
  cubierta: number;
};

const HOJAS: [number, number, number, number][] = [
  // x, y, rotZ, escala
  [-0.45, 1.0, 0.9, 1],
  [0.45, 1.15, -0.9, 1],
  [-0.4, 1.6, 0.7, 0.9],
  [0.4, 1.75, -0.7, 0.9],
  [0, 2.1, 0, 0.8],
];

export const Planta: React.FC<{ e: EstadoPlanta }> = ({ e }) => {
  const helada = Math.min(1, Math.max(0, e.helada));
  const cub = Math.min(1, Math.max(0, e.cubierta));
  const liquido = 0.2 + 1.6 * Math.min(1, Math.max(0, e.temp));
  return (
    <group position={[0, -0.4, 0]}>
      {/* maceta */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.45, 0.8, 28]} />
        <meshStandardMaterial color="#b8653a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.56, 0.56, 0.06, 28]} />
        <meshStandardMaterial color="#3b2a1e" roughness={1} />
      </mesh>
      {/* tallo */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 1.4, 12]} />
        <meshStandardMaterial color="#3f9b4a" roughness={0.6} />
      </mesh>
      {/* hojas */}
      {HOJAS.map(([x, y, rz, s], i) => (
        <group key={i} position={[x * 0.7, y, 0]} rotation={[0, 0, rz]} scale={[s, s, s]}>
          <mesh scale={[0.55, 0.17, 0.3]} castShadow>
            <sphereGeometry args={[0.7, 20, 14]} />
            <meshStandardMaterial color={helada > 0.5 ? "#9fd6d0" : "#43b04f"} roughness={0.55} />
          </mesh>
          {helada > 0.02 && (
            <mesh scale={[0.58 * helada + 0.01, 0.2 * helada + 0.01, 0.33 * helada + 0.01]} position={[0, 0.03, 0]}>
              <sphereGeometry args={[0.7, 20, 14]} />
              <meshStandardMaterial color="#eaf8ff" emissive="#9ad8ff" emissiveIntensity={0.4} transparent opacity={0.85 * helada} roughness={0.2} />
            </mesh>
          )}
        </group>
      ))}
      {/* sábana (cae sobre la planta) */}
      {cub > 0.01 && (
        <mesh position={[0, 3.2 - cub * 1.45, 0]} scale={[1, 1, 1]}>
          <coneGeometry args={[1.25, 2.1, 28, 1, true]} />
          <meshStandardMaterial color="#f2f2ee" roughness={0.95} side={THREE.DoubleSide} transparent opacity={0.96} />
        </mesh>
      )}
      {/* termómetro */}
      <group position={[1.9, 1.1, 0]}>
        <mesh>
          <boxGeometry args={[0.4, 2.4, 0.12]} />
          <meshStandardMaterial color="#e9edf2" roughness={0.5} />
        </mesh>
        <mesh position={[0, -1.35, 0.02]}>
          <sphereGeometry args={[0.28, 20, 20]} />
          <meshStandardMaterial color="#ff4a3d" emissive="#ff2a1a" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, -1.15 + liquido / 2, 0.08]}>
          <boxGeometry args={[0.12, liquido, 0.06]} />
          <meshStandardMaterial color="#ff4a3d" emissive="#ff2a1a" emissiveIntensity={0.3} />
        </mesh>
      </group>
      {/* copos de frío */}
      {Array.from({ length: 12 }, (_, i) => {
        const t = (e.frame / 70 + i / 12) % 1;
        return (
          <mesh key={i} position={[-3 + ((i * 0.71) % 1) * 6, 3.4 - t * 3.6, 0.8 + (i % 3) * 0.2]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#bfe6ff" emissiveIntensity={0.5} transparent opacity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

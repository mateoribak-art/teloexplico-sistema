import React from "react";
import * as THREE from "three";

// Caño con llave: un tubo de cobre transparente con agua adentro, una llave a la derecha
// que gotea y un frío (hielo) que avanza desde la izquierda. `hielo` 0→1 cuánto del caño se
// congeló; `gota` 0→1 cuánto gotea la llave (agua que se mueve); `calor` 0→1 aire cálido
// (puertas del gabinete abiertas / calefacción); `frio` 0→1 copos de frío afuera.

export type EstadoCano = {
  frame: number;
  hielo: number;
  gota: number;
  calor: number;
  frio: number;
};

const LARGO = 6;
const X0 = -3;

export const Cano: React.FC<{ e: EstadoCano }> = ({ e }) => {
  const hielo = Math.min(1, Math.max(0, e.hielo));
  const largoHielo = Math.max(0.001, hielo * (LARGO - 0.6));
  const gotas = [0, 1, 2].map((i) => {
    const t = ((e.frame / 14 + i / 3) % 1);
    return t;
  });
  return (
    <group position={[0, 0.9, 0]}>
      {/* pared */}
      <mesh position={[0, 0.2, -0.9]}>
        <boxGeometry args={[8, 3.4, 0.2]} />
        <meshStandardMaterial color="#1a2a44" roughness={0.9} />
      </mesh>
      {/* caño de cobre (transparente) */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, LARGO, 28, 1, true]} />
        <meshStandardMaterial color="#d9803f" metalness={0.8} roughness={0.35} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* agua */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.24, 0.24, LARGO - 0.1, 24]} />
        <meshStandardMaterial color="#4fb3ff" roughness={0.2} transparent opacity={0.75} />
      </mesh>
      {/* hielo que avanza */}
      {hielo > 0.01 && (
        <mesh position={[X0 + largoHielo / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, largoHielo, 24]} />
          <meshStandardMaterial color="#e6f6ff" roughness={0.15} emissive="#9ad8ff" emissiveIntensity={0.35} transparent opacity={0.92} />
        </mesh>
      )}
      {/* llave */}
      <group position={[LARGO / 2 - 0.4, 0, 0]}>
        <mesh position={[0, -0.7, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 1.1, 20]} />
          <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0.35, -1.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.9, 20]} />
          <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.5, 12]} />
          <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.78, 0]} castShadow>
          <boxGeometry args={[0.7, 0.14, 0.16]} />
          <meshStandardMaterial color="#e24a3b" roughness={0.5} />
        </mesh>
        {/* gotas */}
        {e.gota > 0.02 &&
          gotas.map((t, i) => (
            <mesh key={i} position={[0.75, -1.35 - t * 1.4, 0]} scale={[1, 1.4, 1]}>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshStandardMaterial color="#6cc4ff" roughness={0.2} transparent opacity={e.gota * (1 - t * 0.4)} />
            </mesh>
          ))}
      </group>
      {/* aire cálido */}
      {e.calor > 0.02 &&
        Array.from({ length: 6 }, (_, i) => {
          const t = ((e.frame / 40 + i / 6) % 1);
          return (
            <mesh key={i} position={[-2.4 + i * 0.95, -0.9 + t * 1.4, 0.7]}>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshStandardMaterial color="#ffb347" emissive="#ff8a1f" emissiveIntensity={0.6} transparent opacity={0.32 * e.calor * (1 - t)} depthWrite={false} />
            </mesh>
          );
        })}
      {/* copos de frío */}
      {e.frio > 0.02 &&
        Array.from({ length: 10 }, (_, i) => {
          const t = ((e.frame / 60 + i / 10) % 1);
          return (
            <mesh key={i} position={[-3.6 + ((i * 0.83) % 1) * 7.2, 2.4 - t * 3.2, 0.9 + (i % 3) * 0.2]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color="#ffffff" emissive="#bfe6ff" emissiveIntensity={0.5} transparent opacity={0.8 * e.frio} />
            </mesh>
          );
        })}
    </group>
  );
};

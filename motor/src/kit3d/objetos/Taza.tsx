import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";

// Taza de café (vaso de papel con tapa) a la izquierda y una pila de monedas a la derecha que crece.
// Todo sale del frame. El piso está en y = 0.

export type EstadoTaza = {
  frame: number;
  vapor: number; // 0..1 vapor sobre la taza
  pila: number; // 0..1 altura de la pila de monedas grande (todo el año)
  pila2: number; // 0..1 altura de la pila chica (solo días de semana)
};

const perfil = [
  [0.0, 0.0],
  [0.42, 0.0],
  [0.58, 1.3],
  [0.62, 1.34],
].map(([x, y]) => new THREE.Vector2(x, y));

const N_MAX = 36;
const alto = 0.048;

export const Taza: React.FC<{ e: EstadoTaza }> = ({ e }) => {
  const f = e.frame;
  const cuerpo = useMemo(() => new THREE.LatheGeometry(perfil, 48), []);
  const humo = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({ x: (random(`tx${i}`) - 0.5) * 0.4, z: (random(`tz${i}`) - 0.5) * 0.4, v: 0.012 + random(`tv${i}`) * 0.01, fase: random(`tf${i}`) })),
    []
  );
  const n1 = Math.round(e.pila * N_MAX);
  const n2 = Math.round(e.pila2 * N_MAX);
  const nH = Math.round(e.vapor * humo.length);
  return (
    <group>
      {/* vaso */}
      <group position={[-1.3, 0, 0]}>
        <mesh geometry={cuerpo} castShadow receiveShadow>
          <meshStandardMaterial color="#f4efe6" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        {/* manga de cartón */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.535, 0.49, 0.5, 48, 1, true]} />
          <meshStandardMaterial color="#8a5a36" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* tapa */}
        <mesh position={[0, 1.38, 0]} castShadow>
          <cylinderGeometry args={[0.66, 0.62, 0.1, 48]} />
          <meshStandardMaterial color="#2b2f38" roughness={0.5} />
        </mesh>
        {humo.slice(0, nH).map((h, i) => {
          const t = (f * h.v + h.fase) % 1;
          return (
            <mesh key={i} position={[h.x + Math.sin(f / 25 + i) * 0.08, 1.5 + t * 1.2, h.z]} scale={0.6 + 0.9 * t}>
              <sphereGeometry args={[0.15, 14, 10]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.16 * Math.sin(Math.PI * t) * e.vapor} depthWrite={false} />
            </mesh>
          );
        })}
      </group>
      {/* pila grande de monedas (año completo) */}
      <group position={[0.9, 0, 0]}>
        {Array.from({ length: n1 }, (_, i) => (
          <mesh key={i} position={[Math.sin(i * 1.7) * 0.012, alto * (i + 0.5), 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.38, alto * 0.9, 32]} />
            <meshStandardMaterial color={i % 2 ? "#e8b730" : "#f2c94c"} metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {/* pila chica (solo días de semana) */}
      <group position={[2.0, 0, 0.2]}>
        {Array.from({ length: n2 }, (_, i) => (
          <mesh key={i} position={[0, alto * (i + 0.5), 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.38, alto * 0.9, 32]} />
            <meshStandardMaterial color={i % 2 ? "#c9d1db" : "#dfe5ec"} metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

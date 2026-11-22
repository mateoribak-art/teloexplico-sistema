import React from "react";
import * as THREE from "three";

// Campo de bolillas: una grilla enorme de bolitas grises (las combinaciones posibles) y UNA dorada.
// `aparece` 0→1 hace crecer la grilla desde el centro; `oro` 0→1 enciende la dorada con un rayo y un aro;
// `elegida` 0→1 muestra tu boleto (aro blanco) sobre una bolita cualquiera de al lado.

export type EstadoBolillas = {
  aparece: number;
  oro: number;
  elegida: number;
  diez: number; // 0→1 resalta diez bolitas más (diez boletos)
};

const N = 61; // lado de la grilla (impar: la dorada queda en el centro)
const PASO = 0.42;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const Bolillas: React.FC<{ e: EstadoBolillas }> = ({ e }) => {
  const ref = React.useRef<THREE.InstancedMesh>(null);
  React.useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new THREE.Object3D();
    let i = 0;
    const c = (N - 1) / 2;
    for (let a = 0; a < N; a++)
      for (let b = 0; b < N; b++) {
        d.position.set((a - c) * PASO, 0.14, (b - c) * PASO);
        d.updateMatrix();
        m.setMatrixAt(i++, d.matrix);
      }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  const ap = clamp01(e.aparece);
  const oro = clamp01(e.oro);
  const el = clamp01(e.elegida);
  const diez = clamp01(e.diez);
  const dietz = [
    [2, 1],
    [-3, 2],
    [5, -4],
    [-6, -3],
    [8, 5],
    [-9, 6],
    [11, -2],
    [-12, -7],
    [14, 8],
    [-15, 3],
  ];
  return (
    <group scale={[ap, ap, ap]}>
      <instancedMesh ref={ref} args={[undefined, undefined, N * N]} castShadow={false}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color="#6f7fa6" roughness={0.5} metalness={0.2} />
      </instancedMesh>
      {/* la bolita dorada */}
      <mesh position={[0, 0.3, 0]} scale={[1 + oro * 0.6, 1 + oro * 0.6, 1 + oro * 0.6]}>
        <sphereGeometry args={[0.22, 24, 18]} />
        <meshStandardMaterial color="#ffd23f" roughness={0.25} metalness={0.5} emissive="#ffb300" emissiveIntensity={0.4 + oro * 1.2} />
      </mesh>
      {oro > 0.02 && (
        <>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 6, 12]} />
            <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={1.5} transparent opacity={0.6 * oro} />
          </mesh>
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.72, 40]} />
            <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={1.4} transparent opacity={0.9 * oro} />
          </mesh>
        </>
      )}
      {/* tu boleto: una bolita cualquiera, aro blanco */}
      {el > 0.02 && (
        <mesh position={[PASO * 4, 0.05, PASO * -3]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.5, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.6} transparent opacity={0.95 * el} />
        </mesh>
      )}
      {diez > 0.02 &&
        dietz.map(([x, z], i) => (
          <mesh key={i} position={[x * PASO, 0.05, z * PASO]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.44, 24]} />
            <meshStandardMaterial color="#5fd2ff" emissive="#5fd2ff" emissiveIntensity={1.4} transparent opacity={0.9 * diez} />
          </mesh>
        ))}
    </group>
  );
};

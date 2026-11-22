import React from "react";
import * as THREE from "three";

// Chicle por dentro: un tubo (el tracto digestivo, simplificado) en curva en S, con un chicle
// rosa que lo recorre de punta a punta. `avance` 0→1 mueve el chicle; `reloj` 0→1 llena el aro
// de horas; `comida` 1 suma bolitas de comida que viajan al lado (mismo viaje).

export type EstadoChicle = {
  frame: number;
  avance: number; // 0→1 posición del chicle en el tubo
  comida: number; // 0→1 opacidad de las bolitas de comida
  bloqueo: number; // 0→1 muchos chicles amontonados (atasco)
};

const CURVA = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-2.6, 2.2, 0),
  new THREE.Vector3(-1.2, 2.6, 0),
  new THREE.Vector3(0.3, 1.6, 0),
  new THREE.Vector3(-0.4, 0.6, 0),
  new THREE.Vector3(1.4, -0.1, 0),
  new THREE.Vector3(2.6, 0.9, 0),
]);

export const Chicle: React.FC<{ e: EstadoChicle }> = ({ e }) => {
  const geo = React.useMemo(() => new THREE.TubeGeometry(CURVA, 80, 0.26, 20, false), []);
  const t = Math.min(1, Math.max(0, e.avance));
  const p = CURVA.getPoint(t);
  const giro = e.frame / 18;
  return (
    <group position={[0, 0.6, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#e8847a" roughness={0.6} transparent opacity={0.42} depthWrite={false} />
      </mesh>
      {/* chicle principal */}
      <mesh position={[p.x, p.y, p.z]} rotation={[giro, giro * 0.7, 0]} scale={[1, 0.85, 0.9]} castShadow>
        <sphereGeometry args={[0.3, 20, 20]} />
        <meshStandardMaterial color="#ff5fa8" roughness={0.35} emissive="#ff2f86" emissiveIntensity={0.25} />
      </mesh>
      {/* comida que hace el mismo viaje */}
      {e.comida > 0.02 &&
        [0.12, 0.2, 0.3].map((d, i) => {
          const q = CURVA.getPoint(Math.min(1, Math.max(0, t - d)));
          return (
            <mesh key={i} position={[q.x, q.y + 0.02, q.z]}>
              <sphereGeometry args={[0.16, 12, 12]} />
              <meshStandardMaterial color="#ffc24a" roughness={0.7} transparent opacity={0.9 * e.comida} />
            </mesh>
          );
        })}
      {/* atasco: muchos chicles juntos en el codo */}
      {e.bloqueo > 0.02 &&
        Array.from({ length: 7 }, (_, i) => {
          const q = CURVA.getPoint(0.5 + i * 0.012);
          return (
            <mesh key={i} position={[q.x + Math.sin(i * 2.1) * 0.12, q.y + Math.cos(i * 1.7) * 0.1, q.z]} scale={e.bloqueo}>
              <sphereGeometry args={[0.24, 14, 14]} />
              <meshStandardMaterial color="#ff5fa8" roughness={0.35} />
            </mesh>
          );
        })}
    </group>
  );
};

import React, { useMemo } from "react";
import * as THREE from "three";

// Dedo visto de costado, a lo largo del eje x, con la piel traslúcida y el hueso adentro.
// Dos huesos (falanges) con la articulación en x = 0; al tirar se separan y aparece un vacío oscuro con una burbuja.
// Mide ~3 de largo, centrado en el origen, a una altura de y = 1.2.

export type EstadoNudillo = {
  frame: number;
  tension: number; // 0..1 cuánto se separan los huesos
  burbuja: number; // 0..1 vacío/burbuja de gas en la articulación
  onda: number; // 0..1 destello del "crac" (anillo que se expande)
  piel: number; // 0..1 opacidad de la piel (0 = se ve solo el hueso)
  foco: number; // 0..1 aro brillante en la articulación
};

const Y = 1.2;

export const Nudillo: React.FC<{ e: EstadoNudillo }> = ({ e }) => {
  const hueso = useMemo(() => new THREE.CapsuleGeometry(0.2, 1.0, 10, 20), []);
  const sep = 0.08 + e.tension * 0.22;
  const esc = 1 + 0.015 * Math.sin(e.frame / 4) * e.foco;
  return (
    <group position={[0, Y, 0]} scale={esc}>
      {/* huesos */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={hueso} position={[s * (0.82 + sep), 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <meshStandardMaterial color="#f1e8d8" roughness={0.45} />
        </mesh>
      ))}
      {/* cápsula articular: líquido entre los huesos */}
      <mesh position={[0, 0, 0]} scale={[1, 1, 1]}>
        <sphereGeometry args={[0.3 + sep * 0.5, 24, 18]} />
        <meshStandardMaterial color="#5fd2ff" transparent opacity={0.28 * (1 - e.burbuja * 0.6)} roughness={0.2} depthWrite={false} />
      </mesh>
      {/* vacío oscuro + burbuja de gas */}
      {e.burbuja > 0.01 && (
        <group>
          <mesh scale={[0.6 * e.burbuja, 0.9 * e.burbuja, 0.9 * e.burbuja]}>
            <sphereGeometry args={[0.28, 24, 18]} />
            <meshBasicMaterial color="#0a1226" transparent opacity={0.85} depthWrite={false} />
          </mesh>
          <mesh scale={e.burbuja}>
            <sphereGeometry args={[0.15, 24, 18]} />
            <meshStandardMaterial color="#ffffff" emissive="#9fe3ff" emissiveIntensity={0.9} transparent opacity={0.9} roughness={0.1} />
          </mesh>
        </group>
      )}
      {/* destello del crac */}
      {e.onda > 0.01 && e.onda < 0.99 && (
        <mesh rotation={[0, 0, 0]} scale={0.6 + e.onda * 2.2}>
          <torusGeometry args={[0.5, 0.025, 12, 48]} />
          <meshBasicMaterial color="#ffc53d" transparent opacity={0.9 * (1 - e.onda)} depthWrite={false} />
        </mesh>
      )}
      {/* piel */}
      {e.piel > 0.01 && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.36, 2.5 + sep * 2, 12, 28]} />
          <meshStandardMaterial color="#e6b28c" roughness={0.6} transparent opacity={0.55 * e.piel} depthWrite={false} />
        </mesh>
      )}
      {/* aro de foco */}
      {e.foco > 0.01 && (
        <mesh>
          <sphereGeometry args={[0.62, 28, 20]} />
          <meshBasicMaterial color="#ffc53d" transparent opacity={0.16 * e.foco} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

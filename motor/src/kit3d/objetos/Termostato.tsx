import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Termostato redondo de pared (a la izquierda) y una casita con el interior iluminado (a la derecha).
// El calor se escapa de la casa en bolitas naranjas: más bolitas y más rápidas cuando adentro hace más calor que afuera.
// Todo sale del frame: sin useFrame. El piso está en y = 0.

export type EstadoTermostato = {
  frame: number;
  dial: number; // 0..1 (0 = frío, 1 = cálido): color del aro y brillo de la casa
  fuga: number; // 0..1 intensidad del calor que se escapa
  noche: number; // 0..1 aparece la luna
  fantasma: number; // 0..1 paredes de la casa transparentes
  casa: number; // 0..1 la casa aparece
  aguja: number; // 0..1 posición de la marca del dial (de 62 a 72 °F)
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const color = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t);

export const TERMOSTATO_POS: [number, number, number] = [-2.3, 2.1, 0];
export const CASA_POS: [number, number, number] = [1.7, 0, 0];

export const Termostato: React.FC<{ e: EstadoTermostato }> = ({ e }) => {
  const f = e.frame;
  const placa = useMemo(() => new RoundedBoxGeometry(2.1, 2.1, 0.12, 3, 0.18), []);
  const aro = color("#5fb8ff", "#ff9a3d", e.dial);
  const brilloCasa = color("#6fb4ff", "#ffb347", e.dial);
  const ang = lerp(-2.2, 2.2, e.aguja);

  return (
    <group>
      {/* termostato */}
      <group position={TERMOSTATO_POS}>
        <mesh geometry={placa} castShadow>
          <meshStandardMaterial color="#e8edf5" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.16, 48]} />
          <meshStandardMaterial color="#f7f9fc" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.19]}>
          <torusGeometry args={[0.72, 0.07, 16, 64]} />
          <meshStandardMaterial color={aro} emissive={aro} emissiveIntensity={1.1} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.19]} rotation={[0, 0, -ang]}>
          <mesh position={[0, 0.5, 0.02]}>
            <boxGeometry args={[0.1, 0.26, 0.04]} />
            <meshStandardMaterial color="#1c2436" roughness={0.5} />
          </mesh>
        </mesh>
        <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.04, 32]} />
          <meshStandardMaterial color="#dfe6f2" roughness={0.4} />
        </mesh>
      </group>

      {/* casa */}
      {e.casa > 0.01 && (
        <group position={CASA_POS} scale={e.casa}>
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.6, 1.8, 1.9]} />
            <meshStandardMaterial
              key={e.fantasma > 0.01 ? "t" : "o"}
              color="#d9c7a8"
              roughness={0.7}
              transparent={e.fantasma > 0.01}
              opacity={1 - e.fantasma * 0.7}
              depthWrite={e.fantasma <= 0.01}
            />
          </mesh>
          <mesh position={[0, 2.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[2.1, 1.0, 4]} />
            <meshStandardMaterial color="#8a3b2e" roughness={0.65} />
          </mesh>
          {/* luz de adentro */}
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[0.6 + e.dial * 0.35, 24, 18]} />
            <meshBasicMaterial color={brilloCasa} transparent opacity={0.22 + 0.5 * e.dial} depthWrite={false} />
          </mesh>
          <pointLight position={[0, 1.0, 0.4]} intensity={2 + 6 * e.dial} distance={5} color={brilloCasa} />
          {/* ventana y puerta */}
          <mesh position={[-0.7, 1.05, 0.96]}>
            <boxGeometry args={[0.6, 0.6, 0.04]} />
            <meshBasicMaterial color={brilloCasa} />
          </mesh>
          <mesh position={[0.7, 0.6, 0.96]}>
            <boxGeometry args={[0.55, 1.2, 0.04]} />
            <meshStandardMaterial color="#5a3a24" roughness={0.7} />
          </mesh>
          {/* calor que se escapa */}
          {e.fuga > 0.01 &&
            Array.from({ length: 16 }, (_, i) => {
              const dir = random(`fd${i}`) * Math.PI * 2;
              const t = (f * (0.012 + random(`fv${i}`) * 0.012) * (0.4 + e.fuga) + random(`ff${i}`)) % 1;
              const r0 = 1.5 + t * 1.6;
              const vis = i / 16 < e.fuga ? Math.sin(Math.PI * t) : 0;
              return (
                <mesh key={i} position={[Math.cos(dir) * r0, 0.9 + Math.sin(dir * 2) * 0.5 + t * 0.8, Math.sin(dir) * r0 * 0.6]}>
                  <sphereGeometry args={[0.1 + 0.05 * e.fuga, 12, 10]} />
                  <meshBasicMaterial color="#ff9a3d" transparent opacity={0.85 * vis} depthWrite={false} />
                </mesh>
              );
            })}
        </group>
      )}

      {/* luna */}
      {e.noche > 0.01 && (
        <group position={[1.2, 4.5, -2]} scale={e.noche}>
          <mesh>
            <sphereGeometry args={[0.55, 28, 20]} />
            <meshBasicMaterial color="#f4f1dc" />
          </mesh>
        </group>
      )}
    </group>
  );
};

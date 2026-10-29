import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Aire acondicionado split en la pared (arriba, al centro), termómetro de pared a la izquierda con marcas
// de destino (24 verde, 17 azul) y una ventana a la derecha que se abre y deja entrar el sol.
// Todo sale del frame. El piso está en y = 0.

export type EstadoAire = {
  frame: number;
  temp: number; // °C de la pieza (15..30)
  sopla: number; // 0..1 aire frío cayendo del equipo
  marcas: number; // 0..1 aparecen las marcas 24 y 17 en el termómetro
  ventana: number; // 0..1 ventana abierta con sol entrando
  rayo: number; // 0..1 intensidad de la luz de sol
  led: number; // 0..1 color del visor: 0 = 24 (verde), 1 = 17 (azul)
};

export const AIRE_POS: [number, number, number] = [0, 3.4, 0];
export const TERMO_X = -2.7;
export const yTemp = (t: number) => 0.7 + ((t - 15) / 15) * 3.0;

export const Aire: React.FC<{ e: EstadoAire }> = ({ e }) => {
  const f = e.frame;
  const caja = useMemo(() => new RoundedBoxGeometry(3.2, 1.0, 0.8, 4, 0.2), []);
  const marco = useMemo(() => new RoundedBoxGeometry(1.7, 2.2, 0.16, 2, 0.05), []);
  const gotas = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({ x: (random(`ax${i}`) - 0.5) * 2.6, z: (random(`az${i}`) - 0.3) * 0.9, v: 0.016 + random(`av${i}`) * 0.012, fase: random(`af${i}`) })),
    []
  );
  const colorLed = new THREE.Color("#4fe08a").lerp(new THREE.Color("#5fb8ff"), e.led);
  const nG = Math.round(e.sopla * gotas.length);
  const yM = yTemp(e.temp);
  const caliente = THREE.MathUtils.clamp((e.temp - 17) / 12, 0, 1);
  const colMerc = new THREE.Color("#5fb8ff").lerp(new THREE.Color("#ff5a3d"), caliente);
  return (
    <group>
      {/* equipo split */}
      <group position={AIRE_POS}>
        <mesh geometry={caja} castShadow>
          <meshStandardMaterial color="#f1f4f9" roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.38, 0.38]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[2.8, 0.1, 0.5]} />
          <meshStandardMaterial color="#cdd5e2" roughness={0.5} />
        </mesh>
        <mesh position={[1.1, 0.12, 0.41]}>
          <boxGeometry args={[0.5, 0.2, 0.03]} />
          <meshBasicMaterial color={colorLed} />
        </mesh>
        <pointLight position={[0, -0.8, 0.8]} intensity={1.5 + 3 * e.sopla} distance={5} color="#8fc8ff" />
      </group>

      {/* aire frío que cae */}
      {gotas.slice(0, nG).map((g, i) => {
        const t = (f * g.v + g.fase) % 1;
        return (
          <mesh key={i} position={[g.x * (0.7 + t * 0.6), AIRE_POS[1] - 0.7 - t * 2.9, g.z + 0.5]}>
            <sphereGeometry args={[0.07 + 0.05 * (1 - t), 10, 8]} />
            <meshBasicMaterial color="#9ad4ff" transparent opacity={0.85 * Math.sin(Math.PI * t)} depthWrite={false} />
          </mesh>
        );
      })}

      {/* termómetro */}
      <group position={[TERMO_X, 0, 0]}>
        <mesh position={[0, 2.15, -0.02]} castShadow>
          <boxGeometry args={[0.5, 3.4, 0.12]} />
          <meshStandardMaterial color="#e8edf5" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.5, 0.06]}>
          <sphereGeometry args={[0.38, 28, 20]} />
          <meshStandardMaterial color={colMerc} emissive={colMerc} emissiveIntensity={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, (0.5 + yM) / 2, 0.06]}>
          <boxGeometry args={[0.16, yM - 0.5, 0.1]} />
          <meshStandardMaterial color={colMerc} emissive={colMerc} emissiveIntensity={0.6} roughness={0.3} />
        </mesh>
        {e.marcas > 0.01 && (
          <>
            <mesh position={[0.5, yTemp(24), 0.06]} scale={[e.marcas, 1, 1]}>
              <boxGeometry args={[0.6, 0.1, 0.06]} />
              <meshBasicMaterial color="#4fe08a" />
            </mesh>
            <mesh position={[0.5, yTemp(17), 0.06]} scale={[e.marcas, 1, 1]}>
              <boxGeometry args={[0.6, 0.1, 0.06]} />
              <meshBasicMaterial color="#5fb8ff" />
            </mesh>
          </>
        )}
      </group>

      {/* ventana */}
      <group position={[2.8, 1.9, -0.1]}>
        <mesh geometry={marco} castShadow>
          <meshStandardMaterial color="#8a6a4a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[1.4, 1.9]} />
          <meshBasicMaterial color={e.ventana > 0.3 ? "#bfe6ff" : "#5d7aa6"} />
        </mesh>
        {e.ventana > 0.01 && (
          <>
            <mesh position={[0.2, 0.5, 0.2]} scale={0.6 + 0.4 * e.ventana}>
              <sphereGeometry args={[0.4, 24, 18]} />
              <meshBasicMaterial color="#ffd23d" />
            </mesh>
            <pointLight position={[0, 0.5, 1]} intensity={6 * e.rayo} distance={7} color="#ffb347" />
            {Array.from({ length: 10 }, (_, i) => {
              const t = (f * 0.014 + i / 10) % 1;
              return (
                <mesh key={i} position={[-t * 2.6, 0.2 - t * 0.9 + Math.sin(i * 2) * 0.3, 0.4 + (i % 3) * 0.1]}>
                  <sphereGeometry args={[0.1, 10, 8]} />
                  <meshBasicMaterial color="#ff9a3d" transparent opacity={0.8 * e.ventana * Math.sin(Math.PI * t)} depthWrite={false} />
                </mesh>
              );
            })}
          </>
        )}
      </group>
    </group>
  );
};

import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Huevos: un bowl en la mesada (izquierda) y un cartón en una caja fría (derecha, la heladera).
// Un huevo grande al centro (hero) con la cutícula como una cáscara brillante que se va.
// Todo sale del frame: sin useFrame. Unidades: el piso está en y = 0.

export type EstadoHuevos = {
  frame: number;
  mesada: number; // 0..1 aparece la mesada con el bowl
  frio: number; // 0..1 aparece la caja fría con el cartón
  hero: number; // 0..1 huevo grande al centro
  cuticula: number; // 0..1 brillo de la cutícula sobre el huevo grande
  tache: number; // 0..1 cruz roja sobre la mesada
  tilde: number; // 0..1 tilde verde sobre la caja fría
  fantasma: number; // 0..1 baja la opacidad del lado de la mesada
};

const perfilHuevo = (() => {
  const pts: THREE.Vector2[] = [];
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI;
    const r = 0.38 * Math.sin(t) * (1 + 0.14 * Math.cos(t));
    const y = -0.5 * Math.cos(t);
    pts.push(new THREE.Vector2(Math.max(r, 0.0001), y));
  }
  return pts;
})();

const Huevo: React.FC<{ color?: string; escala?: number; brillo?: number; opacidad?: number }> = ({
  color = "#f2e4cf",
  escala = 1,
  brillo = 0,
  opacidad = 1,
}) => {
  const g = useMemo(() => new THREE.LatheGeometry(perfilHuevo, 28), []);
  return (
    <group scale={escala}>
      <mesh geometry={g} castShadow>
        <meshStandardMaterial
          key={opacidad < 0.99 ? "t" : "o"}
          color={color}
          roughness={0.55}
          transparent={opacidad < 0.99}
          opacity={opacidad}
          depthWrite={opacidad >= 0.99}
        />
      </mesh>
      {brillo > 0.01 && (
        <mesh geometry={g} scale={1.07}>
          <meshBasicMaterial color="#ffe08a" transparent opacity={0.45 * brillo} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

const caja = (w: number, h: number, d: number, r = 0.04) => new RoundedBoxGeometry(w, h, d, 3, r);

export const Huevos: React.FC<{ e: EstadoHuevos }> = ({ e }) => {
  const f = e.frame;
  const gMesada = useMemo(() => caja(2.1, 0.9, 1.3, 0.06), []);
  const gCarton = useMemo(() => caja(1.9, 0.18, 0.8, 0.05), []);
  const gFria = useMemo(() => caja(2.4, 2.0, 1.5, 0.06), []);
  const opMesada = 1 - e.fantasma * 0.7;

  // bowl: 6 huevos apilados
  const bowlHuevos: [number, number, number, string][] = [
    [-0.25, 0.12, 0.05, "#f2e4cf"],
    [0.12, 0.1, -0.12, "#e9d3b4"],
    [0.3, 0.12, 0.15, "#f2e4cf"],
    [-0.1, 0.1, 0.25, "#e9d3b4"],
    [0.0, 0.36, 0.05, "#f2e4cf"],
    [-0.28, 0.32, -0.1, "#e9d3b4"],
  ];

  return (
    <group>
      {/* MESADA con bowl */}
      {e.mesada > 0.01 && (
        <group position={[-1.7, 0, 0]} scale={e.mesada}>
          <mesh geometry={gMesada} position={[0, 0.45, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#7a5233" roughness={0.75} transparent={e.fantasma > 0.01} opacity={opMesada} />
          </mesh>
          <mesh position={[0, 0.92, 0]} receiveShadow>
            <boxGeometry args={[2.2, 0.05, 1.4]} />
            <meshStandardMaterial color="#d8d2c6" roughness={0.5} transparent={e.fantasma > 0.01} opacity={opMesada} />
          </mesh>
          {/* bowl */}
          <mesh position={[0, 1.08, 0]} castShadow>
            <cylinderGeometry args={[0.62, 0.42, 0.3, 36]} />
            <meshStandardMaterial color="#c9724a" roughness={0.5} transparent={e.fantasma > 0.01} opacity={opMesada} />
          </mesh>
          {bowlHuevos.map(([x, y, z, c], i) => (
            <group key={i} position={[x, 1.2 + y, z]} rotation={[0.2 * (i % 3), i, 0.15 * i]}>
              <Huevo color={c} escala={0.42} opacidad={opMesada} />
            </group>
          ))}
        </group>
      )}

      {/* CAJA FRÍA con cartón */}
      {e.frio > 0.01 && (
        <group position={[1.7, 0, 0]} scale={e.frio}>
          <mesh geometry={gFria} position={[0, 1.0, 0]}>
            <meshStandardMaterial color="#8fd8ff" roughness={0.1} transparent opacity={0.22} depthWrite={false} />
          </mesh>
          <mesh position={[0, 1.0, 0]}>
            <boxGeometry args={[2.3, 1.9, 1.4]} />
            <meshBasicMaterial color="#58c8ff" transparent opacity={0.1 + 0.05 * Math.sin(f / 10)} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0.5, 0]} receiveShadow>
            <boxGeometry args={[2.2, 0.04, 1.3]} />
            <meshStandardMaterial color="#cfe6f7" roughness={0.1} />
          </mesh>
          {/* cartón de 12 */}
          <mesh geometry={gCarton} position={[0, 0.62, 0]} castShadow>
            <meshStandardMaterial color="#c9b79a" roughness={0.85} />
          </mesh>
          {Array.from({ length: 12 }, (_, i) => {
            const col = i % 6;
            const row = Math.floor(i / 6);
            return (
              <group key={i} position={[-0.75 + col * 0.3, 0.9, -0.17 + row * 0.34]}>
                <Huevo escala={0.5} />
              </group>
            );
          })}
          {/* copos de frío */}
          {Array.from({ length: 10 }, (_, i) => {
            const t = (f * (0.01 + random(`hv${i}`) * 0.008) + random(`hf${i}`)) % 1;
            return (
              <mesh key={i} position={[(random(`hx${i}`) - 0.5) * 2.0, 0.6 + t * 1.5, (random(`hz${i}`) - 0.5) * 1.0]} scale={0.5 + t}>
                <sphereGeometry args={[0.04, 8, 6]} />
                <meshBasicMaterial color="#d8f2ff" transparent opacity={Math.sin(Math.PI * t) * 0.7 * e.frio} depthWrite={false} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* HUEVO GRANDE al centro, arriba */}
      {e.hero > 0.01 && (
        <group position={[0, 3.2, 0.3]} rotation={[0, f / 40, 0.1]} scale={e.hero}>
          <Huevo escala={1.5} brillo={e.cuticula} />
        </group>
      )}

      {/* cruz roja sobre la mesada */}
      {e.tache > 0.01 && (
        <group position={[-1.7, 2.0, 0.8]} scale={e.tache * 0.5}>
          {[Math.PI / 4, -Math.PI / 4].map((a, i) => (
            <mesh key={i} rotation={[0, 0, a]}>
              <boxGeometry args={[1.5, 0.22, 0.1]} />
              <meshBasicMaterial color="#ff5a4a" />
            </mesh>
          ))}
        </group>
      )}

      {/* tilde verde sobre la caja fría */}
      {e.tilde > 0.01 && (
        <group position={[1.7, 2.3, 0.8]} scale={e.tilde * 0.5}>
          <mesh position={[-0.28, -0.12, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.6, 0.22, 0.1]} />
            <meshBasicMaterial color="#58d68d" />
          </mesh>
          <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1.1, 0.22, 0.1]} />
            <meshBasicMaterial color="#58d68d" />
          </mesh>
        </group>
      )}
    </group>
  );
};

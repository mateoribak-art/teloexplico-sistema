import React, { useMemo } from "react";
import * as THREE from "three";

// Ronda de mate: cinco personas (sin cara) en círculo y un mate con bombilla que viaja de una a otra.
// Todo sale del estado (frame → números). Piso en y = 0. Persona 0 al frente (z positivo).

export type EstadoMate = {
  frame: number;
  vuelta: number; // 0..5 posición del mate en la ronda (decimales = en camino entre dos personas)
  gracias: number; // 0..1 aro de acento sobre la persona que dice gracias (persona 2)
  salteado: number; // 0..1 esa persona se apaga porque el mate la saltea
  bombilla: number; // 0..1 la bombilla se inclina (movida) con un aro de aviso
  ronda: number; // 0..1 aparece la ronda de personas
  zoom: number; // 0..1 mate grande al centro (primer plano)
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const N = 5;
const RADIO = 2.4;
const COLORES = ["#f2a65a", "#6aa9e8", "#8fd694", "#c79be8", "#e88f9a"];
const ACENTO = "#ffc53d";

const pos = (i: number, radio: number): [number, number] => {
  const a = (i / N) * Math.PI * 2;
  return [Math.sin(a) * radio, Math.cos(a) * radio];
};

export const MateObjeto: React.FC<{ vacio?: number; inclinada?: number }> = ({ inclinada = 0 }) => {
  // calabaza: torno, perfil de abajo hacia arriba
  const perfil = useMemo(() => {
    const p: THREE.Vector2[] = [];
    const pts: [number, number][] = [
      [0.001, 0], [0.16, 0.02], [0.27, 0.12], [0.33, 0.28], [0.32, 0.42], [0.26, 0.54], [0.2, 0.6], [0.19, 0.62],
    ];
    for (const [x, y] of pts) p.push(new THREE.Vector2(x, y));
    return p;
  }, []);
  return (
    <group>
      <mesh castShadow>
        <latheGeometry args={[perfil, 40]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.65} side={THREE.DoubleSide} />
      </mesh>
      {/* boca con yerba */}
      <mesh position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.19, 32]} />
        <meshStandardMaterial color="#4e7a2f" roughness={0.9} />
      </mesh>
      {/* virola */}
      <mesh position={[0, 0.58, 0]}>
        <torusGeometry args={[0.2, 0.025, 10, 32]} />
        <meshStandardMaterial color="#c9ced6" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* bombilla */}
      <group position={[0.06, 0.58, 0]} rotation={[0, 0, -0.35 - inclinada * 0.7]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 10]} />
          <meshStandardMaterial color="#d8dde5" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.54, 0]} castShadow>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshStandardMaterial color="#d8dde5" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
};

const Persona: React.FC<{ color: string; v: number; apagada: number; mira: number }> = ({ color, v, apagada, mira }) => (
  <group scale={v} rotation={[0, mira, 0]}>
    <mesh position={[0, 0.7, 0]} castShadow>
      <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
      <meshStandardMaterial color={apagada > 0 ? "#4a5060" : color} roughness={0.55} />
    </mesh>
    <mesh position={[0, 1.55, 0]} castShadow>
      <sphereGeometry args={[0.28, 24, 18]} />
      <meshStandardMaterial color={apagada > 0 ? "#6b7080" : "#f0d3b5"} roughness={0.6} />
    </mesh>
  </group>
);

export const Mate: React.FC<{ e: EstadoMate }> = ({ e }) => {
  const a = ((e.vuelta % N) / N) * Math.PI * 2;
  const mx = Math.sin(a) * 1.5;
  const mz = Math.cos(a) * 1.5;
  const salto = Math.abs(Math.sin((e.vuelta % 1) * Math.PI)) * 0.25;
  const grande = e.zoom;
  const pulso = 1 + Math.sin(e.frame * 0.25) * 0.06;
  return (
    <group>
      {/* ronda */}
      {e.ronda > 0.01 &&
        Array.from({ length: N }, (_, i) => {
          const [x, z] = pos(i, RADIO);
          const v = clamp01(e.ronda * 1.8 - i * 0.12);
          const es2 = i === 2;
          return (
            <group key={i} position={[x, 0, z]}>
              <Persona color={COLORES[i]} v={v} apagada={es2 ? e.salteado : 0} mira={Math.PI + (i / N) * Math.PI * 2} />
            </group>
          );
        })}
      {/* aro "gracias" sobre la persona 2 */}
      {e.gracias > 0.01 && (() => {
        const [x, z] = pos(2, RADIO);
        return (
          <mesh position={[x, 2.2, z]} rotation={[Math.PI / 2, 0, 0]} scale={e.gracias * pulso}>
            <torusGeometry args={[0.38, 0.05, 12, 36]} />
            <meshStandardMaterial color={ACENTO} emissive={ACENTO} emissiveIntensity={0.7} />
          </mesh>
        );
      })()}
      {/* mate que viaja */}
      <group
        position={[mx * (1 - grande), (1.0 + salto) * (1 - grande) + 0.4 * grande, mz * (1 - grande) + 1.6 * grande]}
        scale={1.3 + grande * 2.8}
      >
        <MateObjeto inclinada={e.bombilla} />
      </group>
    </group>
  );
};

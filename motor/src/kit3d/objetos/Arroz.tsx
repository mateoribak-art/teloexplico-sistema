import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Olla de arroz sobre la mesada: bacterias que se multiplican (puntos verdes), toxina (puntos rojos),
// reloj de una hora (arco), calor del recalentado y un táper chato frío. Todo sale del frame. Piso en y = 0.

export type EstadoArroz = {
  frame: number;
  bact: number; // 0..1 cantidad de bacterias
  toxina: number; // 0..1 cantidad de toxina
  reloj: number; // 0..1 arco del reloj (una hora)
  calor: number; // 0..1 recalentado (brillo naranja y vapor)
  tuper: number; // 0..1 aparece el táper chato frío
  frio: number; // 0..1 brillo azul del táper
  fantasma: number; // 0..1 paredes transparentes
};

const perfil = [
  [0.0, 0.0],
  [0.94, 0.0],
  [1.0, 0.06],
  [1.0, 1.0],
  [1.04, 1.04],
].map(([x, y]) => new THREE.Vector2(x, y));

export const Arroz: React.FC<{ e: EstadoArroz }> = ({ e }) => {
  const f = e.frame;
  const cuerpo = useMemo(() => new THREE.LatheGeometry(perfil, 64), []);
  const tuperGeo = useMemo(() => new RoundedBoxGeometry(2.2, 0.55, 1.5, 3, 0.08), []);
  const granos = useMemo(
    () => Array.from({ length: 70 }, (_, i) => ({ x: (random(`gx${i}`) - 0.5) * 1.7, z: (random(`gz${i}`) - 0.5) * 1.7, g: random(`gg${i}`) * 3 })),
    []
  );
  const bichos = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({ a: random(`ba${i}`) * 6.28, rad: random(`br${i}`) * 0.8, fase: random(`bf${i}`) * 6 })),
    []
  );
  const tox = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({ a: random(`ta${i}`) * 6.28, rad: random(`tr${i}`) * 0.8, fase: random(`tf${i}`) * 6 })),
    []
  );
  const humo = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ x: (random(`hx${i}`) - 0.5) * 1.0, z: (random(`hz${i}`) - 0.5) * 1.0, v: 0.012 + random(`hv${i}`) * 0.01, fase: random(`hf${i}`) })),
    []
  );
  const op = 1 - 0.75 * e.fantasma;
  const nB = Math.round(e.bact * bichos.length);
  const nT = Math.round(e.toxina * tox.length);
  const nH = Math.round(e.calor * humo.length);
  return (
    <group>
      <group position={[-0.8 * e.tuper, 0, 0]}>
        {/* olla */}
        <mesh geometry={cuerpo} castShadow receiveShadow>
          <meshStandardMaterial key={op < 1 ? "t" : "o"} color="#c9d1db" metalness={0.85} roughness={0.28} side={THREE.DoubleSide} transparent={op < 1} opacity={op} depthWrite={op >= 1} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.2, 0.85, 0]} castShadow>
            <boxGeometry args={[0.4, 0.09, 0.14]} />
            <meshStandardMaterial color="#9aa4b0" metalness={0.8} roughness={0.35} />
          </mesh>
        ))}
        {/* arroz */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.95, 0.92, 0.78, 48]} />
          <meshStandardMaterial color={e.calor > 0.2 ? "#ffe3b8" : "#f6f1e4"} roughness={0.9} emissive="#ff7a1a" emissiveIntensity={0.35 * e.calor} />
        </mesh>
        {granos.map((g, i) => (
          <mesh key={i} position={[g.x, 0.86, g.z]} rotation={[g.g, g.g * 2, 0]} scale={[1, 0.5, 0.5]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color="#fffdf5" roughness={0.7} />
          </mesh>
        ))}
        {/* bacterias */}
        {bichos.slice(0, nB).map((b, i) => {
          const p = 1 + 0.18 * Math.sin(f / 6 + b.fase);
          return (
            <mesh key={i} position={[Math.cos(b.a) * b.rad, 0.95 + 0.04 * Math.sin(f / 9 + b.fase), Math.sin(b.a) * b.rad]} scale={[p, p, p]}>
              <sphereGeometry args={[0.085, 12, 10]} />
              <meshStandardMaterial color="#5cff7a" emissive="#2bd957" emissiveIntensity={0.9} />
            </mesh>
          );
        })}
        {/* toxina */}
        {tox.slice(0, nT).map((b, i) => (
          <mesh key={i} position={[Math.cos(b.a) * b.rad, 1.2 + 0.12 * Math.sin(f / 12 + b.fase) + (i % 4) * 0.12, Math.sin(b.a) * b.rad]}>
            <octahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color="#ff4a4a" emissive="#ff2020" emissiveIntensity={1.1} />
          </mesh>
        ))}
        {/* vapor del recalentado */}
        {humo.slice(0, nH).map((h, i) => {
          const t = (f * h.v + h.fase) % 1;
          return (
            <mesh key={i} position={[h.x, 1.1 + t * 1.5, h.z]} scale={0.6 + 0.9 * t}>
              <sphereGeometry args={[0.2, 14, 10]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.16 * Math.sin(Math.PI * t) * e.calor} depthWrite={false} />
            </mesh>
          );
        })}
      </group>
      {/* reloj de una hora: arco que se completa */}
      {e.reloj > 0.01 && (
        <group position={[0, 2.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <torusGeometry args={[0.55, 0.05, 12, 48]} />
            <meshStandardMaterial color="#26324a" transparent opacity={0.7} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.55, 0.075, 12, 48, Math.PI * 2 * e.reloj]} />
            <meshStandardMaterial color="#ffd23f" emissive="#ffb300" emissiveIntensity={0.9} />
          </mesh>
        </group>
      )}
      {/* táper chato frío */}
      {e.tuper > 0.01 && (
        <group position={[1.9 - 0.4 * e.tuper, 0.28, 0.5]} scale={[0.7 * e.tuper, 0.7 * e.tuper, 0.7 * e.tuper]}>
          <mesh geometry={tuperGeo} castShadow>
            <meshStandardMaterial color="#cfe8ff" transparent opacity={0.55} roughness={0.1} emissive="#4aa8ff" emissiveIntensity={0.5 * e.frio} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[2.0, 0.28, 1.3]} />
            <meshStandardMaterial color="#f6f1e4" roughness={0.9} emissive="#4aa8ff" emissiveIntensity={0.25 * e.frio} />
          </mesh>
        </group>
      )}
    </group>
  );
};

import React from "react";

// Árbol de Navidad con luces y un balde de agua en la base.
// `luces` 0→1 (luces prendidas), `seco` 0→1 (el árbol se pone marrón), `llama` 0→1 (fuego en la copa),
// `agua` 0→1 (nivel de agua en el balde). `frame` hace titilar las luces.

export type EstadoArbol = {
  frame: number;
  luces: number;
  seco: number;
  llama: number;
  agua: number;
};

const CAPAS: [number, number, number][] = [
  // y, radio, alto
  [0.9, 1.25, 1.1],
  [1.6, 1.0, 1.0],
  [2.25, 0.75, 0.9],
  [2.8, 0.5, 0.8],
];

const COLORES = ["#ff4a3d", "#ffd23d", "#5fd2ff", "#7dff6a"];

const mezcla = (a: number[], b: number[], t: number) =>
  "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");

export const Arbol: React.FC<{ e: EstadoArbol }> = ({ e }) => {
  const seco = Math.min(1, Math.max(0, e.seco));
  const luces = Math.min(1, Math.max(0, e.luces));
  const llama = Math.min(1, Math.max(0, e.llama));
  const agua = Math.min(1, Math.max(0, e.agua));
  const verde = mezcla([30, 120, 55], [140, 95, 40], seco);
  return (
    <group position={[0, -0.6, 0]}>
      {/* balde de agua */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.45, 0.5, 28]} />
        <meshStandardMaterial color="#8a2b2b" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.05 + 0.4 * agua, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.02 + 0.0001, 28]} />
        <meshStandardMaterial color="#4ab4ff" emissive="#2a7ac0" emissiveIntensity={0.5} transparent opacity={agua > 0.02 ? 0.9 : 0} />
      </mesh>
      {/* tronco */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.7, 12]} />
        <meshStandardMaterial color="#5a3b22" roughness={1} />
      </mesh>
      {/* copa */}
      {CAPAS.map(([y, rad, alto], i) => (
        <mesh key={i} position={[0, y + 0.3, 0]} castShadow>
          <coneGeometry args={[rad, alto, 24]} />
          <meshStandardMaterial color={verde} roughness={0.9} />
        </mesh>
      ))}
      {/* estrella */}
      <mesh position={[0, 3.55, 0]}>
        <octahedronGeometry args={[0.14]} />
        <meshStandardMaterial color="#ffd23d" emissive="#ffb300" emissiveIntensity={0.8} />
      </mesh>
      {/* luces: espiral de bolitas */}
      {Array.from({ length: 22 }, (_, i) => {
        const t = i / 22;
        const y = 0.95 + t * 2.2;
        const rad = 1.2 * (1 - t) + 0.12;
        const ang = t * Math.PI * 6;
        const parpadeo = 0.75 + 0.25 * Math.sin(e.frame / 5 + i * 1.7);
        const c = COLORES[i % COLORES.length];
        return (
          <mesh key={i} position={[Math.cos(ang) * rad, y, Math.sin(ang) * rad]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color={luces > 0.05 ? c : "#444"} emissive={c} emissiveIntensity={luces * 2.2 * parpadeo} />
          </mesh>
        );
      })}
      {/* fuego en la copa */}
      {llama > 0.02 &&
        Array.from({ length: 5 }, (_, i) => {
          const f = 0.8 + 0.25 * Math.sin(e.frame / 3 + i * 2);
          return (
            <mesh key={i} position={[Math.cos(i * 1.3) * 0.45, 1.6 + i * 0.35, Math.sin(i * 1.3) * 0.45]} scale={[llama * f, llama * f * 1.6, llama * f]}>
              <coneGeometry args={[0.28, 0.6, 12]} />
              <meshStandardMaterial color="#ff7a1a" emissive="#ff4a00" emissiveIntensity={2} transparent opacity={0.85} />
            </mesh>
          );
        })}
    </group>
  );
};

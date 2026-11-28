import React, { useMemo } from "react";
import { random } from "remotion";

// Dos manos bajo un chorro: izquierda agua fría (azul), derecha agua caliente (roja). Gérmenes (esferas verdes)
// sobre cada palma que bajan con "germenes" (misma fracción en las dos: la temperatura no cambia nada).
// jabon 0..1: espuma blanca sobre las manos. reloj 0..1: aro de 20 s al centro. Piso en y = 0.

export type EstadoLavadoManos = {
  frame: number;
  agua: number; // 0..1 chorros
  germenes: number; // 0..1 fracción de gérmenes que quedan
  jabon: number; // 0..1 espuma
  reloj: number; // 0..1 aro de 20 s
};

const N = 14;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const Mano: React.FC<{ x: number; color: string; e: EstadoLavadoManos; semilla: string }> = ({ x, color, e, semilla }) => {
  const pts = useMemo(
    () => Array.from({ length: N }, (_, i) => ({ x: (random(`${semilla}x${i}`) - 0.5) * 1.1, z: (random(`${semilla}z${i}`) - 0.5) * 0.9, orden: random(`${semilla}o${i}`) })),
    [semilla]
  );
  const burbujas = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({ x: (random(`${semilla}bx${i}`) - 0.5) * 1.2, z: (random(`${semilla}bz${i}`) - 0.5) * 1.0, r: 0.12 + random(`${semilla}br${i}`) * 0.12 })),
    [semilla]
  );
  const gotas = Array.from({ length: 8 }, (_, i) => {
    const t = ((e.frame * 0.045 + i / 8) % 1);
    return { y: 3.6 - t * 2.4, dx: Math.sin(i * 2.1) * 0.12 };
  });
  return (
    <group position={[x, 0, 0]}>
      {/* palma y dedos */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.28, 1.3]} />
        <meshStandardMaterial color="#f0c3a0" roughness={0.7} />
      </mesh>
      {[-0.54, -0.18, 0.18, 0.54].map((dx, i) => (
        <mesh key={i} position={[dx, 1.0, -1.0 - (i === 1 || i === 2 ? 0.1 : 0)]} castShadow>
          <boxGeometry args={[0.28, 0.24, 0.9]} />
          <meshStandardMaterial color="#f0c3a0" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0.95, 1.0, -0.2]} rotation={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.28, 0.24, 0.8]} />
        <meshStandardMaterial color="#f0c3a0" roughness={0.7} />
      </mesh>
      {/* gérmenes */}
      {pts.map((p, i) => {
        const vivo = e.germenes > p.orden;
        if (!vivo) return null;
        return (
          <mesh key={i} position={[p.x, 1.25, p.z]}>
            <sphereGeometry args={[0.1, 12, 10]} />
            <meshStandardMaterial color="#7be34a" emissive="#4fb82a" emissiveIntensity={0.8} />
          </mesh>
        );
      })}
      {/* espuma */}
      {e.jabon > 0.02 &&
        burbujas.map((b, i) => (
          <mesh key={i} position={[b.x, 1.3 + 0.05 * Math.sin(e.frame / 8 + i), b.z]} scale={e.jabon}>
            <sphereGeometry args={[b.r, 14, 10]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} transparent opacity={0.85} />
          </mesh>
        ))}
      {/* chorro */}
      {e.agua > 0.02 && (
        <group>
          <mesh position={[0, 2.4, 0.2]}>
            <cylinderGeometry args={[0.12, 0.12, 2.4 * e.agua, 14]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} transparent opacity={0.55} />
          </mesh>
          {gotas.map((g, i) => (
            <mesh key={i} position={[g.dx, g.y, 0.2]} scale={e.agua}>
              <sphereGeometry args={[0.1, 10, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

export const LavadoManos: React.FC<{ e: EstadoLavadoManos }> = ({ e }) => {
  const rel = clamp01(e.reloj);
  return (
    <group>
      <Mano x={-1.5} color="#4fb0ff" e={e} semilla="fria" />
      <Mano x={1.5} color="#ff5a3c" e={e} semilla="caliente" />
      {rel > 0.01 && (
        <group position={[0, 2.9, 0]}>
          <mesh>
            <torusGeometry args={[0.6, 0.05, 12, 64]} />
            <meshStandardMaterial color="#3a4256" />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2 - 0]}>
            <torusGeometry args={[0.6, 0.08, 12, 64, Math.PI * 2 * rel]} />
            <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={1.4} />
          </mesh>
        </group>
      )}
    </group>
  );
};

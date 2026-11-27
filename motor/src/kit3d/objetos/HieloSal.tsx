import React from "react";

// Escalón con hielo, granos de sal y un termómetro del pavimento.
// `temp` 0→1 (altura del líquido), `sal` 0→1 (granos sobre el hielo), `derrite` 0→1 (cuánto hielo se va),
// `congela` 0→1 (cristales de escarcha sobre los granos: la sal se quedó sin efecto). `frame` mueve los copos.

export type EstadoHieloSal = {
  frame: number;
  temp: number;
  sal: number;
  derrite: number;
  congela: number;
};

const GRANOS: [number, number][] = [
  [-0.9, -0.3], [-0.5, 0.2], [-0.2, -0.4], [0.1, 0.3], [0.4, -0.2], [0.7, 0.25], [1.0, -0.35],
  [-0.7, 0.45], [0.25, -0.5], [0.9, 0.45], [-1.1, 0.1], [0.55, 0.5], [-0.05, 0.05], [1.15, 0.0],
];

export const HieloSal: React.FC<{ e: EstadoHieloSal }> = ({ e }) => {
  const sal = Math.min(1, Math.max(0, e.sal));
  const der = Math.min(1, Math.max(0, e.derrite));
  const cong = Math.min(1, Math.max(0, e.congela));
  const liquido = 0.2 + 1.6 * Math.min(1, Math.max(0, e.temp));
  const hielo = 0.16 * (1 - 0.85 * der) + 0.01;
  return (
    <group position={[0, -0.4, 0]}>
      {/* pavimento */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.4, 1.8]} />
        <meshStandardMaterial color="#3c3f47" roughness={0.95} />
      </mesh>
      {/* hielo */}
      <mesh position={[0, 0.4 + hielo / 2, 0]}>
        <boxGeometry args={[3.4, hielo, 1.6]} />
        <meshStandardMaterial color="#8fcdf0" emissive="#3a8fd0" emissiveIntensity={0.2} transparent opacity={0.9} roughness={0.15} />
      </mesh>
      {/* granos de sal */}
      {sal > 0.01 &&
        GRANOS.map(([x, z], i) => (
          <mesh key={i} position={[x, 0.4 + hielo + 0.04 + (1 - sal) * 1.2 * ((i % 3) + 1) / 3, z]} castShadow>
            <boxGeometry args={[0.13, 0.1, 0.13]} />
            <meshStandardMaterial color="#fafafa" roughness={0.6} transparent opacity={Math.min(1, sal * 1.3)} />
          </mesh>
        ))}
      {/* escarcha sobre los granos */}
      {cong > 0.02 && (
        <mesh position={[0, 0.4 + hielo + 0.1, 0]} scale={[1, cong, 1]}>
          <boxGeometry args={[3.0, 0.1, 1.3]} />
          <meshStandardMaterial color="#eaf8ff" emissive="#9ad8ff" emissiveIntensity={0.4} transparent opacity={0.55 * cong} roughness={0.2} />
        </mesh>
      )}
      {/* termómetro */}
      <group position={[1.1, 1.5, -0.9]} scale={[0.8, 0.8, 0.8]}>
        <mesh>
          <boxGeometry args={[0.4, 2.4, 0.12]} />
          <meshStandardMaterial color="#e9edf2" roughness={0.5} />
        </mesh>
        <mesh position={[0, -1.35, 0.02]}>
          <sphereGeometry args={[0.28, 20, 20]} />
          <meshStandardMaterial color="#4ab4ff" emissive="#2a8aff" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, -1.15 + liquido / 2, 0.08]}>
          <boxGeometry args={[0.12, liquido, 0.06]} />
          <meshStandardMaterial color="#4ab4ff" emissive="#2a8aff" emissiveIntensity={0.4} />
        </mesh>
      </group>
      {/* copos de frío */}
      {Array.from({ length: 12 }, (_, i) => {
        const t = (e.frame / 70 + i / 12) % 1;
        return (
          <mesh key={i} position={[-3 + ((i * 0.71) % 1) * 6, 3.4 - t * 3.0, 0.8 + (i % 3) * 0.2]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#bfe6ff" emissiveIntensity={0.5} transparent opacity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

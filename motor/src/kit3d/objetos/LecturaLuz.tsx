import React from "react";

// Libro abierto sobre una mesa, lámpara y un ojo grande que mira el libro. Piso en y = 0.
// aparece 0..1. luz 0..1: brillo de la lámpara y del libro (0 = penumbra). cansancio 0..1: el ojo se entrecierra y se pone rojizo.
// ok 0..1: tilde verde sobre el ojo (cansa, pero no daña). frame: pulsos.

export type EstadoLectura = {
  aparece: number;
  luz: number;
  cansancio: number;
  ok: number;
  frame: number;
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const suave = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

export const LecturaLuz: React.FC<{ e: EstadoLectura }> = ({ e }) => {
  const ap = suave(e.aparece);
  const luz = clamp01(e.luz);
  const can = suave(e.cansancio);
  const ok = suave(e.ok);
  const parpado = 1;
  return (
    <group scale={ap}>
      {/* mesa */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.4, 0.2, 3]} />
        <meshStandardMaterial color="#6b4a32" roughness={0.8} />
      </mesh>
      {/* libro abierto */}
      <group position={[0, 0.66, 0.2]}>
        <mesh position={[-0.75, 0, 0]} rotation={[0, 0, 0.06]} castShadow>
          <boxGeometry args={[1.5, 0.12, 2]} />
          <meshStandardMaterial color="#f3efe0" roughness={0.7} emissive="#fff0b0" emissiveIntensity={0.55 * luz} />
        </mesh>
        <mesh position={[0.75, 0, 0]} rotation={[0, 0, -0.06]} castShadow>
          <boxGeometry args={[1.5, 0.12, 2]} />
          <meshStandardMaterial color="#f3efe0" roughness={0.7} emissive="#fff0b0" emissiveIntensity={0.55 * luz} />
        </mesh>
        {[-0.5, -0.2, 0.1, 0.4].map((z, i) => (
          <React.Fragment key={i}>
            <mesh position={[-0.75, 0.075, z]}>
              <boxGeometry args={[1.1, 0.01, 0.06]} />
              <meshStandardMaterial color="#8d887a" />
            </mesh>
            <mesh position={[0.75, 0.075, z]}>
              <boxGeometry args={[1.1, 0.01, 0.06]} />
              <meshStandardMaterial color="#8d887a" />
            </mesh>
          </React.Fragment>
        ))}
      </group>
      {/* lámpara */}
      <group position={[2.1, 0.6, -0.6]}>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.16, 20]} />
          <meshStandardMaterial color="#3a4256" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 2, 10]} />
          <meshStandardMaterial color="#3a4256" metalness={0.5} />
        </mesh>
        <mesh position={[-0.3, 2.15, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.5, 0.7, 20, 1, true]} />
          <meshStandardMaterial color="#2c3a58" side={2} metalness={0.4} />
        </mesh>
        <mesh position={[-0.4, 2.0, 0]}>
          <sphereGeometry args={[0.2, 18, 14]} />
          <meshStandardMaterial color="#ffe08a" emissive="#ffc84a" emissiveIntensity={0.1 + 2.2 * luz} />
        </mesh>
      </group>
      {/* ojo */}
      <group position={[0, 2.6, 0.4]} rotation={[0.35, 0, 0]}>
        <mesh scale={[1, parpado, 1]}>
          <sphereGeometry args={[0.85, 28, 20]} />
          <meshStandardMaterial color={can > 0.5 ? "#f2c4bd" : "#f6f6f2"} roughness={0.4} emissive="#ff4a3a" emissiveIntensity={0.35 * can} />
        </mesh>
        <mesh position={[0, 0, 0.62 * Math.max(0.5, parpado)]} scale={[1, parpado, 1]}>
          <sphereGeometry args={[0.38, 22, 16]} />
          <meshStandardMaterial color="#3b9fe0" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.8 * Math.max(0.55, parpado)]} scale={[1, parpado, 1]}>
          <sphereGeometry args={[0.17, 16, 12]} />
          <meshStandardMaterial color="#10131c" />
        </mesh>
        {/* párpado superior */}
        <mesh>
          <sphereGeometry args={[0.9, 28, 16, 0, Math.PI * 2, 0, 0.75 + 0.7 * can]} />
          <meshStandardMaterial color="#e0a99a" roughness={0.6} />
        </mesh>
      </group>
      {ok > 0.02 && (
        <group position={[1.7, 2.7, 0.6]} scale={ok}>
          <mesh position={[-0.2, -0.1, 0]} rotation={[0, 0, -0.8]}>
            <boxGeometry args={[0.3, 0.1, 0.1]} />
            <meshStandardMaterial color="#37d67a" emissive="#37d67a" emissiveIntensity={1.4} />
          </mesh>
          <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, 0.7]}>
            <boxGeometry args={[0.7, 0.1, 0.1]} />
            <meshStandardMaterial color="#37d67a" emissive="#37d67a" emissiveIntensity={1.4} />
          </mesh>
        </group>
      )}
    </group>
  );
};

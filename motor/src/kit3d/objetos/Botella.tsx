import React from "react";

// Botellón de agua con nivel + taza, mate y comida (de donde también sale el agua) + tubito de muestra de color. Piso en y = 0.
// aparece 0..1. nivel 0..1: agua en el botellón. extras 0..1: aparecen taza, mate y comida a los costados.
// muestra 0..1: aparece el tubito (color amarillo claro). tilde 0..1: tilde verde. frame: pulsos.

export type EstadoBotella = {
  aparece: number;
  nivel: number;
  extras: number;
  muestra: number;
  tilde: number;
  frame: number;
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const suave = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

export const Botella: React.FC<{ e: EstadoBotella }> = ({ e }) => {
  const ap = suave(e.aparece);
  const nivel = clamp01(e.nivel);
  const ex = suave(e.extras);
  const mu = suave(e.muestra);
  const ti = suave(e.tilde);
  const alto = 3.2;
  const agua = 0.1 + (alto - 0.4) * nivel;
  return (
    <group scale={ap}>
      {/* botellón: vidrio transparente */}
      <mesh position={[0, alto / 2, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, alto, 32, 1, true]} />
        <meshStandardMaterial color="#bfe6ff" transparent opacity={0.28} roughness={0.1} metalness={0.1} side={2} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.06, 32]} />
        <meshStandardMaterial color="#9fd0f0" transparent opacity={0.6} />
      </mesh>
      {/* agua */}
      {nivel > 0.01 && (
        <mesh position={[0, 0.06 + agua / 2, 0]}>
          <cylinderGeometry args={[0.7, 0.7, agua, 32]} />
          <meshStandardMaterial color="#3aa8ff" transparent opacity={0.75} emissive="#1d6fd0" emissiveIntensity={0.35} />
        </mesh>
      )}
      {/* tapa */}
      <mesh position={[0, alto + 0.12, 0]}>
        <cylinderGeometry args={[0.28, 0.4, 0.24, 20]} />
        <meshStandardMaterial color="#f2f2f2" roughness={0.5} />
      </mesh>
      <mesh position={[0, alto - 0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.75, 0.3, 24, 1, true]} />
        <meshStandardMaterial color="#bfe6ff" transparent opacity={0.28} side={2} />
      </mesh>

      {/* extras: taza, mate, comida (tomate y naranja) */}
      <group scale={ex} position={[-2.2, 0, 0.3]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.3, 0.8, 20]} />
          <meshStandardMaterial color="#f4f0e6" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.33, 0.33, 0.04, 20]} />
          <meshStandardMaterial color="#6b3d1e" />
        </mesh>
        <mesh position={[0.45, 0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.18, 0.05, 10, 16, Math.PI]} />
          <meshStandardMaterial color="#f4f0e6" />
        </mesh>
      </group>
      <group scale={ex} position={[2.7, 0, 0.3]}>
        {/* mate */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.3, 0.9, 20]} />
          <meshStandardMaterial color="#8a5a2b" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.04, 20]} />
          <meshStandardMaterial color="#4f8a2a" />
        </mesh>
        <mesh position={[0.12, 1.2, 0]} rotation={[0, 0, -0.25]}>
          <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
          <meshStandardMaterial color="#d8d8d8" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      <group scale={ex} position={[1.2, 0, 1.2]}>
        <mesh position={[-0.35, 0.3, 0]} castShadow>
          <sphereGeometry args={[0.32, 20, 16]} />
          <meshStandardMaterial color="#e0432e" roughness={0.4} />
        </mesh>
        <mesh position={[0.35, 0.32, 0.05]} castShadow>
          <sphereGeometry args={[0.34, 20, 16]} />
          <meshStandardMaterial color="#ff9a2e" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.22, 0.45]} castShadow>
          <sphereGeometry args={[0.24, 18, 14]} />
          <meshStandardMaterial color="#7ac043" roughness={0.5} />
        </mesh>
      </group>

      {/* tubito de muestra (amarillo claro) */}
      {mu > 0.02 && (
        <group position={[-1.5, 2.2, 1.6]} scale={mu}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 1.5, 20, 1, true]} />
            <meshStandardMaterial color="#e8f4ff" transparent opacity={0.3} side={2} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 1.2, 20]} />
            <meshStandardMaterial color="#ffd83a" emissive="#e6b800" emissiveIntensity={0.25} transparent opacity={0.95} />
          </mesh>
        </group>
      )}

      {ti > 0.02 && (
        <group position={[1.6, 3.3, 0.8]} scale={ti}>
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

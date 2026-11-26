import React from "react";

// Piedra, papel y tijera como tres objetos en fila (piedra a la izquierda, papel al centro, tijera a la derecha). Piso en y = 0.
// aparece 0..1: crecen. repite 0..1: aro dorado y eco sobre la piedra (el que gana repite).
// ciclo 0..1: flechas piedra→papel→tijera (el que pierde cambia en orden). foco 0..1: papel se enciende (la jugada que le gana a la piedra).
// frame: para pulsos.

export type EstadoManos = {
  aparece: number;
  repite: number;
  ciclo: number;
  foco: number;
  frame: number;
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const suave = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

const X = [-2.4, 0, 2.4];

const Flecha: React.FC<{ x0: number; x1: number; t: number; color: string }> = ({ x0, x1, t, color }) => {
  if (t <= 0.01) return null;
  const largo = (x1 - x0 - 1.5) * t;
  const cx = x0 + 0.75 + largo / 2;
  return (
    <group position={[0, 0.25, 1.5]}>
      <mesh position={[cx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, Math.max(0.01, largo), 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[x0 + 0.75 + largo + 0.12, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.22, 0.4, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
};

export const Manos: React.FC<{ e: EstadoManos }> = ({ e }) => {
  const ap = suave(e.aparece);
  const rep = suave(e.repite);
  const ci = suave(e.ciclo);
  const fo = suave(e.foco);
  const pulso = 1 + 0.06 * Math.sin(e.frame / 5);
  return (
    <group>
      {/* PIEDRA */}
      <group position={[X[0], 0, 0]} scale={ap * (1 + 0.18 * rep * pulso)}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <icosahedronGeometry args={[0.85, 1]} />
          <meshStandardMaterial color="#8d97ad" roughness={0.9} flatShading emissive="#ffb300" emissiveIntensity={0.5 * rep} />
        </mesh>
      </group>
      {rep > 0.02 && (
        <>
          <mesh position={[X[0], 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.4, 48]} />
            <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={1.5} transparent opacity={0.9 * rep} />
          </mesh>
          {/* eco: la misma piedra, atrás, otra vez */}
          <mesh position={[X[0], 0.6 + 0.1 * Math.sin(e.frame / 6), -1.9]} scale={0.7 * rep}>
            <icosahedronGeometry args={[0.85, 1]} />
            <meshStandardMaterial color="#8d97ad" roughness={0.9} flatShading transparent opacity={0.7} emissive="#ffb300" emissiveIntensity={0.4} />
          </mesh>
        </>
      )}
      {/* PAPEL */}
      <group position={[X[1], 0, 0]} scale={ap * (1 + 0.14 * fo * pulso)}>
        <mesh position={[0, 0.9, 0]} rotation={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[1.35, 1.7, 0.08]} />
          <meshStandardMaterial color="#f4f1e6" roughness={0.7} emissive="#5fd2ff" emissiveIntensity={0.7 * fo} />
        </mesh>
        {[0.45, 0.75, 1.05, 1.35].map((y, i) => (
          <mesh key={i} position={[0, y + 0.1, 0.05]} rotation={[0, 0.15, 0]}>
            <boxGeometry args={[0.95, 0.05, 0.02]} />
            <meshStandardMaterial color="#b9b4a0" />
          </mesh>
        ))}
      </group>
      {fo > 0.02 && (
        <mesh position={[X[1], 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.4, 48]} />
          <meshStandardMaterial color="#5fd2ff" emissive="#5fd2ff" emissiveIntensity={1.5} transparent opacity={0.9 * fo} />
        </mesh>
      )}
      {/* TIJERA */}
      <group position={[X[2], 0, 0]} scale={ap}>
        {[0.45, -0.45].map((a, i) => (
          <group key={i} position={[0, 1.0, 0]} rotation={[0, 0, a]}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[0.2, 1.6, 0.08]} />
              <meshStandardMaterial color="#d9dde6" metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[i === 0 ? -0.1 : 0.1, -0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.28, 0.07, 10, 24]} />
              <meshStandardMaterial color="#ff5a4d" roughness={0.5} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.16, 12]} />
          <meshStandardMaterial color="#555b6b" metalness={0.8} />
        </mesh>
      </group>
      <Flecha x0={X[0]} x1={X[1]} t={clamp01(ci * 2)} color="#ff9a2e" />
      <Flecha x0={X[1]} x1={X[2]} t={clamp01(ci * 2 - 1)} color="#ff9a2e" />
    </group>
  );
};

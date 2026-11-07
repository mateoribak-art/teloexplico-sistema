import React from "react";
import * as THREE from "three";

// Mesa de Thanksgiving: pavo asado al centro, relleno, puré y pastel a los costados,
// y una columna "medidor de sueño" a la derecha que se llena. Todo sale del frame.
// El piso está en y = 0; la mesa es una tabla oscura.

export type EstadoCenaPavo = {
  frame: number;
  pavo: number; // 0..1 el pavo aparece
  pavoFoco: number; // 0..1 el pavo brilla (se lo señala)
  comida: number; // 0..1 aparecen relleno, puré, rolls y pastel
  comidaFoco: number; // 0..1 los carbohidratos brillan
  platos: number; // 0..1 los platos se llenan de más (montañas)
  medidor: number; // 0..1 nivel del medidor de sueño
};

const MARRON = "#b8651f";
const DORADO = "#d99a46";

const Glow: React.FC<{ v: number; color?: string }> = ({ v, color = "#ffb43a" }) =>
  v > 0.02 ? <pointLight color={color} intensity={v * 1.5} distance={4} position={[0, 1.2, 0.8]} /> : null;

export const CenaPavo: React.FC<{ e: EstadoCenaPavo }> = ({ e }) => {
  const f = e.frame;
  const sp = (v: number) => 0.001 + v;
  const emPavo = e.pavoFoco * 0.2;
  const emComida = e.comidaFoco * 0.25;
  const mont = 1 + e.platos * 0.7;
  const flota = Math.sin(f / 18) * 0.03;
  return (
    <group scale={0.55}>
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[11, 0.08, 5]} />
        <meshStandardMaterial color="#2b2f3d" roughness={0.7} />
      </mesh>

      {/* pavo */}
      <group position={[0, 0, 0]} scale={sp(e.pavo)}>
        <mesh position={[0, 0.25, 0]} receiveShadow>
          <cylinderGeometry args={[1.5, 1.6, 0.1, 40]} />
          <meshStandardMaterial color="#f4f1ea" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.9, 0]} scale={[1.35, 0.85, 0.95]} castShadow>
          <sphereGeometry args={[0.9, 36, 28]} />
          <meshStandardMaterial color={MARRON} roughness={0.55} emissive="#ff9a2e" emissiveIntensity={emPavo} />
        </mesh>
        <mesh position={[-0.2, 1.35, 0.1]} scale={[1.0, 0.45, 0.7]}>
          <sphereGeometry args={[0.8, 28, 20]} />
          <meshStandardMaterial color={DORADO} roughness={0.5} emissive="#ff9a2e" emissiveIntensity={emPavo} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 1.1, 0.55, 0.5]} rotation={[0.3, 0, s * -0.9]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.16, 0.3, 0.9, 20]} />
              <meshStandardMaterial color={MARRON} roughness={0.55} emissive="#ff9a2e" emissiveIntensity={emPavo} />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.3, 12]} />
              <meshStandardMaterial color="#efe5cf" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.72, 0]}>
              <sphereGeometry args={[0.11, 14, 12]} />
              <meshStandardMaterial color="#efe5cf" roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* relleno (izquierda) */}
      <group position={[-3.4, 0, 0.2]} scale={sp(e.comida)}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[1.1, 0.9, 0.4, 32]} />
          <meshStandardMaterial color="#e8e4da" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.45, 0]} scale={[1, 0.55 * mont, 1]} castShadow>
          <sphereGeometry args={[0.95, 28, 18]} />
          <meshStandardMaterial color="#c99a55" roughness={0.9} emissive="#ffc24a" emissiveIntensity={emComida} />
        </mesh>
      </group>

      {/* puré (izquierda, atrás) */}
      <group position={[-1.9, 0, -1.4]} scale={sp(e.comida)}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.9, 0.75, 0.4, 32]} />
          <meshStandardMaterial color="#e8e4da" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.45, 0]} scale={[1, 0.6 * mont, 1]} castShadow>
          <sphereGeometry args={[0.78, 28, 18]} />
          <meshStandardMaterial color="#f2e7c4" roughness={0.8} emissive="#ffc24a" emissiveIntensity={emComida} />
        </mesh>
      </group>

      {/* panecillos (derecha, atrás) */}
      <group position={[2.4, 0, -1.3]} scale={sp(e.comida)}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[(i % 2) * 0.7 - 0.35, 0.25 + Math.floor(i / 2) * 0.05, Math.floor(i / 2) * 0.6 - 0.3]} scale={[1, 0.65, 0.8]} castShadow>
            <sphereGeometry args={[0.4, 20, 14]} />
            <meshStandardMaterial color="#d89a52" roughness={0.7} emissive="#ffc24a" emissiveIntensity={emComida} />
          </mesh>
        ))}
      </group>

      {/* pastel (derecha, adelante) */}
      <group position={[2.6, 0, 0.7]} rotation={[0, -0.3, 0]} scale={sp(e.comida)}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[1.0, 0.85, 0.24, 36]} />
          <meshStandardMaterial color="#c58a45" roughness={0.7} emissive="#ffc24a" emissiveIntensity={emComida} />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 0.06, 36]} />
          <meshStandardMaterial color="#c8681f" roughness={0.6} emissive="#ffc24a" emissiveIntensity={emComida} />
        </mesh>
      </group>

      {/* medidor de sueño */}
      <group position={[4.2, 0, 0.6]}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.5, 3, 0.4]} />
          <meshStandardMaterial color="#1b1f2c" roughness={0.6} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 0.05 + (2.8 * e.medidor) / 2, 0.05]} scale={[1, Math.max(0.001, e.medidor), 1]}>
          <boxGeometry args={[0.38, 2.8, 0.34]} />
          <meshStandardMaterial color="#6f8bff" emissive="#6f8bff" emissiveIntensity={0.5} />
        </mesh>
      </group>

      <group position={[0, flota, 0]}>
        <Glow v={Math.max(e.pavoFoco, e.comidaFoco)} />
      </group>
      <ambientLight intensity={0.1} color={new THREE.Color("#ffffff")} />
    </group>
  );
};

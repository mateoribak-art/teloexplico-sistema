import React from "react";

// Cerebro hecho con diez zonas (esferas achatadas que forman un cerebro de perfil). Cada zona se enciende
// con un color distinto. `diez` 1 = solo una zona prendida (el mito); `todo` 0→1 = se prenden las diez en ola
// (con pulso, "según lo que hagas"); `compacto` 0→1 lo achica y lo sube para dejar lugar a las barras;
// `barras` 0→1 dibuja dos barras: peso (2 % del cuerpo) y energía (20 %) sobre una escala de 100 %.

export type EstadoCerebro = {
  frame: number;
  diez: number;
  todo: number;
  compacto: number;
  barras: number;
};

const ZONAS: { p: [number, number, number]; r: number; color: string }[] = [
  { p: [-1.3, 0.3, 0], r: 0.62, color: "#ff7a59" },
  { p: [-0.8, 0.9, 0.1], r: 0.62, color: "#ffc53d" },
  { p: [-0.1, 1.1, 0], r: 0.66, color: "#7be08a" },
  { p: [0.7, 0.9, 0.1], r: 0.62, color: "#5fd2ff" },
  { p: [1.3, 0.3, 0], r: 0.6, color: "#a98bff" },
  { p: [-0.8, -0.2, 0.15], r: 0.56, color: "#ff6fb0" },
  { p: [0.0, 0.2, 0.2], r: 0.7, color: "#ffa23d" },
  { p: [0.8, -0.2, 0.15], r: 0.56, color: "#4fe0c4" },
  { p: [1.15, -0.75, 0], r: 0.42, color: "#ff5a5a" },
  { p: [0.45, -1.0, 0], r: 0.3, color: "#9fb8ff" },
];
const ZONA_MITO = 2;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const Cerebro: React.FC<{ e: EstadoCerebro }> = ({ e }) => {
  const esc = 1 - 0.3 * e.compacto;
  const y = 1.1 + 0.4 * e.compacto;
  const giro = Math.sin(e.frame / 80) * 0.3;
  return (
    <group>
      <group position={[0, y, 0]} scale={esc} rotation={[0, giro, 0]}>
        {ZONAS.map((z, i) => {
          const ola = clamp01(e.todo * 12 - i);
          const base = i === ZONA_MITO ? e.diez : 0;
          const luz = Math.max(base, ola);
          const pulso = 0.85 + 0.25 * Math.sin(e.frame / 6 + i * 1.3);
          return (
            <mesh key={i} position={z.p} scale={[1.1, 0.95, 0.9]} castShadow>
              <sphereGeometry args={[z.r, 28, 28]} />
              <meshStandardMaterial
                color={luz > 0.05 ? z.color : "#7d6772"}
                roughness={0.55}
                emissive={z.color}
                emissiveIntensity={luz * 0.9 * pulso}
              />
            </mesh>
          );
        })}
      </group>
      {e.barras > 0.01 && (
        <group position={[-1.8, 0, 0]}>
          {/* marco de 100 % */}
          {[-0.5, -0.95].map((yy, i) => (
            <mesh key={i} position={[1.8, yy, -0.05]}>
              <boxGeometry args={[3.6, 0.3, 0.04]} />
              <meshStandardMaterial color="#25324f" roughness={0.8} transparent opacity={0.8 * e.barras} />
            </mesh>
          ))}
          {/* peso: 2 % de 3,6 */}
          <mesh position={[(3.6 * 0.02 * e.barras) / 2, -0.5, 0]}>
            <boxGeometry args={[Math.max(0.01, 3.6 * 0.02 * e.barras), 0.24, 0.12]} />
            <meshStandardMaterial color="#5fd2ff" emissive="#5fd2ff" emissiveIntensity={0.5} />
          </mesh>
          {/* energía: 20 % de 3,6 */}
          <mesh position={[(3.6 * 0.2 * e.barras) / 2, -0.95, 0]}>
            <boxGeometry args={[Math.max(0.01, 3.6 * 0.2 * e.barras), 0.24, 0.12]} />
            <meshStandardMaterial color="#ffc53d" emissive="#ffc53d" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
};

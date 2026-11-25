import React from "react";

// Tres barras de precio: $100, $80 (20 % menos) y $64 (otro 20 % menos, sobre los $80).
// Un marco fantasma marca los $60 que mucha gente espera. El piso está en y = 0.

export type EstadoDescuentos = {
  frame: number;
  b100: number; // 0..1 barra de $100
  b80: number; // 0..1 barra de $80 + tajada roja
  b64: number; // 0..1 barra de $64 + tajada roja
  fantasma: number; // 0..1 marco de $60 (lo que se espera)
};

const U = 0.024; // alto por dólar
const ANCHO = 1.1;
const X = [-1.9, -0.35, 1.2];

const Barra: React.FC<{ x: number; precio: number; k: number; color: string }> = ({ x, precio, k, color }) => {
  const h = Math.max(0.001, precio * U * k);
  return (
    <mesh position={[x, h / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[ANCHO, h, 0.7]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.15} />
    </mesh>
  );
};

const Tajada: React.FC<{ x: number; desde: number; hasta: number; k: number }> = ({ x, desde, hasta, k }) => {
  const h = (desde - hasta) * U * k;
  if (h < 0.002) return null;
  return (
    <mesh position={[x, hasta * U + h / 2, 0]}>
      <boxGeometry args={[ANCHO, h, 0.7]} />
      <meshStandardMaterial color="#ff5a4d" transparent opacity={0.45} roughness={0.5} depthWrite={false} />
    </mesh>
  );
};

export const Descuentos: React.FC<{ e: EstadoDescuentos }> = ({ e }) => {
  const alto60 = 60 * U;
  return (
    <group>
      <Barra x={X[0]} precio={100} k={e.b100} color="#8fa3b8" />
      <Barra x={X[1]} precio={80} k={e.b80} color="#5fd2ff" />
      <Tajada x={X[1]} desde={100} hasta={80} k={e.b80} />
      <Barra x={X[2]} precio={64} k={e.b64} color="#f2c94c" />
      <Tajada x={X[2]} desde={80} hasta={64} k={e.b64} />
      {/* marco fantasma de $60 */}
      {e.fantasma > 0.01 && (
        <mesh position={[X[2], alto60, 0]} scale={[1, 1, 1]}>
          <boxGeometry args={[ANCHO + 0.12, 0.03, 0.82]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9 * e.fantasma} />
        </mesh>
      )}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[5.4, 0.04, 1.2]} />
        <meshStandardMaterial color="#1c2536" roughness={0.8} />
      </mesh>
    </group>
  );
};

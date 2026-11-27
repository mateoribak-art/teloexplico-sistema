import React from "react";

// Cuatro barras: la cuenta ($50), el 10 % ($5), el 20 % ($10) y el 15 % ($7.50).
// El 10 % se "desliza" desde la cuenta; el 20 % es el doble del 10 %. El piso está en y = 0.

export type EstadoPropina = {
  frame: number;
  cuenta: number; // 0..1 barra de $50
  diez: number; // 0..1 barra de $5
  veinte: number; // 0..1 barra de $10 (duplica la de $5)
  quince: number; // 0..1 barra de $7.50
};

const U = 0.03; // alto por dólar
const ANCHO = 0.7;
const X = [-1.5, -0.5, 0.5, 1.5];

const Barra: React.FC<{ x: number; precio: number; k: number; color: string }> = ({ x, precio, k, color }) => {
  const h = Math.max(0.001, precio * U * k);
  return (
    <mesh position={[x, h / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[ANCHO, h, 0.7]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.15} />
    </mesh>
  );
};

export const Propina: React.FC<{ e: EstadoPropina }> = ({ e }) => (
  <group>
    <Barra x={X[0]} precio={50} k={e.cuenta} color="#8fa3b8" />
    <Barra x={X[1]} precio={5} k={e.diez} color="#5fd2ff" />
    <Barra x={X[2]} precio={10} k={e.veinte} color="#f2c94c" />
    <Barra x={X[3]} precio={7.5} k={e.quince} color="#7bd88f" />
    <mesh position={[0, -0.02, 0]} receiveShadow>
      <boxGeometry args={[6.2, 0.04, 1.2]} />
      <meshStandardMaterial color="#1c2536" roughness={0.8} />
    </mesh>
  </group>
);

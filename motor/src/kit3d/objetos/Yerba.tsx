import React from "react";

// Paquete de yerba genérico (sin marca ni diseño real), calendario de 12 mes-fichas, personas y casitas.
// Todo sale del estado (frame → números). Piso en y = 0.

export type EstadoYerba = {
  frame: number;
  paquetes: number; // 0..9 cuántos paquetes hay sobre el calendario (decimales = cae el siguiente)
  calendario: number; // 0..1 las 12 fichas aparecen
  personas: number; // 0..1 fila de personas al fondo
  casas: number; // 0..1 diez casitas (9 encendidas)
  extra: number; // 0..1 los paquetes 7 a 9 en acento ("vos, con mate diario")
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const Paquete: React.FC<{ color?: string; brillo?: number }> = ({ color = "#3f8f4a", brillo = 0 }) => (
  <group>
    <mesh position={[0, 0.55, 0]} castShadow>
      <boxGeometry args={[0.8, 1.1, 0.3]} />
      <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={brillo} />
    </mesh>
    {/* sellado de arriba y de abajo */}
    <mesh position={[0, 1.08, 0]} castShadow>
      <boxGeometry args={[0.84, 0.08, 0.34]} />
      <meshStandardMaterial color="#e9efe2" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.03, 0]}>
      <boxGeometry args={[0.84, 0.06, 0.34]} />
      <meshStandardMaterial color="#e9efe2" roughness={0.6} />
    </mesh>
    {/* etiqueta genérica */}
    <mesh position={[0, 0.58, 0.152]}>
      <boxGeometry args={[0.6, 0.55, 0.01]} />
      <meshStandardMaterial color="#f5ecc8" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.58, 0.16]}>
      <circleGeometry args={[0.16, 28]} />
      <meshStandardMaterial color="#c8453a" roughness={0.5} />
    </mesh>
  </group>
);

const FICHA = { ancho: 1.1, largo: 1.2 };
const posFicha = (i: number): [number, number] => {
  const c = i % 3;
  const f = Math.floor(i / 3);
  return [(c - 1) * 1.3, (f - 1.5) * 1.45];
};

const PERSONAS: { x: number; alto: number; color: string }[] = [
  { x: -2.4, alto: 0.55, color: "#f2a65a" },
  { x: -1.2, alto: 1.0, color: "#6aa9e8" },
  { x: 0, alto: 1.5, color: "#8fd694" },
  { x: 1.2, alto: 1.3, color: "#c79be8" },
  { x: 2.4, alto: 1.45, color: "#8d93a3" },
];

const Persona: React.FC<{ alto: number; color: string; v: number }> = ({ alto, color, v }) => (
  <group scale={v}>
    <mesh position={[0, alto * 0.38, 0]} castShadow>
      <capsuleGeometry args={[0.2, alto * 0.45, 8, 16]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
    <mesh position={[0, alto * 0.9, 0]} castShadow>
      <sphereGeometry args={[0.2, 20, 16]} />
      <meshStandardMaterial color="#f0d3b5" roughness={0.6} />
    </mesh>
  </group>
);

const Casa: React.FC<{ encendida: boolean; v: number }> = ({ encendida, v }) => (
  <group scale={v}>
    <mesh position={[0, 0.3, 0]} castShadow>
      <boxGeometry args={[0.7, 0.6, 0.7]} />
      <meshStandardMaterial color={encendida ? "#3f8f4a" : "#4a5060"} roughness={0.6} emissive={encendida ? "#3f8f4a" : "#000000"} emissiveIntensity={encendida ? 0.35 : 0} />
    </mesh>
    <mesh position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[0.62, 0.4, 4]} />
      <meshStandardMaterial color={encendida ? "#f5ecc8" : "#666c7c"} roughness={0.6} />
    </mesh>
  </group>
);

export const Yerba: React.FC<{ e: EstadoYerba }> = ({ e }) => {
  const pasoPaquete = (i: number) => clamp01(e.paquetes - i);
  return (
    <group>
      {/* fichas del calendario (cada una = un mes) */}
      {Array.from({ length: 12 }, (_, i) => {
        const [x, z] = posFicha(i);
        const v = clamp01(e.calendario * 1.6 - i * 0.05);
        if (v <= 0) return null;
        return (
          <mesh key={`f${i}`} position={[x, 0.03 * v, z]} scale={[v, v, v]} receiveShadow>
            <boxGeometry args={[FICHA.ancho, 0.06, FICHA.largo]} />
            <meshStandardMaterial color="#27324d" roughness={0.6} />
          </mesh>
        );
      })}
      {/* un paquete cada dos meses: en las fichas 2, 4, 6, 8, 10 y 12; los extra, a su lado */}
      {Array.from({ length: 9 }, (_, i) => {
        const v = pasoPaquete(i);
        if (v <= 0) return null;
        const esExtra = i >= 6;
        const [x, z] = posFicha(esExtra ? (i - 6) * 2 + 1 : i * 2 + 1);
        const caida = (1 - v) * 3.2;
        return (
          <group key={`p${i}`} position={[x + (esExtra ? -0.27 : 0.27), 0.06 + caida, z]} scale={0.7 * (esExtra ? e.extra : 1)}>
            <Paquete color={esExtra ? "#ffc53d" : "#3f8f4a"} brillo={esExtra ? 0.25 : 0} />
          </group>
        );
      })}
      {/* personas al fondo */}
      {e.personas > 0.01 &&
        PERSONAS.map((p, i) => (
          <group key={`pe${i}`} position={[p.x, 0, -4.1]}>
            <Persona alto={p.alto} color={p.color} v={clamp01(e.personas * 1.8 - i * 0.12)} />
          </group>
        ))}
      {/* diez casitas, nueve encendidas */}
      {e.casas > 0.01 &&
        Array.from({ length: 10 }, (_, i) => (
          <group key={`c${i}`} position={[((i % 5) - 2) * 1.0, 0, (Math.floor(i / 5) - 0.5) * 1.5]}>
            <Casa encendida={i < 9} v={clamp01(e.casas * 1.8 - i * 0.07)} />
          </group>
        ))}
    </group>
  );
};

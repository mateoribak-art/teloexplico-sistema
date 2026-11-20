import React from "react";
import { MateObjeto } from "./Mate";

// Agua del mate: un termómetro grande (columna que sube de 0 a 100), una banda verde de 75 a 80 y un mate al lado.
// Todo sale del estado (frame → números). Piso en y = 0.

export type EstadoAguaMate = {
  frame: number;
  grados: number; // 0..100 altura de la columna
  banda: number; // 0..1 aparece la banda 75–80
  hierve: number; // 0..1 la columna se pone roja (cien)
  mate: number; // 0..1 aparece el mate
  quemada: number; // 0..1 el mate se oscurece (yerba quemada)
};

const ALTO = 5; // alto de la escala (0..100)
const Y0 = 0.6;
const yDe = (g: number) => Y0 + (g / 100) * ALTO;
const VERDE = "#5ad17a";
const ROJO = "#ff3a2e";

export const portadaAguaMate = (): EstadoAguaMate => ({ frame: 0, grados: 78, banda: 1, hierve: 0, mate: 1, quemada: 0 });

export const AguaMate: React.FC<{ e: EstadoAguaMate }> = ({ e }) => {
  const g = Math.max(0.5, e.grados);
  const color = e.hierve > 0.5 ? ROJO : "#ffb23d";
  const marcas = [0, 25, 50, 75, 100];
  return (
    <group>
      {/* base y tubo de vidrio */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.6, 32]} />
        <meshStandardMaterial color="#3a4254" roughness={0.5} />
      </mesh>
      <mesh position={[0, Y0 + ALTO / 2, 0]}>
        <cylinderGeometry args={[0.28, 0.28, ALTO + 0.4, 24]} />
        <meshStandardMaterial color="#dfe9f7" transparent opacity={0.22} roughness={0.1} />
      </mesh>
      {/* columna de líquido */}
      <mesh position={[0, Y0 + (g / 100) * ALTO * 0.5, 0]}>
        <cylinderGeometry args={[0.17, 0.17, (g / 100) * ALTO, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, Y0 - 0.05, 0]}>
        <sphereGeometry args={[0.36, 24, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
      </mesh>
      {/* marcas de la escala */}
      {marcas.map((m) => (
        <mesh key={m} position={[0.42, yDe(m), 0]}>
          <boxGeometry args={[0.3, 0.04, 0.04]} />
          <meshStandardMaterial color="#c9d3e4" />
        </mesh>
      ))}
      {/* banda 75–80 */}
      {e.banda > 0.01 && (
        <group scale={[1, 1, 1]}>
          <mesh position={[0.1, (yDe(75) + yDe(80)) / 2, 0]} scale={[e.banda, 1, e.banda]}>
            <boxGeometry args={[1.1, yDe(80) - yDe(75), 0.5]} />
            <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.6} transparent opacity={0.55} />
          </mesh>
        </group>
      )}
      {/* mate al lado */}
      {e.mate > 0.01 && (
        <group position={[2.3, 0, 0.4]} scale={e.mate * 2.2}>
          <MateObjeto />
          {e.quemada > 0.01 && (
            <mesh position={[0, 0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.2, 32]} />
              <meshStandardMaterial color="#2a1a0c" transparent opacity={e.quemada} />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
};

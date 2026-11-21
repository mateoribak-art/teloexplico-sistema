import React from "react";
import { Heladera, HELADERA_X, type EstadoHeladera } from "./Heladera";

// Heladera con un vaso de agua en el estante del medio y un termómetro adentro.
// La columna del termómetro sube/baja con `temp` (en °C); verde si es 4 o menos.
// Reusa la Heladera del kit (puerta, estantes). Todo sale del frame.

export type EstadoHeladeraTermo = {
  frame: number;
  puerta: number; // 0..1
  fantasmaPuerta: number; // 0..1
  vaso: number; // 0..1 el vaso aparece
  temp: number; // °C que marca el termómetro
  reloj: number; // 0..1 aguja
  relojOn: number; // 0..1
  escarcha: number; // 0..1
};

const Y_ESTANTE = 1.9;

export const HeladeraTermo: React.FC<{ e: EstadoHeladeraTermo }> = ({ e }) => {
  const base: EstadoHeladera = {
    frame: e.frame,
    puerta: e.puerta,
    fantasmaPuerta: e.fantasmaPuerta,
    ollaT: 0,
    tapa: 1,
    vapor: 0,
    tuppers: 0,
    freezerT: 0,
    papel: 0,
    reloj: e.reloj,
    relojOn: e.relojOn,
    dias: 0,
    escarcha: e.escarcha,
  };
  const frio = e.temp <= 4.05;
  const color = frio ? "#38e08c" : "#ff4a3a";
  const alto = 0.12 + Math.max(0, Math.min(14, e.temp)) * 0.03;
  return (
    <group>
      <Heladera e={base} />
      {e.vaso > 0.01 && (
        <group position={[HELADERA_X, Y_ESTANTE + 0.02, 0.1]} scale={e.vaso}>
          {/* vaso de vidrio */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.24, 0.2, 0.6, 32]} />
            <meshStandardMaterial color="#dff1ff" transparent opacity={0.28} roughness={0.05} metalness={0.1} depthWrite={false} />
          </mesh>
          {/* agua */}
          <mesh position={[0, 0.24, 0]}>
            <cylinderGeometry args={[0.225, 0.195, 0.46, 32]} />
            <meshStandardMaterial color="#4fb3ff" transparent opacity={0.55} roughness={0.1} depthWrite={false} />
          </mesh>
          {/* termómetro: tubo + columna */}
          <group position={[0.06, 0, 0.02]} rotation={[0, 0, -0.12]}>
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[0.09, 0.9, 0.05]} />
              <meshStandardMaterial color="#f4f6fb" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.06 + alto / 2, 0.03]}>
              <boxGeometry args={[0.035, alto, 0.02]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.05, 0.03]}>
              <sphereGeometry args={[0.05, 14, 12]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
          {/* halo del estado */}
          <pointLight position={[0, 0.6, 0.5]} intensity={1.6} distance={1.8} color={color} />
        </group>
      )}
    </group>
  );
};

export const portadaHeladeraTermo = (): EstadoHeladeraTermo => ({
  frame: 0,
  puerta: 0.9,
  fantasmaPuerta: 0,
  vaso: 1,
  temp: 9,
  reloj: 0,
  relojOn: 0,
  escarcha: 0.6,
});

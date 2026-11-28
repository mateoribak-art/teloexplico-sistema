import React, { useMemo } from "react";
import * as THREE from "three";

// Glaciar visto desde el lago: bloque de hielo con el frente irregular que retrocede, lago, líneas de referencia
// del frente (rojas) y dos barras de comparación (lento vs rápido). Todo sale del frame. Piso (agua) en y = 0.

export type EstadoGlaciar = {
  frame: number;
  retro: number; // 0..1 cuánto retrocedió el frente
  linea: number; // 0..1 aparece la línea roja donde estaba el frente al principio
  barraA: number; // 0..1 barra lenta (0,34 m/año)
  barraB: number; // 0..1 barra rápida (5,5 m/año)
  resalta: number; // 0..1 el hielo se tiñe de azul eléctrico (acento)
};

const ANCHO = 3.4;
const COLS = 9;
const alturas = [1.05, 1.25, 1.1, 1.35, 1.2, 1.3, 1.05, 1.22, 1.1];
const avances = [0.1, -0.15, 0.2, -0.05, 0.15, -0.2, 0.1, -0.1, 0.18];

export const Glaciar: React.FC<{ e: EstadoGlaciar }> = ({ e }) => {
  const ease = e.retro * e.retro * (3 - 2 * e.retro);
  const zf = 0.6 - 1.7 * ease; // frente
  const hielo = new THREE.Color("#8cc3e0").lerp(new THREE.Color("#4fc3ff"), e.resalta).getStyle();
  const cols = useMemo(() => Array.from({ length: COLS }, (_, i) => i), []);
  const w = ANCHO / COLS;
  return (
    <group>
      {/* lago */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#2f86b5" roughness={0.18} metalness={0.2} />
      </mesh>
      {/* cerro de fondo (roca) */}
      <mesh position={[0, 0.9, -6.2]}>
        <boxGeometry args={[ANCHO + 2.2, 1.8, 1.2]} />
        <meshStandardMaterial color="#4a5566" roughness={0.9} />
      </mesh>
      {/* hielo: columnas con frente irregular */}
      {cols.map((i) => {
        const x = -ANCHO / 2 + w * (i + 0.5);
        const prof = 6.2;
        const frente = zf + avances[i] * (1 - 0.4 * ease);
        const z = frente - prof / 2;
        const h = alturas[i];
        return (
          <mesh key={i} position={[x, h / 2, z]} castShadow>
            <boxGeometry args={[w * 1.01, h, prof]} />
            <meshStandardMaterial color={hielo} roughness={0.5} metalness={0} envMapIntensity={0.35} emissive={hielo} emissiveIntensity={0.04 + 0.12 * e.resalta} />
          </mesh>
        );
      })}
      {/* línea roja: dónde estaba el frente */}
      {e.linea > 0.01 && (
        <mesh position={[0, 0.03, 0.65]} scale={[e.linea, 1, 1]}>
          <boxGeometry args={[ANCHO + 0.8, 0.04, 0.06]} />
          <meshBasicMaterial color="#ff5a4a" />
        </mesh>
      )}
      {/* barras de comparación (delante del frente) */}
      {e.barraA > 0.01 && (
        <mesh position={[-0.55, (0.037 * e.barraA) / 2 + 0.03, 1.9]}>
          <boxGeometry args={[0.5, 0.037 * e.barraA + 0.0001, 0.5]} />
          <meshStandardMaterial color="#f5c542" emissive="#f5c542" emissiveIntensity={0.3} />
        </mesh>
      )}
      {e.barraB > 0.01 && (
        <mesh position={[0.55, (0.6 * e.barraB) / 2 + 0.03, 1.9]} castShadow>
          <boxGeometry args={[0.5, 0.6 * e.barraB, 0.5]} />
          <meshStandardMaterial color="#ff5a4a" emissive="#ff5a4a" emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  );
};

export const estadoPortadaGlaciar = (): EstadoGlaciar => ({ frame: 0, retro: 1, linea: 1, barraA: 0, barraB: 0, resalta: 0.3 });

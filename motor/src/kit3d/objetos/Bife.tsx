import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Bife (steak) en capas, para ver "por dentro" cómo avanza la cocción de abajo hacia arriba, y una sartén de hierro.
// Cada capa tiene un grado de cocción 0..1 (0 = crudo y rosado, 1 = bien cocido, marrón grisáceo).
// Todo sale del frame: el giro (flip) es una función de los frames en que se da vuelta.

export const CAPAS = 6;
const ALTO_CAPA = 0.07;
const caja = (w: number, h: number, d: number, r = 0.03) => new RoundedBoxGeometry(w, h, d, 3, r);

const CRUDO = new THREE.Color("#962034");
const MEDIO = new THREE.Color("#a5606a");
const HECHO = new THREE.Color("#6b503e");
const COSTRA = new THREE.Color("#3d1f0c");

/** Color de una capa según su cocción (0..1) y cuánta costra tiene si está en una cara externa. */
export const colorCapa = (cocido: number, costra = 0): THREE.Color => {
  const c = cocido < 0.5 ? CRUDO.clone().lerp(MEDIO, cocido * 2) : MEDIO.clone().lerp(HECHO, (cocido - 0.5) * 2);
  return c.lerp(COSTRA, Math.min(1, Math.max(0, costra)));
};

export type EstadoBife = {
  frame: number;
  /** cocción de cada capa, de abajo (0) hacia arriba (5) */
  perfil: number[];
  /** costra en las dos caras externas, 0..1 */
  costra: number;
  /** frames en que se da vuelta (cada giro dura ~14 frames) */
  vueltas: number[];
};

export const girado = (vueltas: number[], frame: number) => {
  let medias = 0;
  let giro = 0;
  let salto = 0;
  vueltas.forEach((f) => {
    const t = (frame - f) / 14;
    if (t >= 1) medias += 1;
    else if (t > 0) {
      const s = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      giro = s;
      salto = Math.sin(Math.PI * t) * 1.1;
    }
  });
  return { angulo: (medias + giro) * Math.PI, salto };
};

/** El bife solo (sirve en la sartén y servido en una tabla). Apoya su cara de abajo en y = 0. */
export const Bife: React.FC<{ e: EstadoBife; ancho?: number; fondo?: number }> = ({ e, ancho = 1.5, fondo = 1.05 }) => {
  const capas = useMemo(() => Array.from({ length: CAPAS }, (_, i) => caja(ancho, ALTO_CAPA, fondo, i === 0 || i === CAPAS - 1 ? 0.035 : 0.012)), [ancho, fondo]);
  return (
    <group>
      {capas.map((g, i) => {
        const externa = i === 0 || i === CAPAS - 1;
        const col = colorCapa(e.perfil[i] ?? 0, externa ? e.costra : 0);
        return (
          <mesh key={i} geometry={g} position={[0, ALTO_CAPA * (i + 0.5), 0]} castShadow receiveShadow>
            <meshStandardMaterial color={col} roughness={0.9} envMapIntensity={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Sartén de hierro vista de costado: torno para el cuerpo y un caño para el mango. */
export const Sarten: React.FC<{ calor: number }> = ({ calor }) => {
  const cuerpo = useMemo(() => {
    // perfil de abajo hacia arriba (si no, las normales quedan al revés)
    const pts = [
      [0.01, 0],
      [1.45, 0],
      [1.6, 0.06],
      [1.75, 0.34],
      [1.7, 0.36],
      [1.62, 0.12],
      [0.01, 0.07],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 56);
  }, []);
  return (
    <group>
      <mesh geometry={cuerpo} castShadow receiveShadow>
        <meshStandardMaterial color="#23262d" roughness={0.7} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* fondo oscuro mate: sin esto el reflejo del cuarto lo pinta de celeste */}
      <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.62, 48]} />
        <meshStandardMaterial color="#14161b" roughness={0.95} metalness={0} envMapIntensity={0.1} />
      </mesh>
      {/* mango */}
      <mesh position={[2.55, 0.26, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.09, 0.07, 1.6, 16]} />
        <meshStandardMaterial color="#1b1d22" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* brillo naranja del fuego abajo */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.9, 48]} />
        <meshBasicMaterial color="#ff6a1f" transparent opacity={0.55 * calor} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** Chispitas de calor que suben desde la sartén hacia la cara de abajo del bife. */
export const ChispasCalor: React.FC<{ frame: number; cantidad: number; y0: number; y1: number }> = ({ frame, cantidad, y0, y1 }) => {
  if (cantidad <= 0.02) return null;
  const n = Math.round(14 * cantidad);
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const t = (frame * (0.02 + random(`cv${i}`) * 0.015) + random(`cf${i}`)) % 1;
        return (
          <mesh key={i} position={[(random(`cx${i}`) - 0.5) * 1.3, y0 + (y1 - y0) * t, (random(`cz${i}`) - 0.5) * 0.9]}>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshBasicMaterial color="#ff9a3a" transparent opacity={0.9 * Math.sin(Math.PI * t)} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Vapor / chisporroteo: sprites blancos que suben y se desvanecen. */
export const Vapor: React.FC<{ frame: number; intensidad: number; x?: number; y?: number }> = ({ frame, intensidad, x = 0, y = 0.6 }) => {
  if (intensidad <= 0.02) return null;
  const n = Math.round(10 * intensidad);
  return (
    <group position={[x, y, 0]}>
      {Array.from({ length: n }, (_, i) => {
        const t = (frame * 0.018 + random(`vf${i}`)) % 1;
        return (
          <mesh key={i} position={[(random(`vx${i}`) - 0.5) * 1.6 + Math.sin(frame / 20 + i) * 0.06, t * 1.1, (random(`vz${i}`) - 0.5) * 0.8]} scale={0.6 + t * 1.4}>
            <sphereGeometry args={[0.08, 10, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.22 * intensidad * Math.sin(Math.PI * t)} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

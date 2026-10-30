import React, { useMemo } from "react";
import { random } from "remotion";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Corte lateral de una tormenta lejana: a la izquierda una casita con la ventana prendida, a la derecha la
// nube con su rayo, y en el medio el suelo con postes de milla. Del rayo salen dos ondas: la de la luz (casi
// instantánea, amarilla) y la del sonido (lenta, celeste) que viaja por el aire hasta la casa.
// Escala: 1 milla = MILLA unidades; la casa está a 3 millas de la nube. Todo sale del frame: sin useFrame.

export const MILLA = 1.15;
export const X_CASA = -1.75;
export const X_NUBE = X_CASA + 3 * MILLA;

export type EstadoRayo = {
  frame: number;
  rayo: number; // 0..1 brillo del rayo (0 = apagado)
  luz: number; // 0..1 avance de la onda de luz (0 = no está)
  sonido: number; // 0..1 avance de la onda de sonido (0 = no está)
  postes: number; // 0..1 cuántos postes de milla se ven
  casa: number; // 0..1 destello de la casa cuando llega el trueno
};

const caja = (w: number, h: number, d: number, r = 0.04) => new RoundedBoxGeometry(w, h, d, 3, r);

const Casa: React.FC<{ golpe: number }> = ({ golpe }) => {
  const cuerpo = useMemo(() => caja(1.1, 0.8, 0.8, 0.05), []);
  const puerta = useMemo(() => caja(0.2, 0.4, 0.04, 0.02), []);
  return (
    <group position={[X_CASA, 0, 0]} scale={1 + 0.04 * golpe}>
      <mesh geometry={cuerpo} position={[0, 0.4, 0]} castShadow>
        <meshStandardMaterial color="#d9c7a6" roughness={0.7} />
      </mesh>
      {/* techo a dos aguas */}
      <mesh position={[0, 1.0, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.72]} castShadow>
        <coneGeometry args={[0.95, 0.6, 4]} />
        <meshStandardMaterial color="#8c3b32" roughness={0.6} />
      </mesh>
      <mesh geometry={puerta} position={[-0.25, 0.22, 0.42]}>
        <meshStandardMaterial color="#5a3a26" roughness={0.7} />
      </mesh>
      <mesh position={[0.22, 0.46, 0.41]}>
        <boxGeometry args={[0.3, 0.26, 0.03]} />
        <meshBasicMaterial color="#ffd77a" />
      </mesh>
    </group>
  );
};

const Nube: React.FC = () => {
  const bolas = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        p: [(random(`rx${i}`) - 0.5) * 1.0, 3.55 + random(`ry${i}`) * 0.4, (random(`rz${i}`) - 0.5) * 0.6] as [number, number, number],
        r: 0.32 + random(`rr${i}`) * 0.2,
      })),
    []
  );
  return (
    <group position={[X_NUBE, 0, 0]}>
      {bolas.map((b, i) => (
        <mesh key={i} position={b.p}>
          <sphereGeometry args={[b.r, 22, 16]} />
          <meshStandardMaterial color={i % 3 === 0 ? "#4b546b" : "#6c7691"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

/** Rayo en zigzag, de la nube al suelo. */
const Bolt: React.FC<{ v: number }> = ({ v }) => {
  const pts: [number, number][] = [[0.05, 3.5], [-0.25, 2.8], [0.1, 2.2], [-0.2, 1.5], [0.12, 0.9], [-0.05, 0.0]];
  return (
    <group position={[X_NUBE, 0, 0.1]}>
      {pts.slice(0, -1).map((a, i) => {
        const b = pts[i + 1];
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const largo = Math.hypot(dx, dy);
        return (
          <group key={i} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0]} rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]}>
            <mesh>
              <boxGeometry args={[0.12, largo + 0.04, 0.08]} />
              <meshBasicMaterial color="#fffbe0" transparent opacity={v} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.4, largo + 0.04, 0.2]} />
              <meshBasicMaterial color="#ffe36a" transparent opacity={0.35 * v} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** Onda que sale del rayo: un anillo (media rueda sobre el suelo) que se agranda hasta la casa. */
const Onda: React.FC<{ p: number; color: string; grosor: number }> = ({ p, color, grosor }) => {
  if (p <= 0.001) return null;
  const R = Math.max(0.05, p * 3 * MILLA);
  return (
    <mesh position={[X_NUBE, 0.02, 0.15]}>
      <torusGeometry args={[R, grosor, 10, 72, Math.PI]} />
      <meshBasicMaterial color={color} transparent opacity={0.9 * (1 - 0.35 * p)} depthWrite={false} />
    </mesh>
  );
};

export const Rayo: React.FC<{ e: EstadoRayo }> = ({ e }) => {
  const suelo = useMemo(() => caja(8.4, 4, 2.2, 0.08), []);
  return (
    <group>
      <mesh geometry={suelo} position={[0, -2, 0]} receiveShadow>
        <meshStandardMaterial color="#3a5a3c" roughness={0.9} />
      </mesh>
      <Casa golpe={e.casa} />
      <Nube />
      {e.rayo > 0.01 && <Bolt v={e.rayo} />}
      {/* postes de milla: 1, 2 y 3 millas desde el rayo */}
      {[1, 2, 3].map((m) => {
        const v = Math.min(1, Math.max(0, e.postes * 3 - (m - 1)));
        if (v <= 0.01) return null;
        return (
          <mesh key={m} position={[X_NUBE - m * MILLA, 0.25 * v, 0.7]} scale={[1, v, 1]}>
            <boxGeometry args={[0.1, 0.5, 0.1]} />
            <meshStandardMaterial color={m === 3 ? "#ffc53d" : "#e8eef9"} roughness={0.4} emissive={m === 3 ? "#ffc53d" : "#aab8d8"} emissiveIntensity={0.35} />
          </mesh>
        );
      })}
      <Onda p={e.luz} color="#fff3a0" grosor={0.07} />
      <Onda p={e.sonido} color="#5fd2ff" grosor={0.09} />
    </group>
  );
};

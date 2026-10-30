import React, { useMemo } from "react";
import { random } from "remotion";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Escena de rayos que caen "siempre en el mismo lugar": una nube grande arriba, a la izquierda una torre alta
// escalonada con antena y pararrayos (estilo rascacielos), en el medio terreno llano con arbustos y a la derecha
// una estatua con los brazos abiertos sobre un cerro. Del pararrayos sale una chispa que sube a buscar la
// descarga, y un cable brillante baja por la torre hasta el suelo. Todo sale del frame: sin useFrame.

export const X_TORRE = -1.7;
export const X_ESTATUA = 1.9;
export const Y_PUNTA_TORRE = 3.8;
export const Y_PUNTA_ESTATUA = 2.25;
const Y_NUBE = 5.0;

export type EstadoTorre = {
  frame: number;
  boltTorre: number; // 0..1 brillo del rayo sobre la torre
  boltEstatua: number; // 0..1 brillo del rayo sobre la estatua
  boltLlano: number; // 0..1 brillo de un rayo sobre el terreno llano (raro)
  chispa: number; // 0..1 largo de la chispa ascendente desde la punta de la torre
  cable: number; // 0..1 brillo del cable del pararrayos
  llano: number; // 0..1 cuánto se resalta el terreno llano
};

const caja = (w: number, h: number, d: number, r = 0.04) => new RoundedBoxGeometry(w, h, d, 3, r);

const Torre: React.FC<{ cable: number }> = ({ cable }) => {
  const base = useMemo(() => caja(1.3, 1.5, 1.3, 0.05), []);
  const medio = useMemo(() => caja(0.95, 1.1, 0.95, 0.05), []);
  const alto = useMemo(() => caja(0.62, 0.7, 0.62, 0.04), []);
  const mat = <meshStandardMaterial color="#aeb7c9" roughness={0.45} metalness={0.25} />;
  return (
    <group position={[X_TORRE, 0, 0]}>
      <mesh geometry={base} position={[0, 0.75, 0]} castShadow>
        {mat}
      </mesh>
      <mesh geometry={medio} position={[0, 2.0, 0]} castShadow>
        {mat}
      </mesh>
      <mesh geometry={alto} position={[0, 2.9, 0]} castShadow>
        {mat}
      </mesh>
      {/* ventanitas prendidas */}
      {[0.4, 1.0, 1.6, 2.2].map((y, i) =>
        [-0.3, 0, 0.3].map((x) => (
          <mesh key={`${i}${x}`} position={[x, y, y < 1.5 ? 0.66 : 0.49]}>
            <boxGeometry args={[0.12, 0.16, 0.02]} />
            <meshBasicMaterial color={(i + (x > 0 ? 1 : 0)) % 2 ? "#ffd77a" : "#3b4a6b"} />
          </mesh>
        ))
      )}
      {/* antena / pararrayos */}
      <mesh position={[0, 3.45, 0]}>
        <cylinderGeometry args={[0.025, 0.045, 0.7, 10]} />
        <meshStandardMaterial color="#d9dde6" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* cable que baja a tierra por un costado */}
      <mesh position={[0.68, 1.7, 0.2]}>
        <boxGeometry args={[0.035, 3.4, 0.035]} />
        <meshBasicMaterial color="#8fe3ff" transparent opacity={0.25 + 0.75 * cable} />
      </mesh>
      {cable > 0.05 && (
        <mesh position={[0.68, 1.7, 0.2]}>
          <boxGeometry args={[0.2, 3.4, 0.2]} />
          <meshBasicMaterial color="#8fe3ff" transparent opacity={0.3 * cable} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

const Estatua: React.FC = () => {
  const cerro = useMemo(() => caja(1.7, 0.9, 1.1, 0.12), []);
  return (
    <group position={[X_ESTATUA, 0, 0]}>
      <mesh geometry={cerro} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color="#4a6b4a" roughness={0.9} />
      </mesh>
      {/* pedestal */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#d8d4c8" roughness={0.6} />
      </mesh>
      {/* cuerpo (túnica) */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.2, 0.75, 14]} />
        <meshStandardMaterial color="#ece8dc" roughness={0.5} />
      </mesh>
      {/* brazos abiertos */}
      <mesh position={[0, 1.93, 0]} castShadow>
        <boxGeometry args={[1.05, 0.09, 0.09]} />
        <meshStandardMaterial color="#ece8dc" roughness={0.5} />
      </mesh>
      {/* cabeza */}
      <mesh position={[0, 2.12, 0]} castShadow>
        <sphereGeometry args={[0.1, 18, 14]} />
        <meshStandardMaterial color="#ece8dc" roughness={0.5} />
      </mesh>
    </group>
  );
};

const Nube: React.FC<{ brillo: number }> = ({ brillo }) => {
  const bolas = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        p: [(random(`tx${i}`) - 0.5) * 5.6, Y_NUBE + random(`ty${i}`) * 0.55, (random(`tz${i}`) - 0.5) * 1.2] as [number, number, number],
        r: 0.45 + random(`tr${i}`) * 0.3,
      })),
    []
  );
  return (
    <group>
      {bolas.map((b, i) => (
        <mesh key={i} position={b.p}>
          <sphereGeometry args={[b.r, 22, 16]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#4b546b" : "#6c7691"}
            roughness={1}
            emissive="#ffe9a0"
            emissiveIntensity={0.5 * brillo}
          />
        </mesh>
      ))}
    </group>
  );
};

/** Rayo en zigzag desde la nube hasta (x, y). */
const Bolt: React.FC<{ x: number; y: number; v: number; sem: number }> = ({ x, y, v, sem }) => {
  const n = 6;
  const pts: [number, number][] = Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const yy = Y_NUBE - 0.1 + (y - (Y_NUBE - 0.1)) * t;
    const jit = i === 0 || i === n ? 0 : (random(`b${sem}${i}`) - 0.5) * 0.7;
    return [x + jit, yy];
  });
  return (
    <group position={[0, 0, 0.3]}>
      {pts.slice(0, -1).map((a, i) => {
        const b = pts[i + 1];
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const largo = Math.hypot(dx, dy);
        return (
          <group key={i} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0]} rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]}>
            <mesh>
              <boxGeometry args={[0.1, largo + 0.04, 0.07]} />
              <meshBasicMaterial color="#fffbe0" transparent opacity={v} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.38, largo + 0.04, 0.2]} />
              <meshBasicMaterial color="#ffe36a" transparent opacity={0.35 * v} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const Torre3D: React.FC<{ e: EstadoTorre }> = ({ e }) => {
  const suelo = useMemo(() => caja(9.2, 4, 2.6, 0.08), []);
  const arbustos = useMemo(
    () => Array.from({ length: 5 }, (_, i) => ({ x: -0.55 + i * 0.28 + (random(`ar${i}`) - 0.5) * 0.1, s: 0.12 + random(`as${i}`) * 0.08 })),
    []
  );
  const destello = Math.max(e.boltTorre, e.boltEstatua, e.boltLlano);
  return (
    <group>
      <mesh geometry={suelo} position={[0, -2, 0]} receiveShadow>
        <meshStandardMaterial color="#3a5a3c" roughness={0.9} />
      </mesh>
      {/* terreno llano resaltado */}
      {e.llano > 0.01 && (
        <mesh position={[0, 0.012, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.9 * e.llano, 1.5]} />
          <meshBasicMaterial color="#8fe3ff" transparent opacity={0.28 * e.llano} depthWrite={false} />
        </mesh>
      )}
      {arbustos.map((a, i) => (
        <mesh key={i} position={[a.x, a.s, 0.2 + (i % 2) * 0.3]}>
          <sphereGeometry args={[a.s, 14, 12]} />
          <meshStandardMaterial color="#2f6b3a" roughness={0.9} />
        </mesh>
      ))}
      <Torre cable={e.cable} />
      <Estatua />
      <Nube brillo={destello} />
      {e.chispa > 0.01 && (
        <mesh position={[X_TORRE, Y_PUNTA_TORRE + 0.45 * e.chispa, 0.1]}>
          <boxGeometry args={[0.07, 0.9 * e.chispa, 0.07]} />
          <meshBasicMaterial color="#8fe3ff" />
        </mesh>
      )}
      {e.boltTorre > 0.01 && <Bolt x={X_TORRE} y={Y_PUNTA_TORRE} v={e.boltTorre} sem={1} />}
      {e.boltEstatua > 0.01 && <Bolt x={X_ESTATUA} y={Y_PUNTA_ESTATUA} v={e.boltEstatua} sem={2} />}
      {e.boltLlano > 0.01 && <Bolt x={0} y={0.05} v={e.boltLlano} sem={3} />}
    </group>
  );
};

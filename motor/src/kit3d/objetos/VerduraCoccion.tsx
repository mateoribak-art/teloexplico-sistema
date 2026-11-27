import React, { useMemo } from "react";
import * as THREE from "three";

// Brócoli cocinado de dos formas, lado a lado (ilustración, no medición):
// izquierda, una olla con agua hirviendo (las vitaminas, puntitos verdes, se escapan al agua y el agua se tira);
// derecha, un bowl de vidrio tapado con un chorrito de agua (las vitaminas se quedan alrededor del brócoli).
// Unidades: mesada en y = 0; olla centrada en x = -2.6, bowl en x = +2.6.

export type EstadoVerdura = {
  frame: number;
  fuga: number; // 0..1 las vitaminas salen del brócoli hacia el agua de la olla
  tiñe: number; // 0..1 el agua de la olla se vuelve verdosa
  tira: number; // 0..1 la olla se inclina y tira el agua
  ondas: number; // 0..1 el bowl está en el microondas (ondas + vapor)
  retiene: number; // 0..1 las vitaminas orbitan alrededor del brócoli del bowl
  chorrito: number; // 0..1 gotas de agua cayendo en el bowl
  brillo: number; // 0..1 resalta el bowl (vitamina C)
  apagar: number; // 0..1 baja la intensidad de todo (el "Ojo")
};

export const VerduraVacia: EstadoVerdura = { frame: 0, fuga: 0, tiñe: 0, tira: 0, ondas: 0, retiene: 0, chorrito: 0, brillo: 0, apagar: 0 };

const VERDE = "#4fbf4a";
const VIT = "#b6ff5a";

const Brocoli: React.FC<{ escala?: number }> = ({ escala = 1 }) => {
  const cabezas = useMemo(
    () => [
      [0, 0.62, 0, 0.3],
      [0.24, 0.5, 0.06, 0.24],
      [-0.24, 0.5, 0.04, 0.24],
      [0.06, 0.5, 0.24, 0.23],
      [-0.06, 0.5, -0.22, 0.23],
      [0.14, 0.74, -0.08, 0.2],
      [-0.14, 0.72, 0.1, 0.2],
    ],
    []
  );
  return (
    <group scale={escala}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.42, 14]} />
        <meshStandardMaterial color="#9bd070" roughness={0.7} />
      </mesh>
      {cabezas.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 18, 14]} />
          <meshStandardMaterial color={i % 2 ? "#3f9d3d" : VERDE} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
};

/** Puntitos verdes brillantes (vitaminas). */
const Puntos: React.FC<{ n: number; pos: (i: number, t: number) => [number, number, number]; frame: number; alfa: number; vel?: number }> = ({
  n,
  pos,
  frame,
  alfa,
  vel = 0.018,
}) => {
  if (alfa <= 0.02) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const t = (frame * vel + i / n) % 1;
        const p = pos(i, t);
        return (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color={VIT} emissive={VIT} emissiveIntensity={1.1} transparent opacity={alfa * (0.35 + 0.65 * Math.sin(t * Math.PI))} />
          </mesh>
        );
      })}
    </>
  );
};

const Olla: React.FC<{ e: EstadoVerdura }> = ({ e }) => {
  const f = e.frame;
  const inclina = e.tira * 0.75;
  const nivel = 1 - e.tira * 0.9;
  return (
    <group position={[-2.6, 0, 0]}>
      <group rotation={[0, 0, inclina]} position={[inclina * 0.4, inclina * 0.15, 0]}>
        {/* cuerpo */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[1.05, 1.0, 1.6, 40, 1, true]} />
          <meshStandardMaterial color="#aab3c6" metalness={0.75} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.0, 32]} />
          <meshStandardMaterial color="#8d97ab" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.05, 0.04, 10, 48]} />
          <meshStandardMaterial color="#cfd6e4" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* asas */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.15, 1.35, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.16]} />
            <meshStandardMaterial color="#2b3144" roughness={0.5} />
          </mesh>
        ))}
        {/* agua */}
        <mesh position={[0, 0.2 + 0.95 * nivel, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.97, 40]} />
          <meshStandardMaterial
            color={new THREE.Color("#7ec4ff").lerp(new THREE.Color("#8fd45a"), e.tiñe)}
            transparent
            opacity={0.7}
            roughness={0.15}
          />
        </mesh>
        {/* brócoli hundido en el agua */}
        <group position={[0, 0.38, 0]} scale={1.15}>
          <Brocoli />
        </group>
        {/* burbujas */}
        {Array.from({ length: 7 }, (_, i) => {
          const t = (f * 0.03 + i * 0.173) % 1;
          return (
            <mesh key={i} position={[Math.cos(i * 2.4) * 0.65, 0.3 + t * 0.95 * nivel, Math.sin(i * 1.9) * 0.55]}>
              <sphereGeometry args={[0.06 + 0.03 * (i % 3), 10, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.55 * (1 - t) * nivel} />
            </mesh>
          );
        })}
        {/* vitaminas que se escapan al agua */}
        <Puntos
          n={10}
          frame={f}
          alfa={e.fuga * (1 - e.apagar * 0.5)}
          pos={(i, t) => {
            const ang = i * 2.3;
            const r = 0.25 + t * 0.7;
            return [Math.cos(ang) * r, 0.9 - t * 0.55 + Math.sin(f / 12 + i) * 0.05, Math.sin(ang) * r * 0.8];
          }}
        />
      </group>
      {/* chorro de agua cuando se tira */}
      {e.tira > 0.25 &&
        Array.from({ length: 8 }, (_, i) => {
          const t = (f * 0.06 + i / 8) % 1;
          return (
            <mesh key={i} position={[1.7 + t * 0.7, 1.2 - t * 1.15, 0]}>
              <sphereGeometry args={[0.1, 10, 8]} />
              <meshStandardMaterial color="#8fd45a" transparent opacity={0.75 * (1 - t)} />
            </mesh>
          );
        })}
    </group>
  );
};

const Bowl: React.FC<{ e: EstadoVerdura }> = ({ e }) => {
  const f = e.frame;
  const g = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.7, 0.0),
      new THREE.Vector2(0.95, 0.12),
      new THREE.Vector2(1.15, 0.7),
      new THREE.Vector2(1.18, 0.76),
      new THREE.Vector2(1.12, 0.76),
      new THREE.Vector2(0.9, 0.16),
    ];
    return new THREE.LatheGeometry(pts, 44);
  }, []);
  return (
    <group position={[2.6, 0, 0]}>
      {/* plato giratorio */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.06, 44]} />
        <meshStandardMaterial color="#d8e6ee" transparent opacity={0.5} roughness={0.1} depthWrite={false} />
      </mesh>
      {/* resplandor vitamina C */}
      {e.brillo > 0.02 && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.25, 1.55 + Math.sin(f / 6) * 0.05, 48]} />
          <meshBasicMaterial color="#ffc53d" transparent opacity={0.65 * e.brillo} depthWrite={false} />
        </mesh>
      )}
      <group position={[0, 0.06, 0]}>
        <mesh geometry={g} castShadow>
          <meshStandardMaterial color="#cfe8f5" transparent opacity={0.4} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* chorrito de agua en el fondo */}
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.75, 36]} />
          <meshStandardMaterial color="#7ec4ff" transparent opacity={0.65} roughness={0.15} />
        </mesh>
        <group position={[0, 0.12, 0]} scale={1.1}>
          <Brocoli />
        </group>
        {/* gotas del chorrito */}
        {e.chorrito > 0.02 &&
          Array.from({ length: 5 }, (_, i) => {
            const t = (f * 0.07 + i / 5) % 1;
            return (
              <mesh key={i} position={[0.1 * Math.sin(i), 2.1 - t * 1.8, 0.1 * Math.cos(i * 2)]}>
                <sphereGeometry args={[0.07, 10, 8]} />
                <meshStandardMaterial color="#9fd6ff" transparent opacity={0.85 * e.chorrito * (1 - t * 0.4)} />
              </mesh>
            );
          })}
        {/* vitaminas que se quedan */}
        <Puntos
          n={10}
          frame={f}
          alfa={e.retiene * (1 - e.apagar * 0.5)}
          vel={0.012}
          pos={(i, t) => {
            const ang = t * Math.PI * 2 + i * 0.63;
            const r = 0.42 + 0.14 * Math.sin(i * 1.7);
            return [Math.cos(ang) * r, 0.5 + 0.28 * Math.sin(i * 1.3) + Math.sin(f / 10 + i) * 0.04, Math.sin(ang) * r];
          }}
        />
        {/* ondas y vapor del microondas */}
        {e.ondas > 0.02 &&
          [0, 1, 2].map((i) => {
            const t = (f * 0.02 + i / 3) % 1;
            return (
              <mesh key={i} position={[0, 1.0 + t * 1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5 + t * 0.5, 0.56 + t * 0.5, 36]} />
                <meshBasicMaterial color="#ffb347" transparent opacity={(1 - t) * 0.5 * e.ondas} depthWrite={false} />
              </mesh>
            );
          })}
      </group>
    </group>
  );
};

export const VerduraCoccion: React.FC<{ e: EstadoVerdura }> = ({ e }) => (
  <group>
    <mesh position={[0, -0.15, 0]} receiveShadow>
      <boxGeometry args={[8.6, 0.3, 3.4]} />
      <meshStandardMaterial color="#cfd6e0" roughness={0.45} metalness={0.05} />
    </mesh>
    <Olla e={e} />
    <Bowl e={e} />
  </group>
);

export const portadaVerdura = (): EstadoVerdura => ({
  frame: 24, fuga: 1, tiñe: 0.8, tira: 0, ondas: 1, retiene: 1, chorrito: 0, brillo: 1, apagar: 0,
});

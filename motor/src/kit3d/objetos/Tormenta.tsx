import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Corte de una tormenta en un escenario angosto (vertical): suelo con un auto y un sol, una columna
// de aire caliente que sube, el piso de aire bajo cero, el cumulonimbus arriba y una piedra de granizo
// hecha de capas (con corte para verla como una cebolla). Todo sale del frame: sin useFrame.
// Unidades de escena: el suelo está en y = 0, el cumulonimbus a ~7,6 y el ancho útil es de ~5.

export type EstadoTormenta = {
  frame: number;
  calor: number; // 0..1 columna de partículas calientes
  frio: number; // 0..1 plano de aire bajo cero
  nube: number; // opacidad de la nube (baja para ver adentro)
  piedraY: number; // altura de la piedra grande
  piedraOn: number; // 0..1 tamaño de la gota/piedra (0 = no está)
  capas: number; // cuántas capas tiene (0..6, con decimales)
  corte: number; // 0..1: 1 = media piedra cortada
  lluvia: number; // 0..1 granizo cayendo
  techo: number; // 0..1: el techo se corre sobre el auto
  sol: number; // 0..1 brillo del sol
};

export const AUTO_X = 1.45;
const CAPAS = [0.14, 0.22, 0.3, 0.38, 0.46, 0.54];
const COLOR_CAPA = ["#f4fbff", "#8ccdf5", "#ffffff", "#9bd6ff", "#f4fbff", "#8ccdf5"];

const caja = (w: number, h: number, d: number, r = 0.05) => new RoundedBoxGeometry(w, h, d, 4, r);

const Auto: React.FC = () => {
  const cuerpo = useMemo(() => caja(1.3, 0.34, 0.62, 0.1), []);
  const cabina = useMemo(() => caja(0.72, 0.3, 0.54, 0.12), []);
  return (
    <group position={[AUTO_X, 0.1, 0]}>
      <mesh geometry={cuerpo} position={[0, 0.3, 0]} castShadow>
        <meshStandardMaterial color="#d6453a" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh geometry={cabina} position={[-0.05, 0.58, 0]} castShadow>
        <meshStandardMaterial color="#c63d33" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[-0.05, 0.6, 0]}>
        <boxGeometry args={[0.66, 0.2, 0.56]} />
        <meshStandardMaterial color="#9fc4e8" roughness={0.1} metalness={0.2} />
      </mesh>
      {[-0.42, 0.42].flatMap((x) =>
        [-0.3, 0.3].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.14, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.12, 20]} />
            <meshStandardMaterial color="#1a1d24" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  );
};

const Nube: React.FC<{ opacidad: number }> = ({ opacidad }) => {
  const bolas = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = random(`nb${i}`) * Math.PI * 2;
        const rr = 0.4 + random(`nr${i}`) * 1.6;
        return {
          p: [Math.cos(a) * rr, 6.5 + random(`ny${i}`) * 1.3 + (i > 14 ? 0.7 : 0), Math.sin(a) * rr * 0.55] as [number, number, number],
          r: 0.6 + random(`ns${i}`) * 0.55,
          oscura: i < 8,
        };
      }),
    []
  );
  return (
    <group>
      {bolas.map((b, i) => (
        <mesh key={i} position={b.p}>
          <sphereGeometry args={[b.r, 24, 18]} />
          <meshStandardMaterial key={opacidad < 0.99 ? "t" : "o"} color={b.oscura ? "#6c7691" : "#e4ebf7"} roughness={1} transparent={opacidad < 0.99} opacity={opacidad} depthWrite={opacidad >= 0.99} />
        </mesh>
      ))}
      {/* yunque aplastado arriba */}
      <mesh position={[0, 8.45, 0]} scale={[2.6, 0.35, 1.2]}>
        <sphereGeometry args={[1, 28, 18]} />
        <meshStandardMaterial key={opacidad < 0.99 ? "t" : "o"} color="#f2f6ff" roughness={1} transparent={opacidad < 0.99} opacity={opacidad} depthWrite={opacidad >= 0.99} />
      </mesh>
    </group>
  );
};

/** Piedra de hielo hecha de capas; con `corte` se ve cortada al medio, como una cebolla. */
export const Piedra: React.FC<{ capas: number; corte: number; escala?: number }> = ({ capas, corte, escala = 1 }) => {
  const plano = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 0), []);
  return (
    <group scale={escala}>
      {CAPAS.map((r, i) => {
        const v = Math.min(1, Math.max(0, capas - i));
        if (v <= 0) return null;
        return (
          <mesh key={i} scale={v} castShadow={i === 5}>
            <sphereGeometry args={[r, 40, 28]} />
            <meshStandardMaterial
              color={COLOR_CAPA[i]}
              roughness={0.15}
              metalness={0.05}
              side={THREE.DoubleSide}
              clippingPlanes={corte > 0.5 ? [plano] : []}
              emissive={COLOR_CAPA[i]}
              emissiveIntensity={0.12}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export const Tormenta: React.FC<{ e: EstadoTormenta }> = ({ e }) => {
  const f = e.frame;
  const suelo = useMemo(() => caja(5.4, 0.3, 2.4, 0.08), []);
  const techo = useMemo(() => caja(1.9, 0.12, 1.3, 0.04), []);
  const calientes = Array.from({ length: 18 }, (_, i) => {
    const vel = 0.03 + random(`cv${i}`) * 0.02;
    const t = (f * vel + random(`cf${i}`)) % 1;
    return { x: -0.55 + random(`cx${i}`) * 1.3 + Math.sin(f / 18 + i) * 0.1, y: 0.4 + t * 5.4, z: (random(`cz${i}`) - 0.5) * 0.8, t };
  });
  const piso = (x: number) => (e.techo > 0.5 && Math.abs(x - AUTO_X) < 0.75 ? 1.12 : 0.12);
  const granizos = Array.from({ length: 16 }, (_, i) => {
    const x = -2.1 + random(`gx${i}`) * 4.2;
    const vel = 0.045 + random(`gv${i}`) * 0.02;
    const t = (f * vel + random(`gf${i}`)) % 1;
    const alto = 6.2;
    const base = piso(x);
    return { x, y: alto - t * (alto - base), z: (random(`gz${i}`) - 0.5) * 1.2, r: 0.08 + random(`gr${i}`) * 0.06 };
  });
  return (
    <group>
      {/* suelo */}
      <mesh geometry={suelo} position={[0, -0.15, 0]} receiveShadow>
        <meshStandardMaterial color="#3a5a3c" roughness={0.9} />
      </mesh>
      <Auto />
      {/* techo de cochera */}
      <mesh geometry={techo} position={[AUTO_X + (1 - e.techo) * 4, 1.0, 0]} castShadow>
        <meshStandardMaterial color="#8a93a8" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* sol */}
      <group position={[-2.0, 1.8, -0.4]}>
        <mesh>
          <sphereGeometry args={[0.42, 32, 24]} />
          <meshBasicMaterial color="#ffd23a" />
        </mesh>
        <mesh scale={1 + 0.15 * Math.sin(f / 10)}>
          <sphereGeometry args={[0.62, 24, 18]} />
          <meshBasicMaterial color="#ffb02e" transparent opacity={0.28 * e.sol} depthWrite={false} />
        </mesh>
      </group>
      {/* columna de aire caliente */}
      {e.calor > 0.01 &&
        calientes.map((c, i) => {
          const a = Math.sin(Math.PI * c.t) * e.calor;
          return (
            <mesh key={i} position={[c.x, c.y, c.z]} scale={0.5 + a * 0.9}>
              <sphereGeometry args={[0.09, 12, 10]} />
              <meshBasicMaterial color="#ff8a3d" transparent opacity={0.85 * a} depthWrite={false} />
            </mesh>
          );
        })}
      {/* piso de aire bajo cero */}
      {e.frio > 0.01 && (
        <mesh position={[0, 5.0, 0]}>
          <boxGeometry args={[4.9, 0.3, 2.2]} />
          <meshBasicMaterial color="#58c8ff" transparent opacity={0.2 * e.frio} depthWrite={false} />
        </mesh>
      )}
      <Nube opacidad={e.nube} />
      {/* la piedra grande */}
      {e.piedraOn > 0.01 && (
        <group position={[0, e.piedraY, 0]}>
          {e.capas <= 0.01 ? (
            <mesh scale={e.piedraOn}>
              <sphereGeometry args={[0.1, 20, 14]} />
              <meshStandardMaterial color="#7fc3ff" roughness={0.1} />
            </mesh>
          ) : (
            <Piedra capas={e.capas} corte={e.corte} />
          )}
        </group>
      )}
      {/* lluvia de granizo */}
      {e.lluvia > 0.01 &&
        granizos.map((g, i) => (
          <mesh key={i} position={[g.x, g.y, g.z]} scale={e.lluvia} castShadow>
            <sphereGeometry args={[g.r, 14, 10]} />
            <meshStandardMaterial color="#eaf6ff" roughness={0.15} emissive="#cfe9ff" emissiveIntensity={0.25} />
          </mesh>
        ))}
    </group>
  );
};

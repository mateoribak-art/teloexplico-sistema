import React from "react";

// Pared de cocina con tres fideos pegados (poco cocido, a punto, pasado: se pegan los tres) + cuchara con un fideo para probar. Piso en y = 0.
// aparece 0..1. tiro 0..1: un fideo vuela y se pega a la pared. pegados 0..1: se pegan los otros dos (los tres iguales).
// prueba 0..1: aparece la cuchara con un fideo (el que se prueba). tilde 0..1: tilde verde. frame: pulsos.

export type EstadoFideos = {
  aparece: number;
  tiro: number;
  pegados: number;
  prueba: number;
  tilde: number;
  frame: number;
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const suave = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

const COLOR_FIDEO = "#ffc933";
const PARED_Z = -1.2;

// un fideo colgando: tramo recto + curva suave abajo
const Fideo: React.FC<{ x: number; y: number; largo: number; ladeo: number; escala: number }> = ({ x, y, largo, ladeo, escala }) => (
  <group position={[x, y, PARED_Z + 0.06]} rotation={[0, 0, ladeo]} scale={escala}>
    <mesh position={[0, -largo / 2, 0]}>
      <cylinderGeometry args={[0.09, 0.09,largo, 8]} />
      <meshStandardMaterial color={COLOR_FIDEO} roughness={0.55} emissive="#c98a00" emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0.15, -largo - 0.02, 0]} rotation={[0, 0, Math.PI]}>
      <torusGeometry args={[0.15, 0.09, 8, 12, Math.PI]} />
      <meshStandardMaterial color={COLOR_FIDEO} roughness={0.55} emissive="#c98a00" emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0.3, -largo + 0.18, 0]}>
      <cylinderGeometry args={[0.09, 0.09,0.4, 8]} />
      <meshStandardMaterial color={COLOR_FIDEO} roughness={0.55} emissive="#c98a00" emissiveIntensity={0.5} />
    </mesh>
  </group>
);

export const Fideos: React.FC<{ e: EstadoFideos }> = ({ e }) => {
  const ap = suave(e.aparece);
  const tiro = clamp01(e.tiro);
  const peg = suave(e.pegados);
  const pr = suave(e.prueba);
  const ti = suave(e.tilde);
  // arco del fideo lanzado: de adelante-abajo a la pared
  const t = suave(tiro);
  const vx = 2.4 - 2.4 * t;
  const vy = 0.8 + 2.6 * t + Math.sin(t * Math.PI) * 1.2;
  const vz = 4.0 + (PARED_Z + 0.08 - 4.0) * t;
  return (
    <group scale={ap}>
      {/* pared de azulejos */}
      <mesh position={[0, 2.4, PARED_Z - 0.1]} receiveShadow>
        <boxGeometry args={[9, 5.2, 0.2]} />
        <meshStandardMaterial color="#26344d" roughness={0.7} />
      </mesh>
      {[-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6].map((x) => (
        <mesh key={x} position={[x, 2.4, PARED_Z + 0.005]}>
          <boxGeometry args={[0.03, 5.2, 0.01]} />
          <meshStandardMaterial color="#3d5173" />
        </mesh>
      ))}
      {[0.4, 1.6, 2.8, 4.0].map((y) => (
        <mesh key={y} position={[0, y, PARED_Z + 0.005]}>
          <boxGeometry args={[9, 0.03, 0.01]} />
          <meshStandardMaterial color="#3d5173" />
        </mesh>
      ))}

      {/* fideo lanzado (vuela y queda pegado en el centro) */}
      {tiro > 0 && tiro < 0.999 && (
        <mesh position={[vx, vy, vz]} rotation={[0, 0, 1.2 - t]}>
          <cylinderGeometry args={[0.09, 0.09,1.6, 8]} />
          <meshStandardMaterial color={COLOR_FIDEO} roughness={0.55} emissive="#c98a00" emissiveIntensity={0.5} />
        </mesh>
      )}
      {tiro >= 0.999 && <Fideo x={0} y={3.6} largo={1.5} ladeo={0.05} escala={1} />}

      {/* los otros dos también se pegan */}
      <group scale={peg}>
        <Fideo x={-2.0} y={3.7} largo={1.3} ladeo={-0.08} escala={1} />
        <Fideo x={2.0} y={3.6} largo={1.7} ladeo={0.1} escala={1} />
      </group>
      {/* marquitas de color bajo cada fideo: poco cocido / a punto / pasado */}
      {peg > 0.05 && (
        <group scale={peg}>
          <mesh position={[-2.0, 1.55, PARED_Z + 0.08]}>
            <sphereGeometry args={[0.14, 16, 12]} />
            <meshStandardMaterial color="#e0432e" emissive="#e0432e" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 1.55, PARED_Z + 0.08]}>
            <sphereGeometry args={[0.14, 16, 12]} />
            <meshStandardMaterial color="#37d67a" emissive="#37d67a" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[2.0, 1.55, PARED_Z + 0.08]}>
            <sphereGeometry args={[0.14, 16, 12]} />
            <meshStandardMaterial color="#ff9a2e" emissive="#ff9a2e" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      {/* cuchara con un fideo para probar */}
      {pr > 0.02 && (
        <group position={[0, 1.0, 2.2]} scale={pr} rotation={[0.35, 0, 0]}>
          <mesh scale={[1, 0.35, 1.3]} position={[0, 0, 0]}>
            <sphereGeometry args={[0.55, 24, 16]} />
            <meshStandardMaterial color="#c9ced6" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 1.8, 10]} />
            <meshStandardMaterial color="#c9ced6" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09,0.9, 8]} />
            <meshStandardMaterial color={COLOR_FIDEO} roughness={0.55} emissive="#c98a00" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {ti > 0.02 && (
        <group position={[1.2, 2.4, 2.4]} scale={ti}>
          <mesh position={[-0.2, -0.1, 0]} rotation={[0, 0, -0.8]}>
            <boxGeometry args={[0.3, 0.1, 0.1]} />
            <meshStandardMaterial color="#37d67a" emissive="#37d67a" emissiveIntensity={1.4} />
          </mesh>
          <mesh position={[0.15, 0.1, 0]} rotation={[0, 0, 0.7]}>
            <boxGeometry args={[0.7, 0.1, 0.1]} />
            <meshStandardMaterial color="#37d67a" emissive="#37d67a" emissiveIntensity={1.4} />
          </mesh>
        </group>
      )}
    </group>
  );
};

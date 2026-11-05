import React from "react";
import * as THREE from "three";

// Escena: persona de pie bajo una nube; el sol detrás. Rayos ultravioleta (violeta) que atraviesan la nube,
// la piel que se enrojece, rebote en el piso (agua) y una sombrilla que los frena. Todo sale del frame.
// Piso en y = 0.

export type EstadoSolNube = {
  frame: number;
  rayos: number; // 0..1 rayos del sol que atraviesan la nube hasta la persona
  quemado: number; // 0..1 la piel se enrojece
  rebote: number; // 0..1 rayos que rebotan en el piso hacia la persona
  sombrilla: number; // 0..1 sombrilla sobre la persona que frena los rayos
  nube: number; // 0..1 la nube aparece/tapa el sol
};

const SOL: [number, number, number] = [-3.2, 6.2, -1.5];
const VIOLETA = "#b57bff";

const Rayo: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; r?: number; op?: number; color?: string }> = ({ a, b, r = 0.045, op = 1, color = VIOLETA }) => {
  const d = b.clone().sub(a);
  const len = d.length();
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[r, r, len, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.1} transparent opacity={op} />
    </mesh>
  );
};

export const SolNube: React.FC<{ e: EstadoSolNube }> = ({ e }) => {
  const f = e.frame;
  const piel = new THREE.Color("#f0c9a8").lerp(new THREE.Color("#e2483a"), e.quemado);
  const cabeza: [number, number, number] = [0.9, 2.55, 0];
  const pecho: [number, number, number] = [0.9, 1.7, 0];
  // rayos del sol hacia la persona (cinco, levemente separados)
  const bajan = Array.from({ length: 5 }, (_, i) => {
    const dx = (i - 2) * 0.28;
    const t = (f * 0.03 + i * 0.2) % 1;
    const a = new THREE.Vector3(SOL[0] + dx * 1.4, SOL[1] - 0.6, SOL[2] + 1.5);
    const b = new THREE.Vector3(0.9 + dx, 2.4 - Math.abs(dx) * 0.6, 0.3);
    return { a, b, t, i };
  });
  // la sombrilla corta los rayos a la altura del toldo
  const alturaToldo = 3.6;
  const cx = 0.25 + 0.5 * e.nube;
  return (
    <group>
      {/* sol */}
      <mesh position={SOL}>
        <sphereGeometry args={[0.9, 24, 18]} />
        <meshStandardMaterial color="#ffc53d" emissive="#ffc53d" emissiveIntensity={1.2} />
      </mesh>

      {/* nube: esferas aplastadas */}
      {e.nube > 0.02 && (
        <group position={[-2.2 + 0.2 * e.nube, 5.0, 0.6]} scale={[e.nube, e.nube, e.nube]}>
          {[
            [0, 0, 0, 1.0],
            [0.95, -0.1, 0.1, 0.8],
            [-0.95, -0.1, 0.1, 0.8],
            [0.4, 0.45, -0.1, 0.75],
            [-0.4, 0.4, 0, 0.7],
            [1.6, -0.25, 0, 0.55],
            [-1.6, -0.25, 0, 0.55],
          ].map(([x, y, z, s], i) => (
            <mesh key={i} position={[x, y, z]} scale={[1, 0.7, 0.9]}>
              <sphereGeometry args={[s, 18, 14]} />
              <meshStandardMaterial color="#e9edf5" roughness={0.95} transparent opacity={0.9} />
            </mesh>
          ))}
        </group>
      )}

      {/* rayos violeta: salen del sol, atraviesan la nube y llegan a la persona */}
      {e.rayos > 0.02 &&
        bajan.map(({ a, b, t, i }) => {
          const corte = e.sombrilla > 0.5;
          const bb = corte ? a.clone().lerp(b, 0.55) : b;
          const pulso = 0.55 + 0.45 * Math.sin(f / 4 + t * 10 + i);
          return <Rayo key={i} a={a} b={bb} op={e.rayos * pulso * (corte ? 0.75 : 0.9)} />;
        })}

      {/* rebote desde el piso (agua) hacia la persona */}
      {e.rebote > 0.02 &&
        [-1.2, -0.2, 0.9].map((x, i) => (
          <React.Fragment key={i}>
            <Rayo a={new THREE.Vector3(x - 1.8, 4.2, 0.6)} b={new THREE.Vector3(x + 0.2, 0.04, 0.6)} op={e.rebote * 0.7} r={0.035} />
            <Rayo a={new THREE.Vector3(x + 0.2, 0.04, 0.6)} b={new THREE.Vector3(0.9 + (i - 1) * 0.15, 1.5, 0.35)} op={e.rebote * (0.55 + 0.4 * Math.sin(f / 5 + i))} r={0.035} />
          </React.Fragment>
        ))}

      {/* piso: charco de agua celeste */}
      <mesh position={[0.2, 0.02, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.5, 2.2]} />
        <meshStandardMaterial color="#4aa8ff" emissive="#2a6fb8" emissiveIntensity={0.35} roughness={0.15} metalness={0.4} transparent opacity={0.8 * Math.min(1, e.rebote * 3)} />
      </mesh>

      {/* persona simple: piernas, torso, brazos y cabeza */}
      <group>
        <mesh position={[0.9, 0.55, 0]} castShadow>
          <capsuleGeometry args={[0.28, 0.9, 8, 16]} />
          <meshStandardMaterial color="#3d5a80" roughness={0.7} />
        </mesh>
        <mesh position={pecho} castShadow>
          <capsuleGeometry args={[0.42, 0.55, 8, 16]} />
          <meshStandardMaterial color="#ee6c4d" roughness={0.7} />
        </mesh>
        <mesh position={[0.9 - 0.62, 1.7, 0]} rotation={[0, 0, 0.12]} castShadow>
          <capsuleGeometry args={[0.13, 0.7, 6, 12]} />
          <meshStandardMaterial color={piel} roughness={0.6} />
        </mesh>
        <mesh position={[0.9 + 0.62, 1.7, 0]} rotation={[0, 0, -0.12]} castShadow>
          <capsuleGeometry args={[0.13, 0.7, 6, 12]} />
          <meshStandardMaterial color={piel} roughness={0.6} />
        </mesh>
        <mesh position={cabeza} castShadow>
          <sphereGeometry args={[0.38, 24, 18]} />
          <meshStandardMaterial color={piel} roughness={0.55} />
        </mesh>
      </group>

      {/* sombrilla */}
      {e.sombrilla > 0.02 && (
        <group position={[0.9, alturaToldo * 0.5 + 0.1 + (1 - e.sombrilla) * 1.5, 0]} scale={[e.sombrilla, e.sombrilla, e.sombrilla]}>
          <mesh position={[0, -0.85, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 2.2, 8]} />
            <meshStandardMaterial color="#dfe3ea" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.4 * cx, 0]}>
            <coneGeometry args={[1.5, 0.7, 28, 1, true]} />
            <meshStandardMaterial color="#ffc53d" roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
};

import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";

// Persona (sin cara) bajo el sol con un termómetro corporal al lado (37 → 40 °C).
// Cuenta la aclimatación: el sudor es el aire acondicionado del cuerpo. Primer día de calor
// => transpira tarde y poco (sudor bajo), la piel se recalienta (temp alta, roja).
// Aclimatado => transpira antes y más (sudor alto), la temperatura baja y la piel se refresca (azul).
// Mira a +z, el piso está en y = 0, la persona mide ~2,8 y está en x = 0.

export type EstadoPrimerCalor = {
  frame: number;
  sol: number; // 0..1 aparece el sol y los rayos
  temp: number; // 0..1 temperatura del cuerpo (0 = 37 °C, 1 = 40 °C): piel roja y columna del termómetro
  termoOn: number; // 0..1 aparece el termómetro
  sudor: number; // 0..1 cuánto y cuán temprano transpira (gotas que caen)
  frescura: number; // 0..1 tinte azul de alivio cuando ya se refrescó
};

export const X_TERMO = 2.9;

const mezcla = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t);

// orígenes de las gotas de sudor: frente, sienes, hombros, pecho y brazos
const GOTAS = Array.from({ length: 16 }, (_, i) => {
  const zona = i % 5;
  const base: [number, number, number] =
    zona === 0 ? [0, 2.62, 0.22] :
    zona === 1 ? [(i % 2 ? 1 : -1) * 0.2, 2.52, 0.18] :
    zona === 2 ? [(i % 2 ? 1 : -1) * 0.34, 1.95, 0.18] :
    zona === 3 ? [(random(`gx${i}`) - 0.5) * 0.4, 1.5 + random(`gy${i}`) * 0.3, 0.24] :
    [(i % 2 ? 1 : -1) * 0.4, 1.4 + random(`ga${i}`) * 0.3, 0.1];
  return { base, fase: random(`gf${i}`), vel: 0.02 + random(`gv${i}`) * 0.012 };
});

const Sudor: React.FC<{ sudor: number; frame: number }> = ({ sudor, frame }) => (
  <group>
    {GOTAS.map((g, i) => {
      // transpira "tarde y poco": con sudor bajo solo caen las primeras gotas
      if (i / GOTAS.length > sudor) return null;
      const t = (frame * g.vel + g.fase) % 1;
      const op = Math.sin(Math.PI * t);
      if (op <= 0.03) return null;
      return (
        <mesh key={i} position={[g.base[0], g.base[1] - t * 1.4, g.base[2]]} scale={0.9 + 0.3 * t}>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshBasicMaterial color="#8fd6ff" transparent opacity={0.9 * op} depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

const Persona: React.FC<{ e: EstadoPrimerCalor }> = ({ e }) => {
  const torso = useMemo(() => new THREE.CapsuleGeometry(0.27, 0.62, 8, 20), []);
  const pierna = useMemo(() => new THREE.CapsuleGeometry(0.11, 0.78, 6, 14), []);
  const brazo = useMemo(() => new THREE.CapsuleGeometry(0.075, 0.6, 6, 12), []);
  // piel: normal -> roja por el calor -> con tinte azul cuando se refresca
  const piel = mezcla("#e6b28c", "#e8412c", e.temp * 0.7).lerp(new THREE.Color("#bcd4f2"), e.frescura * 0.5);
  const emRojo = e.temp * (1 - e.frescura) * 0.4;
  const material = (
    <meshStandardMaterial color={piel} roughness={0.6} emissive="#ff2a10" emissiveIntensity={emRojo} />
  );
  return (
    <group>
      {/* piernas */}
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} geometry={pierna} position={[x, 0.5, 0]} castShadow>
          {material}
        </mesh>
      ))}
      {/* short */}
      <mesh position={[0, 1.02, 0]} scale={[1, 1, 0.72]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.3, 24]} />
        <meshStandardMaterial color="#2f6fd6" roughness={0.8} />
      </mesh>
      {/* torso */}
      <mesh geometry={torso} position={[0, 1.58, 0]} scale={[1, 1, 0.72]} castShadow>
        {material}
      </mesh>
      {/* brazos */}
      {[-0.36, 0.36].map((x, i) => (
        <mesh key={x} geometry={brazo} position={[x, 1.55, 0]} rotation={[0, 0, (i === 0 ? 1 : -1) * 0.12]} castShadow>
          {material}
        </mesh>
      ))}
      {/* cuello y cabeza */}
      <mesh position={[0, 2.18, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.16, 14]} />
        {material}
      </mesh>
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.27, 32, 24]} />
        {material}
      </mesh>
      {/* pelo */}
      <mesh position={[0, 2.6, -0.04]} scale={[1, 0.8, 1]} castShadow>
        <sphereGeometry args={[0.285, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#3a2a22" roughness={0.9} />
      </mesh>
      {/* halo de calor sobre la cabeza cuando está recalentado */}
      {emRojo > 0.02 && (
        <mesh position={[0, 2.52, 0]} scale={1 + 0.07 * Math.sin(e.frame / 6)}>
          <sphereGeometry args={[0.44, 24, 18]} />
          <meshBasicMaterial color="#ff5a2a" transparent opacity={0.18 * e.temp * (1 - e.frescura)} depthWrite={false} />
        </mesh>
      )}
      <Sudor sudor={e.sudor} frame={e.frame} />
    </group>
  );
};

const Termometro: React.FC<{ v: number; on: number }> = ({ v, on }) => {
  if (on <= 0.01) return null;
  const alto = 2.6;
  const color = mezcla("#ffb02e", "#ff2a1a", v);
  const nivel = alto * (0.28 + 0.72 * v);
  return (
    <group position={[X_TERMO, 0.2, 0.2]} scale={on}>
      {/* tubo */}
      <mesh position={[0, alto / 2 + 0.3, 0]} castShadow>
        <boxGeometry args={[0.46, alto, 0.22]} />
        <meshStandardMaterial color="#e9eef7" roughness={0.3} emissive="#8aa0c4" emissiveIntensity={0.2} />
      </mesh>
      {/* bulbo */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.4, 24, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>
      {/* columna */}
      <mesh position={[0, 0.3 + nivel / 2, 0.12]}>
        <boxGeometry args={[0.2, nivel, 0.08]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
      </mesh>
      {/* marcas */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0.32, 0.75 + i * 0.3, 0.1]}>
          <boxGeometry args={[i === 7 ? 0.24 : 0.1, 0.03, 0.03]} />
          <meshBasicMaterial color={i === 7 ? "#ff2a1a" : "#20283a"} />
        </mesh>
      ))}
    </group>
  );
};

export const PrimerCalor: React.FC<{ e: EstadoPrimerCalor }> = ({ e }) => {
  const f = e.frame;
  return (
    <group>
      {/* sol con rayos cayendo */}
      {e.sol > 0.01 && (
        <group position={[-2.9, 5.8, -1.4]} scale={e.sol}>
          <mesh>
            <sphereGeometry args={[0.7, 28, 20]} />
            <meshBasicMaterial color="#ffd23f" />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.1, 24, 18]} />
            <meshBasicMaterial color="#ffb02e" transparent opacity={0.22} depthWrite={false} />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => {
            const t = (f * 0.03 + i / 7) % 1;
            return (
              <mesh key={i} position={[1.2 + t * 2.0, -0.8 - t * 3.0 + (i - 3) * 0.13, 0.3 + (i - 3) * 0.1]} rotation={[0, 0, -1.0]} scale={Math.sin(Math.PI * t)}>
                <boxGeometry args={[0.6, 0.06, 0.06]} />
                <meshBasicMaterial color="#ffd23f" transparent opacity={0.9} depthWrite={false} />
              </mesh>
            );
          })}
        </group>
      )}
      <Persona e={e} />
      <Termometro v={e.temp} on={e.termoOn} />
    </group>
  );
};

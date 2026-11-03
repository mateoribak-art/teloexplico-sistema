import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";

// Persona (sin cara) en traje de baño que pierde calor por la piel descubierta: bolitas naranjas que suben.
// Cada zona emite según su superficie: cabeza ≈ 10 % (3 de 30), torso 11, brazos 6, piernas 10.
// Gorro y campera tapan zonas y esas dejan de perder. Mira a +z, el piso está en y = 0, mide ~3.

export type EstadoCalorCuerpo = {
  frame: number;
  calor: number; // 0..1 cuántas bolitas de calor se ven
  foco: number; // 0..1 aro brillante alrededor de la cabeza
  gorro: number; // 0..1 gorro puesto
  campera: number; // 0..1 campera puesta (torso y brazos)
  frio: number; // 0..1 tinte azul de la piel
  pantalon: number; // 0..1 pantalón puesto (piernas)
};

type Zona = "cabeza" | "torso" | "brazos" | "piernas";
const CUPOS: Record<Zona, number> = { cabeza: 3, torso: 11, brazos: 6, piernas: 10 };

const ORIGEN: Record<Zona, (i: number) => [number, number, number]> = {
  cabeza: (i) => [(random(`ch${i}`) - 0.5) * 0.4, 2.45 + random(`cy${i}`) * 0.4, 0.2],
  torso: (i) => [(random(`tx${i}`) - 0.5) * 0.5, 1.2 + random(`ty${i}`) * 0.75, 0.22],
  brazos: (i) => [(i % 2 === 0 ? -1 : 1) * 0.4, 1.2 + random(`bx${i}`) * 0.7, 0.05],
  piernas: (i) => [(i % 2 === 0 ? -0.14 : 0.14), 0.25 + random(`px${i}`) * 0.8, 0.12],
};

const mezcla = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t);

const Bolitas: React.FC<{ zona: Zona; visibles: number; frame: number }> = ({ zona, visibles, frame }) => {
  const n = CUPOS[zona];
  const items = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        o: ORIGEN[zona](i),
        fase: random(`f${zona}${i}`),
        vel: 0.016 + random(`v${zona}${i}`) * 0.01,
        lado: (random(`l${zona}${i}`) - 0.5) * 0.3,
      })),
    [zona, n]
  );
  return (
    <group>
      {items.map((it, i) => {
        const t = (frame * it.vel + it.fase) % 1;
        const op = visibles * Math.sin(Math.PI * t);
        if (op <= 0.02) return null;
        return (
          <mesh key={i} position={[it.o[0] + it.lado * t * 2 + (it.o[0] > 0 ? 1 : -1) * t * 0.15, it.o[1] + t * 0.7, it.o[2] + t * 0.4]} scale={0.7 + 0.5 * t}>
            <sphereGeometry args={[0.065, 12, 10]} />
            <meshBasicMaterial color="#ff9a3c" transparent opacity={0.9 * op} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

export const CalorCuerpo: React.FC<{ e: EstadoCalorCuerpo }> = ({ e }) => {
  const f = e.frame;
  const torso = useMemo(() => new THREE.CapsuleGeometry(0.27, 0.62, 8, 20), []);
  const pierna = useMemo(() => new THREE.CapsuleGeometry(0.11, 0.78, 6, 14), []);
  const brazo = useMemo(() => new THREE.CapsuleGeometry(0.075, 0.6, 6, 12), []);
  const piel = mezcla("#e6b28c", "#b9c6e8", e.frio * 0.6);
  const cabezaVisible = e.calor * (1 - e.gorro);
  const cuerpoVisible = e.calor * (1 - e.campera);
  return (
    <group>
      {/* piernas y short */}
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} geometry={pierna} position={[x, 0.5, 0]} castShadow>
          <meshStandardMaterial color={piel} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 1.02, 0]} scale={[1, 1, 0.72]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.3, 24]} />
        <meshStandardMaterial color="#2f6fd6" roughness={0.8} />
      </mesh>
      {/* torso */}
      <mesh geometry={torso} position={[0, 1.58, 0]} scale={[1, 1, 0.72]} castShadow>
        <meshStandardMaterial color={piel} roughness={0.6} />
      </mesh>
      {/* brazos */}
      {[-0.36, 0.36].map((x, i) => (
        <mesh key={x} geometry={brazo} position={[x, 1.55, 0]} rotation={[0, 0, (i === 0 ? 1 : -1) * 0.12]} castShadow>
          <meshStandardMaterial color={piel} roughness={0.6} />
        </mesh>
      ))}
      {/* cuello y cabeza */}
      <mesh position={[0, 2.18, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.16, 14]} />
        <meshStandardMaterial color={piel} roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.27, 32, 24]} />
        <meshStandardMaterial color={piel} roughness={0.55} />
      </mesh>
      {/* pelo */}
      <mesh position={[0, 2.6, -0.04]} scale={[1, 0.8, 1]} castShadow>
        <sphereGeometry args={[0.285, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#3a2a22" roughness={0.9} />
      </mesh>
      {/* aro de foco en la cabeza */}
      {e.foco > 0.01 && (
        <mesh position={[0, 2.52, 0]} scale={1 + 0.06 * Math.sin(f / 6)}>
          <sphereGeometry args={[0.42, 28, 20]} />
          <meshBasicMaterial color="#ffc53d" transparent opacity={0.22 * e.foco} depthWrite={false} />
        </mesh>
      )}
      {/* gorro */}
      {e.gorro > 0.01 && (
        <group position={[0, 2.72 + (1 - e.gorro) * 0.8, -0.02]} scale={e.gorro}>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color="#e8453c" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.07, 14, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>
        </group>
      )}
      {/* campera (torso y brazos) */}
      {e.campera > 0.01 && (
        <group scale={[1, e.campera, 1]} position={[0, 1.58 * (1 - e.campera), 0]}>
          <mesh geometry={torso} position={[0, 1.58, 0]} scale={[1.18, 1.02, 0.86]} castShadow>
            <meshStandardMaterial color="#2c3e6b" roughness={0.75} />
          </mesh>
          {[-0.4, 0.4].map((x, i) => (
            <mesh key={x} geometry={brazo} position={[x, 1.55, 0]} rotation={[0, 0, (i === 0 ? 1 : -1) * 0.12]} scale={[1.35, 1.02, 1.35]} castShadow>
              <meshStandardMaterial color="#2c3e6b" roughness={0.75} />
            </mesh>
          ))}
        </group>
      )}
      <Bolitas zona="cabeza" visibles={cabezaVisible} frame={f} />
      <Bolitas zona="torso" visibles={cuerpoVisible} frame={f} />
      <Bolitas zona="brazos" visibles={cuerpoVisible} frame={f} />
      {e.pantalon > 0.01 &&
        [-0.14, 0.14].map((x) => (
          <mesh key={`pa${x}`} geometry={pierna} position={[x, 0.5 + (1 - e.pantalon) * 0.6, 0]} scale={[1.25 * e.pantalon, 1.0 * e.pantalon, 1.25 * e.pantalon]} castShadow>
            <meshStandardMaterial color="#3d4a63" roughness={0.8} />
          </mesh>
        ))}
      <Bolitas zona="piernas" visibles={e.calor * (1 - e.pantalon)} frame={f} />
    </group>
  );
};

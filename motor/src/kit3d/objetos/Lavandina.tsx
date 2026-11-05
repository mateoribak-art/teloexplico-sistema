import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";

// Balde con dos botellas (lavandina y vinagre) que se vuelcan adentro; al mezclar sale gas verdoso.
// Un tercer envase (limpiador con amoníaco) puede aparecer. Todo sale del frame. Piso en y = 0.

export type EstadoLavandina = {
  frame: number;
  verter: number; // 0..1 botellas inclinadas sobre el balde
  mezcla: number; // 0..1 el líquido del balde se vuelve turbio verdoso
  gas: number; // 0..1 cantidad de gas
  amon: number; // 0..1 aparece el limpiador con amoníaco
  solo: number; // 0..1 queda solo la lavandina (el resto se esconde) y aparece el tilde
  fantasma: number; // 0..1 balde transparente
};

const perfilBotella = [
  [0.0, 0.0],
  [0.5, 0.0],
  [0.56, 0.06],
  [0.56, 1.3],
  [0.4, 1.55],
  [0.2, 1.65],
  [0.2, 1.85],
].map(([x, y]) => new THREE.Vector2(x, y));

const perfilBalde = [
  [0.0, 0.0],
  [0.8, 0.0],
  [0.95, 0.04],
  [1.15, 1.0],
  [1.2, 1.05],
].map(([x, y]) => new THREE.Vector2(x, y));

const Botella: React.FC<{ color: string; tapa: string; liquido: string; lado: number; inclina: number; esc: number; x: number; z?: number }> = ({
  color,
  tapa,
  liquido,
  lado,
  inclina,
  esc,
  x,
  z = 0,
}) => {
  const geo = useMemo(() => new THREE.LatheGeometry(perfilBotella, 40), []);
  if (esc < 0.01) return null;
  // se inclina hacia el centro (lado = +1 la botella de la izquierda gira a la derecha)
  const ang = -lado * inclina * 1.1;
  return (
    <group position={[x + lado * 0.9 * inclina, 1.5 * inclina, z]} scale={esc}>
      <group rotation={[0, 0, ang]}>
        <mesh geometry={geo} castShadow>
          <meshStandardMaterial color={color} transparent opacity={0.82} roughness={0.2} metalness={0.05} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1.2, 32]} />
          <meshStandardMaterial color={liquido} roughness={0.4} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 1.95, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.22, 24]} />
          <meshStandardMaterial color={tapa} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};

export const Lavandina: React.FC<{ e: EstadoLavandina }> = ({ e }) => {
  const f = e.frame;
  const balde = useMemo(() => new THREE.LatheGeometry(perfilBalde, 48), []);
  const humo = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        x: (random(`gx${i}`) - 0.5) * 1.6,
        z: (random(`gz${i}`) - 0.5) * 1.6,
        v: 0.008 + random(`gv${i}`) * 0.008,
        fase: random(`gf${i}`),
        r: 0.28 + random(`gr${i}`) * 0.25,
      })),
    []
  );
  const n = Math.round(e.gas * humo.length);
  const op = 1 - 0.7 * e.fantasma;
  const resto = 1 - e.solo; // vinagre y amoníaco se achican hasta desaparecer
  const liquido = new THREE.Color("#7fc7ff").lerp(new THREE.Color("#b6d84a"), e.mezcla);
  return (
    <group>
      {/* balde */}
      <mesh geometry={balde} castShadow receiveShadow>
        <meshStandardMaterial key={op < 1 ? "t" : "o"} color="#e8edf3" roughness={0.45} side={THREE.DoubleSide} transparent={op < 1} opacity={op} depthWrite={op >= 1} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[1.07, 0.9, 0.6 + 0.25 * e.verter, 40]} />
        <meshStandardMaterial color={liquido} roughness={0.25} emissive={e.mezcla > 0.2 ? "#9acd32" : "#000000"} emissiveIntensity={0.35 * e.mezcla} />
      </mesh>
      {/* lavandina (izquierda) siempre; vinagre (derecha) y amoníaco aparecen */}
      <Botella color="#e9f1ff" tapa="#2f6bd6" liquido="#f2f6d0" lado={1} inclina={e.verter} esc={1} x={-2.0} z={0.5 * e.verter} />
      <Botella color="#f3e3b8" tapa="#b83a2e" liquido="#e7c97a" lado={-1} inclina={e.verter} esc={resto} x={2.0} z={-0.5 * e.verter} />
      <Botella color="#cdeaff" tapa="#7a3fc4" liquido="#9fd8ff" lado={-1} inclina={0} esc={e.amon * resto} x={2.6} z={-1.4} />
      {/* gas verdoso */}
      {humo.slice(0, n).map((h, i) => {
        const t = (f * h.v + h.fase) % 1;
        return (
          <mesh key={i} position={[h.x * (1 + t), 1.3 + t * 2.6, h.z * (1 + t)]} scale={0.5 + 0.8 * t}>
            <sphereGeometry args={[h.r * 0.7, 14, 10]} />
            <meshBasicMaterial color="#c4f03a" transparent opacity={0.17 * Math.sin(Math.PI * t) * Math.min(1, e.gas * 1.5)} depthWrite={false} />
          </mesh>
        );
      })}
      {/* tilde: lavandina sola */}
      {e.solo > 0.01 && (
        <group position={[-2.0, 2.6, 0]} scale={e.solo}>
          <mesh>
            <torusGeometry args={[0.38, 0.06, 12, 40]} />
            <meshStandardMaterial color="#5cff7a" emissive="#2bd957" emissiveIntensity={0.9} />
          </mesh>
          <mesh position={[-0.1, -0.04, 0]} rotation={[0, 0, 0.8]}>
            <boxGeometry args={[0.1, 0.24, 0.07]} />
            <meshStandardMaterial color="#5cff7a" emissive="#2bd957" emissiveIntensity={0.9} />
          </mesh>
          <mesh position={[0.1, 0.04, 0]} rotation={[0, 0, -0.8]}>
            <boxGeometry args={[0.1, 0.4, 0.07]} />
            <meshStandardMaterial color="#5cff7a" emissive="#2bd957" emissiveIntensity={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
};

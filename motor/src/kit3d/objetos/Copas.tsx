import React, { useMemo } from "react";
import * as THREE from "three";

// Dos copas flauta que se acercan y chocan (chispas), con un par de ojos detrás.
// Todo sale del frame. El piso está en y = 0.

export type EstadoCopas = {
  frame: number;
  acerca: number; // 0 = separadas, 1 = chocan
  chispa: number; // 0..1 chispas del choque
  veneno: number; // 0..1 el líquido de la copa derecha vira a verde
  ojos: number; // 0..1 aparecen los ojos
  mira: number; // 0..1 las pupilas miran a los ojos del otro (0 = miran abajo, al celular)
};

const perfilVidrio = [
  [0.0, 0.0],
  [0.62, 0.0],
  [0.62, 0.07],
  [0.12, 0.14],
  [0.07, 0.3],
  [0.07, 0.95],
  [0.2, 1.1],
  [0.4, 1.5],
  [0.46, 2.1],
  [0.44, 2.7],
  [0.42, 2.7],
].map(([x, y]) => new THREE.Vector2(x, y));

const perfilVino = [
  [0.0, 1.12],
  [0.18, 1.12],
  [0.37, 1.5],
  [0.42, 2.0],
  [0.4, 2.3],
  [0.0, 2.3],
].map(([x, y]) => new THREE.Vector2(x, y));

const Copa: React.FC<{ vino: string }> = ({ vino }) => {
  const vidrio = useMemo(() => new THREE.LatheGeometry(perfilVidrio, 40), []);
  const liquido = useMemo(() => new THREE.LatheGeometry(perfilVino, 40), []);
  return (
    <group>
      <mesh geometry={vidrio} castShadow>
        <meshStandardMaterial color="#cfe6f5" transparent opacity={0.3} roughness={0.08} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh geometry={liquido}>
        <meshStandardMaterial color={vino} roughness={0.25} emissive={vino} emissiveIntensity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const Ojo: React.FC<{ x: number; y: number; mira: number }> = ({ x, y, mira }) => (
  <group position={[x, y, 0]}>
    <mesh>
      <sphereGeometry args={[0.55, 28, 20]} />
      <meshStandardMaterial color="#f7f7f2" roughness={0.4} />
    </mesh>
    <mesh position={[(x < 0 ? 0.18 : -0.18) * mira, -0.32 * (1 - mira), 0.46]}>
      <sphereGeometry args={[0.24, 20, 16]} />
      <meshStandardMaterial color="#1c2430" roughness={0.3} />
    </mesh>
  </group>
);

export const Copas: React.FC<{ e: EstadoCopas }> = ({ e }) => {
  const ease = e.acerca * e.acerca * (3 - 2 * e.acerca);
  const x = 1.6 - 0.55 * ease; // distancia al centro de cada copa
  const inc = 0.22 * ease; // se inclinan una hacia la otra
  const verde = new THREE.Color("#e8b84a").lerp(new THREE.Color("#7fd04a"), e.veneno).getStyle();
  const chispas = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * Math.PI * 2, v: 0.8 + ((i * 37) % 10) / 10 })),
    []
  );
  return (
    <group>
      <group position={[-x, 0, 0]} rotation={[0, 0, -inc]}>
        <Copa vino="#e8b84a" />
      </group>
      <group position={[x, 0, 0]} rotation={[0, 0, inc]}>
        <Copa vino={verde} />
      </group>
      {e.ojos > 0.01 && (
        <group position={[0, 3.9, -1.2]} scale={e.ojos}>
          <Ojo x={-0.8} y={0} mira={e.mira} />
          <Ojo x={0.8} y={0} mira={e.mira} />
        </group>
      )}
      {e.chispa > 0.01 &&
        chispas.map((c, i) => {
          const d = (1 - e.chispa) * 1.6 * c.v;
          return (
            <mesh key={i} position={[Math.cos(c.a) * d, 2.55 + Math.sin(c.a) * d, 0.2]} scale={Math.sin(Math.PI * e.chispa) + 0.05}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshBasicMaterial color="#fff6c8" />
            </mesh>
          );
        })}
    </group>
  );
};

export const estadoPortadaCopas = (): EstadoCopas => ({ frame: 0, acerca: 1, chispa: 0.5, veneno: 0, ojos: 0, mira: 1 });

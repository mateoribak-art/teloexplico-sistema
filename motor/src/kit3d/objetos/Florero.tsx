import React, { useMemo } from "react";
import * as THREE from "three";

// Florero de vidrio con flores, agua, huevos de mosquito pegados a la pared y un cepillo que los saca.
// Todo sale del frame. El piso está en y = 0.

export type EstadoFlorero = {
  frame: number;
  agua: number; // 0 = vacío, 1 = lleno
  verde: number; // 0..1 el agua se pone verdosa
  huevos: number; // 0..1 aparecen los huevitos pegados a la pared
  cepillo: number; // 0..1 el cepillo entra y barre (los huevos se van al final)
  flores: number; // 0..1 las flores se ven (0 = se sacan)
};

const R = (y: number) => 0.62 + 0.18 * Math.sin((y / 2.0) * Math.PI); // radio interno en altura y (0..2)

const perfilVidrio = [
  [0.0, 0.0],
  [0.55, 0.0],
  [0.6, 0.15],
  [0.74, 0.5],
  [0.8, 1.0],
  [0.74, 1.6],
  [0.62, 2.0],
  [0.66, 2.25],
  [0.62, 2.25],
].map(([x, y]) => new THREE.Vector2(x, y));

const HUEVOS = Array.from({ length: 26 }, (_, i) => {
  const a = (i / 26) * Math.PI * 2 + (i % 3) * 0.1;
  const y = 0.95 + ((i * 7) % 5) * 0.045;
  return { a, y };
});

const Flor: React.FC<{ x: number; z: number; alto: number; color: string }> = ({ x, z, alto, color }) => (
  <group position={[x, 0.2, z]} rotation={[z * 0.25, 0, -x * 0.35]}>
    <mesh position={[0, alto / 2, 0]}>
      <cylinderGeometry args={[0.04, 0.04, alto, 8]} />
      <meshStandardMaterial color="#4f9d4a" roughness={0.6} />
    </mesh>
    <mesh position={[0, alto + 0.05, 0]}>
      <sphereGeometry args={[0.28, 18, 14]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    <mesh position={[0, alto + 0.08, 0.2]}>
      <sphereGeometry args={[0.1, 12, 10]} />
      <meshStandardMaterial color="#ffd24a" roughness={0.5} />
    </mesh>
  </group>
);

export const Florero: React.FC<{ e: EstadoFlorero }> = ({ e }) => {
  const vidrio = useMemo(() => new THREE.LatheGeometry(perfilVidrio, 48), []);
  const nivel = 0.2 + 0.8 * e.agua; // altura del agua (0.2 a 1.0)
  const hAgua = Math.max(0.01, nivel);
  const perfilAgua = useMemo(() => {
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0.06)];
    const n = 12;
    for (let i = 0; i <= n; i++) {
      const y = 0.06 + ((hAgua - 0.06) * i) / n;
      pts.push(new THREE.Vector2(Math.max(0.1, R(y) * 0.96 + 0.0), y));
    }
    pts.push(new THREE.Vector2(0, hAgua));
    return pts;
  }, [hAgua]);
  const agua = useMemo(() => new THREE.LatheGeometry(perfilAgua, 40), [perfilAgua]);
  const colorAgua = new THREE.Color("#7fc8f0").lerp(new THREE.Color("#7cae3c"), e.verde).getStyle();
  const quedan = e.cepillo > 0.85 ? 0 : 1;
  const ang = e.cepillo * Math.PI * 4; // el cepillo da vueltas por dentro
  return (
    <group position={[0, 0.03, 0]}>
      <mesh geometry={vidrio} castShadow>
        <meshStandardMaterial color="#cfe6f5" transparent opacity={0.28} roughness={0.08} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh geometry={agua} visible={e.agua > 0.02}>
        <meshStandardMaterial color={colorAgua} transparent opacity={0.75} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
      {e.flores > 0.01 && (
        <group scale={e.flores} position={[0, 0, 0]}>
          <Flor x={-0.3} z={0} alto={2.6} color="#ff6f91" />
          <Flor x={0.1} z={0.2} alto={3.0} color="#ffb347" />
          <Flor x={0.35} z={-0.15} alto={2.4} color="#e86bd0" />
        </group>
      )}
      {e.huevos > 0.01 &&
        quedan > 0 &&
        HUEVOS.map((h, i) => {
          const rad = R(h.y) * 0.97;
          return (
            <mesh key={i} position={[Math.cos(h.a) * rad, h.y, Math.sin(h.a) * rad]} scale={[e.huevos * 1.4, e.huevos * 0.7, e.huevos * 1.4]}>
              <sphereGeometry args={[0.045, 10, 8]} />
              <meshStandardMaterial color="#23272e" roughness={0.4} emissive="#ff5a4a" emissiveIntensity={0.35} />
            </mesh>
          );
        })}
      {e.cepillo > 0.01 && e.cepillo < 0.99 && (
        <group position={[0, 1.2 + (1 - Math.sin(Math.PI * e.cepillo)) * 2.4, 0]} rotation={[0, ang, 0]}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 2.6, 10]} />
            <meshStandardMaterial color="#ff8a3d" roughness={0.5} />
          </mesh>
          <mesh position={[0.3, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.7, 16]} />
            <meshStandardMaterial color="#f4f1e4" roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const estadoPortadaFlorero = (): EstadoFlorero => ({ frame: 0, agua: 1, verde: 0.5, huevos: 1, cepillo: 0, flores: 1 });

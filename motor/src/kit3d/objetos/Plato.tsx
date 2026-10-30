import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";

// Plato de cerámica con ñoquis, billete genérico (sin diseño real) y monedas doradas debajo.
// Todo sale del frame. El piso está en y = 0; el plato está centrado en el origen.

export type EstadoPlato = {
  frame: number;
  noquis: number; // 0..1 cuántos ñoquis hay en el plato
  lift: number; // 0..1 el plato se levanta y deja ver lo de abajo
  fantasma: number; // 0..1 el plato se vuelve transparente
  billete: number; // 0..1 el billete aparece (se desliza desde la derecha)
  monedas: number; // 0..1 las monedas aparecen abajo del plato
  vapor: number; // 0..1 vapor sobre los ñoquis
};

export const PLATO = { r: 1.7, alto: 0.2 };

const perfil = [
  [0.0, 0.0],
  [0.9, 0.0],
  [1.0, 0.04],
  [1.7, 0.2],
  [1.74, 0.2],
  [1.7, 0.17],
  [1.0, 0.02],
  [0.0, 0.02],
].map(([x, y]) => new THREE.Vector2(x, y));

export const Plato: React.FC<{ e: EstadoPlato }> = ({ e }) => {
  const f = e.frame;
  const cuerpo = useMemo(() => new THREE.LatheGeometry(perfil.slice(0, 5), 64), []);
  const pila = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = random(`na${i}`) * Math.PI * 2;
        const rad = Math.sqrt(random(`nr${i}`)) * 0.95;
        const capa = i < 14 ? 0 : 1;
        return { x: Math.cos(a) * rad * (capa ? 0.5 : 1), z: Math.sin(a) * rad * (capa ? 0.5 : 1), giro: random(`ng${i}`) * Math.PI, capa };
      }),
    []
  );
  const monedas = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({ x: (random(`mx${i}`) - 0.5) * 1.6, z: (random(`mz${i}`) - 0.5) * 1.2 + 0.2, r: random(`mr${i}`) * 3 })),
    []
  );
  const humo = useMemo(
    () => Array.from({ length: 8 }, (_, i) => ({ x: (random(`hx${i}`) - 0.5) * 1.0, z: (random(`hz${i}`) - 0.5) * 1.0, v: 0.012 + random(`hv${i}`) * 0.01, fase: random(`hf${i}`) })),
    []
  );
  const opPlato = 1 - 0.85 * e.fantasma;
  const yPlato = 0.03 + e.lift * 1.1;
  const nN = Math.round(e.noquis * pila.length);
  const nH = Math.round(e.vapor * humo.length);
  const bx = (1 - e.billete) * 5;
  return (
    <group>
      {/* mesa: una tabla oscura para que se vea qué hay debajo */}
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[9, 0.08, 6]} />
        <meshStandardMaterial color="#2b2f3d" roughness={0.7} />
      </mesh>
      {/* billete */}
      {e.billete > 0.01 && (
        <group position={[bx, 0.012, 0.15]} rotation={[0, 0.12, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[4.2, 0.012, 1.9]} />
            <meshStandardMaterial color="#7fb28a" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.0075, 0]}>
            <boxGeometry args={[3.9, 0.004, 1.6]} />
            <meshStandardMaterial color="#a9d3b1" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.5, 32]} />
            <meshStandardMaterial color="#5f9a6c" roughness={0.6} />
          </mesh>
        </group>
      )}
      {/* monedas debajo del plato */}
      {e.monedas > 0.01 &&
        monedas.map((m, i) => (
          <mesh key={i} position={[m.x, 0.04 + 0.05 * e.monedas * (1 + (i % 2)), m.z]} rotation={[0, m.r, 0]} scale={[e.monedas, 1, e.monedas]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 28]} />
            <meshStandardMaterial color="#ffc53d" metalness={0.9} roughness={0.25} emissive="#ffb000" emissiveIntensity={0.35} />
          </mesh>
        ))}
      {/* plato */}
      <group position={[0, yPlato, 0]} rotation={[0, 0, -e.lift * 0.04]}>
        <mesh geometry={cuerpo} castShadow receiveShadow>
          <meshStandardMaterial key={opPlato < 1 ? "t" : "o"} color="#f4f1ea" roughness={0.25} metalness={0.05} side={THREE.DoubleSide} transparent={opPlato < 1} opacity={opPlato} depthWrite={opPlato >= 1} />
        </mesh>
        {/* ñoquis */}
        {pila.slice(0, nN).map((n, i) => (
          <mesh key={i} position={[n.x, 0.1 + 0.12 + n.capa * 0.16, n.z]} rotation={[0.2, n.giro, 0.15]} scale={[0.26, 0.15, 0.18]} castShadow>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color="#f1dfa8" roughness={0.75} />
          </mesh>
        ))}
        {/* vapor */}
        {pila.length > 0 &&
          humo.slice(0, nH).map((h, i) => {
            const t = (f * h.v + h.fase) % 1;
            return (
              <mesh key={`h${i}`} position={[h.x + Math.sin(f / 30 + i) * 0.1, 0.5 + t * 1.2, h.z]} scale={0.6 + 0.9 * t}>
                <sphereGeometry args={[0.2, 14, 10]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.14 * Math.sin(Math.PI * t) * e.vapor} depthWrite={false} />
              </mesh>
            );
          })}
      </group>
    </group>
  );
};

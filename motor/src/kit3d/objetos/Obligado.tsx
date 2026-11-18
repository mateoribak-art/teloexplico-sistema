import React from "react";
import * as THREE from "three";

// Vuelta de Obligado (1845): un tramo del río Paraná en estudio azul noche. El agua corre entre dos
// orillas; sobre el agua cruzan TRES cadenas de hierro de orilla a orilla, colgadas de lanchones.
// En la barranca (orilla cercana) hay cañones. Desde aguas abajo entra la flota anglofrancesa, que
// al final rompe las cadenas y pasa igual. Todo sale del estado (frame → números). Agua en y = 0.

export type EstadoObligado = {
  frame: number;
  cadenas: number; // 0..1 aparecen las tres cadenas y los lanchones
  canones: number; // 0..1 aparecen los cañones en la barranca
  flota: number; // 0..1 la flota entra desde aguas abajo y avanza hasta las cadenas
  rotas: number; // 0..1 las cadenas se rompen y la flota pasa
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const AGUA = "#2f6ea8";
const HIERRO = "#6b7280";
const MADERA = "#6b4a2b";
const TIERRA = "#3f4a2e";

// El río corre en X; las orillas están en ±Z. La cercana (z=+ZB) es la barranca con cañones.
const ZB = 3.6; // media-anchura del agua (de orilla a orilla representa ~700 m)
const CHAIN_X = [-0.75, 0, 0.75];

/** Agua: plano base + tiras claras que derivan en X para que el río se vea corriendo. */
const Agua: React.FC<{ frame: number }> = ({ frame }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[26, ZB * 2]} />
      <meshStandardMaterial color={AGUA} roughness={0.35} metalness={0.1} emissive={"#123a5e"} emissiveIntensity={0.3} />
    </mesh>
    {Array.from({ length: 14 }, (_, i) => {
      const z = -ZB + 0.3 + (i / 13) * (ZB * 2 - 0.6);
      const x = (((frame * (0.03 + (i % 3) * 0.01) + i * 0.7) % 13) - 6.5) * 2;
      return (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]}>
          <planeGeometry args={[2.4, 0.09]} />
          <meshStandardMaterial color={"#9fd4ff"} transparent opacity={0.22} emissive={"#9fd4ff"} emissiveIntensity={0.2} />
        </mesh>
      );
    })}
  </group>
);

/** Orillas: la cercana es una barranca alta (de ahí tiran los cañones); la lejana es más baja. */
const Orillas: React.FC = () => (
  <group>
    <mesh position={[0, 0.7, ZB + 1.6]} castShadow receiveShadow>
      <boxGeometry args={[26, 1.4, 3.2]} />
      <meshStandardMaterial color={TIERRA} roughness={1} />
    </mesh>
    <mesh position={[0, 0.35, -ZB - 1.4]} castShadow receiveShadow>
      <boxGeometry args={[26, 0.7, 3]} />
      <meshStandardMaterial color={"#34402a"} roughness={1} />
    </mesh>
  </group>
);

/** Un eslabón de cadena (toro); se alternan 90° para que se vean entrelazados. */
const Eslabon: React.FC<{ pos: [number, number, number]; giro: boolean; op: number }> = ({ pos, giro, op }) => (
  <mesh position={pos} rotation={[Math.PI / 2, 0, giro ? Math.PI / 2 : 0]} castShadow>
    <torusGeometry args={[0.13, 0.05, 8, 16]} />
    <meshStandardMaterial color={HIERRO} roughness={0.5} metalness={0.9} transparent opacity={op} />
  </mesh>
);

/** Una cadena de orilla a orilla (corre en Z), con una leve panza hacia el agua. */
const Cadena: React.FC<{ x: number; v: number; rotas: number }> = ({ x, v, rotas }) => {
  const N = 26;
  const links = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N; // 0..1 de orilla a orilla
    const z = -ZB + t * (ZB * 2);
    const panza = 0.14 * Math.sin(t * Math.PI); // panza hacia abajo en el medio
    const y = 0.5 - panza;
    // al romperse, los eslabones del centro caen y desaparecen
    const centro = 1 - Math.abs(t - 0.5) * 2; // 1 en el medio, 0 en las orillas
    const caida = rotas * centro;
    const op = clamp01(v - caida * 1.4);
    if (op <= 0.02) continue;
    links.push(
      <Eslabon key={i} pos={[x, y - caida * 0.6, z]} giro={i % 2 === 0} op={op} />
    );
  }
  return <group>{links}</group>;
};

/** Un lanchón: casco de madera chato que sostiene las cadenas. */
const Lanchon: React.FC<{ v: number }> = ({ v }) => (
  <group scale={[v, v, v]}>
    <mesh position={[0, 0.16, 0]} castShadow>
      <boxGeometry args={[0.5, 0.26, 0.9]} />
      <meshStandardMaterial color={MADERA} roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.34, 0]} castShadow>
      <boxGeometry args={[0.36, 0.08, 0.7]} />
      <meshStandardMaterial color={"#8a6038"} roughness={0.8} />
    </mesh>
  </group>
);

/** Un cañón en la barranca, apuntando al río. */
const Canon: React.FC<{ v: number }> = ({ v }) => (
  <group scale={[v, v, v]}>
    <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2 - 0.35, 0, 0]} castShadow>
      <cylinderGeometry args={[0.09, 0.12, 0.72, 12]} />
      <meshStandardMaterial color={"#2b2f36"} roughness={0.5} metalness={0.8} />
    </mesh>
    {[-0.22, 0.22].map((s) => (
      <mesh key={s} position={[s, 0.18, 0.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 14]} />
        <meshStandardMaterial color={"#4a3420"} roughness={0.9} />
      </mesh>
    ))}
  </group>
);

/** Un barco de la flota: casco grande + dos mástiles con vela. */
const Barco: React.FC<{ danio: number }> = ({ danio }) => (
  <group>
    <mesh position={[0, 0.4, 0]} castShadow>
      <boxGeometry args={[1.9, 0.7, 0.8]} />
      <meshStandardMaterial color={"#43372a"} roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.72, 0]} castShadow>
      <boxGeometry args={[1.5, 0.22, 0.66]} />
      <meshStandardMaterial color={"#5a4631"} roughness={0.8} />
    </mesh>
    {[-0.5, 0.5].map((mx) => (
      <group key={mx} position={[mx, 0, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 1.8, 8]} />
          <meshStandardMaterial color={"#3a2c1c"} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.6, -0.02]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.7, 1.0]} />
          <meshStandardMaterial color={"#e8e2d2"} roughness={0.9} side={THREE.DoubleSide} emissive={"#e8e2d2"} emissiveIntensity={0.05} />
        </mesh>
      </group>
    ))}
    {/* humo de daño al romper las cadenas */}
    {danio > 0.02 &&
      Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[(-0.6 + i * 0.4), 1.2 + i * 0.35, 0]}>
          <sphereGeometry args={[0.18 + i * 0.05, 8, 8]} />
          <meshStandardMaterial color={"#9aa0a6"} transparent opacity={0.5 * danio} roughness={1} />
        </mesh>
      ))}
  </group>
);

export const Obligado: React.FC<{ e: EstadoObligado }> = ({ e }) => {
  const cad = clamp01(e.cadenas);
  // lanchones: 8 por cadena = 24 en total
  const boats: React.ReactNode[] = [];
  CHAIN_X.forEach((cx, ci) => {
    for (let i = 0; i < 8; i++) {
      const z = -ZB + 0.45 + (i / 7) * (ZB * 2 - 0.9);
      const centro = 1 - Math.abs((i / 7) - 0.5) * 2;
      const v = clamp01(cad - e.rotas * centro * 1.2);
      if (v <= 0.02) continue;
      boats.push(
        <group key={`${ci}-${i}`} position={[cx, 0, z]}>
          <Lanchon v={v} />
        </group>
      );
    }
  });

  // cañones en la barranca (5 visibles representan los 20)
  const canones = [-4.4, -2.2, 0, 2.2, 4.4].map((x, i) => (
    <group key={i} position={[x, 1.4, ZB + 0.3]} rotation={[0, Math.PI, 0]}>
      <Canon v={clamp01(e.canones * 1.3 - i * 0.05)} />
    </group>
  ));

  // flota: entra desde -X y, al romper, pasa hacia +X
  const entrada = -8 + clamp01(e.flota) * 6.2; // -8 → -1.8
  const paso = clamp01(e.rotas) * 5.2; // 0 → +5.2
  const fx = entrada + paso;
  const flotaVisible = e.flota > 0.02;
  const barcos = [
    [0, 0, 0],
    [-2.4, -1.3, 0],
    [-1.6, 1.4, 0],
  ].map(([dx, dz], i) => (
    <group key={i} position={[fx + dx, 0, dz]}>
      <Barco danio={e.rotas} />
    </group>
  ));

  return (
    <group>
      <Agua frame={e.frame} />
      <Orillas />
      {CHAIN_X.map((cx) => (
        <Cadena key={cx} x={cx} v={cad} rotas={e.rotas} />
      ))}
      {boats}
      {canones}
      {flotaVisible && barcos}
    </group>
  );
};

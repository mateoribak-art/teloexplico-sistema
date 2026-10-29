import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Un trozo de carne congelada en capas, para ver "por dentro" cómo se descongela de afuera hacia adentro,
// sobre una mesada, con bacterias (ilustración: puntitos verdes) y tres formas seguras de descongelar:
// heladera, agua fría y microondas. Todo sale del frame.

const CAPAS = 6;
const ALTO = 0.2;
const caja = (w: number, h: number, d: number, r = 0.03) => new RoundedBoxGeometry(w, h, d, 3, r);

const HIELO = new THREE.Color("#b9d6e8");
const CRUDA = new THREE.Color("#a82a3c");

export type EstadoDescongelar = {
  frame: number;
  /** descongelado de afuera hacia adentro, 0..1 (el centro va con retraso) */
  afuera: number;
  centro: number;
  /** bacterias sobre las capas de afuera, 0..1 */
  bac: number;
  /** cuánto se ve la mesada (0..1) */
  mesada: number;
  /** aparición de cada método seguro, 0..1 */
  heladera: number;
  agua: number;
  micro: number;
  /** la carne se acostó en el método (0 = en el centro) */
  guardada: number;
};

export const DescongelarVacio: EstadoDescongelar = { frame: 0, afuera: 0, centro: 0, bac: 0, mesada: 1, heladera: 0, agua: 0, micro: 0, guardada: 0 };

const Carne: React.FC<{ e: EstadoDescongelar }> = ({ e }) => {
  const capas = useMemo(() => Array.from({ length: CAPAS }, (_, i) => caja(2.2, ALTO, 1.5, i === 0 || i === CAPAS - 1 ? 0.06 : 0.02)), []);
  return (
    <group>
      {capas.map((g, i) => {
        const dist = Math.abs(i - (CAPAS - 1) / 2) / ((CAPAS - 1) / 2); // 1 afuera, 0 centro
        const t = dist > 0.5 ? e.afuera : e.centro;
        const col = HIELO.clone().lerp(CRUDA, t);
        return (
          <mesh key={i} geometry={g} position={[0, ALTO * (i + 0.5), 0]} castShadow receiveShadow>
            <meshStandardMaterial color={col} roughness={0.85 - 0.25 * (1 - t)} envMapIntensity={0.5} />
          </mesh>
        );
      })}
      {/* bacterias sobre la cara de arriba y los costados */}
      {e.bac > 0.02 &&
        Array.from({ length: Math.round(34 * e.bac) }, (_, i) => {
          const lado = random(`bl${i}`) < 0.7;
          const x = (random(`bx${i}`) - 0.5) * 2.1;
          const z = (random(`bz${i}`) - 0.5) * 1.4;
          const y = lado ? ALTO * CAPAS + 0.03 : ALTO * (0.5 + random(`by${i}`) * (CAPAS - 1));
          const zz = lado ? z : 0.78 * (random(`bs${i}`) < 0.5 ? 1 : -1);
          const pulso = 1 + 0.25 * Math.sin(e.frame / 5 + i);
          return (
            <mesh key={i} position={[x, y, zz]} scale={pulso}>
              <sphereGeometry args={[0.05, 8, 6]} />
              <meshBasicMaterial color="#7dff5a" />
            </mesh>
          );
        })}
    </group>
  );
};

const Heladera: React.FC<{ a: number }> = ({ a }) => {
  if (a <= 0.01) return null;
  return (
    <group scale={a} position={[-3.1, 0, -0.4]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.5, 2.4, 1.2]} />
        <meshStandardMaterial color="#d8e2ea" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0.78, 1.2, 0]}>
        <boxGeometry args={[0.05, 1.6, 0.1]} />
        <meshStandardMaterial color="#8a949c" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.6, 0.61]}>
        <boxGeometry args={[1.4, 0.03, 0.02]} />
        <meshBasicMaterial color="#5fd2ff" />
      </mesh>
    </group>
  );
};

const Agua: React.FC<{ a: number; frame: number }> = ({ a, frame }) => {
  if (a <= 0.01) return null;
  return (
    <group scale={a} position={[0, 0, 2.6]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[1.0, 0.8, 1.0, 40, 1, true]} />
        <meshStandardMaterial color="#bcd8ea" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.45 + 0.02 * Math.sin(frame / 8), 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 40]} />
        <meshStandardMaterial color="#3a9bd6" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

const Micro: React.FC<{ a: number; frame: number }> = ({ a, frame }) => {
  if (a <= 0.01) return null;
  const luz = 0.5 + 0.5 * Math.sin(frame / 4);
  return (
    <group scale={a} position={[3.2, 0, -0.2]}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[2.0, 1.3, 1.4]} />
        <meshStandardMaterial color="#cfd5db" roughness={0.45} metalness={0.4} />
      </mesh>
      <mesh position={[-0.25, 0.65, 0.71]}>
        <boxGeometry args={[1.3, 0.85, 0.02]} />
        <meshStandardMaterial color="#10161c" roughness={0.2} />
      </mesh>
      <mesh position={[-0.25, 0.65, 0.73]}>
        <planeGeometry args={[1.2, 0.75]} />
        <meshBasicMaterial color="#ffc766" transparent opacity={0.25 + 0.15 * luz} />
      </mesh>
      <mesh position={[0.7, 0.65, 0.71]}>
        <boxGeometry args={[0.3, 0.8, 0.03]} />
        <meshStandardMaterial color="#6b737b" />
      </mesh>
    </group>
  );
};

export const Descongelar: React.FC<{ e: EstadoDescongelar }> = ({ e }) => {
  return (
    <group>
      {/* mesada */}
      {e.mesada > 0.01 && (
        <mesh position={[0, -0.12, 0]} receiveShadow scale={[1, e.mesada, 1]}>
          <boxGeometry args={[9, 0.24, 4.2]} />
          <meshStandardMaterial color="#c9b79c" roughness={0.6} />
        </mesh>
      )}
      <Heladera a={e.heladera} />
      <Agua a={e.agua} frame={e.frame} />
      <Micro a={e.micro} frame={e.frame} />
      <group position={[0, 0, 0]} scale={1 - 0.25 * e.guardada}>
        <Carne e={e} />
      </group>
    </group>
  );
};

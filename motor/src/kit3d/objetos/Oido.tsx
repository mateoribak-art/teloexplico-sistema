import React, { useMemo } from "react";
import * as THREE from "three";

// Corte esquemático del oído (simplificado) visto de costado, a lo largo del eje x.
// Izquierda: conducto auditivo, que da al aire de afuera. En x = -0.9: el tímpano (disco).
// Detrás: el oído medio (cámara con aire). De ahí sale la trompa de Eustaquio hacia abajo y a la derecha, hasta la garganta.
// Mide ~4.4 de ancho, centrado en el origen, a una altura de y = 1.5.

export type EstadoOido = {
  frame: number;
  presion: number; // -1..1: -1 = el tímpano se hunde (adentro hay menos presión), +1 = se infla hacia afuera
  abierta: number; // 0..1: trompa abierta (1) o apretada (0)
  extra: number; // 0..1: cuánto aire de más hay en el oído medio
  flujo: number; // 0..1 recorrido del aire que sale (o -1..0 entra) por la trompa; 0 = quieto
  pop: number; // 0..1 destello del "pop"
  piel: number; // 0..1 opacidad de la carcasa de la cabeza
  foco: number; // 0..1 aro brillante en la trompa
};

const Y = 1.5;
const AZUL = "#5fd2ff";
const ORO = "#ffc53d";

const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const Oido: React.FC<{ e: EstadoOido }> = ({ e }) => {
  const curva = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.35, -0.25, 0),
        new THREE.Vector3(0.95, -0.7, 0),
        new THREE.Vector3(1.5, -1.0, 0),
        new THREE.Vector3(2.0, -1.15, 0),
      ]),
    [],
  );
  const tubo = useMemo(() => new THREE.TubeGeometry(curva, 40, 0.13, 14, false), [curva]);
  const aire = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: -0.55 + rnd(i) * 1.0,
        y: -0.35 + rnd(i + 40) * 0.9,
        z: -0.25 + rnd(i + 80) * 0.5,
        f: rnd(i + 120),
      })),
    [],
  );
  const bulto = e.presion * 0.28;
  const nAire = Math.round(7 + e.extra * 15);
  const vibra = 1 + 0.03 * Math.sin(e.frame / 3) * e.extra;
  // Punto de aire que viaja por la trompa
  const viaja = (offset: number) => {
    const u = ((Math.abs(e.flujo) * 1.2 + offset) % 1);
    const t = e.flujo >= 0 ? 1 - u : u;
    return curva.getPoint(Math.min(1, Math.max(0, t)));
  };
  return (
    <group position={[0, Y, 0]}>
      {/* conducto auditivo */}
      <mesh position={[-1.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.38, 0.38, 1.3, 28, 1, true]} />
        <meshStandardMaterial color="#e6b28c" roughness={0.6} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* aire de afuera (flechitas de puntos) */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-2.15 - 0.15 * Math.sin(e.frame / 5 + i), -0.18 + i * 0.12, 0.08 * i - 0.1]}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshBasicMaterial color={AZUL} transparent opacity={0.9} />
        </mesh>
      ))}
      {/* tímpano: disco que se hunde o se infla */}
      <mesh position={[-0.9 + bulto, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1 + Math.abs(e.presion) * 0.3, 1]}>
        <cylinderGeometry args={[0.4, 0.4, 0.04, 32]} />
        <meshStandardMaterial
          color={Math.abs(e.presion) > 0.55 ? "#ff7a5a" : "#f1d4b8"}
          emissive={Math.abs(e.presion) > 0.55 ? "#ff3d2a" : "#000000"}
          emissiveIntensity={0.5 * Math.abs(e.presion)}
          roughness={0.5}
        />
      </mesh>
      {/* oído medio: cámara con aire */}
      <mesh position={[-0.2, 0.1, 0]} scale={[1.15 * vibra, 0.95 * vibra, 0.8 * vibra]}>
        <sphereGeometry args={[0.7, 32, 22]} />
        <meshStandardMaterial color={AZUL} transparent opacity={0.16 + 0.1 * e.extra} roughness={0.2} depthWrite={false} />
      </mesh>
      {aire.slice(0, nAire).map((p, i) => (
        <mesh key={i} position={[p.x + 0.03 * Math.sin(e.frame / 4 + i), p.y + 0.03 * Math.cos(e.frame / 5 + i), p.z]}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      ))}
      {/* trompa de Eustaquio */}
      <mesh geometry={tubo}>
        <meshStandardMaterial color={e.abierta < 0.4 ? "#ff7a5a" : "#e6b28c"} roughness={0.5} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {/* pinza que aprieta la trompa */}
      {e.abierta < 0.99 && (
        <group position={[1.0, -0.72, 0]} rotation={[0, 0, -0.45]}>
          <mesh position={[0, 0.3 - 0.13 * (1 - e.abierta) - 0.0 * e.abierta, 0]}>
            <boxGeometry args={[0.4, 0.07, 0.3]} />
            <meshStandardMaterial color="#ff7a5a" emissive="#ff3d2a" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, -0.3 + 0.13 * (1 - e.abierta) + 0.0 * e.abierta, 0]}>
            <boxGeometry args={[0.4, 0.07, 0.3]} />
            <meshStandardMaterial color="#ff7a5a" emissive="#ff3d2a" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )}
      {/* aire que viaja por la trompa */}
      {Math.abs(e.flujo) > 0.01 &&
        [0, 0.25, 0.5, 0.75].map((o) => {
          const p = viaja(o);
          return (
            <mesh key={o} position={[p.x, p.y, p.z]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshBasicMaterial color={e.flujo >= 0 ? "#ffffff" : AZUL} />
            </mesh>
          );
        })}
      {/* garganta / fondo de la nariz */}
      <mesh position={[2.15, -1.2, 0]} scale={[0.8, 1.1, 0.8]}>
        <sphereGeometry args={[0.45, 24, 18]} />
        <meshStandardMaterial color="#e08a7a" roughness={0.6} transparent opacity={0.45} depthWrite={false} />
      </mesh>
      {/* cabeza: carcasa traslúcida */}
      {e.piel > 0.01 && (
        <mesh position={[0.45, -0.35, -0.5]} scale={[2.6, 1.7, 0.5]}>
          <sphereGeometry args={[1, 32, 22]} />
          <meshStandardMaterial color="#e6b28c" roughness={0.7} transparent opacity={0.12 * e.piel} depthWrite={false} />
        </mesh>
      )}
      {/* destello del pop */}
      {e.pop > 0.01 && e.pop < 0.99 && (
        <mesh position={[0.35, -0.25, 0]} scale={0.5 + e.pop * 2.2}>
          <torusGeometry args={[0.5, 0.03, 12, 48]} />
          <meshBasicMaterial color={ORO} transparent opacity={0.9 * (1 - e.pop)} depthWrite={false} />
        </mesh>
      )}
      {/* aro de foco en la trompa */}
      {e.foco > 0.01 && (
        <mesh position={[1.1, -0.75, 0]}>
          <sphereGeometry args={[0.7, 28, 20]} />
          <meshBasicMaterial color={ORO} transparent opacity={0.14 * e.foco} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

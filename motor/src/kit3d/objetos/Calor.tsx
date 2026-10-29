import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Escena del calor: una persona (sin cara) con gotas de sudor sobre la piel, dos termómetros (el real y el
// "se siente como"), partículas de humedad en el aire, un sol y un toldo de sombra. Todo sale del frame.
// Unidades: el piso está en y = 0, la persona mide ~3 y está en x = PERSONA_X, mirando a +z (a cámara).

export type EstadoCalor = {
  frame: number;
  real: number; // °C que marca el termómetro real
  sensacion: number; // °C del termómetro "se siente como"
  realOn: number; // 0..1 aparece el termómetro real
  sensOn: number; // 0..1 aparece el segundo termómetro
  calculado: number; // 0..1 el segundo termómetro se vuelve "fantasma" (no se mide, se calcula)
  humedad: number; // 0..1 → cantidad de partículas de humedad en el aire
  sudor: number; // 0..1 cuántas gotas hay
  evap: number; // 0..1: 1 = las gotas se evaporan rápido, 0 = se quedan y chorrean
  piel: number; // 0..1: piel pálida → colorada
  sol: number; // 0..1 brillo del sol
  sombra: number; // 0..1 el toldo cubre a la persona
};

export const PERSONA_X = 0.6;
const T_REAL_X = -1.05;
const T_SENS_X = -0.55;
const T_MIN = 20;
const T_MAX = 58;
const T_ALTO = 3.0;
const T_BASE = 0.35;

const caja = (w: number, h: number, d: number, r = 0.05) => new RoundedBoxGeometry(w, h, d, 4, r);
const mezcla = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t);

const Termometro: React.FC<{ x: number; valor: number; color: string; fantasma?: number; visible: number }> = ({ x, valor, color, fantasma = 0, visible }) => {
  if (visible <= 0.01) return null;
  const h = Math.max(0.02, ((valor - T_MIN) / (T_MAX - T_MIN)) * T_ALTO);
  const marcas = [20, 25, 30, 35, 40, 45, 50, 55];
  return (
    <group position={[x, 0, 0]} scale={[visible, visible, visible]}>
      {/* tubo de vidrio */}
      <mesh position={[0, T_BASE + T_ALTO / 2 + 0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, T_ALTO + 0.3, 24]} />
        <meshStandardMaterial color="#cfe6ff" transparent opacity={0.28} roughness={0.05} metalness={0.1} depthWrite={false} />
      </mesh>
      {/* bulbo */}
      <mesh position={[0, T_BASE, 0]}>
        <sphereGeometry args={[0.2, 28, 20]} />
        <meshStandardMaterial color={color} roughness={0.2} emissive={color} emissiveIntensity={0.35} transparent={fantasma > 0.01} opacity={1 - 0.45 * fantasma} />
      </mesh>
      {/* líquido */}
      <mesh position={[0, T_BASE + h / 2, 0]}>
        <cylinderGeometry args={[0.055, 0.055, h, 20]} />
        <meshStandardMaterial color={color} roughness={0.25} emissive={color} emissiveIntensity={0.45} transparent={fantasma > 0.01} opacity={1 - 0.45 * fantasma} />
      </mesh>
      {/* marcas */}
      {marcas.map((m) => (
        <mesh key={m} position={[0.17, T_BASE + ((m - T_MIN) / (T_MAX - T_MIN)) * T_ALTO, 0]}>
          <boxGeometry args={[m % 10 === 0 ? 0.14 : 0.08, 0.018, 0.018]} />
          <meshBasicMaterial color="#e9f1ff" />
        </mesh>
      ))}
    </group>
  );
};

const Persona: React.FC<{ e: EstadoCalor }> = ({ e }) => {
  const f = e.frame;
  const torso = useMemo(() => new THREE.CapsuleGeometry(0.27, 0.62, 8, 20), []);
  const pierna = useMemo(() => new THREE.CapsuleGeometry(0.11, 0.78, 6, 14), []);
  const brazo = useMemo(() => new THREE.CapsuleGeometry(0.075, 0.6, 6, 12), []);
  const piel = mezcla("#e6b28c", "#e2503b", e.piel);
  const remera = mezcla("#f2c24b", "#e8a23a", e.piel * 0.5);
  const gotas = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: (random(`gx${i}`) - 0.5) * 0.36,
        y: 1.2 + random(`gy${i}`) * 0.95,
        fase: random(`gf${i}`),
        vel: 0.018 + random(`gv${i}`) * 0.012,
        // gotas de la cara/cuello arriba y del torso
        z: 0.2,
      })),
    []
  );
  const n = Math.round(e.sudor * gotas.length);
  return (
    <group position={[PERSONA_X, 0, 0]}>
      {/* piernas */}
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} geometry={pierna} position={[x, 0.5, 0]} castShadow>
          <meshStandardMaterial color="#3d5a8a" roughness={0.7} />
        </mesh>
      ))}
      {/* torso con remera */}
      <mesh geometry={torso} position={[0, 1.58, 0]} scale={[1, 1, 0.72]} castShadow>
        <meshStandardMaterial color={remera} roughness={0.8} />
      </mesh>
      {/* brazos */}
      {[-0.34, 0.34].map((x, i) => (
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
      {/* gotas de sudor */}
      {gotas.slice(0, n).map((g, i) => {
        const t = (f * g.vel + g.fase) % 1;
        const base = 0.034 + (1 - e.evap) * 0.02;
        const r = base * (1 - e.evap * t * 0.95);
        const y = g.y - (1 - e.evap) * t * 0.35 + e.evap * t * 0.1;
        const z = g.z + e.evap * t * 0.28;
        const op = 0.9 * (1 - e.evap * Math.max(0, t - 0.35) * 1.5);
        return (
          <mesh key={i} position={[g.x, y, z]} scale={[1, 1 + (1 - e.evap) * t * 0.9, 1]}>
            <sphereGeometry args={[Math.max(0.005, r), 12, 10]} />
            <meshStandardMaterial color="#bfe6ff" roughness={0.05} metalness={0.2} transparent opacity={Math.max(0, op)} emissive="#6fc3ff" emissiveIntensity={0.25} />
          </mesh>
        );
      })}
      {/* vapor que sube cuando el sudor se evapora */}
      {e.evap > 0.2 &&
        gotas.slice(0, Math.min(n, 12)).map((g, i) => {
          const t = (f * (g.vel * 0.9) + g.fase + 0.3) % 1;
          return (
            <mesh key={`v${i}`} position={[g.x * 1.4, g.y + t * 0.9, 0.3 + t * 0.2]} scale={0.6 + t}>
              <sphereGeometry args={[0.06, 10, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.28 * e.evap * Math.sin(Math.PI * t)} depthWrite={false} />
            </mesh>
          );
        })}
    </group>
  );
};

const Humedad: React.FC<{ nivel: number; frame: number }> = ({ nivel, frame }) => {
  const parts = useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => ({
        x: -1.4 + random(`hx${i}`) * 3.0,
        y: 0.5 + random(`hy${i}`) * 3.2,
        z: -0.9 + random(`hz${i}`) * 1.9,
        r: 0.04 + random(`hr${i}`) * 0.04,
        fase: random(`hf${i}`) * 6.28,
      })),
    []
  );
  const n = Math.round(nivel * 44 * 1.6);
  return (
    <group>
      {parts.slice(0, Math.min(44, n)).map((p, i) => (
        <mesh key={i} position={[p.x + Math.sin(frame / 40 + p.fase) * 0.08, p.y + Math.cos(frame / 33 + p.fase) * 0.08, p.z]}>
          <sphereGeometry args={[p.r, 10, 8]} />
          <meshBasicMaterial color="#7cc8ff" transparent opacity={0.55} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

export const Calor: React.FC<{ e: EstadoCalor }> = ({ e }) => {
  const f = e.frame;
  const suelo = useMemo(() => caja(4.2, 0.3, 2.4, 0.08), []);
  const toldo = useMemo(() => caja(1.7, 0.08, 1.2, 0.03), []);
  return (
    <group>
      <mesh geometry={suelo} position={[0, -0.15, 0]} receiveShadow>
        <meshStandardMaterial color="#4a5a6a" roughness={0.9} />
      </mesh>
      <Persona e={e} />
      <Termometro x={T_REAL_X} valor={e.real} color="#ff4a3a" visible={e.realOn} />
      <Termometro x={T_SENS_X} valor={e.sensacion} color="#ffb02e" fantasma={e.calculado} visible={e.sensOn} />
      <Humedad nivel={e.humedad} frame={f} />
      {/* sol arriba a la derecha, con halo */}
      <group position={[1.35, 3.85, -0.6]} scale={0.6 + 0.5 * e.sol}>
        <mesh>
          <sphereGeometry args={[0.42, 32, 24]} />
          <meshBasicMaterial color="#ffd23a" />
        </mesh>
        <mesh scale={1 + 0.15 * Math.sin(f / 10)}>
          <sphereGeometry args={[0.66, 24, 18]} />
          <meshBasicMaterial color="#ffb02e" transparent opacity={0.1 + 0.3 * e.sol} depthWrite={false} />
        </mesh>
      </group>
      {/* toldo de sombra sobre la persona */}
      <mesh geometry={toldo} position={[PERSONA_X + (1 - e.sombra) * 3.2, 3.25, 0]} castShadow>
        <meshStandardMaterial color="#5f7aa8" roughness={0.6} />
      </mesh>
    </group>
  );
};

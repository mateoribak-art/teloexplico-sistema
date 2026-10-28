import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Heladera con freezer arriba, puerta que se abre, una mesada con una olla, tuppers con papelito,
// un reloj de pared flotante y fichas de días. Todo sale del frame: sin useFrame.
// Unidades: el piso está en y = 0; la heladera mide 1,7 x 3,4 x 1,5 y está en HELADERA_X.

export type EstadoHeladera = {
  frame: number;
  puerta: number; // 0..1 (1 = abierta de par en par)
  fantasmaPuerta: number; // 0..1 vuelve la puerta transparente
  ollaT: number; // 0 = sobre la mesada, 1 = adentro de la heladera
  tapa: number; // 0 = tapa flotando arriba de la olla, 1 = puesta
  vapor: number; // 0..1
  tuppers: number; // 0..1 aparecen los tuppers
  freezerT: number; // 0..1 un tupper pasa al freezer
  papel: number; // 0..1 papelito con la fecha
  reloj: number; // 0..1 recorrido de la aguja (dos horas)
  relojOn: number; // 0..1 aparece el reloj
  dias: number; // 0..4 fichas de días
  escarcha: number; // 0..1 brillo frío del freezer
};

export const HELADERA_X = 0.9;
export const MESADA_X = -1.9;
const W = 1.7;
const H = 3.4;
const D = 1.5;
const T = 0.08;
const Y_BAJO = 1.0;
const Y_ALTO = 1.9;
const Y_FREEZER = 2.75;

const caja = (w: number, h: number, d: number, r = 0.04) => new RoundedBoxGeometry(w, h, d, 3, r);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const Panel: React.FC<{ g: THREE.BufferGeometry; p: [number, number, number]; color?: string; emissive?: string; rough?: number; metal?: number }> = ({
  g,
  p,
  color = "#e3eaf5",
  emissive = "#000000",
  rough = 0.45,
  metal = 0.25,
}) => (
  <mesh geometry={g} position={p} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={rough} metalness={metal} emissive={emissive} emissiveIntensity={0.18} />
  </mesh>
);

const Olla: React.FC<{ tapa: number; vapor: number; frame: number }> = ({ tapa, vapor, frame }) => {
  const asa = useMemo(() => caja(0.2, 0.06, 0.08, 0.025), []);
  return (
    <group>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.34, 0.44, 36]} />
        <meshStandardMaterial color="#b9c2cf" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.43, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.03, 32]} />
        <meshStandardMaterial color="#b4561f" roughness={0.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={asa} position={[s * 0.45, 0.33, 0]} castShadow>
          <meshStandardMaterial color="#2a2f3a" roughness={0.6} />
        </mesh>
      ))}
      {/* tapa: flota arriba hasta que "la tapo" */}
      <group position={[0, 0.46 + (1 - tapa) * 0.75, 0]} rotation={[0, 0, (1 - tapa) * 0.25]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.06, 36]} />
          <meshStandardMaterial color="#c9d1dc" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshStandardMaterial color="#2a2f3a" roughness={0.5} />
        </mesh>
      </group>
      {/* vapor */}
      {vapor > 0.01 &&
        Array.from({ length: 9 }, (_, i) => {
          const t = (frame * (0.018 + random(`vv${i}`) * 0.01) + random(`vf${i}`)) % 1;
          const a = Math.sin(Math.PI * t) * vapor * 0.5;
          return (
            <mesh key={i} position={[(random(`vx${i}`) - 0.5) * 0.4 + Math.sin(frame / 14 + i) * 0.08, 0.5 + t * 1.3, (random(`vz${i}`) - 0.5) * 0.3]} scale={0.6 + t * 1.6}>
              <sphereGeometry args={[0.13, 12, 10]} />
              <meshBasicMaterial color="#f4f8ff" transparent opacity={a} depthWrite={false} />
            </mesh>
          );
        })}
    </group>
  );
};

const Tupper: React.FC<{ color: string; papel?: number }> = ({ color, papel = 0 }) => {
  const base = useMemo(() => caja(0.38, 0.2, 0.3, 0.045), []);
  const tapa = useMemo(() => caja(0.4, 0.05, 0.32, 0.02), []);
  return (
    <group>
      <mesh geometry={base} position={[0, 0.1, 0]} castShadow>
        <meshStandardMaterial color="#dfe9f5" roughness={0.2} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.32, 0.12, 0.24]} />
        <meshStandardMaterial color="#b4561f" roughness={0.7} />
      </mesh>
      <mesh geometry={tapa} position={[0, 0.225, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {papel > 0.01 && (
        <group position={[0, 0.3, 0.17]} rotation={[-0.35, 0, 0]} scale={papel}>
          <mesh>
            <boxGeometry args={[0.3, 0.2, 0.012]} />
            <meshStandardMaterial color="#fff9d6" roughness={0.8} emissive="#fff3a8" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0, 0.045, 0.008]}>
            <boxGeometry args={[0.22, 0.03, 0.004]} />
            <meshBasicMaterial color="#e04a2f" />
          </mesh>
          <mesh position={[0, -0.015, 0.008]}>
            <boxGeometry args={[0.18, 0.02, 0.004]} />
            <meshBasicMaterial color="#6b6f7a" />
          </mesh>
          <mesh position={[0, -0.055, 0.008]}>
            <boxGeometry args={[0.14, 0.02, 0.004]} />
            <meshBasicMaterial color="#6b6f7a" />
          </mesh>
        </group>
      )}
    </group>
  );
};

const Reloj: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  if (on <= 0.01) return null;
  const marcas = Array.from({ length: 12 }, (_, i) => i);
  return (
    <group position={[MESADA_X, 2.55, 0.5]} scale={on * 1.25}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.08, 40]} />
        <meshStandardMaterial color="#f4f1e8" roughness={0.4} emissive="#f4f1e8" emissiveIntensity={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.02]}>
        <cylinderGeometry args={[0.6, 0.6, 0.06, 40]} />
        <meshStandardMaterial color="#20283a" roughness={0.5} />
      </mesh>
      {marcas.map((i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.46, Math.cos(a) * 0.46, 0.05]} rotation={[0, 0, -a]}>
            <boxGeometry args={[0.04, i % 3 === 0 ? 0.12 : 0.07, 0.02]} />
            <meshBasicMaterial color="#20283a" />
          </mesh>
        );
      })}
      {/* sector de las dos horas */}
      <mesh position={[0, 0, 0.045]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.5, 32, Math.PI / 2 - t * (Math.PI / 3), t * (Math.PI / 3)]} />
        <meshBasicMaterial color="#ff5a4a" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <group rotation={[0, 0, -t * (Math.PI / 3)]}>
        <mesh position={[0, 0.2, 0.07]}>
          <boxGeometry args={[0.05, 0.42, 0.02]} />
          <meshBasicMaterial color="#111827" />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.08]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshBasicMaterial color="#111827" />
      </mesh>
    </group>
  );
};

export const Heladera: React.FC<{ e: EstadoHeladera }> = ({ e }) => {
  const f = e.frame;
  const gFondo = useMemo(() => caja(W, H, T, 0.02), []);
  const gLado = useMemo(() => caja(T, H, D, 0.02), []);
  const gTapa = useMemo(() => caja(W, T, D, 0.02), []);
  const gEstante = useMemo(() => caja(W - 2 * T, 0.04, D - 0.1, 0.01), []);
  const gPuerta = useMemo(() => caja(W, H, 0.1, 0.05), []);
  const gMesada = useMemo(() => caja(1.6, 1.0, 1.1, 0.06), []);
  const gFicha = useMemo(() => caja(0.34, 0.34, 0.06, 0.05), []);
  const bx = HELADERA_X;
  const cuerpo = "#dde6f3";
  const abierta = e.puerta;

  // olla: de la mesada a la heladera con un arco
  const ollaX = lerp(MESADA_X, bx, e.ollaT);
  const ollaY = Y_BAJO + 0.04 + Math.sin(Math.PI * e.ollaT) * 0.7;
  // tupper del medio: del estante alto al freezer
  const tupY = lerp(Y_ALTO, Y_FREEZER, e.freezerT) + Math.sin(Math.PI * e.freezerT) * 0.25;
  const tuppers: [number, string][] = [
    [-0.46, "#4aa3ff"],
    [0, "#ff7b54"],
    [0.46, "#58d68d"],
  ];

  return (
    <group>
      {/* mesada */}
      <mesh geometry={gMesada} position={[MESADA_X, 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#7a5233" roughness={0.75} />
      </mesh>
      <mesh position={[MESADA_X, 1.01, 0]} receiveShadow>
        <boxGeometry args={[1.7, 0.04, 1.2]} />
        <meshStandardMaterial color="#d8d2c6" roughness={0.5} />
      </mesh>

      {/* cuerpo de la heladera (abierto adelante) */}
      <group position={[bx, H / 2, 0]}>
        <Panel g={gFondo} p={[0, 0, -D / 2 + T / 2]} color="#aebfd6" emissive="#4f6f99" />
        <Panel g={gLado} p={[-W / 2 + T / 2, 0, 0]} color={cuerpo} />
        <Panel g={gLado} p={[W / 2 - T / 2, 0, 0]} color={cuerpo} />
        <Panel g={gTapa} p={[0, H / 2 - T / 2, 0]} color={cuerpo} />
        <Panel g={gTapa} p={[0, -H / 2 + T / 2, 0]} color={cuerpo} />
        {/* estantes: bajo, alto y piso del freezer */}
        <Panel g={gEstante} p={[0, Y_BAJO - H / 2 - 0.02, 0]} color="#cfe6f7" rough={0.1} />
        <Panel g={gEstante} p={[0, Y_ALTO - H / 2 - 0.02, 0]} color="#cfe6f7" rough={0.1} />
        <Panel g={gEstante} p={[0, 2.62 - H / 2, 0]} color="#bfe2ff" emissive="#7fc8ff" rough={0.2} />
        {/* cajón de verduras */}
        <mesh position={[0, 0.4 - H / 2 + 0.05, 0.1]}>
          <boxGeometry args={[W - 0.3, 0.5, D - 0.4]} />
          <meshStandardMaterial color="#9fe0b4" roughness={0.2} transparent opacity={0.55} />
        </mesh>
        {/* freezer: aire frío */}
        {e.escarcha > 0.01 && (
          <mesh position={[0, 3.0 - H / 2, 0.1]}>
            <boxGeometry args={[W - 0.2, 0.7, D - 0.3]} />
            <meshBasicMaterial color="#58c8ff" transparent opacity={0.22 * e.escarcha} depthWrite={false} />
          </mesh>
        )}
      </group>

      {/* luz de adentro */}
      <pointLight position={[bx, 2.0, 0.9]} intensity={abierta * 9} distance={4.5} color="#fff4dc" />

      {/* contenido: tuppers y el que se va al freezer */}
      {e.tuppers > 0.01 &&
        tuppers.map(([x, color], i) => (
          <group key={i} position={[bx + x, i === 1 ? tupY : Y_ALTO, 0.05]} scale={e.tuppers}>
            <Tupper color={color} papel={i === 1 ? e.papel : 0} />
          </group>
        ))}

      {/* olla */}
      <group position={[ollaX, ollaY, e.ollaT > 0.5 ? 0.15 : 0]}>
        <Olla tapa={e.tapa} vapor={e.vapor} frame={f} />
      </group>

      {/* puerta con bisagra a la izquierda */}
      <group position={[bx - W / 2, H / 2, D / 2 + 0.05]} rotation={[0, -e.puerta * 1.85, 0]}>
        <mesh geometry={gPuerta} position={[W / 2, 0, 0]} castShadow>
          <meshStandardMaterial
            key={e.fantasmaPuerta > 0.01 ? "t" : "o"}
            color="#e9eff8"
            roughness={0.3}
            metalness={0.4}
            transparent={e.fantasmaPuerta > 0.01}
            opacity={1 - e.fantasmaPuerta * 0.85}
            depthWrite={e.fantasmaPuerta <= 0.01}
          />
        </mesh>
        {/* manijas */}
        <mesh position={[W - 0.12, 0.6, 0.1]}>
          <boxGeometry args={[0.06, 0.8, 0.06]} />
          <meshStandardMaterial color="#8a93a8" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[W - 0.12, -0.8, 0.1]}>
          <boxGeometry args={[0.06, 0.8, 0.06]} />
          <meshStandardMaterial color="#8a93a8" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[W / 2, 0.82, 0.055]}>
          <boxGeometry args={[W, 0.03, 0.01]} />
          <meshStandardMaterial color="#8a93a8" />
        </mesh>
      </group>

      {/* fichas de días arriba de la heladera */}
      {[0, 1, 2, 3].map((i) => {
        const v = Math.min(1, Math.max(0, e.dias - i));
        if (v <= 0.01) return null;
        const ultima = i === 3;
        return (
          <mesh key={i} geometry={gFicha} position={[bx - 0.66 + i * 0.44, H + 0.5, 0]} scale={v}>
            <meshStandardMaterial color={ultima ? "#ffb02e" : "#58a6ff"} roughness={0.35} emissive={ultima ? "#ff9d00" : "#2f7bd6"} emissiveIntensity={0.55} transparent={ultima} opacity={ultima ? 0.55 : 1} />
          </mesh>
        );
      })}

      <Reloj t={e.reloj} on={e.relojOn} />
    </group>
  );
};

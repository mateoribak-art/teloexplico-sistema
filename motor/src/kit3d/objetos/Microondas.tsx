import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Microondas con la puerta transparente y un pote de plástico (tipo yogur/margarina) adentro con comida.
// Se muestra: el pote entra, el microondas prende, el pote se deforma, salen partículas naranjas
// (sustancias químicas: ilustración) hacia la comida, y al final el pote se cambia por un recipiente de vidrio apto.
// Unidades: mesada en y = 0; microondas centrado en x = 0, de y = 0 a 2.8, ancho 5, frente en z = +1.6.

export type EstadoMicroondas = {
  frame: number;
  pote: number; // 0..1 aparece el pote adentro
  prendido: number; // 0..1 luz interior y ondas
  deforma: number; // 0..1 el pote se deforma / se derrite
  quimicos: number; // 0..1 partículas pasan a la comida
  vidrio: number; // 0..1 el vidrio reemplaza al pote
  apto: number; // 0..1 etiqueta verde "apto" en el recipiente
};

export const MicroondasVacio: EstadoMicroondas = { frame: 0, pote: 0, prendido: 0, deforma: 0, quimicos: 0, vidrio: 0, apto: 0 };

const caja = (w: number, h: number, d: number, r = 0.06) => new RoundedBoxGeometry(w, h, d, 4, r);
const NARANJA = "#ff9a3c";

const Recipiente: React.FC<{ deforma: number; frame: number }> = ({ deforma, frame }) => {
  // Perfil de pote (de abajo hacia arriba), abierto arriba.
  const g = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.52, 0.0),
      new THREE.Vector2(0.6, 0.06),
      new THREE.Vector2(0.74, 0.62),
      new THREE.Vector2(0.78, 0.66),
      new THREE.Vector2(0.72, 0.66),
      new THREE.Vector2(0.69, 0.6),
    ];
    return new THREE.LatheGeometry(pts, 40);
  }, []);
  const d = deforma;
  const onda = Math.sin(frame / 5) * 0.03 * d;
  return (
    <group rotation={[onda, 0, d * 0.16]} scale={[1 + d * 0.12, 1 - d * 0.28, 1 + d * 0.06]}>
      <mesh geometry={g} castShadow>
        <meshStandardMaterial color={d > 0.3 ? "#ffd7a8" : "#f4f1ea"} roughness={0.45} side={THREE.DoubleSide} />
      </mesh>
      {/* tapa/aro de color */}
      <mesh position={[0, 0.64, 0]}>
        <torusGeometry args={[0.74, 0.035, 10, 40]} />
        <meshStandardMaterial color="#e63e5a" roughness={0.4} />
      </mesh>
      {/* comida (guiso) */}
      <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.66, 32]} />
        <meshStandardMaterial color="#b4561f" roughness={0.8} />
      </mesh>
    </group>
  );
};

const Vidrio: React.FC<{ apto: number }> = ({ apto }) => {
  const g = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.55, 0.0),
      new THREE.Vector2(0.7, 0.1),
      new THREE.Vector2(0.78, 0.62),
      new THREE.Vector2(0.74, 0.62),
      new THREE.Vector2(0.66, 0.12),
    ];
    return new THREE.LatheGeometry(pts, 40);
  }, []);
  return (
    <group>
      <mesh geometry={g} castShadow>
        <meshStandardMaterial color="#cfe8f5" transparent opacity={0.45} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 32]} />
        <meshStandardMaterial color="#b4561f" roughness={0.8} />
      </mesh>
      {apto > 0.02 && (
        <mesh position={[0, 0.3, 0.78]} scale={apto}>
          <circleGeometry args={[0.22, 24]} />
          <meshBasicMaterial color="#38e08c" />
        </mesh>
      )}
    </group>
  );
};

export const Microondas: React.FC<{ e: EstadoMicroondas }> = ({ e }) => {
  const f = e.frame;
  const mesada = useMemo(() => caja(8.2, 0.3, 3.4, 0.06), []);
  const panelLado = useMemo(() => caja(0.2, 2.8, 3.2, 0.05), []);
  const panelTapa = useMemo(() => caja(5.0, 0.2, 3.2, 0.05), []);
  const panelFondo = useMemo(() => caja(4.8, 2.6, 0.2, 0.04), []);
  const control = useMemo(() => caja(1.0, 2.5, 0.3, 0.06), []);
  const plato = useMemo(() => new THREE.CylinderGeometry(1.35, 1.35, 0.06, 40), []);

  const poteScale = e.pote * (1 - e.vidrio);
  const vidScale = e.vidrio;
  const luz = e.prendido;
  const parts = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        x: Math.cos(i * 2.1) * 0.55,
        z: Math.sin(i * 1.7) * 0.4,
        fase: i * 0.37,
      })),
    []
  );

  return (
    <group>
      <mesh geometry={mesada} position={[0, -0.15, 0]} receiveShadow>
        <meshStandardMaterial color="#cfd6e0" roughness={0.45} metalness={0.05} />
      </mesh>

      <group position={[0, 0.0, 0]}>
        {/* carcasa */}
        <mesh geometry={panelLado} position={[-2.4, 1.4, 0]} castShadow>
          <meshStandardMaterial color="#3a4256" roughness={0.45} metalness={0.4} />
        </mesh>
        <mesh geometry={panelTapa} position={[0, 2.7, 0]} castShadow>
          <meshStandardMaterial color="#3a4256" roughness={0.45} metalness={0.4} />
        </mesh>
        <mesh geometry={panelTapa} position={[0, 0.1, 0]} castShadow>
          <meshStandardMaterial color="#3a4256" roughness={0.45} metalness={0.4} />
        </mesh>
        <mesh geometry={panelFondo} position={[-0.1, 1.4, -1.5]}>
          <meshStandardMaterial color={luz > 0.1 ? "#fff1cf" : "#d9dde6"} emissive="#ffe3a0" emissiveIntensity={0.35 * luz} roughness={0.6} />
        </mesh>
        {/* panel de control a la derecha */}
        <mesh geometry={control} position={[2.05, 1.4, 1.35]} castShadow>
          <meshStandardMaterial color="#2b3144" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[2.05, 2.05, 1.52]}>
          <boxGeometry args={[0.72, 0.28, 0.02]} />
          <meshStandardMaterial color="#0c1a14" emissive={luz > 0.1 ? "#38e08c" : "#0c1a14"} emissiveIntensity={luz > 0.1 ? 0.9 : 0} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[2.05, 1.5 - i * 0.4, 1.52]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.06, 20]} />
            <meshStandardMaterial color="#aab3c6" roughness={0.3} metalness={0.7} />
          </mesh>
        ))}
        {/* puerta de vidrio */}
        <mesh position={[-0.1, 1.4, 1.6]}>
          <boxGeometry args={[4.3, 2.5, 0.05]} />
          <meshStandardMaterial color="#9fb4d0" transparent opacity={0.2} roughness={0.05} metalness={0.2} depthWrite={false} />
        </mesh>

        {/* plato giratorio */}
        <mesh geometry={plato} position={[-0.1, 0.25, 0]}>
          <meshStandardMaterial color="#d8e6ee" transparent opacity={0.55} roughness={0.1} depthWrite={false} />
        </mesh>

        {/* recipiente */}
        <group position={[-0.1, 0.28, 0]}>
          {poteScale > 0.02 && (
            <group scale={poteScale} position={[0, (1 - e.pote) * 0.9, 0]}>
              <Recipiente deforma={e.deforma} frame={f} />
            </group>
          )}
          {vidScale > 0.02 && (
            <group scale={vidScale}>
              <Vidrio apto={e.apto} />
            </group>
          )}

          {/* ondas de calor */}
          {luz > 0.1 &&
            [0, 1, 2].map((i) => {
              const t = (f * 0.02 + i / 3) % 1;
              return (
                <mesh key={i} position={[0, 0.7 + t * 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.35 + t * 0.4, 0.4 + t * 0.4, 28]} />
                  <meshBasicMaterial color="#ffb347" transparent opacity={(1 - t) * 0.5 * luz} depthWrite={false} />
                </mesh>
              );
            })}

          {/* partículas "químicas" del pote hacia la comida */}
          {e.quimicos > 0.02 &&
            e.vidrio < 0.5 &&
            parts.slice(0, Math.round(e.quimicos * parts.length)).map((p, i) => {
              const t = (f * 0.018 + p.fase) % 1;
              return (
                <mesh key={i} position={[p.x * (1 - t * 0.5), 0.1 + t * 0.55, p.z * (1 - t * 0.5)]}>
                  <sphereGeometry args={[0.07, 12, 10]} />
                  <meshStandardMaterial color={NARANJA} emissive={NARANJA} emissiveIntensity={0.8} transparent opacity={0.9 - t * 0.2} />
                </mesh>
              );
            })}
        </group>
      </group>
    </group>
  );
};

export const portadaMicroondas = (): EstadoMicroondas => ({ frame: 0, pote: 1, prendido: 1, deforma: 0.7, quimicos: 1, vidrio: 0, apto: 0 });

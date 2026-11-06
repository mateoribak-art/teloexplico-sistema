import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Una tele apagada (pantalla negra) con la lucecita roja de espera. Energía que sigue entrando por el cable.
// A la derecha, la luz de una casa como 20 cuadraditos: 1 encendido = 5 %, hasta 5 = 26 % (aprox.).
// Al final, una zapatilla con tecla que corta la espera. Todo sale del frame. Piso en y = 0.

export type EstadoEspera = {
  frame: number;
  encendida: number; // 1 = pantalla prendida, 0 = apagada
  led: number; // 0..1 lucecita de espera (0 = apagada del todo)
  flujo: number; // 0..1 chispas que entran por el cable
  casa: number; // 0..1 aparece la grilla de la casa
  cinco: number; // 0..1 primer cuadradito (5 %)
  diez: number; // 0..1 segundo cuadradito (10 %)
  zapatilla: number; // 0..1 aparece la zapatilla
  cortado: number; // 0..1 la tecla de la zapatilla corta la espera
};

const AMBAR = "#ffc53d";
const ROJO = "#ff3b30";
const TX = -1.5;

export const Espera: React.FC<{ e: EstadoEspera }> = ({ e }) => {
  const f = e.frame;
  const marco = useMemo(() => new RoundedBoxGeometry(3.2, 1.95, 0.16, 4, 0.08), []);
  const pant = useMemo(() => new RoundedBoxGeometry(3.0, 1.75, 0.03, 3, 0.04), []);
  const base = useMemo(() => new RoundedBoxGeometry(1.2, 0.08, 0.5, 3, 0.03), []);
  const tira = useMemo(() => new RoundedBoxGeometry(1.5, 0.18, 0.4, 3, 0.06), []);
  const cel = useMemo(() => new RoundedBoxGeometry(0.34, 0.34, 0.1, 2, 0.04), []);
  const pulso = 0.55 + 0.45 * Math.sin(f / 6);
  const pantColor = new THREE.Color("#0a0d12").lerp(new THREE.Color("#7fc8ff"), e.encendida);
  const ledOn = e.led * (1 - e.cortado);

  return (
    <group>
      {/* tele */}
      <group position={[TX, 1.85, 0]}>
        <mesh geometry={marco} castShadow>
          <meshStandardMaterial color="#1a1e26" metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh geometry={pant} position={[0, 0, 0.09]}>
          <meshStandardMaterial color={pantColor} emissive={pantColor} emissiveIntensity={0.15 + 0.7 * e.encendida} roughness={0.15} />
        </mesh>
        {/* lucecita de espera */}
        <mesh position={[1.35, -0.92, 0.12]}>
          <sphereGeometry args={[0.07, 14, 12]} />
          <meshStandardMaterial color={ROJO} emissive={ROJO} emissiveIntensity={ledOn * (0.8 + 1.6 * pulso)} />
        </mesh>
        {ledOn > 0.05 && (
          <pointLight position={[1.35, -0.92, 0.5]} color={ROJO} intensity={ledOn * 1.2} distance={2.5} />
        )}
      </group>
      <mesh geometry={base} position={[TX, 0.04, 0]} castShadow>
        <meshStandardMaterial color="#2a2f3a" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[TX, 0.55, -0.02]}>
        <boxGeometry args={[0.18, 1.0, 0.14]} />
        <meshStandardMaterial color="#2a2f3a" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* cable y chispas que entran (se cortan con la zapatilla) */}
      {e.flujo > 0.02 &&
        Array.from({ length: 6 }, (_, i) => {
          const t = (f * 0.02 + i / 6) % 1;
          const x = TX - 2.6 + t * 2.6;
          return (
            <mesh key={i} position={[x, 0.12, 0.45]} scale={[1, 1, 1]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshStandardMaterial color={AMBAR} emissive={AMBAR} emissiveIntensity={1.2} transparent opacity={e.flujo * (1 - e.cortado)} />
            </mesh>
          );
        })}
      <mesh position={[TX - 1.3, 0.12, 0.45]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 2.6, 8]} />
        <meshStandardMaterial color="#444b58" roughness={0.6} />
      </mesh>

      {/* la luz de una casa: 20 cuadraditos */}
      {e.casa > 0.02 && (
        <group position={[2.0, 1.0, 0]} scale={[e.casa, e.casa, e.casa]}>
          {Array.from({ length: 20 }, (_, i) => {
            const col = i % 5;
            const fila = Math.floor(i / 5);
            const x = (col - 2) * 0.46;
            const y = fila * 0.46;
            const lit = i === 0 ? e.cinco : i <= 4 ? e.diez : 0;
            const color = new THREE.Color("#3a4252").lerp(new THREE.Color(AMBAR), lit);
            return (
              <mesh key={i} geometry={cel} position={[x, y, 0]} castShadow>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15 + 1.1 * lit} roughness={0.4} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* zapatilla con tecla */}
      {e.zapatilla > 0.02 && (
        <group position={[TX + 0.2, 0.12 + 0.0, 0.85]} scale={[e.zapatilla, e.zapatilla, e.zapatilla]}>
          <mesh geometry={tira} castShadow>
            <meshStandardMaterial color="#e8ebf0" roughness={0.5} />
          </mesh>
          <mesh position={[0.55, 0.11, 0.0]} rotation={[-0.35 + 0.7 * e.cortado, 0, 0]}>
            <boxGeometry args={[0.22, 0.06, 0.2]} />
            <meshStandardMaterial color={e.cortado > 0.5 ? "#4cd964" : ROJO} emissive={e.cortado > 0.5 ? "#4cd964" : ROJO} emissiveIntensity={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
};

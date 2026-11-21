import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Carga nocturna: un celular enchufado con una barra de batería vertical gigante (0..100), una luna y una marca del 80.
// Todo sale del estado. Piso en y = 0; el celular a la izquierda, la barra a la derecha.

export type EstadoCargaNoche = {
  frame: number;
  pct: number; // 0..100 nivel de la barra
  luna: number; // 0..1 aparece la luna (de noche)
  llena: number; // 0..1 la barra se pone naranja (muchas horas llena)
  marca80: number; // 0..1 aparece la línea del 80
  corte: number; // 0..1 cartel "deja de cargar" (destello verde en el enchufe)
  optimizada: number; // 0..1 la barra se frena en 80 y espera (halo verde)
};

const ALTO = 4.6;
const Y0 = 0.7;
const yDe = (p: number) => Y0 + (p / 100) * ALTO;
const VERDE = "#5ad17a";
const NARANJA = "#ff9a2e";
const AZUL = "#4aa8ff";

export const portadaCargaNoche = (): EstadoCargaNoche => ({ frame: 0, pct: 80, luna: 1, llena: 0, marca80: 1, corte: 0, optimizada: 1 });

export const CargaNoche: React.FC<{ e: EstadoCargaNoche }> = ({ e }) => {
  const f = e.frame;
  const cuerpo = useMemo(() => new RoundedBoxGeometry(1.5, 3.0, 0.18, 4, 0.14), []);
  const pantalla = useMemo(() => new RoundedBoxGeometry(1.36, 2.84, 0.02, 3, 0.1), []);
  const cable = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.5, 0.1), new THREE.Vector3(-0.8, -0.7, 0.1), new THREE.Vector3(-1.9, -0.7, 0)]),
        32,
        0.05,
        8
      ),
    []
  );
  const p = Math.max(0.5, Math.min(100, e.pct));
  const color = new THREE.Color(AZUL).lerp(new THREE.Color(NARANJA), e.llena).lerp(new THREE.Color(VERDE), e.optimizada);
  const pulso = 0.5 + 0.5 * Math.sin(f / 6);
  const luz = new THREE.Color("#14233f").lerp(color, 0.5);
  return (
    <group>
      {/* celular */}
      <group position={[-1.8, 1.7, 0]}>
        <mesh geometry={cuerpo} castShadow>
          <meshStandardMaterial color="#dfe3ea" metalness={0.75} roughness={0.25} />
        </mesh>
        <mesh geometry={pantalla} position={[0, 0, 0.1]}>
          <meshStandardMaterial color={luz} emissive={luz} emissiveIntensity={0.55} roughness={0.2} />
        </mesh>
        {/* nivel en la pantalla */}
        <mesh position={[0, -1.2 + 1.2 * Math.max(0.02, p / 100), 0.115]} scale={[1, Math.max(0.02, p / 100), 1]}>
          <boxGeometry args={[1.1, 2.4, 0.01]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>
      </group>
      {/* cable */}
      <group position={[-1.8, 0.18, 0]}>
        <mesh geometry={cable} castShadow>
          <meshStandardMaterial color="#f3f3f3" roughness={0.45} />
        </mesh>
        {e.corte > 0.01 && (
          <mesh position={[-1.9, -0.7, 0.05]} scale={[1 + 0.3 * pulso, 1 + 0.3 * pulso, 1]}>
            <sphereGeometry args={[0.18, 16, 12]} />
            <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.9} />
          </mesh>
        )}
      </group>
      {/* barra de batería gigante */}
      <group position={[1.6, 0, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.75, 0.85, 0.6, 32]} />
          <meshStandardMaterial color="#3a4254" roughness={0.5} />
        </mesh>
        <mesh position={[0, Y0 + ALTO / 2, 0]}>
          <boxGeometry args={[0.9, ALTO + 0.3, 0.5]} />
          <meshStandardMaterial color="#dfe9f7" transparent opacity={0.2} roughness={0.1} depthWrite={false} />
        </mesh>
        <mesh position={[0, Y0 + (p / 100) * ALTO * 0.5, 0]}>
          <boxGeometry args={[0.7, (p / 100) * ALTO, 0.34]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, Y0 + ALTO + 0.28, 0]}>
          <boxGeometry args={[0.3, 0.12, 0.2]} />
          <meshStandardMaterial color="#c9d3e4" />
        </mesh>
        {[0, 50, 100].map((m) => (
          <mesh key={m} position={[0.65, yDe(m), 0]}>
            <boxGeometry args={[0.3, 0.04, 0.04]} />
            <meshStandardMaterial color="#c9d3e4" />
          </mesh>
        ))}
        {e.marca80 > 0.01 && (
          <mesh position={[0.2, yDe(80), 0.05]} scale={[e.marca80, 1, 1]}>
            <boxGeometry args={[1.5, 0.07, 0.5]} />
            <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.8} transparent opacity={0.85} />
          </mesh>
        )}
      </group>
      {/* luna */}
      {e.luna > 0.01 && (
        <group position={[0.2, 6.3, -1]} scale={[e.luna, e.luna, e.luna]}>
          <mesh>
            <sphereGeometry args={[0.55, 24, 18]} />
            <meshStandardMaterial color="#fff6d6" emissive="#fff0b8" emissiveIntensity={0.7} />
          </mesh>
          <mesh position={[0.28, 0.12, 0.2]}>
            <sphereGeometry args={[0.5, 24, 18]} />
            <meshStandardMaterial color="#0b1220" />
          </mesh>
        </group>
      )}
    </group>
  );
};

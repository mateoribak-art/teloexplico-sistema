import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Mesada con una tabla de madera, un trozo de pollo crudo, un tomate y bacterias (puntitos verdes: ilustración).
// Se muestra: el pollo deja bacterias en la tabla, el tomate llega a la misma tabla y se contagia,
// aparece una segunda tabla (para lo que no se cocina), una cinta roja marca la del crudo,
// y los surcos / el jabón del "Ojo".
// Unidades: mesada en y = 0; tabla 1 centrada en x = 0; tabla 2 en x = 2.6.

export type EstadoTabla = {
  frame: number;
  pollo: number; // 0..1 el pollo crudo aparece sobre la tabla 1
  bacTabla: number; // 0..1 bacterias sobre la tabla 1
  tomate: number; // 0..1 el tomate llega a la tabla 1
  contagio: number; // 0..1 bacterias pasan al tomate
  tabla2: number; // 0..1 aparece la segunda tabla
  tomate2: number; // 0..1 el tomate pasa a la tabla 2 (limpio)
  jabon: number; // 0..1 burbujas de jabón sobre la tabla 1
  surcos: number; // 0..1 surcos marcados en la tabla 1
  cinta: number; // 0..1 cinta roja en la tabla del crudo
};

export const TablaVacia: EstadoTabla = { frame: 0, pollo: 0, bacTabla: 0, tomate: 0, contagio: 0, tabla2: 0, tomate2: 0, jabon: 0, surcos: 0, cinta: 0 };

const VERDE = "#8be04e";
const caja = (w: number, h: number, d: number, r = 0.05) => new RoundedBoxGeometry(w, h, d, 4, r);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const Bacteria: React.FC<{ p: [number, number, number]; r: number }> = ({ p, r }) => (
  <mesh position={p} scale={[1, 0.8, 1]}>
    <sphereGeometry args={[r, 10, 8]} />
    <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.55} roughness={0.4} />
  </mesh>
);

const TablaMadera: React.FC<{ escala?: number }> = ({ escala = 1 }) => {
  const g = useMemo(() => caja(2.6, 0.18, 1.7, 0.07), []);
  return (
    <group scale={escala}>
      <mesh geometry={g} position={[0, 0.09, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#c8935a" roughness={0.7} />
      </mesh>
      {/* orificio para colgar */}
      <mesh position={[1.05, 0.185, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.07, 16]} />
        <meshStandardMaterial color="#6b4524" roughness={0.9} />
      </mesh>
    </group>
  );
};

export const Tabla: React.FC<{ e: EstadoTabla }> = ({ e }) => {
  const f = e.frame;
  const mesada = useMemo(() => caja(8.2, 0.3, 3.2, 0.06), []);
  const bacs = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: (random(`tx${i}`) - 0.5) * 2.2,
        z: (random(`tz${i}`) - 0.5) * 1.3,
        r: 0.05 + random(`tr${i}`) * 0.035,
      })),
    []
  );
  const burbujas = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        x: (random(`jx${i}`) - 0.5) * 2.0,
        z: (random(`jz${i}`) - 0.5) * 1.1,
        r: 0.08 + random(`jr${i}`) * 0.1,
        fase: random(`jf${i}`) * 6.28,
        vel: 0.4 + random(`jv${i}`) * 0.6,
      })),
    []
  );
  const nBac = Math.round(e.bacTabla * bacs.length);
  const tomX = e.tomate2 > 0 ? lerp(0.1, 2.8, e.tomate2) : lerp(4.2, 0.1, e.tomate);
  const tomY = 0.18 + 0.3 + (e.tomate2 > 0 ? Math.sin(Math.min(1, e.tomate2) * Math.PI) * 0.5 : Math.sin(Math.min(1, e.tomate) * Math.PI) * 0.5);
  const tomVisible = e.tomate > 0.02;
  return (
    <group>
      <mesh geometry={mesada} position={[0, -0.15, 0]} receiveShadow>
        <meshStandardMaterial color="#cfd6e0" roughness={0.45} metalness={0.05} />
      </mesh>

      {/* tabla 1 (la del crudo) */}
      <group position={[-0.6, 0, 0]}>
        <TablaMadera />
        {/* surcos */}
        {e.surcos > 0.02 &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} position={[-0.9 + i * 0.36, 0.19, ((i * 5) % 7) * 0.1 - 0.3]} rotation={[-Math.PI / 2, 0, 0.5 + (i % 3) * 0.6]}>
              <planeGeometry args={[0.7 * e.surcos, 0.035]} />
              <meshBasicMaterial color="#3a2210" />
            </mesh>
          ))}
        {/* cinta roja */}
        {e.cinta > 0.02 && (
          <mesh position={[0.95 - (1 - e.cinta) * 0.0, 0.19, 0]} scale={[1, 1, e.cinta]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.32, 1.7]} />
            <meshBasicMaterial color="#ff4b4b" />
          </mesh>
        )}
        {/* pollo crudo */}
        {e.pollo > 0.02 && (
          <group position={[-0.5, 0.18 + (1 - e.pollo) * 1.2, 0]} scale={e.pollo}>
            <mesh position={[0, 0.2, 0]} scale={[1.0, 0.42, 0.62]} castShadow>
              <sphereGeometry args={[0.6, 32, 22]} />
              <meshStandardMaterial color="#efb7a3" roughness={0.55} />
            </mesh>
            <mesh position={[0.32, 0.16, 0.08]} scale={[0.6, 0.32, 0.45]} castShadow>
              <sphereGeometry args={[0.45, 24, 18]} />
              <meshStandardMaterial color="#efb7a3" roughness={0.55} />
            </mesh>
          </group>
        )}
        {/* bacterias en la tabla */}
        {bacs.slice(0, nBac).map((b, i) => (
          <Bacteria key={i} p={[b.x, 0.22, b.z]} r={b.r} />
        ))}
        {/* burbujas de jabón */}
        {e.jabon > 0.02 &&
          burbujas.slice(0, Math.round(e.jabon * burbujas.length)).map((b, i) => {
            const t = (f * 0.012 * b.vel + b.fase) % 1;
            return (
              <mesh key={i} position={[b.x + Math.sin(f / 20 + b.fase) * 0.06, 0.3 + t * 1.1, b.z]}>
                <sphereGeometry args={[b.r, 20, 14]} />
                <meshStandardMaterial color="#eaf6ff" transparent opacity={0.4} roughness={0.05} metalness={0.2} emissive="#9fd4ff" emissiveIntensity={0.2} depthWrite={false} />
              </mesh>
            );
          })}
      </group>

      {/* tabla 2 (para lo que no se cocina) */}
      {e.tabla2 > 0.02 && (
        <group position={[2.8, (1 - e.tabla2) * 1.5, 0]} scale={0.9}>
          <TablaMadera />
          <mesh position={[0, 0.0, 0]} />
        </group>
      )}

      {/* tomate */}
      {tomVisible && (
        <group position={[tomX, tomY, 0.1]}>
          <mesh castShadow>
            <sphereGeometry args={[0.38, 28, 20]} />
            <meshStandardMaterial color="#e5412d" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.36, 0]} scale={[1, 0.4, 1]}>
            <sphereGeometry args={[0.16, 14, 10]} />
            <meshStandardMaterial color="#3e9b3a" roughness={0.8} />
          </mesh>
          {e.contagio > 0.02 &&
            e.tomate2 < 0.5 &&
            [0, 1, 2, 3, 4].map((i) => (
              <Bacteria key={i} p={[Math.cos(i * 1.3) * 0.34, 0.1 + (i % 2) * 0.12, Math.sin(i * 1.3) * 0.34]} r={0.055 * e.contagio} />
            ))}
        </group>
      )}
    </group>
  );
};

export const _THREE = THREE;

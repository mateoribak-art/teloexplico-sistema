import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Auto de costado con el capó transparente: se ve el motor (frío azul → caliente naranja), el escape con humo
// y un frasco que se llena con el combustible que gasta parado. Todo sale del frame: sin useFrame.
// Unidades: piso en y = 0; el auto mide 4,2 de largo, centrado en x = 0, frente hacia +x.

export type EstadoAutoMotor = {
  frame: number;
  vibra: number; // 0..1 el auto parado con el motor andando (vibra)
  humo: number; // 0..1 humo por el escape
  motor: number; // 0..1 temperatura del motor (azul → naranja)
  rueda: number; // 0..1 el auto anda (ruedas giran, rayas del piso corren)
  frasco: number; // 0..1 nivel del frasco de combustible gastado (aparece si > 0)
  frascoOn: number; // 0..1 aparece el frasco
  capo: number; // 0..1 capó transparente (muestra el motor)
};

const caja = (w: number, h: number, d: number, r = 0.05) => new RoundedBoxGeometry(w, h, d, 3, r);

const Rueda: React.FC<{ x: number; giro: number }> = ({ x, giro }) => (
  <group position={[x, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.42, 0.42, 1.62, 28]} />
      <meshStandardMaterial color="#14161c" roughness={0.8} />
    </mesh>
    {[-1, 1].map((s) => (
      <group key={s} position={[0, s * 0.82, 0]} rotation={[0, giro, 0]}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.24, 0.02, 24]} />
          <meshStandardMaterial color="#aab3c2" metalness={0.8} roughness={0.3} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, s * 0.02, 0]} rotation={[0, (i * Math.PI) / 4, 0]}>
            <boxGeometry args={[0.46, 0.02, 0.05]} />
            <meshStandardMaterial color="#5c6577" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

export const AutoMotor: React.FC<{ e: EstadoAutoMotor }> = ({ e }) => {
  const f = e.frame;
  const gCarro = useMemo(() => caja(4.2, 0.85, 1.7, 0.2), []);
  const gCabina = useMemo(() => caja(2.2, 0.8, 1.62, 0.3), []);
  const gBloque = useMemo(() => caja(0.95, 0.5, 0.8, 0.1), []);
  const vib = Math.sin(f * 1.7) * 0.012 * e.vibra;
  const colorMotor = new THREE.Color().lerpColors(new THREE.Color("#58c8ff"), new THREE.Color("#ff7a2e"), e.motor);
  const giro = -f * 0.5 * e.rueda;

  return (
    <group>
      {/* rayas del piso que corren cuando el auto anda */}
      {e.rueda > 0.01 &&
        Array.from({ length: 8 }, (_, i) => {
          const t = (((i / 8 - f * 0.012) % 1) + 1) % 1;
          return (
            <mesh key={i} position={[-5 + t * 10, 0.01, 1.4]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.7, 0.07]} />
              <meshBasicMaterial color="#c9d3e6" transparent opacity={0.55 * e.rueda} depthWrite={false} />
            </mesh>
          );
        })}

      <group position={[0, vib, 0]}>
        <mesh geometry={gCarro} position={[0, 0.78, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#c8cfdc" roughness={0.3} metalness={0.7} transparent opacity={1 - e.capo * 0.55} depthWrite={e.capo < 0.5} />
        </mesh>
        <mesh geometry={gCabina} position={[-0.5, 1.5, 0]}>
          <meshStandardMaterial color="#3a4a66" roughness={0.1} metalness={0.3} transparent opacity={0.28} depthWrite={false} />
        </mesh>
        <mesh position={[-0.5, 1.92, 0]}>
          <boxGeometry args={[2.1, 0.06, 1.5]} />
          <meshStandardMaterial color="#aab3c6" roughness={0.35} metalness={0.7} />
        </mesh>
        {/* luces */}
        {[0.5, -0.5].map((z) => (
          <mesh key={z} position={[2.12, 0.85, z]}>
            <boxGeometry args={[0.06, 0.14, 0.3]} />
            <meshBasicMaterial color="#fff3c0" />
          </mesh>
        ))}
        {[0.5, -0.5].map((z) => (
          <mesh key={z} position={[-2.12, 0.85, z]}>
            <boxGeometry args={[0.06, 0.14, 0.3]} />
            <meshBasicMaterial color="#ff3b3b" />
          </mesh>
        ))}

        {/* motor adentro del capó */}
        <group position={[1.5, 1.05, 0]}>
          <mesh geometry={gBloque} castShadow>
            <meshStandardMaterial color={colorMotor} emissive={colorMotor} emissiveIntensity={0.1 + e.motor * 0.6} roughness={0.45} metalness={0.4} />
          </mesh>
          {[-0.3, -0.1, 0.1, 0.3].map((x) => (
            <mesh key={x} position={[x, 0.34, 0]}>
              <boxGeometry args={[0.12, 0.2, 0.7]} />
              <meshStandardMaterial color="#8d97ab" metalness={0.7} roughness={0.35} />
            </mesh>
          ))}
          <mesh position={[0.52, 0, 0]}>
            <sphereGeometry args={[0.18, 18, 14]} />
            <meshStandardMaterial color="#2a3142" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>

        <Rueda x={-1.3} giro={giro} />
        <Rueda x={1.3} giro={giro} />

        {/* escape: caño y humo */}
        <mesh position={[-2.2, 0.38, 0.45]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.3, 14]} />
          <meshStandardMaterial color="#6d7690" metalness={0.8} roughness={0.35} />
        </mesh>
        {e.humo > 0.02 &&
          Array.from({ length: 12 }, (_, i) => {
            const t = (f * 0.022 + i / 12) % 1;
            return (
              <mesh key={i} position={[-2.4 - t * 1.9, 0.4 + t * 0.9 + random(`hy${i}`) * 0.1, 0.45 + (random(`hz${i}`) - 0.5) * 0.3]} scale={0.5 + t * 1.6}>
                <sphereGeometry args={[0.16, 12, 10]} />
                <meshBasicMaterial color="#8d97a8" transparent opacity={Math.sin(Math.PI * t) * 0.5 * e.humo} depthWrite={false} />
              </mesh>
            );
          })}
      </group>

      {/* frasco con el combustible que se va gastando */}
      {e.frascoOn > 0.01 && (
        <group position={[3.4, 0, 0.6]} scale={e.frascoOn}>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 1.8, 28, 1, true]} />
            <meshStandardMaterial color="#cfe6ff" transparent opacity={0.22} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.04, 28]} />
            <meshStandardMaterial color="#cfe6ff" transparent opacity={0.4} />
          </mesh>
          <mesh position={[0, 0.04 + (1.7 * e.frasco) / 2, 0]} scale={[1, Math.max(0.001, e.frasco), 1]}>
            <cylinderGeometry args={[0.5, 0.5, 1.7, 28]} />
            <meshStandardMaterial color="#ffb02e" emissive="#ff9a2e" emissiveIntensity={0.55} transparent opacity={0.9} />
          </mesh>
          {e.frasco > 0.01 &&
            e.frasco < 0.99 &&
            [0, 1].map((i) => {
              const t = (f * 0.05 + i * 0.5) % 1;
              return (
                <mesh key={i} position={[0, 2.6 - t * 0.7, 0]}>
                  <sphereGeometry args={[0.07, 10, 8]} />
                  <meshBasicMaterial color="#ffb02e" />
                </mesh>
              );
            })}
        </group>
      )}
    </group>
  );
};

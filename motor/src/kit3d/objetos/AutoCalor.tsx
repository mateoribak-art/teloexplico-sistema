import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Auto de costado (oscuro, al sol) con un perro adentro, termómetro grande al lado y sol que pega.
// Todo sale del frame: sin useFrame. Unidades: piso en y = 0; el auto mide 4,2 de largo, centrado en x = 0.

export type EstadoAutoCalor = {
  frame: number;
  sol: number; // 0..1 aparece el sol y los rayos
  calor: number; // 0..1 interior rojizo + ondas
  ventana: number; // 0..1 (1 = entreabierta)
  perro: number; // 0..1 aparece el perro
  jadeo: number; // 0..1 el perro jadea (se mueve rápido)
  termo: number; // 0..1 columna del termómetro
  termoOn: number; // 0..1 aparece el termómetro
  puertaFuera: number; // 0..1 el perro sale con el dueño (se va hacia la derecha)
};

const caja = (w: number, h: number, d: number, r = 0.05) => new RoundedBoxGeometry(w, h, d, 3, r);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const Rueda: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.42, 0.42, 1.62, 28]} />
      <meshStandardMaterial color="#14161c" roughness={0.8} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[0, s * 0.82, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.02, 24]} />
        <meshStandardMaterial color="#aab3c2" metalness={0.8} roughness={0.3} />
      </mesh>
    ))}
  </group>
);

const Perro: React.FC<{ t: number; jadeo: number; frame: number }> = ({ t, jadeo, frame }) => {
  const cuerpo = useMemo(() => caja(0.9, 0.46, 0.4, 0.14), []);
  if (t <= 0.01) return null;
  const j = Math.sin(frame / 2.2) * 0.04 * jadeo;
  return (
    <group scale={t}>
      <mesh geometry={cuerpo} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="#d9a05b" roughness={0.8} />
      </mesh>
      {/* cabeza */}
      <group position={[0.58, 0.32 + j, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.27, 24, 18]} />
          <meshStandardMaterial color="#e2ac68" roughness={0.8} />
        </mesh>
        <mesh position={[0.2, -0.06, 0]} castShadow>
          <boxGeometry args={[0.24, 0.17, 0.2]} />
          <meshStandardMaterial color="#efc58f" roughness={0.8} />
        </mesh>
        <mesh position={[0.33, 0.0, 0]}>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshStandardMaterial color="#1a1a1e" roughness={0.4} />
        </mesh>
        {/* lengua afuera cuando jadea */}
        <mesh position={[0.28 + 0.0, -0.2 - 0.08 * jadeo - j * 2, 0]} scale={[1, 0.3 + jadeo * 1.1, 1]}>
          <boxGeometry args={[0.1, 0.16, 0.08]} />
          <meshStandardMaterial color="#ff6f8a" roughness={0.5} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[-0.08, 0.04, s * 0.2]} rotation={[s * 0.4, 0, 0.5]} castShadow>
            <boxGeometry args={[0.14, 0.3, 0.07]} />
            <meshStandardMaterial color="#9c6a34" roughness={0.8} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.26, 0.09, s * 0.09]}>
            <sphereGeometry args={[0.032, 10, 8]} />
            <meshBasicMaterial color="#111" />
          </mesh>
        ))}
      </group>
      {/* patas y cola */}
      {[-0.32, 0.32].flatMap((x) => [-0.13, 0.13].map((z) => ({ x, z }))).map((p, i) => (
        <mesh key={i} position={[p.x, -0.32, p.z]} castShadow>
          <boxGeometry args={[0.13, 0.3, 0.13]} />
          <meshStandardMaterial color="#c58f4d" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[-0.55, 0.22, 0]} rotation={[0, 0, 0.9 + Math.sin(frame / 9) * 0.1]}>
        <boxGeometry args={[0.36, 0.09, 0.09]} />
        <meshStandardMaterial color="#c58f4d" roughness={0.8} />
      </mesh>
    </group>
  );
};

const Termometro: React.FC<{ v: number; on: number }> = ({ v, on }) => {
  if (on <= 0.01) return null;
  const alto = 3.0;
  const color = new THREE.Color().lerpColors(new THREE.Color("#58c8ff"), new THREE.Color("#ff3b2f"), Math.min(1, v * 1.2));
  return (
    <group position={[3.1, 0.2, 0.9]} scale={on}>
      <mesh position={[0, alto / 2 + 0.3, 0]} castShadow>
        <boxGeometry args={[0.46, alto, 0.22]} />
        <meshStandardMaterial color="#e9eef7" roughness={0.3} emissive="#8aa0c4" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.4, 24, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 0.3 + (alto * (0.15 + 0.85 * v)) / 2, 0.12]}>
        <boxGeometry args={[0.2, alto * (0.15 + 0.85 * v), 0.08]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0.3, 0.9 + i * 0.34, 0.1]}>
          <boxGeometry args={[0.12, 0.03, 0.03]} />
          <meshBasicMaterial color="#20283a" />
        </mesh>
      ))}
    </group>
  );
};

export const AutoCalor: React.FC<{ e: EstadoAutoCalor }> = ({ e }) => {
  const f = e.frame;
  const gCarro = useMemo(() => caja(4.2, 0.85, 1.7, 0.2), []);
  const gCabina = useMemo(() => caja(2.4, 0.8, 1.62, 0.3), []);
  const salidaX = lerp(0, 3.6, e.puertaFuera);
  const rojo = new THREE.Color().lerpColors(new THREE.Color("#8ec9ff"), new THREE.Color("#ff4a2a"), e.calor);

  return (
    <group>
      {/* sol */}
      {e.sol > 0.01 && (
        <group position={[-2.6, 5.4, -1]} scale={e.sol}>
          <mesh>
            <sphereGeometry args={[0.6, 28, 20]} />
            <meshBasicMaterial color="#ffd23f" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.95, 24, 18]} />
            <meshBasicMaterial color="#ffb02e" transparent opacity={0.25} depthWrite={false} />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => {
            const t = (f * 0.03 + i / 7) % 1;
            return (
              <mesh key={i} position={[1.0 + t * 2.0, -0.7 - t * 2.9 + (i - 3) * 0.12, 0.3 + (i - 3) * 0.1]} rotation={[0, 0, -1.05]} scale={Math.sin(Math.PI * t)}>
                <boxGeometry args={[0.6, 0.06, 0.06]} />
                <meshBasicMaterial color="#ffd23f" transparent opacity={0.9} depthWrite={false} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* auto */}
      <group position={[0, 0, 0]}>
        <mesh geometry={gCarro} position={[0, 0.78, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#1c2230" roughness={0.35} metalness={0.7} />
        </mesh>
        <mesh geometry={gCabina} position={[-0.1, 1.5, 0]}>
          <meshStandardMaterial color="#3a4a66" roughness={0.1} metalness={0.3} transparent opacity={0.22} depthWrite={false} />
        </mesh>
        {/* techo */}
        <mesh position={[-0.1, 1.92, 0]}>
          <boxGeometry args={[2.3, 0.06, 1.5]} />
          <meshStandardMaterial color="#222a3b" roughness={0.35} metalness={0.7} />
        </mesh>
        {/* vidrio de costado: marco oscuro + vidrio transparente con tinte de calor */}
        <mesh position={[-0.1, 1.55, 0.83]}>
          <boxGeometry args={[2.1, 0.55, 0.03]} />
          <meshStandardMaterial color={rojo} transparent opacity={0.32 + e.calor * 0.16} roughness={0.05} emissive={rojo} emissiveIntensity={0.15 + e.calor * 0.85} depthWrite={false} />
        </mesh>
        {/* interior: volumen de calor */}
        <mesh position={[-0.1, 1.5, 0]}>
          <boxGeometry args={[2.0, 0.55, 1.4]} />
          <meshBasicMaterial color={rojo} transparent opacity={0.1 + e.calor * 0.3} depthWrite={false} />
        </mesh>
        {/* ventana entreabierta: franja negra arriba del vidrio */}
        {e.ventana > 0.01 && (
          <mesh position={[0.3, 1.8, 0.83]} scale={[1, e.ventana, 1]}>
            <boxGeometry args={[0.9, 0.08, 0.04]} />
            <meshBasicMaterial color="#05070c" />
          </mesh>
        )}
        {/* luces y detalles */}
        <mesh position={[2.12, 0.85, 0.5]}>
          <boxGeometry args={[0.06, 0.14, 0.3]} />
          <meshBasicMaterial color="#fff3c0" />
        </mesh>
        <mesh position={[2.12, 0.85, -0.5]}>
          <boxGeometry args={[0.06, 0.14, 0.3]} />
          <meshBasicMaterial color="#fff3c0" />
        </mesh>
        <mesh position={[-2.12, 0.85, 0.5]}>
          <boxGeometry args={[0.06, 0.14, 0.3]} />
          <meshBasicMaterial color="#ff3b3b" />
        </mesh>
        <Rueda x={-1.3} />
        <Rueda x={1.3} />
        {/* perro adentro (o saliendo con el dueño) */}
        <group position={[lerp(-0.2, salidaX, e.puertaFuera), lerp(1.4, 0.95, e.puertaFuera), 0.15]} scale={0.8}>
          <Perro t={e.perro} jadeo={e.jadeo} frame={f} />
        </group>
        {/* ondas de calor sobre el techo */}
        {e.calor > 0.05 &&
          Array.from({ length: 8 }, (_, i) => {
            const t = (f * (0.016 + random(`oc${i}`) * 0.01) + random(`of${i}`)) % 1;
            return (
              <mesh key={i} position={[-1.0 + random(`ox${i}`) * 1.8, 2.0 + t * 1.3, (random(`oz${i}`) - 0.5) * 0.8]} scale={0.7 + t}>
                <sphereGeometry args={[0.16, 10, 8]} />
                <meshBasicMaterial color="#ff7a3a" transparent opacity={Math.sin(Math.PI * t) * 0.4 * e.calor} depthWrite={false} />
              </mesh>
            );
          })}
      </group>

      <Termometro v={e.termo} on={e.termoOn} />
    </group>
  );
};

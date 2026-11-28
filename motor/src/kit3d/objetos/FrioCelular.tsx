import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Celular parado con barra de batería en la pantalla, copos de nieve, termómetro con la franja segura (32–95 °F)
// y un autito estacionado tachado. Todo sale del frame. Piso en y = 0, celular centrado en x = 0.

export type EstadoFrioCelular = {
  frame: number;
  frio: number; // 0..1 copos y tinte azul
  bateria: number; // 0..1 nivel de la barra (0.4 = 40 %)
  apagado: number; // 0..1 pantalla negra
  termo: number; // 0..1 aparece el termómetro con la franja
  nivel: number; // 0..1 posición del mercurio (0 = muy frío, 1 = muy caliente)
  calido: number; // 0..1 vuelve el calor: pantalla se enciende y la barra sube
  auto: number; // 0..1 aparece el auto tachado
};

const ALTO = 2.2;
const ANCHO = 1.1;
const Y = 1.25;

export const FrioCelular: React.FC<{ e: EstadoFrioCelular }> = ({ e }) => {
  const f = e.frame;
  const cuerpo = useMemo(() => new RoundedBoxGeometry(ANCHO, ALTO, 0.14, 4, 0.12), []);
  const pantalla = useMemo(() => new RoundedBoxGeometry(ANCHO - 0.1, ALTO - 0.1, 0.02, 3, 0.08), []);
  const copos = useMemo(
    () => Array.from({ length: 34 }, (_, i) => ({ x: (random(`cx${i}`) - 0.5) * 6, z: (random(`cz${i}`) - 0.5) * 2.5, v: 0.006 + random(`cv${i}`) * 0.006, fase: random(`cf${i}`), s: 0.04 + random(`cs${i}`) * 0.05 })),
    []
  );
  const nCopos = Math.round(e.frio * copos.length);
  const apag = Math.min(1, Math.max(0, e.apagado * (1 - e.calido)));
  const nivelBat = e.bateria * (1 - e.apagado) + (e.calido > 0 ? Math.min(1, 0.4 + 0.5 * e.calido) * e.calido : 0);
  const colorPant = new THREE.Color("#14233f").lerp(new THREE.Color("#050607"), apag);
  const bat = Math.min(1, Math.max(0, e.apagado > 0.5 && e.calido <= 0 ? 0 : nivelBat));
  const colorBat = new THREE.Color(bat < 0.5 ? "#ff6b4a" : "#4ade80");
  const tinte = new THREE.Color("#dfe3ea").lerp(new THREE.Color("#9fd3ff"), e.frio * (1 - e.calido));
  const tempY = (t: number) => 0.2 + t * 3.0; // altura en el termómetro
  const verde0 = 0.27; // 32 °F ≈ lo normal de la escala dibujada
  const verde1 = 0.78; // 95 °F
  return (
    <group>
      <group position={[0, Y, 0]}>
        <mesh geometry={cuerpo} castShadow receiveShadow>
          <meshStandardMaterial color={tinte} metalness={0.75} roughness={0.25} />
        </mesh>
        <mesh geometry={pantalla} position={[0, 0, 0.075]}>
          <meshStandardMaterial color={colorPant} emissive={colorPant} emissiveIntensity={0.55 * (1 - apag)} roughness={0.2} />
        </mesh>
        {/* barra de batería */}
        {apag < 0.9 && (
          <group position={[0, 0.2, 0.095]}>
            <mesh>
              <boxGeometry args={[0.8, 0.36, 0.01]} />
              <meshStandardMaterial color="#0b1424" />
            </mesh>
            <mesh position={[-0.38 + (0.76 * bat) / 2, 0, 0.01]}>
              <boxGeometry args={[Math.max(0.001, 0.76 * bat), 0.3, 0.01]} />
              <meshStandardMaterial color={colorBat} emissive={colorBat} emissiveIntensity={0.7} />
            </mesh>
          </group>
        )}
      </group>
      {/* copos */}
      {copos.slice(0, nCopos).map((c, i) => {
        const t = (f * c.v + c.fase) % 1;
        return (
          <mesh key={i} position={[c.x + Math.sin(f / 12 + i) * 0.1, 4.6 - t * 4.6, c.z]}>
            <sphereGeometry args={[c.s, 8, 6]} />
            <meshBasicMaterial color="#eaf6ff" transparent opacity={0.85} />
          </mesh>
        );
      })}
      {/* termómetro */}
      {e.termo > 0.01 && (
        <group position={[1.35, 0, 0.2]} scale={[e.termo * 0.7, e.termo * 0.7, e.termo * 0.7]}>
          <mesh position={[0, tempY(0.5), 0]}>
            <boxGeometry args={[0.32, 3.4, 0.12]} />
            <meshStandardMaterial color="#e9edf3" roughness={0.3} />
          </mesh>
          <mesh position={[0, (tempY(verde0) + tempY(verde1)) / 2, 0.07]}>
            <boxGeometry args={[0.2, tempY(verde1) - tempY(verde0), 0.02]} />
            <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, (0.2 + tempY(e.nivel)) / 2 - 0.1, 0.09]}>
            <boxGeometry args={[0.1, Math.max(0.05, tempY(e.nivel) - 0.2 + 0.2), 0.02]} />
            <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}
      {/* auto estacionado tachado */}
      {e.auto > 0.01 && (
        <group position={[-1.75, 0, 0.2]} scale={[e.auto * 0.65, e.auto * 0.65, e.auto * 0.65]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.8, 0.5, 0.8]} />
            <meshStandardMaterial color="#8d97a5" roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[-0.1, 0.9, 0]} castShadow>
            <boxGeometry args={[1.0, 0.4, 0.74]} />
            <meshStandardMaterial color="#a9b3c1" roughness={0.4} metalness={0.4} />
          </mesh>
          {[-0.6, 0.6].map((x) => (
            <mesh key={x} position={[x, 0.2, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.1, 20]} />
              <meshStandardMaterial color="#222a36" />
            </mesh>
          ))}
          <group position={[0, 0.7, 0.55]}>
            {[Math.PI / 4, -Math.PI / 4].map((a) => (
              <mesh key={a} rotation={[0, 0, a]}>
                <boxGeometry args={[1.5, 0.16, 0.08]} />
                <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={0.6} />
              </mesh>
            ))}
          </group>
        </group>
      )}
    </group>
  );
};

import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Celular parado (pantalla hacia la cámara) con cable, tazón de arroz, gotas, viento y reloj de pared.
// Todo sale del frame. El piso está en y = 0; el celular está centrado en x = 0, el tazón a la derecha, el reloj a la izquierda.

export type EstadoCelular = {
  frame: number;
  alerta: number; // 0..1 pantalla con el aviso de líquido (rojo)
  arroz: number; // 0..1 aparece el tazón de arroz
  tacho: number; // 0..1 cruz roja sobre el tazón
  granos: number; // 0..1 granos de arroz que entran al celular
  cable: number; // 0..1 enchufado (1) → desenchufado (0)
  inclinar: number; // 0..1 el celular se inclina y golpea despacito
  gotas: number; // 0..1 gotas que caen del conector
  aire: number; // 0..1 corriente de aire suave
  reloj: number; // 0..1 aparece el reloj
  minutos: number; // 0..1 avance de la manecilla (0 → 30 min)
  fantasma: number; // 0..1 el celular se vuelve transparente por dentro
  secador: number; // 0..1 secador/aire comprimido tachado
};

export const CELULAR = { ancho: 1.1, alto: 2.2, grosor: 0.14, y: 1.25 };

const Cruz: React.FC<{ s: number }> = ({ s }) => (
  <group scale={[s, s, s]}>
    {[Math.PI / 4, -Math.PI / 4].map((a) => (
      <mesh key={a} rotation={[0, 0, a]}>
        <boxGeometry args={[1.5, 0.2, 0.1]} />
        <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={0.6} />
      </mesh>
    ))}
  </group>
);

export const Celular: React.FC<{ e: EstadoCelular }> = ({ e }) => {
  const f = e.frame;
  const cuerpo = useMemo(() => new RoundedBoxGeometry(CELULAR.ancho, CELULAR.alto, CELULAR.grosor, 4, 0.12), []);
  const pantalla = useMemo(() => new RoundedBoxGeometry(CELULAR.ancho - 0.1, CELULAR.alto - 0.1, 0.02, 3, 0.08), []);
  const tazon = useMemo(
    () =>
      new THREE.LatheGeometry(
        [[0, 0], [0.45, 0], [0.8, 0.35], [0.95, 0.62], [0.9, 0.64]].map(([x, y]) => new THREE.Vector2(x, y)),
        48
      ),
    []
  );
  const cable = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.35, 0.05), new THREE.Vector3(-0.5, -0.5, 0.1), new THREE.Vector3(-1.5, -0.55, 0.0)]),
        32,
        0.045,
        8
      ),
    []
  );
  const pasto = useMemo(
    () => Array.from({ length: 46 }, (_, i) => ({ x: (random(`ax${i}`) - 0.5) * 1.3, z: (random(`az${i}`) - 0.5) * 1.3, g: random(`ag${i}`) * 3 })),
    []
  );
  const entran = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({ v: 0.012 + random(`ev${i}`) * 0.006, fase: random(`ef${i}`), dy: (random(`ey${i}`) - 0.5) * 0.9, dz: (random(`ez${i}`) - 0.5) * 0.04 })),
    []
  );
  const gotas = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({ x: (random(`gx${i}`) - 0.5) * 0.5, v: 0.03 + random(`gv${i}`) * 0.015, fase: random(`gf${i}`) })),
    []
  );
  const viento = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({ y: 0.3 + random(`wy${i}`) * 2.6, z: (random(`wz${i}`) - 0.5) * 1.4, v: 0.012 + random(`wv${i}`) * 0.008, fase: random(`wf${i}`), l: 0.5 + random(`wl${i}`) * 0.6 })),
    []
  );

  const op = 1 - 0.75 * e.fantasma;
  const gol = Math.sin(f / 4) * 0.5 + 0.5;
  // el golpecito: vaivén corto de inclinación alrededor del pie del celular
  const giro = e.inclinar * (0.28 + 0.07 * Math.sin(f / 3.2));
  const nG = Math.round(e.granos * entran.length);
  const nGo = Math.round(e.gotas * gotas.length);
  const arrozEsc = e.arroz;
  const rojo = new THREE.Color("#ff3b30");
  const azul = new THREE.Color("#14233f");
  const colorPant = azul.clone().lerp(rojo, e.alerta * (0.65 + 0.2 * Math.sin(f / 5)));
  const cableX = (1 - e.cable) * -0.9;
  const cableY = (1 - e.cable) * -0.25;
  return (
    <group>
      {/* celular */}
      <group position={[0, CELULAR.y, 0]} rotation={[0, 0, giro]}>
        <mesh geometry={cuerpo} castShadow receiveShadow>
          <meshStandardMaterial key={op < 1 ? "t" : "o"} color="#dfe3ea" metalness={0.75} roughness={0.25} transparent={op < 1} opacity={op} depthWrite={op >= 1} />
        </mesh>
        <mesh geometry={pantalla} position={[0, 0, CELULAR.grosor / 2 + 0.005]}>
          <meshStandardMaterial color={colorPant} emissive={colorPant} emissiveIntensity={0.55 + 0.35 * e.alerta} roughness={0.2} transparent={op < 1} opacity={Math.max(op, 0.35)} />
        </mesh>
        {/* conector abajo */}
        <mesh position={[0, -CELULAR.alto / 2 - 0.005, 0]}>
          <boxGeometry args={[0.2, 0.03, 0.06]} />
          <meshStandardMaterial color="#222a36" />
        </mesh>
        {/* placa interior visible con transparencia */}
        {e.fantasma > 0.02 && (
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.85, 1.7, 0.03]} />
            <meshStandardMaterial color="#2c9f5b" emissive="#2c9f5b" emissiveIntensity={0.25} roughness={0.5} />
          </mesh>
        )}
        {/* granos de arroz que se meten por el conector */}
        {entran.slice(0, nG).map((g, i) => {
          const t = (f * g.v + g.fase) % 1;
          const x = 2.1 * (1 - t) * (1 - t) * 0 + (1 - t) * 1.6;
          return (
            <mesh key={i} position={[x * 0.6, -0.9 - t * 0.0 + (1 - t) * 0.9 + g.dy * (1 - t), g.dz]} rotation={[0, 0, f / 10 + i]} scale={[1, 0.45, 0.45]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshStandardMaterial color="#fff5d6" emissive="#ffe9a8" emissiveIntensity={0.35} roughness={0.4} />
            </mesh>
          );
        })}
        {/* gotas */}
        {gotas.slice(0, nGo).map((g, i) => {
          const t = (f * g.v + g.fase) % 1;
          return (
            <mesh key={i} position={[g.x * 0.2, -CELULAR.alto / 2 - 0.05 - t * 1.0, 0.02]} scale={[0.7, 1.2 - 0.2 * gol, 0.7]}>
              <sphereGeometry args={[0.045, 10, 8]} />
              <meshStandardMaterial color="#6fc0ff" transparent opacity={0.8 * (1 - t)} roughness={0.05} depthWrite={false} />
            </mesh>
          );
        })}
      </group>
      {/* cable (se desenchufa y se va para el costado) */}
      <group position={[cableX, CELULAR.y - CELULAR.alto / 2 - 0.02 + cableY, 0]}>
        <mesh geometry={cable} castShadow>
          <meshStandardMaterial color="#f3f3f3" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.0, 0]}>
          <boxGeometry args={[0.16, 0.12, 0.06]} />
          <meshStandardMaterial color="#c9d1db" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      {/* tazón de arroz */}
      {arrozEsc > 0.01 && (
        <group position={[2.2, 0, 0.2]} scale={[arrozEsc, arrozEsc, arrozEsc]}>
          <mesh geometry={tazon} castShadow receiveShadow>
            <meshStandardMaterial color="#e9edf3" roughness={0.3} metalness={0.15} side={THREE.DoubleSide} />
          </mesh>
          {pasto.map((g, i) => (
            <mesh key={i} position={[g.x * 0.62, 0.62 + 0.04 * Math.sin(g.g * 3), g.z * 0.62]} rotation={[g.g, g.g * 2, g.g]} scale={[1, 0.4, 0.4]}>
              <sphereGeometry args={[0.07, 8, 6]} />
              <meshStandardMaterial color="#fff5d6" roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.8, 32]} />
            <meshStandardMaterial color="#f4ead0" roughness={0.7} />
          </mesh>
          {e.tacho > 0.01 && (
            <group position={[0, 1.5, 0.3]} scale={[e.tacho, e.tacho, e.tacho]}>
              <Cruz s={0.9} />
            </group>
          )}
        </group>
      )}
      {/* secador / aire comprimido tachado */}
      {e.secador > 0.01 && (
        <group position={[-2.3, 2.4, 0.2]} scale={[e.secador, e.secador, e.secador]}>
          <mesh rotation={[0, 0, 0.25]} castShadow>
            <boxGeometry args={[0.9, 0.38, 0.38]} />
            <meshStandardMaterial color="#a9b3c1" roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[-0.2, -0.45, 0]} rotation={[0, 0, 0.25]} castShadow>
            <boxGeometry args={[0.2, 0.55, 0.22]} />
            <meshStandardMaterial color="#8d97a5" roughness={0.5} />
          </mesh>
          <group position={[0, 0, 0.35]}>
            <Cruz s={0.75} />
          </group>
        </group>
      )}
      {/* corriente de aire suave */}
      {e.aire > 0.01 &&
        viento.map((w, i) => {
          const t = (f * w.v + w.fase) % 1;
          return (
            <mesh key={i} position={[-3 + t * 6, w.y, w.z]}>
              <boxGeometry args={[w.l, 0.025, 0.025]} />
              <meshBasicMaterial color="#cfe6ff" transparent opacity={0.45 * Math.sin(Math.PI * t) * e.aire} depthWrite={false} />
            </mesh>
          );
        })}
      {/* reloj de pared */}
      {e.reloj > 0.01 && (
        <group position={[-1.5, 2.9, 0.1]} scale={[e.reloj, e.reloj, e.reloj]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.12, 48]} />
            <meshStandardMaterial color="#f3f6fb" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.07]} rotation={[0, 0, -e.minutos * Math.PI]}>
            <boxGeometry args={[0.07, 0.6, 0.03]} />
            <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.07]} rotation={[0, 0, -e.minutos * Math.PI * 0.08]}>
            <boxGeometry args={[0.1, 0.36, 0.03]} />
            <meshStandardMaterial color="#222a36" />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <sphereGeometry args={[0.07, 12, 10]} />
            <meshStandardMaterial color="#222a36" />
          </mesh>
        </group>
      )}
    </group>
  );
};

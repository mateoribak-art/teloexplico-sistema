import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Parabrisas visto desde adentro: vidrio grande con vaho (gotitas), tablero con dos teclas (A/C y recirculación)
// y vapor que sube desde abajo. Todo sale del frame. Unidades: vidrio centrado en x = 0, y entre 0.9 y 3.3.

export type EstadoParabrisas = {
  frame: number;
  vaho: number; // 0..1 cuánto vaho cubre el vidrio
  mano: number; // 0..1 se pasa la mano (franja limpia que se vuelve a empañar)
  vapor: number; // 0..1 vapor de respiración que sube hacia el vidrio
  ac: number; // 0..1 tecla A/C encendida
  recirc: number; // 0..1 tecla de recirculación encendida
  seca: number; // 0..1 el vidrio se despeja de abajo hacia arriba
  afuera: number; // 0..1 vaho por afuera (frío al máximo)
};

const caja = (w: number, h: number, d: number, r = 0.06) => new RoundedBoxGeometry(w, h, d, 3, r);

const Tecla: React.FC<{ x: number; on: number; color: string; icono: "ac" | "rec" }> = ({ x, on, color, icono }) => {
  const g = useMemo(() => caja(0.9, 0.55, 0.12, 0.1), []);
  const c = new THREE.Color().lerpColors(new THREE.Color("#2a3042"), new THREE.Color(color), on);
  return (
    <group position={[x, 0.45, 0.55]}>
      <mesh geometry={g} castShadow>
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.15 + on * 0.9} roughness={0.4} />
      </mesh>
      {icono === "ac" ? (
        // copo de nieve simple: tres barras cruzadas
        <group position={[0, 0, 0.08]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
              <boxGeometry args={[0.36, 0.045, 0.02]} />
              <meshBasicMaterial color="#f4f8ff" />
            </mesh>
          ))}
        </group>
      ) : (
        // auto con flecha circular: aro + punta
        <group position={[0, 0, 0.08]}>
          <mesh>
            <torusGeometry args={[0.14, 0.03, 8, 24, Math.PI * 1.6]} />
            <meshBasicMaterial color="#f4f8ff" />
          </mesh>
          <mesh position={[0.1, 0.12, 0]} rotation={[0, 0, -0.6]}>
            <coneGeometry args={[0.07, 0.12, 3]} />
            <meshBasicMaterial color="#f4f8ff" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const Parabrisas: React.FC<{ e: EstadoParabrisas }> = ({ e }) => {
  const f = e.frame;
  const gMarco = useMemo(() => caja(5.2, 2.7, 0.18, 0.12), []);
  const gTablero = useMemo(() => caja(5.6, 0.95, 1.4, 0.2), []);
  const gotas = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: (random(`gx${i}`) - 0.5) * 4.7,
        y: 0.1 + random(`gy${i}`) * 2.3,
        s: 0.04 + random(`gs${i}`) * 0.07,
        o: random(`go${i}`),
      })),
    [],
  );
  // el vidrio se despeja de abajo hacia arriba cuando "seca" sube
  const gotasVisibles = gotas.filter((g) => g.y > 0.1 + 2.4 * e.seca);
  const franjaX = -2.2 + 4.4 * e.mano;
  const mano = e.mano > 0 && e.mano < 1;

  return (
    <group position={[0, 0.9, 0]}>
      {/* marco del vidrio (oscuro) y tablero */}
      <mesh geometry={gMarco} position={[0, 1.2, -0.12]} castShadow>
        <meshStandardMaterial color="#10141f" roughness={0.6} />
      </mesh>
      <mesh geometry={gTablero} position={[0, -0.35, 0.5]} castShadow receiveShadow>
        <meshStandardMaterial color="#1b2132" roughness={0.55} metalness={0.2} />
      </mesh>
      {/* vidrio: leve azul */}
      <mesh position={[0, 1.2, 0]}>
        <planeGeometry args={[5.0, 2.5]} />
        <meshStandardMaterial color="#5a7ba8" transparent opacity={0.16} roughness={0.05} depthWrite={false} />
      </mesh>
      {/* vaho: capa blanca translúcida */}
      <mesh position={[0, 1.2, 0.03]}>
        <planeGeometry args={[5.0, 2.5]} />
        <meshBasicMaterial color="#dfe9f6" transparent opacity={0.62 * e.vaho * (1 - e.seca)} depthWrite={false} />
      </mesh>
      {/* gotitas */}
      {e.vaho > 0.02 &&
        gotasVisibles.map((g, i) => (
          <mesh key={i} position={[g.x, g.y, 0.05]} scale={e.vaho}>
            <sphereGeometry args={[g.s, 10, 8]} />
            <meshBasicMaterial color="#f2f7ff" transparent opacity={0.75 * (1 - e.seca * 0.5)} depthWrite={false} />
          </mesh>
        ))}
      {/* franja limpia al pasar la mano */}
      {mano && (
        <mesh position={[franjaX, 1.2, 0.07]}>
          <boxGeometry args={[0.9, 2.5, 0.02]} />
          <meshBasicMaterial color="#6b86ad" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      )}
      {/* vaho por afuera: puntos celestes del otro lado */}
      {e.afuera > 0.02 &&
        gotas.slice(0, 40).map((g, i) => (
          <mesh key={`a${i}`} position={[g.x, g.y, -0.2]} scale={e.afuera}>
            <sphereGeometry args={[g.s * 1.1, 10, 8]} />
            <meshBasicMaterial color="#9fe0ff" transparent opacity={0.8} depthWrite={false} />
          </mesh>
        ))}
      {/* vapor de la respiración subiendo */}
      {e.vapor > 0.02 &&
        Array.from({ length: 14 }, (_, i) => {
          const t = (f * 0.014 + random(`vt${i}`)) % 1;
          return (
            <mesh key={i} position={[(random(`vx${i}`) - 0.5) * 3.6, 0.1 + t * 2.0, 0.35 + random(`vz${i}`) * 0.3]} scale={0.6 + t}>
              <sphereGeometry args={[0.2, 12, 10]} />
              <meshBasicMaterial color="#eaf2ff" transparent opacity={Math.sin(Math.PI * t) * 0.32 * e.vapor} depthWrite={false} />
            </mesh>
          );
        })}
      <Tecla x={-0.7} on={e.ac} color="#37d67a" icono="ac" />
      <Tecla x={0.7} on={e.recirc} color="#ff9a2e" icono="rec" />
    </group>
  );
};

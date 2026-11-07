import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Tu celular (izquierda) con un paquete flotando y el aviso de "retenido"; el estafador (derecha, oscuro).
// La tarjeta viaja de tu celular al suyo. Al final, un tilde verde sobre tu celular (entrás vos al sitio oficial).
// Todo sale del frame. Piso en y = 0.

export type EstadoPaqueteFalso = {
  frame: number;
  paquete: number; // 0..1 aparece la caja sobre tu celular
  aviso: number; // 0..1 globo "retenido" (amarillo) sobre el celular
  formulario: number; // 0..1 la pantalla pasa a página falsa con renglones de formulario
  tarjeta: number; // 0..1 la tarjeta viaja de tu celular al del estafador
  correos: number; // 0..1 fila de sobres, uno falso (rojo) entre los verdaderos
  tilde: number; // 0..1 tilde verde sobre tu celular
};

const W = 1.2;
const H = 2.4;
const Y = 1.5;
const XA = -1.25;
const XB = 1.25;

const Celular: React.FC<{ x: number; pant: THREE.Color; brillo: number; oscuro?: boolean }> = ({ x, pant, brillo, oscuro }) => {
  const cuerpo = useMemo(() => new RoundedBoxGeometry(W, H, 0.14, 4, 0.12), []);
  const pantalla = useMemo(() => new RoundedBoxGeometry(W - 0.1, H - 0.12, 0.02, 3, 0.08), []);
  return (
    <group position={[x, Y, 0]}>
      <mesh geometry={cuerpo} castShadow receiveShadow>
        <meshStandardMaterial color={oscuro ? "#2a2f3a" : "#dfe3ea"} metalness={0.7} roughness={0.28} />
      </mesh>
      <mesh geometry={pantalla} position={[0, 0, 0.085]}>
        <meshStandardMaterial color={pant} emissive={pant} emissiveIntensity={brillo} roughness={0.2} />
      </mesh>
    </group>
  );
};

const Emisivo: React.FC<{ color: string; i?: number }> = ({ color, i = 0.6 }) => (
  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={i} />
);

export const PaqueteFalso: React.FC<{ e: EstadoPaqueteFalso }> = ({ e }) => {
  const f = e.frame;
  const azul = new THREE.Color("#2b6cb0");
  const rojo = new THREE.Color("#ff3b30");
  const gris = new THREE.Color("#222833");
  const base = new THREE.Color("#1c3d5e");
  const pantA = base.clone().lerp(azul, 0.6).lerp(rojo, e.formulario * 0.35);
  const pantB = gris.clone().lerp(rojo, e.tarjeta > 0.9 ? 0.5 : 0);
  const flota = Math.sin(f / 14) * 0.08;
  const t = e.tarjeta;
  const tx = XA + (XB - XA) * t;
  const ty = Y + H / 2 + 0.5 + Math.sin(t * Math.PI) * 0.9;
  return (
    <group>
      <Celular x={XA} pant={pantA} brillo={0.4} />
      <Celular x={XB} pant={pantB} brillo={0.3} oscuro />

      {/* renglones del formulario falso en tu pantalla */}
      {e.formulario > 0.02 &&
        [0.55, 0.15, -0.25, -0.65].map((dy, i) => (
          <mesh key={i} position={[XA, Y + dy, 0.1]} scale={[e.formulario, 1, 1]}>
            <planeGeometry args={[0.85, i === 3 ? 0.2 : 0.14]} />
            <Emisivo color={i === 3 ? "#ffc53d" : "#ffffff"} i={0.5} />
          </mesh>
        ))}

      {/* paquete flotando sobre tu celular */}
      {e.paquete > 0.02 && (
        <group position={[XA, Y + H / 2 + 0.7 + flota, 0.15]} rotation={[0.2, f / 40, 0]} scale={[e.paquete, e.paquete, e.paquete]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.7, 0.7]} />
            <meshStandardMaterial color="#c69a63" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.351, 0]}>
            <boxGeometry args={[0.18, 0.01, 0.72]} />
            <meshStandardMaterial color="#e8d3a8" />
          </mesh>
        </group>
      )}

      {/* aviso amarillo de "retenido" con signo de exclamación */}
      {e.aviso > 0.02 && (
        <group position={[XA + 0.15, Y + 0.95, 0.35]} scale={[e.aviso, e.aviso, e.aviso]}>
          <mesh>
            <boxGeometry args={[1.0, 0.42, 0.06]} />
            <Emisivo color="#ffc53d" i={0.7} />
          </mesh>
          <mesh position={[-0.35, 0, 0.05]}>
            <circleGeometry args={[0.13, 20]} />
            <Emisivo color="#1a1a1a" i={0.2} />
          </mesh>
          <mesh position={[0.05, 0, 0.05]}>
            <planeGeometry args={[0.5, 0.08]} />
            <Emisivo color="#1a1a1a" i={0.2} />
          </mesh>
        </group>
      )}

      {/* tarjeta que viaja al estafador */}
      {t > 0.02 && (
        <group position={[tx, ty, 0.3]} rotation={[0, f / 25, Math.sin(f / 9) * 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.45, 0.04]} />
            <meshStandardMaterial color="#ffc53d" emissive="#ffc53d" emissiveIntensity={0.5} metalness={0.4} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.08, 0.025]}>
            <planeGeometry args={[0.6, 0.08]} />
            <meshStandardMaterial color="#7a5a00" />
          </mesh>
        </group>
      )}

      {/* fila de sobres: uno rojo (el falso) entre los verdaderos */}
      {e.correos > 0.02 &&
        [0, 1, 2, 3, 4].map((i) => {
          const falso = i === 2;
          return (
            <group key={i} position={[-2.2 + i * 1.1, 4.45 + (falso ? Math.sin(f / 6) * 0.06 : 0), 0.2]} scale={[e.correos, e.correos, e.correos]}>
              <mesh>
                <boxGeometry args={[0.8, 0.55, 0.06]} />
                <meshStandardMaterial color={falso ? "#ff3b30" : "#e6edf5"} emissive={falso ? "#ff3b30" : "#9fb4c8"} emissiveIntensity={falso ? 0.8 : 0.25} />
              </mesh>
              <mesh position={[0, 0.06, 0.04]} rotation={[0, 0, 0]}>
                <planeGeometry args={[0.55, 0.02]} />
                <meshStandardMaterial color={falso ? "#ffffff" : "#6b7f94"} />
              </mesh>
            </group>
          );
        })}

      {/* tilde verde sobre tu celular */}
      {e.tilde > 0.02 && (
        <group position={[XA, Y + H / 2 + 0.8, 0.2]} scale={[e.tilde, e.tilde, e.tilde]}>
          <mesh position={[0, 0, 0]}>
            <circleGeometry args={[0.5, 32]} />
            <Emisivo color="#25d366" i={0.7} />
          </mesh>
          <mesh position={[-0.12, -0.08, 0.03]} rotation={[0, 0, -0.78]}>
            <boxGeometry args={[0.1, 0.3, 0.04]} />
            <Emisivo color="#ffffff" i={0.8} />
          </mesh>
          <mesh position={[0.1, 0.04, 0.03]} rotation={[0, 0, 0.78]}>
            <boxGeometry args={[0.1, 0.55, 0.04]} />
            <Emisivo color="#ffffff" i={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
};

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Dos celulares de frente: el tuyo (izquierda) y el del estafador (derecha, más oscuro).
// Seis cubitos son el código: salen de tu celular, viajan al otro y la cuenta cambia de manos.
// Todo sale del frame. Piso en y = 0.

export type EstadoCodigoWA = {
  frame: number;
  codigo: number; // 0..1 aparecen los seis cubitos sobre tu celular
  vuelo: number; // 0..1 los cubitos viajan de tu celular al del estafador
  robado: number; // 0..1 tu pantalla se apaga en rojo y la del otro se pone verde con tu cuenta
  mensajes: number; // 0..1 globitos que salen del celular del estafador hacia tus contactos
  escudo: number; // 0..1 candado + PIN sobre tu celular (verificación en dos pasos)
  pregunta: number; // 0..1 signo de pregunta sobre el celular del estafador (el pedido)
};

const W = 1.2;
const H = 2.4;
const Y = 1.5;
const XA = -1.25;
const XB = 1.25;
const VERDE = "#25d366";

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

export const CodigoWA: React.FC<{ e: EstadoCodigoWA }> = ({ e }) => {
  const f = e.frame;
  const verde = new THREE.Color(VERDE);
  const rojo = new THREE.Color("#ff3b30");
  const gris = new THREE.Color("#222833");
  const pantA = verde.clone().lerp(rojo, e.robado * 0.9);
  const pantB = gris.clone().lerp(verde, e.robado);
  const pulso = 0.5 + 0.5 * Math.sin(f / 5);
  // cubitos del código
  const cubitos = Array.from({ length: 6 }, (_, i) => {
    const t = Math.min(1, Math.max(0, e.vuelo * 1.4 - i * 0.07));
    const xi = XA - 0.5 + i * 0.2;
    const x = xi + (XB - XA) * t;
    const y = Y + H / 2 + 0.45 + Math.sin(t * Math.PI) * 0.9;
    return { x, y, i };
  });
  return (
    <group>
      <Celular x={XA} pant={e.robado > 0.5 ? pantA : verde} brillo={0.45 + 0.25 * e.robado * pulso} />
      <Celular x={XB} pant={e.robado > 0.02 ? pantB : gris} brillo={0.35 + 0.3 * e.robado} oscuro />

      {/* cara del estafador: capucha simple sobre su celular, aparece con la pregunta */}
      {e.pregunta > 0.02 && (
        <group position={[XB, Y + H / 2 + 0.75, 0.1]} scale={[e.pregunta, e.pregunta, e.pregunta]}>
          <mesh>
            <torusGeometry args={[0.28, 0.07, 12, 32, Math.PI * 1.5]} />
            <meshStandardMaterial color="#ffc53d" emissive="#ffc53d" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.08, 12, 10]} />
            <meshStandardMaterial color="#ffc53d" emissive="#ffc53d" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* ícono de cuenta en la pantalla de cada uno: círculo (foto) */}
      <mesh position={[XA, Y + 0.35, 0.1]}>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[XA, Y - 0.2, 0.1]}>
        <planeGeometry args={[0.8, 0.12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
      </mesh>
      {e.robado > 0.5 && (
        <>
          <mesh position={[XB, Y + 0.35, 0.1]}>
            <circleGeometry args={[0.3, 32]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[XB, Y - 0.2, 0.1]}>
            <planeGeometry args={[0.8, 0.12]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>
        </>
      )}

      {/* el código: seis cubitos */}
      {e.codigo > 0.02 &&
        cubitos.map((c) => (
          <mesh key={c.i} position={[c.x, c.y, 0.2]} rotation={[f / 20 + c.i, f / 17, 0]} scale={[e.codigo, e.codigo, e.codigo]} castShadow>
            <boxGeometry args={[0.16, 0.16, 0.16]} />
            <meshStandardMaterial color="#ffc53d" emissive="#ffc53d" emissiveIntensity={0.7} roughness={0.35} />
          </mesh>
        ))}

      {/* mensajes del estafador a tus contactos: globitos que salen hacia atrás y arriba */}
      {e.mensajes > 0.02 &&
        Array.from({ length: 7 }, (_, i) => {
          const t = (f * 0.018 + i / 7) % 1;
          const ang = -0.6 + (i / 6) * 1.2;
          return (
            <mesh key={i} position={[XB + 0.2 + Math.sin(ang) * 2.2 * t, Y + 0.4 + t * 1.9, -0.3 - t * 1.0]} scale={[1.4, 1, 0.5]}>
              <sphereGeometry args={[0.17, 14, 10]} />
              <meshStandardMaterial color="#ffffff" emissive={VERDE} emissiveIntensity={0.6} transparent opacity={e.mensajes * (1 - t * 0.6)} />
            </mesh>
          );
        })}

      {/* candado + PIN sobre tu celular */}
      {e.escudo > 0.02 && (
        <group position={[XA, Y + H / 2 + 0.8, 0.2]} scale={[e.escudo, e.escudo, e.escudo]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <boxGeometry args={[0.7, 0.55, 0.22]} />
            <meshStandardMaterial color="#ffc53d" metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.22, 0.06, 12, 28, Math.PI]} />
            <meshStandardMaterial color="#dfe3ea" metalness={0.85} roughness={0.25} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} position={[-0.5 + i * 0.2, -0.95, 0.05]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.7} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

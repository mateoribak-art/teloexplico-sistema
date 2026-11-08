import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Corredor al sol con termómetro al lado (37 → 40 °C), señales (confusión, piel roja y seca),
// teléfono de emergencias y refrescada con agua fría a la sombra. Todo sale del frame.
// Unidades: piso en y = 0; la persona mide ~2,3 y está en x = 0.

export type EstadoGolpeCalor = {
  frame: number;
  sol: number; // 0..1 aparece el sol y los rayos
  corre: number; // 0..1 corre (piernas y brazos se mueven); 0 = parado
  temp: number; // 0..1 columna del termómetro (0 = 37 °C, 1 = 40 °C)
  termoOn: number; // 0..1 aparece el termómetro
  piel: number; // 0..1 la piel se pone roja
  confuso: number; // 0..1 giran signos de pregunta y tambalea
  llamar: number; // 0..1 aparece el teléfono de emergencias
  sombra: number; // 0..1 toldo de sombra (el sol se apaga)
  agua: number; // 0..1 chorros de agua fría
};

export const X_TERMO = 2.7;

const caja = (w: number, h: number, d: number, r = 0.05) => new RoundedBoxGeometry(w, h, d, 3, r);

const Persona: React.FC<{ e: EstadoGolpeCalor }> = ({ e }) => {
  const f = e.frame;
  const torso = useMemo(() => caja(0.72, 0.95, 0.4, 0.16), []);
  const pierna = useMemo(() => caja(0.26, 0.9, 0.28, 0.1), []);
  const brazo = useMemo(() => caja(0.2, 0.8, 0.22, 0.09), []);
  const piel = new THREE.Color().lerpColors(new THREE.Color("#e7b58b"), new THREE.Color("#e8412c"), e.piel);
  const caliente = e.piel * (1 - e.agua);
  const paso = Math.sin(f / 3.2) * 0.7 * e.corre;
  const tambaleo = Math.sin(f / 7) * 0.14 * e.confuso * (1 - e.agua);
  const rebote = Math.abs(Math.sin(f / 3.2)) * 0.1 * e.corre;
  const azul = new THREE.Color("#58c8ff");
  return (
    <group rotation={[0, 0.5, tambaleo]} position={[0, rebote, 0]}>
      {/* piernas */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.18, 0.95, 0]} rotation={[s * paso, 0, 0]}>
          <mesh geometry={pierna} position={[0, -0.45, 0]} castShadow>
            <meshStandardMaterial color="#27324d" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.92, 0.07]} castShadow>
            <boxGeometry args={[0.3, 0.12, 0.44]} />
            <meshStandardMaterial color="#f1f3f8" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* torso */}
      <mesh geometry={torso} position={[0, 1.45, 0]} castShadow>
        <meshStandardMaterial color="#ff8a2a" roughness={0.7} emissive={azul} emissiveIntensity={e.agua * 0.12} />
      </mesh>
      {/* brazos */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.48, 1.8, 0]} rotation={[-s * paso, 0, s * 0.08]}>
          <mesh geometry={brazo} position={[0, -0.38, 0]} castShadow>
            <meshStandardMaterial color={piel} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* cabeza */}
      <group position={[0, 2.18, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.32, 28, 20]} />
          <meshStandardMaterial color={piel} roughness={0.55} emissive="#ff2a10" emissiveIntensity={caliente * 0.35} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.3 * 0.55, 0.05, s * 0.12 + 0.2]}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <meshBasicMaterial color="#111" />
          </mesh>
        ))}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
          <meshStandardMaterial color="#2a2118" roughness={0.9} />
        </mesh>
      </group>
      {/* gotas de sudor: se apagan cuando la piel se seca */}
      {Array.from({ length: 5 }, (_, i) => {
        const t = (f * 0.03 + random(`sd${i}`)) % 1;
        const vis = Math.max(0, 1 - e.piel * 1.4) * e.sol;
        if (vis <= 0.02) return null;
        return (
          <mesh key={i} position={[(random(`sx${i}`) - 0.5) * 0.7, 2.5 - t * 0.7, 0.3]} scale={vis}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#9ee0ff" transparent opacity={Math.sin(Math.PI * t) * 0.9} depthWrite={false} />
          </mesh>
        );
      })}
      {/* confusión: espirales y signos que giran sobre la cabeza */}
      {e.confuso > 0.02 &&
        Array.from({ length: 4 }, (_, i) => {
          const a = f * 0.12 + (i * Math.PI) / 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.55, 2.95 + Math.sin(f * 0.1 + i) * 0.06, Math.sin(a) * 0.55]} scale={e.confuso}>
              <boxGeometry args={[0.16, 0.26, 0.08]} />
              <meshBasicMaterial color="#ffd23f" />
            </mesh>
          );
        })}
    </group>
  );
};

const Termometro: React.FC<{ v: number; on: number }> = ({ v, on }) => {
  if (on <= 0.01) return null;
  const alto = 3.4;
  const color = new THREE.Color().lerpColors(new THREE.Color("#ffb02e"), new THREE.Color("#ff2a1a"), v);
  const nivel = alto * (0.3 + 0.7 * v);
  return (
    <group position={[X_TERMO, 0.2, 0.2]} scale={on}>
      <mesh position={[0, alto / 2 + 0.3, 0]} castShadow>
        <boxGeometry args={[0.5, alto, 0.24]} />
        <meshStandardMaterial color="#e9eef7" roughness={0.3} emissive="#8aa0c4" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.44, 24, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, 0.3 + nivel / 2, 0.14]}>
        <boxGeometry args={[0.22, nivel, 0.08]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[0.34, 0.9 + i * 0.3, 0.12]}>
          <boxGeometry args={[i === 9 ? 0.26 : 0.12, 0.03, 0.03]} />
          <meshBasicMaterial color={i === 9 ? "#ff2a1a" : "#20283a"} />
        </mesh>
      ))}
    </group>
  );
};

export const GolpeCalor: React.FC<{ e: EstadoGolpeCalor }> = ({ e }) => {
  const f = e.frame;
  const solV = e.sol * (1 - e.sombra * 0.85);
  return (
    <group>
      {/* sol */}
      {solV > 0.01 && (
        <group position={[-2.8, 6.0, -1.5]} scale={solV}>
          <mesh>
            <sphereGeometry args={[0.7, 28, 20]} />
            <meshBasicMaterial color="#ffd23f" />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.1, 24, 18]} />
            <meshBasicMaterial color="#ffb02e" transparent opacity={0.25} depthWrite={false} />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => {
            const t = (f * 0.03 + i / 7) % 1;
            return (
              <mesh key={i} position={[1.2 + t * 2.0, -0.8 - t * 3.0 + (i - 3) * 0.13, 0.3 + (i - 3) * 0.1]} rotation={[0, 0, -1.0]} scale={Math.sin(Math.PI * t)}>
                <boxGeometry args={[0.6, 0.06, 0.06]} />
                <meshBasicMaterial color="#ffd23f" transparent opacity={0.9} depthWrite={false} />
              </mesh>
            );
          })}
        </group>
      )}

      <Persona e={e} />
      <Termometro v={e.temp * (1 - e.agua * 0.45)} on={e.termoOn} />

      {/* toldo de sombra */}
      {e.sombra > 0.01 && (
        <group position={[0, 0, 0]} scale={[1, e.sombra, 1]}>
          <mesh position={[0, 3.55, 0]}>
            <boxGeometry args={[2.6, 0.12, 2.2]} />
            <meshStandardMaterial color="#2e7d5b" roughness={0.8} transparent opacity={0.92} />
          </mesh>
          {[-1, 1].map((sx) =>
            [-1, 1].map((sz) => (
              <mesh key={`${sx}${sz}`} position={[sx * 1.2, 1.75, sz * 1.0]}>
                <cylinderGeometry args={[0.04, 0.04, 3.5, 8]} />
                <meshStandardMaterial color="#aab3c2" metalness={0.7} roughness={0.3} />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* agua fría cayendo sobre la persona */}
      {e.agua > 0.02 &&
        Array.from({ length: 26 }, (_, i) => {
          const t = (f * (0.05 + random(`av${i}`) * 0.03) + random(`ay${i}`)) % 1;
          return (
            <mesh key={i} position={[(random(`ax${i}`) - 0.5) * 1.4, 3.3 - t * 3.2, (random(`az${i}`) - 0.5) * 0.9]} scale={e.agua}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#58c8ff" transparent opacity={0.85} depthWrite={false} />
            </mesh>
          );
        })}

      {/* teléfono de emergencias */}
      {e.llamar > 0.01 && (
        <group position={[-2.3, 1.7 + Math.sin(f / 6) * 0.05, 0.6]} scale={e.llamar} rotation={[0, 0.3, Math.sin(f / 2.5) * 0.06]}>
          <mesh geometry={caja(0.95, 1.7, 0.14, 0.14)} castShadow>
            <meshStandardMaterial color="#10131c" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[0.8, 1.5, 0.02]} />
            <meshBasicMaterial color="#e63946" />
          </mesh>
          <mesh position={[0, 0.05, 0.1]}>
            <boxGeometry args={[0.46, 0.14, 0.02]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.05, 0.1]}>
            <boxGeometry args={[0.14, 0.46, 0.02]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      )}
    </group>
  );
};

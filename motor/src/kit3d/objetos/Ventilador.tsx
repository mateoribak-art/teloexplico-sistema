import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Ventilador de techo con su cuarto: techo, motor con palanca de sentido, 4 aspas, partículas de aire
// (en verano bajan en el centro y salen por el piso; en invierno suben por el centro, corren por el techo y bajan hacia los costados)
// y una persona sin cara debajo. Unidades: piso en y = 0, techo en y = TECHO, ventilador en x = 0.

export const TECHO = 4.6;

export type EstadoVentilador = {
  frame: number;
  giro: number; // velocidad en vueltas por 100 frames; + = antihorario mirando desde abajo, - = horario
  flujo: number; // 0..1 cantidad de partículas de aire
  invierno: number; // 0 = verano (el aire baja), 1 = invierno (el aire sube por el centro)
  palanca: number; // -1..1 posición de la palanca de sentido
  persona: number; // 0..1 aparece la persona
  brisa: number; // 0..1 la persona siente la brisa (pelo y rayitas)
  apagado: number; // 0..1 ventilador apagado (se frena)
};

export const VentiladorVacio: EstadoVentilador = { frame: 0, giro: 0, flujo: 0, invierno: 0, palanca: 0, persona: 0, brisa: 0, apagado: 0 };

const caja = (w: number, h: number, d: number, r = 0.04) => new RoundedBoxGeometry(w, h, d, 3, r);
const mezcla = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t);

const N = 46;

export const Ventilador: React.FC<{ e: EstadoVentilador; angulo: number }> = ({ e, angulo }) => {
  const f = e.frame;
  const techo = useMemo(() => caja(7.0, 0.2, 3.6, 0.04), []);
  const piso = useMemo(() => caja(7.0, 0.2, 3.6, 0.04), []);
  const aspa = useMemo(() => caja(1.35, 0.04, 0.34, 0.02), []);
  const brazo = useMemo(() => caja(0.4, 0.05, 0.12, 0.02), []);
  const torso = useMemo(() => new THREE.CapsuleGeometry(0.26, 0.7, 8, 20), []);
  const pierna = useMemo(() => new THREE.CapsuleGeometry(0.1, 0.8, 6, 14), []);
  const parts = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => ({
        a: random(`va${i}`) * Math.PI * 2,
        r: 0.15 + random(`vr${i}`) * 0.95,
        fase: random(`vf${i}`),
        vel: 0.0085 + random(`vv${i}`) * 0.004,
        tam: 0.035 + random(`vt${i}`) * 0.03,
      })),
    []
  );
  const colorAire = mezcla("#7fd0ff", "#ffb066", e.invierno);
  const n = Math.round(e.flujo * N);
  const yCentro = TECHO - 0.55;
  return (
    <group>
      {/* techo y piso */}
      <mesh geometry={techo} position={[0, TECHO + 0.1, 0]}>
        <meshStandardMaterial color="#cdd5e2" roughness={0.8} />
      </mesh>
      <mesh geometry={piso} position={[0, -0.1, 0]} receiveShadow>
        <meshStandardMaterial color="#6b5a49" roughness={0.75} />
      </mesh>

      {/* varilla y motor */}
      <mesh position={[0, TECHO - 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 14]} />
        <meshStandardMaterial color="#c9d3e0" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, yCentro + 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.3, 0.3, 32]} />
        <meshStandardMaterial color="#2c3646" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* palanca de sentido, en el costado del motor */}
      <group position={[0.34, yCentro + 0.12, 0.1]}>
        <mesh>
          <boxGeometry args={[0.08, 0.1, 0.16]} />
          <meshStandardMaterial color="#dfe6ee" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.05, 0.02, 0.1 * e.palanca]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.045, 14, 10]} />
          <meshStandardMaterial color="#ffc53d" emissive="#ffc53d" emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* aspas, giran alrededor de y; angulo ya viene calculado (frame a frame) */}
      <group position={[0, yCentro - 0.08, 0]} rotation={[0, angulo, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
            <mesh geometry={brazo} position={[0.55, 0, 0]} castShadow>
              <meshStandardMaterial color="#2c3646" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh geometry={aspa} position={[1.4, 0, 0]} rotation={[0.16, 0, 0]} castShadow>
              <meshStandardMaterial color="#b98a58" roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* aire: partículas con recorrido cerrado */}
      {parts.slice(0, n).map((p, i) => {
        const t = (f * p.vel + p.fase) % 1;
        let x = 0;
        let y = 0;
        let rr = p.r;
        if (e.invierno < 0.5) {
          // verano: baja por el centro y sale corriendo por el piso
          if (t < 0.6) {
            y = yCentro - 0.2 - (t / 0.6) * (yCentro - 0.35);
          } else {
            const u = (t - 0.6) / 0.4;
            y = 0.35 - u * 0.2;
            rr = p.r + u * 2.2;
          }
        } else {
          // invierno: sube por el centro, corre por el techo y baja por los costados
          if (t < 0.35) {
            y = 0.5 + (t / 0.35) * (TECHO - 0.8);
          } else if (t < 0.6) {
            const u = (t - 0.35) / 0.25;
            y = TECHO - 0.3;
            rr = p.r + u * 2.4;
          } else {
            const u = (t - 0.6) / 0.4;
            y = TECHO - 0.3 - u * (TECHO - 0.7);
            rr = p.r + 2.4;
          }
        }
        x = Math.cos(p.a) * rr;
        const z = Math.sin(p.a) * rr * 0.7;
        const op = 0.8 * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[p.tam, 10, 8]} />
            <meshBasicMaterial color={colorAire} transparent opacity={op} depthWrite={false} />
          </mesh>
        );
      })}

      {/* capa de aire tibio pegada al techo (invierno) */}
      {e.invierno > 0.05 && (
        <mesh position={[0, TECHO - 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.4, 3.2]} />
          <meshBasicMaterial color="#ff9a4a" transparent opacity={0.16 * e.invierno * (1 - e.flujo * 0.4)} depthWrite={false} />
        </mesh>
      )}

      {/* persona sin cara debajo */}
      {e.persona > 0.01 && (
        <group position={[0, 0, 0]} scale={e.persona}>
          {[-0.13, 0.13].map((x) => (
            <mesh key={x} geometry={pierna} position={[x, 0.5, 0]} castShadow>
              <meshStandardMaterial color="#3d5a8a" roughness={0.7} />
            </mesh>
          ))}
          <mesh geometry={torso} position={[0, 1.45, 0]} scale={[1, 1, 0.7]} castShadow>
            <meshStandardMaterial color="#f2c24b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.2, 0]} castShadow>
            <sphereGeometry args={[0.26, 28, 20]} />
            <meshStandardMaterial color="#e6b28c" roughness={0.55} />
          </mesh>
          {e.brisa > 0.05 &&
            [-0.18, 0, 0.18].map((x, i) => {
              const t = (f * 0.03 + i * 0.33) % 1;
              return (
                <mesh key={i} position={[x, 3.0 - t * 0.6, 0.02]} scale={[1, 4, 1]}>
                  <sphereGeometry args={[0.025, 8, 8]} />
                  <meshBasicMaterial color="#cfeaff" transparent opacity={0.7 * e.brisa * (1 - t)} depthWrite={false} />
                </mesh>
              );
            })}
        </group>
      )}
    </group>
  );
};

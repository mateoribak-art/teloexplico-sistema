import React from "react";
import * as THREE from "three";

// Zapatilla / alargue eléctrico: cuerpo de plástico con tomas, cable y enchufe, dos cables de
// electrodomésticos colgados arriba, y estados de sobrecarga: corriente que entra, el cuerpo que
// se recalienta (rojo), humo y una llama. Todo con primitivas; la animación entra por `e`.
// También exporta `ParedEnchufe`: un tomacorriente de pared para el "va directo a la pared".

export type EstadoZapatilla = {
  frame: number;
  calor: number; // 0→1 rojo caliente en el cuerpo
  humo: number; // 0→1 humo que sube
  llama: number; // 0→1 llama en la toma sobrecargada
  corriente: number; // 0→1 brillo de la corriente que entra por los cables
};

const Blanco = (props: { calor: number }) => (
  <meshStandardMaterial
    color="#b9bfca"
    roughness={0.8}
    metalness={0.0}
    emissive={new THREE.Color("#ff2a0a")}
    emissiveIntensity={props.calor * 1.4}
  />
);

/** Una toma: hueco oscuro embutido con dos agujeros redondos. */
const Toma: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, 0.2, 0]}>
    <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.52, 0.66]} />
      <meshStandardMaterial color="#20242e" roughness={0.8} />
    </mesh>
    <mesh position={[-0.11, 0.004, 0]}>
      <cylinderGeometry args={[0.055, 0.055, 0.02, 16]} />
      <meshStandardMaterial color="#0a0c12" roughness={0.9} />
    </mesh>
    <mesh position={[0.11, 0.004, 0]}>
      <cylinderGeometry args={[0.055, 0.055, 0.02, 16]} />
      <meshStandardMaterial color="#0a0c12" roughness={0.9} />
    </mesh>
  </group>
);

/** Cable grueso que sube desde una toma hacia un electrodoméstico (fuera de cuadro). */
const CableArriba: React.FC<{ x: number; alto: number; corriente: number; fase: number; color?: string }> = ({ x, alto, corriente, fase, color = "#2b2f3a" }) => {
  const puntos = React.useMemo(() => {
    const curva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 0.25, 0),
      new THREE.Vector3(x + 0.25, 0.9, -0.1),
      new THREE.Vector3(x - 0.1, 1.7, 0.1),
      new THREE.Vector3(x + 0.15, alto, 0),
    ]);
    return curva;
  }, [x, alto]);
  const geo = React.useMemo(() => new THREE.TubeGeometry(puntos, 24, 0.055, 10, false), [puntos]);
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {corriente > 0.02 &&
        Array.from({ length: 5 }, (_, i) => {
          const t = ((i / 5 + fase) % 1 + 1) % 1;
          const p = puntos.getPoint(1 - t); // la corriente baja hacia la zapatilla
          return (
            <mesh key={i} position={[p.x, p.y, p.z]}>
              <sphereGeometry args={[0.07, 10, 10]} />
              <meshBasicMaterial color="#ffd24a" transparent opacity={0.85 * corriente} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          );
        })}
    </group>
  );
};

/** Humo: bocanadas que suben y se agrandan. */
const Humo: React.FC<{ x: number; humo: number; frame: number }> = ({ x, humo, frame }) => {
  if (humo <= 0.02) return null;
  return (
    <group position={[x, 0.3, 0]}>
      {Array.from({ length: 6 }, (_, i) => {
        const ciclo = 60;
        const t = (((frame + i * 10) % ciclo) / ciclo);
        const op = Math.sin(Math.PI * t) * 0.3 * humo;
        const esc = 0.3 + t * 0.9;
        return (
          <mesh key={i} position={[Math.sin(i * 1.7 + frame / 20) * 0.2, t * 2.2, 0]} scale={esc}>
            <sphereGeometry args={[0.35, 10, 10]} />
            <meshBasicMaterial color="#8a8f9c" transparent opacity={op} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Llama en la toma sobrecargada. */
const Llama: React.FC<{ x: number; llama: number; frame: number }> = ({ x, llama, frame }) => {
  if (llama <= 0.02) return null;
  const parp = 0.85 + 0.15 * Math.sin(frame / 3);
  return (
    <group position={[x, 0.3, 0]} scale={[llama, llama * (1.1 + 0.15 * Math.sin(frame / 4)), llama]}>
      <mesh position={[0, 0.35, 0]}>
        <coneGeometry args={[0.28, 0.9, 16]} />
        <meshBasicMaterial color="#ff8a1e" transparent opacity={0.85 * parp} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <coneGeometry args={[0.16, 0.6, 16]} />
        <meshBasicMaterial color="#ffe066" transparent opacity={0.95 * parp} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

export const Zapatilla: React.FC<{ e: EstadoZapatilla }> = ({ e }) => {
  const fase = (e.frame / 26) % 1;
  const tomasX = [-1.1, -0.37, 0.37, 1.1];
  return (
    <group position={[0, 0.2, 0]}>
      {/* cuerpo */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[3.1, 0.38, 0.9]} />
        <Blanco calor={e.calor} />
      </mesh>
      {/* tomas (hundidas en la cara de arriba) */}
      {tomasX.map((x) => (
        <Toma key={x} x={x} />
      ))}
      {/* interruptor con luz */}
      <mesh position={[1.45, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.16, 0.3]} />
        <meshStandardMaterial color="#c8302a" emissive="#ff3b30" emissiveIntensity={0.6 + e.calor} roughness={0.5} />
      </mesh>
      {/* cable al enchufe de pared (sale por la izquierda) */}
      <mesh position={[-1.9, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 1.4, 12]} />
        <meshStandardMaterial color="#2b2f3a" roughness={0.7} />
      </mesh>
      {/* enchufe macho al final */}
      <mesh position={[-2.65, -0.05, 0]}>
        <boxGeometry args={[0.32, 0.26, 0.4]} />
        <meshStandardMaterial color="#1b1e27" roughness={0.6} />
      </mesh>
      {/* dos electrodomésticos colgados (cables que suben) */}
      <CableArriba x={tomasX[1]} alto={3.0} corriente={e.corriente} fase={fase} />
      <CableArriba x={tomasX[2]} alto={3.2} corriente={e.corriente} fase={fase + 0.5} color="#3a2f2a" />
      {/* halo de calor sobre el cuerpo */}
      {e.calor > 0.05 && (
        <mesh position={[0.3, 0.25, 0]}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial color="#ff5a1e" transparent opacity={0.16 * e.calor} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
      <Humo x={tomasX[2]} humo={e.humo} frame={e.frame} />
      <Llama x={tomasX[2]} llama={e.llama} frame={e.frame} />
    </group>
  );
};

/** Tomacorriente de pared con un enchufe entrando directo (la forma correcta). */
export const ParedEnchufe: React.FC<{ pos?: [number, number, number]; corriente?: number; frame?: number }> = ({ pos = [0, 0, 0], corriente = 0, frame = 0 }) => {
  const fase = (frame / 26) % 1;
  const puntos = React.useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 0.0, 0.35),
    new THREE.Vector3(0.2, 0.7, 0.5),
    new THREE.Vector3(-0.1, 1.6, 0.4),
    new THREE.Vector3(0.1, 2.6, 0.4),
  ]), []);
  const geo = React.useMemo(() => new THREE.TubeGeometry(puntos, 20, 0.055, 10, false), [puntos]);
  return (
    <group position={pos}>
      {/* pared */}
      <mesh position={[0, 0.8, -0.1]} receiveShadow>
        <boxGeometry args={[4, 5, 0.2]} />
        <meshStandardMaterial color="#223050" roughness={0.9} />
      </mesh>
      {/* chapa del tomacorriente */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[1.15, 1.45, 0.08]} />
        <meshStandardMaterial color="#eef1f6" roughness={0.5} />
      </mesh>
      {/* agujeros */}
      <mesh position={[-0.16, 0.12, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.05, 14]} />
        <meshStandardMaterial color="#0a0c12" />
      </mesh>
      <mesh position={[0.16, 0.12, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.05, 14]} />
        <meshStandardMaterial color="#0a0c12" />
      </mesh>
      {/* enchufe entrando directo (cuerpo chato + cuello al cable) */}
      <mesh position={[0, 0, 0.26]}>
        <boxGeometry args={[0.46, 0.5, 0.26]} />
        <meshStandardMaterial color="#20242e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.05, 0.42]}>
        <boxGeometry args={[0.22, 0.24, 0.12]} />
        <meshStandardMaterial color="#20242e" roughness={0.6} />
      </mesh>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#2b2f3a" roughness={0.7} />
      </mesh>
      {corriente > 0.02 &&
        Array.from({ length: 4 }, (_, i) => {
          const t = ((i / 4 + fase) % 1 + 1) % 1;
          const p = puntos.getPoint(1 - t);
          return (
            <mesh key={i} position={[p.x, p.y, p.z]}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshBasicMaterial color="#8affa0" transparent opacity={0.85 * corriente} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          );
        })}
    </group>
  );
};

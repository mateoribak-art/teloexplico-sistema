import React, { useMemo } from "react";
import { random } from "remotion";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Corte lateral de una tormenta que ya casi termina: a la izquierda la nube con la lluvia cayendo, a la derecha
// una persona al lado de una pileta bajo el cielo que se abre (sol). Entre los dos, una regla de distancia
// (más de 16 km) y un rayo que sale de la nube, cruza el cielo despejado y cae sobre la persona. Arriba a la
// derecha, un reloj de 30 minutos que se llena (y se reinicia si vuelve a tronar). Todo sale del frame.
// Ancho útil ~5,6 unidades; suelo en y = 0.

export const X_NUBE = -1.6;
export const X_PERSONA = 1.8;
const LLUVIA_X0 = -2.3;
const LLUVIA_X1 = -0.9;

export type EstadoRayoLluvia = {
  frame: number;
  lluvia: number; // 0..1 intensidad de la lluvia bajo la nube
  sol: number; // 0..1 el cielo se abre (sol a la derecha)
  regla: number; // 0..1 regla de distancia entre la lluvia y la persona
  rayo: number; // 0..1 brillo del rayo (0 = apagado)
  flash: number; // 0..1 destello de la nube (trueno)
  reloj: number; // 0..1 avance del reloj de treinta minutos (0 = oculto)
  persona: number; // 0..1 persona en alerta (se pinta de color de aviso)
};

const caja = (w: number, h: number, d: number, r = 0.05) => new RoundedBoxGeometry(w, h, d, 3, r);

const Nube: React.FC<{ flash: number }> = ({ flash }) => {
  const bolas = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        p: [(random(`lx${i}`) - 0.5) * 1.6, 3.15 + random(`ly${i}`) * 0.5, (random(`lz${i}`) - 0.5) * 0.7] as [number, number, number],
        r: 0.32 + random(`lr${i}`) * 0.24,
        oscura: i % 3 === 0,
      })),
    []
  );
  return (
    <group position={[X_NUBE, 0, 0]}>
      {bolas.map((b, i) => (
        <mesh key={i} position={b.p}>
          <sphereGeometry args={[b.r, 22, 16]} />
          <meshStandardMaterial color={b.oscura ? "#4b546b" : "#6c7691"} roughness={1} emissive="#ffe9a0" emissiveIntensity={0.9 * flash} />
        </mesh>
      ))}
    </group>
  );
};

const Persona: React.FC<{ alerta: number }> = ({ alerta }) => {
  const cuerpo = useMemo(() => caja(0.34, 0.62, 0.26, 0.1), []);
  return (
    <group position={[X_PERSONA, 0, 0]}>
      <mesh geometry={cuerpo} position={[0, 0.42, 0]} castShadow>
        <meshStandardMaterial color={alerta > 0.5 ? "#ff8a3d" : "#3d8fe0"} roughness={0.55} emissive={alerta > 0.5 ? "#ff5a1a" : "#000000"} emissiveIntensity={0.25 * alerta} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.17, 24, 18]} />
        <meshStandardMaterial color="#f0c9a0" roughness={0.6} />
      </mesh>
      {[-0.09, 0.09].map((x) => (
        <mesh key={x} position={[x, 0.06, 0]}>
          <boxGeometry args={[0.1, 0.14, 0.12]} />
          <meshStandardMaterial color="#2a2f3d" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

/** Rayo en zigzag que sale del borde de la nube, cruza el cielo sin lluvia y cae sobre la persona. */
const Bolt: React.FC<{ v: number }> = ({ v }) => {
  const pts: [number, number][] = [
    [-1.0, 3.2],
    [-0.3, 3.45],
    [0.3, 3.0],
    [0.8, 2.5],
    [0.6, 1.9],
    [1.4, 1.5],
    [1.3, 1.2],
    [X_PERSONA, 1.1],
  ];
  return (
    <group position={[0, 0, 0.1]}>
      {pts.slice(0, -1).map((a, i) => {
        const b = pts[i + 1];
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const largo = Math.hypot(dx, dy);
        return (
          <group key={i} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0]} rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]}>
            <mesh>
              <boxGeometry args={[0.09, largo + 0.03, 0.06]} />
              <meshBasicMaterial color="#fffbe0" transparent opacity={v} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.3, largo + 0.03, 0.16]} />
              <meshBasicMaterial color="#ffe36a" transparent opacity={0.35 * v} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const RayoLluvia: React.FC<{ e: EstadoRayoLluvia }> = ({ e }) => {
  const f = e.frame;
  const suelo = useMemo(() => caja(5.8, 0.3, 2.2, 0.08), []);
  const pileta = useMemo(() => caja(1.0, 0.06, 0.8, 0.03), []);
  const gotas = Array.from({ length: 26 }, (_, i) => {
    const vel = 0.05 + random(`gv${i}`) * 0.03;
    const t = (f * vel + random(`gf${i}`)) % 1;
    return { x: LLUVIA_X0 + random(`gx${i}`) * (LLUVIA_X1 - LLUVIA_X0), y: 2.9 - t * 2.8, z: (random(`gz${i}`) - 0.5) * 0.9 };
  });
  const largoRegla = X_PERSONA - LLUVIA_X1;
  const arco = Math.max(0.001, e.reloj) * Math.PI * 2;
  return (
    <group>
      <mesh geometry={suelo} position={[0, -0.15, 0]} receiveShadow>
        <meshStandardMaterial color="#3a5a3c" roughness={0.9} />
      </mesh>
      {/* pileta junto a la persona */}
      <mesh geometry={pileta} position={[X_PERSONA + 0.1, 0.02, 0.55]}>
        <meshStandardMaterial color="#4cc3ff" roughness={0.1} emissive="#2a8fd0" emissiveIntensity={0.3} />
      </mesh>
      <Persona alerta={e.persona} />
      {/* sol que sale */}
      <group position={[2.3, 3.7, -0.5]} scale={Math.max(0.01, 0.8 * e.sol)}>
        <mesh>
          <sphereGeometry args={[0.42, 32, 24]} />
          <meshBasicMaterial color="#ffd23a" />
        </mesh>
        <mesh scale={1 + 0.12 * Math.sin(f / 10)}>
          <sphereGeometry args={[0.66, 24, 18]} />
          <meshBasicMaterial color="#ffb02e" transparent opacity={0.28} depthWrite={false} />
        </mesh>
      </group>
      <Nube flash={e.flash} />
      {/* lluvia bajo la nube */}
      {e.lluvia > 0.01 &&
        gotas.map((g, i) => (
          <mesh key={i} position={[g.x, g.y, g.z]} scale={[1, e.lluvia, 1]}>
            <boxGeometry args={[0.025, 0.22, 0.025]} />
            <meshBasicMaterial color="#7fc3ff" transparent opacity={0.8 * e.lluvia} />
          </mesh>
        ))}
      {/* regla de distancia: del borde de la lluvia a la persona */}
      {e.regla > 0.01 && (
        <group>
          <mesh position={[LLUVIA_X1 + (largoRegla * e.regla) / 2, 0.14, 0.85]}>
            <boxGeometry args={[largoRegla * e.regla, 0.05, 0.05]} />
            <meshStandardMaterial color="#ffc53d" emissive="#ffc53d" emissiveIntensity={0.5} />
          </mesh>
          {[LLUVIA_X1, LLUVIA_X1 + largoRegla * e.regla].map((x, i) => (
            <mesh key={i} position={[x, 0.24, 0.85]}>
              <boxGeometry args={[0.06, 0.28, 0.06]} />
              <meshStandardMaterial color="#ffc53d" emissive="#ffc53d" emissiveIntensity={0.5} />
            </mesh>
          ))}
        </group>
      )}
      {e.rayo > 0.01 && <Bolt v={e.rayo} />}
      {/* reloj de treinta minutos: aro de fondo y arco que se llena */}
      {e.reloj > 0.001 && (
        <group position={[2.2, 2.4, 0.2]} scale={0.85}>
          <mesh>
            <torusGeometry args={[0.55, 0.05, 12, 64]} />
            <meshBasicMaterial color="#2c3550" transparent opacity={0.7} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} scale={[-1, 1, 1]}>
            <torusGeometry args={[0.55, 0.09, 12, 64, arco]} />
            <meshBasicMaterial color="#5fd2ff" />
          </mesh>
        </group>
      )}
    </group>
  );
};

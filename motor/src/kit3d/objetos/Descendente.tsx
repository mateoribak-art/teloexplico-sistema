import React, { useMemo } from "react";
import { random } from "remotion";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Corriente descendente de una tormenta, en un corte vertical: suelo con una casita y un sol,
// la nube arriba, gotas que se evaporan (vapor azul), una columna de aire frío que cae y se
// desparrama por el suelo como agua derramada. Con `caliente` el aire que baja es naranja (heat burst).
// Todo sale del frame: sin useFrame. Suelo en y = 0, base de la nube ~5,2, ancho útil ~5.

export type EstadoDescendente = {
  frame: number;
  nube: number; // opacidad de la nube (baja para ver adentro)
  gotas: number; // 0..1 gotas de lluvia dentro/bajo la nube
  vapor: number; // 0..1 vapor frío que sale de las gotas
  cae: number; // 0..1 avance de la columna de aire frío (0 arriba, 1 en el suelo)
  esparce: number; // 0..1 el aire frío se abre por el suelo
  caliente: number; // 0..1 el aire que baja es naranja
  sol: number; // 0..1 brillo del sol
  frescor: number; // 0..1 el suelo/cielo se tiñe de celeste
};

const caja = (w: number, h: number, d: number, r = 0.05) => new RoundedBoxGeometry(w, h, d, 4, r);

const Casa: React.FC = () => {
  const cuerpo = useMemo(() => caja(1.1, 0.8, 0.9, 0.06), []);
  return (
    <group position={[1.7, 0.4, 0]}>
      <mesh geometry={cuerpo} castShadow>
        <meshStandardMaterial color="#e8d9b8" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.62, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.92, 0.5, 4]} />
        <meshStandardMaterial color="#c0503a" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.12, 0.46]}>
        <boxGeometry args={[0.26, 0.5, 0.04]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.8} />
      </mesh>
    </group>
  );
};

const Nube: React.FC<{ opacidad: number }> = ({ opacidad }) => {
  const bolas = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const a = random(`dnb${i}`) * Math.PI * 2;
        const rr = 0.3 + random(`dnr${i}`) * 1.5;
        return {
          p: [Math.cos(a) * rr - 0.2, 5.9 + random(`dny${i}`) * 1.0 + (i > 13 ? 0.6 : 0), Math.sin(a) * rr * 0.5] as [number, number, number],
          r: 0.55 + random(`dns${i}`) * 0.5,
          oscura: i < 9,
        };
      }),
    []
  );
  const t = opacidad < 0.99;
  return (
    <group>
      {bolas.map((b, i) => (
        <mesh key={i} position={b.p}>
          <sphereGeometry args={[b.r, 24, 18]} />
          <meshStandardMaterial key={t ? "t" : "o"} color={b.oscura ? "#5f6a86" : "#dfe6f3"} roughness={1} transparent={t} opacity={opacidad} depthWrite={!t} />
        </mesh>
      ))}
    </group>
  );
};

export const Descendente: React.FC<{ e: EstadoDescendente }> = ({ e }) => {
  const f = e.frame;
  const suelo = useMemo(() => caja(5.6, 0.3, 2.4, 0.08), []);
  const gotas = Array.from({ length: 22 }, (_, i) => {
    const vel = 0.03 + random(`dgv${i}`) * 0.02;
    const t = (f * vel + random(`dgf${i}`)) % 1;
    return { x: -1.0 + random(`dgx${i}`) * 1.6, y: 5.4 - t * 1.6, z: (random(`dgz${i}`) - 0.5) * 0.6, t };
  });
  const vapores = Array.from({ length: 16 }, (_, i) => {
    const t = (f * 0.025 + random(`dvf${i}`)) % 1;
    return { x: -1.0 + random(`dvx${i}`) * 1.6 + Math.sin(f / 14 + i) * 0.12, y: 4.9 - t * 0.5, z: (random(`dvz${i}`) - 0.5) * 0.6, t };
  });
  // columna de aire que cae: cada burbuja sale de la base de la nube y cae más rápido a medida que baja
  const bajada = e.cae * e.cae;
  const aire = Array.from({ length: 20 }, (_, i) => {
    const dy = random(`dak${i}`) * 2.4;
    const y = Math.max(0.2, 5.0 - bajada * 4.8 - dy * (1 - e.cae * 0.6));
    return { x: -0.4 + (random(`dax${i}`) - 0.5) * 1.5, y, z: (random(`daz${i}`) - 0.5) * 0.8 };
  });
  const color = e.caliente > 0.5 ? "#ff8a3d" : "#58c8ff";
  const radio = e.esparce * 2.4;
  const flechas = Array.from({ length: 8 }, (_, i) => {
    const lado = i % 2 === 0 ? 1 : -1;
    const n = Math.floor(i / 2);
    const x = -0.4 + lado * (0.3 + radio * (0.35 + n * 0.22));
    return { x: Math.max(-2.6, Math.min(2.6, x)), n };
  });
  return (
    <group>
      <mesh geometry={suelo} position={[0, -0.15, 0]} receiveShadow>
        <meshStandardMaterial color={e.frescor > 0.5 ? "#34604a" : "#4b6a38"} roughness={0.9} />
      </mesh>
      <Casa />
      {/* sol */}
      <group position={[-2.1, 2.2, -0.4]}>
        <mesh>
          <sphereGeometry args={[0.4, 32, 24]} />
          <meshBasicMaterial color="#ffd23a" />
        </mesh>
        <mesh scale={1 + 0.15 * Math.sin(f / 10)}>
          <sphereGeometry args={[0.6, 24, 18]} />
          <meshBasicMaterial color="#ffb02e" transparent opacity={0.28 * e.sol} depthWrite={false} />
        </mesh>
      </group>
      <Nube opacidad={e.nube} />
      {/* gotas dentro de la nube */}
      {e.gotas > 0.01 &&
        gotas.map((g, i) => (
          <mesh key={i} position={[g.x, g.y, g.z]} scale={e.gotas * (1 - g.t * 0.6)}>
            <sphereGeometry args={[0.07, 12, 10]} />
            <meshStandardMaterial color="#9fd8ff" roughness={0.1} emissive="#7fc3ff" emissiveIntensity={0.3} />
          </mesh>
        ))}
      {/* vapor frío que sale de las gotas al evaporarse */}
      {e.vapor > 0.01 &&
        vapores.map((v, i) => (
          <mesh key={i} position={[v.x, v.y, v.z]} scale={0.6 + v.t * 1.2}>
            <sphereGeometry args={[0.1, 12, 10]} />
            <meshBasicMaterial color="#8fe0ff" transparent opacity={0.6 * e.vapor * Math.sin(Math.PI * v.t)} depthWrite={false} />
          </mesh>
        ))}
      {/* columna de aire que cae */}
      {e.cae > 0.01 && e.esparce < 0.3 &&
        aire.map((a, i) => (
          <mesh key={i} position={[a.x, a.y, a.z]}>
            <sphereGeometry args={[0.16, 14, 10]} />
            <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} />
          </mesh>
        ))}
      {/* aire que se desparrama por el suelo */}
      {e.esparce > 0.01 && (
        <group>
          <mesh position={[-0.4, 0.14, 0]} scale={[Math.max(0.05, radio), 1, Math.max(0.05, radio * 0.45)]}>
            <cylinderGeometry args={[1, 1, 0.22, 40]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} />
          </mesh>
          {flechas.map((a, i) => (
            <mesh key={i} position={[a.x, 0.3 + a.n * 0.1, (a.n - 1.5) * 0.25]} scale={0.6 + a.n * 0.15}>
              <sphereGeometry args={[0.13, 12, 10]} />
              <meshBasicMaterial color={color} transparent opacity={0.8 * Math.min(1, e.esparce * 3)} depthWrite={false} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

import React from "react";

// Pecera con un pez dorado. `reloj` 0→1 llena una barra de memoria (de "3 s" a "meses": 12 cubitos
// que se prenden); `tres` 1 muestra la barrita corta del mito; `red` 0→1 pasa una red por la pecera
// y el pez se escapa por el hueco; `laberinto` 1 pone tabiques; `comida` 0→1 hace caer escamas y el pez
// va a la esquina de la comida (`ir` 0→1). Todo sale del frame.

export type EstadoPecera = {
  frame: number;
  tres: number; // 0→1 barrita corta (mito)
  reloj: number; // 0→1 cubitos de semanas/meses encendidos
  red: number; // 0→1 recorrido de la red
  laberinto: number; // 0→1 tabiques
  comida: number; // 0→1 escamas cayendo
  ir: number; // 0→1 el pez va a la esquina de la comida
};

const NARANJA = "#ff8a2a";

const Pez: React.FC<{ pos: [number, number, number]; dir: number; frame: number }> = ({ pos, dir, frame }) => {
  const cola = Math.sin(frame / 3) * 0.45;
  return (
    <group position={pos} rotation={[0, dir > 0 ? 0 : Math.PI, 0]}>
      <mesh scale={[1.5, 0.85, 0.55]} castShadow>
        <sphereGeometry args={[0.32, 24, 20]} />
        <meshStandardMaterial color={NARANJA} roughness={0.4} emissive="#ff5a00" emissiveIntensity={0.18} />
      </mesh>
      <group position={[-0.45, 0, 0]} rotation={[0, cola, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.3]}>
          <coneGeometry args={[0.28, 0.4, 16]} />
          <meshStandardMaterial color="#ffb347" roughness={0.45} />
        </mesh>
      </group>
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0.2]} scale={[1, 1, 0.25]}>
        <coneGeometry args={[0.16, 0.3, 12]} />
        <meshStandardMaterial color="#ffb347" roughness={0.45} />
      </mesh>
      <mesh position={[0.3, 0.1, 0.16]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.33, 0.1, 0.2]}>
        <sphereGeometry args={[0.03, 10, 10]} />
        <meshStandardMaterial color="#101010" />
      </mesh>
    </group>
  );
};

export const Pecera: React.FC<{ e: EstadoPecera }> = ({ e }) => {
  const f = e.frame;
  // pez que nada en 8 y, si `ir`, va a la esquina de la comida
  const nx = Math.sin(f / 45) * 1.6;
  const ny = 0.2 + Math.sin(f / 31) * 0.45;
  const nz = Math.cos(f / 52) * 0.3;
  const objX = 1.9;
  const objY = 0.9;
  const t = Math.min(1, Math.max(0, e.ir));
  const px = nx * (1 - t) + objX * t;
  const py = ny * (1 - t) + objY * t;
  const dir = Math.cos(f / 45) * (1 - t) + t * 1;

  // red: barre de derecha a izquierda; el pez sale por arriba
  const rx = 2.4 - 4.8 * e.red;
  const hayRed = e.red > 0.01 && e.red < 0.99;

  const encendidos = Math.round(e.reloj * 12);
  return (
    <group position={[0, 0, 0]}>
      {/* base y arena */}
      <mesh position={[0, -1.55, 0]} receiveShadow>
        <boxGeometry args={[5.6, 0.18, 2.8]} />
        <meshStandardMaterial color="#26324a" roughness={0.6} />
      </mesh>
      <mesh position={[0, -1.4, 0]}>
        <boxGeometry args={[5.2, 0.14, 2.4]} />
        <meshStandardMaterial color="#d8c08a" roughness={0.9} />
      </mesh>
      {/* agua y vidrio */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5.2, 2.7, 2.4]} />
        <meshStandardMaterial color="#3aa6d8" transparent opacity={0.22} depthWrite={false} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[5.26, 2.78, 2.46]} />
        <meshStandardMaterial color="#cfeaff" transparent opacity={0.08} depthWrite={false} roughness={0.05} />
      </mesh>
      {/* plantas */}
      {[-2.1, -1.8, 2.3].map((x, i) => (
        <mesh key={i} position={[x, -0.9 + Math.sin(f / 20 + i) * 0.03, -0.7]} rotation={[0, 0, Math.sin(f / 25 + i) * 0.1]}>
          <coneGeometry args={[0.16, 1.0 + i * 0.2, 8]} />
          <meshStandardMaterial color="#3fbf6a" roughness={0.7} />
        </mesh>
      ))}

      {/* laberinto: tabiques */}
      {e.laberinto > 0.02 &&
        [
          [-0.9, -0.6, 1.4],
          [0.5, 0.3, 1.6],
          [1.6, -0.6, 1.2],
        ].map(([x, y, h], i) => (
          <mesh key={i} position={[x, y, 0]} scale={[1, e.laberinto, 1]}>
            <boxGeometry args={[0.12, h, 1.4]} />
            <meshStandardMaterial color="#9fb4d8" roughness={0.5} transparent opacity={0.85} />
          </mesh>
        ))}

      {/* pez */}
      <Pez pos={[px, py, nz]} dir={dir} frame={f} />

      {/* red */}
      {hayRed && (
        <group position={[rx, 0.3, 0.9]}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.8, 0.04, 8, 32]} />
            <meshStandardMaterial color="#e8e8e8" roughness={0.5} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.8, 24]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} wireframe />
          </mesh>
          <mesh position={[0.9, 0.9, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
            <meshStandardMaterial color="#b88a52" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* escamas de comida */}
      {e.comida > 0.02 &&
        Array.from({ length: 8 }, (_, i) => {
          const y = 1.3 - ((f * 0.02 + i * 0.37) % 1.6) * (0.4 + 0.6 * e.comida);
          return (
            <mesh key={i} position={[objX + Math.sin(i * 2.3) * 0.35, y, Math.cos(i * 1.7) * 0.4]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffd36a" emissive="#ffb000" emissiveIntensity={0.3} transparent opacity={e.comida} />
            </mesh>
          );
        })}

      {/* burbujas */}
      {Array.from({ length: 5 }, (_, i) => {
        const y = -1.2 + ((f * 0.025 + i * 0.5) % 2.6);
        return (
          <mesh key={i} position={[-2.2 + i * 0.12, y, 0.6]}>
            <sphereGeometry args={[0.05 + (i % 3) * 0.02, 10, 10]} />
            <meshStandardMaterial color="#e8f6ff" transparent opacity={0.5} depthWrite={false} />
          </mesh>
        );
      })}

      {/* barra de memoria: mito (corta, roja) vs 12 cubitos (semanas/meses) sobre la pecera */}
      {e.tres > 0.02 && (
        <mesh position={[-1.65, 1.95, 0]} scale={[e.tres, 1, 1]}>
          <boxGeometry args={[0.24, 0.24, 0.24]} />
          <meshStandardMaterial color="#ff5a5a" emissive="#ff2a2a" emissiveIntensity={0.4} />
        </mesh>
      )}
      {Array.from({ length: 12 }, (_, i) => {
        const on = i < encendidos;
        return (
          <mesh key={i} position={[-1.65 + i * 0.3, 1.95, 0]}>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            <meshStandardMaterial
              color={on ? "#5fd2ff" : "#2a3550"}
              emissive={on ? "#2aa8e0" : "#000000"}
              emissiveIntensity={on ? 0.6 : 0}
              transparent
              opacity={e.reloj > 0.01 ? 1 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
};

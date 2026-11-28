import React from "react";

// Casa con garage abierto y un generador portátil. El generador arranca adentro del garage (x=-3.5) y se muestra
// la nube de monóxido (rojiza) que se acumula aunque la puerta esté abierta. `afuera` 0→1 lo lleva a 20 pies de la casa
// (x=+5). `co` 0→1 nube dentro del garage; `regla` 0→1 dibuja la línea de 20 pies; `porche` 0→1 marca la zona prohibida.

export type EstadoGenerador = {
  frame: number;
  co: number;
  afuera: number;
  regla: number;
  porche: number;
  marcha: number;
};

export const GeneradorVacio: EstadoGenerador = { frame: 0, co: 0, afuera: 0, regla: 0, porche: 0, marcha: 1 };

const cl = (v: number) => Math.min(1, Math.max(0, v));

export const Generador: React.FC<{ e: EstadoGenerador }> = ({ e }) => {
  const co = cl(e.co);
  const afuera = cl(e.afuera);
  const regla = cl(e.regla);
  const porche = cl(e.porche);
  const gx = -3.5 + afuera * 8.5;
  const vibra = e.marcha > 0 ? Math.sin(e.frame * 1.7) * 0.008 : 0;
  const nubes = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const p = (e.frame / 90 + i / 7) % 1;
    const x = -3.5 + Math.sin(i * 2.3) * 0.7 - p * 0.4;
    return (
      <mesh key={i} position={[x - (1 - afuera) * 0, 0.5 + p * 1.7 + (i % 3) * 0.12, Math.cos(i * 1.7) * 0.5]} scale={0.3 + co * 0.35 + p * 0.3}>
        <sphereGeometry args={[0.5, 14, 14]} />
        <meshBasicMaterial color="#ff5a4a" transparent opacity={co * (0.22 - p * 0.14)} depthWrite={false} />
      </mesh>
    );
  });
  const nubesAfuera = [0, 1, 2, 3].map((i) => {
    const p = (e.frame / 60 + i / 4) % 1;
    return (
      <mesh key={i} position={[gx + 0.7 + p * 2.4, 0.6 + p * 1.2, Math.sin(i * 3) * 0.3]} scale={0.3 + p * 0.5}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial color="#ff8a7a" transparent opacity={afuera * (0.25 - p * 0.2)} depthWrite={false} />
      </mesh>
    );
  });
  return (
    <group>
      {/* piso / pasto */}
      <mesh position={[-3, -0.12, 0]} receiveShadow>
        <boxGeometry args={[7, 0.2, 5]} />
        <meshStandardMaterial color="#3a4660" roughness={0.95} />
      </mesh>
      <mesh position={[5, -0.12, 0]} receiveShadow>
        <boxGeometry args={[9, 0.2, 5]} />
        <meshStandardMaterial color="#2f5b46" roughness={1} />
      </mesh>
      {/* casa con garage: pared de fondo, laterales y techo; el frente (derecha) abierto */}
      <mesh position={[-6.4, 1.3, 0]} castShadow>
        <boxGeometry args={[0.2, 2.8, 5]} />
        <meshStandardMaterial color="#c9b79a" roughness={0.9} />
      </mesh>
      <mesh position={[-3, 1.3, -2.4]} castShadow>
        <boxGeometry args={[7, 2.8, 0.2]} />
        <meshStandardMaterial color="#d6c6a8" roughness={0.9} />
      </mesh>
      <mesh position={[-3, 2.8, 0]} castShadow>
        <boxGeometry args={[7, 0.2, 5]} />
        <meshStandardMaterial color="#8f4a3c" roughness={0.8} />
      </mesh>
      <mesh position={[-3, 1.3, 2.4]}>
        <boxGeometry args={[7, 2.8, 0.2]} />
        <meshStandardMaterial color="#d6c6a8" roughness={0.9} transparent opacity={0.2} />
      </mesh>
      {/* puerta del garage levantada (riel arriba) */}
      <mesh position={[-0.02, 2.55, 0]}>
        <boxGeometry args={[0.1, 0.25, 4.6]} />
        <meshStandardMaterial color="#9aa3b4" />
      </mesh>
      {/* nube de CO en el garage */}
      {nubes}
      {/* generador */}
      <group position={[gx, 0.45 + vibra, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.1, 0.8, 0.8]} />
          <meshStandardMaterial color="#e8453c" roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.7, 0.2, 0.5]} />
          <meshStandardMaterial color="#2c2f3a" roughness={0.6} />
        </mesh>
        {[-0.5, 0.5].map((x, i) => (
          <mesh key={i} position={[x, -0.5, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.12, 20]} />
            <meshStandardMaterial color="#1c1f27" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0.6, 0.15, 0]}>
          <boxGeometry args={[0.05, 0.4, 0.5]} />
          <meshStandardMaterial color="#c9ced9" />
        </mesh>
        <mesh position={[-0.66, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.3, 14]} />
          <meshStandardMaterial color="#5a606e" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
      {nubesAfuera}
      {/* zona prohibida: porche y carport pegados a la casa */}
      {porche > 0.01 && (
        <mesh position={[1.1, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.2, 4]} />
          <meshBasicMaterial color="#ff3b30" transparent opacity={porche * 0.4} />
        </mesh>
      )}
      {/* regla de 20 pies */}
      {regla > 0.01 && (
        <group position={[0, 0.06, 1.8]}>
          <mesh position={[(regla * 5) / 2, 0, 0]}>
            <boxGeometry args={[regla * 5, 0.05, 0.08]} />
            <meshStandardMaterial color="#5fd2ff" emissive="#2aa8e0" emissiveIntensity={1.3} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.06, 0.5, 0.06]} />
            <meshStandardMaterial color="#5fd2ff" emissive="#2aa8e0" emissiveIntensity={1.3} />
          </mesh>
          <mesh position={[regla * 5, 0.25, 0]}>
            <boxGeometry args={[0.06, 0.5, 0.06]} />
            <meshStandardMaterial color="#5fd2ff" emissive="#2aa8e0" emissiveIntensity={1.3} />
          </mesh>
        </group>
      )}
    </group>
  );
};

import React from "react";

// Dos pelos sobre un bloque de piel visto de costado. Izquierda: pelo sin afeitar, termina en punta fina.
// Derecha: el mismo pelo afeitado: la navaja lo corta a mitad de camino y la punta queda roma (plana).
// Mide ~4 de ancho; la piel está en y = 0 a 0.4 (superficie en y = 0.4).

export type EstadoPelo = {
  frame: number;
  navaja: number; // 0..1 recorrido de la navaja sobre el pelo de la derecha
  rebrote: number; // 0..1 el pelo afeitado vuelve a asomar (punta roma a la vista)
  foco: number; // 0..1 aro brillante sobre la punta
  hormona: number; // 0..1 un tercer pelo, más grueso, aparece (pubertad)
  piel: number; // 0..1 opacidad de la piel
};

const SUP = 0.4;
const ACENTO = "#ffc53d";

const Navaja: React.FC<{ t: number }> = ({ t }) => {
  if (t <= 0.001 || t >= 0.999) return null;
  const x = 2.6 - t * 3.0;
  return (
    <group position={[x, SUP + 0.55, -0.5]} rotation={[0, 0, -0.1]} scale={0.6}>
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.08, 0.7]} />
        <meshStandardMaterial color="#c9d3e0" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0.2, 0.22, 0]}>
        <boxGeometry args={[0.7, 0.36, 0.6]} />
        <meshStandardMaterial color="#2a3a5e" roughness={0.5} />
      </mesh>
    </group>
  );
};

export const Pelo: React.FC<{ e: EstadoPelo }> = ({ e }) => {
  const corte = e.navaja > 0.5;
  const largo = 1.7;
  return (
    <group position={[0, 0, 0]}>
      {/* piel */}
      <mesh position={[0, SUP / 2 - 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.6, SUP + 0.1, 1.6]} />
        <meshStandardMaterial color="#e6b28c" roughness={0.6} transparent opacity={Math.max(0.05, e.piel)} />
      </mesh>
      {/* pelo sin afeitar: punta fina */}
      <mesh position={[-1.3, SUP + largo / 2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.16, largo, 20]} />
        <meshStandardMaterial color="#3b2a22" roughness={0.5} />
      </mesh>
      {/* pelo afeitado: se corta a mitad de camino (cilindro más ancho que la punta, tope plano) */}
      {!corte && (
        <mesh position={[1.3, SUP + largo / 2, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.16, largo, 20]} />
          <meshStandardMaterial color="#3b2a22" roughness={0.5} />
        </mesh>
      )}
      {corte && (
        <>
          <mesh position={[1.3, SUP + 0.5 / 2, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.16, 0.5, 20]} />
            <meshStandardMaterial color="#3b2a22" roughness={0.5} />
          </mesh>
          {/* el tope plano resaltado */}
          <mesh position={[1.3, SUP + 0.5 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.11, 24]} />
            <meshStandardMaterial color="#7a5a48" roughness={0.9} emissive={ACENTO} emissiveIntensity={0.25 * e.rebrote} />
          </mesh>
          {/* el pedazo cortado cae */}
          <mesh position={[1.3 + 0.5 * (1 - e.rebrote) * 0 + (e.navaja - 0.5) * 1.5, SUP + 0.5 + 0.6 * (1 - Math.min(1, (e.navaja - 0.5) * 3)) , 0]} rotation={[0, 0, 0.6 + e.navaja * 2]}>
            <cylinderGeometry args={[0.03, 0.11, 1.1, 14]} />
            <meshStandardMaterial color="#3b2a22" roughness={0.5} transparent opacity={Math.max(0, 1 - (e.navaja - 0.5) * 2.5)} />
          </mesh>
        </>
      )}
      <Navaja t={e.navaja} />
      {/* pubertad: un pelo más grueso que aparece solo */}
      {e.hormona > 0.01 && (
        <mesh position={[0, SUP + (largo * e.hormona) / 2, 0.4]} castShadow>
          <cylinderGeometry args={[0.03, 0.26, largo * e.hormona, 20]} />
          <meshStandardMaterial color="#2a1c16" roughness={0.5} />
        </mesh>
      )}
      {/* aro de foco sobre la punta roma */}
      {e.foco > 0.01 && (
        <mesh position={[1.3, SUP + 0.5, 0]}>
          <sphereGeometry args={[0.38, 24, 18]} />
          <meshBasicMaterial color={ACENTO} transparent opacity={0.2 * e.foco} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

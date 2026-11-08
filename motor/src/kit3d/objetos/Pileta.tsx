import React from "react";

// Pileta: borde de baldosas a la izquierda con un plato y un reloj de pared, agua a la derecha con una
// persona metida hasta la cintura (torso translúcido: se ve el estómago). La sangre son bolitas rojas que
// van hacia el estómago, pero solo un poco; brazos y piernas siguen "encendidos" en verde.
// Todo sale del frame. El piso está en y = 0.

export type EstadoPileta = {
  frame: number;
  plato: number; // 0..1 aparece el plato con la comida
  reloj: number; // 0..1 aparece el reloj (la espera)
  persona: number; // 0..1 la persona aparece en el agua
  sangre: number; // 0..1 bolitas de sangre que van al estómago (siempre pocas)
  musculos: number; // 0..1 brazos y piernas brillan en verde (funcionan)
  libro: number; // 0..1 aparece el manual de 1908
  puntada: number; // 0..1 destello de la puntada en el costado
  botella: number; // 0..1 aparece la botella (alcohol), en rojo
};

const PIEL = "#e7b98f";
const AGUA = "#3aa7ff";

export const Pileta: React.FC<{ e: EstadoPileta }> = ({ e }) => {
  const f = e.frame;
  const sp = (v: number) => 0.001 + v;
  const ola = Math.sin(f / 14) * 0.03;
  const aguja = (f / 30) * 1.2; // la aguja del reloj gira
  const bolitas = [0, 1, 2, 3, 4].map((i) => {
    const t = ((f / 40 + i / 5) % 1) * e.sangre;
    return { t, i };
  });
  return (
    <group scale={0.55}>
      {/* borde */}
      <mesh position={[-3.2, -0.15, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.3, 5]} />
        <meshStandardMaterial color="#c9d1dd" roughness={0.6} />
      </mesh>
      {/* cuenco de la pileta */}
      <mesh position={[2.6, -0.5, 0]}>
        <boxGeometry args={[6.4, 1, 5]} />
        <meshStandardMaterial color="#1d4a78" roughness={0.6} />
      </mesh>
      {/* agua translúcida */}
      <mesh position={[2.6, 0.55 + ola, 0.1]}>
        <boxGeometry args={[6.2, 1.1, 4.8]} />
        <meshStandardMaterial color={AGUA} transparent opacity={0.35} roughness={0.2} />
      </mesh>

      {/* plato con hamburguesa */}
      <group position={[-3.6, 0, 0.5]} scale={sp(e.plato)}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.9, 0.75, 0.12, 32]} />
          <meshStandardMaterial color="#f4f1ea" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.2, 0]} scale={[1, 0.5, 1]}>
          <sphereGeometry args={[0.55, 24, 16]} />
          <meshStandardMaterial color="#d99a46" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.1, 24]} />
          <meshStandardMaterial color="#6b3a1c" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.5, 0]} scale={[1, 0.55, 1]}>
          <sphereGeometry args={[0.55, 24, 16]} />
          <meshStandardMaterial color="#e0a553" roughness={0.6} />
        </mesh>
      </group>

      {/* reloj (la espera) */}
      <group position={[-3.2, 2.3, -1.6]} scale={sp(e.reloj)}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.15, 36]} />
          <meshStandardMaterial color="#f4f1ea" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.1]} rotation={[0, 0, -aguja]}>
          <boxGeometry args={[0.07, 0.7, 0.05]} />
          <meshStandardMaterial color="#e03b3b" />
        </mesh>
        <mesh position={[0, 0, 0.1]} rotation={[0, 0, -aguja / 12]}>
          <boxGeometry args={[0.1, 0.45, 0.05]} />
          <meshStandardMaterial color="#1b1f2c" />
        </mesh>
      </group>

      {/* manual de 1908 */}
      <group position={[-2.2, 0.12, 1.3]} rotation={[-0.2, 0.3, 0]} scale={sp(e.libro)}>
        <mesh>
          <boxGeometry args={[1.0, 0.16, 1.4]} />
          <meshStandardMaterial color="#8a6b3b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[0.9, 0.02, 1.3]} />
          <meshStandardMaterial color="#f0e2b6" roughness={0.9} />
        </mesh>
      </group>

      {/* persona en el agua */}
      <group position={[2.4, 0, 0]} scale={sp(e.persona)}>
        {/* cabeza */}
        <mesh position={[0, 3.15, 0]}>
          <sphereGeometry args={[0.38, 24, 18]} />
          <meshStandardMaterial color={PIEL} roughness={0.6} />
        </mesh>
        {/* torso translúcido */}
        <mesh position={[0, 2.1, 0]}>
          <cylinderGeometry args={[0.55, 0.5, 1.4, 28]} />
          <meshStandardMaterial color={PIEL} transparent opacity={0.4} roughness={0.5} />
        </mesh>
        {/* estómago */}
        <mesh position={[0.1, 1.85, 0]} scale={[1.1, 0.8, 0.9]}>
          <sphereGeometry args={[0.3, 20, 16]} />
          <meshStandardMaterial color="#ff9a5a" emissive="#ff6a2a" emissiveIntensity={0.3 + e.sangre * 0.15} />
        </mesh>
        {/* brazos */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.85, 2.15, 0]} rotation={[0, 0, s * -0.35]}>
            <cylinderGeometry args={[0.15, 0.13, 1.2, 14]} />
            <meshStandardMaterial
              color={e.musculos > 0.5 ? "#7bd88f" : PIEL}
              emissive="#2fd46a"
              emissiveIntensity={e.musculos * 0.6}
              roughness={0.5}
            />
          </mesh>
        ))}
        {/* piernas (bajo el agua) */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.25, 0.4, 0]}>
            <cylinderGeometry args={[0.17, 0.14, 1.3, 14]} />
            <meshStandardMaterial
              color={e.musculos > 0.5 ? "#7bd88f" : PIEL}
              emissive="#2fd46a"
              emissiveIntensity={e.musculos * 0.6}
              roughness={0.5}
            />
          </mesh>
        ))}
        {/* sangre hacia el estómago: pocas bolitas */}
        {bolitas.map(({ t, i }) => (
          <mesh key={i} position={[(i - 2) * 0.18 * (1 - t) + 0.1 * t, 2.7 - t * 0.85, 0.35]} scale={t > 0.01 ? 1 : 0.001}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color="#e0262d" emissive="#e0262d" emissiveIntensity={0.6} />
          </mesh>
        ))}
        {/* puntada: destello en el costado */}
        <mesh position={[0.62, 1.85, 0.1]} scale={0.001 + e.puntada * (1 + 0.15 * Math.sin(f / 3))}>
          <octahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial color="#ffd23a" emissive="#ffd23a" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* botella (alcohol) */}
      <group position={[-1.6, 0, -1.2]} scale={sp(e.botella)}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1.0, 20]} />
          <meshStandardMaterial color="#c0392b" emissive="#e0262d" emissiveIntensity={e.botella * 0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.12, 0.2, 0.5, 16]} />
          <meshStandardMaterial color="#c0392b" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

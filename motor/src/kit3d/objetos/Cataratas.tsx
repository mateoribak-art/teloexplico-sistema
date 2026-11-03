import React from "react";

// Cataratas: un paredón con una cortina de agua que cae y, delante, hasta seis piletas olímpicas (escala 1:10, 5 x 2,5 en planta)
// que se llenan una tras otra. Todo sale del estado (frame → números). Piso en y = 0.

export type EstadoCataratas = {
  frame: number;
  cascada: number; // 0..1 aparece la cortina de agua
  piletas: number; // 0..1 aparecen las piletas (vacías)
  llenas: number; // 0..6 cuántas piletas están llenas (decimales = la que se está llenando)
  visibles: number; // 1..6 cuántas piletas se dibujan
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const AGUA = "#4fb6ff";

const POS: [number, number][] = [
  [-1.6, 1.0],
  [1.6, 1.0],
  [-1.6, 2.9],
  [1.6, 2.9],
  [-1.6, 4.8],
  [1.6, 4.8],
];
const PIL = { ancho: 2.6, largo: 1.3, alto: 0.35 };

const Pileta: React.FC<{ llena: number; v: number; brillo: boolean }> = ({ llena, v, brillo }) => {
  if (v <= 0) return null;
  const h = Math.max(0.001, (PIL.alto - 0.06) * clamp01(llena));
  return (
    <group scale={[v, v, v]}>
      {/* base y bordes */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[PIL.ancho + 0.12, 0.04, PIL.largo + 0.12]} />
        <meshStandardMaterial color="#e9efe2" roughness={0.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`l${s}`} position={[s * (PIL.ancho / 2 + 0.03), PIL.alto / 2, 0]} castShadow>
          <boxGeometry args={[0.06, PIL.alto, PIL.largo + 0.12]} />
          <meshStandardMaterial color="#e9efe2" roughness={0.6} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`c${s}`} position={[0, PIL.alto / 2, s * (PIL.largo / 2 + 0.03)]} castShadow>
          <boxGeometry args={[PIL.ancho + 0.12, PIL.alto, 0.06]} />
          <meshStandardMaterial color="#e9efe2" roughness={0.6} />
        </mesh>
      ))}
      {/* agua */}
      <mesh position={[0, 0.04 + h / 2, 0]}>
        <boxGeometry args={[PIL.ancho, h, PIL.largo]} />
        <meshStandardMaterial color={AGUA} roughness={0.2} transparent opacity={0.85} emissive={AGUA} emissiveIntensity={brillo ? 0.45 : 0.15} />
      </mesh>
    </group>
  );
};

export const Cataratas: React.FC<{ e: EstadoCataratas }> = ({ e }) => {
  const c = clamp01(e.cascada);
  const activa = Math.min(5, Math.floor(e.llenas));
  const [ax, az] = POS[activa];
  const llenandose = e.llenas < 6 && e.piletas > 0.9 && e.llenas > 0.02;
  return (
    <group>
      {/* paredón */}
      <mesh position={[0, 1.6 * c, -3.2]} scale={[1, Math.max(0.001, c), 1]} castShadow receiveShadow>
        <boxGeometry args={[11, 3.2, 1.2]} />
        <meshStandardMaterial color="#2a3350" roughness={0.9} />
      </mesh>
      {/* cortina de agua: tiras que se desplazan hacia abajo */}
      {c > 0.05 &&
        Array.from({ length: 18 }, (_, i) => {
          const x = -4.8 + i * 0.565;
          const fase = ((e.frame * (0.09 + (i % 3) * 0.02) + i * 0.37) % 1);
          const alto = 3.2;
          return (
            <group key={`t${i}`}>
              <mesh position={[x, alto / 2, -2.55]}>
                <boxGeometry args={[0.5, alto, 0.12]} />
                <meshStandardMaterial color={AGUA} roughness={0.25} transparent opacity={0.55 * c} emissive={AGUA} emissiveIntensity={0.25} />
              </mesh>
              <mesh position={[x, alto * (1 - fase), -2.47]}>
                <boxGeometry args={[0.36, 0.55, 0.06]} />
                <meshStandardMaterial color="#ffffff" roughness={0.4} transparent opacity={0.85 * c} emissive="#ffffff" emissiveIntensity={0.4} />
              </mesh>
            </group>
          );
        })}
      {/* neblina al pie */}
      {c > 0.05 && (
        <mesh position={[0, 0.2, -2.3]}>
          <boxGeometry args={[10.4, 0.4, 0.5]} />
          <meshStandardMaterial color="#cfeaff" roughness={0.8} transparent opacity={0.5 * c} emissive="#cfeaff" emissiveIntensity={0.3} />
        </mesh>
      )}
      {/* piletas olímpicas a escala */}
      {POS.map(([x, z], i) => {
        const v = i < e.visibles ? clamp01(e.piletas * 1.6 - i * 0.04) : 0;
        return (
          <group key={`p${i}`} position={[x, 0, z]}>
            <Pileta llena={e.llenas - i} v={v} brillo={i === activa && llenandose} />
          </group>
        );
      })}
      {/* chorro que llena la pileta activa */}
      {llenandose && (
        <mesh position={[ax, 1.9, az]}>
          <boxGeometry args={[0.45, 3.4, 0.45]} />
          <meshStandardMaterial color={AGUA} roughness={0.2} transparent opacity={0.6} emissive={AGUA} emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
};

import React from "react";
import * as THREE from "three";

// Coche de subte antiguo (tipo "Brujas" de la línea A: carrocería de madera sobre estructura de acero) en un túnel.
// Todo sale del estado (frame → números). Riel en y = 0, el coche mide ~4.4 en x, centrado en el origen.

export type EstadoSubte = {
  frame: number;
  avance: number; // posición x del coche (0 = centro)
  tunel: number; // 0..1 aparece el túnel
  faro: number; // 0..1 faro encendido
  corte: number; // 0..1 la carrocería de madera se vuelve transparente y se ve la estructura de acero
  nuevo: number; // posición x del tren moderno en la misma vía (|x| >= 11 = fuera de cuadro)
  aro: number; // 0..1 aro de acento sobre el coche
};

const ACENTO = "#ffc53d";
const MADERA = "#8b5a2b";
const L = 4.4;
const A = 1.15; // alto de caja
const AN = 1.0; // ancho

const Rueda: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <mesh position={[x, 0.17, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
    <cylinderGeometry args={[0.17, 0.17, 0.06, 20]} />
    <meshStandardMaterial color="#2b2f38" metalness={0.8} roughness={0.4} />
  </mesh>
);

export const Coche: React.FC<{ corte: number; faro: number; moderno?: boolean }> = ({ corte, faro, moderno = false }) => {
  const op = 1 - corte * 0.88;
  const color = moderno ? "#d9dde3" : MADERA;
  const techo = moderno ? "#b9bec6" : "#5b3a1a";
  return (
    <group>
      {/* caja */}
      <mesh position={[0, 0.3 + A / 2, 0]} castShadow>
        <boxGeometry args={[L, A, AN]} />
        <meshStandardMaterial key={`c${corte > 0.01}`} color={color} roughness={0.6} transparent={corte > 0.01} opacity={op} depthWrite={corte < 0.01} />
      </mesh>
      {/* techo */}
      <mesh position={[0, 0.3 + A + 0.07, 0]} castShadow>
        <boxGeometry args={[L + 0.1, 0.14, AN - 0.1]} />
        <meshStandardMaterial key={`t${corte > 0.01}`} color={techo} roughness={0.6} transparent={corte > 0.01} opacity={op} depthWrite={corte < 0.01} />
      </mesh>
      {/* ventanas a los dos lados */}
      {[-1.5, -0.5, 0.5, 1.5].map((x) =>
        [-1, 1].map((s) => (
          <mesh key={`${x}${s}`} position={[x, 0.3 + A * 0.62, s * (AN / 2 + 0.005)]}>
            <boxGeometry args={[0.68, 0.45, 0.02]} />
            <meshStandardMaterial color="#9fc4e8" emissive="#6e9fcf" emissiveIntensity={0.35} roughness={0.2} transparent opacity={0.9 * op + 0.1} />
          </mesh>
        )),
      )}
      {/* franja inferior */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.42, s * (AN / 2 + 0.006)]}>
          <boxGeometry args={[L, 0.1, 0.02]} />
          <meshStandardMaterial color={moderno ? "#e04a4a" : "#c9a14a"} roughness={0.5} transparent opacity={op} />
        </mesh>
      ))}
      {/* estructura de acero (aparece al cortar) */}
      {corte > 0.01 && (
        <group>
          {[-1, 1].map((s) =>
            [0.3, 0.3 + A].map((y) => (
              <mesh key={`${s}${y}`} position={[0, y, s * (AN / 2 - 0.04)]}>
                <boxGeometry args={[L, 0.07, 0.07]} />
                <meshStandardMaterial color="#aab4c4" metalness={0.9} roughness={0.3} transparent opacity={corte} />
              </mesh>
            )),
          )}
          {[-2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1].map((x) =>
            [-1, 1].map((s) => (
              <mesh key={`${x}${s}`} position={[x, 0.3 + A / 2, s * (AN / 2 - 0.04)]}>
                <boxGeometry args={[0.07, A, 0.07]} />
                <meshStandardMaterial color="#aab4c4" metalness={0.9} roughness={0.3} transparent opacity={corte} />
              </mesh>
            )),
          )}
          {/* techo en arco de costillas */}
          {[-1.4, 0, 1.4].map((x) => (
            <mesh key={x} position={[x, 0.3 + A, 0]}>
              <boxGeometry args={[0.07, 0.07, AN - 0.05]} />
              <meshStandardMaterial color="#aab4c4" metalness={0.9} roughness={0.3} transparent opacity={corte} />
            </mesh>
          ))}
        </group>
      )}
      {/* bogies y ruedas */}
      <mesh position={[0, 0.27, 0]}>
        <boxGeometry args={[L - 0.4, 0.06, AN - 0.3]} />
        <meshStandardMaterial color="#20242c" metalness={0.6} roughness={0.5} />
      </mesh>
      {[-1.5, -0.9, 0.9, 1.5].map((x) =>
        [-0.35, 0.35].map((z) => <Rueda key={`${x}${z}`} x={x} z={z} />),
      )}
      {/* faro */}
      <mesh position={[L / 2 + 0.02, 0.75, 0]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial color="#fff2c4" emissive="#ffd770" emissiveIntensity={faro * 2.2} />
      </mesh>
      {faro > 0.05 && (
        <pointLight position={[L / 2 + 0.5, 0.8, 0]} intensity={faro * 14} distance={7} color="#ffd770" />
      )}
    </group>
  );
};

export const Subte: React.FC<{ e: EstadoSubte }> = ({ e }) => {
  const pulso = 1 + Math.sin(e.frame * 0.25) * 0.05;
  return (
    <group>
      {/* vías */}
      {[-0.35, 0.35].map((z) => (
        <mesh key={z} position={[0, 0.04, z]} receiveShadow>
          <boxGeometry args={[30, 0.05, 0.07]} />
          <meshStandardMaterial color="#8d95a3" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={i} position={[-14 + i * 1.2 - ((e.avance * 0.0) % 1.2), 0.0, 0]} receiveShadow>
          <boxGeometry args={[0.18, 0.04, 1.3]} />
          <meshStandardMaterial color="#3a2d22" roughness={0.9} />
        </mesh>
      ))}
      {/* túnel: medio cilindro oscuro visto desde adentro */}
      {e.tunel > 0.01 && (
        <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} scale={[e.tunel, 1, e.tunel]}>
          <cylinderGeometry args={[2.7, 2.7, 40, 40, 1, true]} />
          <meshStandardMaterial color="#1b2230" roughness={0.9} side={THREE.BackSide} />
        </mesh>
      )}
      {/* luces del túnel */}
      {e.tunel > 0.5 &&
        [-9, -4.5, 0, 4.5, 9].map((x) => (
          <mesh key={x} position={[x, 2.2, -1.5]}>
            <sphereGeometry args={[0.08, 10, 8]} />
            <meshStandardMaterial color="#fff2c4" emissive="#ffd770" emissiveIntensity={1.6} />
          </mesh>
        ))}
      {/* tren moderno en la otra vía */}
      {Math.abs(e.nuevo) < 11 && (
        <group position={[e.nuevo, 0, 0]} scale={[-1, 1, 1]}>
          <Coche corte={0} faro={1} moderno />
        </group>
      )}
      {/* coche antiguo */}
      <group position={[e.avance, 0, 0]}>
        <Coche corte={e.corte} faro={e.faro} />
        {e.aro > 0.01 && (
          <mesh position={[0, 2.3, 0]} scale={e.aro * pulso}>
            <torusGeometry args={[0.35, 0.05, 12, 36]} />
            <meshStandardMaterial color={ACENTO} emissive={ACENTO} emissiveIntensity={0.7} />
          </mesh>
        )}
      </group>
    </group>
  );
};

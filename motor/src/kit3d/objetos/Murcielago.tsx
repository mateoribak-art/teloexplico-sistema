import React, { useMemo } from "react";
import * as THREE from "three";

// Murciélago 3D low-poly (cuerpo, cabeza, orejas, ojos que brillan, alas que aletean según el frame)
// + anillos de sonar y polilla. Todo sale del estado. Mira hacia +x.

export type EstadoMurcielago = {
  frame: number;
  aparece: number; // 0..1
  ojos: number; // 0..1 brillo de los ojos
  sonar: number; // frame de inicio de los pulsos (-1 = sin sonar)
  polilla: number; // 0..1 aparece la polilla; >1 = atrapada (desaparece)
  grande: number; // 0..1 versión frugívoro grande (ojos grandes, sin sonar)
  x: number;
  y: number;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const PIEL = "#3a2e3f";
const ACENTO = "#ffd23f";

const Ala: React.FC<{ lado: 1 | -1; aleteo: number }> = ({ lado, aleteo }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(1.6, 0.9);
    s.lineTo(1.4, 0.2);
    s.lineTo(1.2, -0.3);
    s.lineTo(0.9, 0);
    s.lineTo(0.6, -0.5);
    s.lineTo(0, -0.5);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <group rotation={[0, 0, 0]} scale={[1, 1, lado]}>
      <group rotation={[aleteo * lado, 0, 0]}>
        <mesh geometry={geo} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} castShadow>
          <meshStandardMaterial color={PIEL} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

export const Murcielago: React.FC<{ e: EstadoMurcielago }> = ({ e }) => {
  const a = clamp01(e.aparece);
  const g = clamp01(e.grande);
  const tam = (0.8 + 0.55 * g) * a;
  const aleteo = Math.sin(e.frame * 0.45) * 0.6;
  const brilloOjos = clamp01(e.ojos);
  const ojo = 0.075 + 0.06 * g;
  const t = e.sonar >= 0 ? e.frame - e.sonar : -1;
  const polilla = e.polilla;
  return (
    <group position={[e.x, e.y + Math.sin(e.frame * 0.2) * 0.05, 0]}>
      <group scale={[tam, tam, tam]}>
        {/* cuerpo */}
        <mesh position={[-0.1, 0, 0]} scale={[1.2, 0.8, 0.8]} castShadow>
          <sphereGeometry args={[0.35, 24, 18]} />
          <meshStandardMaterial color={PIEL} roughness={0.7} />
        </mesh>
        {/* cabeza */}
        <mesh position={[0.4, 0.08, 0]} castShadow>
          <sphereGeometry args={[0.24, 24, 18]} />
          <meshStandardMaterial color="#4a3b50" roughness={0.65} />
        </mesh>
        {/* hocico */}
        <mesh position={[0.6, 0.02, 0]} scale={[1, 0.7, 0.8]}>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshStandardMaterial color="#5a4860" roughness={0.6} />
        </mesh>
        {/* orejas */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.42, 0.34, s * 0.12]} rotation={[s * 0.2, 0, 0]} scale={[0.5, 1.4 - 0.5 * g, 0.4]} castShadow>
            <coneGeometry args={[0.12, 0.3, 4]} />
            <meshStandardMaterial color="#4a3b50" roughness={0.65} />
          </mesh>
        ))}
        {/* ojos */}
        {[-1, 1].map((s) => (
          <mesh key={`o${s}`} position={[0.58, 0.14, s * 0.13]}>
            <sphereGeometry args={[ojo, 16, 12]} />
            <meshStandardMaterial color="#fff6d8" emissive={ACENTO} emissiveIntensity={0.15 + 1.4 * brilloOjos} roughness={0.3} />
          </mesh>
        ))}
        {/* alas */}
        <group position={[-0.05, 0.1, 0.15]}>
          <Ala lado={1} aleteo={aleteo} />
        </group>
        <group position={[-0.05, 0.1, -0.15]}>
          <Ala lado={-1} aleteo={aleteo} />
        </group>
      </group>
      {/* pulsos de sonar: anillos que salen del hocico */}
      {t >= 0 &&
        a > 0.5 &&
        g < 0.5 &&
        [0, 1, 2].map((i) => {
          const p = (((t - i * 14) % 42) + 42) % 42;
          const r = p / 42;
          return (
            <mesh key={i} position={[0.7 + r * 2.4, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
              <ringGeometry args={[0.2 + r * 1.3, 0.26 + r * 1.3, 40]} />
              <meshStandardMaterial color="#5fd2ff" emissive="#5fd2ff" emissiveIntensity={1.4} transparent opacity={0.8 * (1 - r)} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      {/* polilla */}
      {polilla > 0 && polilla < 1.5 && (
        <group position={[2.4 - Math.max(0, polilla - 1) * 3.6, 0.1 + Math.sin(e.frame * 0.3) * 0.12, 0]} scale={[clamp01(polilla), clamp01(polilla), clamp01(polilla)]}>
          <mesh>
            <sphereGeometry args={[0.08, 12, 10]} />
            <meshStandardMaterial color="#e6d9b8" emissive="#e6d9b8" emissiveIntensity={0.5} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, 0.02, s * 0.1]} rotation={[Math.sin(e.frame * 0.9) * 0.7 * s, 0, 0]} scale={[1, 0.2, 1]}>
              <circleGeometry args={[0.13, 12]} />
              <meshStandardMaterial color="#e6d9b8" emissive="#e6d9b8" emissiveIntensity={0.4} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

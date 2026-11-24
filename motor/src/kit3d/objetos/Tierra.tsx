import React from "react";
import * as THREE from "three";

// La Tierra de perfil con la Estación Espacial en órbita (fuera de escala, para que se vea) y un trazo
// rojo fino que hace de "Muralla". `iss` 0→1 aparece la Estación; `linea` 0→1 baja la línea de altura;
// `muralla` 0→1 dibuja el trazo; `resalte` 0→1 lo hace brillar (el zoom del teleobjetivo).

export type EstadoTierra = {
  frame: number;
  iss: number;
  linea: number;
  muralla: number;
  resalte: number;
};

const R = 2.4;
const DIR = new THREE.Vector3(-0.45, 0.5, 0.74).normalize(); // hacia donde está la Estación
const CENTRO = new THREE.Vector3(0.35, 0.35, 0.87).normalize(); // dónde está la Muralla

const ALINEA = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), CENTRO);
export const POS_ISS = DIR.clone().multiplyScalar(R + 1.1);
export const POS_MURALLA = CENTRO.clone().multiplyScalar(R);

const arco = (n: number): THREE.Vector3[] => {
  const u = new THREE.Vector3(0, 1, 0).cross(CENTRO).normalize();
  const v = CENTRO.clone().cross(u).normalize();
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1) - 0.5;
    return CENTRO.clone()
      .addScaledVector(u, t * 0.5)
      .addScaledVector(v, Math.sin(t * 9) * 0.035)
      .normalize()
      .multiplyScalar(R + 0.11);
  });
};

export const Tierra: React.FC<{ e: EstadoTierra }> = ({ e }) => {
  const giro = e.frame / 12000;
  const geoMuralla = React.useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arco(24)), 60, 0.03, 6, false), []);
  const geoLinea = React.useMemo(() => new THREE.TubeGeometry(new THREE.LineCurve3(POS_MURALLA.clone().multiplyScalar(1.0), POS_ISS.clone().sub(DIR.clone().multiplyScalar(0.15))), 2, 0.012, 6, false), []);
  const bob = Math.sin(e.frame / 20) * 0.03;
  // la Estación mira hacia la Tierra: orientamos el grupo con lookAt
  const orient = React.useMemo(() => {
    const q = new THREE.Quaternion();
    const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), DIR.clone().negate(), new THREE.Vector3(0, 1, 0));
    q.setFromRotationMatrix(m);
    return q;
  }, []);
  return (
    <group>
      <group rotation={[0, giro, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[R, 64, 64]} />
          <meshStandardMaterial color="#2a62b8" roughness={0.7} emissive="#0b2a66" emissiveIntensity={0.35} />
        </mesh>
        {/* continente: casquete algo más alto y verdoso */}
        <mesh position={CENTRO.clone().multiplyScalar(R)} quaternion={ALINEA} scale={[1.3, 0.9, 0.1]}>
          <sphereGeometry args={[1.1, 32, 32]} />
          <meshStandardMaterial color="#8a9a5c" roughness={0.95} />
        </mesh>
        {/* atmósfera */}
        <mesh scale={1.04}>
          <sphereGeometry args={[R, 48, 48]} />
          <meshBasicMaterial color="#7fb6ff" transparent opacity={0.12} depthWrite={false} side={THREE.BackSide} />
        </mesh>
      </group>
      {/* Muralla (fuera del grupo que gira, para que se quede en su lugar) */}
      {e.muralla > 0.01 && (
        <mesh geometry={geoMuralla} scale={[1, 1, 1]}>
          <meshStandardMaterial
            color="#ff5a5a"
            emissive="#ff3b3b"
            emissiveIntensity={0.3 + 1.4 * e.resalte}
            transparent
            opacity={e.muralla}
          />
        </mesh>
      )}
      {e.linea > 0.01 && (
        <mesh geometry={geoLinea}>
          <meshBasicMaterial color="#ffc53d" transparent opacity={0.85 * e.linea} />
        </mesh>
      )}
      {e.iss > 0.01 && (
        <group position={[POS_ISS.x, POS_ISS.y + bob, POS_ISS.z]} quaternion={orient} scale={0.55 * e.iss}>
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.35, 0.35]} />
            <meshStandardMaterial color="#d9dde6" metalness={0.5} roughness={0.35} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 1.2, 0, 0]}>
              <boxGeometry args={[1.4, 0.04, 0.7]} />
              <meshStandardMaterial color="#27406e" metalness={0.6} roughness={0.3} emissive="#142a55" emissiveIntensity={0.4} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

import React from "react";
import * as THREE from "three";
import { random, useCurrentFrame } from "remotion";

// Piezas 3D de "cielo" para los videos de astronomía (meteoros, cometa, polvo, la Tierra, un grano
// que entra a la atmósfera). Todo es código y primitivas: sin texturas ni archivos. Los brillos usan
// meshBasicMaterial aditivo (no dependen de las luces); los cuerpos sólidos usan meshStandardMaterial
// (los ilumina el Estudio). Nada de useFrame: la animación entra por props desde el Video.

const EJE_Y = new THREE.Vector3(0, 1, 0);
type V3 = [number, number, number];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** quaternion que lleva el eje +Y local hacia `dir` (para orientar conos y cilindros). */
const quatHacia = (dir: V3): [number, number, number, number] => {
  const d = new THREE.Vector3(...dir);
  if (d.lengthSq() < 1e-6) return [0, 0, 0, 1];
  d.normalize();
  return new THREE.Quaternion().setFromUnitVectors(EJE_Y, d).toArray() as [number, number, number, number];
};

/* ---------- Estrellas: puntitos fijos en una cúpula lejana ---------- */
export const Estrellas: React.FC<{ cantidad?: number; radio?: number; seed?: string }> = ({ cantidad = 320, radio = 46, seed = "star" }) => {
  const geo = React.useMemo(() => {
    const pos = new Float32Array(cantidad * 3);
    const col = new Float32Array(cantidad * 3);
    for (let i = 0; i < cantidad; i++) {
      const theta = random(`${seed}-u${i}`) * Math.PI * 2;
      const phi = Math.acos(0.1 + 0.9 * random(`${seed}-v${i}`));
      const r = radio * (0.7 + 0.3 * random(`${seed}-r${i}`));
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.95 - 3;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 10;
      const b = 0.55 + 0.45 * random(`${seed}-b${i}`);
      col[i * 3] = b * 0.95;
      col[i * 3 + 1] = b * 0.97;
      col[i * 3 + 2] = Math.min(1, b * 1.1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [cantidad, radio, seed]);
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial size={0.38} sizeAttenuation vertexColors transparent opacity={0.9} depthWrite={false} />
    </points>
  );
};

/* ---------- Meteoro: cabeza brillante + estela que se afina hacia atrás ---------- */
export const Meteoro: React.FC<{ cabeza: V3; dir: V3; largo?: number; grosor?: number; brillo?: number; color?: string }> = ({
  cabeza,
  dir,
  largo = 3,
  grosor = 0.05,
  brillo = 1,
  color = "#fff4d6",
}) => {
  const q = React.useMemo(() => quatHacia(dir), [dir[0], dir[1], dir[2]]);
  if (brillo <= 0) return null;
  const d = new THREE.Vector3(...dir).normalize();
  const centro: V3 = [cabeza[0] - d.x * largo / 2, cabeza[1] - d.y * largo / 2, cabeza[2] - d.z * largo / 2];
  const b = clamp01(brillo);
  return (
    <group>
      {/* estela: cilindro ancho en la cabeza (+Y) y afinado en la cola (-Y) */}
      <mesh position={centro} quaternion={q}>
        <cylinderGeometry args={[grosor, grosor * 0.12, largo, 10, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.5 * b} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* cabeza */}
      <mesh position={cabeza}>
        <sphereGeometry args={[grosor * 2, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={b} depthWrite={false} />
      </mesh>
      {/* halo */}
      <mesh position={cabeza}>
        <sphereGeometry args={[grosor * 5, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.28 * b} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

/* ---------- Lluvia de meteoros ambiente: varios que cruzan el cielo lejano ---------- */
export const LluviaMeteoros: React.FC<{ cantidad?: number; intensidad?: number; seed?: string; periodo?: number; zona?: { x: V3; y: V3; z: V3 } }> = ({
  cantidad = 12,
  intensidad = 1,
  seed = "ll",
  periodo = 42,
}) => {
  const frame = useCurrentFrame();
  if (intensidad <= 0) return null;
  const zx: [number, number] = [-10, 10];
  const zy: [number, number] = [4, 13];
  const zz: [number, number] = [-16, -6];
  const items: React.ReactNode[] = [];
  for (let i = 0; i < cantidad; i++) {
    const t0 = random(`${seed}-t${i}`) * periodo;
    const vida = 11 + random(`${seed}-v${i}`) * 8;
    const ciclo = periodo + vida + 16;
    const age = (((frame - t0) % ciclo) + ciclo) % ciclo;
    if (age > vida) continue;
    const p = age / vida;
    const sx = zx[0] + random(`${seed}-x${i}`) * (zx[1] - zx[0]);
    const sy = zy[0] + random(`${seed}-y${i}`) * (zy[1] - zy[0]);
    const sz = zz[0] + random(`${seed}-z${i}`) * (zz[1] - zz[0]);
    const dir: V3 = [-0.55 - random(`${seed}-dx${i}`) * 0.5, -0.8 - random(`${seed}-dy${i}`) * 0.4, 0.08];
    const vel = 10 + random(`${seed}-s${i}`) * 6;
    const cabeza: V3 = [sx + dir[0] * vel * p, sy + dir[1] * vel * p, sz + dir[2] * vel * p];
    const brillo = Math.sin(Math.PI * p) * intensidad;
    items.push(<Meteoro key={i} cabeza={cabeza} dir={dir} largo={3 + random(`${seed}-l${i}`) * 2.6} grosor={0.085} brillo={brillo} />);
  }
  return <>{items}</>;
};

/* ---------- Cometa: núcleo rocoso + coma + cola larga aditiva ---------- */
export const Cometa: React.FC<{ pos: V3; escala?: number; haciaCola?: V3; brillo?: number }> = ({ pos, escala = 1, haciaCola = [0.7, 0.7, 0.2], brillo = 1 }) => {
  const q = React.useMemo(() => quatHacia(haciaCola), [haciaCola[0], haciaCola[1], haciaCola[2]]);
  if (brillo <= 0) return null;
  const b = clamp01(brillo);
  const d = new THREE.Vector3(...haciaCola).normalize();
  const largoCola = 4.4;
  const colaPos: V3 = [d.x * largoCola / 2, d.y * largoCola / 2, d.z * largoCola / 2];
  return (
    <group position={pos} scale={escala}>
      <mesh>
        <icosahedronGeometry args={[0.19, 0]} />
        <meshStandardMaterial color="#9aa2b0" roughness={1} metalness={0.1} flatShading />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.44, 16, 16]} />
        <meshBasicMaterial color="#bfe4ff" transparent opacity={0.35 * b} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={colaPos} quaternion={q}>
        <coneGeometry args={[0.55, largoCola, 22, 1, true]} />
        <meshBasicMaterial color="#aed8ff" transparent opacity={0.2 * b} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/* ---------- Banda de polvo: la estela de restos que el cometa dejó en su órbita ---------- */
export const BandaPolvo: React.FC<{ centro: V3; eje?: V3; largo?: number; radio?: number; cantidad?: number; brillo?: number; seed?: string }> = ({
  centro,
  eje = [1, 0, 0],
  largo = 9,
  radio = 0.5,
  cantidad = 150,
  brillo = 1,
  seed = "bp",
}) => {
  const geo = React.useMemo(() => {
    const pos = new Float32Array(cantidad * 3);
    for (let i = 0; i < cantidad; i++) {
      const u = (random(`${seed}-a${i}`) - 0.5) * largo;
      const ang = random(`${seed}-b${i}`) * Math.PI * 2;
      const rr = Math.pow(random(`${seed}-c${i}`), 0.5) * radio;
      // puntos estirados en Y local; se orienta con la quaternion del <points>
      pos[i * 3] = Math.cos(ang) * rr;
      pos[i * 3 + 1] = u;
      pos[i * 3 + 2] = Math.sin(ang) * rr;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [cantidad, largo, radio, seed]);
  const q = React.useMemo(() => quatHacia(eje), [eje[0], eje[1], eje[2]]);
  if (brillo <= 0) return null;
  return (
    <points position={centro} quaternion={q} geometry={geo} frustumCulled={false}>
      <pointsMaterial size={0.14} color="#dbe6ff" transparent opacity={0.9 * clamp01(brillo)} sizeAttenuation depthWrite={false} />
    </points>
  );
};

/* ---------- La Tierra: esfera azul con borde de atmósfera ---------- */
export const Tierra: React.FC<{ pos: V3; escala?: number; brillo?: number }> = ({ pos, escala = 1, brillo = 1 }) => {
  if (brillo <= 0) return null;
  return (
    <group position={pos} scale={escala}>
      <mesh castShadow>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#215f9f" roughness={0.75} metalness={0.0} emissive="#0a2340" emissiveIntensity={0.35} />
      </mesh>
      {/* pincelada de continentes (verde) para que se lea como la Tierra */}
      <mesh position={[0.35, 0.28, 0.82]} rotation={[0.2, 0.3, 0]}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshStandardMaterial color="#2f8c56" roughness={0.9} />
      </mesh>
      <mesh position={[-0.55, -0.25, 0.7]} rotation={[0, -0.4, 0]}>
        <sphereGeometry args={[0.3, 20, 20]} />
        <meshStandardMaterial color="#357f4c" roughness={0.9} />
      </mesh>
      {/* borde de atmósfera */}
      <mesh scale={1.1}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#7fc4ff" transparent opacity={0.2 * clamp01(brillo)} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

/* ---------- Grano: la roca chiquita que entra; `incandescente` 0→1 la pone al rojo vivo ---------- */
export const Grano: React.FC<{ pos: V3; escala?: number; incandescente?: number; giro?: number; brillo?: number }> = ({
  pos,
  escala = 1,
  incandescente = 0,
  giro = 0,
  brillo = 1,
}) => {
  if (brillo <= 0) return null;
  const calor = clamp01(incandescente);
  const emis = new THREE.Color().lerpColors(new THREE.Color("#140a04"), new THREE.Color("#ff5a1e"), calor);
  return (
    <group position={pos} scale={escala} rotation={[giro * 0.3, giro, giro * 0.15]}>
      <mesh castShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#6b6257"
          roughness={1}
          metalness={0.05}
          flatShading
          emissive={`#${emis.getHexString()}`}
          emissiveIntensity={calor * 1.5}
          transparent
          opacity={clamp01(brillo)}
        />
      </mesh>
      {calor > 0.02 && (
        <mesh scale={1.4 + calor * 1.1}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#ff7a30" transparent opacity={0.22 * calor} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

/* ---------- Capa de atmósfera: una línea curva luminosa (el techo del aire) ---------- */
export const CapaAtmosfera: React.FC<{ y?: number; z?: number; brillo?: number; color?: string }> = ({ y = -0.5, z = -2.4, brillo = 1, color = "#58d6ff" }) => {
  if (brillo <= 0) return null;
  const b = clamp01(brillo);
  // media rosca, apoyada horizontal y centrada hacia la cámara (el borde cercano es la curva visible)
  return (
    <group position={[0, y, z]} rotation={[Math.PI / 2, 0, Math.PI / 2 - (Math.PI * 0.75) / 2]}>
      <mesh>
        <torusGeometry args={[7, 0.06, 10, 90, Math.PI * 0.75]} />
        <meshBasicMaterial color={color} transparent opacity={0.85 * b} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <torusGeometry args={[7, 0.55, 10, 90, Math.PI * 0.75]} />
        <meshBasicMaterial color={color} transparent opacity={0.1 * b} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

/* ---------- Suelo oscuro + luces lejanas de ciudad (lo que hay que evitar al mirar) ---------- */
export const Suelo: React.FC<{ y?: number; brillo?: number; luces?: number }> = ({ y = -4.6, brillo = 1, luces = 0 }) => {
  const geo = React.useMemo(() => {
    const n = 46;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (random(`cl-x${i}`) - 0.5) * 34;
      pos[i * 3 + 1] = y + 0.1 + random(`cl-y${i}`) * 0.25;
      pos[i * 3 + 2] = -8 - random(`cl-z${i}`) * 4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [y]);
  if (brillo <= 0) return null;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, -6]}>
        <planeGeometry args={[70, 40]} />
        <meshStandardMaterial color="#070b16" roughness={1} />
      </mesh>
      {luces > 0 && (
        <points geometry={geo} frustumCulled={false}>
          <pointsMaterial size={0.14} color="#ffcf8a" transparent opacity={0.8 * clamp01(luces)} sizeAttenuation depthWrite={false} />
        </points>
      )}
    </group>
  );
};

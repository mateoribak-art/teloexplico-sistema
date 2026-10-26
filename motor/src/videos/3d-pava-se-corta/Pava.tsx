import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Pava eléctrica de acero con pico matero, manija negra a la izquierda (-x) y base de enchufe.
// Adentro: agua, resistencia, el tubito por donde baja el vapor (va por dentro de la manija)
// y, en la caja debajo de la manija, el disco bimetálico, la varilla y el botón con su luz.
// Medidas en "unidades de escena": la pava mide ~2,4 de alto y apoya en y = 0.

export type EstadoPava = {
  frame: number;
  fantasmaCuerpo: number; // 0 = acero normal, 1 = casi transparente (se ve el agua)
  fantasmaMango: number; // 0 = manija y caja opacas, 1 = transparentes (se ve el tubito y el disco)
  tapa: number; // 0 cerrada, 1 abierta
  calor: number; // resistencia prendida y burbujas
  vaporPico: number; // vapor saliendo por el pico (toma de presentación)
  vaporTubo: number; // vapor viajando por el tubito hasta el disco
  vaporTapa: number; // vapor escapando por la tapa abierta
  disco: number; // 1 = disco frío (curvado hacia el vapor), -1 = disco que saltó
  discoCalor: number; // 0..1 tinte de calor del disco
  separar: number; // 0..1 vista explotada de las dos capas del disco
  estirar: number; // 0..1 una capa se estira más que la otra
  boton: number; // 0 = prendida (luz naranja), 1 = saltó (apagada)
  tamDisco?: number; // agranda el disco para el primer plano (1 = real)
};

/* ---------- geometrías ---------- */

const torno = (pts: [number, number][], seg = 96) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

/** Tubo a lo largo de una curva con radio variable r(t). */
const tubo = (curva: THREE.Curve<THREE.Vector3>, r: (t: number) => number, nT = 96, nR = 24) => {
  const marcos = curva.computeFrenetFrames(nT, false);
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= nT; i++) {
    const t = i / nT;
    const p = curva.getPointAt(t);
    const n = marcos.normals[i];
    const b = marcos.binormals[i];
    const rr = r(t);
    for (let j = 0; j <= nR; j++) {
      const a = (j / nR) * Math.PI * 2;
      pos.push(p.x + rr * (Math.cos(a) * n.x + Math.sin(a) * b.x), p.y + rr * (Math.cos(a) * n.y + Math.sin(a) * b.y), p.z + rr * (Math.cos(a) * n.z + Math.sin(a) * b.z));
    }
  }
  for (let i = 0; i < nT; i++)
    for (let j = 0; j < nR; j++) {
      const a = i * (nR + 1) + j;
      const b = a + nR + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

/** Disco abombado con espesor, en el plano yz (mira hacia +x). curva: +1 panza hacia -x, -1 panza hacia +x. */
const discoGeo = (radio: number, flecha: number, curva: number, grosor: number, escala = 1) => {
  const nR = 14;
  const nA = 48;
  const a = radio * escala;
  const pos: number[] = [];
  const idx: number[] = [];
  const capa = (lado: number) => {
    const base = pos.length / 3;
    for (let i = 0; i <= nR; i++) {
      const r = (i / nR) * a;
      const x = -curva * flecha * (1 - (r / a) ** 2) + (lado * grosor) / 2;
      for (let j = 0; j <= nA; j++) {
        const f = (j / nA) * Math.PI * 2;
        pos.push(x, r * Math.cos(f), r * Math.sin(f));
      }
    }
    for (let i = 0; i < nR; i++)
      for (let j = 0; j < nA; j++) {
        const p = base + i * (nA + 1) + j;
        const q = p + nA + 1;
        if (lado > 0) idx.push(p, q, p + 1, q, q + 1, p + 1);
        else idx.push(p, p + 1, q, q, p + 1, q + 1);
      }
    return base;
  };
  const delante = capa(1);
  const detras = capa(-1);
  // borde que une las dos caras
  for (let j = 0; j < nA; j++) {
    const p = delante + nR * (nA + 1) + j;
    const q = detras + nR * (nA + 1) + j;
    idx.push(p, q, p + 1, q, q + 1, p + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // en el centro hay muchos vértices encimados: sin esto el brillo forma un triángulo
  const nor = g.getAttribute("normal");
  for (let j = 0; j <= nA; j++) {
    nor.setXYZ(delante + j, 1, 0, 0);
    nor.setXYZ(detras + j, -1, 0, 0);
  }
  return g;
};

/* ---------- puntos clave (también los usa la cámara) ---------- */

export const P = {
  centro: [0, 1.2, 0] as [number, number, number],
  disco: [-1.3, 0.3, 0] as [number, number, number],
  boton: [-0.98, 0.41, 0] as [number, number, number],
  punta: [1.62, 1.98, 0] as [number, number, number],
  tapa: [0, 2.25, 0] as [number, number, number],
  aguaNivel: 1.35,
};

const curvaPico = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0.82, 1.0, 0),
  new THREE.Vector3(1.18, 1.22, 0),
  new THREE.Vector3(1.42, 1.6, 0),
  new THREE.Vector3(P.punta[0], P.punta[1], 0),
]);
const curvaManija = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-0.78, 1.9, 0),
  new THREE.Vector3(-1.3, 1.98, 0),
  new THREE.Vector3(-1.62, 1.62, 0),
  new THREE.Vector3(-1.6, 0.9, 0),
  new THREE.Vector3(-1.38, 0.46, 0),
]);
export const curvaVapor = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-0.45, 1.75, 0),
  new THREE.Vector3(-0.8, 1.9, 0),
  new THREE.Vector3(-1.3, 1.97, 0),
  new THREE.Vector3(-1.62, 1.62, 0),
  new THREE.Vector3(-1.62, 0.9, 0),
  new THREE.Vector3(-1.5, 0.45, 0),
  new THREE.Vector3(-1.4, 0.3, 0),
]);

/* ---------- materiales ---------- */

// Al pasar de sólido a transparente three.js tiene que recompilar el material: en un render corrido
// (no en cuadros sueltos) se quedaba opaco. La `key` fuerza un material nuevo al cruzar el umbral.
const Acero: React.FC<{ fantasma?: number; color?: string; rugosidad?: number }> = ({ fantasma = 0, color = "#dfe4ec", rugosidad = 0.3 }) => (
  <meshPhysicalMaterial
    key={fantasma > 0.001 ? "fantasma" : "solido"}
    color={color}
    metalness={1 - 0.75 * fantasma}
    roughness={rugosidad}
    clearcoat={0.4}
    clearcoatRoughness={0.15}
    transparent={fantasma > 0.001}
    opacity={1 - 0.86 * fantasma}
    depthWrite={fantasma < 0.5}
    side={fantasma > 0.001 ? THREE.DoubleSide : THREE.FrontSide}
    emissive="#5fd2ff"
    emissiveIntensity={0.25 * fantasma}
  />
);

const Plastico: React.FC<{ fantasma?: number; color?: string }> = ({ fantasma = 0, color = "#17191f" }) => (
  <meshPhysicalMaterial
    key={fantasma > 0.001 ? "fantasma" : "solido"}
    color={color}
    metalness={0}
    roughness={0.42}
    clearcoat={0.7}
    clearcoatRoughness={0.25}
    transparent={fantasma > 0.001}
    opacity={1 - 0.82 * fantasma}
    depthWrite={fantasma < 0.5}
    emissive="#5fd2ff"
    emissiveIntensity={0.18 * fantasma}
  />
);

/* ---------- partes ---------- */

/** Textura de humo: un círculo blanco que se desvanece hacia el borde (se dibuja una vez, sin archivos). */
let texturaHumo: THREE.Texture | null = null;
const humo = () => {
  if (texturaHumo) return texturaHumo;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const d = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  d.addColorStop(0, "rgba(255,255,255,1)");
  d.addColorStop(0.45, "rgba(255,255,255,0.55)");
  d.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = d;
  g.fillRect(0, 0, 128, 128);
  texturaHumo = new THREE.CanvasTexture(c);
  return texturaHumo;
};

const Vapor: React.FC<{ puntos: (i: number, n: number) => { p: THREE.Vector3; s: number; o: number } | null; n: number; color?: string; solido?: boolean }> = ({
  puntos,
  n,
  color = "#ffffff",
  solido = false,
}) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const v = puntos(i, n);
      if (!v || v.o <= 0.01) return null;
      return solido ? (
        <mesh key={i} position={v.p} scale={v.s} renderOrder={5}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color={color} transparent opacity={v.o} depthWrite={false} emissive={color} emissiveIntensity={0.35} roughness={1} />
        </mesh>
      ) : (
        <sprite key={i} position={v.p} scale={v.s * 2.6} renderOrder={6}>
          <spriteMaterial map={humo()} color={color} transparent opacity={v.o} depthWrite={false} />
        </sprite>
      );
    })}
  </>
);

/** Bocanadas que suben desde un punto, se agrandan y se desvanecen. */
const bocanadas = (origen: THREE.Vector3, frame: number, fuerza: number, semilla: string, deriva = new THREE.Vector3(0.25, 1, 0)) =>
  (i: number, n: number) => {
    if (fuerza <= 0) return null;
    const vida = 46;
    const edad = (frame + (i / n) * vida + random(`${semilla}${i}`) * 9) % vida;
    const t = edad / vida;
    const lado = (random(`${semilla}l${i}`) - 0.5) * 0.35;
    const p = origen
      .clone()
      .add(deriva.clone().multiplyScalar(t * 1.4))
      .add(new THREE.Vector3(lado * t * 2, 0, (random(`${semilla}z${i}`) - 0.5) * 0.3 * t));
    return { p, s: 0.05 + t * 0.22, o: fuerza * 0.55 * Math.sin(Math.PI * t) };
  };

export const Pava: React.FC<{ e: EstadoPava }> = ({ e }) => {
  const geo = useMemo(
    () => ({
      cuerpo: torno([
        [0.0, 0.2],
        [0.9, 0.2],
        [0.97, 0.23],
        [1.0, 0.32],
        [1.0, 0.56],
        [0.97, 1.2],
        [0.9, 1.75],
        [0.82, 2.04],
        [0.8, 2.12],
        [0.76, 2.14],
      ]),
      agua: torno(
        [
          [0, 0.24],
          [0.9, 0.24],
          [0.95, 0.32],
          [0.95, 0.56],
          [0.927, 1.2],
          [0.912, P.aguaNivel],
          [0, P.aguaNivel],
        ],
        64,
      ),
      tapa: torno([
        [0.84, 0.0],
        [0.84, 0.02],
        [0.8, 0.06],
        [0.65, 0.15],
        [0.4, 0.25],
        [0.15, 0.295],
        [0.0, 0.3],
      ]),
      base: torno([
        [0, 0],
        [1.2, 0],
        [1.22, 0.04],
        [1.2, 0.15],
        [1.12, 0.18],
        [0, 0.18],
      ]),
      pico: tubo(curvaPico, (t) => 0.2 - 0.12 * t),
      manija: tubo(curvaManija, () => 0.14, 96, 28),
      tuboVapor: tubo(curvaVapor, () => 0.045, 120, 16),
      caja: new RoundedBoxGeometry(0.62, 0.24, 0.4, 4, 0.07),
    }),
    [],
  );

  const tam = e.tamDisco ?? 1;
  const discos = useMemo(() => {
    const sep = 0.012 + e.separar * 0.09;
    return {
      a: discoGeo(0.13, 0.04, e.disco, 0.022, 1 + 0.07 * e.estirar), // capa que se estira más
      b: discoGeo(0.13, 0.04, e.disco, 0.022, 1),
      sep,
    };
  }, [e.disco, e.separar, e.estirar]);

  const desplazo = -e.disco * 0.04; // el centro del disco: hacia -x en frío, hacia +x cuando salta
  const varillaDesde = P.disco[0] + desplazo + 0.03;
  const varillaHasta = -1.0;
  const angBoton = 0.42 * e.boton;
  const luz = 1 - e.boton;

  const nivelBurbujas = e.calor * e.fantasmaCuerpo;

  return (
    <group>
      {/* base de enchufe */}
      <mesh geometry={geo.base} castShadow receiveShadow renderOrder={e.fantasmaMango > 0 ? 9 : 0}>
        <Plastico color="#101216" fantasma={e.fantasmaMango * 0.9} />
      </mesh>

      {/* cuerpo */}
      <mesh geometry={geo.cuerpo} castShadow={e.fantasmaCuerpo < 0.5} receiveShadow renderOrder={e.fantasmaCuerpo > 0 ? 10 : 0}>
        <Acero fantasma={e.fantasmaCuerpo} />
      </mesh>
      {/* aro negro de la base del cuerpo */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.92, 0.95, 0.06, 96]} />
        <Plastico fantasma={e.fantasmaCuerpo * 0.8} />
      </mesh>

      {/* pico matero */}
      <mesh geometry={geo.pico} castShadow renderOrder={e.fantasmaCuerpo > 0 ? 10 : 0}>
        <Acero fantasma={e.fantasmaCuerpo} />
      </mesh>

      {/* tapa con bisagra del lado de la manija */}
      <group position={[-0.8, 2.12, 0]} rotation={[0, 0, e.tapa * 1.15]}>
        <group position={[0.8, 0, 0]}>
          <mesh geometry={geo.tapa} castShadow renderOrder={e.fantasmaCuerpo > 0 ? 10 : 0}>
            <Acero fantasma={e.fantasmaCuerpo * 0.7} color="#d9dee6" />
          </mesh>
          <mesh position={[0, 0.34, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.16, 0.12, 32]} />
            <Plastico />
          </mesh>
        </group>
      </group>

      {/* manija */}
      <mesh geometry={geo.manija} castShadow renderOrder={e.fantasmaMango > 0 ? 11 : 0}>
        <Plastico fantasma={e.fantasmaMango} />
      </mesh>
      {/* caja del control, debajo de la manija */}
      <mesh geometry={geo.caja} position={[-1.15, 0.29, 0]} castShadow renderOrder={e.fantasmaMango > 0 ? 11 : 0}>
        <Plastico fantasma={e.fantasmaMango} />
      </mesh>

      {/* botón (balancín) con su luz */}
      <group position={P.boton} rotation={[0, 0, angBoton]}>
        <mesh position={[0.1, 0.03, 0]} castShadow>
          <boxGeometry args={[0.3, 0.07, 0.24]} />
          <Plastico color="#22252c" />
        </mesh>
        <mesh position={[0.2, 0.035, 0.121]}>
          <boxGeometry args={[0.07, 0.035, 0.01]} />
          <meshStandardMaterial color="#3a1205" emissive="#ff3a00" emissiveIntensity={2.2 * luz} toneMapped={false} />
        </mesh>
        {/* brazo que baja hasta la varilla */}
        <mesh position={[-0.02, -0.07, 0]}>
          <boxGeometry args={[0.03, 0.14, 0.05]} />
          <meshStandardMaterial color="#8a9099" metalness={0.8} roughness={0.35} />
        </mesh>
      </group>

      {/* agua, resistencia y burbujas (solo se ven con el cuerpo transparente) */}
      {e.fantasmaCuerpo > 0.02 && (
        <>
          <mesh geometry={geo.agua} renderOrder={3}>
            <meshPhysicalMaterial
              color="#3aa8ff"
              transparent
              opacity={0.5 * e.fantasmaCuerpo}
              roughness={0.05}
              metalness={0}
              depthWrite={false}
              emissive="#1a6fd6"
              emissiveIntensity={0.25}
            />
          </mesh>
          <mesh position={[0, 0.235, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
            <ringGeometry args={[0.25, 0.8, 64]} />
            <meshStandardMaterial
              color="#552010"
              emissive="#ff4a10"
              emissiveIntensity={2.4 * e.calor}
              toneMapped={false}
              transparent
              opacity={e.fantasmaCuerpo}
            />
          </mesh>
          <Vapor
            n={44}
            solido
            color="#e8f6ff"
            puntos={(i) => {
              if (nivelBurbujas <= 0) return null;
              const vel = 0.012 + random(`bv${i}`) * 0.018;
              const y = 0.3 + ((e.frame * vel + random(`by${i}`)) % 1) * (P.aguaNivel - 0.35);
              const ang = random(`ba${i}`) * Math.PI * 2;
              const rad = 0.15 + random(`br${i}`) * 0.68;
              return { p: new THREE.Vector3(Math.cos(ang) * rad, y, Math.sin(ang) * rad), s: 0.025 + random(`bs${i}`) * 0.035, o: 0.8 * nivelBurbujas };
            }}
          />
        </>
      )}

      {/* tubito de vapor (dentro de la manija) */}
      {e.fantasmaMango > 0.02 && (
        <mesh geometry={geo.tuboVapor} renderOrder={4}>
          <meshPhysicalMaterial color="#b9ecff" transparent opacity={0.35 * e.fantasmaMango} roughness={0.1} depthWrite={false} emissive="#5fd2ff" emissiveIntensity={0.4} />
        </mesh>
      )}
      <Vapor
        n={30}
        puntos={(i, n) => {
          if (e.vaporTubo <= 0) return null;
          const t = (e.frame * 0.022 + i / n) % 1;
          return { p: curvaVapor.getPointAt(t), s: 0.038 + 0.01 * Math.sin(i * 2.3 + e.frame * 0.3), o: 0.95 * e.vaporTubo };
        }}
      />

      {/* disco bimetálico, varilla */}
      <group position={P.disco} scale={tam}>
        <mesh geometry={discos.a} position={[-discos.sep, 0, 0]} castShadow>
          <meshPhysicalMaterial
            color="#d0784a"
            metalness={0.65}
            roughness={0.42}
            emissive="#ff5a1a"
            emissiveIntensity={1.4 * e.discoCalor}
          />
        </mesh>
        <mesh geometry={discos.b} position={[discos.sep, 0, 0]} castShadow>
          <meshPhysicalMaterial color="#c5ccd6" metalness={0.95} roughness={0.25} emissive="#ff5a1a" emissiveIntensity={0.9 * e.discoCalor} />
        </mesh>
      </group>
      <mesh position={[(varillaDesde + varillaHasta) / 2 + 0.02, P.disco[1], 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, Math.max(0.05, varillaHasta - varillaDesde), 16]} />
        <meshStandardMaterial color="#e9eef5" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* vapor por el pico y por la tapa */}
      <Vapor n={18} puntos={bocanadas(new THREE.Vector3(...P.punta), e.frame, e.vaporPico, "pico", new THREE.Vector3(0.45, 1, 0))} />
      <Vapor n={26} puntos={bocanadas(new THREE.Vector3(0.1, 2.15, 0), e.frame, e.vaporTapa, "tapa", new THREE.Vector3(0.1, 1.2, 0))} />
    </group>
  );
};

import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Escena "martes 13 vs viernes 13" (tema abstracto, sin objeto mecánico): tarjetas de calendario
// flotando en el estudio azul noche con acento ROJO (el día de mala suerte). Piezas:
//  - Tarjeta: hoja de almanaque con el día arriba y un "13" enorme; el texto se pinta con CanvasTexture.
//  - Mesa13: la Última Cena, trece comensales, el número trece (Judas) en rojo.
//  - Marte: el planeta rojo, el dios de la guerra que le da el nombre al martes.
// Todo se mueve con useCurrentFrame(): nada de useFrame.

export type EstadoCal = {
  frame: number;
  vOp: number;    // tarjeta "viernes": opacidad
  vX: number;     // tarjeta "viernes": posición horizontal
  vGlow: number;  // tarjeta "viernes": brillo rojo
  vTitulo: string; // "VIERNES" o, cuando cambia el afiche de la peli, "MARTES"
  mOp: number;    // tarjeta "martes": opacidad
  mX: number;     // tarjeta "martes": posición horizontal
  mGlow: number;  // tarjeta "martes": brillo
  mCalma: number; // 0 = rojo amenazante, 1 = azul tranquilo (ojo: superstición)
  mesa: number;   // 0..1 la Última Cena
  mesaLuz: number; // 0..1 enciende a Judas (el trece)
  marte: number;  // 0..1 el planeta
};

const ROJO = "#ff3a2e";
const AZUL = "#3a7bff";

/* ---------- texturas pintadas con código (sin imágenes externas) ---------- */

const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};

/** Cara de la hoja de almanaque: franja con el día y un "13" gigante. */
const caraCalendario = (dia: string, acento: string, poster: boolean) => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 640;
  const g = c.getContext("2d")!;
  g.fillStyle = poster ? "#07090f" : "#0f1526";
  rr(g, 0, 0, 512, 640, 42);
  g.fill();
  // borde
  g.lineWidth = 12;
  g.strokeStyle = acento;
  rr(g, 10, 10, 492, 620, 34);
  g.stroke();
  // franja de arriba con el día
  g.fillStyle = acento;
  rr(g, 22, 22, 468, 150, 26);
  g.fill();
  // dos "anillas" del almanaque
  g.fillStyle = "#0b0f1c";
  g.beginPath(); g.arc(150, 30, 16, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(362, 30, 16, 0, Math.PI * 2); g.fill();
  // día
  g.fillStyle = "#0b0f1c";
  g.font = "bold 92px Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(dia, 256, 104);
  // el trece, enorme
  g.fillStyle = "#ffffff";
  g.font = "bold 310px Arial";
  g.fillText("13", 256, 420);
  if (poster) {
    // perforaciones de película a los costados
    g.fillStyle = "#1a1e28";
    for (let y = 40; y < 620; y += 70) {
      g.fillRect(22, y, 26, 40);
      g.fillRect(464, y, 26, 40);
    }
    g.fillStyle = acento;
    g.font = "bold 40px Arial";
    g.fillText("· TERROR ·", 256, 590);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

/** Halo radial suave para el brillo detrás de una pieza. */
const texturaBrillo = (color: string) => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, color + "cc");
  grad.addColorStop(0.45, color + "55");
  grad.addColorStop(1, color + "00");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

/** Superficie rojiza del planeta, con manchas (sin HDRI ni imágenes). */
const texturaMarte = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = "#b2402a";
    g.fillRect(0, 0, 512, 512);
    const tonos = ["#8f2f1f", "#c05033", "#d9693f", "#7a2616", "#a83c25"];
    for (let i = 0; i < 420; i++) {
      g.fillStyle = tonos[Math.floor(Math.random() * tonos.length)];
      g.globalAlpha = 0.5;
      g.beginPath();
      g.arc(Math.random() * 512, Math.random() * 512, 4 + Math.random() * 26, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
})();

/* ---------- geometrías constantes ---------- */

const cuerpoTarjeta = new RoundedBoxGeometry(2.0, 2.5, 0.16, 6, 0.1);
const mesaGeo = new RoundedBoxGeometry(4.4, 0.2, 1.2, 4, 0.07);

/* ---------- piezas ---------- */

const Tarjeta: React.FC<{
  dia: string;
  acento: string;
  op: number;
  glow: number;
  pos: [number, number, number];
  poster?: boolean;
  calma?: number;
}> = ({ dia, acento, op, glow, pos, poster = false, calma = 0 }) => {
  const frame = useCurrentFrame();
  const cara = useMemo(() => caraCalendario(dia, acento, poster), [dia, acento, poster]);
  const haloRojo = useMemo(() => texturaBrillo(ROJO), []);
  const haloAzul = useMemo(() => texturaBrillo(AZUL), []);
  if (op <= 0.001) return null;
  const pulso = 1 + 0.04 * Math.sin(frame / 7);
  return (
    <group position={pos} rotation={[0, 0, 0]}>
      {/* halos detrás */}
      <mesh position={[0, 0, -0.25]} scale={pulso}>
        <planeGeometry args={[4.0, 4.6]} />
        <meshBasicMaterial map={haloRojo} transparent opacity={0.55 * glow * op * (1 - calma)} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.24]} scale={pulso}>
        <planeGeometry args={[4.0, 4.6]} />
        <meshBasicMaterial map={haloAzul} transparent opacity={0.5 * glow * op * calma} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* cuerpo de la hoja */}
      <mesh geometry={cuerpoTarjeta} castShadow>
        <meshStandardMaterial color="#0e1324" roughness={0.6} metalness={0.1} transparent opacity={op} />
      </mesh>
      {/* cara con el texto */}
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[1.96, 2.46]} />
        <meshBasicMaterial map={cara} transparent opacity={op} />
      </mesh>
    </group>
  );
};

const Mesa13: React.FC<{ op: number; luz: number }> = ({ op, luz }) => {
  if (op <= 0.001) return null;
  const s = 0.9 + 0.1 * op;
  return (
    <group position={[0, 0, 0]} scale={s}>
      <mesh geometry={mesaGeo} position={[0, 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#6b4a2f" roughness={0.75} metalness={0.05} transparent opacity={op} />
      </mesh>
      {Array.from({ length: 13 }).map((_, i) => {
        const x = -1.8 + i * (3.6 / 12);
        const judas = i === 12;
        const rCab = judas ? 0.22 : 0.17;
        return (
          <group key={i} position={[x, judas ? 0.96 : 0.9, judas ? -0.5 : -0.72]}>
            <mesh position={[0, 0.6, 0]} castShadow>
              <sphereGeometry args={[rCab, 24, 24]} />
              <meshStandardMaterial
                color={judas ? "#ff4a33" : "#cdd6e6"}
                emissive={judas ? ROJO : "#000000"}
                emissiveIntensity={judas ? 2.4 * luz : 0}
                roughness={0.5}
                transparent
                opacity={op}
              />
            </mesh>
            <mesh position={[0, 0.14, 0]} castShadow>
              <cylinderGeometry args={[0.17, 0.3, 0.62, 20]} />
              <meshStandardMaterial
                color={judas ? "#b02a1a" : "#51607a"}
                emissive={judas ? ROJO : "#000000"}
                emissiveIntensity={judas ? 0.9 * luz : 0}
                roughness={0.7}
                transparent
                opacity={op}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const Marte: React.FC<{ op: number }> = ({ op }) => {
  const frame = useCurrentFrame();
  const tex = useMemo(() => texturaMarte(), []);
  const halo = useMemo(() => texturaBrillo("#ff5a2e"), []);
  if (op <= 0.001) return null;
  return (
    <group position={[0, 1.6, 0]} scale={0.55 + 0.45 * op}>
      <mesh position={[0, 0, -0.8]}>
        <planeGeometry args={[4.4, 4.4]} />
        <meshBasicMaterial map={halo} transparent opacity={0.6 * op} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[0.2, frame * 0.012, 0]} castShadow>
        <sphereGeometry args={[1.05, 48, 48]} />
        <meshStandardMaterial map={tex} color="#c0492f" roughness={0.9} metalness={0} emissive="#5a1505" emissiveIntensity={0.3} transparent opacity={op} />
      </mesh>
    </group>
  );
};

export const Calendario: React.FC<{ e: EstadoCal }> = ({ e }) => (
  <group>
    <Tarjeta dia={e.vTitulo} acento={ROJO} op={e.vOp} glow={e.vGlow} pos={[e.vX, 1.5, 0]} poster />
    <Tarjeta dia="MARTES" acento={ROJO} op={e.mOp} glow={e.mGlow} pos={[e.mX, 1.5, 0]} calma={e.mCalma} />
    <Mesa13 op={e.mesa} luz={e.mesaLuz} />
    <Marte op={e.marte} />
  </group>
);

// Para la portada: una sola hoja MARTES 13 encendida, bien de frente.
export const portadaCal = (): EstadoCal => ({
  frame: 20,
  vOp: 0,
  vX: 0,
  vGlow: 0,
  vTitulo: "VIERNES",
  mOp: 1,
  mX: 0,
  mGlow: 1,
  mCalma: 0,
  mesa: 0,
  mesaLuz: 0,
  marte: 0,
});

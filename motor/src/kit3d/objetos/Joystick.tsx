import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Escena "videojuegos violentos": un joystick (control de consola) en el estudio azul noche.
// Piezas: Joystick (cuerpo, agarres, palancas, botones, halo que pasa de rojo "te quema la cabeza"
// a azul calmo), Informe (hoja "APA 2020" con la conclusión y una cruz sobre la causa),
// Medidor (barra chica "gritar/empujar" que se llena y barra "violencia grave" vacía con "?").
// Todo se mueve con el estado por frame (nada de useFrame).

export type EstadoJoystick = {
  frame: number;
  pad: number;      // 0..1 aparece
  padX: number;     // posición horizontal
  padEsc: number;   // escala
  calor: number;    // 0..1 rojo (acusado) -> 0 azul calmo
  informe: number;  // 0..1 hoja de la APA
  cruz: number;     // 0..1 cruz sobre "causa"
  medidor: number;  // 0..1 aparecen las barras
  chica: number;    // 0..1 llenado de la barra "gritar/empujar"
  grave: number;    // 0..1 aparece el "?" sobre la barra grave
  en?: boolean;     // rótulos en inglés (@letmeexplain.us)
};

const ROJO = "#ff3a2e";
const AZUL = "#3a7bff";
const AMARILLO = "#ffd23a";

const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};

const halo = (color: string) => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, color + "cc");
  grad.addColorStop(0.45, color + "55");
  grad.addColorStop(1, color + "00");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Texto sobre una placa (ancho x alto en px), líneas con color propio. */
const placa = (w: number, h: number, borde: string, lineas: { t: string; c: string; s: number }[]) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0e1324";
  rr(g, 0, 0, w, h, 34);
  g.fill();
  g.lineWidth = 10;
  g.strokeStyle = borde;
  rr(g, 8, 8, w - 16, h - 16, 28);
  g.stroke();
  g.textAlign = "center";
  g.textBaseline = "middle";
  const total = lineas.reduce((a, l) => a + l.s * 1.25, 0);
  let y = (h - total) / 2;
  for (const l of lineas) {
    g.fillStyle = l.c;
    g.font = `bold ${l.s}px Arial`;
    g.fillText(l.t, w / 2, y + (l.s * 1.25) / 2);
    y += l.s * 1.25;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const cuerpoGeo = new RoundedBoxGeometry(2.6, 0.5, 1.2, 6, 0.22);
const agarreGeo = new RoundedBoxGeometry(0.8, 0.5, 1.5, 6, 0.3);

const Boton: React.FC<{ pos: [number, number, number]; color: string; calor: number }> = ({ pos, color, calor }) => (
  <mesh position={pos}>
    <cylinderGeometry args={[0.08, 0.08, 0.06, 20]} />
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3 + 0.8 * calor} roughness={0.4} />
  </mesh>
);

const Palanca: React.FC<{ pos: [number, number, number] }> = ({ pos }) => (
  <group position={pos}>
    <mesh position={[0, 0.04, 0]}>
      <cylinderGeometry args={[0.2, 0.22, 0.06, 28]} />
      <meshStandardMaterial color="#0b0e18" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.14, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 0.16, 16]} />
      <meshStandardMaterial color="#1b2030" roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.25, 0]}>
      <sphereGeometry args={[0.13, 20, 20]} />
      <meshStandardMaterial color="#232a3d" roughness={0.45} metalness={0.2} />
    </mesh>
  </group>
);

const Pad: React.FC<{ e: EstadoJoystick }> = ({ e }) => {
  const hRojo = useMemo(() => halo(ROJO), []);
  const hAzul = useMemo(() => halo(AZUL), []);
  if (e.pad <= 0.001) return null;
  const pulso = 1 + 0.05 * Math.sin(e.frame / 5) * e.calor;
  const tiembla = Math.sin(e.frame * 1.9) * 0.03 * e.calor;
  const emi = new THREE.Color(ROJO).lerp(new THREE.Color(AZUL), 1 - e.calor);
  return (
    <group position={[e.padX + tiembla, 1.6, 0]} scale={e.padEsc * (0.6 + 0.4 * e.pad)} rotation={[0.9, Math.sin(e.frame / 40) * 0.25, 0]}>
      <mesh position={[0, 0, -0.9]} rotation={[-0.9, 0, 0]} scale={pulso * 1.2}>
        <planeGeometry args={[5.4, 5.4]} />
        <meshBasicMaterial map={hRojo} transparent opacity={0.7 * e.calor * e.pad} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.9]} rotation={[-0.9, 0, 0]} scale={pulso * 1.1}>
        <planeGeometry args={[5.4, 5.4]} />
        <meshBasicMaterial map={hAzul} transparent opacity={0.45 * (1 - e.calor) * e.pad} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh geometry={cuerpoGeo} castShadow>
        <meshStandardMaterial color="#1a2036" emissive={emi} emissiveIntensity={0.25 + 0.55 * e.calor} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh geometry={agarreGeo} position={[-1.15, -0.05, 0.55]} rotation={[0, -0.35, 0]} castShadow>
        <meshStandardMaterial color="#1a2036" emissive={emi} emissiveIntensity={0.2 + 0.4 * e.calor} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh geometry={agarreGeo} position={[1.15, -0.05, 0.55]} rotation={[0, 0.35, 0]} castShadow>
        <meshStandardMaterial color="#1a2036" emissive={emi} emissiveIntensity={0.2 + 0.4 * e.calor} roughness={0.5} metalness={0.15} />
      </mesh>
      {/* cruceta */}
      <mesh position={[-0.62, 0.27, 0.1]}>
        <boxGeometry args={[0.4, 0.06, 0.12]} />
        <meshStandardMaterial color="#0b0e18" roughness={0.6} />
      </mesh>
      <mesh position={[-0.62, 0.27, 0.1]}>
        <boxGeometry args={[0.12, 0.06, 0.4]} />
        <meshStandardMaterial color="#0b0e18" roughness={0.6} />
      </mesh>
      {/* botones de acción */}
      <Boton pos={[0.78, 0.28, 0.0]} color="#ffd23a" calor={e.calor} />
      <Boton pos={[0.98, 0.28, 0.14]} color="#ff5a4a" calor={e.calor} />
      <Boton pos={[0.58, 0.28, 0.14]} color="#4aa8ff" calor={e.calor} />
      <Boton pos={[0.78, 0.28, 0.28]} color="#5fe08a" calor={e.calor} />
      {/* palancas */}
      <Palanca pos={[-0.38, 0.25, 0.4]} />
      <Palanca pos={[0.38, 0.25, 0.4]} />
    </group>
  );
};

const Informe: React.FC<{ e: EstadoJoystick }> = ({ e }) => {
  const en = !!e.en;
  const hoja = useMemo(
    () =>
      placa(640, 760, AZUL, [
        { t: "APA · 2020", c: AMARILLO, s: 74 },
        { t: en ? "violent video games" : "videojuegos violentos", c: "#ffffff", s: 52 },
        { t: en ? "→ violent behavior" : "→ conducta violenta", c: "#ffffff", s: 52 },
        { t: " ", c: "#fff", s: 24 },
        { t: en ? "insufficient" : "evidencia", c: AMARILLO, s: 60 },
        { t: en ? "evidence" : "insuficiente", c: AMARILLO, s: 60 },
      ]),
    [en],
  );
  if (e.informe <= 0.001) return null;
  const s = 0.75 + 0.25 * e.informe;
  return (
    <group position={[1.7, 1.55, 0.2]} scale={s}>
      <mesh>
        <planeGeometry args={[2.5, 2.97]} />
        <meshBasicMaterial map={hoja} transparent opacity={e.informe} />
      </mesh>
      {/* cruz sobre la flecha de causa */}
      {e.cruz > 0.001 && (
        <group position={[1.05, 1.3, 0.05]} scale={e.cruz}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.75, 0.15, 0.04]} />
            <meshBasicMaterial color={ROJO} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.75, 0.15, 0.04]} />
            <meshBasicMaterial color={ROJO} />
          </mesh>
        </group>
      )}
    </group>
  );
};

const Barra: React.FC<{ x: number; alto: number; lleno: number; color: string; titulo: string; sub: string; interrogante?: number }> = ({
  x,
  alto,
  lleno,
  color,
  titulo,
  sub,
  interrogante = 0,
}) => {
  const tex = useMemo(() => placa(420, 240, color, [{ t: titulo, c: "#ffffff", s: 62 }, { t: sub, c: color, s: 46 }]), [titulo, sub, color]);
  const interro = useMemo(() => placa(200, 200, ROJO, [{ t: "?", c: ROJO, s: 150 }]), []);
  const h = Math.max(0.001, alto * lleno);
  return (
    <group position={[x, 0, 0]}>
      {/* carcasa transparente de la barra */}
      <mesh position={[0, alto / 2, 0]}>
        <boxGeometry args={[0.8, alto, 0.4]} />
        <meshStandardMaterial color="#1a2036" transparent opacity={0.35} roughness={0.2} />
      </mesh>
      {/* relleno */}
      {lleno > 0.001 && (
        <mesh position={[0, h / 2, 0]}>
          <boxGeometry args={[0.7, h, 0.34]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.4} />
        </mesh>
      )}
      <mesh position={[0, alto + 0.75, 0]}>
        <planeGeometry args={[2.1, 1.2]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
      {interrogante > 0.001 && (
        <mesh position={[0, alto * 0.5, 0.25]} scale={interrogante}>
          <planeGeometry args={[0.9, 0.9]} />
          <meshBasicMaterial map={interro} transparent opacity={interrogante} />
        </mesh>
      )}
    </group>
  );
};

const Medidor: React.FC<{ e: EstadoJoystick }> = ({ e }) => {
  if (e.medidor <= 0.001) return null;
  return (
    <group position={[0, 0, 0]} scale={0.7 + 0.3 * e.medidor}>
      <Barra x={0.2} alto={0.9} lleno={e.chica} color={AMARILLO} titulo={e.en ? "yelling" : "gritar"} sub={e.en ? "pushing" : "empujar"} />
      <Barra x={1.9} alto={3.2} lleno={0} color={ROJO} titulo={e.en ? "serious" : "violencia"} sub={e.en ? "violence" : "grave"} interrogante={e.grave} />
    </group>
  );
};

export const Joystick: React.FC<{ e: EstadoJoystick }> = ({ e }) => (
  <group>
    <Pad e={e} />
    <Informe e={e} />
    <Medidor e={e} />
  </group>
);

export const portadaJoystick = (): EstadoJoystick => ({
  frame: 20,
  pad: 1,
  padX: 0,
  padEsc: 1.35,
  calor: 1,
  informe: 0,
  cruz: 0,
  medidor: 0,
  chica: 0,
  grave: 0,
});

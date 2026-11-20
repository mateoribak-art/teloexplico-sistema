import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// "Trece años entre el GTA V y el GTA 6": dos tarjetas de año (2013 y 2026) y entre ellas una fila de
// trece bloques (los años) que se encienden de a uno; abajo, dos banderitas rojas = dos postergaciones.
// Todo sale de useCurrentFrame() (nada de useFrame).

export type EstadoEspera = {
  frame: number;
  t13: number;    // tarjeta 2013 (0..1)
  t26: number;    // tarjeta 2026 (0..1)
  anios: number;  // 0..13 bloques encendidos (fraccionario)
  p1: number;     // 0..1 primera postergación
  p2: number;     // 0..1 segunda postergación
  ant: number;    // 0..1 anuncio "2025" (tarjeta de lo prometido)
  en?: boolean;   // rótulos en inglés
};

const ROJO = "#ff3a2e";
const AZUL = "#3a7bff";
const AMARILLO = "#ffd23a";

const tarjetaGeo = new RoundedBoxGeometry(2.1, 1.5, 0.14, 5, 0.09);
const bloqueGeo = new RoundedBoxGeometry(0.34, 0.62, 0.34, 4, 0.05);

const texto = (txt: string, sub: string, color: string, w = 512, h = 360) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0f1526";
  g.fillRect(0, 0, w, h);
  g.lineWidth = 14;
  g.strokeStyle = color;
  g.strokeRect(7, 7, w - 14, h - 14);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#ffffff";
  g.font = "bold 190px Arial";
  g.fillText(txt, w / 2, h * 0.45);
  g.fillStyle = color;
  g.font = "bold 52px Arial";
  g.fillText(sub, w / 2, h * 0.84);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

const rotulo = (txt: string, color: string) => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(10,14,28,0.9)";
  g.fillRect(0, 0, 512, 128);
  g.strokeStyle = color;
  g.lineWidth = 8;
  g.strokeRect(4, 4, 504, 120);
  g.fillStyle = color;
  g.font = "bold 44px Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(txt, 256, 66, 480);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const Tarjeta: React.FC<{ txt: string; sub: string; color: string; op: number; pos: [number, number, number] }> = ({ txt, sub, color, op, pos }) => {
  const cara = useMemo(() => texto(txt, sub, color), [txt, sub, color]);
  if (op <= 0.001) return null;
  const s = 0.85 + 0.15 * op;
  return (
    <group position={pos} scale={s}>
      <mesh geometry={tarjetaGeo} castShadow>
        <meshStandardMaterial color="#0e1324" roughness={0.6} metalness={0.1} transparent opacity={op} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[2.04, 1.44]} />
        <meshBasicMaterial map={cara} transparent opacity={op} />
      </mesh>
    </group>
  );
};

const Bandera: React.FC<{ op: number; y: number; txt: string; color?: string }> = ({ op, y, txt, color = ROJO }) => {
  const tex = useMemo(() => rotulo(txt, color), [txt, color]);
  if (op <= 0.001) return null;
  return (
    <group position={[0, y - 0.3 * (1 - op), 0.1]} scale={0.8 + 0.2 * op}>
      <mesh>
        <planeGeometry args={[3.6, 0.9]} />
        <meshBasicMaterial map={tex} transparent opacity={op} />
      </mesh>
    </group>
  );
};

export const Espera13: React.FC<{ e: EstadoEspera }> = ({ e }) => {
  const frame = useCurrentFrame();
  return (
    <group>
      <Tarjeta txt="2013" sub="GTA V" color={AZUL} op={e.t13} pos={[-1.75, 4.7, 0]} />
      <Tarjeta txt="2026" sub="GTA 6" color={ROJO} op={e.t26} pos={[1.75, 4.7, 0]} />
      {/* fila de trece años */}
      <group position={[0, 2.5, 0]}>
        {Array.from({ length: 13 }).map((_, i) => {
          const x = -2.4 + i * 0.4;
          const on = Math.max(0, Math.min(1, e.anios - i));
          const color = new THREE.Color(AZUL).lerp(new THREE.Color(AMARILLO), 0.0);
          const alto = 0.4 + 0.6 * on;
          const pulso = on > 0 && on < 1 ? 1 + 0.15 * Math.sin(frame) : 1;
          return (
            <mesh key={i} geometry={bloqueGeo} position={[x, alto * 0.31, 0]} scale={[pulso, alto, pulso]} castShadow>
              <meshStandardMaterial
                color={on > 0.01 ? color : "#26304a"}
                emissive={on > 0.01 ? AMARILLO : "#000000"}
                emissiveIntensity={on > 0.01 ? 0.9 * on : 0}
                roughness={0.5}
                transparent
                opacity={0.35 + 0.65 * Math.max(on, e.t13 * 0.3)}
              />
            </mesh>
          );
        })}
      </group>
      <Bandera op={e.ant} y={2.0} txt={e.en ? "PROMISED: 2025" : "PROMETIDO: 2025"} color={AMARILLO} />
      <Bandera op={e.p1} y={1.25} txt={e.en ? "DELAYED → MAY 2026" : "POSTERGADO → MAYO 2026"} />
      <Bandera op={e.p2} y={0.5} txt={e.en ? "DELAYED → NOV 2026" : "POSTERGADO → NOV 2026"} />
    </group>
  );
};

export const portadaEspera = (): EstadoEspera => ({ frame: 20, t13: 1, t26: 1, anios: 13, p1: 0, p2: 0, ant: 0 });

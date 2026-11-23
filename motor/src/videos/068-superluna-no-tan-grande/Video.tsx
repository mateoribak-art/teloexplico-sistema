import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/068-superluna-no-tan-grande/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Estrellas, Tierra, Suelo } from "../../kit3d/cielo";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: el cielo de noche. Una luna llena se compara con la superluna lado a lado (solo 14 % de diferencia),
// y después la misma luna a la altura del horizonte, que "parece" enorme (ilusión óptica).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  orbita: r.f(1),
  cerca: r.f(2),
  nasa: r.f(3),
  notar: r.f(4),
  ojo: r.f(5),
  fecha: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (frame: number, pares: [number, number][]) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of pares) {
    xs.push(xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const CELESTE = "#7fd0ff";

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 0.6, 9], mira: [0, 0.6, 0], fov: 34 },
  { f: E.orbita, pos: [0, 5.5, 12], mira: [0, 0, 0], fov: 34 },
  { f: E.nasa, pos: [0, 0.4, 10], mira: [0, 0.4, 0], fov: 34 },
  { f: E.ojo, pos: [0, -0.6, 11], mira: [0, -0.4, 0], fov: 34 },
  { f: E.pregunta, pos: [0, 0.6, 10], mira: [0, 0.6, 0], fov: 34 },
  { f: DURACION, pos: [0.3, 0.6, 9.5], mira: [0, 0.6, 0], fov: 34 },
];

const Luna: React.FC<{ pos: [number, number, number]; escala?: number; brillo?: number; v?: number }> = ({ pos, escala = 1, brillo = 1, v = 1 }) => {
  if (v <= 0) return null;
  return (
    <group position={pos} scale={escala * v}>
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#e9e6dc" emissive="#d8d3c2" emissiveIntensity={0.18 * brillo} roughness={1} />
      </mesh>
      {/* manchas (mares) */}
      <mesh position={[-0.3, 0.3, 0.92]} scale={[0.32, 0.26, 0.1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#b8b3a3" roughness={1} />
      </mesh>
      <mesh position={[0.35, -0.15, 0.9]} scale={[0.24, 0.3, 0.1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#c2bdae" roughness={1} />
      </mesh>
      <mesh position={[0.1, 0.55, 0.82]} scale={[0.18, 0.14, 0.1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#bdb8a8" roughness={1} />
      </mesh>
      {/* resplandor */}
      <mesh scale={1.25}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#fff6d8" transparent opacity={0.1 * brillo} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** Aro (contorno) de la luna normal, para ver cuánto más grande es la otra. */
const Aro: React.FC<{ pos: [number, number, number]; radio: number; v: number; color?: string }> = ({ pos, radio, v, color = CELESTE }) => {
  if (v <= 0) return null;
  return (
    <mesh position={pos}>
      <torusGeometry args={[radio, 0.03, 8, 80]} />
      <meshBasicMaterial color={color} transparent opacity={0.9 * v} depthWrite={false} />
    </mesh>
  );
};

const DESTACAR = ["superluna", "óvalo", "NASA", "ilusión", "Ojo:", "Mandáselo", "sí", "no", "gigante", "cerca"];
const CIFRAS: [string, string][] = [
  ["catorce por ciento", "14 %"],
  ["treinta por ciento", "30 %"],
  ["veinticuatro", "24"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.orbita, "whoosh", 0.4],
  [E.cerca, "tic", 0.4],
  [E.nasa, "whoosh", 0.4],
  [E.nasa + 40, "pop", 0.4],
  [E.notar, "sello", 0.45],
  [E.ojo, "sello", 0.4],
  [E.fecha, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

const ORB = { a: 2.4, b: 1.4 };

export const Superluna3D: React.FC = () => {
  const frame = useCurrentFrame();
  // escenas: 1 luna sola → órbita → comparación → horizonte → vuelta
  const vOrbita = k(frame, [[E.orbita - 2, 0], [E.orbita + 10, 1], [E.nasa - 4, 1], [E.nasa + 6, 0]]);
  const vSolo = k(frame, [[E.orbita - 6, 1], [E.orbita + 4, 0], [E.ojo + 70, 0], [E.ojo + 80, 1]]);
  const vPar = k(frame, [[E.nasa, 0], [E.nasa + 12, 1], [E.ojo - 6, 1], [E.ojo + 4, 0]]);
  const vHor = k(frame, [[E.ojo, 0], [E.ojo + 12, 1], [E.ojo + 70, 1], [E.ojo + 80, 0]]);
  const aro = k(frame, [[E.nasa + 30, 0], [E.nasa + 44, 1]]);
  // luna dando la vuelta a la Tierra (más cerca en el lado derecho del óvalo)
  const ang = k(frame, [[E.orbita, 0.4], [E.cerca + 30, 2 * Math.PI * 1.0 + 0.1]]);
  const cx = Math.cos(ang) * ORB.a * 0.9 + 0.3;
  const cz = Math.sin(ang) * ORB.b;
  const cerca = k(frame, [[E.cerca, 0], [E.cerca + 12, 1]]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} deriva={0.0008} />
        <Estrellas cantidad={260} seed="superluna" />
        <Luna pos={[0, 1.0, 0]} escala={1.0} v={vSolo} />
        {/* órbita: óvalo con la Tierra a un costado */}
        <group visible={vOrbita > 0.01}>
          <Tierra pos={[0.3, 0, 0]} escala={0.55 * vOrbita} />
          <mesh position={[0.3, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[ORB.a * 0.9, ORB.b, 1]}>
            <torusGeometry args={[1, 0.018, 8, 120]} />
            <meshBasicMaterial color={CELESTE} transparent opacity={0.75 * vOrbita} depthWrite={false} />
          </mesh>
          <Luna pos={[cx, 0, cz]} escala={0.42 * vOrbita * (1 + 0.15 * cerca)} />
          <mesh position={[0.3 + ORB.a * 0.9 * 0.97, 0, 0]} scale={vOrbita * cerca}>
            <ringGeometry args={[0.55, 0.62, 40]} />
            <meshBasicMaterial color="#ffc53d" transparent opacity={0.95} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
        {/* comparación: luna normal (aro) vs superluna 14 % más grande */}
        <Luna pos={[0, 1.0, 0]} escala={1.14} v={vPar} brillo={1.3} />
        <Aro pos={[0, 1.0, 1.2]} radio={0.88} v={aro * vPar} />
        {/* horizonte: la misma luna, baja, parece enorme */}
        <group visible={vHor > 0.01}>
          <Suelo y={-3.2} luces={vHor} />
          <Luna pos={[0, 0.2, -1]} escala={1.0} v={vHor} />
        </group>
      </Estudio>
      <Chip desde={0} hasta={E.orbita} x={540} y={300}>
        Superluna: <span style={{ color: ACENTO }}>¿gigante?</span>
      </Chip>
      <Chip desde={E.orbita} hasta={E.cerca} x={540} y={300}>
        Órbita en <span style={{ color: ACENTO }}>óvalo</span>
      </Chip>
      <Chip desde={E.cerca} hasta={E.nasa} x={540} y={300} color={ACENTO}>
        Luna llena + punto <span style={{ color: ACENTO }}>cercano</span>
      </Chip>
      <Chip desde={E.nasa} hasta={E.nasa + 55} x={540} y={300}>
        NASA · hasta <span style={{ color: ACENTO }}>+14 %</span> de tamaño
      </Chip>
      <Chip desde={E.nasa + 55} hasta={E.notar} x={540} y={300}>
        Hasta <span style={{ color: ACENTO }}>+30 %</span> de brillo
      </Chip>
      <Chip desde={E.notar} hasta={E.ojo} x={540} y={300}>
        A simple vista: <span style={{ color: ACENTO }}>se nota poco</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.fecha} x={540} y={300}>
        Cerca del horizonte: <span style={{ color: ACENTO }}>ilusión óptica</span>
      </Chip>
      <Chip desde={E.fecha} hasta={E.pregunta} x={540} y={300}>
        Luna llena · martes <span style={{ color: ACENTO }}>24/11</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={300}>
        ¿La mirás? <span style={{ color: ACENTO }}>Sí</span> o <span style={{ color: ACENTO }}>no</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que va a jurar que la luna está enorme" />
      <Audio src={staticFile("068-superluna-no-tan-grande/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 0.4, 9], mira: [0, 0.4, 0], fov: 34 }];
export const Portada068: React.FC = () => (
  <Portada arriba="la superluna" grande="¿tan grande?" sello="solo 14 %" colorSello={C.azul} numero={68}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Estrellas cantidad={200} seed="superluna" />
      <Luna pos={[0, 0.6, 0]} escala={1.14} brillo={1.3} />
      <Aro pos={[0, 0.6, 1.2]} radio={0.88} v={1} />
    </Estudio>
  </Portada>
);

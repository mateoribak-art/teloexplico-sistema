import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/043-feriados-visita/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Argentina en datos: mapa real de Argentina; el lunes se levanta todo el país, el martes se encienden CABA y Córdoba,
// el miércoles la provincia de Buenos Aires (halo). Fuentes: DNU 1103/2026 (Boletín Oficial 28/9/2026) y Chequeado.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  tres: r.f(1),
  lunes: r.f(2),
  martes: r.f(3),
  miercoles: r.f(4),
  resto: r.f(5),
  decreto: r.f(6),
  ojo: r.f(7),
  anotalo: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
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

const CABA: LonLat = [-58.4, -34.6];
const CORDOBA: LonLat = [-64.2, -31.4];
const PBA: LonLat = [-60.8, -36.8];
const [kx, ky] = enMapa(CABA);
const [ox, oy] = enMapa(CORDOBA);
const [px, py] = enMapa(PBA);
const MIRA: [number, number, number] = [0.2, 0.3, 0];

const TOMAS: Toma[] = [
  { f: 0, pos: [0.2, -3.2, 15], mira: MIRA, fov: 34 },
  { f: E.lunes, pos: [0.2, -3.0, 13.5], mira: MIRA, fov: 34 },
  { f: E.martes, pos: [(kx + ox) / 2 + 0.4, (ky + oy) / 2 - 2.4, 8.4], mira: [(kx + ox) / 2, (ky + oy) / 2, 0], fov: 34 },
  { f: E.miercoles, pos: [px + 0.4, py - 2.4, 8.4], mira: [px, py, 0], fov: 34 },
  { f: E.resto, pos: [0.2, -3.2, 15], mira: MIRA, fov: 34 },
  { f: E.ojo + 6, pos: [0.2, -3.2, 15.5], mira: MIRA, fov: 34 },
  { f: DURACION, pos: [0.6, -3.2, 14], mira: MIRA, fov: 34 },
];

const Pin: React.FC<{ en: LonLat; v: number; color: string }> = ({ en, v, color }) => {
  if (v <= 0) return null;
  const [x, y] = enMapa(en);
  return (
    <group position={[x, y, 0.25]} scale={v * 1.6}>
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.01, 0.6, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, 0.62]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
    </group>
  );
};

/** Halo de luz que marca una zona (sin pretender ser el límite exacto). */
const Halo: React.FC<{ en: LonLat; v: number; radio: number; color: string }> = ({ en, v, radio, color }) => {
  if (v <= 0) return null;
  const [x, y] = enMapa(en);
  return (
    <mesh position={[x, y, 0.75]} scale={[v, v, 1]}>
      <circleGeometry args={[radio, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
};

const DESTACAR = ["lunes", "martes", "miércoles", "feriados", "feriado", "Córdoba", "Ojo:", "Mandáselo", "nueve", "diez", "once", "tu", "empresa"];
const CIFRAS: [string, string][] = [
  ["nueve", "9"],
  ["diez", "10"],
  ["once", "11"],
  ["mil ciento tres", "1103"],
  ["veintiocho", "28"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.tres, "whoosh", 0.4],
  [E.lunes, "whoosh", 0.35],
  [E.lunes + 6, "ding", 0.45],
  [E.martes, "whoosh", 0.4],
  [E.martes + 8, "pop", 0.45],
  [E.miercoles, "whoosh", 0.4],
  [E.miercoles + 8, "pop", 0.45],
  [E.resto, "whoosh", 0.35],
  [E.decreto, "tic", 0.4],
  [E.ojo, "pop", 0.4],
  [E.anotalo, "ding", 0.4],
  [E.cta, "pop", 0.4],
];

export const FeriadosVisita3D: React.FC = () => {
  const frame = useCurrentFrame();
  const altoAr = k(frame, [[E.lunes, 0.1], [E.lunes + 10, 0.9], [E.martes, 0.9], [E.martes + 10, 0.25], [E.resto + 6, 0.25]]);
  const fuera = k(frame, [[E.resto, 1], [E.resto + 10, 0]]);
  const vCaba = k(frame, [[E.martes + 4, 0], [E.martes + 12, 1], [E.miercoles, 1], [E.miercoles + 10, 0]]) * fuera;
  const vCba = k(frame, [[E.martes + 14, 0], [E.martes + 22, 1], [E.miercoles, 1], [E.miercoles + 10, 0]]) * fuera;
  const vPba = k(frame, [[E.miercoles + 4, 0], [E.miercoles + 16, 1]]) * fuera;
  const vCaba2 = vCaba;
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto: altoAr } }} />
        <Halo en={CABA} v={vCaba} radio={0.3} color="#ffc53d" />
        <Halo en={CORDOBA} v={vCba} radio={0.3} color="#ffc53d" />
        <Halo en={PBA} v={vPba} radio={1.0} color="#ffc53d" />
        <Pin en={CABA} v={vCaba2 * 0.6} color="#ff4d4d" />
        <Pin en={CORDOBA} v={vCba * 0.6} color="#ff4d4d" />
      </Estudio>
      <Chip desde={0} hasta={E.tres} x={540} y={300}>
        ¿Se labura <span style={{ color: ACENTO }}>el martes</span>?
      </Chip>
      <Chip desde={E.tres} hasta={E.lunes} x={540} y={300}>
        <span style={{ color: ACENTO }}>3</span> feriados distintos
      </Chip>
      <Chip desde={E.lunes} hasta={E.martes} x={540} y={300}>
        Lunes 9 · <span style={{ color: ACENTO }}>todo el país</span>
      </Chip>
      <Chip desde={E.martes} hasta={E.miercoles} x={540} y={300}>
        Martes 10 · <span style={{ color: ACENTO }}>CABA y Córdoba</span>
      </Chip>
      <Chip desde={E.miercoles} hasta={E.resto} x={540} y={300}>
        Miércoles 11 · <span style={{ color: ACENTO }}>Pcia. de Buenos Aires</span>
      </Chip>
      <Chip desde={E.resto} hasta={E.decreto} x={540} y={300}>
        Resto del país: <span style={{ color: ACENTO }}>sin feriado por este decreto</span>
      </Chip>
      <Chip desde={E.decreto} hasta={E.ojo} x={540} y={300}>
        DNU <span style={{ color: ACENTO }}>1103/2026</span> · Boletín Oficial · 28-9-2026
      </Chip>
      <Chip desde={E.ojo} hasta={E.anotalo} x={540} y={300}>
        Confirmalo con <span style={{ color: ACENTO }}>tu empresa</span>
      </Chip>
      <Chip desde={E.anotalo} hasta={E.cta} x={540} y={300}>
        Lun <span style={{ color: ACENTO }}>todos</span> · Mar <span style={{ color: ACENTO }}>CABA + Cba</span> · Mié <span style={{ color: ACENTO }}>PBA</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que pregunta si el martes se labura" />
      <Audio src={staticFile("043-feriados-visita/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.2, -3.2, 15], mira: MIRA, fov: 34 }];
export const Portada043: React.FC = () => (
  <Portada arriba="¿se labura el martes?" grande="3 feriados, 3 lugares" sello="9, 10 Y 11" colorSello={C.azul} numero={43}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto: 0.8 } }} />
      <Halo en={CABA} v={1} radio={0.3} color="#ffc53d" />
      <Halo en={CORDOBA} v={1} radio={0.3} color="#ffc53d" />
      <Pin en={CABA} v={0.6} color="#ff4d4d" />
      <Pin en={CORDOBA} v={0.6} color="#ff4d4d" />
    </Estudio>
  </Portada>
);

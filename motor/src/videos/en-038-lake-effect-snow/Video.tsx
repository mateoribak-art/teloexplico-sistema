import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/en-038-lake-effect-snow/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Weather explained #7: mapa real de los Grandes Lagos. Aire frío desde Canadá cruza el agua abierta (más cálida),
// sube y forma una banda angosta de nieve en la orilla de sotavento; a una o dos millas puede haber sol.
// Fondo oscuro, un acento. Fuente: NWS (weather.gov/safety/winter-lake-effect-snow), ver guion.json.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  nombre: r.f(1),
  frio: r.f(2),
  agua: r.f(3),
  sube: r.f(4),
  nws: r.f(5),
  ojo: r.f(6),
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

const CENTRO: LonLat = [-85, 44.5];
const mp = (ll: LonLat) => enMapa(ll, CENTRO);
const [cx, cy] = mp([-85, 45]);
const [bx, by] = mp([-85.4, 43.7]);

const LAGOS: { ll: LonLat; a: number; h: number }[] = [
  { ll: [-87.5, 47.7], a: 0.36, h: 0.15 },
  { ll: [-87, 44], a: 0.12, h: 0.3 },
  { ll: [-82.3, 44.8], a: 0.22, h: 0.2 },
  { ll: [-81, 42.2], a: 0.25, h: 0.07 },
  { ll: [-77.8, 43.7], a: 0.2, h: 0.07 },
];

const TOMAS: Toma[] = [
  { f: 0, pos: [bx + 0.1, by - 1.6, 8], mira: [bx + 0.1, by, 0], fov: 34 },
  { f: E.nombre + 6, pos: [cx, cy - 2.6, 11], mira: [cx, cy, 0], fov: 34 },
  { f: E.frio + 6, pos: [cx, cy - 2.6, 11.5], mira: [cx, cy, 0], fov: 34 },
  { f: E.agua + 6, pos: [cx + 0.2, cy - 2, 9], mira: [cx + 0.2, cy, 0], fov: 34 },
  { f: E.sube + 6, pos: [bx, by - 1.4, 6.5], mira: [bx, by, 0], fov: 34 },
  { f: E.nws + 6, pos: [bx + 0.1, by - 1.4, 6], mira: [bx + 0.1, by, 0], fov: 34 },
  { f: E.ojo + 8, pos: [bx + 0.2, by - 1.6, 8], mira: [bx + 0.2, by, 0], fov: 34 },
  { f: DURACION, pos: [cx, cy - 2.6, 11], mira: [cx, cy, 0], fov: 34 },
];

const [x0, y0] = mp([-87, 50]);
const [x1, y1] = mp([-87.2, 44.8]);
const [x2, y2] = mp([-84.8, 43.3]);
const curva = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(x0, y0, 0.5),
  new THREE.Vector3(x1 - 0.1, y1 + 0.8, 0.7),
  new THREE.Vector3(x2, y2, 0.5),
);

/** Aire frío: se dibuja con p de 0 a 1 y lleva un punto brillante. */
const Ruta: React.FC<{ p: number }> = ({ p }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(curva, 100, 0.03, 8, false), []);
  if (p <= 0) return null;
  geo.setDrawRange(0, Math.floor(geo.index!.count * p));
  const punta = curva.getPoint(p);
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color={ACENTO} transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh position={punta}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshBasicMaterial color="#e8f6ff" toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Mancha luminosa sobre el mapa. */
const Mancha: React.FC<{ en: LonLat; ancho: number; alto: number; color: string; v: number; z?: number }> = ({ en, ancho, alto, color, v, z = 0.5 }) => {
  if (v <= 0.01) return null;
  const [x, y] = mp(en);
  return (
    <group position={[x, y, z]} scale={[ancho * v, alto * v, 1]}>
      <mesh>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.6 * v} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[1.3, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.2 * v} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

const DESTACAR = ["buried", "lake-effect", "Canada", "warm", "heat", "moisture", "rises", "narrow", "band", "National", "Weather", "Service", "inches", "sun", "snow", "Send"];
const CIFRAS: [string, string][] = [["two to three", "2–3"]];

const efectos: Efecto[] = [
  [E.nombre, "pop", 0.45],
  [E.frio, "whoosh", 0.4],
  [E.agua, "tic", 0.4],
  [E.sube, "whoosh", 0.35],
  [E.nws, "ding", 0.45],
  [E.ojo, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

const Escena: React.FC<{ frame: number }> = ({ frame }) => {
  const lagos = k(frame, [[E.agua, 0], [E.agua + 14, 1], [E.cta, 1], [E.cta + 10, 0.5]]);
  const p = k(frame, [[E.frio + 4, 0], [E.frio + 50, 1]]);
  const nieve = k(frame, [[0, 1], [E.nombre, 1], [E.frio, 0.25], [E.sube, 0.25], [E.sube + 20, 1]]);
  const sol = k(frame, [[0, 1], [E.frio, 0.2], [E.ojo, 0.2], [E.ojo + 16, 1]]);
  return (
    <>
      <Mapa3D centro={CENTRO} alcance={30} resaltar={{ "United States of America": { color: "#5b7fa8", alto: 0.2 }, Canada: { color: "#3f5878", alto: 0.15 } }} />
      {LAGOS.map((l, i) => (
        <Mancha key={i} en={l.ll} ancho={l.a} alto={l.h} color={lagos > 0.05 ? "#ff7a2e" : "#2f8fff"} v={Math.max(lagos, 0.0)} z={0.35} />
      ))}
      <Ruta p={p} />
      <Mancha en={[-85.4, 43.7]} ancho={0.12} alto={0.34} color="#f4fbff" v={nieve} z={0.7} />
      <Mancha en={[-83.4, 43.3]} ancho={0.2} alto={0.2} color="#ffd54a" v={sol} z={0.7} />
    </>
  );
};

export const LakeEffectSnowEn038: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Escena frame={frame} />
      </Estudio>
      <Chip desde={0} hasta={E.nombre} x={540} y={300}>
        Snow here · <span style={{ color: ACENTO }}>sun there</span>
      </Chip>
      <Chip desde={E.nombre} hasta={E.frio} x={540} y={300}>
        <span style={{ color: ACENTO }}>Lake-effect</span> snow
      </Chip>
      <Chip desde={E.frio} hasta={E.agua} x={540} y={300}>
        Cold air from <span style={{ color: ACENTO }}>Canada</span>
      </Chip>
      <Chip desde={E.agua} hasta={E.sube} x={540} y={300}>
        Lake adds <span style={{ color: ACENTO }}>heat + moisture</span>
      </Chip>
      <Chip desde={E.sube} hasta={E.nws} x={540} y={300}>
        Air rises → <span style={{ color: ACENTO }}>narrow band</span>
      </Chip>
      <Chip desde={E.nws} hasta={E.ojo} x={540} y={300}>
        <span style={{ color: ACENTO }}>2–3 in</span> of snow per hour · NWS
      </Chip>
      <Chip desde={E.ojo} hasta={E.pregunta} x={540} y={300}>
        Sun just <span style={{ color: ACENTO }}>1–2 miles</span> away
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={300}>
        Snow or <span style={{ color: ACENTO }}>sun</span>?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who swears it's snowing everywhere" />
      <Audio src={staticFile("en-038-lake-effect-snow/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [cx, cy - 2.6, 11], mira: [cx, cy, 0], fov: 34 }];
export const PortadaEn038: React.FC = () => (
  <Portada arriba="snow here, sun a mile away" grande="Lake-effect snow" sello="WEATHER" colorSello={C.azul} numero={38}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Escena frame={0} />
    </Estudio>
  </Portada>
);

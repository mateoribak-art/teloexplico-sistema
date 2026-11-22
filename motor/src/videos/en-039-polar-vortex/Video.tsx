import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/en-039-polar-vortex/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Weather explained #8: mapa de Norteamérica. Una gran masa de aire frío sobre el Ártico (el vórtice polar, todo el año);
// en invierno se refuerza; cuando se expande, el aire frío baja hacia EE. UU. con la corriente en chorro.
// Fondo oscuro, un acento. Fuente: NWS (weather.gov/safety/cold-polar-vortex), ver guion.json.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  masa: r.f(1),
  invierno: r.f(2),
  baja: r.f(3),
  nws: r.f(4),
  ojo: r.f(5),
  consejo: r.f(6),
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

const CENTRO: LonLat = [-97, 52];
const mp = (ll: LonLat) => enMapa(ll, CENTRO);
const [px, py] = mp([-97, 78]);
const [mx, my] = mp([-97, 46]);
const [cx, cy] = mp([-97, 52]);

const TOMAS: Toma[] = [
  { f: 0, pos: [cx, cy - 3.2, 14], mira: [cx, cy + 0.3, 0], fov: 34 },
  { f: E.masa + 6, pos: [px, py - 3.4, 11], mira: [px, py - 0.3, 0], fov: 34 },
  { f: E.invierno + 6, pos: [px, py - 3.4, 10.5], mira: [px, py - 0.3, 0], fov: 34 },
  { f: E.baja + 6, pos: [cx, cy - 3.4, 14.5], mira: [cx, cy, 0], fov: 34 },
  { f: E.nws + 6, pos: [mx, my - 2.8, 10], mira: [mx, my + 1.2, 0], fov: 34 },
  { f: E.ojo + 8, pos: [cx, cy - 3.4, 14.5], mira: [cx, cy, 0], fov: 34 },
  { f: DURACION, pos: [cx, cy - 3.2, 14], mira: [cx, cy + 0.3, 0], fov: 34 },
];

const curva = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(px - 0.8, py - 0.8, 0.6),
  new THREE.Vector3(px + 1.2, (py + my) / 2, 0.8),
  new THREE.Vector3(mx, my, 0.6),
);

/** Aire frío bajando: se dibuja con p de 0 a 1 y lleva un punto brillante. */
const Ruta: React.FC<{ p: number }> = ({ p }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(curva, 100, 0.05, 8, false), []);
  if (p <= 0) return null;
  geo.setDrawRange(0, Math.floor(geo.index!.count * p));
  const punta = curva.getPoint(p);
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color={ACENTO} transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh position={punta}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshBasicMaterial color="#e8f6ff" toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Mancha luminosa sobre el mapa (coordenadas del mapa). */
const Mancha: React.FC<{ x: number; y: number; ancho: number; alto: number; color: string; v: number; z?: number }> = ({ x, y, ancho, alto, color, v, z = 0.5 }) => {
  if (v <= 0.01) return null;
  return (
    <group position={[x, y, z]} scale={[ancho * v, alto * v, 1]}>
      <mesh>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.55 * v} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[1.3, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.2 * v} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

const DESTACAR = ["polar", "vortex", "storm", "cold", "air", "pole", "winter", "strengthens", "south", "jet", "stream", "National", "Weather", "Service", "Arctic", "danger", "weather.gov", "emergency", "kit", "coldest", "Send"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.masa, "pop", 0.45],
  [E.invierno, "tic", 0.4],
  [E.baja, "whoosh", 0.45],
  [E.nws, "ding", 0.45],
  [E.ojo, "pop", 0.4],
  [E.consejo, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

const Escena: React.FC<{ frame: number }> = ({ frame }) => {
  const masa = k(frame, [[0, 0.55], [E.masa, 1]]);
  const fuerza = k(frame, [[E.invierno, 1], [E.invierno + 20, 1.35], [E.baja, 1.35], [E.baja + 20, 1]]);
  const p = k(frame, [[E.baja + 4, 0], [E.baja + 60, 1]]);
  const frio = k(frame, [[E.baja + 40, 0], [E.nws, 1], [E.ojo, 1], [E.consejo, 0.7]]);
  return (
    <>
      <Mapa3D centro={CENTRO} alcance={50} resaltar={{ "United States of America": { color: "#5b7fa8", alto: 0.2 }, Canada: { color: "#3f5878", alto: 0.15 } }} />
      <Mancha x={px} y={py} ancho={1.7 * fuerza} alto={1.1 * fuerza} color="#7fd0ff" v={masa} z={0.5} />
      <Ruta p={p} />
      <Mancha x={mx} y={my + 0.2} ancho={1.5} alto={0.9} color="#e8f6ff" v={frio} z={0.7} />
    </>
  );
};

export const PolarVortexEn039: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Escena frame={frame} />
      </Estudio>
      <Chip desde={0} hasta={E.masa} x={540} y={300}>
        Polar vortex = <span style={{ color: ACENTO }}>not a storm</span>
      </Chip>
      <Chip desde={E.masa} hasta={E.invierno} x={540} y={300}>
        <span style={{ color: ACENTO }}>Cold air</span> at each pole
      </Chip>
      <Chip desde={E.invierno} hasta={E.baja} x={540} y={300}>
        Winter: <span style={{ color: ACENTO }}>stronger</span>
      </Chip>
      <Chip desde={E.baja} hasta={E.nws} x={540} y={300}>
        Cold air heads <span style={{ color: ACENTO }}>south</span>
      </Chip>
      <Chip desde={E.nws} hasta={E.ojo} x={540} y={300}>
        <span style={{ color: ACENTO }}>Arctic air</span> outbreaks · NWS
      </Chip>
      <Chip desde={E.ojo} hasta={E.consejo} x={540} y={300}>
        Real danger: <span style={{ color: ACENTO }}>the cold</span>
      </Chip>
      <Chip desde={E.consejo} hasta={E.pregunta} x={540} y={300}>
        Save: <span style={{ color: ACENTO }}>weather.gov + car kit</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={300}>
        Coldest <span style={{ color: ACENTO }}>where you live</span>?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who says polar vortex when it's just chilly" />
      <Audio src={staticFile("en-039-polar-vortex/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [cx, cy - 3.2, 14], mira: [cx, cy + 0.3, 0], fov: 34 }];
export const PortadaEn039: React.FC = () => (
  <Portada arriba="it's not a storm" grande="Polar vortex" sello="WEATHER" colorSello={C.azul} numero={39}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Escena frame={E.baja + 60} />
    </Estudio>
  </Portada>
);

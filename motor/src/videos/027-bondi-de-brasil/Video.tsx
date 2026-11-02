import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/027-bondi-de-brasil/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Costumbres #2: el mapa real con Brasil y Argentina; la palabra "bonde" sale de Río de Janeiro y viaja hasta
// Buenos Aires, donde se vuelve "bondi". Fondo oscuro, un acento. Fuentes: RAE (DHLE) y Billiken (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  antes: r.f(1),
  tranvia: r.f(2),
  bond: r.f(3),
  rae: r.f(4),
  viaje: r.f(5),
  ojo: r.f(6),
  consejo: r.f(7),
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

const CENTRO: LonLat = [-52, -27];
const RIO: LonLat = [-43.2, -22.9];
const BSAS: LonLat = [-58.4, -34.6];
const mp = (ll: LonLat) => enMapa(ll, CENTRO);
const [rx, ry] = mp(RIO);
const [bx, by] = mp(BSAS);
const cx = (rx + bx) / 2;
const cy = (ry + by) / 2;

const TOMAS: Toma[] = [
  { f: 0, pos: [cx, cy - 3.0, 16.5], mira: [cx, cy, 0], fov: 34 },
  { f: E.antes, pos: [bx + 0.6, by - 1.8, 8.6], mira: [bx, by, 0], fov: 34 },
  { f: E.tranvia + 6, pos: [rx - 0.4, ry - 2.0, 8.4], mira: [rx, ry, 0], fov: 34 },
  { f: E.bond + 6, pos: [rx - 0.2, ry - 2.4, 9.6], mira: [rx, ry, 0], fov: 34 },
  { f: E.rae + 6, pos: [rx - 0.4, ry - 2.0, 8.4], mira: [rx, ry, 0], fov: 34 },
  { f: E.viaje + 6, pos: [cx, cy - 3.0, 15.0], mira: [cx, cy, 0], fov: 34 },
  { f: E.ojo + 12, pos: [cx, cy - 3.0, 16.5], mira: [cx, cy, 0], fov: 34 },
  { f: DURACION, pos: [cx + 0.3, cy - 2.8, 15.5], mira: [cx, cy, 0], fov: 34 },
];

const curva = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(rx, ry, 0.4),
  new THREE.Vector3((rx + bx) / 2 + 0.2, (ry + by) / 2 + 0.9, 1.9),
  new THREE.Vector3(bx, by, 0.4),
);

/** Ruta de la palabra de Río a Buenos Aires: se dibuja con p de 0 a 1 y lleva un punto brillante. */
const Ruta: React.FC<{ p: number }> = ({ p }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(curva, 100, 0.04, 8, false), []);
  if (p <= 0) return null;
  geo.setDrawRange(0, Math.floor(geo.index!.count * p));
  const punta = curva.getPoint(p);
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color={ACENTO} transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <mesh position={punta}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshBasicMaterial color="#fff1b8" toneMapped={false} />
      </mesh>
      <mesh position={punta}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshBasicMaterial color="#ffc53d" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

const Pin: React.FC<{ en: LonLat; v: number; color: string }> = ({ en, v, color }) => {
  if (v <= 0) return null;
  const [x, y] = mp(en);
  return (
    <group position={[x, y, 0.25]} scale={v}>
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

const DESTACAR = ["bondi", "Brasil", "tranvía", "bonde", "bond", "boletos", "portuguesa", "Academia", "inmigrantes", "colectivo", "versiones", "Mandáselo"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.antes, "whoosh", 0.35],
  [E.tranvia, "whoosh", 0.4],
  [E.tranvia + 8, "pop", 0.45],
  [E.bond, "pop", 0.45],
  [E.rae, "whoosh", 0.35],
  [E.rae + 10, "ding", 0.45],
  [E.viaje, "whoosh", 0.4],
  [E.viaje + 8, "tic", 0.4],
  [E.ojo, "whoosh", 0.35],
  [E.consejo, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const BondiDeBrasil3D: React.FC = () => {
  const frame = useCurrentFrame();
  const altoBr = k(frame, [[0, 0.3], [E.tranvia, 0.3], [E.tranvia + 10, 0.7], [E.viaje, 0.7], [E.viaje + 10, 0.3]]);
  const altoAr = k(frame, [[0, 0.5], [E.antes, 0.5], [E.viaje, 0.5], [E.viaje + 14, 0.8], [E.ojo, 0.8], [E.ojo + 10, 0.5]]);
  const p = k(frame, [[E.viaje + 4, 0], [E.viaje + 54, 1]]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Mapa3D
          centro={CENTRO}
          alcance={40}
          resaltar={{ Argentina: { color: "#4d8fe0", alto: altoAr }, Brazil: { color: "#e08a3c", alto: altoBr } }}
        />
        <Ruta p={p} />
        <Pin en={RIO} v={k(frame, [[E.tranvia + 6, 0], [E.tranvia + 12, 1]])} color="#ff4d4d" />
        <Pin en={BSAS} v={k(frame, [[E.antes + 4, 0], [E.antes + 10, 1]])} color="#ff4d4d" />
      </Estudio>
      <Chip desde={0} hasta={E.antes} x={540} y={300}>
        En Argentina: <span style={{ color: ACENTO }}>“bondi”</span>
      </Chip>
      <Chip desde={E.antes} hasta={E.tranvia} x={540} y={300}>
        Hoy: <span style={{ color: ACENTO }}>colectivo</span>
      </Chip>
      <Chip desde={E.tranvia} hasta={E.bond} x={540} y={300}>
        Brasil: <span style={{ color: ACENTO }}>“bonde” = tranvía</span>
      </Chip>
      <Chip desde={E.bond} hasta={E.rae} x={540} y={300}>
        Inglés: <span style={{ color: ACENTO }}>bond</span> · en el boleto
      </Chip>
      <Chip desde={E.rae} hasta={E.viaje} x={540} y={300}>
        RAE · <span style={{ color: ACENTO }}>Río de Janeiro</span> · portuguesismo
      </Chip>
      <Chip desde={E.viaje} hasta={E.ojo} x={540} y={300}>
        Río → Buenos Aires: <span style={{ color: ACENTO }}>bonde → bondi</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.consejo} x={540} y={300}>
        Otras versiones: <span style={{ color: ACENTO }}>menos aceptadas</span>
      </Chip>
      <Chip desde={E.consejo} hasta={E.cta} x={540} y={300}>
        Hoy: <span style={{ color: ACENTO }}>un tranvía de Brasil</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice el bondi en vez del colectivo" />
      <Audio src={staticFile("027-bondi-de-brasil/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [cx, cy - 3.0, 16.5], mira: [cx, cy, 0], fov: 34 }];
export const Portada027: React.FC = () => (
  <Portada arriba="¿por qué le decimos bondi?" grande="la palabra es de Brasil" sello="COSTUMBRES" colorSello={C.azul} numero={27}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mapa3D centro={CENTRO} alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto: 0.8 }, Brazil: { color: "#e08a3c", alto: 0.7 } }} />
      <Ruta p={1} />
    </Estudio>
  </Portada>
);

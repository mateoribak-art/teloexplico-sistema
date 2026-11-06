import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/042-laburo-italiano/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Argentina en datos #5: mapa real con Italia y Argentina; la palabra "lavurare" sale de Génova y cruza el Atlántico
// hasta Buenos Aires, donde se vuelve "laburar". España aparece al final ("currar"). Fuentes: RAE (laburar) y Billiken.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  italiana: r.f(1),
  rae: r.f(2),
  latin: r.f(3),
  barcos: r.f(4),
  puerto: r.f(5),
  currar: r.f(6),
  ojo: r.f(7),
  probar: r.f(8),
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

const CENTRO: LonLat = [-25, 8];
const GENOVA: LonLat = [8.9, 44.4];
const BSAS: LonLat = [-58.4, -34.6];
const MADRID: LonLat = [-3.7, 40.4];
const mp = (ll: LonLat) => enMapa(ll, CENTRO);
const [gx, gy] = mp(GENOVA);
const [bx, by] = mp(BSAS);
const [mx, my] = mp(MADRID);
const cx = (gx + bx) / 2;
const cy = (gy + by) / 2;

const TOMAS: Toma[] = [
  { f: 0, pos: [cx, cy - 6, 38], mira: [cx, cy, 0], fov: 34 },
  { f: E.italiana, pos: [gx - 0.3, gy - 2.4, 8.6], mira: [gx, gy, 0], fov: 34 },
  { f: E.rae + 6, pos: [gx + 0.2, gy - 2.0, 7.6], mira: [gx, gy, 0], fov: 34 },
  { f: E.latin + 6, pos: [gx - 0.2, gy - 2.6, 9.6], mira: [gx, gy, 0], fov: 34 },
  { f: E.barcos, pos: [cx, cy - 6, 38], mira: [cx, cy, 0], fov: 34 },
  { f: E.puerto + 6, pos: [bx + 0.4, by - 2.0, 8.4], mira: [bx, by, 0], fov: 34 },
  { f: E.currar + 6, pos: [(mx + gx) / 2 - 1, (my + gy) / 2 - 3, 10], mira: [(mx + gx) / 2, (my + gy) / 2, 0], fov: 34 },
  { f: E.ojo + 6, pos: [cx, cy - 6, 38], mira: [cx, cy, 0], fov: 34 },
  { f: DURACION, pos: [cx + 0.6, cy - 6, 36], mira: [cx, cy, 0], fov: 34 },
];

const curva = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(gx, gy, 0.4),
  new THREE.Vector3((gx + bx) / 2 + 1.5, (gy + by) / 2 - 1.5, 2.2),
  new THREE.Vector3(bx, by, 0.4),
);

/** Ruta de la palabra de Génova a Buenos Aires: se dibuja con p de 0 a 1 y lleva un punto brillante. */
const Ruta: React.FC<{ p: number }> = ({ p }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(curva, 120, 0.13, 8, false), []);
  if (p <= 0) return null;
  geo.setDrawRange(0, Math.floor(geo.index!.count * p));
  const punta = curva.getPoint(p);
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color={ACENTO} transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <mesh position={punta}>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshBasicMaterial color="#fff1b8" toneMapped={false} />
      </mesh>
      <mesh position={punta}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshBasicMaterial color="#ffc53d" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

const Pin: React.FC<{ en: LonLat; v: number; color: string }> = ({ en, v, color }) => {
  if (v <= 0) return null;
  const [x, y] = mp(en);
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

const DESTACAR = ["laburo", "italiana", "Italiana", "lavurare", "latín", "laborare", "inmigrantes", "diecinueve", "currar", "laburar", "Ojo:", "italiano", "Mandáselo"];
const CIFRAS: [string, string][] = [["diecinueve", "XIX"]];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.italiana, "whoosh", 0.4],
  [E.italiana + 6, "pop", 0.45],
  [E.rae, "whoosh", 0.35],
  [E.rae + 10, "ding", 0.45],
  [E.latin, "whoosh", 0.35],
  [E.barcos, "whoosh", 0.4],
  [E.barcos + 8, "tic", 0.4],
  [E.puerto, "whoosh", 0.35],
  [E.currar, "whoosh", 0.35],
  [E.ojo, "pop", 0.4],
  [E.probar, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const LaburoItaliano3D: React.FC = () => {
  const frame = useCurrentFrame();
  const altoIt = k(frame, [[0, 0.3], [E.italiana, 0.3], [E.italiana + 10, 0.8], [E.barcos, 0.8], [E.puerto, 0.4]]);
  const altoAr = k(frame, [[0, 0.5], [E.barcos + 20, 0.5], [E.puerto, 0.9], [E.currar, 0.9], [E.currar + 10, 0.5]]);
  const altoEs = k(frame, [[E.currar, 0], [E.currar + 10, 0.8], [E.ojo, 0.8], [E.ojo + 10, 0]]);
  const p = k(frame, [[E.barcos + 4, 0], [E.barcos + 64, 1]]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Mapa3D
          centro={CENTRO}
          alcance={70}
          resaltar={{
            Argentina: { color: "#4d8fe0", alto: altoAr },
            Italy: { color: "#e08a3c", alto: altoIt },
            Spain: { color: "#8a6fd1", alto: altoEs },
          }}
        />
        <Ruta p={p} />
        <Pin en={GENOVA} v={k(frame, [[E.italiana + 6, 0], [E.italiana + 12, 1]])} color="#ff4d4d" />
        <Pin en={BSAS} v={k(frame, [[E.barcos + 60, 0], [E.barcos + 68, 1]])} color="#ff4d4d" />
      </Estudio>
      <Chip desde={0} hasta={E.italiana} x={540} y={300}>
        Decís <span style={{ color: ACENTO }}>“laburo”</span> todos los días
      </Chip>
      <Chip desde={E.italiana} hasta={E.rae} x={540} y={300}>
        La palabra es <span style={{ color: ACENTO }}>italiana</span>
      </Chip>
      <Chip desde={E.rae} hasta={E.latin} x={540} y={300}>
        RAE · <span style={{ color: ACENTO }}>“lavurare”</span> = trabajar
      </Chip>
      <Chip desde={E.latin} hasta={E.barcos} x={540} y={300}>
        Latín: <span style={{ color: ACENTO }}>laborare</span> → labor
      </Chip>
      <Chip desde={E.barcos} hasta={E.puerto} x={540} y={300}>
        Fines del <span style={{ color: ACENTO }}>siglo XIX</span> · en barco
      </Chip>
      <Chip desde={E.puerto} hasta={E.currar} x={540} y={300}>
Conventillos y barrios: <span style={{ color: ACENTO }}>se pegó</span>
      </Chip>
      <Chip desde={E.currar} hasta={E.ojo} x={540} y={300}>
España: <span style={{ color: ACENTO }}>currar</span> · del caló
      </Chip>
      <Chip desde={E.ojo} hasta={E.probar} x={540} y={300}>
        El lunfardo se discute · <span style={{ color: ACENTO }}>esta tiene respaldo</span>
      </Chip>
      <Chip desde={E.probar} hasta={E.cta} x={540} y={300}>
        Laburo = <span style={{ color: ACENTO }}>lavurare</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice laburo todo el día" />
      <Audio src={staticFile("042-laburo-italiano/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [cx, cy - 6, 38], mira: [cx, cy, 0], fov: 34 }];
export const Portada042: React.FC = () => (
  <Portada arriba="¿de dónde viene laburo?" grande="la palabra es italiana" sello="LUNFARDO" colorSello={C.azul} numero={42}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mapa3D centro={CENTRO} alcance={70} resaltar={{ Argentina: { color: "#4d8fe0", alto: 0.8 }, Italy: { color: "#e08a3c", alto: 0.8 } }} />
      <Ruta p={1} />
    </Estudio>
  </Portada>
);

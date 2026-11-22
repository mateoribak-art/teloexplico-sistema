import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import * as THREE from "three";
import tiemposJson from "../../../public/065-voseo-vos-o-tu/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Mapa3D, enMapa, type LonLat } from "../../kit3d/Mapa3D";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mapa del Cono Sur: el voseo (RAE) generalizado en Argentina, Uruguay y Paraguay.
// España queda fuera del mapa (solo en texto). Posiciones aproximadas.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  antiguo: r.f(1),
  respeto: r.f(2),
  espana: r.f(3),
  america: r.f(4),
  acepta: r.f(5),
  ojo: r.f(6),
  contesta: r.f(7),
  pregunta: r.f(8),
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

const LL: Record<string, LonLat> = {
  arg: [-62, -36],
  uru: [-56, -32.8],
  par: [-58.4, -23.4],
};
const PT = { arg: enMapa(LL.arg), uru: enMapa(LL.uru), par: enMapa(LL.par) };
const VERDE = "#38e08c";
const MIRA: [number, number, number] = [0.2, 0.3, 0];

const TOMAS: Toma[] = [
  { f: 0, pos: [0.2, -3.2, 15], mira: MIRA, fov: 34 },
  { f: E.antiguo, pos: [0.2, -3.0, 13.5], mira: MIRA, fov: 34 },
  { f: E.espana, pos: [0.2, -3.2, 14.5], mira: MIRA, fov: 34 },
  { f: E.america + 6, pos: [PT.arg[0] + 0.6, PT.arg[1] - 2.4, 11], mira: [PT.arg[0] + 0.6, PT.arg[1] + 0.3, 0], fov: 34 },
  { f: E.ojo, pos: [0.2, -3.2, 14.5], mira: MIRA, fov: 34 },
  { f: E.pregunta, pos: [0.2, -3.2, 14], mira: MIRA, fov: 34 },
  { f: DURACION, pos: [0.6, -3.2, 14.5], mira: MIRA, fov: 34 },
];

const Halo: React.FC<{ x: number; y: number; v: number; color: string; tam?: number }> = ({ x, y, v, color, tam = 1 }) => {
  if (v <= 0) return null;
  return (
    <mesh position={[x, y, 0.75]} scale={[v * tam, v * tam, 1]}>
      <circleGeometry args={[0.5, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} blending={THREE.NormalBlending} toneMapped={false} />
    </mesh>
  );
};

const DESTACAR = ["vos", "tú", "Ojo:", "Mandáselo", "respeto", "error", "antiguo", "Academia", "Uruguay", "Paraguay", "Argentina"];
const CIFRAS: [string, string][] = [["diecisiete", "XVII"], ["dieciocho", "XVIII"]];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.antiguo, "sello", 0.45],
  [E.respeto, "pop", 0.4],
  [E.espana, "tic", 0.4],
  [E.america, "whoosh", 0.4],
  [E.acepta, "pop", 0.4],
  [E.ojo, "tic", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const VoseoVosOTu3D: React.FC = () => {
  const frame = useCurrentFrame();
  const alto = k(frame, [[2, 0.1], [14, 0.5]]);
  const vA = k(frame, [[E.america, 0], [E.america + 10, 1], [E.ojo, 1], [E.ojo + 10, 0.5]]);
  const vU = k(frame, [[E.america + 8, 0], [E.america + 18, 1], [E.ojo, 1], [E.ojo + 10, 0.5]]);
  const vP = k(frame, [[E.america + 16, 0], [E.america + 26, 1], [E.ojo, 1], [E.ojo + 10, 0.5]]);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto }, Uruguay: { color: "#4d8fe0", alto: 0.3 }, Paraguay: { color: "#4d8fe0", alto: 0.3 } }} />
        <Halo x={PT.arg[0]} y={PT.arg[1]} v={vA} color={VERDE} tam={2.4} />
        <Halo x={PT.uru[0]} y={PT.uru[1]} v={vU} color={VERDE} tam={1.1} />
        <Halo x={PT.par[0]} y={PT.par[1]} v={vP} color={VERDE} tam={1.4} />
      </Estudio>
      <Chip desde={0} hasta={E.antiguo} x={540} y={300}>
        ¿<span style={{ color: ACENTO }}>vos</span> o <span style={{ color: "#ff6a8a" }}>tú</span>?
      </Chip>
      <Chip desde={E.antiguo} hasta={E.respeto} x={540} y={300}>
        El vos <span style={{ color: ACENTO }}>no es un error</span>
      </Chip>
      <Chip desde={E.respeto} hasta={E.espana} x={540} y={300}>
        Español antiguo · <span style={{ color: ACENTO }}>vos = respeto</span>
      </Chip>
      <Chip desde={E.espana} hasta={E.america} x={540} y={300} color="#ff6a8a">
        RAE · España · <span style={{ color: "#ff6a8a" }}>casi desaparece</span> · XVII–XVIII
      </Chip>
      <Chip desde={E.america} hasta={E.acepta} x={540} y={300} color={VERDE}>
        <span style={{ color: VERDE }}>Argentina · Uruguay · Paraguay</span>
      </Chip>
      <Chip desde={E.acepta} hasta={E.ojo} x={540} y={300} color={VERDE}>
        RAE · <span style={{ color: VERDE }}>todas las clases sociales</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.contesta} x={540} y={300}>
        Muchos países: <span style={{ color: ACENTO }}>vos, tú y usted</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={300}>
        <span style={{ color: ACENTO }}>vos</span> o <span style={{ color: "#ff6a8a" }}>tú</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que te corrige con el tú" />
      <Audio src={staticFile("065-voseo-vos-o-tu/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.2, -3.2, 15], mira: MIRA, fov: 34 }];
export const Portada065: React.FC = () => (
  <Portada arriba="no es un error" grande="el “vos”" sello="¿vos o tú?" colorSello={C.azul} numero={65}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Mapa3D alcance={40} resaltar={{ Argentina: { color: "#4d8fe0", alto: 0.5 }, Uruguay: { color: "#4d8fe0", alto: 0.3 }, Paraguay: { color: "#4d8fe0", alto: 0.3 } }} />
      <Halo x={PT.arg[0]} y={PT.arg[1]} v={1} color={VERDE} tam={2.4} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import tiemposJson from "../../../public/en-007-flip-steak/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Bife, ChispasCalor, Sarten, Vapor, girado } from "../../kit3d/objetos/Bife";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una sartén de hierro con un bife grueso hecho de capas (se ve la cocción por el costado).
// Mecanismo: dándolo vuelta seguido, cada cara se calienta un poco y descansa un poco: el calor entra más parejo.
// Corte a una tabla con dos bifes cortados al lado: "flip once" (bandas gruesas) vs "flip often" (más parejo). Ilustración, sin números.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  idea: r.f(2),
  parejo: r.f(3),
  estudio: r.f(4),
  jugo: r.f(5),
  ojo: r.f(6),
  consejo: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// perfiles de cocción, de abajo hacia arriba
const CRUDO = [0, 0, 0, 0, 0, 0];
const UNA = [1, 0.95, 0.7, 0.35, 0.2, 0.55]; // una sola vuelta: bandas gruesas, parejo no
const SEGUIDO = [0.75, 0.45, 0.2, 0.2, 0.45, 0.75]; // seguido: bandas finas, centro parejo
const SECO = [1, 1, 1, 1, 1, 1];
const mezcla = (a: number[], b: number[], t: number) => a.map((x, i) => x + (b[i] - x) * t);

type Vista = "sarten" | "dos" | "seco";
const vista = (f: number): Vista => (f >= E.parejo && f < E.jugo ? "dos" : f >= E.jugo && f < E.consejo ? "seco" : "sarten");

// vueltas en la sartén
const UNA_VUELTA = [E.gancho + 26];
const SEGUIDAS = [0, 1, 2, 3].map((i) => r.w(2, "often") + 6 + i * 24);
const CADA_MINUTO = [0, 1, 2].map((i) => E.consejo + 10 + i * 30);

const TOMAS: Toma[] = [
  { f: 0, pos: [0.5, 3.4, 11.5], mira: [0.4, 0.3, 0], fov: 40 },
  { f: E.gancho + 20, pos: [0.3, 2.6, 8.5], mira: [0, 0.4, 0], fov: 38 },
  { f: E.mito, pos: [0.5, 3.4, 11.5], mira: [0.4, 0.3, 0], fov: 40 },
  { f: E.idea, pos: [0.2, 2.8, 8.0], mira: [0, 0.4, 0], fov: 38 },
  { f: E.parejo - 2, pos: [0.4, 3.0, 9.0], mira: [0, 0.4, 0], fov: 38 },
  // tabla con dos bifes cortados
  { f: E.parejo, pos: [0, 2.2, 13], mira: [0, 0.3, 0], fov: 38 },
  { f: E.estudio, pos: [0, 1.8, 11.5], mira: [0, 0.3, 0], fov: 38 },
  { f: E.estudio + 40, pos: [-0.8, 1.4, 8.5], mira: [-0.7, 0.3, 0], fov: 34 },
  { f: E.jugo - 2, pos: [0.8, 1.4, 8.5], mira: [0.7, 0.3, 0], fov: 34 },
  { f: E.jugo, pos: [0, 2.2, 8.5], mira: [0, 0.3, 0], fov: 38 },
  { f: E.ojo, pos: [0.3, 3.0, 10.5], mira: [0.3, 0.3, 0], fov: 40 },
  { f: E.consejo, pos: [0.3, 2.8, 8.5], mira: [0, 0.4, 0], fov: 38 },
  { f: E.cta, pos: [0.5, 3.4, 11.5], mira: [0.4, 0.3, 0], fov: 40 },
  { f: DURACION, pos: [0.5, 3.4, 11.5], mira: [0.4, 0.3, 0], fov: 40 },
];

/** cocción y costra del bife en la sartén según el momento del video */
const estadoSarten = (f: number) => {
  if (f < E.idea) {
    const t = interpolate(f, [0, E.idea], [0, 1], clamp);
    return { perfil: mezcla(CRUDO, UNA, t * 0.55), costra: t * 0.5, vueltas: UNA_VUELTA };
  }
  if (f < E.consejo) {
    const t = interpolate(f, [E.idea, E.parejo], [0, 1], clamp);
    return { perfil: mezcla(CRUDO, SEGUIDO, 0.15 + t * 0.4), costra: 0.2 + t * 0.4, vueltas: SEGUIDAS };
  }
  const t = interpolate(f, [E.consejo, E.cta], [0, 1], clamp);
  return { perfil: mezcla(CRUDO, SEGUIDO, 0.4 + t * 0.4), costra: 0.7 + t * 0.3, vueltas: CADA_MINUTO };
};

const Tabla: React.FC = () => {
  const geo = React.useMemo(() => new RoundedBoxGeometry(5.0, 0.12, 2.2, 3, 0.05), []);
  return (
    <mesh geometry={geo} position={[0, -0.06, 0]} receiveShadow>
      <meshStandardMaterial color="#9a6b3f" roughness={0.75} />
    </mesh>
  );
};

const Escena: React.FC<{ frame: number }> = ({ frame }) => {
  const v = vista(frame);
  if (v === "sarten") {
    const s = estadoSarten(frame);
    const g = girado(s.vueltas, frame);
    const caliente = interpolate(frame, [0, 20], [0, 1], clamp);
    // la cara que mira al fuego alterna: las chispas suben cuando acaba de darse vuelta
    return (
      <group>
        <Sarten calor={caliente} />
        <group position={[0, 0.13 + 0.21 + g.salto, 0]} rotation={[0, 0, g.angulo]}>
          <group position={[0, -0.21, 0]}>
            <Bife e={{ frame, perfil: s.perfil, costra: s.costra, vueltas: s.vueltas }} />
          </group>
        </group>
        <ChispasCalor frame={frame} cantidad={caliente} y0={0.1} y1={0.1 + 0.05} />
        <Vapor frame={frame} intensidad={caliente} y={0.55} />
      </group>
    );
  }
  if (v === "dos") {
    const t = interpolate(frame, [E.parejo, E.parejo + 24], [0, 1], clamp);
    return (
      <group>
        <Tabla />
        <group position={[-1.0, 0, 0]} scale={t}>
          <Bife e={{ frame, perfil: UNA, costra: 0.9, vueltas: [] }} ancho={1.6} />
        </group>
        <group position={[1.0, 0, 0]} scale={t}>
          <Bife e={{ frame, perfil: SEGUIDO, costra: 0.9, vueltas: [] }} ancho={1.6} />
        </group>
      </group>
    );
  }
  return (
    <group>
      <Tabla />
      <group position={[0, 0, 0]}>
        <Bife e={{ frame, perfil: SECO, costra: 0.9, vueltas: [] }} ancho={2.0} fondo={1.2} />
      </group>
    </group>
  );
};

const DESTACAR = ["myth", "evenly", "crispier", "McGee", "Overcooking", "high", "golden", "minute", "often"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [UNA_VUELTA[0], "whoosh", 0.4],
  [E.mito, "scratch", 0.5],
  [E.mito + 6, "sello", 0.5],
  ...SEGUIDAS.map((f): Efecto => [f, "whoosh", 0.3]),
  [E.parejo, "whoosh", 0.4],
  [E.parejo + 16, "pop", 0.45],
  [E.estudio, "ding", 0.4],
  [E.jugo, "whoosh", 0.35],
  [E.jugo + 6, "sello", 0.45],
  [E.ojo, "sello", 0.5],
  [E.consejo, "whoosh", 0.35],
  ...CADA_MINUTO.map((f): Efecto => [f, "tic", 0.4]),
  [E.cta, "pop", 0.4],
];

export const FlipSteakEn007: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Escena frame={frame} />
        <PisoSombra y={-0.0} />
      </Estudio>
      <Chip desde={E.gancho + 20} hasta={E.mito} x={540} y={330}>
        flipped <span style={{ color: ACENTO }}>once</span>
      </Chip>
      <Chip desde={E.mito} hasta={E.idea} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>MYTH</span>
      </Chip>
      <Chip desde={E.idea + 8} hasta={E.parejo} x={540} y={330}>
        heat, <span style={{ color: ACENTO }}>rest</span>, heat, <span style={{ color: ACENTO }}>rest</span>
      </Chip>
      <Chip desde={E.parejo + 20} hasta={E.estudio} x={540} y={330}>
        flip often = <span style={{ color: ACENTO }}>more even</span>
      </Chip>
      <Chip desde={r.w(4, "America's")} hasta={E.jugo} x={540} y={330} color="#5fd2ff">
        flip every minute: <span style={{ color: "#5fd2ff" }}>crispier crust</span>
      </Chip>
      <Chip desde={E.jugo + 6} hasta={E.ojo} x={540} y={330} color="#ffb23d">
        overcooked = <span style={{ color: ACENTO }}>dry</span>
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.consejo} x={540} y={330} color="#ffb23d">
        steaks, high heat · <span style={{ color: "#ff8a7a" }}>not burgers</span>
      </Chip>
      <Chip desde={E.consejo + 4} hasta={E.cta} x={540} y={330}>
        flip about <span style={{ color: ACENTO }}>every minute</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who won't let anyone near the grill" />
      <Audio src={staticFile("en-007-flip-steak/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

// Portada: el bife en la sartén, ya con costra.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.4, 3.2, 9.5], mira: [0.3, 0.3, 0], fov: 38 }];
export const PortadaEn007: React.FC = () => (
  <Portada arriba="flip your steak only once?" grande="it's a myth" sello="MYTH" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Sarten calor={1} />
      <group position={[0, 0.13, 0]}>
        <Bife e={{ frame: 0, perfil: mezcla(CRUDO, SEGUIDO, 0.7), costra: 0.8, vueltas: [] }} />
      </group>
      <PisoSombra y={0} opacidad={0.25} />
    </Estudio>
  </Portada>
);

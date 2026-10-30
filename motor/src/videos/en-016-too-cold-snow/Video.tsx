import React from "react";
import { AbsoluteFill, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-016-too-cold-snow/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una nube gris sobre un campo nevado, bien de noche y bien de frío.
// La nevada depende del "lift": sin aire que sube, los copos se frenan y no llegan al piso; con aire que sube, nieva fuerte (aunque haga mucho frío).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  cero: r.f(2),
  estable: r.f(3),
  lift: r.f(4),
  decir: r.f(5),
  noaa: r.f(6),
  ojo: r.f(7),
  consejo: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FRIO = "#7fd0ff";
const Y_NUBE = 3.2;

const TOMAS: Toma[] = [
  { f: 0, pos: [0.4, 2.2, 11], mira: [0, 1.6, 0], fov: 40 },
  { f: E.mito, pos: [0.2, 1.8, 9], mira: [0, 1.6, 0], fov: 38 },
  { f: E.cero, pos: [0.5, 2.2, 11], mira: [0, 1.6, 0], fov: 40 },
  { f: E.estable, pos: [0.3, 2.4, 8.5], mira: [0, 1.8, 0], fov: 38 },
  { f: E.lift, pos: [0.3, 1.4, 9], mira: [0, 1.6, 0], fov: 40 },
  { f: E.decir, pos: [0.4, 2.2, 11], mira: [0, 1.6, 0], fov: 40 },
  { f: E.noaa, pos: [0.1, 1.2, 8.2], mira: [0, 1.4, 0], fov: 38 },
  { f: E.ojo, pos: [0.4, 2.2, 11], mira: [0, 1.6, 0], fov: 40 },
  { f: E.consejo, pos: [0.2, 1.8, 9], mira: [0, 1.6, 0], fov: 38 },
  { f: DURACION, pos: [0.5, 2.4, 11.5], mira: [0, 1.6, 0], fov: 40 },
];

const Nube: React.FC<{ frame: number }> = ({ frame }) => (
  <group position={[0, Y_NUBE, 0]}>
    {Array.from({ length: 12 }, (_, i) => {
      const x = (i - 5.5) * 0.55;
      const h = 0.45 + random(`nh${i}`) * 0.4;
      return (
        <mesh key={i} position={[x, Math.sin(frame / 40 + i) * 0.03 + (random(`ny${i}`) - 0.5) * 0.25, (random(`nz${i}`) - 0.5) * 0.8]} scale={[1, 0.75, 1]} castShadow>
          <sphereGeometry args={[h, 18, 14]} />
          <meshStandardMaterial color="#aeb8cc" roughness={0.95} />
        </mesh>
      );
    })}
  </group>
);

const Campo: React.FC = () => (
  <mesh position={[0, -0.15, 0]} receiveShadow>
    <boxGeometry args={[9, 0.3, 3.4]} />
    <meshStandardMaterial color="#3a4a6e" roughness={0.9} />
  </mesh>
);

/** copos: `densidad` (0–1) cuántos hay, `alcance` (0–1) qué parte de la caída hacen antes de apagarse */
const Copos: React.FC<{ frame: number; densidad: number; alcance: number }> = ({ frame, densidad, alcance }) => {
  const n = Math.round(90 * densidad);
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const u = (frame * (0.012 + random(`cv${i}`) * 0.008) + random(`cf${i}`)) % 1;
        const x = (random(`cx${i}`) - 0.5) * 7.4 + Math.sin(frame / 20 + i) * 0.08;
        const z = (random(`cz${i}`) - 0.5) * 2.6;
        const y = Y_NUBE - 0.4 - u * (Y_NUBE - 0.35) * alcance;
        const op = Math.min(1, u * 8) * (1 - Math.pow(u, 3) * (alcance < 0.95 ? 1 : 0));
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.045 + random(`cs${i}`) * 0.03, 8, 6]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={op * 0.95} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** capas planas de aire estable */
const Capas: React.FC<{ t: number }> = ({ t }) => (
  <group>
    {[0.9, 1.5, 2.1].map((y, i) => (
      <mesh key={i} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[t, t, 1]}>
        <planeGeometry args={[7.4, 2.6]} />
        <meshBasicMaterial color={FRIO} transparent opacity={0.12 * t} depthWrite={false} side={2} />
      </mesh>
    ))}
  </group>
);

/** flechas de aire que sube */
const Flechas: React.FC<{ frame: number; t: number }> = ({ frame, t }) => (
  <group>
    {[-2.8, -1.4, 0, 1.4, 2.8].map((x, i) => {
      const u = (frame * 0.02 + i * 0.2) % 1;
      return (
        <mesh key={i} position={[x, 0.3 + u * 2.2, 0.2]} scale={t}>
          <coneGeometry args={[0.18, 0.45, 12]} />
          <meshBasicMaterial color={ACENTO} transparent opacity={0.9 * Math.min(1, u * 6) * (1 - Math.pow(u, 4))} depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

const Escena: React.FC<{ frame: number }> = ({ frame }) => {
  const nieva = frame >= E.mito;
  const rara = frame >= E.cero && frame < E.lift;
  const estable = frame >= E.estable && frame < E.lift;
  const conLift = frame >= E.lift && frame < E.ojo;
  const densidad = !nieva ? 0 : rara ? 0.18 : conLift ? 1 : frame >= E.ojo ? 0.35 : 0.75;
  const alcance = estable ? 0.45 : 1;
  const capas = estable ? interpolate(frame, [E.estable, E.estable + 14], [0, 1], clamp) : 0;
  const flechas = conLift ? interpolate(frame, [E.lift, E.lift + 14], [0, 1], clamp) : 0;
  return (
    <group>
      <Campo />
      <Nube frame={frame} />
      <Copos frame={frame} densidad={densidad} alcance={alcance} />
      {capas > 0 && <Capas t={capas} />}
      {flechas > 0 && <Flechas frame={frame} t={flechas} />}
    </group>
  );
};

const DESTACAR = ["myth", "zero", "stable", "lift", "lifting", "lifts", "NOAA", "significant", "rare", "bitter"];
const CIFRAS: [string, string][] = [["zero degrees Fahrenheit", "0 °F"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mito, "scratch", 0.5],
  [E.mito + 6, "sello", 0.5],
  [E.cero, "whoosh", 0.35],
  [E.cero + 20, "ding", 0.45],
  [E.estable, "whoosh", 0.35],
  [E.lift, "pop", 0.45],
  [E.decir, "whoosh", 0.35],
  [E.noaa, "ding", 0.45],
  [E.ojo, "sello", 0.5],
  [E.consejo, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const TooColdSnowEn016: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Escena frame={frame} />
        <PisoSombra y={-0.3} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.mito} x={540} y={330}>
        <span style={{ color: FRIO }}>−10 °F</span> · no snow?
      </Chip>
      <Chip desde={E.mito} hasta={E.cero} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>MYTH</span>
      </Chip>
      <Chip desde={E.cero + 6} hasta={E.estable} x={540} y={330} color={FRIO}>
        below <span style={{ color: FRIO }}>0 °F</span> · rare
      </Chip>
      <Chip desde={E.estable + 6} hasta={E.lift} x={540} y={330} color={FRIO}>
        too <span style={{ color: FRIO }}>stable</span>, not too cold
      </Chip>
      <Chip desde={E.lift + 6} hasta={E.decir} x={540} y={330}>
        snow needs <span style={{ color: ACENTO }}>lift</span>
      </Chip>
      <Chip desde={E.decir + 6} hasta={E.noaa} x={540} y={330}>
        “too cold” = <span style={{ color: ACENTO }}>no lift</span>
      </Chip>
      <Chip desde={E.noaa + 6} hasta={E.ojo} x={540} y={330} color={FRIO}>
        NOAA · <span style={{ color: FRIO }}>very cold</span> can still snow
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.consejo} x={540} y={330} color="#ffb23d">
        below 0 °F · <span style={{ color: "#ff8a7a" }}>rare, not impossible</span>
      </Chip>
      <Chip desde={E.consejo + 4} hasta={E.cta} x={540} y={330}>
        cold + clouds = <span style={{ color: ACENTO }}>maybe snow</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who says it's too cold to snow" />
      <Audio src={staticFile("en-016-too-cold-snow/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.4, 2.0, 10], mira: [0, 1.6, 0], fov: 40 }];
export const PortadaEn016: React.FC = () => (
  <Portada arriba="too cold to snow?" grande="it's a myth" sello="MYTH" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Campo />
      <Nube frame={0} />
      <Copos frame={60} densidad={1} alcance={1} />
      <PisoSombra y={-0.3} opacidad={0.25} />
    </Estudio>
  </Portada>
);

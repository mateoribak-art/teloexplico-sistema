import React from "react";
import { AbsoluteFill, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
// APARTADO (chequeo rechazado 2 veces, sin voz): al rescatarlo, generar la voz y volver a importar ../../../public/en-015-rain-smell/tiempos.json
const tiemposJson = { duracion: 0, frases: [] } as unknown;
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un bloque de tierra seca cortado al medio, con bacterias (cápsulas verdes) adentro.
// Una gota cae, el suelo atrapa una burbuja, la burbuja estalla y manda partículas doradas hacia arriba (el aroma).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  bacterias: r.f(1),
  nombre: r.f(2),
  geosmina: r.f(3),
  gota: r.f(4),
  burbuja: r.w(4, "bubbles"),
  mit: r.w(4, "MIT"),
  nariz: r.f(5),
  porque: r.f(6),
  ojo: r.f(7),
  consejo: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const VERDE = "#6bd36b";
const TIERRA = "#6b4a2f";

const TOMAS: Toma[] = [
  { f: 0, pos: [0.4, 2.6, 9.5], mira: [0, 0.6, 0], fov: 38 },
  { f: E.bacterias, pos: [0.2, 1.2, 6.5], mira: [0, 0.1, 0], fov: 36 },
  { f: E.nombre, pos: [0.4, 2.6, 9.5], mira: [0, 0.6, 0], fov: 38 },
  { f: E.geosmina, pos: [0.1, 0.7, 5.2], mira: [0, 0.05, 0], fov: 34 },
  { f: E.gota - 4, pos: [0.4, 2.2, 9.0], mira: [0, 1.0, 0], fov: 38 },
  { f: E.burbuja - 6, pos: [0.1, 0.9, 4.6], mira: [0, 0.35, 0], fov: 34 },
  { f: E.mit, pos: [0.4, 2.2, 7.5], mira: [0, 0.9, 0], fov: 38 },
  { f: E.nariz, pos: [0.3, 1.6, 7.5], mira: [0, 0.8, 0], fov: 38 },
  { f: E.porque, pos: [0.4, 2.6, 9.5], mira: [0, 0.6, 0], fov: 38 },
  { f: E.ojo, pos: [0.2, 2.0, 8.0], mira: [0, 0.6, 0], fov: 38 },
  { f: E.consejo, pos: [0.4, 2.6, 9.5], mira: [0, 0.6, 0], fov: 38 },
  { f: DURACION, pos: [0.4, 2.8, 10], mira: [0, 0.6, 0], fov: 40 },
];

const Suelo: React.FC<{ humedo: number }> = ({ humedo }) => {
  const c = humedo > 0 ? "#4a3220" : TIERRA;
  return (
    <group>
      <mesh position={[0, -0.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 1.2, 2.2]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* granitos de tierra */}
      {Array.from({ length: 26 }, (_, i) => (
        <mesh key={i} position={[(random(`gx${i}`) - 0.5) * 4.0, 0.02 + random(`gy${i}`) * 0.03, (random(`gz${i}`) - 0.5) * 1.9]} castShadow>
          <sphereGeometry args={[0.05 + random(`gs${i}`) * 0.06, 8, 6]} />
          <meshStandardMaterial color="#8a6340" roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

/** bacterias: cápsulas verdes flotando apenas bajo la superficie, aparecen al decirlas */
const Bacterias: React.FC<{ frame: number; t: number; brillo: number }> = ({ frame, t, brillo }) => (
  <group>
    {Array.from({ length: 14 }, (_, i) => {
      const x = (random(`bx${i}`) - 0.5) * 3.6;
      const z = (random(`bz${i}`) - 0.5) * 1.6;
      const y = 0.02 - random(`by${i}`) * 0.05;
      const ang = random(`ba${i}`) * Math.PI;
      const s = t * (0.9 + 0.1 * Math.sin(frame / 8 + i));
      return (
        <mesh key={i} position={[x, y + 0.08, z]} rotation={[0, ang, Math.PI / 2]} scale={s}>
          <capsuleGeometry args={[0.07, 0.2, 4, 10]} />
          <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.25 + brillo * 0.9} roughness={0.4} />
        </mesh>
      );
    })}
  </group>
);

/** partículas doradas que suben desde el punto de impacto */
const Aroma: React.FC<{ frame: number; desde: number; cantidad?: number }> = ({ frame, desde, cantidad = 26 }) => {
  const dt = frame - desde;
  if (dt < 0) return null;
  return (
    <group>
      {Array.from({ length: cantidad }, (_, i) => {
        const vida = 70 + random(`av${i}`) * 50;
        const u = Math.min(1, dt / vida);
        const ang = random(`aa${i}`) * Math.PI * 2;
        const rad = 0.08 + random(`ar${i}`) * 0.7 * u;
        const y = 0.08 + u * (1.0 + random(`ay${i}`) * 1.4);
        return (
          <mesh key={i} position={[Math.cos(ang) * rad, y, Math.sin(ang) * rad * 0.7]}>
            <sphereGeometry args={[0.035 + random(`as${i}`) * 0.03, 8, 6]} />
            <meshBasicMaterial color={ACENTO} transparent opacity={0.9 * (1 - u) * Math.min(1, dt / 6)} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

const Gota: React.FC<{ y: number }> = ({ y }) => (
  <mesh position={[0, y, 0]} scale={[1, 1.35, 1]} castShadow>
    <sphereGeometry args={[0.14, 20, 16]} />
    <meshPhysicalMaterial color="#8fd0ff" transparent opacity={0.85} roughness={0.05} clearcoat={1} />
  </mesh>
);

const Escena: React.FC<{ frame: number }> = ({ frame }) => {
  const bact = interpolate(frame, [E.bacterias, E.bacterias + 18], [0, 1], clamp);
  const brillo = interpolate(frame, [E.geosmina, E.geosmina + 20], [0, 1], clamp) * (frame < E.gota ? 1 : 0.4);
  // la gota cae al empezar la frase 4, toca el suelo y desaparece
  const yGota = interpolate(frame, [E.gota - 4, E.gota + 22], [3.2, 0.14], clamp);
  const cae = frame >= E.gota - 4 && frame < E.gota + 22;
  const impacto = E.gota + 22;
  // burbuja atrapada: crece en el punto de impacto y estalla en "bubbles"
  const crece = interpolate(frame, [impacto, E.burbuja], [0, 1], clamp);
  const estalla = frame >= E.burbuja;
  return (
    <group>
      <Suelo humedo={frame >= impacto ? 1 : 0} />
      <Bacterias frame={frame} t={bact} brillo={brillo} />
      {cae && <Gota y={yGota} />}
      {frame >= impacto && !estalla && (
        <mesh position={[0, 0.12 * crece, 0]} scale={crece}>
          <sphereGeometry args={[0.2, 20, 16]} />
          <meshPhysicalMaterial color="#cfeaff" transparent opacity={0.45} roughness={0.05} clearcoat={1} />
        </mesh>
      )}
      <Aroma frame={frame} desde={E.burbuja} />
    </group>
  );
};

const DESTACAR = ["rain", "bacteria", "petrichor", "geosmin", "bubbles", "MIT", "trillion", "ancestors", "light", "deep", "drizzle"];
const CIFRAS: [string, string][] = [
  ["nineteen sixty-four.", "1964."],
  ["twenty fifteen.", "2015."],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.bacterias, "scratch", 0.5],
  [E.bacterias + 8, "pop", 0.4],
  [E.nombre, "sello", 0.5],
  [E.geosmina, "ding", 0.45],
  [E.gota + 22, "pop", 0.45],
  [E.burbuja, "pop", 0.5],
  [E.mit, "whoosh", 0.35],
  [E.nariz, "ding", 0.45],
  [E.porque, "whoosh", 0.35],
  [E.ojo, "sello", 0.5],
  [E.consejo, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const RainSmellEn015: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Escena frame={frame} />
        <PisoSombra y={-1.2} />
      </Estudio>
      <Chip desde={E.gancho + 14} hasta={E.bacterias} x={540} y={330}>
        rain smell ≠ <span style={{ color: ACENTO }}>rain</span>
      </Chip>
      <Chip desde={E.bacterias + 6} hasta={E.nombre} x={540} y={330} color={VERDE}>
        soil <span style={{ color: VERDE }}>bacteria</span>
      </Chip>
      <Chip desde={E.nombre + 4} hasta={E.geosmina} x={540} y={330}>
        <span style={{ color: ACENTO }}>petrichor</span> · Nature, 1964
      </Chip>
      <Chip desde={E.geosmina + 6} hasta={E.gota} x={540} y={330} color={VERDE}>
        <span style={{ color: VERDE }}>geosmin</span>
      </Chip>
      <Chip desde={E.burbuja} hasta={E.mit} x={540} y={330} color="#5fd2ff">
        <span style={{ color: "#5fd2ff" }}>bubble</span> pops → aerosols
      </Chip>
      <Chip desde={E.mit + 4} hasta={E.nariz} x={540} y={330}>
        MIT · <span style={{ color: ACENTO }}>2015</span>
      </Chip>
      <Chip desde={E.nariz + 6} hasta={E.porque} x={540} y={330}>
        a few parts per <span style={{ color: ACENTO }}>trillion</span>
      </Chip>
      <Chip desde={E.porque + 6} hasta={E.ojo} x={540} y={330} color="#ffb23d">
        one idea: <span style={{ color: ACENTO }}>finding water</span>
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.consejo} x={540} y={330} color="#5fd2ff">
        <span style={{ color: "#5fd2ff" }}>light</span> rain &gt; downpour
      </Chip>
      <Chip desde={E.consejo + 4} hasta={E.cta} x={540} y={330}>
        take a <span style={{ color: ACENTO }}>deep breath</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who steps onto the porch and says, ah, rain smell" />
      <Audio src={staticFile("en-015-rain-smell/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.3, 1.8, 7.2], mira: [0, 0.6, 0], fov: 38 }];
export const PortadaEn015: React.FC = () => (
  <Portada arriba="why does rain smell like that?" grande="it's the soil" sello="SCIENCE" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Suelo humedo={1} />
      <Bacterias frame={30} t={1} brillo={0.8} />
      <Aroma frame={50} desde={0} />
      <PisoSombra y={-1.2} opacidad={0.25} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/049-primer-calor-aclimatacion/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { PrimerCalor, type EstadoPrimerCalor } from "../../kit3d/objetos/PrimerCalor";

// 3D "cómo reacciona tu cuerpo": una persona bajo el sol con termómetro corporal al lado.
// El sudor es su aire acondicionado. Primer día de calor: transpira tarde y poco, se recalienta
// (piel roja, 40 °C). En una o dos semanas se aclimata: transpira antes y más, baja a 37 °C y se refresca.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  muerto: r.w(0, "muerto"),
  cuerpo: r.f(1),
  esCuerpo: r.w(1, "cuerpo"),
  sudor: r.f(2),
  elSudor: r.w(2, "sudor"),
  evapora: r.w(2, "evapora"),
  problema: r.f(3),
  tarde: r.w(3, "tarde"),
  recalienta: r.w(3, "recalent"),
  dato: r.f(4),
  mitad: r.w(4, "mitad"),
  primeros: r.w(4, "primeros"),
  aprende: r.f(5),
  transpira: r.w(5, "transpira"),
  ojo: r.f(6),
  extremo: r.w(6, "extremo"),
  consejo: r.f(7),
  sombra: r.w(7, "sombra"),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** interpolación por tramos que tolera frames repetidos (frases muy pegadas) */
const k = (frame: number, pares: [number, number][]) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of pares) {
    const xx = xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x;
    xs.push(xx);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const TOMAS: Toma[] = [
  // gancho: la persona entera al sol, recalentada, en 3/4
  { f: 0, pos: [4.6, 2.9, 9.8], mira: [0, 1.35, 0], fov: 34 },
  { f: E.cuerpo - 4, pos: [3.4, 2.6, 8.6], mira: [0, 1.5, 0], fov: 32 },
  // "es tu cuerpo": subo a la cabeza y el torso
  { f: E.esCuerpo + 8, pos: [2.2, 2.4, 7.4], mira: [0, 1.7, 0], fov: 30 },
  // el sudor como aire acondicionado: hombros y cabeza, gotas cayendo
  { f: E.sudor + 8, pos: [1.9, 2.3, 6.8], mira: [0, 1.9, 0], fov: 30 },
  { f: E.evapora, pos: [1.9, 2.2, 6.8], mira: [0, 1.7, 0], fov: 30 },
  // primer día: recalentado, de nuevo el torso y la cabeza rojos
  { f: E.problema + 8, pos: [2.6, 2.3, 7.4], mira: [0, 1.6, 0], fov: 31 },
  // dato: abro para incluir el termómetro a la derecha (40 °C)
  { f: E.dato + 6, pos: [-1.1, 2.9, 9.8], mira: [1.35, 1.5, 0], fov: 34 },
  { f: E.primeros, pos: [-1.3, 2.9, 10.0], mira: [1.4, 1.4, 0], fov: 34 },
  // se aclimata: vuelvo a la persona, la temperatura baja y se refresca
  { f: E.aprende + 12, pos: [2.0, 2.4, 8.4], mira: [0.5, 1.5, 0], fov: 33 },
  { f: E.aprende + 50, pos: [2.6, 2.4, 8.8], mira: [0.4, 1.45, 0], fov: 33 },
  // ojo: calor extremo, plano más entero
  { f: E.ojo + 6, pos: [3.3, 2.6, 9.2], mira: [0, 1.5, 0], fov: 33 },
  // consejo: se calma, cámara que se aleja
  { f: E.consejo + 8, pos: [3.9, 2.7, 9.5], mira: [0, 1.4, 0], fov: 34 },
  // cierre: vuelve a la toma del principio (rima con el gancho)
  { f: E.cta + 2, pos: [4.4, 2.8, 9.7], mira: [0, 1.35, 0], fov: 34 },
  { f: DURACION, pos: [4.6, 2.9, 9.8], mira: [0, 1.35, 0], fov: 34 },
];

const estado = (frame: number): EstadoPrimerCalor => ({
  frame,
  sol: k(frame, [
    [E.gancho, 1],
    [E.consejo, 1],
    [E.consejo + 20, 0.55],
  ]),
  termoOn: k(frame, [
    [E.gancho + 8, 0],
    [E.gancho + 22, 1],
    [E.ojo, 1],
    [E.ojo + 10, 0.4],
    [E.consejo, 0.4],
    [E.consejo + 14, 0],
  ]),
  temp: k(frame, [
    [E.gancho, 0.85],
    [E.esCuerpo, 0.85],
    [E.sudor + 14, 0.6],
    [E.problema + 4, 0.95],
    [E.dato, 0.95],
    [E.aprende, 0.95],
    [E.aprende + 42, 0.15],
    [E.ojo, 0.15],
    [E.ojo + 14, 0.62],
    [E.consejo + 12, 0.28],
  ]),
  sudor: k(frame, [
    [E.gancho, 0.12],
    [E.sudor, 0.12],
    [E.sudor + 16, 0.5],
    [E.problema, 0.5],
    [E.problema + 12, 0.1],
    [E.dato, 0.1],
    [E.aprende, 0.1],
    [E.aprende + 34, 1.0],
    [E.ojo + 14, 0.75],
    [E.consejo + 12, 0.6],
  ]),
  frescura: k(frame, [
    [E.aprende + 12, 0],
    [E.aprende + 44, 0.8],
    [E.ojo, 0.8],
    [E.ojo + 14, 0.18],
    [E.consejo + 12, 0.7],
  ]),
});

const DESTACAR = ["muerto", "cuerpo", "sudor", "tarde", "mitad", "aprende", "extremo", "sombra", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["treinta grados", "30°"],
  ["treinta y cinco", "35°"],
];

// contador de días: de 1 (primer calor) a 14 (ya aclimatado)
const Dia: React.FC = () => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [E.aprende + 8, E.aprende + 44], [1, 14], clamp));
  return (
    <Chip desde={E.aprende + 4} hasta={E.ojo} x={560} y={360} color="#5fd2ff">
      Día <span style={{ color: "#8fe0ff" }}>{v}</span> · aclimatado
    </Chip>
  );
};

const efectos: Efecto[] = [
  [E.cuerpo, "whoosh", 0.35],
  [E.sudor, "whoosh", 0.35],
  [E.problema, "whoosh", 0.4],
  [E.dato, "whoosh", 0.4],
  [E.dato + 6, "sello", 0.5],
  [E.aprende, "whoosh", 0.35],
  [E.aprende + 44, "ding", 0.4],
  [E.ojo, "whoosh", 0.35],
  [E.consejo, "whoosh", 0.35],
];

export const PrimerCalorAclimatacion3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <PrimerCalor e={e} />
        <PisoSombra />
      </Estudio>
      {/* primer día: pega más fuerte */}
      <Chip desde={E.problema + 6} hasta={E.dato + 4} x={320} y={340} color="#ff6a3c">
        Día <span style={{ color: "#ff9a6a" }}>1</span>
      </Chip>
      {/* el dato con la fuente en pantalla */}
      <Chip desde={E.dato + 6} hasta={E.aprende} x={540} y={330} color="#ff6a3c">
        <span style={{ color: "#ff9a6a" }}>+ de la mitad</span> de los golpes de calor
        <br />
        pasan en los <span style={{ color: "#ff9a6a" }}>primeros días</span>
      </Chip>
      <Chip desde={E.mitad} hasta={E.aprende} x={540} y={470}>
        NIOSH · EE.UU.
      </Chip>
      <Dia />
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que sale a correr al sol el primer día de calor" />
      <Audio src={staticFile("049-primer-calor-aclimatacion/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

// Portada: el molde parejo de la grilla con la persona recalentada abajo.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [4.2, 3.0, 10.5], mira: [0, 1.75, 0], fov: 34 }];
export const Portada049: React.FC = () => (
  <Portada arriba="¿por qué el primer calor del año te pega más fuerte?" grande="tu cuerpo no está listo" sello="DATO" colorSello={C.azul} numero={49}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <PrimerCalor e={{ frame: 20, sol: 1, temp: 0.9, termoOn: 0, sudor: 0.15, frescura: 0 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

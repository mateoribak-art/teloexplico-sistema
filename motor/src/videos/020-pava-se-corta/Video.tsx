import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/020-pava-se-corta/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { P, Pava, type EstadoPava } from "./Pava";

// Piloto 3D (estilo "ver por dentro"): una pava eléctrica de acero en un estudio azul noche.
// Mecanismo: el vapor del agua hirviendo baja por un tubito escondido en la manija hasta un disco
// bimetálico; el disco se calienta, salta de golpe, empuja una varilla y hace saltar el botón.
// Con la tapa abierta el vapor se escapa por arriba y el disco no se calienta.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  noMide: r.f(1),
  vapor: r.w(1, "vapor"),
  tubito: r.f(2),
  tubitoFin: r.fin(2),
  metales: r.f(3),
  estiran: r.w(3, "estiran"),
  calienta: r.f(4),
  golpe: r.w(4, "golpe"),
  varilla: r.w(4, "varilla"),
  boton: r.w(4, "botón"),
  clac: r.w(4, "clac"),
  termometro: r.f(5),
  altura: r.w(5, "altura"),
  cien: r.w(5, "cien"),
  anio: r.f(6),
  ojo: r.f(7),
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

const ANCHO_PLANO = 34;
const TOMAS: Toma[] = [
  // gancho: la pava entera, hirviendo, en 3/4
  { f: 0, pos: [6.5, 3.6, 10.5], mira: [0.05, 0.55, 0], fov: ANCHO_PLANO },
  { f: E.noMide - 4, pos: [5.0, 3.0, 9.6], mira: [0.05, 0.6, 0], fov: ANCHO_PLANO },
  // "no mide el agua": de frente, se vuelve transparente
  { f: E.noMide + 14, pos: [1.6, 2.2, 10.2], mira: [0, 0.75, 0], fov: ANCHO_PLANO },
  { f: E.tubito - 2, pos: [1.2, 2.3, 9.6], mira: [-0.1, 0.8, 0], fov: ANCHO_PLANO },
  // "viaja por un tubito": la cámara baja con el vapor por la manija
  { f: E.tubito + 14, pos: [0.2, 2.6, 5.4], mira: [-1.2, 1.55, 0], fov: 34 },
  { f: E.tubitoFin, pos: [-0.6, 1.1, 4.2], mira: [-1.25, 0.2, 0], fov: 34 },
  // "dos metales": primer plano del disco (ligeramente de costado, para ver la curva)
  { f: E.metales + 12, pos: [-0.75, 0.62, 2.2], mira: [-1.3, 0.14, 0], fov: 30 },
  { f: E.calienta, pos: [-0.72, 0.6, 2.05], mira: [-1.3, 0.14, 0], fov: 30 },
  // "empuja una varilla y salta el botón": disco, varilla y botón en el mismo cuadro
  { f: E.varilla + 6, pos: [-0.65, 0.85, 2.6], mira: [-1.14, 0.16, 0], fov: 32 },
  { f: E.clac, pos: [-0.62, 0.86, 2.5], mira: [-1.12, 0.17, 0], fov: 32 },
  { f: E.clac + 5, pos: [-0.62, 0.86, 2.5], mira: [-1.12, 0.17, 0], fov: 27 },
  { f: E.termometro - 2, pos: [-0.62, 0.86, 2.5], mira: [-1.12, 0.17, 0], fov: 28 },
  // termómetro y altura: vuelve a la pava entera
  { f: E.termometro + 16, pos: [-4.8, 3.4, 10.2], mira: [0, 0.6, 0], fov: ANCHO_PLANO },
  { f: E.anio, pos: [-3.2, 2.8, 10.8], mira: [0, 0.6, 0], fov: ANCHO_PLANO },
  // 1955: giro lento del otro lado
  { f: E.ojo - 4, pos: [3.6, 2.0, 10.6], mira: [0, 0.65, 0], fov: ANCHO_PLANO },
  // ojo, la tapa: desde arriba
  { f: E.ojo + 14, pos: [3.0, 4.6, 10.4], mira: [0, 0.55, 0], fov: ANCHO_PLANO },
  { f: E.cta - 2, pos: [2.5, 4.4, 10.2], mira: [0, 0.6, 0], fov: ANCHO_PLANO },
  // cierre: vuelve a la toma del principio (rima con el gancho)
  { f: E.cta + 18, pos: [6.0, 3.4, 10.2], mira: [0.05, 0.55, 0], fov: ANCHO_PLANO },
  { f: DURACION, pos: [6.5, 3.6, 10.5], mira: [0.05, 0.55, 0], fov: ANCHO_PLANO },
];

const estado = (frame: number): EstadoPava => ({
  frame,
  fantasmaCuerpo: k(frame, [
    [E.noMide, 0],
    [E.noMide + 12, 1],
    [E.termometro, 1],
    [E.termometro + 12, 0],
    [E.ojo, 0],
    [E.ojo + 12, 0.55],
    [E.cta + 6, 0.55],
    [E.cta + 18, 0],
  ]),
  fantasmaMango: k(frame, [
    [E.vapor, 0],
    [E.vapor + 12, 1],
    [E.termometro, 1],
    [E.termometro + 12, 0],
    [E.ojo, 0],
    [E.ojo + 12, 0.8],
    [E.cta + 6, 0.8],
    [E.cta + 18, 0],
  ]),
  tapa: k(frame, [
    [E.ojo + 4, 0],
    [E.ojo + 18, 1],
    [E.cta + 4, 1],
    [E.cta + 16, 0],
  ]),
  calor: k(frame, [
    [E.clac, 1],
    [E.clac + 10, 0],
    [E.ojo, 0],
    [E.ojo + 8, 1],
  ]),
  vaporPico: k(frame, [
    [0, 1],
    [E.noMide, 1],
    [E.noMide + 10, 0],
  ]),
  vaporTubo: k(frame, [
    [E.vapor, 0],
    [E.vapor + 6, 1],
    [E.golpe, 1],
    [E.clac + 8, 0],
    [E.ojo + 18, 0],
    [E.ojo + 26, 0.15],
    [E.cta + 10, 0.15],
    [E.cta + 18, 0],
  ]),
  vaporTapa: k(frame, [
    [E.ojo + 12, 0],
    [E.ojo + 22, 1],
    [E.cta + 4, 1],
    [E.cta + 14, 0],
  ]),
  disco: k(frame, [
    [E.golpe, 1],
    [E.golpe + 3, -1],
    [E.termometro + 14, -1],
    [E.termometro + 24, 1],
  ]),
  discoCalor: k(frame, [
    [E.estiran - 4, 0],
    [E.estiran + 8, 0.6],
    [E.calienta, 0.6],
    [E.golpe, 1],
    [E.termometro, 1],
    [E.termometro + 20, 0],
  ]),
  separar: k(frame, [
    [E.metales, 0],
    [E.metales + 12, 1],
    [E.calienta, 1],
    [E.calienta + 8, 0],
  ]),
  estirar: k(frame, [
    [E.estiran, 0],
    [E.estiran + 14, 1],
    [E.calienta, 1],
    [E.calienta + 8, 0],
  ]),
  boton: k(frame, [
    [E.boton, 0],
    [E.boton + 3, 1],
    [E.ojo, 1],
    [E.ojo + 4, 0],
  ]),
});

const DESTACAR = ["sola", "vapor", "tubito", "metales", "estiran", "clac", "termómetro", "altura", "100 °C", "1955", "abierta", "escapa", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["cien grados", "100 °C"],
  ["mil novecientos cincuenta y cinco", "1955"],
];

const Anio: React.FC = () => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [E.anio + 2, E.anio + 26], [2026, 1955], clamp));
  return (
    <Chip desde={E.anio} hasta={E.ojo} x={540} y={330}>
      <span style={{ color: ACENTO }}>{v}</span> · Inglaterra
    </Chip>
  );
};

const efectos: Efecto[] = [
  [E.noMide, "whoosh", 0.35],
  [E.tubito, "whoosh", 0.4],
  [E.metales, "whoosh", 0.35],
  [E.golpe, "tic", 0.6],
  [E.boton, "sello", 0.7],
  [E.termometro, "whoosh", 0.4],
  [E.altura, "pop", 0.4],
  [E.anio + 2, "tic", 0.4],
  [E.anio + 26, "ding", 0.4],
  [E.ojo + 4, "whoosh", 0.35],
  [E.ojo + 14, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const PavaSeCorta3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Pava e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.termometro + 6} hasta={E.anio} x={540} y={300}>
        Al nivel del mar: <span style={{ color: ACENTO }}>100 °C</span>
      </Chip>
      <Chip desde={E.altura} hasta={E.anio} x={540} y={410} color="#5fd2ff">
        En la altura: <span style={{ color: "#5fd2ff" }}>menos</span>
      </Chip>
      <Anio />
      <Chip desde={E.ojo + 14} hasta={E.cta + 4} x={540} y={330} color="#ff5a4a">
        Tapa abierta: <span style={{ color: "#ff8a7a" }}>puede no cortarse</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} />
      <Audio src={staticFile("020-pava-se-corta/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export { P };

// Portada: el molde parejo de la grilla (franja con número y textos) con la pava 3D abajo.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [6.6, 3.7, 12.3], mira: [0.05, 1.95, 0], fov: 34 }];
export const Portada020: React.FC = () => (
  <Portada arriba="¿por qué la pava eléctrica se corta sola?" grande="mide el vapor" sello="DATO" colorSello={C.azul} numero={20}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Pava e={{ ...estado(0), frame: 20, vaporPico: 1 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

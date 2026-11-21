import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-034-alcohol-cook-off/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Olla, type EstadoOlla } from "../../kit3d/objetos/Olla";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una olla de acero con vino hirviendo a fuego lento, con termómetro. El vapor y las burbujas se van calmando con las horas.
// Mecanismo: la tabla de retención del USDA: 15 min 40 %, 1 h 25 %, 2,5 h 5 %, flambeado 75 %. Los números van en chips.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  no: r.f(1),
  m15: r.f(2),
  h1: r.f(3),
  h25: r.f(4),
  flambe: r.f(5),
  ojo: r.f(6),
  guardar: r.f(7),
  pregunta: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoOlla => {
  const hierve = interpolate(f, [E.gancho, E.gancho + 20, E.m15, E.h1, E.h25 + 20, E.flambe], [0.2, 0.9, 0.9, 0.55, 0.12, 0.05], clamp);
  const vapor = interpolate(f, [E.gancho, E.gancho + 20, E.m15, E.h1, E.h25 + 20, E.flambe], [0.3, 1, 1, 0.6, 0.15, 0.7], clamp);
  return {
    frame: f,
    hierve,
    granos: 0,
    pila: 0,
    vapor,
    tapa: 0,
    termo: k(f, E.m15 - 8, E.m15 + 8),
    fantasma: 0,
  };
};

const VISTA: Toma = { f: 0, pos: [0.4, 2.2, 6.4], mira: [0, 1.2, 0], fov: 40 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { f: E.no, pos: [0.2, 1.8, 5.2], mira: [0, 1.0, 0], fov: 38 },
  { f: E.m15, pos: [1.2, 2.4, 5.6], mira: [0, 1.0, 0], fov: 38 },
  { f: E.h1, pos: [-0.6, 2.2, 5.8], mira: [0, 1.1, 0], fov: 38 },
  { f: E.h25, pos: [0.6, 2.4, 6.4], mira: [0, 1.2, 0], fov: 40 },
  { f: E.flambe, pos: [0, 1.6, 5.2], mira: [0, 1.2, 0], fov: 38 },
  { f: E.ojo, pos: [0.4, 2.2, 6.4], mira: [0, 1.2, 0], fov: 40 },
  { f: E.guardar, pos: [0, 2.0, 6.8], mira: [0, 1.2, 0], fov: 40 },
  { f: DURACION, pos: [0.4, 2.2, 6.4], mira: [0, 1.2, 0], fov: 40 },
];

const DESTACAR = ["didn't", "forty", "twenty-five", "five", "seventy-five", "Save", "wine", "burns"];
const CIFRAS: [string, string][] = [
  ["fifteen", "15"],
  ["forty", "40"],
  ["twenty-five", "25"],
  ["seventy-five", "75"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.no, "scratch", 0.5],
  [E.m15, "ding", 0.4],
  [E.h1, "ding", 0.4],
  [E.h25, "ding", 0.45],
  [E.flambe, "sello", 0.5],
  [E.ojo, "pop", 0.4],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
];

export const AlcoholEn034: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Olla e={estado(frame)} />
        <PisoSombra y={0.001} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.no} x={540} y={330}>
        does it <span style={{ color: ACENTO }}>cook off</span>?
      </Chip>
      <Chip desde={E.no} hasta={E.m15} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>not really</span>
      </Chip>
      <Chip desde={E.m15 + 6} hasta={E.h1} x={540} y={330}>
        15 min = <span style={{ color: ACENTO }}>40%</span> left
      </Chip>
      <Chip desde={E.h1} hasta={E.h25} x={540} y={330}>
        1 hour = <span style={{ color: ACENTO }}>25%</span> left
      </Chip>
      <Chip desde={E.h25} hasta={E.flambe} x={540} y={330}>
        2.5 hours = <span style={{ color: ACENTO }}>5%</span> left
      </Chip>
      <Chip desde={E.flambe} hasta={E.ojo} x={540} y={330} color="#ffb23d">
        flambé = <span style={{ color: "#ffb23d" }}>75%</span> left
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.guardar} x={540} y={330}>
        <span style={{ color: ACENTO }}>USDA</span> retention table
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={300}>
        15 min = <span style={{ color: ACENTO }}>40%</span>
      </Chip>
      <Chip desde={E.guardar + 10} hasta={E.pregunta} x={540} y={400}>
        1 hour = <span style={{ color: ACENTO }}>25%</span>
      </Chip>
      <Chip desde={E.guardar + 20} hasta={E.pregunta} x={540} y={500}>
        2.5 hours = <span style={{ color: ACENTO }}>5%</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        cook with <span style={{ color: "#5fd2ff" }}>wine</span>? yes / no
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who swears it all burns off" />
      <Audio src={staticFile("en-034-alcohol-cook-off/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

// Portada: la olla humeante.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.4, 2.4, 5.6], mira: [0, 1.2, 0], fov: 40 }];
export const PortadaEn034: React.FC = () => (
  <Portada arriba="does the alcohol cook off?" grande="not as fast as you think" sello="40%" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Olla e={{ frame: 40, hierve: 0.9, granos: 0, pila: 0, vapor: 1, tapa: 0, termo: 1, fantasma: 0 }} />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

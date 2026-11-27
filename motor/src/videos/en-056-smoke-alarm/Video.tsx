import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-056-smoke-alarm/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Alarma, type EstadoAlarma } from "../../kit3d/objetos/Alarma";

// Mundo: el detector de humo del techo. Se baja, se da vuelta y se ve la fecha de fabricación del dorso;
// los 10 años cuentan desde ahí. Prueba mensual con el botón; chirrido = batería. Fuentes: NFPA, USFA, CPSC.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  nfpa: r.f(2),
  fecha: r.f(3),
  mirar: r.f(4),
  prueba: r.f(5),
  ojo: r.f(6),
  guardar: r.f(7),
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
    const xx = xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x;
    xs.push(xx);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const BASE: Toma = { f: 0, pos: [2.0, 0.2, 5.2], mira: [0, 1.0, 0], fov: 38 };
const TOMAS: Toma[] = [
  BASE,
  { f: E.golpe, pos: [1.4, 0.4, 4.2], mira: [0, 1.3, 0], fov: 34 },
  { f: E.nfpa, pos: [2.0, 0.3, 5.4], mira: [0, 1.1, 0], fov: 38 },
  { f: E.fecha, pos: [1.2, 0.5, 5.0], mira: [0, 1.2, 0], fov: 36 },
  { f: E.mirar, pos: [0.6, 0.7, 4.6], mira: [0, 1.2, 0], fov: 34 },
  { f: E.prueba, pos: [2.0, 0.2, 5.2], mira: [0, 1.0, 0], fov: 38 },
  { f: E.ojo, pos: [1.4, 0.4, 4.2], mira: [0, 1.3, 0], fov: 34 },
  { f: E.guardar, pos: [2.0, 0.3, 5.4], mira: [0, 1.1, 0], fov: 38 },
  { f: E.cta + 18, pos: [2.0, 0.2, 5.2], mira: [0, 1.0, 0], fov: 38 },
  { f: DURACION, pos: [2.0, 0.2, 5.2], mira: [0, 1.0, 0], fov: 38 },
];

const estado = (frame: number): EstadoAlarma => ({
  frame,
  baja: k(frame, [
    [E.fecha, 0],
    [E.fecha + 24, 1],
    [E.prueba - 22, 1],
    [E.prueba, 0],
  ]),
  giro: k(frame, [
    [E.fecha + 14, 0],
    [E.fecha + 40, 1],
    [E.prueba - 30, 1],
    [E.prueba - 10, 0],
  ]),
  boton: k(frame, [
    [E.prueba + 8, 0],
    [E.prueba + 14, 1],
    [E.prueba + 56, 1],
    [E.prueba + 62, 0],
  ]),
  chirp: k(frame, [
    [E.ojo + 6, 0],
    [E.ojo + 12, 1],
    [E.ojo + 70, 1],
    [E.ojo + 78, 0],
  ]),
  reloj: k(frame, [
    [E.nfpa + 8, 0],
    [E.nfpa + 70, 1],
    [E.fecha - 4, 1],
    [E.fecha + 6, 0],
  ]),
});

const DESTACAR = ["expired", "expire", "ten", "years", "back", "month", "Heads", "Save", "Send", "number"];
const CIFRAS: [string, string][] = [["ten", "10"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "pop", 0.4],
  [E.golpe, "error", 0.45],
  [E.nfpa + 8, "tic", 0.4],
  [E.nfpa + 70, "ding", 0.4],
  [E.fecha + 14, "whoosh", 0.4],
  [E.mirar, "sello", 0.5],
  [E.prueba + 14, "pop", 0.45],
  [E.ojo + 12, "pop", 0.4],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
];

export const SmokeAlarmEn056: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Alarma e={estado(frame)} />
        <PisoSombra opacidad={0.0} />
      </Estudio>
      <Chip desde={E.gancho + 6} hasta={E.golpe} x={540} y={330} color="#ff8a4a">
        your smoke alarm: <span style={{ color: "#ffb37a" }}>expired?</span>
      </Chip>
      <Chip desde={E.golpe} hasta={E.nfpa} x={540} y={330} color="#ff5a4a">
        alarms <span style={{ color: "#ff8a7a" }}>expire</span>
      </Chip>
      <Chip desde={E.nfpa + 6} hasta={E.fecha} x={540} y={330}>
        <span style={{ color: ACENTO }}>NFPA</span>: replace every 10 years
      </Chip>
      <Chip desde={E.fecha + 4} hasta={E.mirar} x={540} y={330}>
        10 years from the <span style={{ color: ACENTO }}>date on the back</span>
      </Chip>
      <Chip desde={E.mirar} hasta={E.prueba - 10} x={540} y={330}>
        not the day you <span style={{ color: "#ff8a7a" }}>bought</span> it
      </Chip>
      <Chip desde={E.prueba} hasta={E.ojo} x={540} y={330}>
        press <span style={{ color: ACENTO }}>test</span> once a month
      </Chip>
      <Chip desde={E.ojo} hasta={E.guardar} x={540} y={330} color="#ffd23d">
        keeps chirping? <span style={{ color: "#ffd23d" }}>replace it</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={300}>
        <span style={{ color: ACENTO }}>test</span> monthly
      </Chip>
      <Chip desde={E.guardar + 10} hasta={E.pregunta} x={540} y={400}>
        replace at <span style={{ color: ACENTO }}>10 years</span> from the date on the back
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        how old is yours? <span style={{ color: "#5fd2ff" }}>__ years</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who has never checked the date on their alarm" />
      <Audio src={staticFile("en-056-smoke-alarm/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [1.6, 0.4, 4.4], mira: [0, 1.2, 0], fov: 34 }];
export const PortadaEn056: React.FC = () => (
  <Portada arriba="that alarm on your ceiling" grande="IT EXPIRES" sello="NFPA SAYS" colorSello={C.rojo} numero={56}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Alarma e={{ frame: 20, baja: 0, giro: 0, boton: 0.8, chirp: 0, reloj: 0 }} />
    </Estudio>
  </Portada>
);

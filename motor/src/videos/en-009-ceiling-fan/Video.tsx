import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-009-ceiling-fan/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Ventilador, type EstadoVentilador } from "../../kit3d/objetos/Ventilador";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un cuarto visto desde abajo con un ventilador de techo, su palanca de sentido y una persona sin cara.
// Mecanismo: en verano (antihorario mirando hacia arriba) el aire baja y se siente brisa; en invierno (horario, velocidad baja)
// el aire sube por el centro, empuja el aire tibio del techo y lo hace circular por el cuarto. Ilustración, sin números.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  verano: r.f(2),
  baja: r.f(3),
  invierno: r.f(4),
  sube: r.f(5),
  doe: r.f(6),
  ojo: r.f(7),
  prueba: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

/** vueltas por 100 frames; + = antihorario mirando desde abajo */
const velocidad = (f: number) => {
  if (f < E.verano) return 0.5;
  if (f < E.invierno) return 0.5 + 1.1 * k(f, E.verano, E.verano + 25);
  if (f < E.ojo) return interpolate(f, [E.invierno - 8, E.invierno + 14, E.invierno + 34], [1.6, 0, -0.8], clamp);
  if (f < E.prueba) return -0.8 * (1 - k(f, E.ojo + 6, E.ojo + 40));
  if (f < E.cta) return 1.4 * k(f, E.prueba, E.prueba + 30);
  return 1.4 - 0.8 * k(f, E.cta, E.cta + 20);
};

let cacheAng: number[] = [];
const anguloEn = (f: number) => {
  if (cacheAng.length === 0) {
    let a = 0;
    for (let i = 0; i <= 4000; i++) {
      cacheAng.push(a);
      a += velocidad(i) * ((2 * Math.PI) / 100);
    }
  }
  return cacheAng[Math.min(4000, Math.max(0, Math.round(f)))];
};

const estado = (f: number): EstadoVentilador => {
  const verano = f < E.invierno || f >= E.prueba;
  const enInvierno = f >= E.invierno && f < E.ojo;
  const apagado = f >= E.ojo && f < E.prueba;
  const palanca = f < E.invierno ? 1 : f < E.prueba ? -1 : 1;
  const flujoV = k(f, E.verano + 10, E.baja);
  let flujo = 0;
  if (f < E.invierno) flujo = flujoV;
  else if (enInvierno) flujo = k(f, E.invierno + 16, E.sube);
  else if (apagado) flujo = 0.15 * (1 - k(f, E.ojo + 10, E.ojo + 40));
  else flujo = k(f, E.prueba, E.prueba + 30);
  let persona = 0;
  if (f >= E.baja && f < E.invierno) persona = k(f, E.baja, E.baja + 14);
  else if (f >= E.prueba) persona = k(f, E.prueba - 4, E.prueba + 10);
  const brisa = f < E.invierno ? k(f, E.baja + 10, E.baja + 30) : f >= E.prueba ? k(f, E.prueba + 20, E.prueba + 40) : 0;
  return {
    frame: f,
    giro: velocidad(f),
    flujo,
    invierno: verano ? 0 : enInvierno ? 1 : 0,
    palanca,
    persona,
    brisa,
    apagado: apagado ? 1 : 0,
  };
};

const VISTA_ANCHA: Toma = { f: 0, pos: [0, 1.6, 10.5], mira: [0, 2.2, 0], fov: 42 };

const TOMAS: Toma[] = [
  { ...VISTA_ANCHA, f: 0 },
  { f: E.gancho + 40, pos: [1.6, 2.6, 5.6], mira: [0.3, 3.7, 0], fov: 36 },
  { f: E.mito, pos: [1.6, 2.6, 5.6], mira: [0.3, 3.7, 0], fov: 36 },
  { f: E.mito + 20, pos: [0, 1.6, 10.5], mira: [0, 2.2, 0], fov: 42 },
  { f: E.verano, pos: [0, 1.4, 8.5], mira: [0, 3.2, 0], fov: 40 },
  { f: E.baja, pos: [0, 1.5, 10.5], mira: [0, 2.0, 0], fov: 42 },
  { f: E.invierno - 6, pos: [0, 1.5, 10.5], mira: [0, 2.0, 0], fov: 42 },
  { f: E.invierno + 6, pos: [1.6, 2.6, 5.6], mira: [0.3, 3.7, 0], fov: 36 },
  { f: E.invierno + 30, pos: [0, 1.6, 10.5], mira: [0, 2.6, 0], fov: 42 },
  { f: E.sube, pos: [0, 2.6, 11], mira: [0, 2.2, 0], fov: 42 },
  { f: E.doe, pos: [0.4, 2.0, 10.5], mira: [0, 2.9, 0], fov: 42 },
  { f: E.ojo, pos: [0.5, 1.8, 9.0], mira: [0.2, 3.3, 0], fov: 40 },
  { f: E.prueba, pos: [0, 1.4, 10.5], mira: [0, 2.0, 0], fov: 42 },
  { f: E.cta, pos: [0, 1.6, 10.5], mira: [0, 2.2, 0], fov: 42 },
  { f: DURACION, pos: [0, 1.6, 10.5], mira: [0, 2.2, 0], fov: 42 },
];

const DESTACAR = ["Most", "switch", "counterclockwise", "down", "clockwise", "up", "Energy", "people", "breeze", "never", "missed"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mito, "scratch", 0.5],
  [E.mito + 6, "sello", 0.5],
  [E.verano, "whoosh", 0.4],
  [E.baja, "pop", 0.4],
  [E.invierno, "whoosh", 0.45],
  [E.invierno + 14, "tic", 0.45],
  [E.sube, "pop", 0.4],
  [E.doe, "ding", 0.4],
  [E.ojo, "sello", 0.5],
  [E.prueba, "whoosh", 0.35],
  [E.prueba + 30, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const CeilingFanEn009: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Ventilador e={estado(frame)} angulo={-anguloEn(frame)} />
        <PisoSombra y={0.001} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.mito} x={540} y={330}>
        direction <span style={{ color: ACENTO }}>switch</span>
      </Chip>
      <Chip desde={E.mito} hasta={E.verano} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>missed trick</span>
      </Chip>
      <Chip desde={E.verano} hasta={E.baja} x={540} y={330} color="#5fd2ff">
        summer: <span style={{ color: "#5fd2ff" }}>counterclockwise</span>
      </Chip>
      <Chip desde={E.baja} hasta={E.invierno} x={540} y={330} color="#5fd2ff">
        air goes <span style={{ color: "#5fd2ff" }}>down</span> = cooler
      </Chip>
      <Chip desde={E.invierno} hasta={E.sube} x={540} y={330} color="#ffb23d">
        winter: <span style={{ color: "#ffb23d" }}>clockwise, low</span>
      </Chip>
      <Chip desde={E.sube} hasta={E.doe} x={540} y={330} color="#ffb23d">
        warm air <span style={{ color: ACENTO }}>circulates</span>
      </Chip>
      <Chip desde={E.doe} hasta={E.ojo} x={540} y={330}>
        <span style={{ color: ACENTO }}>U.S. Dept. of Energy</span>
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.prueba} x={540} y={330} color="#ffb23d">
        cools <span style={{ color: ACENTO }}>people</span>, not rooms
      </Chip>
      <Chip desde={E.prueba + 20} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        breeze on your head = <span style={{ color: "#5fd2ff" }}>down</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who's never looked for that switch" />
      <Audio src={staticFile("en-009-ceiling-fan/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

// Portada: el ventilador visto desde abajo, con el aire bajando.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.3, 1.5, 9.5], mira: [0, 3.0, 0], fov: 42 }];
export const PortadaEn009: React.FC = () => (
  <Portada arriba="which way should your ceiling fan spin?" grande="most people never check" sello="SWITCH" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Ventilador e={{ frame: 40, giro: 1, flujo: 0.8, invierno: 0, palanca: 1, persona: 1, brisa: 1, apagado: 0 }} angulo={-0.7} />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

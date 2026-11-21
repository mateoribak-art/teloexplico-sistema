import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-033-turkey-thaw/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Descongelar, DescongelarVacio, type EstadoDescongelar } from "../../kit3d/objetos/Descongelar";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una mesada con el pavo congelado (bloque en capas). Primero se descarta la mesada,
// después aparecen la heladera (24 h por 4–5 lb) y el agua fría (30 min por lb). USDA FSIS.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mesada: r.f(1),
  heladera: r.f(2),
  cuenta: r.f(3),
  agua: r.f(4),
  ya: r.f(5),
  ojo: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const TOMAS: Toma[] = [
  { f: 0, pos: [0.6, 2.6, 8.5], mira: [0.2, 0.6, 0], fov: 40 },
  { f: E.mesada, pos: [0.2, 2.2, 8.0], mira: [0, 0.6, 0], fov: 38 },
  { f: E.heladera, pos: [-1.8, 2.6, 10.5], mira: [-1.8, 1.0, 0], fov: 40 },
  { f: E.cuenta, pos: [-1.6, 2.4, 9.0], mira: [-1.6, 1.0, 0], fov: 40 },
  { f: E.agua, pos: [0.3, 3.2, 11.0], mira: [0.3, 0.6, 1.2], fov: 40 },
  { f: E.ya, pos: [0.3, 3.0, 10.0], mira: [0.3, 0.6, 1.0], fov: 40 },
  { f: E.ojo, pos: [0.4, 2.8, 10.0], mira: [0.2, 0.6, 0], fov: 42 },
  { f: E.pregunta, pos: [0.6, 2.6, 8.5], mira: [0.2, 0.6, 0], fov: 40 },
  { f: DURACION, pos: [0.6, 2.6, 8.5], mira: [0.2, 0.6, 0], fov: 40 },
];

const estado = (f: number): EstadoDescongelar => ({
  ...DescongelarVacio,
  frame: f,
  afuera: 0,
  centro: 0,
  bac: 0,
  mesada: 1,
  heladera: k(f, E.heladera - 2, E.heladera + 10),
  agua: k(f, E.agua - 2, E.agua + 10),
  micro: 0,
  guardada: 0,
});

const DESTACAR = ["frozen", "counter", "never", "fridge", "days", "water", "Cook", "Heads", "Save", "send"];
const CIFRAS: [string, string][] = [
  ["twenty-four hours", "24 hours"],
  ["four to five pounds", "4–5 lb"],
  ["sixteen-pound", "16-lb"],
  ["three to four days", "3–4 days"],
  ["thirty minutes", "30 min"],
  ["fifty percent", "50%"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mesada, "scratch", 0.5],
  [E.mesada + 6, "sello", 0.5],
  [E.heladera, "pop", 0.4],
  [E.cuenta, "ding", 0.4],
  [E.agua, "pop", 0.4],
  [E.ya, "tic", 0.4],
  [E.ojo, "whoosh", 0.35],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const TurkeyThawEn033: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Descongelar e={estado(frame)} />
        <PisoSombra y={-0.25} />
      </Estudio>
      <Chip desde={0} hasta={E.mesada} x={540} y={330}>
        turkey still <span style={{ color: ACENTO }}>frozen</span>?
      </Chip>
      <Chip desde={E.mesada} hasta={E.heladera} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>NEVER</span> on the counter
      </Chip>
      <Chip desde={E.heladera + 4} hasta={E.cuenta} x={540} y={330} color="#5fd2ff">
        <span style={{ color: "#5fd2ff" }}>fridge</span> · 24 h per 4–5 lb
      </Chip>
      <Chip desde={E.cuenta + 4} hasta={E.agua} x={540} y={330}>
        16 lb = <span style={{ color: ACENTO }}>3–4 days</span>
      </Chip>
      <Chip desde={E.agua + 4} hasta={E.ya} x={540} y={330} color="#5fd2ff">
        <span style={{ color: "#5fd2ff" }}>cold water</span> · 30 min per lb
      </Chip>
      <Chip desde={E.ya + 4} hasta={E.ojo} x={540} y={330}>
        then <span style={{ color: ACENTO }}>cook it right away</span>
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.pregunta} x={540} y={330} color="#ffb23d">
        from frozen: <span style={{ color: ACENTO }}>+50% time</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={330}>
        days ahead <span style={{ color: ACENTO }}>you start thawing?</span>
      </Chip>
      <Chip desde={E.cta} hasta={E.fin + 4} x={540} y={330}>
        SAVE: <span style={{ color: ACENTO }}>24 h/4–5 lb · 30 min/lb</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who thaws the turkey the morning of" />
      <Audio src={staticFile("en-033-turkey-thaw/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.4, 2.4, 6.0], mira: [0.1, 0.6, 0], fov: 40 }];
export const PortadaEn033: React.FC = () => (
  <Portada arriba="Thanksgiving turkey still frozen?" grande="24 HOURS PER 4–5 LB" sello="SAVE THIS" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Descongelar e={{ ...DescongelarVacio, frame: 40, heladera: 1 }} />
      <PisoSombra y={-0.25} opacidad={0.25} />
    </Estudio>
  </Portada>
);

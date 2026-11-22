import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-037-swallowed-gum/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Chicle, type EstadoChicle } from "../../kit3d/objetos/Chicle";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: el tubo digestivo simplificado en S con un chicle rosa que lo recorre (sale entero),
// bolitas de comida que hacen el mismo viaje, y un atasco de chicles en el codo (solo si son muchos).
// Cleveland Clinic (40 h, bloqueo), KidsHealth/Nemours (mito, bloqueo raro).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  base: r.f(2),
  horas: r.f(3),
  ojo: r.f(4),
  calma: r.f(5),
  pregunta: r.f(6),
  cta: r.f(7),
  fin: r.fin(7),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 2.2, 13.5], mira: [0, 1.7, 0], fov: 42 },
  { f: E.mito, pos: [-0.4, 2.4, 11.5], mira: [-0.4, 1.9, 0], fov: 42 },
  { f: E.base, pos: [0, 2.0, 12.0], mira: [0, 1.7, 0], fov: 42 },
  { f: E.horas, pos: [0.2, 1.9, 14.0], mira: [0, 1.5, 0], fov: 44 },
  { f: E.ojo, pos: [0, 1.8, 11.5], mira: [0, 1.6, 0], fov: 42 },
  { f: E.calma, pos: [0, 2.2, 13.5], mira: [0, 1.7, 0], fov: 42 },
  { f: E.pregunta, pos: [0, 2.2, 13.0], mira: [0, 1.7, 0], fov: 42 },
  { f: DURACION, pos: [0, 2.2, 13.5], mira: [0, 1.7, 0], fov: 42 },
];

// El chicle se queda quieto la frase del mito; viaja de la frase 2 a la 3; el atasco aparece en el "Heads up".
const estado = (f: number): EstadoChicle => ({
  frame: f,
  avance: 0.04 + 0.96 * k(f, E.base + 20, E.horas + 90),
  comida: k(f, E.horas, E.horas + 12) * (1 - k(f, E.ojo, E.ojo + 10)),
  bloqueo: k(f, E.ojo + 40, E.ojo + 60) * (1 - k(f, E.calma, E.calma + 10)),
});

const DESTACAR = ["myth", "forty", "whole", "Heads", "blockage", "doctor", "Save", "send", "seven"];
const CIFRAS: [string, string][] = [
  ["seven years", "7 years"],
  ["forty hours", "40 hours"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mito, "scratch", 0.45],
  [E.base, "whoosh", 0.35],
  [E.horas, "tic", 0.4],
  [E.horas + 70, "ding", 0.4],
  [E.ojo, "pop", 0.4],
  [E.calma, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const GumEn037: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Chicle e={estado(frame)} />
        <PisoSombra y={-0.4} />
      </Estudio>
      <Chip desde={0} hasta={E.mito} x={540} y={330}>
        stuck for <span style={{ color: ACENTO }}>7 years?</span>
      </Chip>
      <Chip desde={E.mito} hasta={E.base} x={540} y={330} color="#ff5a5a">
        <span style={{ color: "#ff5a5a" }}>myth</span>
      </Chip>
      <Chip desde={E.base} hasta={E.horas} x={540} y={330}>
        gum base: <span style={{ color: ACENTO }}>can't be digested</span>
      </Chip>
      <Chip desde={E.horas} hasta={E.ojo} x={540} y={330} color="#5fd2ff">
        out in about <span style={{ color: "#5fd2ff" }}>40 hours</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.calma} x={540} y={330} color="#ffb23d">
        lots of gum / every day: <span style={{ color: "#ffb23d" }}>blockage</span>
      </Chip>
      <Chip desde={E.calma} hasta={E.pregunta} x={540} y={330}>
        one piece: <span style={{ color: ACENTO }}>no panic</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        what did your family say?
      </Chip>
      <Chip desde={E.cta} hasta={E.fin + 4} x={540} y={330}>
        SAVE: <span style={{ color: ACENTO }}>1 piece ≈ 40 hours</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who still believes in the seven-year rule" />
      <Audio src={staticFile("en-037-swallowed-gum/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.0, 11.0], mira: [0, 1.7, 0], fov: 42 }];
export const PortadaEn037: React.FC = () => (
  <Portada arriba="Swallowed gum?" grande="NOT 7 YEARS" sello="MYTH" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Chicle e={{ frame: 20, avance: 0.45, comida: 0, bloqueo: 0 }} />
      <PisoSombra y={-0.4} opacidad={0.25} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-049-space-heater/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { ParedEnchufe, Zapatilla, type EstadoZapatilla } from "../../kit3d/objetos/Zapatilla";

// Mundo: una regleta (power strip) con dos cables colgados (el calefactor y otro aparato). Se recalienta y
// humea; luego paneo al tomacorriente de pared: la forma correcta. Fuentes: CPSC y USFA (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  cpsc: r.f(2),
  pared: r.f(3),
  pies: r.f(4),
  ojo: r.f(5),
  guardar: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
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

const TOMAS: Toma[] = [
  { f: 0, pos: [2.2, 3.0, 4.2], mira: [0, 0.25, 0], fov: 37 },
  { f: E.golpe, pos: [1.6, 2.0, 2.8], mira: [0.4, 0.4, 0], fov: 34 },
  { f: E.cpsc, pos: [2.0, 2.7, 4.0], mira: [0, 0.3, 0], fov: 37 },
  { f: E.pared + 6, pos: [5.5, 1.5, 3.3], mira: [5.0, 0.7, 0], fov: 32 },
  { f: E.pies - 4, pos: [5.4, 1.5, 3.3], mira: [5.0, 0.7, 0], fov: 32 },
  { f: E.pies + 8, pos: [2.2, 2.9, 4.2], mira: [0, 0.3, 0], fov: 37 },
  { f: E.guardar, pos: [2.1, 2.8, 4.1], mira: [0, 0.3, 0], fov: 37 },
  { f: E.cta + 18, pos: [2.2, 3.0, 4.2], mira: [0, 0.25, 0], fov: 37 },
  { f: DURACION, pos: [2.2, 3.0, 4.2], mira: [0, 0.25, 0], fov: 37 },
];

const estado = (frame: number): EstadoZapatilla => ({
  frame,
  calor: k(frame, [
    [E.gancho + 10, 0],
    [E.golpe, 0.7],
    [E.cpsc, 0.9],
    [E.pared - 6, 1],
    [E.pared, 0],
  ]),
  humo: k(frame, [
    [E.gancho + 14, 0],
    [E.golpe, 0.6],
    [E.cpsc, 0.9],
    [E.pared - 6, 1],
    [E.pared, 0],
  ]),
  llama: 0,
  corriente: k(frame, [
    [E.gancho, 0.2],
    [E.gancho + 10, 1],
    [E.pared - 6, 1],
    [E.pared, 0],
  ]),
});

const DESTACAR = ["power strip", "Don't", "fire", "extension", "wall", "three", "Heads", "sleeping", "Save", "Send"];
const CIFRAS: [string, string][] = [["three feet", "3 ft"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "pop", 0.4],
  [E.golpe, "error", 0.45],
  [E.cpsc, "sello", 0.5],
  [E.pared, "whoosh", 0.4],
  [E.pared + 14, "ding", 0.4],
  [E.pies, "tic", 0.4],
  [E.ojo, "pop", 0.4],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
];

export const SpaceHeaterEn049: React.FC = () => {
  const frame = useCurrentFrame();
  const corrientePared = k(frame, [
    [E.pared, 0],
    [E.pared + 10, 1],
    [E.pies + 20, 1],
    [E.ojo, 0],
  ]);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Zapatilla e={estado(frame)} />
        <ParedEnchufe pos={[5, 0.7, 0]} corriente={corrientePared} frame={frame} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={E.gancho + 6} hasta={E.golpe} x={540} y={330} color="#ff8a4a">
        heater + <span style={{ color: "#ffb37a" }}>power strip</span>
      </Chip>
      <Chip desde={E.golpe} hasta={E.cpsc} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>fire risk</span>
      </Chip>
      <Chip desde={E.cpsc + 6} hasta={E.pared} x={540} y={330}>
        <span style={{ color: ACENTO }}>CPSC</span>: no strips, no cords
      </Chip>
      <Chip desde={E.pared + 8} hasta={E.pies} x={540} y={330}>
        <span style={{ color: ACENTO }}>USFA</span>: wall outlet
      </Chip>
      <Chip desde={E.pies} hasta={E.ojo} x={540} y={330}>
        keep <span style={{ color: ACENTO }}>3 ft</span> clear
      </Chip>
      <Chip desde={E.ojo} hasta={E.guardar} x={540} y={330} color="#ff5a4a">
        never on while <span style={{ color: "#ff8a7a" }}>sleeping</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={300}>
        <span style={{ color: ACENTO }}>wall outlet</span> only
      </Chip>
      <Chip desde={E.guardar + 10} hasta={E.pregunta} x={540} y={400}>
        <span style={{ color: ACENTO }}>3 ft</span> of space · off at night
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        space heater at home? <span style={{ color: "#5fd2ff" }}>yes / no</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who plugs everything into one power strip" />
      <Audio src={staticFile("en-049-space-heater/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [2.8, 2.4, 5.2], mira: [0.2, 1.3, 0], fov: 32 }];
export const PortadaEn049: React.FC = () => (
  <Portada arriba="space heater + power strip?" grande="DON'T DO IT" sello="CPSC SAYS" colorSello={C.rojo} numero={49}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Zapatilla e={{ frame: 20, calor: 0.9, humo: 0.7, llama: 0, corriente: 1 }} />
      <PisoSombra opacidad={0.22} />
    </Estudio>
  </Portada>
);

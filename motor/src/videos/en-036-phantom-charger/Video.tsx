import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-036-phantom-charger/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Zapatilla, type EstadoZapatilla } from "../../kit3d/objetos/Zapatilla";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una regleta con dos aparatos en espera (cables que suben). La corriente que entra es
// un goteo mínimo (standby). La cámara se acerca a la regleta y al interruptor rojo (se apaga).
// LBNL standby.lbl.gov, EIA 2025, DOE Energy Saver.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  lbnl: r.f(1),
  cuenta: r.f(2),
  casa: r.f(3),
  regleta: r.f(4),
  ojo: r.f(5),
  pregunta: r.f(6),
  cta: r.f(7),
  fin: r.fin(7),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 1.6, 8.0], mira: [-0.4, 1.2, 0], fov: 40 },
  { f: E.lbnl, pos: [-1.2, 1.0, 5.4], mira: [-0.4, 0.6, 0], fov: 38 },
  { f: E.cuenta, pos: [0.4, 1.8, 6.6], mira: [0, 1.2, 0], fov: 38 },
  { f: E.casa, pos: [0, 2.0, 9.0], mira: [0, 1.2, 0], fov: 42 },
  { f: E.regleta, pos: [0.4, 1.0, 5.6], mira: [0.2, 0.5, 0], fov: 38 },
  { f: E.ojo, pos: [0, 1.8, 7.6], mira: [0, 1.2, 0], fov: 40 },
  { f: E.pregunta, pos: [-1.0, 1.4, 6.6], mira: [-0.4, 0.8, 0], fov: 40 },
  { f: DURACION, pos: [0, 1.6, 8.0], mira: [-0.4, 1.2, 0], fov: 40 },
];

// La corriente es un goteo hasta que se apaga la regleta (frase 4).
const estado = (f: number): EstadoZapatilla => ({
  frame: f,
  calor: 0,
  humo: 0,
  llama: 0,
  corriente: (0.35 + 0.5 * k(f, E.casa, E.casa + 10)) * (1 - k(f, E.regleta + 40, E.regleta + 52)),
});

const DESTACAR = ["unplug", "half", "watt", "pennies", "five", "ten", "power", "strip", "Heads", "Save", "send"];
const CIFRAS: [string, string][] = [
  ["seventy-six cents", "76¢"],
  ["half a watt", "0.5 W"],
  ["four kilowatt-hours", "4 kWh"],
  ["five to ten percent", "5–10%"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.lbnl, "pop", 0.4],
  [E.cuenta, "tic", 0.4],
  [E.cuenta + 60, "ding", 0.4],
  [E.casa, "scratch", 0.45],
  [E.regleta, "whoosh", 0.35],
  [E.regleta + 44, "pop", 0.4],
  [E.ojo, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const PhantomEn036: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Zapatilla e={estado(frame)} />
        <PisoSombra y={-0.02} />
      </Estudio>
      <Chip desde={0} hasta={E.lbnl} x={540} y={330}>
        unplug it daily to <span style={{ color: ACENTO }}>save?</span>
      </Chip>
      <Chip desde={E.lbnl} hasta={E.cuenta} x={540} y={330} color="#5fd2ff">
        idle: under <span style={{ color: "#5fd2ff" }}>0.5 W</span>
      </Chip>
      <Chip desde={E.cuenta} hasta={E.casa} x={540} y={330}>
        0.5 W × 1 year ≈ <span style={{ color: ACENTO }}>76¢</span>
      </Chip>
      <Chip desde={E.casa} hasta={E.regleta} x={540} y={330} color="#ffb23d">
        whole home: <span style={{ color: "#ffb23d" }}>5–10%</span> of electricity
      </Chip>
      <Chip desde={E.regleta} hasta={E.ojo} x={540} y={330}>
        TV setup on <span style={{ color: ACENTO }}>one power strip</span>: off
      </Chip>
      <Chip desde={E.ojo} hasta={E.pregunta} x={540} y={330} color="#ffb23d">
        DVR / console: may need <span style={{ color: "#ffb23d" }}>power</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        do you unplug? <span style={{ color: ACENTO }}>yes or no?</span>
      </Chip>
      <Chip desde={E.cta} hasta={E.fin + 4} x={540} y={330}>
        SAVE: <span style={{ color: ACENTO }}>1 charger ≈ 76¢/yr · home 5–10%</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who unplugs every charger but leaves the TV on standby" />
      <Audio src={staticFile("en-036-phantom-charger/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.6, 7.0], mira: [-0.4, 1.2, 0], fov: 40 }];
export const PortadaEn036: React.FC = () => (
  <Portada arriba="Unplug your charger?" grande="IT SAVES 76¢ A YEAR" sello="DO THE MATH" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Zapatilla e={{ frame: 40, calor: 0, humo: 0, llama: 0, corriente: 0.7 }} />
      <PisoSombra y={-0.02} opacidad={0.25} />
    </Estudio>
  </Portada>
);

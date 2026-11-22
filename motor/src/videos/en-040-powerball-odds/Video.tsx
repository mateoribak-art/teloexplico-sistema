import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-040-powerball-odds/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Bolillas, type EstadoBolillas } from "../../kit3d/objetos/Bolillas";

// Propio. Un campo enorme de bolillas grises y UNA dorada: eso es el premio mayor del Powerball.
// La cámara empieza sobre unas pocas y se aleja hasta que no se ve el borde.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  largo: r.w(0, "longer"),
  odds: r.f(1),
  cifra: r.w(1, "one"),
  campo: r.f(2),
  oro: r.w(2, "gold"),
  tuya: r.w(2, "Your"),
  igual: r.f(3),
  premio: r.f(4),
  ojo: r.f(5),
  diez: r.w(5, "Ten"),
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

const FOV = 42;
const TOMAS: Toma[] = [
  { f: 0, pos: [0, 5.5, 8.5], mira: [0, 0, 0], fov: FOV },
  { f: E.odds, pos: [0, 8, 11], mira: [0, 0, 0], fov: FOV },
  { f: E.campo, pos: [0, 16, 19], mira: [0, 0, 0], fov: FOV },
  { f: E.oro - 6, pos: [0, 24, 26], mira: [0, 0, 0], fov: FOV },
  { f: E.oro + 10, pos: [0, 4.5, 6.5], mira: [0, 0.2, 0], fov: 38 },
  { f: E.tuya + 18, pos: [2.5, 7.5, 9], mira: [1.0, 0, -0.6], fov: 38 },
  { f: E.igual, pos: [0, 12, 15], mira: [0, 0, 0], fov: FOV },
  { f: E.premio, pos: [0, 20, 23], mira: [0, 0, 0], fov: FOV },
  { f: E.ojo, pos: [3, 12, 15], mira: [0, 0, 0], fov: FOV },
  { f: E.diez + 20, pos: [-3, 14, 17], mira: [0, 0, 0], fov: FOV },
  { f: E.guardar, pos: [0, 24, 26], mira: [0, 0, 0], fov: FOV },
  { f: DURACION, pos: [0, 30, 32], mira: [0, 0, 0], fov: FOV },
];

const estado = (frame: number): EstadoBolillas => ({
  aparece: k(frame, [
    [0, 0.2],
    [14, 1],
  ]),
  oro: k(frame, [
    [E.oro - 4, 0],
    [E.oro + 8, 1],
    [E.tuya - 6, 1],
    [E.tuya, 0.3],
    [E.igual, 0.15],
  ]),
  elegida: k(frame, [
    [E.tuya, 0],
    [E.tuya + 10, 1],
    [E.igual + 24, 1],
    [E.igual + 40, 0],
  ]),
  diez: k(frame, [
    [E.diez, 0],
    [E.diez + 14, 1],
    [E.guardar - 4, 1],
    [E.guardar + 4, 0],
  ]),
});

const DESTACAR = ["longer", "jackpot", "gold", "same", "twenty-five", "prize", "Heads", "Ten", "Save", "billion", "Send"];
const CIFRAS: [string, string][] = [
  ["two hundred ninety-two million", "292 million"],
  ["twenty-five", "25"],
];

const Cuenta: React.FC = () => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [E.cifra, E.cifra + 40], [0, 292201338], clamp));
  return (
    <Chip desde={E.cifra} hasta={E.campo} x={540} y={300}>
      1 in <span style={{ color: ACENTO }}>{v.toLocaleString("en-US")}</span>
    </Chip>
  );
};

const efectos: Efecto[] = [
  [E.largo, "pop", 0.4],
  [E.cifra, "tic", 0.4],
  [E.cifra + 40, "ding", 0.4],
  [E.campo, "whoosh", 0.35],
  [E.oro, "pop", 0.5],
  [E.tuya, "pop", 0.4],
  [E.igual, "whoosh", 0.35],
  [E.premio, "pop", 0.4],
  [E.ojo, "sello", 0.5],
  [E.diez, "pop", 0.4],
  [E.guardar, "whoosh", 0.35],
];

export const PowerballOddsEn040: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Bolillas e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.gancho + 14} hasta={E.odds} x={540} y={300}>
        Powerball: <span style={{ color: ACENTO }}>a long shot?</span>
      </Chip>
      <Cuenta />
      <Chip desde={E.oro} hasta={E.tuya} x={540} y={300}>
        Only <span style={{ color: ACENTO }}>1</span> is gold
      </Chip>
      <Chip desde={E.tuya + 8} hasta={E.igual + 20} x={540} y={300} color="#ffffff">
        Your ticket: <span style={{ color: ACENTO }}>1 pick</span>
      </Chip>
      <Chip desde={E.igual + 30} hasta={E.premio} x={540} y={300} color="#5fd2ff">
        Same odds: <span style={{ color: "#5fd2ff" }}>every combo</span>
      </Chip>
      <Chip desde={E.premio + 30} hasta={E.ojo} x={540} y={300} color="#5fd2ff">
        Any prize: <span style={{ color: "#5fd2ff" }}>1 in 25</span>
      </Chip>
      <Chip desde={E.ojo + 20} hasta={E.diez} x={540} y={300} color="#ff5a4a">
        1 ticket · <span style={{ color: "#ff8a7a" }}>1 drawing</span>
      </Chip>
      <Chip desde={E.diez + 6} hasta={E.guardar} x={540} y={300} color="#5fd2ff">
        10 tickets = <span style={{ color: "#5fd2ff" }}>10 chances</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={300}>
        Save: <span style={{ color: ACENTO }}>1 in 292.2M</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={300}>
        Buy a ticket? <span style={{ color: ACENTO }}>Yes or no?</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who's already spending the jackpot" />
      <Audio src={staticFile("en-040-powerball-odds/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 5.5, 8.5], mira: [0, 0, 0], fov: 42 }];
export const PortadaEn040: React.FC = () => (
  <Portada arriba="powerball odds" grande="1 in 292 million" sello="MATH" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Bolillas e={{ aparece: 1, oro: 1, elegida: 0, diez: 0 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

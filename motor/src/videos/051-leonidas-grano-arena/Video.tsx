import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/051-leonidas-grano-arena/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C, display, mono } from "../../kit/marca";
import { BandaPolvo, CapaAtmosfera, Cometa, Estrellas, Grano, LluviaMeteoros, Meteoro, Suelo, Tierra } from "../../kit3d/cielo";

// Cielo de madrugada (una sola escena que evoluciona): el cielo estrellado con meteoros. La cámara
// va del cielo ancho → el cometa con su cola → la Tierra cruzando la banda de polvo → UN grano →
// el grano entra a la atmósfera y se enciende → se desintegra arriba del suelo → vuelve al cielo ancho.
// Idea: la "estrella fugaz" no es una estrella ni una roca grande, es polvo de cometa a 71 km/s.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  cometa: r.f(1),
  tierra: r.f(2),
  polvo: r.w(2, "polvo"),
  granito: r.f(3),
  arveja: r.w(3, "arveja"),
  rapido: r.w(4, "rápido"),
  entra: r.f(5),
  enciende: r.w(5, "enciende"),
  rojo: r.f(6),
  piso: r.w(6, "piso"),
  noreste: r.f(7),
  ne: r.w(7, "noreste"),
  ojo: r.f(8),
  quince: r.w(8, "quince"),
  cta: r.f(9),
  fin: r.fin(9),
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

const WIDE = 48;
const TOMAS: Toma[] = [
  // gancho: cielo ancho, meteoros cayendo
  { f: 0, pos: [0, 0.8, 5.4], mira: [0, 2.7, -3], fov: WIDE },
  { f: E.cometa - 6, pos: [-0.3, 1.0, 5.0], mira: [0.2, 2.6, -3], fov: WIDE },
  // el cometa y su cola
  { f: E.cometa + 10, pos: [1.1, 1.9, 2.4], mira: [1.8, 2.4, -4.5], fov: 38 },
  { f: E.tierra - 4, pos: [0.9, 1.8, 2.3], mira: [1.7, 2.3, -4.5], fov: 38 },
  // la Tierra cruza la banda de polvo
  { f: E.tierra + 12, pos: [-0.3, 1.1, 2.4], mira: [-0.2, 0.95, -3.4], fov: 42 },
  { f: E.granito - 4, pos: [-0.1, 1.05, 2.2], mira: [0.0, 0.98, -3.4], fov: 42 },
  // un grano: lo miramos de cerca pero con aire alrededor (es chiquito, no un planeta)
  { f: E.granito + 12, pos: [0.6, 1.15, 1.7], mira: [0, 1.0, -2.2], fov: 40 },
  { f: E.arveja, pos: [0.45, 1.1, 1.2], mira: [0, 1.0, -2.2], fov: 34 },
  // por qué brilla: leve órbita alrededor del grano
  { f: E.rapido + 6, pos: [-0.5, 1.12, 1.4], mira: [0, 1.0, -2.2], fov: 34 },
  // entra a 71 km/s: se ve el grano y la capa de atmósfera abajo
  { f: E.entra + 8, pos: [0.7, 0.9, 1.6], mira: [0.1, 0.3, -2.3], fov: 38 },
  { f: E.enciende, pos: [0.7, 0.8, 1.7], mira: [0.15, 0.1, -2.3], fov: 38 },
  // rojo vivo y se desintegra arriba del piso (se ve el suelo abajo, el meteoro no lo toca)
  { f: E.rojo + 8, pos: [1.2, 0.3, 3.4], mira: [0.2, -1.6, -2.6], fov: 48 },
  { f: E.noreste - 4, pos: [1.0, 0.4, 3.8], mira: [0.15, -1.3, -2.6], fov: 48 },
  // mirá al noreste: vuelve al cielo ancho
  { f: E.noreste + 12, pos: [0.2, 0.8, 5.2], mira: [1.0, 2.7, -3], fov: WIDE },
  { f: E.ojo, pos: [0, 0.85, 5.1], mira: [0.2, 2.7, -3], fov: WIDE },
  // ojo, ~15 por hora: cielo ancho, pocos meteoros
  { f: E.cta - 2, pos: [0, 0.9, 5.0], mira: [0, 2.7, -3], fov: WIDE },
  // cierre: vuelve a la toma del gancho (rima)
  { f: E.cta + 18, pos: [0, 0.8, 5.4], mira: [0, 2.7, -3], fov: WIDE },
  { f: DURACION, pos: [0, 0.8, 5.4], mira: [0, 2.7, -3], fov: WIDE },
];

type EstadoCielo = {
  frame: number;
  lluvia: number;
  cometa: number;
  tierra: number;
  tierraX: number;
  polvo: number;
  grano: number;
  granoPos: [number, number, number];
  granoEsc: number;
  calor: number;
  estela: number;
  estelaPos: [number, number, number];
  arco: number;
  suelo: number;
  luces: number;
};

const estado = (frame: number): EstadoCielo => {
  const calor = k(frame, [
    [E.entra, 0],
    [E.enciende - 2, 0.1],
    [E.enciende + 4, 1],
    [E.piso, 1],
    [E.piso + 10, 0],
  ]);
  // el grano baja al entrar y se apaga antes de tocar el piso
  const bajada = k(frame, [
    [E.entra, 0],
    [E.enciende, 0.4],
    [E.rojo + 6, 1.7],
    [E.piso, 2.6],
  ]);
  return {
    frame,
    lluvia: k(frame, [
      [0, 1],
      [E.cometa, 1],
      [E.cometa + 10, 0.15],
      [E.noreste, 0.15],
      [E.noreste + 12, 0.5],
      [E.ojo, 0.55],
      [E.cta, 0.55],
    ]),
    cometa: k(frame, [
      [E.cometa, 0],
      [E.cometa + 10, 1],
      [E.tierra, 1],
      [E.tierra + 12, 0],
    ]),
    tierra: k(frame, [
      [E.tierra, 0],
      [E.tierra + 12, 1],
      [E.granito, 1],
      [E.granito + 12, 0],
    ]),
    tierraX: k(frame, [
      [E.tierra, -2.4],
      [E.granito, 1.2],
    ]),
    polvo: k(frame, [
      [E.tierra + 4, 0],
      [E.polvo, 1],
      [E.granito, 1],
      [E.granito + 12, 0],
    ]),
    grano: k(frame, [
      [E.granito - 2, 0],
      [E.granito + 10, 1],
      [E.piso, 1],
      [E.piso + 8, 0],
    ]),
    granoPos: [0 + bajada * 0.12, 1.0 - bajada, -2.2 - bajada * 0.08],
    granoEsc: k(frame, [
      [E.granito, 0.5],
      [E.granito + 12, 0.5],
      [E.entra, 0.5],
      [E.enciende, 0.42],
      [E.piso, 0.3],
    ]),
    calor,
    estela: k(frame, [
      [E.enciende - 1, 0],
      [E.enciende + 3, 1],
      [E.piso, 1],
      [E.piso + 8, 0],
    ]),
    estelaPos: [0 + bajada * 0.12, 1.0 - bajada, -2.2 - bajada * 0.08],
    arco: k(frame, [
      [E.entra, 0],
      [E.entra + 10, 1],
      [E.rojo + 10, 1],
      [E.noreste, 0],
    ]),
    suelo: k(frame, [
      [E.rojo - 6, 0],
      [E.rojo + 6, 1],
      [E.noreste, 1],
      [E.noreste + 10, 1],
      [E.ojo, 1],
      [E.cta, 1],
    ]),
    luces: k(frame, [
      [E.noreste, 0],
      [E.noreste + 12, 1],
      [E.cta, 1],
    ]),
  };
};

const DESTACAR = [
  "ninguna",
  "cometa",
  "Leónidas",
  "polvo",
  "granito",
  "arveja",
  "rápido",
  "71 km/s",
  "enciende",
  "desintegra",
  "piso",
  "noreste",
  "15 por hora",
  "Mandáselo",
];
const CIFRAS: [string, string][] = [
  ["setenta y un kilómetros por segundo", "71 km/s"],
  ["quince por hora", "15 por hora"],
  ["dos y media", "2:30"],
];

/** Contador que sube hasta 15 ("unas quince por hora"), número del guion. */
const ContadorQuince: React.FC = () => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [E.quince, E.quince + 22], [0, 15], clamp));
  return (
    <Chip desde={E.quince - 2} hasta={E.cta} x={540} y={360}>
      <span style={{ color: ACENTO }}>{v}</span> por hora
    </Chip>
  );
};

/** Brújula chica con el noreste resaltado. */
const Brujula: React.FC = () => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [E.noreste + 4, E.noreste + 14, E.ojo - 6, E.ojo], [0, 1, 1, 0], clamp);
  if (v <= 0) return null;
  const R = 140;
  return (
    <div style={{ position: "absolute", left: 540, top: 1120, transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * v})`, opacity: v }}>
      <div style={{ position: "relative", width: R * 2, height: R * 2, borderRadius: "50%", border: "4px solid rgba(255,255,255,0.55)", background: "rgba(8,14,28,0.6)", boxShadow: "0 0 30px rgba(0,0,0,0.5)" }}>
        {([["N", 50, 8], ["E", 92, 50], ["S", 50, 92], ["O", 8, 50]] as [string, number, number][]).map(([l, x, y]) => (
          <div key={l} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", fontFamily: mono, fontSize: 34, color: "rgba(255,255,255,0.75)" }}>{l}</div>
        ))}
        {/* aguja al noreste */}
        <div style={{ position: "absolute", left: "50%", top: "50%", width: R * 0.85, height: 8, background: ACENTO, borderRadius: 5, transformOrigin: "0% 50%", transform: "rotate(-45deg)", boxShadow: `0 0 16px ${ACENTO}` }} />
        <div style={{ position: "absolute", left: "72%", top: "20%", fontFamily: display, fontWeight: 800, fontSize: 44, color: ACENTO, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>NE</div>
      </div>
    </div>
  );
};

const efectos: Efecto[] = [
  [E.cometa, "whoosh", 0.35],
  [E.tierra, "whoosh", 0.35],
  [E.granito, "whoosh", 0.4],
  [E.arveja, "pop", 0.4],
  [E.rapido, "tic", 0.4],
  [E.entra, "whoosh", 0.4],
  [E.enciende, "scratch", 0.55],
  [E.rojo, "boing", 0.3],
  [E.noreste, "whoosh", 0.35],
  [E.quince, "tic", 0.4],
  [E.quince + 22, "ding", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const LeonidasGrano3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  const giro = frame * 0.05;
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Estrellas />
        <LluviaMeteoros intensidad={e.lluvia} cantidad={7} />
        <Cometa pos={[1.8, 2.4, -4.5]} escala={1} haciaCola={[0.7, 0.8, 0.2]} brillo={e.cometa} />
        <group>
          <Tierra pos={[e.tierraX, 0.95, -3.4]} escala={0.8} brillo={e.tierra} />
          <BandaPolvo centro={[0, 0.95, -3.4]} eje={[1, 0.05, 0]} largo={10} radio={0.5} brillo={e.polvo} />
        </group>
        <Grano pos={e.granoPos} escala={e.granoEsc} incandescente={e.calor} giro={giro} brillo={e.grano} />
        {e.estela > 0 && <Meteoro cabeza={e.estelaPos} dir={[0.12, -1, -0.08]} largo={2.8} grosor={0.09} brillo={e.estela} color="#ffb05a" />}
        <CapaAtmosfera y={-0.4} z={-2.4} brillo={e.arco} />
        <Suelo y={-4.6} brillo={e.suelo} luces={e.luces} />
      </Estudio>
      <Chip desde={E.enciende - 2} hasta={E.rojo + 8} x={540} y={360} color="#ff8a4a">
        <span style={{ color: "#ffb37a" }}>71 km/s</span>
      </Chip>
      <ContadorQuince />
      <Brujula />
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que pide un deseo creyendo que le cae una estrella" />
      <Audio src={staticFile("051-leonidas-grano-arena/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

// Portada: el molde de la grilla con el cielo y un meteoro cayendo.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.4, 5.2], mira: [0, 2.2, -3], fov: 46 }];
export const Portada051: React.FC = () => (
  <Portada arriba="esta madrugada caen estrellas fugaces" grande="es polvo" sello="DATO" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Estrellas cantidad={220} />
      <Meteoro cabeza={[1.4, 3.4, -3]} dir={[-0.6, -0.9, 0.1]} largo={3.4} grosor={0.08} brillo={1} color="#ffe6b0" />
      <Meteoro cabeza={[-2.2, 4.2, -5]} dir={[-0.5, -0.9, 0.1]} largo={2.6} grosor={0.06} brillo={0.8} color="#cfe0ff" />
    </Estudio>
  </Portada>
);

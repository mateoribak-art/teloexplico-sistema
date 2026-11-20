import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/054-gta-juegos-violentos/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Joystick, type EstadoJoystick } from "../../kit3d/objetos/Joystick";

// "¿Los juegos violentos te hacen violento?" (APA 2020), con el GTA 6 recién salido.
// Un joystick en estudio azul noche: arranca rojo ("te quema la cabeza"), aparece el informe
// de la APA con la causa tachada, después el medidor: agresión leve (gritar/empujar) chica,
// violencia grave con "?" (difícil de extender). Cierra el joystick calmo, en azul.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  violentos: r.f(1),
  psico: r.f(2),
  apa: r.f(3),
  dosmil: r.w(3, "veinte"),
  concluyo: r.f(4),
  evidencia: r.w(4, "evidencia"),
  ojo: r.f(5),
  gritar: r.w(5, "gritar"),
  aclaro: r.f(6),
  grave: r.w(6, "violencia"),
  pantalla: r.f(7),
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

const CERCA = { pos: [0, 2.2, 11.5] as [number, number, number], mira: [0, 1.6, 0] as [number, number, number], fov: 46 };
const AMPLIA = { pos: [0.3, 2.4, 13.5] as [number, number, number], mira: [0.3, 1.9, 0] as [number, number, number], fov: 46 };

const TOMAS: Toma[] = [
  { f: 0, ...CERCA },
  { f: E.violentos, pos: [0.3, 2.0, 10.6], mira: [0, 1.6, 0], fov: 46 },
  { f: E.psico - 2, ...CERCA },
  { f: E.apa + 8, ...AMPLIA },
  { f: E.gritar - 2, pos: [0.3, 2.4, 13.0], mira: [0.3, 1.9, 0], fov: 46 },
  { f: E.pantalla, ...CERCA },
  { f: E.cta, pos: [0.2, 2.1, 10.8], mira: [0, 1.6, 0], fov: 46 },
  { f: DURACION, pos: [0.3, 2.1, 10.5], mira: [0, 1.6, 0], fov: 46 },
];

const estado = (frame: number): EstadoJoystick => ({
  frame,
  pad: k(frame, [[0, 0.6], [10, 1]]),
  padX: k(frame, [[E.psico, 0], [E.apa + 8, -2.0], [E.pantalla - 2, -2.0], [E.pantalla + 10, 0]]),
  padEsc: k(frame, [[E.psico, 1.2], [E.apa + 8, 0.55], [E.pantalla - 2, 0.55], [E.pantalla + 10, 1.1]]),
  calor: k(frame, [[E.psico, 1], [E.apa + 10, 0.1], [E.pantalla - 2, 0.1], [E.pantalla + 8, 0]]),
  informe: k(frame, [[E.apa, 0], [E.apa + 10, 1], [E.ojo - 2, 1], [E.ojo + 8, 0]]),
  cruz: k(frame, [[E.evidencia - 2, 0], [E.evidencia + 8, 1]]),
  medidor: k(frame, [[E.ojo, 0], [E.ojo + 10, 1], [E.pantalla - 4, 1], [E.pantalla + 6, 0]]),
  chica: k(frame, [[E.ojo + 8, 0], [E.gritar + 12, 1]]),
  grave: k(frame, [[E.grave, 0], [E.grave + 10, 1]]),
});

const DESTACAR = ["violentos", "otra", "2020", "evidencia", "suficiente", "gritar", "empujar", "difícil", "grave", "GTA", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["dos mil veinte", "2020"],
  ["seis", "6"],
];

const efectos: Efecto[] = [
  [E.violentos, "whoosh", 0.35],
  [E.psico, "whoosh", 0.35],
  [E.apa, "whoosh", 0.35],
  [E.dosmil, "tic", 0.5],
  [E.evidencia, "sello", 0.7],
  [E.ojo, "whoosh", 0.35],
  [E.gritar, "pop", 0.4],
  [E.grave, "pop", 0.4],
  [E.pantalla, "whoosh", 0.35],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const GtaJuegosViolentos3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Joystick e={e} />
        <PisoSombra y={0} opacidad={0.22} />
      </Estudio>
      <Chip desde={E.gancho + 20} hasta={E.psico} x={540} y={360} color="#ff3a2e">
        <span style={{ color: "#ff3a2e" }}>GTA 6</span> · "te quema la cabeza"
      </Chip>
      <Chip desde={E.apa + 4} hasta={E.concluyo} x={540} y={360}>
        APA · <span style={{ color: ACENTO }}>2020</span>
      </Chip>
      <Chip desde={E.evidencia} hasta={E.ojo} x={540} y={360} color="#ff3a2e">
        causa: <span style={{ color: "#ff3a2e" }}>evidencia insuficiente</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.aclaro} x={540} y={360}>
        asociación <span style={{ color: ACENTO }}>chica</span>
      </Chip>
      <Chip desde={E.aclaro + 6} hasta={E.pantalla} x={540} y={360} color="#ff3a2e">
        violencia grave: <span style={{ color: "#ff3a2e" }}>difícil de extender</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={360}>
        ¿Qué juego te <span style={{ color: ACENTO }}>sacaban</span>?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo a tu vieja, la que dice que el GTA te quema la cabeza" />
      <Audio src={staticFile("054-gta-juegos-violentos/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.6, 8.4], mira: [0, 1.5, 0], fov: 40 }];
export const Portada054: React.FC = () => (
  <Portada arriba="¿el GTA te quema la cabeza?" grande="lo que dicen los psicólogos" sello="CIENCIA" colorSello={C.azul} numero={54}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Joystick e={{ frame: 20, pad: 1, padX: 0, padEsc: 1.35, calor: 1, informe: 0, cruz: 0, medidor: 0, chica: 0, grave: 0 }} />
      <PisoSombra opacidad={0.2} />
    </Estudio>
  </Portada>
);

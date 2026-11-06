import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/040-consumo-fantasma/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Espera, type EstadoEspera } from "../../kit3d/objetos/Espera";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una tele apagada con la lucecita roja de espera; la luz de una casa como 20 cuadraditos (1 = 5 %, 2 = 10 %);
// al final una zapatilla con tecla que corta la espera (Laboratorio Lawrence Berkeley 1998 y 2000; ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  espera: r.f(1),
  horas: r.f(2),
  lab: r.f(3),
  cinco: r.f(4),
  diez: r.f(5),
  ojo: r.f(6),
  hoy: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (frame: number, pares: [number, number][]) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of pares) {
    xs.push(xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const ANCHO = 46;
const TOMAS: Toma[] = [
  { f: 0, pos: [0, 2.6, 13], mira: [0, 1.9, 0], fov: ANCHO },
  { f: E.espera, pos: [-0.5, 1.5, 7.5], mira: [0.0, 1.1, 0], fov: 36 },
  { f: E.horas, pos: [-1.5, 1.8, 11], mira: [-1.0, 1.6, 0], fov: 40 },
  { f: E.lab, pos: [0.3, 2.4, 13], mira: [0.3, 1.9, 0], fov: ANCHO },
  { f: E.cinco, pos: [2.0, 2.0, 8.5], mira: [2.0, 1.7, 0], fov: 36 },
  { f: E.diez, pos: [2.0, 2.0, 8.0], mira: [2.0, 1.7, 0], fov: 34 },
  { f: E.ojo, pos: [0, 2.6, 13], mira: [0, 1.9, 0], fov: ANCHO },
  { f: E.hoy, pos: [-1.4, 1.2, 8.5], mira: [-1.3, 0.9, 0.5], fov: 38 },
  { f: E.cta, pos: [0, 2.6, 13], mira: [0, 1.9, 0], fov: ANCHO },
  { f: DURACION, pos: [0, 2.6, 13], mira: [0, 1.9, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoEspera => ({
  frame,
  encendida: k(frame, [[0, 1], [E.gancho + 18, 1], [E.gancho + 28, 0]]),
  led: k(frame, [[E.gancho + 20, 0], [E.gancho + 32, 1]]),
  flujo: k(frame, [[E.horas, 0], [E.horas + 14, 1]]),
  casa: k(frame, [[E.lab + 8, 0], [E.lab + 28, 1]]),
  cinco: k(frame, [[E.cinco + 4, 0], [E.cinco + 16, 1]]),
  diez: k(frame, [[E.diez + 4, 0], [E.diez + 16, 1]]),
  zapatilla: k(frame, [[E.hoy + 4, 0], [E.hoy + 22, 1]]),
  cortado: k(frame, [[E.hoy + 44, 0], [E.hoy + 56, 1]]),
});

const DESTACAR = ["Error.", "espera", "luz", "cinco", "veintiséis", "Ojo:", "lucecita", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["cinco", "5"],
  ["veintiséis", "26"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.gancho + 28, "tic", 0.35],
  [E.horas, "whoosh", 0.35],
  [E.lab, "pop", 0.4],
  [E.cinco + 6, "ding", 0.4],
  [E.diez + 6, "ding", 0.4],
  [E.ojo, "scratch", 0.35],
  [E.hoy + 44, "tic", 0.4],
  [E.cta, "pop", 0.4],
];

export const ConsumoFantasma3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <Espera e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.espera} x={540} y={300}>
        “La apagué, <span style={{ color: ACENTO }}>no gasta nada</span>”
      </Chip>
      <Chip desde={E.espera} hasta={E.horas} x={540} y={300}>
        Pantalla apagada · <span style={{ color: ACENTO }}>en espera</span>
      </Chip>
      <Chip desde={E.horas} hasta={E.lab} x={540} y={300}>
        <span style={{ color: ACENTO }}>24 horas</span> consumiendo
      </Chip>
      <Chip desde={E.lab} hasta={E.cinco} x={540} y={300}>
        Lawrence Berkeley · EE. UU. · <span style={{ color: ACENTO }}>1998</span>
      </Chip>
      <Chip desde={E.cinco} hasta={E.diez} x={540} y={300}>
        1998 · cerca del <span style={{ color: ACENTO }}>5 %</span> de la luz
      </Chip>
      <Chip desde={E.diez} hasta={E.ojo} x={540} y={300}>
California 2000 · <span style={{ color: ACENTO }}>5 % a 26 %</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.hoy} x={540} y={300}>
        Datos de EE. UU. · <span style={{ color: ACENTO }}>hace 20+ años</span>
      </Chip>
      <Chip desde={E.hoy} hasta={E.cta} x={540} y={300}>
        Guardalo: <span style={{ color: ACENTO }}>lucecita prendida = gasta luz</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que deja todo enchufado" />
      <Audio src={staticFile("040-consumo-fantasma/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.4, 12], mira: [0, 1.8, 0], fov: 46 }];
export const Portada040: React.FC = () => (
  <Portada arriba="tu tele apagada" grande="sigue gastando luz" sello="EN ESPERA" colorSello={C.azul} numero={40}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Espera e={{ frame: 40, encendida: 0, led: 1, flujo: 1, casa: 1, cinco: 1, diez: 0, zapatilla: 0, cortado: 0 }} />
    </Estudio>
  </Portada>
);

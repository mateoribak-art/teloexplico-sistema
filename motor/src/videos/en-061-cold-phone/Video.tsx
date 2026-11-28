import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-061-cold-phone/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { FrioCelular, type EstadoFrioCelular } from "../../kit3d/objetos/FrioCelular";

// Mundo: un celular con barra de batería bajo la nevada; muere en 40 %. Aparece un termómetro con la franja de 32 a 95 °F,
// el celular vuelve a prender al calentarse y un auto estacionado tachado cierra el "Heads up".
// Fuente: Apple Support, "If your iPhone or iPad gets too hot or too cold" (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  rango: r.f(2),
  frio: r.f(3),
  carga: r.f(4),
  vuelve: r.f(5),
  auto: r.f(6),
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
    xs.push(xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 2.2, 8.5], mira: [0, 1.6, 0], fov: 34 },
  { f: E.rango, pos: [0.3, 2.3, 12.5], mira: [0.3, 1.7, 0], fov: 34 },
  { f: E.frio, pos: [0, 2.0, 7.5], mira: [0, 1.5, 0], fov: 34 },
  { f: E.vuelve, pos: [0, 2.2, 8.5], mira: [0, 1.6, 0], fov: 34 },
  { f: E.auto, pos: [-0.3, 2.3, 12.5], mira: [-0.3, 1.5, 0], fov: 34 },
  { f: DURACION, pos: [0, 2.3, 11], mira: [0, 1.6, 0], fov: 34 },
];

const estado = (frame: number): EstadoFrioCelular => ({
  frame,
  frio: k(frame, [[E.gancho, 0], [E.gancho + 20, 1], [E.vuelve - 4, 1], [E.vuelve + 30, 0]]),
  bateria: 0.4,
  apagado: k(frame, [[E.gancho + 40, 0], [E.gancho + 52, 1]]),
  termo: k(frame, [[E.rango, 0], [E.rango + 14, 1]]),
  nivel: k(frame, [[E.rango, 0.5], [E.frio, 0.5], [E.frio + 20, 0.1], [E.vuelve, 0.1], [E.vuelve + 30, 0.5], [E.auto, 0.5], [E.auto + 25, 0.92]]),
  calido: k(frame, [[E.vuelve, 0], [E.vuelve + 30, 1]]),
  auto: k(frame, [[E.auto, 0], [E.auto + 14, 1]]),
});

const DESTACAR = ["forty", "cold", "thirty-two", "ninety-five", "shorter", "shut", "charging", "normal", "Heads", "parked", "Save", "percent"];
const CIFRAS: [string, string][] = [
  ["forty percent", "40%"],
  ["thirty-two", "32"],
  ["ninety-five", "95"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.gancho + 50, "scratch", 0.4],
  [E.rango, "whoosh", 0.35],
  [E.frio, "pop", 0.4],
  [E.carga, "pop", 0.35],
  [E.vuelve, "ding", 0.45],
  [E.auto, "whoosh", 0.35],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const ColdPhoneEn061: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <FrioCelular e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.golpe} x={540} y={300}>
        Dies at <span style={{ color: ACENTO }}>40%</span> in the cold?
      </Chip>
      <Chip desde={E.golpe} hasta={E.rango} x={540} y={300}>
        The <span style={{ color: ACENTO }}>cold</span> can do that
      </Chip>
      <Chip desde={E.rango} hasta={E.frio} x={540} y={300}>
        Apple: <span style={{ color: ACENTO }}>32–95 °F</span>
      </Chip>
      <Chip desde={E.frio} hasta={E.carga} x={540} y={300}>
        Battery <span style={{ color: ACENTO }}>shorter</span> · can shut off
      </Chip>
      <Chip desde={E.carga} hasta={E.vuelve} x={540} y={300}>
        Might <span style={{ color: ACENTO }}>stop charging</span>
      </Chip>
      <Chip desde={E.vuelve} hasta={E.auto} x={540} y={300}>
        Warm again = <span style={{ color: ACENTO }}>back to normal</span>
      </Chip>
      <Chip desde={E.auto} hasta={E.guardar} x={540} y={300}>
        Not in a <span style={{ color: ACENTO }}>parked car</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={300}>
        Designed for <span style={{ color: ACENTO }}>32–95 °F</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={300}>
        Last <span style={{ color: ACENTO }}>percent</span> it died at?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend whose phone always dies at the worst moment" />
      <Audio src={staticFile("en-061-cold-phone/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.2, 8], mira: [0, 1.6, 0], fov: 34 }];
export const PortadaEn061: React.FC = () => (
  <Portada arriba="phone dies in the cold?" grande="32–95 °F" sello="APPLE" colorSello={C.azul} numero={61}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <FrioCelular e={{ frame: 40, frio: 1, bateria: 0.4, apagado: 0, termo: 0, nivel: 0.1, calido: 0, auto: 0 }} />
    </Estudio>
  </Portada>
);

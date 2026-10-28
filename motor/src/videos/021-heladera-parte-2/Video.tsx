import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/021-heladera-parte-2/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Heladera, type EstadoHeladera } from "../../kit3d/objetos/Heladera";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Heladera parte 2, en 3D (rehecha el 28/10 desde la 2D). Una olla humeante sobre la mesada: se tapa,
// entra a la heladera y cuatro fichas cuentan los días (tres o cuatro); un tupper pasa al freezer
// (meses), un reloj marca las dos horas y un papelito con la fecha cierra el video.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  tapo: r.f(1),
  tapa: r.f(2),
  tapala: r.w(2, "Tapala"),
  humedad: r.w(2, "humedad"),
  dias: r.f(3),
  vence: r.f(4),
  tres: r.f(5),
  tresW: r.w(5, "tres"),
  freezer: r.f(6),
  freezerW: r.w(6, "freezer"),
  meses: r.w(6, "meses"),
  ojo: r.f(7),
  horas: r.w(7, "dos"),
  papel: r.f(8),
  papelW: r.w(8, "papelito"),
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

const ANCHO = 34;
const TOMAS: Toma[] = [
  // gancho: la olla humeante en la mesada, con la heladera cerrada al lado
  { f: 0, pos: [-0.9, 2.2, 14], mira: [-0.5, 1.4, 0], fov: ANCHO },
  { f: E.tapo - 4, pos: [-1.2, 2.0, 11], mira: [-1.4, 1.5, 0], fov: ANCHO },
  // "¿y la tapo?" / "Tapala": primer plano de la olla y la tapa
  { f: E.tapo + 14, pos: [-1.5, 2.0, 7.2], mira: [-1.9, 1.5, 0], fov: 32 },
  { f: E.tapa + 40, pos: [-1.4, 2.0, 7.6], mira: [-1.9, 1.5, 0], fov: 32 },
  // "cuántos días dura": abre la puerta y la olla viaja
  { f: E.dias, pos: [-0.5, 2.3, 13], mira: [-0.4, 1.5, 0], fov: ANCHO },
  { f: E.dias + 30, pos: [0.4, 2.2, 10], mira: [0.5, 1.7, 0], fov: ANCHO },
  // "fecha de vencimiento": adentro, los tuppers
  { f: E.tres - 4, pos: [0.7, 2.4, 11.5], mira: [0.7, 2.0, 0], fov: ANCHO },
  // "tres o cuatro días": las fichas arriba de la heladera
  { f: E.tresW + 14, pos: [0.7, 3.1, 12], mira: [0.7, 2.7, 0], fov: ANCHO },
  // freezer
  { f: E.freezerW - 4, pos: [1.2, 3.0, 8.2], mira: [0.9, 2.6, 0], fov: 30 },
  { f: E.meses + 10, pos: [1.1, 3.0, 8.6], mira: [0.9, 2.6, 0], fov: 30 },
  // "ojo": el reloj de las dos horas
  { f: E.ojo + 4, pos: [-0.9, 2.5, 12], mira: [-0.6, 2.0, 0], fov: ANCHO },
  { f: E.ojo + 40, pos: [-1.1, 2.5, 10.5], mira: [-1.1, 2.1, 0], fov: ANCHO },
  // el papelito con la fecha
  { f: E.papel, pos: [0.6, 2.7, 11], mira: [0.8, 2.2, 0], fov: ANCHO },
  { f: E.papelW + 18, pos: [1.1, 2.8, 7.4], mira: [1.0, 2.4, 0], fov: 30 },
  // cierre: plano entero, como al principio
  { f: E.cta, pos: [0.2, 2.4, 14.5], mira: [-0.3, 1.5, 0], fov: ANCHO },
  { f: DURACION, pos: [-0.9, 2.2, 14], mira: [-0.5, 1.4, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoHeladera => ({
  frame,
  puerta: k(frame, [
    [E.dias - 10, 0],
    [E.dias + 8, 1],
    [E.fin, 1],
  ]),
  fantasmaPuerta: 0,
  ollaT: k(frame, [
    [E.dias + 6, 0],
    [E.dias + 34, 1],
  ]),
  tapa: k(frame, [
    [E.tapala - 4, 0],
    [E.tapala + 8, 1],
  ]),
  vapor: k(frame, [
    [0, 1],
    [E.tapala - 4, 1],
    [E.tapala + 8, 0],
    [E.dias + 6, 0],
    [E.dias + 20, 0.25],
    [E.dias + 34, 0],
  ]),
  tuppers: k(frame, [
    [E.vence - 2, 0],
    [E.vence + 10, 1],
  ]),
  freezerT: k(frame, [
    [E.freezerW, 0],
    [E.freezerW + 18, 1],
    [E.ojo, 1],
    [E.ojo + 14, 0],
  ]),
  papel: k(frame, [
    [E.papelW, 0],
    [E.papelW + 8, 1],
  ]),
  reloj: k(frame, [
    [E.horas, 0],
    [E.papel - 8, 1],
  ]),
  relojOn: k(frame, [
    [E.ojo + 2, 0],
    [E.ojo + 14, 1],
    [E.papel - 4, 1],
    [E.papel + 6, 0],
  ]),
  dias: k(frame, [
    [E.tresW, 0],
    [E.tresW + 24, 4],
    [E.freezerW - 4, 4],
    [E.freezerW + 4, 0],
  ]),
  escarcha: k(frame, [
    [E.freezerW, 0],
    [E.freezerW + 12, 1],
    [E.ojo, 1],
    [E.ojo + 12, 0],
  ]),
});

const DESTACAR = ["tapo", "tapala", "dura", "vencimiento", "3 o 4", "freezer", "meses", "2 horas", "papelito", "fecha", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["tres o cuatro", "3 o 4"],
  ["dos horas", "2 horas"],
];

const efectos: Efecto[] = [
  [E.tapo, "pop", 0.4],
  [E.tapala + 6, "sello", 0.6],
  [E.dias, "whoosh", 0.35],
  [E.vence, "pop", 0.4],
  [E.tresW + 4, "tic", 0.5],
  [E.tresW + 14, "tic", 0.5],
  [E.tresW + 24, "ding", 0.5],
  [E.freezerW, "whoosh", 0.4],
  [E.ojo, "whoosh", 0.35],
  [E.horas, "tic", 0.5],
  [E.papel - 8, "ding", 0.5],
  [E.papelW + 4, "sello", 0.6],
  [E.cta, "whoosh", 0.35],
];

export const HeladeraParte2_021: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Heladera e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.tapo} hasta={E.tapa + 4} x={540} y={300}>
        ¿La <span style={{ color: ACENTO }}>tapo</span>?
      </Chip>
      <Chip desde={E.humedad - 4} hasta={E.dias} x={540} y={300}>
        Tapada: <span style={{ color: ACENTO }}>no se seca</span>
      </Chip>
      <Chip desde={E.vence} hasta={E.tres} x={540} y={300} color="#ff5a4a">
        Tiene <span style={{ color: "#ff8a7a" }}>fecha</span>
      </Chip>
      <Chip desde={E.tresW + 10} hasta={E.freezerW - 2} x={540} y={300}>
        Heladera: <span style={{ color: ACENTO }}>3 a 4 días</span>
      </Chip>
      <Chip desde={E.freezerW + 6} hasta={E.ojo} x={540} y={300} color="#5fd2ff">
        Freezer: <span style={{ color: "#5fd2ff" }}>3 a 4 meses</span>
      </Chip>
      <Chip desde={E.ojo + 8} hasta={E.papel} x={540} y={300} color="#ff5a4a">
        Antes de <span style={{ color: "#ff8a7a" }}>2 horas</span>
      </Chip>
      <Chip desde={E.papelW} hasta={E.cta - 4} x={540} y={300}>
        Cada tupper, <span style={{ color: ACENTO }}>con fecha</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que guarda la olla entera con la tapa puesta" />
      <Audio src={staticFile("021-heladera-parte-2/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

// Portada: el molde parejo de la grilla con la heladera abierta, la olla adentro y las fichas de días.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.9, 3.0, 12.5], mira: [0.5, 2.2, 0], fov: 34 }];
export const Portada021: React.FC = () => (
  <Portada arriba="¿cuántos días dura la comida en la heladera?" grande="tres o cuatro" sello="DATO" colorSello={C.verde} numero={21}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Heladera
        e={{ ...estado(0), frame: 20, puerta: 1, ollaT: 1, tapa: 1, vapor: 0, tuppers: 1, dias: 4, papel: 1, freezerT: 0, reloj: 0, relojOn: 0, escarcha: 1 }}
      />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

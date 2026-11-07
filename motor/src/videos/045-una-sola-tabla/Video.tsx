import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/045-una-sola-tabla/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Tabla, type EstadoTabla } from "../../kit3d/objetos/Tabla";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una mesada con una tabla de madera. El pollo crudo deja bacterias, el tomate llega a la misma tabla y se contagia;
// aparece una segunda tabla para lo que no se cocina; "Ojo": jabón y surcos; cinta roja en la del crudo (USDA FSIS; ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  usda: r.f(1),
  razon: r.f(2),
  tomate: r.f(3),
  regla: r.f(4),
  ojo: r.f(5),
  surcos: r.f(6),
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
  { f: 0, pos: [-0.6, 5.0, 13], mira: [-0.6, 0.3, 0], fov: ANCHO },
  { f: E.usda, pos: [0.4, 5.0, 14], mira: [0.4, 0.3, 0], fov: ANCHO },
  { f: E.razon, pos: [-1.1, 4.0, 8.2], mira: [-1.1, 0.3, 0], fov: 40 },
  { f: E.tomate, pos: [-0.6, 4.2, 9.5], mira: [-0.6, 0.3, 0], fov: 42 },
  { f: E.regla, pos: [1.1, 5.0, 15], mira: [1.1, 0.3, 0], fov: ANCHO },
  { f: E.ojo, pos: [-1.1, 4.0, 8.4], mira: [-1.1, 0.3, 0], fov: 40 },
  { f: E.surcos, pos: [-1.1, 4.2, 7.4], mira: [-1.1, 0.3, 0], fov: 38 },
  { f: E.hoy, pos: [0.5, 4.8, 12], mira: [0.5, 0.3, 0], fov: 44 },
  { f: E.cta, pos: [1.1, 5.0, 15], mira: [1.1, 0.3, 0], fov: ANCHO },
  { f: DURACION, pos: [1.1, 5.0, 15], mira: [1.1, 0.3, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoTabla => ({
  frame,
  pollo: k(frame, [[E.gancho + 2, 0], [E.gancho + 18, 1]]),
  bacTabla: k(frame, [[E.razon + 4, 0], [E.razon + 40, 1]]),
  tomate: k(frame, [[E.tomate + 2, 0], [E.tomate + 26, 1]]),
  contagio: k(frame, [[E.tomate + 28, 0], [E.tomate + 54, 1]]),
  tabla2: k(frame, [[E.regla - 2, 0], [E.regla + 18, 1]]),
  tomate2: k(frame, [[E.regla + 20, 0], [E.regla + 44, 1]]),
  jabon: k(frame, [[E.ojo + 10, 0], [E.ojo + 40, 1], [E.surcos, 1], [E.surcos + 14, 0]]),
  surcos: k(frame, [[E.surcos + 4, 0], [E.surcos + 24, 1]]),
  cinta: k(frame, [[E.hoy + 6, 0], [E.hoy + 26, 1]]),
});

const DESTACAR = ["crudo", "crudos", "Error.", "bacterias", "plato", "Ojo:", "jabón", "cambiala", "cinta", "Mandáselo", "tabla"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.usda, "whoosh", 0.35],
  [E.razon, "scratch", 0.4],
  [E.tomate, "pop", 0.4],
  [E.regla, "ding", 0.4],
  [E.ojo, "pop", 0.4],
  [E.surcos, "tic", 0.35],
  [E.hoy, "ding", 0.4],
  [E.cta, "pop", 0.4],
];

export const UnaSolaTabla3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <Tabla e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.usda} x={540} y={300}>
        Pollo <span style={{ color: ACENTO }}>crudo</span> + tomate = misma tabla
      </Chip>
      <Chip desde={E.usda} hasta={E.razon} x={540} y={300}>
        USDA FSIS · <span style={{ color: ACENTO }}>una para crudo, otra para frescos</span>
      </Chip>
      <Chip desde={E.razon} hasta={E.tomate} x={540} y={300}>
        La carne cruda puede dejar <span style={{ color: ACENTO }}>bacterias</span>
      </Chip>
      <Chip desde={E.tomate} hasta={E.regla} x={540} y={300}>
        El tomate no se cocina: <span style={{ color: ACENTO }}>va al plato</span>
      </Chip>
      <Chip desde={E.regla} hasta={E.ojo} x={540} y={300}>
        Tabla <span style={{ color: ACENTO }}>1 crudo</span> · Tabla 2 sin cocinar
      </Chip>
      <Chip desde={E.ojo} hasta={E.surcos} x={540} y={300}>
        ¿Una sola? <span style={{ color: ACENTO }}>Agua caliente y jabón</span>
      </Chip>
      <Chip desde={E.surcos} hasta={E.hoy} x={540} y={300}>
        Surcos que no se limpian: <span style={{ color: ACENTO }}>cambiala</span>
      </Chip>
      <Chip desde={E.hoy} hasta={E.cta} x={540} y={300}>
        Guardalo: <span style={{ color: ACENTO }}>una crudo, otra sin cocinar</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que corta todo en la misma tabla" />
      <Audio src={staticFile("045-una-sola-tabla/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.6, 4.6, 12], mira: [0.6, 0.4, 0], fov: 44 }];
export const Portada045: React.FC = () => (
  <Portada arriba="cocina" grande="una tabla para el crudo" sello="2 TABLAS" colorSello={C.azul} numero={45}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Tabla e={{ frame: 40, pollo: 1, bacTabla: 1, tomate: 1, contagio: 1, tabla2: 1, tomate2: 0, jabon: 0, surcos: 0, cinta: 0 }} />
    </Estudio>
  </Portada>
);

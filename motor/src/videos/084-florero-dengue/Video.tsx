import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/084-florero-dengue/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Florero, estadoPortadaFlorero, type EstadoFlorero } from "../../kit3d/objetos/Florero";

// Mundo: un florero de vidrio sobre fondo azul noche. Se cambia el agua, se ven los huevitos pegados a la pared
// (zoom adentro), un cepillo los saca y el agua limpia vuelve. Fuentes: Ministerio de Salud de la Nación y
// Salud de la provincia de Buenos Aires. Ilustración.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  huevos: r.f(1),
  minis: r.f(2),
  seco: r.f(3),
  frotar: r.f(4),
  regla: r.f(5),
  lluvia: r.f(6),
  ojo: r.f(7),
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

const ANCHO = { pos: [0, 3.0, 9.5] as [number, number, number], mira: [0, 1.8, 0] as [number, number, number], fov: 36 };
const CERCA = { pos: [0, 2.0, 6.8] as [number, number, number], mira: [0, 1.1, 0] as [number, number, number], fov: 34 };
const MEDIA = { pos: [0, 2.4, 6.5] as [number, number, number], mira: [0, 1.3, 0] as [number, number, number], fov: 34 };
const TOMAS: Toma[] = [
  { f: 0, ...ANCHO },
  { f: E.huevos, ...ANCHO },
  { f: E.huevos + 12, ...CERCA },
  { f: E.seco - 2, ...CERCA },
  { f: E.seco + 10, ...MEDIA },
  { f: E.frotar - 2, ...MEDIA },
  { f: E.frotar + 10, ...CERCA },
  { f: E.regla - 2, ...CERCA },
  { f: E.regla + 12, ...ANCHO },
  { f: DURACION, pos: [0.3, 2.9, 9], mira: [0, 1.8, 0], fov: 36 },
];

const estado = (frame: number): EstadoFlorero => ({
  frame,
  // gancho: se vacía y se llena de nuevo; huevos: vacío y a la vista; frotar: vacío; regla: agua limpia
  agua: k(frame, [
    [0, 1],
    [E.gancho + 22, 1],
    [E.gancho + 40, 0],
    [E.gancho + 62, 1],
    [E.huevos - 2, 1],
    [E.huevos + 10, 0],
    [E.regla - 2, 0],
    [E.regla + 14, 1],
  ]),
  verde: k(frame, [[0, 0.7], [E.gancho + 40, 0.7], [E.gancho + 62, 0.15], [E.huevos + 10, 0.15], [E.regla - 2, 0.15], [E.regla + 14, 0]]),
  huevos: k(frame, [[E.huevos + 6, 0], [E.huevos + 22, 1], [E.frotar + 50, 1], [E.regla - 2, 1]]),
  cepillo: k(frame, [[E.frotar + 4, 0], [E.regla - 6, 1]]),
  flores: k(frame, [[0, 1], [E.huevos - 2, 1], [E.huevos + 10, 0], [E.regla, 0], [E.regla + 16, 1]]),
});

const DESTACAR = ["huevos", "pegados", "pared", "cepillar", "Ministerio", "año", "frotar", "guardar", "tres", "días", "Ojo:", "Mandáselo", "hoy", "nunca"];
const CIFRAS: [string, string][] = [["tres días", "3 días"]];

const efectos: Efecto[] = [
  [E.gancho + 40, "whoosh", 0.35],
  [E.huevos + 12, "scratch", 0.4],
  [E.minis, "ding", 0.45],
  [E.seco, "pop", 0.4],
  [E.frotar + 6, "whoosh", 0.4],
  [E.regla, "tic", 0.5],
  [E.regla + 14, "ding", 0.5],
  [E.ojo, "sello", 0.4],
];

export const FloreroDengue3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Florero e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.gancho + 6} hasta={E.huevos - 2} x={540} y={300}>
        Cambiás el agua · <span style={{ color: ACENTO }}>¿listo?</span>
      </Chip>
      <Chip desde={E.huevos + 4} hasta={E.minis - 2} x={540} y={300} color="#ff5a4a">
        Mosquito del dengue · <span style={{ color: "#ff8a7a" }}>huevos en la pared</span>
      </Chip>
      <Chip desde={E.minis + 4} hasta={E.seco - 2} x={540} y={300}>
        Ministerio de Salud de la Nación · <span style={{ color: ACENTO }}>cepillar</span>
      </Chip>
      <Chip desde={E.seco + 4} hasta={E.frotar - 2} x={540} y={300} color="#ff5a4a">
        Secos: <span style={{ color: "#ff8a7a" }}>más de 1 año</span>
      </Chip>
      <Chip desde={E.frotar + 4} hasta={E.regla - 2} x={540} y={300}>
        Tirar el agua <span style={{ color: ACENTO }}>+ frotar</span>
      </Chip>
      <Chip desde={E.regla + 4} hasta={E.lluvia - 2} x={540} y={300}>
        Guardalo: agua nueva cada <span style={{ color: ACENTO }}>3 días</span>
      </Chip>
      <Chip desde={E.lluvia + 4} hasta={E.ojo - 2} x={540} y={300}>
        Sin uso + lluvia = <span style={{ color: ACENTO }}>tirar</span>
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.pregunta - 2} x={540} y={300} color="#ff5a4a">
        Prevención · <span style={{ color: "#ff8a7a" }}>no tratamiento</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que tiene el florero con el agua verde" />
      <Audio src={staticFile("084-florero-dengue/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.8, 10], mira: [0, 1.7, 0], fov: 36 }];
export const Portada084: React.FC = () => (
  <Portada arriba="cambiás el agua del florero" grande="y el mosquito sigue" sello="DENGUE" colorSello={C.azul} numero={84}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Florero e={estadoPortadaFlorero()} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

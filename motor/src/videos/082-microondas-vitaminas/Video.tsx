import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/082-microondas-vitaminas/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { VerduraCoccion, portadaVerdura, type EstadoVerdura } from "../../kit3d/objetos/VerduraCoccion";

// Mundo: una mesada con brócoli cocinado de dos formas. Izquierda: olla hirviendo, las vitaminas (puntitos verdes)
// se escapan al agua y el agua se tira. Derecha: bowl de vidrio en el microondas con un chorrito de agua,
// las vitaminas se quedan alrededor. Fuente: Harvard Health (2019 y 2021). Ilustración, no medición.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  alReves: r.f(1),
  harvard: r.f(2),
  tiempo: r.f(3),
  hervir: r.f(4),
  tira: r.w(4, "tirás"),
  vitc: r.f(5),
  truco: r.f(6),
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

const ANCHO = { pos: [0, 8, 26] as [number, number, number], mira: [0, 0.8, 0] as [number, number, number], fov: 34 };
const OLLA = { pos: [-2.6, 6.2, 8.4] as [number, number, number], mira: [-2.6, 0.7, 0] as [number, number, number], fov: 34 };
const BOWL = { pos: [2.6, 2.4, 6.4] as [number, number, number], mira: [2.6, 0.7, 0] as [number, number, number], fov: 34 };
const TOMAS: Toma[] = [
  { f: 0, ...ANCHO },
  { f: E.alReves + 10, pos: [1.0, 7.6, 25], mira: [0, 0.8, 0], fov: 34 },
  { f: E.harvard + 6, ...BOWL },
  { f: E.tiempo - 2, ...BOWL },
  { f: E.tiempo + 10, ...ANCHO },
  { f: E.hervir - 2, ...ANCHO },
  { f: E.hervir + 12, ...OLLA },
  { f: E.vitc - 4, pos: [-2.2, 6.4, 9.2], mira: [-2.2, 0.8, 0], fov: 34 },
  { f: E.vitc + 8, ...BOWL },
  { f: E.truco - 2, ...BOWL },
  { f: E.truco + 14, pos: [2.6, 3.6, 5.6], mira: [2.6, 0.6, 0], fov: 32 },
  { f: E.ojo - 2, pos: [2.6, 3.6, 5.6], mira: [2.6, 0.6, 0], fov: 32 },
  { f: E.ojo + 12, ...ANCHO },
  { f: E.cta + 18, pos: [0, 8, 26], mira: [0, 0.8, 0], fov: 34 },
  { f: DURACION, pos: [0.4, 8, 25], mira: [0, 0.8, 0], fov: 34 },
];

const estado = (frame: number): EstadoVerdura => ({
  frame,
  fuga: k(frame, [[E.hervir, 0], [E.hervir + 25, 1], [E.ojo, 1], [E.ojo + 10, 0.4]]),
  tiñe: k(frame, [[E.hervir + 6, 0], [E.tira, 0.9], [E.ojo, 0.9]]),
  tira: k(frame, [[E.tira - 4, 0], [E.tira + 14, 1], [E.vitc - 4, 1], [E.vitc + 6, 0]]),
  ondas: k(frame, [[E.harvard, 0], [E.harvard + 10, 1], [E.ojo, 1], [E.ojo + 10, 0]]),
  retiene: k(frame, [[E.tiempo, 0], [E.tiempo + 18, 1], [E.ojo, 1], [E.ojo + 10, 0.4]]),
  chorrito: k(frame, [[E.truco, 0], [E.truco + 6, 1], [E.truco + 50, 1], [E.truco + 60, 0]]),
  brillo: k(frame, [[E.vitc + 2, 0], [E.vitc + 12, 1], [E.truco - 4, 1], [E.truco + 6, 0]]),
  apagar: k(frame, [[E.ojo, 0], [E.ojo + 10, 1]]),
});

const DESTACAR = ["vitaminas", "Harvard", "menos", "tarda", "agua", "tirás", "vitamina", "chorrito", "pocos", "vapor", "Ojo:", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["dos mil diecinueve", "2019"],
];

const efectos: Efecto[] = [
  [E.alReves, "whoosh", 0.35],
  [E.harvard, "whoosh", 0.4],
  [E.harvard + 14, "sello", 0.5],
  [E.tiempo, "tic", 0.5],
  [E.hervir, "whoosh", 0.35],
  [E.tira, "pop", 0.5],
  [E.vitc, "whoosh", 0.35],
  [E.vitc + 12, "ding", 0.5],
  [E.truco, "pop", 0.4],
  [E.ojo, "tic", 0.4],
];

export const MicroondasVitaminas3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <VerduraCoccion e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.gancho + 6} hasta={E.alReves + 20} x={270} y={330} color="#8fd45a">
        Hervida: <span style={{ color: "#8fd45a" }}>olla</span>
      </Chip>
      <Chip desde={E.gancho + 6} hasta={E.alReves + 20} x={810} y={330}>
        Microondas: <span style={{ color: ACENTO }}>bowl</span>
      </Chip>
      <Chip desde={E.harvard + 4} hasta={E.tiempo - 2} x={540} y={300}>
        Harvard Health · <span style={{ color: ACENTO }}>2019</span>
      </Chip>
      <Chip desde={E.tiempo + 6} hasta={E.hervir - 2} x={540} y={300}>
        Más tiempo = <span style={{ color: ACENTO }}>más se rompe</span>
      </Chip>
      <Chip desde={E.hervir + 8} hasta={E.vitc - 2} x={540} y={300} color="#8fd45a">
        Se va al <span style={{ color: "#8fd45a" }}>agua</span>
      </Chip>
      <Chip desde={E.vitc + 6} hasta={E.truco - 2} x={540} y={300}>
        Vitamina C · <span style={{ color: ACENTO }}>Harvard 2021</span>
      </Chip>
      <Chip desde={E.truco + 4} hasta={E.ojo - 2} x={540} y={300}>
        Chorrito de agua · <span style={{ color: ACENTO }}>pocos minutos</span>
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.pregunta - 2} x={540} y={300} color="#ff5a4a">
        Todo cocinado <span style={{ color: "#ff8a7a" }}>rompe algo</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que hierve la verdura hasta que se deshace" />
      <Audio src={staticFile("082-microondas-vitaminas/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 7, 28], mira: [0, 1.4, 0], fov: 36 }];
export const Portada082: React.FC = () => (
  <Portada arriba="¿el microondas le saca las vitaminas?" grande="es casi al revés" sello="DATO" colorSello={C.azul} numero={82}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <VerduraCoccion e={portadaVerdura()} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

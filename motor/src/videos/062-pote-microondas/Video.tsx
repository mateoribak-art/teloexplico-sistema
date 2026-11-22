import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/062-pote-microondas/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Microondas, portadaMicroondas, type EstadoMicroondas } from "../../kit3d/objetos/Microondas";

// Microondas con un pote de yogur/margarina con guiso adentro. Prende, el pote se deforma, salen partículas
// (ilustración de "sustancias químicas") y al final el pote se cambia por un recipiente de vidrio apto.
// Fuente: Universidad de Clemson, Home & Garden Information Center (Microwave Food Safety).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  clemson: r.f(1),
  deforma: r.f(2),
  quimicos: r.f(3),
  regla: r.f(4),
  ojo: r.f(5),
  pregunta: r.f(6),
  cta: r.f(7),
  fin: r.fin(7),
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

const AMPLIA = { pos: [0, 1.9, 9.8] as [number, number, number], mira: [0, 1.3, 0] as [number, number, number], fov: 46 };

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 1.7, 8.2], mira: [-0.1, 1.2, 0], fov: 46 },
  { f: E.clemson, ...AMPLIA },
  { f: E.deforma, pos: [-0.1, 1.2, 5.6], mira: [-0.1, 0.9, 0], fov: 46 },
  { f: E.quimicos, pos: [-0.1, 1.3, 5.2], mira: [-0.1, 0.9, 0], fov: 46 },
  { f: E.regla, ...AMPLIA },
  { f: E.ojo, pos: [-0.1, 1.4, 6.6], mira: [-0.1, 1.0, 0], fov: 46 },
  { f: E.pregunta, ...AMPLIA },
  { f: DURACION, ...AMPLIA },
];

const estado = (frame: number): EstadoMicroondas => ({
  frame,
  pote: k(frame, [[1, 0], [14, 1]]),
  prendido: k(frame, [[E.clemson + 6, 0], [E.clemson + 20, 1], [E.regla - 6, 1], [E.regla + 6, 0]]),
  deforma: k(frame, [[E.deforma - 4, 0], [E.deforma + 40, 1], [E.regla - 6, 1]]),
  quimicos: k(frame, [[E.quimicos - 2, 0], [E.quimicos + 24, 1], [E.regla - 6, 1]]),
  vidrio: k(frame, [[E.regla + 8, 0], [E.regla + 22, 1]]),
  apto: k(frame, [[E.regla + 26, 0], [E.regla + 40, 1]]),
});

const DESTACAR = ["pote", "yogur", "margarina", "Clemson", "deformar", "derretir", "químicas", "apto", "vidrio", "Mandáselo"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho, "tic", 0.5],
  [E.clemson + 18, "pop", 0.4],
  [E.deforma + 4, "whoosh", 0.35],
  [E.quimicos + 4, "pop", 0.45],
  [E.regla + 22, "ding", 0.55],
  [E.ojo, "sello", 0.5],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const PoteMicroondas3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Microondas e={e} />
        <PisoSombra y={-0.3} opacidad={0.22} />
      </Estudio>
      <Chip desde={E.gancho + 20} hasta={E.clemson} x={540} y={640}>
        guiso en el <span style={{ color: ACENTO }}>pote de yogur</span>
      </Chip>
      <Chip desde={E.clemson + 10} hasta={E.deforma} x={540} y={640}>
        Universidad de <span style={{ color: ACENTO }}>Clemson</span>
      </Chip>
      <Chip desde={E.deforma + 4} hasta={E.quimicos} x={540} y={640}>
        se puede <span style={{ color: ACENTO }}>deformar o derretir</span>
      </Chip>
      <Chip desde={E.quimicos + 4} hasta={E.regla} x={540} y={640} color="#ff9a3c">
        y pasar <span style={{ color: "#ff9a3c" }}>sustancias químicas</span>
      </Chip>
      <Chip desde={E.regla + 4} hasta={E.ojo} x={540} y={640} color="#38e08c">
        envase <span style={{ color: "#38e08c" }}>apto para microondas</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.pregunta} x={540} y={640}>
        sin etiqueta: <span style={{ color: ACENTO }}>plato o vidrio</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={640}>
        ¿vidrio, plástico o <span style={{ color: ACENTO }}>pote</span>?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que calienta el guiso en el pote de la margarina" />
      <Audio src={staticFile("062-pote-microondas/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.8, 8.6], mira: [-0.1, 1.2, 0], fov: 46 }];
export const Portada062: React.FC = () => (
  <Portada arriba="tu microondas" grande="¿en qué calentás?" sello="el pote no es para eso" colorSello={C.azul} numero={62}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Microondas e={portadaMicroondas()} />
      <PisoSombra y={-0.3} opacidad={0.2} />
    </Estudio>
  </Portada>
);

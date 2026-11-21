import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/060-celular-carga-noche/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { CargaNoche, portadaCargaNoche, type EstadoCargaNoche } from "../../kit3d/objetos/CargaNoche";

// Carga nocturna: celular enchufado de noche y una barra de batería gigante que sube a 100, se queda llena (se pone naranja)
// y después se frena en 80 (carga optimizada / límite del iPhone 15). Fuente: Apple Soporte.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  nosobre: r.f(1),
  apple: r.f(2),
  llena: r.f(3),
  optim: r.f(4),
  ochenta: r.f(5),
  guarda: r.f(6),
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

const AMPLIA = { pos: [0.0, 3.4, 14.5] as [number, number, number], mira: [0.0, 3.1, 0] as [number, number, number], fov: 46 };

const TOMAS: Toma[] = [
  { f: 0, pos: [0.0, 3.4, 15.0], mira: [0.0, 3.1, 0], fov: 46 },
  { f: E.nosobre, ...AMPLIA },
  { f: E.apple, pos: [0.0, 2.8, 12.5], mira: [-0.1, 2.6, 0], fov: 46 },
  { f: E.llena, pos: [0.0, 3.2, 13.5], mira: [-0.1, 3.0, 0], fov: 46 },
  { f: E.optim, ...AMPLIA },
  { f: E.ochenta, pos: [0.0, 3.6, 13.0], mira: [-0.1, 3.4, 0], fov: 46 },
  { f: E.cta, ...AMPLIA },
  { f: DURACION, ...AMPLIA },
];

const estado = (frame: number): EstadoCargaNoche => ({
  frame,
  pct: k(frame, [
    [2, 15],
    [E.nosobre + 10, 100],
    [E.llena + 40, 100],
    [E.optim + 6, 100],
    [E.optim + 30, 80],
    [E.pregunta, 80],
  ]),
  luna: k(frame, [[2, 0], [14, 1]]),
  llena: k(frame, [[E.llena - 2, 0], [E.llena + 30, 1], [E.optim, 1], [E.optim + 16, 0]]),
  marca80: k(frame, [[E.optim + 14, 0], [E.optim + 28, 1]]),
  corte: k(frame, [[E.apple - 4, 0], [E.apple + 8, 1], [E.llena - 4, 1], [E.llena + 2, 0]]),
  optimizada: k(frame, [[E.optim + 20, 0], [E.optim + 34, 1]]),
});

const DESTACAR = ["sobrecarga", "cien", "llena", "ochenta", "Guardate", "Mandáselo", "optimizada"];
const CIFRAS: [string, string][] = [
  ["cien por ciento", "100 %"],
  ["ochenta por ciento", "80 %"],
  ["quince", "15"],
];

const efectos: Efecto[] = [
  [E.gancho, "tic", 0.5],
  [E.nosobre, "sello", 0.5],
  [E.apple + 10, "ding", 0.55],
  [E.llena + 4, "whoosh", 0.35],
  [E.optim + 30, "ding", 0.5],
  [E.guarda, "sello", 0.6],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const CargaNoche3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <CargaNoche e={e} />
        <PisoSombra y={0} opacidad={0.22} />
      </Estudio>
      <Chip desde={E.gancho + 30} hasta={E.nosobre} x={540} y={640}>
        toda la noche · <span style={{ color: ACENTO }}>enchufado</span>
      </Chip>
      <Chip desde={E.apple + 6} hasta={E.llena} x={540} y={640}>
        Apple · completa = <span style={{ color: ACENTO }}>deja de cargar</span>
      </Chip>
      <Chip desde={E.llena + 16} hasta={E.optim} x={540} y={640} color="#ff9a2e">
        muchas horas <span style={{ color: "#ff9a2e" }}>llena</span> = desgaste
      </Chip>
      <Chip desde={E.ochenta + 6} hasta={E.guarda} x={540} y={640}>
        iPhone 15+ · límite <span style={{ color: ACENTO }}>80 %</span>
      </Chip>
      <Chip desde={E.guarda} hasta={E.pregunta} x={540} y={640}>
        guardalo: <span style={{ color: ACENTO }}>carga optimizada</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={640}>
        ¿<span style={{ color: ACENTO }}>dormís</span> con el celular cargando?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que se levanta a desenchufar el celular" />
      <Audio src={staticFile("060-celular-carga-noche/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.0, 3.4, 13.0], mira: [0.0, 3.1, 0], fov: 46 }];
export const Portada060: React.FC = () => (
  <Portada arriba="celular toda la noche" grande="no se sobrecarga" sello="Apple lo explica" colorSello={C.azul} numero={60}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <CargaNoche e={portadaCargaNoche()} />
      <PisoSombra opacidad={0.2} />
    </Estudio>
  </Portada>
);

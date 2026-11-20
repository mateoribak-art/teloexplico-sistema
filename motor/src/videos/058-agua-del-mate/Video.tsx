import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/058-agua-del-mate/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { AguaMate, portadaAguaMate, type EstadoAguaMate } from "../../kit3d/objetos/AguaMate";

// Agua del mate: un termómetro gigante sube hasta cien (hierve), baja a la banda verde de 75 a 80 (INYM) y el mate aparece.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  hervir: r.f(1),
  inym: r.f(2),
  cien: r.f(3),
  ojo: r.f(4),
  apaga: r.f(5),
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

const AMPLIA = { pos: [1.2, 2.6, 14.0] as [number, number, number], mira: [1.0, 2.5, 0] as [number, number, number], fov: 46 };

const TOMAS: Toma[] = [
  { f: 0, pos: [1.0, 2.6, 14.5], mira: [0.8, 2.4, 0], fov: 46 },
  { f: E.hervir, ...AMPLIA },
  { f: E.inym, pos: [0.6, 3.4, 11.5], mira: [0.4, 3.0, 0], fov: 46 },
  { f: E.cien, ...AMPLIA },
  { f: E.apaga, pos: [1.0, 2.6, 13.0], mira: [1.0, 2.5, 0], fov: 46 },
  { f: E.guarda, pos: [0.6, 3.4, 11.5], mira: [0.4, 3.0, 0], fov: 46 },
  { f: E.cta, ...AMPLIA },
  { f: DURACION, ...AMPLIA },
];

const estado = (frame: number): EstadoAguaMate => ({
  frame,
  grados: k(frame, [
    [2, 4],
    [E.hervir + 40, 100],
    [E.inym - 2, 100],
    [E.inym + 18, 78],
    [E.cien, 78],
    [E.cien + 14, 100],
    [E.ojo, 100],
    [E.apaga, 100],
    [E.apaga + 20, 78],
  ]),
  banda: k(frame, [[E.inym + 12, 0], [E.inym + 24, 1]]),
  hierve: k(frame, [[E.hervir + 30, 0], [E.hervir + 40, 1], [E.inym + 2, 1], [E.inym + 8, 0], [E.cien + 4, 0], [E.cien + 14, 1], [E.apaga + 4, 1], [E.apaga + 10, 0]]),
  mate: k(frame, [[E.cien - 6, 0], [E.cien + 8, 1]]),
  quemada: k(frame, [[E.cien + 14, 0], [E.cien + 40, 0.8], [E.ojo, 0.8], [E.apaga + 10, 0]]),
});

const DESTACAR = ["hervir", "setenta", "ochenta", "cien", "grados", "Guardate", "Mandáselo", "amargo"];
const CIFRAS: [string, string][] = [
  ["setenta y cinco", "75"],
  ["ochenta", "80"],
  ["cien", "100"],
];

const efectos: Efecto[] = [
  [E.hervir, "tic", 0.5],
  [E.hervir + 40, "sello", 0.5],
  [E.inym + 14, "ding", 0.55],
  [E.cien, "whoosh", 0.35],
  [E.apaga + 18, "ding", 0.5],
  [E.guarda, "sello", 0.6],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const AguaMate3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <AguaMate e={e} />
        <PisoSombra y={0} opacidad={0.22} />
      </Estudio>
      <Chip desde={E.gancho + 40} hasta={E.inym} x={540} y={640}>
        la pava <span style={{ color: "#ff3a2e" }}>silba</span> = 100 °C
      </Chip>
      <Chip desde={E.inym + 20} hasta={E.cien} x={540} y={640}>
        INYM · <span style={{ color: ACENTO }}>75 a 80 °C</span>
      </Chip>
      <Chip desde={E.cien + 20} hasta={E.ojo} x={540} y={640} color="#ff3a2e">
        100 °C = <span style={{ color: "#ff3a2e" }}>amargo</span>
      </Chip>
      <Chip desde={E.guarda} hasta={E.pregunta} x={540} y={640}>
        guardalo: <span style={{ color: ACENTO }}>75 a 80</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={640}>
        ¿<span style={{ color: ACENTO }}>amargo</span> o con azúcar?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que apaga la pava cuando silba" />
      <Audio src={staticFile("058-agua-del-mate/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [1.2, 3.4, 12.0], mira: [1.0, 3.2, 0], fov: 46 }];
export const Portada058: React.FC = () => (
  <Portada arriba="el agua del mate" grande="no tiene que hervir" sello="75–80 °C" colorSello={C.azul} numero={58}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <AguaMate e={portadaAguaMate()} />
      <PisoSombra opacidad={0.2} />
    </Estudio>
  </Portada>
);

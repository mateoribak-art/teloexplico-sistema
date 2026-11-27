import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/083-brindis-copas/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Copas, estadoPortadaCopas, type EstadoCopas } from "../../kit3d/objetos/Copas";

// Mundo: dos copas que se acercan y chocan sobre fondo azul noche. Se tiñe de verde una (versión del veneno,
// infundada), aparecen dos ojos que se miran (costumbre de mirar a los ojos). Fuente: BBC Mundo. Ilustración.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  nadie: r.f(1),
  bbc: r.f(2),
  veneno: r.f(3),
  palabra: r.f(4),
  carlos: r.f(5),
  ojos: r.f(6),
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

const ANCHO = { pos: [0, 2.6, 11] as [number, number, number], mira: [0, 1.7, 0] as [number, number, number], fov: 36 };
const CERCA = { pos: [0, 3.0, 7] as [number, number, number], mira: [0, 2.3, 0] as [number, number, number], fov: 34 };
const OJOS = { pos: [0, 3.4, 8.5] as [number, number, number], mira: [0, 2.8, 0] as [number, number, number], fov: 36 };
const TOMAS: Toma[] = [
  { f: 0, ...ANCHO },
  { f: E.nadie, ...ANCHO },
  { f: E.bbc + 6, ...CERCA },
  { f: E.veneno + 6, pos: [1.6, 2.8, 8.5], mira: [0.8, 2.0, 0], fov: 34 },
  { f: E.palabra - 2, pos: [1.6, 2.8, 8.5], mira: [0.8, 2.0, 0], fov: 34 },
  { f: E.palabra + 10, ...ANCHO },
  { f: E.ojos - 2, ...ANCHO },
  { f: E.ojos + 12, ...OJOS },
  { f: E.ojo - 2, ...OJOS },
  { f: E.ojo + 12, ...ANCHO },
  { f: DURACION, pos: [0.3, 2.6, 10.5], mira: [0, 1.7, 0], fov: 36 },
];

const estado = (frame: number): EstadoCopas => ({
  frame,
  // choque al principio (gancho+36), se separan en "nadie", chocan otra vez en "bbc" y se quedan chocadas en "veneno"
  acerca: k(frame, [
    [0, 0.3],
    [E.gancho + 36, 1],
    [E.nadie - 2, 1],
    [E.nadie + 14, 0.2],
    [E.bbc + 10, 0.2],
    [E.bbc + 30, 1],
    [E.ojos - 4, 1],
    [E.ojos + 8, 0.8],
    [E.cta, 0.8],
    [E.cta + 12, 1],
  ]),
  chispa: Math.max(
    k(frame, [[E.gancho + 34, 0], [E.gancho + 36, 1], [E.gancho + 56, 0]]),
    k(frame, [[E.bbc + 28, 0], [E.bbc + 30, 1], [E.bbc + 50, 0]]),
    k(frame, [[E.cta + 10, 0], [E.cta + 12, 1], [E.cta + 34, 0]])
  ),
  veneno: k(frame, [[E.veneno + 4, 0], [E.veneno + 24, 1], [E.palabra - 6, 1], [E.palabra + 4, 0]]),
  ojos: k(frame, [[E.ojos, 0], [E.ojos + 12, 1], [E.ojo + 8, 1], [E.ojo + 18, 0]]),
  mira: k(frame, [[E.ojos + 6, 0], [E.ojos + 26, 1]]),
});

const DESTACAR = ["nadie", "BBC", "veneno", "infundada", "brindis", "ofrezco", "ojos", "confianza", "versiones", "Ojo:", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["mil quinientos veintisiete", "1527"],
];

const efectos: Efecto[] = [
  [E.gancho + 36, "ding", 0.5],
  [E.nadie, "scratch", 0.4],
  [E.bbc, "whoosh", 0.35],
  [E.bbc + 30, "ding", 0.5],
  [E.veneno + 6, "pop", 0.4],
  [E.palabra, "whoosh", 0.35],
  [E.carlos, "tic", 0.5],
  [E.ojos, "pop", 0.4],
  [E.ojo, "sello", 0.4],
  [E.cta + 12, "ding", 0.5],
];

export const BrindisCopas3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Copas e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.gancho + 6} hasta={E.nadie - 2} x={540} y={300}>
        Navidad · <span style={{ color: ACENTO }}>¡salud!</span>
      </Chip>
      <Chip desde={E.nadie + 4} hasta={E.bbc - 2} x={540} y={300}>
        Origen: <span style={{ color: ACENTO }}>nadie sabe</span>
      </Chip>
      <Chip desde={E.bbc + 4} hasta={E.veneno - 2} x={540} y={300}>
        BBC Mundo · <span style={{ color: ACENTO }}>2022</span>
      </Chip>
      <Chip desde={E.veneno + 6} hasta={E.palabra - 2} x={540} y={300} color="#ff5a4a">
        Veneno: <span style={{ color: "#ff8a7a" }}>infundada</span>
      </Chip>
      <Chip desde={E.palabra + 4} hasta={E.carlos - 2} x={540} y={300}>
        Brindis = <span style={{ color: ACENTO }}>"te lo ofrezco"</span>
      </Chip>
      <Chip desde={E.carlos + 4} hasta={E.ojos - 2} x={540} y={300}>
        Teoría: <span style={{ color: ACENTO }}>1527</span>
      </Chip>
      <Chip desde={E.ojos + 4} hasta={E.ojo - 2} x={540} y={300}>
        Mirar a los ojos = <span style={{ color: ACENTO }}>confianza</span>
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.pregunta - 2} x={540} y={300} color="#ff5a4a">
        No está documentado · <span style={{ color: "#ff8a7a" }}>versiones</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que brinda mirando el celular" />
      <Audio src={staticFile("083-brindis-copas/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.8, 11], mira: [0, 1.9, 0], fov: 36 }];
export const Portada083: React.FC = () => (
  <Portada arriba="¿por qué chocamos las copas?" grande="nadie lo sabe" sello="DATO" colorSello={C.azul} numero={83}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Copas e={estadoPortadaCopas()} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

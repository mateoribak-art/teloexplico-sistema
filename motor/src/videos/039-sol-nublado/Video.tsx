import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/039-sol-nublado/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { SolNube, type EstadoSolNube } from "../../kit3d/objetos/SolNube";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una persona de pie bajo una nube; el sol detrás. Rayos ultravioleta (violeta) que atraviesan la nube,
// la piel que se enrojece, rebote en el agua y una sombrilla (OMS "Radiación ultravioleta"; CDC; ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  oms: r.f(1),
  nubes: r.f(2),
  aviso: r.f(3),
  rebote: r.f(4),
  ojo: r.f(5),
  hoy: r.f(6),
  cta: r.f(7),
  fin: r.fin(7),
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

const ANCHO = 44;
const TOMAS: Toma[] = [
  { f: 0, pos: [-1.2, 3.4, 14], mira: [-1.2, 3.2, 0], fov: ANCHO },
  { f: E.oms, pos: [-1.2, 3.8, 12], mira: [-1.2, 3.8, 0], fov: 40 },
  { f: E.nubes, pos: [-2.0, 5.0, 9], mira: [-2.0, 4.8, 0.5], fov: 38 },
  { f: E.aviso, pos: [0.9, 2.4, 10], mira: [0.9, 2.3, 0], fov: 34 },
  { f: E.rebote, pos: [-0.8, 2.4, 13], mira: [-0.8, 2.2, 0.5], fov: 42 },
  { f: E.ojo, pos: [-1.2, 3.4, 14], mira: [-1.2, 3.2, 0], fov: ANCHO },
  { f: E.hoy, pos: [0.4, 3.4, 11], mira: [0.4, 3.0, 0], fov: 38 },
  { f: E.cta, pos: [-1.2, 3.4, 14], mira: [-1.2, 3.2, 0], fov: ANCHO },
  { f: DURACION, pos: [-1.2, 3.4, 14], mira: [-1.2, 3.2, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoSolNube => ({
  frame,
  nube: k(frame, [[E.gancho + 6, 0], [E.gancho + 26, 1]]),
  rayos: k(frame, [[E.oms + 4, 0], [E.oms + 20, 1], [E.ojo - 4, 1], [E.ojo + 10, 0.55], [E.hoy, 0.55], [E.fin, 1]]),
  quemado: k(frame, [[E.aviso + 6, 0], [E.aviso + 50, 0.7], [E.ojo, 0.7], [E.hoy + 10, 0.2], [E.hoy + 30, 0]]),
  rebote: k(frame, [[E.rebote + 4, 0], [E.rebote + 24, 1], [E.ojo - 6, 1], [E.ojo + 8, 0]]),
  sombrilla: k(frame, [[E.hoy + 20, 0], [E.hoy + 44, 1], [E.fin, 1]]),
});

const DESTACAR = ["nublado", "Error.", "alta", "nubes", "ve", "siente", "rebota", "Ojo:", "tres", "sombra", "Mandáselo"];
const CIFRAS: [string, string][] = [["tres", "3"]];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.oms, "whoosh", 0.35],
  [E.nubes, "scratch", 0.4],
  [E.aviso, "pop", 0.4],
  [E.rebote, "tic", 0.35],
  [E.ojo, "pop", 0.4],
  [E.hoy, "ding", 0.4],
  [E.cta, "pop", 0.4],
];

export const SolNublado3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <SolNube e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.oms} x={540} y={300}>
        “Está <span style={{ color: ACENTO }}>nublado</span>, no hace falta”
      </Chip>
      <Chip desde={E.oms} hasta={E.nubes} x={540} y={300}>
        OMS · Radiación ultravioleta · <span style={{ color: ACENTO }}>alta con nubes</span>
      </Chip>
      <Chip desde={E.nubes} hasta={E.aviso} x={540} y={300}>
        Con nubes sigue <span style={{ color: ACENTO }}>llegando</span>
      </Chip>
      <Chip desde={E.aviso} hasta={E.rebote} x={540} y={300}>
        No se ve, <span style={{ color: ACENTO }}>no se siente</span>
      </Chip>
      <Chip desde={E.rebote} hasta={E.ojo} x={540} y={300}>
        CDC · Rebota en <span style={{ color: ACENTO }}>agua, cemento, arena</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.hoy} x={540} y={300}>
        Índice UV <span style={{ color: ACENTO }}>3 o más</span> · OMS
      </Chip>
      <Chip desde={E.hoy} hasta={E.cta} x={540} y={300}>
        Guardalo: UV <span style={{ color: ACENTO }}>3 o más = protegete</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice: hoy está nublado" />
      <Audio src={staticFile("039-sol-nublado/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [-1.2, 3.6, 14], mira: [-1.2, 3.4, 0], fov: 44 }];
export const Portada039: React.FC = () => (
  <Portada arriba="protector solar" grande="nublado igual quema" sello="UV 3+" colorSello={C.azul} numero={39}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <SolNube e={{ frame: 40, nube: 1, rayos: 1, quemado: 0.6, rebote: 0, sombrilla: 0 }} />
    </Estudio>
  </Portada>
);

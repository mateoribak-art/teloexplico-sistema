import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-023-package-text/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Celular, type EstadoCelular } from "../../kit3d/objetos/Celular";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Package text scam (FTC, abril 2025): el celular parado con la alerta del "paquete trapado".
// Pantalla roja = el aviso falso; en la frase del link el celular se vuelve transparente (sitio imitación que pide datos);
// después el aviso se apaga (no tocar el link), la pantalla vuelve a azul y se reenvía al 7726.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  ftc: r.f(2),
  link: r.f(3),
  ojo: r.f(4),
  track: r.f(5),
  report: r.f(6),
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

const ANCHO = 34;
const TOMAS: Toma[] = [
  { f: 0, pos: [0, 2.0, 11], mira: [0, 1.3, 0], fov: ANCHO },
  { f: E.golpe, pos: [0, 1.6, 7.5], mira: [0, 1.3, 0], fov: 30 },
  { f: E.ftc + 10, pos: [-0.6, 1.8, 9.5], mira: [0, 1.3, 0], fov: ANCHO },
  { f: E.link - 4, pos: [0.5, 1.4, 6.8], mira: [0, 1.3, 0], fov: 30 },
  { f: E.ojo - 2, pos: [0, 1.9, 10.5], mira: [0, 1.3, 0], fov: ANCHO },
  { f: E.track, pos: [-0.4, 1.7, 8.5], mira: [0, 1.3, 0], fov: 32 },
  { f: E.report, pos: [0.4, 1.7, 8.0], mira: [0, 1.3, 0], fov: 32 },
  { f: E.cta, pos: [0, 2.0, 11.5], mira: [0, 1.3, 0], fov: ANCHO },
  { f: DURACION, pos: [0, 2.0, 11], mira: [0, 1.3, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoCelular => ({
  frame,
  alerta: k(frame, [[0, 0], [8, 1], [E.ojo, 1], [E.ojo + 10, 0.2], [E.track, 0], [E.fin, 0]]),
  arroz: 0,
  tacho: 0,
  granos: 0,
  cable: 1,
  inclinar: 0,
  gotas: 0,
  aire: 0,
  reloj: 0,
  minutos: 0,
  fantasma: k(frame, [[E.link - 2, 0], [E.link + 10, 1], [E.ojo - 4, 1], [E.ojo + 8, 0]]),
  secador: 0,
});

const DESTACAR = ["package", "scammer", "FTC", "look-alike", "Heads", "tracking", "report", "seven", "Send"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 8, "error", 0.4],
  [E.golpe, "scratch", 0.45],
  [E.ftc, "whoosh", 0.35],
  [E.link, "latigo", 0.4],
  [E.ojo, "sello", 0.5],
  [E.track, "pop", 0.4],
  [E.report, "tic", 0.4],
  [E.report + 40, "ding", 0.45],
  [E.cta, "whoosh", 0.35],
];

export const PackageTextEn023: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Celular e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.gancho + 14} hasta={E.golpe} x={540} y={300} color="#ff5a4a">
        "Package problem" · <span style={{ color: "#ff8a7a" }}>tap link</span>
      </Chip>
      <Chip desde={E.golpe + 4} hasta={E.ftc} x={540} y={300} color="#ff5a4a">
        That's what the <span style={{ color: "#ff8a7a" }}>scammer</span> wants
      </Chip>
      <Chip desde={E.ftc + 4} hasta={E.link} x={540} y={300}>
        FTC: <span style={{ color: ACENTO }}>unpaid postage · missed delivery</span>
      </Chip>
      <Chip desde={E.link + 4} hasta={E.ojo} x={540} y={300} color="#ff5a4a">
        Look-alike site <span style={{ color: "#ff8a7a" }}>asks for your info</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.track} x={540} y={300}>
        Real package? <span style={{ color: ACENTO }}>Skip the link</span>
      </Chip>
      <Chip desde={E.track + 4} hasta={E.report} x={540} y={300}>
        Check <span style={{ color: ACENTO }}>tracking at the store</span>
      </Chip>
      <Chip desde={E.report + 4} hasta={E.cta} x={540} y={300} color="#5fd2ff">
        Forward to <span style={{ color: "#5fd2ff" }}>7726</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who taps every link" />
      <Audio src={staticFile("en-023-package-text/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.8, 8.5], mira: [0, 1.3, 0], fov: 36 }];
export const PortadaEn023: React.FC = () => (
  <Portada arriba="package text?" grande="DON'T TAP" sello="FTC" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Celular
        e={{ frame: 0, alerta: 1, arroz: 0, tacho: 0, granos: 0, cable: 1, inclinar: 0, gotas: 0, aire: 0, reloj: 0, minutos: 0, fantasma: 0, secador: 0 }}
      />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

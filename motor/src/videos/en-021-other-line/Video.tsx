import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-021-other-line/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Filas, type EstadoFilas } from "../../kit3d/objetos/Filas";

// Adaptado de 030-fila-del-super. Un super visto desde arriba, tres cajas, el cliente dorado sos vos.
// Con una fila por caja, un cliente lento frena a los de atrás; con una fila única, ocupa una sola caja.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  propia: r.f(1),
  lento: r.w(1, "slow"),
  unica: r.f(2),
  otras: r.w(2, "others"),
  teoria: r.f(3),
  anio: r.w(3, "nineteen"),
  media: r.w(3, "average"),
  cabeza: r.f(4),
  ojo: r.f(5),
  cta: r.f(6),
  fin: r.fin(6),
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

const FOV = 40;
const TOMAS: Toma[] = [
  { f: 0, pos: [3.5, 11.5, 16.5], mira: [0, 0, 3.2], fov: FOV },
  { f: E.propia - 4, pos: [2.0, 11.0, 16.0], mira: [0, 0, 3.2], fov: FOV },
  { f: E.propia + 24, pos: [-1.2, 6.5, 10.0], mira: [-2.4, 0.4, 2.6], fov: 38 },
  { f: E.unica - 6, pos: [-1.0, 6.2, 9.6], mira: [-2.4, 0.4, 2.6], fov: 36 },
  { f: E.unica + 14, pos: [0, 14.5, 21], mira: [0, 0, 5.2], fov: FOV },
  { f: E.otras, pos: [-2.0, 14.0, 20], mira: [0, 0, 5.0], fov: FOV },
  { f: E.teoria + 6, pos: [1.5, 14.5, 21], mira: [0, 0, 5.2], fov: FOV },
  { f: E.cabeza - 4, pos: [3.0, 14.5, 21], mira: [0, 0, 5.2], fov: FOV },
  { f: E.cabeza + 20, pos: [-3.0, 13.5, 20], mira: [0, 0, 5.0], fov: FOV },
  { f: E.ojo - 2, pos: [-3.0, 13.5, 20], mira: [0, 0, 5.0], fov: FOV },
  { f: E.ojo + 16, pos: [3.0, 14.5, 21], mira: [0, 0, 5.2], fov: FOV },
  { f: DURACION, pos: [3.5, 14.5, 21], mira: [0, 0, 5.2], fov: FOV },
];

const estado = (frame: number): EstadoFilas => {
  const modo: 0 | 1 = frame < E.unica ? 0 : 1;
  const t =
    modo === 0
      ? k(frame, [
          [0, 0],
          [E.propia, 1],
          [E.unica - 4, 5],
        ])
      : k(frame, [
          [E.unica + 4, 0],
          [E.teoria, 3],
          [E.cabeza, 3.8],
          [E.cta, 4.4],
        ]);
  const aparece = k(frame, [
    [0, 0.2],
    [10, 1],
    [E.unica - 4, 1],
    [E.unica, 0.05],
    [E.unica + 8, 1],
  ]);
  const sombra = k(frame, [
    [E.propia + 10, 0],
    [E.lento, 1],
    [E.unica - 4, 1],
    [E.unica, 0],
    [E.unica + 8, 1],
    [E.otras + 24, 1],
    [E.teoria, 0],
  ]);
  return { t, modo, aparece, sombra, tu: true };
};

const DESTACAR = ["luck", "slow", "holds", "single", "Queueing", "1909", "shorter", "brain", "forget", "Heads", "average", "Send"];
const CIFRAS: [string, string][] = [["nineteen oh nine", "1909"]];

const Anio: React.FC = () => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [E.anio - 6, E.anio + 18], [1900, 1909], clamp));
  return (
    <Chip desde={E.anio - 6} hasta={E.media - 6} x={540} y={300}>
      <span style={{ color: ACENTO }}>{v}</span> · Copenhagen · Erlang
    </Chip>
  );
};

const efectos: Efecto[] = [
  [E.propia + 6, "whoosh", 0.35],
  [E.lento, "pop", 0.5],
  [E.unica, "whoosh", 0.4],
  [E.otras, "pop", 0.4],
  [E.anio - 6, "tic", 0.4],
  [E.anio + 18, "ding", 0.4],
  [E.media, "pop", 0.4],
  [E.cabeza, "whoosh", 0.35],
  [E.ojo, "sello", 0.5],
  [E.cta, "whoosh", 0.35],
];

export const OtherLineEn021: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Filas e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.gancho + 20} hasta={E.propia} x={540} y={300}>
        You: <span style={{ color: ACENTO }}>the gold one</span>
      </Chip>
      <Chip desde={E.lento + 6} hasta={E.unica - 2} x={540} y={300} color="#ff5a4a">
        1 slow holds up <span style={{ color: "#ff8a7a" }}>3</span>
      </Chip>
      <Chip desde={E.unica + 14} hasta={E.teoria} x={540} y={300} color="#5fd2ff">
        Single line: delays <span style={{ color: "#5fd2ff" }}>1</span>
      </Chip>
      <Anio />
      <Chip desde={E.media - 6} hasta={E.cabeza} x={540} y={410} color="#5fd2ff">
        Average wait: <span style={{ color: "#5fd2ff" }}>shorter or equal</span>
      </Chip>
      <Chip desde={E.cabeza + 6} hasta={E.ojo} x={540} y={300}>
        Probably: <span style={{ color: ACENTO }}>your memory</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.cta} x={540} y={300} color="#ff5a4a">
        It's the <span style={{ color: "#ff8a7a" }}>average</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who switches lines three times" />
      <Audio src={staticFile("en-021-other-line/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [3.0, 11.5, 16.0], mira: [0, 0, 3.4], fov: 42 }];
export const PortadaEn021: React.FC = () => (
  <Portada arriba="why is the other line faster?" grande="it's not just luck" sello="MATH" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Filas e={{ t: 1.5, modo: 0, aparece: 1, sombra: 1, tu: true }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

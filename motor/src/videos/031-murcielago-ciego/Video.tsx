import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/031-murcielago-ciego/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Murcielago, type EstadoMurcielago } from "../../kit3d/objetos/Murcielago";

// Ciencia: un murciélago en la noche. Ojos que brillan (ven), anillos de sonar que rebotan en una polilla,
// y al final la versión grande frugívora, sin sonar. Fondo oscuro, un acento (amarillo).
// Fuentes: Smithsonian NMNH, USGS, Nature Communications 2018 (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  ven: r.f(1),
  sonar: r.f(2),
  eco: r.f(3),
  caza: r.f(4),
  ojo: r.f(5),
  consejo: r.f(6),
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

const TOMAS: Toma[] = [
  { f: 0, pos: [1.0, 2.2, 9.5], mira: [1.0, 1.8, 0], fov: 34 },
  { f: E.ven, pos: [0.9, 2.0, 4.2], mira: [0.55, 1.9, 0], fov: 34 },
  { f: E.sonar, pos: [1.2, 2.4, 9.5], mira: [1.2, 1.8, 0], fov: 34 },
  { f: E.eco, pos: [1.2, 2.4, 9.5], mira: [1.2, 1.8, 0], fov: 34 },
  { f: E.caza, pos: [1.2, 3.0, 9.0], mira: [1.1, 1.8, 0], fov: 34 },
  { f: E.ojo, pos: [0.9, 2.4, 9.0], mira: [0.9, 1.8, 0], fov: 34 },
  { f: E.consejo, pos: [1.0, 2.2, 9.5], mira: [1.0, 1.8, 0], fov: 34 },
  { f: DURACION, pos: [1.0, 2.2, 9.5], mira: [1.0, 1.8, 0], fov: 34 },
];

const estado = (frame: number): EstadoMurcielago => ({
  frame,
  aparece: k(frame, [[0, 0.6], [10, 1]]),
  ojos: k(frame, [[E.ven - 4, 0], [E.ven + 10, 1], [E.sonar - 4, 1], [E.sonar + 10, 0.2], [E.ojo, 0.2], [E.ojo + 12, 1]]),
  sonar: frame >= E.sonar && frame < E.ojo ? E.sonar : -1,
  polilla: k(frame, [[E.eco, 0], [E.eco + 12, 1], [E.caza + 40, 1], [E.caza + 70, 1.5]]),
  grande: k(frame, [[E.ojo - 10, 0], [E.ojo + 14, 1]]),
  x: 0,
  y: 1.8,
});

const DESTACAR = ["ciego", "ven", "sonar", "ecolocalización", "eco", "Ojo:", "fruta", "vista", "olfato", "murciélago"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.ven, "whoosh", 0.35],
  [E.ven + 8, "ding", 0.45],
  [E.sonar, "whoosh", 0.35],
  [E.sonar + 10, "pop", 0.4],
  [E.eco, "whoosh", 0.35],
  [E.eco + 14, "pop", 0.4],
  [E.caza + 70, "ding", 0.45],
  [E.ojo, "whoosh", 0.35],
  [E.consejo, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const MurcielagoCiego3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Murcielago e={e} />
        <PisoSombra opacidad={0.0} />
      </Estudio>
      <Chip desde={0} hasta={E.ven} x={540} y={300}>
        "Ciego como un murciélago" · <span style={{ color: ACENTO }}>falso</span>
      </Chip>
      <Chip desde={E.ven} hasta={E.sonar} x={540} y={300}>
        <span style={{ color: ACENTO }}>Todas</span> las especies ven
      </Chip>
      <Chip desde={E.sonar} hasta={E.eco} x={540} y={300}>
        // SONAR · <span style={{ color: ACENTO }}>ecolocalización</span>
      </Chip>
      <Chip desde={E.eco} hasta={E.caza} x={540} y={300}>
        Grito + <span style={{ color: ACENTO }}>eco</span> = mapa
      </Chip>
      <Chip desde={E.caza} hasta={E.ojo} x={540} y={300}>
        Smithsonian · USGS · <span style={{ color: ACENTO }}>insectos de noche</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.consejo} x={540} y={300}>
        Frugívoros grandes: <span style={{ color: ACENTO }}>vista + olfato</span>
      </Chip>
      <Chip desde={E.consejo} hasta={E.cta} x={540} y={300}>
        Contale lo del <span style={{ color: ACENTO }}>sonar</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice ciego como un murciélago" />
      <Audio src={staticFile("031-murcielago-ciego/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [1.0, 2.2, 5.2], mira: [0.8, 1.8, 0], fov: 34 }];
export const Portada031: React.FC = () => (
  <Portada arriba="¿los murciélagos son ciegos?" grande="no: ven y tienen sonar" sello="MITO" colorSello={C.azul} numero={31}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Murcielago e={{ frame: 40, aparece: 1, ojos: 1, sonar: 10, polilla: 1, grande: 0, x: 0, y: 1.8 }} />
    </Estudio>
  </Portada>
);

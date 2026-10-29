import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-008-wash-chicken/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Pollo, PolloVacio, type EstadoPollo } from "../../kit3d/objetos/Pollo";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una pileta de cocina con la canilla abierta y una pechuga cruda con bacterias (ilustración: puntitos verdes).
// Mecanismo: el chorro hace saltar gotas con bacterias que se reparten por la pileta, la mesada y la ensaladera.
// Lo que las mata es la cocción: el pollo se dora, las bacterias desaparecen y la sonda marca 165 °F.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  agua: r.f(2),
  cdc: r.f(3),
  estudio: r.f(4),
  seis: r.f(5),
  coccion: r.f(6),
  ojo: r.f(7),
  consejo: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const TOMAS: Toma[] = [
  { f: 0, pos: [0.6, 2.8, 8.5], mira: [0.4, 0.5, 0], fov: 40 },
  { f: E.mito, pos: [0.2, 2.2, 6.5], mira: [0, 0.5, 0], fov: 38 },
  { f: E.agua, pos: [0.2, 2.0, 5.5], mira: [0, 0.5, 0], fov: 36 },
  { f: E.cdc, pos: [0.8, 3.4, 9.5], mira: [0.8, 0.2, 0], fov: 40 },
  { f: E.estudio, pos: [0.4, 3.6, 10.5], mira: [0.4, 0.2, 0], fov: 40 },
  { f: E.seis, pos: [0, 3.0, 7.5], mira: [0, 0.2, 0], fov: 38 },
  { f: E.coccion, pos: [0.2, 2.2, 6.0], mira: [0, 0.5, 0], fov: 36 },
  { f: E.ojo, pos: [0.2, 3.0, 7.5], mira: [0, 0.5, 0.2], fov: 38 },
  { f: E.consejo, pos: [0.4, 2.8, 8.5], mira: [0.3, 0.4, 0], fov: 40 },
  { f: E.cta, pos: [0.6, 2.8, 8.5], mira: [0.4, 0.5, 0], fov: 40 },
  { f: DURACION, pos: [0.6, 2.8, 8.5], mira: [0.4, 0.5, 0], fov: 40 },
];

const estado = (f: number): EstadoPollo => ({
  ...PolloVacio,
  frame: f,
  agua: k(f, 4, 14) * (1 - k(f, E.estudio, E.estudio + 10)),
  salpica: k(f, E.agua - 2, E.agua + 14) * (1 - k(f, E.coccion, E.coccion + 10)),
  bacPollo: k(f, 6, 24),
  bacRepartidas: k(f, E.agua, E.cdc + 40) * (1 - k(f, E.coccion + 20, E.coccion + 60)),
  contagio: k(f, E.cdc + 10, E.cdc + 40) * (1 - k(f, E.coccion + 20, E.coccion + 60)),
  cocido: k(f, E.coccion + 10, E.coccion + 70),
  termometro: k(f, E.coccion + 50, E.coccion + 80) * (1 - k(f, E.ojo, E.ojo + 10)),
  jabon: k(f, E.ojo + 6, E.ojo + 30) * (1 - k(f, E.cta, E.cta + 10)),
});

const DESTACAR = ["backwards", "spread", "bacteria", "germs", "three hundred", "six", "165", "Cooking", "soap", "Skip"];
const CIFRAS: [string, string][] = [
  ["three hundred", "300"],
  ["six in ten", "6 in 10"],
  ["one hundred sixty-five", "165°F"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mito, "scratch", 0.5],
  [E.mito + 6, "sello", 0.5],
  [E.agua, "whoosh", 0.35],
  [E.cdc, "whoosh", 0.4],
  [E.estudio, "ding", 0.4],
  [E.seis, "sello", 0.5],
  [E.coccion, "whoosh", 0.35],
  [E.coccion + 80, "ding", 0.45],
  [E.ojo, "pop", 0.4],
  [E.consejo, "tic", 0.4],
  [E.cta, "pop", 0.4],
];

export const WashChickenEn008: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Pollo e={estado(frame)} />
        <PisoSombra y={-0.3} />
      </Estudio>
      <Chip desde={E.gancho + 16} hasta={E.mito} x={540} y={330}>
        rinsing <span style={{ color: ACENTO }}>raw chicken</span>
      </Chip>
      <Chip desde={E.mito} hasta={E.agua} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>BACKWARDS</span>
      </Chip>
      <Chip desde={E.agua + 8} hasta={E.cdc} x={540} y={330}>
        water <span style={{ color: ACENTO }}>spreads</span> germs
      </Chip>
      <Chip desde={E.cdc + 8} hasta={E.estudio} x={540} y={330} color="#5fd2ff">
        sink · counter · <span style={{ color: "#5fd2ff" }}>other food</span>
      </Chip>
      <Chip desde={E.estudio + 6} hasta={E.seis} x={540} y={330}>
        USDA-backed study · <span style={{ color: ACENTO }}>~300 people</span>
      </Chip>
      <Chip desde={E.seis + 8} hasta={E.coccion} x={540} y={330} color="#ffb23d">
        <span style={{ color: ACENTO }}>6 in 10</span> had bacteria in the sink
      </Chip>
      <Chip desde={E.coccion + 80} hasta={E.ojo} x={540} y={330} color="#ffb23d">
        cook to <span style={{ color: ACENTO }}>165°F</span>
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.consejo} x={540} y={330} color="#ffb23d">
        wash <span style={{ color: ACENTO }}>your hands</span> · soap + water
      </Chip>
      <Chip desde={E.consejo + 4} hasta={E.cta} x={540} y={330}>
        skip the rinse, <span style={{ color: ACENTO }}>cook it</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who gives chicken a bath" />
      <Audio src={staticFile("en-008-wash-chicken/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.4, 2.6, 6.5], mira: [0.2, 0.5, 0], fov: 40 }];
export const PortadaEn008: React.FC = () => (
  <Portada arriba="rinse your raw chicken?" grande="that's backwards" sello="DON'T" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Pollo e={{ ...PolloVacio, frame: 40, agua: 1, salpica: 1, bacPollo: 1, bacRepartidas: 0.6 }} />
      <PisoSombra y={-0.3} opacidad={0.25} />
    </Estudio>
  </Portada>
);

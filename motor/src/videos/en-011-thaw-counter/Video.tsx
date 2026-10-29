import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-011-thaw-counter/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Descongelar, DescongelarVacio, type EstadoDescongelar } from "../../kit3d/objetos/Descongelar";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una mesada de cocina con un trozo de carne congelada en capas (se ve por dentro).
// Mecanismo: la capa de afuera se descongela y queda en la zona de peligro (40–140 °F) con bacterias (puntitos verdes)
// mientras el centro sigue duro. Después aparecen las tres formas seguras: heladera, agua fría y microondas.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  capa: r.f(2),
  zona: r.f(3),
  usda: r.f(4),
  heladera: r.f(5),
  agua: r.f(6),
  micro: r.f(7),
  ojo: r.f(8),
  consejo: r.f(9),
  cta: r.f(10),
  fin: r.fin(10),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const TOMAS: Toma[] = [
  { f: 0, pos: [0.6, 2.6, 8.5], mira: [0.2, 0.6, 0], fov: 40 },
  { f: E.mito, pos: [0.2, 2.2, 8.0], mira: [0, 0.6, 0], fov: 38 },
  { f: E.capa, pos: [0.2, 2.0, 7.0], mira: [0, 0.6, 0], fov: 36 },
  { f: E.zona, pos: [0.4, 2.4, 7.2], mira: [0, 0.6, 0.3], fov: 36 },
  { f: E.usda, pos: [0.4, 2.8, 9.0], mira: [0.2, 0.6, 0], fov: 40 },
  { f: E.heladera, pos: [-1.8, 2.6, 10.5], mira: [-1.8, 1.0, 0], fov: 40 },
  { f: E.agua, pos: [0.3, 3.2, 11.0], mira: [0.3, 0.6, 1.2], fov: 40 },
  { f: E.micro, pos: [1.8, 2.6, 10.5], mira: [1.8, 0.8, 0], fov: 40 },
  { f: E.ojo, pos: [0.2, 3.2, 10.5], mira: [0.2, 0.6, 0.4], fov: 42 },
  { f: E.consejo, pos: [-1.8, 2.4, 8.5], mira: [-1.6, 1.0, 0], fov: 40 },
  { f: E.cta, pos: [0.6, 2.6, 8.5], mira: [0.2, 0.6, 0], fov: 40 },
  { f: DURACION, pos: [0.6, 2.6, 8.5], mira: [0.2, 0.6, 0], fov: 40 },
];

const estado = (f: number): EstadoDescongelar => ({
  ...DescongelarVacio,
  frame: f,
  afuera: k(f, E.capa - 4, E.zona + 30) * (1 - k(f, E.heladera, E.heladera + 10) * 0.6),
  centro: k(f, E.zona + 10, E.usda + 40) * 0.25,
  bac: k(f, E.zona, E.zona + 30) * (1 - k(f, E.heladera + 4, E.heladera + 20)),
  mesada: 1,
  heladera: k(f, E.heladera - 2, E.heladera + 10),
  agua: k(f, E.agua - 2, E.agua + 10),
  micro: k(f, E.micro - 2, E.micro + 10),
});

const DESTACAR = ["backwards", "counter", "outside", "bacteria", "never", "fridge", "water", "microwave", "two hours", "tonight", "Send"];
const CIFRAS: [string, string][] = [
  ["one hundred forty degrees", "140°F"],
  ["one hundred forty", "140°F"],
  ["forty", "40°F"],
  ["thirty minutes", "30 min"],
  ["two hours", "2 hours"],
  ["one hour", "1 hour"],
  ["ninety degrees", "90°F"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mito, "scratch", 0.5],
  [E.mito + 6, "sello", 0.5],
  [E.capa, "whoosh", 0.35],
  [E.zona, "whoosh", 0.4],
  [E.usda, "ding", 0.4],
  [E.heladera, "pop", 0.4],
  [E.agua, "pop", 0.4],
  [E.micro, "pop", 0.4],
  [E.ojo, "whoosh", 0.35],
  [E.consejo, "tic", 0.4],
  [E.cta, "pop", 0.4],
];

export const ThawCounterEn011: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Descongelar e={estado(frame)} />
        <PisoSombra y={-0.25} />
      </Estudio>
      <Chip desde={E.gancho + 16} hasta={E.mito} x={540} y={330}>
        thawing on the <span style={{ color: ACENTO }}>counter</span>
      </Chip>
      <Chip desde={E.mito} hasta={E.capa} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>BACKWARDS</span>
      </Chip>
      <Chip desde={E.capa + 8} hasta={E.zona} x={540} y={330}>
        <span style={{ color: ACENTO }}>outside</span> thaws · inside still frozen
      </Chip>
      <Chip desde={E.zona + 8} hasta={E.usda} x={540} y={330} color="#ff5a4a">
        danger zone · <span style={{ color: "#ff8a7a" }}>40–140°F</span>
      </Chip>
      <Chip desde={E.usda + 6} hasta={E.heladera} x={540} y={330}>
        USDA: <span style={{ color: ACENTO }}>never</span> on the counter
      </Chip>
      <Chip desde={E.heladera + 6} hasta={E.agua} x={540} y={330} color="#5fd2ff">
        1 · <span style={{ color: "#5fd2ff" }}>fridge</span> · plan ahead
      </Chip>
      <Chip desde={E.agua + 6} hasta={E.micro} x={540} y={330} color="#5fd2ff">
        2 · <span style={{ color: "#5fd2ff" }}>cold water</span> · every 30 min
      </Chip>
      <Chip desde={E.micro + 6} hasta={E.ojo} x={540} y={330} color="#5fd2ff">
        3 · <span style={{ color: "#5fd2ff" }}>microwave</span> · cook right away
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.consejo} x={540} y={330} color="#ffb23d">
        out max <span style={{ color: ACENTO }}>2 hours</span> · 1 hour at 90°F+
      </Chip>
      <Chip desde={E.consejo + 4} hasta={E.cta} x={540} y={330}>
        tonight: freezer → <span style={{ color: ACENTO }}>fridge</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who leaves chicken out all day" />
      <Audio src={staticFile("en-011-thaw-counter/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.4, 2.4, 6.0], mira: [0.1, 0.6, 0], fov: 40 }];
export const PortadaEn011: React.FC = () => (
  <Portada arriba="thaw meat on the counter?" grande="that's backwards" sello="DON'T" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Descongelar e={{ ...DescongelarVacio, frame: 40, afuera: 1, centro: 0.2, bac: 1 }} />
      <PisoSombra y={-0.25} opacidad={0.25} />
    </Estudio>
  </Portada>
);

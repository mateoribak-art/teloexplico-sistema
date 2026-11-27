import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-058-refreeze-meat/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Descongelar, DescongelarVacio, type EstadoDescongelar } from "../../kit3d/objetos/Descongelar";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una mesada con la carne ya descongelada. Aparece la heladera (se vuelve a congelar cruda),
// después el agua fría y el microondas (primero cocinar) y, por último, las dos horas afuera (bacterias). USDA FSIS.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  heladera: r.f(2),
  agua: r.f(3),
  horas: r.f(4),
  ojo: r.f(5),
  pregunta: r.f(6),
  cta: r.f(7),
  fin: r.fin(7),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const TOMAS: Toma[] = [
  { f: 0, pos: [0.6, 2.6, 8.5], mira: [0.2, 0.6, 0], fov: 40 },
  { f: E.golpe, pos: [0.2, 2.2, 8.0], mira: [0, 0.6, 0], fov: 38 },
  { f: E.heladera, pos: [-1.8, 2.6, 10.5], mira: [-1.8, 1.0, 0], fov: 40 },
  { f: E.agua, pos: [0.4, 3.0, 12.0], mira: [0.4, 0.8, 1.0], fov: 42 },
  { f: E.horas, pos: [0.3, 2.6, 8.5], mira: [0.1, 0.6, 0], fov: 38 },
  { f: E.ojo, pos: [0.4, 2.8, 10.0], mira: [0.2, 0.6, 0], fov: 42 },
  { f: E.pregunta, pos: [0.6, 2.6, 8.5], mira: [0.2, 0.6, 0], fov: 40 },
  { f: DURACION, pos: [0.6, 2.6, 8.5], mira: [0.2, 0.6, 0], fov: 40 },
];

const estado = (f: number): EstadoDescongelar => ({
  ...DescongelarVacio,
  frame: f,
  afuera: 1,
  centro: 1,
  bac: k(f, E.horas, E.horas + 40) * (1 - k(f, E.ojo, E.ojo + 6)),
  mesada: 1,
  heladera: k(f, E.heladera - 2, E.heladera + 10),
  agua: k(f, E.agua - 2, E.agua + 10),
  micro: k(f, E.agua + 6, E.agua + 18),
  guardada: 0,
});

const DESTACAR = ["freeze", "again", "fridge", "raw", "Cook", "microwave", "two", "Toss", "Heads", "refreeze", "Save", "send"];
const CIFRAS: [string, string][] = [["two hours", "2 hours"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.golpe, "scratch", 0.5],
  [E.heladera, "pop", 0.4],
  [E.agua, "pop", 0.4],
  [E.agua + 20, "pop", 0.4],
  [E.horas, "scratch", 0.5],
  [E.horas + 8, "sello", 0.5],
  [E.ojo, "whoosh", 0.35],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const RefreezeEn058: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Descongelar e={estado(frame)} />
        <PisoSombra y={-0.25} />
      </Estudio>
      <Chip desde={0} hasta={E.golpe} x={540} y={330}>
        thawed too much — <span style={{ color: ACENTO }}>freeze it again?</span>
      </Chip>
      <Chip desde={E.golpe} hasta={E.heladera} x={540} y={330}>
        <span style={{ color: ACENTO }}>It depends</span> how you thawed it
      </Chip>
      <Chip desde={E.heladera + 4} hasta={E.agua} x={540} y={330} color="#5fd2ff">
        <span style={{ color: "#5fd2ff" }}>fridge thaw</span> · refreeze raw
      </Chip>
      <Chip desde={E.agua + 4} hasta={E.horas} x={540} y={330} color="#ffb23d">
        water or microwave · <span style={{ color: ACENTO }}>cook first</span>
      </Chip>
      <Chip desde={E.horas + 4} hasta={E.ojo} x={540} y={330} color="#ff5a4a">
        out over <span style={{ color: "#ff8a7a" }}>2 hours</span> = toss it
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.pregunta} x={540} y={330} color="#ffb23d">
        refrozen meat can be <span style={{ color: ACENTO }}>drier</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={330}>
        <span style={{ color: ACENTO }}>refreeze</span> it or cook it?
      </Chip>
      <Chip desde={E.cta} hasta={E.fin + 4} x={540} y={330}>
        SAVE: <span style={{ color: ACENTO }}>fridge = raw · water/micro = cook</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who thaws the whole bag every time" />
      <Audio src={staticFile("en-058-refreeze-meat/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.4, 2.4, 6.0], mira: [0.1, 0.6, 0], fov: 40 }];
export const PortadaEn058: React.FC = () => (
  <Portada arriba="Thawed too much meat?" grande="CAN YOU REFREEZE IT?" sello="SAVE THIS" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Descongelar e={{ ...DescongelarVacio, frame: 40, afuera: 1, centro: 1, heladera: 1 }} />
      <PisoSombra y={-0.25} opacidad={0.25} />
    </Estudio>
  </Portada>
);

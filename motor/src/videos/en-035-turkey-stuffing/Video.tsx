import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-035-turkey-stuffing/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { CenaPavo, type EstadoCenaPavo } from "../../kit3d/objetos/CenaPavo";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: la mesa de Thanksgiving (CenaPavo): pavo al centro y relleno a la izquierda.
// La cámara se acerca al relleno (165 °F en el centro, termómetro). USDA FSIS.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  usda: r.f(1),
  muslo: r.f(2),
  termo: r.f(3),
  seguir: r.f(4),
  ojo: r.f(5),
  pregunta: r.f(6),
  cta: r.f(7),
  fin: r.fin(7),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const TOMAS: Toma[] = [
  { f: 0, pos: [0.4, 2.6, 8.5], mira: [-0.4, 0.5, 0], fov: 40 },
  { f: E.usda, pos: [-1.4, 1.6, 6.0], mira: [-1.8, 0.3, 0.1], fov: 38 },
  { f: E.muslo, pos: [0.6, 2.0, 6.2], mira: [0, 0.5, 0], fov: 38 },
  { f: E.termo, pos: [-1.4, 1.5, 5.4], mira: [-1.9, 0.3, 0.1], fov: 36 },
  { f: E.seguir, pos: [-0.6, 2.0, 7.0], mira: [-0.8, 0.4, 0], fov: 40 },
  { f: E.ojo, pos: [-1.2, 2.4, 8.0], mira: [-1.4, 0.3, 0], fov: 40 },
  { f: E.pregunta, pos: [-1.2, 1.8, 6.4], mira: [-1.9, 0.3, 0.1], fov: 38 },
  { f: DURACION, pos: [0.4, 2.6, 8.5], mira: [-0.4, 0.5, 0], fov: 40 },
];

const estado = (f: number): EstadoCenaPavo => ({
  frame: f,
  pavo: k(f, 0, 8),
  pavoFoco: k(f, E.muslo - 2, E.muslo + 8) * (1 - k(f, E.termo - 2, E.termo + 6)),
  comida: k(f, 0, 10),
  comidaFoco: Math.max(k(f, E.usda - 2, E.usda + 8) * (1 - k(f, E.muslo - 2, E.muslo + 6)), k(f, E.termo - 2, E.termo + 8)),
  platos: 0,
  medidor: 0,
});

const DESTACAR = ["stuffing", "done", "thermometer", "center", "Heads", "separate", "Stuffing", "Save", "send"];
const CIFRAS: [string, string][] = [
  ["one hundred sixty-five degrees", "165 °F"],
  ["one sixty-five", "165"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.usda, "pop", 0.4],
  [E.usda + 20, "ding", 0.4],
  [E.muslo, "scratch", 0.45],
  [E.termo, "pop", 0.4],
  [E.seguir, "tic", 0.4],
  [E.ojo, "whoosh", 0.35],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const StuffingEn035: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <CenaPavo e={estado(frame)} />
        <PisoSombra y={-0.02} />
      </Estudio>
      <Chip desde={0} hasta={E.usda} x={540} y={330}>
        turkey done. <span style={{ color: ACENTO }}>stuffing?</span>
      </Chip>
      <Chip desde={E.usda} hasta={E.muslo} x={540} y={330}>
        stuffing in the bird: <span style={{ color: ACENTO }}>165 °F</span>
      </Chip>
      <Chip desde={E.muslo} hasta={E.termo} x={540} y={330} color="#ffb23d">
        thigh <span style={{ color: "#ffb23d" }}>done</span> ≠ center done
      </Chip>
      <Chip desde={E.termo} hasta={E.seguir} x={540} y={330} color="#5fd2ff">
        <span style={{ color: "#5fd2ff" }}>thermometer</span> in the center
      </Chip>
      <Chip desde={E.seguir} hasta={E.ojo} x={540} y={330}>
        not at <span style={{ color: ACENTO }}>165 °F</span>? keep cooking
      </Chip>
      <Chip desde={E.ojo} hasta={E.pregunta} x={540} y={330} color="#ffb23d">
        safest: bake it <span style={{ color: ACENTO }}>separately</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        stuffing <span style={{ color: ACENTO }}>or dressing?</span>
      </Chip>
      <Chip desde={E.cta} hasta={E.fin + 4} x={540} y={330}>
        SAVE: <span style={{ color: ACENTO }}>stuffing = 165 °F at the center</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who stuffs the bird and trusts the timer" />
      <Audio src={staticFile("en-035-turkey-stuffing/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [-0.6, 2.2, 6.4], mira: [-1.0, 0.4, 0], fov: 40 }];
export const PortadaEn035: React.FC = () => (
  <Portada arriba="Stuffed the turkey?" grande="165 °F AT THE CENTER" sello="SAVE THIS" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <CenaPavo e={{ frame: 40, pavo: 1, pavoFoco: 0, comida: 1, comidaFoco: 1, platos: 0, medidor: 0 }} />
      <PisoSombra y={-0.02} opacidad={0.25} />
    </Estudio>
  </Portada>
);

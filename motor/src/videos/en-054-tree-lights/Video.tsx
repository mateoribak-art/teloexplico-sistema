import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-054-tree-lights/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Arbol, type EstadoArbol } from "../../kit3d/objetos/Arbol";

// Mundo: un árbol de Navidad con luces. Con las luces prendidas toda la noche el árbol seco se prende fuego;
// el regado no. Luego agua en el balde y luces apagadas. Fuente: NIST (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  nist: r.f(2),
  agua: r.f(3),
  apagar: r.f(4),
  ojo: r.f(5),
  guardar: r.f(6),
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

const TOMAS: Toma[] = [
  { f: 0, pos: [2.4, 2.6, 6.2], mira: [0, 2.0, 0], fov: 38 },
  { f: E.golpe, pos: [1.8, 2.2, 5.6], mira: [0, 2.0, 0], fov: 36 },
  { f: E.nist, pos: [2.6, 2.4, 6.4], mira: [0, 2.0, 0], fov: 38 },
  { f: E.agua, pos: [1.6, 0.9, 3.6], mira: [0, 0.4, 0], fov: 34 },
  { f: E.apagar, pos: [2.4, 2.6, 6.2], mira: [0, 2.0, 0], fov: 38 },
  { f: E.guardar, pos: [2.2, 2.4, 6.0], mira: [0, 2.0, 0], fov: 38 },
  { f: E.cta + 18, pos: [2.4, 2.6, 6.2], mira: [0, 2.0, 0], fov: 38 },
  { f: DURACION, pos: [2.4, 2.6, 6.2], mira: [0, 2.0, 0], fov: 38 },
];

const estado = (frame: number): EstadoArbol => ({
  frame,
  luces: k(frame, [
    [0, 1],
    [E.apagar + 20, 1],
    [E.apagar + 30, 0],
    [E.ojo, 0],
    [E.ojo + 10, 0],
  ]),
  seco: k(frame, [
    [E.nist + 10, 0],
    [E.nist + 50, 1],
    [E.nist + 110, 1],
    [E.nist + 120, 0],
  ]),
  llama: k(frame, [
    [E.nist + 40, 0],
    [E.nist + 65, 1],
    [E.nist + 105, 1],
    [E.nist + 118, 0],
  ]),
  agua: k(frame, [
    [0, 0.1],
    [E.nist + 118, 0.1],
    [E.nist + 124, 1],
  ]),
});

const DESTACAR = ["all night", "Don't", "dry", "watered", "water", "off", "Heads", "Save", "Send"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 4, "pop", 0.4],
  [E.golpe, "error", 0.45],
  [E.nist + 60, "sello", 0.5],
  [E.nist + 124, "ding", 0.4],
  [E.agua, "tic", 0.4],
  [E.apagar + 20, "pop", 0.4],
  [E.ojo, "pop", 0.4],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
];

export const TreeLightsEn054: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Arbol e={estado(frame)} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={E.gancho + 6} hasta={E.golpe} x={540} y={330} color="#ff8a4a">
        lights on <span style={{ color: "#ffb37a" }}>all night</span>
      </Chip>
      <Chip desde={E.golpe} hasta={E.nist} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>fire risk</span>
      </Chip>
      <Chip desde={E.nist + 6} hasta={E.nist + 118} x={540} y={330}>
        <span style={{ color: ACENTO }}>NIST</span> test: dry tree
      </Chip>
      <Chip desde={E.nist + 124} hasta={E.agua} x={540} y={330}>
        watered tree: <span style={{ color: ACENTO }}>no ignition</span>
      </Chip>
      <Chip desde={E.agua} hasta={E.apagar} x={540} y={330}>
        check the <span style={{ color: ACENTO }}>water</span> daily
      </Chip>
      <Chip desde={E.apagar} hasta={E.ojo} x={540} y={330}>
        leaving or bed: <span style={{ color: ACENTO }}>lights off</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.guardar} x={540} y={330}>
        testing-lab <span style={{ color: ACENTO }}>label</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={300}>
        <span style={{ color: ACENTO }}>water</span> daily
      </Chip>
      <Chip desde={E.guardar + 10} hasta={E.pregunta} x={540} y={400}>
        <span style={{ color: ACENTO }}>lights off</span> when you leave or sleep
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        lit all night? <span style={{ color: "#5fd2ff" }}>yes / no</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who never turns the tree lights off" />
      <Audio src={staticFile("en-054-tree-lights/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [2.8, 2.6, 6.4], mira: [0, 1.7, 0], fov: 34 }];
export const PortadaEn054: React.FC = () => (
  <Portada arriba="tree lights all night?" grande="TURN THEM OFF" sello="NIST SAYS" colorSello={C.rojo} numero={54}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Arbol e={{ frame: 20, luces: 1, seco: 0.8, llama: 0.6, agua: 0.1 }} />
      <PisoSombra opacidad={0.22} />
    </Estudio>
  </Portada>
);

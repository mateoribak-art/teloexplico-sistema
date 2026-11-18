import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/053-cadenas-parana/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Obligado, type EstadoObligado } from "../../kit3d/objetos/Obligado";

// Día de la Soberanía (Vuelta de Obligado, 1845): un tramo del Paraná en estudio azul noche.
// Tres cadenas cruzan el río de orilla a orilla, colgadas de lanchones; cañones en la barranca.
// La flota anglofrancesa entra desde aguas abajo y al final rompe las cadenas y pasa igual.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  cerramos: r.f(1),
  cadenas1: r.w(1, "cadenas"),
  flota: r.f(2),
  parana: r.w(2, "Paraná"),
  angosta: r.f(3),
  setecientos: r.w(3, "setecientos"),
  cruzamos: r.f(4),
  tres: r.w(4, "tres"),
  barcos: r.w(4, "barcos"),
  canones: r.f(5),
  veinte: r.w(5, "veinte"),
  ojo: r.f(6),
  rompieron: r.w(6, "rompieron"),
  caro: r.f(7),
  soberania: r.f(8),
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

const TOMAS: Toma[] = [
  // gancho: plano general del río con las cadenas cruzando (la respuesta ya está a la vista)
  { f: 0, pos: [8.5, 5.6, 8.6], mira: [-0.3, 0.35, 0], fov: 42 },
  { f: E.cerramos - 4, pos: [7.6, 5.0, 8.2], mira: [-0.2, 0.4, 0], fov: 42 },
  // golpe "cerramos un río con cadenas": baja a las cadenas
  { f: E.cadenas1 + 8, pos: [3.3, 2.3, 5.2], mira: [0, 0.45, 0], fov: 36 },
  { f: E.flota - 2, pos: [3.0, 2.2, 5.0], mira: [0, 0.45, 0], fov: 36 },
  // 1845, la flota entra desde aguas abajo (la cámara mira a los barcos que llegan)
  { f: E.parana + 6, pos: [-6.8, 3.4, 7.2], mira: [-3.2, 0.7, 0], fov: 46 },
  { f: E.angosta - 2, pos: [-6.4, 3.4, 7.0], mira: [-3.0, 0.7, 0], fov: 46 },
  // el río se angosta: casi cenital para ver las dos orillas
  { f: E.angosta + 12, pos: [0.4, 7.8, 6.4], mira: [0, 0.1, 0], fov: 42 },
  { f: E.cruzamos - 2, pos: [0.4, 7.4, 6.2], mira: [0, 0.1, 0], fov: 42 },
  // tres cadenas / 24 barcos: primer plano de las cadenas y los lanchones
  { f: E.tres + 8, pos: [2.7, 1.7, 4.6], mira: [0.1, 0.45, 0], fov: 34 },
  { f: E.canones - 2, pos: [2.6, 1.7, 4.5], mira: [0.1, 0.45, 0], fov: 34 },
  // veinte cañones: sube a la barranca (plano abierto para ver varios cañones)
  { f: E.veinte + 8, pos: [3.8, 3.5, 7.6], mira: [0, 1.1, 2.8], fov: 46 },
  { f: E.ojo - 2, pos: [3.6, 3.4, 7.4], mira: [0, 1.1, 2.8], fov: 46 },
  // ojo: rompen las cadenas y pasan (bajo y a lo largo del río, sin el cañón tapando)
  { f: E.rompieron + 10, pos: [5.6, 2.1, 5.2], mira: [-1.2, 0.5, -0.4], fov: 44 },
  { f: E.caro, pos: [6.6, 2.7, 6.6], mira: [1.2, 0.5, 0], fov: 44 },
  // Día de la Soberanía: vuelve al plano general (rima con el gancho)
  { f: E.soberania + 10, pos: [8.0, 5.4, 8.5], mira: [-0.3, 0.4, 0], fov: 42 },
  { f: E.cta, pos: [8.4, 5.6, 8.6], mira: [-0.3, 0.35, 0], fov: 42 },
  { f: DURACION, pos: [8.6, 5.7, 8.7], mira: [-0.3, 0.35, 0], fov: 42 },
];

const estado = (frame: number): EstadoObligado => ({
  frame,
  cadenas: k(frame, [
    [0, 1],
  ]),
  canones: k(frame, [
    [E.canones - 8, 0],
    [E.veinte, 1],
  ]),
  flota: k(frame, [
    [E.flota, 0.12],
    [E.parana, 0.42],
    [E.cruzamos, 0.68],
    [E.ojo, 1],
  ]),
  rotas: k(frame, [
    [E.rompieron, 0],
    [E.rompieron + 16, 1],
  ]),
});

const DESTACAR = ["cadenas", "Paraná", "700", "3", "24", "cañones", "rompieron", "nuestro", "Soberanía", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["mil ochocientos cuarenta y cinco", "1845"],
  ["setecientos", "700"],
  ["tres", "3"],
  ["veinticuatro", "24"],
  ["veinte", "20"],
];

const efectos: Efecto[] = [
  [E.cerramos, "whoosh", 0.35],
  [E.cadenas1, "tic", 0.5],
  [E.flota, "whoosh", 0.35],
  [E.angosta, "whoosh", 0.35],
  [E.setecientos, "pop", 0.4],
  [E.cruzamos, "whoosh", 0.35],
  [E.tres, "tic", 0.5],
  [E.barcos, "pop", 0.4],
  [E.canones, "whoosh", 0.35],
  [E.veinte, "pop", 0.4],
  [E.rompieron, "sello", 0.7],
  [E.caro, "whoosh", 0.35],
  [E.soberania, "whoosh", 0.35],
  [E.cta, "whoosh", 0.35],
];

export const CadenasParana3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Obligado e={e} />
        <PisoSombra y={0} opacidad={0.22} />
      </Estudio>
      <Chip desde={E.setecientos} hasta={E.cruzamos} x={540} y={380}>
        El río: <span style={{ color: ACENTO }}>700 m</span>
      </Chip>
      <Chip desde={E.tres} hasta={E.canones} x={540} y={350}>
        <span style={{ color: ACENTO }}>3</span> cadenas de hierro
      </Chip>
      <Chip desde={E.barcos} hasta={E.canones} x={540} y={470} color="#5fd2ff">
        colgadas de <span style={{ color: "#5fd2ff" }}>24</span> barcos
      </Chip>
      <Chip desde={E.veinte} hasta={E.ojo} x={540} y={380} color="#ff8a4a">
        <span style={{ color: "#ff8a4a" }}>20</span> cañones en la barranca
      </Chip>
      <Chip desde={E.soberania + 6} hasta={E.cta + 4} x={540} y={360}>
        <span style={{ color: ACENTO }}>20 de noviembre</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que cree que es solo un día libre" />
      <Audio src={staticFile("053-cadenas-parana/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

// Portada: el molde de la grilla con el río y las cadenas 3D abajo.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [7.2, 4.8, 9.2], mira: [0, 2.0, 0], fov: 38 }];
export const Portada053: React.FC = () => (
  <Portada arriba="¿qué se festeja el 20 de noviembre?" grande="cerraron un río con cadenas" sello="HISTORIA" colorSello={C.azul} numero={53}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Obligado e={{ frame: 20, cadenas: 1, canones: 1, flota: 0.35, rotas: 0 }} />
      <PisoSombra opacidad={0.2} />
    </Estudio>
  </Portada>
);

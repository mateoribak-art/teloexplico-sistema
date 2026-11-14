import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/050-martes-13-no-viernes/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Calendario, portadaCal, type EstadoCal } from "../../kit3d/objetos/Calendario";

// Tema de actualidad (hoy es viernes 13): en los países anglosajones el día de mala suerte es el
// viernes 13; acá, en Argentina, es el martes 13. Giro verificado: la peli "Friday the 13th" (1980)
// se estrenó acá como "Martes 13". Escena: hojas de almanaque rojas en el estudio azul noche, la
// Última Cena (Judas, el trece), y el planeta Marte (el dios de la guerra que nombra al martes).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  par: r.w(1, "Acá"),
  peli: r.f(2),
  flip: r.w(2, "Martes"),
  cena: r.f(3),
  judas: r.w(3, "trece"),
  marte: r.f(4),
  refran: r.f(5),
  ojo: r.f(6),
  cierreF: r.f(7),
  fin: r.fin(7),
};
export const DURACION = E.fin + 6 + DUR_CIERRE_3D;

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
  // gancho: la hoja VIERNES 13, de frente, latiendo en rojo
  { f: 0, pos: [0, 1.5, 6.2], mira: [0, 1.5, 0], fov: 32 },
  { f: E.par - 6, pos: [0, 1.5, 5.6], mira: [0, 1.5, 0], fov: 32 },
  // par: EE.UU. (viernes, apagado) vs Argentina (martes, encendido): se abre el plano
  { f: E.par + 18, pos: [0, 1.5, 9.8], mira: [0, 1.5, 0], fov: 52 },
  { f: E.peli - 4, pos: [0, 1.5, 9.6], mira: [0, 1.5, 0], fov: 52 },
  // peli: primer plano de la hoja de la izquierda, que cambia VIERNES por MARTES
  { f: E.peli + 14, pos: [-1.5, 1.55, 4.6], mira: [-1.5, 1.5, 0], fov: 30 },
  { f: E.cena - 4, pos: [-1.5, 1.55, 4.5], mira: [-1.5, 1.5, 0], fov: 30 },
  // última cena: baja y se abre a la mesa de trece (centrada, entra toda la fila)
  { f: E.cena + 16, pos: [0, 1.75, 7.6], mira: [0, 1.05, 0], fov: 50 },
  { f: E.marte - 4, pos: [0.3, 1.7, 7.4], mira: [0, 1.05, 0], fov: 50 },
  // marte: sube al planeta rojo
  { f: E.marte + 16, pos: [0, 1.75, 6.0], mira: [0, 1.6, 0], fov: 34 },
  { f: E.refran - 4, pos: [0.3, 1.7, 5.8], mira: [0, 1.6, 0], fov: 34 },
  // refrán: vuelve a la hoja MARTES 13, centrada
  { f: E.refran + 14, pos: [0, 1.5, 5.8], mira: [0, 1.5, 0], fov: 32 },
  { f: E.ojo + 10, pos: [0, 1.5, 5.4], mira: [0, 1.5, 0], fov: 32 },
  // cierre: se queda en la hoja (rima con el gancho)
  { f: DURACION, pos: [0, 1.5, 5.8], mira: [0, 1.5, 0], fov: 32 },
];

const estado = (frame: number): EstadoCal => ({
  frame,
  vOp: k(frame, [
    [E.gancho, 0],
    [E.gancho + 10, 1],
    [E.cena - 6, 1],
    [E.cena + 4, 0],
  ]),
  vX: k(frame, [
    [E.gancho, 0],
    [E.par - 4, 0],
    [E.par + 18, -1.5],
  ]),
  vGlow: k(frame, [
    [E.gancho, 1],
    [E.par, 1],
    [E.par + 18, 0.45],
    [E.peli, 0.45],
    [E.peli + 12, 1],
    [E.cena - 6, 1],
    [E.cena, 0.3],
  ]),
  vTitulo: frame >= E.flip ? "MARTES" : "VIERNES",
  mOp: k(frame, [
    [E.par, 0],
    [E.par + 16, 1],
    [E.cena - 6, 1],
    [E.cena + 2, 0],
    [E.refran - 8, 0],
    [E.refran + 4, 1],
  ]),
  mX: k(frame, [
    [E.par, 1.5],
    [E.refran - 8, 1.5],
    [E.refran + 4, 0],
  ]),
  mGlow: k(frame, [
    [E.par, 0],
    [E.par + 16, 1],
    [E.cena - 6, 1],
    [E.cena, 0.3],
    [E.refran, 0.2],
    [E.refran + 10, 1],
  ]),
  mCalma: k(frame, [
    [E.ojo, 0],
    [E.ojo + 16, 1],
  ]),
  mesa: k(frame, [
    [E.cena, 0],
    [E.cena + 12, 1],
    [E.marte - 6, 1],
    [E.marte + 2, 0],
  ]),
  mesaLuz: k(frame, [
    [E.judas - 4, 0],
    [E.judas + 6, 1],
    [E.marte - 6, 1],
  ]),
  marte: k(frame, [
    [E.marte, 0],
    [E.marte + 12, 1],
    [E.refran - 6, 1],
    [E.refran, 0],
  ]),
});

const DESTACAR = ["Hollywood", "martes", "Martes", "Marte", "superstición", "relajá", "mandáselo", "13"];
const CIFRAS: [string, string][] = [["trece", "13"]];

const efectos: Efecto[] = [
  [E.par, "whoosh", 0.4],
  [E.peli, "whoosh", 0.4],
  [E.flip, "pop", 0.6],
  [E.cena, "whoosh", 0.4],
  [E.judas, "ding", 0.5],
  [E.marte, "whoosh", 0.4],
  [E.refran, "whoosh", 0.4],
  [E.ojo, "whoosh", 0.35],
];

export const Martes13NoViernes3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Calendario e={e} />
        <PisoSombra opacidad={0.28} />
      </Estudio>
      <Chip desde={E.par + 16} hasta={E.peli + 4} x={278} y={360} color="#9fb8ff">
        EE.UU.: <span style={{ color: "#9fb8ff" }}>viernes</span>
      </Chip>
      <Chip desde={E.par + 16} hasta={E.peli + 4} x={812} y={360} color="#ff5a4a">
        Argentina: <span style={{ color: "#ff8a7a" }}>martes</span>
      </Chip>
      <Chip desde={E.cena + 10} hasta={E.marte - 6} x={540} y={330} color="#ff5a4a">
        La Última Cena: <span style={{ color: "#ff8a7a" }}>trece a la mesa</span>
      </Chip>
      <Chip desde={E.marte + 10} hasta={E.refran - 6} x={540} y={330} color="#ff5a4a">
        Marte: <span style={{ color: "#ff8a7a" }}>el dios de la guerra</span>
      </Chip>
      <Chip desde={E.ojo + 10} hasta={E.cierreF} x={540} y={330} color="#5fd2ff">
        <span style={{ color: "#5fd2ff" }}>No hay pruebas</span> científicas
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 6} mandar="mandáselo al que no quiso salir de la cama" />
      <Audio src={staticFile("050-martes-13-no-viernes/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

// Portada: la hoja MARTES 13 encendida, de frente, con el molde parejo de la grilla.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.6, 5.6], mira: [0, 1.5, 0], fov: 32 }];
export const Portada050: React.FC = () => (
  <Portada arriba="¿el viernes 13 da mala suerte?" grande="es el martes 13" sello="DATO" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Calendario e={portadaCal()} />
      <PisoSombra opacidad={0.2} />
    </Estudio>
  </Portada>
);

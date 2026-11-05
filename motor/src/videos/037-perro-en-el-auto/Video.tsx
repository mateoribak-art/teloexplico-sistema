import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/037-perro-en-el-auto/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { AutoCalor, type EstadoAutoCalor } from "../../kit3d/objetos/AutoCalor";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un auto oscuro al sol, de costado, con un perro adentro y un termómetro grande al lado.
// La ventana entreabierta no frena la subida; el interior se pone rojo y el termómetro sube
// (Pediatrics 2005: ~1,8 °C cada 5 min, 80 % en la primera media hora, 47 °C con 22 afuera; ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  caliente: r.f(1),
  estudio: r.f(2),
  dos: r.f(3),
  fresco: r.f(4),
  ojo: r.f(5),
  hoy: r.f(6),
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

const ANCHO = 34;
const TOMAS: Toma[] = [
  { f: 0, pos: [1, 2.8, 20], mira: [1, 1.9, 0], fov: ANCHO },
  { f: E.caliente, pos: [-0.1, 2.2, 12.5], mira: [-0.1, 1.5, 0], fov: 32 },
  { f: E.estudio, pos: [1, 2.8, 20], mira: [1, 1.9, 0], fov: ANCHO },
  { f: E.dos, pos: [2.2, 2.6, 15], mira: [2.2, 2.0, 0], fov: 32 },
  { f: E.fresco, pos: [1, 2.8, 19], mira: [1, 1.9, 0], fov: ANCHO },
  { f: E.ojo, pos: [-0.1, 2.2, 12], mira: [-0.1, 1.5, 0], fov: 32 },
  { f: E.hoy, pos: [1, 2.8, 20], mira: [1, 1.8, 0], fov: ANCHO },
  { f: E.cta, pos: [1, 2.8, 21], mira: [1, 1.9, 0], fov: ANCHO },
  { f: DURACION, pos: [1, 2.8, 20], mira: [1, 1.9, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoAutoCalor => ({
  frame,
  sol: k(frame, [[0, 1]]),
  calor: k(frame, [[E.caliente - 10, 0.05], [E.dos + 30, 0.6], [E.fresco + 40, 1], [E.hoy - 6, 1], [E.hoy + 20, 0.2]]),
  ventana: k(frame, [[0, 1]]),
  perro: k(frame, [[0, 1]]),
  jadeo: k(frame, [[E.caliente, 0], [E.dos, 0.6], [E.fresco, 1], [E.hoy - 6, 1], [E.hoy + 10, 0]]),
  termo: k(frame, [[E.estudio, 0.05], [E.dos + 20, 0.5], [E.fresco + 20, 1], [E.hoy, 1], [E.hoy + 30, 0.1]]),
  termoOn: k(frame, [[E.estudio - 8, 0], [E.estudio + 8, 1], [E.fin, 1]]),
  puertaFuera: k(frame, [[E.hoy + 10, 0], [E.hoy + 70, 1]]),
});

const DESTACAR = ["ventana", "rapidísimo", "dos grados", "cuarenta y siete", "Ojo:", "golpe de calor", "llevalo", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["dos mil cinco", "2005"],
  ["entre veintidós y treinta y seis", "22 a 36"],
  ["veintidós", "22"],
  ["cuarenta y siete", "47"],
  ["cinco minutos", "5 min"],
  ["dos grados", "2 grados"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.caliente, "scratch", 0.4],
  [E.estudio, "pop", 0.4],
  [E.dos, "tic", 0.35],
  [E.fresco, "ding", 0.4],
  [E.ojo, "pop", 0.4],
  [E.hoy, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const PerroEnElAuto3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <AutoCalor e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.caliente} x={540} y={300}>
        Un <span style={{ color: ACENTO }}>minutito</span>…
      </Chip>
      <Chip desde={E.caliente} hasta={E.estudio} x={540} y={300}>
        Ventana abierta = <span style={{ color: ACENTO }}>no alcanza</span>
      </Chip>
      <Chip desde={E.estudio} hasta={E.dos} x={540} y={300}>
        Pediatrics · EE. UU. · <span style={{ color: ACENTO }}>2005</span>
      </Chip>
      <Chip desde={E.dos} hasta={E.fresco} x={540} y={300}>
        +<span style={{ color: ACENTO }}>2 °C</span> cada 5 min
      </Chip>
      <Chip desde={E.fresco} hasta={E.ojo} x={540} y={300}>
        22 °C afuera → <span style={{ color: ACENTO }}>47 °C</span> adentro
      </Chip>
      <Chip desde={E.ojo} hasta={E.hoy} x={540} y={300}>
        Perro adentro: <span style={{ color: ACENTO }}>golpe de calor</span>
      </Chip>
      <Chip desde={E.hoy} hasta={E.cta} x={540} y={300}>
        Guardalo: <span style={{ color: ACENTO }}>+2 °C / 5 min</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que lo deja un minutito en el auto" />
      <Audio src={staticFile("037-perro-en-el-auto/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [1, 2.8, 19], mira: [1, 1.9, 0], fov: 36 }];
export const Portada037: React.FC = () => (
  <Portada arriba="el perro en el auto" grande="un minutito no existe" sello="+2 °C / 5 MIN" colorSello={C.azul} numero={37}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <AutoCalor e={{ frame: 40, sol: 1, calor: 0.9, ventana: 1, perro: 1, jadeo: 1, termo: 0.9, termoOn: 1, puertaFuera: 0 }} />
    </Estudio>
  </Portada>
);

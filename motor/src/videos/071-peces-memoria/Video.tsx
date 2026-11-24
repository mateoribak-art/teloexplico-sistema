import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/071-peces-memoria/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Pecera, type EstadoPecera } from "../../kit3d/objetos/Pecera";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una pecera con un pez dorado. Arriba, una barrita roja corta (el mito: tres segundos) que se
// reemplaza por doce cubitos que se encienden (semanas o meses, Culum Brown, Macquarie). Después una red
// que pasa y los tabiques de un laberinto (estudios en peces dorados), y la comida que cae: el pez va a la esquina.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  brown: r.f(2),
  red: r.f(3),
  comida: r.f(4),
  ojo: r.f(5),
  consejo: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 0.6, 11.5], mira: [0, 0.6, 0], fov: 42 },
  { f: E.mito, pos: [-1.2, 1.4, 9.5], mira: [-1.4, 1.4, 0], fov: 42 },
  { f: E.brown, pos: [0, 1.2, 11.0], mira: [0, 1.0, 0], fov: 42 },
  { f: E.red, pos: [0.4, 0.4, 9.5], mira: [0.3, 0.3, 0], fov: 42 },
  { f: E.comida, pos: [1.6, 0.6, 9.0], mira: [1.6, 0.6, 0], fov: 42 },
  { f: E.ojo, pos: [0, 0.6, 11.5], mira: [0, 0.6, 0], fov: 42 },
  { f: E.consejo, pos: [1.2, 0.6, 9.5], mira: [1.2, 0.6, 0], fov: 42 },
  { f: E.pregunta, pos: [0, 0.6, 11.5], mira: [0, 0.6, 0], fov: 42 },
  { f: DURACION, pos: [0, 0.6, 11.5], mira: [0, 0.6, 0], fov: 42 },
];

const estado = (f: number): EstadoPecera => ({
  frame: f,
  tres: k(f, E.gancho + 40, E.gancho + 60) * (1 - k(f, E.brown, E.brown + 10)),
  reloj: k(f, E.brown + 10, E.brown + 110),
  red: k(f, E.red + 6, E.red + 70),
  laberinto: k(f, E.red + 80, E.red + 100) * (1 - k(f, E.comida, E.comida + 10)),
  comida: k(f, E.comida, E.comida + 20) * (1 - k(f, E.pregunta, E.pregunta + 10)),
  ir: k(f, E.comida + 20, E.comida + 60) * (1 - k(f, E.pregunta, E.pregunta + 20)),
});

const DESTACAR = ["mito", "semanas", "meses", "red", "laberintos", "comida", "Ojo:", "misma", "comentario", "mandáselo"];
const CIFRAS: [string, string][] = [["tres segundos", "3 segundos"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mito, "scratch", 0.5],
  [E.brown, "whoosh", 0.35],
  [E.brown + 110, "ding", 0.4],
  [E.red, "whoosh", 0.35],
  [E.comida, "pop", 0.4],
  [E.ojo, "tic", 0.4],
  [E.consejo, "tic", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const Pecera3D071: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Pecera e={estado(frame)} />
        <PisoSombra y={-1.65} />
      </Estudio>
      <Chip desde={0} hasta={E.mito} x={540} y={330}>
        ¿memoria de <span style={{ color: ACENTO }}>3 segundos</span>?
      </Chip>
      <Chip desde={E.mito} hasta={E.brown} x={540} y={330} color="#ff5a5a">
        <span style={{ color: "#ff5a5a" }}>MITO</span>
      </Chip>
      <Chip desde={E.brown} hasta={E.red} x={540} y={330} color="#5fd2ff">
        Culum Brown · Macquarie: <span style={{ color: "#5fd2ff" }}>semanas o meses</span>
      </Chip>
      <Chip desde={E.red} hasta={E.comida} x={540} y={330}>
        red y laberintos: <span style={{ color: ACENTO }}>lo repiten</span>
      </Chip>
      <Chip desde={E.comida} hasta={E.ojo} x={540} y={330} color="#ffb23d">
        la hora de la comida: <span style={{ color: "#ffb23d" }}>se anticipan</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.consejo} x={540} y={330} color="#ff5a5a">
        estudios en <span style={{ color: "#ff5a5a" }}>peces dorados</span>
      </Chip>
      <Chip desde={E.consejo} hasta={E.pregunta} x={540} y={330}>
        misma hora: <span style={{ color: ACENTO }}>¿se acerca antes?</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        ¿cómo se llamaba tu pez?
      </Chip>
      <Chip desde={E.cta} hasta={E.fin + 4} x={540} y={330}>
        GUARDALO: <span style={{ color: ACENTO }}>no son 3 segundos</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice que el pez se olvida de todo en tres segundos" />
      <Audio src={staticFile("071-peces-memoria/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 0.8, 10.5], mira: [0, 0.8, 0], fov: 42 }];
export const Portada071: React.FC = () => (
  <Portada arriba="tu pez no se olvida" grande="¿3 SEGUNDOS?" sello="MITO" colorSello={C.rojo} numero={71}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Pecera e={{ frame: 20, tres: 1, reloj: 0, red: 0, laberinto: 0, comida: 0, ir: 0 }} />
      <PisoSombra y={-1.65} opacidad={0.25} />
    </Estudio>
  </Portada>
);

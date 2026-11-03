import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/013-alcohol-calor/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { CalorCuerpo, type EstadoCalorCuerpo } from "../../kit3d/objetos/CalorCuerpo";

// Salud / cuerpo: una persona sin cara. Primero la sensación de calor (aro en el torso/cabeza),
// después las bolitas de calor que se van por la piel y la piel que se enfría (lo dice Sanidad de España).
// Fondo oscuro, un acento. Fuente: PNSD, Ministerio de Sanidad de España (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  sensacion: r.f(1),
  vasos: r.f(2),
  colorado: r.f(3),
  sanidad: r.f(4),
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
  { f: 0, pos: [0, 1.9, 8.5], mira: [0, 1.5, 0], fov: 34 },
  { f: E.sensacion, pos: [0, 2.0, 6.5], mira: [0, 1.7, 0], fov: 34 },
  { f: E.vasos, pos: [0.4, 1.9, 5.5], mira: [0, 1.8, 0], fov: 34 },
  { f: E.colorado, pos: [0, 2.4, 5.5], mira: [0, 2.2, 0], fov: 34 },
  { f: E.sanidad, pos: [0, 1.9, 7.5], mira: [0, 1.5, 0], fov: 34 },
  { f: E.ojo, pos: [0, 1.9, 8.0], mira: [0, 1.5, 0], fov: 34 },
  { f: E.consejo, pos: [0, 1.9, 8.0], mira: [0, 1.5, 0], fov: 34 },
  { f: DURACION, pos: [0, 1.9, 8.5], mira: [0, 1.5, 0], fov: 34 },
];

const estado = (frame: number): EstadoCalorCuerpo => ({
  frame,
  calor: k(frame, [[E.sanidad - 6, 0], [E.sanidad + 18, 1], [E.ojo, 1], [E.ojo + 10, 0.4]]),
  foco: k(frame, [[E.sensacion - 4, 0], [E.sensacion + 10, 1], [E.vasos, 0.6], [E.colorado + 10, 1], [E.sanidad, 0]]),
  gorro: 0,
  campera: k(frame, [[E.consejo - 4, 0], [E.consejo + 14, 1]]),
  frio: k(frame, [[E.sanidad, 0], [E.sanidad + 90, 1]]),
  pantalon: 0,
});

const DESTACAR = ["calor", "sensación", "vasos", "colorado", "Sanidad", "baja", "Ojo:", "abrigate", "fernet"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.sensacion, "whoosh", 0.35],
  [E.vasos, "whoosh", 0.35],
  [E.colorado + 4, "pop", 0.4],
  [E.sanidad, "whoosh", 0.35],
  [E.sanidad + 20, "ding", 0.45],
  [E.ojo, "pop", 0.4],
  [E.consejo, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const AlcoholCalor3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <CalorCuerpo e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.sensacion} x={540} y={300}>
        ¿Un traguito para <span style={{ color: ACENTO }}>entrar en calor</span>?
      </Chip>
      <Chip desde={E.sensacion} hasta={E.vasos} x={540} y={300}>
        Es una <span style={{ color: ACENTO }}>sensación</span>
      </Chip>
      <Chip desde={E.vasos} hasta={E.colorado} x={540} y={300}>
        Vasos de la piel <span style={{ color: ACENTO }}>dilatados</span>
      </Chip>
      <Chip desde={E.colorado} hasta={E.sanidad} x={540} y={300}>
        Te ponés <span style={{ color: ACENTO }}>colorado</span>
      </Chip>
      <Chip desde={E.sanidad} hasta={E.ojo} x={540} y={300}>
        Sanidad: <span style={{ color: ACENTO }}>temperatura interior baja</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.consejo} x={540} y={300}>
        El calor se siente, <span style={{ color: ACENTO }}>pero no sube</span>
      </Chip>
      <Chip desde={E.consejo} hasta={E.cta} x={540} y={300}>
        <span style={{ color: ACENTO }}>Abrigate</span> igual
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice que el fernet lo abriga" />
      <Audio src={staticFile("013-alcohol-calor/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.0, 6.0], mira: [0, 1.6, 0], fov: 34 }];
export const Portada013: React.FC = () => (
  <Portada arriba="¿el alcohol te da calor?" grande="es una sensación, no calienta" sello="MITO" colorSello={C.azul} numero={13}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <CalorCuerpo e={{ frame: 40, calor: 1, foco: 1, gorro: 0, campera: 0, frio: 0.5, pantalon: 0 }} />
    </Estudio>
  </Portada>
);

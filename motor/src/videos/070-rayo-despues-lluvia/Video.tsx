import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/070-rayo-despues-lluvia/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { RayoLluvia, type EstadoRayoLluvia } from "../../kit3d/objetos/RayoLluvia";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una tormenta que parece terminada. A la izquierda la nube con su lluvia; a la derecha una persona
// junto a una pileta con el cielo abierto. Un rayo sale de la nube, cruza el cielo limpio y cae sobre ella;
// una regla muestra la distancia (más de 16 km) y un reloj de 30 minutos se llena (y se reinicia si truena).
// NWS / NOAA: rayo a más de 10 millas de la lluvia; si oís un trueno estás al alcance; 30 minutos desde el último.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  rayo: r.f(1),
  km: r.f(2),
  trueno: r.f(3),
  regla: r.f(4),
  ojo: r.f(5),
  alarma: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const pico = (f: number, a: number) => Math.max(0, 1 - Math.abs(f - a) / 6);

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 1.8, 13.5], mira: [0, 1.5, 0], fov: 42 },
  { f: E.rayo, pos: [0.3, 1.9, 12.0], mira: [0, 1.7, 0], fov: 42 },
  { f: E.km, pos: [0, 1.4, 13.5], mira: [0, 1.3, 0], fov: 44 },
  { f: E.trueno, pos: [1.0, 1.4, 11.0], mira: [0.8, 1.3, 0], fov: 42 },
  { f: E.regla, pos: [0.8, 1.6, 12.0], mira: [0.6, 1.5, 0], fov: 42 },
  { f: E.ojo, pos: [-0.2, 1.8, 12.5], mira: [-0.2, 1.7, 0], fov: 42 },
  { f: E.alarma, pos: [0.8, 1.6, 12.0], mira: [0.6, 1.5, 0], fov: 42 },
  { f: E.pregunta, pos: [0, 1.8, 13.5], mira: [0, 1.5, 0], fov: 42 },
  { f: DURACION, pos: [0, 1.8, 13.5], mira: [0, 1.5, 0], fov: 42 },
];

const estado = (f: number): EstadoRayoLluvia => {
  const reloj30 =
    f < E.regla ? 0 : f < E.ojo + 8 ? 0.001 + 0.65 * k(f, E.regla + 8, E.ojo + 6) : k(f, E.ojo + 24, E.pregunta);
  const centelleo = 0.75 + 0.25 * Math.sin(f * 1.7);
  return {
    frame: f,
    lluvia: 1 - 0.5 * k(f, 0, E.rayo),
    sol: k(f, 6, E.rayo),
    regla: k(f, E.km, E.km + 22) * (1 - k(f, E.alarma, E.alarma + 10)),
    rayo: k(f, E.rayo + 4, E.rayo + 6) * (1 - k(f, E.km + 20, E.km + 30)) * centelleo,
    flash: Math.max(pico(f, E.trueno + 8), pico(f, E.ojo + 6)),
    reloj: reloj30,
    persona: k(f, E.trueno, E.trueno + 6) * (1 - k(f, E.regla, E.regla + 6)),
  };
};

const DESTACAR = ["rayo", "dieciséis", "trueno", "treinta", "Ojo:", "cero", "alarma", "Guardalo", "mandáselo", "esperás"];
const CIFRAS: [string, string][] = [
  ["dieciséis kilómetros", "16 km"],
  ["treinta minutos", "30 min"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.rayo + 4, "scratch", 0.5],
  [E.km, "whoosh", 0.35],
  [E.km + 22, "ding", 0.4],
  [E.trueno, "pop", 0.4],
  [E.regla, "tic", 0.4],
  [E.ojo + 6, "scratch", 0.45],
  [E.alarma, "tic", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const RayoLluvia3D070: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <RayoLluvia e={estado(frame)} />
        <PisoSombra y={-0.4} />
      </Estudio>
      <Chip desde={0} hasta={E.rayo} x={540} y={330}>
        dejó de llover: <span style={{ color: ACENTO }}>¿salís?</span>
      </Chip>
      <Chip desde={E.rayo} hasta={E.km} x={540} y={330} color="#ff5a5a">
        <span style={{ color: "#ff5a5a" }}>todavía</span> puede caer
      </Chip>
      <Chip desde={E.km} hasta={E.trueno} x={540} y={330} color="#5fd2ff">
        NWS / NOAA: <span style={{ color: "#5fd2ff" }}>más de 16 km</span>
      </Chip>
      <Chip desde={E.trueno} hasta={E.regla} x={540} y={330} color="#ffb23d">
        oís un trueno = <span style={{ color: "#ffb23d" }}>al alcance</span>
      </Chip>
      <Chip desde={E.regla} hasta={E.ojo} x={540} y={330}>
        desde el último trueno: <span style={{ color: ACENTO }}>30 min</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.alarma} x={540} y={330} color="#ff5a5a">
        vuelve a tronar: <span style={{ color: "#ff5a5a" }}>de cero</span>
      </Chip>
      <Chip desde={E.alarma} hasta={E.pregunta} x={540} y={330}>
        alarma de <span style={{ color: ACENTO }}>30 min</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        ¿cuánto esperás vos?
      </Chip>
      <Chip desde={E.cta} hasta={E.fin + 4} x={540} y={330}>
        GUARDALO: <span style={{ color: ACENTO }}>último trueno + 30 min</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que sale a la cancha apenas deja de llover" />
      <Audio src={staticFile("070-rayo-despues-lluvia/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.8, 12.0], mira: [0, 1.6, 0], fov: 42 }];
export const Portada070: React.FC = () => (
  <Portada arriba="dejó de llover" grande="¿YA SALÍS?" sello="OJO" colorSello={C.rojo} numero={70}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <RayoLluvia e={{ frame: 20, lluvia: 0.6, sol: 1, regla: 1, rayo: 1, flash: 0.4, reloj: 0, persona: 1 }} />
      <PisoSombra y={-0.4} opacidad={0.25} />
    </Estudio>
  </Portada>
);

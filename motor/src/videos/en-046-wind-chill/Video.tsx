import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-046-wind-chill/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Cano, type EstadoCano } from "../../kit3d/objetos/Cano";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un caño de cobre en una pared helada con copos que soplan (viento); el hielo NO avanza por el viento:
// el caño solo se enfría hasta la temperatura real del aire. Fuente: NWS, Wind Chill Chart (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  nada: r.f(1),
  nws: r.f(2),
  objetos: r.f(3),
  cifra: r.f(4),
  ojo: r.f(5),
  guardar: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const estado = (f: number): EstadoCano => ({
  frame: f * 2,
  hielo: interpolate(f, [E.nada, E.objetos, E.cifra], [0, 0.15, 0.15], clamp),
  gota: 0,
  calor: 0,
  frio: 1,
});

const VISTA: Toma = { f: 0, pos: [0, 2.0, 8.4], mira: [0, 1.0, 0], fov: 40 };
const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { f: E.nada, pos: [1.4, 1.4, 6.2], mira: [1.2, 0.9, 0], fov: 38 },
  { f: E.nws, pos: [0, 2.0, 8.0], mira: [0, 1.0, 0], fov: 40 },
  { f: E.objetos, pos: [-1.2, 1.5, 6.0], mira: [-1.0, 0.9, 0], fov: 38 },
  { f: E.cifra, pos: [0, 2.0, 8.4], mira: [0, 1.0, 0], fov: 40 },
  { f: E.ojo, pos: [0, 2.0, 7.4], mira: [0, 1.0, 0], fov: 40 },
  { f: E.guardar, pos: [0, 2.0, 8.4], mira: [0, 1.0, 0], fov: 40 },
  { f: DURACION, pos: [0, 2.0, 8.0], mira: [0, 1.0, 0], fov: 40 },
];

const DESTACAR = ["nineteen", "don't", "people", "animals", "never", "thirty", "Heads", "real", "Save", "Send"];
const CIFRAS: [string, string][] = [
  ["nineteen below", "-19°F"],
  ["thirty minutes", "30 min"],
  ["fifteen mile an hour", "15 mph"],
  ["zero degrees", "0°F"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "pop", 0.4],
  [E.nada, "scratch", 0.4],
  [E.nws, "sello", 0.5],
  [E.objetos, "whoosh", 0.35],
  [E.cifra, "tic", 0.35],
  [E.cifra + 60, "ding", 0.4],
  [E.ojo, "pop", 0.4],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
];

export const WindChillEn046: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Cano e={estado(frame)} />
        <PisoSombra y={-1.2} />
      </Estudio>
      <Chip desde={E.gancho + 6} hasta={E.nada} x={540} y={330}>
        feels like <span style={{ color: ACENTO }}>-19°F</span>
      </Chip>
      <Chip desde={E.nada} hasta={E.nws} x={540} y={330}>
        pipes &amp; car: <span style={{ color: ACENTO }}>no</span>
      </Chip>
      <Chip desde={E.nws + 6} hasta={E.objetos} x={540} y={330}>
        <span style={{ color: ACENTO }}>NWS</span>: people &amp; animals
      </Chip>
      <Chip desde={E.objetos} hasta={E.cifra} x={540} y={330}>
        never below the <span style={{ color: ACENTO }}>real</span> temp
      </Chip>
      <Chip desde={E.cifra} hasta={E.ojo} x={540} y={330}>
        0°F + 15 mph = <span style={{ color: ACENTO }}>-19°F</span>
      </Chip>
      <Chip desde={E.cifra + 40} hasta={E.ojo} x={540} y={430}>
        skin freezes in <span style={{ color: ACENTO }}>30 min</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.guardar} x={540} y={330} color="#ff5a4a">
        for you it's <span style={{ color: "#ff8a7a" }}>real</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={300}>
        wind chill = <span style={{ color: ACENTO }}>people + pets</span>
      </Chip>
      <Chip desde={E.guardar + 10} hasta={E.pregunta} x={540} y={400}>
        pipes &amp; cars = <span style={{ color: ACENTO }}>real temp</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        real or feels-like? <span style={{ color: "#5fd2ff" }}>one word</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who says the car is freezing because of the wind chill" />
      <Audio src={staticFile("en-046-wind-chill/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.0, 8.0], mira: [0, 1.0, 0], fov: 40 }];
export const PortadaEn046: React.FC = () => (
  <Portada arriba="feels like -19°F?" grande="PIPES DON'T FEEL IT" sello="NWS SAYS" colorSello={C.azul} numero={46}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Cano e={{ frame: 40, hielo: 0.15, gota: 0, calor: 0, frio: 1 }} />
    </Estudio>
  </Portada>
);

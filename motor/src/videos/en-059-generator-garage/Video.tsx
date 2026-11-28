import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-059-generator-garage/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Generador, GeneradorVacio, type EstadoGenerador } from "../../kit3d/objetos/Generador";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una casa con el garage abierto y un generador adentro. La nube de monóxido se acumula aunque la puerta esté abierta;
// el generador sale a 20 pies de la casa y se marca la zona prohibida (porche y carport). CPSC.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  vent: r.f(2),
  invisible: r.f(3),
  regla: r.f(4),
  porche: r.f(5),
  guardar: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const TOMAS: Toma[] = [
  { f: 0, pos: [-3.5, 2.4, 14.0], mira: [-3.5, 1.0, 0], fov: 40 },
  { f: E.golpe, pos: [-3.5, 2.0, 12.0], mira: [-3.5, 0.9, 0], fov: 38 },
  { f: E.vent, pos: [-3.5, 2.2, 14.5], mira: [-3.5, 1.2, 0], fov: 40 },
  { f: E.invisible, pos: [-3.5, 2.0, 12.5], mira: [-3.5, 1.0, 0], fov: 38 },
  { f: E.regla, pos: [1.8, 3.6, 22.0], mira: [1.8, 0.6, 0], fov: 42 },
  { f: E.porche, pos: [1.8, 3.8, 21.0], mira: [1.8, 0.3, 0], fov: 42 },
  { f: E.guardar, pos: [1.8, 3.6, 22.0], mira: [1.8, 0.6, 0], fov: 42 },
  { f: DURACION, pos: [1.8, 3.6, 22.0], mira: [1.8, 0.6, 0], fov: 42 },
];

const estado = (f: number): EstadoGenerador => ({
  ...GeneradorVacio,
  frame: f,
  co: k(f, E.vent, E.vent + 60),
  afuera: k(f, E.regla, E.regla + 40),
  regla: k(f, E.regla + 10, E.regla + 50),
  porche: k(f, E.porche, E.porche + 12) * (1 - k(f, E.guardar, E.guardar + 6)),
});

const DESTACAR = ["garage", "not", "safe", "carbon", "monoxide", "outside", "twenty", "feet", "porch", "carport", "Save", "Send"];
const CIFRAS: [string, string][] = [["twenty feet", "20 feet"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.golpe, "scratch", 0.5],
  [E.vent, "whoosh", 0.35],
  [E.invisible, "pop", 0.4],
  [E.regla, "whoosh", 0.35],
  [E.regla + 40, "sello", 0.5],
  [E.porche, "scratch", 0.5],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const GeneratorEn059: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Generador e={estado(frame)} />
        <PisoSombra y={-0.25} />
      </Estudio>
      <Chip desde={0} hasta={E.golpe} x={540} y={330}>
        generator in the garage, <span style={{ color: ACENTO }}>door open</span>
      </Chip>
      <Chip desde={E.golpe} hasta={E.vent} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>not safe</span>
      </Chip>
      <Chip desde={E.vent + 4} hasta={E.invisible} x={540} y={330} color="#ff5a4a">
        open door ≠ <span style={{ color: "#ff8a7a" }}>enough air</span>
      </Chip>
      <Chip desde={E.invisible + 4} hasta={E.regla} x={540} y={330} color="#ffb23d">
        carbon monoxide: <span style={{ color: ACENTO }}>no color, no smell</span>
      </Chip>
      <Chip desde={E.regla + 4} hasta={E.porche} x={540} y={330} color="#5fd2ff">
        outside only · <span style={{ color: "#5fd2ff" }}>20 feet</span> from the house
      </Chip>
      <Chip desde={E.porche + 4} hasta={E.guardar} x={540} y={330} color="#ff5a4a">
        not the porch · <span style={{ color: "#ff8a7a" }}>not the carport</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={330}>
        <span style={{ color: ACENTO }}>save this</span> for the next storm
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={330}>
        power out <span style={{ color: ACENTO }}>more than a day?</span> how long?
      </Chip>
      <Chip desde={E.cta} hasta={E.fin + 4} x={540} y={330}>
        SAVE: <span style={{ color: ACENTO }}>outside only · 20 feet</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who already owns a generator" />
      <Audio src={staticFile("en-059-generator-garage/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [-3.5, 2.4, 11.0], mira: [-3.5, 1.0, 0], fov: 42 }];
export const PortadaEn059: React.FC = () => (
  <Portada arriba="Power's out?" grande="NEVER IN THE GARAGE" sello="SAVE THIS" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Generador e={{ ...GeneradorVacio, frame: 40, co: 1 }} />
      <PisoSombra y={-0.25} opacidad={0.25} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-053-first-frost/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Planta, type EstadoPlanta } from "../../kit3d/objetos/Planta";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una planta en maceta con un termómetro; la temperatura baja a 36°F, aparece escarcha en las hojas
// (el aire cerca del suelo es más frío que el termómetro) y una sábana la cubre. Fuente: NWS (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  nada: r.f(1),
  nws: r.f(2),
  suelo: r.f(3),
  helada: r.f(4),
  cubrir: r.f(5),
  ojo: r.f(6),
  guardar: r.f(7),
  pregunta: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const estado = (f: number): EstadoPlanta => ({
  frame: f * 2,
  temp: interpolate(f, [E.gancho, E.nada, E.nws + 20], [0.55, 0.4, 0.2], clamp),
  helada: interpolate(f, [E.suelo, E.helada + 30], [0, 1], clamp),
  cubierta: interpolate(f, [E.cubrir, E.cubrir + 40], [0, 1], clamp),
});

const VISTA: Toma = { f: 0, pos: [0, 2.0, 8.2], mira: [0.4, 1.2, 0], fov: 40 };
const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { f: E.nada, pos: [1.6, 1.8, 6.0], mira: [1.6, 1.2, 0], fov: 38 },
  { f: E.nws, pos: [0.4, 2.0, 8.0], mira: [0.4, 1.2, 0], fov: 40 },
  { f: E.suelo, pos: [-0.6, 1.2, 5.6], mira: [-0.2, 0.9, 0], fov: 38 },
  { f: E.helada, pos: [-0.4, 1.8, 5.8], mira: [0, 1.3, 0], fov: 38 },
  { f: E.cubrir, pos: [0, 2.0, 8.0], mira: [0.2, 1.2, 0], fov: 40 },
  { f: E.ojo, pos: [0, 2.0, 7.4], mira: [0.2, 1.2, 0], fov: 40 },
  { f: E.guardar, pos: [0, 2.0, 8.2], mira: [0.4, 1.2, 0], fov: 40 },
  { f: DURACION, pos: [0, 2.0, 8.0], mira: [0.4, 1.2, 0], fov: 40 },
];

const DESTACAR = ["thirty-six", "colder", "frost", "Cover", "cover", "bedsheet", "sunset", "Heads", "tender", "Save", "Send"];
const CIFRAS: [string, string][] = [
  ["thirty-three and thirty-six degrees", "33–36°F"],
  ["thirty-six degrees", "36°F"],
  ["thirty-six or less", "36°F or less"],
  ["thirty-six", "36°F"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "pop", 0.4],
  [E.nada, "scratch", 0.4],
  [E.nws, "sello", 0.5],
  [E.suelo, "whoosh", 0.35],
  [E.helada, "tic", 0.35],
  [E.helada + 50, "ding", 0.4],
  [E.cubrir, "whoosh", 0.4],
  [E.ojo, "pop", 0.4],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
];

export const FirstFrostEn053: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Planta e={estado(frame)} />
        <PisoSombra y={-0.4} />
      </Estudio>
      <Chip desde={E.gancho + 6} hasta={E.nada} x={540} y={330}>
        tonight: <span style={{ color: ACENTO }}>36°F</span>
      </Chip>
      <Chip desde={E.nada} hasta={E.nws} x={540} y={330}>
        plants fine? <span style={{ color: ACENTO }}>not so fast</span>
      </Chip>
      <Chip desde={E.nws + 6} hasta={E.suelo} x={540} y={330}>
        <span style={{ color: ACENTO }}>NWS</span> frost advisory: 33–36°F
      </Chip>
      <Chip desde={E.suelo} hasta={E.helada} x={540} y={330}>
        ground air <span style={{ color: ACENTO }}>colder</span>
      </Chip>
      <Chip desde={E.helada} hasta={E.cubrir} x={540} y={330}>
        frost above <span style={{ color: ACENTO }}>freezing</span>
      </Chip>
      <Chip desde={E.cubrir} hasta={E.ojo} x={540} y={330}>
        bedsheet <span style={{ color: ACENTO }}>before sunset</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.guardar} x={540} y={330} color="#ff5a4a">
        hardy plants <span style={{ color: "#ff8a7a" }}>usually fine</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={300}>
        low <span style={{ color: ACENTO }}>36°F or less</span>
      </Chip>
      <Chip desde={E.guardar + 10} hasta={E.pregunta} x={540} y={400}>
        cover <span style={{ color: ACENTO }}>before sunset</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        cover or risk it? <span style={{ color: "#5fd2ff" }}>one word</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who leaves their basil outside until it's dead" />
      <Audio src={staticFile("en-053-first-frost/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.0, 8.0], mira: [0.4, 1.2, 0], fov: 40 }];
export const PortadaEn053: React.FC = () => (
  <Portada arriba="36°F tonight?" grande="FROST CAN STILL HIT" sello="NWS SAYS" colorSello={C.azul} numero={53}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Planta e={{ frame: 40, temp: 0.2, helada: 1, cubierta: 0 }} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-055-salt-ice/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { HieloSal, type EstadoHieloSal } from "../../kit3d/objetos/HieloSal";

// Mundo: un escalón con hielo, granos de sal y un termómetro del pavimento. Con frío moderado la sal derrite el hielo;
// cuando el termómetro baja de unos 15 °F el hielo queda y la sal se escarcha. Fuente: UMN LTAP (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  quince: r.f(2),
  pavimento: r.f(3),
  menos: r.f(4),
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
  { f: 0, pos: [1.0, 3.0, 9.0], mira: [0.5, 0.9, 0], fov: 38 },
  { f: E.golpe, pos: [0.6, 2.4, 7.0], mira: [0.2, 0.7, 0], fov: 38 },
  { f: E.quince, pos: [1.6, 2.8, 8.4], mira: [1.0, 1.0, 0], fov: 38 },
  { f: E.pavimento, pos: [1.2, 2.2, 6.8], mira: [0.8, 0.8, 0], fov: 38 },
  { f: E.menos, pos: [1.6, 2.8, 8.4], mira: [1.0, 1.0, 0], fov: 38 },
  { f: E.guardar, pos: [1.0, 3.0, 9.0], mira: [0.5, 0.9, 0], fov: 38 },
  { f: DURACION, pos: [1.0, 3.0, 9.0], mira: [0.5, 0.9, 0], fov: 38 },
];

const estado = (frame: number): EstadoHieloSal => ({
  frame,
  // temperatura: tibia al principio, baja bajo 15 °F en "quince", casi nada en "menos"
  temp: k(frame, [
    [0, 0.5],
    [E.golpe, 0.45],
    [E.quince, 0.45],
    [E.quince + 40, 0.22],
    [E.menos, 0.22],
    [E.menos + 40, 0.05],
  ]),
  sal: k(frame, [
    [0, 0],
    [E.gancho + 25, 1],
  ]),
  derrite: k(frame, [
    [0, 0],
    [E.quince, 0],
    [E.quince + 25, 0.8],
    [E.quince + 40, 0.8],
    [E.quince + 60, 0.1],
    [E.pavimento + 30, 0.1],
  ]),
  congela: k(frame, [
    [0, 0],
    [E.golpe + 10, 0.0],
    [E.golpe + 40, 0.5],
    [E.quince + 40, 0.5],
    [E.menos + 20, 1],
  ]),
});

const DESTACAR = ["limit", "fifteen", "pavement", "minus", "stops", "sparingly", "Heads", "Save", "Send"];
const CIFRAS: [string, string][] = [
  ["fifteen", "15"],
  ["minus six", "-6"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "pop", 0.4],
  [E.golpe, "error", 0.45],
  [E.quince + 40, "sello", 0.5],
  [E.pavimento, "pop", 0.4],
  [E.menos, "ding", 0.4],
  [E.ojo, "pop", 0.4],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
];

export const SaltIceEn055: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <HieloSal e={estado(frame)} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={E.gancho + 6} hasta={E.golpe} x={540} y={330} color="#5fd2ff">
        salt, but the ice <span style={{ color: "#9ad8ff" }}>stays</span>
      </Chip>
      <Chip desde={E.golpe} hasta={E.quince} x={540} y={330} color="#5fd2ff">
        salt has a <span style={{ color: ACENTO }}>limit</span>
      </Chip>
      <Chip desde={E.quince} hasta={E.pavimento} x={540} y={330}>
        rock salt works down to <span style={{ color: ACENTO }}>15°F</span>
      </Chip>
      <Chip desde={E.pavimento} hasta={E.menos} x={540} y={330}>
        <span style={{ color: ACENTO }}>pavement</span> temp, not air
      </Chip>
      <Chip desde={E.menos} hasta={E.ojo} x={540} y={330} color="#ff5a4a">
        below <span style={{ color: "#ff8a7a" }}>-6°F</span>: nothing
      </Chip>
      <Chip desde={E.ojo} hasta={E.guardar} x={540} y={330}>
        use <span style={{ color: ACENTO }}>sparingly</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={330}>
        rock salt: <span style={{ color: ACENTO }}>15°F</span> on the pavement
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        before the snow? <span style={{ color: "#5fd2ff" }}>or after?</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the neighbor who dumps a whole bag on the driveway" />
      <Audio src={staticFile("en-055-salt-ice/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [1.6, 2.2, 5.8], mira: [0.6, 0.9, 0], fov: 34 }];
export const PortadaEn055: React.FC = () => (
  <Portada arriba="salt on icy steps?" grande="TOO COLD" sello="15°F LIMIT" colorSello={C.rojo} numero={55}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <HieloSal e={{ frame: 20, temp: 0.2, sal: 1, derrite: 0.1, congela: 0.8 }} />
      <PisoSombra opacidad={0.22} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/048-golpe-de-calor/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { GolpeCalor, X_TERMO, type EstadoGolpeCalor } from "../../kit3d/objetos/GolpeCalor";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un corredor al sol, con un termómetro al lado que sube de 37 a 40 °C. Después aparecen
// las señales (confusión, piel roja y sin sudor), el teléfono de emergencias y el agua fría a la sombra.
// Fuentes: NHS y guía del Ministerio de Salud de la Nación (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  agua: r.f(1),
  min: r.f(2),
  emerg: r.f(3),
  senales: r.f(4),
  llamar: r.f(5),
  enfriar: r.f(6),
  ojo: r.f(7),
  regla: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
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

const ANCHO: Toma = { f: 0, pos: [0.4, 3.4, 12.5], mira: [0.4, 1.7, 0], fov: 34 };
const ancho = (f: number): Toma => ({ ...ANCHO, f });
const sostener = (tomas: Toma[]): Toma[] =>
  tomas.flatMap((t, i) => {
    const sig = tomas[i + 1];
    return sig && sig.f - t.f > 20 ? [t, { ...t, f: sig.f - 14 }] : [t];
  });
const TOMAS: Toma[] = sostener([
  ancho(0),
  { f: E.agua, pos: [0.3, 3.0, 9.5], mira: [0.3, 1.9, 0], fov: 32 },
  { f: E.min, pos: [X_TERMO - 1.0, 3.2, 12.5], mira: [X_TERMO - 1.0, 2.4, 0], fov: 34 },
  { f: E.emerg, pos: [0.4, 3.0, 10], mira: [0.4, 1.9, 0], fov: 32 },
  { f: E.senales, pos: [0, 3.0, 9.0], mira: [0, 2.0, 0], fov: 32 },
  { f: E.llamar, pos: [-1.0, 3.0, 10], mira: [-0.8, 1.8, 0], fov: 33 },
  { f: E.enfriar, pos: [0, 3.2, 9.5], mira: [0, 1.9, 0], fov: 33 },
  { f: E.ojo, pos: [0, 3.2, 11], mira: [0, 1.9, 0], fov: 34 },
  ancho(E.regla),
  { f: E.cta, pos: [0.4, 3.4, 13.5], mira: [0.4, 1.7, 0], fov: 34 },
  { f: DURACION, pos: [0.4, 3.4, 12.5], mira: [0.4, 1.7, 0], fov: 34 },
]);

const estado = (frame: number): EstadoGolpeCalor => ({
  frame,
  sol: k(frame, [[0, 0.6], [4, 1]]),
  corre: k(frame, [[0, 1], [E.emerg, 1], [E.senales, 0.2], [E.llamar, 0]]),
  temp: k(frame, [[E.agua, 0], [E.min, 0.2], [E.min + 80, 1]]),
  termoOn: k(frame, [[E.agua, 0], [E.agua + 12, 1]]),
  piel: k(frame, [[E.emerg, 0], [E.senales + 20, 1]]),
  confuso: k(frame, [[E.senales - 10, 0], [E.senales + 6, 1], [E.enfriar - 4, 1], [E.enfriar + 20, 0]]),
  llamar: k(frame, [[E.llamar - 4, 0], [E.llamar + 10, 1], [E.ojo + 30, 1], [E.regla, 0]]),
  sombra: k(frame, [[E.enfriar - 6, 0], [E.enfriar + 12, 1], [E.regla + 60, 1], [E.cta, 0]]),
  agua: k(frame, [[E.enfriar + 6, 0], [E.enfriar + 22, 1], [E.regla + 40, 1], [E.cta, 0]]),
});

const DESTACAR = ["agua", "Ministerio", "cuarenta", "emergencia", "confusión", "caliente", "sudor", "emergencias", "fría", "Ojo:", "Llamá", "regla", "Mandáselo"];
const CIFRAS: [string, string][] = [["cuarenta grados", "40 °C"], ["treinta y cinco grados", "35 °C"]];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.agua, "scratch", 0.4],
  [E.min, "tic", 0.4],
  [E.min + 80, "ding", 0.4],
  [E.emerg, "pop", 0.4],
  [E.senales, "tic", 0.4],
  [E.llamar, "ding", 0.4],
  [E.enfriar, "whoosh", 0.35],
  [E.ojo, "pop", 0.4],
  [E.regla, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const GolpeDeCalor3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <GolpeCalor e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.agua} x={540} y={300}>
        Salís a correr con <span style={{ color: ACENTO }}>35 °C</span>
      </Chip>
      <Chip desde={E.agua} hasta={E.min} x={540} y={300}>
        El agua sola <span style={{ color: ACENTO }}>no alcanza</span>
      </Chip>
      <Chip desde={E.min} hasta={E.emerg} x={540} y={300}>
        Min. de Salud · <span style={{ color: ACENTO }}>40 °C o más</span>
      </Chip>
      <Chip desde={E.emerg} hasta={E.senales} x={540} y={300}>
        NHS · Reino Unido · <span style={{ color: ACENTO }}>emergencia médica</span>
      </Chip>
      <Chip desde={E.senales} hasta={E.llamar} x={540} y={300}>
        Señal: <span style={{ color: ACENTO }}>confusión</span> + piel caliente y sin sudor
      </Chip>
      <Chip desde={E.llamar} hasta={E.enfriar} x={540} y={300}>
        1 · <span style={{ color: ACENTO }}>Llamá a emergencias</span>
      </Chip>
      <Chip desde={E.enfriar} hasta={E.ojo} x={540} y={300}>
        2 · Mojalo con <span style={{ color: ACENTO }}>agua fría</span> o abanicalo
      </Chip>
      <Chip desde={E.ojo} hasta={E.regla} x={540} y={300}>
        Ojo: no reemplaza a la <span style={{ color: ACENTO }}>ayuda médica</span>
      </Chip>
      <Chip desde={E.regla} hasta={E.cta} x={540} y={300}>
        Guardalo: <span style={{ color: ACENTO }}>emergencias + agua fría</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que sale a correr a la siesta" />
      <Audio src={staticFile("048-golpe-de-calor/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.5, 3.2, 11], mira: [0.5, 1.9, 0], fov: 36 }];
export const Portada048: React.FC = () => (
  <Portada arriba="35 grados" grande="golpe de calor" sello="40 °C = EMERGENCIA" colorSello={C.azul} numero={48}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <GolpeCalor e={{ frame: 40, sol: 1, corre: 0, temp: 1, termoOn: 1, piel: 1, confuso: 1, llamar: 0, sombra: 0, agua: 0 }} />
    </Estudio>
  </Portada>
);

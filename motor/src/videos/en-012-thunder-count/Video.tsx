import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-012-thunder-count/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Rayo, type EstadoRayo } from "../../kit3d/objetos/Rayo";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: corte lateral de una tormenta lejana. A la derecha la nube con su rayo, a la izquierda una casita con la ventana prendida
// y 3 millas de campo en el medio con postes de milla. Mecanismo: del rayo salen dos ondas; la de la luz llega casi al instante
// (amarilla) y la del sonido (celeste) tarda unos 5 segundos por milla. Cifras (5 s por milla, 15 s ≈ 3 millas) = las del guion.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  cuenta: r.f(1),
  luz: r.f(2),
  sonido: r.f(3),
  milla: r.f(4),
  quince: r.f(5),
  estima: r.f(6),
  ojo: r.f(7),
  hoy: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

// Cada "tiro": el rayo cae en f0; la luz llega en 3 frames; el sonido sale en fs y tarda `dur` frames hasta la casa.
type Tiro = { f0: number; fs: number; dur: number };
const TIROS: Tiro[] = [
  { f0: E.gancho + 10, fs: E.gancho + 10, dur: E.luz - E.gancho - 16 },
  { f0: E.luz + 6, fs: E.sonido + 4, dur: E.milla - E.sonido - 10 },
  { f0: E.quince + 4, fs: E.quince + 4, dur: E.estima - E.quince - 6 },
];

const tiroActual = (f: number): Tiro | null => {
  let t: Tiro | null = null;
  for (const x of TIROS) if (f >= x.f0) t = x;
  return t;
};

const estado = (f: number): EstadoRayo => {
  const t = tiroActual(f);
  if (!t) return { frame: f, rayo: 0, luz: 0, sonido: 0, postes: 0, casa: 0 };
  const sonido = f >= t.fs ? k(f, t.fs, t.fs + t.dur) : 0;
  const rayo = Math.max(0, 1 - (f - t.f0) / 14) * (((f - t.f0) % 4) < 3 ? 1 : 0.5);
  return {
    frame: f,
    rayo: f - t.f0 < 14 ? rayo : 0,
    luz: k(f, t.f0, t.f0 + 4) * (f - t.f0 < 12 ? 1 : 0),
    sonido: sonido > 0 && sonido < 1 ? sonido : sonido >= 1 ? 1 : 0,
    postes: k(f, E.milla, E.milla + 24),
    casa: sonido >= 1 ? Math.max(0, 1 - (f - (t.fs + t.dur)) / 10) : 0,
  };
};

// segundos que se cuentan: avanzan con la onda de sonido (0 a 15 en un tiro de 3 millas)
const segundos = (f: number): number => {
  const t = tiroActual(f);
  if (!t || f < t.fs) return 0;
  return Math.min(15, Math.floor(15 * k(f, t.fs, t.fs + t.dur)));
};

const VISTA: Toma = { f: 0, pos: [0, 2.0, 17], mira: [0, 1.7, 0], fov: 42 };
const NUBE: Toma = { f: 0, pos: [1.1, 2.6, 11], mira: [1.1, 2.0, 0], fov: 38 };
const CASA: Toma = { f: 0, pos: [-1.1, 1.6, 10], mira: [-1.1, 0.9, 0], fov: 38 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...NUBE, f: E.gancho + 6 },
  { ...VISTA, f: E.cuenta + 10 },
  { ...CASA, f: E.sonido },
  { ...VISTA, f: E.milla },
  { ...VISTA, f: E.quince },
  { ...CASA, f: E.estima },
  { ...VISTA, f: E.ojo },
  { ...VISTA, f: E.cta },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["flash", "seconds", "instantly", "slower", "five", "mile", "fifteen", "three", "estimate", "thunder", "indoors", "lightning"];
const CIFRAS: [string, string][] = [
  ["five", "5"],
  ["fifteen", "15"],
  ["three", "3"],
];

const efectos: Efecto[] = [
  [E.gancho + 10, "scratch", 0.5],
  [E.cuenta, "tic", 0.4],
  [E.luz + 6, "pop", 0.5],
  [E.sonido, "whoosh", 0.35],
  [E.milla, "ding", 0.4],
  [E.quince + 4, "pop", 0.5],
  [E.estima, "sello", 0.4],
  [E.ojo, "sello", 0.5],
  [E.hoy, "whoosh", 0.35],
  [E.cta, "pop", 0.4],
];

export const ThunderCountEn012: React.FC = () => {
  const frame = useCurrentFrame();
  const s = segundos(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Rayo e={estado(frame)} />
        <PisoSombra y={0.001} />
      </Estudio>
      <Chip desde={E.gancho + 14} hasta={E.luz} x={540} y={330} color="#5fd2ff">
        flash → thunder: <span style={{ color: ACENTO }}>{s} s</span>
      </Chip>
      <Chip desde={E.luz} hasta={E.sonido} x={540} y={330} color="#fff3a0">
        light: <span style={{ color: "#fff3a0" }}>almost instant</span>
      </Chip>
      <Chip desde={E.sonido} hasta={E.milla} x={540} y={330} color="#5fd2ff">
        sound: <span style={{ color: "#5fd2ff" }}>slow</span>
      </Chip>
      <Chip desde={E.milla} hasta={E.quince} x={540} y={330}>
        <span style={{ color: ACENTO }}>5 s</span> ≈ 1 mile
      </Chip>
      <Chip desde={E.quince} hasta={E.estima} x={540} y={330} color="#5fd2ff">
        <span style={{ color: ACENTO }}>{s} s</span> ≈ {(s / 5).toFixed(1).replace(".0", "")} mi
      </Chip>
      <Chip desde={E.estima} hasta={E.ojo} x={540} y={330}>
        an <span style={{ color: ACENTO }}>estimate</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.hoy} x={540} y={330} color="#ff5a4a">
        hear thunder = <span style={{ color: "#ff8a7a" }}>in range</span>
      </Chip>
      <Chip desde={E.hoy + 10} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        if it thunders: <span style={{ color: ACENTO }}>go indoors</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who steps outside to film the lightning" />
      <Audio src={staticFile("en-012-thunder-count/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.2, 15], mira: [0, 1.5, 0], fov: 42 }];
export const PortadaEn012: React.FC = () => (
  <Portada arriba="how far away is the storm?" grande="count the seconds" sello="TRICK" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Rayo e={{ frame: 40, rayo: 1, luz: 0.9, sonido: 0.55, postes: 1, casa: 0 }} />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

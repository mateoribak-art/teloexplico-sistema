import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-022-ears-pop/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Oido, type EstadoOido } from "../../kit3d/objetos/Oido";

// Corte esquemático del oído: conducto, tímpano, oído medio con aire y trompa de Eustaquio hasta la garganta.
// Al subir, el aire de más sale por la trompa (pop); al bajar, la trompa se aprieta y hay que abrirla (tragar, bostezar, chicle).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  aire: r.w(0, "trapped"),
  bolsillo: r.f(1),
  trompa: r.w(1, "eustachian"),
  sube: r.f(2),
  pop: r.w(2, "pop"),
  baja: r.f(3),
  cierra: r.w(3, "shut"),
  fuente: r.f(4),
  abre: r.w(4, "swallow"),
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
    const xx = xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x;
    xs.push(xx);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const VISTA = { pos: [0, 1.7, 9.8] as [number, number, number], mira: [0, 1.3, 0] as [number, number, number] };
const CERCA = { pos: [0.9, 1.0, 6.6] as [number, number, number], mira: [0.8, 0.9, 0] as [number, number, number] };
const TOMAS: Toma[] = [
  { f: 0, ...VISTA, fov: 40 },
  { f: E.bolsillo - 4, ...VISTA, fov: 40 },
  { f: E.bolsillo + 24, pos: [-0.4, 1.5, 6.8], mira: [-0.3, 1.5, 0], fov: 38 },
  { f: E.trompa - 6, pos: [-0.4, 1.5, 6.8], mira: [-0.3, 1.5, 0], fov: 38 },
  { f: E.trompa + 14, ...CERCA, fov: 38 },
  { f: E.sube + 40, ...CERCA, fov: 38 },
  { f: E.baja - 6, ...VISTA, fov: 40 },
  { f: E.baja + 20, pos: [0.4, 1.3, 7.4], mira: [0.2, 1.1, 0], fov: 38 },
  { f: E.fuente - 2, ...VISTA, fov: 40 },
  { f: E.ojo, ...CERCA, fov: 38 },
  { f: E.consejo + 6, ...VISTA, fov: 40 },
  { f: DURACION, pos: [0.3, 1.7, 9.4], mira: [0, 1.3, 0], fov: 40 },
];

const estado = (frame: number): EstadoOido => {
  const presion = k(frame, [
    [E.sube - 2, 0],
    [E.sube + 40, 1],
    [E.pop, 1],
    [E.pop + 12, 0],
    [E.baja + 4, 0],
    [E.cierra, -1],
    [E.abre, -1],
    [E.abre + 14, 0],
    [E.ojo, 0],
    [E.ojo + 20, -0.7],
    [E.consejo, -0.7],
    [E.consejo + 14, 0],
  ]);
  const abierta = k(frame, [
    [0, 0.6],
    [E.sube, 0.15],
    [E.pop - 4, 0.15],
    [E.pop, 1],
    [E.pop + 24, 1],
    [E.baja + 4, 1],
    [E.cierra, 0],
    [E.abre, 0],
    [E.abre + 10, 1],
    [E.ojo, 1],
    [E.ojo + 20, 0.25],
    [E.consejo, 0.25],
    [E.consejo + 14, 1],
  ]);
  const extra = k(frame, [
    [E.sube - 2, 0],
    [E.sube + 40, 1],
    [E.pop, 1],
    [E.pop + 30, 0],
  ]);
  const flujo = k(frame, [
    [E.pop - 1, 0],
    [E.pop, 0.02],
    [E.pop + 30, 1],
    [E.pop + 31, 0],
    [E.abre + 8, 0],
    [E.abre + 9, -0.02],
    [E.abre + 40, -1],
    [E.abre + 41, 0],
  ]);
  const popAnim = k(frame, [
    [E.pop - 1, 0],
    [E.pop + 16, 1],
    [E.pop + 17, 0],
    [E.abre + 10, 0],
    [E.abre + 26, 1],
    [E.abre + 27, 0],
  ]);
  const foco = k(frame, [
    [E.trompa - 4, 0],
    [E.trompa + 6, 1],
    [E.trompa + 40, 0],
    [E.cierra - 4, 0],
    [E.cierra, 1],
    [E.cierra + 30, 0],
    [E.ojo + 6, 0],
    [E.ojo + 16, 1],
    [E.ojo + 50, 0],
  ]);
  return { frame, presion, abierta, extra, flujo, pop: popAnim, piel: 1, foco };
};

const DESTACAR = ["height", "trapped", "eustachian", "pop", "shut", "swallow", "yawn", "gum", "Heads", "cold", "chewing", "Send"];

const efectos: Efecto[] = [
  [E.aire, "pop", 0.4],
  [E.trompa, "tic", 0.4],
  [E.sube + 6, "whoosh", 0.35],
  [E.pop, "pop", 0.6],
  [E.baja, "whoosh", 0.35],
  [E.cierra, "sello", 0.5],
  [E.abre, "pop", 0.5],
  [E.abre + 26, "ding", 0.4],
  [E.ojo, "sello", 0.5],
  [E.cta, "whoosh", 0.35],
];

export const EarsPopEn022: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Oido e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.gancho + 16} hasta={E.bolsillo} x={540} y={300}>
        Not the height: <span style={{ color: ACENTO }}>trapped air</span>
      </Chip>
      <Chip desde={E.trompa} hasta={E.sube} x={540} y={300} color="#5fd2ff">
        Eustachian <span style={{ color: "#5fd2ff" }}>tube</span>
      </Chip>
      <Chip desde={E.sube + 6} hasta={E.baja} x={540} y={300}>
        Climbing: air <span style={{ color: ACENTO }}>out</span>
      </Chip>
      <Chip desde={E.baja + 6} hasta={E.fuente} x={540} y={300} color="#ff5a4a">
        Descending: tube <span style={{ color: "#ff8a7a" }}>squeezed shut</span>
      </Chip>
      <Chip desde={E.abre} hasta={E.ojo} x={540} y={300} color="#5fd2ff">
        Swallow · yawn · <span style={{ color: "#5fd2ff" }}>chew</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.consejo} x={540} y={300} color="#ff5a4a">
        Cold: tube can <span style={{ color: "#ff8a7a" }}>swell</span>
      </Chip>
      <Chip desde={E.consejo + 4} hasta={E.cta} x={540} y={300}>
        Start before the <span style={{ color: ACENTO }}>descent</span>
      </Chip>
      <Chip desde={E.fuente + 36} hasta={E.ojo} x={540} y={410}>
        Cleveland Clinic
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={[]} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send it to the friend who sleeps through every landing" />
      <Audio src={staticFile("en-022-ears-pop/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.7, 8.0], mira: [0, 1.3, 0], fov: 40 }];
export const PortadaEn022: React.FC = () => (
  <Portada arriba="why do your ears pop?" grande="it's trapped air" sello="SCIENCE" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Oido e={{ frame: 0, presion: 0.8, abierta: 0.3, extra: 1, flujo: 0, pop: 0, piel: 1, foco: 0 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

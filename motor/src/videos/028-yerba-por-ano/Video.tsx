import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/028-yerba-por-ano/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Yerba, type EstadoYerba } from "../../kit3d/objetos/Yerba";

// Argentina en datos #2: un calendario de 12 meses (fichas) sobre el que van cayendo seis paquetes de yerba de un kilo,
// uno cada dos meses. Después aparecen personas (el promedio las cuenta a todas), diez casitas (nueve con yerba) y
// los paquetes extra de "vos". Fondo oscuro, un acento. Fuentes: Ministerio de Economía, INYM, BCR (ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  seis: r.w(0, "seis"),
  dos: r.f(1),
  todos: r.f(2),
  mini: r.f(3),
  hogares: r.f(4),
  vos: r.f(5),
  ojo: r.f(6),
  consejo: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
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
  { f: 0, pos: [3.5, 12.5, 12.5], mira: [0, 0, 0.2], fov: 34 },
  { f: E.dos, pos: [-2.4, 10.5, 10.5], mira: [0, 0.2, 0.2], fov: 34 },
  { f: E.todos - 4, pos: [0, 9.5, 10.5], mira: [0, 0.4, -1.2], fov: 34 },
  { f: E.mini, pos: [2.2, 11.5, 12.5], mira: [0, 0, 0], fov: 34 },
  { f: E.hogares, pos: [0, 10.5, 9.5], mira: [0, 0, 0], fov: 34 },
  { f: E.vos, pos: [-3.0, 11.5, 12.0], mira: [0, 0.2, 0.2], fov: 34 },
  { f: E.ojo, pos: [3.2, 12.5, 12.5], mira: [0, 0, 0.2], fov: 34 },
  { f: DURACION, pos: [3.5, 12.5, 12.5], mira: [0, 0, 0.2], fov: 34 },
];

const estado = (frame: number): EstadoYerba => {
  const entre = Math.max(8, Math.round((E.todos - E.seis - 14) / 6));
  return {
    frame,
    calendario: k(frame, [[4, 0], [20, 1]]),
    paquetes: k(frame, [[E.seis, 0], [E.seis + entre * 6, 6], [E.vos + 14, 6], [E.vos + 40, 9], [E.ojo, 9], [E.ojo + 10, 6]]),
    personas: k(frame, [[E.todos, 0], [E.todos + 14, 1], [E.mini - 6, 1], [E.mini + 4, 0]]),
    casas: 0,
    extra: k(frame, [[E.vos + 14, 0], [E.vos + 30, 1], [E.ojo, 1], [E.ojo + 10, 0]]),
  };
};

const DESTACAR = ["seis", "kilos", "meses", "bebés", "Agricultura", "Rosario", "mate", "promedio", "Ojo:", "paquetes", "termo"];
const CIFRAS: [string, string][] = [
  ["dos mil trece", "2013"],
  ["dos mil veintidós", "2022"],
  ["dos mil veintitrés", "2023"],
  ["seis kilos con once", "6,11 kilos"],
];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.dos, "whoosh", 0.35],
  [E.todos, "whoosh", 0.35],
  [E.todos + 14, "pop", 0.4],
  [E.mini, "whoosh", 0.35],
  [E.mini + 14, "ding", 0.4],
  [E.hogares, "whoosh", 0.35],
  [E.hogares + 22, "pop", 0.4],
  [E.vos, "whoosh", 0.4],
  [E.vos + 30, "ding", 0.45],
  [E.ojo, "whoosh", 0.35],
  [E.consejo, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

const Contador: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.min(6, Math.floor(k(frame, [[E.seis, 0], [E.dos + 30, 6.99]])));
  return (
    <Chip desde={E.dos} hasta={E.todos} x={540} y={300}>
      <span style={{ color: ACENTO }}>{n}</span> paquetes · 1 kg cada uno
    </Chip>
  );
};

export const YerbaPorAno3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={34}>
        <Camara tomas={TOMAS} />
        <Yerba e={e} />
        <PisoSombra opacidad={0.4} />
      </Estudio>
      <Chip desde={0} hasta={E.dos} x={540} y={300}>
        Por persona, por año: <span style={{ color: ACENTO }}>6 kg</span>
      </Chip>
      <Contador />
      <Chip desde={E.todos} hasta={E.mini} x={540} y={300}>
        El promedio cuenta <span style={{ color: ACENTO }}>a todos</span>
      </Chip>
      <Chip desde={E.mini} hasta={E.hogares} x={540} y={300}>
        Sec. de Agricultura · 2013–2022 · <span style={{ color: ACENTO }}>6,0 kg</span>
      </Chip>
      <Chip desde={E.hogares} hasta={E.vos} x={540} y={300}>
        Bolsa de Rosario · 2023 · <span style={{ color: ACENTO }}>6,11 kg</span>
      </Chip>
      <Chip desde={E.vos} hasta={E.ojo} x={540} y={300}>
Mate diario: <span style={{ color: ACENTO }}>probable, más</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.consejo} x={540} y={300} color="#5fd2ff">
        Cambia según <span style={{ color: "#5fd2ff" }}>año y población</span>
      </Chip>
      <Chip desde={E.consejo} hasta={E.cta} x={540} y={300}>
        ¿Cuántos <span style={{ color: ACENTO }}>paquetes</span> comprás vos?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que se toma un termo antes del almuerzo" />
      <Audio src={staticFile("028-yerba-por-ano/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [3.2, 12.0, 11.5], mira: [0, 0.2, 0.4], fov: 34 }];
export const Portada028: React.FC = () => (
  <Portada arriba="¿cuánta yerba toma un argentino?" grande="seis kilos por año" sello="DATO" colorSello={C.azul} numero={28}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Yerba e={{ frame: 0, calendario: 1, paquetes: 6, personas: 0, casas: 0, extra: 0 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

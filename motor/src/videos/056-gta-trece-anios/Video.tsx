import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/056-gta-trece-anios/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Espera13, portadaEspera, type EstadoEspera } from "../../kit3d/objetos/Espera13";

// "Trece años entre el GTA V (2013) y el GTA 6 (2026)": dos tarjetas de año y entre ellas trece bloques
// (los años) que se encienden de a uno; después las dos postergaciones (2025 → mayo 2026 → noviembre 2026).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  trece: r.f(1),
  fechas: r.f(2),
  seis: r.w(2, "seis"),
  larga: r.f(3),
  anunc: r.f(4),
  mayo: r.f(5),
  nov: r.f(6),
  cuenta: r.f(7),
  pregunta: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
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

const AMPLIA = { pos: [0, 2.0, 13.5] as [number, number, number], mira: [0, 1.6, 0] as [number, number, number], fov: 46 };

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 3.4, 11.5], mira: [0, 3.4, 0], fov: 46 },
  { f: E.trece, ...AMPLIA },
  { f: E.seis, pos: [0.2, 2.6, 12.4], mira: [0, 2.8, 0], fov: 46 },
  { f: E.larga, ...AMPLIA },
  { f: E.mayo, pos: [0, 1.4, 12.6], mira: [0, 1.0, 0], fov: 46 },
  { f: E.cuenta, ...AMPLIA },
  { f: E.cta, pos: [0, 2.2, 12.0], mira: [0, 2.2, 0], fov: 46 },
  { f: DURACION, pos: [0, 2.2, 11.8], mira: [0, 2.2, 0], fov: 46 },
];

const estado = (frame: number): EstadoEspera => ({
  frame,
  t13: k(frame, [[2, 0], [14, 1]]),
  t26: k(frame, [[E.seis - 2, 0], [E.seis + 8, 1]]),
  anios: k(frame, [[E.trece, 0], [E.fechas + 70, 13]]),
  ant: k(frame, [[E.anunc, 0], [E.anunc + 10, 1]]),
  p1: k(frame, [[E.mayo + 20, 0], [E.mayo + 30, 1]]),
  p2: k(frame, [[E.nov + 10, 0], [E.nov + 20, 1]]),
});

const DESTACAR = ["trece", "GTA", "2013", "2026", "2025", "postergaciones", "Mandáselo", "años"];
const CIFRAS: [string, string][] = [
  ["dos mil trece", "2013"],
  ["dos mil veinticinco", "2025"],
  ["dos mil veintiséis", "2026"],
  ["trece", "13"],
  ["seis", "6"],
  ["cinco", "5"],
  ["dos", "2"],
];

const efectos: Efecto[] = [
  [E.trece, "whoosh", 0.35],
  [E.fechas, "tic", 0.5],
  [E.seis, "ding", 0.5],
  [E.larga, "whoosh", 0.35],
  [E.anunc, "sello", 0.6],
  [E.mayo + 20, "sello", 0.6],
  [E.nov + 10, "sello", 0.7],
  [E.cuenta, "ding", 0.5],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const GtaTreceAnios3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Espera13 e={e} />
        <PisoSombra y={0} opacidad={0.22} />
      </Estudio>
      <Chip desde={E.gancho + 40} hasta={E.trece} x={540} y={640}>
        GTA <span style={{ color: ACENTO }}>V</span> · <span style={{ color: ACENTO }}>2013</span>
      </Chip>
      <Chip desde={E.trece + 4} hasta={E.larga} x={540} y={640}>
        <span style={{ color: ACENTO }}>13 años</span> de espera
      </Chip>
      <Chip desde={E.anunc + 4} hasta={E.mayo} x={540} y={640}>
        Rockstar · anunciado para <span style={{ color: ACENTO }}>2025</span>
      </Chip>
      <Chip desde={E.nov + 30} hasta={E.cuenta} x={540} y={640} color="#ff3a2e">
        <span style={{ color: "#ff3a2e" }}>2</span> postergaciones
      </Chip>
      <Chip desde={E.cuenta + 4} hasta={E.pregunta} x={540} y={640}>
        <span style={{ color: ACENTO }}>13 años</span> y 2 meses
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={640}>
        ¿Cuántos <span style={{ color: ACENTO }}>años</span> tenías?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que ya lo esperaba cuando salió el cinco" />
      <Audio src={staticFile("056-gta-trece-anios/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 3.4, 11.5], mira: [0, 3.0, 0], fov: 46 }];
export const Portada056: React.FC = () => (
  <Portada arriba="del GTA V al GTA 6" grande="trece años de espera" sello="DATO" colorSello={C.azul} numero={56}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Espera13 e={portadaEspera()} />
      <PisoSombra opacidad={0.2} />
    </Estudio>
  </Portada>
);

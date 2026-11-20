import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-031-gta-vice-city/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { ViceCity, type EstadoVice } from "../../kit3d/objetos/ViceCity";

// GTA 6: Vice City (versión de Miami según la prensa) en un atardecer neón; el puente Venetian
// Causeway se tiende de lado a lado; al final el sello "confirmed by Rockstar? NO".
// Adaptado de 055-gta-vice-city-miami.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  vice: r.f(1),
  miami: r.w(1, "Miami"),
  leonida: r.f(2),
  periodistas: r.f(3),
  puente: r.f(4),
  causeway: r.w(4, "Venetian"),
  ojo: r.f(5),
  oficial: r.f(6),
  calle: r.f(7),
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

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 2.6, 16.5], mira: [0, 2.3, 0], fov: 46 },
  { f: E.vice, pos: [0, 2.6, 15.5], mira: [0, 2.4, 0], fov: 46 },
  { f: E.puente, pos: [0, 2.2, 15.0], mira: [0, 2.0, 0], fov: 46 },
  { f: E.ojo, pos: [0, 2.6, 15.5], mira: [0, 2.4, 0], fov: 46 },
  { f: E.cta, pos: [0, 2.6, 16.0], mira: [0, 2.3, 0], fov: 46 },
  { f: DURACION, pos: [0, 2.6, 15.5], mira: [0, 2.3, 0], fov: 46 },
];

const estado = (frame: number): EstadoVice => ({
  frame,
  ciudad: k(frame, [[0, 0.5], [20, 1]]),
  miami: k(frame, [[E.vice + 4, 0], [E.vice + 14, 1], [E.leonida - 2, 1], [E.leonida + 6, 0]]),
  florida: k(frame, [[E.leonida + 2, 0], [E.leonida + 12, 1], [E.puente - 6, 1], [E.puente + 2, 0]]),
  puente: k(frame, [[E.puente - 4, 0], [E.puente + 40, 1]]),
  rotulo: k(frame, [[E.causeway, 0], [E.causeway + 10, 1], [E.ojo - 2, 1], [E.ojo + 6, 0]]),
  duda: k(frame, [[E.ojo + 4, 0], [E.ojo + 14, 1], [E.oficial + 20, 1], [E.oficial + 30, 0]]),
  en: true,
});

const DESTACAR = ["Miami", "Vice", "Leonida", "Florida", "Venetian", "Heads", "confirmed", "sunniest", "spot", "Send"];
const CIFRAS: [string, string][] = [["six", "6"]];

const efectos: Efecto[] = [
  [E.vice, "whoosh", 0.35],
  [E.miami, "pop", 0.4],
  [E.leonida, "whoosh", 0.35],
  [E.periodistas, "tic", 0.5],
  [E.causeway, "pop", 0.4],
  [E.ojo, "sello", 0.7],
  [E.oficial, "whoosh", 0.35],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const GtaViceCityEn031: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <ViceCity e={e} />
        <PisoSombra y={0} opacidad={0.15} />
      </Estudio>
      <Chip desde={E.gancho + 20} hasta={E.vice} x={540} y={360} color="#ff4fa3">
        <span style={{ color: "#ff4fa3" }}>GTA 6</span> · Vice City
      </Chip>
      <Chip desde={E.periodistas} hasta={E.puente} x={540} y={360}>
        Axios · Miami New Times · <span style={{ color: ACENTO }}>trailer</span>
      </Chip>
      <Chip desde={E.puente + 6} hasta={E.ojo} x={540} y={360} color="#ffd23a">
        <span style={{ color: "#ffd23a" }}>Venetian Causeway</span> in the game
      </Chip>
      <Chip desde={E.oficial + 4} hasta={E.calle} x={540} y={360}>
        official site: <span style={{ color: ACENTO }}>never names Miami</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={360} color="#ff4fa3">
        Which place did you <span style={{ color: "#ff4fa3" }}>spot</span>?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to your friend from Florida" />
      <Audio src={staticFile("en-031-gta-vice-city/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.8, 12.5], mira: [0, 2.2, 0], fov: 46 }];
export const PortadaEn031: React.FC = () => (
  <Portada arriba="GTA 6 and Miami" grande="spot this place?" sello="GTA 6" colorSello={C.azul} numero={31}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <ViceCity e={{ frame: 20, ciudad: 1, miami: 1, florida: 0, puente: 1, rotulo: 0, duda: 0, en: true }} />
      <PisoSombra opacidad={0.15} />
    </Estudio>
  </Portada>
);

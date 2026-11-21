import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/061-heladera-termometro/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { HeladeraTermo, portadaHeladeraTermo, type EstadoHeladeraTermo } from "../../kit3d/objetos/HeladeraTermo";

// Heladera abierta con un vaso de agua y un termómetro adentro. La columna arranca en 9 grados (roja),
// pasa el reloj de cinco a ocho horas con la puerta cerrada y baja a 4 (verde). Fuente: USDA FSIS y FDA.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  perilla: r.f(1),
  cuatro: r.f(2),
  freezer: r.f(3),
  prueba: r.f(4),
  espera: r.f(5),
  ajusta: r.f(6),
  ojo: r.f(7),
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

const AMPLIA = { pos: [0.4, 2.4, 11.5] as [number, number, number], mira: [0.4, 1.9, 0] as [number, number, number], fov: 46 };

const TOMAS: Toma[] = [
  { f: 0, pos: [0.7, 2.3, 9.0], mira: [0.7, 1.9, 0], fov: 46 },
  { f: E.perilla, pos: [0.7, 2.3, 8.0], mira: [0.7, 1.9, 0], fov: 46 },
  { f: E.cuatro, pos: [0.7, 2.3, 9.5], mira: [0.7, 2.0, 0], fov: 46 },
  { f: E.freezer, pos: [0.9, 3.0, 9.5], mira: [0.9, 2.7, 0], fov: 46 },
  { f: E.prueba, pos: [0.9, 2.2, 6.2], mira: [0.9, 2.2, 0], fov: 46 },
  { f: E.espera, ...AMPLIA },
  { f: E.ajusta, pos: [0.9, 2.2, 7.5], mira: [0.9, 2.1, 0], fov: 46 },
  { f: E.pregunta, ...AMPLIA },
  { f: DURACION, ...AMPLIA },
];

const estado = (frame: number): EstadoHeladeraTermo => ({
  frame,
  puerta: k(frame, [
    [0, 0.85],
    [E.espera - 4, 0.85],
    [E.espera + 14, 0],
    [E.ajusta + 30, 0],
    [E.ajusta + 50, 0.85],
  ]),
  fantasmaPuerta: k(frame, [[E.espera - 6, 0], [E.espera + 10, 0.85], [E.ajusta + 50, 0.85], [E.ajusta + 56, 0]]),
  vaso: k(frame, [[1, 0], [10, 1]]),
  temp: k(frame, [
    [0, 9],
    [E.espera + 14, 9],
    [E.ajusta - 4, 9],
    [E.ajusta + 6, 9],
    [E.ajusta + 50, 3.8],
  ]),
  reloj: k(frame, [[E.espera + 12, 0], [E.ajusta - 6, 1]]),
  relojOn: k(frame, [[E.espera + 8, 0], [E.espera + 20, 1], [E.ajusta + 14, 1], [E.ajusta + 28, 0]]),
  escarcha: k(frame, [[E.freezer - 4, 0.2], [E.freezer + 10, 1], [E.prueba, 0.4]]),
});

const DESTACAR = ["termómetro", "cuatro", "dieciocho", "vaso", "cinco", "ocho", "horas", "Mandáselo", "mediste"];
const CIFRAS: [string, string][] = [
  ["cuatro grados", "4 grados"],
  ["dieciocho bajo cero", "-18 bajo cero"],
  ["cinco a ocho", "5 a 8"],
  ["cuatro", "4"],
];

const efectos: Efecto[] = [
  [E.gancho, "tic", 0.5],
  [E.perilla, "sello", 0.5],
  [E.cuatro + 6, "ding", 0.55],
  [E.freezer + 4, "whoosh", 0.35],
  [E.prueba + 6, "pop", 0.45],
  [E.espera + 10, "tic", 0.5],
  [E.ajusta + 50, "ding", 0.5],
  [E.ojo, "sello", 0.5],
  [E.pregunta, "pop", 0.4],
  [E.cta, "whoosh", 0.35],
];

export const HeladeraTermometro3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  const grados = Math.round(e.temp * 10) / 10;
  const frio = e.temp <= 4.05;
  const col = frio ? "#38e08c" : "#ff6a4a";
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <HeladeraTermo e={e} />
        <PisoSombra y={0} opacidad={0.22} />
      </Estudio>
      <Chip desde={E.gancho + 24} hasta={E.perilla} x={540} y={640}>
        ¿cuántos <span style={{ color: ACENTO }}>grados</span> tiene?
      </Chip>
      <Chip desde={E.perilla + 18} hasta={E.cuatro} x={540} y={640}>
        la perilla no dice <span style={{ color: ACENTO }}>cuántos</span>
      </Chip>
      <Chip desde={E.cuatro + 8} hasta={E.freezer} x={540} y={640}>
        USDA · heladera <span style={{ color: ACENTO }}>4 °C o menos</span>
      </Chip>
      <Chip desde={E.freezer + 6} hasta={E.prueba} x={540} y={640} color="#58c8ff">
        freezer · <span style={{ color: "#58c8ff" }}>-18 °C</span>
      </Chip>
      <Chip desde={E.prueba + 14} hasta={E.espera} x={540} y={640}>
        termómetro en un <span style={{ color: ACENTO }}>vaso con agua</span>
      </Chip>
      <Chip desde={E.espera + 16} hasta={E.ajusta} x={540} y={640}>
        puerta cerrada · <span style={{ color: ACENTO }}>5 a 8 horas</span>
      </Chip>
      <Chip desde={E.ajusta + 2} hasta={E.ojo} x={540} y={640} color={col}>
        más de 4 = <span style={{ color: col }}>ajustá y medí de nuevo</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.pregunta} x={540} y={640}>
        no vale lo que marca <span style={{ color: ACENTO }}>al instante</span>
      </Chip>
      <Chip desde={E.pregunta + 4} hasta={E.cta} x={540} y={640}>
        ¿en cuántos <span style={{ color: ACENTO }}>grados</span> la tenés?
      </Chip>
      {e.vaso > 0.5 && frame < E.pregunta && (
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 330,
            padding: "14px 30px",
            borderRadius: 24,
            background: "rgba(10,16,32,0.8)",
            border: `4px solid ${col}`,
            color: col,
            fontFamily: "monospace",
            fontWeight: 900,
            fontSize: 84,
            opacity: e.vaso,
          }}
        >
          {grados.toFixed(1).replace(".", ",")} °C
        </div>
      )}
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice que su heladera enfría bien" />
      <Audio src={staticFile("061-heladera-termometro/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.5, 2.5, 10.5], mira: [0.5, 1.9, 0], fov: 46 }];
export const Portada061: React.FC = () => (
  <Portada arriba="tu heladera" grande="¿cuántos grados?" sello="nunca la mediste" colorSello={C.azul} numero={61}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <HeladeraTermo e={portadaHeladeraTermo()} />
      <PisoSombra opacidad={0.2} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/041-celular-arroz-v2/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Celular, type EstadoCelular } from "../../kit3d/objetos/Celular";

// 3D (rehecho del 014, guion corto): un celular parado con el aviso de líquido, un tazón de arroz tachado
// (Apple: partículas de arroz pueden dañarlo) y los pasos de Apple: desenchufar, golpear despacito con el conector
// hacia abajo, lugar seco con aire (sin secador), esperar treinta minutos. Solo cifras de Apple Support (chequeo.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  textual: r.f(1),
  motivo: r.f(2),
  uno: r.f(3),
  dos: r.f(4),
  tres: r.f(5),
  treinta: r.f(6),
  ojo: r.f(7),
  guardar: r.f(8),
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

const ANCHO: Toma = { f: 0, pos: [0, 2.0, 15], mira: [0.4, 1.7, 0], fov: 40 };
const TOMAS: Toma[] = [
  { ...ANCHO, f: 0 },
  { f: E.textual, pos: [0.5, 2.0, 11], mira: [1.0, 1.6, 0], fov: 40 },
  { f: E.motivo, pos: [0.3, 0.9, 6.5], mira: [0, 0.8, 0], fov: 40 },
  { f: E.uno, pos: [-0.6, 0.9, 8], mira: [-0.5, 0.9, 0], fov: 40 },
  { f: E.dos, pos: [0, 1.4, 8.5], mira: [0, 0.9, 0], fov: 40 },
  { f: E.tres, pos: [-0.8, 2.0, 12], mira: [-0.8, 1.9, 0], fov: 40 },
  { f: E.treinta, pos: [-1.4, 2.1, 10], mira: [-1.4, 1.9, 0], fov: 40 },
  { ...ANCHO, f: E.ojo },
  { ...ANCHO, f: DURACION },
];

const estado = (frame: number): EstadoCelular => ({
  frame,
  alerta: k(frame, [[0, 0], [10, 1], [E.treinta + 20, 1], [E.treinta + 60, 0.2]]),
  arroz: k(frame, [[E.gancho + 40, 0], [E.gancho + 58, 1], [E.cta + 30, 1]]),
  tacho: k(frame, [[E.textual - 1, 0], [E.textual + 8, 1], [E.uno - 6, 1], [E.uno + 2, 0]]),
  granos: k(frame, [[E.motivo - 1, 0], [E.motivo + 8, 1], [E.uno - 4, 1], [E.uno + 4, 0]]),
  cable: k(frame, [[0, 1], [E.uno + 10, 1], [E.uno + 26, 0], [E.cta + 20, 0]]),
  inclinar: k(frame, [[E.dos - 1, 0], [E.dos + 12, 1], [E.tres - 12, 1], [E.tres - 2, 0]]),
  gotas: k(frame, [[E.dos + 8, 0], [E.dos + 20, 1], [E.tres - 12, 1], [E.tres - 2, 0]]),
  aire: k(frame, [[E.tres + 6, 0], [E.tres + 24, 1], [E.ojo - 4, 1], [E.ojo + 4, 0]]),
  reloj: k(frame, [[E.treinta - 2, 0], [E.treinta + 10, 1], [E.ojo - 6, 1], [E.ojo + 2, 0]]),
  minutos: k(frame, [[E.treinta + 10, 0], [r.w(6, "treinta") + 20, 0], [E.ojo - 20, 1]]),
  fantasma: k(frame, [[E.motivo - 2, 0], [E.motivo + 10, 1], [E.uno - 4, 1], [E.uno + 6, 0]]),
  secador: k(frame, [[r.w(5, "secador") - 2, 0], [r.w(5, "secador") + 8, 1], [E.treinta - 2, 1], [E.treinta + 6, 0]]),
});

const DESTACAR = ["Error", "arroz", "textual", "partículas", "primero", "Después", "secador", "treinta", "Ojo", "Guardate", "Mandáselo"];
const CIFRAS: [string, string][] = [["treinta", "30"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [r.w(0, "Error."), "scratch", 0.5],
  [E.textual, "sello", 0.5],
  [E.motivo, "whoosh", 0.35],
  [E.uno, "ding", 0.5],
  [E.dos, "ding", 0.5],
  [E.tres, "ding", 0.5],
  [r.w(5, "secador"), "sello", 0.45],
  [E.treinta, "tic", 0.5],
  [E.ojo, "sello", 0.55],
  [E.guardar, "ding", 0.5],
  [E.cta, "whoosh", 0.35],
];

export const CelularArroz041: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Celular e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={0} hasta={E.textual} x={540} y={300}>
        ¿Celular mojado? ¿<span style={{ color: ACENTO }}>Al arroz</span>?
      </Chip>
      <Chip desde={E.textual} hasta={E.motivo} x={540} y={300}>
        Apple: <span style={{ color: ACENTO }}>no</span> al arroz
      </Chip>
      <Chip desde={E.motivo} hasta={E.uno} x={540} y={300}>
        Partículas de <span style={{ color: ACENTO }}>arroz</span> adentro
      </Chip>
      <Chip desde={E.uno} hasta={E.dos} x={540} y={300}>
        <span style={{ color: ACENTO }}>1.</span> Desenchufalo
      </Chip>
      <Chip desde={E.dos} hasta={E.tres} x={540} y={300}>
        <span style={{ color: ACENTO }}>2.</span> Golpecito, conector abajo
      </Chip>
      <Chip desde={E.tres} hasta={E.treinta} x={540} y={300}>
        <span style={{ color: ACENTO }}>3.</span> Lugar seco, con aire
      </Chip>
      <Chip desde={E.treinta} hasta={E.ojo} x={540} y={300}>
        Al menos <span style={{ color: ACENTO }}>30 min</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.guardar} x={540} y={300}>
        Recomendación de Apple para <span style={{ color: ACENTO }}>iPhone</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.cta} x={540} y={300}>
        Guardalo: <span style={{ color: ACENTO }}>nada de arroz · 30 min</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que ya tiene el arroz listo" />
      <Audio src={staticFile("041-celular-arroz-v2/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.8, 2.0, 12], mira: [1.0, 1.6, 0], fov: 40 }];
export const Portada041: React.FC = () => (
  <Portada arriba="¿celular mojado? ¿al arroz?" grande="NO" sello="APPLE" colorSello={C.azul} numero={41}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Celular
        e={{ frame: 40, alerta: 1, arroz: 1, tacho: 1, granos: 0, cable: 1, inclinar: 0, gotas: 1, aire: 0, reloj: 0, minutos: 0, fantasma: 0, secador: 0 }}
      />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

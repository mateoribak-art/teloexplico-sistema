import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/010-rayo-mismo-lugar/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Torre3D, type EstadoTorre } from "../../kit3d/objetos/Torre";

// 3D: una nube enorme, una torre alta con pararrayos a la izquierda, una estatua con los brazos abiertos sobre
// un cerro a la derecha y terreno llano en el medio. Los rayos caen una y otra vez en lo alto (contador por año),
// una chispa sube desde la punta de la torre a buscar la descarga, el cable del pararrayos baja a tierra, y al
// final (el "Ojo") el terreno llano se marca y casi no cae nada.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  verso: r.w(0, "verso"),
  empire: r.f(1),
  veinte: r.w(1, "veinte"),
  cristo: r.f(2),
  seis: r.w(2, "seis"),
  alto: r.f(3),
  chispa: r.w(3, "chispa"),
  descarga: r.w(3, "descarga"),
  pararrayos: r.f(4),
  camino: r.w(4, "camino"),
  tierra: r.w(4, "tierra"),
  sullivan: r.f(5),
  siete: r.w(5, "siete"),
  anios: r.w(5, "cuarenta"),
  ojo: r.f(6),
  llano: r.w(6, "llano"),
  imposible: r.w(6, "imposible"),
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

/** destello de rayo: sube de golpe y se apaga con un parpadeo */
const destello = (frame: number, inicios: number[]) => {
  let m = 0;
  for (const f0 of inicios) {
    const d = frame - f0;
    if (d < 0 || d > 11) continue;
    const v = d < 3 ? 1 : d < 5 ? 0.35 : d < 7 ? 0.9 : 0.9 * (1 - (d - 7) / 4);
    m = Math.max(m, v);
  }
  return m;
};

// rayos sobre la torre (frase del Empire State y después del mecanismo), sobre la estatua, y uno en el llano al final
const GOLPES_TORRE = [8, E.empire + 14, E.empire + 44, E.veinte + 26, E.descarga + 4, E.tierra + 10];
const GOLPES_ESTATUA = [E.cristo + 20, E.cristo + 70, E.seis + 18, E.seis + 40];
const GOLPES_LLANO = [E.imposible + 6];

const ANCHO_PLANO = 34;
const TOMAS: Toma[] = [
  // gancho: todo el paisaje, la nube grande
  { f: 0, pos: [0, 2.9, 14.5], mira: [0, 2.4, 0], fov: ANCHO_PLANO },
  { f: E.verso, pos: [-0.6, 2.9, 12.6], mira: [-0.7, 2.4, 0], fov: ANCHO_PLANO },
  // Empire State: se acerca a la torre
  { f: E.empire + 6, pos: [-1.0, 3.2, 11.5], mira: [-1.5, 2.9, 0], fov: 32 },
  { f: E.veinte + 20, pos: [-1.3, 3.3, 10.5], mira: [-1.6, 3.0, 0], fov: 32 },
  // Cristo: panea a la derecha
  { f: E.cristo + 4, pos: [1.4, 2.8, 11.5], mira: [1.7, 2.5, 0], fov: 32 },
  { f: E.seis + 20, pos: [1.6, 2.8, 10.5], mira: [1.7, 2.6, 0], fov: 32 },
  // lo más alto queda cerca de la nube: plano abierto vertical
  { f: E.alto, pos: [-0.5, 3.2, 12.0], mira: [-0.8, 3.0, 0], fov: ANCHO_PLANO },
  // la chispa sube: primer plano de la punta
  { f: E.chispa - 6, pos: [-1.7, 4.4, 9.0], mira: [-1.7, 4.2, 0], fov: 30 },
  { f: E.descarga + 14, pos: [-1.7, 4.3, 9.4], mira: [-1.7, 4.1, 0], fov: 30 },
  // pararrayos: la cámara baja por el cable
  { f: E.camino - 4, pos: [-0.8, 3.0, 11.0], mira: [-1.3, 2.6, 0], fov: 30 },
  { f: E.tierra + 16, pos: [-0.8, 2.0, 10.5], mira: [-1.3, 1.6, 0], fov: 30 },
  // Sullivan: plano abierto
  { f: E.sullivan, pos: [0.5, 2.8, 14.0], mira: [0, 2.4, 0], fov: ANCHO_PLANO },
  // Ojo: el terreno llano, de cerca
  { f: E.ojo + 6, pos: [0.0, 2.2, 11.0], mira: [0.0, 1.6, 0], fov: 32 },
  { f: E.imposible + 24, pos: [0.0, 2.3, 10.2], mira: [0.0, 1.6, 0], fov: 32 },
  // cierre: vuelve a la toma del principio (rima con el gancho)
  { f: E.cta + 18, pos: [0, 2.9, 14.5], mira: [0, 2.4, 0], fov: ANCHO_PLANO },
  { f: DURACION, pos: [0, 2.9, 14.5], mira: [0, 2.4, 0], fov: ANCHO_PLANO },
];

const estado = (frame: number): EstadoTorre => ({
  frame,
  boltTorre: destello(frame, GOLPES_TORRE),
  boltEstatua: destello(frame, GOLPES_ESTATUA),
  boltLlano: destello(frame, GOLPES_LLANO),
  chispa: k(frame, [
    [E.chispa - 2, 0],
    [E.descarga, 1],
    [E.descarga + 6, 1],
    [E.descarga + 8, 0],
  ]),
  cable: k(frame, [
    [E.pararrayos, 0],
    [E.camino, 1],
    [E.tierra + 20, 1],
    [E.sullivan, 0],
  ]),
  llano: k(frame, [
    [E.llano, 0],
    [E.llano + 10, 1],
    [E.cta, 1],
    [E.cta + 10, 0],
  ]),
});

const DESTACAR = ["verso", "veinte", "seis", "alto", "chispa", "pararrayos", "tierra", "siete", "1942", "1977", "imposible", "Mandáselo"];
const CIFRAS: [string, string][] = [
  ["mil novecientos cuarenta y dos", "1942"],
  ["mil novecientos setenta y siete", "1977"],
  ["veinte", "20"],
  ["seis", "6"],
  ["siete", "7"],
];

/** contador de rayos por año pegado a la escena */
const Contador: React.FC<{ desde: number; hasta: number; llega: number; meta: number; mas?: boolean; y: number; etiqueta: string }> = ({
  desde,
  hasta,
  llega,
  meta,
  mas,
  y,
  etiqueta,
}) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [desde + 4, llega], [0, meta], clamp));
  return (
    <Chip desde={desde} hasta={hasta} x={540} y={y}>
      {etiqueta} <span style={{ color: ACENTO }}>{v}{mas && v >= meta ? "+" : ""}</span> rayos por año
    </Chip>
  );
};

const AniosSullivan: React.FC = () => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [E.anios, E.sullivan + 10 * FPS], [1942, 1977], clamp));
  const n = Math.min(7, Math.max(0, Math.round(interpolate(frame, [E.siete - 6, E.siete + 30], [0, 7], clamp))));
  return (
    <Chip desde={E.sullivan} hasta={E.ojo} x={540} y={330}>
      Roy Sullivan · <span style={{ color: ACENTO }}>{v < 1942 ? 1942 : v}</span> · <span style={{ color: ACENTO }}>{n}</span>/7
    </Chip>
  );
};

const efectos: Efecto[] = [
  [8, "pop", 0.6],
  [E.empire + 14, "pop", 0.5],
  [E.empire + 44, "pop", 0.5],
  [E.veinte, "tic", 0.5],
  [E.cristo, "whoosh", 0.35],
  [E.cristo + 20, "pop", 0.5],
  [E.seis, "ding", 0.4],
  [E.alto, "whoosh", 0.35],
  [E.chispa, "tic", 0.5],
  [E.descarga + 4, "pop", 0.6],
  [E.camino, "whoosh", 0.35],
  [E.sullivan, "whoosh", 0.35],
  [E.siete, "sello", 0.6],
  [E.ojo, "whoosh", 0.35],
  [E.imposible + 6, "pop", 0.5],
  [E.cta, "whoosh", 0.35],
];

export const RayoMismoLugar3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Torre3D e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={E.gancho + 6} hasta={E.empire - 2} x={540} y={320} color="#ff5a4a">
        "No cae dos veces": <span style={{ color: "#ff8a7a" }}>falso</span>
      </Chip>
      <Contador desde={E.empire + 18} hasta={E.cristo} llega={E.veinte + 12} meta={20} mas y={330} etiqueta="Empire State ·" />
      <Contador desde={E.cristo + 18} hasta={E.alto} llega={E.seis + 12} meta={6} y={330} etiqueta="Cristo Redentor ·" />
      <Chip desde={E.alto + 4} hasta={E.pararrayos - 2} x={540} y={330} color="#8fe3ff">
        Lo más alto: <span style={{ color: "#8fe3ff" }}>más cerca de la nube</span>
      </Chip>
      <Chip desde={E.pararrayos + 4} hasta={E.sullivan - 2} x={540} y={330} color="#8fe3ff">
        Pararrayos: <span style={{ color: "#8fe3ff" }}>camino a tierra</span>
      </Chip>
      <AniosSullivan />
      <Chip desde={E.llano} hasta={E.cta} x={540} y={330} color="#8fe3ff">
        Terreno llano: <span style={{ color: "#8fe3ff" }}>muy poco probable</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice que eso no pasa dos veces" />
      <Audio src={staticFile("010-rayo-mismo-lugar/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 3.0, 13.0], mira: [0, 2.5, 0], fov: 34 }];
export const Portada010: React.FC = () => (
  <Portada arriba="¿un rayo nunca cae dos veces en el mismo lugar?" grande="es un verso" sello="DATO" colorSello={C.azul} numero={10}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Torre3D e={{ ...estado(0), boltTorre: 1, boltEstatua: 1, boltLlano: 0 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-010-thermostat-night/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Termostato, type EstadoTermostato } from "../../kit3d/objetos/Termostato";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un termostato redondo de pared y, al lado, una casita con el interior iluminado y una luna (es de noche).
// Mecanismo: cuanto mayor la diferencia entre adentro y afuera, más rápido se escapa el calor (bolitas naranjas);
// al bajar el termostato la casa pierde menos calor toda la noche. Cifras (7–10 °F, 8 h, 10 %) = las de la DOE, del guion.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  brecha: r.f(2),
  fuga: r.f(3),
  doe: r.f(4),
  ojo: r.f(5),
  hoy: r.f(6),
  cta: r.f(7),
  fin: r.fin(7),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoTermostato => {
  // dial: 1 = 72 °F; baja al hablar de la fuga y vuelve a bajar un poco "esta noche"
  let dial = 1;
  if (f >= E.fuga) dial = 1 - 0.65 * k(f, E.fuga + 6, E.fuga + 40);
  if (f >= E.hoy) dial = 0.35 - 0.1 * k(f, E.hoy + 10, E.hoy + 40);
  if (f >= E.cta) dial = 1 - 0.25 * k(f, E.cta, E.cta + 20);
  const fugaBase = k(f, E.mito, E.brecha + 20);
  const fuga = f < E.fuga ? fugaBase : fugaBase * (1 - 0.7 * k(f, E.fuga + 6, E.fuga + 40));
  return {
    frame: f,
    dial,
    fuga: f >= E.cta ? 0.5 : fuga,
    noche: k(f, 0, 12),
    fantasma: k(f, E.mito, E.mito + 14),
    casa: k(f, E.gancho + 6, E.gancho + 26),
    aguja: dial,
  };
};

const VISTA: Toma = { f: 0, pos: [-0.1, 2.6, 18], mira: [-0.1, 1.9, 0], fov: 42 };
const TERMO: Toma = { f: 0, pos: [-2.3, 2.3, 6.5], mira: [-2.3, 2.1, 0], fov: 36 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...TERMO, f: E.gancho + 40 },
  { ...VISTA, f: E.mito },
  { f: E.brecha, pos: [1.7, 2.0, 10.5], mira: [1.7, 1.4, 0], fov: 38 },
  { ...VISTA, f: E.fuga },
  { ...TERMO, f: E.doe },
  { ...VISTA, f: E.ojo },
  { ...TERMO, f: E.hoy },
  { ...VISTA, f: E.cta },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["backwards", "bigger", "leaks", "Department", "ten", "percent", "upper", "heat", "pumps", "tonight", "degrees", "seventy-two"];
const CIFRAS: [string, string][] = [
  ["seven", "7"],
  ["ten", "10"],
  ["eight", "8"],
  ["seventy-two", "72"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mito, "scratch", 0.5],
  [E.mito + 6, "sello", 0.5],
  [E.brecha, "whoosh", 0.35],
  [E.fuga, "pop", 0.4],
  [E.doe, "ding", 0.4],
  [E.ojo, "sello", 0.5],
  [E.hoy, "whoosh", 0.35],
  [E.hoy + 30, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const ThermostatNightEn010: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Termostato e={estado(frame)} />
        <PisoSombra y={0.001} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.mito} x={540} y={330} color="#ffb23d">
        heat on <span style={{ color: ACENTO }}>all night</span>
      </Chip>
      <Chip desde={E.mito} hasta={E.brecha} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>backwards</span>
      </Chip>
      <Chip desde={E.brecha} hasta={E.fuga} x={540} y={330} color="#ffb23d">
        bigger gap = <span style={{ color: "#ffb23d" }}>faster leak</span>
      </Chip>
      <Chip desde={E.fuga} hasta={E.doe} x={540} y={330} color="#5fd2ff">
        cooler house = <span style={{ color: "#5fd2ff" }}>less leak</span>
      </Chip>
      <Chip desde={E.doe} hasta={E.ojo} x={540} y={330}>
        <span style={{ color: ACENTO }}>7–10°F</span> · 8 h · up to <span style={{ color: ACENTO }}>10%</span>/yr
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.hoy} x={540} y={330} color="#ffb23d">
        upper estimate · <span style={{ color: ACENTO }}>heat pumps differ</span>
      </Chip>
      <Chip desde={E.hoy + 20} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        drop it <span style={{ color: "#5fd2ff" }}>a few degrees</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who set it to 72 and never touched it" />
      <Audio src={staticFile("en-010-thermostat-night/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [-0.3, 2.2, 15.5], mira: [-0.3, 1.9, 0], fov: 42 }];
export const PortadaEn010: React.FC = () => (
  <Portada arriba="heat on all night to avoid reheating?" grande="it's backwards" sello="MYTH" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Termostato e={{ frame: 40, dial: 0.4, fuga: 0.4, noche: 1, fantasma: 1, casa: 1, aguja: 0.4 }} />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

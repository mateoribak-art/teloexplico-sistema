import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-017-heat-head/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { CalorCuerpo, type EstadoCalorCuerpo } from "../../kit3d/objetos/CalorCuerpo";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una persona sin cara, en traje de baño, sobre fondo azul noche. Bolitas naranjas = calor que sale por la piel descubierta.
// Mecanismo: cada zona pierde según su superficie; la cabeza (≈10 %) pierde ≈10 %. El mito nace (probablemente) de un test militar
// con trajes árticos y sin gorro: la cabeza era la única piel al aire. Cifra: la del BMJ (Vreeman & Carroll 2007), la del guion.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  piel: r.f(2),
  diez: r.f(3),
  asi: r.f(4),
  bmj: r.f(5),
  unica: r.f(6),
  ojo: r.f(7),
  hoy: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoCalorCuerpo => {
  const calor = k(f, 4, 24) * (1 - k(f, E.hoy + 30, E.hoy + 60)) + (f >= E.cta ? 0.5 * k(f, E.cta, E.cta + 10) : 0);
  // foco: cuando habla de la cabeza
  const foco = Math.max(k(f, E.diez, E.diez + 10) * (1 - k(f, E.bmj, E.bmj + 8)), k(f, E.unica, E.unica + 10) * (1 - k(f, E.ojo, E.ojo + 8)));
  // trajes árticos (campera+pantalón) solo en la escena del test militar
  const traje = k(f, E.bmj + 8, E.bmj + 30) * (1 - k(f, E.ojo - 4, E.ojo + 12));
  // hoy: todo tapado
  const hoyTodo = k(f, E.hoy + 6, E.hoy + 36) * (1 - k(f, E.cta, E.cta + 10));
  const gorro = Math.max(k(f, E.ojo, E.ojo + 16) * (1 - k(f, E.cta, E.cta + 10)), hoyTodo);
  return {
    frame: f,
    calor: Math.min(1, calor),
    foco,
    gorro,
    campera: Math.max(traje, hoyTodo),
    pantalon: Math.max(traje, hoyTodo),
    frio: k(f, E.bmj, E.bmj + 20) * (1 - k(f, E.ojo, E.ojo + 10)) * 0.5,
  };
};

const VISTA: Toma = { f: 0, pos: [0, 1.7, 10.5], mira: [0, 1.55, 0], fov: 40 };
const CABEZA: Toma = { f: 0, pos: [0.4, 2.55, 4.4], mira: [0, 2.4, 0], fov: 34 };
const CUERPO: Toma = { f: 0, pos: [0.3, 1.5, 6.6], mira: [0, 1.4, 0], fov: 38 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...CABEZA, f: E.gancho + 40 },
  { ...CABEZA, f: E.mito - 4 },
  { ...VISTA, f: E.mito + 20 },
  { ...CUERPO, f: E.piel + 6 },
  { ...CUERPO, f: E.diez - 6 },
  { ...CABEZA, f: E.diez + 14 },
  { ...CABEZA, f: E.asi + 10 },
  { ...VISTA, f: E.bmj },
  { ...VISTA, f: E.unica - 6 },
  { ...CABEZA, f: E.unica + 14 },
  { ...CABEZA, f: E.ojo - 6 },
  { ...VISTA, f: E.ojo + 14 },
  { ...VISTA, f: E.cta },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["myth", "bare", "ten", "percent", "half", "BMJ", "hats", "only", "hat", "cover", "jacket", "head"];
const CIFRAS: [string, string][] = [["ten percent", "10%"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mito, "scratch", 0.5],
  [E.mito + 6, "sello", 0.5],
  [E.piel, "whoosh", 0.35],
  [E.diez, "pop", 0.4],
  [E.asi, "ding", 0.45],
  [E.bmj, "whoosh", 0.35],
  [E.unica, "pop", 0.4],
  [E.ojo, "sello", 0.5],
  [E.hoy, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const HeatHeadEn017: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <CalorCuerpo e={estado(frame)} />
        <PisoSombra y={0.001} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.mito} x={540} y={330} color="#ffb23d">
        most heat out the <span style={{ color: ACENTO }}>head</span>?
      </Chip>
      <Chip desde={E.mito} hasta={E.piel} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>myth</span>
      </Chip>
      <Chip desde={E.piel} hasta={E.diez} x={540} y={330} color="#ffb23d">
        bare skin = <span style={{ color: "#ffb23d" }}>heat out</span>
      </Chip>
      <Chip desde={E.diez} hasta={E.asi} x={540} y={330}>
        head ≈ <span style={{ color: ACENTO }}>10%</span> of your surface
      </Chip>
      <Chip desde={E.asi} hasta={E.bmj} x={540} y={330}>
        ≈ <span style={{ color: ACENTO }}>10%</span> of the heat, not half
      </Chip>
      <Chip desde={E.bmj} hasta={E.unica} x={540} y={330} color="#5fd2ff">
        old test: arctic suits, <span style={{ color: "#5fd2ff" }}>no hats</span>
      </Chip>
      <Chip desde={E.unica} hasta={E.ojo} x={540} y={330} color="#ffb23d">
        only skin <span style={{ color: "#ffb23d" }}>showing</span>
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.hoy} x={540} y={330} color="#ffb23d">
        a hat helps · <span style={{ color: ACENTO }}>not special</span>
      </Chip>
      <Chip desde={E.hoy + 10} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        cover <span style={{ color: "#5fd2ff" }}>whatever is bare</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who wears a hat but leaves the jacket open" />
      <Audio src={staticFile("en-017-heat-head/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.8, 9.2], mira: [0, 1.6, 0], fov: 40 }];
export const PortadaEn017: React.FC = () => (
  <Portada arriba="lose most heat through your head?" grande="MYTH" sello="BMJ" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <CalorCuerpo e={{ frame: 40, calor: 1, foco: 1, gorro: 0, campera: 0, pantalon: 0, frio: 0 }} />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

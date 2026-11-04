import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-019-knuckle-crack/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Nudillo, type EstadoNudillo } from "../../kit3d/objetos/Nudillo";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un dedo visto de costado, con la piel traslúcida y los dos huesos adentro, sobre fondo azul noche.
// Mecanismo: al tirar del dedo los huesos se separan, se abre un vacío oscuro con una burbuja de gas (resonancia, Kawchuk 2015)
// y suena el "crac". Datos: deWeber 2011, 215 adultos de 50 a 89 años, sin más artrosis de mano en quienes crujen.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  estudio: r.f(2),
  nada: r.f(3),
  pop: r.f(4),
  hueco: r.f(5),
  ojo: r.f(6),
  calma: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoNudillo => {
  // un "crac" en el gancho y otro cuando explica el hueco
  const crac1 = k(f, E.gancho + 40, E.gancho + 52);
  const tension = Math.max(k(f, E.gancho + 36, E.gancho + 52) * (1 - k(f, E.gancho + 52, E.gancho + 66)), k(f, E.hueco + 10, E.hueco + 42) * (1 - k(f, E.ojo - 6, E.ojo + 6)));
  const burbuja = k(f, E.hueco + 28, E.hueco + 44) * (1 - k(f, E.calma, E.calma + 14));
  const onda = Math.max(crac1 > 0 && crac1 < 1 ? k(f, E.gancho + 52, E.gancho + 72) : 0, k(f, E.hueco + 42, E.hueco + 62));
  return {
    frame: f,
    tension,
    burbuja,
    onda: onda >= 1 ? 0 : onda,
    piel: 1 - k(f, E.pop + 20, E.pop + 40) * (1 - k(f, E.calma, E.calma + 14)),
    foco: Math.max(k(f, E.nada, E.nada + 10) * (1 - k(f, E.pop, E.pop + 8)), k(f, E.hueco, E.hueco + 8) * (1 - k(f, E.ojo, E.ojo + 8))),
  };
};

const VISTA: Toma = { f: 0, pos: [0, 1.5, 10.5], mira: [0, 1.2, 0], fov: 40 };
const CERCA: Toma = { f: 0, pos: [0.2, 1.4, 6.6], mira: [0, 1.2, 0], fov: 36 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...CERCA, f: E.gancho + 40 },
  { ...CERCA, f: E.mito },
  { ...VISTA, f: E.estudio },
  { ...VISTA, f: E.nada + 20 },
  { ...CERCA, f: E.pop },
  { ...CERCA, f: E.hueco + 40 },
  { ...VISTA, f: E.ojo },
  { ...VISTA, f: E.cta },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["myth", "arthritis", "215", "2011", "MRI", "gas", "bubble", "gap", "panic", "knuckles", "pop"];
const CIFRAS: [string, string][] = [["two hundred", "200+"], ["fifty", "50"], ["eighty-nine", "89"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.gancho + 52, "scratch", 0.5],
  [E.mito, "sello", 0.5],
  [E.estudio, "whoosh", 0.35],
  [E.estudio + 20, "tic", 0.4],
  [E.nada, "ding", 0.45],
  [E.pop, "whoosh", 0.35],
  [E.hueco + 42, "pop", 0.5],
  [E.ojo, "sello", 0.5],
  [E.calma, "ding", 0.45],
  [E.cta, "pop", 0.4],
];

export const KnuckleCrackEn019: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Nudillo e={estado(frame)} />
        <PisoSombra y={0.001} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.mito} x={540} y={330} color="#ffb23d">
        knuckles = <span style={{ color: ACENTO }}>arthritis</span>?
      </Chip>
      <Chip desde={E.mito} hasta={E.estudio} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>not found</span> in studies
      </Chip>
      <Chip desde={E.estudio} hasta={E.nada} x={540} y={330} color="#5fd2ff">
        <span style={{ color: ACENTO }}>215</span> adults · ages 50–89
      </Chip>
      <Chip desde={E.nada} hasta={E.pop} x={540} y={330}>
        crackers: <span style={{ color: ACENTO }}>no more</span> hand arthritis
      </Chip>
      <Chip desde={E.pop} hasta={E.hueco} x={540} y={330} color="#5fd2ff">
        MRI · <span style={{ color: "#5fd2ff" }}>filmed live</span>
      </Chip>
      <Chip desde={E.hueco} hasta={E.ojo} x={540} y={330} color="#ffb23d">
        dark gap + <span style={{ color: ACENTO }}>gas bubble</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.calma} x={540} y={330} color="#ffb23d">
        small studies · <span style={{ color: ACENTO }}>not perfect</span>
      </Chip>
      <Chip desde={E.calma} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        the pop alone: <span style={{ color: "#5fd2ff" }}>no panic</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who cracks every knuckle before typing" />
      <Audio src={staticFile("en-019-knuckle-crack/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.5, 8.6], mira: [0, 1.2, 0], fov: 40 }];
export const PortadaEn019: React.FC = () => (
  <Portada arriba="cracking your knuckles gives you arthritis?" grande="NOT FOUND" sello="2011 study" colorSello={C.azul}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Nudillo e={{ frame: 40, tension: 1, burbuja: 1, onda: 0.35, piel: 0.7, foco: 0 }} />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-006-five-second-rule/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";
import { Escena, type Episodio, type EstadoEscena } from "./Escena";

// Mundo: un piso con bacterias (brillan en verde) y tres comidas que caen: sandía, pan y gomita.
// Mecanismo: las bacterias saltan del piso a la comida en menos de un segundo; la comida mojada se carga más
// que la seca y la alfombra pasa mucho menos que la baldosa. Cámara baja y cerca para verlas saltar.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  estudio: r.f(2),
  menos: r.f(3),
  mojada: r.f(4),
  alfombra: r.f(5),
  ojo: r.f(6),
  tirala: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ANCHO = 36;
const TOMAS: Toma[] = [
  { f: 0, pos: [0.6, 3.0, 7.6], mira: [0, 0.3, 0], fov: ANCHO },
  { f: E.mito, pos: [0.2, 2.6, 7.0], mira: [0, 0.3, 0], fov: ANCHO },
  { f: E.estudio, pos: [-0.6, 3.2, 7.8], mira: [0, 0.3, 0], fov: ANCHO },
  { f: E.menos - 2, pos: [0.6, 3.0, 7.6], mira: [0, 0.3, 0], fov: ANCHO },
  // "menos de un segundo": cerca y bajo, se ven saltar
  { f: E.menos + 14, pos: [0.4, 1.3, 4.6], mira: [0, 0.3, 0], fov: 34 },
  { f: E.mojada - 2, pos: [0.4, 1.3, 4.6], mira: [0, 0.3, 0], fov: 34 },
  { f: E.mojada + 16, pos: [-1.5, 1.2, 4.0], mira: [-1.1, 0.3, 0], fov: 32 },
  { f: E.alfombra - 2, pos: [-1.2, 1.4, 4.4], mira: [-0.6, 0.3, 0], fov: 32 },
  { f: E.alfombra + 14, pos: [0.4, 1.8, 5.6], mira: [0, 0.3, 0], fov: 34 },
  { f: E.ojo, pos: [0.6, 2.6, 7.2], mira: [0, 0.3, 0], fov: ANCHO },
  { f: E.tirala + 10, pos: [-0.8, 2.2, 5.8], mira: [-0.8, 0.3, 0], fov: 34 },
  { f: E.cta, pos: [0.6, 3.0, 7.6], mira: [0, 0.3, 0], fov: ANCHO },
  { f: DURACION, pos: [0.6, 3.0, 7.6], mira: [0, 0.3, 0], fov: ANCHO },
];

const episodios: Episodio[] = [
  { drops: [r.w(2, "watermelon"), r.w(2, "bread"), r.w(2, "gummy")], piso: "tile", carga: [14, 8, 3], hop: E.menos + 8 },
  { drops: [r.w(5, "Carpet"), r.w(5, "Carpet") + 5, r.w(5, "Carpet") + 10], piso: "carpet", carga: [4, 3, 1], hop: r.w(5, "Carpet") + 24 },
  { drops: [E.ojo + 2, E.ojo + 7, E.ojo + 12], piso: "tile", carga: [22, 13, 5], hop: E.ojo + 26 },
];

const estado = (frame: number): EstadoEscena => ({ frame, episodios, toss: r.w(7, "toss") });

const DESTACAR = ["myth", "Rutgers", "watermelon", "second", "wetter", "worst", "Carpet", "Heads", "wet", "toss", "cookie"];
const CIFRAS: [string, string][] = [
  ["five-second", "5-second"],
  ["one second", "1 second"],
  ["five seconds", "5 seconds"],
];

/** cuenta regresiva del gancho: 5 → 0 */
const Cuenta5: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.ceil(interpolate(frame, [4, E.mito - 2], [5, 0], clamp)));
  return (
    <Chip desde={0} hasta={E.mito + 4} x={540} y={330}>
      <span style={{ color: ACENTO }}>{n}</span> seconds…
    </Chip>
  );
};

const Superficies: React.FC = () => {
  const frame = useCurrentFrame();
  const marcas = [r.w(2, "tile"), r.w(2, "steel"), r.w(2, "wood"), r.w(2, "carpet")];
  const nombres = ["tile", "steel", "wood", "carpet"];
  const actual = marcas.filter((m) => frame >= m).length - 1;
  return (
    <Chip desde={r.w(2, "tile") - 6} hasta={E.menos} x={540} y={330}>
      {nombres.map((n, i) => (
        <span key={n} style={{ color: i === actual ? ACENTO : "#8a97b3", marginRight: i < 3 ? 26 : 0 }}>
          {n}
        </span>
      ))}
    </Chip>
  );
};

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mito, "scratch", 0.5],
  [E.mito + 6, "sello", 0.5],
  [r.w(2, "watermelon"), "pop", 0.45],
  [r.w(2, "bread"), "pop", 0.45],
  [r.w(2, "gummy"), "pop", 0.45],
  [E.menos, "whoosh", 0.4],
  [E.menos + 12, "tic", 0.6],
  [E.mojada, "whoosh", 0.35],
  [r.w(4, "Watermelon"), "ding", 0.4],
  [E.alfombra, "whoosh", 0.35],
  [r.w(5, "Carpet"), "pop", 0.45],
  [E.ojo, "sello", 0.5],
  [E.tirala, "whoosh", 0.35],
  [r.w(7, "toss"), "latigo", 0.5],
  [E.cta, "pop", 0.4],
];

const Vista: React.FC<{ frame: number }> = ({ frame }) => (
  <Estudio>
    <Camara tomas={TOMAS} />
    <Escena e={estado(frame)} />
    <PisoSombra y={0.001} />
  </Estudio>
);

export const FiveSecondEn006: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Vista frame={frame} />
      <Cuenta5 />
      <Chip desde={E.mito} hasta={E.estudio} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>MYTH</span>
      </Chip>
      <Superficies />
      <Chip desde={E.menos + 10} hasta={E.mojada} x={540} y={330}>
        less than <span style={{ color: ACENTO }}>1 second</span>
      </Chip>
      <Chip desde={E.mojada + 4} hasta={E.alfombra} x={540} y={330} color="#5fd2ff">
        wetter = <span style={{ color: "#5fd2ff" }}>more bacteria</span>
      </Chip>
      <Chip desde={r.w(5, "Carpet")} hasta={E.ojo} x={540} y={330}>
        carpet: <span style={{ color: ACENTO }}>far less</span>
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.tirala} x={540} y={330} color="#ffb23d">
        longer = <span style={{ color: ACENTO }}>more</span>
      </Chip>
      <Chip desde={E.tirala + 2} hasta={E.cta} x={540} y={330} color="#ff5a4a">
        wet + tile = <span style={{ color: "#ff8a7a" }}>toss it</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who yells five seconds before the cookie lands" />
      <Audio src={staticFile("en-006-five-second-rule/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

// Portada: comida sobre la baldosa, ya con bacterias encima.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.3, 2.4, 6.4], mira: [0, 0.5, 0], fov: 36 }];
export const PortadaEn006: React.FC = () => (
  <Portada arriba="is the 5-second rule real?" grande="it's a myth" sello="MYTH" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Escena
        e={{
          frame: 200,
          toss: 99999,
          episodios: [{ drops: [0, 0, 0], piso: "tile", carga: [14, 8, 3], hop: 0 }],
        }}
      />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

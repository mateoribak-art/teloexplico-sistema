import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/078-piedra-papel-tijera/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Manos, type EstadoManos } from "../../kit3d/objetos/Manos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: piedra, papel y tijera en fila sobre fondo oscuro. El que gana repite (aro dorado y eco de la piedra);
// el que pierde cambia (sin dirección); el papel se enciende como respuesta a la piedra.
// Fuente: Wang, Xu y Zhou, Universidad de Zhejiang, Scientific Reports, 2014.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  patron: r.f(1),
  zhejiang: r.f(2),
  gana: r.f(3),
  pierde: r.f(4),
  juegale: r.f(5),
  ojo: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoManos => ({
  frame: f,
  aparece: k(f, 0, 16),
  repite: k(f, E.gana, E.gana + 14) * (1 - k(f, E.pierde, E.pierde + 10)),
  ciclo: 0,
  foco: k(f, E.juegale + 6, E.juegale + 20) * (1 - k(f, E.ojo, E.ojo + 10)),
});

const VISTA: Toma = { f: 0, pos: [0, 3.2, 14], mira: [0, 1.0, 0], fov: 44 };
const PIEDRA: Toma = { f: 0, pos: [-1.6, 2.4, 9.5], mira: [-1.8, 1.0, -0.5], fov: 40 };
const PAPEL: Toma = { f: 0, pos: [0.8, 2.4, 6.8], mira: [0, 1.0, 0], fov: 40 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...VISTA, f: E.patron },
  { ...VISTA, f: E.zhejiang },
  { ...PIEDRA, f: E.gana },
  { ...VISTA, f: E.pierde },
  { ...PAPEL, f: E.juegale },
  { ...VISTA, f: E.ojo },
  { ...VISTA, f: E.pregunta },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["patrón", "Zhejiang", "gana", "repetir", "pierde", "cambiar", "papel", "Ojo", "tendencia", "garantía", "palabra", "Mandáselo"];
const CIFRAS: [string, string][] = [["trescientas", "300"], ["dos mil catorce", "2014"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.patron, "scratch", 0.4],
  [E.zhejiang, "pop", 0.4],
  [E.gana, "ding", 0.4],
  [E.pierde, "whoosh", 0.45],
  [E.juegale, "sello", 0.45],
  [E.ojo, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const PiedraPapelTijera3D: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Manos e={estado(frame)} />
        <PisoSombra y={0} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.patron} x={540} y={330} color="#ff9a2e">
        ¿mala suerte? <span style={{ color: ACENTO }}>no</span>
      </Chip>
      <Chip desde={E.patron} hasta={E.zhejiang} x={540} y={330} color="#ffd23f">
        no es azar · <span style={{ color: ACENTO }}>patrón</span>
      </Chip>
      <Chip desde={E.zhejiang} hasta={E.gana} x={540} y={330} color="#5fd2ff">
        Zhejiang 2014 · <span style={{ color: ACENTO }}>300 rondas</span>
      </Chip>
      <Chip desde={E.gana} hasta={E.pierde} x={540} y={330} color="#ffd23f">
        el que gana · <span style={{ color: ACENTO }}>repite</span>
      </Chip>
      <Chip desde={E.pierde} hasta={E.juegale} x={540} y={330} color="#ff9a2e">
        el que pierde · <span style={{ color: ACENTO }}>cambia</span>
      </Chip>
      <Chip desde={E.juegale} hasta={E.ojo} x={540} y={330} color="#5fd2ff">
        ganó con piedra · <span style={{ color: ACENTO }}>jugale papel</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.pregunta} x={540} y={330} color="#ff9a2e">
        tendencia · <span style={{ color: ACENTO }}>no garantía</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        ¿qué jugás primero? <span style={{ color: ACENTO }}>una palabra</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que siempre juega piedra" />
      <Audio src={staticFile("078-piedra-papel-tijera/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 3.2, 15], mira: [0, 1.0, 0], fov: 44 }];
export const Portada078: React.FC = () => (
  <Portada arriba="el juego de todos" grande="¿Hay un truco para no perder en piedra, papel o tijera?" sello="tiene patrón" colorSello={C.azul} numero={78}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Manos e={{ frame: 30, aparece: 1, repite: 1, ciclo: 0, foco: 1 }} />
      <PisoSombra y={0} opacidad={0.25} />
    </Estudio>
  </Portada>
);

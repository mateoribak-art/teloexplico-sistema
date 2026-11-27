import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/081-dos-litros-agua/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Botella, type EstadoBotella } from "../../kit3d/objetos/Botella";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un botellón de dos litros con nivel de agua. Se baja al nivel de las cifras de las Academias Nacionales (2004),
// aparecen taza, mate y comida (el agua total cuenta todo), un tubito de muestra amarillo claro y tilde.
// Fuentes: National Academies (Institute of Medicine) 2004; NHS.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  alreves: r.f(1),
  academias: r.f(2),
  cifras: r.f(3),
  cuenta: r.f(4),
  quinto: r.f(5),
  pis: r.f(6),
  ojo: r.f(7),
  pregunta: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoBotella => ({
  frame: f,
  aparece: k(f, 0, 16),
  nivel: 1 - 0.3 * k(f, E.cifras, E.cifras + 24),
  extras: k(f, E.cuenta + 6, E.cuenta + 26),
  muestra: k(f, E.pis, E.pis + 18) * (1 - k(f, E.pregunta, E.pregunta + 10)),
  tilde: k(f, E.pis + 24, E.pis + 38) * (1 - k(f, E.ojo, E.ojo + 8)),
});

const VISTA: Toma = { f: 0, pos: [0, 3.2, 11.5], mira: [0, 1.6, 0], fov: 44 };
const CERCA: Toma = { f: 0, pos: [0, 2.6, 8.2], mira: [0, 1.7, 0], fov: 42 };
const ANCHA: Toma = { f: 0, pos: [0.3, 3.0, 13.5], mira: [0, 1.2, 0.4], fov: 46 };
const MUESTRA: Toma = { f: 0, pos: [-0.6, 2.8, 10.0], mira: [-0.6, 1.9, 0.8], fov: 42 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...CERCA, f: E.alreves },
  { ...VISTA, f: E.academias },
  { ...CERCA, f: E.cifras },
  { ...ANCHA, f: E.cuenta },
  { ...ANCHA, f: E.quinto },
  { ...MUESTRA, f: E.pis },
  { ...VISTA, f: E.ojo },
  { ...VISTA, f: E.pregunta },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["dos", "litros", "mágica", "Academias", "Nacionales", "ingesta", "adecuada", "quinto", "comida", "amarillo", "claro", "oscuro", "tomá", "Mandáselo", "número"];
const CIFRAS: [string, string][] = [["dos mil cuatro", "2004"], ["dos litros y siete", "2,7 litros"], ["tres litros y siete", "3,7 litros"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.alreves, "scratch", 0.4],
  [E.academias, "sello", 0.45],
  [E.cifras, "ding", 0.4],
  [E.cuenta, "pop", 0.4],
  [E.quinto, "pop", 0.4],
  [E.pis, "whoosh", 0.45],
  [E.pis + 24, "ding", 0.4],
  [E.ojo, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const DosLitrosAgua3D: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Botella e={estado(frame)} />
        <PisoSombra y={0} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.alreves} x={540} y={330} color="#5fd2ff">
        ¿2 litros sí o sí? <span style={{ color: ACENTO }}>no</span>
      </Chip>
      <Chip desde={E.alreves} hasta={E.academias} x={540} y={330} color="#ffd23f">
        no hay cifra <span style={{ color: ACENTO }}>mágica</span>
      </Chip>
      <Chip desde={E.academias} hasta={E.cifras} x={540} y={330} color="#5fd2ff">
        Academias Nacionales EE. UU. · <span style={{ color: ACENTO }}>2004</span>
      </Chip>
      <Chip desde={E.cifras} hasta={E.cuenta} x={540} y={330} color="#5fd2ff">
        ♀ <span style={{ color: ACENTO }}>2,7 L</span> · ♂ <span style={{ color: ACENTO }}>3,7 L</span>
      </Chip>
      <Chip desde={E.cuenta} hasta={E.quinto} x={540} y={330} color="#ff9a2e">
        cuenta <span style={{ color: ACENTO }}>todo</span>: agua, té, café, mate, comida
      </Chip>
      <Chip desde={E.quinto} hasta={E.pis} x={540} y={330} color="#37d67a">
        ~1/5 viene de la <span style={{ color: ACENTO }}>comida</span>
      </Chip>
      <Chip desde={E.pis} hasta={E.ojo} x={540} y={330} color="#ffe45a">
        pis <span style={{ color: ACENTO }}>amarillo claro</span> · oscuro, tomá más
      </Chip>
      <Chip desde={E.ojo} hasta={E.pregunta} x={540} y={330} color="#ff9a2e">
        calor, ejercicio, enfermedad · <span style={{ color: ACENTO }}>más</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        ¿cuántos litros tomás? <span style={{ color: ACENTO }}>un número</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que anda con el botellón" />
      <Audio src={staticFile("081-dos-litros-agua/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 3.0, 9.0], mira: [0, 1.7, 0], fov: 44 }];
export const Portada081: React.FC = () => (
  <Portada arriba="el mito de tu botella" grande="¿Hay que tomar dos litros de agua por día?" sello="no hay cifra mágica" colorSello={C.azul} numero={81}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Botella e={{ frame: 30, aparece: 1, nivel: 0.8, extras: 1, muestra: 0, tilde: 0 }} />
      <PisoSombra y={0} opacidad={0.25} />
    </Estudio>
  </Portada>
);

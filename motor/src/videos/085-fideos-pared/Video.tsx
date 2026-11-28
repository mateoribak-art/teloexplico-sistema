import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/085-fideos-pared/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Fideos, type EstadoFideos } from "../../kit3d/objetos/Fideos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una pared de cocina. Se tira un fideo y se pega; se pegan otros dos (poco cocido, a punto, pasado: los tres iguales);
// después aparece una cuchara con un fideo para probar y un tilde. Fuentes: Jeanette Donnarumma (The Rachael Ray Show); Barilla.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  pared: r.f(1),
  almidon: r.f(2),
  donna: r.f(3),
  nodice: r.f(4),
  barilla: r.f(5),
  probar: r.f(6),
  guardalo: r.f(7),
  pregunta: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoFideos => ({
  frame: f,
  aparece: k(f, 0, 14),
  tiro: k(f, 10, 40),
  pegados: k(f, E.donna + 20, E.donna + 44),
  prueba: k(f, E.probar, E.probar + 18) * (1 - k(f, E.pregunta, E.pregunta + 10)),
  tilde: k(f, E.guardalo + 6, E.guardalo + 20) * (1 - k(f, E.pregunta, E.pregunta + 8)),
});

const VISTA: Toma = { f: 0, pos: [0, 3.0, 11.0], mira: [0, 2.3, 0], fov: 44 };
const PARED: Toma = { f: 0, pos: [0, 3.0, 7.5], mira: [0, 3.0, -1.0], fov: 42 };
const ANCHA: Toma = { f: 0, pos: [0, 2.8, 12.5], mira: [0, 2.4, 0], fov: 46 };
const CUCHARA: Toma = { f: 0, pos: [0.4, 2.2, 7.0], mira: [0, 1.4, 2.2], fov: 42 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...PARED, f: E.pared },
  { ...PARED, f: E.almidon },
  { ...ANCHA, f: E.donna },
  { ...ANCHA, f: E.nodice },
  { ...VISTA, f: E.barilla },
  { ...CUCHARA, f: E.probar },
  { ...VISTA, f: E.guardalo },
  { ...VISTA, f: E.pregunta },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["fideo", "pared", "nada", "almidón", "pegajoso", "Donnarumma", "pasado", "Barilla", "morder", "probalo", "firme", "tierno", "Guardalo", "pegan", "Mandáselo"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 14, "tic", 0.4],
  [E.gancho + 40, "pop", 0.45],
  [E.pared, "scratch", 0.4],
  [E.almidon, "pop", 0.4],
  [E.donna, "sello", 0.45],
  [E.donna + 24, "pop", 0.4],
  [E.nodice, "scratch", 0.4],
  [E.barilla, "pop", 0.4],
  [E.probar, "whoosh", 0.45],
  [E.guardalo + 6, "ding", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const FideosPared3D: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Fideos e={estado(frame)} />
        <PisoSombra y={0} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.pared} x={540} y={330} color="#ffd23f">
        ¿fideo a la pared? <span style={{ color: ACENTO }}>no dice nada</span>
      </Chip>
      <Chip desde={E.pared} hasta={E.almidon} x={540} y={330} color="#5fd2ff">
        la pared <span style={{ color: ACENTO }}>no avisa</span>
      </Chip>
      <Chip desde={E.almidon} hasta={E.donna} x={540} y={330} color="#ff9a2e">
        <span style={{ color: ACENTO }}>almidón</span> = pegajoso
      </Chip>
      <Chip desde={E.donna} hasta={E.nodice} x={540} y={330} color="#37d67a">
        J. Donnarumma · <span style={{ color: ACENTO }}>Rachael Ray Show</span>
      </Chip>
      <Chip desde={E.nodice} hasta={E.barilla} x={540} y={330} color="#ffd23f">
        poco cocido · a punto · pasado: <span style={{ color: ACENTO }}>se pegan</span>
      </Chip>
      <Chip desde={E.barilla} hasta={E.probar} x={540} y={330} color="#5fd2ff">
        Barilla: <span style={{ color: ACENTO }}>morder</span> un fideo
      </Chip>
      <Chip desde={E.probar} hasta={E.guardalo} x={540} y={330} color="#37d67a">
        firme pero <span style={{ color: ACENTO }}>tierno</span>
      </Chip>
      <Chip desde={E.guardalo} hasta={E.pregunta} x={540} y={330} color="#ffd23f">
        guardalo: se <span style={{ color: ACENTO }}>prueba</span> uno
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        ¿lo tirás? <span style={{ color: ACENTO }}>sí o no</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que tiene la pared manchada" />
      <Audio src={staticFile("085-fideos-pared/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 3.0, 8.5], mira: [0, 2.8, -0.5], fov: 44 }];
export const Portada085: React.FC = () => (
  <Portada arriba="el mito de tu cocina" grande="¿Tirar un fideo a la pared sirve para algo?" sello="la pared no dice nada" colorSello={C.azul} numero={85}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Fideos e={{ frame: 30, aparece: 1, tiro: 1, pegados: 1, prueba: 0, tilde: 0 }} />
      <PisoSombra y={0} opacidad={0.25} />
    </Estudio>
  </Portada>
);

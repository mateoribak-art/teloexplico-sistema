import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/079-leer-poca-luz/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { LecturaLuz, type EstadoLectura } from "../../kit3d/objetos/LecturaLuz";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un libro abierto en una mesa, una lámpara y un ojo grande. Poca luz → el ojo se entrecierra y se cansa;
// Harvard/Johns Hopkins → tilde verde (cansa, no daña); se prende la luz → el ojo descansa.
// Fuentes: Harvard Health Publishing; Johns Hopkins Medicine (2026).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  alreves: r.f(1),
  harvard: r.f(2),
  hopkins: r.f(3),
  osea: r.f(4),
  prende: r.f(5),
  ojo: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoLectura => {
  const luzOn = k(f, E.prende, E.prende + 18);
  return {
    frame: f,
    aparece: k(f, 0, 16),
    luz: 0.12 + 0.88 * luzOn,
    cansancio: k(f, 20, E.alreves + 20) * (1 - luzOn),
    ok: k(f, E.harvard + 10, E.harvard + 24) * (1 - k(f, E.prende, E.prende + 8)),
  };
};

const VISTA: Toma = { f: 0, pos: [0, 3.0, 9.6], mira: [0, 1.3, 0], fov: 44 };
const OJO: Toma = { f: 0, pos: [0, 3.0, 7.2], mira: [0, 2.0, 0], fov: 40 };
const MESA: Toma = { f: 0, pos: [1.2, 3.0, 8.4], mira: [0.8, 1.4, 0], fov: 42 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...OJO, f: E.alreves },
  { ...VISTA, f: E.harvard },
  { ...OJO, f: E.hopkins },
  { ...VISTA, f: E.osea },
  { ...MESA, f: E.prende },
  { ...VISTA, f: E.ojo },
  { ...VISTA, f: E.pregunta },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["poca", "luz", "cansa", "arruina", "Harvard", "Prevent", "Blindness", "daño", "prendé", "oftalmólogo", "Mandáselo", "palabra"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.alreves, "scratch", 0.4],
  [E.harvard, "ding", 0.4],
  [E.hopkins, "sello", 0.45],
  [E.osea, "pop", 0.4],
  [E.prende, "whoosh", 0.45],
  [E.ojo, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const LeerPocaLuz3D: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <LecturaLuz e={estado(frame)} />
        <PisoSombra y={0} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.alreves} x={540} y={330} color="#ff9a2e">
        ¿te arruinás la vista? <span style={{ color: ACENTO }}>no</span>
      </Chip>
      <Chip desde={E.alreves} hasta={E.harvard} x={540} y={330} color="#ffd23f">
        cansa · <span style={{ color: ACENTO }}>no daña</span>
      </Chip>
      <Chip desde={E.harvard} hasta={E.hopkins} x={540} y={330} color="#5fd2ff">
        Harvard Health · <span style={{ color: ACENTO }}>sin daño</span>
      </Chip>
      <Chip desde={E.hopkins} hasta={E.osea} x={540} y={330} color="#5fd2ff">
        Prevent Blindness · <span style={{ color: ACENTO }}>sin daño permanente</span>
      </Chip>
      <Chip desde={E.osea} hasta={E.prende} x={540} y={330} color="#ff9a2e">
        se cansan más rápido · <span style={{ color: ACENTO }}>no se dañan</span>
      </Chip>
      <Chip desde={E.prende} hasta={E.ojo} x={540} y={330} color="#37d67a">
        prendé una <span style={{ color: ACENTO }}>luz</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.pregunta} x={540} y={330} color="#ff9a2e">
        si molesta seguido · <span style={{ color: ACENTO }}>oftalmólogo</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        ¿quién te retaba? <span style={{ color: ACENTO }}>una palabra</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que te apaga la luz cuando leés" />
      <Audio src={staticFile("079-leer-poca-luz/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 3.2, 8.2], mira: [0, 2.1, 0], fov: 44 }];
export const Portada079: React.FC = () => (
  <Portada arriba="el mito de tu casa" grande="¿Leer con poca luz te arruina la vista?" sello="cansa, no daña" colorSello={C.azul} numero={79}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <LecturaLuz e={{ frame: 30, aparece: 1, luz: 0.2, cansancio: 0.8, ok: 1 }} />
      <PisoSombra y={0} opacidad={0.25} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/064-nudillos-artritis/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Nudillo, type EstadoNudillo } from "../../kit3d/objetos/Nudillo";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un dedo visto de costado, piel traslúcida y dos huesos adentro, sobre fondo azul noche.
// El dedo cruje en el gancho; después el dato: DeWeber 2011 (215 adultos, 50 a 89) y Harvard Health.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  estudio: r.f(2),
  nada: r.f(3),
  harvard: r.f(4),
  ojo: r.f(5),
  medico: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoNudillo => {
  const crac1 = k(f, E.gancho + 40, E.gancho + 52);
  const crac2 = k(f, E.pregunta + 20, E.pregunta + 32);
  const tension = Math.max(
    k(f, E.gancho + 36, E.gancho + 52) * (1 - k(f, E.gancho + 52, E.gancho + 66)),
    k(f, E.pregunta + 16, E.pregunta + 32) * (1 - k(f, E.pregunta + 32, E.pregunta + 46)),
  );
  const onda = Math.max(crac1 > 0 ? k(f, E.gancho + 52, E.gancho + 72) : 0, crac2 > 0 ? k(f, E.pregunta + 32, E.pregunta + 52) : 0);
  const en = (a: number, b: number) => (f >= a && f < b ? 1 : 0);
  return {
    frame: f,
    tension,
    burbuja: 0,
    onda: onda >= 1 ? 0 : onda,
    piel: 1 - k(f, E.nada, E.nada + 16) * (1 - k(f, E.ojo, E.ojo + 14)),
    foco: Math.max(en(E.estudio, E.harvard) * k(f, E.estudio, E.estudio + 10), en(E.ojo, E.medico) * k(f, E.ojo, E.ojo + 8)),
  };
};

const VISTA: Toma = { f: 0, pos: [0, 1.5, 10.5], mira: [0, 1.2, 0], fov: 40 };
const CERCA: Toma = { f: 0, pos: [0.2, 1.4, 6.6], mira: [0, 1.2, 0], fov: 36 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...CERCA, f: E.gancho + 40 },
  { ...CERCA, f: E.mito },
  { ...VISTA, f: E.estudio },
  { ...CERCA, f: E.nada },
  { ...VISTA, f: E.harvard },
  { ...CERCA, f: E.ojo },
  { ...VISTA, f: E.medico },
  { ...CERCA, f: E.pregunta + 10 },
  { ...VISTA, f: E.cta },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["artritis", "artrosis", "doscientos", "DeWeber", "Harvard", "crónica", "agarre", "médico", "crujís", "Mandáselo"];
const CIFRAS: [string, string][] = [["dos mil once", "2011"], ["doscientos quince", "215"], ["cincuenta", "50"], ["ochenta y nueve", "89"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.gancho + 52, "scratch", 0.5],
  [E.mito, "sello", 0.5],
  [E.estudio, "whoosh", 0.35],
  [E.estudio + 40, "tic", 0.4],
  [E.nada, "ding", 0.45],
  [E.harvard, "whoosh", 0.35],
  [E.ojo, "sello", 0.5],
  [E.medico, "pop", 0.4],
  [E.pregunta + 32, "scratch", 0.45],
  [E.cta, "pop", 0.4],
];

export const NudillosArtritis3D: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Nudillo e={estado(frame)} />
        <PisoSombra y={0.001} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.mito} x={540} y={330} color="#ffb23d">
        dedos = <span style={{ color: ACENTO }}>artritis</span>?
      </Chip>
      <Chip desde={E.mito} hasta={E.estudio} x={540} y={330} color="#ffb23d">
        eso <span style={{ color: ACENTO }}>se dice</span>
      </Chip>
      <Chip desde={E.estudio} hasta={E.nada} x={540} y={330} color="#5fd2ff">
        DeWeber 2011 · <span style={{ color: ACENTO }}>215</span> adultos · 50–89 años
      </Chip>
      <Chip desde={E.nada} hasta={E.harvard} x={540} y={330}>
        los que crujen: <span style={{ color: ACENTO }}>no más</span> artrosis
      </Chip>
      <Chip desde={E.harvard} hasta={E.ojo} x={540} y={330} color="#5fd2ff">
        Harvard Health: <span style={{ color: ACENTO }}>probablemente no</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.medico} x={540} y={330} color="#ffb23d">
        crónico: <span style={{ color: ACENTO }}>menos fuerza de agarre</span>
      </Chip>
      <Chip desde={E.medico} hasta={E.pregunta} x={540} y={330} color="#5fd2ff">
        dolor o hinchazón: <span style={{ color: ACENTO }}>al médico</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        ¿vos te crujís? <span style={{ color: ACENTO }}>sí o no</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que te dice que te vas a arruinar las manos" />
      <Audio src={staticFile("064-nudillos-artritis/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.5, 8.6], mira: [0, 1.2, 0], fov: 40 }];
export const Portada064: React.FC = () => (
  <Portada arriba="crujirte los dedos" grande="¿da artritis?" sello="lo que dice la ciencia" colorSello={C.azul} numero={64}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Nudillo e={{ frame: 40, tension: 1, burbuja: 0, onda: 0.35, piel: 0.7, foco: 0 }} />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

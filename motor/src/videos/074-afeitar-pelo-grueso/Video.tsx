import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/074-afeitar-pelo-grueso/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Pelo, type EstadoPelo } from "../../kit3d/objetos/Pelo";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: dos pelos sobre un trozo de piel, sobre fondo azul noche. A la izquierda el pelo natural (punta fina);
// a la derecha el mismo pelo, que pasa la navaja y queda con la punta roma. Dato: Cleveland Clinic y Trotter 1928.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  reves: r.f(1),
  clinica: r.f(2),
  trotter: r.f(3),
  porque: r.f(4),
  ojo: r.f(5),
  consejo: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoPelo => {
  const navaja = k(f, E.porque + 6, E.porque + 50);
  return {
    frame: f,
    navaja: navaja >= 1 ? 0.999 : navaja,
    rebrote: k(f, E.porque + 50, E.porque + 80),
    foco: k(f, E.porque + 56, E.porque + 74) * (1 - k(f, E.ojo, E.ojo + 10)),
    hormona: k(f, E.ojo + 6, E.ojo + 40) * (1 - k(f, E.consejo + 20, E.consejo + 36)),
    piel: 1,
  };
};

const VISTA: Toma = { f: 0, pos: [0, 1.0, 8.2], mira: [0, 0.35, 0], fov: 40 };
const DER: Toma = { f: 0, pos: [1.0, 0.8, 5.2], mira: [1.3, 0.35, 0], fov: 36 };
const IZQ: Toma = { f: 0, pos: [-1.0, 0.8, 5.2], mira: [-1.3, 0.4, 0], fov: 36 };
const CEN: Toma = { f: 0, pos: [0, 0.8, 5.6], mira: [0, 0.4, 0], fov: 38 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...IZQ, f: E.reves },
  { ...VISTA, f: E.clinica },
  { ...CEN, f: E.trotter },
  { ...VISTA, f: E.porque },
  { ...DER, f: E.porque + 50 },
  { ...CEN, f: E.ojo },
  { ...VISTA, f: E.consejo },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["afeitás", "grueso", "afeitarte", "Cleveland", "Trotter", "áspero", "pubertad", "hormonas", "Mandáselo", "número"];
const CIFRAS: [string, string][] = [["mil novecientos veintiocho", "1928"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.reves, "scratch", 0.5],
  [E.clinica, "sello", 0.5],
  [E.trotter, "whoosh", 0.35],
  [E.porque + 6, "whoosh", 0.4],
  [E.porque + 50, "ding", 0.45],
  [E.ojo, "sello", 0.5],
  [E.consejo, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const AfeitarPeloGrueso3D: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Pelo e={estado(frame)} />
        <PisoSombra y={-0.06} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.reves} x={540} y={330} color="#ffb23d">
        afeitás = pelo <span style={{ color: ACENTO }}>más grueso</span>?
      </Chip>
      <Chip desde={E.reves} hasta={E.clinica} x={540} y={330} color="#5fd2ff">
        afeitar <span style={{ color: ACENTO }}>no cambia</span> el pelo
      </Chip>
      <Chip desde={E.clinica} hasta={E.trotter} x={540} y={330} color="#5fd2ff">
        Cleveland Clinic: <span style={{ color: ACENTO }}>ni más grueso</span>
      </Chip>
      <Chip desde={E.trotter} hasta={E.porque} x={540} y={330} color="#5fd2ff">
        Trotter · <span style={{ color: ACENTO }}>1928</span> · sin efecto
      </Chip>
      <Chip desde={E.porque + 50} hasta={E.ojo} x={540} y={330} color="#ffb23d">
        punta cortada <span style={{ color: ACENTO }}>= más áspero</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.consejo} x={540} y={330} color="#ffb23d">
        pubertad: <span style={{ color: ACENTO }}>hormonas</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        ¿a qué edad? <span style={{ color: ACENTO }}>un número</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice que si te afeitás, sale más grueso" />
      <Audio src={staticFile("074-afeitar-pelo-grueso/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.3, 7.2], mira: [0, 0.9, 0], fov: 40 }];
export const Portada074: React.FC = () => (
  <Portada arriba="afeitarte" grande="¿pelo más grueso?" sello="lo que dice la ciencia" colorSello={C.azul} numero={74}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Pelo e={{ frame: 40, navaja: 0.999, rebrote: 1, foco: 1, hormona: 0, piel: 1 }} />
      <PisoSombra y={-0.06} opacidad={0.25} />
    </Estudio>
  </Portada>
);

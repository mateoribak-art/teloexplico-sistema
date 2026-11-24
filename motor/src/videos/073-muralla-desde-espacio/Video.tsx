import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/073-muralla-desde-espacio/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Tierra, type EstadoTierra } from "../../kit3d/objetos/Tierra";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: la Tierra de perfil con la Estación Espacial en órbita (fuera de escala) y un trazo rojo que es la
// Muralla. Se dibuja la línea de altura (unos 400 km), la cámara se acerca a la Muralla (no se distingue) y al
// final resalta (el teleobjetivo de Leroy Chiao, 2004).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  yang: r.f(2),
  nasa: r.f(3),
  altura: r.f(4),
  color: r.f(5),
  ojo: r.f(6),
  consejo: r.f(7),
  pregunta: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const AMPLIO = { pos: [0, 0.4, 10.5] as [number, number, number], mira: [0.2, 0.5, 0] as [number, number, number], fov: 42 };
const TOMAS: Toma[] = [
  { f: 0, ...AMPLIO },
  { f: E.mito, ...AMPLIO },
  { f: E.yang, pos: [-0.5, 1.2, 9.0], mira: [-0.4, 1.2, 0], fov: 42 },
  { f: E.nasa, pos: [1.8, 1.8, 7.2], mira: [0.6, 0.8, 1.4], fov: 36 },
  { f: E.altura, pos: [-0.2, 0.8, 9.5], mira: [-0.1, 0.8, 0], fov: 42 },
  { f: E.color, pos: [1.9, 1.9, 5.6], mira: [0.84, 0.84, 2.09], fov: 28 },
  { f: E.ojo, pos: [1.5, 1.5, 5.0], mira: [0.84, 0.84, 2.09], fov: 20 },
  { f: E.consejo, ...AMPLIO },
  { f: E.pregunta, ...AMPLIO },
  { f: DURACION, ...AMPLIO },
];

const estado = (f: number): EstadoTierra => ({
  frame: f,
  iss: k(f, E.yang, E.yang + 20),
  linea: k(f, E.altura, E.altura + 25) * (1 - k(f, E.color, E.color + 10)),
  muralla: k(f, E.gancho + 20, E.gancho + 50),
  resalte: k(f, E.ojo, E.ojo + 30) * (1 - k(f, E.consejo, E.consejo + 15)),
});

const DESTACAR = ["mito", "Yang", "NASA", "cuatrocientos", "color", "Ojo:", "teleobjetivo", "comentario", "mandáselo"];
const CIFRAS: [string, string][] = [
  ["dos mil tres", "2003"],
  ["dos mil cuatro", "2004"],
  ["cuatrocientos kilómetros", "400 km"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mito, "scratch", 0.5],
  [E.yang, "whoosh", 0.35],
  [E.nasa, "whoosh", 0.35],
  [E.altura, "tic", 0.4],
  [E.altura + 25, "ding", 0.4],
  [E.color, "whoosh", 0.35],
  [E.ojo, "pop", 0.4],
  [E.consejo, "tic", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const Muralla3D073: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Tierra e={estado(frame)} />
      </Estudio>
      <Chip desde={0} hasta={E.mito} x={540} y={330}>
        ¿la <span style={{ color: ACENTO }}>Muralla</span> se ve desde el espacio?
      </Chip>
      <Chip desde={E.mito} hasta={E.yang} x={540} y={330} color="#ff5a5a">
        <span style={{ color: "#ff5a5a" }}>MITO</span>
      </Chip>
      <Chip desde={E.yang} hasta={E.nasa} x={540} y={330} color="#5fd2ff">
        2003 · Yang Liwei: <span style={{ color: "#5fd2ff" }}>no la vio</span>
      </Chip>
      <Chip desde={E.nasa} hasta={E.altura} x={540} y={330}>
        NASA: a simple vista, <span style={{ color: ACENTO }}>generalmente no</span>
      </Chip>
      <Chip desde={E.altura} hasta={E.color} x={540} y={330} color="#ffb23d">
        Estación Espacial: <span style={{ color: "#ffb23d" }}>~400 km</span>
      </Chip>
      <Chip desde={E.color} hasta={E.ojo} x={540} y={330}>
        color parecido al <span style={{ color: ACENTO }}>del suelo</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.consejo} x={540} y={330} color="#ff5a5a">
        2004 · Chiao: <span style={{ color: "#ff5a5a" }}>teleobjetivo</span>
      </Chip>
      <Chip desde={E.consejo} hasta={E.pregunta} x={540} y={330}>
        contale lo de <span style={{ color: ACENTO }}>Yang Liwei</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        ¿quién te lo contó a vos?
      </Chip>
      <Chip desde={E.cta} hasta={E.fin + 4} x={540} y={330}>
        GUARDALO: <span style={{ color: ACENTO }}>a ~400 km, a simple vista, no</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que dice que la Muralla se ve desde el espacio" />
      <Audio src={staticFile("073-muralla-desde-espacio/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 0.5, 10.0], mira: [0, 0.5, 0], fov: 42 }];
export const Portada073: React.FC = () => (
  <Portada arriba="no se ve desde el espacio" grande="¿LA MURALLA?" sello="MITO" colorSello={C.rojo} numero={73}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Tierra e={{ frame: 20, iss: 1, linea: 0, muralla: 1, resalte: 0.6 }} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-048-eggs-fridge/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Huevos, type EstadoHuevos } from "../../kit3d/objetos/Huevos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una mesada con un bowl de huevos (izquierda) y una caja fría con el cartón (derecha).
// Mecanismo: en EE. UU. los huevos se lavan (la cutícula se va) y el frío los mantiene; regla FDA para guardar.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  lavan: r.f(2),
  cuticula: r.f(3),
  estudio: r.f(4),
  fda: r.f(5),
  ojo: r.f(6),
  guardar: r.f(7),
  pregunta: r.f(8),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const estado = (f: number): EstadoHuevos => ({
  frame: f,
  mesada: interpolate(f, [0, 10], [0, 1], clamp),
  frio: interpolate(f, [E.golpe, E.golpe + 12], [0, 1], clamp),
  hero: interpolate(f, [E.lavan, E.lavan + 12, E.estudio, E.estudio + 10], [0, 1, 1, 0], clamp),
  cuticula: interpolate(f, [E.lavan + 12, E.cuticula, E.cuticula + 40], [1, 1, 0], clamp),
  tache: interpolate(f, [E.golpe, E.golpe + 8, E.pregunta], [0, 1, 1], clamp),
  tilde: interpolate(f, [E.estudio, E.estudio + 8, E.pregunta], [0, 1, 1], clamp),
  fantasma: interpolate(f, [E.golpe, E.golpe + 15], [0, 1], clamp),
});

const TOMAS: Toma[] = [
  { f: 0, pos: [-1.2, 2.0, 6.4], mira: [-1.5, 1.2, 0], fov: 40 },
  { f: E.golpe, pos: [0, 2.4, 7.4], mira: [0, 1.5, 0], fov: 42 },
  { f: E.lavan, pos: [0.2, 3.0, 5.6], mira: [0, 3.0, 0.3], fov: 38 },
  { f: E.cuticula, pos: [0, 3.2, 4.8], mira: [0, 3.2, 0.3], fov: 36 },
  { f: E.estudio, pos: [1.0, 2.6, 7.4], mira: [1.5, 1.3, 0], fov: 42 },
  { f: E.fda, pos: [1.2, 2.4, 6.6], mira: [1.7, 1.2, 0], fov: 40 },
  { f: E.ojo, pos: [0, 2.4, 7.4], mira: [0, 1.5, 0], fov: 42 },
  { f: E.guardar, pos: [1.0, 2.5, 7.2], mira: [1.5, 1.3, 0], fov: 42 },
  { f: DURACION, pos: [0, 2.4, 7.4], mira: [0, 1.5, 0], fov: 42 },
];

const DESTACAR = ["counter", "backwards", "wash", "refrigerate", "cuticle", "fridge", "forty", "carton", "three", "Fridge", "Save"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.golpe, "scratch", 0.5],
  [E.lavan, "sello", 0.5],
  [E.cuticula, "pop", 0.4],
  [E.estudio, "ding", 0.45],
  [E.fda, "ding", 0.45],
  [E.ojo, "pop", 0.4],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
];

export const EggsFridgeEn048: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Huevos e={estado(frame)} />
        <PisoSombra y={0.001} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.golpe} x={540} y={330}>
        eggs on the <span style={{ color: ACENTO }}>counter</span>?
      </Chip>
      <Chip desde={E.golpe} hasta={E.lavan} x={540} y={330} color="#ff5a4a">
        in the U.S.: <span style={{ color: "#ff8a7a" }}>backwards</span>
      </Chip>
      <Chip desde={E.lavan} hasta={E.cuticula} x={540} y={330}>
        <span style={{ color: ACENTO }}>USDA</span>: washed + refrigerated
      </Chip>
      <Chip desde={E.cuticula} hasta={E.estudio} x={540} y={330}>
        the <span style={{ color: ACENTO }}>cuticle</span> comes off
      </Chip>
      <Chip desde={E.estudio} hasta={E.fda} x={540} y={330}>
        <span style={{ color: ACENTO }}>fridge</span> = quality stays high
      </Chip>
      <Chip desde={E.fda} hasta={E.ojo} x={540} y={330}>
        <span style={{ color: ACENTO }}>FDA</span>: 40°F or below
      </Chip>
      <Chip desde={E.ojo} hasta={E.guardar} x={540} y={330}>
        about eggs sold in the <span style={{ color: ACENTO }}>U.S.</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={300}>
        <span style={{ color: ACENTO }}>fridge</span> · 40°F or below
      </Chip>
      <Chip desde={E.guardar + 10} hasta={E.pregunta} x={540} y={400}>
        original <span style={{ color: ACENTO }}>carton</span>
      </Chip>
      <Chip desde={E.guardar + 20} hasta={E.pregunta} x={540} y={500}>
        <span style={{ color: ACENTO }}>3 weeks</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        <span style={{ color: "#5fd2ff" }}>fridge</span> or <span style={{ color: "#5fd2ff" }}>counter</span>?
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to whoever keeps eggs on the counter" />
      <Audio src={staticFile("en-048-eggs-fridge/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.6, 7.2], mira: [0, 1.6, 0], fov: 42 }];
export const PortadaEn048: React.FC = () => (
  <Portada arriba="eggs on the counter?" grande="in the U.S., fridge" sello="FRIDGE" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Huevos e={{ frame: 40, mesada: 1, frio: 1, hero: 1, cuticula: 0, tache: 1, tilde: 1, fantasma: 1 }} />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-042-frozen-pipes/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Cano, type EstadoCano } from "../../kit3d/objetos/Cano";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un caño de cobre con agua y una llave, en una pared; copos de frío afuera.
// Mecanismo: el frío congela el caño; goteo (agua en movimiento), gabinete abierto y calefacción lo bajan.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  arreglo: r.f(1),
  fema: r.f(2),
  nws: r.f(3),
  calef: r.f(4),
  ojo: r.f(5),
  guardar: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const estado = (f: number): EstadoCano => {
  const hielo = interpolate(f, [E.gancho, E.arreglo, E.fema, E.nws, E.ojo], [0.1, 0.7, 0.7, 0.35, 0.3], clamp);
  const gota = interpolate(f, [E.arreglo, E.arreglo + 15, E.cta], [0, 1, 1], clamp);
  const calor = interpolate(f, [E.nws, E.nws + 20, E.ojo], [0, 1, 0.8], clamp);
  return { frame: f, hielo, gota, calor, frio: 1 };
};

const VISTA: Toma = { f: 0, pos: [0, 2.0, 8.4], mira: [0, 1.0, 0], fov: 40 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { f: E.arreglo, pos: [2.2, 1.2, 6.0], mira: [2.0, 0.6, 0], fov: 38 },
  { f: E.fema, pos: [1.6, 1.4, 5.4], mira: [1.0, 0.9, 0], fov: 38 },
  { f: E.nws, pos: [-0.6, 1.8, 6.4], mira: [-0.4, 0.9, 0], fov: 40 },
  { f: E.calef, pos: [0, 2.0, 7.2], mira: [0, 1.0, 0], fov: 40 },
  { f: E.guardar, pos: [0, 2.0, 8.4], mira: [0, 1.0, 0], fov: 40 },
  { f: DURACION, pos: [0, 2.0, 8.0], mira: [0, 1.0, 0], fov: 40 },
];

const DESTACAR = ["freeze", "drip", "cabinet", "cabinets", "doors", "heat", "fifty-five", "Save"];
const CIFRAS: [string, string][] = [["fifty-five", "55°F"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.arreglo, "ding", 0.45],
  [E.fema, "sello", 0.5],
  [E.nws, "sello", 0.5],
  [E.calef, "ding", 0.4],
  [E.ojo, "pop", 0.4],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
];

export const FrozenPipesEn042: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Cano e={estado(frame)} />
        <PisoSombra y={-1.2} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.arreglo} x={540} y={330}>
        pipes can <span style={{ color: ACENTO }}>freeze</span> overnight
      </Chip>
      <Chip desde={E.arreglo} hasta={E.fema} x={540} y={330}>
        let it <span style={{ color: ACENTO }}>drip</span>
      </Chip>
      <Chip desde={E.fema + 6} hasta={E.nws} x={540} y={330}>
        <span style={{ color: ACENTO }}>FEMA</span>: water keeps moving
      </Chip>
      <Chip desde={E.nws + 6} hasta={E.calef} x={540} y={330}>
        <span style={{ color: ACENTO }}>NWS</span>: open the cabinets
      </Chip>
      <Chip desde={E.calef} hasta={E.ojo} x={540} y={330}>
        heat on: <span style={{ color: ACENTO }}>55°F</span> or higher
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.guardar} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>not</span> a guarantee
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={300}>
        <span style={{ color: ACENTO }}>drip</span> the faucet
      </Chip>
      <Chip desde={E.guardar + 10} hasta={E.pregunta} x={540} y={400}>
        open the <span style={{ color: ACENTO }}>cabinets</span>
      </Chip>
      <Chip desde={E.guardar + 20} hasta={E.pregunta} x={540} y={500}>
        keep the <span style={{ color: ACENTO }}>heat</span> on
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        drip when it freezes? <span style={{ color: "#5fd2ff" }}>yes / no</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to whoever finds out in the morning" />
      <Audio src={staticFile("en-042-frozen-pipes/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.8, 7.4], mira: [0, 1.0, 0], fov: 40 }];
export const PortadaEn042: React.FC = () => (
  <Portada arriba="freezing night?" grande="drip the faucet" sello="SAVE THIS" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Cano e={{ frame: 40, hielo: 0.6, gota: 1, calor: 0, frio: 1 }} />
      <PisoSombra y={-1.2} opacidad={0.25} />
    </Estudio>
  </Portada>
);

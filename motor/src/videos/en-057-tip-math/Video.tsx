import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-057-tip-math/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Propina, type EstadoPropina } from "../../kit3d/objetos/Propina";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: cuatro barras ($50 la cuenta, $5 el 10 %, $10 el 20 %, $7.50 el 15 %).
// Mecanismo: 10 % = correr la coma; 20 % = el doble; 15 % = 10 % + la mitad.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  diez: r.f(2),
  veinte: r.f(3),
  quince: r.f(4),
  ojo: r.f(5),
  guardar: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const estado = (f: number): EstadoPropina => ({
  frame: f,
  cuenta: interpolate(f, [E.gancho, E.gancho + 20], [0, 1], clamp),
  diez: interpolate(f, [E.diez + 20, E.diez + 50], [0, 1], clamp),
  veinte: interpolate(f, [E.veinte, E.veinte + 30], [0, 1], clamp),
  quince: interpolate(f, [E.quince + 20, E.quince + 50], [0, 1], clamp),
});

const VISTA: Toma = { f: 0, pos: [0, 1.2, 11.5], mira: [0, 0.4, 0], fov: 40 };

const TOMAS: Toma[] = [
  { f: 0, pos: [0, 1.2, 11.0], mira: [0, 0.4, 0], fov: 40 },
  { ...VISTA, f: E.golpe },
  { f: E.diez, pos: [-0.5, 1.2, 10.5], mira: [-0.5, 0.4, 0], fov: 40 },
  { f: E.veinte, pos: [0.0, 1.2, 10.5], mira: [0.0, 0.4, 0], fov: 40 },
  { f: E.quince, pos: [0.4, 1.2, 10.5], mira: [0.4, 0.4, 0], fov: 40 },
  { ...VISTA, f: E.ojo },
  { ...VISTA, f: E.guardar },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["tip", "ten", "twenty", "fifteen", "double", "decimal", "percent"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.golpe, "scratch", 0.5],
  [E.diez + 20, "ding", 0.45],
  [E.veinte + 10, "ding", 0.45],
  [E.quince + 20, "ding", 0.45],
  [E.ojo, "pop", 0.4],
  [E.guardar, "sello", 0.5],
  [E.pregunta, "pop", 0.4],
];

export const TipMathEn057: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Propina e={estado(frame)} />
        <PisoSombra y={0.001} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.golpe} x={540} y={330}>
        figure the <span style={{ color: ACENTO }}>tip</span> in your head
      </Chip>
      <Chip desde={E.golpe} hasta={E.diez} x={540} y={330}>
        two steps · <span style={{ color: ACENTO }}>no calculator</span>
      </Chip>
      <Chip desde={E.diez + 6} hasta={E.veinte} x={540} y={330}>
        $50 → slide the decimal → <span style={{ color: ACENTO }}>$5 (10%)</span>
      </Chip>
      <Chip desde={E.veinte + 6} hasta={E.quince} x={540} y={330}>
        $5 × 2 = <span style={{ color: ACENTO }}>$10 (20%)</span>
      </Chip>
      <Chip desde={E.quince + 6} hasta={E.ojo} x={540} y={330}>
        $5 + $2.50 = <span style={{ color: ACENTO }}>$7.50 (15%)</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.guardar} x={540} y={330}>
        check for a <span style={{ color: ACENTO }}>service charge</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={330}>
        10% = slide · 20% = <span style={{ color: ACENTO }}>double</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        what do you tip? <span style={{ color: "#5fd2ff" }}>a percent</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who pulls out a calculator at dinner" />
      <Audio src={staticFile("en-057-tip-math/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 1.2, 11.5], mira: [0, 0.4, 0], fov: 40 }];
export const PortadaEn057: React.FC = () => (
  <Portada arriba="Tip in your head" grande="slide it, then double it" sello="MATH" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Propina e={{ frame: 40, cuenta: 1, diez: 1, veinte: 1, quince: 1 }} />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

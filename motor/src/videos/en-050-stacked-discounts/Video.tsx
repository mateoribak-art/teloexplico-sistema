import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-050-stacked-discounts/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Descuentos, type EstadoDescuentos } from "../../kit3d/objetos/Descuentos";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: tres barras de precio ($100, $80, $64) y un marco fantasma en $60.
// Mecanismo: el segundo descuento se aplica sobre lo que queda: 0.8 x 0.8 = 0.64.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  cien: r.f(2),
  extra: r.f(3),
  ojo: r.f(4),
  regla: r.f(5),
  guardar: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const estado = (f: number): EstadoDescuentos => ({
  frame: f,
  b100: interpolate(f, [E.gancho, E.gancho + 20], [0, 1], clamp),
  b80: interpolate(f, [E.cien + 20, E.cien + 50], [0, 1], clamp),
  b64: interpolate(f, [E.extra, E.extra + 40], [0, 1], clamp),
  fantasma: interpolate(f, [E.golpe, E.golpe + 15], [0, 1], clamp) * (f < E.extra + 40 ? 1 : 0.6),
});

const VISTA: Toma = { f: 0, pos: [-0.35, 1.6, 10.5], mira: [-0.35, 1.2, 0], fov: 40 };

const TOMAS: Toma[] = [
  { f: 0, pos: [-1.4, 1.6, 8.6], mira: [-1.4, 1.2, 0], fov: 40 },
  { ...VISTA, f: E.golpe },
  { f: E.cien, pos: [-1.1, 1.5, 9.0], mira: [-1.1, 1.2, 0], fov: 40 },
  { f: E.extra, pos: [0.4, 1.5, 9.0], mira: [0.4, 1.2, 0], fov: 40 },
  { ...VISTA, f: E.ojo },
  { f: E.regla, pos: [0.4, 1.5, 9.4], mira: [0.4, 1.2, 0], fov: 40 },
  { ...VISTA, f: E.guardar },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["twenty", "thirty-six", "eighty", "sixty-four", "multiply", "Black", "Friday", "percent", "half"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.golpe, "scratch", 0.5],
  [E.cien + 20, "ding", 0.45],
  [E.extra + 10, "ding", 0.45],
  [E.ojo, "pop", 0.4],
  [E.regla, "sello", 0.5],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
];

export const StackedDiscountsEn050: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Descuentos e={estado(frame)} />
        <PisoSombra y={0.001} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.golpe} x={540} y={330}>
        <span style={{ color: ACENTO }}>20%</span> off + <span style={{ color: ACENTO }}>20%</span> off
      </Chip>
      <Chip desde={E.golpe} hasta={E.cien} x={540} y={330}>
        not 40% · <span style={{ color: ACENTO }}>36% off</span>
      </Chip>
      <Chip desde={E.cien + 6} hasta={E.extra} x={540} y={330}>
        $100 − 20% = <span style={{ color: ACENTO }}>$80</span>
      </Chip>
      <Chip desde={E.extra + 6} hasta={E.ojo} x={540} y={330}>
        $80 − 20% = <span style={{ color: ACENTO }}>$64</span> (not $60)
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.regla} x={540} y={330}>
        check the <span style={{ color: ACENTO }}>fine print</span>
      </Chip>
      <Chip desde={E.regla} hasta={E.guardar} x={540} y={330}>
        80% × 80% = <span style={{ color: ACENTO }}>64%</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={330}>
        multiply <span style={{ color: ACENTO }}>what's left</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        biggest discount? <span style={{ color: "#5fd2ff" }}>a percent</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend who says everything is basically half off" />
      <Audio src={staticFile("en-050-stacked-discounts/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [-0.35, 1.6, 10.5], mira: [-0.35, 1.2, 0], fov: 40 }];
export const PortadaEn050: React.FC = () => (
  <Portada arriba="20% off + 20% off" grande="is not 40% off" sello="MATH" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Descuentos e={{ frame: 40, b100: 1, b80: 1, b64: 1, fantasma: 1 }} />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

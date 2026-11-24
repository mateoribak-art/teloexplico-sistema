import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-043-coffee-math/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Taza, type EstadoTaza } from "../../kit3d/objetos/Taza";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: un café para llevar y, al lado, una pila de monedas que crece con los días.
// Mecanismo: precio diario x 365 = costo anual. Pila grande = todo el año; pila chica = solo días de semana.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  suma: r.f(1),
  mate: r.f(2),
  semana: r.f(3),
  ojo: r.f(4),
  regla: r.f(5),
  guardar: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const estado = (f: number): EstadoTaza => {
  const pila = interpolate(f, [E.suma, E.mate + 40], [0, 1], clamp);
  const pila2 = interpolate(f, [E.semana, E.semana + 40], [0, 0.71], clamp);
  const vapor = interpolate(f, [E.gancho, E.gancho + 20], [0.4, 1], clamp);
  return { frame: f, vapor, pila, pila2 };
};

const VISTA: Toma = { f: 0, pos: [0.4, 1.9, 7.2], mira: [0.5, 1.3, 0], fov: 40 };

const TOMAS: Toma[] = [
  { f: 0, pos: [-0.8, 1.6, 5.2], mira: [-1.3, 1.2, 0], fov: 38 },
  { ...VISTA, f: E.suma },
  { f: E.mate, pos: [1.2, 1.8, 6.4], mira: [0.9, 1.3, 0], fov: 38 },
  { f: E.semana, pos: [1.2, 1.6, 6.2], mira: [1.4, 1.0, 0], fov: 38 },
  { ...VISTA, f: E.ojo },
  { f: E.regla, pos: [0.9, 1.6, 6.0], mira: [0.9, 1.0, 0], fov: 38 },
  { ...VISTA, f: E.guardar },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["five", "1,825", "eighteen", "hundred", "thirteen", "weekdays", "worth", "Save", "number", "dollar", "times"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.suma, "scratch", 0.5],
  [E.mate, "ding", 0.45],
  [E.semana, "ding", 0.4],
  [E.ojo, "pop", 0.4],
  [E.regla, "sello", 0.5],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
];

export const CoffeeMathEn043: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Taza e={estado(frame)} />
        <PisoSombra y={0.001} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.suma} x={540} y={330}>
        <span style={{ color: ACENTO }}>$5</span> coffee
      </Chip>
      <Chip desde={E.suma} hasta={E.mate} x={540} y={330}>
        <span style={{ color: ACENTO }}>$1,825</span> a year
      </Chip>
      <Chip desde={E.mate + 6} hasta={E.semana} x={540} y={330}>
        $5 × <span style={{ color: ACENTO }}>365</span> days
      </Chip>
      <Chip desde={E.semana + 6} hasta={E.ojo} x={540} y={330}>
        $5 × 260 weekdays = <span style={{ color: ACENTO }}>$1,300</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.regla} x={540} y={330}>
        no lecture: <span style={{ color: ACENTO }}>know the number</span>
      </Chip>
      <Chip desde={E.regla} hasta={E.guardar} x={540} y={330}>
        daily price × <span style={{ color: ACENTO }}>365</span>
      </Chip>
      <Chip desde={E.regla + 30} hasta={E.guardar} x={540} y={430}>
        $1 a day = <span style={{ color: ACENTO }}>$365</span> a year
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={330}>
        <span style={{ color: ACENTO }}>×365</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        coffees a week? <span style={{ color: "#5fd2ff" }}>a number</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to the friend with the six-modifier coffee order" />
      <Audio src={staticFile("en-043-coffee-math/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.6, 1.8, 6.2], mira: [0.5, 1.2, 0], fov: 40 }];
export const PortadaEn043: React.FC = () => (
  <Portada arriba="your daily $5 coffee" grande="costs $1,825 a year" sello="MATH" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Taza e={{ frame: 40, vapor: 1, pila: 1, pila2: 0.71 }} />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/077-apellidos-gonzalez/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Multitud, type EstadoMultitud } from "../../kit3d/objetos/Multitud";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: 100 personas en grilla (cada una = 1 % de los argentinos). 10 se pintan de dorado (los diez apellidos más comunes),
// 3 se agrandan (González, Rodríguez, Gómez) y el resto se vuelve de mil colores (348.288 apellidos distintos).
// Dato: Dirección Nacional de Población, datos del Renaper a diciembre de 2021.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  diez: r.f(1),
  fuente: r.f(2),
  tres: r.f(3),
  miles: r.f(4),
  osea: r.f(5),
  ojo: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoMultitud => ({
  frame: f,
  aparece: k(f, 0, E.diez - 6),
  oro: k(f, E.diez, E.diez + 20),
  tres: k(f, E.tres + 20, E.tres + 40) * (1 - k(f, E.miles, E.miles + 10) * 0.6),
  colores: k(f, E.miles, E.miles + 40),
});

const VISTA: Toma = { f: 0, pos: [0, 10.5, 12.5], mira: [0, 0.3, 0], fov: 42 };
const CERCA: Toma = { f: 0, pos: [0, 9, 11], mira: [0, 0.3, 0], fov: 42 };
const LEJOS: Toma = { f: 0, pos: [0, 13, 13.5], mira: [0, 0, 0], fov: 44 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...CERCA, f: E.diez },
  { ...VISTA, f: E.fuente },
  { ...CERCA, f: E.tres },
  { ...LEJOS, f: E.miles },
  { ...VISTA, f: E.osea },
  { ...VISTA, f: E.pregunta },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["González", "diez", "Renaper", "Rodríguez", "Gómez", "apellidos", "documento", "Mandáselo", "número", "tres", "distintos"];
const CIFRAS: [string, string][] = [
  ["diez coma cuatro por ciento", "10,4 %"],
  ["trescientos cuarenta y ocho mil", "348.288"],
  ["dos mil veintiuno", "2021"],
  ["uno de cada diez", "1 de cada 10"],
];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.diez, "pop", 0.45],
  [E.fuente, "ding", 0.4],
  [E.tres, "sello", 0.45],
  [E.miles, "whoosh", 0.45],
  [E.osea, "pop", 0.35],
  [E.ojo, "scratch", 0.4],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const ApellidosGonzalez3D: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Multitud e={estado(frame)} />
        <PisoSombra y={0} />
      </Estudio>
      <Chip desde={E.gancho + 14} hasta={E.diez} x={540} y={330} color="#ffd23f">
        cada uno = <span style={{ color: ACENTO }}>1 % del país</span>
      </Chip>
      <Chip desde={E.diez} hasta={E.fuente} x={540} y={330} color="#ffd23f">
        <span style={{ color: ACENTO }}>10 apellidos</span> · 1 de cada 10
      </Chip>
      <Chip desde={E.fuente} hasta={E.tres} x={540} y={330} color="#5fd2ff">
        Renaper 2021 · <span style={{ color: ACENTO }}>10,4 %</span>
      </Chip>
      <Chip desde={E.tres} hasta={E.miles} x={540} y={330} color="#ffd23f">
        <span style={{ color: ACENTO }}>1 González</span> · 2 Rodríguez · 3 Gómez
      </Chip>
      <Chip desde={E.miles} hasta={E.osea} x={540} y={330} color="#37d67a">
        <span style={{ color: ACENTO }}>348.288</span> apellidos distintos
      </Chip>
      <Chip desde={E.osea} hasta={E.ojo} x={540} y={330} color="#37d67a">
        pocos · <span style={{ color: ACENTO }}>muchísima gente</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.pregunta} x={540} y={330} color="#ff9a2e">
        personas vivas · <span style={{ color: ACENTO }}>con documento</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        ¿cuántos González? <span style={{ color: ACENTO }}>un número</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al González del grupo" />
      <Audio src={staticFile("077-apellidos-gonzalez/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 8.5, 10], mira: [0, 0.3, 0], fov: 42 }];
export const Portada077: React.FC = () => (
  <Portada arriba="el apellido más común" grande="¿Cuántos González conocés?" sello="1 de cada 10" colorSello={C.azul} numero={77}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Multitud e={{ frame: 30, aparece: 1, oro: 1, tres: 1, colores: 0, }} />
      <PisoSombra y={0} opacidad={0.25} />
    </Estudio>
  </Portada>
);

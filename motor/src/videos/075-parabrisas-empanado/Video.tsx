import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/075-parabrisas-empanado/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Parabrisas, type EstadoParabrisas } from "../../kit3d/objetos/Parabrisas";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: parabrisas visto desde adentro, fondo azul noche, con dos teclas en el tablero (A/C y recirculación).
// Dato: manuales del propietario de Mazda y de Kia.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  vuelve: r.f(1),
  humedad: r.f(2),
  ac: r.f(3),
  recirc: r.f(4),
  ojo: r.f(5),
  guardalo: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const estado = (f: number): EstadoParabrisas => {
  const recircOn = k(f, E.recirc + 4, E.recirc + 10) * (1 - k(f, E.ojo - 6, E.ojo));
  const acOn = k(f, E.ac + 20, E.ac + 28) * (1 - k(f, E.recirc + 4, E.recirc + 10)) + k(f, E.guardalo, E.guardalo + 8) * 0 + k(f, E.ojo - 6, E.ojo);
  const seca =
    k(f, E.ac + 30, E.ac + 100) * (1 - 0.6 * k(f, E.recirc + 10, E.recirc + 50)) * (1 - k(f, E.ojo, E.ojo + 10)) +
    k(f, E.guardalo, E.guardalo + 40);
  return {
    frame: f,
    vaho: k(f, 0, 14),
    mano: k(f, E.gancho + 26, E.vuelve - 4),
    vapor: k(f, E.humedad, E.humedad + 14) * (1 - k(f, E.ac, E.ac + 14)),
    ac: Math.min(1, acOn),
    recirc: recircOn,
    seca: Math.min(1, seca) * (1 - k(f, E.ojo, E.ojo + 10)) + k(f, E.guardalo, E.guardalo + 40) * 0,
    afuera: k(f, E.ojo + 20, E.ojo + 40) * (1 - k(f, E.guardalo, E.guardalo + 10)),
  };
};

const VISTA: Toma = { f: 0, pos: [0, 2.0, 8.0], mira: [0, 1.8, 0], fov: 42 };
const TABLERO: Toma = { f: 0, pos: [0, 1.9, 6.0], mira: [0, 1.7, 0.4], fov: 40 };
const VIDRIO: Toma = { f: 0, pos: [0.8, 2.3, 5.6], mira: [0, 2.1, 0], fov: 38 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { ...VIDRIO, f: E.vuelve },
  { ...VISTA, f: E.humedad },
  { ...TABLERO, f: E.ac },
  { ...TABLERO, f: E.recirc },
  { ...VIDRIO, f: E.ojo },
  { ...TABLERO, f: E.guardalo },
  { ...VISTA, f: E.pregunta },
  { ...VISTA, f: DURACION },
];

const DESTACAR = ["parabrisas", "empaña", "humedad", "Mazda", "Kia", "aire", "acondicionado", "recirculación", "Guardalo", "templada", "palabra", "Mandáselo"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.gancho + 26, "whoosh", 0.35],
  [E.vuelve, "scratch", 0.5],
  [E.humedad, "pop", 0.4],
  [E.ac + 20, "ding", 0.45],
  [E.recirc + 4, "sello", 0.5],
  [E.ojo, "sello", 0.5],
  [E.guardalo, "ding", 0.45],
  [E.pregunta, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const ParabrisasEmpanado3D: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Parabrisas e={estado(frame)} />
        <PisoSombra y={-0.6} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.vuelve} x={540} y={330} color="#ffb23d">
        vidrio <span style={{ color: ACENTO }}>empañado</span>
      </Chip>
      <Chip desde={E.vuelve} hasta={E.humedad} x={540} y={330} color="#ffb23d">
        la mano <span style={{ color: ACENTO }}>no alcanza</span>
      </Chip>
      <Chip desde={E.humedad} hasta={E.ac} x={540} y={330} color="#5fd2ff">
        humedad <span style={{ color: ACENTO }}>+ vidrio frío</span>
      </Chip>
      <Chip desde={E.ac} hasta={E.recirc} x={540} y={330} color="#37d67a">
        Mazda y Kia: <span style={{ color: ACENTO }}>aire acond. ON</span>
      </Chip>
      <Chip desde={E.recirc} hasta={E.ojo} x={540} y={330} color="#ff9a2e">
        Mazda: recirculación <span style={{ color: ACENTO }}>= más vaho</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.guardalo} x={540} y={330} color="#5fd2ff">
        frío al máximo = <span style={{ color: ACENTO }}>vaho por afuera</span>
      </Chip>
      <Chip desde={E.guardalo} hasta={E.pregunta} x={540} y={330} color="#37d67a">
        A/C <span style={{ color: ACENTO }}>ON</span> · recirculación <span style={{ color: ACENTO }}>OFF</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330}>
        ¿mano o manga? <span style={{ color: ACENTO }}>una palabra</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que maneja con el vidrio empañado" />
      <Audio src={staticFile("075-parabrisas-empanado/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.0, 7.4], mira: [0, 1.7, 0], fov: 42 }];
export const Portada075: React.FC = () => (
  <Portada arriba="se empaña" grande="¿lo limpiás con la mano?" sello="hacé esto" colorSello={C.azul} numero={75}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Parabrisas e={{ frame: 40, vaho: 1, mano: 0.4, vapor: 0, ac: 0, recirc: 0, seca: 0, afuera: 0 }} />
      <PisoSombra y={-0.6} opacidad={0.25} />
    </Estudio>
  </Portada>
);

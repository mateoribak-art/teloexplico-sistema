import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/025-noquis-del-29/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Plato, type EstadoPlato } from "../../kit3d/objetos/Plato";
import { Portada } from "../../kit/Portada";
import { C, mono } from "../../kit/marca";

// Un plato de ñoquis con plata abajo, vista de cerca. Mismo plato todo el video:
// se levanta para mostrar las monedas de la leyenda (San Pantaleón), la leyenda se apaga
// (sin registro histórico conocido), una barra de plata del mes se vacía (la explicación terrenal)
// y vuelve el billete abajo del plato (el consejo).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  problema: r.f(1),
  leyenda: r.f(2),
  monedas: r.f(3),
  monedasPal: r.w(3, "monedas"),
  sinReg: r.f(4),
  terrenal: r.f(5),
  baratos: r.w(5, "baratos"),
  inmig: r.f(6),
  ojo: r.f(7),
  consejo: r.f(8),
  guardalo: r.w(8, "guardalo"),
  cta: r.f(9),
  fin: r.fin(9),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** interpolación por tramos que tolera frames repetidos (frases muy pegadas) */
const k = (frame: number, pares: [number, number][]) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of pares) {
    const xx = xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x;
    xs.push(xx);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const TOMAS: Toma[] = [
  // gancho: el plato entero, en 3/4, con el billete asomando
  { f: 0, pos: [3.6, 6.4, 12.5], mira: [0, 0.2, 0], fov: 34 },
  { f: E.problema, pos: [1.6, 6.0, 12.2], mira: [0, 0.2, 0], fov: 34 },
  // leyenda: baja y se acerca al borde del plato
  { f: E.leyenda + 12, pos: [-3.0, 4.2, 10.2], mira: [0, 0.4, 0], fov: 34 },
  // monedas: casi a ras de mesa, el plato levantado
  { f: E.monedas, pos: [-1.0, 2.6, 9.2], mira: [0, 0.6, 0], fov: 32 },
  { f: E.sinReg, pos: [1.2, 2.4, 9.0], mira: [0, 0.6, 0], fov: 32 },
  // terrenal: desde arriba, la plata del mes
  { f: E.terrenal + 10, pos: [0.4, 9.5, 8.2], mira: [0, 0.1, 0], fov: 36 },
  { f: E.inmig - 2, pos: [0.2, 9.0, 8.6], mira: [0, 0.1, 0], fov: 36 },
  // inmigración: se aleja y gira
  { f: E.ojo - 6, pos: [-4.6, 5.4, 11.6], mira: [0, 0.2, 0], fov: 34 },
  { f: E.consejo - 2, pos: [-3.0, 5.2, 11.4], mira: [0, 0.3, 0], fov: 34 },
  // consejo: vuelve al plano del principio
  { f: E.guardalo, pos: [2.4, 5.4, 11.8], mira: [0, 0.2, 0], fov: 34 },
  { f: DURACION, pos: [3.6, 6.4, 12.5], mira: [0, 0.2, 0], fov: 34 },
];

const estado = (frame: number): EstadoPlato => ({
  frame,
  noquis: k(frame, [[0, 0], [20, 1]]),
  vapor: k(frame, [[10, 0], [26, 1], [E.leyenda, 1], [E.leyenda + 10, 0.4], [E.cta, 0.4]]),
  billete: k(frame, [
    [0, 1],
    [E.leyenda, 1],
    [E.leyenda + 14, 0],
    [E.consejo + 20, 0],
    [E.consejo + 36, 1],
    [E.guardalo, 1],
    [E.guardalo + 12, 0],
  ]),
  lift: k(frame, [
    [E.monedas - 6, 0],
    [E.monedas + 10, 1],
    [E.terrenal - 4, 1],
    [E.terrenal + 8, 0],
    [E.consejo + 10, 0],
    [E.consejo + 22, 1],
    [E.consejo + 40, 1],
    [E.consejo + 50, 0],
  ]),
  fantasma: k(frame, [
    [E.monedas - 6, 0],
    [E.monedas + 10, 0.55],
    [E.terrenal - 4, 0.55],
    [E.terrenal + 8, 0],
  ]),
  monedas: k(frame, [
    [E.monedasPal - 2, 0],
    [E.monedasPal + 8, 1],
    [E.sinReg + 24, 1],
    [E.sinReg + 40, 0],
  ]),
});

/** Barra "plata del mes": se vacía mientras la voz dice que a fin de mes no alcanzaba. */
const Barra: React.FC = () => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [E.terrenal + 4, E.terrenal + 14, E.inmig - 8, E.inmig], [0, 1, 1, 0], clamp);
  if (v <= 0) return null;
  const llena = interpolate(frame, [E.terrenal + 14, E.baratos], [100, 8], clamp);
  const rojo = llena < 30;
  return (
    <div style={{ position: "absolute", left: 140, right: 140, top: 440, opacity: v, transform: `translateY(${(1 - v) * 20}px)` }}>
      <div style={{ fontFamily: mono, fontSize: 34, letterSpacing: 2, color: "rgba(255,255,255,0.85)", marginBottom: 12 }}>// PLATA DEL MES</div>
      <div style={{ height: 46, borderRadius: 23, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.4)", overflow: "hidden" }}>
        <div style={{ width: `${llena}%`, height: "100%", background: rojo ? "#ff5a4a" : ACENTO, borderRadius: 23 }} />
      </div>
    </div>
  );
};

const DESTACAR = ["29", "plata", "leyenda", "monedas", "registro", "terrenal", "baratos", "italiana", "ojo", "suerte", "billete", "guardalo", "Mandáselo"];
const CIFRAS: [string, string][] = [["veintinueve", "29"]];

const efectos: Efecto[] = [
  [E.gancho + 4, "whoosh", 0.35],
  [E.problema - 2, "scratch", 0.45],
  [E.leyenda, "whoosh", 0.35],
  [E.monedasPal, "ding", 0.55],
  [E.sinReg, "sello", 0.55],
  [E.terrenal, "whoosh", 0.35],
  [E.terrenal + 14, "tic", 0.5],
  [E.baratos, "pop", 0.45],
  [E.inmig, "whoosh", 0.35],
  [E.ojo, "sello", 0.5],
  [E.consejo, "whoosh", 0.35],
  [E.consejo + 36, "pop", 0.5],
  [E.guardalo, "ding", 0.45],
  [E.cta, "pop", 0.4],
];

export const NoquisDel29: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Plato e={e} />
        <PisoSombra />
      </Estudio>
      <Chip desde={6} hasta={E.problema + 20} x={540} y={330}>
        Todos los meses: <span style={{ color: ACENTO }}>29</span>
      </Chip>
      <Chip desde={E.leyenda + 4} hasta={E.sinReg} x={540} y={330}>
        <span style={{ color: ACENTO }}>Leyenda</span> · norte de Italia
      </Chip>
      <Chip desde={E.leyenda + 20} hasta={E.sinReg} x={540} y={240} color="#5fd2ff">
        La Nación · 2022
      </Chip>
      <Chip desde={E.sinReg + 6} hasta={E.terrenal} x={540} y={330} color="#ff5a4a">
        Registro que lo confirme: <span style={{ color: "#ff8a7a" }}>ninguno</span>
      </Chip>
      <Chip desde={E.terrenal + 4} hasta={E.inmig} x={540} y={330}>
        <span style={{ color: ACENTO }}>Fin de mes</span> · ñoquis rinden
      </Chip>
      <Chip desde={E.inmig + 2} hasta={E.ojo} x={540} y={330}>
        Italia <span style={{ color: ACENTO }}>→</span> Río de la Plata
      </Chip>
      <Chip desde={E.inmig + 10} hasta={E.ojo} x={540} y={240} color="#5fd2ff">
        ABC Color · 2025
      </Chip>
      <Chip desde={E.ojo + 4} hasta={E.consejo} x={540} y={330} color="#ff5a4a">
        Buena suerte <span style={{ color: "#ff8a7a" }}>≠ sueldo</span>
      </Chip>
      <Chip desde={E.consejo + 4} hasta={E.cta} x={540} y={330}>
        Poné el <span style={{ color: ACENTO }}>billete</span> · guardalo
      </Chip>
      <Barra />
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que se olvida de los ñoquis del 29" />
      <Audio src={staticFile("025-noquis-del-29/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

// Portada: el molde parejo de la grilla con el plato 3D abajo.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [3.4, 7.0, 12.8], mira: [0, 1.2, 0], fov: 34 }];
export const Portada025: React.FC = () => (
  <Portada arriba="¿por qué comemos ñoquis el 29?" grande="la leyenda no cierra" sello="COSTUMBRES" colorSello={C.azul} numero={25}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Plato e={{ ...estado(30), frame: 30, noquis: 1, billete: 1, vapor: 1 }} />
      <PisoSombra opacidad={0.25} />
    </Estudio>
  </Portada>
);

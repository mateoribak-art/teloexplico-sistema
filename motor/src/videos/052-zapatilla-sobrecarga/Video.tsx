import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/052-zapatilla-sobrecarga/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Portada } from "../../kit/Portada";
import { C, display, mono } from "../../kit/marca";
import { ParedEnchufe, Zapatilla, type EstadoZapatilla } from "../../kit3d/objetos/Zapatilla";

// Un solo mundo: una zapatilla sobre una mesada oscura con dos electrodomésticos colgados. La corriente
// baja por los cables, el cuerpo se recalienta (rojo), sale humo y una llama; un medidor muestra que el
// consumo pasa el límite (10 A · 2200 W). Al final, la forma correcta: el enchufe directo a la pared.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  corriente: r.w(2, "corriente"),
  recalienta: r.w(3, "recalienta"),
  fuego: r.w(3, "fuego"),
  dato: r.f(4),
  vatios: r.w(4, "vatios"),
  caloventor: r.f(5),
  pasaste: r.w(5, "pasaste"),
  pared: r.w(6, "pared"),
  ojo: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
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
  // gancho: la zapatilla vista algo desde arriba (se ven las tomas) con los dos cables colgados
  { f: 0, pos: [2.2, 3.0, 4.2], mira: [0, 0.25, 0], fov: 37 },
  { f: E.golpe, pos: [1.9, 2.8, 3.9], mira: [0.1, 0.25, 0], fov: 37 },
  // la corriente baja por el cable
  { f: E.corriente + 8, pos: [1.2, 3.0, 3.2], mira: [0.3, 1.3, 0], fov: 37 },
  // se recalienta y se prende fuego: primer plano de la toma
  { f: E.recalienta + 6, pos: [1.4, 2.0, 2.8], mira: [0.35, 0.3, 0], fov: 34 },
  { f: E.fuego + 6, pos: [1.5, 1.9, 2.7], mira: [0.4, 0.42, 0], fov: 34 },
  // dato 10 A · 2200 W: plano medio con el medidor
  { f: E.dato + 10, pos: [2.0, 2.7, 4.0], mira: [0, 0.3, 0], fov: 37 },
  // caloventor: te pasaste, llama fuerte
  { f: E.caloventor + 10, pos: [1.6, 1.9, 2.7], mira: [0.4, 0.5, 0], fov: 33 },
  { f: E.pasaste, pos: [1.6, 1.9, 2.7], mira: [0.4, 0.5, 0], fov: 33 },
  // directo a la pared: paneo al tomacorriente
  { f: E.pared + 12, pos: [5.5, 1.5, 3.3], mira: [5.0, 0.7, 0], fov: 32 },
  { f: E.ojo - 4, pos: [5.4, 1.5, 3.3], mira: [5.0, 0.7, 0], fov: 32 },
  // ojo: vuelve a la zapatilla, ya tranquila
  { f: E.ojo + 12, pos: [2.2, 2.9, 4.2], mira: [0, 0.3, 0], fov: 37 },
  { f: E.cta - 2, pos: [2.1, 2.8, 4.1], mira: [0, 0.3, 0], fov: 37 },
  // cierre: vuelve a la toma del gancho
  { f: E.cta + 18, pos: [2.2, 3.0, 4.2], mira: [0, 0.25, 0], fov: 37 },
  { f: DURACION, pos: [2.2, 3.0, 4.2], mira: [0, 0.25, 0], fov: 37 },
];

const estado = (frame: number): EstadoZapatilla => ({
  frame,
  calor: k(frame, [
    [E.recalienta, 0],
    [E.fuego, 0.6],
    [E.caloventor, 0.8],
    [E.pasaste, 1],
    [E.pared - 8, 1],
    [E.pared, 0],
  ]),
  humo: k(frame, [
    [E.recalienta + 4, 0],
    [E.fuego, 0.5],
    [E.pasaste, 1],
    [E.pared - 8, 1],
    [E.pared, 0],
  ]),
  llama: k(frame, [
    [E.fuego, 0],
    [E.fuego + 8, 0.6],
    [E.caloventor, 0.7],
    [E.pasaste, 1],
    [E.pared - 10, 1],
    [E.pared - 2, 0],
  ]),
  corriente: k(frame, [
    [E.corriente - 2, 0],
    [E.corriente + 8, 1],
    [E.pared - 8, 1],
    [E.pared, 0],
  ]),
});

const DESTACAR = [
  "peligroso",
  "incendios",
  "corriente",
  "recalienta",
  "fuego",
  "10 A",
  "2200 W",
  "caloventor",
  "pared",
  "módem",
  "perfecta",
  "Mandáselo",
];
const CIFRAS: [string, string][] = [
  ["diez amperes", "10 A"],
  ["dos mil doscientos vatios", "2200 W"],
];

/** Medidor de carga: barra que se llena y pasa la línea roja del límite (10 A · 2200 W). */
const Medidor: React.FC = () => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [E.dato, E.dato + 10, E.pasaste + 10, E.pasaste + 20], [0, 1, 1, 0], clamp);
  if (v <= 0) return null;
  // carga: cerca del límite en el dato, lo pasa en el caloventor
  const carga = k(frame, [
    [E.dato, 0.5],
    [E.dato + 14, 0.85],
    [E.caloventor, 0.9],
    [E.pasaste, 1.28],
    [E.pared, 1.28],
  ]);
  const pasado = carga > 1;
  const ancho = 760;
  return (
    <div style={{ position: "absolute", left: 540, top: 330, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * v})`, opacity: v }}>
      <div style={{ fontFamily: mono, fontSize: 30, letterSpacing: 2, color: "rgba(255,255,255,0.85)", textAlign: "center", marginBottom: 14 }}>
        LÍMITE <span style={{ color: ACENTO }}>10 A · 2200 W</span>
      </div>
      <div style={{ position: "relative", width: ancho, height: 46, borderRadius: 24, background: "rgba(10,16,32,0.7)", border: "3px solid rgba(255,255,255,0.4)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 3, borderRadius: 20 }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, carga * 78)}%`,
              borderRadius: 20,
              background: pasado ? "linear-gradient(90deg,#ffb020,#ff3b30)" : "linear-gradient(90deg,#49d66b,#ffd24a)",
              transition: "none",
            }}
          />
        </div>
        {/* línea roja del límite al 78% */}
        <div style={{ position: "absolute", left: "78%", top: -6, bottom: -6, width: 4, background: "#ff3b30", boxShadow: "0 0 10px #ff3b30" }} />
      </div>
      {pasado && (
        <div style={{ marginTop: 14, textAlign: "center", fontFamily: display, fontWeight: 800, fontSize: 48, color: "#ff5a4a", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
          ¡te pasaste!
        </div>
      )}
    </div>
  );
};

const efectos: Efecto[] = [
  [E.golpe, "whoosh", 0.3],
  [E.corriente, "whoosh", 0.35],
  [E.recalienta, "tic", 0.4],
  [E.fuego, "error", 0.5],
  [E.dato, "pop", 0.4],
  [E.caloventor, "scratch", 0.45],
  [E.pasaste, "boing", 0.4],
  [E.pared, "whoosh", 0.4],
  [E.pared + 12, "ding", 0.4],
  [E.ojo, "pop", 0.35],
  [E.cta, "whoosh", 0.35],
];

export const ZapatillaSobrecarga3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  const corrientePared = k(frame, [
    [E.pared, 0],
    [E.pared + 10, 1],
    [E.ojo - 6, 1],
    [E.ojo, 0],
  ]);
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Zapatilla e={e} />
        <ParedEnchufe pos={[5, 0.7, 0]} corriente={corrientePared} frame={frame} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Medidor />
      <Chip desde={E.caloventor} hasta={E.pared - 4} x={540} y={470} color="#ff8a4a">
        un caloventor: <span style={{ color: "#ffb37a" }}>≈ 2000 W</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que tiene la pava y el microondas en la misma zapatilla" />
      <Audio src={staticFile("052-zapatilla-sobrecarga/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

// Portada: la zapatilla recalentada con una llamita.
const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [2.8, 2.4, 5.2], mira: [0.2, 1.3, 0], fov: 32 }];
export const Portada052: React.FC = () => (
  <Portada arriba="qué no enchufar a la zapatilla" grande="lo que calienta" sello="OJO" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Zapatilla e={{ frame: 20, calor: 0.9, humo: 0.7, llama: 0.9, corriente: 1 }} />
      <PisoSombra opacidad={0.22} />
    </Estudio>
  </Portada>
);

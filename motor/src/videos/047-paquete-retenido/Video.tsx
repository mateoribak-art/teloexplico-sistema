import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/047-paquete-retenido/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { PaqueteFalso, type EstadoPaqueteFalso } from "../../kit3d/objetos/PaqueteFalso";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: tu celular con un paquete flotando y el aviso "retenido"; al lado, el celular oscuro del estafador.
// La tarjeta viaja de uno al otro; fila de mails con uno falso; tilde verde al final (WeLiveSecurity 2026, Chequeado 2025).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  estafa: r.f(1),
  pagina: r.f(2),
  gmail: r.f(3),
  ia: r.f(4),
  chequeado: r.f(5),
  ojo: r.f(6),
  guardar: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const k = (frame: number, pares: [number, number][]) => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of pares) {
    xs.push(xs.length && x <= xs[xs.length - 1] ? xs[xs.length - 1] + 1 : x);
    ys.push(y);
  }
  return interpolate(frame, xs, ys, clamp);
};

const ANCHO = 34;
const TOMAS: Toma[] = [
  { f: 0, pos: [0, 2.6, 16], mira: [0, 1.2, 0], fov: ANCHO },
  { f: E.estafa, pos: [-1.0, 2.8, 12], mira: [-1.0, 1.8, 0], fov: 32 },
  { f: E.pagina, pos: [-1.0, 2.2, 12], mira: [-1.0, 1.5, 0], fov: 32 },
  { f: E.gmail, pos: [0, 3.6, 15], mira: [0, 2.8, 0], fov: 34 },
  { f: E.ia, pos: [0, 2.6, 16], mira: [0, 1.2, 0], fov: ANCHO },
  { f: E.chequeado, pos: [0, 2.6, 15], mira: [0, 1.4, 0], fov: ANCHO },
  { f: E.ojo, pos: [-1.0, 3.0, 13], mira: [-1.0, 1.7, 0], fov: 32 },
  { f: E.guardar, pos: [0, 2.6, 16], mira: [0, 1.2, 0], fov: ANCHO },
  { f: DURACION, pos: [0, 2.6, 16], mira: [0, 1.2, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoPaqueteFalso => ({
  frame,
  paquete: k(frame, [[E.gancho + 20, 0], [E.gancho + 34, 1], [E.ojo - 4, 1], [E.ojo + 8, 0.6]]),
  aviso: k(frame, [[E.gancho + 40, 0], [E.gancho + 54, 1], [E.pagina - 4, 1], [E.pagina + 8, 0]]),
  formulario: k(frame, [[E.pagina, 0], [E.pagina + 18, 1], [E.ojo - 6, 1], [E.ojo + 6, 0]]),
  tarjeta: k(frame, [[E.pagina + 30, 0], [E.gmail - 6, 1], [E.ia, 1], [E.ia + 10, 0]]),
  correos: k(frame, [[E.gmail, 0], [E.gmail + 16, 1], [E.ia - 8, 1], [E.ia, 0]]),
  tilde: k(frame, [[E.ojo + 4, 0], [E.ojo + 22, 1], [E.fin, 1]]),
});

const DESTACAR = ["retenido", "estafa", "tarjeta", "Gmail", "impecables", "nunca", "Ojo:", "oficial", "estafa.", "Mandáselo"];
const CIFRAS: [string, string][] = [["dos mil veintiséis", "2026"]];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.estafa, "scratch", 0.4],
  [E.pagina, "whoosh", 0.35],
  [E.gmail, "pop", 0.4],
  [E.ia, "tic", 0.35],
  [E.chequeado, "pop", 0.4],
  [E.ojo, "ding", 0.4],
  [E.guardar, "pop", 0.4],
  [E.cta, "pop", 0.4],
];

export const PaqueteRetenido3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <PaqueteFalso e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.estafa} x={540} y={300}>
        “Tu paquete está <span style={{ color: ACENTO }}>retenido</span>”
      </Chip>
      <Chip desde={E.estafa} hasta={E.pagina} x={540} y={300}>
        ¿Pagar por link? <span style={{ color: ACENTO }}>Estafa</span>
      </Chip>
      <Chip desde={E.pagina} hasta={E.gmail} x={540} y={300}>
        Página que imita al Correo + <span style={{ color: ACENTO }}>tu tarjeta</span>
      </Chip>
      <Chip desde={E.gmail} hasta={E.ia} x={540} y={300}>
        WeLiveSecurity · marzo <span style={{ color: ACENTO }}>2026</span>
      </Chip>
      <Chip desde={E.ia} hasta={E.chequeado} x={540} y={300}>
        Con IA, sin <span style={{ color: ACENTO }}>faltas</span>
      </Chip>
      <Chip desde={E.chequeado} hasta={E.ojo} x={540} y={300}>
        Chequeado · 2025 · <span style={{ color: ACENTO }}>nunca piden pagos</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.guardar} x={540} y={300}>
        Entrá vos al sitio <span style={{ color: ACENTO }}>oficial</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.cta} x={540} y={300}>
        Guardalo: pago por mensaje = <span style={{ color: ACENTO }}>estafa</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que hace clic en todo" />
      <Audio src={staticFile("047-paquete-retenido/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.8, 14], mira: [0, 1.8, 0], fov: 36 }];
export const Portada047: React.FC = () => (
  <Portada arriba="estafa del paquete" grande="no pagues la tasa" sello="ES ESTAFA" colorSello={C.azul} numero={47}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <PaqueteFalso e={{ frame: 40, paquete: 1, aviso: 1, formulario: 0, tarjeta: 0, correos: 0, tilde: 0 }} />
    </Estudio>
  </Portada>
);

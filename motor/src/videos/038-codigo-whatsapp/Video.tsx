import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/038-codigo-whatsapp/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { CodigoWA, type EstadoCodigoWA } from "../../kit3d/objetos/CodigoWA";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: dos celulares de frente, el tuyo (verde) y el del estafador (oscuro). El código son seis cubitos
// que viajan de uno al otro; la cuenta cambia de manos y salen mensajes a tus contactos.
// Al final, candado + PIN de la verificación en dos pasos (Centro de Ayuda de WhatsApp; ver guion.json).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  llave: r.f(1),
  abre: r.f(2),
  ayuda: r.f(3),
  contactos: r.f(4),
  ojo: r.f(5),
  hoy: r.f(6),
  cta: r.f(7),
  fin: r.fin(7),
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
  { f: E.llave, pos: [-1.0, 2.6, 12], mira: [-1.0, 1.4, 0], fov: 32 },
  { f: E.abre, pos: [0, 2.6, 16], mira: [0, 1.2, 0], fov: ANCHO },
  { f: E.ayuda, pos: [-0.9, 2.6, 13], mira: [-0.9, 1.4, 0], fov: 32 },
  { f: E.contactos, pos: [1.0, 3.0, 14], mira: [1.0, 1.8, -0.5], fov: 34 },
  { f: E.ojo, pos: [0, 2.6, 16], mira: [0, 1.2, 0], fov: ANCHO },
  { f: E.hoy, pos: [-1.0, 3.0, 13], mira: [-1.0, 1.7, 0], fov: 32 },
  { f: E.cta, pos: [0, 2.6, 16], mira: [0, 1.2, 0], fov: ANCHO },
  { f: DURACION, pos: [0, 2.6, 16], mira: [0, 1.2, 0], fov: ANCHO },
];

const estado = (frame: number): EstadoCodigoWA => ({
  frame,
  codigo: k(frame, [[E.gancho + 40, 0], [E.gancho + 52, 1], [E.contactos - 4, 1], [E.contactos + 8, 0]]),
  vuelo: k(frame, [[E.gancho + 70, 0], [E.llave - 4, 0.05], [E.abre + 28, 1]]),
  robado: k(frame, [[E.abre + 16, 0], [E.abre + 50, 1], [E.hoy - 6, 1], [E.hoy + 16, 0]]),
  mensajes: k(frame, [[E.contactos - 2, 0], [E.contactos + 12, 1], [E.ojo - 6, 1], [E.ojo + 8, 0]]),
  escudo: k(frame, [[E.hoy + 4, 0], [E.hoy + 22, 1], [E.fin, 1]]),
  pregunta: k(frame, [[0, 1], [E.llave - 8, 1], [E.llave, 0], [E.ojo, 0], [E.ojo + 8, 1], [E.hoy - 4, 1], [E.hoy + 6, 0]]),
});

const DESTACAR = ["código", "llave", "afuera", "nadie", "Ojo:", "Llamalo", "contraseña", "Mandáselo"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 2, "pop", 0.4],
  [E.llave, "scratch", 0.4],
  [E.abre, "whoosh", 0.35],
  [E.ayuda, "pop", 0.4],
  [E.contactos, "tic", 0.35],
  [E.ojo, "pop", 0.4],
  [E.hoy, "ding", 0.4],
  [E.cta, "pop", 0.4],
];

export const CodigoWhatsapp3D: React.FC = () => {
  const frame = useCurrentFrame();
  const e = estado(frame);
  return (
    <AbsoluteFill>
      <Estudio fov={36}>
        <Camara tomas={TOMAS} />
        <CodigoWA e={e} />
        <PisoSombra opacidad={0.3} />
      </Estudio>
      <Chip desde={0} hasta={E.llave} x={540} y={300}>
        “Pasámelo, fue <span style={{ color: ACENTO }}>por error</span>”
      </Chip>
      <Chip desde={E.llave} hasta={E.abre} x={540} y={300}>
        El código = la <span style={{ color: ACENTO }}>llave</span>
      </Chip>
      <Chip desde={E.abre} hasta={E.ayuda} x={540} y={300}>
        Tu número + código = <span style={{ color: ACENTO }}>su celular</span>
      </Chip>
      <Chip desde={E.ayuda} hasta={E.contactos} x={540} y={300}>
        WhatsApp · Centro de Ayuda · <span style={{ color: ACENTO }}>a nadie</span>
      </Chip>
      <Chip desde={E.contactos} hasta={E.ojo} x={540} y={300}>
        Escriben a tus <span style={{ color: ACENTO }}>contactos</span>
      </Chip>
      <Chip desde={E.ojo} hasta={E.hoy} x={540} y={300}>
        ¿Dudás? <span style={{ color: ACENTO }}>Llamalo</span>
      </Chip>
      <Chip desde={E.hoy} hasta={E.cta} x={540} y={300}>
        Guardalo: <span style={{ color: ACENTO }}>dos pasos + contraseña</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="mandáselo al que le pasa el código a cualquiera" />
      <Audio src={staticFile("038-codigo-whatsapp/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0, 2.8, 14], mira: [0, 1.8, 0], fov: 36 }];
export const Portada038: React.FC = () => (
  <Portada arriba="estafa de WhatsApp" grande="no pases el código" sello="A NADIE" colorSello={C.azul} numero={38}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <CodigoWA e={{ frame: 40, codigo: 1, vuelo: 0.5, robado: 0, mensajes: 0, escudo: 0, pregunta: 1 }} />
    </Estudio>
  </Portada>
);

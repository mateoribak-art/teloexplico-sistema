import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-004-sugar-hyper/tiempos.json";
import { C, display } from "../../kit/marca";
import { clamp, golpe, pop, suave, temblor } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import {
  Escena, Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Palabrota, Sello, Sfx, Subtitulos, Titulo, type Efecto,
} from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Libro, Panza, Pregunta, Rayitos, Sol } from "../../kit/dibujos";

// @letmeexplain.us #4 (Body myths #1): ¿el azúcar pone hiperactivos a los chicos? (propio, Halloween).
// Mundo: un chico-poroto (Panza) con caramelos. Mecanismo: doble ciego → sin efecto; la expectativa de los padres (placebo) → lo ven más hiper; probablemente es la fiesta.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  ciego: r.f(2),
  porque: r.f(4),
  ojo: r.f(7),
  fiesta: r.f(8),
  cta: r.f(9),
  sello: r.fin(9) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

/* Caramelo envuelto */
const Caramelo: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string }> = ({ x, y, s = 1, rot = 0, color = C.rojo }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-60 0 L-100 -34 L-100 34 Z" fill={color} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
    <path d="M60 0 L100 -34 L100 34 Z" fill={color} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={5} cy={5} rx={62} ry={40} fill={C.tinta} />
    <ellipse cx={0} cy={0} rx={62} ry={40} fill={color} stroke={C.tinta} strokeWidth={6} />
    <path d="M-30 -14 q30 -16 60 0" fill="none" stroke={C.blanco} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
    <path d="M-20 14 q20 10 40 0" fill="none" stroke={C.blanco} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
  </g>
);

/* 1 · You think sugar makes kids bounce off the walls. */
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const salto = Math.abs(Math.sin(frame / 4)) * 120;
  const dx = temblor(frame, 20, 30, 6);
  return (
    <Escena entrada={false}>
      <Etiqueta texto="the myth" desde={-8} />
      <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={430} tam={58} />
      <AbsoluteFill style={{ scale: interpolate(frame, [0, 8], [1.12, 1], clamp), transformOrigin: "540px 1150px" }}>
        <Lienzo>
          <line x1={120} y1={1330} x2={960} y2={1330} stroke={C.tinta} strokeWidth={9} strokeLinecap="round" />
          <g transform={`translate(${dx} ${-salto})`}>
            <Panza cx={540} cy={1060} s={1.05} cara="sorprendida" t={frame} llena />
            <Rayitos cx={540} cy={820} />
          </g>
          <g style={{ scale: pop(frame, fps, 6), transformOrigin: "200px 1000px" }}>
            <Caramelo x={200} y={1000} rot={-20} />
          </g>
          <g style={{ scale: pop(frame, fps, 10), transformOrigin: "880px 1020px" }}>
            <Caramelo x={880} y={1020} rot={25} color={C.azul} />
          </g>
        </Lienzo>
      </AbsoluteFill>
    </Escena>
  );
};

/* 2 · That's a myth. */
const Mito: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Escena empuje={0.02}>
      <AbsoluteFill style={{ scale: golpe(frame, 0, 1.1, 14) }}>
        <Etiqueta texto="the truth" color={C.verde} />
        <Titulo respuesta="a myth." desdeR={0} top={470} tamR={150} />
        <Lienzo>
          <g style={{ scale: pop(frame, fps, 2), transformOrigin: "540px 1250px" }}>
            <Panza cx={540} cy={1060} s={1.05} cara="canchera" t={frame} />
          </g>
          <g style={{ scale: pop(frame, fps, 5), transformOrigin: "230px 1000px" }}>
            <Caramelo x={230} y={1000} rot={-15} />
          </g>
        </Lienzo>
        <Sello texto="MYTH" desde={8} x={90} y={760} rot={-10} />
      </AbsoluteFill>
    </Escena>
  );
};

/* 3 · Double-blind, and the 1995 review. Frases 2 y 3. */
const Ciego: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.ciego;
  const dos = L(r.w(2, "real"));
  const libro = L(r.f(3));
  const noventa = L(r.w(3, "nineteen"));
  const sin = L(r.w(3, "no"));
  return (
    <Escena>
      <Etiqueta texto="double-blind" />
      <Lienzo>
        {frame < libro ? (
          <g>
            <g style={{ scale: pop(frame, fps, 4), transformOrigin: "300px 1000px" }}>
              <circle cx={300} cy={1000} r={150} fill={C.blanco} stroke={C.tinta} strokeWidth={8} />
              <Pregunta cx={300} cy={1100} fuente={display} />
            </g>
            <g style={{ scale: pop(frame, fps, 10), transformOrigin: "780px 1000px" }}>
              <circle cx={780} cy={1000} r={150} fill={C.blanco} stroke={C.tinta} strokeWidth={8} />
              <Pregunta cx={780} cy={1100} fuente={display} />
            </g>
          </g>
        ) : null}
        {frame >= libro ? (
          <g style={{ scale: pop(frame, fps, libro), transformOrigin: "540px 1000px" }}>
            <Libro x={380} y={720} titulo="JAMA" fuente={display} t={frame} />
          </g>
        ) : null}
      </Lienzo>
      {frame < libro && frame >= dos ? <Sello texto="REAL OR FAKE?" desde={dos} x={250} y={560} rot={-5} color={C.amarillo} tinta={C.tinta} tam={56} /> : null}
      {frame >= noventa ? <Sello texto="1995" desde={noventa} x={620} y={640} rot={7} color={C.amarillo} tinta={C.tinta} tam={72} /> : null}
      {frame >= sin ? <Palabrota texto="NO EFFECT" desde={sin} hasta={sin + 60} top={1180} color={C.verde} tam={130} /> : null}
      <Fuente texto="JAMA 1995 · Wolraich et al." />
    </Escena>
  );
};

/* 4 · Why does it look so real? Parents' expectation. Frases 4–6. */
const Expectativa: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.porque;
  const dicen = L(r.f(5));
  const placebo = L(r.f(6));
  const sube = interpolate(frame, [dicen + 20, dicen + 70], [0, 1], clamp);
  const tachar = suave(frame, placebo + 4, 8);
  return (
    <Escena>
      <Etiqueta texto="what parents saw" />
      <Lienzo>
        {frame < dicen ? (
          <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1000px" }} transform={`rotate(${Math.sin(frame / 5) * 8} 540 1000)`}>
            <Pregunta cx={540} cy={1260} fuente={display} />
          </g>
        ) : null}
        {frame >= dicen ? (
          <g>
            <g style={{ scale: pop(frame, fps, dicen), transformOrigin: "300px 1000px" }}>
              <Panza cx={300} cy={1020} s={0.8} cara={frame >= placebo ? "feliz" : "canchera"} t={frame} />
            </g>
            <g>
              <rect x={680} y={720} width={90} height={460} rx={30} fill={C.blanco} stroke={C.tinta} strokeWidth={8} />
              <rect x={690} y={1170 - 440 * sube} width={70} height={440 * sube} rx={22} fill={C.rojo} />
              <text x={725} y={690} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={44} fill={C.tinta}>HYPER</text>
            </g>
          </g>
        ) : null}
      </Lienzo>
      {frame >= dicen ? <Sello texto="“HE HAD SUGAR”" desde={dicen + 4} x={70} y={560} rot={-6} color={C.amarillo} tinta={C.tinta} tam={54} /> : null}
      {frame >= placebo ? (
        <div style={{ position: "absolute", top: 1250, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            <Sello texto="SUGAR-FREE PLACEBO" desde={placebo} x={-330} y={0} rot={-3} color={C.verde} tam={56} />
            <div style={{ position: "absolute", left: -330, top: 28, width: 0, height: 0, opacity: tachar * 0 }} />
          </div>
        </div>
      ) : null}
      <Fuente texto="Hoover & Milich 1994" />
    </Escena>
  );
};

/* 5 · Heads up: teeth. Frase 7. */
const Ojo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.ojo;
  const dientes = L(r.w(7, "teeth"));
  return (
    <Escena>
      <Sello texto="HEADS UP" desde={0} x={330} y={330} rot={-8} color={C.amarillo} tinta={C.tinta} tam={80} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 4), transformOrigin: "540px 1000px" }}>
          <Caramelo x={540} y={820} s={1.3} rot={-8} />
        </g>
        {frame >= dientes ? (
          <g style={{ scale: pop(frame, fps, dientes), transformOrigin: "540px 1150px" }}>
            <path d="M360 1020 C360 940 460 960 540 990 C620 960 720 940 720 1020 C720 1100 690 1260 650 1260 C610 1260 600 1160 540 1160 C480 1160 470 1260 430 1260 C390 1260 360 1100 360 1020 Z"
              fill={C.blanco} stroke={C.tinta} strokeWidth={9} strokeLinejoin="round" />
            <circle cx={500} cy={1070} r={26} fill={C.tinta} />
          </g>
        ) : null}
      </Lienzo>
      {frame >= dientes ? <Sello texto="TEETH" desde={dientes} x={640} y={760} rot={8} color={C.rojo} tam={60} /> : null}
      <Fuente texto="American Dental Association" />
    </Escena>
  );
};

/* 6 · Blame the party. Frase 8. */
const Fiesta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const salto = Math.abs(Math.sin(frame / 4)) * 90;
  const L = (g: number) => g - E.fiesta;
  const party = L(r.w(8, "party"));
  const confeti = ["#FF5A5F", "#FFC93C", "#3DA5D9", "#5FBF6A"];
  return (
    <Escena>
      <Etiqueta texto="the real suspect" />
      <Lienzo>
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={90 + i * 66} y={560 + ((frame * 5 + i * 97) % 700)} width={22} height={22} rx={5}
            fill={confeti[i % 4]} stroke={C.tinta} strokeWidth={4} transform={`rotate(${frame * 6 + i * 40} ${100 + i * 66} ${570 + ((frame * 5 + i * 97) % 700)})`} />
        ))}
        <g transform={`translate(0 ${-salto})`}>
          <Panza cx={540} cy={1060} s={1.0} cara="feliz" t={frame} llena />
        </g>
        <g style={{ scale: pop(frame, fps, 4), transformOrigin: "880px 700px" }}>
          <Sol cx={880} cy={700} r={80} t={frame} />
        </g>
      </Lienzo>
      {frame >= party ? <Sello texto="THE PARTY" desde={party} x={110} y={640} rot={-7} color={C.amarillo} tinta={C.tinta} tam={72} /> : null}
      <Globo texto="costumes + friends = chaos" desde={8} x={420} y={430} cola="izq" tam={38} ancho={520} />
      <Fuente texto="probably · not measured" />
    </Escena>
  );
};

/* 7 · Send this to the friend who says "no candy, they'll go crazy". */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.cta;
  const loco = L(r.w(9, "crazy"));
  return (
    <Escena>
      <Titulo pregunta="send this to the friend who…" desdeP={0} top={360} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1300px" }}>
          <Panza cx={540} cy={1090} s={0.95} cara="preocupada" t={frame} />
        </g>
        <g style={{ scale: pop(frame, fps, 6), transformOrigin: "840px 1000px" }}>
          <Caramelo x={840} y={1000} rot={20} />
        </g>
        <line x1={60} y1={560} x2={60} y2={561} stroke={C.tinta} />
      </Lienzo>
      <Globo texto="no candy, they'll go crazy!" desde={loco - 8} x={90} y={720} cola="der" tam={40} ancho={520} />
      {frame >= loco ? <Sello texto="NO CANDY" desde={loco} x={640} y={1290} rot={-6} color={C.rojo} tam={52} /> : null}
    </Escena>
  );
};

export const SugarHyperEn004: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [E.gancho + 6, "pop", 0.4], [E.gancho + 10, "pop", 0.35],
    [E.mito - 3, "latigo", 0.5], [E.mito, "scratch", 0.55], [E.mito + 8, "sello", 0.7],
    [E.ciego - 3, "latigo", 0.5], [E.ciego + 4, "pop"], [E.ciego + 10, "pop"], [r.w(2, "real"), "sello", 0.5],
    [r.f(3), "boing", 0.4], [r.w(3, "nineteen"), "sello", 0.55], [r.w(3, "no"), "ding", 0.45],
    [E.porque - 3, "latigo", 0.5], [E.porque, "boing", 0.4], [r.f(5), "pop"], [r.f(5) + 4, "sello", 0.5],
    [r.f(5) + 20, "tic", 0.5], [r.f(6), "scratch", 0.5], [r.f(6) + 2, "sello", 0.6], [r.f(6) + 6, "ding", 0.35],
    [E.ojo - 3, "latigo", 0.5], [E.ojo, "sello", 0.6], [r.w(7, "teeth"), "boing", 0.4], [r.w(7, "teeth") + 3, "sello", 0.5],
    [E.fiesta - 3, "latigo", 0.5], [E.fiesta, "pop"], [E.fiesta + 8, "burbuja", 0.4], [r.w(8, "party"), "sello", 0.6],
    [E.cta - 3, "latigo", 0.5], [E.cta, "pop"], [r.w(9, "crazy") - 8, "burbuja", 0.4], [r.w(9, "crazy"), "sello", 0.55],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo">
        <Logo />
      </Sequence>

      <Sequence name="1 · hook" from={E.gancho} durationInFrames={E.mito - E.gancho}><Gancho /></Sequence>
      <Sequence name="2 · myth" from={E.mito} durationInFrames={E.ciego - E.mito}><Mito /></Sequence>
      <Sequence name="3 · double-blind" from={E.ciego} durationInFrames={E.porque - E.ciego}><Ciego /></Sequence>
      <Sequence name="4 · expectation" from={E.porque} durationInFrames={E.ojo - E.porque}><Expectativa /></Sequence>
      <Sequence name="5 · heads up" from={E.ojo} durationInFrames={E.fiesta - E.ojo}><Ojo /></Sequence>
      <Sequence name="6 · party" from={E.fiesta} durationInFrames={E.cta - E.fiesta}><Fiesta /></Sequence>
      <Sequence name="7 · cta" from={E.cta} durationInFrames={E.sello - E.cta}><Cta /></Sequence>
      <Sequence name="final stamp" from={E.sello} durationInFrames={DURACION - E.sello}>
        <SelloFinal mandar={`send this to the friend who says "no candy, they'll go crazy"`} />
      </Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("en-004-sugar-hyper/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

/* Cover for the grid */
export const PortadaEn004: React.FC = () => (
  <Portada arriba="sugar makes kids hyper?" grande="a myth." sello="MYTH">
    <Lienzo>
      <line x1={120} y1={1330} x2={960} y2={1330} stroke={C.tinta} strokeWidth={9} strokeLinecap="round" />
      <Panza cx={540} cy={1020} s={1.05} cara="sorprendida" t={20} llena />
      <Caramelo x={190} y={960} rot={-20} />
      <Caramelo x={890} y={990} rot={25} color={C.azul} />
    </Lienzo>
  </Portada>
);

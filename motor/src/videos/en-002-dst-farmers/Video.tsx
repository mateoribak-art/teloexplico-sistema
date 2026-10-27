import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-002-dst-farmers/tiempos.json";
import { C, mono } from "../../kit/marca";
import { clamp, entre, golpe } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { oscuro, claro, MAT, LINEA } from "../../kit/biblioteca";
import { Camara, Piso, Rotulo, SolVolumen, TONO, toma } from "../../kit/diagrama";

// @letmeexplain.us #2 (actualidad, 27/10/2026): el cambio de hora no se inventó para los granjeros.
// Mundo único: un campo con un granero a la izquierda, un reloj grande en un poste a la derecha y el sol.
// Mecanismo: el reloj salta una hora (1916 Alemania, 1918 EE. UU.), la vaca (los granjeros) lo odia, se deroga en 1919.
// Final: el reloj retrocede de 2:00 a 1:00 (domingo 1/11) y aparecen los relojes que el celular no arregla (horno, micro, auto).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  alemania: r.f(2),
  eeuu: r.f(3),
  vaca: r.f(4),
  deroga: r.f(5),
  ojo: r.f(6),
  atras: r.f(7),
  relojes: r.f(8),
  manda: r.f(9),
  sello: r.fin(9) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const SUELO = 1380;
const CX = 710, CY = 1010, CR = 190;
const prog = (f: number, a: number, dur: number) => interpolate(f, [a, a + dur], [0, 1], clamp);

/* ---------- Reloj grande con volumen; `horas` = hora decimal (2 = 2:00) ---------- */
const Reloj: React.FC<{ cx: number; cy: number; rad: number; horas: number }> = ({ cx, cy, rad, horas }) => {
  const ha = (horas % 12) * 30, ma = horas * 360;
  const mano = (ang: number, largo: number, ancho: number, color: string) => (
    <line x1={cx} y1={cy} x2={cx + Math.sin((ang * Math.PI) / 180) * largo} y2={cy - Math.cos((ang * Math.PI) / 180) * largo}
      stroke={color} strokeWidth={ancho} strokeLinecap="round" />
  );
  return (
    <g>
      <circle cx={cx + 12} cy={cy + 12} r={rad} fill={C.tinta} />
      <circle cx={cx} cy={cy} r={rad} fill={C.blanco} stroke={C.tinta} strokeWidth={LINEA} />
      <circle cx={cx} cy={cy} r={rad - 16} fill="none" stroke={TONO.azulSombra} strokeWidth={6} opacity={0.5} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        return <line key={i} x1={cx + Math.sin(a) * (rad - 38)} y1={cy - Math.cos(a) * (rad - 38)}
          x2={cx + Math.sin(a) * (rad - 18)} y2={cy - Math.cos(a) * (rad - 18)} stroke={C.tinta} strokeWidth={i % 3 === 0 ? 10 : 5} />;
      })}
      {mano(ma, rad - 50, 8, C.rojo)}
      {mano(ha, rad - 90, 14, C.tinta)}
      <circle cx={cx} cy={cy} r={12} fill={C.tinta} />
      <path d={`M${cx - rad + 28} ${cy - rad * 0.55} Q${cx - rad * 0.6} ${cy - rad * 0.85} ${cx - rad * 0.1} ${cy - rad + 22}`} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
    </g>
  );
};

/* ---------- Granero con volumen ---------- */
const Granero: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} ${SUELO})`}>
    <rect x={14} y={-246} width={300} height={246} fill={C.tinta} />
    <rect x={0} y={-260} width={300} height={260} fill={C.rojo} stroke={C.tinta} strokeWidth={LINEA} />
    {[60, 120, 180, 240].map((xx) => <line key={xx} x1={xx} y1={-250} x2={xx} y2={-8} stroke={oscuro(C.rojo, 0.25)} strokeWidth={6} />)}
    <path d="M-24 -250 L150 -380 L324 -250 Z" fill={oscuro(C.rojo, 0.3)} stroke={C.tinta} strokeWidth={LINEA} />
    <rect x={90} y={-150} width={120} height={150} fill={C.blanco} stroke={C.tinta} strokeWidth={7} />
    <path d="M90 -150 L210 0 M210 -150 L90 0" stroke={C.tinta} strokeWidth={6} />
    <rect x={10} y={-248} width={40} height={230} fill="#FFFFFF" opacity={0.18} />
  </g>
);

/* ---------- Vaca (el único personaje; mira de costado) ---------- */
const Vaca: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-55, -25, 35, 65].map((lx, i) => <rect key={i} x={lx - 9} y={20} width={18} height={62} rx={6} fill={C.blanco} stroke={C.tinta} strokeWidth={6} />)}
    <ellipse cx={14} cy={14} rx={105} ry={58} fill={C.tinta} />
    <ellipse cx={0} cy={0} rx={105} ry={58} fill={C.blanco} stroke={C.tinta} strokeWidth={LINEA} />
    <ellipse cx={-30} cy={-14} rx={26} ry={18} fill={C.tinta} />
    <ellipse cx={42} cy={14} rx={22} ry={16} fill={C.tinta} />
    <ellipse cx={-60} cy={-30} rx={28} ry={10} fill="#FFFFFF" opacity={0.6} />
    <g transform={`translate(-112 ${-18 + Math.sin(t / 6) * 2})`}>
      <rect x={-52} y={-34} width={74} height={68} rx={28} fill={C.blanco} stroke={C.tinta} strokeWidth={LINEA} />
      <rect x={-52} y={8} width={46} height={26} rx={12} fill="#F4B6B6" stroke={C.tinta} strokeWidth={5} />
      <circle cx={-8} cy={-12} r={7} fill={C.tinta} />
      <path d="M-4 -34 L10 -52 L18 -30 Z" fill={C.blanco} stroke={C.tinta} strokeWidth={5} />
    </g>
    <path d="M100 -10 Q130 10 120 50" fill="none" stroke={C.tinta} strokeWidth={8} strokeLinecap="round" />
  </g>
);

/* ---------- Aparato con reloj titilando (horno, microondas, auto) ---------- */
const Aparato: React.FC<{ x: number; y: number; w: number; h: number; color: string; f: number; auto?: boolean }> = ({ x, y, w, h, color, f, auto }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={10} y={10} width={w} height={h} rx={auto ? 30 : 12} fill={C.tinta} />
    <rect x={0} y={0} width={w} height={h} rx={auto ? 30 : 12} fill={color} stroke={C.tinta} strokeWidth={LINEA} />
    <rect x={w * 0.14} y={h * 0.16} width={w * 0.72} height={h * 0.34} rx={8} fill={C.tinta} />
    <text x={w / 2} y={h * 0.43} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={Math.min(46, w * 0.26)}
      fill={f % 30 < 18 ? "#FF5A4F" : "#5A1A17"}>12:00</text>
    <rect x={w * 0.14} y={h * 0.62} width={w * 0.72} height={h * 0.22} rx={6} fill="#FFFFFF" opacity={0.25} />
  </g>
);

/* ---------- Mundo ---------- */
const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const fin = f >= E.relojes;
  const atras = prog(f, E.atras + 6, 40);
  const adelante = prog(f, E.eeuu + 10, 24);
  const horas = 1 + f * 0.0008 + adelante - atras;
  const vacaVisible = f >= E.vaca && f < E.relojes;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <Piso y={SUELO} />
      {!fin ? <SolVolumen cx={150} cy={790} r={58} t={f} intensidad={0.8} /> : null}
      {!fin ? <Granero x={60} /> : null}
      {/* poste del reloj */}
      <rect x={CX - 14} y={CY + CR - 10} width={28} height={SUELO - (CY + CR) + 10} fill={TONO.tierra} stroke={C.tinta} strokeWidth={7} />
      <Reloj cx={CX} cy={CY} rad={CR} horas={horas} />
      {vacaVisible ? <Vaca x={480} y={SUELO - 80} t={f} /> : null}
      {/* carbón para el combustible de la guerra */}
      {entre(f, E.alemania, E.eeuu) ? (
        <g opacity={prog(f, E.alemania, 8)}>
          {[[0, 0, 34], [52, 6, 28], [26, -34, 30], [-44, 8, 24]].map(([dx, dy, rr], i) => (
            <circle key={i} cx={420 + dx} cy={SUELO - 30 + dy} r={rr} fill="#2B2B35" stroke={C.tinta} strokeWidth={5} />
          ))}
        </g>
      ) : null}
      {/* aparatos con el reloj en 12:00 */}
      {fin ? (
        <g opacity={prog(f, E.relojes, 8)}>
          <Aparato x={40} y={SUELO - 210} w={190} h={210} color={MAT.metal} f={f} />
          <Aparato x={260} y={SUELO - 150} w={210} h={150} color={claro(MAT.metal, 0.2)} f={f} />
          <Aparato x={500} y={SUELO - 120} w={120} h={120} color={C.azul} f={f} auto />
        </g>
      ) : null}
    </svg>
  );
};

/* ---------- Anotaciones pegadas al mundo ---------- */
const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {entre(f, E.gancho, E.golpe) ? (
        <Rotulo texto="for the farmers?" desde={r.w(0, "farmers")} x={230} y={950} ax={200} ay={SUELO - 300} tam={26} />
      ) : null}
      {entre(f, E.alemania, E.eeuu) ? (
        <>
          <Rotulo texto="Germany · 1916" desde={r.w(2, "Germany")} x={330} y={900} ax={CX - 60} ay={CY - 100} tam={28} />
          <Rotulo texto="save fuel" desde={r.w(2, "fuel")} x={380} y={1150} ax={420} ay={SUELO - 60} color={C.blanco} fondo={C.rojo} tam={26} />
        </>
      ) : null}
      {entre(f, E.eeuu, E.vaca) ? (
        <Rotulo texto="U.S. · 1918" desde={r.w(3, "eighteen") - 10} x={330} y={900} ax={CX - 60} ay={CY - 100} tam={28} />
      ) : null}
      {entre(f, E.vaca, E.deroga) ? (
        <Rotulo texto="the sun sets the work" desde={r.w(4, "work")} x={330} y={890} ax={150} ay={790} tam={24} />
      ) : null}
      {entre(f, E.deroga, E.ojo) ? (
        <Rotulo texto="repealed · 1919" desde={r.w(5, "Congress")} x={400} y={900} ax={CX - 60} ay={CY - 100} color={C.blanco} fondo={C.rojo} tam={28} />
      ) : null}
      {entre(f, E.ojo, E.atras) ? (
        <Rotulo texto="federal law · 1966" desde={r.w(6, "sixty")} x={400} y={900} ax={CX - 60} ay={CY - 100} tam={28} />
      ) : null}
      {entre(f, E.atras, E.relojes) ? (
        <>
          <Rotulo texto="Sun, Nov 1 · 2 a.m." desde={r.w(7, "Sunday")} x={420} y={870} ax={CX - 80} ay={CY - 120} tam={28} />
          <Rotulo texto="back 1 hour" desde={r.w(7, "back")} x={400} y={1230} ax={CX - 60} ay={CY + 60} color={C.blanco} fondo={C.verde} tam={30} />
        </>
      ) : null}
      {entre(f, E.relojes, E.manda) ? (
        <>
          <Rotulo texto="oven" desde={r.w(8, "oven")} x={135} y={930} ax={135} ay={SUELO - 215} tam={26} />
          <Rotulo texto="microwave" desde={r.w(8, "microwave")} x={365} y={1000} ax={365} ay={SUELO - 155} tam={26} />
          <Rotulo texto="car" desde={r.w(8, "car")} x={560} y={1090} ax={560} ay={SUELO - 125} tam={26} />
        </>
      ) : null}
    </>
  );
};

/* ---------- Cámara ---------- */
const TOMAS = [
  toma(0, 540, 1130, 1.0), toma(E.golpe - 2, 540, 1130, 1.0),
  toma(E.golpe + 10, 560, 1100, 1.1), toma(E.alemania - 2, 560, 1100, 1.1),
  toma(E.alemania + 12, 520, 1150, 1.15), toma(E.eeuu - 2, 520, 1150, 1.15),
  toma(E.eeuu + 12, 600, 1100, 1.15), toma(E.vaca - 2, 600, 1100, 1.15),
  toma(E.vaca + 12, 440, 1180, 1.2), toma(E.deroga - 2, 440, 1180, 1.2),
  toma(E.deroga + 12, 620, 1080, 1.2), toma(E.atras - 2, 620, 1080, 1.2),
  toma(E.atras + 12, 640, 1060, 1.3), toma(E.relojes - 2, 640, 1060, 1.3),
  toma(E.relojes + 12, 420, 1150, 1.1), toma(E.manda - 2, 420, 1150, 1.1),
  toma(E.manda + 12, 540, 1130, 1.0), toma(E.sello, 540, 1130, 1.0),
];
const GOLPES = [r.w(1, "myth"), r.w(2, "Germany"), r.w(3, "eighteen"), r.w(4, "hated"), r.w(5, "repealed"), r.w(7, "back"), r.w(8, "oven")];

const Diagrama: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= E.sello) return null;
  const g = GOLPES.reduce((m, k) => m * golpe(f, k, 1.05, 12), 1);
  return (
    <AbsoluteFill style={{ scale: g }}>
      <Camara tomas={TOMAS}>
        <Mundo />
        <Anotaciones />
      </Camara>
    </AbsoluteFill>
  );
};

/* ---------- Capas de pantalla ---------- */
const Gancho: React.FC = () => (
  <>
    <Etiqueta texto="daylight saving time" desde={-8} />
    <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={430} tam={52} />
  </>
);

const Golpe: React.FC = () => {
  const ra = r.w(1, "myth") - E.golpe;
  return (
    <>
      <Etiqueta texto="the truth" color={C.verde} />
      <Titulo pregunta="for farmers…" desdeP={0} respuesta="a myth!" desdeR={ra} top={415} tamR={96} />
      <Sello texto="MYTH" desde={ra + 2} x={780} y={270} rot={-8} color={C.rojo} tam={84} />
    </>
  );
};

const Vacas: React.FC = () => (
  <>
    <Etiqueta texto="the farmers" color={C.rojo} />
    <Globo texto="moo… what time is it?" desde={r.w(4, "Cows") - E.vaca} x={600} y={640} cola="izq" tam={40} ancho={460} />
  </>
);

const Manda: React.FC = () => (
  <>
    <Titulo pregunta="send this to the friend who…" desdeP={0} top={340} />
    <Globo texto="it's been 12:00 since March!" desde={r.w(9, "microwave") - E.manda} x={540} y={640} cola="der" tam={40} ancho={520} />
  </>
);

export const DstFarmersEn002: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [E.golpe, "whoosh", 0.35], [r.w(1, "myth") - 2, "scratch", 0.55], [r.w(1, "myth"), "sello", 0.5],
    [E.alemania, "whoosh", 0.35], [r.w(2, "sixteen"), "tic", 0.4], [r.w(2, "fuel"), "pop"],
    [E.eeuu, "whoosh", 0.35], [r.w(3, "eighteen"), "tic", 0.4],
    [E.vaca, "pop"], [r.w(4, "Cows"), "burbuja", 0.4], [r.w(4, "hated"), "error", 0.4],
    [E.deroga, "whoosh", 0.35], [r.w(5, "repealed"), "sello", 0.55],
    [E.ojo, "sello", 0.5], [E.atras, "whoosh", 0.35], [r.w(7, "back"), "tic", 0.4], [r.w(7, "back") + 30, "ding", 0.45],
    [E.relojes, "pop"], [r.w(8, "oven"), "pop"], [r.w(8, "car"), "error", 0.35],
    [E.manda, "pop"], [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo"><Logo /></Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.golpe - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · golpe" from={E.golpe} durationInFrames={E.alemania - E.golpe} layout="none"><Golpe /></Sequence>
      <Sequence name="3 · alemania" from={E.alemania} durationInFrames={E.eeuu - E.alemania} layout="none">
        <Etiqueta texto="where it began" /><Fuente texto="History.com" />
      </Sequence>
      <Sequence name="4 · eeuu" from={E.eeuu} durationInFrames={E.vaca - E.eeuu} layout="none">
        <Etiqueta texto="same reason" /><Fuente texto="History.com" />
      </Sequence>
      <Sequence name="5 · vaca" from={E.vaca} durationInFrames={E.deroga - E.vaca} layout="none"><Vacas /></Sequence>
      <Sequence name="6 · deroga" from={E.deroga} durationInFrames={E.ojo - E.deroga} layout="none">
        <Etiqueta texto="farmers won" color={C.verde} /><Fuente texto="History.com" />
        <Sello texto="REPEALED" desde={r.w(5, "repealed") - E.deroga} x={560} y={560} rot={-6} color={C.rojo} tam={72} />
      </Sequence>
      <Sequence name="7 · ojo" from={E.ojo} durationInFrames={E.atras - E.ojo} layout="none">
        <Sello texto="HEADS UP" desde={0} x={540} y={320} rot={-8} color={C.amarillo} tinta={C.tinta} tam={72} />
        <Fuente texto="U.S. Dept. of Transportation" />
      </Sequence>
      <Sequence name="8 · atras" from={E.atras} durationInFrames={E.relojes - E.atras} layout="none">
        <Etiqueta texto="this weekend" color={C.verde} />
        <Titulo pregunta="fall back" desdeP={0} top={420} />
      </Sequence>
      <Sequence name="9 · relojes" from={E.relojes} durationInFrames={E.manda - E.relojes} layout="none">
        <Etiqueta texto="your to-do" />
        <Titulo pregunta="fix these clocks" desdeP={0} top={420} />
      </Sequence>
      <Sequence name="10 · manda" from={E.manda} durationInFrames={DURACION - E.manda} layout="none"><Manda /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal mandar="send this to the friend whose microwave has been wrong since March" /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("en-002-dst-farmers/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const PortadaEn002: React.FC = () => (
  <Portada arriba="daylight saving time" grande="NOT FARMERS" sello="MYTH" colorSello={C.rojo}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(0 -230)">
        <Granero x={40} />
        <Reloj cx={730} cy={1010} rad={190} horas={2} />
        <Vaca x={470} y={SUELO - 80} t={0} />
      </g>
    </svg>
  </Portada>
);

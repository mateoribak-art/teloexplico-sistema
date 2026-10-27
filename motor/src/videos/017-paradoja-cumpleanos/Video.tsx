import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/017-paradoja-cumpleanos/tiempos.json";
import { C, display } from "../../kit/marca";
import { clamp, entre, golpe, pop } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Contador, Rotulo, TONO, Vecino } from "../../kit/diagrama";

// Mundo: una ronda de gente (puntos) en una juntada. Cada par de personas se une con una línea (una chance de
// coincidir en el cumpleaños). Al sumar gente las líneas se multiplican y un medidor muestra la probabilidad exacta
// de que haya al menos un cumpleaños repetido (365 días parejos, sin 29 de febrero).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  veintitres: r.f(1),
  mitad: r.f(2),
  parejas: r.f(3),
  cuenta: r.f(4),
  reves: r.f(5),
  setenta: r.f(6),
  cuarenta: r.f(7),
  ojo: r.f(8),
  cualquiera: r.f(9),
  cta: r.f(10),
  sello: r.fin(10) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const CX = 540;
const CY = 960;
const R = 240;
const COLORES = [C.azul, C.verde, C.amarillo, C.rojo];

const probabilidad = (n: number) => {
  let q = 1;
  for (let k = 0; k < n; k++) q *= 1 - k / 365;
  return 1 - q;
};
const pct = (p: number) => (p * 100).toFixed(1).replace(".", ",");

/* cantidad de personas según el momento del video */
const personas = (f: number) =>
  Math.round(
    interpolate(
      f,
      [0, r.w(1, "veintitr") - 14, r.w(1, "veintitr") + 22, E.setenta - 10, r.w(6, "setenta") + 40, E.cuarenta - 4, r.w(7, "cuarenta") + 24],
      [6, 6, 23, 23, 70, 70, 40],
      clamp,
    ),
  );

const pos = (i: number, n: number): [number, number] => {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return [CX + Math.cos(a) * R, CY + Math.sin(a) * R];
};

const A = 0;
const B = 8; // la pareja que "coincide" (resaltada)

const Ronda: React.FC = () => {
  const f = useCurrentFrame();
  const n = personas(f);
  const pts = Array.from({ length: n }, (_, i) => pos(i, n));
  const lineasVisibles = f >= E.parejas - 20 || f < E.veintitres;
  const grosor = n > 50 ? 1.5 : n > 30 ? 2.5 : 3.5;
  const opLinea = n > 50 ? 0.35 : n > 30 ? 0.5 : 0.7;
  const resaltar = f >= E.mitad && f < E.cta;
  const rad = n > 50 ? 13 : n > 30 ? 17 : 22;
  const p = probabilidad(n);
  const medidor = f >= E.mitad - 6 && f < E.cta;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <circle cx={CX} cy={CY} r={R + 70} fill="#FFF7E3" stroke={C.tinta} strokeWidth={8} />
      <circle cx={CX} cy={CY} r={R + 70} fill="none" stroke={C.tinta} strokeWidth={8} opacity={0.0} />
      {lineasVisibles ? (
        <g stroke={C.tinta} strokeWidth={grosor} opacity={opLinea}>
          {pts.flatMap((a, i) => pts.slice(i + 1).map((b, j) => <line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />))}
        </g>
      ) : null}
      {resaltar && n > B ? (
        <line x1={pts[A][0]} y1={pts[A][1]} x2={pts[B][0]} y2={pts[B][1]} stroke={C.rojo} strokeWidth={12} strokeLinecap="round" />
      ) : null}
      {pts.map((q, i) => {
        const dest = resaltar && (i === A || i === B);
        return (
          <g key={i}>
            <circle cx={q[0] + 4} cy={q[1] + 5} r={rad} fill={C.tinta} />
            <circle cx={q[0]} cy={q[1]} r={dest ? rad + 7 : rad} fill={dest ? C.rojo : COLORES[i % 4]} stroke={C.tinta} strokeWidth={5} />
            <circle cx={q[0] - rad * 0.3} cy={q[1] - rad * 0.3} r={rad * 0.22} fill="#FFFFFF" opacity={0.8} />
          </g>
        );
      })}
      {/* personas en el centro */}
      <circle cx={CX} cy={CY} r={92} fill="#FFF7E3" stroke={C.tinta} strokeWidth={6} />
      <text x={CX} y={CY + 30} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={120} fill={C.tinta}>{n}</text>
      <text x={CX} y={CY + 80} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={34} fill={C.tinta}>personas</text>
      {medidor ? (
        <g>
          <text x={540} y={1350} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={44} fill={C.tinta}>
            chance de coincidencia: {pct(p)} %
          </text>
          <rect x={100 + 8} y={1370 + 8} width={880} height={46} rx={23} fill={C.tinta} />
          <rect x={100} y={1370} width={880} height={46} rx={23} fill={C.blanco} stroke={C.tinta} strokeWidth={6} />
          <rect x={106} y={1376} width={Math.max(0, 868 * p)} height={34} rx={17} fill={p >= 0.5 ? C.rojo : C.amarillo} />
          <line x1={540} y1={1362} x2={540} y2={1424} stroke={C.tinta} strokeWidth={6} strokeDasharray="8 8" />
        </g>
      ) : null}
    </svg>
  );
};

const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  const n = personas(f);
  const [ax, ay] = pos(A, n);
  const [bx, by] = pos(B, n);
  const mx = (ax + bx) / 2;
  return (
    <>
      {entre(f, E.mitad, E.parejas) ? <Rotulo texto="mismo día" desde={r.w(2, "repetido")} x={mx} y={ay - 70} ax={mx} ay={(ay + by) / 2} color={C.blanco} fondo={C.rojo} tam={28} /> : null}
      {entre(f, E.cuenta, E.reves) ? (
        <Contador hasta={253} despues=" parejas" desde={r.w(4, "doscientas") - 4} dur={36} x={540} y={620} tam={78} color={C.rojo} />
      ) : null}
    </>
  );
};

const Diagrama: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= E.cta) return null;
  const g = [r.w(1, "veintitr"), r.w(2, "cincuenta"), r.w(3, "parejas"), r.w(4, "doscientas"), r.w(5, "desploma"), r.w(6, "setenta"), r.w(7, "cuarenta")].reduce((m, k) => m * golpe(f, k, 1.04, 12), 1);
  return (
    <AbsoluteFill style={{ scale: g }}>
      <Ronda />
      <Anotaciones />
    </AbsoluteFill>
  );
};

/* ---------- Capas de pantalla ---------- */

const Gancho: React.FC = () => (
  <>
    <Etiqueta texto="la juntada de este finde" desde={-8} />
    <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={400} tam={58} />
    <Globo texto="¿mismo día?" desde={24} x={90} y={1310} cola="izq" tam={42} ancho={330} />
  </>
);

const Veintitres: React.FC = () => (
  <>
    <Etiqueta texto="la verdad" color={C.verde} />
    <Titulo pregunta="no hacen falta muchísimos…" desdeP={0} respuesta="¡solo 23!" desdeR={r.w(1, "veintitr") - E.veintitres} top={380} tamR={130} />
  </>
);

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grito = r.w(10, "nunca") - E.cta;
  return (
    <>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={360} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1100px" }}>
          <rect x={200 + 14} y={700 + 14} width={680} height={640} rx={20} fill={C.tinta} />
          <rect x={200} y={700} width={680} height={640} rx={20} fill={TONO.frio} stroke={C.tinta} strokeWidth={10} />
          <Vecino cx={540} cy={1010} s={1.05} t={frame} boca={frame >= grito ? "o" : "sonrisa"} />
          <line x1={540} y1={700} x2={540} y2={860} stroke={C.tinta} strokeWidth={10} />
          <line x1={200} y1={860} x2={880} y2={860} stroke={C.tinta} strokeWidth={10} />
          <path d="M230 730 l90 0 l-90 90 z" fill={C.blanco} opacity={0.6} />
          <rect x={170} y={1336} width={740} height={40} rx={14} fill={TONO.tierraSombra} stroke={C.tinta} strokeWidth={8} />
        </g>
      </Lienzo>
      {frame >= grito ? <Globo texto="¡nunca coincidimos!" desde={grito} x={520} y={560} cola="der" tam={40} ancho={460} /> : null}
    </>
  );
};

export const ParadojaCumpleanos017: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [24, "burbuja", 0.35],
    [r.w(1, "veintitr") - 2, "scratch", 0.55], [r.w(1, "veintitr"), "boing", 0.5],
    [E.mitad, "whoosh", 0.35], [r.w(2, "repetido"), "sello", 0.45], [r.w(2, "cincuenta"), "ding", 0.45],
    [E.parejas, "whoosh", 0.35], [r.w(3, "parejas"), "pop"],
    [E.cuenta, "whoosh", 0.35], [r.w(4, "doscientas") - 4, "tic", 0.4], [r.w(4, "doscientas") + 32, "ding", 0.45],
    [E.reves, "whoosh", 0.35], [r.w(5, "desploma"), "latigo", 0.45],
    [E.setenta, "whoosh", 0.4], [r.w(6, "setenta") + 10, "tic", 0.4], [r.w(6, "noventa"), "ding", 0.5],
    [E.cuarenta, "whoosh", 0.35], [r.w(7, "cuarenta"), "pop"],
    [E.ojo, "sello", 0.55], [E.ojo + 8, "pop"],
    [E.cualquiera, "whoosh", 0.35], [r.w(9, "cualesquiera"), "sello", 0.45],
    [E.cta, "pop"], [r.w(10, "nunca"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo">
        <Logo />
      </Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.veintitres - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · veintitres" from={E.veintitres} durationInFrames={E.mitad - E.veintitres} layout="none"><Veintitres /></Sequence>
      <Sequence name="3 · mitad" from={E.mitad} durationInFrames={E.parejas - E.mitad} layout="none">
        <Etiqueta texto="más de la mitad" /><Fuente texto="Paradoja del cumpleaños (probabilidad)" />
      </Sequence>
      <Sequence name="4 · parejas" from={E.parejas} durationInFrames={E.cuenta - E.parejas} layout="none"><Etiqueta texto="el truco · las parejas" color={C.verde} /></Sequence>
      <Sequence name="5 · cuenta" from={E.cuenta} durationInFrames={E.reves - E.cuenta} layout="none"><Etiqueta texto="cada línea es una chance" /></Sequence>
      <Sequence name="6 · reves" from={E.reves} durationInFrames={E.setenta - E.reves} layout="none"><Etiqueta texto="la cuenta al revés" /></Sequence>
      <Sequence name="7 · setenta" from={E.setenta} durationInFrames={E.cuarenta - E.setenta} layout="none"><Etiqueta texto="con 70 personas" color={C.rojo} /></Sequence>
      <Sequence name="8 · cuarenta" from={E.cuarenta} durationInFrames={E.ojo - E.cuarenta} layout="none"><Etiqueta texto="con 40 personas" /></Sequence>
      <Sequence name="9 · ojo" from={E.ojo} durationInFrames={E.cualquiera - E.ojo} layout="none">
        <Sello texto="OJO" desde={0} x={440} y={450} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
        <Etiqueta texto="365 días parejos (supuesto)" color={C.rojo} />
      </Sequence>
      <Sequence name="10 · cualquiera" from={E.cualquiera} durationInFrames={E.cta - E.cualquiera} layout="none">
        <Etiqueta texto="dos cualesquiera" color={C.verde} />
      </Sequence>
      <Sequence name="11 · cta" from={E.cta} durationInFrames={DURACION - E.cta} layout="none"><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal mandar={`mandáselo a ese que jura que en su grupo nunca coinciden los cumpleaños`} /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("017-paradoja-cumpleanos/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada017: React.FC = () => (
  <Portada arriba="¿cuánta gente hace falta para coincidir?" grande="23" sello="MATEMÁTICA" colorSello={C.verde} numero={17}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 23 }, (_, i) => {
        const a = (i / 23) * Math.PI * 2 - Math.PI / 2;
        return [540 + Math.cos(a) * 280, 1000 + Math.sin(a) * 280] as const;
      }).map((a, i, arr) => (
        <g key={i}>
          {arr.slice(i + 1).map((b, j) => <line key={j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.tinta} strokeWidth={2.5} opacity={0.5} />)}
        </g>
      ))}
      {Array.from({ length: 23 }, (_, i) => {
        const a = (i / 23) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={540 + Math.cos(a) * 280} cy={1000 + Math.sin(a) * 280} r={20} fill={i === 0 || i === 8 ? C.rojo : COLORES[i % 4]} stroke={C.tinta} strokeWidth={5} />;
      })}
    </svg>
  </Portada>
);

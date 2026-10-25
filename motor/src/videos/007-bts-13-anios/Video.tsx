import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/007-bts-13-anios/tiempos.json";
import { C, display, mono, sombra } from "../../kit/marca";
import { clamp, entre, golpe, pop, resorte } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Camara, Paso, Rotulo, toma } from "../../kit/diagrama";
import { Persona, claro, mezclar, oscuro } from "../../kit/biblioteca";
import { MapaSudamerica, PINES, Pin } from "../../kit/mapa";

// MUNDO: una línea de tiempo 2013 → 2026 que la cámara recorre como una ruta, con un año gigante arriba.
// Paradas: debut (2013) · mapa de Latinoamérica (Brasil suma visitas, Argentina en cero) · gira 2020 cancelada ·
// cuartel del servicio militar (entran y salen los 7) · 2026: Argentina se prende de violeta, 3 noches en La Plata.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);
const n = tiempos.frases.length;

const E = {
  gancho: r.f(0), golpe: r.f(1), debut: r.f(2), brasil: r.f(3), argentina: r.f(4), pandemia: r.f(5), servicio: r.f(6),
  meses: r.f(7), jin: r.f(8), suga: r.f(9), arirang: r.f(10), noches: r.f(11), ojo: r.f(12), remate: r.f(13), cta: r.f(14),
  sello: r.fin(n - 1) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const VIOLETA = claro(mezclar(C.azul, C.rojo, 0.42), 0.15);
const SUELO = 1330;
const X = (anio: number) => 300 + (anio - 2013) * 300; // posición de cada año en la ruta

/* ---------- año grande arriba: avanza con la historia ---------- */
// el año queda fijo en cada parada y salta (o corre) solo cuando la historia avanza
const ANIOS: [number, number][] = [
  [E.gancho, 2013], [E.brasil - 1, 2013], [E.brasil, 2014], [E.brasil + 50, 2019], [E.pandemia - 1, 2019], [E.pandemia, 2020],
  [E.servicio - 1, 2020], [E.servicio, 2022], [E.jin, 2022], [r.w(9, "salió"), 2025], [E.arirang - 1, 2025], [E.arirang, 2026],
];
const anioEn = (f: number) => Math.round(interpolate(f, ANIOS.map((a) => a[0]), ANIOS.map((a) => a[1]), clamp));

/* ---------- los 7 (luces genéricas, sin caras ni logos) ---------- */
const Luz: React.FC<{ x: number; y: number; t: number; color?: string; s?: number }> = ({ x, y, t, color = VIOLETA, s = 1 }) => (
  <g transform={`translate(${x} ${y + Math.sin(t / 7 + x) * 4}) scale(${s})`}>
    <circle r={34} fill={color} opacity={0.25} />
    <circle cx={4} cy={4} r={18} fill={C.tinta} />
    <circle r={18} fill={color} stroke={C.tinta} strokeWidth={5} />
    <circle cx={-6} cy={-6} r={5} fill="#FFFFFF" opacity={0.9} />
  </g>
);

/* ---------- paradas ---------- */
const Escenario: React.FC<{ x: number; t: number }> = ({ x, t }) => (
  <g>
    <rect x={x - 230 + 12} y={SUELO - 120 + 12} width={460} height={120} rx={18} fill={C.tinta} />
    <rect x={x - 230} y={SUELO - 120} width={460} height={120} rx={18} fill={oscuro(VIOLETA, 0.35)} stroke={C.tinta} strokeWidth={8} />
    {[0, 1, 2, 3, 4, 5, 6].map((k) => <Luz key={k} x={x - 180 + k * 60} y={SUELO - 170} t={t + k * 9} />)}
    {[-1, 1].map((d) => <path key={d} d={`M${x + d * 200} ${SUELO - 120} L${x + d * 120} ${SUELO - 520}`} stroke={C.amarillo} strokeWidth={40} opacity={0.25} strokeLinecap="round" />)}
  </g>
);

const Afiche: React.FC<{ x: number; f: number }> = ({ x, f }) => {
  const tacha = r.w(5, "pandemia");
  return (
    <g>
      <rect x={x - 170 + 12} y={SUELO - 520 + 12} width={340} height={460} rx={16} fill={C.tinta} />
      <rect x={x - 170} y={SUELO - 520} width={340} height={460} rx={16} fill={C.blanco} stroke={C.tinta} strokeWidth={8} />
      <rect x={x - 140} y={SUELO - 490} width={280} height={200} rx={10} fill={VIOLETA} />
      {[0, 1, 2, 3, 4, 5, 6].map((k) => <circle key={k} cx={x - 105 + k * 35} cy={SUELO - 390} r={12} fill={C.blanco} opacity={0.85} />)}
      <text x={x} y={SUELO - 230} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={44} fill={C.tinta}>GIRA MUNDIAL</text>
      <text x={x} y={SUELO - 180} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={34} fill={C.tinta}>2020</text>
      {[0, 1, 2, 3].map((k) => <rect key={k} x={x - 130} y={SUELO - 150 + k * 22} width={260} height={8} rx={4} fill="#C9D0E0" />)}
      {f >= tacha ? (
        <g style={{ scale: interpolate(resorte(f, 30, tacha, 320), [0, 1], [2.2, 1]), transformOrigin: `${x}px ${SUELO - 300}px` }}>
          <g transform={`rotate(-14 ${x} ${SUELO - 300})`}>
            <rect x={x - 200 + 8} y={SUELO - 345 + 8} width={400} height={90} rx={14} fill={C.tinta} />
            <rect x={x - 200} y={SUELO - 345} width={400} height={90} rx={14} fill={C.rojo} stroke={C.tinta} strokeWidth={7} />
            <text x={x} y={SUELO - 282} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={60} fill={C.blanco}>CANCELADA</text>
          </g>
        </g>
      ) : null}
    </g>
  );
};

/** Cuartel: los 7 entran uno por uno (desde fines de 2022) y salen todos en junio de 2025. */
const Cuartel: React.FC<{ x: number; f: number }> = ({ x, f }) => {
  const entra = (k: number) => E.jin + 10 + k * 9;
  const sale = r.w(9, "salió");
  return (
    <g>
      <rect x={x - 260 + 12} y={SUELO - 360 + 12} width={520} height={360} fill={C.tinta} />
      <rect x={x - 260} y={SUELO - 360} width={520} height={360} fill="#8FA36B" stroke={C.tinta} strokeWidth={8} />
      <path d={`M${x - 290} ${SUELO - 360} L${x} ${SUELO - 470} L${x + 290} ${SUELO - 360} Z`} fill="#5E6E45" stroke={C.tinta} strokeWidth={8} strokeLinejoin="round" />
      <rect x={x - 170} y={SUELO - 440 + 60} width={340} height={56} rx={8} fill={C.blanco} stroke={C.tinta} strokeWidth={5} />
      <text x={x} y={SUELO - 393 + 34} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={26} fill={C.tinta}>SERVICIO MILITAR</text>
      <rect x={x - 60} y={SUELO - 170} width={120} height={170} rx={8} fill="#3B4630" stroke={C.tinta} strokeWidth={6} />
      {[-180, 120].map((wx) => <rect key={wx} x={x + wx} y={SUELO - 260} width={70} height={60} fill="#CFE9FF" stroke={C.tinta} strokeWidth={5} />)}
      {[0, 1, 2, 3, 4, 5, 6].map((k) => {
        // afuera → adentro (entran) → afuera (salen)
        const xIn = interpolate(f, [entra(k), entra(k) + 12], [x - 420 + k * 34, x], clamp);
        const adentro = f >= entra(k) + 12 && f < sale + k * 3;
        const xOut = interpolate(f, [sale + k * 3, sale + k * 3 + 14], [x, x + 360 + (k - 3) * 40], clamp);
        if (adentro) return null;
        const xx = f >= sale ? xOut : xIn;
        const yy = SUELO - 40 - (f >= sale ? Math.abs(Math.sin((f - sale) / 4 + k)) * 40 : 0);
        return <Luz key={k} x={xx} y={yy} t={f + k * 7} s={0.9} />;
      })}
    </g>
  );
};

const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const visitas = entre(f, E.brasil, E.pandemia) ? Math.min(4, Math.max(0, Math.floor((f - E.brasil) / 18) + 1)) : f >= E.pandemia ? 4 : 0;
  const argOn = f >= r.w(10, "mapa");
  return (
    <svg width={4600} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* la ruta del tiempo */}
      <rect x={-400} y={SUELO} width={5400} height={60} fill="#2A2D3A" stroke={C.tinta} strokeWidth={7} />
      {Array.from({ length: 50 }).map((_, k) => <rect key={k} x={-380 + k * 110} y={SUELO + 26} width={60} height={8} fill={C.amarillo} />)}
      {Array.from({ length: 14 }).map((_, k) => (
        <g key={k}>
          <line x1={X(2013 + k)} y1={SUELO + 60} x2={X(2013 + k)} y2={SUELO + 96} stroke={C.tinta} strokeWidth={6} />
          <text x={X(2013 + k)} y={SUELO + 136} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={30} fill={C.tinta}>{2013 + k}</text>
        </g>
      ))}
      <Escenario x={X(2013)} t={f} />
      {/* Latinoamérica: el mapa entre 2014 y 2019 */}
      <MapaSudamerica x={X(2016) - 220} y={SUELO - 700} s={1.0} brasil={visitas > 0 ? C.amarillo : undefined} argentina={f >= E.argentina && f < E.pandemia ? "#C9C9C9" : undefined}>
        {visitas > 0 ? <Pin x={PINES.brasil[0]} y={PINES.brasil[1]} color={C.rojo} s={1 + Math.min(visitas, 4) * 0.06} /> : null}
        {f >= E.argentina ? <Pin x={PINES.argentina[0]} y={PINES.argentina[1]} color="#9A9A9A" /> : null}
      </MapaSudamerica>
      <Afiche x={X(2020)} f={f} />
      {/* octubre 2022: Jin solo, en River, invitado de Coldplay (aparece en el "Ojo") */}
      {f >= E.ojo - 6 ? (
        <g style={{ scale: interpolate(resorte(f, 30, E.ojo, 260), [0, 1], [0, 1]), transformOrigin: `${X(2022) - 200}px ${SUELO}px` }}>
          <ellipse cx={X(2022) - 200} cy={SUELO - 20} rx={200} ry={34} fill="#2A2D3A" stroke={C.tinta} strokeWidth={7} />
          {[-1, 1].map((d) => <path key={d} d={`M${X(2022) - 200 + d * 150} ${SUELO - 30} L${X(2022) - 200 + d * 60} ${SUELO - 520}`} stroke={C.amarillo} strokeWidth={34} opacity={0.3} strokeLinecap="round" />)}
          <Luz x={X(2022) - 200} y={SUELO - 90} t={f} s={1.4} />
          <text x={X(2022) - 200} y={SUELO - 150} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={40} fill={C.tinta}>Jin</text>
        </g>
      ) : null}
      <Cuartel x={X(2023) + 150} f={f} />
      {/* 2026: Argentina en el mapa, de violeta */}
      <MapaSudamerica x={X(2026) - 220} y={SUELO - 700} s={1.0} brasil={C.amarillo} argentina={argOn ? VIOLETA : undefined}>
        <Pin x={PINES.brasil[0]} y={PINES.brasil[1]} color={C.rojo} />
        {argOn ? <Pin x={PINES.argentina[0]} y={PINES.argentina[1]} color={VIOLETA} s={1.25} /> : null}
      </MapaSudamerica>
      {argOn ? (
        <g>
          {[0, 1, 2].map((k) => (
            <circle key={k} cx={X(2026) - 220 + PINES.argentina[0]} cy={SUELO - 700 + PINES.argentina[1] - 56}
              r={((f - r.w(10, "mapa")) * 6 + k * 70) % 210} fill="none" stroke={VIOLETA} strokeWidth={8}
              opacity={Math.max(0, 1 - (((f - r.w(10, "mapa")) * 6 + k * 70) % 210) / 210)} />
          ))}
        </g>
      ) : null}
    </svg>
  );
};

const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  const visitas = Math.min(4, Math.max(0, Math.floor((f - E.brasil) / 18) + 1));
  return (
    <>
      {entre(f, E.debut, E.brasil) ? <Rotulo texto="debut en Corea del Sur" grande="junio 2013" desde={E.debut + 8} x={X(2013)} y={760} ax={X(2013)} ay={SUELO - 200} tam={24} colorGrande={VIOLETA} /> : null}
      {entre(f, E.brasil, E.pandemia) ? <Rotulo texto="visitas a Brasil" grande={`${visitas}`} desde={E.brasil + 4} x={X(2016) + 330} y={720} ax={X(2016) - 220 + PINES.brasil[0]} ay={SUELO - 700 + PINES.brasil[1] - 50} tam={24} colorGrande={C.rojo} /> : null}
      {entre(f, E.argentina, E.pandemia) ? <Rotulo texto="visitas a Argentina" grande="0" desde={E.argentina + 2} x={X(2016) - 300} y={1100} ax={X(2016) - 220 + PINES.argentina[0]} ay={SUELO - 700 + PINES.argentina[1] - 50} tam={24} colorGrande="#777" /> : null}
      {entre(f, E.meses, E.suga) ? <Rotulo texto="servicio obligatorio" grande="18 a 21 meses" desde={r.w(7, "dieciocho") - 2} x={X(2023) + 150} y={700} ax={X(2023) + 150} ay={SUELO - 470} tam={22} colorGrande={C.rojo} /> : null}
      {entre(f, E.jin, E.suga) ? <Rotulo texto="primero: Jin" desde={E.jin + 8} x={X(2023) - 60} y={1120} ax={X(2023) - 270} ay={SUELO - 70} tam={24} /> : null}
      {entre(f, E.suga, E.arirang) ? <Rotulo texto="último en salir: Suga" grande="junio 2025" desde={r.w(9, "suga")} x={X(2023) + 300} y={860} ax={X(2023) + 470} ay={SUELO - 80} tam={22} colorGrande={C.verde} /> : null}
      {entre(f, E.ojo, E.remate) ? <Rotulo texto="Jin + Coldplay en River" grande="28/10/2022" desde={E.ojo + 14} x={X(2022) - 200} y={700} ax={X(2022) - 200} ay={SUELO - 190} tam={24} colorGrande={VIOLETA} /> : null}
      {entre(f, E.noches, E.ojo) ? <Rotulo texto="Estadio Único, La Plata" grande="3 noches" desde={E.noches + 4} x={X(2026) + 300} y={760} ax={X(2026) - 220 + PINES.argentina[0]} ay={SUELO - 700 + PINES.argentina[1] - 60} tam={22} colorGrande={VIOLETA} /> : null}
    </>
  );
};

/* Cámara: recorre la ruta del tiempo. */
const C_Y = 1000;
const TOMAS = [
  toma(0, X(2013) + 40, C_Y, 1.0), toma(E.brasil - 2, X(2013) + 40, C_Y, 1.0),
  toma(E.brasil + 14, X(2016), 980, 1.0), toma(E.pandemia - 1, X(2016), 980, 1.0),
  toma(E.pandemia + 14, X(2020), C_Y, 1.0), toma(E.servicio, X(2020), C_Y, 1.0),
  toma(E.servicio + 16, X(2023) + 150, C_Y, 1.0), toma(E.arirang, X(2023) + 150, C_Y, 1.0),
  toma(E.arirang + 16, X(2026), 980, 1.0), toma(E.ojo, X(2026), 980, 1.0), toma(E.ojo + 18, X(2022) - 200, 1000, 1.0),
  toma(E.remate, X(2022) - 200, 1000, 1.0), toma(E.remate + 18, X(2026), 1000, 0.92),
];
const GOLPES = [r.w(1, "fans"), r.w(3, "brasil"), r.w(4, "nunca"), r.w(5, "pandemia"), r.w(7, "dieciocho"), r.w(9, "suga"), r.w(10, "mapa"), r.w(11, "tres")];

const AnioGrande: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < E.debut || f >= E.ojo) return null;
  const a = anioEn(f);
  const cambio = ANIOS.find((p, i) => i > 0 && p[1] === a)?.[0] ?? E.debut;
  return (
    <div style={{ position: "absolute", top: 470, left: 0, right: 0, textAlign: "center", fontFamily: display, fontWeight: 800, fontSize: 150, lineHeight: 1,
      color: a === 2026 ? VIOLETA : C.tinta, letterSpacing: -6, WebkitTextStroke: a === 2026 ? `6px ${C.tinta}` : undefined, paintOrder: "stroke fill",
      scale: interpolate(resorte(f, fps, cambio, 420), [0, 1], [1.12, 1]) }}>
      {a}
    </div>
  );
};

const Diagrama: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= E.cta) return null;
  const g = GOLPES.reduce((m, k) => m * golpe(f, k, 1.05, 12), 1);
  return (
    <AbsoluteFill style={{ scale: g }}>
      <Camara tomas={TOMAS}><Mundo /><Anotaciones /></Camara>
    </AbsoluteFill>
  );
};

/* ---------- capas por frase ---------- */
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Etiqueta texto="BTS en Argentina" desde={-8} color={C.rojo} />
      <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={400} tam={58} />
      <div style={{ position: "absolute", top: 620, left: 0, right: 0, textAlign: "center", fontFamily: display, fontWeight: 800, fontSize: 230, color: VIOLETA,
        WebkitTextStroke: `9px ${C.tinta}`, paintOrder: "stroke fill", textShadow: `12px 12px 0 ${C.tinta}`, scale: interpolate(resorte(frame, 30, 10, 300), [0, 1], [0, 1]) }}>
        13 años
      </div>
    </>
  );
};

const Golpe: React.FC = () => (
  <>
    <Etiqueta texto="la verdad" color={C.verde} />
    <Titulo pregunta="¿falta de fans?" desdeP={0} respuesta="¡obstáculos!" desdeR={r.w(1, "fans") - E.golpe} top={400} tamR={120} />
  </>
);

const Ojo: React.FC = () => (
  <>
    <Sello texto="OJO" desde={0} x={440} y={380} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
    <Sello texto="PERO LOS 7, NUNCA" desde={r.w(12, "nunca") - E.ojo} x={180} y={1180} rot={4} color={VIOLETA} tam={56} />
  </>
);

const Remate: React.FC = () => (
  <>
    <Etiqueta texto="en criollo" />
    <Titulo pregunta="13 años de espera para 3 noches…" desdeP={0} respuesta="¡valió cada día!" desdeR={r.w(13, "valió") - E.remate} top={400} tamR={100} />
  </>
);

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dias = Math.round(interpolate(frame, [10, 50], [0, 4870], clamp));
  return (
    <>
      <Titulo pregunta="mandáselo a esa ARMY que…" desdeP={0} top={360} />
      <Lienzo>
        <g style={{ scale: interpolate(resorte(frame, fps, 0, 220), [0, 1], [0.6, 1]), transformOrigin: "540px 1440px" }}>
          <Persona x={540} y={1440} s={1.15} t={frame} gesto="feliz" pelo="largo" remera={VIOLETA} mira={-1} />
        </g>
      </Lienzo>
      <div style={{ position: "absolute", left: 90, top: 640, rotate: "-4deg", background: C.blanco, border: `6px solid ${C.tinta}`, borderRadius: 20, boxShadow: sombra(8),
        padding: "10px 24px", fontFamily: mono, fontWeight: 700, fontSize: 30, color: C.tinta, scale: pop(frame, fps, 8) }}>
        días esperando: <span style={{ fontFamily: display, fontWeight: 800, fontSize: 52, color: VIOLETA }}>{dias.toLocaleString("es-AR")}</span>
      </div>
      <Globo texto="¡conté cada uno!" desde={40} x={560} y={800} cola="der" tam={40} ancho={400} />
    </>
  );
};

export const Bts13Anios007: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [10, "sello", 0.5],
    [r.w(1, "fans") - 2, "scratch", 0.5], [r.w(1, "fans"), "boing", 0.5],
    [E.debut, "whoosh", 0.4], [E.debut + 8, "pop"],
    [E.brasil, "whoosh", 0.4], [E.brasil + 4, "pop"], [E.brasil + 22, "pop"], [E.brasil + 40, "pop"], [E.brasil + 58, "pop"],
    [r.w(4, "nunca"), "error", 0.45],
    [E.pandemia, "whoosh", 0.4], [r.w(5, "pandemia"), "sello", 0.55],
    [E.servicio, "whoosh", 0.4], [r.w(7, "dieciocho"), "tic", 0.4],
    [E.jin + 10, "pop"], [E.jin + 28, "pop"], [E.jin + 46, "pop"], [E.jin + 64, "pop"],
    [r.w(9, "salió"), "fiesta", 0.45],
    [E.arirang, "whoosh", 0.4], [r.w(10, "mapa"), "ding", 0.5],
    [E.noches + 4, "sello", 0.5],
    [E.ojo, "sello", 0.55], [E.ojo + 4, "whoosh", 0.4], [E.ojo + 14, "pop"], [r.w(12, "nunca"), "sello", 0.5],
    [r.w(13, "valió"), "ding", 0.45],
    [E.cta, "pop"], [E.cta + 50, "ding", 0.4], [E.cta + 40, "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <AnioGrande />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo"><Logo /></Sequence>
      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.golpe - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · golpe" from={E.golpe} durationInFrames={E.debut - E.golpe} layout="none"><Golpe /></Sequence>
      <Sequence name="3 · debut" from={E.debut} durationInFrames={E.brasil - E.debut} layout="none"><Paso n={1} texto="el debut" top={380} /></Sequence>
      <Sequence name="4-5 · latam" from={E.brasil} durationInFrames={E.pandemia - E.brasil} layout="none">
        <Paso n={2} texto="Latinoamérica" top={380} /><Fuente texto="Billboard Brasil" />
      </Sequence>
      <Sequence name="6 · pandemia" from={E.pandemia} durationInFrames={E.servicio - E.pandemia} layout="none"><Paso n={3} texto="la pandemia" top={380} /></Sequence>
      <Sequence name="7-10 · servicio" from={E.servicio} durationInFrames={E.arirang - E.servicio} layout="none">
        <Paso n={4} texto="el servicio militar" top={380} /><Fuente texto="Associated Press (2025)" />
      </Sequence>
      <Sequence name="11-12 · arirang" from={E.arirang} durationInFrames={E.ojo - E.arirang} layout="none">
        <Paso n={5} texto="gira ARIRANG" top={380} /><Fuente texto="Infobae · El Heraldo (2026)" />
      </Sequence>
      <Sequence name="13 · ojo" from={E.ojo} durationInFrames={E.remate - E.ojo} layout="none"><Ojo /><Fuente texto="La Nación · Buenos Aires Times (2022)" /></Sequence>
      <Sequence name="14 · remate" from={E.remate} durationInFrames={E.cta - E.remate} layout="none"><Remate /></Sequence>
      <Sequence name="15 · cta" from={E.cta} durationInFrames={DURACION - E.cta} layout="none"><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal /></Sequence>
      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("007-bts-13-anios/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada007: React.FC = () => (
  <Portada arriba="¿por qué la ARMY esperó 13 años?" grande="13 años" sello="BTS" colorSello={C.rojo} numero={7}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <MapaSudamerica x={300} y={830} s={1.05} brasil={C.amarillo} argentina={VIOLETA}>
        <Pin x={PINES.argentina[0]} y={PINES.argentina[1]} color={VIOLETA} s={1.3} />
      </MapaSudamerica>
    </svg>
  </Portada>
);

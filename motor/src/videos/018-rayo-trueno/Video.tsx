import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/018-rayo-trueno/tiempos.json";
import { C, display } from "../../kit/marca";
import { clamp, entre, golpe, pop, suave } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Camara, Ciudad, Piso, Rotulo, TONO, toma } from "../../kit/diagrama";
import { Nube, Persona } from "../../kit/biblioteca";

// Mundo: una calle vista de costado. A la izquierda vos (la persona), a la derecha la tormenta; el suelo es una regla en kilómetros.
// Mecanismo: el rayo se ve al instante (destello), el sonido viaja como ondas y tarda ~3 segundos por kilómetro: un contador cuenta mientras la onda llega.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  contar: r.f(1),
  luz: r.f(2),
  sonido: r.f(3),
  tres: r.f(4),
  seis: r.f(5),
  estima: r.f(6),
  ojo: r.f(7),
  adentro: r.f(8),
  cta: r.f(9),
  sello: r.fin(9) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const SUELO = 1330;
const PX = 190; // la persona
const KM1 = 480;
const KM2 = 810;
const BASE = 1090; // base de la nube
const SEG = 20; // frames por segundo "contado" en pantalla (la cuenta se acelera, igual que el resto del video)

/** Rayo en zigzag desde la nube hasta el suelo, visible unos frames con parpadeo. */
const Rayo: React.FC<{ bx: number; desde: number; y0?: number; y1?: number; ancho?: number }> = ({ bx, desde, y0 = BASE - 10, y1 = SUELO - 6, ancho = 1 }) => {
  const f = useCurrentFrame();
  const t = f - desde;
  if (t < 0 || t > 14) return null;
  const o = t > 8 ? (t % 2 === 0 ? 1 : 0.35) : 1;
  const h = y1 - y0;
  const pts = [[0, 0], [-34, 0.28], [14, 0.34], [-40, 0.66], [10, 0.72], [-6, 1]].map(([dx, k]) => `${bx + dx * ancho},${y0 + h * k}`);
  const d = `M${bx + 20 * ancho},${y0} L${pts.join(" L")} L${bx + 16 * ancho},${y0 + h * 0.74} L${bx + 52 * ancho},${y0 + h * 0.66} L${bx + 4 * ancho},${y0 + h * 0.36} L${bx + 40 * ancho},${y0 + h * 0.3} Z`;
  return (
    <g opacity={o}>
      <path d={d} fill={C.tinta} transform="translate(8 8)" />
      <path d={d} fill={C.amarillo} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

/** Ondas de sonido que avanzan desde el rayo hacia vos (tardan: ahí está la cuenta). */
const Ondas: React.FC<{ f: number; f0: number; dur: number; bx: number }> = ({ f, f0, dur, bx }) => {
  const p = (f - f0) / dur;
  if (p < 0 || p > 1.02) return null;
  const xw = bx - (bx - PX - 30) * Math.min(1, p);
  const yc = SUELO - 110;
  return (
    <g fill="none" stroke={C.azul} strokeLinecap="round">
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M${xw + 44 * k + 18} ${yc - 90} Q${xw + 44 * k - 26} ${yc} ${xw + 44 * k + 18} ${yc + 90}`}
          strokeWidth={12 - k * 2} opacity={1 - k * 0.28} />
      ))}
    </g>
  );
};

/* ---------- El mundo ---------- */
const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const flashLuz = r.w(2, "luz");
  const tormenta = 1;
  const alcance = suave(f, E.ojo + 6, 22);
  const haceLlegar = f >= E.ojo ? alcance : 0;
  const entra = f >= r.w(8, "adentro");
  const px = entra ? interpolate(f, [r.w(8, "adentro"), r.w(8, "adentro") + 14], [PX, PX - 60], clamp) : PX;
  const po = entra ? interpolate(f, [r.w(8, "adentro"), r.w(8, "adentro") + 14], [1, 0], clamp) : 1;
  const gesto = f >= E.ojo && f < E.adentro ? "preocupada" : f >= E.adentro ? "canchera" : "sorprendida";
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* cielo de tormenta */}
      <rect x={-1500} y={-2000} width={4080} height={SUELO + 2000} fill={TONO.nubeMedio} opacity={0.35} />

      {/* la tormenta */}
      <Nube x={660} y={BASE} s={1.15} t={f} tormenta={tormenta} />

      {/* zona de alcance (Ojo): el borde de la tormenta crece hasta vos */}
      {f >= E.ojo ? (
        <circle cx={660} cy={BASE} r={160 + 560 * haceLlegar} fill={C.rojo} fillOpacity={0.1 * haceLlegar} stroke={C.rojo}
          strokeWidth={8} strokeDasharray="22 16" opacity={0.9 * haceLlegar} />
      ) : null}

      {/* rayos */}
      <Rayo bx={KM2} desde={4} />
      <Rayo bx={KM1} desde={flashLuz} />
      <Rayo bx={KM1} desde={E.sonido} />
      <Rayo bx={KM2} desde={E.seis} />

      {/* la luz llega ya: línea que cruza de golpe */}
      {entre(f, flashLuz, flashLuz + 6) ? (
        <line x1={KM1} y1={SUELO - 110} x2={KM1 - (KM1 - PX - 30) * Math.min(1, (f - flashLuz) / 3)} y2={SUELO - 110}
          stroke={C.amarillo} strokeWidth={14} strokeLinecap="round" />
      ) : null}

      {/* ondas de sonido */}
      <Ondas f={f} f0={E.sonido} dur={3 * SEG} bx={KM1} />
      <Ondas f={f} f0={E.seis} dur={6 * SEG} bx={KM2} />

      <Ciudad suelo={SUELO} t={f} edificios={[[-40, 300, 190], [880, 130, 120]]} />
      <g opacity={po}>
        <Persona x={px} y={SUELO + 8} s={0.64} t={f} gesto={gesto} mira={1} pelo="rulos" />
      </g>
      <Piso y={SUELO} />

      {/* regla en km sobre el suelo */}
      {f >= E.luz - 10 ? (
        <g fontFamily={display} fontWeight={800} fontSize={38} fill={C.tinta} opacity={suave(f, E.luz - 10, 10)} textAnchor="middle">
          {[[PX, "vos"], [KM1, "1 km"], [KM2, "2 km"]].map(([x, t]) => (
            <g key={t as string}>
              <line x1={x as number} y1={SUELO} x2={x as number} y2={SUELO + 40} stroke={C.tinta} strokeWidth={7} />
              <text x={x as number} y={SUELO + 84}>{t}</text>
            </g>
          ))}
        </g>
      ) : null}
    </svg>
  );
};

/** Contador de segundos: sube de a uno al ritmo de la cuenta. */
const Seg: React.FC<{ desde: number; hasta: number; x: number; y: number }> = ({ desde, hasta, x, y }) => {
  const f = useCurrentFrame();
  if (f < desde) return null;
  const n = Math.min(hasta, Math.floor((f - desde) / SEG) + 1);
  const tic = (f - desde) % SEG;
  const rebote = n >= hasta && f - desde >= hasta * SEG ? 1 : interpolate(tic, [0, 4, 10], [1.25, 1, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", scale: rebote, textAlign: "center" }}>
      <div style={{
        fontFamily: display, fontWeight: 800, fontSize: 150, lineHeight: 1, color: C.rojo, whiteSpace: "nowrap",
        WebkitTextStroke: `9px ${C.tinta}`, paintOrder: "stroke fill", textShadow: `10px 10px 0 ${C.tinta}`,
      }}>
        {n} s
      </div>
    </div>
  );
};

const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {entre(f, E.sonido, E.seis) ? <Seg desde={E.sonido} hasta={3} x={290} y={930} /> : null}
      {entre(f, E.seis, E.ojo) ? <Seg desde={E.seis} hasta={6} x={290} y={930} /> : null}
      {entre(f, E.sonido + 3 * SEG, E.seis) ? (
        <Rotulo texto="3 segundos = 1 km" desde={E.sonido + 3 * SEG} x={470} y={1530} ax={KM1} ay={SUELO + 92} color={C.blanco} fondo={C.azul} tam={36} />
      ) : null}
      {entre(f, E.seis + 6 * SEG, E.ojo) ? (
        <Rotulo texto="6 segundos = 2 km" desde={E.seis + 6 * SEG} x={720} y={1530} ax={KM2} ay={SUELO + 92} color={C.blanco} fondo={C.azul} tam={36} />
      ) : null}
      {entre(f, E.ojo, E.adentro) ? (
        <Rotulo texto="si lo oís, estás al alcance" desde={E.ojo + 28} x={420} y={1530} ax={PX} ay={SUELO + 92} color={C.blanco} fondo={C.rojo} tam={34} />
      ) : null}
    </>
  );
};

const TOMAS = [
  toma(0, 540, 1080, 1.0), toma(E.contar, 380, 1120, 1.22), toma(E.luz - 6, 520, 1100, 1.05),
  toma(E.sonido, 420, 1120, 1.12), toma(E.seis - 8, 540, 1090, 0.98),
  toma(E.estima, 540, 1090, 1.0), toma(E.ojo, 540, 1100, 0.96), toma(E.adentro, 540, 1100, 1.0),
];
const GOLPES = [r.w(2, "rayo"), r.w(3, "tarda"), r.w(4, "tres"), r.w(5, "seis"), r.w(7, "ojo"), r.w(8, "adentro")];

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const puntos = [4, r.w(2, "luz"), E.sonido, E.seis];
  const a = puntos.reduce((m, p) => Math.max(m, interpolate(f, [p, p + 1, p + 7], [0, 0.65, 0], clamp)), 0);
  return <AbsoluteFill style={{ background: C.blanco, opacity: a, pointerEvents: "none" }} />;
};

const Diagrama: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= E.cta) return null;
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
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grito = r.w(9, "balcón") - E.cta;
  return (
    <>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={360} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1100px" }}>
          <rect x={150 + 14} y={760 + 14} width={780} height={640} rx={20} fill={C.tinta} />
          <rect x={150} y={760} width={780} height={640} rx={20} fill={TONO.nubeMedio} stroke={C.tinta} strokeWidth={10} />
          <Nube x={720} y={900} s={0.9} t={frame} tormenta={1} />
          <g transform={`translate(${690} ${900})`}>
            <path d="M0 0 L-30 80 L10 80 L-20 170 L50 60 L8 60 L40 0 Z" fill={C.amarillo} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round"
              opacity={frame % 22 < 14 ? 1 : 0.3} />
          </g>
          <Persona x={400} y={1370} s={1.05} t={frame} gesto="canchera" pelo="rulos" mira={1} />
          <rect x={130} y={1300} width={820} height={44} rx={14} fill={TONO.tierraSombra} stroke={C.tinta} strokeWidth={8} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1={180 + i * 120} y1={1344} x2={180 + i * 120} y2={1400} stroke={C.tinta} strokeWidth={10} />)}
        </g>
      </Lienzo>
      {frame >= grito ? <Globo texto="¡mirá qué rayo!" desde={grito} x={110} y={600} cola="izq" tam={42} ancho={400} /> : null}
    </>
  );
};

export const RayoTrueno018: React.FC = () => {
  const efectos: Efecto[] = [
    [4, "latigo", 0.5], [10, "pop", 0.35],
    [E.contar, "whoosh", 0.4], [E.contar + 6, "pop"],
    [r.w(2, "luz"), "latigo", 0.55], [E.luz, "whoosh", 0.35],
    [E.sonido, "latigo", 0.5], [r.w(3, "tarda"), "scratch", 0.4],
    [E.sonido + SEG, "tic", 0.4], [E.sonido + 2 * SEG, "tic", 0.4], [E.sonido + 3 * SEG, "ding", 0.5],
    [E.seis, "latigo", 0.5],
    ...[1, 2, 3, 4, 5].map((k) => [E.seis + k * SEG, "tic", 0.35] as Efecto),
    [E.seis + 6 * SEG, "ding", 0.5],
    [E.estima, "whoosh", 0.35], [E.estima + 6, "sello", 0.45],
    [E.ojo, "sello", 0.55], [E.ojo + 8, "pop"], [E.ojo + 28, "burbuja", 0.35],
    [E.adentro, "whoosh", 0.35], [r.w(8, "adentro"), "sello", 0.5],
    [E.cta, "pop"], [r.w(9, "balcón"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Flash />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo"><Logo /></Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.contar - E.gancho} layout="none">
        <Etiqueta texto="mirá el cielo" desde={-8} />
        <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={420} tam={60} />
      </Sequence>
      <Sequence name="2 · contar" from={E.contar} durationInFrames={E.luz - E.contar} layout="none">
        <Etiqueta texto="el truco" color={C.verde} />
        <Titulo pregunta="contá los segundos" desdeP={0} respuesta="rayo → trueno" desdeR={r.w(1, "trueno") - E.contar} top={400} tamR={92} />
      </Sequence>
      <Sequence name="3 · luz" from={E.luz} durationInFrames={E.sonido - E.luz} layout="none">
        <Etiqueta texto="paso 1 · la luz" />
        <Titulo pregunta="la luz llega" respuesta="¡ya!" desdeP={0} desdeR={r.w(2, "casi") - E.luz} top={400} tamR={130} />
      </Sequence>
      <Sequence name="4 · sonido" from={E.sonido} durationInFrames={E.tres - E.sonido} layout="none">
        <Etiqueta texto="paso 2 · el sonido" />
        <Titulo pregunta="el sonido…" respuesta="tarda" desdeP={0} desdeR={r.w(3, "tarda") - E.sonido} top={400} tamR={130} />
      </Sequence>
      <Sequence name="5 · tres" from={E.tres} durationInFrames={E.seis - E.tres} layout="none">
        <Etiqueta texto="paso 3 · la cuenta" />
        <Titulo pregunta="3 segundos ≈" respuesta="1 km" desdeP={0} desdeR={r.w(4, "kilómetro") - E.tres} top={400} tamR={130} />
        <Fuente texto="Live Science" />
      </Sequence>
      <Sequence name="6 · seis" from={E.seis} durationInFrames={E.estima - E.seis} layout="none">
        <Etiqueta texto="probalo" color={C.verde} />
        <Titulo pregunta="contaste 6 →" respuesta="2 km" desdeP={0} desdeR={r.w(5, "dos") - E.seis} top={400} tamR={130} />
        <Fuente texto="Live Science" />
      </Sequence>
      <Sequence name="7 · estima" from={E.estima} durationInFrames={E.ojo - E.estima} layout="none">
        <Sello texto="APROXIMADO" desde={6} x={300} y={430} rot={-5} color={C.amarillo} tinta={C.tinta} tam={64} />
      </Sequence>
      <Sequence name="8 · ojo" from={E.ojo} durationInFrames={E.adentro - E.ojo} layout="none">
        <Sello texto="OJO" desde={0} x={440} y={330} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
        <Fuente texto="National Weather Service (NOAA)" />
      </Sequence>
      <Sequence name="9 · adentro" from={E.adentro} durationInFrames={E.cta - E.adentro} layout="none">
        <Etiqueta texto="la regla" color={C.verde} />
        <Sello texto="SI TRUENA, ADENTRO" desde={r.w(8, "truena") - E.adentro - 4} x={110} y={440} rot={-4} color={C.rojo} tam={58} />
      </Sequence>
      <Sequence name="10 · cta" from={E.cta} durationInFrames={DURACION - E.cta} layout="none"><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal mandar={`mandáselo a ese que sale al balcón a filmar los rayos`} /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("018-rayo-trueno/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada018: React.FC = () => (
  <Portada arriba="¿a qué distancia está la tormenta?" grande="contá" sello="CIENCIA" colorSello={C.verde} numero={18}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(0 120)">
        <Nube x={700} y={900} s={1.6} t={10} tormenta={1} />
        <path d="M640 900 L590 1040 L650 1040 L600 1190 L730 1000 L670 1000 L720 900 Z" fill={C.amarillo} stroke={C.tinta} strokeWidth={8} strokeLinejoin="round" />
        <path d="M180 1100 Q130 1200 180 1300" fill="none" stroke={C.azul} strokeWidth={14} strokeLinecap="round" />
        <path d="M250 1120 Q200 1200 250 1280" fill="none" stroke={C.azul} strokeWidth={12} strokeLinecap="round" opacity={0.7} />
      </g>
    </svg>
  </Portada>
);

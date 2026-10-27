import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/018-refresca-tormenta/tiempos.json";
import { C } from "../../kit/marca";
import { clamp, entre, golpe, pop } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Nube, Termometro } from "../../kit/biblioteca";
import { Camara, Ciudad, OndasCalor, Piso, Rotulo, TONO, Trazo, Vecino, Velocidad, toma } from "../../kit/diagrama";

// Mundo: corte de una ciudad bajo una nube de tormenta, un termómetro en la calle.
// Mecanismo: las gotas se evaporan en la nube (sacan calor) -> bolsa de aire frío y pesado -> cae -> se desparrama
// por el piso como agua derramada (frente frío en miniatura) y el termómetro baja. "Ojo": la bolsa rara vez baja caliente.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  lluvia: r.f(1),
  evapora: r.f(2),
  pesa: r.f(3),
  vaso: r.f(4),
  frente: r.f(5),
  ojo: r.f(6),
  cta: r.f(7),
  sello: r.fin(7) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const SUELO = 1130; // la calle
const CX = 540;

const Lluvia: React.FC<{ f: number; n: number; x0: number; x1: number; y0: number; y1: number }> = ({ f, n, x0, x1, y0, y1 }) => (
  <g stroke={C.azul} strokeWidth={7} strokeLinecap="round">
    {Array.from({ length: n }).map((_, i) => {
      const per = 22 + (i % 4) * 4;
      const c = ((f + i * 9) % per) / per;
      const x = x0 + (x1 - x0) * ((i + 0.5) / n) + Math.sin(i * 1.7) * 10;
      const yy = y0 + (y1 - y0) * c;
      return <line key={i} x1={x} y1={yy} x2={x - 8} y2={yy + 30} opacity={Math.min(1, c * 8, (1 - c) * 8)} />;
    })}
  </g>
);

/* Gotas dentro de la nube: se achican (se evaporan) y el calor del aire va hacia ellas. */
const GotasEvaporan: React.FC<{ f: number; opacidad: number }> = ({ f, opacidad }) => (
  <g opacity={opacidad}>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const x = 360 + i * 72;
      const y = 565 + (i % 2) * 22;
      const c = ((f + i * 7) % 36) / 36;
      const lado = i % 2 ? 1 : -1;
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={22 * (1 - c * 0.85)} fill={C.azul} stroke={C.tinta} strokeWidth={5} />
          <circle cx={x + lado * (1 - c) * 70} cy={y + (1 - c) * 40} r={9 * (1 - c * 0.5)} fill={C.rojo} opacity={Math.min(1, (1 - c) * 3)} />
        </g>
      );
    })}
  </g>
);

const Triangulos: React.FC<{ x: number; y: number; dir: 1 | -1; desde: number }> = ({ x, y, dir, desde }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < desde) return null;
  const s = pop(f - desde, fps, 0);
  return (
    <g style={{ scale: s, transformOrigin: `${x}px ${y}px` }}>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${x - dir * i * 64} ${y - 34} l${dir * 52} 34 l${-dir * 52} 34 z`} fill={C.azul} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
      ))}
    </g>
  );
};

const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const suelo = r.w(3, "suelo");
  const baja = r.w(6, "baja");
  const caliente = r.w(6, "caliente");

  // bolsa fría: nace bajo la nube, cae, y al llegar se aplasta y se desparrama
  const nace = interpolate(f, [E.evapora + 20, r.w(2, "calor")], [0, 1], clamp);
  const cae = interpolate(f, [E.pesa, suelo + 6], [0, 1], clamp);
  const aplasta = interpolate(f, [E.vaso, E.vaso + 40], [0, 1], clamp);
  const cy = 700 + 380 * cae + 12 * aplasta;
  const rx = 200 + 560 * aplasta;
  const ry = 130 - 82 * aplasta;
  const fria = nace * (1 - interpolate(f, [baja + 4, baja + 30], [0, 1], clamp));

  // bolsa caliente (el "Ojo")
  const cae2 = interpolate(f, [baja, caliente + 10], [0, 1], clamp);
  const cy2 = 700 + 380 * cae2;

  // termómetro: 0.85 -> 0.3 al llegar el aire frío, y sube de nuevo en el "Ojo"
  const valor =
    f < E.vaso ? 0.85
    : f < baja ? interpolate(f, [E.vaso, E.vaso + 40], [0.85, 0.3], clamp)
    : interpolate(f, [caliente - 6, caliente + 24], [0.3, 0.8], clamp);
  const colorT = valor < 0.5 ? C.azul : C.rojo;
  const calor = f < E.vaso ? 1 : f < baja ? 0 : cae2 > 0.9 ? 1 : 0;

  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <radialGradient id="fria18" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#6FB6F2" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="calida18" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor={C.amarillo} stopOpacity="0.95" />
          <stop offset="1" stopColor={C.rojo} stopOpacity="0.85" />
        </radialGradient>
      </defs>

      <Piso y={SUELO} alto={200} />
      <Ciudad suelo={SUELO} t={f} />
      <OndasCalor xs={[120, 250, 800, 930]} y={SUELO - 6} t={f} opacidad={f < E.vaso ? 1 : f < baja ? 0 : calor} />

      {/* nube de tormenta con lluvia */}
      <Nube x={CX} y={600} s={1.4}t={f} tormenta={1} />
      {f >= E.lluvia - 6 && f < E.ojo ? <Lluvia f={f} n={16} x0={300} x1={780} y0={610} y1={SUELO - 20} /> : null}
      <GotasEvaporan f={f} opacidad={entre(f, E.evapora, E.pesa + 10) ? 1 : 0} />

      {/* bolsa de aire frío */}
      {fria > 0.02 ? (
        <>
          {entre(f, E.pesa, suelo + 8) ? <Velocidad cx={CX} cy={cy - 90} t={f} color={C.azul} /> : null}
          <ellipse cx={CX + 12} cy={cy + 12} rx={rx} ry={ry} fill={C.tinta} opacity={fria} />
          <ellipse cx={CX} cy={cy} rx={rx} ry={ry} fill="url(#fria18)" stroke={C.tinta} strokeWidth={8} opacity={fria} />
          <ellipse cx={CX - rx * 0.35} cy={cy - ry * 0.4} rx={rx * 0.22} ry={ry * 0.14} fill={C.blanco} opacity={0.8 * fria} />
        </>
      ) : null}

      {/* flechas del desparramo y bordes de frente frío */}
      {f < baja ? (
        <>
          <Trazo d={`M${CX - 140} 1070 L${CX - 420} 1070`} desde={r.w(4, "desparrama") - 6} dur={14} color={C.azul} ancho={12} flecha />
          <Trazo d={`M${CX + 140} 1070 L${CX + 420} 1070`} desde={r.w(4, "desparrama") - 6} dur={14} color={C.azul} ancho={12} flecha />
        </>
      ) : null}
      {fria > 0.5 && f >= E.frente ? (
        <>
          <Triangulos x={CX - 330} y={1060} dir={-1} desde={r.w(5, "frente")} />
          <Triangulos x={CX + 330} y={1060} dir={1} desde={r.w(5, "frente")} />
        </>
      ) : null}

      {/* bolsa caliente (muy rara) */}
      {f >= baja ? (
        <>
          <ellipse cx={CX + 12} cy={cy2 + 12} rx={190} ry={125} fill={C.tinta} opacity={0.9} />
          <ellipse cx={CX} cy={cy2} rx={190} ry={125} fill="url(#calida18)" stroke={C.tinta} strokeWidth={8} />
          <ellipse cx={CX - 70} cy={cy2 - 50} rx={44} ry={18} fill={C.blanco} opacity={0.8} />
        </>
      ) : null}

      <Termometro x={560} y={SUELO - 10} s={0.8} valor={valor} color={colorT} />
    </svg>
  );
};

const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {entre(f, E.evapora, E.pesa) ? (
        <>
          <Rotulo texto="la gota se evapora" desde={r.w(2, "evaporan")} x={300} y={470} ax={380} ay={555} tam={28} />
          <Rotulo texto="le saca calor al aire" desde={r.w(2, "calor")} x={800} y={470} ax={720} ay={580} tam={28} color={C.blanco} fondo={C.rojo} />
        </>
      ) : null}
      {entre(f, E.pesa, E.vaso) ? (
        <Rotulo texto="frío = más pesado" desde={r.w(3, "pesa")} x={790} y={800} ax={700} ay={850} tam={28} />
      ) : null}
      {entre(f, E.vaso, E.ojo) ? (
        <Rotulo texto="como agua derramada" desde={r.w(4, "derramado")} x={300} y={1010} ax={330} ay={1085} tam={30} />
      ) : null}
      {entre(f, E.frente, E.ojo) ? (
        <Rotulo texto="frente frío en miniatura" desde={r.w(5, "miniatura") - 8} x={CX} y={930} ax={CX - 300} ay={1030} tam={28} color={C.blanco} fondo={C.azul} />
      ) : null}
      {entre(f, E.ojo, E.cta) ? (
        <Rotulo texto="muy raro" desde={r.w(6, "vez")} x={800} y={1000} ax={620} ay={1090} tam={28} color={C.blanco} fondo={C.rojo} />
      ) : null}
    </>
  );
};

// el mundo se ve más abajo en pantalla para que la nube no choque con el título (zona y < 500)
const TOMAS = [
  toma(0, 540, 680, 1.0), toma(E.lluvia, 540, 620, 1.1), toma(E.evapora - 4, 540, 520, 1.5),
  toma(E.pesa - 4, 540, 700, 1.15), toma(E.vaso - 4, 540, 1000, 1.1), toma(r.w(4, "desparrama"), 540, 940, 1.05),
  toma(E.frente - 4, 540, 840, 1.0), toma(E.ojo - 4, 540, 820, 1.0), toma(r.w(6, "caliente") - 10, 560, 980, 1.1),
  toma(E.cta - 2, 540, 780, 1.0),
];
const GOLPES = [r.w(0, "golpe"), r.w(1, "lluvia"), r.w(2, "evaporan"), r.w(3, "pesa"), r.w(4, "derramado"), r.w(5, "miniatura"),
  r.w(6, "Ojo"), r.w(6, "caliente")];

const Diagrama: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= E.cta) return null;
  const g = GOLPES.reduce((m, k) => m * golpe(f, k, 1.06, 10), 1);
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
    <Etiqueta texto="lo sentiste mil veces" desde={-8} />
    <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={420} tam={58} />
    <Globo texto="¡qué alivio!" desde={16} x={90} y={700} cola="izq" tam={44} ancho={340} />
  </>
);

const Lluvia1: React.FC = () => (
  <>
    <Etiqueta texto="la explicación" color={C.verde} />
    <Titulo pregunta="no viene de lejos…" desdeP={0} respuesta="¡la lluvia!" desdeR={r.w(1, "lluvia") - E.lluvia} top={420} tamR={110} />
  </>
);

const Ojo: React.FC = () => (
  <>
    <Sello texto="OJO" desde={0} x={420} y={400} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
    <Etiqueta texto="no siempre" color={C.verde} desde={r.w(6, "siempre") - E.ojo} />
  </>
);

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grito = r.w(7, "refrescó") - E.cta;
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
          <Lluvia f={frame} n={10} x0={210} x1={870} y0={600} y1={1320} />
        </g>
      </Lienzo>
      {frame >= grito ? <Globo texto="¡ya refrescó!" desde={grito} x={520} y={560} cola="der" tam={40} ancho={420} /> : null}
    </>
  );
};

export const RefrescaTormenta018: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [14, "pop"], [16, "burbuja", 0.35],
    [E.lluvia, "whoosh", 0.35], [r.w(1, "lluvia") - 2, "scratch", 0.55], [r.w(1, "lluvia"), "boing", 0.5],
    [E.evapora, "whoosh", 0.35], [r.w(2, "evaporan"), "pop"], [r.w(2, "calor"), "pop"],
    [E.pesa, "whoosh", 0.35], [r.w(3, "pesa"), "sello", 0.4], [r.w(3, "suelo"), "latigo", 0.35],
    [E.vaso, "whoosh", 0.35], [r.w(4, "derramado"), "pop"], [r.w(4, "desparrama"), "latigo", 0.35],
    [E.frente, "whoosh", 0.35], [r.w(5, "miniatura"), "sello", 0.5],
    [E.ojo, "sello", 0.55], [r.w(6, "baja"), "whoosh", 0.35], [r.w(6, "caliente"), "ding", 0.4],
    [E.cta, "pop"], [r.w(7, "refrescó"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo">
        <Logo />
      </Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.lluvia - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · lluvia" from={E.lluvia} durationInFrames={E.evapora - E.lluvia} layout="none"><Lluvia1 /></Sequence>
      <Sequence name="3 · evapora" from={E.evapora} durationInFrames={E.pesa - E.evapora} layout="none">
        <Etiqueta texto="paso 1 · la gota se evapora" />
      </Sequence>
      <Sequence name="4 · pesa" from={E.pesa} durationInFrames={E.vaso - E.pesa} layout="none">
        <Etiqueta texto="paso 2 · el aire frío cae" />
      </Sequence>
      <Sequence name="5 · vaso" from={E.vaso} durationInFrames={E.frente - E.vaso} layout="none">
        <Etiqueta texto="paso 3 · se desparrama" /><Fuente texto="NWS (Servicio Meteorológico de EE.UU.)" />
      </Sequence>
      <Sequence name="6 · frente" from={E.frente} durationInFrames={E.ojo - E.frente} layout="none">
        <Etiqueta texto="por eso refresca" /><Fuente texto="NWS, glosario" />
      </Sequence>
      <Sequence name="7 · ojo" from={E.ojo} durationInFrames={E.cta - E.ojo} layout="none">
        <Ojo /><Fuente texto="NWS" />
      </Sequence>
      <Sequence name="8 · cta" from={E.cta} durationInFrames={DURACION - E.cta} layout="none"><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("018-refresca-tormenta/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada018: React.FC = () => (
  <Portada arriba="¿por qué refresca después de la tormenta?" grande="aire frío" sello="CIENCIA" colorSello={C.verde} numero={18}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(0 300)">
        <rect x={0} y={1200} width={1080} height={300} fill={TONO.tierra} stroke={C.tinta} strokeWidth={8} />
        <ellipse cx={540} cy={1150} rx={460} ry={70} fill="#8CC8F7" stroke={C.tinta} strokeWidth={8} />
        <Nube x={500} y={830} s={1.45} t={10} tormenta={1} />
        <Termometro x={860} y={1190} s={1.1} valor={0.2} color={C.azul} />
      </g>
    </svg>
  </Portada>
);

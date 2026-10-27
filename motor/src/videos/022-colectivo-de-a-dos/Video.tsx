import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/022-colectivo-de-a-dos/tiempos.json";
import { C } from "../../kit/marca";
import { clamp, entre, golpe, pop } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Camara, Rotulo, TONO, toma } from "../../kit/diagrama";
import { LINEA, MAT, Persona, SOMBRA_D, claro, oscuro } from "../../kit/biblioteca";

// MUNDO: una avenida de lado, con tres paradas en la vereda y dos colectivos que van de izquierda a derecha.
// MECANISMO: el colectivo de adelante se atrasa un poco, en cada parada junta más gente y tarda más en subirla;
// el de atrás encuentra las paradas vacías y lo alcanza. La cámara acompaña a los colectivos y se acerca a las multitudes.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  matematica: r.f(1),
  separados: r.f(2),
  atraso: r.f(3),
  junta: r.f(4),
  peor: r.f(5),
  alcanza: r.f(6),
  paper: r.f(7),
  ojo: r.f(8),
  fijate: r.f(9),
  cta: r.f(10),
  sello: r.fin(10) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

/* ---------- Geometría del mundo ---------- */
const VEREDA = 1000; // donde apoya la gente
const CALLE = 1195; // donde apoyan las ruedas
const PARADAS = [1000, 1500, 2000];

/* ---------- Posiciones de los colectivos según el frame ---------- */
const V = 2.4; // px por frame
const xA = (f: number): number => {
  if (f < E.separados) return interpolate(f, [0, E.separados - 1], [1180, 1330], clamp);
  if (f < E.ojo) {
    return interpolate(
      f,
      [E.separados, E.atraso, E.atraso + 36, E.junta + 74, E.junta + 130, E.peor + 70, E.alcanza + 92, E.alcanza + 130, E.ojo],
      [700, 900, PARADAS[0], PARADAS[0], PARADAS[1], PARADAS[1], PARADAS[1], PARADAS[2], PARADAS[2] + 120],
      clamp,
    );
  }
  if (f < E.fijate) return 1200 + V * (f - E.ojo);
  return interpolate(f, [E.fijate, E.cta], [1480, 1560], clamp);
};
const xB = (f: number): number => {
  if (f < E.separados) return xA(f) - 190;
  if (f < E.ojo) return Math.min(200 + V * (f - E.separados), xA(f) - 170);
  if (f < E.fijate) return xA(f) - 500;
  return xA(f) - 330;
};
const dentroA = (f: number): number => {
  if (f < E.separados) return 0.5;
  if (f < E.ojo) return interpolate(f, [E.atraso + 36, E.junta + 74, E.junta + 130, E.peor + 70], [0.15, 0.6, 0.6, 1], clamp);
  if (f < E.fijate) return 0.3;
  return 1;
};
const dentroB = (f: number): number => (f < E.separados ? 0.5 : f < E.fijate ? 0.12 : 0.06);

/* gente en cada parada (cantidad según el frame): crece mientras espera y baja a cero cuando sube al colectivo */
const gente = (i: number, f: number): number => {
  if (f >= E.ojo && f < E.fijate) return i === 1 ? interpolate(f, [E.ojo, E.ojo + 30, E.ojo + 50], [2, 2, 0], clamp) : 0;
  if (f >= E.fijate) return 0;
  if (f < E.separados) return i === 1 ? 7 : 3;
  if (i === 0) return interpolate(f, [E.separados, E.atraso + 30, E.atraso + 50, E.junta + 74], [3, 5, 5, 0], clamp);
  if (i === 1) return interpolate(f, [E.separados, E.junta + 130, E.junta + 140, E.peor + 70, E.alcanza], [2, 6, 9, 9, 0], clamp);
  return interpolate(f, [E.separados, E.alcanza + 92], [1, 3], clamp);
};

const COLORES = [C.rojo, C.azul, C.amarillo, C.verde, "#9B5DE5", "#FF8FB1", C.azul, C.rojo, C.verde, C.amarillo];

/* ---------- Dibujos ---------- */
const Peaton: React.FC<{ x: number; y: number; color: string; t: number; s?: number; op?: number }> = ({ x, y, color, t, s = 1, op = 1 }) => {
  const rebote = Math.abs(Math.sin(t / 7 + x)) * 3;
  return (
    <g transform={`translate(${x} ${y - rebote}) scale(${s})`} opacity={op}>
      <rect x={-17 + 5} y={-62 + 5} width={34} height={62} rx={14} fill={C.tinta} />
      <rect x={-17} y={-62} width={34} height={62} rx={14} fill={color} stroke={C.tinta} strokeWidth={5} />
      <circle cx={0} cy={-82} r={17} fill={MAT.piel} stroke={C.tinta} strokeWidth={5} />
      <path d="M-17 -88 Q-4 -108 17 -88 Q4 -96 -17 -88 Z" fill={MAT.pelo} stroke={C.tinta} strokeWidth={3} />
    </g>
  );
};

const Parada: React.FC<{ x: number; f: number; n: number }> = ({ x, f, n }) => (
  <g>
    <rect x={x + 120} y={VEREDA - 150} width={10} height={150} fill={MAT.metalOscuro} stroke={C.tinta} strokeWidth={4} />
    <rect x={x + 90} y={VEREDA - 200} width={70} height={56} rx={10} fill={C.azul} stroke={C.tinta} strokeWidth={5} />
    <text x={x + 125} y={VEREDA - 160} textAnchor="middle" fontSize={34} fontWeight={800} fill={C.blanco} fontFamily="sans-serif">P</text>
    {Array.from({ length: 10 }).map((_, i) => {
      const op = Math.max(0, Math.min(1, n - i));
      if (op <= 0) return null;
      return <Peaton key={i} x={x - 90 + i * 32 + (i % 2) * 6} y={VEREDA + (i % 2) * 8} color={COLORES[i]} t={f + i * 5} op={op} />;
    })}
  </g>
);

const Colectivo: React.FC<{ x: number; color: string; dentro: number; f: number; id: string; frena?: boolean }> = ({ x, color, dentro, f, id, frena = false }) => {
  const rebote = Math.abs(Math.sin(f / 4)) * (frena ? 0 : 2.5);
  const giro = f * 14;
  const cuerpo = "M-170 -20 L-170 -150 Q-170 -170 -150 -170 L150 -170 Q172 -170 174 -150 L174 -20 Z";
  const ventanas = Array.from({ length: 5 });
  const cabezas = Math.round(dentro * 5);
  return (
    <g transform={`translate(${x} ${CALLE - rebote})`}>
      <defs>
        <linearGradient id={`${id}g`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={claro(color, 0.35)} />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor={oscuro(color, 0.22)} />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={6 + rebote} rx={190} ry={12} fill={C.tinta} opacity={0.25} />
      <path d={cuerpo} fill={C.tinta} transform={`translate(${SOMBRA_D} ${SOMBRA_D * 0.6})`} />
      <path d={cuerpo} fill={`url(#${id}g)`} stroke={C.tinta} strokeWidth={LINEA} strokeLinejoin="round" />
      <rect x={-170} y={-70} width={344} height={14} fill={C.blanco} opacity={0.85} />
      {ventanas.map((_, i) => (
        <g key={i}>
          <rect x={-150 + i * 62} y={-146} width={52} height={62} rx={8} fill="#B9DDF6" stroke={C.tinta} strokeWidth={5} />
          {i < cabezas ? (
            <>
              <circle cx={-124 + i * 62} cy={-118} r={12} fill={MAT.piel} stroke={C.tinta} strokeWidth={4} />
              <rect x={-138 + i * 62} y={-104} width={28} height={20} rx={8} fill={COLORES[(i + 2) % COLORES.length]} stroke={C.tinta} strokeWidth={3} />
            </>
          ) : null}
        </g>
      ))}
      <rect x={-148} y={-146} width={22} height={4} fill={C.blanco} opacity={0.7} />
      <rect x={154} y={-60} width={20} height={26} rx={5} fill={C.amarillo} stroke={C.tinta} strokeWidth={4} />
      {[-110, 100].map((rx) => (
        <g key={rx} transform={`translate(${rx} -20)`}>
          <circle r={34} fill={MAT.goma} stroke={C.tinta} strokeWidth={LINEA} />
          <circle r={17} fill={MAT.metal} stroke={C.tinta} strokeWidth={4} />
          <g transform={`rotate(${giro})`} stroke={MAT.metalOscuro} strokeWidth={4}><line x1={-13} y1={0} x2={13} y2={0} /><line x1={0} y1={-13} x2={0} y2={13} /></g>
        </g>
      ))}
    </g>
  );
};

/** Flecha doble entre dos colectivos (la distancia que los separa). */
const Distancia: React.FC<{ a: number; b: number; color?: string }> = ({ a, b, color = C.tinta }) => {
  const y = CALLE + 62;
  const x0 = b + 175;
  const x1 = a - 175;
  if (x1 - x0 < 24) return null;
  return (
    <g stroke={color} strokeWidth={7} strokeLinecap="round" fill="none">
      <line x1={x0} y1={y} x2={x1} y2={y} />
      <path d={`M${x0 + 18} ${y - 14} L${x0} ${y} L${x0 + 18} ${y + 14}`} />
      <path d={`M${x1 - 18} ${y - 14} L${x1} ${y} L${x1 - 18} ${y + 14}`} />
    </g>
  );
};

/* ---------- Mundo ---------- */
const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const a = xA(f);
  const b = xB(f);
  const verDist = entre(f, E.separados, E.junta) || entre(f, E.peor + 40, E.paper);
  const colorDist = f >= E.peor ? C.rojo : C.tinta;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* edificios del fondo */}
      {[
        [-600, 300, 220], [-340, 380, 250], [-40, 260, 200], [220, 340, 240], [520, 290, 210], [800, 400, 260], [1100, 300, 220],
        [1380, 360, 250], [1680, 280, 210], [1950, 390, 260], [2260, 310, 230], [2540, 360, 240],
      ].map(([bx, alto, ancho], i) => (
        <g key={i}>
          <rect x={bx + 10} y={VEREDA - alto + 10} width={ancho} height={alto} fill={C.tinta} opacity={0.18} />
          <rect x={bx} y={VEREDA - alto} width={ancho} height={alto} fill={i % 2 ? "#E3E8F7" : "#F3E6CF"} stroke={C.tinta} strokeWidth={6} />
          {Array.from({ length: Math.floor(alto / 90) }).map((_, k) => (
            <rect key={k} x={bx + 28} y={VEREDA - alto + 30 + k * 90} width={ancho - 56} height={42} rx={6} fill="#B9DDF6" stroke={C.tinta} strokeWidth={4} opacity={0.9} />
          ))}
        </g>
      ))}
      {/* vereda y calle */}
      <rect x={-1500} y={VEREDA} width={5000} height={40} fill={TONO.tierra} stroke={C.tinta} strokeWidth={6} />
      <rect x={-1500} y={VEREDA + 40} width={5000} height={260} fill="#4A4F6B" stroke={C.tinta} strokeWidth={6} />
      <line x1={-1500} y1={CALLE + 80} x2={3500} y2={CALLE + 80} stroke={C.blanco} strokeWidth={8} strokeDasharray="60 50" opacity={0.7} />

      {PARADAS.map((px, i) => <Parada key={px} x={px} f={f} n={gente(i, f)} />)}

      {verDist ? <Distancia a={a} b={b} color={colorDist} /> : null}
      <Colectivo x={b} color={C.azul} dentro={dentroB(f)} f={f} id="cb" />
      <Colectivo x={a} color={C.rojo} dentro={dentroA(f)} f={f} id="ca" />
    </svg>
  );
};

/* Rótulos pegados al mundo (se mueven con la cámara). */
const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  const a = xA(f);
  const b = xB(f);
  return (
    <>
      {entre(f, E.separados + 20, E.atraso) ? (
        <Rotulo texto="misma distancia" desde={E.separados + 20} x={(a + b) / 2} y={CALLE + 150} ax={(a + b) / 2} ay={CALLE + 66} tam={34} />
      ) : null}
      {entre(f, E.atraso, E.junta) ? (
        <Rotulo texto="se atrasa un poquito" desde={r.w(3, "atrasa")} x={a} y={CALLE - 290} ax={a} ay={CALLE - 175} color={C.blanco} fondo={C.rojo} tam={34} />
      ) : null}
      {entre(f, E.junta, E.peor) ? (
        <Rotulo texto="más gente = más tarda" desde={E.junta + 40} x={PARADAS[1] - 40} y={VEREDA - 290} ax={PARADAS[1] - 40} ay={VEREDA - 130} tam={34} />
      ) : null}
      {entre(f, E.peor, E.alcanza) ? (
        <Rotulo texto="cada vez peor" desde={E.peor + 40} x={a - 40} y={CALLE - 290} ax={a} ay={CALLE - 175} color={C.blanco} fondo={C.rojo} tam={34} />
      ) : null}
      {entre(f, E.alcanza, E.paper) ? (
        <Rotulo texto="paradas casi vacías" desde={E.alcanza + 10} x={b - 20} y={CALLE - 290} ax={b} ay={CALLE - 175} color={C.blanco} fondo={C.azul} tam={34} />
      ) : null}
      {entre(f, E.ojo, E.fijate) ? (
        <Rotulo texto="suben rápido ✓" desde={E.ojo + 14} x={PARADAS[1]} y={VEREDA - 290} ax={PARADAS[1] - 20} ay={VEREDA - 100} color={C.blanco} fondo={C.verde} tam={34} />
      ) : null}
      {entre(f, E.fijate, E.cta) ? (
        <>
          <Rotulo texto="lleno" desde={E.fijate + 24} x={a} y={CALLE - 300} ax={a} ay={CALLE - 176} color={C.blanco} fondo={C.rojo} tam={30} />
          <Rotulo texto="casi vacío" desde={r.w(9, "casi") - 4} x={b} y={CALLE - 300} ax={b} ay={CALLE - 176} color={C.blanco} fondo={C.azul} tam={30} />
        </>
      ) : null}
    </>
  );
};

const TOMAS = [
  toma(0, 1180, 1050, 1.12), toma(E.matematica, 1260, 1050, 1.0),
  toma(E.separados - 1, 1260, 1050, 1.0), toma(E.separados, 560, 1050, 0.88),
  toma(E.atraso, 820, 1050, 1.0), toma(E.atraso + 40, 1000, 1030, 1.2),
  toma(E.junta + 70, 1100, 1040, 1.0), toma(E.junta + 130, 1450, 1030, 1.15),
  toma(E.peor + 70, 1440, 1040, 1.05), toma(E.alcanza, 1400, 1040, 1.0),
  toma(E.alcanza + 100, 1700, 1040, 1.1), toma(E.paper, 1750, 1040, 1.0),
  toma(E.ojo - 1, 1750, 1040, 1.0), toma(E.ojo, 1150, 1050, 0.9),
  toma(E.fijate - 1, 1700, 1050, 0.9), toma(E.fijate, 1330, 1060, 1.2),
  toma(E.cta - 1, 1380, 1060, 1.25),
];
const GOLPES = [E.matematica + 10, r.w(3, "atrasa"), E.junta + 8, E.peor + 30, E.alcanza + 8, r.w(9, "primero")];

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
const Gancho: React.FC = () => (
  <>
    <Etiqueta texto="te pasa siempre" desde={-8} />
    <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={420} tam={60} />
    <Globo texto="¿otra vez de a dos?" desde={36} x={90} y={640} cola="izq" tam={42} ancho={420} />
  </>
);

const Matematica: React.FC = () => (
  <>
    <Etiqueta texto="la verdad" color={C.verde} />
    <Titulo pregunta="no es mala suerte…" desdeP={0} respuesta="¡es mate!" desdeR={r.w(1, "matem") - E.matematica} top={400} tamR={128} />
  </>
);

const Paper: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Etiqueta texto="el que lo descubrió" />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 860px" }}>
          <rect x={160 + 12} y={620 + 12} width={760} height={420} rx={24} fill={C.tinta} />
          <rect x={160} y={620} width={760} height={420} rx={24} fill={C.blanco} stroke={C.tinta} strokeWidth={8} />
          <text x={540} y={700} textAnchor="middle" fontSize={40} fontWeight={800} fill={C.tinta} fontFamily="sans-serif">Newell y Potts</text>
          <text x={540} y={880} textAnchor="middle" fontSize={170} fontWeight={800} fill={C.rojo} stroke={C.tinta} strokeWidth={8} paintOrder="stroke" fontFamily="sans-serif">1964</text>
          {[0, 1, 2].map((k) => <line key={k} x1={260} y1={950 + k * 26} x2={820 - k * 80} y2={950 + k * 26} stroke={C.tinta} strokeWidth={6} opacity={0.35} strokeLinecap="round" />)}
        </g>
      </Lienzo>
    </>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const odia = r.w(10, "odia") - E.cta;
  return (
    <>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={360} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1100px" }}>
          <rect x={220 + 14} y={640 + 14} width={640} height={700} rx={20} fill={C.tinta} />
          <rect x={220} y={640} width={640} height={700} rx={20} fill={TONO.frio} stroke={C.tinta} strokeWidth={10} />
          <Persona x={540} y={1300} s={1.15} t={frame} gesto={frame >= odia ? "preocupada" : "canchera"} remera={C.verde} pelo="rulos" />
        </g>
      </Lienzo>
      {frame >= odia ? <Globo texto="¡el colectivo me odia!" desde={odia} x={470} y={560} cola="der" tam={40} ancho={460} /> : null}
    </>
  );
};

export const Colectivo022: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [36, "burbuja", 0.35],
    [E.matematica - 2, "scratch", 0.55], [r.w(1, "matem"), "boing", 0.5],
    [E.separados - 2, "whoosh", 0.45], [E.separados + 20, "pop"],
    [r.w(3, "atrasa"), "sello", 0.45], [E.atraso + 36, "tic", 0.4],
    [E.junta + 8, "pop"], [E.junta + 40, "burbuja", 0.35],
    [E.peor + 30, "scratch", 0.4], [E.peor + 40, "sello", 0.4],
    [E.alcanza, "whoosh", 0.4], [E.alcanza + 100, "ding", 0.45],
    [E.paper, "pop"], [r.w(7, "cuatro"), "sello", 0.5],
    [E.ojo, "sello", 0.55], [E.ojo + 14, "ding", 0.45],
    [E.fijate - 2, "whoosh", 0.4], [E.fijate + 24, "pop"], [r.w(9, "casi") - 4, "pop"],
    [E.cta, "pop"], [r.w(10, "odia"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo"><Logo /></Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.matematica - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · matemática" from={E.matematica} durationInFrames={E.separados - E.matematica} layout="none"><Matematica /></Sequence>
      <Sequence name="3 · separados" from={E.separados} durationInFrames={E.atraso - E.separados} layout="none"><Etiqueta texto="al arrancar" /></Sequence>
      <Sequence name="4 · atraso" from={E.atraso} durationInFrames={E.junta - E.atraso} layout="none">
        <Etiqueta texto="paso 1 · un atraso" />
      </Sequence>
      <Sequence name="5 · junta" from={E.junta} durationInFrames={E.peor - E.junta} layout="none">
        <Etiqueta texto="paso 2 · más gente" />
      </Sequence>
      <Sequence name="6 · peor" from={E.peor} durationInFrames={E.alcanza - E.peor} layout="none">
        <Etiqueta texto="paso 3 · se agranda" color={C.rojo} />
        <Sello texto="¡SE AGRANDA!" desde={36} x={130} y={560} rot={-6} color={C.rojo} tam={54} />
      </Sequence>
      <Sequence name="7 · alcanza" from={E.alcanza} durationInFrames={E.paper - E.alcanza} layout="none">
        <Etiqueta texto="paso 4 · el de atrás" color={C.azul} />
      </Sequence>
      <Sequence name="8 · paper" from={E.paper} durationInFrames={E.ojo - E.paper} layout="none">
        <Paper />
        <Fuente texto="Newell y Potts, ARRB (1964)" />
      </Sequence>
      <Sequence name="9 · ojo" from={E.ojo} durationInFrames={E.fijate - E.ojo} layout="none">
        <Sello texto="OJO" desde={0} x={440} y={330} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
      </Sequence>
      <Sequence name="10 · fijate" from={E.fijate} durationInFrames={E.cta - E.fijate} layout="none">
        <Etiqueta texto="fijate la próxima" color={C.verde} />
      </Sequence>
      <Sequence name="11 · cta" from={E.cta} durationInFrames={DURACION - E.cta} layout="none"><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}>
        <SelloFinal mandar="mandáselo al que dice que el colectivo lo odia" />
      </Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("022-colectivo-de-a-dos/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada022: React.FC = () => (
  <Portada arriba="¿por qué el colectivo viene de a dos?" grande="es mate" sello="DATO" colorSello={C.verde} numero={22}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(0 -300) scale(1.3)">
        <Colectivo x={300} color={C.azul} dentro={0.1} f={0} id="pb" frena />
        <Colectivo x={560} color={C.rojo} dentro={1} f={0} id="pa" frena />
      </g>
    </svg>
  </Portada>
);

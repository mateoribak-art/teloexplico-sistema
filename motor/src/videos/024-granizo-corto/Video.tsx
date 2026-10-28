import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/024-granizo-corto/tiempos.json";
import { C } from "../../kit/marca";
import { clamp, entre, golpe, pop, suave, temblor } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Auto } from "../../kit/biblioteca";
import {
  Camara, Ciudad, Contador, Corriente, Escala, Flujo, Lupa, NubeVolumen, OndasCalor, PiedraHielo, Piso, Rotulo,
  SolVolumen, TONO, Velocidad, Vecino, toma, type Bulto,
} from "../../kit/diagrama";

// Versión corta del granizo (reemplaza al 005, largo): UN corte de la atmósfera que se arma con el calor.
// Mecanismo: el aire caliente sube, lleva la gota sobre el 0 °C, se congela y engorda en cada vuelta (cebolla de hielo).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  fabrica: r.f(1),
  sube: r.f(2),
  frio: r.f(3),
  congela: r.f(4),
  cien: r.f(5),
  ojo: r.f(6),
  auto: r.f(7),
  cta: r.f(8),
  sello: r.fin(8) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

/* ---------- Geometría del mundo (1080×1920): suelo y escala de altura ---------- */
const SUELO = 1330;
const KM = 70;
const y = (km: number) => SUELO - km * KM;
const X = 540; // eje de la corriente

const BULTOS: Bulto[] = [
  [400, 1110, 110], [540, 1130, 120], [680, 1110, 110], [320, 1060, 80], [770, 1060, 80],
  [450, 980, 115], [630, 975, 115], [540, 860, 120], [450, 760, 100], [630, 750, 105], [540, 650, 105],
];
const YUNQUE = `M180 ${y(11.3)} Q540 ${y(12.4)} 920 ${y(11.2)} Q960 ${y(10.6)} 880 ${y(10.4)} Q700 ${y(10.7)} 620 ${y(10)} L460 ${y(10)} Q370 ${y(10.6)} 200 ${y(10.4)} Q140 ${y(10.9)} 180 ${y(11.3)} Z`;

// recorrido de la piedra: sube por la corriente, sale por la derecha, baja, vuelve a entrar y sube otra vez
const RECORRIDO: [number, number][] = [
  [540, 1180], [548, 980], [560, 800], [620, 700], [720, 710], [770, 840], [750, 1060], [680, 1130], [600, 1100], [570, 900], [585, 730], [660, 670],
];
const largoRec = RECORRIDO.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - RECORRIDO[i][0], p[1] - RECORRIDO[i][1]), 0);
const enRecorrido = (u: number): [number, number] => {
  let resto = ((u % 1) + 1) % 1 * largoRec;
  for (let i = 1; i < RECORRIDO.length; i++) {
    const [ax, ay] = RECORRIDO[i - 1];
    const [bx, by] = RECORRIDO[i];
    const l = Math.hypot(bx - ax, by - ay);
    if (resto <= l) return [ax + (bx - ax) * (resto / l), ay + (by - ay) * (resto / l)];
    resto -= l;
  }
  return RECORRIDO[RECORRIDO.length - 1];
};
const D_RECORRIDO = RECORRIDO.map(([px, py], i) => `${i ? "L" : "M"}${px} ${py}`).join(" ");

/* ---------- Estado del mundo según el frame (absoluto) ---------- */
const crecimiento = (f: number) => {
  // la tormenta se arma con el calor, se "desarma" en el OJO (calor solo no alcanza) y vuelve con el frío de arriba
  const base = interpolate(f, [E.fabrica - 4, E.fabrica + 10, r.w(1, "fabrica"), r.w(1, "fabrica") + 20, E.frio, r.w(3, "frío")], [0.62, 0.15, 0.15, 0.45, 0.6, 1], clamp);
  const ojoFrio = r.w(6, "frío");
  if (f >= E.ojo && f < E.auto) return interpolate(f, [E.ojo, E.ojo + 14, ojoFrio, ojoFrio + 16], [1, 0.4, 0.4, 1], clamp);
  return base;
};

/* Granizo cayendo y rebotando en la calle (gancho y final). */
const Lluvia: React.FC<{ f: number; n?: number; x0: number; x1: number; y0: number; y1: number; rmin?: number }> = ({ f, n = 9, x0, x1, y0, y1, rmin = 9 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const per = 26 + (i % 4) * 5;
      const c = ((f + i * 13) % per) / per;
      const x = x0 + (x1 - x0) * ((i + 0.5) / n) + Math.sin(i * 2.1) * 20;
      const cae = c < 0.8;
      const yy = cae ? y0 + (y1 - y0) * (c / 0.8) : y1 - Math.sin(((c - 0.8) / 0.2) * Math.PI) * 30;
      return <PiedraHielo key={i} cx={x} cy={yy} r={rmin + (i % 3) * 4} />;
    })}
  </g>
);

/* El mundo completo: cielo, tormenta, corriente, piedra y ciudad. */
const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const crece = crecimiento(f);
  const pCorriente = interpolate(f, [r.w(2, "sube"), r.w(2, "sube") + 20, E.frio, r.w(3, "frío")], [0, 0.45, 0.45, 1], clamp);
  const vel = f >= E.cien && f < E.ojo ? interpolate(f, [E.cien, r.w(5, "cien")], [1, 2.6], clamp) : 1;
  const frioVisible = suave(f, r.w(3, "frío"), 10);
  const enOjo = entre(f, E.ojo, E.auto);
  const sacudon = temblor(f, r.w(5, "ciento") + 6, 12, 14);

  // la piedra: gota hasta que cruza el 0 °C; después hielo que engorda en cada vuelta
  const t0 = E.congela + 6;
  const u = f < t0 ? 0 : (f - t0) / 46;
  const [px, py] = enRecorrido(u);
  const vueltas = Math.floor(u);
  const congelada = u > 0.12 || vueltas > 0;
  const radio = congelada ? Math.min(46, 16 + vueltas * 6 + (u % 1 > 0.5 ? 3 : 0)) : 13;
  const mostrarPiedra = entre(f, E.congela, E.cien);

  // granizo gigante que cae como un misil
  const fm = r.w(5, "granizo");
  const yMisil = interpolate(f, [fm - 4, fm + 12], [y(2.6), SUELO - 52], clamp);

  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* zona bajo cero: aparece con "frío" y se marca fuerte en el OJO */}
      <rect x={-1500} y={-2000} width={4080} height={y(4) + 2000} fill={TONO.frio} opacity={(enOjo ? 0.75 : 0.45) * frioVisible} />
      {frioVisible > 0 ? (
        <line x1={-1500} y1={y(4)} x2={2580} y2={y(4)} stroke={C.azul} strokeWidth={5} strokeDasharray="16 12" opacity={frioVisible} />
      ) : null}
      <Escala x={120} yCero={SUELO} paso={KM} marcas={[0, 3, 6, 9, 12]} unidad="km" desde={r.w(3, "kilómetros")} />

      <SolVolumen cx={880} cy={y(7.5)} r={70} t={f} intensidad={entre(f, E.cien, E.ojo) ? 1.8 : 1} />

      <g style={{ translate: `${sacudon}px 0px` }}>
        <NubeVolumen id="tormenta" bultos={BULTOS} yunque={YUNQUE} crece={crece} yArriba={y(12)} yAbajo={y(1.5)} oscura={crece} />

        {/* corriente que sube: banda + chevrones + gotas que suben */}
        {pCorriente > 0 ? <Corriente x={X} ancho={150} yAbajo={SUELO - 16} yArriba={y(10)} t={f} p={pCorriente} velocidad={vel} /> : null}
        {f >= E.frio ? (
          <Flujo x0={X - 60} x1={X + 60} yAbajo={SUELO - 30} yArriba={y(4) + 40} n={14} velocidad={vel} color={C.azul} tam={9} t={f}
            opacidad={interpolate(f, [E.frio, E.frio + 10], [0, 1], clamp)} />
        ) : null}

        {/* recorrido de la piedra */}
        {entre(f, E.congela, E.cien) ? (
          <path d={D_RECORRIDO} fill="none" stroke={C.azul} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round"
            opacity={interpolate(f, [E.congela, E.congela + 20], [0, 0.9], clamp)} />
        ) : null}
        {mostrarPiedra ? (
          congelada ? <PiedraHielo cx={px} cy={py} r={radio} capas={Math.min(4, vueltas)} /> : (
            <path d={`M${px} ${py - 22} C${px + 16} ${py - 4} ${px + 16} ${py + 14} ${px} ${py + 14} C${px - 16} ${py + 14} ${px - 16} ${py - 4} ${px} ${py - 22} Z`}
              fill={TONO.hieloOscuro} stroke={C.tinta} strokeWidth={5} />
          )
        ) : null}

        {/* granizo gigante que cae como un misil */}
        {entre(f, fm - 4, E.ojo) ? (
          <g>
            {f < fm + 12 ? <Velocidad cx={X} cy={yMisil} sentido={-1} t={f} largo={260} n={6} /> : null}
            <PiedraHielo cx={X} cy={yMisil} r={52} capas={3} />
            {f >= fm + 12 ? (
              <g stroke={C.tinta} strokeWidth={7} strokeLinecap="round" opacity={interpolate(f, [fm + 12, fm + 34], [1, 0], clamp)}>
                {[-1, 1].map((s) => <line key={s} x1={X + s * 60} y1={SUELO - 10} x2={X + s * 130} y2={SUELO - 60} />)}
                <line x1={X} y1={SUELO - 110} x2={X} y2={SUELO - 170} />
              </g>
            ) : null}
          </g>
        ) : null}

        {/* granizo sobre la ciudad en el gancho */}
        {f < E.fabrica + 6 ? <Lluvia f={f} n={11} x0={60} x1={1020} y0={y(2.4)} y1={SUELO - 14} rmin={13} /> : null}

        <OndasCalor xs={[460, 540, 620]} y={SUELO - 10} t={f} opacidad={f >= E.sube || entre(f, E.ojo, E.auto) ? 1 : 0.35} />
        <Ciudad suelo={SUELO} t={f} />
        <Piso y={SUELO} />
      </g>
    </svg>
  );
};

/* Lo que va pegado al mundo (rótulos, números, lupa): se mueve con la cámara. */
const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  const ceb = r.w(4, "cebolla");
  const capas = Math.min(6, Math.max(0, Math.floor((f - ceb + 10) / 9)));
  return (
    <>
      {entre(f, E.sube, E.frio) ? <Rotulo texto="aire caliente ↑" desde={r.w(2, "sube") + 6} x={250} y={1020} ax={X - 50} ay={1160} /> : null}
      {entre(f, E.frio, E.congela) ? (
        <Rotulo texto="0 °C: acá se congela" desde={r.w(3, "frío")} x={790} y={y(4) - 46} ax={960} ay={y(4)} color={C.blanco} fondo={C.azul} tam={24} />
      ) : null}
      {entre(f, E.congela, E.cien) ? (
        <Rotulo texto="bajo cero" desde={r.w(4, "congelan")} x={800} y={y(4) - 40} ax={760} ay={y(4) - 4} color={C.blanco} fondo={C.azul} tam={22} />
      ) : null}
      {entre(f, E.congela, E.cien) && f >= ceb - 6 ? (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <Lupa cx={860} cy={480} r={150} desde={ceb - 6} ax={720} ay={710}>
              <PiedraHielo cx={860} cy={480} r={128} capas={capas} brillo={false} />
            </Lupa>
          </svg>
          <Rotulo texto={`capa ${Math.max(1, capas)}`} desde={ceb + 4} x={860} y={660} ax={860} ay={632} tam={26} />
        </>
      ) : null}
      {entre(f, E.cien, r.w(5, "granizo") - 6) ? (
        <Contador hasta={100} antes="+" despues=" km/h" desde={r.w(5, "cien") - 6} dur={22} x={300} y={820} tam={96} etiqueta="corriente que sube" />
      ) : null}
      {entre(f, r.w(5, "granizo") - 6, E.ojo) ? (
        <Contador hasta={150} antes="+" despues=" km/h" desde={r.w(5, "ciento") - 4} dur={22} x={800} y={1010} tam={96} etiqueta="al caer" />
      ) : null}
      {entre(f, E.ojo, E.auto) ? (
        <>
          <Rotulo texto="calor abajo ✓" desde={E.ojo + 8} x={300} y={1170} ax={460} ay={SUELO - 60} color={C.blanco} fondo={C.rojo} tam={26} />
          <Rotulo texto="frío arriba ✓" desde={r.w(6, "frío")} x={300} y={y(9.5)} ax={480} ay={y(8)} color={C.blanco} fondo={C.azul} tam={26} />
        </>
      ) : null}
    </>
  );
};

/* Cámara: dónde mira en cada momento (centro x, y, zoom) + un golpe de zoom en las palabras clave. */
const TOMAS = [
  toma(0, 540, 1090, 1.18), toma(E.fabrica, 540, 1000, 1.0),
  toma(E.sube, 540, 1090, 1.12), toma(E.frio - 4, 540, 1090, 1.12),
  toma(E.frio + 14, 540, 900, 0.98),
  toma(E.congela, 540, 900, 0.98), toma(E.congela + 16, 650, 900, 1.55),
  toma(r.w(4, "cebolla"), 650, 800, 1.3),
  toma(E.cien - 2, 650, 800, 1.2), toma(E.cien + 12, 540, 940, 1.0),
  toma(r.w(5, "granizo") - 4, 540, 940, 1.0), toma(r.w(5, "granizo") + 14, 600, 1020, 1.12),
  toma(E.ojo, 540, 1080, 1.0), toma(E.ojo + 14, 540, 920, 0.96),
];
const GOLPES = [r.w(1, "fabrica"), r.w(3, "frío"), r.w(4, "congelan"), r.w(4, "cebolla"), r.w(5, "cien"), r.w(5, "ciento"), r.w(6, "frío")];

const Diagrama: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= E.auto) return null;
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

/* ---------- Capas de pantalla (no se mueven con la cámara) ---------- */

const Gancho: React.FC = () => (
  <>
    <Etiqueta texto="lo vivís cada verano" desde={-8} />
    <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={420} tam={60} />
    <Globo texto="¿con este calor?" desde={24} x={90} y={640} cola="izq" tam={42} ancho={360} />
  </>
);

const Fabrica: React.FC = () => {
  const fab = r.w(1, "fabrica") - E.fabrica;
  return (
    <>
      <Etiqueta texto="la verdad" color={C.verde} />
      <Titulo pregunta="el calor no lo frena…" desdeP={0} respuesta="¡lo fabrica!" desdeR={fab} top={400} tamR={128} />
    </>
  );
};

/* El consejo: el auto bajo techo mientras cae granizo afuera. */
const Consejo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const negro = r.w(7, "negro") - E.auto;
  const techo = r.w(7, "techo") - E.auto;
  const caida = (f: number) => (frame >= negro ? f : 0);
  return (
    <>
      <Etiqueta texto="lo que hacés hoy" color={C.verde} />
      <Titulo pregunta="auto bajo techo" desdeP={techo - 6} top={380} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1000px" }}>
          <rect x={80} y={560} width={920} height={830} rx={28} fill={TONO.frio} stroke={C.tinta} strokeWidth={10} />
          <rect x={80} y={1290} width={920} height={100} fill={TONO.tierraSombra} stroke={C.tinta} strokeWidth={8} />
          <Auto x={540} y={1275} s={1.45} color={C.rojo} t={frame} />
          <rect x={140} y={1040} width={800} height={36} rx={10} fill={C.blanco} stroke={C.tinta} strokeWidth={8} />
          <rect x={160} y={1076} width={26} height={214} fill={C.blanco} stroke={C.tinta} strokeWidth={6} />
          <rect x={894} y={1076} width={26} height={214} fill={C.blanco} stroke={C.tinta} strokeWidth={6} />
          {caida(1) ? (
            <>
              <Lluvia f={frame} n={9} x0={150} x1={930} y0={600} y1={1020} rmin={12} />
              <Lluvia f={frame + 7} n={2} x0={100} x1={150} y0={600} y1={1280} rmin={12} />
              <Lluvia f={frame + 11} n={2} x0={930} x1={980} y0={600} y1={1280} rmin={12} />
            </>
          ) : null}
        </g>
      </Lienzo>
      {frame >= negro ? <Sello texto="¡BOCHORNO + NEGRO!" desde={negro} x={110} y={470} rot={-5} color={C.amarillo} tinta={C.tinta} tam={44} /> : null}
    </>
  );
};

/* Final: el vecino en la ventana, con granizo rebotando en el alféizar. */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ventana = r.w(8, "ventana") - E.cta;
  const grito = r.w(8, "granizo") - E.cta;
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
          <Lluvia f={frame} n={7} x0={190} x1={890} y0={560} y1={1322} rmin={10} />
        </g>
      </Lienzo>
      {frame >= ventana ? <Globo texto="¿granizo con este calor?" desde={grito} x={520} y={560} cola="der" tam={40} ancho={440} /> : null}
    </>
  );
};

export const GranizoCorto024: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [24, "burbuja", 0.35],
    [r.w(1, "fabrica") - 2, "scratch", 0.55], [r.w(1, "fabrica"), "boing", 0.5],
    [E.sube, "whoosh", 0.35], [r.w(2, "sube"), "pop"],
    [E.frio, "whoosh", 0.35], [r.w(3, "kilómetros"), "tic", 0.4], [r.w(3, "frío"), "ding", 0.45],
    [E.congela, "whoosh", 0.4], [r.w(4, "congelan"), "sello", 0.45], [r.w(4, "cebolla"), "burbuja", 0.35],
    [E.cien, "whoosh", 0.4], [r.w(5, "cien") - 6, "tic", 0.4], [r.w(5, "cien") + 16, "ding", 0.45],
    [r.w(5, "granizo") - 4, "latigo", 0.5], [r.w(5, "granizo") + 12, "boing", 0.55], [r.w(5, "ciento") + 18, "ding", 0.45],
    [E.ojo, "sello", 0.55], [E.ojo + 8, "pop"], [r.w(6, "frío"), "ding", 0.45],
    [E.auto, "whoosh", 0.35], [r.w(7, "negro"), "sello", 0.5], [r.w(7, "techo"), "pop"],
    [E.cta, "pop"], [r.w(8, "granizo"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo">
        <Logo />
      </Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.fabrica - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · fabrica" from={E.fabrica} durationInFrames={E.sube - E.fabrica} layout="none"><Fabrica /></Sequence>
      <Sequence name="3 · sube" from={E.sube} durationInFrames={E.frio - E.sube} layout="none"><Etiqueta texto="paso 1 · el calor" /></Sequence>
      <Sequence name="4 · frío" from={E.frio} durationInFrames={E.congela - E.frio} layout="none">
        <Etiqueta texto="paso 2 · bien alto" /><Fuente texto="National Weather Service (NOAA)" />
      </Sequence>
      <Sequence name="5 · congela" from={E.congela} durationInFrames={E.cien - E.congela} layout="none">
        <Etiqueta texto="paso 3 · capa sobre capa" color={C.verde} />
        <Sello texto="¡SE CONGELA!" desde={r.w(4, "congelan") - E.congela} x={130} y={560} rot={-6} color={C.azul} tam={54} />
      </Sequence>
      <Sequence name="6 · cien" from={E.cien} durationInFrames={E.ojo - E.cien} layout="none">
        <Etiqueta texto="la corriente que sube" /><Fuente texto="NOAA · National Weather Service" />
      </Sequence>
      <Sequence name="7 · ojo" from={E.ojo} durationInFrames={E.auto - E.ojo} layout="none">
        <Sello texto="OJO" desde={0} x={440} y={330} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
      </Sequence>
      <Sequence name="8 · consejo" from={E.auto} durationInFrames={E.cta - E.auto} layout="none"><Consejo /></Sequence>
      <Sequence name="9 · cta" from={E.cta} durationInFrames={DURACION - E.cta} layout="none"><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal mandar="mandáselo al que grita ¿granizo con este calor?" /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("024-granizo-corto/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada024: React.FC = () => (
  <Portada arriba="¿por qué cae granizo cuando hace calor?" grande="el calor" sello="CIENCIA" colorSello={C.verde} numero={24}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(0 120)">
        <NubeVolumen id="portada" bultos={BULTOS} crece={0.85} yArriba={y(10)} yAbajo={y(1.5)} />
        <Corriente x={X} ancho={150} yAbajo={SUELO - 16} yArriba={y(8)} t={20} />
        <PiedraHielo cx={720} cy={900} r={60} capas={3} />
        <PiedraHielo cx={350} cy={1000} r={40} capas={2} />
        <SolVolumen cx={880} cy={700} r={70} t={10} />
      </g>
    </svg>
  </Portada>
);

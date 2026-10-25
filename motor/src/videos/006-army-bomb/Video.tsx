import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/006-army-bomb/tiempos.json";
import { C, display, mono } from "../../kit/marca";
import { clamp, entre, golpe, pop, resorte } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Camara, Lupa, Rotulo, toma } from "../../kit/diagrama";
import { Persona, claro, mezclar, oscuro } from "../../kit/biblioteca";

// MUNDO: el estadio de noche visto desde el campo. La tribuna de enfrente es una grilla de varitas (cada punto = una butaca).
// MECANISMO: app con sección/fila/asiento → mapa del estadio → la consola manda órdenes por señal inalámbrica →
// cada varita es un píxel de una pantalla gigante (olas, figuras, palabras). Ojo: Bluetooth saturado → radio propia.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0), golpe: r.f(1), app: r.f(2), mapa: r.f(3), gira: r.f(4), consola: r.f(5), receptor: r.f(6),
  pantalla: r.f(7), olas: r.f(8), ojo: r.f(9), remate: r.f(10), cta: r.f(11), sello: r.fin(11) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

/* ---------- colores de la noche ---------- */
const NOCHE = "#14183A";
const NOCHE2 = "#20265A";
const VIOLETA = claro(mezclar(C.azul, C.rojo, 0.42), 0.15);
const APAGADO = "#3A4070";
const LUCES = [VIOLETA, C.azul, C.rojo, C.amarillo, C.verde, "#FFFFFF"];

/* ---------- la tribuna: grilla de varitas en perspectiva ---------- */
const FILAS = 13;
const COLS = 25;
const pos = (fila: number, col: number): [number, number, number] => {
  const y = 740 + fila * 36;
  const ancho = 720 + fila * 22;
  const x = 540 - ancho / 2 + (ancho / (COLS - 1)) * col;
  return [x, y, 6.2 + fila * 0.4];
};

// letras de 5×7 para escribir con el público
const LETRAS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
};
const enTexto = (fila: number, col: number) => {
  const f = fila - 3;
  if (f < 0 || f > 6) return false;
  const palabra = "ARG";
  for (let k = 0; k < palabra.length; k++) {
    const c0 = 3 + k * 7;
    const c = col - c0;
    if (c >= 0 && c < 5) return LETRAS[palabra[k]][f][c] === "1";
  }
  return false;
};
const enCorazon = (fila: number, col: number) => {
  const u = (col - 12) / 6.5;
  const v = -(fila - 6.2) / 5.2 + 0.25;
  return (u * u + v * v - 1) ** 3 - u * u * v ** 3 <= 0;
};

/** Color de cada varita según el momento del video (el "programa" de la consola). */
const colorVarita = (f: number, fila: number, col: number): string => {
  const semilla = (fila * 31 + col * 17) % 7;
  // gancho: todas juntas, cambiando de color al mismo tiempo
  if (f < E.golpe) return LUCES[Math.floor(f / 22) % 4];
  // golpe: se "congelan" en blanco (nadie de la tribuna las maneja)
  if (f < E.app) return f < E.golpe + 8 ? "#FFFFFF" : APAGADO;
  if (f < E.mapa) return APAGADO;
  // mapa: se van registrando una por una, en orden de butaca
  if (f < E.gira) {
    const orden = fila * COLS + col;
    return orden < (f - E.mapa) * 5 ? claro(C.azul, 0.25) : APAGADO;
  }
  // en esta gira: alcanza con prenderla (se prenden por sectores, sin registrar nada)
  if (f < E.consola) {
    const prende = r.w(4, "prenderla") + (col % 5) * 3 + fila;
    return f >= prende ? VIOLETA : APAGADO;
  }
  // consola: cada anillo de señal que llega las prende
  if (f < E.pantalla) {
    const [x, y] = pos(fila, col);
    const d = Math.hypot(x - 540, y - 1300);
    const onda = ((f - E.consola) * 14 - d) % 260;
    return onda > 0 && onda < 70 ? C.amarillo : APAGADO;
  }
  // pantalla: corazón
  if (f < E.olas) return enCorazon(fila, col) ? C.rojo : VIOLETA;
  // olas → figura → palabra
  if (f < E.ojo) {
    const t = f - E.olas;
    if (t < 55) return Math.abs(col - ((t * 0.9) % (COLS + 6)) + 3) < 2.5 ? C.amarillo : VIOLETA;
    if (t < 105) return enCorazon(fila, col) ? C.rojo : C.azul;
    return enTexto(fila, col) ? "#FFFFFF" : VIOLETA;
  }
  // ojo: primero trabadas (bluetooth saturado), después parejas (radio propia)
  if (f < E.remate) {
    const radio = r.w(9, "radio");
    if (f < radio) return (f + semilla * 5) % 9 < 3 ? APAGADO : LUCES[(semilla + Math.floor(f / 7)) % 5];
    return C.verde;
  }
  return VIOLETA;
};

const Tribuna: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {Array.from({ length: FILAS }).map((_, fila) =>
      Array.from({ length: COLS }).map((__, col) => {
        const [x, y, rad] = pos(fila, col);
        const c = colorVarita(f, fila, col);
        const prendida = c !== APAGADO;
        return (
          <g key={`${fila}-${col}`}>
            {prendida ? <circle cx={x} cy={y} r={rad * 2.1} fill={c} opacity={0.22} /> : null}
            <circle cx={x} cy={y} r={rad} fill={c} />
          </g>
        );
      }),
    )}
  </g>
);

/** El estadio: noche, techo, tribuna de enfrente, campo, escenario y la consola. */
const Estadio: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={40 + 14} y={640 + 14} width={1000} height={820} rx={40} fill={C.tinta} />
    <rect x={40} y={640} width={1000} height={820} rx={40} fill={NOCHE} stroke={C.tinta} strokeWidth={9} />
    {/* techo (membrana) y gradas */}
    <path d="M60 700 Q540 620 1020 700 L1020 720 Q540 650 60 720 Z" fill={NOCHE2} />
    <path d="M150 715 L930 715 L1000 1225 L80 1225 Z" fill={NOCHE2} stroke="#2D3570" strokeWidth={4} />
    {Array.from({ length: FILAS }).map((_, fila) => {
      const [, y] = pos(fila, 0);
      return <line key={fila} x1={170 - fila * 6} y1={y + 14} x2={910 + fila * 6} y2={y + 14} stroke="#2D3570" strokeWidth={3} />;
    })}
    <Tribuna f={f} />
    {/* campo */}
    <path d="M60 1225 L1020 1225 L1020 1440 L60 1440 Z" fill="#1E5A3A" />
    {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={60} y={1225 + i * 44} width={960} height={22} fill="#226544" />)}
    {/* escenario 360 */}
    <ellipse cx={540} cy={1260} rx={170} ry={30} fill="#2A2D3A" stroke={C.tinta} strokeWidth={6} />
    <ellipse cx={540} cy={1252} rx={150} ry={22} fill={oscuro(VIOLETA, 0.2)} />
    {/* consola de iluminación en el campo */}
    <g>
      <path d="M440 1330 L640 1330 L668 1392 L412 1392 Z" fill="#2A2D3A" stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
      <rect x={470} y={1288} width={140} height={46} rx={6} fill="#0E1024" stroke={C.tinta} strokeWidth={5} />
      <rect x={480} y={1296} width={120} height={30} rx={4} fill={entre(f, E.consola, E.pantalla) ? C.amarillo : VIOLETA} opacity={0.9} />
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <rect key={k} x={452 + k * 26} y={1352 + Math.sin(f / 6 + k) * 6} width={12} height={10} rx={3} fill={C.blanco} />
      ))}
    </g>
  </g>
);

/** Ondas de señal que salen de la consola hacia la tribuna. */
const Ondas: React.FC<{ f: number; desde: number; color?: string }> = ({ f, desde, color = C.amarillo }) => (
  <g fill="none" stroke={color} strokeWidth={8}>
    {[0, 1, 2].map((k) => {
      const t = ((f - desde) * 14 + k * 260) % 780;
      return <circle key={k} cx={540} cy={1300} r={t} opacity={Math.max(0, 1 - t / 780) * 0.85} />;
    })}
  </g>
);

/** La varita (genérica, sin logos): mango y globo que se ilumina. */
const Varita: React.FC<{ x: number; y: number; s?: number; color: string; t: number; rot?: number }> = ({ x, y, s = 1, color, t, rot = 0 }) => {
  const brillo = 0.75 + Math.sin(t / 6) * 0.15;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <circle cx={0} cy={-150} r={150} fill={color} opacity={0.22 * brillo} />
      <rect x={-26 + 10} y={-60 + 10} width={52} height={190} rx={22} fill={C.tinta} />
      <rect x={-26} y={-60} width={52} height={190} rx={22} fill="#2A2D3A" stroke={C.tinta} strokeWidth={7} />
      <rect x={-14} y={-20} width={10} height={120} rx={5} fill="#FFFFFF" opacity={0.25} />
      <rect x={-40} y={-78} width={80} height={30} rx={10} fill="#3A3F55" stroke={C.tinta} strokeWidth={7} />
      <circle cx={10} cy={-150 + 10} r={92} fill={C.tinta} />
      <circle cx={0} cy={-150} r={92} fill={claro(color, 0.35)} stroke={C.tinta} strokeWidth={8} />
      <circle cx={0} cy={-150} r={60} fill={color} opacity={0.75} />
      <ellipse cx={-34} cy={-190} rx={26} ry={14} fill="#FFFFFF" opacity={0.85} />
    </g>
  );
};

/** Celular con el formulario de la app (sección, fila, asiento) que se va completando. */
const Celular: React.FC<{ t: number }> = ({ t }) => {
  const campos: [string, string, number][] = [["sección", "campo", 20], ["fila", "12", 46], ["asiento", "34", 72]];
  return (
    <g>
      <rect x={300 + 16} y={760 + 16} width={300} height={560} rx={44} fill={C.tinta} />
      <rect x={300} y={760} width={300} height={560} rx={44} fill="#2A2D3A" stroke={C.tinta} strokeWidth={8} />
      <rect x={318} y={790} width={264} height={500} rx={28} fill={C.blanco} />
      <text x={450} y={846} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={30} fill={C.tinta}>tu lugar</text>
      {campos.map(([nombre, valor, aparece], i) => {
        const y = 880 + i * 112;
        const escrito = valor.slice(0, Math.max(0, Math.floor((t - aparece) / 4)));
        return (
          <g key={nombre}>
            <text x={340} y={y + 6} fontFamily={mono} fontWeight={700} fontSize={22} fill="#555">{nombre}</text>
            <rect x={338} y={y + 18} width={224} height={54} rx={12} fill="#F3F5FB" stroke={t >= aparece ? C.azul : "#C9D0E0"} strokeWidth={4} />
            <text x={354} y={y + 56} fontFamily={display} fontWeight={800} fontSize={30} fill={C.tinta}>{escrito}{t >= aparece && escrito.length < valor.length && t % 10 < 5 ? "|" : ""}</text>
          </g>
        );
      })}
      <rect x={338} y={1214} width={224} height={56} rx={14} fill={t > 100 ? C.verde : C.azul} stroke={C.tinta} strokeWidth={5} />
      <text x={450} y={1252} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={28} fill={t > 100 ? C.tinta : C.blanco}>{t > 100 ? "✓ listo" : "registrar"}</text>
    </g>
  );
};

/* ---------- el mundo + lo que se mueve con la cámara ---------- */
const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const [vx, vy] = pos(6, 12);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Estadio f={f} />
        {entre(f, E.consola, E.pantalla) ? <Ondas f={f} desde={E.consola} /> : null}
        {entre(f, E.remate, E.cta) ? <Ondas f={f} desde={E.remate} color={VIOLETA} /> : null}
        {entre(f, E.ojo, E.remate) && f >= r.w(9, "radio") ? <Ondas f={f} desde={r.w(9, "radio")} color={C.verde} /> : null}
        {/* la butaca registrada (aro que la marca) */}
        {entre(f, E.mapa, E.gira) ? <circle cx={vx} cy={vy} r={18 + Math.sin(f / 4) * 3} fill="none" stroke={C.amarillo} strokeWidth={5} /> : null}
        {/* lupa: adentro de la varita hay un receptor */}
        {entre(f, E.receptor, E.pantalla) ? (
          <Lupa cx={820} cy={560} r={165} desde={E.receptor + 4} ax={vx} ay={vy}>
            <rect x={655} y={395} width={330} height={330} fill={NOCHE} />
            <circle cx={820} cy={560} r={130} fill={claro(VIOLETA, 0.3)} opacity={0.6} />
            <rect x={760} y={520} width={120} height={80} rx={10} fill="#1B7A3E" stroke={C.tinta} strokeWidth={5} />
            {[0, 1, 2, 3].map((k) => <rect key={k} x={772 + k * 26} y={600} width={10} height={16} fill="#C9D0E0" />)}
            <rect x={790} y={540} width={44} height={40} rx={4} fill="#2A2D3A" />
            <path d="M880 540 l40 -50 l20 20 l30 -40" fill="none" stroke={C.amarillo} strokeWidth={7} strokeLinecap="round" />
            {[1, 2, 3].map((k) => (
              <path key={k} d={`M${930 + k * 0} ${470 - k * 2} a${k * 22} ${k * 22} 0 0 1 ${k * 22} ${k * 22}`} fill="none" stroke={C.amarillo}
                strokeWidth={6} opacity={(Math.floor(f / 5) % 3) + 1 > k - 1 ? 1 : 0.2} />
            ))}
          </Lupa>
        ) : null}
      </svg>
      {entre(f, E.mapa, E.gira) ? <Rotulo texto="esta varita: sección, fila y asiento" desde={r.w(3, "sabe")} x={540} y={600} ax={vx} ay={vy - 16} tam={24} /> : null}
      {entre(f, E.consola, E.receptor) ? <Rotulo texto="consola central" desde={E.consola + 12} x={240} y={1390} ax={430} ay={1330} color={C.blanco} fondo={C.azul} tam={24} /> : null}
      {entre(f, E.receptor, E.pantalla) ? <Rotulo texto="receptor inalámbrico" desde={E.receptor + 16} x={820} y={760} ax={820} ay={726} tam={24} /> : null}
      {entre(f, E.pantalla, E.olas) ? <Rotulo texto="1 fan = 1 píxel" desde={r.w(7, "píxel")} x={300} y={600} ax={pos(2, 4)[0]} ay={pos(2, 4)[1]} color={C.tinta} fondo={C.amarillo} tam={30} /> : null}
      {entre(f, E.ojo, E.remate) ? (
        f < r.w(9, "radio")
          ? <Rotulo texto="Bluetooth saturado" desde={r.w(9, "trabar") - 4} x={540} y={1170} ax={pos(5, 12)[0]} ay={pos(5, 12)[1]} color={C.blanco} fondo={C.rojo} tam={26} />
          : <Rotulo texto="radio propia ✓" desde={r.w(9, "radio")} x={540} y={1170} ax={540} ay={1300} color={C.tinta} fondo={C.verde} tam={26} />
      ) : null}
    </>
  );
};

const TOMAS = [
  toma(0, 540, 960, 1.05), toma(E.golpe, 540, 900, 1.0), toma(E.app - 1, 540, 900, 1.0), toma(E.app + 10, 540, 1050, 1.0),
  toma(E.mapa, 540, 1050, 1.0), toma(E.mapa + 14, 540, 960, 1.1),
  toma(E.gira, 540, 960, 1.1), toma(E.gira + 14, 540, 1000, 1.0),
  toma(E.consola, 540, 1000, 1.0), toma(E.consola + 14, 540, 1180, 1.25),
  toma(E.receptor, 540, 1180, 1.25), toma(E.receptor + 14, 620, 860, 1.05),
  toma(E.pantalla, 620, 860, 1.05), toma(E.pantalla + 16, 540, 1000, 1.08),
  toma(E.ojo, 540, 1000, 1.08), toma(E.remate, 540, 1080, 0.95),
];
const GOLPES = [r.w(1, "nada"), r.w(3, "mapa"), r.w(4, "prenderla"), r.w(5, "consola"), r.w(6, "milisegundos"), r.w(7, "píxel"), r.w(8, "palabras"), r.w(9, "radio"), r.w(10, "consola")];

const Diagrama: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= E.cta) return null;
  const g = GOLPES.reduce((m, k) => m * golpe(f, k, 1.05, 12), 1);
  // en "app" el estadio queda atrás, oscurecido: el protagonista es el celular
  const atenua = entre(f, E.app, E.mapa) ? interpolate(f, [E.app, E.app + 8, E.mapa - 6, E.mapa], [1, 0.25, 0.25, 1], clamp) : 1;
  return (
    <AbsoluteFill style={{ scale: g, opacity: atenua }}>
      <Camara tomas={TOMAS}><Mundo /></Camara>
    </AbsoluteFill>
  );
};

/* ---------- capas de pantalla por frase ---------- */
const Gancho: React.FC = () => (
  <>
    <Etiqueta texto="BTS en La Plata" desde={-8} color={C.rojo} />
    <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={400} tam={54} />
  </>
);

const Golpe: React.FC = () => {
  const nada = r.w(1, "nada") - E.golpe;
  return (
    <>
      <Etiqueta texto="la verdad" color={C.verde} />
      <Titulo pregunta="¿las elige cada fan?" desdeP={0} respuesta="¡para nada!" desdeR={nada} top={400} tamR={120} />
    </>
  );
};

const App: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Etiqueta texto="paso 1 · antes del show" />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "450px 1040px" }}><Celular t={frame} /></g>
        <g style={{ scale: pop(frame, fps, 8), transformOrigin: "800px 1200px" }}><Varita x={790} y={1230} s={0.9} color={frame > 100 ? VIOLETA : "#C9D0E0"} t={frame} rot={12} /></g>
      </Lienzo>
      <Fuente texto="Excélsior (2026)" />
    </>
  );
};

const Gira: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prende = r.w(4, "prenderla") - E.gira;
  const on = frame >= prende;
  return (
    <>
      <Etiqueta texto="en esta gira" color={C.rojo} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 560px" }}>
          <Varita x={540} y={700} s={0.8} color={on ? VIOLETA : "#C9D0E0"} t={frame} />
        </g>
      </Lienzo>
      {on ? <Sello texto="ON" desde={prende} x={640} y={420} rot={10} color={C.verde} tinta={C.tinta} tam={70} /> : null}
      <Fuente texto="Infobae Perú · RPP (octubre 2026)" />
    </>
  );
};

const Pantalla: React.FC = () => (
  <>
    <Etiqueta texto="la tribuna es una pantalla" color={C.verde} />
    <Fuente texto="Excélsior (2026)" />
  </>
);

const Olas: React.FC = () => (
  <>
    <Etiqueta texto="olas, figuras, palabras" />
    <Fuente texto="Excélsior (2026)" />
  </>
);

const Remate: React.FC = () => {
  const cons = r.w(10, "mandó") - E.remate;
  return (
    <>
      <Etiqueta texto="en criollo" />
      <Titulo pregunta="el color no lo elegiste vos…" desdeP={0} respuesta="¡te lo mandó una consola!" desdeR={cons} top={400} tamR={82} />
    </>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prendio = r.w(11, "prendió") - E.cta;
  return (
    <>
      <Titulo pregunta="mandáselo a esa ARMY que…" desdeP={0} top={360} />
      <Lienzo>
        <g style={{ scale: interpolate(resorte(frame, fps, 0, 220), [0, 1], [0.6, 1]), transformOrigin: "540px 1440px" }}>
          <Persona x={470} y={1440} s={1.15} t={frame} gesto="canchera" pelo="largo" remera={VIOLETA} mira={1} />
          <Varita x={760} y={1150} s={0.85} color={VIOLETA} t={frame} rot={14} />
        </g>
      </Lienzo>
      <Globo texto="¡el violeta lo prendí yo!" desde={Math.max(6, prendio - 10)} x={110} y={600} cola="izq" tam={42} ancho={480} />
    </>
  );
};

export const ArmyBomb006: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [20, "pop", 0.35], [44, "pop", 0.35], [66, "pop", 0.35],
    [r.w(1, "nada") - 2, "scratch", 0.55], [r.w(1, "nada"), "boing", 0.5],
    [E.app, "whoosh", 0.4], [E.app + 2, "pop"], [E.app + 30, "tic", 0.35], [E.app + 56, "tic", 0.35], [E.app + 82, "tic", 0.35], [E.app + 102, "ding", 0.45],
    [E.mapa, "whoosh", 0.4], [r.w(3, "sabe"), "pop"],
    [E.gira, "pop"], [r.w(4, "prenderla"), "ding", 0.45],
    [E.consola, "whoosh", 0.4], [E.consola + 14, "ding", 0.4],
    [E.receptor, "pop"], [r.w(6, "milisegundos"), "ding", 0.45],
    [E.pantalla, "whoosh", 0.4], [r.w(7, "píxel"), "sello", 0.5],
    [E.olas, "whoosh", 0.35], [E.olas + 55, "pop"], [E.olas + 105, "ding", 0.45],
    [E.ojo, "sello", 0.55], [r.w(9, "trabar"), "error", 0.4], [r.w(9, "radio"), "ding", 0.45],
    [E.remate, "pop"], [r.w(10, "mandó"), "sello", 0.5],
    [E.cta, "pop"], [Math.max(E.cta + 6, r.w(11, "prendió") - 10), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo"><Logo /></Sequence>
      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.golpe - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · golpe" from={E.golpe} durationInFrames={E.app - E.golpe} layout="none"><Golpe /></Sequence>
      <Sequence name="3 · app" from={E.app} durationInFrames={E.mapa - E.app} layout="none"><App /></Sequence>
      <Sequence name="4 · mapa" from={E.mapa} durationInFrames={E.gira - E.mapa} layout="none"><Etiqueta texto="paso 2 · el mapa" /></Sequence>
      <Sequence name="5 · gira" from={E.gira} durationInFrames={E.consola - E.gira} layout="none"><Gira /></Sequence>
      <Sequence name="5 · consola" from={E.consola} durationInFrames={E.receptor - E.consola} layout="none">
        <Etiqueta texto="paso 3 · durante el show" /><Fuente texto="Excélsior (2026)" />
      </Sequence>
      <Sequence name="6 · receptor" from={E.receptor} durationInFrames={E.pantalla - E.receptor} layout="none"><Etiqueta texto="adentro de la varita" /></Sequence>
      <Sequence name="7 · pantalla" from={E.pantalla} durationInFrames={E.olas - E.pantalla} layout="none"><Pantalla /></Sequence>
      <Sequence name="8 · olas" from={E.olas} durationInFrames={E.ojo - E.olas} layout="none"><Olas /></Sequence>
      <Sequence name="9 · ojo" from={E.ojo} durationInFrames={E.remate - E.ojo} layout="none">
        <Sello texto="OJO" desde={0} x={440} y={380} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
        <Fuente texto="Excélsior (2026)" />
      </Sequence>
      <Sequence name="10 · remate" from={E.remate} durationInFrames={E.cta - E.remate} layout="none"><Remate /></Sequence>
      <Sequence name="11 · cta" from={E.cta} durationInFrames={DURACION - E.cta} layout="none"><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("006-army-bomb/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada006: React.FC = () => (
  <Portada arriba="¿las ARMY eligen el color de su varita?" grande="¡no!" sello="BTS" colorSello={C.rojo} numero={6}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(0 40)"><Estadio f={E.pantalla + 10} /></g>
      <Varita x={860} y={1380} s={0.75} color={VIOLETA} t={10} rot={14} />
    </svg>
  </Portada>
);

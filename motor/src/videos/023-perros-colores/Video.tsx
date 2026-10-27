import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/023-perros-colores/tiempos.json";
import { C, display } from "../../kit/marca";
import { clamp, golpe, pop, respira } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Rotulo } from "../../kit/diagrama";

// Mundo: UNA ventana de parque (pasto, cielo, tres pelotas: roja, azul, amarilla) vista de tres maneras:
// en gris (el mito), como la ve una persona y como la ve un perro (dicromático: azul-amarillo, aproximado).
// El mecanismo: tres conos vs dos conos, y la pelota roja que se camufla en el pasto.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  verso: r.f(1),
  tres: r.f(2),
  dos: r.f(3),
  azul: r.f(4),
  rojoVerde: r.f(5),
  ojo: r.f(6),
  pelota: r.f(7),
  cta: r.f(8),
  sello: r.fin(8) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const PASTO = "#3FAE5A";
const ROJO = "#D8432B";
const AZUL = "#2E4BFF";
const AMARILLO = "#FFD91F";
const PW = 900;
const PH = 620;
const PX = 90;
const PY = 600;

/* Filtros: gris (el mito) y perro (R=G=promedio de rojo y verde, azul igual: eje azul-amarillo). */
const Defs: React.FC = () => (
  <defs>
    <filter id="f-gris" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
    </filter>
    <filter id="f-perro" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.5 0.5 0 0 0  0.5 0.5 0 0 0  0 0 1 0 0  0 0 0 1 0" />
    </filter>
    <clipPath id="c-panel"><rect x={0} y={0} width={PW} height={PH} rx={30} /></clipPath>
    <linearGradient id="g-ball" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity={0.55} />
      <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.25} />
    </linearGradient>
  </defs>
);

type Modo = "color" | "gris" | "perro";
const filtro = (m: Modo) => (m === "gris" ? "url(#f-gris)" : m === "perro" ? "url(#f-perro)" : undefined);

const Pelota: React.FC<{ cx: number; cy: number; color: string; rad?: number; rebote?: number }> = ({ cx, cy, color, rad = 50, rebote = 0 }) => (
  <g transform={`translate(0 ${-rebote})`}>
    <ellipse cx={cx + 8} cy={cy + rad + 4} rx={rad * 0.95} ry={rad * 0.25} fill={C.tinta} opacity={0.35} />
    <circle cx={cx + 7} cy={cy + 7} r={rad} fill={C.tinta} />
    <circle cx={cx} cy={cy} r={rad} fill={color} stroke={C.tinta} strokeWidth={7} />
    <circle cx={cx} cy={cy} r={rad - 3} fill="url(#g-ball)" />
    <ellipse cx={cx - rad * 0.35} cy={cy - rad * 0.4} rx={rad * 0.2} ry={rad * 0.12} fill="#fff" opacity={0.8} transform={`rotate(-30 ${cx - rad * 0.35} ${cy - rad * 0.4})`} />
  </g>
);

/* El parque, en coordenadas locales del panel (0..900 × 0..620). */
const Parque: React.FC<{ modo: Modo; t: number; rebotan?: boolean; opacidades?: [number, number, number] }> = ({ modo, t, rebotan = false, opacidades = [1, 1, 1] }) => {
  const reb = (i: number) => (rebotan ? Math.abs(Math.sin((t + i * 9) / 7)) * 26 : 0);
  return (
    <g filter={filtro(modo)}>
      <rect x={0} y={0} width={PW} height={PH} fill="#8FD3FF" />
      <circle cx={770} cy={95} r={52} fill="#FFE14D" stroke={C.tinta} strokeWidth={7} />
      <ellipse cx={230} cy={110} rx={95} ry={38} fill="#fff" stroke={C.tinta} strokeWidth={6} />
      <ellipse cx={300} cy={92} rx={60} ry={34} fill="#fff" stroke={C.tinta} strokeWidth={6} />
      <rect x={0} y={290} width={PW} height={PH - 290} fill={PASTO} />
      <rect x={0} y={290} width={PW} height={10} fill={C.tinta} />
      {Array.from({ length: 22 }).map((_, i) => (
        <path key={i} d={`M${40 + i * 41} ${340 + (i % 5) * 52} l6 -22 l6 22 M${52 + i * 41} ${346 + (i % 5) * 52} l6 -18 l6 18`} stroke="#1F7F3C" strokeWidth={5} fill="none" strokeLinecap="round" />
      ))}
      <g opacity={opacidades[0]}><Pelota cx={340} cy={450} color={ROJO} rebote={reb(0)} /></g>
      <g opacity={opacidades[1]}><Pelota cx={560} cy={500} color={AZUL} rebote={reb(1)} /></g>
      <g opacity={opacidades[2]}><Pelota cx={770} cy={440} color={AMARILLO} rebote={reb(2)} /></g>
    </g>
  );
};

/* El perro (único personaje con cara). */
const Perro: React.FC<{ cx: number; cy: number; s?: number; t: number; triste?: boolean }> = ({ cx, cy, s = 1, t, triste = false }) => {
  const [sx, sy] = respira(t, 3, 0.02);
  const cola = Math.sin(t / 3) * 14;
  const MARRON = "#C98A4B";
  const CLARO = "#E9B67A";
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s * sx} ${s * sy})`}>
      <ellipse cx={0} cy={140} rx={150} ry={26} fill={C.tinta} opacity={0.3} />
      {/* cola */}
      <g transform={`rotate(${cola} 120 60)`}>
        <path d="M110 70 Q190 20 180 -30" stroke={C.tinta} strokeWidth={36} fill="none" strokeLinecap="round" />
        <path d="M110 70 Q190 20 180 -30" stroke={MARRON} strokeWidth={22} fill="none" strokeLinecap="round" />
      </g>
      {/* cuerpo */}
      <rect x={-130} y={20} width={260} height={110} rx={50} fill={C.tinta} transform="translate(8 8)" />
      <rect x={-130} y={20} width={260} height={110} rx={50} fill={MARRON} stroke={C.tinta} strokeWidth={8} />
      <ellipse cx={-60} cy={55} rx={60} ry={24} fill={CLARO} opacity={0.6} />
      {/* patas */}
      {[-90, -30, 60, 110].map((x, i) => (
        <rect key={i} x={x - 18} y={105} width={36} height={48} rx={16} fill={i % 2 ? CLARO : MARRON} stroke={C.tinta} strokeWidth={7} />
      ))}
      {/* cabeza */}
      <circle cx={-90} cy={-30} r={86} fill={C.tinta} transform="translate(8 8)" />
      <path d="M-170 -80 Q-215 -10 -165 40 Q-140 -10 -140 -70 Z" fill="#8A5528" stroke={C.tinta} strokeWidth={7} />
      <path d="M-10 -80 Q35 -10 -15 40 Q-40 -10 -40 -70 Z" fill="#8A5528" stroke={C.tinta} strokeWidth={7} />
      <circle cx={-90} cy={-30} r={86} fill={MARRON} stroke={C.tinta} strokeWidth={8} />
      <ellipse cx={-90} cy={5} rx={52} ry={40} fill={CLARO} stroke={C.tinta} strokeWidth={6} />
      <ellipse cx={-90} cy={-12} rx={22} ry={15} fill={C.tinta} />
      <ellipse cx={-96} cy={-17} rx={7} ry={4} fill="#fff" opacity={0.8} />
      <path d={triste ? "M-112 30 Q-90 14 -68 30" : "M-112 20 Q-90 44 -68 20"} stroke={C.tinta} strokeWidth={6} fill="none" strokeLinecap="round" />
      {[-130, -50].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={-50} r={17} fill="#fff" stroke={C.tinta} strokeWidth={5} />
          <circle cx={x + 3} cy={-48} r={8} fill={C.tinta} />
        </g>
      ))}
      {triste ? <path d="M-150 -78 l36 10 M-30 -78 l-36 10" stroke={C.tinta} strokeWidth={6} strokeLinecap="round" /> : null}
    </g>
  );
};

/* Marco del panel con sombra dura. */
const Panel: React.FC<{ x?: number; y?: number; s?: number; children: React.ReactNode }> = ({ x = PX, y = PY, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={14} y={14} width={PW} height={PH} rx={30} fill={C.tinta} />
    <g clipPath="url(#c-panel)">{children}</g>
    <rect x={0} y={0} width={PW} height={PH} rx={30} fill="none" stroke={C.tinta} strokeWidth={10} />
  </g>
);

/* ---------- Escenas ---------- */

const Gancho: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Etiqueta texto="lo que creías" desde={-8} />
      <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={400} tam={60} />
      <Lienzo>
        <Defs />
        <g style={{ scale: pop(f, fps, 0), transformOrigin: "540px 910px" }}>
          <Panel><Parque modo="gris" t={f} /></Panel>
          <Perro cx={250} cy={1020} s={0.9} t={f} />
        </g>
      </Lienzo>
      <Sello texto="¿SOLO GRISES?" desde={22} x={560} y={1290} rot={-5} color={C.rojo} tam={46} />
    </>
  );
};

const Verso: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cambia = interpolate(f, [4, 16], [0, 1], clamp);
  return (
    <>
      <Etiqueta texto="la verdad" color={C.verde} />
      <Titulo pregunta="¿blanco y negro?" desdeP={0} respuesta="¡un verso!" desdeR={r.w(1, "verso") - E.verso} top={380} tamR={120} />
      <Lienzo>
        <Defs />
        <g style={{ scale: pop(f, fps, 0) , transformOrigin: "540px 910px" }}>
          <Panel>
            <Parque modo="gris" t={f} />
            <g opacity={cambia}><Parque modo="perro" t={f} /></g>
          </Panel>
          <Perro cx={250} cy={1020} s={0.9} t={f} />
        </g>
      </Lienzo>
      <Fuente texto="colores aproximados · cómo lo vería un perro" />
    </>
  );
};

/* Fila de conos: círculos de color que aparecen de a uno. */
const Cono: React.FC<{ cx: number; cy: number; color: string; desde: number; rad?: number; tacha?: boolean }> = ({ cx, cy, color, desde, rad = 74, tacha = false }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < desde) return null;
  const s = pop(f, fps, desde);
  return (
    <g style={{ scale: s, transformOrigin: `${cx}px ${cy}px` }}>
      <circle cx={cx + 9} cy={cy + 9} r={rad} fill={C.tinta} />
      <circle cx={cx} cy={cy} r={rad} fill={color} stroke={C.tinta} strokeWidth={8} />
      <circle cx={cx} cy={cy} r={rad - 4} fill="url(#g-ball)" />
      {tacha ? <path d={`M${cx - 52} ${cy - 52} L${cx + 52} ${cy + 52} M${cx + 52} ${cy - 52} L${cx - 52} ${cy + 52}`} stroke={C.tinta} strokeWidth={14} strokeLinecap="round" /> : null}
    </g>
  );
};

const Tres: React.FC = () => {
  const f = useCurrentFrame();
  const c1 = r.w(2, "tres") - E.tres;
  return (
    <>
      <Etiqueta texto="paso 1 · los ojos" />
      <Lienzo>
        <Defs />
        <text x={540} y={640} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={72} fill={C.tinta}>vos: tres conos</text>
        <Cono cx={290} cy={850} color={C.rojo} desde={c1} />
        <Cono cx={540} cy={850} color={C.verde} desde={c1 + 8} />
        <Cono cx={790} cy={850} color={C.azul} desde={c1 + 16} />
        <g style={{ scale: pop(f, 30, 6), transformOrigin: "540px 1160px" }}>
          <text x={540} y={1130} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={190} fill={C.tinta}>3</text>
        </g>
      </Lienzo>
      <Fuente texto="ACVO · VCA Animal Hospitals" />
    </>
  );
};

const Dos: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c1 = r.w(3, "dos") - E.dos;
  return (
    <>
      <Etiqueta texto="paso 2 · el perro" />
      <Lienzo>
        <Defs />
        <text x={540} y={640} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={72} fill={C.tinta}>él: dos conos</text>
        <Cono cx={290} cy={850} color={C.rojo} desde={0} tacha />
        <Cono cx={290} cy={850} color={C.amarillo} desde={c1 - 6} />
        <Cono cx={540} cy={850} color={C.verde} desde={0} tacha />
        <Cono cx={790} cy={850} color={C.azul} desde={0} />
        <g style={{ scale: pop(f, fps, c1), transformOrigin: "540px 1160px" }}>
          <text x={540} y={1130} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={190} fill={C.rojo}>2</text>
        </g>
        <Perro cx={880} cy={1080} s={0.38} t={f} />
      </Lienzo>
      <Globo texto="¿solo dos?" desde={c1 + 6} x={90} y={1010} cola="der" tam={44} ancho={330} />
    </>
  );
};

const Azul: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const az = r.w(4, "azules") - E.azul;
  const am = r.w(4, "amarillos") - E.azul;
  return (
    <>
      <Etiqueta texto="lo que sí ve" color={C.verde} />
      <Lienzo>
        <Defs />
        <g style={{ scale: pop(f, fps, 0), transformOrigin: "540px 910px" }}>
          <Panel><Parque modo="perro" t={f} rebotan /></Panel>
        </g>
      </Lienzo>
      <Rotulo texto="azul ✓" desde={az} x={560} y={560} ax={PX + 560} ay={PY + 450} color={C.blanco} fondo={C.azul} tam={40} />
      <Rotulo texto="amarillo ✓" desde={am} x={780} y={1300} ax={PX + 770} ay={PY + 400} color={C.tinta} fondo={C.amarillo} tam={40} />
      <Fuente texto="Colegio Americano de Oftalmólogos Veterinarios" />
    </>
  );
};

const RojoVerde: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ro = r.w(5, "rojo") - E.rojoVerde;
  const ve = r.w(5, "verde") - E.rojoVerde;
  const mitad = (modo: Modo, y: number, texto: string) => (
    <g>
      <Panel x={190} y={y} s={0.62}><Parque modo={modo} t={f} opacidades={[1, 0, 0]} /></Panel>
      <text x={190} y={y - 16} fontFamily={display} fontWeight={800} fontSize={40} fill={C.tinta}>{texto}</text>
    </g>
  );
  return (
    <>
      <Etiqueta texto="rojo y verde" />
      <Lienzo>
        <Defs />
        <g style={{ scale: pop(f, fps, 0), transformOrigin: "540px 900px" }}>
          {mitad("color", 560, "vos")}
          {mitad("perro", 1000, "él (aproximado)")}
        </g>
      </Lienzo>
      <Sello texto="SE CAMUFLA" desde={ve + 4} x={640} y={1230} rot={-6} color={C.rojo} tam={44} />
      <Rotulo texto="rojo" desde={ro} x={300} y={500} ax={190 + 340 * 0.62} ay={560 + 450 * 0.62} color={C.blanco} fondo={C.rojo} tam={34} />
      <Fuente texto="VCA Animal Hospitals" />
    </>
  );
};

const Ojo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const me = r.w(6, "menos") - E.ojo;
  const barra = (modo: Modo, y: number, texto: string) => (
    <g>
      <text x={110} y={y - 18} fontFamily={display} fontWeight={800} fontSize={44} fill={C.tinta}>{texto}</text>
      <rect x={120} y={y + 8} width={860} height={110} rx={26} fill={C.tinta} />
      <g filter={filtro(modo)}>
        <rect x={110} y={y} width={860} height={110} rx={26} fill="url(#arco)" stroke={C.tinta} strokeWidth={8} />
      </g>
      <rect x={110} y={y} width={860} height={110} rx={26} fill="none" stroke={C.tinta} strokeWidth={8} />
    </g>
  );
  return (
    <>
      <Etiqueta texto="ojo" color={C.amarillo} />
      <Lienzo>
        <Defs />
        <defs>
          <linearGradient id="arco" x1="0" y1="0" x2="1" y2="0">
            {["#FF3B30", "#FF9500", "#FFE14D", "#2BD67B", "#00C2FF", "#2E4BFF", "#A23BFF"].map((c, i) => (
              <stop key={i} offset={i / 6} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        <g style={{ scale: pop(f, fps, 6), transformOrigin: "540px 760px" }}>{barra("color", 640, "vos")}</g>
        <g style={{ scale: pop(f, fps, me), transformOrigin: "540px 1000px" }}>{barra("perro", 940, "él (aproximado)")}</g>
        <Perro cx={850} cy={1260} s={0.3} t={f} />
      </Lienzo>
      <Sello texto="OJO" desde={0} x={430} y={330} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
      <Sello texto="MENOS COLORES" desde={me + 4} x={90} y={1230} rot={-4} color={C.azul} tam={46} />
    </>
  );
};

const Pelotas: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const az = r.w(7, "azul") - E.pelota;
  const ro = r.w(7, "roja") - E.pelota;
  const brillo = 0.5 + 0.5 * Math.sin(f / 4);
  return (
    <>
      <Etiqueta texto="para hacer hoy" color={C.verde} />
      <Lienzo>
        <Defs />
        <g style={{ scale: pop(f, fps, 0), transformOrigin: "540px 910px" }}>
          <Panel><Parque modo="perro" t={f} rebotan opacidades={[f >= ro ? 0.55 : 1, 1, 1]} /></Panel>
          {f >= az ? <circle cx={PX + 560} cy={PY + 500} r={78 + brillo * 8} fill="none" stroke={C.verde} strokeWidth={9} strokeDasharray="14 12" /> : null}
        </g>
      </Lienzo>
      <Rotulo texto="se ve bien" desde={az} x={760} y={540} ax={PX + 600} ay={PY + 450} color={C.tinta} fondo={C.verde} tam={38} />
      <Rotulo texto="se pierde" desde={ro} x={230} y={1290} ax={PX + 340} ay={PY + 470} color={C.blanco} fondo={C.rojo} tam={38} />
      <Fuente texto="ACVO · debería: también influyen movimiento y olor" />
    </>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const roja = r.w(8, "roja") - E.cta;
  return (
    <>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={360} />
      <Lienzo>
        <Defs />
        <g style={{ scale: pop(f, fps, 0), transformOrigin: "540px 900px" }}>
          <Panel><Parque modo="color" t={f} opacidades={[0, 0, 0]} /></Panel>
          <Pelota cx={PX + 620} cy={PY + 460} color={ROJO} rebote={f >= roja ? Math.abs(Math.sin(f / 6)) * 24 : 0} />
          <Perro cx={PX + 330} cy={PY + 360} s={0.95} t={f} triste={f >= roja + 6} />
        </g>
      </Lienzo>
      {f >= roja ? <Globo texto="¿dónde está?" desde={roja + 4} x={620} y={470} cola="izq" tam={44} ancho={380} /> : null}
    </>
  );
};

export const PerrosColores023: React.FC = () => {
  const frame = useCurrentFrame();
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [22, "sello", 0.4],
    [E.verso - 2, "scratch", 0.55], [r.w(1, "verso"), "boing", 0.5],
    [E.tres, "whoosh", 0.35], [r.w(2, "tres"), "pop"], [r.w(2, "tres") + 8, "pop"], [r.w(2, "tres") + 16, "pop"],
    [E.dos, "whoosh", 0.35], [r.w(3, "dos") - 6, "scratch", 0.45], [r.w(3, "dos"), "ding", 0.5],
    [E.azul, "whoosh", 0.35], [r.w(4, "azules"), "ding", 0.45], [r.w(4, "amarillos"), "ding", 0.45],
    [E.rojoVerde, "whoosh", 0.35], [r.w(5, "verde") + 4, "sello", 0.5],
    [E.ojo, "sello", 0.55], [r.w(6, "menos") + 4, "sello", 0.45],
    [E.pelota, "whoosh", 0.35], [r.w(7, "azul"), "ding", 0.45], [r.w(7, "roja"), "boing", 0.4],
    [E.cta, "pop"], [r.w(8, "roja"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];
  const golpes = [r.w(1, "verso"), r.w(3, "dos"), r.w(4, "azules"), r.w(5, "rojo"), r.w(6, "menos"), r.w(7, "azul")];
  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo"><Logo /></Sequence>
      <AbsoluteFill style={{ scale: golpes.reduce((m, k) => m * golpe(frame, k, 1.04, 10), 1) }}>
      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.verso - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · verso" from={E.verso} durationInFrames={E.tres - E.verso} layout="none"><Verso /></Sequence>
      <Sequence name="3 · tres" from={E.tres} durationInFrames={E.dos - E.tres} layout="none"><Tres /></Sequence>
      <Sequence name="4 · dos" from={E.dos} durationInFrames={E.azul - E.dos} layout="none"><Dos /></Sequence>
      <Sequence name="5 · azul" from={E.azul} durationInFrames={E.rojoVerde - E.azul} layout="none"><Azul /></Sequence>
      <Sequence name="6 · rojo y verde" from={E.rojoVerde} durationInFrames={E.ojo - E.rojoVerde} layout="none"><RojoVerde /></Sequence>
      <Sequence name="7 · ojo" from={E.ojo} durationInFrames={E.pelota - E.ojo} layout="none"><Ojo /></Sequence>
      <Sequence name="8 · pelota" from={E.pelota} durationInFrames={E.cta - E.pelota} layout="none"><Pelotas /></Sequence>
      <Sequence name="9 · cta" from={E.cta} durationInFrames={DURACION - E.cta} layout="none"><Cta /></Sequence>
      </AbsoluteFill>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal mandar="mandáselo al que le compró a su perro la pelota roja" /></Sequence>
      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("023-perros-colores/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada023: React.FC = () => (
  <Portada arriba="¿los perros ven en blanco y negro?" grande="¡es un verso!" sello="CIENCIA" colorSello={C.verde} numero={23}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <Defs />
      <g transform="translate(0 40)">
        <Panel><Parque modo="perro" t={10} /></Panel>
        <Perro cx={300} cy={1020} s={0.95} t={10} />
      </g>
    </svg>
  </Portada>
);

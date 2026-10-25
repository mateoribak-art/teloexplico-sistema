import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, display, mono, sombra } from "../kit/marca";
import { Etiqueta, Fondo, Logo } from "../kit/piezas";

// Prototipos de estilo de ilustración para la escena "la corriente que sube" (005-granizo-calor).
// B: diagrama ilustrado vectorial (sombreado, escala real, corte del granizo, sin caritas en todo).
// C: el mismo diagrama con objetos 3D de Fluent Emoji (Microsoft, licencia MIT).

const SUELO = 1330;
const KM = 70; // px por km de altura
const y = (km: number) => SUELO - km * KM;

// tonos derivados de la paleta (luces y sombras para dar volumen)
const T = {
  nubeLuz: "#FFFFFF",
  nubeMedio: "#E6EAF5",
  nubeSombra: "#A9B4D0",
  hielo: "#D8F0FF",
  hieloOscuro: "#9CCBEA",
  pasto: "#7BD68F",
  tierra: "#E8D2A6",
};

const Pildora: React.FC<{ x: number; yy: number; texto: string; color?: string; fondo?: string; tam?: number }> = ({
  x, yy, texto, color = C.tinta, fondo = C.blanco, tam = 26,
}) => (
  <div
    style={{
      position: "absolute", left: x, top: yy, fontFamily: mono, fontWeight: 700, fontSize: tam, color,
      background: fondo, border: `4px solid ${C.tinta}`, borderRadius: 10, padding: "6px 14px", boxShadow: sombra(4), whiteSpace: "nowrap",
    }}
  >
    {texto}
  </div>
);

/** Escala de altura a la izquierda + línea de 0 °C: es lo que convierte el dibujo en una explicación. */
const Escala: React.FC = () => (
  <g fontFamily={mono} fontWeight={700} fontSize={24} fill={C.tinta}>
    <line x1={120} y1={y(0)} x2={120} y2={y(12)} stroke={C.tinta} strokeWidth={4} />
    {[0, 3, 6, 9, 12].map((km) => (
      <g key={km}>
        <line x1={108} y1={y(km)} x2={132} y2={y(km)} stroke={C.tinta} strokeWidth={4} />
        <text x={98} y={y(km) + 8} textAnchor="end">{km} km</text>
      </g>
    ))}
    {/* zona bajo cero */}
    <rect x={124} y={y(12)} width={900} height={y(4) - y(12)} fill={T.hielo} opacity={0.35} />
    <line x1={124} y1={y(4)} x2={1024} y2={y(4)} stroke={C.azul} strokeWidth={4} strokeDasharray="14 10" />
  </g>
);

const Ciudad: React.FC = () => (
  <g>
    <rect x={-10} y={SUELO} width={1100} height={90} fill={T.tierra} stroke={C.tinta} strokeWidth={6} />
    <rect x={-10} y={SUELO} width={1100} height={18} fill={T.pasto} stroke={C.tinta} strokeWidth={6} />
    {[
      [330, 90, 80], [720, 110, 90], [830, 80, 70], [910, 120, 90],
    ].map(([x, h, w], i) => (
      <g key={i}>
        <rect x={x} y={SUELO - h} width={w} height={h} fill={C.blanco} stroke={C.tinta} strokeWidth={6} />
        {Array.from({ length: Math.floor(h / 45) }).map((_, f) => (
          <g key={f}>
            <rect x={x + 16} y={SUELO - h + 18 + f * 45} width={18} height={22} fill={C.amarillo} stroke={C.tinta} strokeWidth={3} />
            <rect x={x + w - 34} y={SUELO - h + 18 + f * 45} width={18} height={22} fill={C.amarillo} stroke={C.tinta} strokeWidth={3} />
          </g>
        ))}
      </g>
    ))}
  </g>
);

/** Ondas de calor que salen del suelo y alimentan la corriente. */
const Calor: React.FC = () => (
  <g fill="none" stroke={C.rojo} strokeWidth={7} strokeLinecap="round">
    {[480, 540, 600].map((x) => (
      <path key={x} d={`M${x} ${SUELO - 10} c-18 -30 18 -50 0 -80 c-18 -30 18 -50 0 -80`} />
    ))}
  </g>
);

/** Cumulonimbo con yunque: unión de círculos (contorno abajo, relleno arriba) + degradé de luz a sombra. */
const Cumulonimbo: React.FC = () => {
  const bultos: [number, number, number][] = [
    [380, 1080, 120], [520, 1100, 130], [670, 1080, 120], [780, 1040, 95], [300, 1030, 90],
    [430, 930, 120], [610, 920, 125], [520, 800, 125], [430, 700, 105], [610, 690, 110], [520, 590, 110],
  ];
  const yunque = `M190 ${y(11.2)} Q520 ${y(12.6)} 950 ${y(11.1)} Q980 ${y(10.4)} 900 ${y(10.2)} Q700 ${y(10.6)} 610 ${y(9.8)} L430 ${y(9.8)} Q330 ${y(10.5)} 160 ${y(10.3)} Q120 ${y(10.8)} 190 ${y(11.2)} Z`;
  return (
    <g transform="translate(0 -40)">
      <defs>
        <linearGradient id="nube" x1="0" y1={y(12)} x2="0" y2={y(1.5)} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={T.nubeLuz} />
          <stop offset="0.6" stopColor={T.nubeMedio} />
          <stop offset="1" stopColor={T.nubeSombra} />
        </linearGradient>
      </defs>
      {/* sombra dura */}
      <g transform="translate(14 14)" fill={C.tinta}>
        <path d={yunque} />
        {bultos.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
      </g>
      {/* contorno */}
      <g fill={C.tinta}>
        <path d={yunque} stroke={C.tinta} strokeWidth={14} strokeLinejoin="round" />
        {bultos.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r + 7} />)}
      </g>
      {/* relleno */}
      <g fill="url(#nube)">
        <path d={yunque} />
        {bultos.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
      </g>
      {/* brillos arriba a la izquierda de cada bulto */}
      <g fill={C.blanco} opacity={0.75}>
        {bultos.map(([cx, cy, r], i) => <ellipse key={i} cx={cx - r * 0.35} cy={cy - r * 0.45} rx={r * 0.32} ry={r * 0.18} />)}
      </g>
    </g>
  );
};

/** La corriente que sube: banda de calor a frío con chevrones. */
const Corriente: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="corriente" x1="0" y1={SUELO} x2="0" y2={y(9.5)} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={C.rojo} stopOpacity={0.9} />
        <stop offset="0.55" stopColor={C.amarillo} stopOpacity={0.8} />
        <stop offset="1" stopColor={C.blanco} stopOpacity={0} />
      </linearGradient>
    </defs>
    <path d={`M470 ${SUELO - 120} L470 ${y(9.4)} L570 ${y(10.2)} L670 ${y(9.4)} L670 ${SUELO - 120} Z`} fill="url(#corriente)" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <path key={i} d={`M535 ${1120 - i * 100} l35 -34 l35 34`} fill="none" stroke={C.tinta} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
    ))}
  </g>
);

/** Recorrido de la piedra: sube, se congela, baja, junta agua y vuelve a subir. */
const Recorrido: React.FC<{ piedra: (cx: number, cy: number, r: number, i: number) => React.ReactNode }> = ({ piedra }) => (
  <g>
    <path
      d={`M600 1000 C600 860 590 720 640 640 C700 560 820 600 800 700 C780 820 720 900 650 900 C600 900 600 820 610 760 C620 690 700 650 760 690`}
      fill="none" stroke={C.azul} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round"
    />
    {piedra(600, 1000, 12, 0)}
    {piedra(800, 700, 20, 1)}
    {piedra(650, 900, 26, 2)}
    {piedra(760, 690, 34, 3)}
  </g>
);

const PiedraVector = (cx: number, cy: number, r: number, i: number) => (
  <g key={i}>
    <circle cx={cx + 4} cy={cy + 4} r={r} fill={C.tinta} />
    <circle cx={cx} cy={cy} r={r} fill={T.hielo} stroke={C.tinta} strokeWidth={5} />
    <ellipse cx={cx - r * 0.3} cy={cy - r * 0.35} rx={r * 0.35} ry={r * 0.2} fill={C.blanco} />
  </g>
);

/** Lupa con el corte del granizo: capas como una cebolla. */
const Lupa: React.FC<{ cx: number; cy: number; desde: [number, number] }> = ({ cx, cy, desde }) => (
  <g>
    <line x1={desde[0]} y1={desde[1]} x2={cx - 60} y2={cy - 100} stroke={C.tinta} strokeWidth={5} />
    <circle cx={cx + 10} cy={cy + 10} r={125} fill={C.tinta} />
    <circle cx={cx} cy={cy} r={125} fill={C.blanco} stroke={C.tinta} strokeWidth={8} />
    {[95, 78, 62, 46, 30, 15].map((r, i) => (
      <circle key={r} cx={cx} cy={cy} r={r} fill={i % 2 ? T.hieloOscuro : T.hielo} stroke={C.tinta} strokeWidth={3} />
    ))}
  </g>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const SolVector: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
  <g>
    {Array.from({ length: 10 }).map((_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return <line key={i} x1={cx + Math.cos(a) * (r + 14)} y1={cy + Math.sin(a) * (r + 14)} x2={cx + Math.cos(a) * (r + 38)} y2={cy + Math.sin(a) * (r + 38)} stroke={C.tinta} strokeWidth={8} strokeLinecap="round" />;
    })}
    <circle cx={cx + 6} cy={cy + 6} r={r} fill={C.tinta} />
    <circle cx={cx} cy={cy} r={r} fill={C.amarillo} stroke={C.tinta} strokeWidth={7} />
    <circle cx={cx + 10} cy={cy + 10} r={r * 0.62} fill="#FFC93D" />
    <ellipse cx={cx - r * 0.35} cy={cy - r * 0.35} rx={r * 0.25} ry={r * 0.15} fill={C.blanco} opacity={0.8} />
  </g>
);

/** Textos del diagrama (comunes a B y C). */
const Rotulos: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 140, top: 1150, background: C.blanco, border: `4px solid ${C.tinta}`, borderRadius: 14, boxShadow: sombra(5), padding: "8px 16px" }}>
      <div style={{ fontFamily: display, fontWeight: 800, color: C.rojo, fontSize: 52, lineHeight: 1 }}>+100 km/h</div>
      <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 22, color: C.tinta, marginTop: 4 }}>aire caliente que sube</div>
    </div>
    <Pildora x={140} yy={y(4) - 60} texto="0 °C: acá se congela" color={C.blanco} fondo={C.azul} tam={22} />
    <Pildora x={800} yy={1000} texto="capas de hielo" tam={22} />
  </>
);

const Encabezado: React.FC<{ texto: string }> = ({ texto }) => (
  <>
    <Logo />
    <Etiqueta texto={texto} desde={-30} />
  </>
);

export const PrototipoB: React.FC = () => (
  <AbsoluteFill>
    <Fondo />
    <Encabezado texto="la corriente que sube" />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <Escala />
      <Cumulonimbo />
      <Corriente />
      <Recorrido piedra={PiedraVector} />
      <Lupa cx={890} cy={860} desde={[760, 690]} />
      <Ciudad />
      <Calor />
    </svg>
    <Rotulos />
  </AbsoluteFill>
);

export const PrototipoC: React.FC = () => (
  <AbsoluteFill>
    <Fondo />
    <Encabezado texto="la corriente que sube" />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <Escala />
      <Ciudad />
      <Calor />
      <Corriente />
    </svg>
    <Img src={staticFile("prototipos/cloud_3d.png")} style={{ position: "absolute", left: 170, top: 430, width: 720 }} />
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <Recorrido piedra={(cx, cy, r, i) => <g key={i} />} />
      <Lupa cx={890} cy={860} desde={[760, 690]} />
    </svg>
    {[[600, 1000, 30], [800, 700, 50], [650, 900, 64], [760, 690, 84]].map(([cx, cy, w], i) => (
      <Img key={i} src={staticFile("prototipos/ice_3d.png")} style={{ position: "absolute", left: cx - w / 2, top: cy - w / 2, width: w }} />
    ))}
    <Rotulos />
  </AbsoluteFill>
);

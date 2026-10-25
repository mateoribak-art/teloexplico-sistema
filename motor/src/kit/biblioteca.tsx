import React, { useId } from "react";
import { C } from "./marca";

// Biblioteca "premium" de objetos (dirección de arte: marca/DIRECCION_ARTE.md).
// Reglas comunes para que todo parezca dibujado por la misma mano:
// - contorno LINEA (8) en tinta, sombra dura SOMBRA_D (12) abajo a la derecha;
// - luz SIEMPRE desde arriba a la izquierda: degradé claro→oscuro en esa dirección + brillo blanco arriba a la izquierda;
// - colores: la paleta y sus tonos (claro/oscuro) + los materiales de MAT (derivados, no inventar otros);
// - sin caras, salvo la Persona.
// Cada objeto: <Objeto x y s t …/> con origen documentado y tamaño base ~300–450 px.

export const LINEA = 8;
export const SOMBRA_D = 12;

/** Mezcla dos colores hex (k = 0 → a, 1 → b). */
export const mezclar = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * k).toString(16).padStart(2, "0");
  return `#${m(r1, r2)}${m(g1, g2)}${m(b1, b2)}`;
};
export const claro = (c: string, k = 0.4) => mezclar(c, "#FFFFFF", k);
// las sombras van hacia un azul profundo (no gris): quedan más vivas
export const oscuro = (c: string, k = 0.28) => mezclar(c, "#1B1F4A", k);

/** Materiales derivados (piel, madera, metal, carne, vidrio…). */
export const MAT = {
  piel: "#F6C89F",
  pielSombra: "#E2A97C",
  pelo: "#5A3B26",
  madera: "#C98B4E",
  maderaVeta: "#9C6331",
  metal: "#C9D0E0",
  metalOscuro: "#7D879F",
  carneCruda: "#E2504A",
  carneCocida: "#94573A",
  grasa: "#FFF1D6",
  vidrio: "#DDF1FF",
  hojas: "#3FBF6A",
  goma: "#2A2D3A",
} as const;

/** id único y apto para url(#…) */
const useUid = () => useId().replace(/[^a-zA-Z0-9]/g, "");

/** Degradé en diagonal de luz (arriba-izq) a sombra (abajo-der). */
const Luz: React.FC<{ id: string; color: string; fuerza?: number }> = ({ id, color, fuerza = 1 }) => (
  <linearGradient id={id} x1="0.15" y1="0" x2="0.85" y2="1">
    <stop offset="0" stopColor={claro(color, 0.35 * fuerza)} />
    <stop offset="0.55" stopColor={color} />
    <stop offset="1" stopColor={oscuro(color, 0.22 * fuerza)} />
  </linearGradient>
);

/** Degradé horizontal de cilindro (metal, vidrio): bordes oscuros, brillo cerca de la izquierda. */
const Cilindro: React.FC<{ id: string; color: string }> = ({ id, color }) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stopColor={oscuro(color, 0.3)} />
    <stop offset="0.22" stopColor={claro(color, 0.55)} />
    <stop offset="0.32" stopColor={claro(color, 0.8)} />
    <stop offset="0.5" stopColor={color} />
    <stop offset="1" stopColor={oscuro(color, 0.4)} />
  </linearGradient>
);

const Pos: React.FC<{ x: number; y: number; s: number; children: React.ReactNode }> = ({ x, y, s, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>{children}</g>
);

/* ===================================================================================== */
/* NUBE · origen: centro de la base plana. Ancho base 360.                                */
/* ===================================================================================== */
export const Nube: React.FC<{ x: number; y: number; s?: number; t?: number; tormenta?: number }> = ({ x, y, s = 1, t = 0, tormenta = 0 }) => {
  const u = useUid();
  const flota = Math.sin(t / 22) * 4;
  // tres bultos de distinto tamaño sobre una base redondeada: silueta de cúmulo clásica
  const formas = (
    <>
      <rect x={-180} y={-96} width={360} height={96} rx={48} />
      <circle cx={-82} cy={-102} r={78} />
      <circle cx={30} cy={-148} r={104} />
      <circle cx={122} cy={-92} r={66} />
    </>
  );
  const alto = mezclar("#FFFFFF", "#C7CEDF", tormenta);
  const bajo = mezclar("#C9D2E8", "#6F7894", tormenta);
  return (
    <Pos x={x} y={y + flota} s={s}>
      <defs>
        <linearGradient id={`${u}g`} x1="0" y1="-250" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={alto} />
          <stop offset="0.6" stopColor={mezclar(alto, bajo, 0.35)} />
          <stop offset="1" stopColor={bajo} />
        </linearGradient>
        <clipPath id={`${u}c`}>{formas}</clipPath>
      </defs>
      <g fill={C.tinta} transform={`translate(${SOMBRA_D} ${SOMBRA_D})`}>{formas}</g>
      <g fill={C.tinta} stroke={C.tinta} strokeWidth={LINEA * 2}>{formas}</g>
      <g fill={`url(#${u}g)`}>{formas}</g>
      <g clipPath={`url(#${u}c)`}>
        {/* panza en sombra y reflejo de luz arriba */}
        <ellipse cx={10} cy={8} rx={210} ry={44} fill={oscuro(bajo, 0.12)} opacity={0.55} />
        <ellipse cx={-110} cy={-150} rx={50} ry={24} fill="#FFFFFF" opacity={0.9} />
        <ellipse cx={0} cy={-218} rx={44} ry={18} fill="#FFFFFF" opacity={0.85} />
      </g>
      {/* pliegues internos: dan volumen sin agregar cosas */}
      <g fill="none" stroke={oscuro(bajo, 0.15)} strokeWidth={6} strokeLinecap="round" opacity={0.6}>
        <path d="M-120 -40 q16 -30 52 -30" />
        <path d="M40 -96 q22 -26 58 -18" />
      </g>
    </Pos>
  );
};

/* ===================================================================================== */
/* SOL · origen: centro. Radio base 110.                                                   */
/* ===================================================================================== */
export const Sol: React.FC<{ x: number; y: number; s?: number; t?: number; fuerza?: number }> = ({ x, y, s = 1, t = 0, fuerza = 1 }) => {
  const u = useUid();
  const R = 110;
  const late = 1 + Math.sin(t / 10) * 0.03 * fuerza;
  return (
    <Pos x={x} y={y} s={s}>
      <defs>
        <radialGradient id={`${u}n`} cx="0.36" cy="0.34" r="0.75">
          <stop offset="0" stopColor="#FFF8C4" />
          <stop offset="0.45" stopColor={C.amarillo} />
          <stop offset="1" stopColor="#FFB52E" />
        </radialGradient>
      </defs>
      <circle r={R * 1.75 * late} fill={C.amarillo} opacity={0.18 * fuerza} />
      <circle r={R * 1.45 * late} fill={C.amarillo} opacity={0.22 * fuerza} />
      <g transform={`rotate(${t * 0.5})`}>
        {Array.from({ length: 12 }).map((_, i) => {
          const largo = i % 2 ? 42 : 66;
          const a = (i / 12) * 360;
          return (
            <g key={i} transform={`rotate(${a})`}>
              <path d={`M-22 ${-R - 8} Q-6 ${-R - 8 - largo * late * 0.7} 0 ${-R - 8 - largo * late} Q6 ${-R - 8 - largo * late * 0.7} 22 ${-R - 8} Z`}
                fill={i % 2 ? "#FFC93D" : C.amarillo} stroke={C.tinta} strokeWidth={7} strokeLinejoin="round" />
            </g>
          );
        })}
      </g>
      <circle cx={SOMBRA_D * 0.8} cy={SOMBRA_D * 0.8} r={R} fill={C.tinta} />
      <circle r={R} fill={`url(#${u}n)`} stroke={C.tinta} strokeWidth={LINEA} />
      <path d={`M${-R * 0.62} ${-R * 0.2} A${R * 0.66} ${R * 0.66} 0 0 1 ${-R * 0.2} ${-R * 0.62}`} fill="none" stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" opacity={0.9} />
    </Pos>
  );
};

/* ===================================================================================== */
/* HELADERA · origen: centro de la base. 220 × 440. `abierta` 0→1 abre la puerta de abajo. */
/* ===================================================================================== */
export const Heladera: React.FC<{ x: number; y: number; s?: number; abierta?: number; t?: number; color?: string; contenido?: React.ReactNode }> = ({
  x, y, s = 1, abierta = 0, t = 0, color = "#F4F7FF", contenido,
}) => {
  const u = useUid();
  const W = 220;
  const H = 440;
  const yF = -H + 130; // corte freezer / heladera
  const ang = abierta * 140 * (Math.PI / 180);
  const ancho = W * Math.cos(ang);
  const persp = 30 * Math.sin(ang);
  const xh = -W / 2;
  const caraInterna = ancho < 0;
  const puerta = `M${xh} ${yF + 10} L${xh + ancho} ${yF + 10 - persp} L${xh + ancho} ${-8 + persp} L${xh} ${-8} Z`;
  return (
    <Pos x={x} y={y} s={s}>
      <defs>
        <linearGradient id={`${u}f`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.7" stopColor={color} />
          <stop offset="1" stopColor={oscuro(color, 0.12)} />
        </linearGradient>
        <linearGradient id={`${u}i`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#CFE6FF" />
        </linearGradient>
        <Cilindro id={`${u}m`} color={MAT.metal} />
      </defs>
      {/* sombra + costado (vista 3/4: se ve el lateral derecho) */}
      <rect x={-W / 2 + SOMBRA_D} y={-H + SOMBRA_D} width={W + 30} height={H} rx={22} fill={C.tinta} />
      <path d={`M${W / 2 - 10} ${-H + 4} L${W / 2 + 28} ${-H + 22} L${W / 2 + 28} ${-18} L${W / 2 - 10} ${0} Z`} fill={oscuro(color, 0.3)} stroke={C.tinta} strokeWidth={LINEA} strokeLinejoin="round" />
      <rect x={-W / 2} y={-H} width={W} height={H} rx={22} fill={`url(#${u}f)`} stroke={C.tinta} strokeWidth={LINEA} />
      {/* interior (se ve cuando se abre) */}
      {abierta > 0 ? (
        <g>
          <rect x={-W / 2 + 14} y={yF + 14} width={W - 28} height={-yF - 30} rx={10} fill={`url(#${u}i)`} stroke={C.tinta} strokeWidth={5} />
          <ellipse cx={0} cy={yF + 30} rx={80} ry={16} fill="#FFFFFF" opacity={0.9 * abierta} />
          {[0.36, 0.66].map((k) => (
            <line key={k} x1={-W / 2 + 18} y1={yF + (-yF) * k} x2={W / 2 - 18} y2={yF + (-yF) * k} stroke={MAT.metalOscuro} strokeWidth={5} />
          ))}
          {contenido ?? (
            <g stroke={C.tinta} strokeWidth={4}>
              {/* botella, tupper, tomate y queso: se lee "heladera" de un vistazo */}
              <rect x={-80} y={yF + 30} width={26} height={70} rx={8} fill={C.verde} />
              <rect x={-74} y={yF + 18} width={14} height={16} rx={3} fill={C.tinta} />
              <rect x={-40} y={yF + 62} width={70} height={38} rx={8} fill={claro(C.azul, 0.3)} />
              <circle cx={60} cy={yF + 86} r={18} fill={C.rojo} />
              <path d={`M-70 ${yF + 190} l70 -30 l0 30 z`} fill={C.amarillo} />
              <rect x={20} y={yF + 150} width={60} height={40} rx={8} fill={claro(C.rojo, 0.3)} />
            </g>
          )}
        </g>
      ) : null}
      {/* freezer */}
      <rect x={-W / 2 + 6} y={-H + 6} width={W - 12} height={124} rx={18} fill="none" stroke={oscuro(color, 0.2)} strokeWidth={4} />
      <rect x={-W / 2 + 22} y={-H + 34} width={16} height={74} rx={8} fill={`url(#${u}m)`} stroke={C.tinta} strokeWidth={5} />
      {/* puerta de abajo (gira sobre la bisagra izquierda) */}
      <path d={puerta} fill={caraInterna ? "#E9EEF8" : `url(#${u}f)`} stroke={C.tinta} strokeWidth={LINEA} strokeLinejoin="round" />
      {!caraInterna ? (
        <rect x={xh + ancho * 0.1} y={yF + 40} width={Math.max(4, 16 * Math.cos(ang))} height={130} rx={8} fill={`url(#${u}m)`} stroke={C.tinta} strokeWidth={5} />
      ) : (
        <g stroke={C.tinta} strokeWidth={4}>
          {[0.3, 0.6].map((k) => (
            <line key={k} x1={xh} y1={yF + (-yF) * k} x2={xh + ancho} y2={yF + (-yF) * k + (k - 0.5) * persp * -0.6} />
          ))}
        </g>
      )}
      {/* brillo de la chapa */}
      {abierta === 0 ? <rect x={-W / 2 + 60} y={-H + 18} width={14} height={H - 40} rx={7} fill="#FFFFFF" opacity={0.75} /> : null}
      {/* patas */}
      <rect x={-W / 2 + 16} y={-4} width={26} height={14} rx={4} fill={C.tinta} />
      <rect x={W / 2 - 42} y={-4} width={26} height={14} rx={4} fill={C.tinta} />
      {/* luz de la heladera abierta */}
    </Pos>
  );
};

/* ===================================================================================== */
/* OLLA · origen: centro de la base. Ancho 300.                                            */
/* ===================================================================================== */
export const Olla: React.FC<{ x: number; y: number; s?: number; color?: string; tapa?: boolean; liquido?: string; t?: number }> = ({
  x, y, s = 1, color = C.rojo, tapa = false, liquido = "#F2B544", t = 0,
}) => {
  const u = useUid();
  const W = 300;
  const H = 200;
  const borbota = Math.sin(t / 4) * 3;
  return (
    <Pos x={x} y={y} s={s}>
      <defs>
        <Cilindro id={`${u}c`} color={color} />
        <Cilindro id={`${u}m`} color={MAT.metal} />
      </defs>
      {/* manijas */}
      {[-1, 1].map((d) => (
        <path key={d} d={`M${d * (W / 2 - 4)} ${-H + 40} q${d * 54} 0 ${d * 54} 32 q0 22 ${d * -54} 22`} fill="none" stroke={C.tinta} strokeWidth={26} strokeLinecap="round" />
      ))}
      {[-1, 1].map((d) => (
        <path key={`m${d}`} d={`M${d * (W / 2 - 4)} ${-H + 40} q${d * 54} 0 ${d * 54} 32 q0 22 ${d * -54} 22`} fill="none" stroke={MAT.metal} strokeWidth={12} strokeLinecap="round" />
      ))}
      {/* cuerpo */}
      <path d={`M${-W / 2 + SOMBRA_D} ${-H + SOMBRA_D} L${W / 2 + SOMBRA_D} ${-H + SOMBRA_D} L${W / 2 + SOMBRA_D} ${-30 + SOMBRA_D} Q${W / 2 + SOMBRA_D} ${SOMBRA_D} ${W / 2 - 30 + SOMBRA_D} ${SOMBRA_D} L${-W / 2 + 30 + SOMBRA_D} ${SOMBRA_D} Q${-W / 2 + SOMBRA_D} ${SOMBRA_D} ${-W / 2 + SOMBRA_D} ${-30 + SOMBRA_D} Z`} fill={C.tinta} />
      <path d={`M${-W / 2} ${-H} L${W / 2} ${-H} L${W / 2} -30 Q${W / 2} 0 ${W / 2 - 30} 0 L${-W / 2 + 30} 0 Q${-W / 2} 0 ${-W / 2} -30 Z`} fill={`url(#${u}c)`} stroke={C.tinta} strokeWidth={LINEA} strokeLinejoin="round" />
      {/* franja decorativa */}
      <rect x={-W / 2} y={-H + 46} width={W} height={14} fill={oscuro(color, 0.25)} opacity={0.6} />
      {/* boca */}
      <ellipse cx={0} cy={-H} rx={W / 2 + 10} ry={30} fill={claro(color, 0.2)} stroke={C.tinta} strokeWidth={LINEA} />
      {tapa ? (
        <g>
          <path d={`M${-W / 2 - 6} ${-H} Q0 ${-H - 90} ${W / 2 + 6} ${-H} Z`} fill={`url(#${u}m)`} stroke={C.tinta} strokeWidth={LINEA} strokeLinejoin="round" />
          <ellipse cx={0} cy={-H - 52} rx={30} ry={14} fill={C.tinta} />
          <path d={`M-70 ${-H - 30} q40 -34 90 -36`} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
        </g>
      ) : (
        <g>
          <ellipse cx={0} cy={-H + 4} rx={W / 2 - 8} ry={22} fill={oscuro(color, 0.45)} />
          <ellipse cx={0} cy={-H + 8 + borbota * 0.3} rx={W / 2 - 18} ry={17} fill={liquido} />
          {[-60, 10, 70].map((bx, i) => (
            <circle key={i} cx={bx} cy={-H + 6 + Math.sin(t / 3 + i) * 3} r={7 + ((t + i * 7) % 12) / 3} fill={claro(liquido, 0.5)} stroke={oscuro(liquido, 0.3)} strokeWidth={3} />
          ))}
        </g>
      )}
      <rect x={-W / 2 + 40} y={-H + 70} width={18} height={H - 100} rx={9} fill="#FFFFFF" opacity={0.55} />
    </Pos>
  );
};

/* ===================================================================================== */
/* SARTÉN · origen: centro del fondo. `children` va dentro (comida), en coordenadas locales. */
/* ===================================================================================== */
export const Sarten: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode }> = ({ x, y, s = 1, children }) => {
  const u = useUid();
  return (
    <Pos x={x} y={y} s={s}>
      <defs>
        <radialGradient id={`${u}f`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#4B5272" />
          <stop offset="1" stopColor="#23263A" />
        </radialGradient>
      </defs>
      {/* mango */}
      <path d="M150 -6 L360 -56" stroke={C.tinta} strokeWidth={44} strokeLinecap="round" />
      <path d="M150 -6 L360 -56" stroke={MAT.goma} strokeWidth={28} strokeLinecap="round" />
      <path d="M200 -24 L340 -58" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.35} />
      <circle cx={168} cy={-12} r={8} fill={MAT.metal} stroke={C.tinta} strokeWidth={3} />
      {/* cuerpo: costado + borde + fondo */}
      <ellipse cx={SOMBRA_D} cy={22 + SOMBRA_D} rx={178} ry={74} fill={C.tinta} />
      <ellipse cx={0} cy={22} rx={178} ry={74} fill={MAT.goma} stroke={C.tinta} strokeWidth={LINEA} />
      <ellipse cx={0} cy={0} rx={178} ry={70} fill={MAT.metalOscuro} stroke={C.tinta} strokeWidth={LINEA} />
      <ellipse cx={0} cy={6} rx={156} ry={56} fill={`url(#${u}f)`} />
      <path d="M-120 -30 q60 -26 130 -24" fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" opacity={0.35} />
      {children}
    </Pos>
  );
};

/* ===================================================================================== */
/* BIFE · origen: centro. ~300 × 190. `coccion` 0 (crudo) → 1 (hecho). `marcas` de parrilla. */
/* ===================================================================================== */
export const Bife: React.FC<{ x: number; y: number; s?: number; coccion?: number; marcas?: boolean; rot?: number }> = ({
  x, y, s = 1, coccion = 0, marcas = false, rot = 0,
}) => {
  const u = useUid();
  const carne = mezclar(MAT.carneCruda, MAT.carneCocida, coccion);
  const grasa = mezclar(MAT.grasa, "#E8C08A", coccion);
  const forma = "M-140 -10 C-150 -70 -80 -100 -10 -92 C60 -86 120 -96 148 -50 C170 -14 150 50 100 74 C50 98 -40 96 -100 72 C-140 56 -136 30 -140 -10 Z";
  const interior = "M-112 -6 C-118 -54 -66 -74 -8 -68 C52 -62 104 -70 124 -38 C140 -10 126 38 88 54 C46 72 -32 70 -82 52 C-112 40 -110 22 -112 -6 Z";
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <defs>
        <Luz id={`${u}c`} color={carne} fuerza={1.2} />
        <clipPath id={`${u}k`}><path d={interior} /></clipPath>
      </defs>
      <path d={forma} fill={C.tinta} transform={`translate(${SOMBRA_D} ${SOMBRA_D})`} />
      {/* la grasa es el borde; la carne va adentro */}
      <path d={forma} fill={grasa} stroke={C.tinta} strokeWidth={LINEA} strokeLinejoin="round" />
      <path d={interior} fill={`url(#${u}c)`} stroke={oscuro(carne, 0.25)} strokeWidth={4} />
      <g clipPath={`url(#${u}k)`}>
        {/* vetas de grasa (marmoleado) */}
        <g fill="none" stroke={claro(grasa, 0.2)} strokeWidth={5} strokeLinecap="round" opacity={0.85 - coccion * 0.4}>
          <path d="M-80 -30 q30 10 50 -6 q20 -14 46 4" />
          <path d="M-30 20 q24 -16 54 0 q22 12 50 -2" />
          <path d="M40 -50 q14 16 40 10" />
        </g>
        {marcas ? (
          <g stroke={oscuro(carne, 0.6)} strokeWidth={16} strokeLinecap="round" opacity={0.85}>
            {[-80, -20, 40, 100].map((mx) => <line key={mx} x1={mx - 40} y1={60} x2={mx + 30} y2={-80} />)}
          </g>
        ) : null}
        <ellipse cx={-50} cy={-46} rx={46} ry={14} fill="#FFFFFF" opacity={0.35} />
      </g>
    </g>
  );
};

/* ===================================================================================== */
/* PERSONA (busto) · origen: centro de la base del torso. Alto ~420.                      */
/* ===================================================================================== */
export type Gesto = "feliz" | "sorprendida" | "preocupada" | "canchera" | "pensando";
export const Persona: React.FC<{
  x: number; y: number; s?: number; t?: number; gesto?: Gesto; remera?: string; pelo?: "corto" | "largo" | "rulos"; mira?: number; senala?: boolean;
}> = ({ x, y, s = 1, t = 0, gesto = "feliz", remera = C.azul, pelo = "corto", mira = 0, senala = false }) => {
  const u = useUid();
  const parpadea = t % 84 < 3;
  const respira = Math.sin(t / 14) * 3;
  const cy = -300 + respira;
  const ojoY = cy + 4;
  const px = mira * 6;
  const cejas: Record<Gesto, [string, string]> = {
    feliz: ["M-56 -36 q20 -14 40 -4", "M16 -40 q20 -10 40 4"],
    sorprendida: ["M-56 -48 q20 -18 40 -8", "M16 -56 q20 -10 40 8"],
    preocupada: ["M-56 -30 l40 -14", "M16 -44 l40 14"],
    canchera: ["M-56 -36 q20 -8 40 -2", "M16 -50 q20 -14 40 6"],
    pensando: ["M-56 -34 q20 -6 40 0", "M16 -50 q20 -12 40 2"],
  };
  const bocas: Record<Gesto, React.ReactNode> = {
    feliz: <path d="M-30 40 q30 30 60 0 z" fill={C.tinta} />,
    sorprendida: <ellipse cx={0} cy={50} rx={16} ry={22} fill={C.tinta} />,
    preocupada: <path d="M-26 56 q26 -20 52 0" fill="none" stroke={C.tinta} strokeWidth={7} strokeLinecap="round" />,
    canchera: <path d="M-26 46 q34 16 56 -10" fill="none" stroke={C.tinta} strokeWidth={7} strokeLinecap="round" />,
    pensando: <path d="M-16 50 h30" fill="none" stroke={C.tinta} strokeWidth={7} strokeLinecap="round" />,
  };
  return (
    <Pos x={x} y={y} s={s}>
      <defs>
        <Luz id={`${u}r`} color={remera} />
        <radialGradient id={`${u}p`} cx="0.38" cy="0.35" r="0.75">
          <stop offset="0" stopColor={claro(MAT.piel, 0.3)} />
          <stop offset="0.7" stopColor={MAT.piel} />
          <stop offset="1" stopColor={MAT.pielSombra} />
        </radialGradient>
      </defs>
      {/* torso */}
      <path d="M-165 0 C-165 -110 -120 -168 0 -172 C120 -168 165 -110 165 0 Z" fill={C.tinta} transform={`translate(${SOMBRA_D} ${SOMBRA_D})`} />
      <path d="M-165 0 C-165 -110 -120 -168 0 -172 C120 -168 165 -110 165 0 Z" fill={`url(#${u}r)`} stroke={C.tinta} strokeWidth={LINEA} strokeLinejoin="round" />
      <path d="M-40 -172 Q0 -120 40 -172" fill={MAT.piel} stroke={C.tinta} strokeWidth={6} />
      <path d="M-112 -96 q-14 40 -10 96 M112 -96 q14 40 10 96" fill="none" stroke={oscuro(remera, 0.3)} strokeWidth={6} strokeLinecap="round" />
      {/* brazo que señala */}
      {senala ? (
        <g>
          <path d="M110 -120 Q190 -190 250 -250" stroke={C.tinta} strokeWidth={60} strokeLinecap="round" fill="none" />
          <path d="M110 -120 Q190 -190 250 -250" stroke={remera} strokeWidth={44} strokeLinecap="round" fill="none" />
          <circle cx={262} cy={-262} r={30} fill={MAT.piel} stroke={C.tinta} strokeWidth={6} />
          <path d="M276 -282 l30 -34" stroke={C.tinta} strokeWidth={22} strokeLinecap="round" />
          <path d="M276 -282 l30 -34" stroke={MAT.piel} strokeWidth={10} strokeLinecap="round" />
        </g>
      ) : null}
      {/* cuello */}
      <rect x={-26} y={cy + 80} width={52} height={60} fill={MAT.pielSombra} stroke={C.tinta} strokeWidth={6} />
      {/* pelo largo atrás */}
      {pelo === "largo" ? <path d={`M-104 ${cy - 10} Q-120 ${cy + 130} -70 ${cy + 150} L70 ${cy + 150} Q120 ${cy + 130} 104 ${cy - 10} Z`} fill={MAT.pelo} stroke={C.tinta} strokeWidth={6} /> : null}
      {/* cabeza */}
      <circle cx={SOMBRA_D * 0.7} cy={cy + SOMBRA_D * 0.7} r={100} fill={C.tinta} />
      <ellipse cx={-98} cy={cy + 10} rx={18} ry={26} fill={MAT.piel} stroke={C.tinta} strokeWidth={6} />
      <ellipse cx={98} cy={cy + 10} rx={18} ry={26} fill={MAT.piel} stroke={C.tinta} strokeWidth={6} />
      <circle cx={0} cy={cy} r={100} fill={`url(#${u}p)`} stroke={C.tinta} strokeWidth={LINEA} />
      {/* pelo arriba */}
      {pelo === "rulos" ? (
        <g fill={MAT.pelo} stroke={C.tinta} strokeWidth={6}>
          {[-80, -44, -8, 28, 64, 92].map((hx, i) => <circle key={hx} cx={hx} cy={cy - 74 + (i % 2) * 16} r={34} />)}
        </g>
      ) : (
        <path d={`M-102 ${cy - 6} Q-104 ${cy - 112} 0 ${cy - 108} Q100 ${cy - 108} 102 ${cy - 16} Q60 ${cy - 70} -20 ${cy - 58} Q-70 ${cy - 52} -102 ${cy - 6} Z`} fill={MAT.pelo} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
      )}
      <path d={`M-40 ${cy - 90} q30 -12 64 -6`} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.4} />
      {/* cara */}
      <g transform={`translate(0 ${cy})`}>
        <g stroke={C.tinta} strokeWidth={7} strokeLinecap="round" fill="none">
          <path d={cejas[gesto][0]} />
          <path d={cejas[gesto][1]} />
        </g>
        {parpadea ? (
          <g stroke={C.tinta} strokeWidth={7} strokeLinecap="round"><line x1={-50} y1={ojoY - cy} x2={-22} y2={ojoY - cy} /><line x1={22} y1={ojoY - cy} x2={50} y2={ojoY - cy} /></g>
        ) : (
          <g>
            {[-36, 36].map((ox) => (
              <g key={ox}>
                <ellipse cx={ox} cy={4} rx={18} ry={gesto === "sorprendida" ? 23 : 19} fill="#FFFFFF" stroke={C.tinta} strokeWidth={5} />
                <circle cx={ox + px + 2} cy={4} r={8} fill={C.tinta} />
                <circle cx={ox + px + 5} cy={0} r={3} fill="#FFFFFF" />
              </g>
            ))}
          </g>
        )}
        <path d="M-4 18 q8 14 -4 22" fill="none" stroke={MAT.pielSombra} strokeWidth={6} strokeLinecap="round" />
        {bocas[gesto]}
        <ellipse cx={-60} cy={36} rx={16} ry={9} fill={C.rojo} opacity={0.3} />
        <ellipse cx={60} cy={36} rx={16} ry={9} fill={C.rojo} opacity={0.3} />
      </g>
    </Pos>
  );
};

/* ===================================================================================== */
/* ANAFE (cocina) · origen: centro de la base. Ancho 420. `fuego` 0→1 por hornalla.        */
/* ===================================================================================== */
export const Anafe: React.FC<{ x: number; y: number; s?: number; t?: number; fuego?: [number, number] }> = ({ x, y, s = 1, t = 0, fuego = [1, 0] }) => {
  const u = useUid();
  const llama = (cx: number, f: number) =>
    f <= 0 ? null : (
      <g>
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2;
          const fx = cx + Math.cos(a) * 54;
          const fy = -132 + Math.sin(a) * 14;
          const h = (30 + Math.sin(t / 2 + i * 1.7) * 8) * f;
          return (
            <g key={i}>
              <path d={`M${fx - 9} ${fy} Q${fx} ${fy - h * 1.6} ${fx + 9} ${fy} Z`} fill="#4F7BFF" opacity={0.9} />
              <path d={`M${fx - 5} ${fy} Q${fx} ${fy - h} ${fx + 5} ${fy} Z`} fill={C.amarillo} />
            </g>
          );
        })}
      </g>
    );
  return (
    <Pos x={x} y={y} s={s}>
      <defs>
        <linearGradient id={`${u}t`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3F5FB" />
          <stop offset="1" stopColor={MAT.metal} />
        </linearGradient>
      </defs>
      {/* frente */}
      <rect x={-210 + SOMBRA_D} y={-110 + SOMBRA_D} width={420} height={110} rx={14} fill={C.tinta} />
      <rect x={-210} y={-110} width={420} height={110} rx={14} fill={claro(C.tinta, 0.82)} stroke={C.tinta} strokeWidth={LINEA} />
      {[-120, 0, 120].map((kx) => (
        <g key={kx}>
          <circle cx={kx} cy={-55} r={24} fill={MAT.goma} stroke={C.tinta} strokeWidth={5} />
          <rect x={kx - 4} y={-76} width={8} height={22} rx={4} fill={MAT.metal} />
        </g>
      ))}
      {/* tapa en perspectiva */}
      <path d="M-210 -110 L-170 -170 L170 -170 L210 -110 Z" fill={`url(#${u}t)`} stroke={C.tinta} strokeWidth={LINEA} strokeLinejoin="round" />
      {[-100, 100].map((hx, i) => (
        <g key={hx}>
          <ellipse cx={hx} cy={-138} rx={66} ry={18} fill={MAT.goma} stroke={C.tinta} strokeWidth={5} />
          <ellipse cx={hx} cy={-138} rx={40} ry={10} fill={MAT.metalOscuro} />
          {llama(hx, fuego[i])}
        </g>
      ))}
    </Pos>
  );
};

/* ===================================================================================== */
/* TERMÓMETRO · origen: centro de la base del bulbo. Alto 420. `valor` 0→1.               */
/* ===================================================================================== */
export const Termometro: React.FC<{ x: number; y: number; s?: number; valor?: number; color?: string }> = ({ x, y, s = 1, valor = 0.5, color = C.rojo }) => {
  const u = useUid();
  const top = -420;
  const nivel = -70 + (top + 50 + 70) * valor;
  return (
    <Pos x={x} y={y} s={s}>
      <defs><Cilindro id={`${u}v`} color={MAT.vidrio} /></defs>
      <rect x={-24 + SOMBRA_D} y={top + SOMBRA_D} width={48} height={-top - 40} rx={24} fill={C.tinta} />
      <circle cx={SOMBRA_D} cy={-44 + SOMBRA_D} r={48} fill={C.tinta} />
      <rect x={-24} y={top} width={48} height={-top - 40} rx={24} fill={`url(#${u}v)`} stroke={C.tinta} strokeWidth={LINEA} />
      <circle cx={0} cy={-44} r={48} fill={color} stroke={C.tinta} strokeWidth={LINEA} />
      <rect x={-10} y={nivel} width={20} height={-40 - nivel} rx={10} fill={color} />
      <circle cx={-14} cy={-58} r={12} fill="#FFFFFF" opacity={0.75} />
      {Array.from({ length: 7 }).map((_, i) => {
        const ty = -100 - i * 44;
        return <line key={i} x1={24} y1={ty} x2={i % 2 ? 40 : 52} y2={ty} stroke={C.tinta} strokeWidth={5} strokeLinecap="round" />;
      })}
      <rect x={-14} y={top + 20} width={8} height={240} rx={4} fill="#FFFFFF" opacity={0.8} />
    </Pos>
  );
};

/* ===================================================================================== */
/* VASO · origen: centro de la base. 170 × 240. `nivel` 0→1, `hielo` cubitos.              */
/* ===================================================================================== */
export const Vaso: React.FC<{ x: number; y: number; s?: number; nivel?: number; liquido?: string; hielo?: number; gotas?: boolean; t?: number }> = ({
  x, y, s = 1, nivel = 0.7, liquido = "#F2B544", hielo = 0, gotas = false, t = 0,
}) => {
  const u = useUid();
  const H = 240;
  const arriba = 85;
  const abajo = 64;
  const ancho = (yy: number) => abajo + (arriba - abajo) * (-yy / H);
  const yl = -H * nivel;
  const vaso = `M${-arriba} ${-H} L${arriba} ${-H} L${abajo} 0 L${-abajo} 0 Z`;
  return (
    <Pos x={x} y={y} s={s}>
      <defs>
        <Luz id={`${u}l`} color={liquido} />
        <clipPath id={`${u}c`}><path d={vaso} /></clipPath>
      </defs>
      <path d={vaso} fill={C.tinta} transform={`translate(${SOMBRA_D} ${SOMBRA_D})`} opacity={0.9} />
      <path d={vaso} fill={claro(MAT.vidrio, 0.4)} />
      <g clipPath={`url(#${u}c)`}>
        {nivel > 0 ? (
          <g>
            <rect x={-arriba} y={yl} width={arriba * 2} height={-yl} fill={`url(#${u}l)`} />
            <ellipse cx={0} cy={yl} rx={ancho(yl)} ry={12} fill={claro(liquido, 0.35)} stroke={oscuro(liquido, 0.2)} strokeWidth={3} />
          </g>
        ) : null}
        {Array.from({ length: hielo }).map((_, i) => {
          const cx = -30 + i * 32;
          const cy = yl + 10 + (i % 2) * 22 + Math.sin(t / 15 + i) * 3;
          return <rect key={i} x={cx - 24} y={cy - 24} width={48} height={48} rx={10} fill="#EAF7FF" stroke={C.tinta} strokeWidth={4} opacity={0.95} transform={`rotate(${12 + i * 17} ${cx} ${cy})`} />;
        })}
        <rect x={-arriba + 22} y={-H + 14} width={14} height={H - 30} rx={7} fill="#FFFFFF" opacity={0.75} transform="skewX(5)" />
      </g>
      <path d={vaso} fill="none" stroke={C.tinta} strokeWidth={LINEA} strokeLinejoin="round" />
      <ellipse cx={0} cy={-H} rx={arriba} ry={13} fill="none" stroke={C.tinta} strokeWidth={6} />
      {gotas ? (
        <g fill="#FFFFFF" stroke={C.tinta} strokeWidth={3}>
          {[[-50, -160], [40, -120], [-30, -70], [55, -60]].map(([gx, gy], i) => (
            <path key={i} d={`M${gx} ${gy - 12} q9 12 0 18 q-9 -6 0 -18 z`} />
          ))}
        </g>
      ) : null}
    </Pos>
  );
};

/* ===================================================================================== */
/* CIUDAD (barrio) · origen: suelo en y. Edificios con costado, terrazas, tanques y árboles. */
/* ===================================================================================== */
export type Edificio = { x: number; alto: number; ancho: number; color?: string; tanque?: boolean; antena?: boolean; balcones?: boolean };
const BARRIO: Edificio[] = [
  { x: 40, alto: 170, ancho: 110, color: "#FFE9B8", tanque: true },
  { x: 175, alto: 120, ancho: 90, color: "#DCE4FF" },
  { x: 290, alto: 240, ancho: 120, color: "#FFFFFF", balcones: true, antena: true },
  { x: 700, alto: 150, ancho: 110, color: "#FFD7CC", tanque: true },
  { x: 835, alto: 260, ancho: 120, color: "#E4F6E9", balcones: true },
  { x: 975, alto: 140, ancho: 100, color: "#DCE4FF", antena: true },
];
export const Barrio: React.FC<{ suelo: number; edificios?: Edificio[]; arboles?: number[]; t?: number }> = ({
  suelo, edificios = BARRIO, arboles = [460, 620], t = 0,
}) => (
  <g>
    {edificios.map((e, i) => {
      const c = e.color ?? "#FFFFFF";
      const top = suelo - e.alto;
      const prof = 22;
      return (
        <g key={i}>
          <rect x={e.x + SOMBRA_D} y={top + SOMBRA_D} width={e.ancho + prof} height={e.alto} fill={C.tinta} />
          {/* costado derecho */}
          <path d={`M${e.x + e.ancho} ${top} L${e.x + e.ancho + prof} ${top - 12} L${e.x + e.ancho + prof} ${suelo} L${e.x + e.ancho} ${suelo} Z`} fill={oscuro(c, 0.3)} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
          {/* terraza */}
          <path d={`M${e.x} ${top} L${e.x + prof} ${top - 12} L${e.x + e.ancho + prof} ${top - 12} L${e.x + e.ancho} ${top} Z`} fill={claro(c, 0.3)} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
          <rect x={e.x} y={top} width={e.ancho} height={e.alto} fill={c} stroke={C.tinta} strokeWidth={7} />
          {/* ventanas */}
          {Array.from({ length: Math.floor((e.alto - 30) / 48) }).map((_, f) => (
            <g key={f}>
              {Array.from({ length: Math.max(2, Math.floor(e.ancho / 42)) }).map((__, k, arr) => {
                const vw = 22;
                const gap = (e.ancho - arr.length * vw) / (arr.length + 1);
                const vx = e.x + gap + k * (vw + gap);
                const vy = top + 20 + f * 48;
                const prendida = (i * 7 + f * 3 + k * 5 + Math.floor(t / 50)) % 5 === 0;
                return (
                  <g key={k}>
                    <rect x={vx} y={vy} width={vw} height={28} fill={prendida ? C.amarillo : "#B9DDF6"} stroke={C.tinta} strokeWidth={4} />
                    <line x1={vx + 3} y1={vy + 22} x2={vx + 12} y2={vy + 6} stroke="#FFFFFF" strokeWidth={3} opacity={0.8} />
                    {e.balcones && k === 0 ? <rect x={e.x - 6} y={vy + 30} width={e.ancho + 12} height={7} fill={C.tinta} /> : null}
                  </g>
                );
              })}
            </g>
          ))}
          {e.tanque ? (
            <g>
              <line x1={e.x + 24} y1={top - 6} x2={e.x + 24} y2={top - 28} stroke={C.tinta} strokeWidth={5} />
              <line x1={e.x + 54} y1={top - 6} x2={e.x + 54} y2={top - 28} stroke={C.tinta} strokeWidth={5} />
              <rect x={e.x + 16} y={top - 64} width={46} height={38} rx={8} fill={C.azul} stroke={C.tinta} strokeWidth={5} />
            </g>
          ) : null}
          {e.antena ? <path d={`M${e.x + e.ancho - 30} ${top - 10} v-50 M${e.x + e.ancho - 46} ${top - 50} h32`} stroke={C.tinta} strokeWidth={5} strokeLinecap="round" /> : null}
        </g>
      );
    })}
    {arboles.map((ax, i) => (
      <g key={`a${i}`}>
        <rect x={ax - 9} y={suelo - 70} width={18} height={70} fill={MAT.madera} stroke={C.tinta} strokeWidth={5} />
        <circle cx={ax + 8} cy={suelo - 108 + 8} r={50} fill={C.tinta} />
        <circle cx={ax} cy={suelo - 108} r={50} fill={MAT.hojas} stroke={C.tinta} strokeWidth={6} />
        <circle cx={ax + 14} cy={suelo - 96} r={30} fill={oscuro(MAT.hojas, 0.2)} />
        <circle cx={ax - 18} cy={suelo - 126} r={14} fill={claro(MAT.hojas, 0.4)} />
      </g>
    ))}
  </g>
);

/* ===================================================================================== */
/* AUTO · origen: centro entre las ruedas, sobre el piso. Largo 380.                      */
/* ===================================================================================== */
export const Auto: React.FC<{ x: number; y: number; s?: number; color?: string; t?: number; anda?: boolean }> = ({ x, y, s = 1, color = C.rojo, t = 0, anda = false }) => {
  const u = useUid();
  const giro = anda ? t * 12 : 0;
  const rebote = anda ? Math.abs(Math.sin(t / 3)) * 3 : 0;
  const carro = "M-190 -40 Q-192 -92 -150 -96 L-96 -100 L-50 -158 Q-36 -170 -10 -170 L80 -170 Q108 -170 124 -150 L160 -104 Q194 -98 196 -60 L196 -40 Q196 -24 180 -24 L-176 -24 Q-190 -24 -190 -40 Z";
  const rueda = (rx: number) => (
    <g key={rx} transform={`translate(${rx} -22)`}>
      <circle r={44} fill={MAT.goma} stroke={C.tinta} strokeWidth={LINEA} />
      <circle r={24} fill={MAT.metal} stroke={C.tinta} strokeWidth={5} />
      <g transform={`rotate(${giro})`} stroke={MAT.metalOscuro} strokeWidth={5}>
        <line x1={-20} y1={0} x2={20} y2={0} />
        <line x1={0} y1={-20} x2={0} y2={20} />
      </g>
      <circle r={7} fill={C.tinta} />
    </g>
  );
  return (
    <Pos x={x} y={y} s={s}>
      <defs><Luz id={`${u}c`} color={color} /></defs>
      <ellipse cx={0} cy={6} rx={200} ry={14} fill={C.tinta} opacity={0.25} />
      <g transform={`translate(0 ${-rebote})`}>
        <path d={carro} fill={C.tinta} transform={`translate(${SOMBRA_D} ${SOMBRA_D * 0.6})`} />
        <path d={carro} fill={`url(#${u}c)`} stroke={C.tinta} strokeWidth={LINEA} strokeLinejoin="round" />
        {/* ventanillas */}
        <path d="M-80 -104 L-44 -150 Q-34 -158 -16 -158 L20 -158 L20 -104 Z" fill="#B9DDF6" stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
        <path d="M34 -158 L78 -158 Q98 -158 110 -142 L140 -104 L34 -104 Z" fill="#B9DDF6" stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
        <path d="M-60 -110 L-30 -150 M-40 -110 L-12 -148" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.85} />
        <line x1={27} y1={-104} x2={27} y2={-30} stroke={oscuro(color, 0.35)} strokeWidth={5} />
        <rect x={40} y={-90} width={26} height={8} rx={4} fill={oscuro(color, 0.4)} />
        <path d="M-180 -78 q60 -10 340 -6" fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.45} />
        {/* faros */}
        <path d="M184 -76 q12 4 10 18 l-18 0 z" fill={C.amarillo} stroke={C.tinta} strokeWidth={5} />
        <rect x={-192} y={-74} width={16} height={18} rx={4} fill={C.rojo} stroke={C.tinta} strokeWidth={5} />
      </g>
      {rueda(-112)}
      {rueda(120)}
    </Pos>
  );
};

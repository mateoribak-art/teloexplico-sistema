import React, { useId } from "react";
import { C } from "./marca";
import { LINEA, SOMBRA_D, claro, oscuro } from "./biblioteca";

// Mapa estilizado de Sudamérica (no es cartografía exacta: es un dibujo reconocible).
// Origen: esquina superior izquierda de una caja de 440 × 640. Países resaltables: Brasil y Argentina.
const CONTINENTE =
  "M120 30 L190 14 L260 26 L310 46 L360 80 L400 120 L438 180 L440 236 L410 262 L372 300 L350 346 L314 380 L280 410 L250 448 L236 470 L222 500 L210 540 L196 580 L178 616 L160 636 L146 628 L142 596 L140 548 L136 500 L128 448 L120 396 L104 340 L80 290 L50 240 L30 196 L36 150 L60 108 L88 64 Z";
const BRASIL =
  "M180 100 L260 40 L310 50 L360 84 L400 124 L436 182 L438 234 L408 260 L372 298 L348 344 L316 376 L284 360 L270 320 L250 290 L222 260 L200 220 L176 180 L170 140 Z";
const ARGENTINA =
  "M150 420 L200 410 L246 446 L234 470 L220 500 L208 540 L194 580 L176 616 L160 634 L148 626 L144 596 L142 548 L140 500 L136 452 Z";

export const PINES = { brasil: [330, 196], argentina: [192, 500] } as const;

export const MapaSudamerica: React.FC<{
  x: number; y: number; s?: number; brasil?: string; argentina?: string; children?: React.ReactNode;
}> = ({ x, y, s = 1, brasil, argentina, children }) => {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <linearGradient id={`${u}m`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={claro(C.verde, 0.45)} />
          <stop offset="1" stopColor={oscuro(C.verde, 0.15)} />
        </linearGradient>
      </defs>
      <path d={CONTINENTE} fill={C.tinta} transform={`translate(${SOMBRA_D} ${SOMBRA_D})`} />
      <path d={CONTINENTE} fill={`url(#${u}m)`} stroke={C.tinta} strokeWidth={LINEA} strokeLinejoin="round" />
      {brasil ? <path d={BRASIL} fill={brasil} stroke={C.tinta} strokeWidth={5} strokeLinejoin="round" opacity={0.95} /> : null}
      {argentina ? <path d={ARGENTINA} fill={argentina} stroke={C.tinta} strokeWidth={5} strokeLinejoin="round" opacity={0.95} /> : null}
      <path d="M64 120 C90 92 120 70 150 60" fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
      {children}
    </g>
  );
};

/** Pin de mapa (gota con punto). */
export const Pin: React.FC<{ x: number; y: number; color: string; s?: number }> = ({ x, y, color, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0 C-20 -26 -30 -40 -30 -56 A30 30 0 0 1 30 -56 C30 -40 20 -26 0 0 Z" fill={C.tinta} transform="translate(5 5)" />
    <path d="M0 0 C-20 -26 -30 -40 -30 -56 A30 30 0 0 1 30 -56 C30 -40 20 -26 0 0 Z" fill={color} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={0} cy={-56} r={11} fill={C.blanco} stroke={C.tinta} strokeWidth={4} />
  </g>
);

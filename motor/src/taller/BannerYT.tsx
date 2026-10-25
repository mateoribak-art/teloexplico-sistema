import React from "react";
import { AbsoluteFill } from "remotion";
import { C, display, mono, sombra } from "../kit/marca";
import { Burbuja } from "../kit/piezas";
import { Heladera, Nube, Sol, Termometro, Vaso, Bife } from "../kit/biblioteca";

// Banner del canal de YouTube (@teloexplicoar): 2560 × 1440.
// Zona segura (se ve en todos lados): 1546 × 423 al centro → x 507–2053, y 508–931.
// Computadora: franja y 508–931 a todo el ancho. Tele: todo.
const Z = { x0: 507, x1: 2053, y0: 508, y1: 931 };

const SelloB: React.FC<{ texto: string; x: number; y: number; rot: number; color: string; tinta?: string }> = ({ texto, x, y, rot, color, tinta = C.blanco }) => (
  <div style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg`, background: color, color: tinta, fontFamily: display, fontWeight: 800,
    fontSize: 54, letterSpacing: 2, padding: "6px 26px", border: `6px solid ${C.tinta}`, borderRadius: 18, boxShadow: sombra(8) }}>
    {texto}
  </div>
);

export const BannerYT: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.papel, backgroundImage: `linear-gradient(${C.cuadricula} 3px, transparent 3px), linear-gradient(90deg, ${C.cuadricula} 3px, transparent 3px)`, backgroundSize: "80px 80px" }}>
    {/* objetos: los de los costados de la franja se ven en compu; los de arriba/abajo solo en la tele */}
    <svg width={2560} height={1440} style={{ position: "absolute", inset: 0 }}>
      <Sol x={250} y={640} s={0.95} t={6} />
      <Nube x={330} y={930} s={0.75} t={0} />
      <Termometro x={2140} y={900} s={0.82} valor={0.72} />
      <Heladera x={2370} y={905} s={0.85} abierta={0.75} t={10} />
      {/* solo tele */}
      <Nube x={900} y={330} s={0.8} />
      <Nube x={1850} y={300} s={0.6} tormenta={0.5} />
      <Vaso x={760} y={1300} s={0.9} hielo={2} gotas />
      <Bife x={1800} y={1200} s={0.9} coccion={0.7} marcas rot={-8} />
    </svg>

    {/* zona segura */}
    <div style={{ position: "absolute", left: Z.x0, top: Z.y0, width: Z.x1 - Z.x0, height: Z.y1 - Z.y0, display: "flex", alignItems: "center", justifyContent: "center", gap: 46 }}>
      <svg width={250} height={244} viewBox="150 220 810 790">
        <path transform="translate(36 36)" d="M250 230h580a90 90 0 0 1 90 90v330a90 90 0 0 1-90 90H520l-190 150v-150h-80a90 90 0 0 1-90-90V320a90 90 0 0 1 90-90z" fill="#111" />
        <path d="M250 230h580a90 90 0 0 1 90 90v330a90 90 0 0 1-90 90H520l-190 150v-150h-80a90 90 0 0 1-90-90V320a90 90 0 0 1 90-90z" fill={C.azul} stroke="#111" strokeWidth={26} strokeLinejoin="round" />
        <circle cx={430} cy={440} r={72} fill="#fff" stroke="#111" strokeWidth={20} />
        <circle cx={650} cy={440} r={72} fill="#fff" stroke="#111" strokeWidth={20} />
        <circle cx={448} cy={452} r={30} fill="#111" />
        <circle cx={668} cy={452} r={30} fill="#111" />
        <path d="M590 335 q60 -40 120 -8" fill="none" stroke="#111" strokeWidth={20} strokeLinecap="round" />
        <path d="M440 590 q120 70 210 -20" fill="none" stroke="#111" strokeWidth={22} strokeLinecap="round" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }}>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 150, lineHeight: 0.95, letterSpacing: -5, color: C.tinta, whiteSpace: "nowrap" }}>
          te lo <span style={{ background: `linear-gradient(transparent 52%, ${C.amarillo} 52%, ${C.amarillo} 92%, transparent 92%)`, padding: "0 10px" }}>explico</span>
        </div>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 50, color: C.tinta, whiteSpace: "nowrap" }}>Lo que todos creen… y no es así.</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 30, color: C.blanco, background: C.azul, border: `5px solid ${C.tinta}`, borderRadius: 40, padding: "8px 24px", boxShadow: sombra(6), whiteSpace: "nowrap" }}>
            // un mito argentino por día
          </div>
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 30, color: C.tinta, background: C.blanco, border: `5px solid ${C.tinta}`, borderRadius: 40, padding: "8px 22px", boxShadow: sombra(6), display: "flex", gap: 10, alignItems: "center", whiteSpace: "nowrap" }}>
            <Burbuja tam={30} /> shorts todos los días
          </div>
        </div>
      </div>
    </div>
    <SelloB texto="MITO" x={1200} y={330} rot={-8} color={C.rojo} />
    <SelloB texto="DATO" x={1160} y={1060} rot={6} color={C.verde} tinta={C.tinta} />
  </AbsoluteFill>
);

/** Guía: misma imagen con las zonas marcadas (para revisar, no se sube). */
export const BannerYTGuia: React.FC = () => (
  <AbsoluteFill>
    <BannerYT />
    <div style={{ position: "absolute", left: 0, top: Z.y0, width: 2560, height: Z.y1 - Z.y0, border: "6px dashed #2E4BFF" }} />
    <div style={{ position: "absolute", left: Z.x0, top: Z.y0, width: Z.x1 - Z.x0, height: Z.y1 - Z.y0, border: "8px solid #FF4D2E" }} />
  </AbsoluteFill>
);

import React from "react";
import { AbsoluteFill } from "remotion";
import { C, display, sombra } from "./marca";
import { Burbuja, Fondo } from "./piezas";
import { useCapitulo } from "./series";

// Portada del reel para la grilla. Instagram la muestra recortada a 3:4 (franja central de 1080×1440,
// de y=240 a y=1680): todo lo importante va ahí, en pocas palabras y grande.
// Desde el 26/10 la grilla tiene que verse pareja: la franja de arriba es igual en todas (marca + número de la serie)
// y los textos se achican solos según el largo, así ninguna portada pesa más que otra ni se corta en el borde.
export type PortadaProps = {
  arriba: string;       // la pregunta / el mito, chico
  grande: string;       // la respuesta, enorme y resaltada (2–3 palabras)
  sello?: string;       // "MITO", "DATO", etc.
  colorSello?: string;
  numero?: number;      // ya no se muestra (27/10): la franja lleva la serie y el capítulo de series.json
  children?: React.ReactNode; // dibujo (svg 1080×1920)
};

const tamArriba = (t: string) => (t.length <= 26 ? 96 : t.length <= 44 ? 84 : t.length <= 64 ? 74 : 64);
const tamGrande = (t: string) => (t.length <= 3 ? 170 : t.length <= 6 ? 160 : t.length <= 10 ? 140 : t.length <= 14 ? 124 : 104);

export const Portada: React.FC<PortadaProps> = ({ arriba, grande, sello, colorSello = C.rojo, children }) => {
  const cap = useCapitulo();
  return (
  <AbsoluteFill style={{ backgroundColor: C.papel }}>
    <Fondo />
    {children}
    {/* franja fija: igual en todas las portadas, es lo que hace que la grilla se lea como una serie */}
    <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 16, background: C.tinta, color: C.blanco, fontFamily: display,
          fontWeight: 800, fontSize: 46, padding: "12px 34px", borderRadius: 999, boxShadow: sombra(7),
        }}
      >
        te lo explico <Burbuja tam={42} />
        {cap ? <span style={{ color: C.amarillo, fontSize: 40 }}>{cap.nombre.toLowerCase()} #{cap.n}</span> : null}
      </div>
    </div>
    <div style={{ position: "absolute", top: 352, left: 70, right: 70, textAlign: "center", fontFamily: display, color: C.tinta }}>
      <div style={{ fontWeight: 800, fontSize: tamArriba(arriba), lineHeight: 1.04, marginBottom: 22 }}>{arriba}</div>
      <div style={{ fontWeight: 800, fontSize: tamGrande(grande), lineHeight: 0.95, letterSpacing: -5, rotate: "-3deg", whiteSpace: "nowrap" }}>
        <span style={{ background: `linear-gradient(transparent 50%, ${C.amarillo} 50%, ${C.amarillo} 94%, transparent 94%)`, padding: "0 14px" }}>
          {grande}
        </span>
      </div>
    </div>
    {sello ? (
      <div
        style={{
          position: "absolute", top: 1440, left: 90, rotate: "-8deg", background: colorSello, color: C.blanco,
          fontFamily: display, fontWeight: 800, fontSize: 84, padding: "8px 34px", border: `6px solid ${C.tinta}`,
          borderRadius: 22, boxShadow: sombra(9), letterSpacing: 3,
        }}
      >
        {sello}
      </div>
    ) : null}
  </AbsoluteFill>
  );
};

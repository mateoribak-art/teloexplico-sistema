import React from "react";
import { AbsoluteFill } from "remotion";
import { C, display, sombra } from "./marca";
import { Burbuja, Fondo } from "./piezas";

// Portada del reel para la grilla. Instagram la muestra recortada a 3:4 (franja central de 1080×1440,
// de y=240 a y=1680): todo lo importante va ahí, en pocas palabras y grande.
export type PortadaProps = {
  arriba: string;       // la pregunta / el mito, chico
  grande: string;       // la respuesta, enorme y resaltada (2–3 palabras)
  sello?: string;       // "MITO", "POSTA", etc.
  colorSello?: string;
  numero?: number;      // número de dato, ayuda a ver la serie en la grilla
  children?: React.ReactNode; // dibujo (svg 1080×1920)
};

export const Portada: React.FC<PortadaProps> = ({ arriba, grande, sello, colorSello = C.rojo, numero, children }) => (
  <AbsoluteFill style={{ backgroundColor: C.papel }}>
    <Fondo />
    {children}
    <div style={{ position: "absolute", top: 300, left: 60, right: 60, textAlign: "center", fontFamily: display, color: C.tinta }}>
      <div style={{ fontWeight: 800, fontSize: 84, lineHeight: 1.02, marginBottom: 26 }}>{arriba}</div>
      <div style={{ fontWeight: 800, fontSize: 160, lineHeight: 0.95, letterSpacing: -6, rotate: "-3deg", whiteSpace: "nowrap" }}>
        <span style={{ background: `linear-gradient(transparent 50%, ${C.amarillo} 50%, ${C.amarillo} 94%, transparent 94%)`, padding: "0 14px" }}>
          {grande}
        </span>
      </div>
    </div>
    {sello ? (
      <div
        style={{
          position: "absolute", top: 1420, left: 90, rotate: "-8deg", background: colorSello, color: C.blanco,
          fontFamily: display, fontWeight: 800, fontSize: 84, padding: "8px 34px", border: `6px solid ${C.tinta}`,
          borderRadius: 22, boxShadow: sombra(9), letterSpacing: 3,
        }}
      >
        {sello}
      </div>
    ) : null}
    <div
      style={{
        position: "absolute", top: 1450, right: 80, display: "flex", alignItems: "center", gap: 10, fontFamily: display,
        fontWeight: 800, fontSize: 44, color: C.tinta,
      }}
    >
      {numero !== undefined ? `#${String(numero).padStart(3, "0")}` : null} <Burbuja tam={44} />
    </div>
  </AbsoluteFill>
);

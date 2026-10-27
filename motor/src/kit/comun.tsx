import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTO, ANCHO, C, display, sombra } from "./marca";
import { useCapitulo } from "./series";
import { resorte } from "./anim";
import { Burbuja } from "./piezas";
import type { Tiempos } from "./tiempos";

/** SVG a pantalla completa (1080×1920) para los dibujos de una escena. */
export const Lienzo: React.FC<{ children: React.ReactNode; opacidad?: number }> = ({ children, opacidad = 1 }) => (
  <svg width={ANCHO} height={ALTO} viewBox={`0 0 ${ANCHO} ${ALTO}`} style={{ position: "absolute", inset: 0, opacity: opacidad }}>
    {children}
  </svg>
);

/** Título que aparece palabra por palabra, al ritmo de la voz (para el gancho). */
export const TituloHablado: React.FC<{ tiempos: Tiempos; frase: number; desde: number; top?: number; tam?: number }> = ({
  tiempos, frase, desde, top = 400, tam = 74,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, textAlign: "center", fontFamily: display, fontWeight: 800, fontSize: tam, lineHeight: 1.05, color: C.tinta }}>
      {tiempos.frases[frase].palabras.map((p, i) => {
        const aparece = Math.round(p.inicio * fps) - desde;
        if (frame < aparece) return null;
        return (
          <span key={i} style={{ display: "inline-block", marginRight: "0.25em", scale: interpolate(resorte(frame, fps, aparece, 420), [0, 1], [0.4, 1]) }}>
            {p.texto.toLowerCase()}
          </span>
        );
      })}
    </div>
  );
};

/** Final: el logo cae como sello un instante y el video vuelve a empezar (loop). */
export const SelloFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = resorte(frame, fps, 0, 320);
  const cap = useCapitulo();
  return (
    <AbsoluteFill style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", background: `rgba(255,246,229,${Math.min(0.85, frame / 4)})` }}>
      <div
        style={{
          scale: interpolate(r, [0, 1], [2.2, 1]), rotate: "-4deg", display: "flex", alignItems: "center", gap: 14,
          background: C.blanco, border: `6px solid ${C.tinta}`, borderRadius: 26, boxShadow: sombra(10), padding: "18px 34px",
          fontFamily: display, fontWeight: 800, fontSize: 84, color: C.tinta, letterSpacing: -2,
        }}
      >
        te lo explico <Burbuja tam={70} />
      </div>
      {/* 26/10: 80 mil vistas y 132 seguidores: el cierre invita a seguir; desde el 27/10 nombra la serie y el capítulo que viene */}
      <div
        style={{
          marginTop: 34, opacity: interpolate(frame, [6, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          background: C.tinta, color: C.amarillo, fontFamily: display, fontWeight: 800, fontSize: 50, padding: "10px 30px",
          borderRadius: 999, rotate: "2deg",
        }}
      >
        {cap ? `seguí @teloexplico.ar para el #${cap.n + 1}` : "seguí @teloexplico.ar · un dato por día"}
      </div>
      {cap ? (
        <div
          style={{
            marginTop: 22, opacity: interpolate(frame, [3, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            background: C.amarillo, color: C.tinta, border: `5px solid ${C.tinta}`, boxShadow: sombra(7), fontFamily: display,
            fontWeight: 800, fontSize: 46, padding: "6px 26px", borderRadius: 16, rotate: "-2deg",
          }}
        >
          {cap.nombre.toLowerCase()} #{cap.n}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Dura lo que dura el sello final. */
export const DUR_SELLO_FINAL = 42;

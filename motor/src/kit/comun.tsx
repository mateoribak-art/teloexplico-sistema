import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTO, ANCHO, C, display, sombra } from "./marca";
import { useCapitulo } from "./series";
import { seguirLema, seguirPara, useCuenta } from "./cuenta";
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

/** Avioncito de "compartir" de Instagram. */
const Avion: React.FC<{ tam: number }> = ({ tam }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={C.tinta} strokeWidth={2.4} strokeLinejoin="round">
    <path d="M22 3 9.2 10.1M22 3l-7 18-5.8-10.9L2 7.5z" />
  </svg>
);

/** Final: el logo cae como sello un instante y el video vuelve a empezar (loop).
 *  `mandar` (27/10, referentes): repite en pantalla el "Mandáselo a ese que…" del guion, con un toque al avioncito de compartir. */
export const SelloFinal: React.FC<{ mandar?: string }> = ({ mandar }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = resorte(frame, fps, 0, 320);
  const cap = useCapitulo();
  const cuenta = useCuenta();
  if (mandar) {
    const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
    const aparece = interpolate(frame, [3, 9], [0, 1], clamp);
    // toque: el avioncito se hunde y suelta una onda
    const toque = frame - 12;
    const hundido = interpolate(toque, [0, 3, 8], [1, 0.82, 1], clamp);
    const onda = interpolate(toque, [0, 16], [0, 1], clamp);
    const [primera, ...resto] = mandar.split(" ");
    return (
      <AbsoluteFill style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", background: `rgba(255,246,229,${Math.min(1, frame / 4)})` }}>
        <div
          style={{
            scale: interpolate(r, [0, 1], [2.2, 1]), rotate: "-4deg", display: "flex", alignItems: "center", gap: 12,
            background: C.blanco, border: `6px solid ${C.tinta}`, borderRadius: 24, boxShadow: sombra(9), padding: "12px 28px",
            fontFamily: display, fontWeight: 800, fontSize: 64, color: C.tinta, letterSpacing: -2,
          }}
        >
          {cuenta.nombre} <Burbuja tam={54} />
        </div>
        <div style={{ position: "relative", width: 140, height: 140, marginTop: 56, opacity: aparece }}>
          {toque >= 0 && onda < 1 && (
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `6px solid ${C.tinta}`, opacity: 1 - onda, transform: `scale(${1 + onda * 0.9})` }} />
          )}
          <div
            style={{
              position: "absolute", inset: 0, borderRadius: "50%", background: cuenta.resaltado, border: `6px solid ${C.tinta}`, boxShadow: sombra(7),
              display: "flex", justifyContent: "center", alignItems: "center", transform: `scale(${hundido})`,
            }}
          >
            <Avion tam={70} />
          </div>
        </div>
        <div
          style={{
            marginTop: 34, maxWidth: 920, textAlign: "center", opacity: aparece, fontFamily: display, fontWeight: 800,
            fontSize: 64, lineHeight: 1.1, letterSpacing: -1.5, color: C.tinta,
          }}
        >
          <span style={{ background: cuenta.resaltado, padding: "0 10px", borderRadius: 10 }}>{primera}</span> {resto.join(" ")}
        </div>
        <div style={{ marginTop: 30, maxWidth: 900, textAlign: "center", opacity: aparece, fontFamily: display, fontWeight: 800, fontSize: 34, color: C.tinta }}>
          {cap ? <>{cap.nombre.toLowerCase()} #{cap.n}<br />{seguirPara(cuenta, "")}{cap.n + 1}</> : seguirLema(cuenta)}
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", background: `rgba(255,246,229,${Math.min(0.85, frame / 4)})` }}>
      <div
        style={{
          scale: interpolate(r, [0, 1], [2.2, 1]), rotate: "-4deg", display: "flex", alignItems: "center", gap: 14,
          background: C.blanco, border: `6px solid ${C.tinta}`, borderRadius: 26, boxShadow: sombra(10), padding: "18px 34px",
          fontFamily: display, fontWeight: 800, fontSize: 84, color: C.tinta, letterSpacing: -2,
        }}
      >
        {cuenta.nombre} <Burbuja tam={70} />
      </div>
      {/* 26/10: 80 mil vistas y 132 seguidores: el cierre invita a seguir; desde el 27/10 nombra la serie y el capítulo que viene */}
      <div
        style={{
          marginTop: 34, opacity: interpolate(frame, [6, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          background: C.tinta, color: cuenta.resaltado, fontFamily: display, fontWeight: 800, fontSize: 50, padding: "10px 30px",
          borderRadius: 999, rotate: "2deg",
        }}
      >
        {cap ? seguirPara(cuenta, cap.n + 1) : seguirLema(cuenta)}
      </div>
      {cap ? (
        <div
          style={{
            marginTop: 22, opacity: interpolate(frame, [3, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            background: cuenta.resaltado, color: C.tinta, border: `5px solid ${C.tinta}`, boxShadow: sombra(7), fontFamily: display,
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

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { display, mono } from "../kit/marca";
import type { Tiempos } from "../kit/tiempos";

// Textos del estilo 3D: subtítulo limpio de 1 a 3 palabras con UNA palabra en color,
// barra de progreso arriba y la firma chiquita de la cuenta.

export const ACENTO = "#FFC53D";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ ]/g, "");

type Trozo = { palabras: string[]; inicio: number; fin: number };

/** Junta palabras dichas en una sola escrita ("mil novecientos cincuenta y cinco" → "1955"), con el tiempo del grupo. */
const enCifras = (t: Tiempos, cifras: [string, string][]): Tiempos => ({
  ...t,
  frases: t.frases.map((fr) => {
    const pals = [...fr.palabras];
    for (const [dicho, escrito] of cifras) {
      const n = dicho.split(" ").length;
      for (let i = 0; i + n <= pals.length; i++) {
        const tramo = pals.slice(i, i + n);
        if (norm(tramo.map((p) => p.texto).join(" ")) !== norm(dicho)) continue;
        const cola = tramo[n - 1].texto.match(/[.,:;?!…]+$/)?.[0] ?? "";
        pals.splice(i, n, { texto: escrito + cola, inicio: tramo[0].inicio, fin: tramo[n - 1].fin });
      }
    }
    return { ...fr, palabras: pals };
  }),
});

/** Corta la voz en trozos de hasta `max` palabras; corta también después de un signo de puntuación. */
export const trozar = (t: Tiempos, max = 3): Trozo[] => {
  const trozos: Trozo[] = [];
  for (const fr of t.frases) {
    let actual: Trozo | null = null;
    for (const p of fr.palabras) {
      if (!actual) actual = { palabras: [], inicio: p.inicio, fin: p.fin };
      actual.palabras.push(p.texto);
      actual.fin = p.fin;
      if (actual.palabras.length >= max || /[.,:;?!…]$/.test(p.texto)) {
        trozos.push(actual);
        actual = null;
      }
    }
    if (actual) trozos.push(actual);
  }
  // cada trozo queda en pantalla hasta que empieza el siguiente (o 0,4 s si hay una pausa larga)
  return trozos.map((tr, i) => ({ ...tr, fin: Math.min(trozos[i + 1]?.inicio ?? tr.fin + 0.4, tr.fin + 0.4) }));
};

/** `destacar`: palabras enteras que van en color (se pinta como máximo una por trozo).
 *  `cifras`: lo que la voz dice en palabras y en pantalla va en números, p. ej. ["cien grados", "100 °C"]. */
export const Subtitulo3D: React.FC<{ tiempos: Tiempos; destacar: string[]; cifras?: [string, string][]; y?: number }> = ({
  tiempos,
  destacar,
  cifras = [],
  y = 1400,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const trozos = React.useMemo(() => trozar(enCifras(tiempos, cifras)), [tiempos, cifras]);
  const tr = trozos.find((x) => t >= x.inicio - 0.05 && t < x.fin);
  if (!tr) return null;
  const entrada = interpolate(t, [tr.inicio - 0.05, tr.inicio + 0.12], [0, 1], clamp);
  const claves = destacar.map(norm);
  let pintada = false;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: y,
          left: 70,
          right: 70,
          textAlign: "center",
          fontFamily: display,
          fontWeight: 800,
          fontSize: 82,
          lineHeight: 1.1,
          letterSpacing: -1,
          color: "#ffffff",
          opacity: entrada,
          transform: `translateY(${(1 - entrada) * 16}px) scale(${0.94 + 0.06 * entrada})`,
          textShadow: "0 4px 18px rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.8)",
        }}
      >
        {tr.palabras.map((p, i) => {
          const n = norm(p);
          // palabra entera: "cien" no tiene que pintar "novecientos"
          const es = !pintada && claves.some((c) => c && n === c);
          if (es) pintada = true;
          return (
            <span key={i} style={{ color: es ? ACENTO : undefined }}>
              {p}
              {i < tr.palabras.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Marco3D: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* barra de progreso, como en las historias */}
      <div style={{ position: "absolute", top: 96, left: 80, right: 80, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.18)" }}>
        <div style={{ width: `${Math.min(100, (frame / total) * 100)}%`, height: "100%", borderRadius: 4, background: "#ffffff" }} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 132,
          left: 80,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: mono,
          fontSize: 26,
          letterSpacing: 2,
          color: "rgba(255,255,255,0.72)",
        }}
      >
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: ACENTO, boxShadow: `0 0 14px ${ACENTO}` }} />
        TE LO EXPLICO
      </div>
    </AbsoluteFill>
  );
};

/** Rótulo flotante chico (un dato pegado a la escena), con entrada y salida. */
export const Chip: React.FC<{ desde: number; hasta: number; x: number; y: number; children: React.ReactNode; color?: string }> = ({
  desde,
  hasta,
  x,
  y,
  children,
  color = ACENTO,
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [desde, desde + 8, hasta - 8, hasta], [0, 1, 1, 0], clamp);
  if (v <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * v})`,
        opacity: v,
        padding: "16px 28px",
        borderRadius: 18,
        background: "rgba(10,16,32,0.72)",
        border: `2px solid ${color}`,
        color: "#fff",
        fontFamily: display,
        fontWeight: 800,
        fontSize: 46,
        whiteSpace: "nowrap",
        boxShadow: `0 0 30px ${color}44`,
      }}
    >
      {children}
    </div>
  );
};

/** Cierre: invita a seguir la serie (mismo texto que el cierre 2D del kit, 26/10), corto para no romper el loop. */
export const DUR_CIERRE_3D = 42;
export const Cierre3D: React.FC<{ desde: number }> = ({ desde }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [desde, desde + 8], [0, 1], clamp);
  if (v <= 0) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: `rgba(5,8,16,${0.55 * v})`, pointerEvents: "none" }}>
      <div
        style={{
          opacity: v,
          transform: `scale(${0.9 + 0.1 * v})`,
          padding: "18px 40px",
          borderRadius: 999,
          background: "rgba(10,16,32,0.85)",
          border: `3px solid ${ACENTO}`,
          boxShadow: `0 0 40px ${ACENTO}55`,
          color: "#fff",
          fontFamily: display,
          fontWeight: 800,
          fontSize: 44,
          whiteSpace: "nowrap",
        }}
      >
        seguí <span style={{ color: ACENTO }}>@teloexplico.ar</span> · un dato por día
      </div>
    </AbsoluteFill>
  );
};

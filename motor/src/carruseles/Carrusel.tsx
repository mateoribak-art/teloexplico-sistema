import React from "react";
import { AbsoluteFill } from "remotion";
import { C, display, mono, sombra } from "../kit/marca";
import { Burbuja, Fondo } from "../kit/piezas";
import { Auto, Bife, Heladera, Nube, Olla, Sarten, Sol, Termometro, Vaso } from "../kit/biblioteca";

// Carruseles de Instagram (27/10/2026): 1080×1350, una idea por placa, número de placa arriba, @ abajo en cada una.
// El texto de cada carrusel está en videos/carruseles/<clave>/placas.json (lo escribe Claude con el skill producir-carrusel).
// Solo datos que ya pasaron el chequeo de los reels de origen: herramientas/carrusel.py lo controla antes de dejarlo listo.
export const ANCHO_C = 1080;
export const ALTO_C = 1350;

// dibujos por nombre, con las mismas props que en la biblioteca (x, y en la placa de 1080×1350; s = escala)
type Objeto = { objeto: string; x: number; y: number; s?: number } & Record<string, unknown>;
const Tupper: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <rect x={x - 110 * s} y={y - 45 * s} width={220 * s} height={90 * s} rx={18 * s} fill="#DDEBFF" stroke={C.tinta} strokeWidth={8} />
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OBJETOS: Record<string, React.FC<any>> = { Heladera, Olla, Termometro, Nube, Sol, Vaso, Sarten, Bife, Auto, Tupper };
const COLORES: Record<string, string> = { rojo: C.rojo, azul: C.azul, verde: C.verde, tinta: C.tinta };

type Placa =
  | { tipo: "tapa"; arriba: string; grande: string; promesa: string; dibujo?: Objeto[] }
  | { tipo: "paso"; etiqueta: string; titulo: string; cuerpo?: string; dato?: string; colorDato?: string; dibujo?: Objeto[]; fuente?: string }
  | { tipo: "resumen"; titulo: string; items: [boolean, string][] }
  | { tipo: "cierre"; texto: string; serie?: string };
export type CarruselDatos = { origen: string[]; serie?: string; placas: Placa[] };

const Dibujo: React.FC<{ objetos: Objeto[] }> = ({ objetos }) => (
  <svg width={ANCHO_C} height={ALTO_C} style={{ position: "absolute", inset: 0 }}>
    {objetos.map(({ objeto, ...props }, k) => {
      const O = OBJETOS[objeto];
      return O ? <O key={k} {...props} /> : null;
    })}
  </svg>
);

const Pastilla: React.FC<{ children: React.ReactNode; fondo?: string; color?: string; tam?: number; rot?: number }> = ({
  children, fondo = C.tinta, color = C.blanco, tam = 34, rot = 0,
}) => (
  <div
    style={{
      display: "inline-flex", alignItems: "center", gap: 12, background: fondo, color, fontFamily: display, fontWeight: 800,
      fontSize: tam, padding: "8px 24px", borderRadius: 999, boxShadow: sombra(6), rotate: `${rot}deg`,
    }}
  >
    {children}
  </div>
);

const Resaltar: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.amarillo }) => (
  <span style={{ background: `linear-gradient(transparent 50%, ${color} 50%, ${color} 94%, transparent 94%)`, padding: "0 12px" }}>{children}</span>
);

// sin dibujo, el texto va al medio (entre el marco de arriba y el de abajo) para que la placa no quede vacía abajo
const centrado: React.CSSProperties = { top: 150, bottom: 130, display: "flex", flexDirection: "column", justifyContent: "center" };

export const CarruselPlaca: React.FC<{ datos: CarruselDatos; i: number }> = ({ datos: c, i }) => {
  const p = c.placas[i];
  const dibujo = "dibujo" in p && p.dibujo?.length ? p.dibujo : null;
  const total = c.placas.length;
  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      {dibujo ? <Dibujo objetos={dibujo} /> : null}
      {/* marco fijo: marca y número de placa arriba, @ abajo (las capturas viajan sin la cuenta) */}
      <div style={{ position: "absolute", top: 60, left: 70 }}>
        <Pastilla>te lo explico <Burbuja tam={32} /></Pastilla>
      </div>
      <div style={{ position: "absolute", top: 66, right: 70, fontFamily: mono, fontWeight: 700, fontSize: 34, color: C.tinta }}>
        {i + 1}/{total}
      </div>
      <div style={{ position: "absolute", bottom: 50, right: 70, fontFamily: mono, fontWeight: 700, fontSize: 30, color: C.tinta }}>@teloexplico.ar</div>
      {"fuente" in p && p.fuente ? (
        <div style={{ position: "absolute", bottom: 50, left: 70, fontFamily: mono, fontWeight: 700, fontSize: 26, color: "#6B6253" }}>
          fuente: {p.fuente}
        </div>
      ) : null}

      {p.tipo === "tapa" ? (
        <div style={{ ...(dibujo ? { top: 230 } : centrado), position: "absolute", left: 90, right: 90, textAlign: "center", fontFamily: display, color: C.tinta }}>
          <div style={{ fontWeight: 800, fontSize: p.arriba.length > 40 ? 78 : 88, lineHeight: 1.04 }}>{p.arriba}</div>
          <div style={{ fontWeight: 800, fontSize: 170, lineHeight: 1, letterSpacing: -6, rotate: "-3deg", marginTop: 30, whiteSpace: "nowrap" }}>
            <Resaltar>{p.grande}</Resaltar>
          </div>
          <div style={{ marginTop: dibujo ? 20 : 120 }}>
            <Pastilla fondo={C.azul} tam={38} rot={2}>{p.promesa} →</Pastilla>
          </div>
        </div>
      ) : null}

      {p.tipo === "paso" ? (
        <div style={{ ...(dibujo ? { top: 210 } : centrado), position: "absolute", left: 90, right: 90, fontFamily: display, color: C.tinta }}>
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 36, color: C.azul, marginBottom: 22 }}>{p.etiqueta}</div>
          <div style={{ fontWeight: 800, fontSize: p.titulo.length > 50 ? 76 : 90, lineHeight: 1.04, letterSpacing: -2 }}>{p.titulo}</div>
          {p.dato ? (
            <div style={{ marginTop: 34, fontWeight: 800, fontSize: 190, lineHeight: 1, letterSpacing: -8, color: COLORES[p.colorDato ?? "tinta"] ?? C.tinta, rotate: "-2deg" }}>
              <Resaltar>{p.dato}</Resaltar>
            </div>
          ) : null}
          {p.cuerpo ? <div style={{ marginTop: 34, fontWeight: 500, fontSize: 50, lineHeight: 1.22 }}>{p.cuerpo}</div> : null}
        </div>
      ) : null}

      {p.tipo === "resumen" ? (
        <div style={{ position: "absolute", top: 200, left: 90, right: 90, fontFamily: display, color: C.tinta }}>
          <div style={{ fontWeight: 800, fontSize: 84, lineHeight: 1.04, letterSpacing: -2, marginBottom: 46 }}>
            <Resaltar>{p.titulo}</Resaltar>
          </div>
          {p.items.map(([ok, t], k) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 30 }}>
              <div
                style={{
                  flex: "0 0 auto", width: 84, height: 84, borderRadius: 20, background: ok ? C.verde : C.rojo, border: `6px solid ${C.tinta}`,
                  boxShadow: sombra(6), display: "flex", justifyContent: "center", alignItems: "center", color: C.blanco, fontSize: 56, fontWeight: 800,
                }}
              >
                {ok ? "✓" : "✗"}
              </div>
              <div style={{ fontWeight: 800, fontSize: 50, lineHeight: 1.1 }}>{t}</div>
            </div>
          ))}
          <div style={{ marginTop: 20, fontFamily: mono, fontWeight: 700, fontSize: 32, color: "#6B6253" }}>capturalo y mandáselo a quien lo necesite</div>
        </div>
      ) : null}

      {p.tipo === "cierre" ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 90px", textAlign: "center", fontFamily: display, color: C.tinta }}>
          <div style={{ fontSize: 120, marginBottom: 10 }}>👇</div>
          <div style={{ fontWeight: 800, fontSize: 92, lineHeight: 1.04, letterSpacing: -3 }}>{p.texto}</div>
          <div style={{ marginTop: 60 }}>
            <Pastilla fondo={C.tinta} color={C.amarillo} tam={44} rot={-2}>
              seguí @teloexplico.ar{p.serie ? ` · ${p.serie}` : " · un dato por día"}
            </Pastilla>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

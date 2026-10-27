import React from "react";
import { AbsoluteFill } from "remotion";
import { C, display, mono, sombra } from "../kit/marca";
import { Burbuja, Fondo } from "../kit/piezas";
import { Heladera, Olla, Termometro } from "../kit/biblioteca";

// Carruseles de Instagram (27/10/2026): 1080×1350, una idea por placa, número de placa arriba, @ abajo en cada una.
// Solo datos que ya pasaron el chequeo del reel de origen (videos/<slug>/chequeo.json).
// Render: herramientas/carrusel.py <clave> (una imagen por placa en videos/carruseles/<clave>/).
export const ANCHO_C = 1080;
export const ALTO_C = 1350;

type Placa =
  | { tipo: "tapa"; arriba: string; grande: string; promesa: string; dibujo?: React.ReactNode }
  | { tipo: "paso"; etiqueta: string; titulo: string; cuerpo?: string; dato?: string; colorDato?: string; dibujo?: React.ReactNode; fuente?: string }
  | { tipo: "resumen"; titulo: string; items: [boolean, string][] }
  | { tipo: "cierre"; texto: string; serie?: string };

const Svg: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 0 }) => (
  <svg width={ANCHO_C} height={ALTO_C} style={{ position: "absolute", inset: 0 }}>
    <g transform={`translate(0 ${y})`}>{children}</g>
  </svg>
);

export const CARRUSELES: Record<string, { serie?: string; placas: Placa[] }> = {
  heladera: {
    serie: "mitos de cocina",
    placas: [
      {
        tipo: "tapa", arriba: "¿dejás enfriar la comida antes de la heladera?", grande: "es al revés",
        promesa: "deslizá y guardalo",
        dibujo: <Svg><Heladera x={330} y={1180} s={0.62} abierta={1} /><Olla x={760} y={1150} s={0.85} /></Svg>,
      },
      {
        tipo: "paso", etiqueta: "// el problema", titulo: "En la mesada, la comida pasa horas en la zona de peligro",
        dato: "4 a 60 °C", colorDato: C.rojo, fuente: "USDA FSIS · ANMAT/SENASA",
        dibujo: <Svg><Olla x={420} y={1170} s={0.75} /><Termometro x={800} y={1180} s={0.62} valor={0.6} /></Svg>,
      },
      {
        tipo: "paso", etiqueta: "// por qué importa", titulo: "Ahí las bacterias se pueden duplicar en apenas",
        dato: "20 minutos", colorDato: C.rojo, cuerpo: "Por eso no conviene dejarla horas afuera.", fuente: "USDA FSIS",
      },
      {
        tipo: "paso", etiqueta: "// el origen del mito", titulo: "Viene de las heladeras a hielo",
        cuerpo: "Meter algo caliente derretía el hielo. Las heladeras de hoy se la bancan sin problema.",
        dibujo: <Svg><Heladera x={540} y={1250} s={0.55} /></Svg>, fuente: "Indiana Public Media · AARP",
      },
      {
        tipo: "paso", etiqueta: "// ojo", titulo: "La olla gigante tarda un montón en enfriarse, aunque esté adentro",
        cuerpo: "Repartila en tuppers chatos: se enfría más rápido.", fuente: "USDA FSIS",
        dibujo: (
          <Svg>
            {[0, 1, 2].map((k) => (
              <rect key={k} x={170 + k * 260} y={1040} width={220} height={90} rx={18} fill="#DDEBFF" stroke={C.tinta} strokeWidth={8} />
            ))}
          </Svg>
        ),
      },
      {
        tipo: "paso", etiqueta: "// la regla", titulo: "Antes de las 2 horas, a la heladera",
        dato: "2 h", colorDato: C.azul, cuerpo: "Si hace más de 32 °C: antes de 1 hora.", fuente: "USDA FSIS",
      },
      {
        tipo: "resumen", titulo: "La heladera, en 4 reglas",
        items: [
          [true, "La comida caliente puede ir directo"],
          [true, "Máximo 2 h afuera (1 h con más de 32 °C)"],
          [true, "Ollas grandes: en tuppers chatos"],
          [false, "Dejar el guiso toda la noche en la hornalla"],
        ],
      },
      { tipo: "cierre", texto: "Mandáselo a ese que deja el guiso toda la noche arriba de la hornalla", serie: "mitos de cocina" },
    ],
  },
  bts: {
    placas: [
      { tipo: "tapa", arriba: "¿por qué la ARMY argentina esperó", grande: "13 años?", promesa: "deslizá: la línea de tiempo" },
      { tipo: "paso", etiqueta: "// spoiler", titulo: "No fue por falta de fans", cuerpo: "Fue una cadena de cosas, una atrás de la otra." },
      { tipo: "paso", etiqueta: "// junio de 2013", titulo: "BTS debuta en Corea del Sur", dato: "2013", colorDato: C.azul, fuente: "Infobae" },
      {
        tipo: "paso", etiqueta: "// 2014 a 2019", titulo: "Latinoamérica sí, Argentina no",
        cuerpo: "Pasaron por Brasil en 2014, 2015, 2017 y 2019. A la Argentina nunca le tocó.", dato: "0 shows", colorDato: C.rojo,
        fuente: "Billboard Brasil · El Heraldo",
      },
      { tipo: "paso", etiqueta: "// 2020", titulo: "La pandemia se llevó puesta la gira mundial", dato: "2020", colorDato: C.rojo },
      {
        tipo: "paso", etiqueta: "// 2022 a 2025", titulo: "El servicio militar obligatorio",
        cuerpo: "En Corea del Sur los varones sirven entre 18 y 21 meses. Jin entró primero, a fines de 2022; Suga salió último, en junio de 2025.",
        fuente: "Associated Press",
      },
      {
        tipo: "paso", etiqueta: "// ojo", titulo: "Jin ya había pisado River",
        cuerpo: "El 28 de octubre de 2022, como invitado de Coldplay, antes del servicio. Pero los siete juntos, nunca.",
        fuente: "La Nación · Buenos Aires Times",
      },
      {
        tipo: "paso", etiqueta: "// 2026", titulo: "Gira ARIRANG: por fin, Argentina",
        cuerpo: "Tres noches en el Estadio Único de La Plata: 21, 23 y 24 de octubre.", dato: "3 noches", colorDato: C.azul, fuente: "Infobae",
      },
      {
        tipo: "resumen", titulo: "13 años, en 5 pasos",
        items: [
          [true, "2013 · debutan en Corea"],
          [false, "2014–2019 · Brasil sí, Argentina no"],
          [false, "2020 · la pandemia cancela la gira"],
          [false, "2022–2025 · servicio militar"],
          [true, "2026 · tres noches en La Plata"],
        ],
      },
      { tipo: "cierre", texto: "Mandáselo a esa ARMY que contó los días desde 2013" },
    ],
  },
};

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

export const CarruselPlaca: React.FC<{ clave: string; i: number }> = ({ clave, i }) => {
  const c = CARRUSELES[clave];
  const p = c.placas[i];
  const total = c.placas.length;
  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      {"dibujo" in p ? p.dibujo : null}
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
        <div style={{ ...(p.dibujo ? { top: 230 } : centrado), position: "absolute", left: 90, right: 90, textAlign: "center", fontFamily: display, color: C.tinta }}>
          <div style={{ fontWeight: 800, fontSize: p.arriba.length > 40 ? 78 : 88, lineHeight: 1.04 }}>{p.arriba}</div>
          <div style={{ fontWeight: 800, fontSize: 170, lineHeight: 1, letterSpacing: -6, rotate: "-3deg", marginTop: 30, whiteSpace: "nowrap" }}>
            <Resaltar>{p.grande}</Resaltar>
          </div>
          <div style={{ marginTop: p.dibujo ? 20 : 120 }}>
            <Pastilla fondo={C.azul} tam={38} rot={2}>{p.promesa} →</Pastilla>
          </div>
        </div>
      ) : null}

      {p.tipo === "paso" ? (
        <div style={{ ...(p.dibujo ? { top: 210 } : centrado), position: "absolute", left: 90, right: 90, fontFamily: display, color: C.tinta }}>
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 36, color: C.azul, marginBottom: 22 }}>{p.etiqueta}</div>
          <div style={{ fontWeight: 800, fontSize: p.titulo.length > 50 ? 76 : 90, lineHeight: 1.04, letterSpacing: -2 }}>{p.titulo}</div>
          {p.dato ? (
            <div style={{ marginTop: 34, fontWeight: 800, fontSize: 190, lineHeight: 1, letterSpacing: -8, color: p.colorDato ?? C.tinta, rotate: "-2deg" }}>
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

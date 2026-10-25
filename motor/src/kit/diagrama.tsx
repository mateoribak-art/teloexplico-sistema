import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, display, mono, sombra } from "./marca";
import { clamp, resorte, suave } from "./anim";

// Piezas de "diagrama ilustrado" (dirección de arte en marca/DIRECCION_ARTE.md):
// el dibujo explica el mecanismo, los datos van pegados al objeto y todo tiene volumen.

/** Tonos derivados de la paleta para luces y sombras (nunca colores nuevos). */
export const TONO = {
  nubeLuz: "#FFFFFF",
  nubeMedio: "#E6EAF5",
  nubeSombra: "#A9B4D0",
  hielo: "#D8F0FF",
  hieloMedio: "#B4DDF7",
  hieloOscuro: "#86BCE3",
  solSombra: "#FFC93D",
  rojoSombra: "#D93A1E",
  azulSombra: "#1F34C2",
  pasto: "#7BD68F",
  tierra: "#E8D2A6",
  tierraSombra: "#CDB282",
  frio: "#CFE9FF",
} as const;

const ease = Easing.bezier(0.45, 0, 0.2, 1);

/* ---------- Cámara: zoom y paneo suaves entre puntos clave ---------- */
export type Toma = { f: number; x: number; y: number; zoom: number };

/** Mueve un "mundo" de 1080×1920. Cada toma dice qué punto (x, y) queda en el centro y con cuánto zoom. */
export const Camara: React.FC<{ tomas: Toma[]; children: React.ReactNode; frame?: number }> = ({ tomas, children, frame }) => {
  const actual = useCurrentFrame();
  const f = frame ?? actual;
  const fs = tomas.map((t) => t.f);
  const v = (k: "x" | "y" | "zoom") =>
    tomas.length === 1 ? tomas[0][k] : interpolate(f, fs, tomas.map((t) => t[k]), { ...clamp, easing: ease });
  const zoom = v("zoom");
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "0 0",
        transform: `translate(540px, 960px) scale(${zoom}) translate(${-v("x")}px, ${-v("y")}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Punto clave de cámara que "llega" en `dur` frames (para armar listas de tomas más fácil). */
export const toma = (f: number, x: number, y: number, zoom: number): Toma => ({ f, x, y, zoom });

/* ---------- Trazo que se dibuja (flechas, recorridos) ---------- */
export const Trazo: React.FC<{
  d: string; desde: number; dur?: number; color?: string; ancho?: number; punteado?: string; largo?: number; flecha?: boolean;
}> = ({ d, desde, dur = 18, color = C.tinta, ancho = 8, punteado, largo = 3000, flecha = false }) => {
  const frame = useCurrentFrame();
  const p = suave(frame, desde, dur);
  if (p <= 0) return null;
  const id = `fl-${Math.abs(d.length * 31 + desde)}`;
  return (
    <g>
      {flecha ? (
        <defs>
          <marker id={id} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={color} />
          </marker>
        </defs>
      ) : null}
      {punteado ? (
        <g>
          <mask id={`${id}-m`}>
            <path d={d} fill="none" stroke="#fff" strokeWidth={ancho + 6} strokeDasharray={largo} strokeDashoffset={largo * (1 - p)} />
          </mask>
          <path d={d} fill="none" stroke={color} strokeWidth={ancho} strokeLinecap="round" strokeDasharray={punteado} mask={`url(#${id}-m)`} />
        </g>
      ) : (
        <path d={d} fill="none" stroke={color} strokeWidth={ancho} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={largo} strokeDashoffset={largo * (1 - p)} markerEnd={flecha && p > 0.95 ? `url(#${id})` : undefined} />
      )}
    </g>
  );
};

/* ---------- Rótulo: dato pegado al objeto, con línea que lo señala ---------- */
export const Rotulo: React.FC<{
  texto: string; desde: number; x: number; y: number; ax: number; ay: number;
  color?: string; fondo?: string; tam?: number; grande?: string; colorGrande?: string;
}> = ({ texto, desde, x, y, ax, ay, color = C.tinta, fondo = C.blanco, tam = 26, grande, colorGrande = C.rojo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < desde) return null;
  const linea = suave(frame, desde, 8);
  const r = resorte(frame, fps, desde + 5, 340);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={ax} y1={ay} x2={ax + (x - ax) * linea} y2={ay + (y - ay) * linea} stroke={C.tinta} strokeWidth={4} />
        <circle cx={ax} cy={ay} r={8} fill={C.tinta} />
      </svg>
      <div
        style={{
          position: "absolute", left: x, top: y, translate: "-50% -50%", scale: r, whiteSpace: "nowrap",
          background: fondo, border: `4px solid ${C.tinta}`, borderRadius: 12, boxShadow: sombra(5),
          padding: grande ? "6px 16px 8px" : "6px 14px", textAlign: "center",
        }}
      >
        {grande ? (
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: tam * 2.1, lineHeight: 1, color: colorGrande }}>{grande}</div>
        ) : null}
        <div style={{ fontFamily: mono, fontWeight: 700, fontSize: tam, color }}>{texto}</div>
      </div>
    </>
  );
};

/* ---------- Contador: el número sube a la vista (engancha más que un número quieto) ---------- */
export const Contador: React.FC<{
  hasta: number; desde: number; dur?: number; antes?: string; despues?: string; x: number; y: number;
  tam?: number; color?: string; etiqueta?: string;
}> = ({ hasta, desde, dur = 24, antes = "", despues = "", x, y, tam = 140, color = C.rojo, etiqueta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < desde) return null;
  const p = interpolate(frame, [desde, desde + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const llego = frame >= desde + dur;
  const rebote = llego ? interpolate(resorte(frame, fps, desde + dur, 500), [0, 1], [1.18, 1]) : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", textAlign: "center", scale: rebote }}>
      <div
        style={{
          fontFamily: display, fontWeight: 800, fontSize: tam, lineHeight: 1, color, letterSpacing: -tam * 0.03,
          WebkitTextStroke: `${Math.round(tam / 18)}px ${C.tinta}`, paintOrder: "stroke fill", textShadow: `${tam / 14}px ${tam / 14}px 0 ${C.tinta}`,
          whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums",
        }}
      >
        {antes}{Math.round(hasta * p)}{despues}
      </div>
      {etiqueta ? (
        <div style={{ display: "inline-block", marginTop: 10, fontFamily: mono, fontWeight: 700, fontSize: 26, background: C.blanco,
          border: `4px solid ${C.tinta}`, borderRadius: 10, padding: "4px 12px", boxShadow: sombra(4) }}>
          {etiqueta}
        </div>
      ) : null}
    </div>
  );
};

/* ---------- Partículas que fluyen (aire, calor, agua): movimiento constante con sentido ---------- */
export const Flujo: React.FC<{
  x0: number; x1: number; yAbajo: number; yArriba: number; n?: number; velocidad?: number; color?: string;
  tam?: number; t: number; opacidad?: number; ondula?: number;
}> = ({ x0, x1, yAbajo, yArriba, n = 18, velocidad = 1, color = C.rojo, tam = 9, t, opacidad = 1, ondula = 12 }) => {
  const alto = yAbajo - yArriba;
  return (
    <g opacity={opacidad}>
      {Array.from({ length: n }).map((_, i) => {
        const semilla = Math.abs(Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1; // pseudoazar fijo por partícula
        const ciclo = ((t * velocidad * 6 + semilla * alto) % alto) / alto;
        const x = x0 + (x1 - x0) * ((i + 0.5) / n) + Math.sin(t / 8 + i) * ondula;
        const y = yAbajo - ciclo * alto;
        const a = Math.min(1, ciclo * 6, (1 - ciclo) * 6);
        return <circle key={i} cx={x} cy={y} r={tam * (0.7 + semilla * 0.6)} fill={color} opacity={a} />;
      })}
    </g>
  );
};

/** Líneas de velocidad (detrás de algo que cae o sube rápido). */
export const Velocidad: React.FC<{ cx: number; cy: number; largo?: number; n?: number; sentido?: 1 | -1; t: number; color?: string }> = ({
  cx, cy, largo = 220, n = 5, sentido = -1, t, color = C.tinta,
}) => (
  <g stroke={color} strokeWidth={7} strokeLinecap="round" opacity={0.55}>
    {Array.from({ length: n }).map((_, i) => {
      const dx = (i - (n - 1) / 2) * 26;
      const l = largo * (0.55 + ((i * 37 + t * 3) % 45) / 100);
      return <line key={i} x1={cx + dx} y1={cy + sentido * 40} x2={cx + dx} y2={cy + sentido * (40 + l)} />;
    })}
  </g>
);

/* ---------- Escala de medida (altura, temperatura…) que se dibuja de abajo hacia arriba ---------- */
export const Escala: React.FC<{
  x: number; yCero: number; paso: number; marcas: number[]; unidad: string; desde: number; lado?: "izq" | "der";
}> = ({ x, yCero, paso, marcas, unidad, desde, lado = "izq" }) => {
  const frame = useCurrentFrame();
  const p = suave(frame, desde, 20);
  if (p <= 0) return null;
  const tope = yCero - marcas[marcas.length - 1] * paso;
  return (
    <g fontFamily={mono} fontWeight={700} fontSize={26} fill={C.tinta}>
      <line x1={x} y1={yCero} x2={x} y2={yCero - (yCero - tope) * p} stroke={C.tinta} strokeWidth={5} />
      {marcas.map((m, i) => {
        const y = yCero - m * paso;
        const vis = suave(frame, desde + (i / marcas.length) * 18, 6);
        return (
          <g key={m} opacity={vis}>
            <line x1={x - 14} y1={y} x2={x + 14} y2={y} stroke={C.tinta} strokeWidth={5} />
            <text x={lado === "izq" ? x - 24 : x + 24} y={y + 9} textAnchor={lado === "izq" ? "end" : "start"}>{m} {unidad}</text>
          </g>
        );
      })}
    </g>
  );
};

/* ---------- Lupa: muestra por dentro un detalle del diagrama ---------- */
export const Lupa: React.FC<{
  cx: number; cy: number; r?: number; desde: number; ax?: number; ay?: number; children: React.ReactNode;
}> = ({ cx, cy, r = 150, desde, ax, ay, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < desde) return null;
  const s = resorte(frame, fps, desde, 300);
  const id = `lupa-${cx}-${cy}`;
  return (
    <g>
      {ax !== undefined && ay !== undefined ? (
        <line x1={ax} y1={ay} x2={ax + (cx - ax) * Math.min(1, s)} y2={ay + (cy - ay) * Math.min(1, s)} stroke={C.tinta} strokeWidth={5} />
      ) : null}
      <g style={{ scale: s, transformOrigin: `${cx}px ${cy}px` }}>
        <circle cx={cx + 12} cy={cy + 12} r={r} fill={C.tinta} />
        <clipPath id={id}><circle cx={cx} cy={cy} r={r} /></clipPath>
        <circle cx={cx} cy={cy} r={r} fill={C.blanco} />
        <g clipPath={`url(#${id})`}>{children}</g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.tinta} strokeWidth={10} />
        <path d={`M${cx - r * 0.62} ${cy - r * 0.35} A${r * 0.75} ${r * 0.75} 0 0 1 ${cx - r * 0.2} ${cy - r * 0.7}`} fill="none" stroke={C.blanco} strokeWidth={10} strokeLinecap="round" opacity={0.9} />
      </g>
    </g>
  );
};

/* ---------- Volumen ---------- */

/** Degradé vertical de luz a sombra (usar dentro de <defs>). */
export const DegradeV: React.FC<{ id: string; arriba: string; medio?: string; abajo: string; y1: number; y2: number }> = ({
  id, arriba, medio, abajo, y1, y2,
}) => (
  <linearGradient id={id} x1="0" y1={y1} x2="0" y2={y2} gradientUnits="userSpaceOnUse">
    <stop offset="0" stopColor={arriba} />
    {medio ? <stop offset="0.55" stopColor={medio} /> : null}
    <stop offset="1" stopColor={abajo} />
  </linearGradient>
);

/** Nube con volumen: unión de bultos (contorno, sombra dura, degradé y brillos). `crece` 0→1 la arma desde abajo. */
export type Bulto = [cx: number, cy: number, r: number];
export const NubeVolumen: React.FC<{ bultos: Bulto[]; yunque?: string; crece?: number; id: string; yArriba: number; yAbajo: number; oscura?: number }> = ({
  bultos, yunque, crece = 1, id, yArriba, yAbajo, oscura = 0,
}) => {
  // los bultos aparecen de abajo hacia arriba según `crece`
  const orden = [...bultos].sort((a, b) => b[1] - a[1]);
  const vis = orden.map((b, i) => {
    const k = interpolate(crece * orden.length, [i, i + 1.2], [0, 1], clamp);
    return [b[0], b[1], b[2] * k] as Bulto;
  }).filter((b) => b[2] > 1);
  const yv = yunque ? interpolate(crece, [0.85, 1], [0, 1], clamp) : 0;
  const sombraC = interpolate(oscura, [0, 1], [0, 1]);
  return (
    <g>
      <defs>
        <DegradeV id={id} arriba={TONO.nubeLuz} medio={TONO.nubeMedio} abajo={sombraC > 0.5 ? "#8D99B8" : TONO.nubeSombra} y1={yArriba} y2={yAbajo} />
      </defs>
      <g transform="translate(14 14)" fill={C.tinta}>
        {yunque && yv > 0 ? <path d={yunque} opacity={yv} /> : null}
        {vis.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
      </g>
      <g fill={C.tinta}>
        {yunque && yv > 0 ? <path d={yunque} stroke={C.tinta} strokeWidth={14} strokeLinejoin="round" opacity={yv} /> : null}
        {vis.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r + 7} />)}
      </g>
      <g fill={`url(#${id})`}>
        {yunque && yv > 0 ? <path d={yunque} opacity={yv} /> : null}
        {vis.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
      </g>
      <g fill={C.blanco} opacity={0.8}>
        {vis.map(([cx, cy, r], i) => <ellipse key={i} cx={cx - r * 0.35} cy={cy - r * 0.45} rx={r * 0.3} ry={r * 0.16} />)}
      </g>
    </g>
  );
};

/** Piedra de hielo con volumen; `capas` dibuja el corte en anillos. */
export const PiedraHielo: React.FC<{ cx: number; cy: number; r: number; capas?: number; brillo?: boolean }> = ({ cx, cy, r, capas = 0, brillo = true }) => (
  <g>
    <circle cx={cx + r * 0.12 + 3} cy={cy + r * 0.12 + 3} r={r} fill={C.tinta} />
    <circle cx={cx} cy={cy} r={r} fill={TONO.hielo} stroke={C.tinta} strokeWidth={Math.max(3, r * 0.12)} />
    {Array.from({ length: capas }).map((_, i) => {
      const rr = r * (1 - (i + 1) / (capas + 1));
      return <circle key={i} cx={cx} cy={cy} r={rr} fill={i % 2 ? TONO.hielo : TONO.hieloMedio} stroke={C.tinta} strokeWidth={Math.max(2, r * 0.035)} />;
    })}
    {brillo ? <ellipse cx={cx - r * 0.35} cy={cy - r * 0.38} rx={r * 0.32} ry={r * 0.18} fill={C.blanco} opacity={0.9} /> : null}
  </g>
);

/** Sol con volumen (sin cara: las caras van solo en el personaje del video). */
export const SolVolumen: React.FC<{ cx: number; cy: number; r: number; t: number; intensidad?: number }> = ({ cx, cy, r, t, intensidad = 1 }) => (
  <g>
    <g style={{ rotate: `${t * 0.6}deg`, transformOrigin: `${cx}px ${cy}px` }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const l = (26 + 14 * intensidad) * (1 + Math.sin(t / 5 + i) * 0.15);
        return <line key={i} x1={cx + Math.cos(a) * (r + 16)} y1={cy + Math.sin(a) * (r + 16)} x2={cx + Math.cos(a) * (r + 16 + l)} y2={cy + Math.sin(a) * (r + 16 + l)} stroke={C.tinta} strokeWidth={9} strokeLinecap="round" />;
      })}
    </g>
    <circle cx={cx + 8} cy={cy + 8} r={r} fill={C.tinta} />
    <circle cx={cx} cy={cy} r={r} fill={C.amarillo} stroke={C.tinta} strokeWidth={8} />
    <circle cx={cx + r * 0.12} cy={cy + r * 0.12} r={r * 0.68} fill={TONO.solSombra} opacity={0.75} />
    <ellipse cx={cx - r * 0.38} cy={cy - r * 0.38} rx={r * 0.26} ry={r * 0.15} fill={C.blanco} opacity={0.85} />
  </g>
);

/** Ciudad baja (edificios con ventanas) apoyada en `suelo`. */
export const Ciudad: React.FC<{ suelo: number; edificios?: [x: number, alto: number, ancho: number][]; t?: number }> = ({
  suelo, edificios = [[60, 150, 110], [190, 100, 90], [300, 200, 100], [720, 130, 100], [840, 210, 110], [960, 120, 100]], t = 0,
}) => (
  <g>
    {edificios.map(([x, h, w], i) => (
      <g key={i}>
        <rect x={x + 10} y={suelo - h + 10} width={w} height={h} fill={C.tinta} />
        <rect x={x} y={suelo - h} width={w} height={h} fill={C.blanco} stroke={C.tinta} strokeWidth={7} />
        <rect x={x + w - 18} y={suelo - h + 4} width={14} height={h - 8} fill={TONO.nubeMedio} />
        {Array.from({ length: Math.floor((h - 20) / 50) }).map((_, f) => (
          <g key={f}>
            {[0, 1].map((c) => (
              <rect key={c} x={x + 16 + c * (w - 54)} y={suelo - h + 20 + f * 50} width={22} height={26}
                fill={(i + f + c + Math.floor(t / 40)) % 4 === 0 ? C.amarillo : TONO.hieloMedio} stroke={C.tinta} strokeWidth={4} />
            ))}
          </g>
        ))}
      </g>
    ))}
  </g>
);

/** Piso: pasto + tierra con textura. */
export const Piso: React.FC<{ y: number; alto?: number }> = ({ y, alto = 140 }) => (
  <g>
    <rect x={-400} y={y} width={1880} height={alto} fill={TONO.tierra} stroke={C.tinta} strokeWidth={7} />
    <rect x={-400} y={y} width={1880} height={22} fill={TONO.pasto} stroke={C.tinta} strokeWidth={7} />
    {Array.from({ length: 14 }).map((_, i) => (
      <ellipse key={i} cx={(i * 137) % 1080} cy={y + 50 + ((i * 53) % (alto - 60))} rx={14} ry={7} fill={TONO.tierraSombra} />
    ))}
  </g>
);

/** Ondas de calor que suben del piso. */
export const OndasCalor: React.FC<{ xs: number[]; y: number; t: number; alto?: number; color?: string; opacidad?: number }> = ({
  xs, y, t, alto = 160, color = C.rojo, opacidad = 1,
}) => (
  <g fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" opacity={opacidad}>
    {xs.map((x, i) => {
      const s = ((t * 2 + i * 23) % 60) / 60;
      const dy = -s * 40;
      return (
        <path key={i} opacity={Math.min(1, (1 - s) * 2)}
          d={`M${x} ${y + dy} c-20 ${-alto * 0.2} 20 ${-alto * 0.3} 0 ${-alto * 0.5} c-20 ${-alto * 0.2} 20 ${-alto * 0.3} 0 ${-alto * 0.5}`} />
      );
    })}
  </g>
);

/** Banda de corriente ascendente con chevrones que suben. */
export const Corriente: React.FC<{ x: number; ancho: number; yAbajo: number; yArriba: number; t: number; p?: number; velocidad?: number }> = ({
  x, ancho, yAbajo, yArriba, t, p = 1, velocidad = 1,
}) => {
  const tope = yAbajo - (yAbajo - yArriba) * p;
  const id = `corr-${x}`;
  const paso = 110;
  return (
    <g>
      <defs>
        <DegradeV id={id} arriba={C.blanco} medio={C.amarillo} abajo={C.rojo} y1={yArriba} y2={yAbajo} />
        <clipPath id={`${id}-c`}><rect x={x - ancho / 2} y={tope} width={ancho} height={yAbajo - tope} /></clipPath>
      </defs>
      <rect x={x - ancho / 2} y={tope} width={ancho} height={yAbajo - tope} fill={`url(#${id})`} opacity={0.8} rx={ancho / 2} />
      <g clipPath={`url(#${id}-c)`}>
        {Array.from({ length: Math.ceil((yAbajo - yArriba) / paso) + 1 }).map((_, i) => {
          const y = yAbajo - ((i * paso + t * 4 * velocidad) % (yAbajo - yArriba + paso));
          return <path key={i} d={`M${x - ancho * 0.28} ${y} l${ancho * 0.28} ${-ancho * 0.26} l${ancho * 0.28} ${ancho * 0.26}`}
            fill="none" stroke={C.tinta} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />;
        })}
      </g>
    </g>
  );
};

/** Personaje simple (vecino): el único con cara en el video. */
export const Vecino: React.FC<{ cx: number; cy: number; s?: number; t: number; boca?: "o" | "sonrisa" }> = ({ cx, cy, s = 1, t, boca = "o" }) => {
  const parpadeo = t % 80 < 3;
  return (
    <g style={{ scale: s, transformOrigin: `${cx}px ${cy}px` }}>
      {/* cuerpo */}
      <path d={`M${cx - 120} ${cy + 260} q0 -150 120 -150 q120 0 120 150 z`} fill={C.azul} stroke={C.tinta} strokeWidth={8} />
      <path d={`M${cx - 120} ${cy + 260} q0 -150 120 -150 q60 0 90 40`} fill="none" stroke={TONO.azulSombra} strokeWidth={0} />
      {/* cabeza */}
      <circle cx={cx + 8} cy={cy + 8} r={92} fill={C.tinta} />
      <circle cx={cx} cy={cy} r={92} fill="#F6C89F" stroke={C.tinta} strokeWidth={8} />
      <path d={`M${cx - 92} ${cy - 10} q10 -100 92 -92 q90 0 92 80 q-60 -50 -184 12 z`} fill="#5A3B26" stroke={C.tinta} strokeWidth={8} strokeLinejoin="round" />
      {/* ojos */}
      {parpadeo ? (
        <g stroke={C.tinta} strokeWidth={7} strokeLinecap="round"><line x1={cx - 44} y1={cy + 6} x2={cx - 20} y2={cy + 6} /><line x1={cx + 20} y1={cy + 6} x2={cx + 44} y2={cy + 6} /></g>
      ) : (
        <g>
          <circle cx={cx - 32} cy={cy + 4} r={17} fill={C.blanco} stroke={C.tinta} strokeWidth={5} />
          <circle cx={cx + 32} cy={cy + 4} r={17} fill={C.blanco} stroke={C.tinta} strokeWidth={5} />
          <circle cx={cx - 30} cy={cy + 2} r={7} fill={C.tinta} />
          <circle cx={cx + 34} cy={cy + 2} r={7} fill={C.tinta} />
        </g>
      )}
      <g stroke={C.tinta} strokeWidth={6} strokeLinecap="round" fill="none">
        <path d={`M${cx - 50} ${cy - 30} q18 -14 36 -4`} />
        <path d={`M${cx + 14} ${cy - 34} q18 -10 36 4`} />
      </g>
      {boca === "o" ? <ellipse cx={cx} cy={cy + 48} rx={14} ry={18} fill={C.tinta} /> : <path d={`M${cx - 26} ${cy + 40} q26 22 52 0`} fill="none" stroke={C.tinta} strokeWidth={7} strokeLinecap="round" />}
      <ellipse cx={cx - 52} cy={cy + 30} rx={14} ry={8} fill={C.rojo} opacity={0.35} />
      <ellipse cx={cx + 52} cy={cy + 30} rx={14} ry={8} fill={C.rojo} opacity={0.35} />
    </g>
  );
};

/** Barra de meses (para "cuándo pasa"): resalta un rango con un marcador que lo recorre. */
export const Meses: React.FC<{ x: number; y: number; ancho: number; resaltar: number[]; desde: number; colores?: Record<number, string> }> = ({
  x, y, ancho, resaltar, desde, colores = {},
}) => {
  const frame = useCurrentFrame();
  const nombres = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const w = ancho / 12;
  return (
    <g>
      {nombres.map((n, i) => {
        const on = resaltar.indexOf(i);
        const prendido = on >= 0 && frame >= desde + on * 4;
        return (
          <g key={i}>
            <rect x={x + i * w + 4} y={y} width={w - 8} height={110} rx={14}
              fill={prendido ? colores[i] ?? C.amarillo : C.blanco} stroke={C.tinta} strokeWidth={6}
              style={{ translate: prendido ? `0 ${-interpolate(frame, [desde + on * 4, desde + on * 4 + 5, desde + on * 4 + 10], [0, 18, 8], clamp)}px` : "0 0" }} />
            <text x={x + i * w + w / 2} y={y + 72} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={44} fill={C.tinta}>{n}</text>
          </g>
        );
      })}
    </g>
  );
};

/** Paso numerado fijo arriba a la izquierda ("1 · el calor sube"): da sensación de progreso y retiene hasta el final. */
export const Paso: React.FC<{ n: number; texto: string; desde?: number; top?: number }> = ({ n, texto, desde = 0, top = 400 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < desde) return null;
  const r = resorte(frame, fps, desde, 320);
  return (
    <div style={{ position: "absolute", left: 60, top, display: "flex", alignItems: "center", gap: 0, translate: `${(1 - r) * -80}px 0`, opacity: Math.min(1, r * 2) }}>
      <div style={{ fontFamily: display, fontWeight: 800, fontSize: 44, color: C.blanco, background: C.rojo, border: `5px solid ${C.tinta}`,
        borderRadius: "14px 0 0 14px", padding: "2px 18px", boxShadow: sombra(6) }}>{n}</div>
      <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 28, color: C.tinta, background: C.blanco, border: `5px solid ${C.tinta}`, borderLeft: "none",
        borderRadius: "0 14px 14px 0", padding: "10px 18px", boxShadow: sombra(6), whiteSpace: "nowrap" }}>{texto}</div>
    </div>
  );
};

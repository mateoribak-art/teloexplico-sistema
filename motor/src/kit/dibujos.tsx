import React from "react";
import { C, TRAZO } from "./marca";
import { parpadea, respira } from "./anim";

// Todos los dibujos son <g> para usar dentro de un <svg> de 1080×1920.
// Estilo: relleno plano, contorno negro grueso y sombra dura desplazada (SOMBRA px).
const SOMBRA = 12;
const T = { stroke: C.tinta, strokeWidth: TRAZO, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type Cara = "feliz" | "preocupada" | "sorprendida" | "dormida" | "canchera";

/** Ojos + boca para cualquier personaje, centrados en (cx, cy). */
export const Carita: React.FC<{ cx: number; cy: number; cara: Cara; s?: number; parpadeo?: boolean }> = ({
  cx, cy, cara, s = 1, parpadeo = false,
}) => {
  const ojo = (dx: number) =>
    cara === "dormida" || parpadeo ? (
      <path d={`M${cx + dx - 14 * s} ${cy} q${14 * s} ${10 * s} ${28 * s} 0`} fill="none" {...T} strokeWidth={6 * s} />
    ) : (
      <g>
        <circle cx={cx + dx} cy={cy} r={17 * s} fill={C.blanco} {...T} strokeWidth={5 * s} />
        <circle cx={cx + dx + 3 * s} cy={cy + (cara === "preocupada" ? 4 : 2) * s} r={7 * s} fill={C.tinta} />
      </g>
    );
  const boca = {
    feliz: `M${cx - 26 * s} ${cy + 42 * s} q${26 * s} ${22 * s} ${52 * s} 0`,
    canchera: `M${cx - 22 * s} ${cy + 46 * s} q${30 * s} ${14 * s} ${48 * s} -${8 * s}`,
    preocupada: `M${cx - 24 * s} ${cy + 54 * s} q${24 * s} -${18 * s} ${48 * s} 0`,
    dormida: `M${cx - 12 * s} ${cy + 46 * s} h${24 * s}`,
    sorprendida: "",
  }[cara];
  return (
    <g>
      {ojo(-36 * s)}
      {ojo(36 * s)}
      {cara === "sorprendida" ? (
        <ellipse cx={cx} cy={cy + 50 * s} rx={12 * s} ry={16 * s} fill={C.tinta} />
      ) : (
        <path d={boca} fill="none" {...T} strokeWidth={7 * s} />
      )}
      {cara === "preocupada" ? (
        <g {...T} strokeWidth={6 * s}>
          {/* cejas preocupadas: la punta de adentro sube */}
          <line x1={cx - 54 * s} y1={cy - 24 * s} x2={cx - 22 * s} y2={cy - 36 * s} />
          <line x1={cx + 54 * s} y1={cy - 24 * s} x2={cx + 22 * s} y2={cy - 36 * s} />
        </g>
      ) : null}
    </g>
  );
};

/** Vapor ondulante. `t` = frame actual (anima el ondulado). */
export const Vapor: React.FC<{ x: number; y: number; t: number; n?: number; sep?: number; alto?: number; opacidad?: number }> = ({
  x, y, t, n = 3, sep = 64, alto = 80, opacidad = 1,
}) => (
  <g opacity={opacidad} fill="none" {...T} strokeWidth={8}>
    {Array.from({ length: n }).map((_, i) => {
      const fase = Math.sin(t / 6 + i * 1.7) * 10;
      const xi = x + (i - (n - 1) / 2) * sep;
      return <path key={i} d={`M${xi} ${y} c${-20 + fase} ${-alto * 0.4} ${20 - fase} ${-alto * 0.6} 0 ${-alto}`} />;
    })}
  </g>
);

/** Gota de sudor (nervios / calor). */
export const Sudor: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => {
  const caida = (t % 24) / 24;
  return (
    <path d={`M${x} ${y + caida * 40 * s} q${-14 * s} ${22 * s} 0 ${30 * s} q${14 * s} ${-8 * s} 0 ${-30 * s}z`}
      fill="#7CC3FF" stroke={C.tinta} strokeWidth={4 * s} opacity={1 - caida * 0.6} />
  );
};

/** Personaje vivo: respira con squash & stretch apoyado en su base (bx, by). */
export const Vivo: React.FC<{ t: number; bx: number; by: number; semilla?: number; fuerza?: number; children: React.ReactNode }> = ({
  t, bx, by, semilla = 0, fuerza = 0.025, children,
}) => {
  const [sx, sy] = respira(t, semilla, fuerza);
  return <g style={{ transformOrigin: `${bx}px ${by}px`, scale: `${sx} ${sy}` }}>{children}</g>;
};

/** Olla con cara. (x, y) = esquina superior izquierda del cuerpo. Con `t` parpadea y respira. */
export const Olla: React.FC<{ x: number; y: number; ancho?: number; alto?: number; cara?: Cara; color?: string; t?: number; sudor?: boolean }> = ({
  x, y, ancho = 260, alto = 160, cara = "feliz", color = C.rojo, t, sudor = false,
}) => (
  <Vivo t={t ?? 0} bx={x + ancho / 2} by={y + alto} semilla={x} fuerza={t === undefined ? 0 : 0.025}>
    <rect x={x + SOMBRA} y={y + SOMBRA} width={ancho} height={alto} rx={22} fill={C.tinta} />
    <rect x={x} y={y} width={ancho} height={alto} rx={22} fill={color} {...T} />
    {/* manijas */}
    <rect x={x - 34} y={y + 30} width={40} height={22} rx={10} fill={C.tinta} />
    <rect x={x + ancho - 6} y={y + 30} width={40} height={22} rx={10} fill={C.tinta} />
    {/* tapa */}
    <rect x={x - 22} y={y - 20} width={ancho + 44} height={32} rx={16} fill={C.tinta} />
    <rect x={x + ancho / 2 - 24} y={y - 42} width={48} height={24} rx={10} fill={C.tinta} />
    <Carita cx={x + ancho / 2} cy={y + alto * 0.38} cara={cara} s={ancho / 260} parpadeo={t !== undefined && parpadea(t, x)} />
    {sudor && t !== undefined ? <Sudor x={x + ancho * 0.86} y={y + 10} t={t} s={ancho / 260} /> : null}
  </Vivo>
);

/** Heladera moderna. `puerta` 0→1 abre la puerta de abajo. */
export const Heladera: React.FC<{ x: number; y: number; ancho?: number; alto?: number; puerta?: number; cara?: Cara; t?: number }> = ({
  x, y, ancho = 300, alto = 560, puerta = 0, cara, t,
}) => {
  const corte = alto * 0.33;
  const abre = ancho * 0.92 * puerta;
  return (
    <g>
      <rect x={x + SOMBRA} y={y + SOMBRA} width={ancho} height={alto} rx={30} fill={C.tinta} />
      <rect x={x} y={y} width={ancho} height={alto} rx={30} fill={C.blanco} {...T} />
      {/* interior (se ve al abrir) */}
      {puerta > 0 ? (
        <g>
          <rect x={x + 16} y={y + corte + 16} width={ancho - 32} height={alto - corte - 32} rx={12} fill="#DDEBFF" {...T} strokeWidth={5} />
          <line x1={x + 16} y1={y + corte + (alto - corte) * 0.45} x2={x + ancho - 16} y2={y + corte + (alto - corte) * 0.45} {...T} strokeWidth={5} />
        </g>
      ) : null}
      <line x1={x} y1={y + corte} x2={x + ancho} y2={y + corte} {...T} />
      <rect x={x + 24} y={y + 50} width={14} height={70} rx={7} fill={C.tinta} />
      {/* puerta de abajo: se achica hacia la izquierda como si girara */}
      <g>
        <rect x={x - abre * 0.08} y={y + corte} width={ancho - abre} height={alto - corte} rx={20} fill={C.blanco} {...T} opacity={puerta > 0 ? 1 : 0} />
        <rect x={x + 24 - abre * 0.08} y={y + corte + 40} width={14} height={110} rx={7} fill={C.tinta} />
      </g>
      {cara ? <Carita cx={x + ancho / 2} cy={y + corte * 0.48} cara={cara} s={0.9} parpadeo={t !== undefined && parpadea(t, x + 3)} /> : null}
    </g>
  );
};

/** Heladera a hielo antigua: mueble de madera con barra de hielo. `hielo` 1→0 la derrite. */
export const HeladeraHielo: React.FC<{ x: number; y: number; hielo: number; t: number }> = ({ x, y, hielo, t }) => {
  const W = 320, H = 520;
  const madera = "#C9824A";
  const hAlto = 120 * hielo;
  return (
    <g>
      <rect x={x + SOMBRA} y={y + SOMBRA} width={W} height={H} rx={18} fill={C.tinta} />
      <rect x={x} y={y} width={W} height={H} rx={18} fill={madera} {...T} />
      {/* compartimento del hielo, abierto arriba */}
      <rect x={x + 30} y={y + 30} width={W - 60} height={170} rx={10} fill="#8A4F25" {...T} strokeWidth={6} />
      {hielo > 0.02 ? (
        <rect x={x + 60 + (1 - hielo) * 40} y={y + 190 - hAlto} width={(W - 120) * (0.4 + 0.6 * hielo)} height={hAlto} rx={12}
          fill="#CDEBFF" {...T} strokeWidth={6} />
      ) : null}
      {/* charquito que crece mientras se derrite */}
      <ellipse cx={x + W / 2} cy={y + H + 30} rx={40 + 120 * (1 - hielo)} ry={10 + 12 * (1 - hielo)} fill="#9FD3FF" opacity={0.9 * (1 - hielo)} />
      {/* gotas */}
      {hielo < 0.95
        ? [0, 1, 2].map((i) => {
            const ciclo = ((t + i * 9) % 27) / 27;
            return <circle key={i} cx={x + 90 + i * 70} cy={y + 210 + ciclo * 300} r={9} fill="#7CC3FF" opacity={1 - ciclo} />;
          })
        : null}
      {/* puertas de abajo */}
      <rect x={x + 30} y={y + 230} width={W - 60} height={260} rx={10} fill={madera} {...T} strokeWidth={6} />
      <line x1={x + W / 2} y1={y + 230} x2={x + W / 2} y2={y + 490} {...T} strokeWidth={6} />
      <circle cx={x + W / 2 - 24} cy={y + 455} r={9} fill={C.tinta} />
      <circle cx={x + W / 2 + 24} cy={y + 455} r={9} fill={C.tinta} />
      {/* cara: tranquila con hielo entero, preocupada y transpirando mientras se derrite */}
      <Carita cx={x + W / 2} cy={y + 300} cara={hielo > 0.9 ? "feliz" : "preocupada"} s={0.8} parpadeo={parpadea(t, 5)} />
      {hielo <= 0.9 ? <Sudor x={x + W - 50} y={y + 250} t={t} /> : null}
    </g>
  );
};

/** Termómetro vertical con la zona de peligro marcada. `temp` en °C (0–100). */
export const Termometro: React.FC<{ x: number; y: number; temp: number; zona?: number }> = ({ x, y, temp, zona = 1 }) => {
  const alto = 640, ancho = 90;
  const yDe = (c: number) => y + alto - (c / 100) * alto;
  return (
    <g>
      {/* zona de peligro 4–60 °C */}
      <rect x={x - 70} y={yDe(60)} width={ancho + 140} height={yDe(4) - yDe(60)} rx={14} fill={C.rojo} opacity={0.22 * zona} />
      <rect x={x + SOMBRA} y={y + SOMBRA} width={ancho} height={alto} rx={45} fill={C.tinta} />
      <rect x={x} y={y} width={ancho} height={alto} rx={45} fill={C.blanco} {...T} />
      <rect x={x + 28} y={yDe(temp)} width={ancho - 56} height={y + alto - yDe(temp)} rx={17} fill={C.rojo} />
      <circle cx={x + ancho / 2 + SOMBRA} cy={y + alto + 40 + SOMBRA} r={70} fill={C.tinta} />
      <circle cx={x + ancho / 2} cy={y + alto + 40} r={70} fill={C.rojo} {...T} />
      {[0, 20, 40, 60, 80, 100].map((c) => (
        <line key={c} x1={x + ancho - 22} y1={yDe(c)} x2={x + ancho - 4} y2={yDe(c)} {...T} strokeWidth={5} />
      ))}
    </g>
  );
};

/** Bacteria verde con patitas y cara. */
export const Bacteria: React.FC<{ cx: number; cy: number; s?: number; t: number; color?: string; fiesta?: boolean }> = ({
  cx, cy, s = 1, t, color = C.verde, fiesta = false,
}) => {
  // de fiesta bailan más rápido y saltan
  const meneo = Math.sin(t / (fiesta ? 2.5 : 4) + cx) * (fiesta ? 12 : 6);
  const salto = fiesta ? -Math.abs(Math.sin(t / 3 + cx / 50)) * 18 : 0;
  cy += salto;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${meneo}) scale(${s})`}>
      {[-1, 1].map((lado) =>
        [0, 1, 2].map((i) => (
          <line key={`${lado}${i}`} x1={lado * 50} y1={-24 + i * 24} x2={lado * (78 + Math.sin(t / 3 + i) * 6)} y2={-30 + i * 28} {...T} strokeWidth={7} />
        ))
      )}
      <ellipse cx={8} cy={8} rx={62} ry={48} fill={C.tinta} />
      <ellipse cx={0} cy={0} rx={62} ry={48} fill={color} {...T} />
      <Carita cx={0} cy={-8} cara={fiesta ? "feliz" : "canchera"} s={0.55} parpadeo={parpadea(t, cx)} />
      {fiesta ? (
        // gorrito de cumpleaños
        <g transform="rotate(-14)">
          <path d="M-30 -42 L0 -128 L30 -42 Z" fill={C.amarillo} {...T} strokeWidth={6} />
          <path d="M-18 -76 L18 -76 M-10 -100 L10 -100" stroke={C.rojo} strokeWidth={7} strokeLinecap="round" />
          <circle cx={0} cy={-132} r={11} fill={C.rojo} {...T} strokeWidth={5} />
        </g>
      ) : null}
    </g>
  );
};

/** Tupper chato. */
export const Tupper: React.FC<{ x: number; y: number; ancho?: number; color?: string }> = ({ x, y, ancho = 210, color = C.azul }) => (
  <g>
    <rect x={x + 10} y={y + 10} width={ancho} height={70} rx={14} fill={C.tinta} />
    <rect x={x} y={y} width={ancho} height={70} rx={14} fill="#E7F0FF" {...T} strokeWidth={7} />
    <rect x={x - 8} y={y - 16} width={ancho + 16} height={24} rx={10} fill={color} {...T} strokeWidth={6} />
    <rect x={x + 14} y={y + 24} width={ancho - 28} height={34} rx={8} fill={C.rojo} opacity={0.75} />
  </g>
);

/** Reloj con aguja. `vueltas` = cuántas vueltas dio la aguja grande. */
export const Reloj: React.FC<{ cx: number; cy: number; r?: number; vueltas: number; color?: string }> = ({ cx, cy, r = 120, vueltas, color = C.blanco }) => {
  const a = vueltas * 2 * Math.PI - Math.PI / 2;
  const b = (vueltas / 12) * 2 * Math.PI - Math.PI / 2;
  return (
    <g>
      <circle cx={cx + SOMBRA} cy={cy + SOMBRA} r={r} fill={C.tinta} />
      <circle cx={cx} cy={cy} r={r} fill={color} {...T} />
      {Array.from({ length: 12 }).map((_, i) => {
        const g = (i / 12) * 2 * Math.PI;
        return <line key={i} x1={cx + Math.cos(g) * r * 0.78} y1={cy + Math.sin(g) * r * 0.78} x2={cx + Math.cos(g) * r * 0.9} y2={cy + Math.sin(g) * r * 0.9} {...T} strokeWidth={6} />;
      })}
      <line x1={cx} y1={cy} x2={cx + Math.cos(b) * r * 0.45} y2={cy + Math.sin(b) * r * 0.45} {...T} strokeWidth={12} />
      <line x1={cx} y1={cy} x2={cx + Math.cos(a) * r * 0.7} y2={cy + Math.sin(a) * r * 0.7} {...T} strokeWidth={8} />
      <circle cx={cx} cy={cy} r={12} fill={C.tinta} />
    </g>
  );
};

/** Sol con rayos que giran. */
export const Sol: React.FC<{ cx: number; cy: number; r?: number; t: number }> = ({ cx, cy, r = 90, t }) => (
  <g>
    <g transform={`rotate(${t * 1.5} ${cx} ${cy})`} {...T} strokeWidth={10}>
      {Array.from({ length: 10 }).map((_, i) => {
        const g = (i / 10) * 2 * Math.PI;
        return <line key={i} x1={cx + Math.cos(g) * r * 1.3} y1={cy + Math.sin(g) * r * 1.3} x2={cx + Math.cos(g) * r * 1.65} y2={cy + Math.sin(g) * r * 1.65} />;
      })}
    </g>
    <circle cx={cx + SOMBRA} cy={cy + SOMBRA} r={r} fill={C.tinta} />
    <circle cx={cx} cy={cy} r={r} fill={C.amarillo} {...T} />
    <Carita cx={cx} cy={cy - 10} cara="canchera" s={0.75} />
  </g>
);

/** Luna en cuarto creciente. */
export const Luna: React.FC<{ cx: number; cy: number; r?: number }> = ({ cx, cy, r = 80 }) => (
  <g>
    <path d={`M${cx + SOMBRA} ${cy - r + SOMBRA} a${r} ${r} 0 1 0 ${r * 0.9} ${r * 1.55} a${r * 0.8} ${r * 0.8} 0 1 1 -${r * 0.9} -${r * 1.55}z`} fill={C.tinta} />
    <path d={`M${cx} ${cy - r} a${r} ${r} 0 1 0 ${r * 0.9} ${r * 1.55} a${r * 0.8} ${r * 0.8} 0 1 1 -${r * 0.9} -${r * 1.55}z`} fill={C.amarillo} {...T} />
  </g>
);

/** Hornalla (anafe) con hornalla encendida. */
export const Anafe: React.FC<{ x: number; y: number; ancho?: number; fuego?: boolean; t: number }> = ({ x, y, ancho = 520, fuego = false, t }) => (
  <g>
    <rect x={x + SOMBRA} y={y + SOMBRA} width={ancho} height={90} rx={16} fill={C.tinta} />
    <rect x={x} y={y} width={ancho} height={90} rx={16} fill="#D9D9D9" {...T} />
    {[0.3, 0.7].map((p) => (
      <g key={p}>
        <ellipse cx={x + ancho * p} cy={y + 8} rx={80} ry={16} fill={C.tinta} />
        {fuego && p === 0.3
          ? [-40, 0, 40].map((dx, i) => (
              <path key={dx} d={`M${x + ancho * p + dx} ${y + 2} q-14 -${30 + Math.sin(t / 3 + i) * 8} 0 -${46 + Math.sin(t / 2 + i) * 10} q14 ${20} 0 ${46}z`}
                fill={C.azul} stroke={C.tinta} strokeWidth={4} />
            ))
          : null}
      </g>
    ))}
    {[0.15, 0.5, 0.85].map((p) => (
      <circle key={p} cx={x + ancho * p} cy={y + 55} r={16} fill={C.blanco} {...T} strokeWidth={5} />
    ))}
  </g>
);

/** Signo de pregunta gigante con sombra. */
export const Pregunta: React.FC<{ cx: number; cy: number; s?: number; color?: string; fuente: string }> = ({ cx, cy, s = 1, color = C.azul, fuente }) => (
  <g fontFamily={fuente} fontWeight={800} fontSize={420 * s} textAnchor="middle">
    <text x={cx + SOMBRA} y={cy + SOMBRA} fill={C.tinta}>?</text>
    <text x={cx} y={cy} fill={color} stroke={C.tinta} strokeWidth={TRAZO}>?</text>
  </g>
);

/** Rayitos de "sorpresa" sobre un punto. */
export const Rayitos: React.FC<{ cx: number; cy: number; s?: number }> = ({ cx, cy, s = 1 }) => (
  <g {...T} strokeWidth={8}>
    <line x1={cx} y1={cy - 10 * s} x2={cx} y2={cy - 60 * s} />
    <line x1={cx - 70 * s} y1={cy + 10 * s} x2={cx - 105 * s} y2={cy - 25 * s} />
    <line x1={cx + 70 * s} y1={cy + 10 * s} x2={cx + 105 * s} y2={cy - 25 * s} />
  </g>
);

/* ---------- Agua, pileta y verano ---------- */

/** Pileta vista de costado con olas que se mueven. */
export const Pileta: React.FC<{ x: number; y: number; ancho?: number; alto?: number; t: number }> = ({ x, y, ancho = 760, alto = 300, t }) => {
  const ola = (dy: number, fase: number) => {
    let d = `M${x} ${y + dy}`;
    for (let i = 0; i <= 12; i++) {
      const px = x + (ancho / 12) * i;
      d += ` L${px} ${y + dy + Math.sin(i * 1.1 + t / 6 + fase) * 8}`;
    }
    return d;
  };
  return (
    <g>
      <rect x={x + SOMBRA} y={y + SOMBRA} width={ancho} height={alto} rx={20} fill={C.tinta} />
      <rect x={x} y={y} width={ancho} height={alto} rx={20} fill="#7CC3FF" {...T} />
      <path d={ola(40, 0)} fill="none" stroke={C.blanco} strokeWidth={8} strokeLinecap="round" opacity={0.8} />
      <path d={ola(110, 2)} fill="none" stroke={C.blanco} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
      {/* escalerita */}
      <path d={`M${x + ancho - 90} ${y - 70} v120 M${x + ancho - 40} ${y - 70} v120`} {...T} strokeWidth={8} fill="none" />
      <path d={`M${x + ancho - 90} ${y - 30} h50 M${x + ancho - 90} ${y + 10} h50`} {...T} strokeWidth={7} />
    </g>
  );
};

/** Boya inflable (dona) con cara: la protagonista de los temas de verano. */
export const Flotador: React.FC<{ cx: number; cy: number; r?: number; cara?: Cara; t?: number }> = ({ cx, cy, r = 110, cara = "feliz", t }) => (
  <Vivo t={t ?? 0} bx={cx} by={cy + r} semilla={cx} fuerza={t === undefined ? 0 : 0.03}>
    <circle cx={cx + SOMBRA} cy={cy + SOMBRA} r={r} fill={C.tinta} />
    <circle cx={cx} cy={cy} r={r} fill={C.rojo} {...T} />
    {[0, 1, 2, 3].map((i) => {
      const a0 = (i / 4) * Math.PI * 2 + 0.3, a1 = a0 + 0.55;
      return (
        <path key={i} d={`M${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A${r} ${r} 0 0 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r} L${cx + Math.cos(a1) * r * 0.42} ${cy + Math.sin(a1) * r * 0.42} A${r * 0.42} ${r * 0.42} 0 0 0 ${cx + Math.cos(a0) * r * 0.42} ${cy + Math.sin(a0) * r * 0.42} Z`}
          fill={C.blanco} stroke={C.tinta} strokeWidth={5} />
      );
    })}
    <circle cx={cx} cy={cy} r={r * 0.4} fill="#7CC3FF" {...T} />
    <Carita cx={cx} cy={cy - r * 0.7} cara={cara} s={r / 140} parpadeo={t !== undefined && parpadea(t, cx)} />
  </Vivo>
);

/** Reposera de costado. */
export const Reposera: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path d={`M${x} ${y} L${x + 260} ${y} L${x + 340} ${y - 170}`} fill="none" stroke={C.tinta} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
    <path d={`M${x} ${y} L${x + 260} ${y} L${x + 340} ${y - 170}`} fill="none" stroke={C.amarillo} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
    <path d={`M${x + 30} ${y} l-30 90 M${x + 240} ${y} l40 90 M${x + 120} ${y} l90 90`} {...T} strokeWidth={10} />
  </g>
);

/** Panza con cara (para todo lo de digestión): un poroto rosado. */
export const Panza: React.FC<{ cx: number; cy: number; s?: number; cara?: Cara; t?: number; llena?: boolean }> = ({ cx, cy, s = 1, cara = "feliz", t, llena = false }) => (
  <Vivo t={t ?? 0} bx={cx} by={cy + 150 * s} semilla={cy} fuerza={t === undefined ? 0 : llena ? 0.05 : 0.025}>
    <g transform={`rotate(-12 ${cx} ${cy})`}>
      <ellipse cx={cx + SOMBRA} cy={cy + SOMBRA} rx={190 * s} ry={150 * s} fill={C.tinta} />
      <ellipse cx={cx} cy={cy} rx={190 * s} ry={150 * s} fill="#FF9EB5" {...T} />
      <path d={`M${cx - 60 * s} ${cy - 150 * s} q${-30 * s} ${-60 * s} ${-90 * s} ${-70 * s}`} fill="none" {...T} strokeWidth={22 * s} />
      <path d={`M${cx - 60 * s} ${cy - 150 * s} q${-30 * s} ${-60 * s} ${-90 * s} ${-70 * s}`} fill="none" stroke="#FF9EB5" strokeWidth={8 * s} strokeLinecap="round" />
    </g>
    <Carita cx={cx} cy={cy - 10 * s} cara={cara} s={1.0 * s} parpadeo={t !== undefined && parpadea(t, cy)} />
  </Vivo>
);

/** Gotita (de sangre o de agua). */
export const Gota: React.FC<{ cx: number; cy: number; s?: number; color?: string }> = ({ cx, cy, s = 1, color = C.rojo }) => (
  <path d={`M${cx} ${cy - 30 * s} C${cx + 18 * s} ${cy - 6 * s} ${cx + 22 * s} ${cy + 6 * s} ${cx + 22 * s} ${cy + 12 * s}
    a${22 * s} ${22 * s} 0 0 1 -${44 * s} 0 C${cx - 22 * s} ${cy + 6 * s} ${cx - 18 * s} ${cy - 6 * s} ${cx} ${cy - 30 * s}Z`}
    fill={color} stroke={C.tinta} strokeWidth={5} />
);

/** Libro cerrado con título en la tapa. */
export const Libro: React.FC<{ x: number; y: number; titulo: string; fuente: string; color?: string; t?: number }> = ({ x, y, titulo, fuente, color = "#5B8C3A", t = 0 }) => (
  <g transform={`rotate(${Math.sin(t / 10) * 2} ${x + 160} ${y + 220})`}>
    <rect x={x + SOMBRA} y={y + SOMBRA} width={320} height={430} rx={14} fill={C.tinta} />
    <rect x={x} y={y} width={320} height={430} rx={14} fill={color} {...T} />
    <rect x={x + 22} y={y} width={18} height={430} fill={C.tinta} opacity={0.25} />
    <rect x={x + 60} y={y + 60} width={220} height={130} rx={10} fill={C.papel} {...T} strokeWidth={6} />
    <text x={x + 170} y={y + 140} textAnchor="middle" fontFamily={fuente} fontWeight={800} fontSize={46} fill={C.tinta}>{titulo}</text>
    <path d={`M${x + 90} ${y + 260} h160 M${x + 90} ${y + 300} h120`} stroke={C.papel} strokeWidth={10} strokeLinecap="round" opacity={0.7} />
  </g>
);

/** Botella con cara (alcohol). */
export const Botella: React.FC<{ x: number; y: number; cara?: Cara; t?: number }> = ({ x, y, cara = "canchera", t }) => {
  const d = `M${x + 70} ${y} h60 v90 c0 30 60 50 60 110 v240 a24 24 0 0 1 -24 24 h-132 a24 24 0 0 1 -24 -24 v-240 c0 -60 60 -80 60 -110 Z`;
  return (
    <Vivo t={t ?? 0} bx={x + 100} by={y + 464} semilla={x} fuerza={t === undefined ? 0 : 0.03}>
      <path d={d} transform={`translate(${SOMBRA} ${SOMBRA})`} fill={C.tinta} />
      <path d={d} fill="#3FAE5A" {...T} />
      <rect x={x + 62} y={y - 24} width={76} height={34} rx={8} fill={C.amarillo} {...T} strokeWidth={6} />
      <rect x={x + 20} y={y + 250} width={160} height={110} rx={10} fill={C.papel} {...T} strokeWidth={6} />
      <Carita cx={x + 100} cy={y + 285} cara={cara} s={0.7} parpadeo={t !== undefined && parpadea(t, x)} />
    </Vivo>
  );
};

/** Parrilla con carne (asado). */
export const Parrilla: React.FC<{ x: number; y: number; t: number; humo?: boolean }> = ({ x, y, t, humo = true }) => (
  <g>
    {humo ? <Vapor x={x + 230} y={y - 20} t={t} n={4} sep={90} alto={100} opacidad={0.5} /> : null}
    <rect x={x + SOMBRA} y={y + SOMBRA} width={460} height={60} rx={10} fill={C.tinta} />
    <rect x={x} y={y} width={460} height={60} rx={10} fill="#9A9A9A" {...T} />
    {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={x + 30 + i * 50} y1={y + 8} x2={x + 30 + i * 50} y2={y + 52} {...T} strokeWidth={5} />)}
    {/* carne y chori */}
    <ellipse cx={x + 140} cy={y - 18} rx={100} ry={34} fill="#B5452E" {...T} strokeWidth={7} />
    <rect x={x + 270} y={y - 44} width={150} height={44} rx={22} fill="#C0392B" {...T} strokeWidth={7} />
    <path d={`M${x + 40} ${y + 60} l-30 140 M${x + 420} ${y + 60} l30 140`} {...T} strokeWidth={12} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={x + 120 + i * 110} cy={y + 110} r={18 + Math.sin(t / 4 + i) * 4} fill={C.rojo} opacity={0.8} />
    ))}
  </g>
);

/* ---------- Lluvia, tierra y olfato ---------- */

/** Tira de tierra/suelo a lo ancho de la pantalla (los bordes quedan fuera de cuadro). */
export const Suelo: React.FC<{ y: number; alto?: number; x?: number; ancho?: number }> = ({ y, alto = 260, x = -20, ancho = 1120 }) => (
  <g>
    <rect x={x} y={y + 2} width={ancho} height={alto} fill="#B07A3F" />
    <rect x={x} y={y} width={ancho} height={46} fill="#8A5A2B" />
    <line x1={x} y1={y} x2={x + ancho} y2={y} {...T} />
    {[0.1, 0.26, 0.44, 0.6, 0.78, 0.92].map((p, i) => (
      <circle key={i} cx={x + ancho * p} cy={y + 120 + (i % 3) * 44} r={9} fill="#6E4722" />
    ))}
  </g>
);

/** Nube con cara, dibujada como sticker (silueta negra + relleno, sin costuras internas). `lluvia` suelta gotitas; `intensa` = diluvio. */
export const Nube: React.FC<{ cx: number; cy: number; s?: number; t?: number; cara?: Cara; lluvia?: boolean; intensa?: boolean; color?: string }> = ({
  cx, cy, s = 1, t = 0, cara = "feliz", lluvia = false, intensa = false, color = C.blanco,
}) => {
  const bob = Math.sin(t / 12) * 6;
  const bultos = [
    { dx: -135, dy: 25, r: 68 }, { dx: -55, dy: -32, r: 96 },
    { dx: 48, dy: -40, r: 92 }, { dx: 138, dy: 12, r: 72 }, { dx: 6, dy: 38, r: 92 },
  ];
  const sil = (ox: number, oy: number, fill: string, extra: number, key: string) =>
    bultos.map((b, i) => (
      <circle key={`${key}${i}`} cx={cx + b.dx * s + ox} cy={cy + b.dy * s + oy + bob} r={(b.r + extra) * s} fill={fill} />
    ));
  const n = intensa ? 9 : 5;
  return (
    <g>
      {sil(SOMBRA, SOMBRA, C.tinta, TRAZO, "sh")}
      {sil(0, 0, C.tinta, TRAZO, "ln")}
      {sil(0, 0, color, 0, "fl")}
      <g transform={`translate(${cx} ${cy + 6 * s + bob})`}>
        <Carita cx={0} cy={0} cara={cara} s={0.72 * s} parpadeo={parpadea(t, cx)} />
      </g>
      {lluvia
        ? Array.from({ length: n }).map((_, i) => {
            const periodo = intensa ? 18 : 30;
            const ciclo = ((t + i * 7) % periodo) / periodo;
            const gx = cx + (i - (n - 1) / 2) * (intensa ? 30 : 52) * s;
            const gy = cy + 80 * s + bob + ciclo * 170 * s;
            return <Gota key={`g${i}`} cx={gx} cy={gy} s={0.6 * s} color="#7CC3FF" />;
          })
        : null}
    </g>
  );
};

/** Bife con cara. `coccion` 0 (crudo) → 1 (pasado) cambia el color; `costra` dibuja las marcas de la parrilla. */
export const Bife: React.FC<{ cx: number; cy: number; s?: number; t?: number; cara?: Cara; coccion?: number; costra?: boolean }> = ({
  cx, cy, s = 1, t = 0, cara = "feliz", coccion = 0.6, costra = true,
}) => {
  const sup = coccion < 0.33 ? "#E06A7A" : coccion < 0.72 ? "#B5633C" : "#7E4327";
  return (
    <Vivo t={t} bx={cx} by={cy + 150 * s} semilla={cx} fuerza={t === 0 ? 0 : 0.03}>
      <g transform={`translate(${cx} ${cy}) scale(${s})`}>
        <ellipse cx={SOMBRA} cy={SOMBRA} rx={230} ry={150} fill={C.tinta} />
        <ellipse cx={0} cy={0} rx={230} ry={150} fill={sup} {...T} />
        {/* borde de grasa */}
        <ellipse cx={0} cy={0} rx={202} ry={132} fill="none" stroke="#F0D9A0" strokeWidth={14} opacity={0.55} />
        {/* marcas de la parrilla */}
        {costra
          ? [-120, -45, 30, 105].map((dx, i) => (
              <line key={i} x1={dx - 30} y1={-72} x2={dx + 50} y2={72} stroke={C.tinta} strokeWidth={10} opacity={0.28} strokeLinecap="round" />
            ))
          : null}
        <Carita cx={0} cy={-6} cara={cara} s={0.72} parpadeo={parpadea(t, cx)} />
      </g>
    </Vivo>
  );
};

/** Tenedor parrillero (prop). `rot` lo inclina; los dientes miran hacia arriba. */
export const Tenedor: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-10 + SOMBRA} y={SOMBRA} width={20} height={230} rx={10} fill={C.tinta} />
    <rect x={-10} y={0} width={20} height={230} rx={10} fill="#9A9A9A" {...T} strokeWidth={6} />
    <rect x={-24} y={200} width={48} height={120} rx={16} fill="#8A4F25" {...T} strokeWidth={6} />
    <path d="M-24 2 v-74 M0 2 v-90 M24 2 v-74" stroke={C.tinta} strokeWidth={10} strokeLinecap="round" fill="none" />
  </g>
);

/* ---------- Granizo y tormenta ---------- */

/** Piedra de granizo: bola de hielo con facetas. `capas` dibuja los anillos tipo cebolla; `cara` la hace personaje. */
export const Piedra: React.FC<{ cx: number; cy: number; r?: number; t?: number; cara?: Cara; capas?: boolean }> = ({
  cx, cy, r = 60, t, cara, capas = false,
}) => {
  const bob = t !== undefined ? Math.sin(t / 10 + cx) * 3 : 0;
  const y = cy + bob;
  return (
    <g>
      <circle cx={cx + SOMBRA} cy={y + SOMBRA} r={r} fill={C.tinta} />
      <circle cx={cx} cy={y} r={r} fill="#CDEBFF" {...T} />
      {capas
        ? [0.74, 0.5, 0.26].map((f, i) => (
            <circle key={i} cx={cx} cy={y} r={r * f} fill="none" stroke="#7CC3FF" strokeWidth={6} opacity={0.85} />
          ))
        : null}
      {/* brillo */}
      <path d={`M${cx - r * 0.42} ${y - r * 0.5} q${r * 0.2} ${r * 0.1} ${r * 0.32} ${r * 0.34}`} fill="none" stroke={C.blanco} strokeWidth={9} strokeLinecap="round" opacity={0.9} />
      {cara ? <Carita cx={cx} cy={y + (capas ? 0 : 4)} cara={cara} s={r / 92} parpadeo={t !== undefined && parpadea(t, cx)} /> : null}
    </g>
  );
};

/** Cara de perfil olfateando, con nariz prominente. Mira a la izquierda: poné el Vapor a su izquierda. */
export const Nariz: React.FC<{ cx: number; cy: number; s?: number; t?: number; cara?: Cara }> = ({ cx, cy, s = 1, t = 0, cara = "feliz" }) => {
  const sniff = 1 + Math.sin(t / 5) * 0.05;
  const boca = cara === "canchera" ? "M18 70 q34 22 72 2" : "M16 72 q36 24 74 6";
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <circle cx={SOMBRA} cy={SOMBRA} r={124} fill={C.tinta} />
      <circle cx={0} cy={0} r={124} fill="#FFD9B0" {...T} />
      {/* nariz que sobresale a la izquierda, con leve olfateo */}
      <g style={{ transformOrigin: "-150px 40px" }} transform={`scale(${sniff} 1)`}>
        <path d="M-96 2 q-76 14 -88 54 q-6 26 42 32 q30 4 44 -12 Z" fill="#FFD9B0" {...T} />
        <ellipse cx={-150} cy={64} rx={13} ry={10} fill={C.tinta} />
      </g>
      {/* ojo + ceja */}
      <circle cx={34} cy={-34} r={17} fill={C.blanco} {...T} strokeWidth={5} />
      <circle cx={29} cy={-31} r={7} fill={C.tinta} />
      <path d="M8 -66 q30 -16 58 -4" fill="none" {...T} strokeWidth={6} />
      {/* boca */}
      <path d={boca} fill="none" {...T} strokeWidth={7} />
    </g>
  );
};

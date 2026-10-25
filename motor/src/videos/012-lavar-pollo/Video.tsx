import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/012-lavar-pollo/tiempos.json";
import { C } from "../../kit/marca";
import { clamp, entre, golpe } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Sarten, oscuro, claro, mezclar, MAT, LINEA } from "../../kit/biblioteca";
import { Camara, Contador, OndasCalor, Rotulo, TONO, toma } from "../../kit/diagrama";

// Mundo único: una cocina en corte. Mesada con pileta al centro y canilla arriba; un pollo crudo debajo del chorro
// con bacterias encima; a la izquierda un tomate; a la derecha una sartén.
// Mecanismo: el chorro hace saltar las bacterias del pollo y las reparte por la pileta, la mesada y el tomate.
// Lo que las mata es la cocción: el pollo pasa a la sartén y las bacterias que tiene encima desaparecen.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  reparte: r.f(2),
  gotitas: r.f(3),
  estudio: r.f(4),
  seis: r.f(5),
  toques: r.f(6),
  coccion: r.f(7),
  manos: r.f(8),
  sacalo: r.f(9),
  manda: r.f(10),
  sello: r.fin(10) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const MESADA = 1340;       // borde de arriba de la mesada
const FONDO_PILETA = 1500;
const PX = 540, PY = 1405; // pollo en la pileta
const SX = 940, SY = 1300; // sartén
const TX = 90, TY = 1295;  // tomate
const VERDE_BAC = "#7FB800";

const grifoAbierto = (f: number) => f < E.estudio || (f >= E.manos && f < E.sacalo);

/* ---------- Pollo con volumen ---------- */
const Pollo: React.FC<{ x: number; y: number; s?: number; coc?: number }> = ({ x, y, s = 1, coc = 0 }) => {
  const piel = mezclar("#F6C98B", "#B5651D", coc);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={12} cy={14} rx={160} ry={100} fill={C.tinta} />
      {/* patitas */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <ellipse cx={d * 118} cy={52} rx={46} ry={32} transform={`rotate(${d * 28} ${d * 118} 52)`} fill={oscuro(piel, 0.12)} stroke={C.tinta} strokeWidth={LINEA} />
          <circle cx={d * 156} cy={82} r={13} fill="#FFFFFF" stroke={C.tinta} strokeWidth={5} />
        </g>
      ))}
      <ellipse cx={0} cy={0} rx={150} ry={95} fill={piel} stroke={C.tinta} strokeWidth={LINEA} />
      <ellipse cx={0} cy={22} rx={120} ry={60} fill={oscuro(piel, 0.1)} opacity={0.55} />
      <ellipse cx={-48} cy={-38} rx={60} ry={24} fill="#FFFFFF" opacity={0.4} />
      {[[-60, 6], [20, -4], [70, 28], [-20, 40], [96, -22]].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={5} fill={oscuro(piel, 0.25)} opacity={0.7} />
      ))}
    </g>
  );
};

/* ---------- Bacteria: manchita verde con puntas (sin cara) ---------- */
const Bac: React.FC<{ x: number; y: number; s?: number; t: number; rot?: number }> = ({ x, y, s = 1, t, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot + Math.sin(t / 7 + x) * 8}) scale(${s})`}>
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={i} x1={0} y1={0} x2={Math.cos((i / 8) * Math.PI * 2) * 25} y2={Math.sin((i / 8) * Math.PI * 2) * 25}
        stroke={C.tinta} strokeWidth={5} strokeLinecap="round" />
    ))}
    <circle cx={2} cy={2} r={17} fill={C.tinta} />
    <circle cx={0} cy={0} r={17} fill={VERDE_BAC} stroke={C.tinta} strokeWidth={5} />
    <circle cx={-6} cy={-6} r={5} fill="#FFFFFF" opacity={0.7} />
  </g>
);

/* Bacterias que viven sobre el pollo (posiciones relativas) */
const SOBRE_POLLO: [number, number][] = [[-80, -30], [-20, -50], [50, -35], [95, 0], [-50, 25], [30, 30]];

/* Destinos del salpicado */
const DESTINOS: [number, number][] = [
  [200, MESADA - 18], [262, MESADA - 18], [340, 1380], [740, 1380],
  [345, 1450], [735, 1450], [430, FONDO_PILETA - 18], [650, FONDO_PILETA - 18],
];

const DEST_TOMATE: [number, number][] = [[TX - 30, TY - 30], [TX + 20, TY - 40], [TX + 36, TY - 4], [TX - 36, TY + 8]];

const vuelo = (f: number, ini: number, de: [number, number], a: [number, number], dur: number, alto: number) => {
  const p = interpolate(f, [ini, ini + dur], [0, 1], clamp);
  return { x: de[0] + (a[0] - de[0]) * p, y: de[1] + (a[1] - de[1]) * p - 4 * alto * p * (1 - p), p };
};

const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const abierto = grifoAbierto(f);
  // posición del pollo: pileta → sartén en la cocción
  const vp = interpolate(f, [E.coccion, E.coccion + 26], [0, 1], clamp);
  const px = PX + (SX - PX) * vp;
  const py = PY + (SY - 24 - PY) * vp - 4 * 260 * vp * (1 - vp);
  const coc = interpolate(f, [E.coccion + 26, E.coccion + 80], [0, 1], clamp);
  const encoge = interpolate(f, [E.coccion + 26, E.coccion + 46], [1, 0], clamp);
  const enSarten = f >= E.coccion + 26;

  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* mesada */}
      <rect x={-400} y={MESADA} width={1880} height={700} fill={TONO.tierra} stroke={C.tinta} strokeWidth={7} />
      <rect x={-400} y={MESADA} width={1880} height={18} fill={claro(TONO.tierra, 0.35)} />
      {/* pileta (corte) */}
      <rect x={320} y={MESADA - 4} width={440} height={FONDO_PILETA - MESADA + 24} fill={C.tinta} />
      <rect x={326} y={MESADA + 4} width={428} height={FONDO_PILETA - MESADA + 10} fill={claro(C.azul, 0.7)} />
      <rect x={326} y={MESADA + 4} width={428} height={36} fill={oscuro(claro(C.azul, 0.7), 0.15)} />
      <ellipse cx={540} cy={FONDO_PILETA + 6} rx={40} ry={9} fill={C.tinta} opacity={0.6} />
      {/* canilla */}
      <rect x={778} y={1050} width={24} height={300} fill={MAT.metalOscuro} stroke={C.tinta} strokeWidth={6} />
      <path d="M790 1345 L790 1090 Q790 1040 750 1040 L640 1040" fill="none" stroke={C.tinta} strokeWidth={34} strokeLinecap="round" />
      <path d="M790 1345 L790 1090 Q790 1040 750 1040 L640 1040" fill="none" stroke={MAT.metal} strokeWidth={20} strokeLinecap="round" />
      {/* tomate */}
      <circle cx={TX + 6} cy={TY + 6} r={52} fill={C.tinta} />
      <circle cx={TX} cy={TY} r={52} fill={C.rojo} stroke={C.tinta} strokeWidth={LINEA} />
      <ellipse cx={TX - 16} cy={TY - 18} rx={14} ry={8} fill="#FFFFFF" opacity={0.6} />
      <path d={`M${TX - 18} ${TY - 50} l18 12 l18 -12`} fill="none" stroke={C.verde} strokeWidth={10} strokeLinecap="round" />

      {/* agua cayendo */}
      {abierto ? (
        <g fill={C.azul} stroke={C.tinta} strokeWidth={3}>
          {Array.from({ length: 6 }).map((_, i) => {
            const y = 1056 + ((f * 16 + i * 50) % 250);
            return <ellipse key={i} cx={640 + Math.sin(i) * 3} cy={y} rx={9} ry={16} />;
          })}
        </g>
      ) : null}
      {abierto ? <rect x={633} y={1056} width={14} height={Math.max(0, (f < E.manos ? PY - 120 : 1390) - 1056)} fill={C.azul} opacity={0.35} /> : null}

      {/* sartén y llama de calor */}
      <Sarten x={SX} y={SY} s={0.7} />

      {/* pollo */}
      <Pollo x={px} y={py} s={enSarten ? 0.62 : 1} coc={coc} />

      {/* bacterias sobre el pollo (hasta que se las lleva el chorro y la cocción las borra) */}
      {SOBRE_POLLO.map(([dx, dy], i) => {
        const sale = E.reparte + i * 4;
        if (f >= sale && f < E.coccion) return null;
        const esc = f >= E.coccion + 26 ? encoge : 1;
        if (esc <= 0) return null;
        const bx = px + dx * (enSarten ? 0.62 : 1);
        const by = py + dy * (enSarten ? 0.62 : 1);
        return <Bac key={i} x={bx} y={by} s={0.9 * esc} t={f} rot={i * 40} />;
      })}

      {/* bacterias salpicadas: vuelan desde el pollo y quedan donde caen */}
      {DESTINOS.map((d, i) => {
        const ini = E.reparte + i * 3;
        if (f < ini) return null;
        const v = vuelo(f, ini, [PX + SOBRE_POLLO[i % 6][0], PY + SOBRE_POLLO[i % 6][1]], d, 22, 230);
        return <Bac key={i} x={v.x} y={v.y + (v.p >= 1 ? Math.sin(f / 6 + i) * 2 : 0)} s={0.85} t={f} rot={i * 33} />;
      })}

      {/* bacterias que saltan de la pileta al tomate ("lo que toques") */}
      {DEST_TOMATE.map((d, i) => {
        const ini = E.toques + i * 6;
        if (f < ini) return null;
        const v = vuelo(f, ini, [i % 2 ? 430 : 650, FONDO_PILETA - 18], d, 30, 420);
        return <Bac key={`t${i}`} x={v.x} y={v.y} s={0.8} t={f} rot={i * 50} />;
      })}

      {/* espuma de jabón */}
      {f >= E.manos && f < E.sacalo ? (
        <g fill="#FFFFFF" stroke={C.azul} strokeWidth={5}>
          {Array.from({ length: 9 }).map((_, i) => {
            const ciclo = ((f * 3 + i * 40) % 300) / 300;
            return <circle key={i} cx={360 + i * 40 + Math.sin(f / 9 + i) * 10} cy={FONDO_PILETA - 10 - ciclo * 300} r={14 + (i % 3) * 7} opacity={Math.min(1, (1 - ciclo) * 3)} />;
          })}
        </g>
      ) : null}

      {/* calor sobre la sartén */}
      <OndasCalor xs={[SX - 60, SX, SX + 60]} y={SY - 130} t={f} opacidad={f >= E.coccion + 20 && f < E.manos ? 0.9 : 0} />
    </svg>
  );
};

/* ---------- Anotaciones pegadas al mundo ---------- */
const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {entre(f, E.gancho + 20, E.reparte) ? (
        <Rotulo texto="bacterias del pollo crudo" desde={r.w(0, "pollo")} x={310} y={1150} ax={PX - 70} ay={PY - 40} color={C.tinta} fondo={C.amarillo} tam={26} />
      ) : null}
      {entre(f, E.reparte, E.gotitas) ? (
        <Rotulo texto="el chorro las reparte" desde={r.w(2, "reparte")} x={310} y={1150} ax={PX - 60} ay={PY - 40} color={C.blanco} fondo={C.rojo} tam={26} />
      ) : null}
      {entre(f, E.gotitas, E.estudio) ? (
        <Rotulo texto="salpica a todo" desde={r.w(3, "gotitas")} x={250} y={1150} ax={262} ay={MESADA - 40} color={C.blanco} fondo={C.rojo} tam={28} />
      ) : null}
      {entre(f, E.estudio, E.seis) ? (
        <Contador hasta={300} desde={E.estudio + 40} dur={26} despues=" personas" x={450} y={1060} tam={96} color={C.azul} etiqueta="cocina de prueba" />
      ) : null}
      {entre(f, E.seis, E.toques) ? (
        <>
          <Contador hasta={6} desde={r.w(5, "seis")} dur={14} despues=" de 10" x={450} y={960} tam={120} color={C.rojo} etiqueta="con bacterias en la pileta" />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {Array.from({ length: 10 }).map((_, i) => {
              const on = f >= r.w(5, "seis") + i * 3;
              return on ? <Bac key={i} x={135 + i * 90} y={1170} s={i < 6 ? 1 : 0.85} t={f} /> : null;
            })}
          </svg>
        </>
      ) : null}
      {entre(f, E.toques, E.coccion) ? (
        <Rotulo texto="lo que toques después" desde={r.w(6, "toques")} x={300} y={1120} ax={TX + 20} ay={TY - 50} color={C.blanco} fondo={C.rojo} tam={26} />
      ) : null}
      {entre(f, E.coccion, E.manos) ? (
        <Contador hasta={74} desde={r.w(7, "setenta")} dur={22} despues=" °C" x={760} y={1020} tam={110} color={C.rojo} etiqueta="por dentro" />
      ) : null}
    </>
  );
};

/* ---------- Cámara ---------- */
const TOMAS = [
  toma(0, 540, 1150, 1.0), toma(E.golpe - 2, 540, 1150, 1.0),
  toma(E.golpe + 10, 540, 1200, 1.15), toma(E.reparte - 2, 540, 1200, 1.15),
  toma(E.reparte + 10, 540, 1180, 1.0), toma(E.gotitas - 2, 540, 1180, 1.0),
  toma(E.gotitas + 10, 600, 1180, 0.95), toma(E.estudio - 2, 600, 1180, 0.95),
  toma(E.estudio + 10, 540, 1120, 1.0), toma(E.seis - 2, 540, 1120, 1.0),
  toma(E.seis + 10, 540, 1120, 1.0), toma(E.toques - 2, 540, 1120, 1.0),
  toma(E.toques + 10, 400, 1230, 1.25), toma(E.coccion - 2, 400, 1230, 1.25),
  toma(E.coccion + 10, 780, 1180, 1.2), toma(E.manos - 2, 780, 1180, 1.2),
  toma(E.manos + 10, 540, 1180, 1.1), toma(E.sacalo - 2, 540, 1180, 1.1),
  toma(E.sacalo + 10, 780, 1180, 1.15), toma(E.manda - 2, 780, 1180, 1.15),
  toma(E.manda + 10, 540, 1150, 1.0), toma(E.sello, 540, 1150, 0.95),
];
const GOLPES = [r.w(2, "mata"), r.w(2, "reparte"), r.w(5, "seis"), r.w(7, "setenta"), r.w(8, "jabón")];

const Diagrama: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= E.sello) return null;
  const g = GOLPES.reduce((m, k) => m * golpe(f, k, 1.05, 12), 1);
  return (
    <AbsoluteFill style={{ scale: g }}>
      <Camara tomas={TOMAS}>
        <Mundo />
        <Anotaciones />
      </Camara>
    </AbsoluteFill>
  );
};

/* ---------- Capas de pantalla ---------- */
const Gancho: React.FC = () => (
  <>
    <Etiqueta texto="lo hace casi todo el mundo" desde={-8} />
    <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={430} tam={52} />
    <Globo texto="¡quedó limpito!" desde={r.w(0, "limpito")} x={800} y={780} cola="izq" tam={40} ancho={380} />
  </>
);

const Golpe: React.FC = () => {
  const ra = r.w(1, "revés") - E.golpe;
  return (
    <>
      <Etiqueta texto="la verdad" color={C.verde} />
      <Titulo pregunta="lavar el pollo crudo…" desdeP={0} respuesta="¡es peor!" desdeR={ra} top={415} tamR={90} />
      <Sello texto="MITO" desde={ra + 2} x={760} y={270} rot={-8} color={C.rojo} tam={74} />
    </>
  );
};

const Ojo: React.FC = () => (
  <Sello texto="OJO" desde={0} x={440} y={320} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
);

const Sacalo: React.FC = () => (
  <>
    <Etiqueta texto="del envase a la sartén" color={C.verde} />
    <Sello texto="SIN LAVAR" desde={r.w(9, "cocinalo") - E.sacalo} x={330} y={330} rot={-6} color={C.verde} tam={64} />
  </>
);

const Manda: React.FC = () => {
  const man = r.w(10, "Mandáselo") - E.manda;
  return (
    <>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={340} />
      <Globo texto="baña al pollo en la pileta" desde={man + 20} x={540} y={600} cola="izq" tam={38} ancho={460} />
    </>
  );
};

export const LavarPollo012: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [r.w(0, "limpito"), "burbuja", 0.35],
    [E.golpe, "whoosh", 0.35], [r.w(1, "revés") - 2, "scratch", 0.55], [r.w(1, "revés"), "sello", 0.5],
    [E.reparte, "pop"], [r.w(2, "reparte"), "boing", 0.45],
    [E.gotitas, "whoosh", 0.35], [r.w(3, "gotitas"), "pop", 0.4],
    [E.estudio, "pop"], [E.estudio + 40, "tic", 0.4], [E.estudio + 66, "ding", 0.4],
    [E.seis, "whoosh", 0.35], [r.w(5, "seis"), "tic", 0.4], [r.w(5, "seis") + 14, "ding", 0.45],
    [E.toques, "pop"], [r.w(6, "toques"), "error", 0.4],
    [E.coccion, "whoosh", 0.35], [r.w(7, "setenta"), "tic", 0.4], [r.w(7, "setenta") + 22, "ding", 0.45],
    [E.manos, "sello", 0.5], [r.w(8, "jabón"), "burbuja", 0.4],
    [E.sacalo, "pop"], [r.w(9, "cocinalo"), "sello", 0.5],
    [E.manda, "pop"], [r.w(10, "Mandáselo"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo"><Logo /></Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.golpe - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · golpe" from={E.golpe} durationInFrames={E.reparte - E.golpe} layout="none"><Golpe /></Sequence>
      <Sequence name="3 · reparte" from={E.reparte} durationInFrames={E.gotitas - E.reparte} layout="none"><Etiqueta texto="el agua no las mata" color={C.rojo} /></Sequence>
      <Sequence name="4 · gotitas" from={E.gotitas} durationInFrames={E.estudio - E.gotitas} layout="none"><Etiqueta texto="gotitas por toda la cocina" color={C.rojo} /></Sequence>
      <Sequence name="5 · estudio" from={E.estudio} durationInFrames={E.seis - E.estudio} layout="none">
        <Etiqueta texto="el estudio" /><Fuente texto="USDA (EE. UU.)" />
      </Sequence>
      <Sequence name="6 · seis" from={E.seis} durationInFrames={E.toques - E.seis} layout="none">
        <Etiqueta texto="los que lavaron el pollo" color={C.rojo} /><Fuente texto="USDA (EE. UU.)" />
      </Sequence>
      <Sequence name="7 · toques" from={E.toques} durationInFrames={E.coccion - E.toques} layout="none"><Etiqueta texto="pasan a lo que tocás" color={C.rojo} /></Sequence>
      <Sequence name="8 · coccion" from={E.coccion} durationInFrames={E.manos - E.coccion} layout="none">
        <Etiqueta texto="la cocción sí las mata" color={C.verde} /><Fuente texto="CDC" />
      </Sequence>
      <Sequence name="9 · ojo" from={E.manos} durationInFrames={E.sacalo - E.manos} layout="none"><Ojo /></Sequence>
      <Sequence name="10 · sacalo" from={E.sacalo} durationInFrames={E.manda - E.sacalo} layout="none"><Sacalo /></Sequence>
      <Sequence name="11 · manda" from={E.manda} durationInFrames={DURACION - E.manda} layout="none"><Manda /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("012-lavar-pollo/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada012: React.FC = () => (
  <Portada arriba="¿lavar el pollo crudo?" grande="NO" sello="MITO" colorSello={C.rojo} numero={12}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(540 -300) scale(1.5)"><Pollo x={0} y={1100} /></g>
      {[[-190, 880], [-80, 800], [90, 790], [200, 880], [-260, 1000], [260, 1010]].map(([dx, dy], i) => (
        <Bac key={i} x={540 + dx * 1.3} y={dy + 120} s={1.5} t={10} rot={i * 40} />
      ))}
    </svg>
  </Portada>
);

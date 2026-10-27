import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/015-descongelar-mesada/tiempos.json";
import { C, display, mono, sombra } from "../../kit/marca";
import { clamp, entre, golpe, pop } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Bife, Heladera, oscuro, claro, MAT, LINEA } from "../../kit/biblioteca";
import { Camara, Contador, OndasCalor, Paso, Rotulo, SolVolumen, TONO, toma } from "../../kit/diagrama";

// Mundo único: una mesada larga de cocina en corte, con cuatro estaciones de izquierda a derecha:
// la mesada (donde NO se descongela), la heladera, un recipiente con agua fría y el microondas.
// Un bife congelado (con el centro de hielo a la vista) viaja de estación en estación y la cámara lo sigue.
// Mecanismo: afuera el bife se descongela y entra en la zona de peligro (bacterias) mientras el centro sigue duro.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  fuera: r.f(2),
  zona: r.f(3),
  usda: r.f(4),
  heladera: r.f(5),
  agua: r.f(6),
  micro: r.f(7),
  ojo: r.f(8),
  noche: r.f(9),
  manda: r.f(10),
  sello: r.fin(10) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const MESA = 1400;
const AGUA = "#9FD3F5";
const VERDE_BAC = "#7FB800";

type Est = { x: number; y: number; s: number };
const A: Est = { x: 290, y: 1290, s: 1.15 };   // mesada
const F: Est = { x: 780, y: 1195, s: 0.42 };   // estante de la heladera
const W: Est = { x: 1180, y: 1330, s: 0.6 };   // dentro de la bolsa, en el agua
const M: Est = { x: 1610, y: 1265, s: 0.45 };  // plato del microondas

const PASOS: { f: number; a: Est; dur: number; arco: number }[] = [
  { f: E.heladera, a: F, dur: 24, arco: 200 },
  { f: E.agua, a: W, dur: 26, arco: 220 },
  { f: E.micro, a: M, dur: 26, arco: 220 },
  { f: E.ojo, a: A, dur: 40, arco: 300 },
  { f: E.noche + 10, a: F, dur: 24, arco: 200 },
  { f: E.manda, a: A, dur: 26, arco: 220 },
];
const ubicacion = (f: number): Est => {
  let desde = A;
  for (const p of PASOS) {
    if (f < p.f) return desde;
    const k = interpolate(f, [p.f, p.f + p.dur], [0, 1], clamp);
    if (k < 1) {
      return {
        x: desde.x + (p.a.x - desde.x) * k,
        y: desde.y + (p.a.y - desde.y) * k - 4 * p.arco * k * (1 - k),
        s: desde.s + (p.a.s - desde.s) * k,
      };
    }
    desde = p.a;
  }
  return desde;
};

const prog = (f: number, a: number, dur: number) => interpolate(f, [a, a + dur], [0, 1], clamp);

/* ---------- Bifecito con el centro de hielo ---------- */
const BifeHielo: React.FC<{ e: Est; nucleo: number; helada?: number }> = ({ e, nucleo, helada = 0 }) => (
  <g transform={`translate(${e.x} ${e.y}) scale(${e.s})`}>
    <Bife x={0} y={0} s={1} coccion={0} />
    {nucleo > 0.02 ? (
      <g transform={`translate(0 -4) scale(${nucleo})`}>
        <ellipse cx={0} cy={0} rx={96} ry={40} fill={TONO.hieloMedio} stroke={C.tinta} strokeWidth={6} />
        <ellipse cx={-26} cy={-12} rx={44} ry={12} fill="#FFFFFF" opacity={0.7} />
        {[[-50, 10], [10, 14], [58, -2]].map(([dx, dy], i) => (
          <path key={i} d={`M${dx - 8} ${dy} l8 -8 l8 8`} fill="none" stroke={TONO.hieloOscuro} strokeWidth={4} strokeLinecap="round" />
        ))}
      </g>
    ) : null}
    {/* escarcha por fuera cuando recién sale del freezer */}
    {helada > 0 ? (
      <g fill="#FFFFFF" opacity={helada * 0.85}>
        {[[-120, -40], [-60, -80], [20, -86], [100, -70], [140, -10], [110, 50], [30, 82], [-60, 70], [-130, 20]].map(([dx, dy], i) => (
          <circle key={i} cx={dx} cy={dy} r={8 + (i % 3) * 3} />
        ))}
      </g>
    ) : null}
  </g>
);

const Bichito: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(t / 7 + x) * 10}) scale(${s})`}>
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={i} x1={0} y1={0} x2={Math.cos((i / 8) * Math.PI * 2) * 25} y2={Math.sin((i / 8) * Math.PI * 2) * 25} stroke={C.tinta} strokeWidth={5} strokeLinecap="round" />
    ))}
    <circle cx={2} cy={2} r={16} fill={C.tinta} />
    <circle cx={0} cy={0} r={16} fill={VERDE_BAC} stroke={C.tinta} strokeWidth={5} />
    <circle cx={-6} cy={-6} r={4.5} fill="#FFFFFF" opacity={0.7} />
  </g>
);

/* Posiciones de bacterias sobre el borde del bife en la mesada (relativas al centro) */
const BORDE: [number, number][] = [[-150, -20], [-110, -85], [-30, -105], [60, -100], [140, -60], [160, 20], [100, 90], [10, 100], [-90, 80], [-160, 40]];

const Reloj: React.FC<{ cx: number; cy: number; f: number }> = ({ cx, cy, f }) => (
  <g>
    <circle cx={cx + 10} cy={cy + 10} r={104} fill={C.tinta} />
    <circle cx={cx} cy={cy} r={104} fill={C.blanco} stroke={C.tinta} strokeWidth={LINEA} />
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={i} x1={cx + Math.sin((i * Math.PI) / 6) * 82} y1={cy - Math.cos((i * Math.PI) / 6) * 82}
        x2={cx + Math.sin((i * Math.PI) / 6) * 96} y2={cy - Math.cos((i * Math.PI) / 6) * 96} stroke={C.tinta} strokeWidth={5} />
    ))}
    <line x1={cx} y1={cy} x2={cx + Math.sin(f * 0.2) * 62} y2={cy - Math.cos(f * 0.2) * 62} stroke={C.rojo} strokeWidth={9} strokeLinecap="round" />
    <line x1={cx} y1={cy} x2={cx + Math.sin(f * 0.017) * 44} y2={cy - Math.cos(f * 0.017) * 44} stroke={C.tinta} strokeWidth={9} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={9} fill={C.tinta} />
  </g>
);

const Luna: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <g>
    <circle cx={cx + 8} cy={cy + 8} r={56} fill={C.tinta} />
    <circle cx={cx} cy={cy} r={56} fill={C.amarillo} stroke={C.tinta} strokeWidth={LINEA} />
    <circle cx={cx + 26} cy={cy - 14} r={46} fill={C.papel} />
    <path d={`M${cx - 36} ${cy - 20} A44 44 0 0 1 ${cx - 6} ${cy - 46}`} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
  </g>
);

const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const e = ubicacion(f);
  const nucleo = interpolate(f, [E.fuera, E.zona + 40, E.ojo], [1, 0.72, 0.5], clamp);
  const helada = interpolate(f, [E.gancho, E.golpe, E.fuera], [1, 0.8, 0], clamp);
  const sobreMesada = f < E.heladera + 6 || (f >= E.ojo + 30 && f < E.noche + 10) || f >= E.manda + 20;
  const bichos = f >= E.zona && f < E.heladera + 10;
  const abierta = (f >= E.heladera - 4 && f < E.agua + 6) || (f >= E.noche + 4 && f < E.manda)
    ? interpolate(f, f < E.agua + 6 ? [E.heladera - 4, E.heladera + 14, E.agua - 4, E.agua + 6] : [E.noche + 4, E.noche + 22, E.manda - 14, E.manda], [0, 1, 1, 0], clamp)
    : 0;
  const microOn = f >= E.micro + 26 && f < E.ojo;

  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* mesada larga */}
      <rect x={-600} y={MESA} width={3200} height={800} fill={TONO.tierra} stroke={C.tinta} strokeWidth={7} />
      <rect x={-600} y={MESA} width={3200} height={20} fill={claro(TONO.tierra, 0.4)} />
      {[1470, 1540, 1620].map((yy, i) => (
        <path key={i} d={`M-600 ${yy} Q300 ${yy - 12} 1000 ${yy} T2600 ${yy}`} fill="none" stroke={TONO.tierraSombra} strokeWidth={5} opacity={0.8} />
      ))}

      {/* estación 1: plato de la mesada */}
      <ellipse cx={A.x + 8} cy={MESA - 2} rx={190} ry={22} fill={C.tinta} opacity={0.5} />
      <ellipse cx={A.x} cy={MESA - 12} rx={185} ry={20} fill="#FFFFFF" stroke={C.tinta} strokeWidth={6} />

      {/* estación 2: heladera */}
      <Heladera x={780} y={MESA} s={0.9} abierta={abierta} t={f} />

      {/* estación 3: recipiente con agua + canilla */}
      <g>
        <rect x={1000} y={1215} width={360} height={185} rx={18} fill={C.tinta} transform="translate(10 10)" />
        <rect x={1000} y={1215} width={360} height={185} rx={18} fill={claro(AGUA, 0.55)} stroke={C.tinta} strokeWidth={LINEA} />
        <rect x={1006} y={1262} width={348} height={132} rx={12} fill={AGUA} opacity={0.85} />
        <path d="M1008 1262 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.8} />
        <rect x={1170} y={1020} width={20} height={80} fill={MAT.metalOscuro} stroke={C.tinta} strokeWidth={6} />
        <path d="M1180 1100 L1180 1070 Q1180 1030 1220 1030 L1280 1030" fill="none" stroke={C.tinta} strokeWidth={30} strokeLinecap="round" transform="translate(0 0)" />
        <path d="M1180 1100 L1180 1070 Q1180 1030 1220 1030 L1280 1030" fill="none" stroke={MAT.metal} strokeWidth={16} strokeLinecap="round" />
        {f >= E.agua - 6 && f < E.micro ? (
          <g fill={AGUA} stroke={C.tinta} strokeWidth={3}>
            {Array.from({ length: 4 }).map((_, i) => (
              <ellipse key={i} cx={1280} cy={1046 + ((f * 12 + i * 55) % 200)} rx={8} ry={14} />
            ))}
          </g>
        ) : null}
      </g>

      {/* estación 4: microondas */}
      <g>
        <rect x={1440} y={1110} width={360} height={290} rx={22} fill={C.tinta} transform="translate(12 12)" />
        <rect x={1440} y={1110} width={360} height={290} rx={22} fill={MAT.metal} stroke={C.tinta} strokeWidth={LINEA} />
        <rect x={1462} y={1132} width={230} height={246} rx={14} fill={microOn ? "#FFE9A8" : "#2A2F5C"} stroke={C.tinta} strokeWidth={6} />
        <rect x={1475} y={1146} width={60} height={200} rx={10} fill="#FFFFFF" opacity={0.18} />
        <rect x={1712} y={1140} width={72} height={90} rx={10} fill={oscuro(MAT.metal, 0.12)} stroke={C.tinta} strokeWidth={5} />
        <rect x={1722} y={1152} width={52} height={22} rx={5} fill={C.tinta} />
        <circle cx={1748} cy={1262} r={18} fill={C.rojo} stroke={C.tinta} strokeWidth={5} />
        <circle cx={1748} cy={1328} r={18} fill={C.amarillo} stroke={C.tinta} strokeWidth={5} />
        <ellipse cx={1577} cy={1352} rx={90} ry={12} fill={claro(MAT.metal, 0.4)} stroke={C.tinta} strokeWidth={5} />
      </g>

      {/* bife, con bolsa si está en el agua */}
      <BifeHielo e={e} nucleo={nucleo} helada={f < E.fuera + 8 ? helada : 0} />
      {e.x > 1000 && e.x < 1400 && f >= E.agua + 20 ? (
        <rect x={e.x - 110} y={e.y - 70} width={220} height={140} rx={30} fill="#FFFFFF" opacity={0.3} stroke={C.tinta} strokeWidth={5} strokeDasharray="10 8" />
      ) : null}

      {/* vapor de "tibio" alrededor del bife en la mesada */}
      {sobreMesada && f >= E.fuera && f < E.heladera ? (
        <OndasCalor xs={[A.x - 120, A.x, A.x + 120]} y={A.y - 90} t={f} opacidad={0.7} />
      ) : null}
      {/* bacterias multiplicándose en el borde */}
      {bichos
        ? BORDE.map(([dx, dy], i) => {
          const ini = E.zona + 18 + i * 5;
          if (f < ini) return null;
          const esc = prog(f, ini, 10);
          return <Bichito key={i} x={A.x + dx * 1.1} y={A.y + dy * 0.95} s={0.8 * esc} t={f} />;
        })
        : null}
      {/* microondas encendido: chispitas de calor */}
      {microOn ? <OndasCalor xs={[1530, 1580, 1630]} y={1230} t={f} opacidad={0.8} alto={80} /> : null}
      {/* noche */}
      {f >= E.noche && f < E.manda ? <Luna cx={640} cy={980} /> : null}
    </svg>
  );
};

/* ---------- Anotaciones pegadas al mundo ---------- */
const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {entre(f, E.gancho, E.golpe) ? (
        <Rotulo texto="recién salida del freezer" desde={r.w(0, "freezer")} x={300} y={1050} ax={A.x} ay={A.y - 70} color={C.blanco} fondo={C.azul} tam={26} />
      ) : null}
      {entre(f, E.fuera, E.zona) ? (
        <>
          <Rotulo texto="por fuera: blando" desde={r.w(2, "fuera")} x={150} y={1060} ax={A.x - 150} ay={A.y - 40} color={C.blanco} fondo={C.rojo} tam={26} />
          <Rotulo texto="centro: duro" desde={r.w(2, "centro")} x={470} y={1030} ax={A.x} ay={A.y - 4} color={C.blanco} fondo={C.azul} tam={26} />
        </>
      ) : null}
      {entre(f, E.zona, E.usda) ? (
        <Rotulo texto="zona de peligro" grande="4 – 60 °C" desde={r.w(3, "cuatro")} x={470} y={960} ax={A.x + 60} ay={A.y - 90} tam={26} colorGrande={C.rojo} />
      ) : null}
      {entre(f, E.usda, E.heladera) ? (
        <g>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <g stroke={C.rojo} strokeWidth={22} strokeLinecap="round" opacity={prog(f, r.w(4, "mesada"), 6)}>
              <line x1={A.x - 170} y1={A.y - 120} x2={A.x + 170} y2={A.y + 90} />
              <line x1={A.x + 170} y1={A.y - 120} x2={A.x - 170} y2={A.y + 90} />
            </g>
          </svg>
        </g>
      ) : null}
      {entre(f, E.heladera, E.agua) ? (
        <Rotulo texto="la más segura" desde={r.w(5, "segura")} x={600} y={940} ax={760} ay={1060} color={C.blanco} fondo={C.verde} tam={26} />
      ) : null}
      {entre(f, E.agua, E.micro) ? (
        <>
          <Rotulo texto="bolsa que no pierda" desde={r.w(6, "bolsa")} x={1180} y={1130} ax={1180} ay={e1(f)} tam={26} />
          <Contador hasta={30} desde={r.w(6, "treinta")} dur={18} despues=" min" x={1190} y={880} tam={92} color={C.azul} etiqueta="cambiá el agua cada" />
        </>
      ) : null}
      {entre(f, E.micro, E.ojo) ? (
        <Rotulo texto="y se cocina enseguida" desde={r.w(7, "enseguida")} x={1600} y={1030} ax={1577} ay={1180} color={C.blanco} fondo={C.rojo} tam={26} />
      ) : null}
      {entre(f, E.ojo + 10, E.noche) ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <Reloj cx={300} cy={1000} f={f - E.ojo} />
        </svg>
      ) : null}
      {entre(f, E.ojo + 10, r.w(8, "una")) ? (
        <Contador hasta={2} desde={r.w(8, "dos") - 4} dur={12} despues=" h" x={660} y={880} tam={100} color={C.rojo} etiqueta="máximo en la mesada" />
      ) : null}
      {entre(f, r.w(8, "una"), E.noche) ? (
        <>
          <Contador hasta={1} desde={r.w(8, "una")} dur={10} despues=" h" x={660} y={880} tam={100} color={C.rojo} etiqueta="si hace más de 32 °C" />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <SolVolumen cx={510} cy={1100} r={38} t={f} intensidad={1.4} />
          </svg>
        </>
      ) : null}
      {entre(f, E.noche, E.manda) ? (
        <Rotulo texto="a la noche, a la heladera" desde={r.w(9, "noche")} x={520} y={870} ax={640} ay={980} tam={26} />
      ) : null}
    </>
  );
};
const e1 = (f: number) => ubicacion(f).y - 60;

/* ---------- Cámara: sigue al bife por las cuatro estaciones ---------- */
const TOMAS = [
  toma(0, 400, 1190, 1.3), toma(E.golpe - 2, 400, 1190, 1.3),
  toma(E.golpe + 10, 330, 1230, 1.5), toma(E.zona - 2, 330, 1230, 1.5),
  toma(E.zona + 10, 400, 1180, 1.35), toma(E.heladera - 6, 400, 1180, 1.35),
  toma(E.heladera + 10, 690, 1180, 1.3), toma(E.agua - 8, 690, 1180, 1.3),
  toma(E.agua + 12, 1180, 1160, 1.4), toma(E.micro - 8, 1180, 1160, 1.4),
  toma(E.micro + 12, 1590, 1210, 1.5), toma(E.ojo - 4, 1590, 1210, 1.5),
  toma(E.ojo + 40, 500, 1150, 1.2), toma(E.noche - 2, 500, 1150, 1.2),
  toma(E.noche + 12, 690, 1130, 1.25), toma(E.manda - 6, 690, 1130, 1.25),
  toma(E.manda + 20, 400, 1190, 1.3), toma(E.sello, 400, 1190, 1.3),
];
const GOLPES = [r.w(1, "justo"), r.w(3, "cuatro"), r.w(4, "Agricultura"), r.w(5, "heladera"), r.w(6, "Dos"), r.w(7, "Tres"), r.w(8, "dos")];

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
    <Etiqueta texto="lo hacés casi seguro" desde={-8} />
    <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={430} tam={52} />
    <Globo texto="¡se descongela solita!" desde={r.w(0, "mesada") - E.gancho} x={720} y={800} cola="izq" tam={40} ancho={420} />
  </>
);

const Golpe: React.FC = () => {
  const ra = r.w(1, "justo") - E.golpe;
  return (
    <>
      <Etiqueta texto="la verdad" color={C.verde} />
      <Titulo pregunta="descongelar en la mesada…" desdeP={0} respuesta="¡no!" desdeR={ra} top={415} tamR={110} />
      <Sello texto="MITO" desde={ra + 2} x={760} y={270} rot={-8} color={C.rojo} tam={74} />
    </>
  );
};

const Cartel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Etiqueta texto="lo dice el USDA" />
      <div style={{ position: "absolute", left: 90, top: 560, width: 900, scale: pop(frame, fps, r.w(4, "Agricultura") - E.usda - 4), transformOrigin: "50% 0" }}>
        <div style={{ background: C.blanco, border: `6px solid ${C.tinta}`, borderRadius: 18, boxShadow: sombra(8), padding: "22px 28px", textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 28, color: C.azul }}>Dpto. de Agricultura de EE. UU.</div>
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: 54, lineHeight: 1.1, color: C.tinta, marginTop: 8 }}>
            la carne no se descongela en la mesada
          </div>
        </div>
      </div>
    </>
  );
};

const Ojo: React.FC = () => <Sello texto="OJO" desde={0} x={440} y={320} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />;

const Manda: React.FC = () => (
  <>
    <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={340} />
    <Globo texto="¡desde la mañana!" desde={r.w(10, "mesada") - E.manda} x={540} y={620} cola="izq" tam={40} ancho={440} />
  </>
);

export const DescongelarMesada015: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [r.w(0, "mesada"), "burbuja", 0.35],
    [E.golpe, "whoosh", 0.35], [r.w(1, "justo") - 2, "scratch", 0.55], [r.w(1, "justo"), "sello", 0.5],
    [E.fuera, "pop"], [r.w(2, "centro"), "pop", 0.4],
    [E.zona, "whoosh", 0.3], [r.w(3, "cuatro"), "tic", 0.4], [r.w(3, "sesenta"), "ding", 0.45], [r.w(3, "bacterias"), "error", 0.4],
    [E.usda, "pop"], [r.w(4, "mesada"), "sello", 0.5],
    [E.heladera, "whoosh", 0.4], [r.w(5, "tres"), "pop"], [r.w(5, "heladera"), "boing", 0.4],
    [E.agua, "whoosh", 0.4], [r.w(6, "Dos"), "pop"], [r.w(6, "treinta") + 4, "tic", 0.4], [r.w(6, "treinta") + 22, "ding", 0.45],
    [E.micro, "whoosh", 0.4], [r.w(7, "Tres"), "pop"], [r.w(7, "enseguida"), "ding", 0.45],
    [E.ojo, "sello", 0.55], [E.ojo + 8, "whoosh", 0.35], [r.w(8, "dos") + 4, "tic", 0.4], [r.w(8, "una"), "ding", 0.45],
    [E.noche, "pop"], [r.w(9, "heladera"), "boing", 0.4],
    [E.manda, "pop"], [r.w(10, "mesada"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo"><Logo /></Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.golpe - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · golpe" from={E.golpe} durationInFrames={E.fuera - E.golpe} layout="none"><Golpe /></Sequence>
      <Sequence name="3 · fuera" from={E.fuera} durationInFrames={E.zona - E.fuera} layout="none"><Etiqueta texto="por fuera vs. por dentro" color={C.amarillo} /></Sequence>
      <Sequence name="4 · zona" from={E.zona} durationInFrames={E.usda - E.zona} layout="none">
        <Etiqueta texto="zona de peligro" color={C.rojo} /><Fuente texto="USDA FSIS" />
      </Sequence>
      <Sequence name="5 · usda" from={E.usda} durationInFrames={E.heladera - E.usda} layout="none"><Cartel /><Fuente texto="USDA FSIS" /></Sequence>
      <Sequence name="6 · heladera" from={E.heladera} durationInFrames={E.agua - E.heladera} layout="none">
        <Paso n={1} texto="en la heladera" top={400} /><Fuente texto="USDA FSIS" />
      </Sequence>
      <Sequence name="7 · agua" from={E.agua} durationInFrames={E.micro - E.agua} layout="none">
        <Paso n={2} texto="en agua fría" top={400} /><Fuente texto="USDA FSIS" />
      </Sequence>
      <Sequence name="8 · micro" from={E.micro} durationInFrames={E.ojo - E.micro} layout="none">
        <Paso n={3} texto="en el microondas" top={400} /><Fuente texto="USDA FSIS" />
      </Sequence>
      <Sequence name="9 · ojo" from={E.ojo} durationInFrames={E.noche - E.ojo} layout="none"><Ojo /><Fuente texto="USDA FSIS" /></Sequence>
      <Sequence name="10 · noche" from={E.noche} durationInFrames={E.manda - E.noche} layout="none"><Etiqueta texto="el plan" color={C.verde} /></Sequence>
      <Sequence name="11 · manda" from={E.manda} durationInFrames={DURACION - E.manda} layout="none"><Manda /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal mandar={`mandáselo a ese que deja el asado en la mesada desde la mañana`} /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("015-descongelar-mesada/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada015: React.FC = () => (
  <Portada arriba="¿descongelar la carne en la mesada?" grande="NO" sello="MITO" colorSello={C.rojo} numero={15}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(0 -250)">
        <BifeHielo e={{ x: 540, y: 1150, s: 2 }} nucleo={0.8} />
        <Bichito x={300} y={1000} s={1.6} t={10} />
        <Bichito x={800} y={1010} s={1.6} t={10} />
        <Bichito x={650} y={1350} s={1.6} t={10} />
      </g>
    </svg>
  </Portada>
);

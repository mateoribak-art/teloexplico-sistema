import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/014-celular-arroz/tiempos.json";
import { C, display, mono, sombra } from "../../kit/marca";
import { clamp, entre, golpe, pop } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { oscuro, claro, MAT, LINEA } from "../../kit/biblioteca";
import { Camara, Contador, Flujo, Lupa, OndasCalor, Paso, Rotulo, TONO, Trazo, toma } from "../../kit/diagrama";

// Mundo único: una mesa en corte. A la izquierda el celular mojado (acostado, con su cable); a la derecha un tazón de arroz.
// Mecanismo: la "idea" del arroz (meter el celular adentro) vs. lo que dice Apple: los granitos pueden entrar por el conector.
// Después los pasos de Apple: desenchufar, golpear suave con el conector hacia abajo, lugar seco con aire, esperar.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  logica: r.f(2),
  apple: r.f(3),
  part: r.f(4),
  p1: r.f(5),
  p2: r.f(6),
  p3: r.f(7),
  espera: r.f(8),
  ojo: r.f(9),
  manda: r.f(10),
  sello: r.fin(10) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const MESA = 1400;
const LX = 400, LY = 1315; // celular acostado
const BX = 810;            // centro del tazón
const AGUA = "#9FD3F5";

/* ---------- Celular con volumen: x,y = centro; rot 0 = vertical con el conector hacia abajo ---------- */
const Telefono: React.FC<{ x: number; y: number; rot?: number; s?: number; mojado?: boolean }> = ({ x, y, rot = 0, s = 1, mojado = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-85 + 12} y={-170 + 12} width={170} height={340} rx={32} fill={C.tinta} />
    <rect x={-85} y={-170} width={170} height={340} rx={32} fill={oscuro(MAT.metal, 0.05)} stroke={C.tinta} strokeWidth={LINEA} />
    <rect x={-70} y={-152} width={140} height={304} rx={20} fill={TONO.azulSombra} stroke={C.tinta} strokeWidth={5} />
    <rect x={-70} y={-152} width={140} height={150} rx={20} fill={C.azul} opacity={0.8} />
    <path d="M-60 -140 L-8 -140 L-60 -50 Z" fill="#FFFFFF" opacity={0.28} />
    <circle cx={0} cy={-138} r={7} fill={C.tinta} />
    {/* conector abajo */}
    <rect x={-20} y={158} width={40} height={9} rx={4} fill={C.tinta} />
    {mojado ? (
      <g fill={AGUA} stroke={C.tinta} strokeWidth={3}>
        {[[-40, -80, 11], [30, -50, 9], [-10, 20, 13], [45, 60, 8], [-45, 90, 10], [10, 120, 8]].map(([dx, dy, rr], i) => (
          <ellipse key={i} cx={dx} cy={dy} rx={rr} ry={rr * 1.3} />
        ))}
      </g>
    ) : null}
  </g>
);

/* ---------- Tazón con arroz (corte). Se dibuja en dos partes: el arroz va delante del celular ---------- */
const GRANOS = Array.from({ length: 46 }).map((_, i) => {
  const a = Math.abs(Math.sin(i * 12.9898 + 1.3) * 43758.5453) % 1;
  const b = Math.abs(Math.sin(i * 78.233 + 5.1) * 43758.5453) % 1;
  return { x: -135 + a * 270, y: -b * 55, rot: a * 180 };
});

const ArrozFrente: React.FC<{ cx: number }> = ({ cx }) => (
  <g transform={`translate(${cx} 1345)`}>
    <path d="M-160 0 Q-90 -60 0 -70 Q90 -60 160 0 Z" fill="#FFF6DD" stroke={C.tinta} strokeWidth={6} />
    {GRANOS.map((g, i) => {
      const tope = 62 * (1 - Math.pow(g.x / 160, 2)) - 4;
      return <ellipse key={i} cx={g.x} cy={-Math.min(tope * 0.9, Math.abs(g.y) + 6)} rx={13} ry={5.5} transform={`rotate(${g.rot} ${g.x} 0)`}
        fill="#FFFFFF" stroke={C.tinta} strokeWidth={2.5} />;
    })}
  </g>
);

const Tazon: React.FC<{ cx: number }> = ({ cx }) => (
  <g transform={`translate(${cx} 1332)`}>
    <path d="M-176 12 Q-176 150 0 150 Q176 150 176 12 Z" fill={C.tinta} transform="translate(12 12)" />
    <path d="M-176 12 Q-176 150 0 150 Q176 150 176 12 Z" fill={C.rojo} stroke={C.tinta} strokeWidth={LINEA} />
    <path d="M-150 40 Q-140 120 -40 138 Q-120 110 -128 40 Z" fill="#FFFFFF" opacity={0.35} />
    <rect x={-190} y={0} width={380} height={26} rx={13} fill={TONO.rojoSombra} stroke={C.tinta} strokeWidth={LINEA} />
    <rect x={-176} y={4} width={120} height={7} rx={3} fill="#FFFFFF" opacity={0.45} />
  </g>
);

/* ---------- Estado del celular según el frame ---------- */
type Pose = { x: number; y: number; rot: number };
const LIE: Pose = { x: LX, y: LY, rot: 90 };
const BOWL: Pose = { x: BX, y: 1255, rot: 60 };
const UP: Pose = { x: LX, y: 1050, rot: 0 };
const STAND: Pose = { x: LX, y: 1230, rot: 0 };
const mezcla = (a: Pose, b: Pose, p: number, arco = 0): Pose => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p - 4 * arco * p * (1 - p),
  rot: a.rot + (b.rot - a.rot) * p,
});
const prog = (f: number, a: number, dur: number) => interpolate(f, [a, a + dur], [0, 1], clamp);

const pose = (f: number): Pose => {
  if (f >= E.manda) return mezcla(STAND, LIE, prog(f, E.manda, 16));
  if (f >= E.p3) return mezcla(UP, STAND, prog(f, E.p3, 20));
  if (f >= E.p2) return mezcla(LIE, UP, prog(f, E.p2, 20));
  if (f >= E.p1) return mezcla(BOWL, LIE, prog(f, E.p1, 22), 140);
  if (f >= E.logica + 6) return mezcla(LIE, BOWL, prog(f, E.logica + 6, 22), 160);
  return LIE;
};

const Gotas: React.FC<{ f: number; x0: number; x1: number; y0: number; y1: number; n?: number }> = ({ f, x0, x1, y0, y1, n = 8 }) => (
  <g fill={AGUA} stroke={C.tinta} strokeWidth={3}>
    {Array.from({ length: n }).map((_, i) => {
      const per = 22 + (i % 3) * 4;
      const c = ((f + i * 7) % per) / per;
      return <ellipse key={i} cx={x0 + (x1 - x0) * ((i + 0.5) / n)} cy={y0 + (y1 - y0) * c} rx={8} ry={13} opacity={Math.min(1, (1 - c) * 4)} />;
    })}
  </g>
);

const Reloj: React.FC<{ cx: number; cy: number; f: number }> = ({ cx, cy, f }) => (
  <g>
    <circle cx={cx + 10} cy={cy + 10} r={104} fill={C.tinta} />
    <circle cx={cx} cy={cy} r={104} fill={C.blanco} stroke={C.tinta} strokeWidth={LINEA} />
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={i} x1={cx + Math.sin((i * Math.PI) / 6) * 82} y1={cy - Math.cos((i * Math.PI) / 6) * 82}
        x2={cx + Math.sin((i * Math.PI) / 6) * 96} y2={cy - Math.cos((i * Math.PI) / 6) * 96} stroke={C.tinta} strokeWidth={5} />
    ))}
    <line x1={cx} y1={cy} x2={cx + Math.sin((f * 0.22)) * 62} y2={cy - Math.cos((f * 0.22)) * 62} stroke={C.rojo} strokeWidth={9} strokeLinecap="round" />
    <line x1={cx} y1={cy} x2={cx + Math.sin(f * 0.02) * 44} y2={cy - Math.cos(f * 0.02) * 44} stroke={C.tinta} strokeWidth={9} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={9} fill={C.tinta} />
  </g>
);

const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const p = pose(f);
  const cableVisible = f >= E.p1 + 14 && f < E.p2 + 4;
  const desenchufa = prog(f, r.w(5, "cargador"), 14);
  const puertoY = p.y + 170;
  const cae = f >= E.p2 + 22 && f < E.p3;
  const tap = cae ? -Math.abs(Math.sin((f - E.p2 - 22) / 3)) * 18 : 0;
  const mojado = f < E.p3 + 50 || f >= E.manda;
  const llueve = f < E.logica + 10 || f >= E.manda;
  const enSeco = f >= E.p3 && f < E.manda;

  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* mesa */}
      <rect x={-500} y={MESA} width={2080} height={800} fill={TONO.tierra} stroke={C.tinta} strokeWidth={7} />
      <rect x={-500} y={MESA} width={2080} height={20} fill={claro(TONO.tierra, 0.4)} />
      {[1470, 1540, 1620].map((yy, i) => (
        <path key={i} d={`M-500 ${yy} Q300 ${yy - 12} 540 ${yy} T1580 ${yy}`} fill="none" stroke={TONO.tierraSombra} strokeWidth={5} opacity={0.8} />
      ))}
      {/* charquito bajo el celular */}
      {mojado ? <ellipse cx={LX} cy={MESA + 10} rx={220} ry={16} fill={AGUA} stroke={C.tinta} strokeWidth={4} opacity={enSeco ? 0.5 : 0.95} /> : null}

      {/* cable y enchufe (se desenchufa en el paso uno) */}
      {cableVisible ? (
        <g opacity={prog(f, E.p1 + 14, 6)}>
          <path d={`M${LX - 170 - 62 - desenchufa * 90} ${LY} Q${60} ${LY + 4} -120 ${LY + 70}`} fill="none" stroke={C.tinta} strokeWidth={16} strokeLinecap="round" />
          <path d={`M${LX - 170 - 62 - desenchufa * 90} ${LY} Q${60} ${LY + 4} -120 ${LY + 70}`} fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" />
          <rect x={LX - 170 - 62 - desenchufa * 90} y={LY - 20} width={62} height={40} rx={10} fill={MAT.metalOscuro} stroke={C.tinta} strokeWidth={6} />
        </g>
      ) : null}

      {/* celular */}
      <Telefono x={p.x} y={p.y + tap} rot={p.rot + (cae ? Math.sin((f - E.p2) / 2) * 3 : 0)} mojado={mojado} />

      {/* tazón: arroz adelante del celular */}
      <ArrozFrente cx={BX} />
      <Tazon cx={BX} />

      {/* gotas que caen sobre el celular (gancho y final) */}
      {llueve ? <Gotas f={f} x0={LX - 120} x1={LX + 120} y0={900} y1={LY - 70} /> : null}
      {/* gotas que salen por el conector al golpearlo */}
      {cae ? <Gotas f={f} x0={LX - 14} x1={LX + 14} y0={puertoY} y1={MESA - 6} n={4} /> : null}

      {/* aire suave en el paso tres */}
      {f >= E.p3 + 14 && f < E.manda ? (
        <Flujo x0={LX - 190} x1={LX + 190} yAbajo={MESA - 20} yArriba={950} n={12} velocidad={0.6} color={claro(C.azul, 0.55)} tam={7} t={f}
          opacidad={prog(f, E.p3 + 14, 12) * 0.8} />
      ) : null}
      {/* "sin calor": ondas tachadas */}
      {entre(f, r.w(7, "secador"), E.espera) ? (
        <g>
          <OndasCalor xs={[740, 810, 880]} y={1340} t={f} opacidad={0.9} />
          <g stroke={C.rojo} strokeWidth={16} strokeLinecap="round" opacity={prog(f, r.w(7, "secador") + 2, 6)}>
            <line x1={720} y1={1090} x2={900} y2={1270} />
            <line x1={900} y1={1090} x2={720} y2={1270} />
          </g>
        </g>
      ) : null}
      {/* reloj de la espera */}
      {entre(f, E.espera, E.ojo) ? (
        <g opacity={prog(f, E.espera, 8)}>
          <Reloj cx={820} cy={1120} f={f - E.espera} />
        </g>
      ) : null}
    </svg>
  );
};

/* ---------- Anotaciones pegadas al mundo ---------- */
const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {entre(f, E.gancho, E.golpe) ? (
        <Rotulo texto="celular mojado" desde={r.w(0, "celular")} x={430} y={1010} ax={LX} ay={LY - 80} color={C.blanco} fondo={C.rojo} tam={26} />
      ) : null}
      {entre(f, E.logica, E.apple) ? (
        <Rotulo texto="la idea: el arroz chupa la humedad" desde={r.w(2, "chupa")} x={780} y={1020} ax={BX} ay={1290} tam={24} />
      ) : null}
      {entre(f, E.part, E.p1) ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <Lupa cx={400} cy={1000} r={190} desde={r.w(4, "partículas") - 6} ax={BX - 150} ay={1338}>
            <rect x={200} y={900} width={400} height={400} fill={claro(TONO.tierra, 0.5)} />
            <rect x={225} y={1000} width={350} height={220} rx={34} fill={MAT.metal} stroke={C.tinta} strokeWidth={8} />
            <rect x={240} y={1012} width={320} height={26} rx={13} fill="#FFFFFF" opacity={0.45} />
            <rect x={315} y={1075} width={170} height={46} rx={23} fill={C.tinta} />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const c = ((f * 1.4 + i * 22) % 130) / 130;
              const x0 = 250 + i * 60;
              const gy = 850 + c * 235;
              const gx = x0 + (400 - x0) * c;
              return <ellipse key={i} cx={gx} cy={gy} rx={32} ry={13} transform={`rotate(${20 + i * 25} ${gx} ${gy})`}
                fill="#FFFFFF" stroke={C.tinta} strokeWidth={4} opacity={Math.min(1, (1 - c) * 4)} />;
            })}
          </Lupa>
        </svg>
      ) : null}
      {entre(f, E.part, E.p1) && f >= r.w(4, "dañarlo") - 4 ? (
        <Rotulo texto="granitos por el conector" desde={r.w(4, "dañarlo") - 4} x={610} y={820} ax={470} ay={900} color={C.blanco} fondo={C.rojo} tam={24} />
      ) : null}
      {entre(f, E.p2, E.p3) ? (
        <Rotulo texto="conector hacia abajo" desde={r.w(6, "abajo")} x={700} y={1000} ax={LX + 6} ay={UP.y + 170} tam={26} />
      ) : null}
      {entre(f, E.p3, E.espera) ? (
        <Rotulo texto="lugar seco, con aire" desde={r.w(7, "seco")} x={720} y={900} ax={LX + 70} ay={1100} color={C.blanco} fondo={C.verde} tam={26} />
      ) : null}
      {entre(f, E.espera, r.w(8, "día")) ? (
        <Contador hasta={30} desde={r.w(8, "treinta")} dur={20} despues=" min" x={820} y={850} tam={92} color={C.azul} etiqueta="como mínimo, antes de cargar" />
      ) : null}
      {entre(f, r.w(8, "día"), E.ojo) ? (
        <Contador hasta={24} desde={r.w(8, "día") - 2} dur={18} despues=" h" x={820} y={850} tam={100} color={C.rojo} etiqueta="si sigue la alerta, hasta" />
      ) : null}
      {entre(f, E.ojo, E.manda) ? (
        <Rotulo texto="guía de Apple para iPhone" desde={r.w(9, "Apple")} x={640} y={1010} ax={LX} ay={1100} tam={26} />
      ) : null}
    </>
  );
};

/* ---------- Cámara ---------- */
const TOMAS = [
  toma(0, 610, 1170, 1.2), toma(E.golpe - 2, 610, 1170, 1.2),
  toma(E.golpe + 10, 480, 1230, 1.45), toma(E.logica - 2, 480, 1230, 1.45),
  toma(E.logica + 12, 640, 1170, 1.25), toma(E.apple - 2, 640, 1170, 1.25),
  toma(E.apple + 12, 760, 1230, 1.4), toma(E.part - 2, 760, 1230, 1.4),
  toma(E.part + 12, 600, 1150, 1.1), toma(E.p1 - 2, 600, 1150, 1.1),
  toma(E.p1 + 12, 450, 1240, 1.3), toma(E.p2 - 2, 450, 1240, 1.3),
  toma(E.p2 + 12, 470, 1160, 1.3), toma(E.p3 - 2, 470, 1160, 1.3),
  toma(E.p3 + 12, 600, 1180, 1.2), toma(E.espera - 2, 600, 1180, 1.2),
  toma(E.espera + 12, 620, 1100, 1.15), toma(E.ojo - 2, 620, 1100, 1.15),
  toma(E.ojo + 12, 610, 1180, 1.2), toma(E.manda - 2, 610, 1180, 1.2),
  toma(E.manda + 12, 610, 1170, 1.2), toma(E.sello, 610, 1170, 1.2),
];
const GOLPES = [r.w(1, "no"), r.w(3, "textual"), r.w(4, "dañarlo"), r.w(5, "uno"), r.w(6, "dos"), r.w(7, "tres"), r.w(8, "treinta")];

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
    <Etiqueta texto="te puede pasar a vos" desde={-8} />
    <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={430} tam={52} />
    <Globo texto="¡rápido, el arroz!" desde={r.w(0, "arroz") - E.gancho} x={760} y={780} cola="izq" tam={40} ancho={420} />
  </>
);

const Golpe: React.FC = () => {
  const ra = r.w(1, "no") - E.golpe;
  return (
    <>
      <Etiqueta texto="la verdad" color={C.verde} />
      <Titulo pregunta="celular mojado…" desdeP={0} respuesta="¡arroz, no!" desdeR={ra} top={415} tamR={96} />
      <Sello texto="NO" desde={ra + 2} x={780} y={270} rot={-8} color={C.rojo} tam={84} />
    </>
  );
};

const Cartel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Etiqueta texto="lo dice Apple" />
      <div style={{ position: "absolute", left: 90, top: 560, width: 900, scale: pop(frame, fps, r.w(3, "textual") - E.apple - 4), transformOrigin: "50% 0" }}>
        <div style={{ background: C.blanco, border: `6px solid ${C.tinta}`, borderRadius: 18, boxShadow: sombra(8), padding: "22px 28px", textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 28, color: C.azul }}>Apple Support:</div>
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: 52, lineHeight: 1.1, color: C.tinta, marginTop: 8 }}>
            “Don’t put your iPhone in a bag of rice”
          </div>
        </div>
      </div>
    </>
  );
};

const Ojo: React.FC = () => <Sello texto="OJO" desde={0} x={440} y={320} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />;

const Manda: React.FC = () => {
  return (
    <>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={340} />
      <Globo texto="¡yo ya tengo el arroz!" desde={r.w(10, "arroz") - E.manda} x={540} y={620} cola="der" tam={40} ancho={460} />
    </>
  );
};

export const CelularArroz014: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [r.w(0, "arroz"), "burbuja", 0.35],
    [E.golpe, "whoosh", 0.35], [r.w(1, "no") - 2, "scratch", 0.55], [r.w(1, "no"), "sello", 0.5],
    [E.logica, "pop"], [E.logica + 8, "whoosh", 0.3],
    [E.apple, "whoosh", 0.35], [r.w(3, "textual"), "sello", 0.45],
    [E.part, "pop"], [r.w(4, "partículas"), "latigo", 0.4], [r.w(4, "dañarlo"), "error", 0.4],
    [E.p1, "whoosh", 0.35], [r.w(5, "uno"), "pop"], [r.w(5, "cargador"), "tic", 0.4],
    [E.p2, "whoosh", 0.35], [r.w(6, "golpealo"), "boing", 0.4], [r.w(6, "abajo"), "burbuja", 0.35],
    [E.p3, "whoosh", 0.35], [r.w(7, "tres"), "pop"], [r.w(7, "secador"), "error", 0.4],
    [E.espera, "pop"], [r.w(8, "treinta") + 8, "tic", 0.4], [r.w(8, "treinta") + 28, "ding", 0.45], [r.w(8, "día"), "ding", 0.45],
    [E.ojo, "sello", 0.55], [E.manda, "pop"], [r.w(10, "arroz"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo"><Logo /></Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.golpe - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · golpe" from={E.golpe} durationInFrames={E.logica - E.golpe} layout="none"><Golpe /></Sequence>
      <Sequence name="3 · logica" from={E.logica} durationInFrames={E.apple - E.logica} layout="none"><Etiqueta texto="la idea del truco" color={C.amarillo} /></Sequence>
      <Sequence name="4 · apple" from={E.apple} durationInFrames={E.part - E.apple} layout="none"><Cartel /><Fuente texto="Apple Support" /></Sequence>
      <Sequence name="5 · particulas" from={E.part} durationInFrames={E.p1 - E.part} layout="none">
        <Etiqueta texto="el problema" color={C.rojo} /><Fuente texto="Apple Support" />
      </Sequence>
      <Sequence name="6 · paso1" from={E.p1} durationInFrames={E.p2 - E.p1} layout="none">
        <Paso n={1} texto="desenchufalo" top={400} /><Fuente texto="Apple Support" />
      </Sequence>
      <Sequence name="7 · paso2" from={E.p2} durationInFrames={E.p3 - E.p2} layout="none">
        <Paso n={2} texto="golpecito suave" top={400} /><Fuente texto="Apple Support" />
      </Sequence>
      <Sequence name="8 · paso3" from={E.p3} durationInFrames={E.espera - E.p3} layout="none">
        <Paso n={3} texto="seco y con aire" top={400} /><Fuente texto="Apple Support" />
        <Sello texto="SIN CALOR" desde={r.w(7, "secador") - E.p3} x={680} y={600} rot={6} color={C.rojo} tam={56} />
      </Sequence>
      <Sequence name="9 · espera" from={E.espera} durationInFrames={E.ojo - E.espera} layout="none">
        <Paso n={4} texto="esperá" top={400} /><Fuente texto="Apple Support" />
      </Sequence>
      <Sequence name="10 · ojo" from={E.ojo} durationInFrames={E.manda - E.ojo} layout="none"><Ojo /></Sequence>
      <Sequence name="11 · manda" from={E.manda} durationInFrames={DURACION - E.manda} layout="none"><Manda /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("014-celular-arroz/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada014: React.FC = () => (
  <Portada arriba="¿celular mojado? ¿al arroz?" grande="NO" sello="APPLE" colorSello={C.azul} numero={14}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(0 -230)">
        <Telefono x={330} y={1130} rot={14} s={1.25} />
        <ArrozFrente cx={720} />
        <Tazon cx={720} />
        <Trazo d="M560 1100 L880 1400" desde={0} dur={1} color={C.rojo} ancho={16} />
      </g>
    </svg>
  </Portada>
);

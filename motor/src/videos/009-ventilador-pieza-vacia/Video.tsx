import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/009-ventilador-pieza-vacia/tiempos.json";
import { C } from "../../kit/marca";
import { clamp, entre, golpe } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Termometro, oscuro, claro, MAT, LINEA } from "../../kit/biblioteca";
import { Camara, Flujo, OndasCalor, Rotulo, TONO, Vecino, toma } from "../../kit/diagrama";

// Mundo único: una pieza en corte. A la izquierda un ventilador de pie soplando; al centro un termómetro
// que marca 29° siempre (el aire no se enfría); a la derecha una persona que entra y sale.
// Mecanismo: el ventilador mueve el aire pero no lo enfría; sobre la piel, el aire ayuda a evaporar el sudor
// y se lleva calor del cuerpo. Sin persona, no hay a quién refrescar (y el motor suma un poco de calor).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  aire: r.f(2),
  piel: r.f(3),
  sudor: r.f(4),
  doe: r.f(5),
  motor: r.f(6),
  apagar: r.f(7),
  ojo: r.f(8),
  remate: r.f(9),
  manda: r.f(10),
  sello: r.fin(10) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const SUELO = 1480;
const FX = 270, FY = 1130;   // centro de la jaula del ventilador
const PX = 800, PY = 1180;   // cabeza de la persona
const TERMO_X = 560;

/* La persona sale al "te vas", vuelve con "vos", sale con "nadie", vuelve en el ojo y sale con "piel" (remate). */
const personaOffset = (f: number) => {
  const sale1 = r.w(0, "vas");
  const vuelve1 = r.w(1, "vos");
  const sale2 = r.w(6, "nadie");
  const vuelve2 = E.ojo;
  const sale3 = r.w(9, "piel");
  if (f < sale1) return 0;
  if (f < vuelve1) return interpolate(f, [sale1, sale1 + 24], [0, 560], clamp);
  if (f < sale2) return interpolate(f, [vuelve1, vuelve1 + 16], [560, 0], clamp);
  if (f < vuelve2) return interpolate(f, [sale2, sale2 + 20], [0, 560], clamp);
  if (f < sale3) return interpolate(f, [vuelve2, vuelve2 + 16], [560, 0], clamp);
  return interpolate(f, [sale3, sale3 + 20], [0, 560], clamp);
};
const ventiladorOn = (f: number) => !(f >= r.w(7, "apagarlo") && f < E.ojo);

/* ---------- Ventilador de pie con volumen ---------- */
const Ventilador: React.FC<{ on: boolean; ang: number }> = ({ on, ang }) => {
  const R = 150;
  return (
    <g>
      {/* pie y base */}
      <rect x={FX - 16 + 8} y={FY + R - 10 + 8} width={32} height={SUELO - FY - R + 4} fill={C.tinta} />
      <rect x={FX - 16} y={FY + R - 10} width={32} height={SUELO - FY - R + 4} fill={MAT.metalOscuro} stroke={C.tinta} strokeWidth={LINEA} />
      <ellipse cx={FX + 8} cy={SUELO - 6 + 8} rx={130} ry={30} fill={C.tinta} />
      <ellipse cx={FX} cy={SUELO - 6} rx={130} ry={30} fill={oscuro(C.azul, 0.1)} stroke={C.tinta} strokeWidth={LINEA} />
      {/* jaula */}
      <circle cx={FX + 12} cy={FY + 12} r={R} fill={C.tinta} />
      <circle cx={FX} cy={FY} r={R} fill={claro(C.azul, 0.82)} fillOpacity={0.55} stroke={C.tinta} strokeWidth={LINEA} />
      <circle cx={FX} cy={FY} r={R * 0.62} fill="none" stroke={C.tinta} strokeWidth={4} opacity={0.5} />
      {/* aspas */}
      <g transform={`rotate(${ang} ${FX} ${FY})`} opacity={on ? 0.9 : 1}>
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${FX} ${FY} q-34 -70 0 -${R - 20} q42 50 0 ${R - 20} z`} transform={`rotate(${i * 90} ${FX} ${FY})`}
            fill={C.amarillo} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
        ))}
      </g>
      {/* rayos de la jaula */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={FX} y1={FY} x2={FX + Math.cos((i / 6) * Math.PI * 2) * R} y2={FY + Math.sin((i / 6) * Math.PI * 2) * R} stroke={C.tinta} strokeWidth={3} opacity={0.35} />
      ))}
      <circle cx={FX} cy={FY} r={34} fill={MAT.metalOscuro} stroke={C.tinta} strokeWidth={LINEA} />
      <circle cx={FX - 10} cy={FY - 10} r={10} fill="#FFFFFF" opacity={0.7} />
    </g>
  );
};

/* Corrientes horizontales de aire (mismo aire, no más frío) */
const Viento: React.FC<{ t: number; opacidad: number }> = ({ t, opacidad }) => (
  <g opacity={opacidad} stroke={C.azul} strokeWidth={9} strokeLinecap="round" fill="none">
    {[-90, -30, 30, 90].map((dy, i) => {
      const x = FX + 190 + ((t * 9 + i * 120) % 420);
      return <line key={i} x1={x} y1={FY + dy} x2={x + 90} y2={FY + dy} opacity={interpolate((x - FX - 190) / 420, [0, 0.15, 0.8, 1], [0, 1, 1, 0], clamp)} />;
    })}
  </g>
);

const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const on = ventiladorOn(f);
  const off = personaOffset(f);
  const hay = off < 300;
  const enPiel = hay && on && f >= E.piel && f < E.motor;
  const ang = (on ? f : r.w(7, "apagarlo")) * 16;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* piso */}
      <rect x={-400} y={SUELO} width={1880} height={520} fill={TONO.tierra} stroke={C.tinta} strokeWidth={7} />
      <rect x={-400} y={SUELO} width={1880} height={16} fill={oscuro(TONO.tierra, 0.2)} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={-200 + i * 170} y1={SUELO} x2={-260 + i * 170} y2={SUELO + 520} stroke={oscuro(TONO.tierra, 0.15)} strokeWidth={4} />
      ))}

      <Termometro x={TERMO_X} y={1180} s={0.8} valor={0.62} color={C.rojo} />
      <Ventilador on={on} ang={ang} />
      <Viento t={f} opacidad={on ? 1 : 0} />

      {/* calor del motor */}
      <OndasCalor xs={[FX - 40, FX, FX + 40]} y={FY - 150} t={f} opacidad={entre(f, E.motor, E.apagar) ? 0.9 : 0} />

      {/* persona + calor del cuerpo que se va con el aire */}
      <g transform={`translate(${off} 0)`}>
        <Vecino cx={PX} cy={PY} s={1.0} t={f} boca={entre(f, E.sudor, E.doe) ? "sonrisa" : "o"} />
        {hay && f >= E.piel && f < E.doe ? (
          <>
            {/* gotitas de sudor en la frente */}
            {[[-40, -70], [30, -78], [60, -50]].map(([dx, dy], i) => (
              <path key={i} d={`M${PX + dx} ${PY + dy - 14} q10 16 0 24 q-10 -8 0 -24`} fill={C.azul} stroke={C.tinta} strokeWidth={3}
                opacity={f >= E.sudor ? Math.max(0, 1 - (f - E.sudor) / 50) : 1} />
            ))}
          </>
        ) : null}
      </g>
      {enPiel ? (
        <Flujo x0={PX - 70} x1={PX + 70} yAbajo={PY - 80} yArriba={PY - 330} n={10} velocidad={1.1} color={C.rojo} tam={9} t={f}
          opacidad={interpolate(f, [E.piel, E.piel + 14], [0, 1], clamp)} />
      ) : null}
    </svg>
  );
};

/* ---------- Anotaciones pegadas al mundo ---------- */
const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {f >= E.golpe && f < E.piel ? (
        <Rotulo texto="sigue en 29°" desde={E.aire} x={TERMO_X + 190} y={900} ax={TERMO_X + 20} ay={1000} color={C.blanco} fondo={C.rojo} tam={28} />
      ) : null}
      {entre(f, E.aire, E.piel) ? (
        <Rotulo texto="mismo aire, mismo calor" desde={r.w(2, "aire")} x={FX + 280} y={FY + 230} ax={FX + 330} ay={FY + 30} color={C.tinta} fondo={C.amarillo} tam={26} />
      ) : null}
      {entre(f, E.piel, E.sudor) ? (
        <Rotulo texto="se lleva el calor del cuerpo" desde={r.w(3, "calor")} x={PX + 20} y={PY - 400} ax={PX} ay={PY - 250} color={C.blanco} fondo={C.rojo} tam={24} />
      ) : null}
      {entre(f, E.sudor, E.doe) ? (
        <Rotulo texto="sudor evaporado = fresco" desde={r.w(4, "evapora")} x={PX + 20} y={PY - 400} ax={PX + 30} ay={PY - 130} color={C.blanco} fondo={C.verde} tam={26} />
      ) : null}
      {entre(f, E.motor, E.apagar) ? (
        <Rotulo texto="el motor suma calor" desde={r.w(6, "motor")} x={FX + 40} y={FY - 330} ax={FX} ay={FY - 160} color={C.tinta} fondo={C.amarillo} tam={26} />
      ) : null}
    </>
  );
};

/* ---------- Cámara ---------- */
const TOMAS = [
  toma(0, 540, 900, 1.0), toma(E.golpe - 2, 540, 900, 1.0),
  toma(E.golpe + 10, 440, 1000, 1.12), toma(E.aire - 2, 440, 1000, 1.12),
  toma(E.aire + 10, 440, 1000, 1.05), toma(E.piel - 2, 440, 1000, 1.05),
  toma(E.piel + 10, 780, 1000, 1.2), toma(E.doe - 2, 780, 1000, 1.2),
  toma(E.doe + 10, 540, 900, 1.0), toma(E.motor - 2, 540, 900, 1.0),
  toma(E.motor + 10, 330, 1050, 1.2), toma(E.apagar - 2, 330, 1050, 1.2),
  toma(E.apagar + 10, 540, 900, 1.0), toma(E.ojo - 2, 540, 900, 1.0),
  toma(E.ojo + 10, 700, 1000, 1.08), toma(E.remate - 2, 700, 1000, 1.08),
  toma(E.remate + 10, 540, 900, 1.0), toma(E.sello, 540, 900, 0.95),
];
const GOLPES = [r.w(1, "enfría"), r.w(3, "piel"), r.w(4, "evapora"), r.w(5, "personas"), r.w(6, "motor"), r.w(9, "piel")];

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
    <Etiqueta texto="lo hacés siempre" desde={-8} />
    <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={430} tam={52} />
    <Globo texto="¿se enfría sola?" desde={r.w(0, "fresca")} x={560} y={780} cola="der" tam={40} ancho={380} />
  </>
);

const Golpe: React.FC = () => {
  const ra = r.w(1, "enfría") - E.golpe;
  return (
    <>
      <Etiqueta texto="la verdad" color={C.verde} />
      <Titulo pregunta="el ventilador no enfría la pieza…" desdeP={0} respuesta="¡te enfría a vos!" desdeR={ra} top={415} tamR={90} />
      <Sello texto="MITO" desde={ra + 2} x={760} y={270} rot={-8} color={C.rojo} tam={74} />
    </>
  );
};

const Ojo: React.FC = () => (
  <>
    <Sello texto="OJO" desde={0} x={440} y={320} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
  </>
);

const Remate: React.FC = () => (
  <>
    <Etiqueta texto="si no hay piel" color={C.rojo} />
    <Sello texto="NO HAY FRESCURA" desde={r.w(9, "frescura") - E.remate} x={330} y={330} rot={-6} color={C.rojo} tam={56} />
  </>
);

const Manda: React.FC = () => {
  const man = r.w(10, "Mandáselo") - E.manda;
  return (
    <>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={340} />
      <Globo texto="espera que se enfríe sola" desde={man + 20} x={540} y={600} cola="izq" tam={38} ancho={460} />
    </>
  );
};

export const Ventilador009: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [r.w(0, "fresca"), "burbuja", 0.35],
    [E.golpe, "whoosh", 0.35], [r.w(1, "enfría") - 2, "scratch", 0.55], [r.w(1, "enfría"), "sello", 0.5],
    [E.aire, "pop"], [r.w(2, "grado"), "error", 0.4],
    [E.piel, "whoosh", 0.4], [r.w(3, "piel"), "tic", 0.4],
    [E.sudor, "pop"], [r.w(4, "fresco"), "ding", 0.45],
    [E.doe, "whoosh", 0.35], [r.w(5, "personas"), "sello", 0.5],
    [E.motor, "pop"], [r.w(6, "motor"), "tic", 0.4],
    [E.apagar, "whoosh", 0.35], [r.w(7, "apagarlo"), "boing", 0.45],
    [E.ojo, "sello", 0.55],
    [E.remate, "pop"], [r.w(9, "frescura"), "sello", 0.5],
    [E.manda, "pop"], [r.w(10, "Mandáselo"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo"><Logo /></Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.golpe - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · golpe" from={E.golpe} durationInFrames={E.aire - E.golpe} layout="none"><Golpe /></Sequence>
      <Sequence name="3 · aire" from={E.aire} durationInFrames={E.piel - E.aire} layout="none"><Etiqueta texto="solo mueve el aire" /></Sequence>
      <Sequence name="4 · piel" from={E.piel} durationInFrames={E.sudor - E.piel} layout="none"><Etiqueta texto="en tu piel sí pasa algo" color={C.verde} /></Sequence>
      <Sequence name="5 · sudor" from={E.sudor} durationInFrames={E.doe - E.sudor} layout="none"><Etiqueta texto="el sudor se evapora" color={C.verde} /></Sequence>
      <Sequence name="6 · doe" from={E.doe} durationInFrames={E.motor - E.doe} layout="none">
        <Etiqueta texto="la fuente" /><Fuente texto="Departamento de Energía de EE. UU." />
      </Sequence>
      <Sequence name="7 · motor" from={E.motor} durationInFrames={E.apagar - E.motor} layout="none"><Etiqueta texto="sin nadie, no sirve" color={C.rojo} /></Sequence>
      <Sequence name="8 · apagar" from={E.apagar} durationInFrames={E.ojo - E.apagar} layout="none"><Etiqueta texto="apagalo al salir" color={C.verde} /></Sequence>
      <Sequence name="9 · ojo" from={E.ojo} durationInFrames={E.remate - E.ojo} layout="none"><Ojo /></Sequence>
      <Sequence name="10 · remate" from={E.remate} durationInFrames={E.manda - E.remate} layout="none"><Remate /></Sequence>
      <Sequence name="11 · manda" from={E.manda} durationInFrames={DURACION - E.manda} layout="none"><Manda /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("009-ventilador-pieza-vacia/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada009: React.FC = () => (
  <Portada arriba="¿el ventilador enfría la pieza?" grande="NO" sello="MITO" colorSello={C.rojo} numero={9}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(260 -80) scale(1.25)"><Ventilador on={true} ang={20} /></g>
      <g transform="translate(260 -80) scale(1.25)"><Viento t={14} opacidad={1} /></g>
    </svg>
  </Portada>
);

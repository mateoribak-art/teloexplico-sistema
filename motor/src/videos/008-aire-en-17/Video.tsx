import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/008-aire-en-17/tiempos.json";
import { C, display, mono } from "../../kit/marca";
import { clamp, entre, golpe, pop, suave } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { AireSplit, Anafe, oscuro, claro, MAT, SOMBRA_D, LINEA } from "../../kit/biblioteca";
import { Camara, Contador, Flujo, OndasCalor, Rotulo, SolVolumen, TONO, Vecino, toma } from "../../kit/diagrama";

// Mundo único: una habitación en corte. En la pared, un aire split que sopla aire frío hacia abajo.
// A la izquierda, un termómetro con dos "destinos" (24 cómodo, 17 de más): la temperatura baja al mismo
// ritmo, solo cambia hasta dónde y cuánto tarda. A la derecha, una ventana (para el "ojo"). Abajo, el vecino.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  destino: r.f(2),
  decis: r.f(3),
  potencia: r.f(4),
  tiempo: r.f(5),
  plata: r.f(6),
  hornalla: r.f(7),
  ojo: r.f(8),
  regla: r.f(9),
  remate: r.f(10),
  sello: r.fin(10) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

/* ---------- Geometría del mundo ---------- */
const SUELO = 1480;
const ACX = 600, ACY = 600;          // aire en la pared
const SALIDA = ACY + 86;             // boca de salida del aire
const TX = 250;                       // eje del termómetro
const tTop = 740, tBulbo = 1300;      // tubo del termómetro
const tempY = (T: number) => 1260 + ((T - 16) / 14) * (760 - 1260); // 30°→arriba, 16°→abajo

/* Temperatura de la pieza (°C) según el frame: arranca caliente y baja en la escena del tiempo. */
const tempPieza = (f: number) => {
  if (f < E.tiempo) return 29;
  if (f >= E.ojo && f < E.regla) return 27; // con la ventana abierta no baja
  // baja 29 → 24 (destino cómodo) → 17 (de más)
  return interpolate(f, [E.tiempo, r.w(5, "compresor"), r.w(5, "frío"), E.plata], [29, 24, 20, 17], clamp);
};

/* ---------- Termómetro de pared con los dos destinos ---------- */
const Termo: React.FC = () => {
  const f = useCurrentFrame();
  const T = tempPieza(f);
  const yMerc = tempY(T);
  const id = "termo-grad";
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1={tTop} x2="0" y2={tBulbo} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={claro(C.azul, 0.5)} />
          <stop offset="0.5" stopColor={C.rojo} />
          <stop offset="1" stopColor={TONO.rojoSombra} />
        </linearGradient>
      </defs>
      {/* tubo */}
      <rect x={TX - 26 + 6} y={tTop + 6} width={52} height={tBulbo - tTop} rx={26} fill={C.tinta} />
      <rect x={TX - 26} y={tTop} width={52} height={tBulbo - tTop} rx={26} fill={C.blanco} stroke={C.tinta} strokeWidth={LINEA} />
      <circle cx={TX} cy={tBulbo} r={56} fill={C.tinta} transform={`translate(${SOMBRA_D * 0.5} ${SOMBRA_D * 0.5})`} />
      <circle cx={TX} cy={tBulbo} r={56} fill={C.rojo} stroke={C.tinta} strokeWidth={LINEA} />
      {/* mercurio */}
      <rect x={TX - 14} y={yMerc} width={28} height={tBulbo - yMerc} rx={14} fill={`url(#${id})`} />
      <circle cx={TX} cy={tBulbo} r={38} fill={C.rojo} />
      <rect x={TX - 16} y={tTop + 14} width={9} height={tBulbo - tTop - 30} rx={4} fill="#FFFFFF" opacity={0.6} />
      {/* marcas de los destinos */}
      {[[30, "30°", MAT.metalOscuro], [24, "24°", C.verde], [17, "17°", C.azul]].map(([Tm, txt, col]) => (
        <g key={txt as string}>
          <line x1={TX + 30} y1={tempY(Tm as number)} x2={TX + 64} y2={tempY(Tm as number)} stroke={col as string} strokeWidth={7} strokeLinecap="round" />
          <text x={TX + 74} y={tempY(Tm as number) + 10} fontFamily={mono} fontWeight={700} fontSize={30} fill={C.tinta}>{txt as string}</text>
        </g>
      ))}
    </g>
  );
};

/* ---------- Ventana de pared (para el "ojo"): se abre y entra el sol/calor ---------- */
const Ventana: React.FC<{ abierta: number }> = ({ abierta }) => {
  const WX = 880, WY = 840, W = 230, H = 300;
  const hoja = `M${WX - W / 2} ${WY - H / 2} h${W} v${H} h${-W} Z`;
  return (
    <g>
      {/* marco */}
      <rect x={WX - W / 2 - 16} y={WY - H / 2 - 16} width={W + 32} height={H + 32} rx={10} fill={MAT.madera} stroke={C.tinta} strokeWidth={LINEA} />
      {/* afuera: cielo + sol que se cuela */}
      <clipPath id="vent-c"><path d={hoja} /></clipPath>
      <path d={hoja} fill={abierta > 0.3 ? claro(C.azul, 0.7) : "#BFE0F5"} />
      <g clipPath="url(#vent-c)">
        {abierta > 0.3 ? <SolVolumen cx={WX + 30} cy={WY - 60} r={46} t={0} intensidad={1.4} /> : null}
      </g>
      {/* hoja de vidrio (se corre al abrir) */}
      <g transform={`translate(${-abierta * (W - 30)} 0)`}>
        <rect x={WX - W / 2} y={WY - H / 2} width={W} height={H} fill={claro(MAT.vidrio, 0.3)} stroke={C.tinta} strokeWidth={6} opacity={0.75} />
        <line x1={WX - W / 2 + 20} y1={WY - H / 2 + 20} x2={WX - W / 2 + 70} y2={WY + H / 2 - 30} stroke="#FFFFFF" strokeWidth={8} opacity={0.7} />
      </g>
      <line x1={WX} y1={WY - H / 2} x2={WX} y2={WY + H / 2} stroke={MAT.madera} strokeWidth={8} />
    </g>
  );
};

/* ---------- Reloj simple (la máquina "trabaja más tiempo") ---------- */
const Reloj: React.FC<{ cx: number; cy: number; r: number; giro: number }> = ({ cx, cy, r: rad, giro }) => (
  <g>
    <circle cx={cx + 6} cy={cy + 6} r={rad} fill={C.tinta} />
    <circle cx={cx} cy={cy} r={rad} fill={C.blanco} stroke={C.tinta} strokeWidth={LINEA} />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <line key={i} x1={cx + Math.cos(a) * (rad - 14)} y1={cy + Math.sin(a) * (rad - 14)} x2={cx + Math.cos(a) * (rad - 4)} y2={cy + Math.sin(a) * (rad - 4)} stroke={C.tinta} strokeWidth={4} />;
    })}
    <line x1={cx} y1={cy} x2={cx + Math.cos(giro - Math.PI / 2) * (rad - 24)} y2={cy + Math.sin(giro - Math.PI / 2) * (rad - 24)} stroke={C.rojo} strokeWidth={8} strokeLinecap="round" />
    <line x1={cx} y1={cy} x2={cx + Math.cos(giro * 12 - Math.PI / 2) * (rad - 14)} y2={cy + Math.sin(giro * 12 - Math.PI / 2) * (rad - 14)} stroke={C.tinta} strokeWidth={5} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={8} fill={C.tinta} />
  </g>
);

/* ---------- El mundo completo ---------- */
const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const caliente = f < E.tiempo || entre(f, E.ojo, E.regla);
  const temp17 = f < E.regla; // el display muestra 17 hasta "la regla"
  const sopla = entre(f, E.gancho, E.sello) ? 1 : 0;
  const ventanaAbierta = entre(f, E.ojo, E.regla) ? suave(f, E.ojo + 6, 14) * (1 - suave(f, r.w(9, "cerrá"), 12)) : 0;
  const frioLlega = !caliente || f >= E.potencia;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* pared y piso */}
      <rect x={-400} y={SUELO} width={1880} height={520} fill={TONO.tierra} stroke={C.tinta} strokeWidth={7} />
      <rect x={-400} y={SUELO} width={1880} height={16} fill={oscuro(TONO.tierra, 0.2)} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={-200 + i * 170} y1={SUELO} x2={-260 + i * 170} y2={SUELO + 520} stroke={oscuro(TONO.tierra, 0.15)} strokeWidth={4} />
      ))}

      {/* calor que entra por la ventana o sube del piso cuando está caliente */}
      <OndasCalor xs={[430, 560, 690]} y={SUELO - 10} t={f} opacidad={caliente ? 0.9 : 0.12} />
      <rect x={-400} y={0} width={1880} height={SUELO} fill={C.rojo} opacity={caliente ? 0.06 : 0} />
      <rect x={-400} y={0} width={1880} height={SUELO} fill={C.azul} opacity={frioLlega && !caliente ? 0.05 : 0} />

      <Ventana abierta={ventanaAbierta} />
      <Termo />

      {/* aire frío que baja del split (mismo ritmo siempre) */}
      {sopla ? (
        <Flujo x0={ACX - 120} x1={ACX + 120} yAbajo={1320} yArriba={SALIDA} n={16} velocidad={1.2} color={C.azul} tam={11} t={f}
          opacidad={interpolate(f, [E.gancho, E.gancho + 10], [0, 1], clamp) * (ventanaAbierta > 0.4 ? 0.5 : 1)} />
      ) : null}
      {/* el aire se "escapa" por la ventana en el ojo */}
      {ventanaAbierta > 0.4 ? (
        <Flujo x0={ACX + 40} x1={820} yAbajo={1000} yArriba={820} n={8} velocidad={1.6} color={C.azul} tam={9} t={f} opacidad={0.7} />
      ) : null}

      <AireSplit x={ACX} y={ACY} s={1.0} t={f} temp={temp17 ? 17 : 24} soplando={sopla} colorTemp={temp17 ? C.verde : C.azul} />

      {/* el vecino abajo, con el control apuntando al aire */}
      <g transform="translate(0 0)">
        <Vecino cx={460} cy={1150} s={0.72} t={f} boca={entre(f, E.gancho, E.golpe) || f >= E.remate ? "o" : "sonrisa"} />
        {/* control remoto en la mano */}
        <g transform={`translate(600 1230) rotate(-18)`}>
          <rect x={0} y={0} width={54} height={120} rx={14} fill={claro(MAT.goma, 0.2)} stroke={C.tinta} strokeWidth={6} />
          <rect x={10} y={12} width={34} height={26} rx={6} fill="#1A1E33" stroke={C.tinta} strokeWidth={3} />
          <text x={27} y={33} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={20} fill={temp17 ? C.verde : C.azul}>{temp17 ? 17 : 24}</text>
          {[52, 72, 92].map((by) => <circle key={by} cx={27} cy={by} r={7} fill={MAT.metalOscuro} stroke={C.tinta} strokeWidth={2} />)}
        </g>
      </g>
    </svg>
  );
};

/* ---------- Anotaciones pegadas al mundo (se mueven con la cámara) ---------- */
const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {entre(f, E.destino, E.decis) ? (
        <Rotulo texto="hasta acá llega" desde={r.w(2, "destino")} x={TX + 180} y={tempY(17)} ax={TX + 66} ay={tempY(17)} color={C.blanco} fondo={C.azul} tam={26} />
      ) : null}
      {entre(f, E.decis, E.potencia) ? (
        <>
          <Rotulo texto="el destino ✓" desde={E.decis + 4} x={TX + 180} y={tempY(24)} ax={TX + 66} ay={tempY(24)} color={C.blanco} fondo={C.verde} tam={24} />
          <Rotulo texto="no la velocidad ✗" desde={r.w(3, "velocidad")} x={TX + 200} y={tempY(30) + 30} ax={TX + 66} ay={tempY(30)} color={C.blanco} fondo={C.rojo} tam={24} />
        </>
      ) : null}
      {entre(f, E.potencia, E.tiempo) ? (
        <Rotulo texto="misma potencia" desde={r.w(4, "potencia")} x={ACX - 140} y={SALIDA + 150} ax={ACX} ay={SALIDA + 40} color={C.tinta} fondo={C.amarillo} tam={28} />
      ) : null}
      {entre(f, E.tiempo, E.plata) ? (
        <Rotulo texto="trabaja más tiempo" desde={r.w(5, "compresor")} x={TX + 230} y={1000} ax={TX + 60} ay={tempY(20)} color={C.tinta} fondo={C.amarillo} tam={26} />
      ) : null}
      {entre(f, E.plata, E.hornalla) ? (
        <Contador hasta={8} desde={r.w(6, "ocho")} dur={20} antes="+" despues=" %" x={800} y={1090} tam={120} color={C.rojo} etiqueta="por cada grado que bajás" />
      ) : null}
    </>
  );
};

/* ---------- Cámara ---------- */
const TOMAS = [
  toma(0, 540, 880, 1.0), toma(E.golpe, 540, 880, 1.04),
  toma(E.destino - 2, 540, 880, 1.04), toma(E.destino, TX + 120, 1040, 1.2),
  toma(E.decis, TX + 150, 1000, 1.18), toma(E.potencia - 2, TX + 150, 1000, 1.18),
  toma(E.potencia, ACX, 780, 1.12), toma(E.tiempo - 2, ACX, 780, 1.12),
  toma(E.tiempo, 430, 1010, 1.04), toma(E.plata - 2, 430, 1010, 1.04),
  toma(E.plata, 660, 760, 1.12), toma(E.hornalla - 2, 660, 760, 1.12),
  toma(E.hornalla, 540, 900, 1.0), toma(E.ojo - 2, 540, 900, 1.0),
  toma(E.ojo, 760, 860, 1.12), toma(E.regla - 2, 760, 860, 1.12),
  toma(E.regla, 600, 760, 1.06), toma(E.remate - 2, 600, 760, 1.06),
  toma(E.remate, 470, 1030, 1.0), toma(E.remate + 20, 470, 1030, 0.92),
];
const GOLPES = [r.w(1, "rápido"), r.w(2, "destino"), r.w(3, "velocidad"), r.w(4, "potencia"), r.w(5, "frío"), r.w(6, "ocho"), r.w(8, "ventana"), r.w(9, "veinticuatro")];

const Diagrama: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= E.sello) return null;
  const g = GOLPES.reduce((m, k) => m * golpe(f, k, 1.05, 12), 1);
  const atenua = entre(f, E.hornalla, E.ojo) ? interpolate(f, [E.hornalla, E.hornalla + 8, E.ojo - 6, E.ojo], [1, 0.3, 0.3, 1], clamp) : 1;
  return (
    <AbsoluteFill style={{ scale: g, opacity: atenua }}>
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
    <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={430} tam={56} />
    <Globo texto="¿para que enfríe más rápido?" desde={22} x={110} y={760} cola="der" tam={38} ancho={430} />
  </>
);

const Golpe: React.FC = () => {
  const rap = r.w(1, "rápido") - E.golpe;
  return (
    <>
      <Etiqueta texto="la verdad" color={C.verde} />
      <Titulo pregunta="en diecisiete no enfría…" desdeP={0} respuesta="¡más rápido!" desdeR={rap} top={415} tamR={110} />
      <Sello texto="MITO" desde={rap + 2} x={760} y={270} rot={-8} color={C.rojo} tam={74} />
    </>
  );
};

/* Analogía de la hornalla como inset de pantalla (más número ≠ más fuerza). */
const Hornalla: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cruz = r.w(7, "aire") - E.hornalla;
  return (
    <>
      <Etiqueta texto="¿por qué caemos?" />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 980px" }}>
          <Anafe x={400} y={1020} s={1.15} t={frame} fuego={[1, 0.5]} />
          {/* perilla: más número = más fuego */}
          <g transform="translate(760 960)">
            <circle cx={0} cy={0} r={70} fill={C.blanco} stroke={C.tinta} strokeWidth={LINEA} />
            <line x1={0} y1={0} x2={Math.cos(-0.6) * 54} y2={Math.sin(-0.6) * 54} stroke={C.rojo} strokeWidth={10} strokeLinecap="round" />
            <text x={0} y={120} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={30} fill={C.tinta}>más número = más fuego</text>
          </g>
        </g>
      </Lienzo>
      {frame >= cruz ? (
        <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center" }}>
          <span style={{ fontFamily: display, fontWeight: 800, fontSize: 70, color: C.rojo, background: C.blanco, border: `6px solid ${C.tinta}`, borderRadius: 18, padding: "6px 24px", boxShadow: "8px 8px 0 #111111" }}>
            el aire no va así
          </span>
        </div>
      ) : null}
    </>
  );
};

const Regla: React.FC = () => (
  <>
    <Etiqueta texto="la regla" color={C.verde} />
    <Sello texto="24° Y CERRAR" desde={r.w(9, "veinticuatro") - E.regla} x={250} y={330} rot={-6} color={C.verde} tinta={C.tinta} tam={56} />
  </>
);

const Remate: React.FC = () => {
  const man = r.w(10, "mandáselo") - E.remate;
  return (
    <>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={340} />
      {useCurrentFrame() >= man ? (
        <Globo texto="lo pone en 17 'para que enfríe'" desde={man} x={120} y={560} cola="izq" tam={38} ancho={460} />
      ) : null}
    </>
  );
};

export const AireEn17008: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [22, "burbuja", 0.35],
    [E.golpe, "whoosh", 0.35], [r.w(1, "rápido") - 2, "scratch", 0.55], [r.w(1, "rápido"), "sello", 0.5],
    [E.destino, "whoosh", 0.35], [r.w(2, "destino"), "ding", 0.45],
    [E.decis, "pop"], [r.w(3, "velocidad"), "error", 0.4],
    [E.potencia, "whoosh", 0.4], [r.w(4, "potencia"), "tic", 0.4],
    [E.tiempo, "whoosh", 0.35], [r.w(5, "compresor"), "tic", 0.4], [r.w(5, "frío"), "ding", 0.4],
    [E.plata, "pop"], [r.w(6, "ocho") - 4, "tic", 0.4], [r.w(6, "ocho") + 16, "ding", 0.5],
    [E.hornalla, "pop"], [r.w(7, "aire"), "scratch", 0.45],
    [E.ojo, "sello", 0.55], [r.w(8, "ventana"), "whoosh", 0.4], [r.w(8, "sol"), "pop"],
    [E.regla, "whoosh", 0.35], [r.w(9, "veinticuatro"), "sello", 0.5], [r.w(9, "cerrá"), "boing", 0.45],
    [E.remate, "pop"], [r.w(10, "mandáselo"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo"><Logo /></Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.golpe - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · golpe" from={E.golpe} durationInFrames={E.destino - E.golpe} layout="none"><Golpe /></Sequence>
      <Sequence name="3 · destino" from={E.destino} durationInFrames={E.decis - E.destino} layout="none">
        <Etiqueta texto="el termostato" /><Fuente texto="Secretaría de Energía (Argentina)" />
      </Sequence>
      <Sequence name="4 · decís" from={E.decis} durationInFrames={E.potencia - E.decis} layout="none">
        <Etiqueta texto="destino, no velocidad" />
      </Sequence>
      <Sequence name="5 · potencia" from={E.potencia} durationInFrames={E.tiempo - E.potencia} layout="none">
        <Etiqueta texto="arranca a full igual" color={C.verde} />
      </Sequence>
      <Sequence name="6 · tiempo" from={E.tiempo} durationInFrames={E.plata - E.tiempo} layout="none">
        <Etiqueta texto="lo único que cambia" />
        <Reloj2 />
      </Sequence>
      <Sequence name="7 · plata" from={E.plata} durationInFrames={E.hornalla - E.plata} layout="none">
        <Etiqueta texto="y se paga" color={C.rojo} /><Fuente texto="Secretaría de Energía (Argentina)" />
      </Sequence>
      <Sequence name="8 · hornalla" from={E.hornalla} durationInFrames={E.ojo - E.hornalla} layout="none"><Hornalla /></Sequence>
      <Sequence name="9 · ojo" from={E.ojo} durationInFrames={E.regla - E.ojo} layout="none">
        <Sello texto="OJO" desde={0} x={440} y={320} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
      </Sequence>
      <Sequence name="10 · regla" from={E.regla} durationInFrames={E.remate - E.regla} layout="none"><Regla /></Sequence>
      <Sequence name="11 · remate" from={E.remate} durationInFrames={DURACION - E.remate} layout="none"><Remate /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("008-aire-en-17/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

/* Reloj encima del termómetro durante "lo único que cambia es el tiempo". */
const Reloj2: React.FC = () => {
  const f = useCurrentFrame();
  const giro = (f - E.tiempo) * 0.26;
  return (
    <Lienzo>
      <Reloj cx={830} cy={880} r={90} giro={giro} />
      <text x={830} y={1020} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={30} fill={C.tinta}>sigue y sigue</text>
    </Lienzo>
  );
};

export const Portada008: React.FC = () => (
  <Portada arriba="¿el aire en 17 enfría más rápido?" grande="NO" sello="MITO" colorSello={C.rojo} numero={8}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <AireSplit x={560} y={900} s={1.25} t={10} temp={17} soplando={1} />
      <Flujo x0={430} x1={690} yAbajo={1320} yArriba={1000} n={14} velocidad={1} color={C.azul} tam={12} t={20} />
    </svg>
  </Portada>
);

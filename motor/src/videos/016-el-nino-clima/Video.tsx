import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/016-el-nino-clima/tiempos.json";
import { C, display } from "../../kit/marca";
import { clamp, entre, golpe, pop } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Nube, Sol, Termometro } from "../../kit/biblioteca";
import { Camara, Contador, Flujo, OndasCalor, Rotulo, TONO, Trazo, Vecino, toma } from "../../kit/diagrama";

// Versión corta (26/10): la de 70 s y 11 frases aburría. 8 frases, 34 s, una idea: el Pacífico se calienta -> llueve más acá.
// Mundo: un corte de costa. A la izquierda el océano Pacífico con una mancha de agua que se calienta (El Niño);
// a la derecha tierra argentina con nubes y un pin "VOS" (lo personal retiene: idea tomada de los reels que más funcionan).

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  pacifico: r.f(1),
  calienta: r.f(2),
  circula: r.f(3),
  regiones: r.f(4),
  fuerte: r.f(5),
  vuelve: r.f(6),
  cta: r.f(7),
  sello: r.fin(7) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const MAR = 1100; // superficie del agua y de la tierra
const COSTA = 600;

/* Gotas de lluvia sobre la tierra: n sube con la intensidad. */
const Lluvia: React.FC<{ f: number; n: number; x0: number; x1: number; y0: number }> = ({ f, n, x0, x1, y0 }) => (
  <g stroke={C.azul} strokeWidth={7} strokeLinecap="round">
    {Array.from({ length: n }).map((_, i) => {
      const per = 22 + (i % 4) * 4;
      const c = ((f + i * 9) % per) / per;
      const x = x0 + (x1 - x0) * ((i + 0.5) / n) + Math.sin(i * 1.7) * 10;
      const yy = y0 + (MAR - 20 - y0) * c;
      return <line key={i} x1={x} y1={yy} x2={x - 8} y2={yy + 30} opacity={Math.min(1, c * 8, (1 - c) * 8)} />;
    })}
  </g>
);

/* Pin "VOS" clavado en la tierra: rebota al aparecer. */
const PinVos: React.FC<{ f: number; desde: number }> = ({ f, desde }) => {
  const { fps } = useVideoConfig();
  const s = pop(f - desde, fps, 0);
  return (
    <g style={{ scale: s, transformOrigin: `880px ${MAR}px` }}>
      <path d={`M880 ${MAR} C850 ${MAR - 60} 830 ${MAR - 80} 830 ${MAR - 110} a50 50 0 1 1 100 0 C930 ${MAR - 80} 910 ${MAR - 60} 880 ${MAR} Z`}
        fill={C.rojo} stroke={C.tinta} strokeWidth={8} />
      <circle cx={880} cy={MAR - 112} r={20} fill={C.blanco} stroke={C.tinta} strokeWidth={6} />
      <rect x={820} y={MAR - 230} width={120} height={58} rx={14} fill={C.tinta} />
      <text x={880} y={MAR - 189} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={38} fill={C.amarillo}>VOS</text>
    </g>
  );
};

const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  // la mancha caliente: aparece con "caliente", crece con "fuerte", late en "vuelve"
  const cal = interpolate(f, [E.calienta, r.w(2, "caliente") + 20, E.fuerte, r.w(5, "fuerte") + 16], [0, 0.6, 0.6, 1], clamp);
  const late = entre(f, E.vuelve, E.cta) ? 0.55 + 0.45 * Math.sin((f - E.vuelve) / 6) ** 2 : 1;
  const calor = cal * late;
  const tormenta = interpolate(f, [E.circula, r.w(3, "lluvia") + 16, E.regiones, E.regiones + 24], [0.1, 0.5, 0.5, 1], clamp);
  const lluvia = f < E.pacifico ? 10 : f >= E.circula + 24 ? (f >= E.regiones ? 18 : 9) : 0;
  const vos = f < E.pacifico || entre(f, E.regiones, E.cta);
  const ola = (x: number) => MAR + Math.sin(x / 55 + f / 9) * 9;
  const olas = Array.from({ length: 24 }, (_, i) => `${i ? "L" : "M"}${-300 + i * 40} ${ola(-300 + i * 40)}`).join(" ") + ` L${COSTA} ${MAR + 30} L-300 ${MAR + 30} Z`;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="mar16" x1="0" y1={MAR} x2="0" y2={MAR + 500} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6FB6F2" />
          <stop offset="1" stopColor="#2E59E6" />
        </linearGradient>
        <radialGradient id="calor16" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.rojo} stopOpacity="0.95" />
          <stop offset="1" stopColor={C.amarillo} stopOpacity="0.1" />
        </radialGradient>
      </defs>
      {/* mar (Pacífico) */}
      <rect x={-1500} y={MAR} width={1500 + COSTA} height={560} fill="url(#mar16)" stroke={C.tinta} strokeWidth={8} />
      <path d={olas} fill="#8CC8F7" stroke={C.tinta} strokeWidth={8} strokeLinejoin="round" />
      <ellipse cx={270} cy={MAR + 110} rx={330} ry={90} fill="url(#calor16)" opacity={calor} />
      {/* tierra */}
      <rect x={COSTA} y={MAR} width={1500} height={560} fill={TONO.tierra} stroke={C.tinta} strokeWidth={8} />
      <rect x={COSTA} y={MAR} width={1500} height={36} fill={TONO.pasto} stroke={C.tinta} strokeWidth={8} />
      <g fill={TONO.tierraSombra} opacity={0.7}>
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={COSTA + 60 + i * 110} y={MAR + 90 + (i % 3) * 70} width={50} height={14} rx={7} />)}
      </g>

      {/* sol sobre el mar: calienta */}
      <Sol x={120} y={860} s={0.8} t={f} fuerza={0.6 + 0.8 * calor} />
      <OndasCalor xs={[170, 270, 370]} y={MAR - 6} t={f} opacidad={calor} />
      {calor > 0.2 ? (
        <Flujo x0={150} x1={400} yAbajo={MAR - 20} yArriba={900} n={12} color={C.rojo} tam={9} t={f} opacidad={Math.min(1, calor * 1.2)} />
      ) : null}

      {/* el aire que viaja hacia la tierra */}
      <Trazo d="M330 880 C470 760 620 740 740 800" desde={r.w(3, "cambia")} dur={20} color={C.rojo} ancho={12} flecha />
      <Trazo d="M330 960 C470 860 640 850 800 900" desde={r.w(3, "lluvia") - 6} dur={18} color={C.rojo} ancho={10} punteado="22 16" flecha />

      {/* nubes y lluvia sobre la tierra */}
      <Nube x={760} y={830} s={1.3} t={f} tormenta={f < E.pacifico ? 0.8 : tormenta} />
      <Nube x={950} y={890} s={1.0} t={f + 30} tormenta={f < E.pacifico ? 0.7 : tormenta * 0.9} />
      {lluvia > 0 ? <Lluvia f={f} n={lluvia} x0={660} x1={1040} y0={930} /> : null}
      <rect x={COSTA - 6} y={MAR - 4} width={10} height={20} fill={C.tinta} />
      {vos ? <PinVos f={f} desde={f < E.pacifico ? 14 : E.regiones} /> : null}
    </svg>
  );
};

/* Lo que va pegado al mundo */
const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {entre(f, E.pacifico, E.calienta) ? <Rotulo texto="océano Pacífico" desde={r.w(1, "Pacífico") - 4} x={230} y={1255} ax={260} ay={1190} tam={32} /> : null}
      {entre(f, E.calienta, E.circula) ? (
        <Contador hasta={2} antes="+" despues=" °C" desde={r.w(2, "dos") - 12} dur={16} x={300} y={1140} tam={120} etiqueta="más caliente de lo normal" />
      ) : null}
      {entre(f, E.circula, E.regiones) ? <Rotulo texto="la lluvia cambia de camino" desde={r.w(3, "cambia")} x={700} y={1030} ax={640} ay={880} tam={28} /> : null}
      {entre(f, E.regiones, E.fuerte) ? (
        <>
          <Rotulo texto="Litoral" desde={r.w(4, "Litoral")} x={950} y={1220} ax={950} ay={1130} tam={28} />
          <Rotulo texto="Córdoba" desde={r.w(4, "Córdoba")} x={700} y={1250} ax={720} ay={1130} tam={28} />
          <Rotulo texto="La Pampa" desde={r.w(4, "Pampa")} x={880} y={1290} ax={850} ay={1140} tam={28} />
          <Rotulo texto="oeste bonaerense" desde={r.w(4, "oeste")} x={790} y={1345} ax={780} ay={1150} tam={26} />
        </>
      ) : null}
      {entre(f, E.fuerte, E.vuelve) ? (
        <Rotulo texto="fuerte hasta el verano" desde={r.w(5, "fuerte")} x={300} y={1260} ax={270} ay={1190} color={C.blanco} fondo={C.rojo} tam={30} />
      ) : null}
    </>
  );
};

// la cámara cambia en cada frase y a mitad de las largas: algo se mueve cada 1–2 s
const TOMAS = [
  toma(0, 800, 760, 1.1), toma(E.pacifico, 540, 800, 0.95), toma(r.w(1, "Pacífico") - 4, 320, 900, 1.2),
  toma(E.calienta, 300, 990, 1.4), toma(E.circula - 4, 540, 820, 1.0), toma(r.w(3, "lluvia"), 760, 860, 1.15),
  toma(E.regiones, 820, 900, 1.1), toma(r.w(4, "Pampa"), 860, 920, 1.2), toma(E.fuerte, 320, 960, 1.25),
  toma(E.vuelve, 540, 900, 0.95), toma(E.cta - 2, 540, 880, 0.95),
];
const GOLPES = [r.w(1, "Pacífico"), r.w(2, "caliente"), r.w(3, "Niño"), r.w(3, "lluvia"), r.w(4, "Litoral"), r.w(4, "Córdoba"),
  r.w(4, "Pampa"), r.w(5, "fuerte"), r.w(6, "loco"), r.w(6, "siete")];

const Diagrama: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= E.cta) return null;
  const g = GOLPES.reduce((m, k) => m * golpe(f, k, 1.06, 10), 1);
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
    <Etiqueta texto="lo vivís esta primavera" desde={-8} />
    <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={420} tam={62} />
    <Globo texto="¿otra vez lluvia?" desde={16} x={90} y={640} cola="izq" tam={44} ancho={380} />
  </>
);

const Pacifico: React.FC = () => (
  <>
    <Etiqueta texto="la explicación" color={C.verde} />
    <Titulo pregunta="una parte de la explicación…" desdeP={0} respuesta="¡el Pacífico!" desdeR={r.w(1, "Pacífico") - E.pacifico} top={370} tamR={100} />
  </>
);

const Vuelve: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const loco = r.w(6, "loco") - E.vuelve;
  const dos = r.w(6, "dos") - E.vuelve;
  const siete = r.w(6, "siete") - E.vuelve;
  return (
    <>
      <Sello texto="OJO" desde={0} x={420} y={430} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
      {f >= loco ? <Etiqueta texto="no es un clima loco" color={C.verde} desde={loco} /> : null}
      {f >= dos ? (
        <Lienzo>
          <g style={{ scale: pop(f - dos, fps, 0), transformOrigin: "540px 860px" }}>
            <rect x={70 + 10} y={700 + 10} width={940} height={260} rx={28} fill={C.tinta} />
            <rect x={70} y={700} width={940} height={260} rx={28} fill={C.blanco} stroke={C.tinta} strokeWidth={8} />
            <text x={540} y={800} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={52} fill={C.tinta}>El Niño vuelve</text>
            <text x={540} y={880} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={44} fill={C.rojo}>en promedio, cada 2 a 7 años</text>
          </g>
        </Lienzo>
      ) : null}
      {f >= siete ? <Sello texto="NORMAL" desde={siete} x={600} y={1010} rot={5} color={C.verde} tinta={C.tinta} tam={56} /> : null}
    </>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grito = r.w(7, "clima") - E.cta;
  return (
    <>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={360} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1100px" }}>
          <rect x={200 + 14} y={700 + 14} width={680} height={640} rx={20} fill={C.tinta} />
          <rect x={200} y={700} width={680} height={640} rx={20} fill={TONO.frio} stroke={C.tinta} strokeWidth={10} />
          <Vecino cx={540} cy={1010} s={1.05} t={frame} boca={frame >= grito ? "o" : "sonrisa"} />
          <line x1={540} y1={700} x2={540} y2={860} stroke={C.tinta} strokeWidth={10} />
          <line x1={200} y1={860} x2={880} y2={860} stroke={C.tinta} strokeWidth={10} />
          <path d="M230 730 l90 0 l-90 90 z" fill={C.blanco} opacity={0.6} />
          <rect x={170} y={1336} width={740} height={40} rx={14} fill={TONO.tierraSombra} stroke={C.tinta} strokeWidth={8} />
          <Lluvia f={frame} n={10} x0={210} x1={870} y0={600} />
        </g>
      </Lienzo>
      {frame >= grito ? <Globo texto="¡el clima está loco!" desde={grito} x={520} y={560} cola="der" tam={40} ancho={440} /> : null}
    </>
  );
};

export const ElNinoClima016: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [14, "pop"], [16, "burbuja", 0.35],
    [E.pacifico, "whoosh", 0.35], [r.w(1, "Pacífico") - 2, "scratch", 0.55], [r.w(1, "Pacífico"), "boing", 0.5],
    [E.calienta, "whoosh", 0.35], [r.w(2, "dos") - 12, "tic", 0.4], [r.w(2, "dos") + 4, "ding", 0.45],
    [E.circula, "whoosh", 0.35], [r.w(3, "Niño"), "sello", 0.45], [r.w(3, "lluvia"), "latigo", 0.35],
    [E.regiones, "whoosh", 0.35], [r.w(4, "Litoral"), "pop"], [r.w(4, "Córdoba"), "pop"], [r.w(4, "Pampa"), "pop"], [r.w(4, "oeste"), "pop"],
    [E.fuerte, "whoosh", 0.35], [r.w(5, "fuerte"), "sello", 0.45],
    [E.vuelve, "sello", 0.55], [r.w(6, "dos"), "pop"], [r.w(6, "siete"), "sello", 0.5],
    [E.cta, "pop"], [r.w(7, "clima"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo">
        <Logo />
      </Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.pacifico - E.gancho} layout="none"><Gancho /></Sequence>
      <Sequence name="2 · pacifico" from={E.pacifico} durationInFrames={E.calienta - E.pacifico} layout="none"><Pacifico /></Sequence>
      <Sequence name="3 · calienta" from={E.calienta} durationInFrames={E.circula - E.calienta} layout="none">
        <Etiqueta texto="paso 1 · el agua se calienta" /><Fuente texto="Centro de Predicción del Clima (NOAA), octubre" />
      </Sequence>
      <Sequence name="4 · el niño" from={E.circula} durationInFrames={E.regiones - E.circula} layout="none"><Etiqueta texto="paso 2 · eso es El Niño" /></Sequence>
      <Sequence name="5 · regiones" from={E.regiones} durationInFrames={E.fuerte - E.regiones} layout="none">
        <Etiqueta texto="paso 3 · llueve más acá" /><Fuente texto="SMN, pronóstico trimestral" />
      </Sequence>
      <Sequence name="6 · fuerte" from={E.fuerte} durationInFrames={E.vuelve - E.fuerte} layout="none">
        <Etiqueta texto="lo que calculan" /><Fuente texto="Centro de Predicción del Clima (NOAA)" />
      </Sequence>
      <Sequence name="7 · ojo" from={E.vuelve} durationInFrames={E.cta - E.vuelve} layout="none">
        <Vuelve /><Fuente texto="NOAA" />
      </Sequence>
      <Sequence name="8 · cta" from={E.cta} durationInFrames={DURACION - E.cta} layout="none"><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal mandar={`mandáselo a ese que dice que el clima está loco`} /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("016-el-nino-clima/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada016: React.FC = () => (
  <Portada arriba="¿por qué este año llueve así?" grande="El Niño" sello="CIENCIA" colorSello={C.verde} numero={16}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(0 400)">
        <rect x={0} y={1000} width={620} height={500} fill="#4C86EE" stroke={C.tinta} strokeWidth={8} />
        <ellipse cx={300} cy={1100} rx={300} ry={80} fill={C.rojo} opacity={0.85} />
        <rect x={620} y={1000} width={500} height={500} fill={TONO.tierra} stroke={C.tinta} strokeWidth={8} />
        <Sol x={190} y={560} s={0.85} t={10} fuerza={1.4} />
        <Nube x={820} y={600} s={1.25} t={10} tormenta={1} />
        <Termometro x={480} y={760} s={1.0} valor={0.85} />
      </g>
    </svg>
  </Portada>
);

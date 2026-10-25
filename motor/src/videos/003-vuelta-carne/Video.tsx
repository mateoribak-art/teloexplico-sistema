import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/003-vuelta-carne/tiempos.json";
import { C, display } from "../../kit/marca";
import { clamp, golpe, pop } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Escena, Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Palabrota, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Bife, Libro, Parrilla, Reloj, Sudor, Tenedor, Termometro } from "../../kit/dibujos";

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  golpe: r.f(1),
  mecanismo: r.f(2),
  resultado: r.f(3),
  ciencia: r.f(4),
  jugo: r.f(5),
  ojo: r.f(6),
  lento: r.f(7),
  retan: r.f(8),
  cta: r.f(9),
  sello: r.fin(9) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

/* ---- piezas de escena propias de este video ---- */
const Fuego: React.FC<{ cx: number; y: number; t: number; n?: number; s?: number }> = ({ cx, y, t, n = 5, s = 1 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const dx = (i - (n - 1) / 2) * 62 * s;
      const alto = (46 + Math.sin(t / 2 + i) * 12) * s;
      return (
        <path key={i} d={`M${cx + dx} ${y} q${-16 * s} ${-alto * 0.7} 0 ${-alto} q${16 * s} ${alto * 0.4} 0 ${alto} z`}
          fill={i % 2 ? C.amarillo : C.rojo} stroke={C.tinta} strokeWidth={5} />
      );
    })}
  </g>
);
const Grilla: React.FC<{ y: number }> = ({ y }) => (
  <g>
    {Array.from({ length: 11 }).map((_, i) => (
      <line key={i} x1={170 + i * 66} y1={y - 44} x2={170 + i * 66} y2={y + 24} stroke={C.tinta} strokeWidth={6} strokeLinecap="round" />
    ))}
    <rect x={130} y={y} width={820} height={24} rx={10} fill={C.tinta} />
    <rect x={130} y={y} width={820} height={24} rx={10} fill="#9A9A9A" stroke={C.tinta} strokeWidth={6} />
  </g>
);

/* 1 · ¿A la carne se la da vuelta una sola vez? */
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Escena entrada={false}>
      <Etiqueta texto="el mito del asado" desde={-8} />
      <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={430} tam={62} />
      <Lienzo>
        <Fuego cx={540} y={1360} t={frame} n={6} />
        <Grilla y={1300} />
        <Bife cx={540} cy={1150} s={0.92} t={frame} cara="feliz" coccion={0.55} />
        <Tenedor x={880} y={880} s={0.9} rot={22} />
      </Lienzo>
      <Globo texto="¿una sola vez?" desde={14} x={120} y={900} cola="izq" tam={42} ancho={340} />
    </Escena>
  );
};

/* 2 · Para la física, no. (golpe) */
const Golpe: React.FC = () => {
  const frame = useCurrentFrame();
  const no = r.w(1, "no") - E.golpe;
  const giro = interpolate(frame, [no, no + 16], [0, 180], clamp);
  return (
    <Escena empuje={0.03}>
      <Etiqueta texto="la verdad" color={C.verde} />
      <Titulo pregunta="¿una sola vuelta?" desdeP={0} respuesta="no." desdeR={no} top={400} tamR={180} />
      <Lienzo>
        <Fuego cx={540} y={1380} t={frame} n={6} />
        <Grilla y={1320} />
        <g style={{ scale: golpe(frame, no, 1.08, 14), transformOrigin: "540px 1180px" }} transform={`rotate(${giro} 540 1180)`}>
          <Bife cx={540} cy={1180} s={0.9} t={frame} cara={frame >= no ? "canchera" : "sorprendida"} coccion={0.55} />
        </g>
      </Lienzo>
      {frame >= no ? <Sello texto="FÍSICA" desde={no} x={120} y={860} rot={-10} color={C.azul} tam={60} /> : null}
      <Globo texto="¡dame vuelta!" desde={no + 8} x={640} y={900} cola="der" tam={42} ancho={300} />
    </Escena>
  );
};

/* 3 · Si la das vuelta seguido, cada lado se calienta y descansa. */
const Mecanismo: React.FC = () => {
  const frame = useCurrentFrame();
  const lado = Math.floor(frame / 20) % 2; // va alternando el lado al fuego
  const giro = lado * 180;
  return (
    <Escena>
      <Etiqueta texto="por qué" />
      <Lienzo>
        <Fuego cx={540} y={1380} t={frame} n={6} />
        <Grilla y={1320} />
        {/* ondas de calor hacia el bife */}
        <g opacity={0.8} stroke={C.rojo} strokeWidth={9} fill="none" strokeLinecap="round">
          {[-120, 0, 120].map((dx, i) => (
            <path key={i} d={`M${540 + dx} ${1300} q14 -26 0 -52 q-14 -26 0 -52`} opacity={0.4 + Math.sin(frame / 4 + i) * 0.3} />
          ))}
        </g>
        <g transform={`rotate(${giro} 540 1160)`}>
          <Bife cx={540} cy={1160} s={0.9} t={frame} cara="feliz" coccion={0.55} />
        </g>
      </Lienzo>
      <Sello texto={lado ? "descansa" : "se calienta"} desde={0} x={330} y={760} rot={-4} color={lado ? C.verde : C.rojo} tinta={lado ? C.tinta : C.blanco} tam={56} />
      <Globo texto="me doy vuelta solo" desde={10} x={110} y={980} cola="izq" tam={38} ancho={380} />
    </Escena>
  );
};

/* 4 · Así se cocina más parejo y más rápido. */
const Resultado: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const parejo = r.w(3, "parejo") - E.resultado;
  const rapido = r.w(3, "rápido") - E.resultado;
  return (
    <Escena>
      <Etiqueta texto="resultado" color={C.verde} />
      <Lienzo>
        <Fuego cx={540} y={1380} t={frame} n={6} />
        <Grilla y={1320} />
        <g style={{ scale: pop(frame, fps, 2), transformOrigin: "540px 1180px" }}>
          <Bife cx={540} cy={1160} s={1} t={frame} cara="canchera" coccion={0.62} />
        </g>
      </Lienzo>
      {frame >= parejo ? <Sello texto="PAREJO ✓" desde={parejo} x={180} y={780} rot={-6} color={C.verde} tinta={C.tinta} tam={58} /> : null}
      {frame >= rapido ? <Sello texto="+ RÁPIDO" desde={rapido} x={620} y={760} rot={6} color={C.amarillo} tinta={C.tinta} tam={58} /> : null}
      <Globo texto="quedé 10 puntos" desde={8} x={620} y={980} cola="der" tam={40} ancho={320} />
    </Escena>
  );
};

/* 5 · Lo calculó McGee y lo probó America's Test Kitchen: cada minuto. */
const Ciencia: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const minuto = r.w(4, "minuto") - E.ciencia;
  const atenua = interpolate(frame, [minuto, minuto + 3], [1, 0.25], clamp);
  return (
    <Escena>
      <Etiqueta texto="la ciencia" />
      <Sello texto="McGEE" desde={6} x={130} y={520} rot={-5} color={C.azul} tam={56} />
      <Lienzo opacidad={atenua}>
        <g style={{ scale: pop(frame, fps, 8), transformOrigin: "420px 1200px" }}>
          <Libro x={250} y={820} titulo="COCINA" fuente={display} t={frame} />
        </g>
        <g style={{ scale: pop(frame, fps, 14), transformOrigin: "780px 1060px" }}>
          <Reloj cx={780} cy={1060} r={120} vueltas={frame / 20} color={C.blanco} />
        </g>
      </Lienzo>
      {frame >= minuto ? <Palabrota texto="cada minuto" desde={minuto} hasta={r.fin(4) - E.ciencia + 16} top={760} color={C.rojo} tam={130} /> : null}
      <Globo texto="probado, no opinado" desde={10} x={560} y={700} cola="izq" tam={38} ancho={400} />
      <Fuente texto="Harold McGee · America's Test Kitchen" />
    </Escena>
  );
};

/* 6 · El jugo lo hace perder pasarse de cocción, no darla vuelta. */
const Jugo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cocc = r.w(5, "cocción") - E.jugo;
  return (
    <Escena>
      <Etiqueta texto="¿y el jugo?" color={C.rojo} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 4), transformOrigin: "360px 1500px" }}>
          <Termometro x={300} y={720} temp={frame >= cocc ? 92 : 50} />
        </g>
        <g style={{ scale: pop(frame, fps, 8), transformOrigin: "760px 1180px" }}>
          <Bife cx={760} cy={1120} s={0.78} t={frame} cara={frame >= cocc ? "preocupada" : "feliz"} coccion={frame >= cocc ? 0.95 : 0.6} />
          {frame >= cocc ? <Sudor x={880} y={1040} t={frame} s={1.2} /> : null}
        </g>
      </Lienzo>
      {frame >= cocc ? <Sello texto="PASARSE DE COCCIÓN" desde={cocc} x={430} y={620} rot={-4} color={C.rojo} tam={46} /> : null}
      <Globo texto="no es por tocarla" desde={10} x={600} y={820} cola="der" tam={40} ancho={360} />
      <Fuente texto="ThermoWorks · Food Science (2018): pérdida de jugo según cocción" />
    </Escena>
  );
};

/* 7 · Ojo: esto es para bifes y churrascos a fuego fuerte. */
const Ojo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fuerte = r.w(6, "fuerte") - E.ojo;
  return (
    <Escena>
      <Sello texto="OJO" desde={0} x={450} y={360} rot={-8} color={C.amarillo} tinta={C.tinta} tam={90} />
      <Lienzo>
        <Fuego cx={540} y={1400} t={frame} n={9} s={1.3} />
        <Grilla y={1330} />
        <g style={{ scale: pop(frame, fps, 4), transformOrigin: "540px 1190px" }}>
          <Bife cx={540} cy={1180} s={0.72} t={frame} cara="feliz" coccion={0.6} />
        </g>
      </Lienzo>
      {frame >= fuerte ? <Sello texto="FUEGO FUERTE" desde={fuerte} x={300} y={820} rot={-4} color={C.rojo} tam={52} /> : null}
      <Globo texto="bifes finitos" desde={10} x={660} y={900} cola="der" tam={40} ancho={300} />
    </Escena>
  );
};

/* 8 · En el asado lento, con cortes gruesos, manda el fuego. */
const Lento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fuego = r.w(7, "fuego") - E.lento;
  return (
    <Escena>
      <Etiqueta texto="en el asado lento" />
      <Lienzo>
        <Fuego cx={540} y={1420} t={frame} n={5} s={0.8} />
        <Parrilla x={300} y={1240} t={frame} />
        <g style={{ scale: pop(frame, fps, 6), transformOrigin: "540px 1120px" }}>
          <Bife cx={540} cy={1040} s={1.05} t={frame} cara="dormida" coccion={0.72} costra={false} />
        </g>
      </Lienzo>
      {frame >= fuego ? <Sello texto="MANDA EL FUEGO" desde={fuego} x={280} y={760} rot={-4} color={C.rojo} tam={50} /> : null}
      <Globo texto="el asador sabe 🔥" desde={10} x={110} y={900} cola="izq" tam={38} ancho={380} />
      <Fuente texto="America's Test Kitchen · Serious Eats" />
    </Escena>
  );
};

/* 9 · Si te retan por tocar el bife, tenés la ciencia de tu lado. */
const Retan: React.FC = () => {
  const frame = useCurrentFrame();
  const ciencia = r.w(8, "ciencia") - E.retan;
  return (
    <Escena>
      <Etiqueta texto="si te retan…" color={C.rojo} />
      <Lienzo>
        <Fuego cx={540} y={1380} t={frame} n={6} />
        <Grilla y={1320} />
        <Bife cx={520} cy={1160} s={0.9} t={frame} cara="canchera" coccion={0.58} />
        <g transform="rotate(-18 300 950)">
          <Tenedor x={300} y={760} s={0.95} rot={0} />
        </g>
      </Lienzo>
      {frame >= ciencia ? <Sello texto="CIENCIA ✓" desde={ciencia} x={560} y={780} rot={6} color={C.verde} tinta={C.tinta} tam={58} /> : null}
      <Globo texto="¡no toques nada!" desde={6} x={560} y={620} cola="izq" tam={40} ancho={360} />
    </Escena>
  );
};

/* 10 · Mandáselo al asador que no te deja ni acercarte. */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const asador = r.w(9, "asador") - E.cta;
  return (
    <Escena>
      <Titulo pregunta="mandáselo al asador que…" desdeP={0} top={360} tamR={120} />
      <Lienzo>
        <Fuego cx={540} y={1380} t={frame} n={7} />
        <Grilla y={1320} />
        <Bife cx={540} cy={1160} s={0.95} t={frame} cara="feliz" coccion={0.6} />
        <Tenedor x={880} y={860} s={0.95} rot={28} />
      </Lienzo>
      <Globo texto="¡no te acerques a la parrilla!" desde={Math.max(0, asador)} x={120} y={880} cola="izq" tam={38} ancho={440} />
    </Escena>
  );
};

export const VueltaCarne003: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [E.gancho + 14, "burbuja", 0.35],
    [r.w(1, "no") - 2, "scratch", 0.55], [r.w(1, "no"), "boing", 0.5], [r.w(1, "no") + 2, "sello", 0.55], [r.w(1, "no") + 8, "burbuja", 0.35],
    [E.mecanismo - 3, "latigo", 0.5], [E.mecanismo + 4, "sello", 0.5], [E.mecanismo + 20, "whoosh", 0.3], [E.mecanismo + 40, "whoosh", 0.3],
    [E.resultado - 3, "latigo", 0.5], [E.resultado, "pop"], [r.w(3, "parejo"), "ding", 0.45], [r.w(3, "rápido"), "sello", 0.5],
    [E.ciencia - 3, "latigo", 0.5], [E.ciencia + 6, "sello", 0.5], [E.ciencia + 8, "pop"], [r.w(4, "minuto"), "ding", 0.5], [E.ciencia + 10, "burbuja", 0.35],
    [E.jugo - 3, "latigo", 0.5], [E.jugo, "pop"], [r.w(5, "cocción"), "error", 0.4], [r.w(5, "cocción") + 2, "sello", 0.5],
    [E.ojo - 3, "latigo", 0.5], [E.ojo, "sello", 0.6], [E.ojo + 4, "pop"], [r.w(6, "fuerte"), "sello", 0.5],
    [E.lento - 3, "latigo", 0.5], [E.lento, "pop"], [r.w(7, "fuego"), "sello", 0.5], [E.lento + 10, "burbuja", 0.35],
    [E.retan - 3, "latigo", 0.5], [E.retan, "burbuja", 0.4], [r.w(8, "ciencia"), "sello", 0.55],
    [E.cta - 3, "latigo", 0.5], [E.cta, "pop"], [r.w(9, "asador"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo">
        <Logo />
      </Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.golpe - E.gancho}><Gancho /></Sequence>
      <Sequence name="2 · golpe" from={E.golpe} durationInFrames={E.mecanismo - E.golpe}><Golpe /></Sequence>
      <Sequence name="3 · mecanismo" from={E.mecanismo} durationInFrames={E.resultado - E.mecanismo}><Mecanismo /></Sequence>
      <Sequence name="4 · resultado" from={E.resultado} durationInFrames={E.ciencia - E.resultado}><Resultado /></Sequence>
      <Sequence name="5 · ciencia" from={E.ciencia} durationInFrames={E.jugo - E.ciencia}><Ciencia /></Sequence>
      <Sequence name="6 · jugo" from={E.jugo} durationInFrames={E.ojo - E.jugo}><Jugo /></Sequence>
      <Sequence name="7 · ojo" from={E.ojo} durationInFrames={E.lento - E.ojo}><Ojo /></Sequence>
      <Sequence name="8 · lento" from={E.lento} durationInFrames={E.retan - E.lento}><Lento /></Sequence>
      <Sequence name="9 · retan" from={E.retan} durationInFrames={E.cta - E.retan}><Retan /></Sequence>
      <Sequence name="10 · cta" from={E.cta} durationInFrames={DURACION - E.cta}><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("003-vuelta-carne/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada003: React.FC = () => (
  <Portada arriba="¿a la carne se la da vuelta una sola vez?" grande="es al revés" sello="MITO" numero={3}>
    <Lienzo>
      <Fuego cx={540} y={1480} t={10} n={6} />
      <Grilla y={1420} />
      <Bife cx={540} cy={1250} s={1.05} t={8} cara="canchera" coccion={0.6} />
      <Tenedor x={870} y={980} s={0.95} rot={24} />
    </Lienzo>
  </Portada>
);

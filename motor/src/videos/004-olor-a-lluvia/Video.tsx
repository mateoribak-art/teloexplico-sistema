import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/004-olor-a-lluvia/tiempos.json";
import { C, display } from "../../kit/marca";
import { clamp, pop } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Escena, Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Palabrota, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Bacteria, Gota, Libro, Nariz, Nube, Suelo, Vapor } from "../../kit/dibujos";

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  bacterias: r.f(1),
  petricor: r.f(2),
  geosmina: r.f(3),
  gota: r.f(4),
  nariz: r.f(5),
  antepasados: r.f(6),
  ojo: r.f(7),
  remate: r.f(8),
  cta: r.f(9),
  sello: r.fin(9) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

/* 1 · ¿Sentiste ese olor a tierra mojada cada vez que llueve? */
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Escena entrada={false}>
      <Etiqueta texto="lo vivís esta semana" desde={-8} />
      <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={430} tam={58} />
      <Lienzo>
        <Suelo y={1320} />
        <Nube cx={360} cy={900} s={1} t={frame} cara="feliz" lluvia />
        <Vapor x={760} y={1320} t={frame} n={3} sep={70} alto={160} opacidad={0.8} />
      </Lienzo>
      <Globo texto="¿a qué huele?" desde={16} x={610} y={1070} cola="izq" tam={44} ancho={360} />
    </Escena>
  );
};

/* 2 · No es olor a lluvia. Son bacterias. (el golpe) */
const Bacterias: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bact = r.w(1, "bacterias") - E.bacterias;
  return (
    <Escena empuje={0.03}>
      <Etiqueta texto="la verdad" color={C.verde} />
      <Titulo pregunta="no es olor a lluvia…" desdeP={0} respuesta="¡son bacterias!" desdeR={bact} top={400} tamR={104} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 2), transformOrigin: "540px 1200px" }}>
          <Bacteria cx={360} cy={1150} s={1.1} t={frame} fiesta={frame >= bact + 6} />
          <Bacteria cx={700} cy={1210} s={0.9} t={frame + 20} fiesta={frame >= bact + 10} />
          <Bacteria cx={540} cy={1380} s={0.8} t={frame + 40} fiesta={frame >= bact + 14} />
        </g>
      </Lienzo>
      {frame >= bact ? <Sello texto="¿QUÉ?" desde={bact} x={120} y={840} rot={-10} color={C.amarillo} tinta={C.tinta} tam={72} /> : null}
      <Globo texto="¡hola! 👋" desde={bact + 8} x={720} y={980} cola="der" tam={42} ancho={260} />
    </Escena>
  );
};

/* 3 · Ese olor tiene nombre: petricor. Lo bautizaron en los años sesenta. */
const Petricor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anio = r.w(2, "sesenta") - E.petricor;
  const atenua = interpolate(frame, [anio, anio + 3], [1, 0.25], clamp);
  return (
    <Escena>
      <Etiqueta texto="tiene nombre" />
      <Sello texto="PETRICOR" desde={6} x={300} y={470} rot={-4} color={C.azul} tam={70} />
      <Lienzo opacidad={atenua}>
        <g style={{ scale: pop(frame, fps, 10), transformOrigin: "540px 1200px" }}>
          <Libro x={380} y={820} titulo="NATURE" fuente={display} t={frame} />
        </g>
      </Lienzo>
      {frame >= anio ? <Palabrota texto="1964" desde={anio} hasta={r.fin(2) - E.petricor + 16} top={1040} color={C.rojo} tam={170} /> : null}
      <Globo texto="qué finoli, ¿no?" desde={16} x={110} y={760} cola="izq" tam={40} ancho={340} />
      <Fuente texto="Bear y Thomas, Nature (1964)" />
    </Escena>
  );
};

/* 4 · El que más pega es la geosmina, que fabrican bacterias de la tierra. */
const Geosmina: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const geo = r.w(3, "geosmina") - E.geosmina;
  const atenua = interpolate(frame, [geo, geo + 3], [1, 0.3], clamp);
  return (
    <Escena>
      <Etiqueta texto="la culpable" color={C.verde} />
      <Lienzo opacidad={atenua}>
        <Suelo y={1360} />
        <g style={{ scale: pop(frame, fps, 4), transformOrigin: "540px 1300px" }}>
          <Bacteria cx={540} cy={1200} s={1.3} t={frame} color={C.verde} />
        </g>
        <Vapor x={540} y={1120} t={frame} n={3} sep={80} alto={150} opacidad={0.9} />
      </Lienzo>
      {frame >= geo ? <Palabrota texto="geosmina" desde={geo} hasta={r.fin(3) - E.geosmina + 16} top={700} color={C.verde} tam={150} /> : null}
      <Globo texto="la hago yo 😎" desde={10} x={640} y={940} cola="izq" tam={40} ancho={320} />
      <Fuente texto="revisiones científicas sobre la geosmina (Streptomyces)" />
    </Escena>
  );
};

/* 5 · La gota choca, atrapa aire que estalla y manda el aroma para arriba. */
const GotaMec: React.FC = () => {
  const frame = useCurrentFrame();
  const sueloY = 1280;
  const choca = r.w(4, "choca") - E.gota;
  const estalla = r.w(4, "estalla") - E.gota;
  const caeY = interpolate(frame, [choca - 20, choca], [600, sueloY - 40], clamp);
  const burst = interpolate(frame, [estalla, estalla + 14], [0, 1], clamp);
  return (
    <Escena>
      <Etiqueta texto="cómo llega a tu nariz" />
      <Lienzo>
        <Suelo y={sueloY} />
        {frame < estalla ? <Gota cx={540} cy={caeY} s={1.6} color="#7CC3FF" /> : null}
        {frame >= estalla ? (
          <g>
            <circle cx={540} cy={sueloY - 20} r={10 + burst * 120} fill="none" stroke={C.azul} strokeWidth={10} opacity={1 - burst} />
            {[-1, -0.5, 0, 0.5, 1].map((d, i) => (
              <Gota key={i} cx={540 + d * 160 * burst} cy={sueloY - 40 - burst * (220 - Math.abs(d) * 110)} s={0.55} color="#7CC3FF" />
            ))}
          </g>
        ) : null}
        <Vapor x={540} y={sueloY - 10} t={frame} n={3} sep={80} alto={180} opacidad={interpolate(frame, [estalla, estalla + 8], [0, 0.9], clamp)} />
      </Lienzo>
      {frame >= estalla ? <Sello texto="¡POP!" desde={estalla} x={660} y={820} rot={8} color={C.amarillo} tinta={C.tinta} tam={72} /> : null}
      <Globo texto="atrapa aire y lo larga" desde={6} x={110} y={720} cola="izq" tam={38} ancho={420} />
      <Fuente texto="MIT · Nature Communications (2015)" />
    </Escena>
  );
};

/* 6 · Tu nariz la detecta en cantidades mínimas. */
const NarizSc: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const minimas = r.w(5, "mínimas") - E.nariz;
  return (
    <Escena>
      <Etiqueta texto="tu nariz" />
      <Sello texto="RE SENSIBLE" desde={6} x={600} y={620} rot={6} color={C.verde} tinta={C.tinta} tam={54} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 4), transformOrigin: "640px 1120px" }}>
          <Nariz cx={640} cy={1120} s={1.5} t={frame} cara="canchera" />
        </g>
        <Vapor x={300} y={1240} t={frame} n={3} sep={70} alto={220} opacidad={0.9} />
      </Lienzo>
      {frame >= minimas ? <Sello texto="PARTES POR BILLÓN" desde={minimas} x={150} y={760} rot={-5} color={C.rojo} tam={50} /> : null}
      <Globo texto="¡te huelo!" desde={minimas + 6} x={720} y={900} cola="der" tam={42} ancho={280} />
      <Fuente texto="estudios de umbral olfativo de la geosmina" />
    </Escena>
  );
};

/* 7 · Se cree que nuestros antepasados seguían el olor para encontrar agua. */
const Antepasados: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const agua = r.w(6, "agua") - E.antepasados;
  return (
    <Escena>
      <Etiqueta texto="¿por qué tan sensibles?" />
      <Sello texto="SE CREE…" desde={4} x={120} y={520} rot={-6} color={C.amarillo} tinta={C.tinta} tam={56} />
      <Lienzo>
        <ellipse cx={300} cy={1260} rx={170} ry={46} fill="#7CC3FF" stroke={C.tinta} strokeWidth={9} />
        <g style={{ scale: pop(frame, fps, 6), transformOrigin: "760px 1180px" }}>
          <Nariz cx={760} cy={1160} s={1.15} t={frame} cara="feliz" />
        </g>
        <Vapor x={500} y={1260} t={frame} n={3} sep={70} alto={160} opacidad={0.85} />
      </Lienzo>
      {frame >= agua ? <Sello texto="= AGUA 💧" desde={agua} x={160} y={1030} rot={-4} color={C.azul} tam={52} /> : null}
      <Globo texto="por acá hay agua" desde={10} x={610} y={760} cola="der" tam={40} ancho={360} />
    </Escena>
  );
};

/* 8 · Ojo: el olor pega más con la llovizna que con el diluvio. */
const OjoSc: React.FC = () => {
  const frame = useCurrentFrame();
  const llov = r.w(7, "llovizna") - E.ojo;
  const dil = r.w(7, "diluvio") - E.ojo;
  return (
    <Escena>
      <Sello texto="OJO" desde={0} x={450} y={360} rot={-8} color={C.amarillo} tinta={C.tinta} tam={90} />
      <Lienzo>
        <g opacity={frame >= llov ? 1 : 0.45}>
          <Nube cx={300} cy={820} s={0.78} t={frame} cara="feliz" lluvia />
          <Vapor x={300} y={1240} t={frame} n={3} sep={56} alto={200} opacidad={0.95} />
        </g>
        <g opacity={frame >= dil ? 1 : 0.45}>
          <Nube cx={790} cy={820} s={0.78} t={frame + 30} cara="preocupada" lluvia intensa />
          <Vapor x={790} y={1240} t={frame} n={2} sep={40} alto={70} opacidad={0.5} />
        </g>
      </Lienzo>
      {frame >= llov ? <Sello texto="+ OLOR" desde={llov + 4} x={200} y={560} rot={-6} color={C.verde} tinta={C.tinta} tam={48} /> : null}
      {frame >= llov ? <Sello texto="llovizna" desde={llov} x={190} y={1300} rot={-3} color={C.verde} tinta={C.tinta} tam={46} /> : null}
      {frame >= dil ? <Sello texto="– OLOR" desde={dil + 4} x={700} y={560} rot={6} color={C.rojo} tam={48} /> : null}
      {frame >= dil ? <Sello texto="diluvio" desde={dil} x={700} y={1300} rot={3} color={C.rojo} tam={46} /> : null}
      <Fuente texto="MIT (2015): más aroma con lluvia suave" />
    </Escena>
  );
};

/* 9 · "Qué lindo olor a lluvia" = bacterias. */
const Remate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bact = r.w(8, "bacterias") - E.remate;
  return (
    <Escena>
      <Etiqueta texto="en criollo" />
      <Titulo pregunta={"“qué lindo olor a lluvia”"} desdeP={0} respuesta="= bacterias" desdeR={bact} top={420} tamR={116} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 6), transformOrigin: "420px 1200px" }}>
          <Nariz cx={420} cy={1180} s={1.2} t={frame} cara="feliz" />
        </g>
        <Vapor x={230} y={1280} t={frame} n={2} sep={60} alto={150} opacidad={0.8} />
        <g style={{ scale: pop(frame, fps, bact), transformOrigin: "760px 1200px" }}>
          <Bacteria cx={760} cy={1180} s={1} t={frame} fiesta />
        </g>
      </Lienzo>
      <Globo texto="de nada 💅" desde={bact + 6} x={700} y={940} cola="der" tam={42} ancho={260} />
    </Escena>
  );
};

/* 10 · Mandáselo a ese que respira hondo y dice: ah, olor a lluvia. */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const balcon = r.w(9, "balcón") - E.cta;
  return (
    <Escena>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={360} />
      <Lienzo>
        <Nube cx={360} cy={760} s={0.8} t={frame} cara="feliz" lluvia />
        <g style={{ scale: pop(frame, fps, 8), transformOrigin: "660px 1180px" }}>
          <Nariz cx={660} cy={1150} s={1.2} t={frame} cara="canchera" />
        </g>
        <Vapor x={360} y={1260} t={frame} n={3} sep={70} alto={200} opacidad={0.85} />
        <g>
          <rect x={60} y={1420} width={960} height={26} rx={12} fill={C.azul} stroke={C.tinta} strokeWidth={7} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={110 + i * 120} y={1446} width={16} height={150} fill={C.azul} stroke={C.tinta} strokeWidth={6} />
          ))}
        </g>
      </Lienzo>
      <Globo texto="ah… olor a lluvia" desde={balcon} x={640} y={900} cola="der" tam={42} ancho={330} />
    </Escena>
  );
};

export const OlorALluvia004: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [E.gancho + 16, "burbuja", 0.35],
    [r.w(1, "bacterias") - 2, "scratch", 0.55], [r.w(1, "bacterias"), "boing", 0.5], [r.w(1, "bacterias") + 2, "sello", 0.55], [r.w(1, "bacterias") + 8, "burbuja", 0.35],
    [E.petricor - 3, "latigo", 0.5], [E.petricor + 6, "sello", 0.5], [r.w(2, "sesenta"), "sello", 0.55], [E.petricor + 16, "burbuja", 0.35],
    [E.geosmina - 3, "latigo", 0.5], [E.geosmina, "pop"], [r.w(3, "geosmina"), "ding", 0.45], [E.geosmina + 10, "burbuja", 0.35],
    [E.gota - 3, "latigo", 0.5], [E.gota + 6, "burbuja", 0.35], [r.w(4, "estalla"), "boing", 0.5], [r.w(4, "estalla") + 2, "sello", 0.5],
    [E.nariz - 3, "latigo", 0.5], [E.nariz, "pop"], [E.nariz + 6, "sello", 0.5], [r.w(5, "mínimas"), "ding", 0.45], [r.w(5, "mínimas") + 6, "burbuja", 0.35],
    [E.antepasados - 3, "latigo", 0.5], [E.antepasados + 4, "sello", 0.5], [r.w(6, "agua"), "ding", 0.4], [E.antepasados + 10, "burbuja", 0.35],
    [E.ojo - 3, "latigo", 0.5], [E.ojo, "sello", 0.6], [r.w(7, "llovizna"), "pop"], [r.w(7, "llovizna") + 4, "sello", 0.45], [r.w(7, "diluvio"), "pop"], [r.w(7, "diluvio") + 4, "sello", 0.45],
    [E.remate - 3, "latigo", 0.5], [E.remate, "pop"], [r.w(8, "bacterias"), "scratch", 0.5], [r.w(8, "bacterias") + 2, "sello", 0.5], [r.w(8, "bacterias") + 8, "burbuja", 0.35],
    [E.cta - 3, "latigo", 0.5], [E.cta, "pop"], [r.w(9, "balcón"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo">
        <Logo />
      </Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.bacterias - E.gancho}><Gancho /></Sequence>
      <Sequence name="2 · bacterias" from={E.bacterias} durationInFrames={E.petricor - E.bacterias}><Bacterias /></Sequence>
      <Sequence name="3 · petricor" from={E.petricor} durationInFrames={E.geosmina - E.petricor}><Petricor /></Sequence>
      <Sequence name="4 · geosmina" from={E.geosmina} durationInFrames={E.gota - E.geosmina}><Geosmina /></Sequence>
      <Sequence name="5 · gota" from={E.gota} durationInFrames={E.nariz - E.gota}><GotaMec /></Sequence>
      <Sequence name="6 · nariz" from={E.nariz} durationInFrames={E.antepasados - E.nariz}><NarizSc /></Sequence>
      <Sequence name="7 · antepasados" from={E.antepasados} durationInFrames={E.ojo - E.antepasados}><Antepasados /></Sequence>
      <Sequence name="8 · ojo" from={E.ojo} durationInFrames={E.remate - E.ojo}><OjoSc /></Sequence>
      <Sequence name="9 · remate" from={E.remate} durationInFrames={E.cta - E.remate}><Remate /></Sequence>
      <Sequence name="10 · cta" from={E.cta} durationInFrames={DURACION - E.cta}><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("004-olor-a-lluvia/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada004: React.FC = () => (
  <Portada arriba="¿por qué la tierra huele así cuando llueve?" grande="bacterias" sello="CIENCIA" colorSello={C.verde} numero={4}>
    <Lienzo>
      <Suelo y={1380} />
      <Nube cx={330} cy={1120} s={0.82} t={20} cara="feliz" lluvia />
      <Nariz cx={760} cy={1210} s={1.1} t={10} cara="canchera" />
      <Vapor x={560} y={1340} t={14} n={3} sep={70} alto={160} opacidad={0.85} />
    </Lienzo>
  </Portada>
);

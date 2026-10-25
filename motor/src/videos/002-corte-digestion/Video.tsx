import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/002-corte-digestion/tiempos.json";
import { C, display } from "../../kit/marca";
import { clamp, golpe, pop, suave, temblor } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Escena, Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Palabrota, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Botella, Flotador, Gota, Libro, Panza, Parrilla, Pileta, Pregunta, Reloj, Reposera } from "../../kit/dibujos";

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  noExiste: r.f(2),
  sangre: r.f(3),
  evidencia: r.f(5),
  origen: r.f(6),
  ojo: r.f(7),
  alcohol: r.f(9),
  cta: r.f(10),
  sello: r.fin(10) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

/* 1 · ¿Esperás dos horas…? Te comiste un verso. */
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const verso = r.w(1, "verso") - E.gancho;
  const enVerso = frame >= verso;
  return (
    <Escena entrada={false}>
      <Etiqueta texto="el mito" desde={-8} />
      <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} />
      <AbsoluteFill style={{ scale: interpolate(frame, [0, 8], [1.12, 1], clamp), transformOrigin: "540px 1150px", translate: `${temblor(frame, verso, 14, 12)}px 0px` }}>
        <Lienzo>
          <Pileta x={360} y={1080} ancho={640} alto={240} t={frame} />
          <Reposera x={60} y={1230} />
          <Flotador cx={250} cy={1080} r={105} cara={enVerso ? "sorprendida" : "preocupada"} t={frame} />
          <g style={{ scale: pop(frame, fps, 6), transformOrigin: "850px 760px" }}>
            <Reloj cx={850} cy={760} r={110} vueltas={interpolate(frame, [6, verso], [0, 2], clamp)} color={C.amarillo} />
          </g>
        </Lienzo>
        <Globo texto="¿ya puedo?" desde={14} x={70} y={790} tam={40} ancho={300} />
      </AbsoluteFill>
      {enVerso ? <Sello texto="¡VERSO!" desde={verso} x={560} y={640} rot={-8} tam={84} /> : null}
    </Escena>
  );
};

/* 2 · El corte de digestión, así como te lo contaron, no existe. */
const NoExiste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const no = r.w(2, "no") - E.noExiste;
  return (
    <Escena empuje={0.03}>
      <AbsoluteFill style={{ scale: golpe(frame, no, 1.08, 14) }}>
        <Etiqueta texto="la verdad" color={C.verde} />
        <Titulo pregunta="el corte de digestión…" desdeP={0} respuesta="no existe." desdeR={no} top={400} tamR={175} />
        <Lienzo>
          <g style={{ scale: pop(frame, fps, 4), transformOrigin: "540px 1330px" }}>
            <Panza cx={540} cy={1140} s={1.05} cara={frame >= no ? "canchera" : "sorprendida"} t={frame} />
          </g>
        </Lienzo>
        {frame >= no ? <Sello texto="MITO" desde={no + 4} x={90} y={820} rot={-10} /> : null}
        <Globo texto="¡yo no corto nada!" desde={no + 8} x={560} y={780} cola="izq" tam={40} ancho={400} />
      </AbsoluteFill>
    </Escena>
  );
};

/* 3 · La teoría de la sangre que se va a la panza… y lo poquito que se desvía en realidad. */
const ESQUINAS = [
  { x: 170, y: 760, etiqueta: "brazo" }, { x: 910, y: 760, etiqueta: "brazo" },
  { x: 170, y: 1340, etiqueta: "pierna" }, { x: 910, y: 1340, etiqueta: "pierna" },
];
const Sangre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.sangre;
  const va = L(r.w(3, "sangre"));
  const llega = L(r.w(3, "panza"));
  const poquito = L(r.w(4, "poquito"));
  const funcionan = L(r.w(4, "funcionando"));
  // 12 gotitas: van a la panza; con "poquito" vuelven casi todas a su lugar
  const gotas = Array.from({ length: 12 }).map((_, i) => {
    const e = ESQUINAS[i % 4];
    const quedan = i < 2;
    const ida = interpolate(frame, [va + i, llega + i], [0, 1], clamp);
    const vuelta = quedan ? 0 : interpolate(frame, [poquito + i, poquito + 12 + i], [0, 1], clamp);
    const p = ida * (1 - vuelta);
    const jx = quedan ? 150 + i * 40 : ((i * 37) % 60) - 30, jy = quedan ? 70 : ((i * 53) % 60) - 30;
    return { x: e.x + (540 + jx - e.x) * p, y: e.y + (1060 + jy - e.y) * p, o: quedan ? 1 : 1 - vuelta };
  });
  return (
    <Escena>
      <Etiqueta texto="la teoría" />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1230px" }}>
          <Panza cx={540} cy={1060} s={0.9} cara={frame >= poquito ? "canchera" : "sorprendida"} t={frame} />
        </g>
        {ESQUINAS.map((e, i) => (
          <g key={i} style={{ scale: pop(frame, fps, 4 + i * 2), transformOrigin: `${e.x}px ${e.y}px` }}>
            <circle cx={e.x + 8} cy={e.y + 8} r={62} fill={C.tinta} />
            <circle cx={e.x} cy={e.y} r={62} fill={frame >= funcionan ? C.verde : C.blanco} stroke={C.tinta} strokeWidth={8} />
            <text x={e.x} y={e.y + 14} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={34} fill={C.tinta}>{e.etiqueta}</text>
          </g>
        ))}
        {gotas.map((g, i) => (frame >= va + i && g.o > 0.05 ? <g key={i} opacity={g.o}><Gota cx={g.x} cy={g.y} s={0.8} /></g> : null))}
      </Lienzo>
      {frame >= poquito ? <Sello texto="POQUITO" desde={poquito} x={360} y={560} rot={-6} color={C.amarillo} tinta={C.tinta} tam={70} /> : null}
      {frame >= funcionan ? <Sello texto="FUNCIONAN ✓" desde={funcionan} x={330} y={1300} rot={4} color={C.verde} tinta={C.tinta} tam={52} /> : null}
      <Fuente texto="UCLA (vía Washington Post / Infobae) · Chequeado" />
    </Escena>
  );
};

/* 4 · La Cruz Roja revisó décadas de estudios: ni un ahogado por nadar después de comer. */
const Evidencia: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.evidencia;
  const cero = L(r.w(5, "ni"));
  const fin = L(r.fin(5)) + 8;
  const atenua = interpolate(frame, [cero, cero + 3], [1, 0.2], clamp);
  return (
    <Escena>
      <Etiqueta texto="la evidencia" />
      <Sello texto="CRUZ ROJA (EE.UU.)" desde={2} x={250} y={430} rot={-3} color={C.azul} tam={52} />
      <Lienzo opacidad={atenua}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} style={{ scale: pop(frame, fps, 6 + i * 4), transformOrigin: "540px 1100px" }}
            transform={`rotate(${(i - 2) * 5} 540 1100)`}>
            <rect x={340 + 12} y={760 + i * 40 + 12} width={400} height={500} rx={12} fill={C.tinta} />
            <rect x={340} y={760 + i * 40} width={400} height={500} rx={12} fill={C.blanco} stroke={C.tinta} strokeWidth={7} />
            {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={380} y1={840 + i * 40 + k * 60} x2={700 - (k % 2) * 80} y2={840 + i * 40 + k * 60} stroke="#BBB" strokeWidth={10} strokeLinecap="round" />)}
          </g>
        ))}
      </Lienzo>
      <Palabrota texto="0 ahogados" desde={cero} hasta={fin} top={860} color={C.verde} tam={170} />
      <Fuente texto="Cruz Roja Americana, Consejo Científico (2011)" />
    </Escena>
  );
};

/* 5 · ¿De dónde salió? Un manual de los Boy Scouts de 1908. */
const Origen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.origen;
  const libro = L(r.w(6, "Ya"));
  const anio = L(r.w(6, "mil"));
  return (
    <Escena>
      <Etiqueta texto="de dónde salió" />
      <Lienzo>
        {frame < libro ? (
          <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1000px" }} transform={`rotate(${Math.sin(frame / 5) * 8} 540 1000)`}>
            <Pregunta cx={540} cy={1260} fuente={display} />
          </g>
        ) : (
          <g style={{ scale: pop(frame, fps, libro), transformOrigin: "540px 1200px" }}>
            <Libro x={380} y={760} titulo="SCOUTS" fuente={display} t={frame} />
          </g>
        )}
      </Lienzo>
      {frame >= anio ? <Palabrota texto="1908" desde={anio} hasta={L(r.fin(6)) + 20} top={1230} color={C.rojo} tam={170} /> : null}
      <Fuente texto="Scouting for Boys (1908) · Mental Floss · WBUR" />
    </Escena>
  );
};

/* 6 · Ojo: después de un asado tremendo, una puntada. Incómodo, no peligroso. */
const Ojo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.ojo;
  const puntada = L(r.w(7, "puntada"));
  const incomodo = L(r.f(8));
  const nada = L(r.w(8, "Nadá"));
  return (
    <Escena>
      <Sello texto="OJO" desde={0} x={410} y={330} rot={-8} color={C.amarillo} tinta={C.tinta} tam={90} />
      <Lienzo>
        {frame < nada ? (
          <g>
            <g style={{ scale: pop(frame, fps, 6), transformOrigin: "540px 760px" }} opacity={interpolate(frame, [incomodo - 4, incomodo], [1, 0], clamp)}>
              <Parrilla x={310} y={700} t={frame} />
            </g>
            <g style={{ scale: pop(frame, fps, 14), transformOrigin: "540px 1360px" }} transform={`translate(${temblor(frame, puntada, 16, 10)} 0)`}>
              <Panza cx={540} cy={1190} s={0.85} cara={frame >= puntada ? "preocupada" : "feliz"} t={frame} llena />
            </g>
            {frame >= puntada ? (
              <path d="M700 1020 l40 50 l-30 10 l50 60" fill="none" stroke={C.amarillo} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
            ) : null}
          </g>
        ) : (
          <g>
            <Pileta x={140} y={1000} ancho={800} alto={300} t={frame} />
            <g style={{ scale: pop(frame, fps, nada), transformOrigin: "540px 1000px" }} transform={`translate(${Math.sin(frame / 8) * 40} ${Math.sin(frame / 6) * 8})`}>
              <Flotador cx={540} cy={1000} r={110} cara="canchera" t={frame} />
            </g>
          </g>
        )}
      </Lienzo>
      {frame >= incomodo && frame < nada ? <Sello texto="INCÓMODO" desde={incomodo} x={130} y={560} rot={-6} color={C.amarillo} tinta={C.tinta} tam={56} /> : null}
      {frame >= incomodo + 20 && frame < nada ? <Sello texto="NO PELIGROSO" desde={incomodo + 20} x={540} y={600} rot={6} color={C.verde} tinta={C.tinta} tam={56} /> : null}
      {frame >= nada ? <Globo texto="¡al agua!" desde={nada + 6} x={560} y={700} tam={44} ancho={320} /> : null}
      <Fuente texto="Estudio australiano (2005) · Mayo Clinic" />
    </Escena>
  );
};

/* 7 · Lo que sí es peligroso: el alcohol. */
const Alcohol: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.alcohol;
  const alcohol = L(r.w(9, "alcohol"));
  const parte = L(r.w(9, "buena"));
  const fin = L(r.fin(9)) + 10;
  const atenua = interpolate(frame, [parte, parte + 3], [1, 0.2], clamp);
  return (
    <Escena>
      <Etiqueta texto="lo que sí es peligroso" color={C.rojo} />
      <Lienzo opacidad={atenua}>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1290px" }}>
          <Botella x={440} y={810} cara={frame >= alcohol ? "canchera" : "feliz"} t={frame} />
        </g>
      </Lienzo>
      {frame >= alcohol ? <Sello texto="ESTO SÍ" desde={alcohol + 2} x={600} y={720} rot={8} tam={64} /> : null}
      <Palabrota texto="25–50 %" desde={parte} hasta={fin} top={860} color={C.rojo} tam={210} />
      <Fuente texto="CDC (EE.UU.): 25–50 % de los ahogamientos de adultos" />
    </Escena>
  );
};

/* 8 · Mandáselo a ese que te tenía dos horas en la reposera mirando el agua. */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const L = (g: number) => g - E.cta;
  const reposera = L(r.w(10, "reposera"));
  return (
    <Escena>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={360} />
      <Lienzo>
        <Pileta x={360} y={1080} ancho={640} alto={240} t={frame} />
        <Reposera x={60} y={1230} />
        <Flotador cx={250} cy={1080} r={105} cara="dormida" t={frame} />
        <Reloj cx={850} cy={760} r={110} vueltas={2 + frame / 20} color={C.amarillo} />
        <g fontFamily={display} fontWeight={800} fill={C.tinta} opacity={suave(frame, 10, 8)}>
          <text x={340} y={960} fontSize={60} transform={`translate(0 ${-((frame * 1.2) % 30)})`}>z</text>
          <text x={390} y={910} fontSize={80} transform={`translate(0 ${-((frame * 1.2 + 15) % 30)})`}>z</text>
        </g>
      </Lienzo>
      <Globo texto="¿ya pasaron las dos horas?" desde={reposera} x={480} y={500} cola="izq" tam={38} ancho={460} />
    </Escena>
  );
};

export const CorteDigestion002: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [E.gancho + 6, "pop", 0.35], [14, "burbuja", 0.35],
    [r.w(1, "verso"), "scratch", 0.55], [r.w(1, "verso") + 2, "sello", 0.6],
    [E.noExiste - 3, "latigo", 0.5], [r.w(2, "no"), "error", 0.35], [r.w(2, "no") + 4, "sello", 0.6], [r.w(2, "no") + 8, "burbuja", 0.4],
    [E.sangre - 3, "latigo", 0.5], [E.sangre, "boing", 0.4], [r.w(3, "sangre"), "whoosh", 0.35],
    [r.w(4, "poquito"), "sello", 0.55], [r.w(4, "poquito") + 4, "whoosh", 0.3], [r.w(4, "funcionando"), "ding", 0.4],
    [E.evidencia - 3, "latigo", 0.5], [E.evidencia + 2, "sello", 0.5], [E.evidencia + 6, "pop"], [E.evidencia + 10, "pop"],
    [r.w(5, "ni"), "boing", 0.45], [r.w(5, "ni") + 3, "ding", 0.4],
    [E.origen - 3, "latigo", 0.5], [E.origen, "pop"], [r.w(6, "Ya"), "boing", 0.4], [r.w(6, "mil"), "sello", 0.55],
    [E.ojo - 3, "latigo", 0.5], [E.ojo, "sello", 0.6], [E.ojo + 6, "pop"], [E.ojo + 14, "pop"],
    [r.w(7, "puntada"), "error", 0.35], [r.f(8), "sello", 0.5], [r.f(8) + 20, "sello", 0.5],
    [r.w(8, "Nadá"), "boing", 0.45], [r.w(8, "Nadá") + 6, "burbuja", 0.4],
    [E.alcohol - 3, "latigo", 0.5], [E.alcohol, "pop"], [r.w(9, "alcohol") + 2, "sello", 0.6],
    [r.w(9, "buena"), "boing", 0.4], [r.w(9, "buena") + 3, "ding", 0.35],
    [E.cta - 3, "latigo", 0.5], [E.cta, "pop"], [r.w(10, "reposera"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo">
        <Logo />
      </Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.noExiste - E.gancho}><Gancho /></Sequence>
      <Sequence name="2 · no existe" from={E.noExiste} durationInFrames={E.sangre - E.noExiste}><NoExiste /></Sequence>
      <Sequence name="3 · la sangre" from={E.sangre} durationInFrames={E.evidencia - E.sangre}><Sangre /></Sequence>
      <Sequence name="4 · evidencia" from={E.evidencia} durationInFrames={E.origen - E.evidencia}><Evidencia /></Sequence>
      <Sequence name="5 · origen" from={E.origen} durationInFrames={E.ojo - E.origen}><Origen /></Sequence>
      <Sequence name="6 · ojo" from={E.ojo} durationInFrames={E.alcohol - E.ojo}><Ojo /></Sequence>
      <Sequence name="7 · alcohol" from={E.alcohol} durationInFrames={E.cta - E.alcohol}><Alcohol /></Sequence>
      <Sequence name="8 · cta" from={E.cta} durationInFrames={DURACION - E.cta}><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("002-corte-digestion/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada002: React.FC = () => (
  <Portada arriba="¿esperás 2 horas para meterte a la pileta?" grande="no existe." sello="MITO" numero={2}>
    <Lienzo>
      <Pileta x={360} y={1120} ancho={640} alto={220} t={0} />
      <Reposera x={60} y={1260} />
      <Flotador cx={250} cy={1110} r={100} cara="preocupada" t={40} />
    </Lienzo>
  </Portada>
);

import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-003-fridge-leftovers/tiempos.json";
import { C, display } from "../../kit/marca";
import { clamp, golpe, pop, resorte, suave, temblor } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import {
  Escena, Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Palabrota, Sello, Sfx, Subtitulos, Titulo, type Efecto,
} from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Anafe, Bacteria, Heladera, HeladeraHielo, Luna, Olla, Pregunta, Rayitos, Reloj, Sol, Termometro, Tupper, Vapor } from "../../kit/dibujos";

// @letmeexplain.us #3: versión EE. UU. del 001-heladera. Mismo mundo (olla caliente vs. heladera) y mismos dibujos.
// Mecanismo: la comida en la mesada pasa horas en la zona de peligro (40–140 °F) y las bacterias se duplican; la heladera de hoy se la banca.
// El termómetro sigue en escala interna 4–60 (°C) pero los rótulos muestran °F.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  reves: r.f(1),
  peligro: r.f(2),
  origen: r.f(4),
  ojo: r.f(7),
  regla: r.f(9),
  cta: r.f(11),
  sello: r.fin(11) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

/* 1 · You let your leftovers cool… */
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mala = r.w(0, "before") - E.gancho;
  const preocupada = frame >= mala;
  const dx = temblor(frame, mala, 14, 14);
  const caida = interpolate(resorte(frame, fps, 0, 260), [0, 1], [-260, 0]);
  return (
    <Escena entrada={false}>
      <Etiqueta texto="the myth" desde={-8} />
      <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={460} tam={60} />
      <AbsoluteFill style={{ scale: interpolate(frame, [0, 8], [1.12, 1], clamp), transformOrigin: "540px 1150px" }}>
        <Lienzo>
          <line x1={70} y1={1300} x2={640} y2={1300} stroke={C.tinta} strokeWidth={9} strokeLinecap="round" />
          <g transform={`translate(${dx} ${caida})`}>
            <Vapor x={330} y={1100} t={frame} />
            <Olla x={200} y={1140} cara={preocupada ? "preocupada" : "feliz"} t={frame} sudor={preocupada} />
            {preocupada ? <Rayitos cx={330} cy={960} /> : null}
          </g>
          <Heladera x={690} y={760} />
        </Lienzo>
        <Globo texto="what did I do?" desde={mala + 8} x={90} y={760} tam={44} ancho={330} />
      </AbsoluteFill>
    </Escena>
  );
};

/* 2 · That's backwards. */
const AlReves: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flecha = suave(frame, 6, 10);
  return (
    <Escena empuje={0.02}>
      <AbsoluteFill style={{ scale: golpe(frame, 0, 1.1, 14) }}>
        <Etiqueta texto="the truth" color={C.verde} />
        <Titulo respuesta="backwards." desdeR={0} top={470} tamR={150} />
        <Lienzo>
          <g style={{ scale: pop(frame, fps, 2), transformOrigin: "300px 1300px" }}>
            <Vapor x={300} y={1120} t={frame} />
            <Olla x={170} y={1160} cara="sorprendida" t={frame} />
          </g>
          <path d="M330 1080 C 380 880, 560 820, 650 900" fill="none" stroke={C.azul} strokeWidth={22} strokeLinecap="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - flecha} />
          {flecha > 0.95 ? <path d="M620 860 L670 912 L600 925 Z" fill={C.azul} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" /> : null}
          <g style={{ scale: pop(frame, fps, 4), transformOrigin: "830px 1340px" }}>
            <Heladera x={690} y={800} cara={flecha > 0.9 ? "feliz" : "sorprendida"} t={frame} />
          </g>
        </Lienzo>
        <Sello texto="MYTH" desde={8} x={90} y={760} rot={-10} />
        <Globo texto="bring it in now!" desde={14} x={560} y={690} cola="der" tam={40} ancho={380} />
      </AbsoluteFill>
    </Escena>
  );
};

/* 3 · The danger zone and the bacteria that double (and party). Frases 2 y 3. */
const Peligro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.peligro;
  const finHoras = L(r.fin(2));
  const temp = interpolate(frame, [0, finHoras], [92, 24], clamp);
  const zona = suave(frame, L(r.w(2, "between")), 8);
  const bact = L(r.w(3, "bacteria"));
  const dup = L(r.w(3, "double"));
  const fasesBact = [bact, dup, dup + 7, L(r.w(3, "little")), L(r.w(3, "twenty")) + 4];
  const cuantas = [1, 2, 4, 8, 16][fasesBact.filter((f) => frame >= f).length - 1] ?? 0;
  const posiciones = Array.from({ length: 16 }).map((_, i) => ({ cx: 520 + (i % 4) * 140, cy: 800 + Math.floor(i / 4) * 140 + (i % 2) * 20 }));
  const relojFuera = interpolate(frame, [bact - 6, bact], [1, 0], clamp);
  const fiesta = frame >= dup + 8;
  const palabra = [L(r.w(2, "forty")), finHoras + 6];
  const atenua = interpolate(frame, [palabra[0], palabra[0] + 3, palabra[1] - 3, palabra[1]], [1, 0.2, 0.2, 1], clamp);
  return (
    <Escena>
      <Etiqueta texto="the danger zone" color={C.rojo} />
      <Lienzo>
        <g opacity={atenua}>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "225px 1300px" }}>
          <Termometro x={180} y={620} temp={temp} zona={zona} />
        </g>
        <g opacity={zona} fontFamily={display} fontWeight={800} fontSize={46} fill={C.rojo}>
          <text x={300} y={636}>140°F</text>
          <text x={300} y={1272}>40°F</text>
        </g>
        <g opacity={relojFuera} style={{ scale: pop(frame, fps, 8), transformOrigin: "760px 960px" }}>
          <Reloj cx={760} cy={960} r={150} vueltas={interpolate(frame, [8, finHoras], [0, 3], clamp)} />
        </g>
        {posiciones.slice(0, cuantas).map((p, i) => {
          const nace = fasesBact[Math.ceil(Math.log2(i + 1))] ?? bact;
          return (
            <g key={i} style={{ scale: pop(frame, fps, nace), transformOrigin: `${p.cx}px ${p.cy}px` }}>
              <Bacteria cx={p.cx} cy={p.cy} s={0.85} t={frame + i * 5} fiesta={fiesta} />
            </g>
          );
        })}
        </g>
      </Lienzo>
      {zona > 0 ? <Sello texto="DANGER ZONE" desde={L(r.w(2, "between"))} x={420} y={430} rot={-4} tam={46} /> : null}
      <Palabrota texto="40°–140°F" desde={palabra[0]} hasta={palabra[1]} top={760} color={C.rojo} tam={190} />
      {fiesta ? <Globo texto="PARTY!" desde={dup + 8} x={600} y={560} tam={52} ancho={300} color={C.amarillo} /> : null}
      {frame >= L(r.w(3, "little")) ? <Sello texto="×2 in 20 min" desde={L(r.w(3, "little"))} x={560} y={1290} rot={-6} color={C.amarillo} tinta={C.tinta} tam={50} /> : null}
      <Fuente texto="USDA FSIS" />
    </Escena>
  );
};

/* 4 · Where'd the myth come from? Iceboxes. Today's fridges handle it. Frases 4–6. */
const Origen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.origen;
  const hielo = L(r.f(5));
  const meter = L(r.w(5, "hot"));
  const derrite = L(r.w(5, "melted"));
  const hoy = L(r.f(6));
  const fuerzaPregunta = interpolate(frame, [hielo - 4, hielo], [1, 0], clamp);
  const bajaOlla = interpolate(frame, [meter, meter + 12], [520, 820], clamp);
  const nivelHielo = interpolate(frame, [meter + 12, hoy - 2], [1, 0.15], clamp);
  return (
    <Escena>
      <Etiqueta texto="where it came from" />
      <Lienzo>
        {frame < hielo ? (
          <g opacity={fuerzaPregunta} style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1000px" }}
            transform={`rotate(${Math.sin(frame / 5) * 8} 540 1000)`}>
            <Pregunta cx={540} cy={1260} fuente={display} />
          </g>
        ) : null}
        {frame >= hielo && frame < hoy ? (
          <g>
            <g style={{ scale: pop(frame, fps, hielo), transformOrigin: "540px 1300px" }}>
              <HeladeraHielo x={380} y={760} hielo={nivelHielo} t={frame} />
            </g>
            {frame >= meter ? (
              <g transform={`translate(0 ${bajaOlla - 820})`}>
                <Vapor x={540} y={800} t={frame} alto={60} />
                <Olla x={460} y={830} ancho={160} alto={100} cara={frame >= derrite ? "canchera" : "feliz"} t={frame} />
              </g>
            ) : null}
          </g>
        ) : null}
        {frame >= hoy ? (
          <g style={{ scale: pop(frame, fps, hoy), transformOrigin: "540px 1330px" }}>
            <Heladera x={390} y={760} cara="canchera" t={frame} />
          </g>
        ) : null}
      </Lienzo>
      {frame >= hielo && frame < hoy ? <Sello texto="OLD ICEBOX" desde={hielo + 3} x={60} y={1000} rot={-5} color={C.amarillo} tinta={C.tinta} tam={46} /> : null}
      {frame >= hielo && frame < hoy ? <Globo texto="I'm melting!" desde={derrite} x={600} y={640} tam={46} ancho={340} /> : null}
      {frame >= hoy ? <Globo texto="hand it over hot, I can take it!" desde={hoy + 4} x={470} y={520} tam={42} ancho={480} /> : null}
      {frame >= hoy ? <Sello texto="HOLDS UP ✓" desde={hoy + 10} x={560} y={1190} rot={6} color={C.verde} tinta={C.tinta} tam={52} /> : null}
      <Fuente texto="Indiana Public Media · AARP" />
    </Escena>
  );
};

/* 5 · Heads up: a giant pot takes forever; split it into shallow containers. Frases 7–8. */
const Ojo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.ojo;
  const tuppers = L(r.w(8, "shallow"));
  const salidaOlla = interpolate(frame, [tuppers - 4, tuppers + 4], [1, 0], clamp);
  const monton = L(r.w(7, "forever"));
  return (
    <Escena>
      <Sello texto="HEADS UP" desde={0} x={330} y={330} rot={-8} color={C.amarillo} tinta={C.tinta} tam={80} />
      <Lienzo>
        {salidaOlla > 0 ? (
          <g opacity={salidaOlla} style={{ scale: pop(frame, fps, 4), transformOrigin: "540px 1300px" }}>
            <Vapor x={540} y={900} t={frame} n={4} sep={80} alto={110} />
            <Olla x={320} y={960} ancho={440} alto={280} cara="preocupada" t={frame} sudor />
            <line x1={160} y1={1300} x2={920} y2={1300} stroke={C.tinta} strokeWidth={9} strokeLinecap="round" />
          </g>
        ) : null}
        {frame >= monton && salidaOlla > 0 ? (
          <g style={{ scale: pop(frame, fps, monton), transformOrigin: "880px 760px" }}>
            <Reloj cx={880} cy={760} r={95} vueltas={(frame - monton) / 8} color={C.amarillo} />
          </g>
        ) : null}
        {[0, 1, 2].map((i) =>
          frame >= tuppers + i * 5 ? (
            <g key={i} style={{ scale: pop(frame, fps, tuppers + i * 5), transformOrigin: `540px ${960 + i * 140}px` }}>
              <Tupper x={330} y={900 + i * 140} ancho={420} color={[C.azul, C.verde, C.rojo][i]} />
            </g>
          ) : null
        )}
      </Lienzo>
      {salidaOlla > 0 ? <Globo texto="this takes forever!" desde={monton + 4} x={110} y={650} tam={44} ancho={400} /> : null}
      {frame >= tuppers + 12 ? <Sello texto="SHALLOW" desde={tuppers + 12} x={640} y={760} rot={8} color={C.azul} tam={54} /> : null}
      <Fuente texto="USDA FSIS" />
    </Escena>
  );
};

/* 6 · The rule: two hours. Over 90 °F, one hour. Frases 9–10. */
const Regla: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.regla;
  const antes = L(r.w(9, "within"));
  const dos = L(r.w(9, "two"));
  const calor = L(r.f(10));
  const una = L(r.w(10, "one"));
  const vueltas = interpolate(frame, [antes, dos + 8], [0, 2], clamp);
  const tachar = suave(frame, una - 4, 6);
  const sale2 = interpolate(frame, [una + 2, una + 6], [1, 0], clamp);
  return (
    <Escena>
      <Etiqueta texto="the rule" />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 2), transformOrigin: "540px 930px" }}>
          <Reloj cx={540} cy={930} r={230} vueltas={frame >= una ? 1 : vueltas} />
        </g>
        {frame >= calor ? (
          <g style={{ scale: pop(frame, fps, calor), transformOrigin: "230px 640px" }}>
            <Sol cx={230} cy={640} r={95} t={frame} />
          </g>
        ) : null}
      </Lienzo>
      {frame >= dos && sale2 > 0 ? (
        <div style={{ position: "absolute", top: 1215, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: sale2 }}>
          <div style={{ position: "relative" }}>
            <Sello texto="2 HOURS" desde={dos} x={-150} y={0} rot={-3} color={C.amarillo} tinta={C.tinta} tam={70} />
            <div style={{ position: "absolute", left: -160, top: 50, width: 330 * tachar, height: 14, background: C.rojo, rotate: "-6deg", borderRadius: 7 }} />
          </div>
        </div>
      ) : null}
      {frame >= calor ? <Globo texto="hot day? I make the rules" desde={calor + 6} x={330} y={420} tam={38} ancho={480} /> : null}
      {frame >= calor ? <Sello texto="90°F+" desde={calor + 4} x={660} y={650} rot={8} color={C.rojo} tam={64} /> : null}
      {frame >= una + 4 ? <Sello texto="1 HOUR" desde={una + 4} x={385} y={1210} rot={-3} color={C.rojo} tam={74} /> : null}
      <Fuente texto="USDA FSIS" />
    </Escena>
  );
};

/* 7 · Send this to the friend who leaves the chili on the stove all night. */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = (g: number) => g - E.cta;
  const noche = L(r.w(11, "night"));
  const guiso = L(r.w(11, "chili"));
  return (
    <Escena>
      <Titulo pregunta="send this to the friend who…" desdeP={0} top={360} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 4), transformOrigin: "860px 760px" }}>
          <Luna cx={860} cy={760} r={90} />
        </g>
        <g fontFamily={display} fontWeight={800} fill={C.tinta} opacity={suave(frame, 10, 8)}>
          <text x={700} y={1000} fontSize={60} transform={`translate(0 ${-((frame * 1.2) % 30)})`}>z</text>
          <text x={750} y={950} fontSize={80} transform={`translate(0 ${-((frame * 1.2 + 15) % 30)})`}>z</text>
        </g>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1300px" }}>
          <Vapor x={540} y={1000} t={frame} opacidad={0.6} />
          <Olla x={410} y={1030} cara="dormida" color={C.verde} t={frame} />
          <Anafe x={280} y={1210} t={frame} />
        </g>
      </Lienzo>
      <Globo texto="I'll eat it tomorrow anyway" desde={guiso + 4} x={90} y={770} cola="der" tam={40} ancho={420} />
      {frame >= noche ? <Sello texto="ALL NIGHT" desde={noche} x={110} y={560} rot={-7} color={C.rojo} tam={52} /> : null}
    </Escena>
  );
};

export const FridgeLeftoversEn003: React.FC = () => {
  const efectos: Efecto[] = [
    // gancho
    [E.gancho, "whoosh", 0.4], [E.gancho + 6, "boing", 0.45], [E.gancho + 4, "pop", 0.35],
    [r.w(0, "before"), "error", 0.35], [r.w(0, "before") + 8, "burbuja", 0.4],
    // backwards
    [E.reves - 3, "latigo", 0.5], [E.reves, "scratch", 0.55], [E.reves + 8, "sello", 0.7], [E.reves + 14, "burbuja", 0.4],
    // danger zone
    [E.peligro - 3, "latigo", 0.5], [r.w(2, "between"), "sello", 0.55], [r.w(2, "forty"), "boing", 0.4],
    [r.w(3, "bacteria"), "pop"], [r.w(3, "double"), "pop"], [r.w(3, "double") + 7, "pop"],
    [r.w(3, "double") + 8, "fiesta", 0.45],
    [r.w(3, "little"), "pop"], [r.w(3, "twenty") + 4, "pop"], [r.w(3, "little") + 2, "ding", 0.4],
    // origin
    [E.origen - 3, "latigo", 0.5], [E.origen, "boing", 0.4], [r.f(5), "pop"], [r.f(5) + 3, "sello", 0.5],
    [r.w(5, "hot") + 12, "tic", 0.5], [r.w(5, "melted"), "burbuja", 0.4],
    [r.f(6), "boing", 0.45], [r.f(6) + 4, "burbuja", 0.4], [r.f(6) + 10, "sello", 0.6], [r.f(6) + 14, "ding", 0.35],
    // heads up
    [E.ojo - 3, "latigo", 0.5], [E.ojo, "sello", 0.6], [r.w(7, "forever"), "pop"], [r.w(7, "forever") + 4, "burbuja", 0.4],
    [r.w(8, "shallow"), "boing", 0.4], [r.w(8, "shallow") + 5, "pop"], [r.w(8, "shallow") + 10, "pop"],
    [r.w(8, "shallow") + 12, "sello", 0.45],
    // rule
    [E.regla - 3, "latigo", 0.5], [E.regla + 2, "pop"], [r.w(9, "two"), "sello", 0.6], [r.w(9, "two") + 4, "ding", 0.35],
    [r.f(10), "boing", 0.4], [r.f(10) + 4, "sello", 0.5], [r.f(10) + 6, "burbuja", 0.35], [r.w(10, "one"), "sello", 0.7],
    // cta y final
    [E.cta - 3, "latigo", 0.5], [E.cta, "pop"], [r.w(11, "chili") + 4, "burbuja", 0.4], [r.w(11, "night"), "sello", 0.55],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo">
        <Logo />
      </Sequence>

      <Sequence name="1 · hook" from={E.gancho} durationInFrames={E.reves - E.gancho}><Gancho /></Sequence>
      <Sequence name="2 · backwards" from={E.reves} durationInFrames={E.peligro - E.reves}><AlReves /></Sequence>
      <Sequence name="3 · danger zone" from={E.peligro} durationInFrames={E.origen - E.peligro}><Peligro /></Sequence>
      <Sequence name="4 · origin of the myth" from={E.origen} durationInFrames={E.ojo - E.origen}><Origen /></Sequence>
      <Sequence name="5 · heads up" from={E.ojo} durationInFrames={E.regla - E.ojo}><Ojo /></Sequence>
      <Sequence name="6 · the rule" from={E.regla} durationInFrames={E.cta - E.regla}><Regla /></Sequence>
      <Sequence name="7 · cta" from={E.cta} durationInFrames={E.sello - E.cta}><Cta /></Sequence>
      <Sequence name="final stamp" from={E.sello} durationInFrames={DURACION - E.sello}>
        <SelloFinal mandar="send this to the friend who leaves the chili on the stove all night" />
      </Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("en-003-fridge-leftovers/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

/* Cover for the grid */
export const PortadaEn003: React.FC = () => (
  <Portada arriba="cool your leftovers first?" grande="backwards." sello="MYTH">
    <Lienzo>
      <line x1={90} y1={1310} x2={600} y2={1310} stroke={C.tinta} strokeWidth={9} strokeLinecap="round" />
      <Vapor x={330} y={1110} t={0} />
      <Olla x={200} y={1150} cara="preocupada" t={40} sudor />
      <Heladera x={690} y={840} alto={480} cara="sorprendida" />
    </Lienzo>
  </Portada>
);

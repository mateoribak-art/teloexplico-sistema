import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/021-heladera-parte-2/tiempos.json";
import { C } from "../../kit/marca";
import { clamp, entre, golpe, pop, suave } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Flujo, Rotulo } from "../../kit/diagrama";
import { Heladera, Olla, Persona } from "../../kit/biblioteca";

// Mundo: la cocina de siempre (la misma olla y la misma heladera del video 1), vista de frente.
// Mecanismo que muestra: la olla se tapa, entra a la heladera y un almanaque cuenta los días (tres o cuatro)
// hasta que se pasa de fecha; el freezer estira el plazo a meses.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  tapo: r.f(1),
  tapa: r.f(2),
  dias: r.f(3),
  vence: r.f(4),
  tres: r.f(5),
  freezer: r.f(6),
  ojo: r.f(7),
  papel: r.f(8),
  cta: r.f(9),
  sello: r.fin(9) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const SUELO = 1330;
const XO = 290; // olla
const XH = 800; // heladera

/* Almanaque de días: casilleros que se van tachando. */
const Almanaque: React.FC<{ x: number; y: number; n: number; buenos: number; desde: number; f: number }> = ({ x, y, n, buenos, desde, f }) => {
  const w = 120;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const t0 = desde + i * 9;
        const p = suave(f, t0, 8);
        const ok = i < buenos;
        const px = x + (i % 5) * (w + 10);
        const py = y + Math.floor(i / 5) * (w + 10);
        return (
          <g key={i} style={{ scale: p, transformOrigin: `${px + w / 2}px ${py + w / 2}px` }}>
            <rect x={px + 8} y={py + 8} width={w} height={w} rx={14} fill={C.tinta} />
            <rect x={px} y={py} width={w} height={w} rx={14} fill={ok ? C.verde : C.rojo} stroke={C.tinta} strokeWidth={6} />
            <text x={px + w / 2} y={py + w / 2 + 22} textAnchor="middle" fontFamily="sans-serif" fontWeight={800} fontSize={64} fill={C.blanco}
              stroke={C.tinta} strokeWidth={3} paintOrder="stroke">{ok ? i + 1 : "✗"}</text>
          </g>
        );
      })}
    </g>
  );
};

/* Cinta de meses del freezer. */
const Meses4: React.FC<{ x: number; y: number; desde: number; f: number }> = ({ x, y, desde, f }) => (
  <g>
    {Array.from({ length: 4 }).map((_, i) => {
      const p = suave(f, desde + i * 10, 8);
      const px = x + i * 150;
      return (
        <g key={i} style={{ scale: p, transformOrigin: `${px + 65}px ${y + 65}px` }}>
          <rect x={px + 8} y={y + 8} width={130} height={130} rx={18} fill={C.tinta} />
          <rect x={px} y={y} width={130} height={130} rx={18} fill={"#CFE6FF"} stroke={C.tinta} strokeWidth={6} />
          <text x={px + 65} y={y + 92} textAnchor="middle" fontFamily="sans-serif" fontWeight={800} fontSize={70} fill={C.azul}
            stroke={C.tinta} strokeWidth={3} paintOrder="stroke">{i + 1}</text>
        </g>
      );
    })}
  </g>
);

/* Reloj de dos horas. */
const Reloj2: React.FC<{ x: number; y: number; desde: number; f: number }> = ({ x, y, desde, f }) => {
  const p = interpolate(f, [desde, desde + 50], [0, 1], clamp);
  const a = p * 2 * Math.PI * 2 - Math.PI / 2;
  return (
    <g>
      <circle cx={x + 8} cy={y + 8} r={110} fill={C.tinta} />
      <circle cx={x} cy={y} r={110} fill={C.blanco} stroke={C.tinta} strokeWidth={8} />
      <path d={`M${x} ${y} L${x} ${y - 100} A100 100 0 ${p > 0.5 ? 1 : 0} 1 ${x + Math.sin(p * 2 * Math.PI) * 100} ${y - Math.cos(p * 2 * Math.PI) * 100} Z`}
        fill={C.amarillo} opacity={0.85} />
      <line x1={x} y1={y} x2={x + Math.cos(a) * 90} y2={y + Math.sin(a) * 90} stroke={C.tinta} strokeWidth={9} strokeLinecap="round" />
      <circle cx={x} cy={y} r={10} fill={C.tinta} />
    </g>
  );
};

/* El mundo según el frame. */
const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const abierta = interpolate(f, [E.dias - 8, E.dias + 10, E.vence + 30, E.vence + 44], [0, 1, 1, 0], clamp);
  const freezerOn = f >= E.freezer;
  // la olla: al principio al lado de la heladera; "tapa" cae sobre ella; en "dias" se sienta dentro (se ve chica en el estante)
  const tapaY = interpolate(f, [r.w(2, "Tapala"), r.w(2, "Tapala") + 14], [-420, 0], clamp);
  const conTapa = f >= r.w(2, "Tapala") + 14;
  const ollaEnHeladera = f >= E.dias - 4 && f < E.cta;
  const sacudon = golpe(f, r.w(2, "Tapala") + 14, 1.04, 10);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <rect x={-50} y={SUELO} width={1180} height={600} fill="#E9D8B8" />
      <rect x={-50} y={SUELO} width={1180} height={10} fill={C.tinta} />
      <Heladera x={XH} y={SUELO} s={1.45} abierta={abierta}
        contenido={ollaEnHeladera && abierta > 0.5 ? (
          <g stroke={C.tinta} strokeWidth={4}>
            <rect x={-70} y={-300} width={140} height={90} rx={12} fill={C.rojo} />
            <rect x={-80} y={-312} width={160} height={16} rx={6} fill={"#C8CEDD"} />
          </g>
        ) : undefined} />
      {!ollaEnHeladera ? (
        <g style={{ scale: sacudon, transformOrigin: `${XO}px ${SUELO}px` }}>
          <Olla x={XO} y={SUELO} s={1.05} t={f} tapa={conTapa} />
          {f >= E.tapo && !conTapa && f >= r.w(2, "Tapala") ? (
            <g transform={`translate(${XO} ${SUELO - 210 * 1.05 + tapaY})`}>
              <path d="M-156 0 Q0 -90 156 0 Z" fill="#C8CEDD" stroke={C.tinta} strokeWidth={8} strokeLinejoin="round" />
              <ellipse cx={0} cy={-52} rx={30} ry={14} fill={C.tinta} />
            </g>
          ) : null}
          {!conTapa ? (
            <Flujo x0={XO - 110} x1={XO + 110} yAbajo={SUELO - 230} yArriba={SUELO - 480} n={10} velocidad={1} color={"#FFFFFF"} tam={12} t={f} opacidad={0.9} />
          ) : null}
        </g>
      ) : null}
      {freezerOn && f < E.ojo ? (
        <g>
          <circle cx={XH + 50} cy={SUELO - 560} r={44} fill={"#CFE6FF"} stroke={C.tinta} strokeWidth={6} opacity={suave(f, E.freezer, 8)} />
          <text x={XH + 50} y={SUELO - 545} textAnchor="middle" fontSize={50} opacity={suave(f, E.freezer, 8)}>❄</text>
        </g>
      ) : null}
    </svg>
  );
};

/* Anotaciones pegadas al mundo. */
const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {entre(f, E.tapa, E.dias) ? (
        <Rotulo texto="humedad adentro, olores afuera" desde={r.w(2, "humedad")} x={470} y={SUELO - 640} ax={XO + 40} ay={SUELO - 300} tam={26} />
      ) : null}
      {entre(f, E.freezer, E.ojo) ? (
        <Rotulo texto="freezer: calidad" desde={r.w(6, "freezer")} x={540} y={SUELO - 760} ax={XH + 50} ay={SUELO - 590} color={C.blanco} fondo={C.azul} tam={26} />
      ) : null}
    </>
  );
};

const Dias: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t4 = r.w(5, "tres");
  return (
    <Lienzo>
      <g style={{ scale: pop(f, fps, 0), transformOrigin: "540px 700px" }}>
        <Almanaque x={150} y={560} n={6} buenos={4} desde={t4 - E.tres + 6} f={f} />
      </g>
    </Lienzo>
  );
};

const Freezer: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Lienzo>
      <g style={{ scale: pop(f, fps, 12), transformOrigin: "540px 600px" }}>
        <Meses4 x={210} y={540} desde={r.w(6, "tres") - E.freezer} f={f} />
      </g>
      <text x={540} y={750} textAnchor="middle" fontFamily="sans-serif" fontWeight={800} fontSize={44} fill={C.tinta} opacity={suave(f, r.w(6, "meses") - E.freezer, 8)}>meses</text>
    </Lienzo>
  );
};

const Ojo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Lienzo>
      <Reloj2 x={540} y={640} desde={r.w(7, "dos") - E.ojo - 20} f={f} />
    </Lienzo>
  );
};

const Papel: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ps = r.w(8, "papelito") - E.papel;
  return (
    <Lienzo>
      <g style={{ scale: pop(f, fps, 0), transformOrigin: "540px 800px" }}>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${200 + i * 250} ${700 + (i % 2) * 40})`}>
            <rect x={8} y={8} width={210} height={150} rx={18} fill={C.tinta} />
            <rect x={0} y={0} width={210} height={150} rx={18} fill={"#EAF3FF"} stroke={C.tinta} strokeWidth={7} />
            <rect x={-6} y={-16} width={222} height={30} rx={10} fill={[C.azul, C.verde, C.rojo][i]} stroke={C.tinta} strokeWidth={6} />
            <g style={{ scale: suave(f, ps + i * 8, 8), transformOrigin: "105px 90px" }}>
              <rect x={40} y={50} width={130} height={64} rx={6} fill={C.amarillo} stroke={C.tinta} strokeWidth={5} transform="rotate(-6 105 90)" />
              <text x={105} y={96} textAnchor="middle" fontFamily="sans-serif" fontWeight={800} fontSize={34} fill={C.tinta} transform="rotate(-6 105 90)">{["27/10", "28/10", "29/10"][i]}</text>
            </g>
          </g>
        ))}
      </g>
    </Lienzo>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grito = r.w(9, "tapa") - E.cta;
  return (
    <>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={360} />
      <Lienzo>
        <g style={{ scale: pop(f, fps, 0), transformOrigin: "540px 1100px" }}>
          <Olla x={330} y={1300} s={1.1} t={f} tapa />
          <Persona x={780} y={1330} s={0.8} t={f} gesto={f >= grito ? "pensando" : "feliz"} remera={C.verde} pelo="rulos" />
        </g>
      </Lienzo>
      {f >= grito ? <Globo texto="¡quedó fresquísima!" desde={grito} x={520} y={680} cola="der" tam={42} ancho={460} /> : null}
    </>
  );
};

const TOMAS_ESCALA = (f: number) => 1 + 0.02 * Math.sin(f / 20);

const Diagrama: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= E.cta) return null;
  const golpes = [r.w(1, "tapo"), r.w(2, "Tapala"), r.w(3, "días"), r.w(4, "vencimiento"), r.w(5, "cuatro"), r.w(6, "freezer"), r.w(7, "dos")];
  const g = golpes.reduce((m, k) => m * golpe(f, k, 1.05, 12), 1);
  const atenua = entre(f, E.tres, E.ojo) ? 0.12 : 1;
  const atenuaOjo = entre(f, E.ojo, E.cta) ? 0.12 : 1;
  return (
    <AbsoluteFill style={{ scale: g * TOMAS_ESCALA(f), opacity: Math.min(atenua, atenuaOjo) }}>
      <Mundo />
      <Anotaciones />
    </AbsoluteFill>
  );
};

export const HeladeraParte2_021: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4],
    [E.tapo, "burbuja", 0.35], [r.w(1, "tapo"), "pop"],
    [r.w(2, "Tapala"), "latigo", 0.4], [r.w(2, "Tapala") + 14, "boing", 0.5], [r.w(2, "humedad"), "burbuja", 0.3],
    [E.dias, "whoosh", 0.4], [r.w(3, "días"), "tic", 0.4],
    [E.vence, "scratch", 0.5], [r.w(4, "vencimiento"), "sello", 0.5],
    [E.tres, "whoosh", 0.35], [r.w(5, "tres"), "tic", 0.4], [r.w(5, "cuatro"), "ding", 0.45],
    [E.freezer, "whoosh", 0.35], [r.w(6, "freezer"), "ding", 0.45], [r.w(6, "meses"), "sello", 0.45],
    [E.ojo, "sello", 0.55], [E.ojo + 8, "pop"],
    [E.papel, "whoosh", 0.35], [r.w(8, "papelito"), "sello", 0.45],
    [E.cta, "pop"], [r.w(9, "tapa"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo">
        <Logo />
      </Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.tapo - E.gancho} layout="none">
        <Etiqueta texto="heladera · parte 2" desde={-8} />
        <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={420} tam={60} />
      </Sequence>
      <Sequence name="2 · tapo" from={E.tapo} durationInFrames={E.tapa - E.tapo} layout="none">
        <Etiqueta texto="la pregunta" />
        <Globo texto="¿y la tapo?" desde={4} x={560} y={560} cola="izq" tam={64} ancho={420} />
      </Sequence>
      <Sequence name="3 · tapa" from={E.tapa} durationInFrames={E.dias - E.tapa} layout="none">
        <Etiqueta texto="tapala" color={C.verde} />
        <Titulo pregunta="tapada" respuesta="sí" desdeP={0} desdeR={r.w(2, "Tapala") - E.tapa} top={400} tamR={120} />
        <Fuente texto="USDA (FSIS)" />
      </Sequence>
      <Sequence name="4 · dias" from={E.dias} durationInFrames={E.vence - E.dias} layout="none">
        <Etiqueta texto="lo que importa" />
        <Titulo pregunta="¿cuántos" respuesta="días?" desdeP={0} desdeR={r.w(3, "cuántos") - E.dias} top={400} tamR={140} />
      </Sequence>
      <Sequence name="5 · vence" from={E.vence} durationInFrames={E.tres - E.vence} layout="none">
        <Etiqueta texto="el guiso" />
        <Sello texto="¡VENCE!" desde={r.w(4, "vencimiento") - E.vence} x={330} y={560} rot={-6} color={C.rojo} tam={76} />
      </Sequence>
      <Sequence name="6 · tres" from={E.tres} durationInFrames={E.freezer - E.tres} layout="none">
        <Etiqueta texto="en la heladera" color={C.verde} />
        <Dias />
        <Titulo pregunta="3 o 4 días" desdeP={0} top={1000} />
        <Fuente texto="USDA (FSIS)" />
      </Sequence>
      <Sequence name="7 · freezer" from={E.freezer} durationInFrames={E.ojo - E.freezer} layout="none">
        <Etiqueta texto="en el freezer" color={C.azul} />
        <Freezer />
        <Titulo pregunta="3 o 4 meses" desdeP={0} top={1000} />
        <Fuente texto="USDA (FSIS)" />
      </Sequence>
      <Sequence name="8 · ojo" from={E.ojo} durationInFrames={E.papel - E.ojo} layout="none">
        <Sello texto="OJO" desde={0} x={440} y={330} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
        <Ojo />
        <Titulo pregunta="antes de 2 horas" desdeP={0} top={880} />
        <Fuente texto="USDA (FSIS)" />
      </Sequence>
      <Sequence name="9 · papel" from={E.papel} durationInFrames={E.cta - E.papel} layout="none">
        <Etiqueta texto="hacelo hoy" color={C.verde} />
        <Papel />
      </Sequence>
      <Sequence name="10 · cta" from={E.cta} durationInFrames={DURACION - E.cta} layout="none"><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}>
        <SelloFinal mandar="mandáselo al que guarda la olla entera con la tapa puesta" />
      </Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("021-heladera-parte-2/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada021: React.FC = () => (
  <Portada arriba="¿cuántos días dura la comida en la heladera?" grande="tres o cuatro" sello="DATO" colorSello={C.verde} numero={21}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(0 60)">
        <Heladera x={800} y={1450} s={1.5} />
        <Olla x={300} y={1450} s={1.1} tapa />
      </g>
    </svg>
  </Portada>
);

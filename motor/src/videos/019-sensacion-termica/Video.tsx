import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/019-sensacion-termica/tiempos.json";
import { C } from "../../kit/marca";
import { clamp, entre, golpe, pop } from "../../kit/anim";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../../kit/comun";
import { Portada } from "../../kit/Portada";
import { Camara, Contador, Flujo, Piso, Rotulo, SolVolumen, TONO, toma } from "../../kit/diagrama";
import { Persona, Termometro } from "../../kit/biblioteca";

// Mundo: un patio al sol. En el medio, vos (la persona) con sudor en la cara; a la izquierda el termómetro real (siempre 38),
// a la derecha el que "se siente como". El aire se llena de gotitas de humedad: con poca humedad el sudor se evapora (vapor que sube),
// con mucha queda pegado y el termómetro de la sensación sube.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  sudor: r.f(1),
  evapora: r.f(2),
  seco: r.f(3),
  humedo: r.f(4),
  numeros: r.f(5),
  ojo: r.f(6),
  sol: r.f(7),
  remate: r.f(8),
  cta: r.f(9),
  sello: r.fin(9) + 2,
};
export const DURACION = E.sello + DUR_SELLO_FINAL;

const SUELO = 1330;
const XP = 540;
const XA = 190; // termómetro real
const XB = 890; // termómetro "se siente como"
const ESC = 1.25; // persona
const ESCT = 1.2; // termómetros
const K = ESC / 0.9;
const CARA = SUELO - 306 * ESC / 0.9 * 0.9; // y del centro de la cara
const val = (t: number) => (t - 20) / 31; // 20 °C → 0, 51 °C → 1

/** Humedad del aire en el momento (0 seco → 1 muy húmedo). */
const humedad = (f: number) => {
  if (f < E.seco) return 0.4;
  if (f < E.humedo) return 0.08;
  if (f < r.w(5, "cincuenta")) return f < E.numeros + 4 ? 0.9 : 0.08;
  return 0.9;
};

/** Valor del termómetro "se siente como". */
const sensacion = (f: number) => {
  const m = r.w(0, "más");
  if (f < r.w(0, "siente")) return val(38);
  if (f < E.seco) return interpolate(f, [r.w(0, "siente"), m + 6], [val(38), 0.97], clamp);
  if (f < E.humedo) return interpolate(f, [E.seco, E.seco + 24], [0.97, val(36)], clamp);
  if (f < r.w(5, "quince")) return interpolate(f, [E.humedo, E.humedo + 40], [val(36), 0.85], clamp);
  if (f < r.w(5, "cincuenta")) return interpolate(f, [r.w(5, "quince"), r.w(5, "quince") + 14], [0.85, val(36)], clamp);
  return interpolate(f, [r.w(5, "cincuenta"), r.w(5, "cincuenta") + 26], [val(36), 1], clamp);
};

const Gotitas: React.FC<{ f: number; hum: number }> = ({ f, hum }) => {
  const n = Math.round(3 + 36 * hum);
  return (
    <g fill={C.azul} stroke={C.tinta} strokeWidth={3}>
      {Array.from({ length: n }).map((_, i) => {
        const x = 90 + ((i * 397) % 900);
        const y = 780 + ((i * 251) % 500);
        return <circle key={i} cx={x + Math.sin(f / 9 + i) * 10} cy={y + Math.cos(f / 11 + i * 2) * 8} r={13} opacity={0.75} />;
      })}
    </g>
  );
};

const Sudor: React.FC<{ f: number; n: number }> = ({ f, n }) => {
  const OFF = [[-50, -20], [48, -30], [-30, 20], [40, 20], [0, -60], [-55, 35], [58, 5], [10, 40]];
  return (
    <g>
      {OFF.slice(0, n).map(([dx, dy], i) => {
        const d = ((f * 1.2 + i * 17) % 50) * 0.5;
        return (
          <path key={i} transform={`translate(${XP + dx * K} ${CARA + dy * K + d}) scale(${K})`}
            d="M0 -16 C10 -2 10 10 0 10 C-10 10 -10 -2 0 -16 Z" fill={C.azul} stroke={C.tinta} strokeWidth={3} />
        );
      })}
    </g>
  );
};

const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  const hum = humedad(f);
  const ndrops = f < E.sudor ? 2 : f < E.humedo ? 4 : 8;
  const vapor = f >= E.evapora && f < E.humedo ? 1 : 0;
  const vaporSeco = f >= E.seco && f < E.humedo;
  const gesto = f >= E.humedo ? "preocupada" : "sorprendida";
  const sol = f >= E.sol;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <rect x={-1500} y={-2000} width={4080} height={SUELO + 2000} fill={hum > 0.5 ? TONO.nubeMedio : "#FFF3D1"} opacity={0.45} />
      {sol ? <SolVolumen cx={760} cy={700} r={80} t={f} intensidad={1.8} /> : null}

      <Gotitas f={f} hum={hum} />

      {/* vapor que se va (aire seco) o que casi no sale (aire húmedo) */}
      {f >= E.evapora && f < E.numeros ? (
        <Flujo x0={XP - 90} x1={XP + 90} yAbajo={CARA - 90} yArriba={CARA - 420} n={vaporSeco || vapor ? 14 : 4}
          velocidad={vaporSeco ? 2.6 : f >= E.humedo ? 0.25 : 1.4} color={C.azul} tam={8} t={f} opacidad={f >= E.humedo ? 0.5 : 1} />
      ) : null}
      {f >= E.numeros && hum < 0.5 ? (
        <Flujo x0={XP - 90} x1={XP + 90} yAbajo={CARA - 90} yArriba={CARA - 420} n={14} velocidad={2.6} color={C.azul} tam={8} t={f} />
      ) : null}

      <Persona x={XP} y={SUELO + 8} s={ESC} t={f} gesto={gesto} remera={C.amarillo} pelo="rulos" />
      {f >= E.sudor - 6 ? <Sudor f={f} n={ndrops} /> : null}

      <Termometro x={XA} y={SUELO} s={ESCT} valor={val(38)} color={C.verde} />
      <Termometro x={XB} y={SUELO} s={ESCT} valor={sensacion(f)} color={C.rojo} />
      <Piso y={SUELO} />
    </svg>
  );
};

const Anotaciones: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Contador hasta={38} despues=" °C" desde={4} dur={20} x={XA + 10} y={700} tam={84} color={C.verde} etiqueta="termómetro" />
      {entre(f, 0, E.seco) ? (
        <Rotulo texto="se siente como…" desde={r.w(0, "mucho")} x={XB - 10} y={690} ax={XB} ay={SUELO - 520} grande="¿?" tam={26} />
      ) : null}
      {entre(f, E.seco, E.humedo) ? (
        <Rotulo texto="aire seco: se evapora" desde={E.seco + 8} x={540} y={760} ax={XP} ay={CARA - 90} color={C.blanco} fondo={C.verde} tam={32} />
      ) : null}
      {entre(f, E.humedo, E.numeros) ? (
        <Rotulo texto="aire húmedo: no se va" desde={E.humedo + 8} x={540} y={760} ax={XP} ay={CARA - 90} color={C.blanco} fondo={C.azul} tam={32} />
      ) : null}
      {entre(f, E.numeros, E.ojo) ? (
        <>
          {f < r.w(5, "cincuenta") - 8 ? (
            <>
              <Rotulo texto="humedad 15 %" desde={r.w(5, "quince")} x={540} y={760} ax={XP} ay={CARA - 90} color={C.blanco} fondo={C.verde} tam={32} />
              <Contador hasta={36} despues=" °C" desde={r.w(5, "treinta") + 38} dur={18} x={XB} y={700} tam={84} color={C.rojo} etiqueta="se siente" />
            </>
          ) : (
            <>
              <Rotulo texto="humedad 55 %" desde={r.w(5, "cincuenta") - 8} x={540} y={760} ax={XP} ay={CARA - 90} color={C.blanco} fondo={C.azul} tam={32} />
              <Contador hasta={51} despues=" °C" desde={r.w(5, "cincuenta")} dur={26} x={XB} y={700} tam={84} color={C.rojo} etiqueta="se siente" />
            </>
          )}
        </>
      ) : null}
      {entre(f, E.ojo, E.sol) ? (
        <Rotulo texto="temperatura + humedad = fórmula" desde={E.ojo + 10} x={640} y={760} ax={XB} ay={SUELO - 480} tam={30} />
      ) : null}
      {entre(f, E.sol, E.remate) ? (
        <Rotulo texto="al sol: todavía más" desde={r.w(7, "sol")} x={560} y={560} ax={760} ay={650} color={C.tinta} fondo={C.amarillo} tam={32} />
      ) : null}
    </>
  );
};

const TOMAS = [
  toma(0, 540, 1000, 1.0), toma(E.sudor - 8, 540, 1000, 1.0), toma(E.sudor + 6, 540, 1060, 1.15), toma(E.evapora, 540, 1000, 1.05),
  toma(E.seco, 540, 1000, 1.0), toma(E.humedo, 540, 1010, 1.05), toma(E.numeros - 4, 540, 1020, 1.0),
  toma(E.ojo - 20, 540, 1020, 1.0), toma(E.ojo, 600, 1020, 1.08), toma(E.sol - 4, 600, 1020, 1.08),
  toma(E.sol, 600, 980, 1.0), toma(E.remate, 540, 1020, 1.0),
];
const GOLPES = [r.w(0, "mucho"), r.w(1, "sudor"), r.w(2, "evapora"), r.w(3, "rápido"), r.w(4, "casi"), r.w(5, "cincuenta"), r.w(6, "Ojo"), r.w(7, "sol"), r.w(8, "humedad")];

const Diagrama: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= E.cta) return null;
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

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dice = r.w(9, "no") - E.cta;
  return (
    <>
      <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={360} />
      <Lienzo>
        <g style={{ scale: pop(frame, fps, 0), transformOrigin: "540px 1100px" }}>
          <rect x={150 + 14} y={760 + 14} width={780} height={640} rx={20} fill={C.tinta} />
          <rect x={150} y={760} width={780} height={640} rx={20} fill="#FFF3D1" stroke={C.tinta} strokeWidth={10} />
          <SolVolumen cx={780} cy={900} r={70} t={frame} intensidad={1.6} />
          <Persona x={450} y={1380} s={1.1} t={frame} gesto="canchera" remera={C.amarillo} pelo="rulos" mira={1} />
          {[[-60, -20], [58, -35], [-30, 25], [48, 20]].map(([dx, dy], i) => (
            <path key={i} transform={`translate(${450 + dx * 1.1} ${1380 - 330 + dy + ((frame * 1.2 + i * 17) % 50) * 0.5})`}
              d="M0 -18 C11 -2 11 11 0 11 C-11 11 -11 -2 0 -18 Z" fill={C.azul} stroke={C.tinta} strokeWidth={3} />
          ))}
        </g>
      </Lienzo>
      {frame >= dice ? <Globo texto="no hace tanto calor, son 30" desde={dice} x={120} y={560} cola="izq" tam={40} ancho={520} /> : null}
    </>
  );
};

export const SensacionTermica019: React.FC = () => {
  const efectos: Efecto[] = [
    [E.gancho, "whoosh", 0.4], [4, "tic", 0.4], [24, "ding", 0.45], [r.w(0, "mucho"), "scratch", 0.45],
    [E.sudor, "whoosh", 0.35], [r.w(1, "sudor"), "sello", 0.5],
    [E.evapora, "whoosh", 0.35], [r.w(2, "evapora"), "pop"],
    [E.seco, "whoosh", 0.35], [E.seco + 8, "burbuja", 0.35],
    [E.humedo, "whoosh", 0.35], [E.humedo + 8, "burbuja", 0.35],
    [E.numeros, "whoosh", 0.35], [r.w(5, "treinta") + 36, "tic", 0.4], [r.w(5, "treinta") + 56, "ding", 0.45],
    [r.w(5, "cincuenta") - 2, "tic", 0.4], [r.w(5, "cincuenta") + 26, "ding", 0.5],
    [E.ojo, "sello", 0.55], [E.ojo + 8, "pop"],
    [E.sol, "whoosh", 0.35], [r.w(7, "sol"), "sello", 0.45],
    [E.remate, "scratch", 0.4], [r.w(8, "humedad"), "sello", 0.5],
    [E.cta, "pop"], [r.w(9, "no"), "burbuja", 0.4],
    [E.sello, "sello", 0.7], [E.sello + 6, "ding", 0.4],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Diagrama />
      <Sequence from={0} durationInFrames={E.sello} layout="none" name="Logo"><Logo /></Sequence>

      <Sequence name="1 · gancho" from={E.gancho} durationInFrames={E.sudor - E.gancho} layout="none">
        <Etiqueta texto="calor de verano" desde={-8} />
        <TituloHablado tiempos={tiempos} frase={0} desde={E.gancho} top={420} tam={56} />
      </Sequence>
      <Sequence name="2 · sudor" from={E.sudor} durationInFrames={E.evapora - E.sudor} layout="none">
        <Etiqueta texto="la verdad" color={C.verde} />
        <Titulo pregunta="no exagerás…" desdeP={0} respuesta="¡es el sudor!" desdeR={r.w(1, "sudor") - E.sudor} top={400} tamR={110} />
      </Sequence>
      <Sequence name="3 · evapora" from={E.evapora} durationInFrames={E.seco - E.evapora} layout="none">
        <Etiqueta texto="paso 1 · el sudor" />
        <Titulo pregunta="enfría si se…" desdeP={0} respuesta="evapora" desdeR={r.w(2, "evapora") - E.evapora} top={400} tamR={120} />
      </Sequence>
      <Sequence name="4 · seco" from={E.seco} durationInFrames={E.humedo - E.seco} layout="none">
        <Etiqueta texto="paso 2 · aire seco" color={C.verde} />
        <Titulo pregunta="aire seco" desdeP={0} respuesta="te enfría" desdeR={r.w(3, "rápido") - E.seco} top={400} tamR={100} />
      </Sequence>
      <Sequence name="5 · humedo" from={E.humedo} durationInFrames={E.numeros - E.humedo} layout="none">
        <Etiqueta texto="paso 3 · aire húmedo" />
        <Titulo pregunta="aire húmedo" desdeP={0} respuesta="te cocina" desdeR={r.w(4, "quedás") - E.humedo} top={400} tamR={100} />
      </Sequence>
      <Sequence name="6 · numeros" from={E.numeros} durationInFrames={E.ojo - E.numeros} layout="none">
        <Etiqueta texto="con 38 °C de aire" color={C.verde} />
        <Fuente texto="National Weather Service (NOAA)" />
      </Sequence>
      <Sequence name="7 · ojo" from={E.ojo} durationInFrames={E.sol - E.ojo} layout="none">
        <Sello texto="OJO" desde={0} x={440} y={330} rot={-8} color={C.amarillo} tinta={C.tinta} tam={84} />
        <Fuente texto="Servicio Meteorológico Nacional" />
      </Sequence>
      <Sequence name="8 · sol" from={E.sol} durationInFrames={E.remate - E.sol} layout="none">
        <Etiqueta texto="a la sombra" color={C.verde} />
        <Fuente texto="National Weather Service (NOAA)" />
      </Sequence>
      <Sequence name="9 · remate" from={E.remate} durationInFrames={E.cta - E.remate} layout="none">
        <Etiqueta texto="la clave" />
        <Titulo pregunta="misma temperatura…" desdeP={0} respuesta="¡otra humedad!" desdeR={r.w(8, "humedad") - E.remate} top={400} tamR={96} />
      </Sequence>
      <Sequence name="10 · cta" from={E.cta} durationInFrames={DURACION - E.cta} layout="none"><Cta /></Sequence>
      <Sequence name="sello final" from={E.sello} durationInFrames={DURACION - E.sello}><SelloFinal /></Sequence>

      <Subtitulos tiempos={tiempos} hasta={E.sello} />
      <Audio src={staticFile("019-sensacion-termica/voz.wav")} volume={1} />
      <Musica hasta={DURACION} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const Portada019: React.FC = () => (
  <Portada arriba="¿por qué se siente más calor que el termómetro?" grande="la humedad" sello="CIENCIA" colorSello={C.verde} numero={19}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(0 40)">
        <SolVolumen cx={800} cy={760} r={90} t={10} />
        <Termometro x={300} y={1400} s={1.2} valor={0.95} />
        <Persona x={640} y={1420} s={0.9} t={0} gesto="preocupada" remera={C.amarillo} pelo="rulos" />
      </g>
    </svg>
  </Portada>
);

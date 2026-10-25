import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { C, display, mono, sombra } from "../kit/marca";
import { clamp, resorte, suave } from "../kit/anim";
import { reloj, type Tiempos } from "../kit/tiempos";
import { Escena, Etiqueta, Fondo, Fuente, Globo, Logo, Musica, Sello, Sfx, Subtitulos, Titulo, type Efecto } from "../kit/piezas";
import { DUR_SELLO_FINAL, Lienzo, SelloFinal, TituloHablado } from "../kit/comun";
import { Portada } from "../kit/Portada";
import { Contador, Flujo } from "../kit/diagrama";
import { Anafe, Auto, Barrio, Bife, Heladera, Nube, Olla, Persona, Sarten, Sol, Termometro, Vaso } from "../kit/biblioteca";

// Plantilla del PLAN B (herramientas/plan_b.py): cuando Claude no tiene cuota, Gemini escribe el guion y elige
// un tipo de escena por frase; esta composición lo arma sola con la biblioteca. Más genérica que un video
// hecho a mano, pero con el mismo estilo y los mismos frenos (chequeo + control).

export type Objeto = "nube" | "sol" | "heladera" | "olla" | "sarten" | "bife" | "persona" | "anafe" | "termometro" | "vaso" | "barrio" | "auto" | "ninguno";
export type EscenaB = {
  tipo: "gancho" | "golpe" | "objeto" | "dato" | "comparacion" | "ojo" | "cta";
  etiqueta?: string;
  titulo?: string;
  respuesta?: string;
  sello?: string;
  objeto?: Objeto;
  rotulo?: string;
  numero?: number;
  antes?: string;
  despues?: string;
  texto?: string;
  izquierda?: string;
  derecha?: string;
  globo?: string;
  fuente?: string;
};
export type PropsPlantilla = {
  slug: string;
  escenas: EscenaB[];
  tiempos?: Tiempos;
  portada?: { arriba: string; grande: string; sello: string; objeto?: Objeto; numero?: number };
};

const FPS = 30;

export const calcularPlantilla: CalculateMetadataFunction<PropsPlantilla> = async ({ props }) => {
  const tiempos: Tiempos = props.tiempos ?? (await (await fetch(staticFile(`${props.slug}/tiempos.json`))).json());
  const r = reloj(tiempos, FPS);
  const sello = r.fin(tiempos.frases.length - 1) + 2;
  return { durationInFrames: sello + DUR_SELLO_FINAL, fps: FPS, props: { ...props, tiempos } };
};

/** Dibuja un objeto de la biblioteca en su lugar estándar (centro de la pantalla). `k` 0→1 lo hace aparecer. */
const Dibujo: React.FC<{ o?: Objeto; t: number; arriba?: boolean; k?: number }> = ({ o = "ninguno", t, arriba = false, k = 1 }) => {
  const dy = arriba ? -180 : 0;
  const s = 0.5 + 0.5 * k;
  const g = (hijo: React.ReactNode, x: number, y: number) => (
    <g style={{ scale: s, transformOrigin: `${x}px ${y + dy}px` }} opacity={Math.min(1, k * 2)} transform={`translate(0 ${dy})`}>{hijo}</g>
  );
  switch (o) {
    case "nube": return g(<Nube x={540} y={1200} s={1.4} t={t} />, 540, 1120);
    case "sol": return g(<Sol x={540} y={1060} s={1.25} t={t} />, 540, 1060);
    case "heladera": return g(<Heladera x={540} y={1380} s={1.1} abierta={interpolate(t, [20, 50], [0, 0.8], clamp)} t={t} />, 540, 1150);
    case "olla": return g(<Olla x={540} y={1330} s={1.3} t={t} />, 540, 1200);
    case "sarten": return g(<Sarten x={460} y={1180} s={1.3}><Bife x={0} y={0} s={0.7} coccion={interpolate(t, [0, 90], [0.2, 0.8], clamp)} marcas={t > 40} /></Sarten>, 540, 1180);
    case "bife": return g(<Bife x={540} y={1120} s={1.6} coccion={interpolate(t, [0, 90], [0, 0.7], clamp)} />, 540, 1120);
    case "persona": return g(<Persona x={540} y={1420} s={1.3} t={t} gesto="pensando" />, 540, 1200);
    case "anafe": return g(<Anafe x={540} y={1330} s={1.5} t={t} fuego={[1, 0.7]} />, 540, 1250);
    case "termometro": return g(<Termometro x={540} y={1400} s={1.15} valor={interpolate(t, [10, 40], [0.2, 0.75], clamp)} />, 540, 1150);
    case "vaso": return g(<Vaso x={540} y={1360} s={1.7} hielo={2} gotas t={t} />, 540, 1200);
    case "barrio": return g(<g><Barrio suelo={1380} t={t} /><rect x={-20} y={1380} width={1120} height={40} fill={C.verde} stroke={C.tinta} strokeWidth={7} /></g>, 540, 1300);
    case "auto": return g(<Auto x={540} y={1300} s={1.5} t={t} anda />, 540, 1220);
    default: return null;
  }
};

/** Partículas de fondo muy suaves: siempre hay algo moviéndose. */
const Ambiente: React.FC<{ t: number; color?: string }> = ({ t, color = C.azul }) => (
  <Flujo x0={80} x1={1000} yAbajo={1600} yArriba={300} n={12} velocidad={0.35} color={color} tam={7} t={t} opacidad={0.18} ondula={30} />
);

const Tarjeta: React.FC<{ x: number; y: number; w: number; color: string; titulo: string; texto: string; desde: number; tachar?: number }> = ({
  x, y, w, color, titulo, texto, desde, tachar,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < desde) return null;
  const r = resorte(frame, fps, desde, 300);
  const tacha = tachar !== undefined ? suave(frame, tachar, 10) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, scale: r, rotate: tachar !== undefined ? "-2deg" : "2deg" }}>
      <div style={{ background: C.blanco, border: `6px solid ${C.tinta}`, borderRadius: 26, boxShadow: sombra(9), overflow: "hidden" }}>
        <div style={{ background: color, color: C.blanco, fontFamily: mono, fontWeight: 700, fontSize: 30, padding: "12px 20px", borderBottom: `6px solid ${C.tinta}`, textTransform: "uppercase", letterSpacing: 2 }}>
          {titulo}
        </div>
        <div style={{ position: "relative", fontFamily: display, fontWeight: 800, fontSize: 50, lineHeight: 1.08, color: C.tinta, padding: "22px 24px 26px" }}>
          {texto}
          {tacha > 0 ? <div style={{ position: "absolute", left: 18, top: "52%", height: 10, width: `${tacha * 92}%`, background: C.rojo, borderRadius: 5, rotate: "-4deg" }} /> : null}
        </div>
      </div>
    </div>
  );
};

const UnaEscena: React.FC<{ e: EscenaB; i: number; tiempos: Tiempos; inicio: number; dur: number }> = ({ e, i, tiempos, inicio, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = resorte(frame, fps, 2, 220);
  const mitad = Math.round(dur * 0.4);
  const conObjeto = e.objeto && e.objeto !== "ninguno";
  return (
    <Escena entrada={i > 0} empuje={0.04}>
      <Lienzo><Ambiente t={frame + inicio} color={e.tipo === "ojo" ? C.amarillo : C.azul} /></Lienzo>
      {e.etiqueta && e.tipo !== "ojo" ? <Etiqueta texto={e.etiqueta} color={e.tipo === "golpe" ? C.verde : C.azul} /> : null}

      {e.tipo === "gancho" ? (
        <>
          <TituloHablado tiempos={tiempos} frase={i} desde={inicio} top={420} tam={60} />
          <Lienzo><Dibujo o={e.objeto} t={frame} k={k} /></Lienzo>
          {e.sello ? <Sello texto={e.sello} desde={mitad} x={140} y={760} rot={-8} color={C.rojo} tam={60} /> : null}
        </>
      ) : null}

      {e.tipo === "golpe" ? (
        <>
          <Titulo pregunta={e.titulo} desdeP={0} respuesta={e.respuesta} desdeR={Math.min(mitad, 20)} top={420} tamR={120} />
          <Lienzo><Dibujo o={e.objeto} t={frame} k={k} /></Lienzo>
          {e.sello ? <Sello texto={e.sello} desde={Math.min(mitad, 20) + 6} x={600} y={820} rot={8} color={C.rojo} tam={58} /> : null}
        </>
      ) : null}

      {e.tipo === "objeto" ? (
        <>
          {e.titulo ? <Titulo pregunta={e.titulo} desdeP={0} top={420} /> : null}
          <Lienzo><Dibujo o={e.objeto} t={frame} k={k} /></Lienzo>
          {e.rotulo ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center" }}>
              <div style={{ scale: resorte(frame, fps, 10, 320), background: C.amarillo, border: `5px solid ${C.tinta}`, borderRadius: 16, boxShadow: sombra(7),
                padding: "10px 24px", fontFamily: display, fontWeight: 800, fontSize: 52, color: C.tinta, maxWidth: 900, textAlign: "center", rotate: "-2deg" }}>
                {e.rotulo}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {e.tipo === "dato" ? (
        <>
          <Contador hasta={e.numero ?? 0} antes={e.antes ?? ""} despues={e.despues ?? ""} desde={4} dur={22} x={540} y={640} tam={150} etiqueta={e.rotulo} />
          {conObjeto ? <Lienzo><g style={{ scale: 0.8, transformOrigin: "540px 1300px" }}><Dibujo o={e.objeto} t={frame} k={k} /></g></Lienzo> : null}
        </>
      ) : null}

      {e.tipo === "comparacion" ? (
        <>
          <Tarjeta x={70} y={560} w={940} color={C.rojo} titulo="lo que se cree" texto={e.izquierda ?? ""} desde={2} tachar={mitad} />
          <Tarjeta x={70} y={980} w={940} color={C.verde} titulo="lo real" texto={e.derecha ?? ""} desde={mitad + 4} />
        </>
      ) : null}

      {e.tipo === "ojo" ? (
        <>
          <Sello texto="OJO" desde={0} x={430} y={380} rot={-8} color={C.amarillo} tinta={C.tinta} tam={90} />
          <Tarjeta x={90} y={620} w={900} color={C.azul} titulo="el matiz" texto={e.texto ?? ""} desde={6} />
          {conObjeto ? <Lienzo><g style={{ scale: 0.6, transformOrigin: "540px 1400px" }}><Dibujo o={e.objeto} t={frame} k={k} /></g></Lienzo> : null}
        </>
      ) : null}

      {e.tipo === "cta" ? (
        <>
          <Titulo pregunta="mandáselo a ese que…" desdeP={0} top={380} />
          <Lienzo><g style={{ scale: interpolate(k, [0, 1], [0.6, 1]), transformOrigin: "540px 1420px" }}><Persona x={540} y={1420} s={1.25} t={frame} gesto="canchera" mira={1} /></g></Lienzo>
          {e.globo ? <Globo texto={e.globo} desde={12} x={420} y={600} cola="der" tam={42} ancho={520} /> : null}
        </>
      ) : null}

      {e.fuente ? <Fuente texto={e.fuente} /> : null}
    </Escena>
  );
};

export const Plantilla: React.FC<PropsPlantilla> = ({ slug, escenas, tiempos }) => {
  if (!tiempos) return null;
  const r = reloj(tiempos, FPS);
  const n = tiempos.frases.length;
  const sello = r.fin(n - 1) + 2;
  const inicio = (i: number) => r.f(i);
  const fin = (i: number) => (i + 1 < n ? r.f(i + 1) : sello);
  const efectos: Efecto[] = [];
  for (let i = 0; i < n; i++) {
    const e = escenas[i];
    if (i > 0) efectos.push([inicio(i) - 3, "latigo", 0.45]);
    efectos.push([inicio(i) + 2, "pop", 0.4]);
    if (e?.tipo === "dato") efectos.push([inicio(i) + 4, "tic", 0.4], [inicio(i) + 26, "ding", 0.45]);
    if (e?.sello || e?.tipo === "ojo") efectos.push([inicio(i) + Math.round((fin(i) - inicio(i)) * 0.4), "sello", 0.5]);
    if (e?.tipo === "comparacion") efectos.push([inicio(i) + Math.round((fin(i) - inicio(i)) * 0.4), "scratch", 0.45]);
    if (e?.globo) efectos.push([inicio(i) + 12, "burbuja", 0.35]);
  }
  efectos.push([sello, "sello", 0.7], [sello + 6, "ding", 0.4]);
  return (
    <AbsoluteFill style={{ backgroundColor: C.papel }}>
      <Fondo />
      <Sequence from={0} durationInFrames={sello} layout="none" name="Logo"><Logo /></Sequence>
      {tiempos.frases.map((_, i) => (
        <Sequence key={i} name={`${i + 1} · ${escenas[i]?.tipo ?? "?"}`} from={inicio(i)} durationInFrames={Math.max(1, fin(i) - inicio(i))}>
          <UnaEscena e={escenas[i] ?? { tipo: "objeto" }} i={i} tiempos={tiempos} inicio={inicio(i)} dur={fin(i) - inicio(i)} />
        </Sequence>
      ))}
      <Sequence name="sello final" from={sello} durationInFrames={DUR_SELLO_FINAL}><SelloFinal /></Sequence>
      <Subtitulos tiempos={tiempos} hasta={sello} />
      <Audio src={staticFile(`${slug}/voz.wav`)} volume={1} />
      <Musica hasta={sello + DUR_SELLO_FINAL} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

export const PortadaPlantilla: React.FC<PropsPlantilla> = ({ portada }) => (
  <Portada arriba={portada?.arriba ?? ""} grande={portada?.grande ?? ""} sello={portada?.sello ?? "DATO"} colorSello={C.verde} numero={portada?.numero}>
    <Lienzo><g transform="translate(0 40)"><Dibujo o={portada?.objeto} t={20} /></g></Lienzo>
  </Portada>
);

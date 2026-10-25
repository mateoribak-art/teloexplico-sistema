import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { C, display, mono, sombra } from "./marca";
import { clamp, pop, resorte, suave } from "./anim";
import type { Tiempos } from "./tiempos";

/* ---------- Fondo: papel cuadriculado que se desliza muy lento (da vida sin distraer) ---------- */
export const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  const corrimiento = (frame * 0.25) % 60;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.papel,
        backgroundImage: `linear-gradient(${C.cuadricula} 2px, transparent 2px), linear-gradient(90deg, ${C.cuadricula} 2px, transparent 2px)`,
        backgroundSize: "60px 60px",
        backgroundPosition: `${-2 - corrimiento}px ${-2 - corrimiento}px`,
      }}
    />
  );
};

/* ---------- Logo: "te lo explico" + burbuja ---------- */
export const Burbuja: React.FC<{ tam: number; color?: string }> = ({ tam, color = C.azul }) => (
  <svg width={tam} height={tam} viewBox="0 0 40 40" style={{ display: "inline-block" }}>
    <path d="M6 4h28a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H17l-9 7v-7H6a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" fill={color} />
  </svg>
);

export const Logo: React.FC<{ tam?: number; top?: number }> = ({ tam = 50, top = 230 }) => (
  <div
    style={{
      position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center",
      alignItems: "center", gap: tam * 0.12, fontFamily: display, fontWeight: 800, fontSize: tam,
      color: C.tinta, letterSpacing: -tam * 0.02,
    }}
  >
    te lo explico
    <span style={{ translate: `0 ${tam * 0.1}px` }}><Burbuja tam={tam * 0.8} /></span>
  </div>
);

/* ---------- Etiqueta de sección: pastilla azul "// el mito" ---------- */
export const Etiqueta: React.FC<{ texto: string; desde?: number; top?: number; color?: string }> = ({
  texto, desde = 0, top = 318, color = C.azul,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          scale: pop(frame, fps, desde), rotate: "-1.5deg",
          background: color, color: C.blanco, fontFamily: mono, fontWeight: 700, fontSize: 28,
          letterSpacing: 3, textTransform: "uppercase", padding: "10px 20px",
          border: `4px solid ${C.tinta}`, borderRadius: 12, boxShadow: sombra(5),
        }}
      >
        // {texto}
      </div>
    </div>
  );
};

/* ---------- Resaltador amarillo que se dibuja de izquierda a derecha ---------- */
export const Resaltado: React.FC<{ desde: number; children: React.ReactNode; color?: string; dur?: number }> = ({
  desde, children, color = C.amarillo, dur = 9,
}) => {
  const frame = useCurrentFrame();
  const p = suave(frame, desde, dur);
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 0.08em" }}>
      <span
        style={{
          position: "absolute", left: 0, top: "52%", height: "42%", width: `${p * 100}%`,
          background: color, zIndex: 0,
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};

/* ---------- Título en dos tonos: pregunta + respuesta gigante resaltada ---------- */
export const Titulo: React.FC<{
  pregunta?: string; respuesta?: string; desdeP?: number; desdeR?: number;
  top?: number; tamR?: number; resaltar?: boolean;
}> = ({ pregunta, respuesta, desdeP = 0, desdeR = 0, top = 400, tamR = 150, resaltar = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, textAlign: "center", fontFamily: display, color: C.tinta }}>
      {pregunta ? (
        <div
          style={{
            fontWeight: 800, fontSize: 68, lineHeight: 1.05, marginBottom: 14,
            opacity: suave(frame, desdeP, 6), translate: `0 ${(1 - suave(frame, desdeP, 10)) * 30}px`,
          }}
        >
          {pregunta}
        </div>
      ) : null}
      {respuesta && frame >= desdeR ? (
        <div
          style={{
            fontWeight: 800, fontSize: tamR, lineHeight: 1, letterSpacing: -tamR * 0.03,
            rotate: "-2.5deg", scale: interpolate(resorte(frame, fps, desdeR, 260), [0, 1], [1.6, 1]),
            opacity: suave(frame, desdeR, 3),
          }}
        >
          {resaltar ? <Resaltado desde={desdeR + 4}>{respuesta}</Resaltado> : respuesta}
        </div>
      ) : null}
    </div>
  );
};

/* ---------- Sello: cae girado con rebote ("MITO", "POSTA", "OJO") ---------- */
export const Sello: React.FC<{
  texto: string; desde: number; x: number; y: number; color?: string; tinta?: string; rot?: number; tam?: number;
}> = ({ texto, desde, x, y, color = C.rojo, tinta = C.blanco, rot = 10, tam = 56 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < desde) return null;
  const r = resorte(frame, fps, desde, 320);
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, rotate: `${rot}deg`,
        scale: interpolate(r, [0, 1], [2.4, 1]), opacity: interpolate(r, [0, 0.3], [0, 1], clamp),
        background: color, color: tinta, fontFamily: display, fontWeight: 800, fontSize: tam,
        letterSpacing: 2, padding: "8px 26px", border: `5px solid ${C.tinta}`, borderRadius: 18,
        boxShadow: sombra(7), whiteSpace: "nowrap",
      }}
    >
      {texto}
    </div>
  );
};

/* ---------- Subtítulos karaoke: de a 1–3 palabras, la que suena va en pastilla azul ---------- */
type Bloque = { palabras: { texto: string; inicio: number; fin: number }[]; inicio: number; fin: number };

const armarBloques = (t: Tiempos): Bloque[] => {
  const todas = t.frases.flatMap((f) => f.palabras);
  const bloques: Bloque[] = [];
  let actual: Bloque["palabras"] = [];
  const cerrar = () => {
    if (actual.length) bloques.push({ palabras: actual, inicio: actual[0].inicio, fin: actual[actual.length - 1].fin });
    actual = [];
  };
  for (const p of todas) {
    actual.push(p);
    const largo = actual.map((x) => x.texto).join(" ").length;
    if (/[.,:;?!]$/.test(p.texto) || actual.length >= 3 || largo > 16) cerrar();
  }
  cerrar();
  // cada bloque queda en pantalla hasta que empieza el siguiente (máx. 0,6 s de colchón)
  return bloques.map((b, i) => ({ ...b, fin: Math.min(bloques[i + 1]?.inicio ?? b.fin + 0.6, b.fin + 0.6) }));
};

const limpiar = (s: string) => s.replace(/[.,:;]$/, "").replace(/^¿|\?$|^¡|!$/g, "");

export const Subtitulos: React.FC<{ tiempos: Tiempos; top?: number; hasta?: number }> = ({ tiempos, top = 1440, hasta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seg = frame / fps;
  if (hasta !== undefined && frame >= hasta) return null;
  const bloques = armarBloques(tiempos);
  const b = bloques.find((x) => seg >= x.inicio && seg < x.fin);
  if (!b) return null;
  const desde = Math.round(b.inicio * fps);
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          scale: interpolate(resorte(frame, fps, desde, 400), [0, 1], [0.86, 1]),
          background: C.blanco, border: `5px solid ${C.tinta}`, borderRadius: 22, boxShadow: sombra(8),
          padding: "12px 26px", fontFamily: display, fontWeight: 800, fontSize: 64, color: C.tinta,
          display: "flex", gap: 16, whiteSpace: "nowrap",
        }}
      >
        {b.palabras.map((p, i) => {
          const sigue = b.palabras[i + 1]?.inicio ?? b.fin;
          const activa = seg >= p.inicio && seg < sigue;
          // la palabra que suena rebota al entrar
          const salto = activa ? interpolate(resorte(frame, fps, Math.round(p.inicio * fps), 520), [0, 1], [1.12, 1]) : 1;
          return (
            <span
              key={i}
              style={{
                background: activa ? C.azul : "transparent", color: activa ? C.blanco : C.tinta,
                borderRadius: 12, padding: "0 8px", margin: "0 -6px", display: "inline-block", scale: salto,
                rotate: activa ? "-2deg" : "0deg",
              }}
            >
              {limpiar(p.texto).toLowerCase()}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- Fuente del dato ---------- */
export const Fuente: React.FC<{ texto: string; top?: number }> = ({ texto, top = 1575 }) => (
  <div
    style={{
      position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily: mono, fontWeight: 700,
      fontSize: 24, color: C.tinta, opacity: 0.6,
    }}
  >
    fuente: {texto}
  </div>
);

/* ---------- Escena: entra con un pequeño zoom y se va limpia ---------- */
// Entra y sale con un "látigo" lateral desenfocado, y mientras dura la cámara empuja despacio:
// la imagen nunca está quieta, que es lo que mantiene el ojo enganchado.
// `entrada={false}` en la primera escena: el primer cuadro tiene que verse nítido.
export const Escena: React.FC<{ children: React.ReactNode; empuje?: number; entrada?: boolean }> = ({ children, empuje = 0.05, entrada = true }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  const e = entrada ? 6 : 0;
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(frame, [0, d], [1, 1 + empuje], clamp),
        translate: interpolate(frame, [0, Math.max(e, 0.01), d - 4, d], [entrada ? "220px 0px" : "0px 0px", "0px 0px", "0px 0px", "-220px 0px"], clamp),
        filter: `blur(${interpolate(frame, [0, Math.max(e, 0.01), d - 4, d], [entrada ? 14 : 0, 0, 0, 14], clamp)}px)`,
        opacity: interpolate(frame, [0, Math.max(e / 2, 0.01), d - 2, d], [entrada ? 0 : 1, 1, 1, 0], clamp),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ---------- Globo de diálogo: los personajes "hablan" (el chiste de cada escena) ---------- */
export const Globo: React.FC<{
  texto: string; desde: number; x: number; y: number; cola?: "izq" | "der"; tam?: number; color?: string; ancho?: number;
}> = ({ texto, desde, x, y, cola = "izq", tam = 46, color = C.blanco, ancho = 460 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < desde) return null;
  const r = resorte(frame, fps, desde, 300);
  const bamboleo = Math.sin((frame - desde) / 7) * 1.5;
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: ancho, scale: r, rotate: `${bamboleo}deg`,
        transformOrigin: cola === "izq" ? "15% 110%" : "85% 110%",
      }}
    >
      <div
        style={{
          background: color, border: `5px solid ${C.tinta}`, borderRadius: 28, boxShadow: sombra(7),
          padding: "14px 24px", fontFamily: display, fontWeight: 800, fontSize: tam, lineHeight: 1.08,
          color: C.tinta, textAlign: "center", position: "relative",
        }}
      >
        {texto}
        {/* cola del globo */}
        <svg width={60} height={50} viewBox="0 0 60 50"
          style={{ position: "absolute", bottom: -44, [cola === "izq" ? "left" : "right"]: 40, transform: cola === "der" ? "scaleX(-1)" : undefined }}>
          <path d="M2 0 L20 46 L44 0" fill={color} stroke={C.tinta} strokeWidth={5} strokeLinejoin="round" />
          <rect x={6} y={-6} width={34} height={9} fill={color} />
        </svg>
      </div>
    </div>
  );
};

/* ---------- Palabra gigante: el dato clave ocupa la pantalla un instante ---------- */
export const Palabrota: React.FC<{ texto: string; desde: number; hasta: number; top?: number; color?: string; tam?: number }> = ({
  texto, desde, hasta, top = 720, color = C.azul, tam = 230,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < desde || frame >= hasta) return null;
  const r = resorte(frame, fps, desde, 380);
  const sale = interpolate(frame, [hasta - 4, hasta], [1, 0], clamp);
  const sacude = Math.sin((frame - desde) * 2.2) * 8 * Math.max(0, 1 - (frame - desde) / 10);
  return (
    <div
      style={{
        position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily: display, fontWeight: 800,
        fontSize: tam, letterSpacing: -tam * 0.04, lineHeight: 1, color, WebkitTextStroke: `10px ${C.tinta}`,
        paintOrder: "stroke fill", textShadow: `14px 14px 0 ${C.tinta}`,
        scale: interpolate(r, [0, 1], [2.2, 1]) * sale, rotate: `${-4 + sacude}deg`, opacity: Math.min(1, r * 3),
      }}
    >
      {texto}
    </div>
  );
};

/* ---------- Música de fondo: loop alegre, bajito, con fundido al final ---------- */
export const Musica: React.FC<{ hasta: number; volumen?: number }> = ({ hasta, volumen = 0.25 }) => (
  <Audio
    src={staticFile("musica/loop.wav")}
    loop
    volume={(f) => volumen * interpolate(f, [0, 6, hasta - 12, hasta], [0, 1, 1, 0], clamp)}
  />
);

/* ---------- Cierre: logo grande + usuario ---------- */
export const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34, fontFamily: display, color: C.tinta }}>
      <div style={{ scale: pop(frame, fps, 0), display: "flex", alignItems: "center", gap: 18, fontWeight: 800, fontSize: 118, letterSpacing: -3 }}>
        te lo explico <Burbuja tam={100} />
      </div>
      <div
        style={{
          scale: pop(frame, fps, 8), background: C.amarillo, border: `5px solid ${C.tinta}`, borderRadius: 16,
          boxShadow: sombra(7), padding: "8px 28px", fontFamily: mono, fontWeight: 700, fontSize: 44,
        }}
      >
        @teloexplico.ar
      </div>
      <div style={{ opacity: suave(frame, 14, 10), fontWeight: 500, fontSize: 46 }}>un dato por día</div>
    </AbsoluteFill>
  );
};

/* ---------- Efectos de sonido ---------- */
export type Efecto = [
  frame: number,
  nombre: "pop" | "whoosh" | "ding" | "sello" | "tic" | "burbuja" | "error" | "boing" | "scratch" | "fiesta" | "latigo",
  volumen?: number,
];

export const Sfx: React.FC<{ efectos: Efecto[] }> = ({ efectos }) => (
  <>
    {efectos.map(([desde, nombre, vol = 0.45], i) => (
      <Sequence key={i} from={desde} layout="none" name={`sfx ${nombre}`}>
        <Audio src={staticFile(`sfx/${nombre}.wav`)} volume={vol * 0.7} />
      </Sequence>
    ))}
  </>
);

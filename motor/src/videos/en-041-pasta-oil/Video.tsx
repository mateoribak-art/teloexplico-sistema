import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import tiemposJson from "../../../public/en-041-pasta-oil/tiempos.json";
import { reloj, type Tiempos } from "../../kit/tiempos";
import { Musica, Sfx, type Efecto } from "../../kit/piezas";
import { Estudio, PisoSombra } from "../../kit3d/Estudio";
import { Camara, type Toma } from "../../kit3d/camara";
import { ACENTO, Chip, Cierre3D, DUR_CIERRE_3D, Marco3D, Subtitulo3D } from "../../kit3d/textos";
import { Olla, type EstadoOlla } from "../../kit3d/objetos/Olla";
import { Portada } from "../../kit/Portada";
import { C } from "../../kit/marca";

// Mundo: una olla de acero con agua a hervor fuerte (el agua de la pasta).
// Mecanismo: el aceite no evita que se pegue; sí lo evitan el hervor fuerte y revolver al principio. Chips con la regla.

const tiempos = tiemposJson as Tiempos;
export const FPS = 30;
const r = reloj(tiempos, FPS);

const E = {
  gancho: r.f(0),
  mito: r.f(1),
  atk: r.f(2),
  que: r.f(3),
  inicio: r.f(4),
  ojo: r.f(5),
  guardar: r.f(6),
  pregunta: r.f(7),
  cta: r.f(8),
  fin: r.fin(8),
};
export const DURACION = E.fin + 4 + DUR_CIERRE_3D;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const estado = (f: number): EstadoOlla => {
  const hierve = interpolate(f, [E.gancho, E.atk, E.que, E.que + 20, E.ojo], [0.3, 0.5, 0.5, 1, 0.8], clamp);
  const vapor = interpolate(f, [E.gancho, E.que + 20, E.ojo], [0.4, 1, 0.7], clamp);
  return { frame: f, hierve, granos: 0, pila: 0, vapor, tapa: 0, termo: 0, fantasma: 0 };
};

const VISTA: Toma = { f: 0, pos: [0.4, 2.2, 6.4], mira: [0, 1.2, 0], fov: 40 };

const TOMAS: Toma[] = [
  { ...VISTA, f: 0 },
  { f: E.mito, pos: [0.2, 1.8, 5.2], mira: [0, 1.0, 0], fov: 38 },
  { f: E.atk, pos: [1.0, 2.4, 5.6], mira: [0, 1.0, 0], fov: 38 },
  { f: E.que, pos: [0, 2.6, 4.8], mira: [0, 1.0, 0], fov: 38 },
  { f: E.inicio, pos: [-0.8, 2.2, 5.6], mira: [0, 1.1, 0], fov: 38 },
  { f: E.ojo, pos: [0.4, 2.2, 6.4], mira: [0, 1.2, 0], fov: 40 },
  { f: E.guardar, pos: [0, 2.0, 6.8], mira: [0, 1.2, 0], fov: 40 },
  { f: DURACION, pos: [0.4, 2.2, 6.4], mira: [0, 1.2, 0], fov: 40 },
];

const DESTACAR = ["myth", "oil", "hard", "boil", "stirring", "start", "Save", "no"];
const CIFRAS: [string, string][] = [];

const efectos: Efecto[] = [
  [E.gancho + 4, "tic", 0.4],
  [E.mito, "scratch", 0.5],
  [E.atk, "sello", 0.5],
  [E.que, "ding", 0.45],
  [E.inicio, "ding", 0.4],
  [E.ojo, "pop", 0.4],
  [E.guardar, "pop", 0.4],
  [E.pregunta, "pop", 0.4],
];

export const PastaOilEn041: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Estudio>
        <Camara tomas={TOMAS} />
        <Olla e={estado(frame)} />
        <PisoSombra y={0.001} />
      </Estudio>
      <Chip desde={E.gancho + 10} hasta={E.mito} x={540} y={330}>
        oil stops <span style={{ color: ACENTO }}>sticking</span>?
      </Chip>
      <Chip desde={E.mito} hasta={E.atk} x={540} y={330} color="#ff5a4a">
        <span style={{ color: "#ff8a7a" }}>myth</span>
      </Chip>
      <Chip desde={E.atk + 6} hasta={E.que} x={540} y={330}>
        <span style={{ color: ACENTO }}>America's Test Kitchen</span>: oil doesn't help
      </Chip>
      <Chip desde={E.que} hasta={E.inicio} x={540} y={330}>
        <span style={{ color: ACENTO }}>hard boil</span> + stirring
      </Chip>
      <Chip desde={E.inicio} hasta={E.ojo} x={540} y={330}>
        stir at the <span style={{ color: ACENTO }}>start</span>
      </Chip>
      <Chip desde={E.ojo + 6} hasta={E.guardar} x={540} y={330}>
        only about <span style={{ color: ACENTO }}>sticking</span>
      </Chip>
      <Chip desde={E.guardar} hasta={E.pregunta} x={540} y={300}>
        <span style={{ color: "#ff8a7a" }}>no oil</span>
      </Chip>
      <Chip desde={E.guardar + 10} hasta={E.pregunta} x={540} y={400}>
        hard <span style={{ color: ACENTO }}>boil</span>
      </Chip>
      <Chip desde={E.guardar + 20} hasta={E.pregunta} x={540} y={500}>
        stir at the <span style={{ color: ACENTO }}>start</span>
      </Chip>
      <Chip desde={E.pregunta} hasta={E.cta} x={540} y={330} color="#5fd2ff">
        oil in the water? <span style={{ color: "#5fd2ff" }}>yes / no</span>
      </Chip>
      <Subtitulo3D tiempos={tiempos} destacar={DESTACAR} cifras={CIFRAS} />
      <Marco3D total={DURACION} />
      <Cierre3D desde={E.fin + 4} mandar="send this to whoever pours oil in the pot" />
      <Audio src={staticFile("en-041-pasta-oil/voz.wav")} volume={1} />
      <Musica hasta={DURACION} volumen={0.12} />
      <Sfx efectos={efectos} />
    </AbsoluteFill>
  );
};

const TOMA_PORTADA: Toma[] = [{ f: 0, pos: [0.4, 2.4, 5.6], mira: [0, 1.2, 0], fov: 40 }];
export const PortadaEn041: React.FC = () => (
  <Portada arriba="oil in your pasta water?" grande="it doesn't stop sticking" sello="MYTH" colorSello={C.rojo}>
    <Estudio fondo={false}>
      <Camara tomas={TOMA_PORTADA} deriva={0} />
      <Olla e={{ frame: 40, hierve: 1, granos: 0, pila: 0, vapor: 1, tapa: 0, termo: 0, fantasma: 0 }} />
      <PisoSombra y={0.001} opacidad={0.25} />
    </Estudio>
  </Portada>
);

import { useVideoConfig } from "remotion";
import datos from "./series.json";

// Series (27/10/2026): cada video es un capítulo numerado ("Mitos de cocina #3"), para darle a la gente una razón para seguir la cuenta.
// El registro está en series.json (lo escribe herramientas/series.py; también lo leen la cola y los textos).
// La portada y el cierre lo buscan solos con el id de la composición ("h<slug>" / "p<slug>"): los videos no tienen que pasar nada.
export type Capitulo = { clave: string; nombre: string; n: number };

const videos = datos.videos as unknown as Record<string, [string, number]>;
const series = datos.series as Record<string, string>;

export const capituloDe = (slug: string): Capitulo | null => {
  const v = videos[slug];
  return v ? { clave: v[0], nombre: series[v[0]] ?? v[0], n: v[1] } : null;
};

export const useCapitulo = (): Capitulo | null => capituloDe(useVideoConfig().id.replace(/^[hp]/, ""));

import { useVideoConfig } from "remotion";
import datos from "./series.json";
import datosEn from "./series_en.json";
import { slugDe } from "./cuenta";

// Series (27/10/2026): cada video es un capítulo numerado ("Mitos de cocina #3"), para darle a la gente una razón para seguir la cuenta.
// El registro está en series.json (lo escribe herramientas/series.py; también lo leen la cola y los textos).
// @letmeexplain.us tiene el suyo (series_en.json): sus slugs empiezan con "en-" y numeran aparte.
// La portada y el cierre lo buscan solos con el id de la composición ("h<slug>" / "p<slug>"): los videos no tienen que pasar nada.
export type Capitulo = { clave: string; nombre: string; n: number };

type Registro = { series: Record<string, string>; videos: Record<string, [string, number]> };
const registros = [datos, datosEn] as unknown as Registro[];

export const capituloDe = (slug: string): Capitulo | null => {
  const d = registros[slug.startsWith("en-") ? 1 : 0];
  const v = d.videos[slug];
  return v ? { clave: v[0], nombre: d.series[v[0]] ?? v[0], n: v[1] } : null;
};

export const useCapitulo = (): Capitulo | null => capituloDe(slugDe(useVideoConfig().id));

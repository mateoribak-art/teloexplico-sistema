import { useVideoConfig } from "remotion";
import { C } from "./marca";

// Dos cuentas con el mismo motor (27/10/2026): @teloexplico.ar y @letmeexplain.us (EE. UU.).
// La cuenta sale del id de la composición, como la serie: los slugs de inglés empiezan con "en-" ("hen-001-phone-rice"),
// igual que en herramientas/cuenta.py. Los videos no tienen que pasar nada: logo, subtítulos, portada y cierre la buscan solos.
// Marca en inglés (marca/en/): la misma burbuja, roja en vez de azul, y el resaltador celeste en vez de amarillo.
export type Cuenta = {
  clave: "es" | "en";
  nombre: string; // el logo
  usuario: string;
  burbuja: string; // color de la burbuja y de la palabra que suena en los subtítulos
  resaltado: string; // resaltador de la portada y de los cierres
  lema: string;
  fuente: string;
  segui: string;
  paraEl: string;
};

export const CUENTAS: Record<Cuenta["clave"], Cuenta> = {
  es: {
    clave: "es", nombre: "te lo explico", usuario: "@teloexplico.ar", burbuja: C.azul, resaltado: C.amarillo,
    lema: "un dato por día", fuente: "fuente", segui: "seguí", paraEl: "para el",
  },
  en: {
    clave: "en", nombre: "let me explain", usuario: "@letmeexplain.us", burbuja: C.rojo, resaltado: "#7FD3FF",
    lema: "one myth a day", fuente: "source", segui: "follow", paraEl: "for",
  },
};

export const slugDe = (id: string) => id.replace(/^[hp]/, "");
export const cuentaDe = (slug: string): Cuenta => (slug.startsWith("en-") ? CUENTAS.en : CUENTAS.es);
export const useCuenta = (): Cuenta => cuentaDe(slugDe(useVideoConfig().id));

/** "seguí @teloexplico.ar para el #4" / "follow @letmeexplain.us for #4".
 *  En JSX se usa con n = "" y el número aparte ({seguirPara(c, "")}{n}): así el texto queda partido como antes y
 *  los videos de español renderizan idénticos al píxel. */
export const seguirPara = (c: Cuenta, n: number | string) => `${c.segui} ${c.usuario} ${c.paraEl} #${n}`;
/** "seguí @teloexplico.ar · un dato por día" / "follow @letmeexplain.us · one myth a day" */
export const seguirLema = (c: Cuenta) => `${c.segui} ${c.usuario} · ${c.lema}`;

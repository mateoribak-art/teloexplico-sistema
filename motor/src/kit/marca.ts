import { loadFont as cargarBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as cargarMono } from "@remotion/google-fonts/JetBrainsMono";

// Reglas completas en teloexplico/marca/MARCA.md
export const C = {
  papel: "#FFF6E5",
  cuadricula: "#F0E3C8",
  tinta: "#111111",
  azul: "#2E4BFF",
  rojo: "#FF4D2E",
  amarillo: "#FFE14D",
  verde: "#2BD67B",
  blanco: "#FFFFFF",
} as const;

export const display = cargarBricolage("normal", {
  weights: ["500", "800"],
  subsets: ["latin"],
}).fontFamily;

export const mono = cargarMono("normal", {
  weights: ["700"],
  subsets: ["latin"],
}).fontFamily;

export const ANCHO = 1080;
export const ALTO = 1920;
export const FPS = 30;

// contorno y sombra dura de los "stickers"
export const TRAZO = 9;
export const sombra = (d = 10) => `${d}px ${d}px 0 ${C.tinta}`;

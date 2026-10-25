import { Easing, interpolate, spring } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 con rebote (overshoot), empezando en el frame `desde`. */
export const resorte = (frame: number, fps: number, desde: number, rigidez = 180) =>
  spring({ frame: frame - desde, fps, config: { damping: 11, stiffness: rigidez, mass: 0.7 } });

/** 0→1 suave sin rebote. */
export const suave = (frame: number, desde: number, dur: number) =>
  interpolate(frame, [desde, desde + dur], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });

/** Escala de "pop": arranca en 0, se pasa un poco y vuelve a 1. */
export const pop = (frame: number, fps: number, desde: number) =>
  interpolate(resorte(frame, fps, desde), [0, 1], [0, 1]);

/** Sacudón corto (en px), útil para "mala noticia" o un sello que cae. */
export const temblor = (frame: number, desde: number, dur = 10, fuerza = 10) => {
  const t = frame - desde;
  if (t < 0 || t > dur) return 0;
  return Math.sin(t * 2.4) * fuerza * (1 - t / dur);
};

/** Zoom de golpe: 1 → max → 1 en pocos frames. */
export const golpe = (frame: number, desde: number, max = 1.06, dur = 12) =>
  interpolate(frame, [desde, desde + 3, desde + dur], [1, max, 1], clamp);

export const entre = (frame: number, a: number, b: number) => frame >= a && frame < b;

/** Parpadeo: 3 frames con ojos cerrados cada ~2,5–3,5 s (cada personaje con su semilla). */
export const parpadea = (frame: number, semilla = 0) => {
  const ciclo = 78 + (semilla % 5) * 7;
  return (frame + semilla * 17) % ciclo < 3;
};

/** Respiración: squash & stretch suave. Devuelve [escalaX, escalaY]. */
export const respira = (frame: number, semilla = 0, fuerza = 0.025): [number, number] => {
  const s = Math.sin(frame / 9 + semilla) * fuerza;
  return [1 + s, 1 - s];
};

export { clamp };

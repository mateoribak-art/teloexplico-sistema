// Tiempos de voz que genera herramientas/voz.py (public/<slug>/tiempos.json)
export type Palabra = { texto: string; inicio: number; fin: number };
export type Frase = { texto: string; inicio: number; fin: number; palabras: Palabra[] };
export type Tiempos = { duracion: number; frases: Frase[] };

/** Atajos para ubicar cosas en el tiempo de la voz, en frames. */
export const reloj = (t: Tiempos, fps: number) => ({
  /** frame en que empieza la frase i */
  f: (i: number) => Math.round(t.frases[i].inicio * fps),
  /** frame en que termina la frase i */
  fin: (i: number) => Math.round(t.frases[i].fin * fps),
  /** frame en que empieza la palabra j de la frase i */
  p: (i: number, j: number) => Math.round(t.frases[i].palabras[j].inicio * fps),
  /** frame de la primera palabra de la frase i que contiene `texto` */
  w: (i: number, texto: string) => {
    const pal = t.frases[i].palabras.find((x) => x.texto.toLowerCase().includes(texto.toLowerCase()));
    if (!pal) throw new Error(`No está "${texto}" en la frase ${i}`);
    return Math.round(pal.inicio * fps);
  },
});

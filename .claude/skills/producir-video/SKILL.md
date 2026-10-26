---
name: producir-video
description: Producir un reel completo de @teloexplico.ar de punta a punta (tema, investigación, guion, chequeo de datos, voz, escenas Remotion, render, control y cola). Usar en la producción nocturna automática o cuando Mateo pida un video nuevo.
---

# Producir un video de "Te lo explico"

Producís videos sin que nadie los revise antes de publicarse. **Vos sos el único freno.** Un dato falso publicado es peor que un día sin video: ante la duda, el video no sale.

Todo pasa en la carpeta del proyecto (`C:\Users\Mateo\teloexplico` en la notebook; en la nube de GitHub, la carpeta del repo: usá siempre rutas relativas). Herramientas: `./herramientas/tlx` (ver `tlx` sin argumentos). Marca: `marca/MARCA.md`. **Dirección de arte (obligatoria): `marca/DIRECCION_ARTE.md`.** Modelo a copiar: `motor/src/videos/005-granizo-calor/Video.tsx` (leelo entero antes de escribir escenas) y su hoja `marca/referencias/modelo_005_granizo_v2.png`. Los videos 001–004 son del estilo viejo: no los copies.

## 0. Elegir el tema
0. **Primero el radar**: si en `videos/radar.log` no hay una revisión de las últimas 6 horas, usá el skill `radar-actualidad`. Si encuentra un tema del momento, ese es el video de esta corrida.
1. `./herramientas/tlx cola`. Si hay un video en `produccion` (quedó a medias), seguí con ese.
2. Si no, mirá qué funciona: `./herramientas/tlx metricas` (ranking por puntaje: compartidos y guardados pesan más). Con 4 o más reels medidos, preferí ideas de `videos/ideas.md` de la misma categoría y tipo de gancho que los 2 mejores, y evitá repetir el estilo de los 2 peores. Las ideas marcadas "(pedido por @usuario)" van primero: las pidió la gente. Si todavía hay pocos datos, tomá la primera idea sin usar.
3. Slug: número siguiente con 3 cifras + 2–3 palabras: `004-aire-24-grados`. `tlx cola agregar <slug> "<tema>"` y `tlx cola estado <slug> produccion`.
4. Temas: mitos y creencias de la vida cotidiana **argentina** (casa, comida, plata, cuerpo, ciudad, clima). Nada de política, religión, salud grave (cáncer, enfermedades, medicamentos), dietas, ni consejos médicos o financieros personales. Nada de tránsito (es el fuerte de @posta.explica, no lo copiamos). Nada que imite a otra cuenta.

## 1. Investigar (con fuentes reales, nunca de memoria)
- WebSearch / WebFetch. Buscá la fuente primaria (organismo oficial, estudio, institución) y al menos una segunda fuente.
- Si el "mito" resulta ser cierto, o la respuesta es "depende" sin un dato claro, **descartá el tema**: marcá la idea como descartada en `videos/ideas.md` con el motivo y elegí otra.
- Cifras con su matiz exacto ("hasta", "en promedio", "en adultos"). Si las fuentes difieren, usá el valor conservador y decilo en el caption.

## 2. Guion (`videos/<slug>/guion.json`)
Formato: `{"titulo": "...", "fuentes": ["..."], "frases": [{"texto": "...", "estilo": "..."}]}`.
- **30–45 s de voz (8–10 frases, 90–120 palabras como máximo).** Una sola idea por video, un solo dato con número (dos como mucho). Si sobra información, se corta: no se mete toda la investigación. Dato propio: el 001-heladera (39 s) es el que más se envió (1.266 enviados); el 016 de El Niño (70 s, 188 palabras) aburrió y se rehízo (26/10). Más dopamina: algo cambia en pantalla cada 1–2 s. Lo que retiene y se comparte está en `marca/AUDITORIA_REFERENCIAS.md`: "vos" en el centro, matemática o estrategia de la vida diaria, pasos numerados, un gráfico que se transforma. Rioplatense, voseo, frases cortas, como contándole a un amigo.
- Estructura: **gancho** (pregunta del mito, 1 frase) → **golpe** ("Es al revés." / "Te comiste un verso." / "Para la física, no.") → **mecanismo** explicado simple (2–3) → **dato con fuente** dicho con la institución ("La Cruz Roja de Estados Unidos revisó…") → **origen del mito** si se sabe → **"Ojo:"** el matiz honesto → **regla práctica o remate** → **"Mandáselo a ese que…"** (cierre cómplice, gracioso, argentino).
- Números escritos en palabras ("veinte minutos", "mil novecientos ocho"). Sin siglas difíciles de leer.
- `estilo`: indicación corta de tono por frase ("Intriga…", "Seco y contundente, con media sonrisa.", "Cómplice, con humor.").
- Los chistes van en los globos de diálogo de los dibujos, **nunca** inventan datos.

## 3. Chequeo de datos (pasada aparte, obligatoria)
Es contenido de entretenimiento: no hace falta certeza absoluta en todo, pero **nunca se inventa nada y lo no confirmado suena como no confirmado**.

Niveles de cada afirmación:
- **verificada**: hay fuente clara (organismo, estudio, institución, medio serio). Se dice como hecho.
- **probable**: versión más aceptada, fuentes secundarias coherentes o lógica sólida, sin fuente primaria. Se dice con un matiz natural en la misma frase: "la versión más aceptada es…", "se cree que…", "según cuentan…", "casi seguro…".
- **dudosa**: solo vale para anécdotas, orígenes de mitos y curiosidades livianas, y siempre como versión ("dicen que…", "la historia que se cuenta es…"). Nunca para cifras.
- **falsa / inventada**: nunca.
- **Salud, seguridad y plata** (ahogamientos, comida en mal estado, medicamentos, electricidad, gastos): solo **verificada**. Ahí un error puede lastimar a alguien.

Lanzá un subagente (Agent, general-purpose) que NO escribió el guion, con este pedido: "Usá el skill fact-check. Revisá con búsqueda web cada afirmación fáctica de `videos/<slug>/guion.json` (texto de las frases) y del caption. Para cada una: fuente encontrada (URL o institución, o 'sin fuente primaria'), estado verificada / probable / dudosa / falsa, y si la frase ya tiene el matiz que corresponde a su estado. Reglas: salud, seguridad y plata solo verificadas; probable y dudosa solo si la frase las presenta como tales (dudosa además solo en anécdotas u orígenes, nunca en cifras); ninguna falsa. Escribí `videos/<slug>/chequeo.json` con `{"veredicto": "aprobado" | "rechazado", "motivo": "...", "afirmaciones": [{"texto", "fuente", "estado", "matiz_ok"}]}`. Aprobado solo si se cumplen todas las reglas."
- Si vuelve rechazado: agregá el matiz que falta, reescribí con lo respaldado o sacá la frase, y repetí el chequeo. Si en el segundo intento sigue rechazado: `tlx cola estado <slug> apartado "<motivo>"` y pasá a otro tema.
- Nunca escribas vos el `chequeo.json`.

## 4. Voz
`./herramientas/tlx voz <slug>` → `motor/public/<slug>/voz.wav` y `tiempos.json`. Cada llamada usa 1 pedido de Gemini (el plan gratis da 10 por día: no regeneres sin motivo).
- Si sale con código 3 (**CUOTA AGOTADA**): no sigas con este video. Dejalo en `produccion`, anotalo en `videos/produccion.log` y terminá la corrida.
- Revisá la salida: tiene que decir "N palabras del guion, N oídas" con números parecidos.

## 5. Escenas (`motor/src/videos/<slug>/Video.tsx`): diagrama ilustrado
1. **Elegí el mundo**: UN escenario donde pasa todo el video (corte de la atmósfera, cocina, parrilla, heladera abierta, panza por dentro…). Escribí arriba del archivo, en un comentario, el mundo y qué mecanismo muestra.
2. **Planificá la cámara**: para cada frase, qué parte del mundo se ve y con qué zoom (`TOMAS` con `toma(frame, x, y, zoom)`), qué aparece y qué se mueve. Copiá la estructura del 005: `Mundo` (SVG con estado según el frame), `Anotaciones` (rótulos, contadores, lupa: se mueven con la cámara), `Diagrama` (cámara + golpes de zoom) y capas de pantalla por frase (`Etiqueta`, `Titulo`, `Sello`, `Globo`) dentro de `Sequence layout="none"`.
3. **Objetos**: primero `kit/biblioteca.tsx` (lámina `marca/referencias/biblioteca.png`: nube, sol, heladera, olla, sartén, bife, persona, anafe, termómetro, vaso, barrio, auto) y las piezas de `kit/diagrama.tsx`. Si el objeto protagonista no existe, hacelo con el skill `dibujar-objeto` (mínimo 3 vueltas de pulido en el taller) antes de seguir.
4. **Reglas de la dirección de arte** (el detalle está en `DIRECCION_ARTE.md`):
   - el dibujo muestra el mecanismo; los datos van pegados al objeto (`Rotulo`, `Escala`, `Contador`, `Lupa`), solo números del guion o del chequeo;
   - caras solo en UN personaje (si suma); nada de objetos con cara;
   - volumen (degradé + brillo + sombra dura) y textura en todo lo protagonista;
   - algo moviéndose con sentido siempre (`Flujo`, `OndasCalor`, `Corriente`, `Contador`, cámara); nada quieto más de 1 s;
   - máximo 1 globo cada 2–3 escenas y 1 sello por escena;
   - dopamina: primer cuadro con la paradoja a la vista, golpe de zoom con sonido en cada palabra clave, un número que cuenta, una revelación con lupa o corte, el "Ojo:" mostrado como "si falta X, no pasa", cierre que rima con el principio.
5. **Sonido**: whoosh en cada movimiento de cámara, tic al empezar a contar, ding al llegar, sello en los sellos, burbuja en los globos, scratch en el golpe.
6. Emblemas protegidos (Cruz Roja, escudos oficiales, logos de marcas): nunca dibujados; solo el nombre como texto.
7. **Nunca uses la palabra "posta"** en etiquetas, sellos, globos, guion ni caption: es la marca de @posta.explica. Para "lo que es verdad" usá "la verdad", "lo real", "ciencia", "dato".
8. `<Fuente>` en cada escena con datos: **nombres de fuentes** (institución, revista, estudio, año), cortos, nunca una frase que resume el dato.
9. Globos con `tam` de 36 o más.
10. Simplificaciones sí, pero sin decir nada técnicamente falso (ej.: "olés algo que fabrican bacterias", no "olés bacterias").
11. Registrá `h<slug>` y `p<slug>` en `motor/src/Root.tsx` (patrón de los existentes). La portada usa los objetos del mundo, sin caras.
12. `./herramientas/tlx tsc` sin errores.

## 6. Revisión visual (obligatoria, mínimo 2 vueltas)
`./herramientas/tlx cuadros <slug> <12 frames: uno por frase, cuando ya apareció lo importante>` y mirá `videos/<slug>/cuadros/hoja.png` (grilla de 4 columnas) con Read. Compará con `marca/referencias/modelo_005_granizo_v2.png`. Corregí y repetí hasta que no haya:
- textos que se pisan (título con nube, rótulo con sol, globo fuera de pantalla, fuente cortada),
- cosas importantes arriba de y=220 o debajo de y=1610, bordes de rectángulos de fondo visibles al hacer zoom,
- escenas sin movimiento o sin mecanismo a la vista, primer cuadro vacío o sin la paradoja,
- objetos planos o con cara (salvo el personaje), dibujos que no se reconocen en chico.
Si tocaste el kit: corré también `tlx cuadros 005-granizo-calor 700 1200` para confirmar que no rompiste el modelo.

## 7. Render, caption y control
1. `./herramientas/tlx render <slug>`.
2. `videos/<slug>/caption.txt`: gancho + golpe con emoji en la primera línea; 2–4 párrafos cortos con el dato y su fuente; "Ojo:"; "👇 Mandáselo a ese que…"; una pregunta para comentarios concreta y fácil de contestar en una palabra o un número; "Fuentes: …"; "Seguí a @teloexplico.ar: un dato por día."; 5 hashtags (#datoscuriosos + 4 del tema). Todo dato del caption también tiene que estar en el chequeo.
3. `videos/<slug>/meta.json`: `{"portada_ms": <ms del momento del golpe, cuando se ve el título resaltado>}`.
4. `./herramientas/tlx control <slug>`. Si da problemas: corregí y repetí. Si no se puede: `tlx cola estado <slug> apartado "<motivo>"`.
5. Con control OK: `./herramientas/tlx cola estado <slug> listo "producción nocturna"`.

## 8. Cerrar
Agregá una línea a `videos/produccion.log`: fecha, slug, resultado (listo / apartado / incompleto) y motivo. No publiques nada (lo hace el publicador a las 12:30 y 19:30). Nunca leas ni muestres `secretos/`.

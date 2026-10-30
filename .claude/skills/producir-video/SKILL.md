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
2. **Filtro de "mandáselo a…" (30/10, obligatorio antes de investigar):** con los 8 reels medidos, 2 hicieron casi todo el alcance (001-heladera: 98 mil vistas y 3.146 enviados; BTS: 23 mil) y el resto no pasó de 8 mil (carne 3 mil, rayo 1,4 mil, El Niño 0,9 mil). Los que anduvieron tienen un error o una emoción que alguien reconoce en SU gente ("el que guarda la olla caliente", "el que esperó 13 años"); los que no, son un dato correcto sin destinatario. Antes de producir, escribí en `guion.json` (campo `destinatario`) UNA línea: "se lo manda [persona concreta] a [persona concreta] para decirle [qué]". Si no podés llenarla sin forzarla, **descartá la idea**. Formatos que ya probaron: (a) **el error cotidiano de alguien de tu familia**, (b) **actualidad con emoción** de una comunidad (fandom, deporte, música, un fenómeno argentino), (c) **Argentina en datos** con una imagen grande que se entiende en 2 s, con "vos" adentro. Un dato de clima o de cocina solo sale si encaja en (a) o (c). Cada video: el primer cuadro es UNA imagen grande y personal (no un dibujito suelto), y el gancho se entiende sin sonido.
2. Si no, elegí el tema con la **regla de variedad** (30/10, pedido de Mateo: la cuenta NO es de cocina; es de datos y mitos variados que la gente quiera mandar o comentar, con cosas bien argentinas):
   - Mirá las series de los últimos 6 videos (publicados + listos + en producción: `tlx cola`). **Ninguna serie puede ser más de 2 de esos 6**, y **cocina no puede ser más de 1 de cada 5**. Si la serie del próximo tema de `ideas.md` ya está llena, saltá a la primera idea sin usar de otra serie.
   - Al menos **1 de cada 3 videos tiene que ser de la sección "Argentina: lo que nos pasa a todos"** (costumbres, plata cotidiana, ciudad, palabras, deporte, música, historia, tecnología de acá) y no un mito de cocina o de casa.
   - Podés usar `./herramientas/tlx metricas` para elegir el TIPO de gancho (cercano, "vos", mandable, pregunta de identidad), pero **no** para repetir la categoría del más visto: que la heladera haya andado bien no significa que la cuenta sea de comida.
   - Las ideas marcadas "(pedido por @usuario)" van primero: las pidió la gente (pero igual cuentan para el tope de la serie).
3. Slug: número siguiente con 3 cifras + 2–3 palabras: `004-aire-24-grados`. `tlx cola agregar <slug> "<tema>"` y `tlx cola estado <slug> produccion`.
   **Serie (desde el 27/10):** todo video es un capítulo de una serie, salvo los de actualidad pura (BTS, un recital): `./herramientas/tlx serie asignar <slug> <serie>` (series: `argentina`, `costumbres`, `cocina`, `clima`, `casa`, `cuerpo`, `ciencia`, `mate`, `pordentro`; la sección de `ideas.md` dice cuál). `pordentro` es para los 3D de "cómo funciona por dentro" un objeto. La portada y el cierre del reel la toman solos ("seguí @teloexplico.ar para el #4"); no pongas el número a mano en ningún lado. Motivo: 80 mil vistas trajeron 179 seguidores; la serie es la razón para seguir.
4. Temas: la cuenta es de **datos y mitos variados de la vida argentina**, pensados para que se envíen o se comenten (costumbres, ciudad, palabras y modismos, plata cotidiana, deporte, música, historia, tecnología, casa, cuerpo, clima, y también comida, pero no solo ni sobre todo comida). Nada de política, religión, salud grave (cáncer, enfermedades, medicamentos), dietas, ni consejos médicos o financieros personales. Nada de tránsito (es el fuerte de @posta.explica, no lo copiamos). Nada que imite a otra cuenta.

## 1. Investigar (con fuentes reales, nunca de memoria)
- WebSearch / WebFetch. Buscá la fuente primaria (organismo oficial, estudio, institución) y al menos una segunda fuente.
- Si el "mito" resulta ser cierto, o la respuesta es "depende" sin un dato claro, **descartá el tema**: marcá la idea como descartada en `videos/ideas.md` con el motivo y elegí otra.
- Cifras con su matiz exacto ("hasta", "en promedio", "en adultos"). Si las fuentes difieren, usá el valor conservador y decilo en el caption.

## 2. Guion (`videos/<slug>/guion.json`)
Formato: `{"titulo": "...", "fuentes": ["..."], "frases": [{"texto": "...", "estilo": "..."}]}`.
- **30–45 s de voz (8–10 frases, 90–120 palabras como máximo).** Una sola idea por video, un solo dato con número (dos como mucho). Si sobra información, se corta: no se mete toda la investigación. Dato propio: el 001-heladera (39 s) es el que más se envió (1.266 enviados); el 016 de El Niño (70 s, 188 palabras) aburrió y se rehízo (26/10). Más dopamina: algo cambia en pantalla cada 1–2 s. Lo que retiene y se comparte está en `marca/AUDITORIA_REFERENCIAS.md`: "vos" en el centro, matemática o estrategia de la vida diaria, pasos numerados, un gráfico que se transforma. Rioplatense, voseo, frases cortas, como contándole a un amigo.
- Estructura: **gancho** (1 frase en 2.ª persona que desarma algo que el que mira HACE o cree, afirmado, no preguntado: "Estás quemando la yerba y no te das cuenta.", "Frenar en el radar no te salva de la multa.") → **golpe** ("Es al revés." / "Te comiste un verso." / "Para la física, no.") → **mecanismo** explicado simple (2–3) → **dato con fuente** dicho con la institución ("La Cruz Roja de Estados Unidos revisó…") → **origen del mito** si se sabe → **"Ojo:"** el matiz honesto → **consejo para hacer hoy** (concreto, en una frase: "Probá pararte en seco cuando se tensa la correa"; es lo que hace que lo guarden) → **"Mandáselo al que…"** (cierre cómplice, gracioso, argentino, que nombre a una persona reconocible por lo que hace: "al que deja el auto calentando diez minutos"; es lo que hace que lo manden). Nunca cerrar vendiendo algo: los referentes que lo hacen no se comparten (`marca/AUDITORIA_REFERENCIAS.md`, 27/10).
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

## 5. Escenas 3D (OBLIGATORIO para todo video nuevo desde el 27/10/2026, regla de Mateo)
Mateo aprobó el piloto 3D (`020-pava-se-corta`, estilo "ver por dentro"): objeto de la vida diaria en 3D, fondo azul noche, cámara que recorre el mecanismo, piezas que se vuelven transparentes, subtítulo de 1–3 palabras con una en color. **Todo video NUEVO va en 3D** (los 2D que ya estaban listos salen mezclados, 1 3D + 1 2D por día, hasta que todo sea 3D: lo maneja `cola.proximo_listo`; el plan B sigue siendo 2D de emergencia). Objetos y mecanismos: modelados como la pava. Lugares, distancias, tamaños y clima de una región: `Mapa3D`. Cielo, cuerpo, matemática: armá la escena 3D con primitivas del kit (y guardá las piezas nuevas en `motor/src/kit3d/` para reusarlas). Ver "Escenas cine" en `marca/DIRECCION_ARTE.md`.
**Guion que se entienda a la primera** (Mateo, 27/10, sobre la prueba de la hora corrida): una idea concreta que el que mira vive ("¿por qué a las 21 todavía hay luz?"), sin conceptos abstractos ("meridiano", "línea imaginaria") salvo que la imagen los explique sola. **Nada fijo en pantalla todo el video:** cada elemento aparece cuando la voz lo nombra y se va cuando deja de importar.
**Videos 2D apartados con motivo "no es 3D":** si su tema sirve, rehacelo en 3D reusando `guion.json`, `chequeo.json` y la voz (solo cambia `Video.tsx`): es lo más barato que hay. Si el tema no tiene objeto (clima, matemática, el cuerpo por dentro), usá el diagrama 2D de la sección 5b.

**Gastá poco (la cuota de Claude es de Mateo y se agota):** leé solo `motor/src/kit3d/*.tsx` y `motor/src/videos/020-pava-se-corta/Video.tsx` (y `Pava.tsx` solo si tenés que modelar un objeto nuevo); no explores otros videos; no regeneres la voz; no renderices el video entero.
1. **Objeto**: buscá primero en `motor/src/kit3d/objetos/`. Si no está, modelalo con código como `Pava.tsx` (torno `LatheGeometry` para cuerpos redondos —perfil de abajo hacia arriba, si no las normales quedan al revés—, `tubo()` para manijas y caños, cajas redondeadas, materiales `Acero`/`Plastico` con `fantasma` para volverlos transparentes). Guardalo en `motor/src/kit3d/objetos/<Objeto>.tsx` con su tipo de estado, para que el próximo video lo reuse.
2. **Video.tsx** (si el caption ya está escrito, corré `tlx serie textos <slug>` al final): copiá la estructura del 020: `E` (momentos por frase con `r.f`/`r.w`), `TOMAS` (cámara por frase: plano entero → acercarse al mecanismo → volver al plano del principio), `estado(frame)` con `k()` por tramos, `Chip` para el dato con número, `Subtitulo3D` con `DESTACAR` (palabras enteras) y `CIFRAS` (lo que la voz dice en palabras va en números), `Marco3D`, `Cierre3D` con `mandar="mandáselo al que…"` (la última frase del guion, en minúscula y corta: pantalla con el avioncito de compartir), voz, `Musica` a 0,12 y `Sfx`. Nada de `useFrame`: todo sale de `useCurrentFrame()`.
3. Cosas aprendidas: vapor/humo con sprites (ya en el kit), no esferas; en los primeros planos volvé transparentes la base y la caja que tapan el mecanismo; ningún tubo puede terminar delante de la pieza que se muestra (se ve un triángulo); los materiales que cambian de opaco a transparente necesitan la `key` (ya está en `Acero`/`Plastico`).
4. **Portada** `Portada<NNN>`: el molde `Portada` de siempre (franja con número, `arriba`, `grande`, `sello`) con el objeto 3D adentro en `<Estudio fondo={false}>`, como `Portada020`.
5. Registrá `h<slug>` y `p<slug>` en `Root.tsx` y corré `./herramientas/tlx tsc`.

## 5b. Escenas 2D: NO se producen más (27/10/2026). Los 2D ya listos se publican mezclados con los 3D. Queda como referencia de ritmo y dopamina
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

## 6. Revisión visual
**3D:** `./herramientas/tlx cuadros <slug> <8 frames: gancho, mecanismo, primer plano, golpe, dato, ojo, cierre…>` y mirá la hoja. **Máximo 2 vueltas.** Revisá: el mecanismo se ve y no lo tapa otra pieza, nada importante debajo de y=1350 (ahí van los subtítulos), el objeto se reconoce, no hay artefactos. Después seguí con la sección 7 (3D).

**2D (mínimo 2 vueltas):**
`./herramientas/tlx cuadros <slug> <12 frames: uno por frase, cuando ya apareció lo importante>` y mirá `videos/<slug>/cuadros/hoja.png` (grilla de 4 columnas) con Read. Compará con `marca/referencias/modelo_005_granizo_v2.png`. Corregí y repetí hasta que no haya:
- textos que se pisan (título con nube, rótulo con sol, globo fuera de pantalla, fuente cortada),
- cosas importantes arriba de y=220 o debajo de y=1610, bordes de rectángulos de fondo visibles al hacer zoom,
- escenas sin movimiento o sin mecanismo a la vista, primer cuadro vacío o sin la paradoja,
- objetos planos o con cara (salvo el personaje), dibujos que no se reconocen en chico.
Si tocaste el kit: corré también `tlx cuadros 005-granizo-calor 700 1200` para confirmar que no rompiste el modelo.

## 7. Render, caption y control
**3D: no renderices.** Escribí `caption.txt` y `meta.json` (puntos 2 y 3) y marcá `./herramientas/tlx cola estado <slug> render "escenas 3D listas"`. Al terminar tu turno, `producir.py` lo renderiza (unos 20 min por software en la nube), saca la portada, corre el control y lo pasa a `listo` o a `apartado` sin usar Claude.

**2D:**
1. `./herramientas/tlx render <slug>`.
2. `videos/<slug>/caption.txt`: gancho + golpe con emoji en la primera línea; 2–4 párrafos cortos con el dato y su fuente; "Ojo:"; "👇 Mandáselo a ese que…"; una pregunta para comentarios concreta y fácil de contestar en una palabra o un número, de identidad si se puede ("¿desde qué provincia nos ves?", "¿cuántos mates te tomás por día?": la de @miravosarg juntó 1.654 comentarios); "Fuentes: …"; el renglón de la serie (lo escribe `tlx serie textos <slug>`: "📚 Mitos de cocina #3 · Seguí a @teloexplico.ar para no perderte el #4."; si el video no es de ninguna serie, "Seguí a @teloexplico.ar: un dato por día."); 5 hashtags (#datoscuriosos + 4 del tema). Todo dato del caption también tiene que estar en el chequeo.
3. `videos/<slug>/meta.json`: `{"portada_ms": <ms del momento del golpe, cuando se ve el título resaltado>}`.
4. `./herramientas/tlx control <slug>`. Si da problemas: corregí y repetí. Si no se puede: `tlx cola estado <slug> apartado "<motivo>"`.
5. Con control OK: `./herramientas/tlx cola estado <slug> listo "producción nocturna"`.

## 8. Cerrar
Agregá una línea a `videos/produccion.log`: fecha, slug, resultado (listo / apartado / incompleto) y motivo. No publiques nada (lo hace el publicador a las 12:30 y 19:30). Nunca leas ni muestres `secretos/`.

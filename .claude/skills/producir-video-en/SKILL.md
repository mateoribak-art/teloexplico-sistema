---
name: producir-video-en
description: Producir un reel completo de @letmeexplain.us, la cuenta en inglés para EE. UU. (adaptar un video que funcionó en @teloexplico.ar o hacer uno propio de EE. UU.), de punta a punta hasta dejarlo listo en su cola. Usar en la producción automática con TLX_CUENTA=en o cuando Mateo pida un video en inglés.
---

# Producir un video de "Let me explain" (@letmeexplain.us)

**Primero leé el skill `producir-video` entero (`.claude/skills/producir-video/SKILL.md`): todas sus reglas valen acá** (veracidad, chequeo con un subagente aparte, dirección de arte, **todo video nuevo en 3D** (regla de Mateo, 27/10), revisión de cuadros, render, control, nunca "posta"). Acá está solo lo que cambia para la cuenta en inglés.
Vos sos el único freno: un dato falso publicado es peor que un día sin video.

## Cuenta, carpetas y comandos
- La corrida ya tiene `TLX_CUENTA=en`: `./herramientas/tlx cola`, `tlx serie`, `tlx metricas` y `tlx comentarios` son de esta cuenta. **No escribas `TLX_CUENTA=…` en los comandos** (se negarían): usalos tal cual.
- Slug: `en-NNN-dos-tres-palabras` en inglés, con el número siguiente de esta cuenta (mirá `tlx cola`; el piloto es `en-001-phone-rice`). `tlx cola agregar` rechaza los slugs sin `en-`.
- Donde el skill base dice `videos/<slug>/`, acá es **`videos/en/<slug>/`** (guion.json, caption.txt, chequeo.json, meta.json). Logs: `videos/en/produccion.log` y `videos/en/radar.log`. Ideas: `videos/en/ideas.md`.
- Motor igual que siempre: `motor/src/videos/<slug>/Video.tsx`, voz en `motor/public/<slug>/`. En `Root.tsx`, las composiciones `h<slug>` y `p<slug>` van dentro de `<Folder name="en">`.
- **No hace falta poner la marca a mano**: el logo "let me explain", la burbuja roja, el resaltado celeste, "source:" y el cierre "follow @letmeexplain.us for #N" salen solos del slug (`motor/src/kit/cuenta.ts`).
- Series: mismas claves y nombres en inglés: `cocina` Kitchen myths, `clima` Weather explained, `casa` Home myths, `cuerpo` Body myths, `ciencia` Everyday science, `mate` Everyday math, `pordentro` Inside look. `./herramientas/tlx serie asignar <slug> <clave>`.

## ENGAGEMENT FILTER (11/20/2026, Mateo's request: overrides every other topic rule)
Mateo doesn't want videos people scroll past: **every video must earn a SAVE or a COMMENT.** Our data (11/19): in Spanish only 3 of 46 reels got comments, all others 0; saves come from rules you need again later. In English the best ones (en-009 ceiling fan, en-014 birthday pairs, en-001 phone rice) still got under 5 saves+comments per 1,000 views, and many got 0.
Before researching, write the `interaccion` field in `guion.json` with ONE (or both) of these, and drop the idea if you can't fill it without forcing it:
- **`guardar` (save)**: something the viewer will NEED again and won't remember: a rule with a number (2 hours, 4 hours, 165 °F), a short list (foods dogs can't eat, what not to plug into a power strip), steps, a how-long/how-much table. Shown big on the final "save this" card and repeated as one screenshot-able line in the caption.
- **`comentar` (comment)**: a question EVERYONE can answer from their own life in one word or number, no expertise needed: what their family/state calls it or does, a two-sided non-political debate ("soda or pop?", "do you rinse the chicken?"), belonging to a community (fandom, team, generation, state), or "which one did you spot?". The question is SPOKEN as the second-to-last line (before "send this to…") and also shown on screen and in the caption.
Rules:
- **No standalone "fun facts"** (did you know, records, history or science that changes nothing in your day) unless you find a real save or comment angle.
- **The hook wins or loses in the first 1.5 seconds**: the first thing heard and seen is the viewer's situation or the debate question. No intro, logo or context first.
- End with a save promise ("save this for the next time…") or the question, never with a punchline that asks for nothing.
- Log the chosen `interaccion` in `videos/en/produccion.log`. Every Monday sort `tlx metricas` by (saves + comments) per 1,000 views: repeat the type of idea of the top 3, stop making the type of the bottom 3.

## 0. Elegir el tema (en este orden)
0. **Radar**: si en `videos/en/radar.log` no hay una revisión de las últimas 6 h, usá el skill `radar-actualidad-en`. Si encuentra un tema del momento en EE. UU., ese es el video.
1. `tlx cola`: si hay uno en `produccion`, seguí con ese.
2. Una idea sin hacer en "## Pedidos de Mateo" de `videos/en/ideas.md`.
3. **Adaptar de español con variedad:** no adaptes dos videos seguidos de la misma serie (hoy la cuenta en inglés va 5 de 9 en cocina: corregir).
3. **Alternar**, mirando la última línea de `videos/en/produccion.log`: si el último fue adaptado, ahora uno propio, y al revés. Si en la cola hay 2 o menos listos, adaptado (sale más rápido y gasta menos cuota).
   - **Adaptado**: la primera idea sin usar de "## Adaptar de Te lo explico" (están ordenadas por cómo rindieron en español; `./herramientas/tlx metricas-es` muestra el ranking actual de @teloexplico.ar: si uno de más abajo ya rindió mucho mejor, subilo).
   - **Propio**: de las secciones "## Temas de EE. UU.". **Regla de variedad (30/10, pedido de Mateo):** de los últimos 6 videos (publicados + listos), ninguna serie puede ser más de 2 y cocina no más de 1 de cada 5; si la serie del turno está llena, saltá a otra. Podés usar `tlx metricas` para elegir el TIPO de gancho, no para repetir la categoría del más visto. Si no hay conflicto, la primera idea de la serie que hace más que no sale. Lo que tenga fecha (Thanksgiving, el cambio de hora, Halloween) va antes de su fecha o se descarta.
4. Temas: vida cotidiana en **EE. UU.** (casa, cocina, clima, cuerpo, plata del día a día, ciencia). Nada de política (partidos, elecciones, inmigración, armas, aborto), religión, salud grave, dietas ni consejos médicos o financieros personales. Nada que imite a otra cuenta.

## Adaptar un video de Te lo explico (adaptar, no traducir)
1. Leé `videos/<slug-es>/guion.json`, `caption.txt` y `chequeo.json`, y `motor/src/videos/<slug-es>/Video.tsx`.
2. **Investigá de nuevo con fuentes de EE. UU.** (USDA/FSIS, FDA, CDC, NWS/NOAA, DOE, EPA, Consumer Reports, America's Test Kitchen; fabricantes para aparatos). Los datos pueden cambiar de país a país: la regla de la heladera allá es 40 °F y 2 horas. Si el dato no se sostiene para EE. UU., descartá la adaptación en `videos/en/ideas.md` con el motivo y tomá la siguiente.
3. Guion nuevo en inglés de EE. UU.: mismo mecanismo y misma estructura, **30–45 s (90–120 palabras)**. Unidades de allá (°F, lb, oz, miles, $) y costumbres de allá: nada de mate, asado, pava, yerba ni "la heladera de la abuela"; sí leftovers, the grill, Thanksgiving, the thermostat.
4. **Escena 3D obligatoria.** Preferí adaptar originales que ya son 3D (usan `kit3d`, por ejemplo `020-pava-se-corta`). Si el original es 2D, NO copies su `Video.tsx`: armá la escena en 3D con el kit (`motor/src/kit3d/`: objetos, `Mapa3D`, `Estudio`, `Camara`) contando el mismo mecanismo, como en la sección 5 del skill base. Si el original es 3D, copialo a `motor/src/videos/<slug>/Video.tsx` y adaptalo:
   - import de tiempos `../../../public/<slug>/tiempos.json` y audio `staticFile("<slug>/voz.wav")`; nombres nuevos de los componentes (`…En002`, `PortadaEn002`);
   - **todo texto en pantalla en inglés** (etiquetas, rótulos, globos, sellos, pasos, contadores, `mandar` del cierre, portada) y los números con las unidades del guion nuevo;
   - las anclas `r.w(i, "palabra")` con palabras del guion en inglés y los índices de frase corregidos si cambió la cantidad de frases (un ancla que no existe rompe el render: `tlx tsc` no lo ve, `tlx cuadros` sí);
   - el mismo dibujo y la misma cámara; si una escena no tiene equivalente allá, sacala o simplificala.
   - **Ejemplo completo**: `motor/src/videos/en-001-phone-rice/Video.tsx` es la adaptación de `014-celular-arroz` (una frase menos, textos en inglés, anclas nuevas).
5. Después, igual que siempre: chequeo con subagente, voz, cuadros, y como en el base para 3D: estado `render` y lo renderiza `producir.py`.

## Guion en inglés
- La misma estructura que en español: **hook** en 2.ª persona que desarma algo que el que mira hace o cree, afirmado ("You've been letting your leftovers cool on the counter.") → **golpe** ("That's backwards." / "That's a myth.") → mecanismo simple → **dato con la institución** ("The USDA says…") → **"Heads up:"** el matiz honesto → consejo para hoy → **"Send this to the friend who…"** (alguien reconocible en EE. UU. por lo que hace, con humor: "…who leaves the pot on the stove overnight").
- Inglés norteamericano natural: contracciones, frases cortas, como hablándole a un amigo. Nada de spelling británico.
- Números en palabras en el guion ("forty degrees", "two hours"); en pantalla, en cifras.
- `estilo` de cada frase en inglés ("Dry and punchy, with a half smile."); la voz ya le suma el ritmo.

## Chequeo de datos
El mismo subagente y las mismas reglas del skill base (copiá su pedido), con la ruta `videos/en/<slug>/` y este agregado: "priorizá fuentes de EE. UU. y confirmá que las unidades (°F, lb, miles) y las cifras convertidas coincidan con la fuente". El `chequeo.json` puede quedar en español.

## Caption (`videos/en/<slug>/caption.txt`)
- Primera línea: gancho + respuesta con un emoji. 2–4 párrafos cortos con el dato y su fuente. "Heads up:" con el matiz. "👇 Send this to the friend who…". Una pregunta para comentarios que se conteste en una palabra o un número ("Yes or no?", "How many hours do you wait?"). "Sources: …".
- El renglón de la serie lo escribe `./herramientas/tlx serie textos <slug>` ("📚 Kitchen myths #2 · Follow @letmeexplain.us so you don’t miss #3.").
- 5 hashtags al final: `#funfacts #mythbusting #lifehacks` + 2 del tema (de actualidad: el que se esté usando).
- Todo número del caption tiene que estar en el chequeo.

## Cerrar
- Línea en `videos/en/produccion.log`: fecha, slug, tipo (`adaptado de <slug-es>` / `propio` / `actualidad`) y resultado (listo / apartado / incompleto, con el motivo). El paso 0.3 la usa para alternar.
- Marcá la idea en `videos/en/ideas.md` (`[usada → <slug>]`).
- No publiques nada: lo hace el publicador a las 11:30 y 19:00 de Nueva York. Nunca leas ni muestres `secretos/`.

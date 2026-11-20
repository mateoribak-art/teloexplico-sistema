---
name: radar-actualidad
description: Detectar el tema del momento en Argentina que la cuenta @teloexplico.ar puede explicar (clima, fenómenos, cosas que todos están viviendo o comentando) y, si hay uno bueno, producir el video con prioridad para que salga el mismo día. Usar al principio de cada producción y en el chequeo de media mañana.
---

# Radar de actualidad

El video que hizo explotar a @posta.explica (118 mil me gusta) fue "¿por qué llueve tanto? No es culpa de El Niño" en una semana de lluvia sin parar en Buenos Aires. La fórmula: **algo que todos están viviendo hoy + una pregunta que todos se hacen + una respuesta que nadie les dio bien**. Ese es el único tipo de tema que buscás acá.


**Filtro de interacción (20/11, Mateo):** un tema del momento solo se elige si tiene un ángulo para GUARDAR (regla, lista, qué hacer) o para COMENTAR (pregunta que todos contestan desde su vida, debate de dos bandos sin política, pertenencia). Si es solo noticia o dato curioso, se descarta aunque sea tendencia. Ver "FILTRO DE INTERACCIÓN" en producir-video.

## 1. Mirar qué está pasando (10 minutos, no más)
Con WebSearch / WebFetch, en las últimas 48 h:
- Alertas y pronóstico del Servicio Meteorológico Nacional (smn.gob.ar): calor extremo, tormentas, granizo, viento zonda, niebla, humo, frío fuera de época.
- Portadas de Infobae, Clarín, La Nación, TN, Página/12, Perfil: lo que más se comenta de la vida diaria.
- Lo que es tendencia en Argentina (Google Trends AR, temas virales en redes).
- Fechas cercanas: cambios de estación, feriados largos, eclipses, lluvias de estrellas, superluna, inicio de clases, fiestas, el aguinaldo.

## 2. ¿Sirve? (tiene que cumplir todo)
- **Lo vive o lo comenta mucha gente en Argentina hoy** (no un tema de nicho ni de otro país).
- Tiene un **"¿por qué…?" o un "¿es verdad que…?"** que se responde con ciencia, datos o historia en 40 segundos.
- Se puede chequear con fuentes reales hoy mismo (SMN, organismos, estudios, medios serios).
- Hay un ángulo con giro ("no es por lo que creés", "el culpable es otro", "es al revés") o un dato que sorprende.
- **No es**: tragedia con víctimas, delito, pelea política partidaria, chisme de famosos, ni algo que ya pasó hace más de 3 días.
- Salud y plata solo si los datos están verificados (criterio de veracidad del skill `producir-video`).
- No está ya en la cola (`./herramientas/tlx cola`, los 🔥 son de actualidad).

**Si otra cuenta ya hizo ese tema** (por ejemplo, posta explicó la lluvia con El Niño): el tema sigue siendo bueno si la gente lo sigue viviendo; lo que no se copia es el ángulo. Buscá otro "¿por qué?" del mismo fenómeno (lluvia: por qué huele a lluvia, por qué se inundan siempre las mismas calles, por qué el paraguas se da vuelta, cuánta agua cayó comparada con algo cotidiano). Solo descartalo si no encontrás un ángulo propio con giro.
**Temas regionales grandes** (nieve en Mendoza, calor récord en el norte) sirven si son noticia nacional y el gancho funciona para cualquiera ("¿nieve en primavera?").

Si ningún tema cumple todo: anotá en `videos/radar.log` la fecha, los 2–3 candidatos que miraste y por qué no, y terminá. **No fuerces un tema flojo**: un video de actualidad mediocre rinde menos que uno común bueno.

## 3. Si hay tema: producirlo ya
1. Slug con el número siguiente + palabras del tema (ej. `012-por-que-llueve-tanto`).
2. `./herramientas/tlx cola agregar <slug> "<tema>" --actualidad` (pasa adelante en la cola, vence a las 48 h y le avisa a Mateo).
3. `./herramientas/tlx cola estado <slug> produccion`.
4. Seguí el skill `producir-video` desde el paso 1 (investigar) con estos cambios:
   - El gancho nombra lo que está pasando con palabras de la calle ("¿Hace una semana que no para de llover?", "¿Sentiste el calor de ayer?").
   - En el guion decí cuándo es ("esta semana", "este fin de semana"), nunca una fecha que pueda envejecer mal dentro de las 48 h.
   - En el caption, la primera línea es el tema del momento; un hashtag del tema que se esté usando.
   - Las cifras del momento (milímetros de lluvia, temperatura récord) solo de fuentes oficiales del día (SMN, organismos).
5. Anotá en `videos/radar.log`: fecha, tema elegido, por qué, y el slug.

---
name: radar-actualidad-en
description: Detectar el tema del momento en EE. UU. que @letmeexplain.us puede explicar (clima, fenómenos, fechas, algo viral que todos comentan) y, si hay uno bueno, producirlo con prioridad para que salga el mismo día. Usar al principio de cada producción en inglés y en el chequeo de la mañana.
---

# Radar de actualidad de EE. UU.

Mismo criterio que el skill `radar-actualidad` (leelo: sección 2, "¿Sirve?", y la parte de no copiar el ángulo de otra cuenta). La fórmula: **algo que mucha gente en EE. UU. está viviendo hoy + una pregunta que todos se hacen + una respuesta que nadie les dio bien.**
La corrida ya tiene `TLX_CUENTA=en`: `tlx cola` es la de esta cuenta.

## 1. Mirar qué está pasando (10 minutos, no más)
Con WebSearch / WebFetch, en las últimas 48 h:
- Clima: alertas y pronósticos del National Weather Service (weather.gov, spc.noaa.gov, nhc.noaa.gov): olas de calor o de frío, tormentas de nieve, huracanes, tornados, humo de incendios, la primera helada, auroras visibles en el norte.
- Lo que más se comenta de la vida diaria en AP, Reuters, CNN, USA Today, NYT y NPR (secciones de clima, ciencia, consumo, "trending").
- Lo que es tendencia en EE. UU.: Google Trends US (Trending now), lo viral en TikTok, Reddit (r/all, r/NoStupidQuestions, r/explainlikeimfive).
- Fechas cercanas: el cambio de hora (fall back el domingo 1/11/2026; spring forward el 14/3/2027), Halloween, Thanksgiving (26/11/2026), Black Friday, la primera nevada, fiestas de fin de año, el Super Bowl, el día de la marmota, eclipses, lluvias de estrellas, superlunas.

## 2. ¿Sirve?
Los mismos filtros del skill `radar-actualidad`, cambiando Argentina por EE. UU.:
- Lo vive o lo comenta mucha gente en EE. UU. hoy (un evento regional grande sirve si es noticia nacional y el gancho funciona para cualquiera).
- Tiene un "why…?" o un "is it true that…?" que se responde con ciencia, datos o historia en 40 segundos, chequeable hoy con fuentes reales (NWS, NOAA, organismos, estudios, medios serios).
- Hay un giro ("it's not what you think", "it's backwards") o un dato que sorprende.
- **No es**: tragedia con víctimas (huracán con muertos: no se explica el huracán ese día), delito, política o elecciones, armas, inmigración, chisme de famosos, ni algo de hace más de 3 días.
- Salud y plata solo con datos verificados. No está ya en la cola (los 🔥 son de actualidad).

Si ningún tema cumple todo: anotá en `videos/en/radar.log` la fecha, los 2–3 candidatos y por qué no, y terminá. No fuerces un tema flojo.

## 3. Si hay tema: producirlo ya
1. Slug `en-NNN-…` con el número siguiente de esta cuenta.
2. `./herramientas/tlx cola agregar <slug> "<tema>" --actualidad` y `./herramientas/tlx cola estado <slug> produccion`.
3. Seguí el skill `producir-video-en` desde "Investigar", con los cambios de actualidad del skill `radar-actualidad` (el gancho nombra lo que está pasando: "Did you feel that cold snap this morning?"; "this week", nunca una fecha que envejezca mal; primera línea del caption con el tema; cifras del momento solo de fuentes oficiales del día).
4. Anotá en `videos/en/radar.log`: fecha, tema elegido, por qué y el slug.

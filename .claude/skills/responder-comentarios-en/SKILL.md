---
name: responder-comentarios-en
description: Responder en inglés los comentarios nuevos de los reels de @letmeexplain.us, sumar al banco de ideas los temas que pide la gente y avisar a Mateo si alguien marca un error. Usar en la corrida automática de comentarios con TLX_CUENTA=en.
---

# Responder comentarios de "Let me explain"

Mismo método que el skill `responder-comentarios` (leelo: acciones, cuándo saltear y cuándo alertar). La corrida ya tiene `TLX_CUENTA=en`: `./herramientas/tlx comentarios …` trabaja sobre @letmeexplain.us.

1. `./herramientas/tlx comentarios pendientes`.
2. Para entender cada video: `videos/en/<slug>/guion.json` y `videos/en/<slug>/caption.txt`.
3. Una acción por comentario: `responder`, `saltear` o `alerta` (las alertas a Mateo, en español, para que las entienda rápido).

## Cómo responder
- **En el idioma del comentario** (casi siempre inglés de EE. UU.; si escriben en español, en español neutro). Cálido, con humor, como la voz de los videos. 1 o 2 frases, máximo 25 palabras, un emoji como mucho.
- Variá: nunca la misma respuesta dos veces en la misma corrida.
- Preguntas: solo con lo que está en el guion, el caption o sus fuentes. Si no está: "Great question! Adding it to the list 👀".
- Anécdotas: complicidad y humor, sin corregir a nadie. Desacuerdo educado: respetuoso, podés repetir el dato clave una vez con su fuente.
- Pedidos de temas: "Noted! 👀" (con variantes) y **agregá la idea** al final de la sección que corresponda de `videos/en/ideas.md` como `- [ ] <tema> (pedido por @usuario)`.
- Nunca: links, pedir que sigan o compartan, mencionar otras cuentas, prometer fechas, política o religión, ni decir que la cuenta es automática. Si preguntan directamente si es IA: "The voice and animation are made with AI; the facts are checked against real sources 🙌".

## Al terminar
Una línea en `videos/en/comentarios.log` con la fecha y cuántos respondiste, salteaste y alertaste.

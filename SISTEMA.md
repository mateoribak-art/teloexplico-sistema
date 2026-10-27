# Cómo funciona @teloexplico.ar en automático

## Dónde corre (desde el 25/10/2026): en la nube de GitHub, no en la notebook
Todo vive en el repo privado **github.com/mateoribak-art/teloexplico-sistema** y corre en GitHub Actions (pestaña *Actions*).
La notebook puede estar apagada o sin internet: solo hace falta para trabajar en sesiones con Claude.
- Los videos terminados (.mp4) están en el Release **"videos"** del repo; Instagram y Facebook los bajan de ahí con un link que vence en minutos.
- Las claves están en los secretos cifrados del repo (*Settings › Secrets*). Para volver a cargarlas: `herramientas/nube/cargar_secretos.cmd`; el token de Claude: `herramientas/nube/conectar_claude.cmd` (dura un año).
- La notebook y la nube comparten el estado con `herramientas/sincronizar.py` (combina la cola sin perder nunca un "publicado").
- Interruptores (variables del repo, *Settings › Variables*): `NUBE_ACTIVA=si` (publicar, resumen, vigilancia) y `CLAUDE_EN_NUBE=si` (producción, radar, comentarios).
  Las tareas de Windows equivalentes quedan **deshabilitadas** para que nada corra dos veces.

## Todos los días, solo
| Hora | Qué pasa | Flujo de GitHub |
|---|---|---|
| 00:30, 06:30, 12:50 y 18:50 | Si hay menos de **10 videos listos** (5 días de colchón), Claude produce hasta 2 nuevos con el estilo de `marca/DIRECCION_ARTE.md`: elige tema, investiga, escribe, **chequea cada dato con fuentes en una pasada aparte**, genera la voz, anima, renderiza y controla. Si Claude no tiene cuota, el próximo turno (6 h después, otra ventana de cuota) lo reintenta; si además quedan 3 o menos listos, arranca el plan B. Si no hay nada que hacer, el turno termina en segundos. | Claude |
| (dentro de cada turno) | **Videos 3D** (estilo desde el 26/10): Claude deja las escenas listas (estado `render`) y termina; después `producir.py` renderiza por software (~20 min, gratis, sin Claude), saca la portada, corre el control y lo pasa a listo. | Claude |
| 10:30 | Radar de actualidad (temas del momento). | Claude |
| 12:30 y 19:30 | Publica el próximo video listo en Instagram, en la página de Facebook y en la bandeja de TikTok. GitHub a veces arranca lo programado tarde o lo saltea (el 25/10 salteó el de las 12:30), así que cada turno tiene **5 intentos** (12:30, 12:47, 13:13, 13:41, 14:09 y lo mismo desde las 19:30): publica el primero que corre y los demás ven el turno cubierto. Además, la vigilancia lanza el publicador si un turno sigue sin cubrir 20 minutos después, y **cron-job.org** (servicio externo gratis, cuenta de Mateo) lo lanza a las 12:31 y 19:31 en punto con un token de GitHub que solo puede lanzar flujos de este repo ("cron-job teloexplico", vence en un año: renovarlo en GitHub › Settings › Fine-grained tokens y pegarlo en cron-job.org › Editar › Avanzado › Authorization). | Publicar |
| 14:30 y 22:00 | Si hay comentarios nuevos, Claude los responde (skill `responder-comentarios`); los pedidos de temas van a `videos/ideas.md`; si alguien marca un error, te avisa al celular sin responder. | Claude |
| 21:05 (reintenta 21:35 y 22:05) | Resumen al celular con seguidores ganados en el día y el mejor reel (lee las métricas). | Resumen y vigilancia |
| cada 2 h de 8 a 24 | Vigilancia: avisa si se perdió un turno, si la cola se vacía o si algo falló. | Resumen y vigilancia |

Para correr algo a mano: *Actions* › elegir el flujo › *Run workflow* (Publicar tiene modo "probar": sube sin publicar).
GitHub puede arrancar los turnos programados entre 5 y 30 minutos tarde: es normal.

## Series (desde el 27/10/2026)
Cada video es un capítulo de una serie: **Mitos de cocina, El clima explicado, Mitos de casa, Mitos del cuerpo, Ciencia cotidiana, Matemática cotidiana y Por dentro** (los 3D).
Motivo: 80 mil vistas trajeron 179 seguidores; la serie le da a la gente una razón para seguir la cuenta.
- El registro está en `motor/src/kit/series.json`. `tlx serie` lo muestra; `tlx serie asignar <slug> <serie>` le da a un video el capítulo siguiente.
- La portada (franja de arriba) y el cierre del reel ("seguí @teloexplico.ar para el #4") lo toman solos; el caption y el texto de TikTok llevan el renglón "📚 Mitos de cocina #3 · Seguí…".
- El publicador respeta el orden: si el próximo de la cola es el #4 de una serie y el #3 todavía no salió, sale primero el #3.
- Los videos producidos antes del 27/10 tienen la serie en la portada y en el caption, pero no en el cierre (sus voces ya no están para volver a renderizarlos).

## Pedidos de Mateo
Una idea sin hacer en la sección "Pedidos de Mateo" de `videos/ideas.md` se produce en el próximo turno **aunque haya 10 listos** (uno por turno).

## Carruseles (a mano, no automáticos)
`motor/src/carruseles/Carrusel.tsx` (texto de cada placa, solo datos ya chequeados) → `python -I herramientas/carrusel.py <clave>` (placas JPG en `videos/carruseles/<clave>/` y `hoja.png`) →
`python -I herramientas/publicar_carrusel.py <clave> --probar` (lo arma en Instagram sin publicar) → sin `--probar`, lo publica. Hechos: `heladera` (8 placas) y `bts` (10).

## TikTok (@teloexplico.ar)
Después de publicar en Instagram, `publicar_tiktok.py` manda el video a la **bandeja de TikTok como borrador** (app "Te lo explico publicador", modo sandbox).
Llega una notificación con el texto listo para pegar: abrir la notificación de TikTok, pegar y publicar (~20 s).
La API no permite publicar directo sin auditoría (sin auditoría todo sale privado). Si la bandeja falla, la notificación vuelve al plan B de OneDrive.
Credenciales: `secretos/tiktok.json` y `secretos/tiktok_token.json` (se renueva solo; si TikTok pide volver a autorizar: `python -I herramientas/publicar_tiktok.py autorizar`).

## YouTube Shorts (@teloexplicoar, sin punto)
Su API deja todo privado hasta aprobar una auditoría. Mientras tanto `multired.py` manda una notificación con el título y la descripción
para pegar; el video se baja de **GitHub › teloexplico-sistema › Releases › videos** (en la notebook, además, se copia a OneDrive › TeLoExplico › para-subir).

## Si Claude se queda sin cuota (límite de la suscripción)
Publicar, Facebook, TikTok, métricas y avisos **no usan Claude**: siguen funcionando siempre.
Producir, el radar y los comentarios sí. Protecciones:
1. **Colchón de 10 videos** (5 días): las publicaciones siguen aunque varios días no se produzca nada.
2. **Cuatro turnos de producción por día** (cada 6 h, más que la ventana de 5 h de la suscripción): si uno choca con el límite, el siguiente cae en otra ventana de cuota.
3. **Plan B sin Claude** (`herramientas/plan_b.py`): si Claude no responde (límite o cualquier error) y quedan 3 videos o menos, Gemini (gratis) escribe el guion
   **solo con lo que dice Wikipedia**, otra pasada de Gemini chequea cada dato con una cita textual que el programa verifica que exista,
   y el video se arma con la plantilla (`motor/src/plantilla`). Solo temas seguros (sección "Ciencia de todos los días" de ideas.md): nada de salud, seguridad ni plata.
   Pasa por el mismo control técnico. Te llega un 🅱️ al celular. Para sumar temas al plan B: agregarlos en esa sección o en una sección "## Plan B".

## Radar de actualidad (temas del momento)
A las 06:30 (dentro de la producción, si sobran videos) y a las 10:30, Claude revisa SMN, diarios y tendencias de Argentina. Si hay algo que todos están viviendo con un "¿por qué?" explicable (clima, fenómenos, algo viral), lo produce en el momento: pasa adelante en la cola (🔥), sale en el próximo turno y vence a las 48 h si no se publicó. Te llega un 🔥 al celular. Excluye tragedias, delitos y política partidaria. Registro: `videos/radar.log`.

## Métricas
`herramientas/tlx metricas` muestra el ranking de reels (alcance, vistas, compartidos, guardados, comentarios, % visto). Se guardan en `videos/metricas.json`. La producción nocturna lo usa para elegir temas parecidos a los que mejor funcionan.

## Frenos automáticos (nada sale si falla alguno)
- Chequeo de datos aprobado (`videos/<slug>/chequeo.json`), hecho por un agente distinto del que escribió el guion. Si un dato no se puede verificar, el video queda **apartado**.
- Control técnico (`tlx control`): formato, duración 20–90 s, volumen, caption, y que la voz diga exactamente el guion.

## Avisos al celular (app ntfy, canal privado: el nombre está en `secretos/avisos.json`)
- ✅ cada publicación, con el link.
- 🌙 resultado de la producción de cada noche.
- 📊 resumen diario a las 21:00: qué salió, seguidores, qué viene, problemas.
- ⚠️ / ❌ cuando algo falla: video apartado, error al publicar, cola vacía, más de 14 h sin publicar, API de Instagram sin respuesta (token), cuota de Gemini agotada, producción que no terminó.
- La vigilancia corre cada 2 horas de 8 a 24 y no repite el mismo aviso.
- Si falla un flujo de GitHub, además del aviso te llega un mail de GitHub.

## Para frenar todo
Lo más rápido: en GitHub, *Settings › Variables*, cambiar `NUBE_ACTIVA` y `CLAUDE_EN_NUBE` a `no` (vuelven con `si`).
También: crear un archivo vacío `PAUSA` en la raíz del repo (desde la notebook, y que se sincronice).

## Para mirar cómo va
- Cola: `videos/cola.json` (o `herramientas/tlx cola`).
- Publicaciones: `videos/publicador.log` y `videos/publicados.json` (con los links).
- Producción de cada noche: `videos/noche_<fecha>.log`.
- Banco de temas: `videos/ideas.md` (se pueden agregar ideas a mano, una por línea con `- [ ]`).

## Si un día no llega el resumen de las 21:00
Mirar *Actions* en el repo: ahí está cada turno con su registro. Ya no depende de la notebook.

## Etiqueta de IA
Todos los reels se publican con `is_ai_generated` (etiqueta "Info de IA" de Instagram) porque la voz es sintética: lo pide la política de Meta y los perfiles que no lo declaran reciben menos recomendaciones.

## Límites a tener en cuenta
- Gemini (voz) plan gratis: **10 pedidos por día**. Cada video usa 1. Con el plan pago (~US$0,02 por video) se saca ese límite.
- La producción nocturna usa el plan de Claude de Mateo.
- Para gastar la menor cuota posible cada tarea usa su modelo (`producir.py`, arriba de todo): producción y radar con **Sonnet**, comentarios con **Haiku** (sin elegir, Claude usaría Opus, el que más gasta). Los renders 3D no usan Claude.
- Trial Reels: Instagram los habilita recién con más seguidores; cuando estén, se suma la estrategia de prueba de hooks.

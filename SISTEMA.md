# Cómo funciona @teloexplico.ar en automático

## Todos los días, solo
| Hora | Qué pasa | Tarea de Windows |
|---|---|---|
| 00:30 y 06:00 | Si hay menos de 6 videos listos (3 días de colchón), Claude produce hasta 2 nuevos con el estilo de `marca/DIRECCION_ARTE.md`: elige tema, investiga, escribe, **chequea cada dato con fuentes en una pasada aparte**, genera la voz, anima, renderiza y controla. Si Claude se quedó sin cuota (límite de la suscripción), lo anota y la otra corrida lo reintenta; las publicaciones siguen saliendo del colchón. | TeLoExplico - Produccion nocturna |
| 12:30 | Publica el próximo video listo en Instagram y en la página de Facebook (`publicar_fb.py`). | TeLoExplico - Publicador |
| 19:30 | Publica el próximo video listo en Instagram y en la página de Facebook. | TeLoExplico - Publicador |
| 14:30 y 22:00 | Si hay comentarios nuevos, Claude los responde (skill `responder-comentarios`); los pedidos de temas van a `videos/ideas.md`; si alguien marca un error, te avisa al celular sin responder. | TeLoExplico - Comentarios |
| 21:00 | Resumen al celular con seguidores ganados en el día y el mejor reel (lee las métricas). | TeLoExplico - Resumen diario |

## TikTok (@teloexplico.ar)
Después de publicar en Instagram, `publicar_tiktok.py` manda el video a la **bandeja de TikTok como borrador** (app "Te lo explico publicador", modo sandbox).
Llega una notificación con el texto listo para pegar: abrir la notificación de TikTok, pegar y publicar (~20 s).
La API no permite publicar directo sin auditoría (sin auditoría todo sale privado). Si la bandeja falla, la notificación vuelve al plan B de OneDrive.
Credenciales: `secretos/tiktok.json` y `secretos/tiktok_token.json` (se renueva solo; si TikTok pide volver a autorizar: `python -I herramientas/publicar_tiktok.py autorizar`).

## YouTube Shorts (@teloexplicoar, sin punto)
Su API deja todo privado hasta aprobar una auditoría. Mientras tanto `multired.py` copia el video, la portada y los textos a
**OneDrive › TeLoExplico › para-subir › <slug>** y manda una notificación con el título y la descripción para pegar.

## Si Claude se queda sin cuota (límite de la suscripción)
Publicar, Facebook, TikTok, métricas y avisos **no usan Claude**: siguen funcionando siempre.
Producir, el radar y los comentarios sí. Protecciones:
1. **Colchón de 6 videos** (3 días): las publicaciones siguen aunque un día no se produzca nada.
2. **Dos corridas por noche** (00:30 y 06:00, separadas más de 5 h): si la primera choca con el límite, la segunda cae en otra ventana de cuota.
3. **Plan B sin Claude** (`herramientas/plan_b.py`): si Claude no tiene cuota y quedan 2 videos o menos, Gemini (gratis) escribe el guion
   **solo con lo que dice Wikipedia**, otra pasada de Gemini chequea cada dato con una cita textual que el programa verifica que exista,
   y el video se arma con la plantilla (`motor/src/plantilla`). Solo temas seguros (sección "Ciencia de todos los días" de ideas.md): nada de salud, seguridad ni plata.
   Pasa por el mismo control técnico. Te llega un 🅱️ al celular. Para sumar temas al plan B: agregarlos en esa sección o en una sección "## Plan B".

## Radar de actualidad (temas del momento)
A las 06:00 (dentro de la producción) y a las 10:30, Claude revisa SMN, diarios y tendencias de Argentina. Si hay algo que todos están viviendo con un "¿por qué?" explicable (clima, fenómenos, algo viral), lo produce en el momento: pasa adelante en la cola (🔥), sale en el próximo turno y vence a las 48 h si no se publicó. Te llega un 🔥 al celular. Excluye tragedias, delitos y política partidaria. Registro: `videos/radar.log`.

## Métricas
`herramientas/tlx metricas` muestra el ranking de reels (alcance, vistas, compartidos, guardados, comentarios, % visto). Se guardan en `videos/metricas.json`. La producción nocturna lo usa para elegir temas parecidos a los que mejor funcionan.

Requisito: la notebook **enchufada y prendida o suspendida** (se despierta sola). Apagada no corre; al prenderla se pone al día.

## Frenos automáticos (nada sale si falla alguno)
- Chequeo de datos aprobado (`videos/<slug>/chequeo.json`), hecho por un agente distinto del que escribió el guion. Si un dato no se puede verificar, el video queda **apartado**.
- Control técnico (`tlx control`): formato, duración 20–90 s, volumen, caption, y que la voz diga exactamente el guion.

## Avisos al celular (app ntfy, canal privado: el nombre está en `secretos/avisos.json`)
- ✅ cada publicación, con el link.
- 🌙 resultado de la producción de cada noche.
- 📊 resumen diario a las 21:00: qué salió, seguidores, qué viene, problemas.
- ⚠️ / ❌ cuando algo falla: video apartado, error al publicar, cola vacía, más de 14 h sin publicar, API de Instagram sin respuesta (token), cuota de Gemini agotada, producción que no terminó.
- La vigilancia corre cada 2 horas de 8 a 24 y no repite el mismo aviso.
- Panel en la PC: `PANEL.html` (doble clic). Se actualiza en cada turno.

## Para frenar todo
Crear un archivo vacío llamado `PAUSA` en `C:\Users\Mateo\teloexplico\`. Se borra para reanudar.

## Para mirar cómo va
- Cola: `videos/cola.json` (o `herramientas/tlx cola`).
- Publicaciones: `videos/publicador.log` y `videos/publicados.json` (con los links).
- Producción de cada noche: `videos/noche_<fecha>.log`.
- Banco de temas: `videos/ideas.md` (se pueden agregar ideas a mano, una por línea con `- [ ]`).

## Si un día no llega el resumen de las 21:00
Es la señal de que la notebook estuvo apagada, sin sesión iniciada o sin internet: una PC caída no puede avisar sola. Prenderla y entrar a la sesión pone todo al día (las tareas atrasadas corren solas).

## Condiciones de la PC
- Enchufada: las tareas la despiertan de la suspensión (temporizadores de activación habilitados con corriente; con batería no).
- Con la sesión de Windows iniciada (bloqueada está bien). Después de un reinicio, entrar a la sesión.

## Etiqueta de IA
Todos los reels se publican con `is_ai_generated` (etiqueta "Info de IA" de Instagram) porque la voz es sintética: lo pide la política de Meta y los perfiles que no lo declaran reciben menos recomendaciones.

## Límites a tener en cuenta
- Gemini (voz) plan gratis: **10 pedidos por día**. Cada video usa 1. Con el plan pago (~US$0,02 por video) se saca ese límite.
- La producción nocturna usa el plan de Claude de Mateo.
- Trial Reels: Instagram los habilita recién con más seguidores; cuando estén, se suma la estrategia de prueba de hooks.

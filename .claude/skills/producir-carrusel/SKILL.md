---
name: producir-carrusel
description: Armar un carrusel de Instagram de @teloexplico.ar con datos ya chequeados de reels publicados (placas.json + caption, render y control con tlx). Usar en la producción automática cuando faltan carruseles o cuando Mateo pida uno.
---

# Producir un carrusel de "Te lo explico"

Sale uno por día a las 16:00, sin revisión humana. **No se investiga nada nuevo:** todo dato sale del `chequeo.json` de reels ya publicados. Eso es lo que lo hace barato y seguro. Nada de WebSearch.
Gastá poco: no leas videos ni código del motor; alcanza con este skill, `videos/carruseles/heladera/placas.json` (modelo) y los archivos de los reels de origen.

## 1. Elegir de dónde sale
`./herramientas/tlx carrusel cola` (los que ya existen: no repitas origen) y `./herramientas/tlx metricas` (ranking). En este orden:
1. **Reel que funcionó → carrusel:** el reel publicado hace 2 días o más con más compartidos que todavía no tenga carrusel. Clave = el slug sin número (`vuelta-carne`).
2. **Recopilación de serie:** 3 o más reels publicados de la misma serie (`./herramientas/tlx serie`) que no estén juntos en otro carrusel: "4 mitos de cocina que te comiste". Una placa por reel. Clave `serie-<serie>-<n>`.
3. **Regla práctica para guardar** de un reel con una regla clara ("a qué distancia está la tormenta: contá los segundos").
Nada de temas de actualidad vencidos (más de una semana) ni reels con el chequeo rechazado. Si no hay ninguna opción sin repetir, no hagas nada: anotalo en `videos/produccion.log` y terminá.

## 2. Datos
Leé `videos/<slug>/chequeo.json`, `guion.json` y `caption.txt` de cada reel de origen. Solo afirmaciones `verificada` (las `probable`, con el mismo matiz del reel: "se cree que…"). Copiá los números tal cual. Salud, seguridad y plata: solo lo verificado, sin redondear ni simplificar de más. El control rechaza cualquier número que no esté en esos archivos.

## 3. `videos/carruseles/<clave>/placas.json`
```json
{"origen": ["001-heladera"], "serie": "mitos de cocina", "placas": [
 {"tipo": "tapa", "arriba": "¿pregunta del mito?", "grande": "es al revés", "promesa": "deslizá y guardalo", "dibujo": [{"objeto": "Heladera", "x": 330, "y": 1180, "s": 0.62}]},
 {"tipo": "paso", "etiqueta": "// el problema", "titulo": "Una idea", "dato": "20 minutos", "colorDato": "rojo", "cuerpo": "Hasta 25 palabras.", "fuente": "USDA FSIS"},
 {"tipo": "resumen", "titulo": "La heladera, en 4 reglas", "items": [[true, "lo que sí"], [false, "lo que no"]]},
 {"tipo": "cierre", "texto": "Mandáselo a ese que…", "serie": "mitos de cocina"}]}
```
- **6 a 10 placas:** tapa → la placa 2 dice por qué importa (también funciona como segunda tapa: nada de introducción) → una idea por placa → resumen → cierre.
- Tapa: `grande` hasta 14 caracteres (2–3 palabras, es lo que se ve en la grilla), `arriba` hasta 60, `promesa` hasta 32.
- Paso: `titulo` de 3 a 10 palabras (hasta 80 caracteres), `cuerpo` hasta 25 palabras, `dato` hasta 10 caracteres (el número grande, con `colorDato` rojo, azul, verde o tinta), `fuente` corta (institución, no frase).
- Resumen: 3 a 5 renglones de hasta 50 caracteres, que se entiendan sin el resto (es la placa que se captura y se manda).
- Cierre: "Mandáselo a ese que…" concreto y gracioso, como en los reels. `serie` en minúscula si los reels de origen tienen serie.
- `dibujo` es opcional (tapa y 1–2 placas como mucho): objetos de la biblioteca por nombre (`Heladera` con `abierta`, `Olla`, `Termometro` con `valor`, `Nube` con `tormenta`, `Sol`, `Vaso`, `Sarten`, `Bife`, `Auto`, `Tupper`), con `y` entre 1000 y 1250 y `s` entre 0.5 y 0.9. Placa sin dibujo = texto centrado (queda bien).
- Rioplatense, voseo. Nunca la palabra "posta" (es la marca de otra cuenta). Emblemas y logos, nunca.

## 4. `videos/carruseles/<clave>/caption.txt`
Primera línea: gancho + emoji (lo que se lee antes del "… más"). Uno o dos párrafos cortos con el dato principal. "👇 Mandáselo a ese que…". Una pregunta fácil de contestar en una palabra. "Fuentes: …" (las del reel). Si tiene serie: "📚 <Serie> · Seguí a @teloexplico.ar: un dato por día."; si no: "Seguí a @teloexplico.ar: un dato por día.". 5 hashtags (#datoscuriosos + 4 del tema).

## 5. Render y control
`./herramientas/tlx carrusel <clave>` → placas JPG, `hoja.png`, control y estado. Mirá `videos/carruseles/<clave>/hoja.png` con Read **una vez**: texto que se pisa con un dibujo, texto cortado o placa vacía → corregí `placas.json` y corré de nuevo. Si sale APARTADO, corregí lo que dice y repetí una sola vez; si sigue apartado, dejalo así.
Al final, una línea en `videos/produccion.log`: fecha, `carrusel <clave>`, listo o apartado y por qué. No publiques nada: lo hace `carrusel.yml` a las 16:00.

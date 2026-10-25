---
name: dibujar-objeto
description: Dibujar un objeto o escenario nuevo para los videos de @teloexplico.ar (SVG en React, estilo diagrama ilustrado con volumen) puliéndolo en varias vueltas de render y revisión. Usar desde producir-video cada vez que el video necesita un objeto protagonista que no está en el kit.
---

# Dibujar un objeto nuevo (con vueltas de pulido)

Un dibujo hecho de una sola pasada sale pobre: las coordenadas se adivinan. Este proceso lo arregla mirando el resultado.
Reglas de estilo: `marca/DIRECCION_ARTE.md` y `marca/MARCA.md`. Piezas de base: `motor/src/kit/diagrama.tsx`.

## 1. Antes de dibujar
- ¿Ya existe en `kit/biblioteca.tsx` (lámina `marca/referencias/biblioteca.png`) o en `kit/diagrama.tsx`? Reusalo o extendelo (sin cambiar firmas existentes).
- Buscá cómo es el objeto real (WebSearch de imágenes de referencia si hace falta): proporciones, partes que lo
  hacen reconocible (una heladera tiene manija, burletes y freezer arriba; un bife tiene grasa en el borde y vetas).
- Escribí en 3 líneas qué tiene que *explicar* el objeto en el video (ej.: "la heladera abierta tiene que mostrar que el
  aire frío se cae por abajo"). El dibujo se diseña para eso: corte, vista, partes móviles.

## 2. Construcción (en este orden)
1. Silueta con formas simples y proporciones reales.
2. Contorno negro (`C.tinta`, 7–10 px) y sombra dura desplazada (10–14 px, relleno tinta).
3. Volumen: degradé de luz (arriba-izquierda) a sombra (abajo-derecha) con tonos de `TONO` o tonos más claros/oscuros
   de la paleta. Un brillo blanco (elipse) arriba a la izquierda.
4. Material/textura: vetas (madera), reflejos en franja (metal/vidrio), poros o grasa (carne), gotas (frío), etc.
5. Detalles que lo hacen reconocible (2–4, no más).
6. Partes animables como props: `t` (frame), y lo que cambie en la historia (`abierta`, `coccion`, `capas`, `crece`…).
7. Sin cara (salvo que sea EL personaje del video).

## 3. Vueltas de pulido (mínimo 3)
1. Poné el objeto en `motor/src/taller/Taller.tsx` (componente `Objeto`) y corré `./herramientas/tlx taller`.
2. Mirá `videos/_taller/taller.png` con Read y revisá:
   - ¿Se reconoce sin leer nada, también en la vista chica de celular?
   - ¿Tiene volumen (no plano), contorno parejo, sombra dura, brillo?
   - ¿Proporciones creíbles? ¿Alguna parte rara, cortada o superpuesta mal?
   - ¿Combina con el modelo (`marca/referencias/modelo_005_granizo_v2.png`)? ¿Está al nivel de `referencias/competencia_*`?
3. Anotá 2–3 correcciones concretas, aplicalas y volvé a renderizar. Repetí hasta que pase todo (mínimo 3 vueltas).

## 4. Cerrar
- Mové el componente a `kit/biblioteca.tsx` siguiendo sus reglas (LINEA, SOMBRA_D, `claro`/`oscuro`, MAT, origen documentado) y sumalo a la lámina `taller/Catalogo.tsx` (render: `./herramientas/tlx catalogo`).
- `./herramientas/tlx tsc` sin errores.
- Dejá `Taller.tsx` con el último objeto (no importa) y seguí con el video.

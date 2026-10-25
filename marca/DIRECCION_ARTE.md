# Dirección de arte: "diagrama ilustrado" (desde el 24/10/2026)

La marca sigue siendo el cuaderno pop (MARCA.md: papel cuadriculado, contorno negro, sombra dura, paleta fija).
Lo que cambia es **qué dibujamos y cómo**. Modelo a copiar: `motor/src/videos/005-granizo-calor/Video.tsx`
(hoja de cuadros en `referencias/modelo_005_granizo_v2.png`). Lo que NO hay que hacer: `referencias/antes_005_granizo_v1.png`.
Nivel a alcanzar: `referencias/competencia_*.png` (@posta.explica, solo como vara de calidad: no copiar su estilo oscuro ni sus temas).

## Las 7 reglas

1. **El dibujo explica el mecanismo.** Cada escena muestra *cómo* pasa lo que dice la voz: un corte, una vista de arriba,
   un antes/después, una comparación lado a lado, partículas que se mueven. Si la escena se entiende igual con la pantalla
   en negro, está mal: el dibujo no está explicando.
2. **Un solo mundo que evoluciona.** Elegí UN escenario para todo el video (la atmósfera sobre una ciudad, una cocina, una
   parrilla, una heladera abierta…) y contá la historia moviendo la cámara (`Camara` + `toma`) y agregando cosas.
   Nada de cambiar de dibujos sueltos en cada frase. Los objetos se mantienen y se transforman.
3. **Los datos van pegados al objeto.** Números y nombres van en `Rotulo` (con línea que señala), `Escala`, `Contador`,
   `Lupa`. Nunca un dato flotando lejos de lo que describe. Solo números que estén en el guion o en el chequeo.
4. **Volumen y textura.** Rellenos con degradé de luz a sombra (`TONO`, `DegradeV`), brillo arriba a la izquierda,
   sombra dura. Materiales reconocibles: vetas en la madera, brillo en el metal, poros en la carne, gotas en el vidrio.
5. **Caras: solo un personaje por video**, y solo si suma (el vecino del final, quien "cree" el mito). Nada de soles,
   nubes, piedras o comidas con cara. Eso es lo que hacía ver los videos infantiles.
6. **Movimiento constante con sentido.** Siempre hay algo moviéndose que *significa* algo: partículas que fluyen (`Flujo`),
   ondas de calor, chevrones que suben, un número contando, la cámara acercándose. Nada quieto más de 1 s.
7. **Pocos elementos, mucho aire.** Máximo 1 globo de diálogo cada 2–3 escenas (el chiste), 1 sello por escena como mucho.
   Lo protagonista es el diagrama, no los stickers.

## Dopamina y retención (cada video)

- **Primer cuadro = la paradoja a la vista** (granizo cayendo con el sol arriba). Nada de pantallas vacías ni títulos solos.
- **Golpe de zoom** (`golpe`) en cada palabra clave del guion, con sonido.
- **Un número que cuenta** (`Contador`) en el dato fuerte: engancha más que un número quieto.
- **Una "revelación" con lupa o corte** a la mitad (lo que no se ve a simple vista).
- **Un giro en el "Ojo:"**: mostrar qué pasa si falta una condición (la tormenta se desarma y se vuelve a armar).
- **Cierre que vuelve al principio**: la última imagen rima con la primera, para que el loop se sienta natural.
- **Pasos numerados** (`Paso`: "1 · el calor sube", "2 · arriba hace frío"…) en las escenas del mecanismo: dan sensación de progreso (lo hace @1action1reaction, ver AUDITORIA_REFERENCIAS.md).
- **Sonido en cada cambio**: whoosh al mover la cámara, tic al empezar a contar, ding al llegar al número, sello en los sellos.

## Biblioteca de objetos (motor/src/kit/biblioteca.tsx) — usar SIEMPRE antes que dibujar
Lámina: `referencias/biblioteca.png`. `Nube` (con `tormenta`), `Sol`, `Heladera` (`abierta` 0→1, `contenido`), `Olla` (`tapa`, `liquido`),
`Sarten` (con comida adentro), `Bife` (`coccion`, `marcas`), `Persona` (`gesto`, `pelo`, `remera`, `mira`, `senala`), `Anafe` (`fuego`),
`Termometro` (`valor`), `Vaso` (`nivel`, `liquido`, `hielo`, `gotas`), `Barrio` (edificios con terraza, tanques y árboles), `Auto` (`anda`).
Reglas comunes de la biblioteca: `LINEA` 8, `SOMBRA_D` 12, luz desde arriba a la izquierda, tonos con `claro()`/`oscuro()` y materiales `MAT`.
Todo objeto nuevo sigue esas mismas reglas (skill `dibujar-objeto`) y se agrega a la biblioteca y a la lámina (`motor/src/taller/Catalogo.tsx`).

## Kit de diagrama (motor/src/kit/diagrama.tsx)

`Camara`/`toma` (zoom y paneo) · `Paso` (paso numerado) · `Trazo` (líneas y flechas que se dibujan) · `Rotulo` (dato con línea al objeto) ·
`Contador` · `Flujo` (partículas) · `Velocidad` · `Escala` · `Lupa` · `DegradeV` · `NubeVolumen` · `PiedraHielo` ·
`SolVolumen` · `Ciudad` · `Piso` · `OndasCalor` · `Corriente` · `Vecino` (personaje) · `Meses` (barra de meses).
Los dibujos viejos de `dibujos.tsx` sirven de base, pero un objeto protagonista nuevo se hace con la skill `dibujar-objeto`
y se agrega a `diagrama.tsx` (o a un archivo nuevo del kit) con volumen.

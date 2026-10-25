# Te lo explico — marca

Cuenta: **@teloexplico.ar**. Dirección elegida: **Cuaderno pop** (`marca_elegida.png`, frame `#d` de `direcciones.html`).
Idea: alguien que te lo dibuja en un cuaderno, con resaltador y stickers. Claro, saturado, con contorno negro grueso y sombra dura. Pensado para cortar el scroll en un feed de cuentas oscuras.

## Colores (no usar otros)
| Rol | Hex |
|---|---|
| Papel (fondo) | `#FFF6E5` |
| Cuadrícula | `#F0E3C8` (líneas de 2 px cada 60 px) |
| Tinta (texto, contornos, sombras) | `#111111` |
| Azul birome (marca, palabra clave en subtítulos) | `#2E4BFF` |
| Rojo tomate (mito, error, alerta) | `#FF4D2E` |
| Amarillo resaltador (dato clave, etiquetas) | `#FFE14D` |
| Verde (lo correcto, "posta que sí") | `#2BD67B` |
| Blanco (rellenos de objetos, caja de subtítulos) | `#FFFFFF` |

## Tipografías
- **Bricolage Grotesque** 800 para títulos, subtítulos y logo; 500 para texto secundario.
- **JetBrains Mono** 700 para etiquetas de sección (`// el mito`), fuentes y datos chicos.

## Elementos fijos de cada video
- Logo arriba: "te lo explico" + burbuja de diálogo azul.
- Etiqueta de sección: pastilla azul con texto blanco en mono, contorno negro y sombra dura.
- Título en dos tonos: pregunta en tinta 70 px, respuesta gigante (160 px) rotada -2,5° con resaltador amarillo.
- Objetos y personajes: planos, contorno negro de 9 px, sombra dura desplazada 12 px; los personajes tienen ojos grandes y cara expresiva.
- Sellos ("MITO", "POSTA", "OJO"): rojo, verde o amarillo; rotados; contorno y sombra.
- Subtítulos: caja blanca con contorno y sombra; la palabra clave en pastilla azul.
- Fuente del dato siempre en pantalla, en mono, abajo de los subtítulos.
- Cierre: logo grande + "@teloexplico.ar" + "un dato por día".

## Zonas seguras (1080×1920)
Nada importante arriba de 220 px ni debajo de 1610 px (interfaz de Instagram), ni a menos de 90 px del borde derecho.

## Movimiento y sonido (lo que da la dopamina)
- Algo nuevo cada 1–2 s: aparición, cambio de escena, número que sube o sello que cae.
- Entradas con resorte (overshoot), sellos que caen con rebote, resaltador que se dibuja de izquierda a derecha.
- Zoom de golpe (punch-in, 1,00 a 1,06) en la palabra clave del giro.
- Sonido: "pop" en cada aparición, "whoosh" en cambios de escena, "ding" en el dato clave, "sello" en MITO/POSTA. Música de fondo muy baja, unos 20 dB debajo de la voz.
- Voz: Gemini `es-419-assistant-7`, pausas recortadas a 0,4 s como máximo, -14 LUFS.

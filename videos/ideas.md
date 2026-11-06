# Ideas de videos (banco de temas)

La producción nocturna toma la primera idea **sin marcar** de arriba hacia abajo. Al usarla se marca `[usada → slug]`; si la investigación la tumba, `[descartada: motivo]`.
Ninguna idea de acá está verificada: cada una se investiga y se chequea antes de hacerse.

> **Línea editorial (30/10, aclarada por Mateo):** la cuenta NO es de cocina. Es de datos y mitos variados de la vida argentina que la gente quiera mandar o comentar. Regla de variedad: de cada 6 videos, ninguna serie más de 2, cocina como mucho 1 de cada 5, y 1 de cada 3 de la sección "Argentina: lo que nos pasa a todos". El orden de las secciones de abajo ya no manda por sí solo: ver `.claude/skills/producir-video/SKILL.md` sección 0.
Cada sección dice a qué serie van sus videos (`tlx serie asignar <slug> <serie>`). Los objetos que se explican "por dentro" en 3D van a la serie `pordentro`.

Cada sección dice a qué serie van sus videos (`tlx serie asignar <slug> <serie>`). Los objetos que se explican "por dentro" en 3D van a la serie `pordentro`.

## Pedidos de Mateo (prioridad máxima: van antes que todo, salvo un 🔥 del radar; un pedido sin hacer se produce en el próximo turno aunque sobren videos listos)
- [ ] REHACER 014-celular-arroz como video NUEVO (Mateo 6/11): el publicado el 4/11 sale susurrado y dura 59 s con 154 palabras. Slug nuevo (siguiente número + "celular-arroz-v2"), guion NUEVO de 90–120 palabras y 30–45 s, mismo destinatario, y los estilos de voz SIN "intriga/secreto/bajando la voz" (la voz ya suma "voz plena, clara y proyectada"). Antes de dar el video por listo, escuchá/controlá que la voz no suene susurrada. Va primero en el próximo turno de producción.
- [ ] 🔥 ACTUALIDAD – VISITA DEL PAPA A ARGENTINA (Mateo 6/11, corregido: hablar de LA VISITA en Argentina, NO del Papa como persona; nada de su nombre, su vida ni el papamóvil en general). León XIV llega el domingo 8/11 (16:30, Aeroparque) y se va el miércoles 11/11 (Buenos Aires, Córdoba, Luján). DOS videos CURIOSOS sobre lo que implica la visita acá, sin política partidaria, sin debate religioso, sin opinar sobre el Papa ni el Gobierno. Van al frente de la cola como 🔥 (`cola agregar ... --actualidad`): el primero sale el sábado 7/11 12:30, el segundo el domingo 8/11 12:30 (antes de que aterrice). 30–45 s, 90–120 palabras, una idea, un dato, voz plena. Chequeo de datos obligatorio con fuentes (medios serios, Chequeado, Boletín Oficial, sitio de la Conferencia Episcopal); si un dato no se confirma, sacarlo. Si salen los dos antes del tope, mejor.
  - Video 1 (práctico, el que más se manda): ¿Qué día es feriado y dónde por la visita? Lunes 9/11 feriado nacional; martes 10 solo en CABA y Córdoba; miércoles 11 en la provincia de Buenos Aires (según La Nación; confirmar en el decreto/Boletín Oficial o fuente oficial y qué pasa con el finde largo sáb-dom-lun). Mapa de Argentina con los feriados que aparecen según la provincia. Cierre: "mandáselo a ese que pregunta si mañana se labura".
  - Video 2 (curioso): la misa del martes 10 en Córdoba es en el predio de la Fábrica Argentina de Aviones (FAdeA). Contar qué es ese lugar: fábrica de aviones de Córdoba, de dónde viene (fundada como Fábrica Militar de Aviones en 1927) y el Pulqui I (1947), primer avión a reacción diseñado y construido en Latinoamérica. Solo lo que confirmen FAdeA / Wikipedia / medios serios; confirmar que la misa es ahí. Cierre: "mandáselo a ese cordobés que va a ir".
- [ ] PRUEBA DE PILARES (pedido de Mateo 4/11, objetivo: revertir el estancamiento: 386 seguidores, mediana ~1,5 K vistas, 1 reel de 22 con más de 3x la mediana). Producí UNA idea por turno de la sección "PRUEBA DE PILARES" (alterná pilares, nunca dos seguidos del mismo), con las reglas del punto 2b del skill: `destinatario`, `regla_guardable` y tarjeta final "guardalo"; ganchos con 2.ª persona + situación + contradicción + costo; sin partes 2; 1 reel por día alcanza (no llenes cola por llenar). Cada turno anotá en `videos/produccion.log` pilar y ganchos probados; si podés, publicá con Trial Reel. Se mide envíos y guardados cada 1.000 vistas; el 18/11 el jefe (Rocío) arma el balance por pilar con `tlx metricas` y propone descartar el peor y duplicar el mejor. Si una idea pide un dato de salud, seguridad o plata y no hay fuente primaria con número, descartala y tomá otra del mismo pilar.
- [ ] REHACER EN 3D (regla 27/10: solo se publica 3D). Uno por turno, en este orden: 021-heladera-parte-2, 019-sensacion-termica, 008-aire-en-17, 014-celular-arroz (30/10: se sacaron 024-granizo-corto, 018-refresca-tormenta y 012-lavar-pollo: sin destinatario). Mismo slug (`tlx cola estado <slug> produccion`), reusar guion.json y chequeo.json; la voz NO está (se borra del Release al quedar listo el video): regenerala con `voz.py <slug>` (1 pedido de Gemini, mismo guion) antes de renderizar; solo se escribe un Video.tsx nuevo con kit3d y se manda a render. Si el guion no se entiende a la primera, se puede reescribir (y entonces se rehace voz y chequeo). Marcar acá cada slug rehecho; cuando estén todos, marcar este pedido [x]. Rehechos: 024-granizo-corto, 021-heladera-parte-2, 019-sensacion-termica (28/10), 008-aire-en-17 (29/10), 014-celular-arroz (29/10), 018-refresca-tormenta (30/10).
- [usada → 021-heladera-parte-2] HELADERA PARTE 2 (serie: cocina). Segunda parte del 001-heladera, el más enviado de la cuenta (73 K vistas, 2.206 enviados): ¿hay que tapar la comida caliente antes de meterla en la heladera? (lo pidió @martin_whisky99 en los comentarios). El gancho nombra la primera parte ("En la parte 1 te dije que no la dejes enfriar afuera. Me preguntaron: ¿y la tapo?") y el caption arranca con "Parte 2 de la heladera". Puede ir en 2D con el mismo mundo del 001 (heladera, olla, tuppers chatos) para que se reconozca como continuación. Es seguridad alimentaria: solo lo verificado (USDA/FSIS, ANMAT). Si la investigación da "depende" sin una regla clara, hacé la parte 2 con otra pregunta de heladera que sí la tenga (por ejemplo, cuántos días dura la comida cocida guardada). Cierre: "mandáselo al que guarda la olla entera con la tapa puesta".
- [usada → 016-el-nino-clima (versión corta)] El Niño, VERSIÓN CORTA (rehacer el 016, que quedó apartado por largo y aburrido): 30–40 s, UNA sola idea ("el Pacífico se calienta → llueve más acá"), un solo dato con número, todo a la vista en un mapa que se transforma, golpes de zoom y cortes cada 1–2 s. Se puede reusar el chequeo de datos del 016. Cierre para enviar: "mandáselo a ese que dice que el clima está loco".
- [usada → 016-el-nino-clima] El Niño en Argentina y cómo viene el clima: qué es (el Pacífico más caliente cambia los vientos), por qué trae más lluvia y tormentas al Litoral, el NEA y Buenos Aires, y qué dice el pronóstico oficial para este verano. Verificar primero el estado ACTUAL (SMN / NOAA, último informe ENSO): si no hay El Niño activo o previsto, el video es "¿viene El Niño o La Niña?" con lo que diga el informe. Ángulo propio y cercano ("¿por qué este año llueve así en tu ciudad?"), no el de @posta.explica, que ya hizo El Niño. Cierre pensado para que lo manden: "mandáselo a ese que dice que el clima está loco".

- [usada → 018-rayo-trueno] ¿A qué distancia está la tormenta? Contá los segundos entre el rayo y el trueno: la cuenta casera (la luz llega casi al instante, el sonido tarda ~3 s por km). "Vos" contando en la ventana; un Contador de segundos que se convierte en km. Seguridad: SOLO lo verificado (SMN/NOAA: si escuchás el trueno, estás al alcance del rayo → adentro). Cierre: "mandáselo a ese que sale al balcón a ver los rayos".
  (30–45 s, una idea, un dato; momento cotidiano + "¿por qué?" contraintuitivo; ver AUDITORIA_REFERENCIAS.md: lo que tracciona en clima, 26/10)
- [usada → 019-sensacion-termica] ¿Por qué la sensación térmica es más alta que la temperatura? La humedad no deja que el sudor se evapore y el cuerpo no se enfría (lo que publica el SMN en verano). Un termómetro que marca 32 y un "se siente como" que sube. Cierre: "mandáselo a ese que dice 'no hace tanto calor, son 30'".
  (30–45 s, una idea, un dato; momento cotidiano + "¿por qué?" contraintuitivo; ver AUDITORIA_REFERENCIAS.md: lo que tracciona en clima, 26/10)
- [usada → 018-refresca-tormenta] ¿Por qué después de la tormenta refresca de golpe? El aire frío que baja de la nube con la lluvia y se desparrama (la "corriente descendente"). Una ciudad agobiada, la nube, la bajada de aire frío y el termómetro que cae varios grados en minutos (solo cifras verificadas). Cierre: "mandáselo al que dice 'ya refrescó'".
  (30–45 s, una idea, un dato; momento cotidiano + "¿por qué?" contraintuitivo; ver AUDITORIA_REFERENCIAS.md: lo que tracciona en clima, 26/10)

- [descartada: 27/10 sin alerta SMN fechada de octubre 2026 ni dato con número; solo el mecanismo (isoterma cero) con fuentes chilenas] (serie: clima) ¿Cómo puede nevar en plena primavera? (actualidad 26/10: alerta del SMN por nevadas en Mendoza, Chubut y Santa Cruz mientras en Buenos Aires hay tormentas). Mecanismo: aire frío en altura + humedad; en la cordillera y la Patagonia la nieve de octubre no es rara. Cierre: "mandáselo al que ya guardó la campera".
  (30–45 s, una idea, un dato; momento cotidiano + "¿por qué?" contraintuitivo)
- [ ] (sin serie: actualidad) ¿Qué significa el "6-7" que hacen todos los pibes? (viral: lo hizo hasta el Presidente en el balcón el 26/10; NADA de política: solo el origen del meme, verificado: canción, básquet, por qué se contagia). Cierre: "mandáselo a tu viejo que no entiende nada".
  (30–45 s, una idea, un dato; momento cotidiano + "¿por qué?" contraintuitivo)
- [usada → 024-granizo-corto] (serie: clima) Granizo con calor, VERSIÓN CORTA (rehacer el 005, que quedó apartado por un falso rechazo del control): alertas naranja por granizo en 9 provincias (22/10). Reusar su chequeo.
  (30–45 s, una idea, un dato; momento cotidiano + "¿por qué?" contraintuitivo)

## PRUEBA DE PILARES (4/11 al 18/11, pedido de Mateo) — van ANTES que el resto de las secciones
Reglas en el skill producir-video, punto 2b. Dos por pilar, misma plantilla de gancho; cada una necesita `destinatario` y `regla_guardable`. Ninguna está verificada: salud, seguridad y plata exigen fuente primaria con número exacto (si no aparece, se descarta y se reemplaza por otra del mismo pilar). Los números entre paréntesis son hipótesis a comprobar, no datos.
- [ ] (pilar: cocina, serie: cocina) Arroz recalentado: la bacteria que sobrevive a la cocción (Bacillus cereus). Dest: el que deja la olla de arroz toda la tarde sobre la mesada. Regla: a la heladera dentro de la hora o dos, y recalentar una sola vez.
- [ ] (pilar: cocina, serie: cocina) Una sola tabla para carne cruda y verduras. Dest: el que corta todo en la misma tabla. Regla: una para crudo, otra para lo que se come sin cocinar.
- [ ] (pilar: plata_hogar, serie: casa) Aire acondicionado: cuánto sube el consumo por cada grado menos (¿~8 %?). Dest: el que lo pone en 16. Regla: el número de grados y lo que cuesta al mes con la tarifa vigente.
- [ ] (pilar: plata_hogar, serie: casa) Consumo fantasma: cargadores y aparatos enchufados, cuánto cuesta en el año con la tarifa de hoy. Dest: la que deja todo enchufado. Regla: qué desenchufar primero.
- [ ] (pilar: salud_simple, serie: cuerpo) Golpe de calor: señales y qué hacer mientras llega la ayuda (Ministerio de Salud / OMS). Dest: el que sale a correr con 35 grados. Regla: las 3 señales y el primer paso.
- [ ] (pilar: salud_simple, serie: cuerpo) Protector solar con el cielo nublado y reaplicación (OMS / SMN índice UV). Dest: el que dice "hoy está nublado". Regla: cuándo reaplicar.
- [ ] (pilar: mascotas, serie: casa) Alimentos que no le podés dar a un perro (chocolate, uvas, cebolla): por qué y cuánto es peligroso (veterinarios / ASPCA). Dest: el que le da del plato. Regla: la lista corta.
- [ ] (pilar: mascotas, serie: casa) Perro encerrado en el auto: en cuántos minutos sube la temperatura adentro (estudios veterinarios). Dest: el que lo deja "un minutito". Regla: el número de grados y qué hacer si ves uno.
- [ ] (pilar: casa, serie: casa) Lavandina con vinagre o amoníaco: el gas tóxico (CDC / Ministerio de Salud). Dest: el que mezcla productos "para que limpie mejor". Regla: qué nunca se mezcla.
- [ ] (pilar: casa, serie: casa) Alargues y zapatillas: qué aparatos no se enchufan (aire, estufa, horno eléctrico) (ENRE / bomberos). Dest: el que enchufa la estufa al alargue. Regla: la lista.
- [ ] (pilar: celular_estafas, serie: argentina) Estafa del código de WhatsApp ("te lo mandé por error"): cómo funciona y qué hacer (Argentina.gob.ar / Meta). Dest: la tía o el abuelo que contesta. Regla: el código no se comparte nunca.
- [ ] (pilar: celular_estafas, serie: argentina) Link falso de "paquete retenido" o pago: cómo reconocerlo (Banco Central / ANSES / Correo). Dest: el que cliquea todo. Regla: 3 señales de un link falso.
- [ ] (pilar: clima_accion, serie: clima) Tormenta eléctrica: qué hacer y qué no (SMN, la regla de los 30 segundos y 30 minutos). Dest: el que sigue en la pileta o la cancha. Regla: contá el trueno, adentro 30 minutos.
- [ ] (pilar: clima_accion, serie: casa) Apagón: cuánto aguanta la comida de la heladera cerrada (~4 horas, USDA/ANMAT; comprobar). Dest: el que abre la heladera a cada rato. Regla: las horas y qué tirar.
- [ ] (pilar: argentina, serie: costumbres) Ñoquis del 29 con la plata abajo del plato: de dónde sale. Dest: el que dice "es tradición". Regla: sin número, va por mandable. (ya está más abajo: moverla acá cuenta como una del pilar)
- [ ] (pilar: argentina, serie: argentina) Una palabra del lunfardo que usás todos los días: de dónde viene (laburo / chamuyo, Academia Porteña del Lunfardo). Dest: el que dice "es de siempre". Regla: la palabra y su origen en una línea.
- [ ] (pilar: fandom, sin serie) Entradas a recitales: cómo reconocer la reventa trucha y la ticketera oficial. Dest: el fan que compra por redes. Regla: 3 señales de entrada falsa.
- [ ] (pilar: fandom, sin serie) El tema de fandom del momento que detecte el radar (artista, selección, serie). Mismas reglas: destinatario y regla guardable.

## Argentina: lo que nos pasa a todos — serie: costumbres (o argentina si es de datos/mapas). PRIORIDAD sobre cocina y casa (30/10)
Mitos, orígenes y costumbres bien nuestras, de las que se comentan con "yo también" o se mandan con "mirá esto". Nada de política, religión ni plata personal. Si el origen es discutido, decirlo con matiz (historiadores/RAE/Academia Argentina de Letras).
- [ ] ¿Por qué comemos ñoquis el 29 y ponemos plata abajo del plato? De dónde sale la costumbre (la leyenda de San Pantaleón, la pobreza de fin de mes en la inmigración italiana) y qué es leyenda y qué está documentado. Pregunta: "¿vos ponés la plata abajo del plato?". Cierre: "mandáselo al que se olvida de los ñoquis del 29".
- [ ] ¿Por qué en la ronda de mate no se dice "gracias"? (el "gracias" significa "no quiero más"): la regla no escrita, cuánto tarda la ronda, el lavado. Pregunta: "¿cuántos mates te tomás por día?". Cierre: "mandáselo al que dice gracias en la ronda".
- [ ] ¿De dónde viene "laburo", "mina", "birra", "chamuyo"? Lunfardo e inmigración italiana (Academia Porteña del Lunfardo). Una palabra que se "dibuja" y se transforma por cada país de origen. Pregunta: "¿cuál palabra tuya no entiende nadie afuera?". Cierre: "mandáselo al que habla en lunfardo".
- [ ] (receta 7 "El acusado equivocado", Vera 5/11) "No es el calor: es la humedad": por qué 30° en Buenos Aires se siente peor que 35° en Mendoza (sensación térmica, SMN). Acusado: el termómetro; veredicto: el punto de rocío. Gráfico ×N con fuente SMN. Cierre: "mandáselo al que dice 'hoy hace 40 grados' con el celular en la mano" (se lo manda un porteño a un cuyano para decirle que él no sabe lo que es calor húmedo).
- [ ] (receta 9 "El negocio escondido", Vera 5/11) ¿Por qué el supermercado pone la leche al fondo? Recorrido de la góndola, cuántos pasos de más y qué compra de impulso (estudios de retail, año y autor en chapita). Cierre: "mandáselo al que va por una sola cosa y sale con el changuito lleno" (se lo manda una hija a su viejo).
- [ ] (receta 8 "Prueba de 3 pasos", Vera 5/11) ¿Tu heladera enfría bien? 3 pruebas en casa: el billete en la puerta, el vaso de agua con termómetro, la manteca (contador 1/3, 2/3, 3/3). Cierre: "mandáselo al que dice que la heladera 'hace ruido raro'".
- [ ] (receta 3 + puzzle con contador, Vera 5/11) ¿Cuántas rondas de mate hacen falta para que el último tome un mate frío? Ronda de N personas con cebador, contador "Mates 0→N" y la cuenta de tiempo de enfriado. Cierre: "mandáselo al que siempre queda último en la ronda".
- [ ] (receta 4 "Tu vida en una grilla", Vera 5/11) Tus asados con tu viejo: si lo ves 1 vez por mes y tiene 65, cuántos domingos le quedan (esperanza de vida INDEC); grilla de cuadraditos que se apagan. Cierre: "mandáselo a tu hermano para decirle que vaya más seguido".
- [ ] ¿Por qué decimos "che"? Orígenes discutidos (mapuche, guaraní, valenciano): qué dicen los lingüistas y qué es solo leyenda. Pregunta: "¿cuántas veces dijiste 'che' hoy?". Cierre: "mandáselo al que no puede hablar sin decir 'che'".
- [ ] El voseo: ¿por qué decimos "vos" y no "tú"? De dónde viene (español antiguo), por qué sobrevivió acá y en qué otros países se usa. Pregunta: "¿vos o tú, desde dónde mirás?". Cierre: "mandáselo al que dice 'tú' para hablar fino".
- [ ] ¿Por qué el colectivo se llama "bondi"? Origen del apodo (bonde, Brasil/Río) y de otros apodos de transporte. Pregunta: "¿qué línea tomás todos los días?". Cierre: "mandáselo al que dice 'el bondi' en vez de 'el colectivo'".
- [ ] Los billetes con animales: por qué el Banco Central puso ñandú, yaguareté, guanaco, taruca, huemul (serie 2017–2019): qué animal es cada uno y por qué esos. Datos BCRA. Pregunta: "¿cuál es tu animal favorito de los billetes?". Cierre: "mandáselo al que no sabe qué animal tiene el billete".
- [ ] El subte de Buenos Aires: la Línea A es de 1913, la más antigua de Latinoamérica y del hemisferio sur; los coches de madera que usó hasta hace poco. Fuentes: Metrovías/Gobierno CABA. Pregunta: "¿qué línea de subte usás?". Cierre: "mandáselo al que se queja de la línea A".
- [ ] El Perito Moreno: ¿se derrite o no? El glaciar que no retrocede igual que los otros, por qué se rompe el puente de hielo cada tantos años y cuánto avanza por día (APN, estudios glaciológicos). Pregunta: "¿lo viste romperse?". Cierre: "mandáselo al que dice que los glaciares se están acabando".
- [ ] ¿Por qué Argentina tiene tantos feriados puente y cuántos feriados tiene de verdad? Comparación con otros países de la región (fuentes oficiales). Pregunta: "¿qué finde largo es tu favorito?". Cierre: "mandáselo al que ya está viendo el próximo puente".
- [ ] ¿Por qué decimos "pibe/piba"? (origen genovés/lunfardo, discutido). Pregunta: "¿cómo le decís a un chico en tu provincia: pibe, chango, gurí?". Cierre: "mandáselo al que dice chango y no pibe".
- [ ] Ley BTS: qué es y qué cambió para los artistas con el servicio militar en Corea del Sur (pedido por @jesikim23, en el comentario del 007-bts-13-anios)
- [ ] ¿De dónde son los apellidos más comunes de Argentina? González, Rodríguez, Fernández: qué porcentaje tiene un apellido italiano o español (fuente: estudios genealógicos / Registro Civil). Pregunta: "¿de dónde es tu apellido?". Cierre: "mandáselo al que tiene un apellido que nadie sabe escribir".
- [ ] La siesta: ¿es un mito que acá se duerme siesta? Qué dicen los estudios y desde qué provincia se hace más. Pregunta: "¿vos hacés siesta?". Cierre: "mandáselo al que duerme la siesta de dos horas".
- [ ] Argentina en el Mundial 2022: la hora en que se vio el partido en los distintos países, o cuántas personas salieron al Obelisco (solo con cifra oficial). Pregunta: "¿dónde viste la final?". Cierre: "mandáselo al que lloró con el gol de Montiel".
- [ ] ¿Por qué el dulce de leche es argentino (o no)? El origen discutido (Argentina, Uruguay, Chile, etc.), qué dicen los historiadores y por qué cada país lo reclama. Es comida pero de identidad: va en esta serie, no en cocina. Pregunta: "¿con qué lo comés, solo o en pan?". Cierre: "mandáselo al uruguayo que dice que es de ellos".

## Argentina en datos — serie: argentina (desde 27/10, por la auditoría de @miravosarg: su reel de mapas comparando tamaños hizo 1,1 M; NO repetir sus temas: tamaño de Buenos Aires vs Italia, Malvinas, fernet, Río de la Plata)
Cómo se hacen: la respuesta se VE en los primeros 3 s (mapa u objeto que se compara), una sola escena que va escalando (2–3 comparaciones cada vez más fuertes), cifras grandes pegadas al objeto. Caption: cerrar con una pregunta de identidad que se contesta en una palabra ("¿desde qué provincia nos ves?", "¿cuántos mates te tomás por día?").
- [ ] Vivimos con la hora corrida: en buena parte del país el sol del mediodía pasa cerca de las 13:30–14 (Argentina usa UTC-3 aunque por longitud le toca UTC-4/-5). Por eso en verano en Mendoza o en el oeste hay luz pasadas las 21. Mapa con el sol cruzando y un reloj por provincia. Fuentes: INTI/Observatorio, SHN. Pregunta: "¿a qué hora se hace de noche en tu provincia?". Cierre: "mandáselo al que cena a las once y dice que es temprano".
- [ ] ¿Cuánta yerba toma un argentino por año? Kilos por persona (INYM) convertidos a paquetes de 1 kg apilados al lado de una persona; después el total del país comparado con algo enorme. Pregunta: "¿cuántos mates te tomás por día?". Cierre: "mandáselo al que se toma un termo antes del almuerzo".
- [ ] Cataratas del Iguazú: cuánta agua cae por segundo (caudal medio, Parque Nacional/APN) → cuántos segundos tarda en llenar una pileta olímpica, después el Obelisco lleno de agua. Pregunta: "¿fuiste a las Cataratas?". Cierre: "mandáselo al que dice que las de Brasil se ven mejor".
- [ ] Ruta 40 de punta a punta: cuántos km tiene (Vialidad Nacional), cuántas provincias cruza y cuánto tardarías manejando sin parar; comparada con una distancia que se entienda (ej. Buenos Aires–otra capital). Pregunta: "¿qué tramo de la 40 hiciste?". Cierre: "mandáselo al que dice 'este verano hacemos la 40'".
- [ ] ¿El colectivo es un invento argentino? (formato mito o verdad: qué se sabe del primero de 1928 en Buenos Aires y qué dicen los historiadores; si el origen es discutido, decirlo con matiz). Pregunta: "¿qué línea tomás todos los días?". Cierre: "mandáselo al que se queja del 60".

## Verano / casa / plata (prioridad: llega el calor) — serie: casa
- [usada → 008-aire-en-17] Poner el aire en 17 °C no enfría más rápido; por qué se recomienda 24 °C y cuánto gasta cada grado
- [usada → 009-ventilador-pieza-vacia] El ventilador no enfría el ambiente: te enfría a vos (dejarlo prendido en una pieza vacía no sirve)
- [descartada: chequeo rechazado 2 veces (013-alcohol-calor apartado); la pérdida de calor interna es solo probable y es tema de salud, evidencia mixta] Tomar alcohol da calor: es al revés, el cuerpo pierde temperatura
- [ ] Sandía con vino "te mata": de dónde salió el mito argentino
- [ ] El agua del mate no tiene que hervir: qué le pasa a la yerba con el agua a 100 °C
- [ ] Dejar cargadores enchufados sin nada: cuánto consumen de verdad (consumo fantasma)
- [ ] Cargar el celular toda la noche arruina la batería: qué hacen los celulares modernos

## Cocina — serie: cocina
- [usada → 003-vuelta-carne] A la carne se la da vuelta una sola vez
- [descartada: chequeo rechazado 2 veces por atribución no verificable a Live Science; el mito es falso (011-sal-agua-hierve apartado)] Ponerle sal al agua hace que hierva más rápido
- [usada → 012-lavar-pollo] Hay que lavar el pollo crudo antes de cocinarlo
- [usada → 015-descongelar-mesada] Descongelar la carne arriba de la mesada
- [ ] El microondas le saca los nutrientes a la comida
- [ ] Tirar los fideos contra la pared para ver si están
- [usada → pedido HELADERA PARTE 2] ¿Hay que tapar la comida caliente antes de meterla en la heladera? (pedido por @martin_whisky99)

## Cuerpo — serie: cuerpo
- [ ] Salir con el pelo mojado te resfría
- [ ] Crujirse los nudillos da artritis
- [ ] Hay que tomar dos litros de agua por día
- [ ] Afeitarse hace que el pelo crezca más grueso
- [ ] Tragarte un chicle tarda siete años en salir
- [ ] Usamos solo el 10 % del cerebro
- [ ] Leer con poca luz arruina la vista

## Ciencia de todos los días — serie: ciencia (los de clima van en la serie clima)
<!-- plan B: "(wiki: Artículo; Otro | claves: palabras)" al final fija qué artículos de Wikipedia leer -->
- [usada → 010-rayo-mismo-lugar (plan B)] Un rayo nunca cae dos veces en el mismo lugar (wiki: Rayo | claves: mismo lugar veces Empire State edificio pararrayos)
- [ ] Los perros ven en blanco y negro (wiki: Perro | claves: visión color colores dicromático ojos retina)
- [ ] Los murciélagos son ciegos (wiki: Chiroptera; Ecolocalización | claves: ciegos ojos visión ecolocalización)
- [ ] Los peces tienen memoria de tres segundos
- [ ] La Muralla China se ve desde el espacio (wiki: Gran Muralla china | claves: espacio órbita astronauta vista)
- [usada → 014-celular-arroz] El celular mojado se arregla en arroz
- [ ] Dejar el auto en marcha para que "caliente" antes de salir

## Matemática y estrategia de todos los días (lo que más se comparte en las cuentas de referencia) — serie: mate
- [ ] ¿Conviene cambiarte de fila en el súper? Qué dice la matemática de las colas
- [ ] ¿Sirve cambiar de carril en la autopista o en la General Paz?
- [ ] ¿Cuántos días de tu vida pasás esperando el colectivo?
- [usada → 022-colectivo-de-a-dos] ¿Por qué el colectivo que esperás viene siempre lleno y de a dos? (el "apelotonamiento")
- [ ] Partir la pizza en partes iguales con cortes que no pasan por el centro
- [ ] ¿Cuánta gente tiene que haber en una juntada para que dos cumplan el mismo día? (paradoja del cumpleaños)
- [ ] El truco para no perder en el piedra, papel o tijera
- [ ] ¿Por qué el ascensor siempre está en el piso equivocado?

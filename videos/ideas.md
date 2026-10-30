# Ideas de videos (banco de temas)

La producción nocturna toma la primera idea **sin marcar** de arriba hacia abajo. Al usarla se marca `[usada → slug]`; si la investigación la tumba, `[descartada: motivo]`.
Ninguna idea de acá está verificada: cada una se investiga y se chequea antes de hacerse.
Cada sección dice a qué serie van sus videos (`tlx serie asignar <slug> <serie>`). Los objetos que se explican "por dentro" en 3D van a la serie `pordentro`.

## Pedidos de Mateo (prioridad máxima: van antes que todo, salvo un 🔥 del radar; un pedido sin hacer se produce en el próximo turno aunque sobren videos listos)
- [ ] REHACER EN 3D (regla 27/10: solo se publica 3D). Uno por turno, en este orden: 024-granizo-corto, 021-heladera-parte-2, 019-sensacion-termica, 008-aire-en-17, 014-celular-arroz, 018-refresca-tormenta, 012-lavar-pollo. Mismo slug (`tlx cola estado <slug> produccion`), reusar guion.json y chequeo.json; la voz NO está (se borra del Release al quedar listo el video): regenerala con `voz.py <slug>` (1 pedido de Gemini, mismo guion) antes de renderizar; solo se escribe un Video.tsx nuevo con kit3d y se manda a render. Si el guion no se entiende a la primera, se puede reescribir (y entonces se rehace voz y chequeo). Marcar acá cada slug rehecho; cuando estén todos, marcar este pedido [x]. Rehechos: 024-granizo-corto, 021-heladera-parte-2, 019-sensacion-termica (28/10), 008-aire-en-17 (29/10), 014-celular-arroz (29/10).
- [ ] HELADERA PARTE 2 (serie: cocina). Segunda parte del 001-heladera, el más enviado de la cuenta (73 K vistas, 2.206 enviados): ¿hay que tapar la comida caliente antes de meterla en la heladera? (lo pidió @martin_whisky99 en los comentarios). El gancho nombra la primera parte ("En la parte 1 te dije que no la dejes enfriar afuera. Me preguntaron: ¿y la tapo?") y el caption arranca con "Parte 2 de la heladera". Puede ir en 2D con el mismo mundo del 001 (heladera, olla, tuppers chatos) para que se reconozca como continuación. Es seguridad alimentaria: solo lo verificado (USDA/FSIS, ANMAT). Si la investigación da "depende" sin una regla clara, hacé la parte 2 con otra pregunta de heladera que sí la tenga (por ejemplo, cuántos días dura la comida cocida guardada). Cierre: "mandáselo al que guarda la olla entera con la tapa puesta".
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

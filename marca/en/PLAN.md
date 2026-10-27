# Let me explain (@letmeexplain.us): plan

Cuenta hermana en inglés de @teloexplico.ar, para EE. UU. Mismo sistema y mismas reglas: todo lo aprendido en español vale acá (`.claude/skills/producir-video`, `marca/AUDITORIA_REFERENCIAS.md`, `marca/DIRECCION_ARTE.md`).

## Ya hecho (27/10/2026)
- IG @letmeexplain.us (profesional) vinculado a la página de FB "Let me explain" (Graph 1332812279925095, IG 17841426184483502). Token de página que no vence en `secretos/meta_en.json`.
- TikTok @letmeexplain.us creado. YouTube @letmeexplainus: falta.
- Mail: letmeexplain.us@gmail.com.
- Marca: mismo personaje burbuja con fondo de cuaderno, burbuja roja `#FF4D2E`, resaltado celeste `#7FD3FF`. Archivos en esta carpeta (`FOTO_PERFIL.png`, `PORTADA_FB.png`, `portada_fb.html`).
- Voz: Gemini `en-us-podcaster-5`, con el RITMO en inglés ("Natural pace, like talking to a friend, short pauses between sentences.").

## Adaptar a EE. UU. (no traducir)
- °F, libras, onzas, millas y dólares. Marcas y costumbres de allá: nada de mate, asado, pava ni yerba.
- Fuentes de allá cuando existan (USDA, FDA, CDC, NOAA, Consumer Reports, America's Test Kitchen).
- Cierre: "Send this to the friend who…". Sello final: "follow @letmeexplain.us · one myth a day".
- Hashtags: #funfacts, #mythbusting, #lifehacks y del tema.

## Cómo quedó armado (27/10/2026, pasos 1 y 2)
- `herramientas/cuenta.py`: datos de cada cuenta (carpeta, voz, idioma, secretos, turnos, textos fijos). Los slugs de inglés empiezan con **`en-`** (`en-001-phone-rice`): así no chocan con los de español en el Release, `motor/public` ni los ids del motor, y cada herramienta sabe la cuenta solo con el slug.
- Videos, cola, publicados y logs de inglés en `videos/en/`. Series en `motor/src/kit/series_en.json` (mismas claves, nombres en inglés: Home myths, Kitchen myths…).
- Lo que trabaja sobre la cuenta entera usa `TLX_CUENTA=en` (por defecto `es`): `TLX_CUENTA=en ./herramientas/tlx cola`, publicador, estado (`PANEL_en.html`). Los avisos al celular de inglés llevan `[EN]`.
- Publicador en inglés: 11:30 y 19:00 de Nueva York; Instagram + Facebook con `meta_en.json` (y si las credenciales no son de la cuenta del slug, no publica). TikTok y YouTube apagados para inglés hasta el paso 5.
- Motor: `kit/cuenta.ts` saca la cuenta del id ("hen-…"): logo "let me explain", burbuja roja, resaltado celeste, "source:", "follow @letmeexplain.us for #2".
- Prueba de español: 12 cuadros del 020 (3D) y del 021 (2D, con portada y cierre) salen idénticos al píxel antes y después del cambio. Los renders completos no se pueden repetir porque las voces ya no están en el disco.
- **Publicación automática (27/10, segunda parte):** el flujo *Publicar* de GitHub mira las dos cuentas en cada corrida (más 6 disparos extra por día para los turnos de Nueva York en horario de verano y de invierno). En el modo manual se elige la cuenta (`todas`, `es`, `en`). La parte de inglés solo corre si existe el secreto `META_EN_JSON` (lo carga `herramientas/nube/cargar_secretos.cmd`). Instagram y Facebook salen solos. TikTok va a la bandeja como borrador más Telegram, igual que en español, con su propio token (`secretos/tiktok_token_en.json` → `estado/tiktok_token_en.enc`). Mientras no haya producción, con la cola vacía avisa una sola vez por turno y sin sonar.
- Falta para la nube (paso 4): `producir.py`, `sincronizar.py`, métricas, comentarios, carruseles, plan B y los flujos de GitHub todavía son solo de español.

## Pasos
1. **Cuenta como parámetro** ✅ 27/10 (`TLX_CUENTA=en`): carpeta de videos/cola/ideas/publicados propia, voz e idioma (voz.py y control.py usan Whisper con `language='en'`), textos fijos del kit (cierre, sello, serie, portada), secretos `meta_en.json`, horarios de EE. UU. (11:30 y 19:00 de Nueva York). Sin cambiar nada para la cuenta en español: probar que el 020 sigue renderizando igual.
2. **Piloto**: el celular en el arroz (014), versión EE. UU. ("You dropped your phone in water…"), con la fuente de Apple. Mateo lo ve antes de publicar. ✅ 27/10: `videos/en/en-001-phone-rice/` (46 s, Home myths #1, chequeo aprobado, control OK). Está **apartado** hasta que Mateo lo apruebe; para dejarlo listo: `TLX_CUENTA=en ./herramientas/tlx cola estado en-001-phone-rice listo "aprobado por Mateo"`.
3. **Adaptar los que funcionaron**: heladera 1 y 2, ventilador, aire acondicionado (en °F), descongelar, lavar el pollo, pava en 3D (las pavas eléctricas son menos comunes allá: evaluar).
4. **Automatizar**: producción, radar (actualidad de EE. UU.), publicador, métricas y comentarios por cuenta en los flujos de GitHub. Cuotas compartidas: Gemini TTS (10 pedidos por día) y la suscripción de Claude.
5. YouTube y TikTok como en español: YouTube por API, TikTok como borrador más Telegram.

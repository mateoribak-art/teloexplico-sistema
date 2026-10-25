"""Plan B: produce un video SIN Claude (cuando la suscripción no tiene cuota y la cola se está vaciando).

Uso: python -I plan_b.py [--probar | --revisar]
  --probar: hace guion y chequeo pero no voz, render ni cola
  --revisar: hace todo pero deja el video apartado (para probar sin que se publique)

1. Toma la primera idea libre de las secciones seguras de videos/ideas.md (nada de salud, seguridad ni plata).
2. Investiga en Wikipedia en español (gratis, sin clave).
3. Gemini (plan gratis) escribe guion, caption y escenas usando SOLO ese texto.
4. Otra pasada de Gemini chequea cada afirmación y tiene que citar textual la frase de la fuente que la respalda;
   este script verifica que cada cita exista de verdad en el texto. Si algo no está respaldado, el video no sale.
5. Voz (voz.py), render con la plantilla (motor/src/plantilla), control técnico (control.py) y a la cola como "listo".
Log: videos/produccion.log · Aviso al celular al terminar.
"""
import json, os, re, subprocess, sys, time, unicodedata, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, H)
import cola  # noqa: E402
from avisar import avisar  # noqa: E402

PY = sys.executable
V = os.path.join(RAIZ, 'videos')
IDEAS = os.path.join(V, 'ideas.md')
# cada modelo tiene su propia cuota gratis diaria: si uno se agota, se pasa al siguiente (los "lite" al final)
MODELOS = ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.1-flash-lite']
SECCIONES_SEGURAS = ['Ciencia de todos los días', 'Plan B']
OBJETOS = ['nube', 'sol', 'heladera', 'olla', 'sarten', 'bife', 'persona', 'anafe', 'termometro', 'vaso', 'barrio', 'auto', 'ninguno']
TIPOS = ['gancho', 'golpe', 'objeto', 'dato', 'comparacion', 'ojo', 'cta']
UA = {'User-Agent': 'TeLoExplicoPlanB/1.0 (teloexplicoar@gmail.com)'}


def log(msg):
    linea = f"{__import__('datetime').datetime.now():%Y-%m-%d} | plan B | {msg}"
    print(linea)
    open(os.path.join(V, 'produccion.log'), 'a', encoding='utf-8').write(linea + '\n')


# ---------- Gemini ----------
def gemini(prompt, temperatura=0.6):
    clave = open(os.path.join(RAIZ, 'secretos', 'gemini_key.txt'), encoding='utf-8-sig').read().strip()
    cuerpo = {'contents': [{'parts': [{'text': prompt}]}],
              'generationConfig': {'responseMimeType': 'application/json', 'temperature': temperatura}}
    errores = []
    # Gemini gratis a veces está saturado (503) o limita por minuto (429): reintentos con espera, después otro modelo
    for vuelta in range(3):
        for m in MODELOS:
            req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent',
                                         data=json.dumps(cuerpo).encode(), headers={'x-goog-api-key': clave, 'Content-Type': 'application/json'})
            try:
                r = json.load(urllib.request.urlopen(req, timeout=300))
                texto = ''.join(p.get('text', '') for p in r['candidates'][0]['content']['parts'])
                return json.loads(texto)
            except Exception as e:
                errores.append(f'{m}: {str(e)[:80]}')
        time.sleep(30 * (vuelta + 1))
    raise RuntimeError('Gemini no respondió: ' + ' | '.join(errores[-3:]))


# ---------- Wikipedia ----------
def wikipedia(busquedas, maximo=3, articulos=(), claves=''):
    textos, vistos = [], set()
    consulta = ' '.join(busquedas) + ' ' + claves
    # artículos fijados en la idea (la búsqueda sola trae cosas como "Rayo Vallecano" para el mito del rayo)
    for titulo in articulos:
        u = 'https://es.wikipedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'prop': 'extracts', 'explaintext': 1, 'titles': titulo, 'format': 'json', 'redirects': 1})
        pag = next(iter(json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))['query']['pages'].values()))
        ext = relevante(pag.get('extract') or '', consulta)
        if len(ext) > 400:
            vistos.add(pag.get('title', titulo))
            textos.append((pag.get('title', titulo), ext))
    if textos:
        return textos
    for q in busquedas:
        u = 'https://es.wikipedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'list': 'search', 'srsearch': q, 'format': 'json', 'srlimit': 2})
        for res in json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))['query']['search']:
            titulo = res['title']
            if titulo in vistos or len(vistos) >= maximo:
                continue
            vistos.add(titulo)
            u2 = 'https://es.wikipedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'prop': 'extracts', 'explaintext': 1, 'titles': titulo, 'format': 'json'})
            pag = next(iter(json.load(urllib.request.urlopen(urllib.request.Request(u2, headers=UA), timeout=60))['query']['pages'].values()))
            ext = relevante(pag.get('extract') or '', ' '.join(busquedas))
            if len(ext) > 400:
                textos.append((titulo, ext))
    return textos


def relevante(texto, consulta, maximo=9000):
    """Se queda con los párrafos que más hablan del tema (la parte útil suele estar lejos del principio del artículo)."""
    claves = {w for w in normal(consulta) if len(w) > 3}
    parrafos = [p for p in texto.split('\n') if len(p.strip()) > 60]
    if not parrafos:
        return ''
    puntaje = lambda p: sum(1 for w in normal(p) if w in claves) / (1 + len(p) / 600)
    elegidos = set()
    largo = len(parrafos[0])
    elegidos.add(0)  # la introducción siempre
    for i in sorted(range(len(parrafos)), key=lambda i: -puntaje(parrafos[i])):
        if largo + len(parrafos[i]) > maximo:
            continue
        if puntaje(parrafos[i]) > 0:
            elegidos.add(i)
            largo += len(parrafos[i])
    return '\n'.join(parrafos[i] for i in sorted(elegidos))


def normal(s):
    s = unicodedata.normalize('NFKD', s.lower())
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9 ]+', ' ', s).split()


# palabras que no cuentan como "dato" (relleno, voseo, conectores)
VACIAS = set(normal('''
mito mitos verdad verso posta realidad creencia popular gente todos todas mucho muchos muchas siempre nunca tambien ademas porque cuando
entonces asi aunque segun cientificos cientifico estudio estudios dicen dice creen cree mandaselo amigo amigos tenes sabias mira ojo
comiste enorme totalmente bastante bien bueno buena mismo misma tienen tiene hacen hace pueden puede estan esta eso esos esas este esta
sobre entre desde hasta donde como nada otro otra otros otras cada solo solamente gracias queda quedan descartado falso falsa cierto cierta
siquiera clave posta enserio igual medio bastante tremendo barbaro barbara
'''))


def palabras_ausentes(afirmacion, fuente):
    """Palabras con contenido (5+ letras) de la afirmación que no aparecen en ninguna parte de la fuente.
    Atrapa agregados inventados ("y en color") aunque la cita sea real. Se compara por raíz (primeras 5 letras)."""
    palabras = normal(fuente)
    raices = {w[:5] for w in palabras}
    cifras = {w for w in palabras if w.isdigit()} | {w.replace(' ', '') for w in re.findall(r'\d[\d .]*\d|\d', fuente.replace('.', ''))}
    faltan = []
    for valor, texto in numeros_en_palabras(afirmacion):  # "mil novecientos treinta y ocho" → 1938
        if str(valor) not in cifras:
            faltan.append(texto)
    for w in normal(afirmacion):
        if len(w) < 5 or w in VACIAS or w in NUMEROS or w in UNIDADES:
            continue
        if w[:5] not in raices:
            faltan.append(w)
    return faltan


UNIDADES = {'un': 1, 'uno': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9,
            'diez': 10, 'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciseis': 16, 'diecisiete': 17,
            'dieciocho': 18, 'diecinueve': 19, 'veinte': 20, 'veintiun': 21, 'veintiuno': 21, 'veintidos': 22, 'veintitres': 23,
            'veinticuatro': 24, 'veinticinco': 25, 'veintiseis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29,
            'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90,
            'cien': 100, 'ciento': 100, 'doscientos': 200, 'trescientos': 300, 'cuatrocientos': 400, 'quinientos': 500,
            'seiscientos': 600, 'setecientos': 700, 'ochocientos': 800, 'novecientos': 900}


def numeros_en_palabras(frase):
    """Devuelve [(valor, texto)] de los números escritos en palabras (desde 10, los chicos no se chequean)."""
    ws, salida, i = normal(frase), [], 0
    while i < len(ws):
        if (ws[i] in UNIDADES or ws[i] in ('mil', 'millon', 'millones')) and not (ws[i] == 'ciento' and i > 0 and ws[i - 1] == 'por'):
            total, actual, j = 0, 0, i
            while j < len(ws) and (ws[j] in UNIDADES or ws[j] in ('mil', 'millon', 'millones') or (ws[j] == 'y' and j + 1 < len(ws) and ws[j + 1] in UNIDADES)):
                w = ws[j]
                if w in UNIDADES:
                    actual += UNIDADES[w]
                elif w == 'mil':
                    total += (actual or 1) * 1000
                    actual = 0
                elif w in ('millon', 'millones'):
                    total += (actual or 1) * 1000000
                    actual = 0
                j += 1
            valor = total + actual
            if valor >= 10:
                salida.append((valor, ' '.join(ws[i:j])))
            i = j
        else:
            i += 1
    return salida


NUMEROS = {'cuatro': 4, 'cinco': 5, 'siete': 7, 'nueve': 9, 'veinte': 20, 'treinta': 30, 'cuarenta': 40, 'cincuenta': 50,
           'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90, 'ciento': 100, 'doscientos': 200, 'trescientos': 300,
           'quinientos': 500, 'millon': 1000000, 'millones': 1000000}


def cita_existe(cita, fuente):
    """La cita tiene que estar en la fuente (ignorando acentos/puntuación); se aceptan citas de 6+ palabras seguidas."""
    c, f = normal(cita), ' '.join(normal(fuente))
    if len(c) < 6:
        return ' '.join(c) in f and len(c) >= 3
    # alcanza con un tramo de 6 palabras seguidas que esté textual
    return any(' '.join(c[i:i + 6]) in f for i in range(0, len(c) - 5))


# ---------- ideas ----------
def tomar_idea():
    lineas = open(IDEAS, encoding='utf-8').read().splitlines()
    seccion = ''
    for i, l in enumerate(lineas):
        if l.startswith('## '):
            seccion = l[3:].strip()
        if l.startswith('- [ ]') and any(seccion.startswith(s) for s in SECCIONES_SEGURAS):
            return i, l[5:].strip()
    return None, None


def marcar_idea(i, marca):
    lineas = open(IDEAS, encoding='utf-8').read().splitlines()
    lineas[i] = lineas[i].replace('- [ ]', f'- [{marca}]', 1)
    open(IDEAS, 'w', encoding='utf-8').write('\n'.join(lineas) + '\n')


def siguiente_numero():
    nums = [int(d[:3]) for d in os.listdir(V) if re.match(r'^\d{3}-', d)]
    return max(nums, default=0) + 1


# ---------- prompts ----------
REGLAS = """Sos el guionista de @teloexplico.ar: reels que desarman mitos de la vida cotidiana argentina.
Escribí en español rioplatense (voseo), frases cortas, como contándole a un amigo. Nunca uses la palabra "posta".
REGLA DE ORO: usá SOLO información que esté en el TEXTO FUENTE de abajo. Nada de memoria, nada inventado.
Descartá SOLO en dos casos: (a) el texto fuente no dice nada que permita desarmar el mito, o (b) el texto confirma que el mito es CIERTO.
Si el texto muestra que el mito es falso o exagerado, ESE es el video: no lo descartes. Para descartar devolvé {"descartar": "motivo"}."""


def pedir_guion(idea, fuentes, correccion=''):
    texto = '\n\n'.join(f'### Wikipedia: {t}\n{x}' for t, x in fuentes)
    return gemini(f"""{REGLAS}

MITO A DESARMAR: {idea}
{('CORRECCIÓN PEDIDA (el chequeo anterior rechazó esto): ' + correccion) if correccion else ''}

Devolvé JSON con esta forma exacta:
{{
 "slug_palabras": "2 o 3 palabras sin acentos separadas por guion (ej. perros-colores)",
 "titulo": "la pregunta del mito",
 "frases": [{{"texto": "...", "estilo": "indicación corta de tono"}}],
 "escenas": [{{"tipo": "...", ...}}],
 "caption": "...",
 "portada": {{"arriba": "pregunta corta", "grande": "1 o 2 palabras", "sello": "MITO | DATO | CIENCIA", "objeto": "..."}}
}}
- frases: 9 a 12 (35–50 s de voz). Estructura: gancho (pregunta del mito) → golpe ("Es al revés.", "Te comiste un verso.") →
  mecanismo simple (2–3 frases) → dato con la fuente dicha ("Según la enciclopedia…" no; decí la institución o estudio que nombre el texto, o "los científicos") →
  "Ojo:" con el matiz → remate → "Mandáselo a ese que…" (cierre cómplice y gracioso).
  Números escritos en palabras ("veinte", "mil novecientos"). Sin siglas difíciles.
- escenas: UNA por frase, en el mismo orden. tipo ∈ {TIPOS}. objeto ∈ {OBJETOS} (elegí el que mejor ilustre; "ninguno" si no hay).
  gancho: {{"tipo":"gancho","etiqueta":"el mito","objeto":"…","sello":"¿MITO?"}}
  golpe: {{"tipo":"golpe","etiqueta":"la verdad","titulo":"…corto…","respuesta":"…2 o 3 palabras…","objeto":"…","sello":"MITO"}}
  objeto: {{"tipo":"objeto","etiqueta":"…","objeto":"…","rotulo":"…máx 6 palabras…"}}
  dato: {{"tipo":"dato","etiqueta":"…","numero":123,"antes":"","despues":" años","rotulo":"…","objeto":"…","fuente":"nombre de la fuente"}} (el número en cifras, tiene que estar en el texto fuente)
  comparacion: {{"tipo":"comparacion","etiqueta":"…","izquierda":"lo que se cree (máx 7 palabras)","derecha":"lo real (máx 7 palabras)"}}
  ojo: {{"tipo":"ojo","texto":"el matiz en máx 14 palabras","objeto":"…"}}
  cta: {{"tipo":"cta","globo":"la frase graciosa que diría ese amigo (máx 6 palabras)"}}
  etiquetas en minúscula, máx 3 palabras. La primera escena es gancho, la segunda golpe, la anteúltima o la del "Ojo" es ojo, la última cta. Usá al menos una comparacion y, si el texto tiene un número fuerte, un dato.
- caption: primera línea con gancho + emoji; 2–3 párrafos cortos con el dato; "Ojo: …"; "👇 Mandáselo a ese que…"; una pregunta para comentarios;
  "Fuentes: Wikipedia ({', '.join(t for t, _ in fuentes)})"; "Seguí a @teloexplico.ar: un dato por día."; 5 hashtags (#datoscuriosos + 4 del tema).

TEXTO FUENTE:
{texto}
""")


def chequear(guion, caption, fuentes, idea=''):
    texto = '\n\n'.join(f'### {t}\n{x}' for t, x in fuentes)
    frases = '\n'.join(f"- {f['texto']}" for f in guion['frases'])
    r = gemini(f"""Sos un chequeador de datos estricto. Revisá cada afirmación FÁCTICA del guion y del caption contra el TEXTO FUENTE.
Para cada una devolvé la cita TEXTUAL (copiada letra por letra, mínimo 6 palabras seguidas) del texto fuente que la respalda.
Si no hay una frase del texto que la respalde, estado "no_respaldada" y cita "". Las frases de humor u opinión ("mandáselo…") no son afirmaciones.
Devolvé JSON: {{"afirmaciones": [{{"texto": "...", "cita": "...", "estado": "verificada" | "no_respaldada"}}]}}

GUION:
{frases}

CAPTION:
{caption}

TEXTO FUENTE:
{texto}
""", temperatura=0.1)
    todo = ' '.join(x for _, x in fuentes)
    malas = []
    for a in r.get('afirmaciones', []):
        frase = a.get('texto', '').strip()
        if frase.endswith('?') or frase.startswith('¿'):
            a['estado'] = 'no_es_afirmacion'  # las preguntas del gancho no afirman nada
            continue
        # las palabras del mito cuentan como presentes: para desarmarlo hay que nombrarlo ("no ven en blanco y negro")
        faltan = palabras_ausentes(frase, todo + ' ' + idea)
        contenido = [w for w in normal(frase) if len(w) >= 5 and w not in VACIAS]
        numeros_mal = [w for w in faltan if any(c in UNIDADES or c == 'mil' for c in w.split())]
        # paráfrasis: se toleran 2 palabras que no estén literales (con cita textual real de 6+ palabras); números, nunca.
        # Con 1 sola (hasta el 25/10) se rechazaba hasta "perciben colores igual que una persona daltónica".
        demasiadas = numeros_mal or len(faltan) >= 3 or (contenido and len(faltan) / len(contenido) > 0.34)
        if faltan:
            a['faltan_en_fuente'] = faltan
        if a.get('estado') != 'verificada' or not cita_existe(a.get('cita', ''), todo) or demasiadas:
            a['estado'] = 'no_respaldada'
            malas.append(a.get('texto', '')[:120])
    return r.get('afirmaciones', []), malas


def validar_escenas(g, fuentes):
    n = len(g['frases'])
    esc = (g.get('escenas') or [])[:n]
    while len(esc) < n:
        esc.append({'tipo': 'objeto', 'objeto': 'ninguno'})
    todo = ' '.join(x for _, x in fuentes)
    for e in esc:
        if e.get('tipo') not in TIPOS:
            e['tipo'] = 'objeto'
        if e.get('objeto') not in OBJETOS:
            e['objeto'] = 'ninguno'
        if e['tipo'] == 'dato':
            num = e.get('numero')
            # el número tiene que estar en la fuente; si no, la escena pasa a ser un rótulo
            if not isinstance(num, (int, float)) or (str(int(num)) not in todo.replace('.', '')):
                e['tipo'] = 'objeto'
                e.pop('numero', None)
        for k, v in list(e.items()):
            if isinstance(v, str):
                e[k] = re.sub(r'(?i)\bposta\b', 'dato', v)
    esc[0]['tipo'] = 'gancho'
    esc[-1] = {'tipo': 'cta', 'globo': esc[-1].get('globo', '¿en serio?')}
    return esc


def correr(args, **kw):
    return subprocess.run(args, capture_output=True, text=True, encoding='utf-8', errors='replace', **kw)


def producir(probar=False, revisar=False):
    for _ in range(3):
        i, idea = tomar_idea()
        if idea is None:
            log('no quedan ideas en las secciones seguras de ideas.md')
            return None
        # "(wiki: Perro; Visión | claves: color dicromático)" al final de la idea: artículos a leer y palabras para elegir párrafos
        articulos, extra = [], ''
        m = re.search(r'\(wiki:\s*([^)|]*)(?:\|\s*claves:\s*([^)]*))?\)\s*$', idea)
        if m:
            articulos = [a.strip() for a in m.group(1).split(';') if a.strip()]
            extra = (m.group(2) or '').strip()
            idea = idea[:m.start()].strip()
        # búsquedas armadas acá (sin gastar cuota de Gemini): el tema entero y sus palabras clave
        claves = [w for w in re.findall(r'\w+', idea) if len(w) > 4 and w.lower() not in ('nunca', 'siempre', 'mismo', 'lugar', 'desde', 'tienen')]
        fuentes = wikipedia([idea, ' '.join(claves[:3]), ' '.join(claves[:2])], articulos=articulos, claves=extra)
        if not fuentes:
            marcar_idea(i, 'descartada: plan B sin fuente en Wikipedia')
            continue
        correccion = ''
        for intento in range(2):
            g = pedir_guion(idea, fuentes, correccion)
            if g.get('descartar'):
                break
            afirmaciones, malas = chequear(g, g.get('caption', ''), fuentes, idea)
            if not malas:
                break
            correccion = 'Sacá o reescribí estas afirmaciones que no están en el texto fuente: ' + ' | '.join(malas)
        if g.get('descartar') or malas:
            marcar_idea(i, f"descartada: plan B — {g.get('descartar') or 'chequeo rechazado'}"[:200])
            log(f'idea descartada: {idea} ({g.get("descartar") or "; ".join(malas)[:150]})')
            continue
        slug = f"{siguiente_numero():03d}-{re.sub(r'[^a-z0-9-]', '', g.get('slug_palabras', 'dato').lower())[:30].strip('-') or 'dato'}"
        carpeta = os.path.join(V, slug)
        os.makedirs(carpeta, exist_ok=True)
        guion = {'titulo': g['titulo'], 'fuentes': [f'Wikipedia: {t}' for t, _ in fuentes], 'frases': g['frases'], 'plan_b': True}
        json.dump(guion, open(os.path.join(carpeta, 'guion.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        caption = re.sub(r'(?i)\bposta\b', 'dato', g['caption'])
        open(os.path.join(carpeta, 'caption.txt'), 'w', encoding='utf-8').write(caption.strip() + '\n')
        json.dump({'veredicto': 'aprobado', 'motivo': 'plan B: cada afirmación tiene cita textual verificada en Wikipedia',
                   'afirmaciones': afirmaciones}, open(os.path.join(carpeta, 'chequeo.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        portada = g.get('portada', {})
        portada['numero'] = int(slug[:3])
        if portada.get('objeto') not in OBJETOS:
            portada['objeto'] = 'ninguno'
        props = {'slug': slug, 'escenas': validar_escenas(g, fuentes), 'portada': portada}
        json.dump(props, open(os.path.join(carpeta, 'escenas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        marcar_idea(i, f'usada → {slug} (plan B)')
        log(f'{slug}: guion y chequeo listos ({len(afirmaciones)} afirmaciones citadas)')
        if probar:
            return slug

        cola.agregar(slug, g['titulo'])
        cola.cambiar_estado(slug, 'produccion', 'plan B')
        r = correr([PY, '-I', 'voz.py', slug], cwd=H)
        if r.returncode == 3:
            log(f'{slug}: cuota de voz de Gemini agotada, queda en producción')
            return None
        if r.returncode != 0:
            cola.cambiar_estado(slug, 'apartado', 'plan B: falló la voz')
            log(f'{slug}: falló la voz: {(r.stdout + r.stderr)[-200:]}')
            return None
        # render con la plantilla + portada + volumen a -14 LUFS (igual que tlx render)
        m = os.path.join(RAIZ, 'motor')
        bruto = os.path.join(carpeta, 'render.mp4')
        pasos = [
            ['npx.cmd', 'remotion', 'render', 'plantilla', bruto, f'--props={os.path.join(carpeta, "escenas.json")}', '--codec=h264', '--crf=18', '--audio-codec=aac', '--log=error'],
            ['npx.cmd', 'remotion', 'still', 'plantillaPortada', os.path.join(carpeta, 'portada.png'), f'--props={os.path.join(carpeta, "escenas.json")}', '--log=error'],
        ]
        for p in pasos:
            r = correr(p, cwd=m)
            if r.returncode != 0:
                cola.cambiar_estado(slug, 'apartado', 'plan B: falló el render')
                log(f'{slug}: falló el render: {(r.stdout + r.stderr)[-300:]}')
                return None
        r = correr(['ffmpeg', '-v', 'error', '-y', '-i', bruto, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000',
                    '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', os.path.join(carpeta, f'{slug}.mp4')])
        os.remove(bruto)
        tiempos = json.load(open(os.path.join(RAIZ, 'motor', 'public', slug, 'tiempos.json'), encoding='utf-8'))
        json.dump({'portada_ms': int(tiempos['frases'][1]['inicio'] * 1000 + 900)}, open(os.path.join(carpeta, 'meta.json'), 'w'))
        from control import controlar
        problemas = controlar(slug)
        if problemas:
            cola.cambiar_estado(slug, 'apartado', 'plan B: ' + '; '.join(problemas))
            log(f'{slug}: apartado en el control: {"; ".join(problemas)}')
            return None
        if revisar:  # prueba: queda apartado hasta que alguien lo mire
            cola.cambiar_estado(slug, 'apartado', 'prueba del plan B: revisar antes de publicar')
            log(f'{slug}: terminado (prueba, queda apartado para revisar)')
            avisar('🅱️ Prueba del plan B lista', f'{slug}: {g["titulo"]}\nQuedó apartado para revisarlo.', 'baja')
            return slug
        cola.cambiar_estado(slug, 'listo', 'plan B (sin Claude)')
        log(f'{slug}: listo (plan B)')
        avisar('🅱️ Plan B: video listo sin Claude', f'{slug}: {g["titulo"]}\nGuion de Gemini chequeado contra Wikipedia, con plantilla.', 'baja')
        return slug
    return None


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    try:
        print('resultado:', producir(probar='--probar' in sys.argv, revisar='--revisar' in sys.argv))
    except Exception as e:
        log(f'error: {e}')
        avisar('⚠️ Plan B falló', str(e)[:300])
        raise

"""Voz de un video: Gemini TTS + pausas recortadas + tiempos por palabra.

Uso:  python -I voz.py <slug>
Lee   videos/<slug>/guion.json   ->  {"frases": [{"texto": "...", "estilo": "..."}, ...]}
Deja  motor/public/<slug>/voz.wav      (pausas de 0,4 s como máximo, -14 LUFS)
      motor/public/<slug>/tiempos.json {"duracion": s, "frases": [{inicio, fin, palabras: [{texto, inicio, fin}]}]}

Los textos de las palabras salen del guion (no de la transcripción), así los subtítulos
no arrastran errores del reconocedor. La transcripción solo aporta los tiempos.
Los videos de @letmeexplain.us ("en-…") están en videos/en/ y usan su voz e idioma (cuenta.py).
"""
import base64, difflib, json, os, re, subprocess, sys, time, unicodedata, wave
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # con python -I no se agrega solo
import cuenta  # noqa: E402
KEY = os.path.join(RAIZ, 'secretos', 'gemini_key.txt')
MODELO = 'gemini-3.8-flash-tts'
PAUSA_MAX = 0.5


def ff(*args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)


def normalizar(p):
    p = unicodedata.normalize('NFD', p.lower())
    p = ''.join(c for c in p if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', p)


class CuotaAgotada(Exception):
    pass


def _audio_en(respuesta):
    """Busca el audio (base64) en la respuesta de la API, esté donde esté."""
    if isinstance(respuesta, dict):
        if isinstance(respuesta.get('data'), str) and len(respuesta['data']) > 1000:
            return respuesta['data']
        for v in respuesta.values():
            a = _audio_en(v)
            if a:
                return a
    elif isinstance(respuesta, list):
        for v in respuesta:
            a = _audio_en(v)
            if a:
                return a
    return None


def _gemini(frases, destino, voz, ritmo, limite=150):
    """Un pedido directo a la API (sin la librería, que reintenta en silencio cuando se agota la cuota)."""
    import urllib.request, urllib.error
    cuerpo = json.dumps({
        'model': MODELO,
        'input': [{'type': 'text', 'text': f['texto'],
                   'annotations': [{'type': 'speech_metadata', 'style': f['estilo'] + ritmo}]} for f in frases],
        'response_format': {'type': 'audio'},
        'generation_config': {'speech_config': [{'voice': voz}]},
    }).encode()
    req = urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/interactions', data=cuerpo,
                                 headers={'x-goog-api-key': open(KEY, encoding='utf-8-sig').read().strip(),
                                          'Content-Type': 'application/json'})
    try:
        respuesta = json.load(urllib.request.urlopen(req, timeout=limite))
    except urllib.error.HTTPError as e:
        detalle = e.read().decode(errors='replace')[:300]
        if e.code == 429:
            raise CuotaAgotada(detalle)
        raise RuntimeError(f'HTTP {e.code}: {detalle}')
    audio = _audio_en(respuesta)
    if not audio:
        raise RuntimeError('La respuesta no trae audio: ' + json.dumps(respuesta)[:300])
    open(destino, 'wb').write(base64.b64decode(audio))


def generar(slug, destino, intentos=3):
    """Pide la voz a Gemini con límite de tiempo y reintentos. Si la cuota del día está agotada, corta enseguida."""
    frases = json.load(open(os.path.join(cuenta.carpeta(slug), 'guion.json'), encoding='utf-8'))['frases']
    c = cuenta.para(slug)
    for n in range(1, intentos + 1):
        try:
            _gemini(frases, destino, c['voz'], c['ritmo'])
            if os.path.getsize(destino) > 10000:
                return
        except CuotaAgotada as e:
            print('CUOTA AGOTADA de Gemini:', e)
            sys.exit(3)
        except Exception as e:
            print(f'Gemini falló (intento {n}/{intentos}): {e}')
        time.sleep(20 * n)
    sys.exit('No se pudo generar la voz con Gemini.')


def recortar_pausas(origen, destino, umbral_db=-40, borde=0.05):
    """Achica a PAUSA_MAX todo silencio más largo, dejando la mitad de cada lado del corte.

    (El silenceremove de ffmpeg no cortaba los silencios del medio con esta voz.)"""
    w = wave.open(origen)
    sr, canales = w.getframerate(), w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, canales)[:, 0].astype(np.float32)
    paso = sr // 100   # ventanas de 10 ms
    n = len(x) // paso
    rms = np.sqrt((x[:n * paso].reshape(n, paso) ** 2).mean(1)) / 32768
    silencio = 20 * np.log10(rms + 1e-9) < umbral_db
    tramos, k = [], 0
    while k < n:
        if silencio[k]:
            j = k
            while j < n and silencio[j]:
                j += 1
            tramos.append((k, j))
            k = j
        else:
            k += 1
    mitad = int(PAUSA_MAX / 2 * 100)
    quitar = []
    for a, b in tramos:
        if a == 0:
            quitar.append((0, max(0, b - int(borde * 100))))
        elif b == n:
            quitar.append((a + int(borde * 100), n))
        elif b - a > 2 * mitad:
            quitar.append((a + mitad, b - mitad))
    partes, desde = [], 0
    for a, b in quitar:
        partes.append(x[desde:a * paso])
        desde = b * paso
    partes.append(x[desde:])
    y = np.concatenate(partes).astype(np.int16)
    out = wave.open(destino, 'wb')
    out.setnchannels(1); out.setsampwidth(2); out.setframerate(sr)
    out.writeframes(y.tobytes())
    out.close()


def alinear(frases, wav16, idioma='es'):
    """Tiempos por palabra del guion, usando la transcripción de whisper como reloj."""
    from faster_whisper import WhisperModel
    w = wave.open(wav16)
    audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    texto_guion = ' '.join(f['texto'] for f in frases)
    segs, _ = WhisperModel('small', device='cpu', compute_type='int8').transcribe(
        audio, language=idioma, word_timestamps=True, initial_prompt=texto_guion)
    oidas = [(normalizar(x.word), x.start, x.end) for s in segs for x in s.words]
    oidas = [o for o in oidas if o[0]]

    guion = []  # (frase, texto original, clave normalizada)
    for i, f in enumerate(frases):
        for p in f['texto'].split():
            guion.append((i, p, normalizar(p)))

    tiempos = [None] * len(guion)
    sm = difflib.SequenceMatcher(a=[g[2] for g in guion], b=[o[0] for o in oidas], autojunk=False)
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == 'equal':
            for k in range(a1 - a0):
                tiempos[a0 + k] = (oidas[b0 + k][1], oidas[b0 + k][2])
        elif op == 'replace' and b1 > b0:
            # reparte el tramo oído entre las palabras del guion, proporcional al largo
            ini, fin = oidas[b0][1], oidas[b1 - 1][2]
            largos = [max(1, len(guion[a0 + k][2])) for k in range(a1 - a0)]
            t = ini
            for k, l in enumerate(largos):
                d = (fin - ini) * l / sum(largos)
                tiempos[a0 + k] = (t, t + d)
                t += d
    # palabras sin tiempo (no se oyeron): se interpolan entre vecinas
    for k in range(len(tiempos)):
        if tiempos[k] is None:
            prev = next((tiempos[j][1] for j in range(k - 1, -1, -1) if tiempos[j]), 0.0)
            nxt = next((tiempos[j][0] for j in range(k + 1, len(tiempos)) if tiempos[j]), prev + 0.3)
            tiempos[k] = (prev, max(prev + 0.05, min(nxt, prev + 0.3)))

    salida = [{'texto': f['texto'], 'palabras': []} for f in frases]
    for (i, p, _), (ini, fin) in zip(guion, tiempos):
        salida[i]['palabras'].append({'texto': p, 'inicio': round(ini, 3), 'fin': round(fin, 3)})
    for f in salida:
        f['inicio'] = f['palabras'][0]['inicio']
        f['fin'] = f['palabras'][-1]['fin']
    faltan = sum(1 for k, (op) in enumerate(tiempos) if op is None)
    return salida, len(oidas), len(guion)


def main(slug):
    carpeta = cuenta.carpeta(slug)
    publico = os.path.join(RAIZ, 'motor', 'public', slug)
    os.makedirs(publico, exist_ok=True)
    frases = json.load(open(os.path.join(carpeta, 'guion.json'), encoding='utf-8'))['frases']

    crudo = os.path.join(carpeta, 'voz_cruda.wav')
    if not os.path.exists(crudo) or '--regenerar' in sys.argv:
        print('generando voz con Gemini…')
        generar(slug, crudo)

    final = os.path.join(publico, 'voz.wav')
    recortada = os.path.join(carpeta, 'voz_recortada.wav')
    recortar_pausas(crudo, recortada)
    # limpia graves y normaliza a -14 LUFS
    ff('-i', recortada, '-af', 'highpass=f=70,loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', '48000', '-ac', '1', final)
    wav16 = os.path.join(carpeta, 'voz_16k.wav')
    ff('-i', final, '-ar', '16000', '-ac', '1', wav16)

    salida, n_oidas, n_guion = alinear(frases, wav16, cuenta.para(slug)['idioma'])
    w = wave.open(final)
    dur = w.getnframes() / w.getframerate()
    json.dump({'duracion': round(dur, 3), 'frases': salida},
              open(os.path.join(publico, 'tiempos.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'listo: {dur:.1f} s, {n_guion} palabras del guion, {n_oidas} oídas')
    for f in salida:
        print(f"  {f['inicio']:6.2f}–{f['fin']:6.2f}  {f['texto']}")


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main(sys.argv[1])

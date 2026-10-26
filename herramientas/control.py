"""Control técnico de un video antes de publicarlo. Devuelve la lista de problemas (vacía = ok).

Revisa: que existan video, caption y chequeo de datos aprobado; formato 1080×1920 H.264/AAC;
duración entre 20 y 90 s; volumen cerca de -14 LUFS; caption corto; y que la voz diga el guion
(compara la transcripción con el texto: si se pierde más del 8 % de las palabras, falla).

Uso: python -I control.py <slug>
"""
import difflib, json, os, re, subprocess, sys, unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def norm(p):
    p = unicodedata.normalize('NFD', p.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in p if unicodedata.category(c) != 'Mn'))


def sonda(video):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_name,width,height:format=duration',
                        '-of', 'json', video], capture_output=True, text=True)
    return json.loads(r.stdout or '{}')


def loudness(video):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', video, '-af', 'ebur128', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    m = re.findall(r'^\s+I:\s+(-?[\d.]+) LUFS', r.stderr, re.M)
    return float(m[-1]) if m else None


def voz_coincide(slug, video):
    import numpy as np, wave, tempfile
    from faster_whisper import WhisperModel
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # con python -I no se agrega solo
    from numeros import a_cifras
    guion = json.load(open(os.path.join(RAIZ, 'videos', slug, 'guion.json'), encoding='utf-8'))
    # whisper escribe "2013" donde el guion dice "dos mil trece": se pasan los números a cifras antes de comparar
    esperado = ''.join(norm(w) for f in guion['frases'] for w in a_cifras(f['texto']).split())
    tmp = os.path.join(tempfile.gettempdir(), f'control_{slug}.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', video, '-ac', '1', '-ar', '16000', tmp], check=True)
    w = wave.open(tmp)
    audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    w.close()
    texto = ' '.join(f['texto'] for f in guion['frases'])
    # en los procesadores de GitHub el modo int8 transcribe basura ("la parrilla se precauce…", 26/10): allá, precisión completa
    calculo = 'int8' if os.name == 'nt' else 'float32'
    segs, _ = WhisperModel('small', device='cpu', compute_type=calculo).transcribe(audio, language='es', initial_prompt=texto)
    segs = list(segs)
    oido = ''.join(norm(x) for s in segs for x in a_cifras(s.text).split())
    os.remove(tmp)
    # comparación letra por letra: "ari rang" / "arirang" o "armi" / "army" casi no restan; una frase cambiada sí
    sm = difflib.SequenceMatcher(a=esperado, b=oido, autojunk=False)
    parecido = sum(b.size for b in sm.get_matching_blocks()) / max(1, len(esperado))
    if parecido < 0.92:  # para entender el porqué en el registro (la nube daba distinto que la PC, 26/10)
        print(f'control de voz {parecido:.0%}: esperado {len(esperado)} letras, oído {len(oido)}')
        print('  oído:', ' '.join(s.text.strip() for s in segs)[:500] if isinstance(segs, list) else oido[:500])
    return parecido


def controlar(slug, voz=True):
    carpeta = os.path.join(RAIZ, 'videos', slug)
    video = os.path.join(carpeta, f'{slug}.mp4')
    problemas = []
    for archivo in (video, os.path.join(carpeta, 'caption.txt'), os.path.join(carpeta, 'guion.json')):
        if not os.path.exists(archivo):
            problemas.append(f'falta {os.path.basename(archivo)}')
    if problemas:
        return problemas

    chequeo = os.path.join(carpeta, 'chequeo.json')
    if not os.path.exists(chequeo):
        problemas.append('falta el chequeo de datos')
    else:
        c = json.load(open(chequeo, encoding='utf-8'))
        if c.get('veredicto') != 'aprobado':
            problemas.append(f"chequeo de datos: {c.get('veredicto')} ({c.get('motivo', '')})")

    info = sonda(video)
    streams = {s['codec_name']: s for s in info.get('streams', [])}
    v = streams.get('h264')
    if not v or (v.get('width'), v.get('height')) != (1080, 1920):
        problemas.append('el video no es H.264 1080×1920')
    if 'aac' not in streams:
        problemas.append('falta audio AAC')
    dur = float(info.get('format', {}).get('duration', 0))
    if not 20 <= dur <= 90:
        problemas.append(f'duración rara: {dur:.1f} s')
    lu = loudness(video)
    if lu is None or not -16.5 <= lu <= -12:
        problemas.append(f'volumen fuera de rango: {lu} LUFS')
    caption = open(os.path.join(carpeta, 'caption.txt'), encoding='utf-8').read()
    if not 80 <= len(caption) <= 2200:
        problemas.append(f'caption de largo raro: {len(caption)} caracteres')
    if voz and not problemas:
        coincide = voz_coincide(slug, video)
        if coincide < 0.92:
            problemas.append(f'la voz no coincide con el guion ({coincide:.0%})')
    return problemas


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    p = controlar(sys.argv[1])
    print('OK' if not p else 'PROBLEMAS:\n- ' + '\n- '.join(p))

"""Paquete para TikTok (@teloexplico.ar) y YouTube Shorts (@teloexplicoar, sin punto) de un video ya publicado en Instagram.

Mientras YouTube y TikTok no aprueben la auditoría de su API (sin auditoría todo queda privado), la subida
la hace Mateo desde el celular: este script le deja el video y los textos listos.

Uso: python -I multired.py <slug> [--sin-avisar]
- Escribe videos/<slug>/tiktok.txt y videos/<slug>/youtube.txt.
- Copia el video en calidad completa, los textos y la portada a OneDrive/TeLoExplico/para-subir/<slug>/
  (ntfy gratis no permite adjuntos de más de 2 MB; OneDrive se sincroniza solo con el celular).
- Manda 2 notificaciones con el texto listo para pegar (TikTok; YouTube título + descripción) y un link a OneDrive.
"""
import json, os, re, shutil, sys, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ONEDRIVE = os.path.join(os.path.expanduser('~'), 'OneDrive', 'TeLoExplico', 'para-subir')
ONEDRIVE_WEB = 'https://onedrive.live.com/'
RELEASE_WEB = 'https://github.com/mateoribak-art/teloexplico-sistema/releases/tag/videos'
TELEGRAM = os.path.join(RAIZ, 'secretos', 'telegram.json')  # {"token": ..., "chat_id": ...} (conectar_telegram.cmd)


def telegram(metodo, campos, archivo=None):
    """Bot de Telegram propio: manda el video entero al celular (la API acepta hasta 50 MB; ntfy gratis, 2 MB)."""
    conf = json.load(open(TELEGRAM, encoding='utf-8'))
    limite = '----teloexplico'
    cuerpo = b''.join(f'--{limite}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode('utf-8')
                      for k, v in {**campos, 'chat_id': conf['chat_id']}.items())
    if archivo:
        campo, ruta = archivo
        cuerpo += (f'--{limite}\r\nContent-Disposition: form-data; name="{campo}"; filename="{os.path.basename(ruta)}"\r\n'
                   f'Content-Type: video/mp4\r\n\r\n').encode() + open(ruta, 'rb').read() + b'\r\n'
    cuerpo += f'--{limite}--\r\n'.encode()
    req = urllib.request.Request(f"https://api.telegram.org/bot{conf['token']}/{metodo}", data=cuerpo,
                                 headers={'Content-Type': f'multipart/form-data; boundary={limite}'})
    return json.load(urllib.request.urlopen(req, timeout=300))


def mandar_telegram(slug, video, tiktok, titulo, descripcion):
    # sin medidas Telegram lo muestra aplastado como horizontal (25/10): se mandan las del reel vertical
    import subprocess
    dur = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video],
                         capture_output=True, text=True).stdout.strip() or '0'
    telegram('sendVideo', {'caption': f'▶️ YouTube Shorts · {slug}\n\nTÍTULO (tocá para copiar):\n{titulo}'[:1000],
                           'supports_streaming': 'true', 'width': '1080', 'height': '1920',
                           'duration': str(round(float(dur)))}, ('video', video))
    telegram('sendMessage', {'text': f'DESCRIPCIÓN para YouTube:\n\n{descripcion}'[:4000]})
    telegram('sendMessage', {'text': f'Texto para TikTok:\n\n{tiktok}'[:4000]})


def tema():
    return json.load(open(os.path.join(RAIZ, 'secretos', 'avisos.json'), encoding='utf-8'))['ntfy_tema']


def textos(caption):
    c = caption  # Instagram y TikTok comparten usuario (@teloexplico.ar); solo YouTube va sin punto
    parrafos = [p.strip() for p in c.split('\n\n') if p.strip()]
    gancho = parrafos[0]
    hashtags = ' '.join(re.findall(r'#\w+', c)[:4])
    mandaselo = next((p for p in parrafos if 'Mandáselo' in p), '')
    fuentes = next((p.split('\n')[0] for p in parrafos if p.startswith('Fuentes')), '')
    # TikTok: corto y al grano (la gente no lee captions largos ahí)
    tiktok = '\n\n'.join(x for x in [gancho, mandaselo, fuentes, 'Seguí a @teloexplico.ar: un dato por día.',
                                     hashtags + ' #aprendeentiktok'] if x)
    # YouTube Shorts: título ≤100 caracteres con la pregunta del gancho, descripción completa
    primera = re.split(r'(?<=[?.!])\s', gancho.split('\n')[0])[0]
    titulo = re.sub(r'[^\w\s¿?¡!.,áéíóúñÁÉÍÓÚÑ°%-]', '', primera).strip()[:88] + ' #Shorts'
    descripcion = c + '\n\nInstagram y TikTok: @teloexplico.ar · YouTube: @teloexplicoar'
    return tiktok, titulo, descripcion


def notificar(titulo, mensaje, click=None, prioridad='4'):
    params = {'title': titulo, 'message': mensaje[:3900], 'priority': prioridad, 'tags': 'iphone'}
    if click:
        params['click'] = click
    url = f'https://ntfy.sh/{tema()}?' + urllib.parse.urlencode(params)
    urllib.request.urlopen(urllib.request.Request(url, data=b'', method='POST'), timeout=60).read()


def main(slug, avisar=True, tiktok_en_bandeja=False):
    carpeta = os.path.join(RAIZ, 'videos', slug)
    video = os.path.join(carpeta, f'{slug}.mp4')
    tiktok, titulo, descripcion = textos(open(os.path.join(carpeta, 'caption.txt'), encoding='utf-8').read())
    open(os.path.join(carpeta, 'tiktok.txt'), 'w', encoding='utf-8').write(tiktok)
    open(os.path.join(carpeta, 'youtube.txt'), 'w', encoding='utf-8').write(f'TÍTULO:\n{titulo}\n\nDESCRIPCIÓN:\n{descripcion}')

    if os.environ.get('TLX_NUBE'):
        # en la nube no hay OneDrive: el video se baja del Release del repo privado
        ruta, click = f'GitHub › teloexplico-sistema › Releases › videos › {slug}.mp4', RELEASE_WEB
    else:
        destino = os.path.join(ONEDRIVE, slug)
        os.makedirs(destino, exist_ok=True)
        for archivo in (video, os.path.join(carpeta, 'tiktok.txt'), os.path.join(carpeta, 'youtube.txt'), os.path.join(carpeta, 'portada.png')):
            if os.path.exists(archivo):
                shutil.copy(archivo, destino)
        ruta, click = f'OneDrive › TeLoExplico › para-subir › {slug} › {slug}.mp4', ONEDRIVE_WEB
    if not avisar:
        print(f'prueba sin avisar: {ruta}')
        return
    if os.path.exists(TELEGRAM) and os.path.exists(video):
        try:
            mandar_telegram(slug, video, tiktok, titulo, descripcion)
            ruta, click = 'te llegó por Telegram (chat del bot)', 'https://t.me/'
        except Exception as e:  # si Telegram falla, queda el camino de siempre
            print('Telegram falló:', str(e)[:200])
    notificar('📲 Subilo a TikTok', f'Video: {ruta}\n\nTexto para pegar:\n\n{tiktok}', click=click)
    notificar('▶️ Y a YouTube Shorts', f'Mismo video ({ruta}).\n\nTÍTULO:\n{titulo}\n\nDESCRIPCIÓN:\n{descripcion}', click=click)
    print(f'paquete listo ({ruta}) y notificado')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main(sys.argv[1], avisar='--sin-avisar' not in sys.argv)

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

    destino = os.path.join(ONEDRIVE, slug)
    os.makedirs(destino, exist_ok=True)
    for archivo in (video, os.path.join(carpeta, 'tiktok.txt'), os.path.join(carpeta, 'youtube.txt'), os.path.join(carpeta, 'portada.png')):
        if os.path.exists(archivo):
            shutil.copy(archivo, destino)
    if not avisar:
        print(f'prueba sin avisar: copiado a {destino}')
        return
    ruta = f'OneDrive › TeLoExplico › para-subir › {slug}'
    notificar('📲 Subilo a TikTok', f'Video: {ruta} › {slug}.mp4\n\nTexto para pegar:\n\n{tiktok}', click=ONEDRIVE_WEB)
    notificar('▶️ Y a YouTube Shorts', f'Mismo video ({ruta}).\n\nTÍTULO:\n{titulo}\n\nDESCRIPCIÓN:\n{descripcion}', click=ONEDRIVE_WEB)
    print(f'paquete listo en {destino} y notificado')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main(sys.argv[1], avisar='--sin-avisar' not in sys.argv)

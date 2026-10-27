"""Publica un reel en la página de Facebook "Te Lo Explico" con la API de Reels de páginas.

Uso:
  python -I publicar_fb.py <slug> [--borrador]

  <slug>       carpeta en videos/ (usa <slug>.mp4, caption.txt y portada.png)
  --borrador   lo sube como borrador (no se publica): sirve para probar

Lo llama el publicador después de publicar en Instagram. Los "en-…" van a la página "Let me explain" (cuenta.py, meta_en.json).
Credenciales: secretos/meta.json (token de página,
no vence; nunca se imprime). La página queda fija en ese archivo: no puede publicar en otra por error.
Registro: videos/publicados_fb.json
"""
import json, os, sys, time, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # con python -I no se agrega solo
from publicar import link_temporal  # noqa: E402
import cuenta  # noqa: E402


def pedir(metodo, url, datos=None, cabeceras=None, cuerpo=None):
    if datos is not None:
        cuerpo = urllib.parse.urlencode(datos).encode()
    req = urllib.request.Request(url, data=cuerpo, method=metodo, headers=cabeceras or {})
    try:
        return json.load(urllib.request.urlopen(req, timeout=300))
    except urllib.error.HTTPError as e:
        detalle = json.loads(e.read() or b'{}').get('error', {})
        sys.exit(f"Error de la API de Facebook ({e.code}): {detalle.get('message')} [{detalle.get('error_user_msg', '')}]")


def descripcion(caption):
    # Facebook convierte "teloexplico.ar" en un link al dominio teloexplico.ar (no es nuestro): no se nombra el usuario.
    # Lo mismo con letmeexplain.us (27/10).
    texto = caption.replace('Seguí a @teloexplico.ar: un dato por día.', 'Seguí la página: un dato por día.')
    texto = texto.replace('Follow @letmeexplain.us: one myth a day.', 'Follow the page: one myth a day.')
    texto = texto.replace('@letmeexplain.us', 'Let me explain').replace('letmeexplain.us', 'Let me explain')
    return texto.replace('@teloexplico.ar', 'Te lo explico').replace('teloexplico.ar', 'Te lo explico')


def main():
    args = sys.argv[1:]
    slug = args[0]
    borrador = '--borrador' in args
    c = cuenta.para(slug)
    conf = json.load(open(c['meta'], encoding='utf-8-sig'))
    version = conf['graph_version']
    api = f'https://graph.facebook.com/{version}'
    registro_json = os.path.join(c['videos'], 'publicados_fb.json')
    carpeta = cuenta.carpeta(slug)
    video = os.path.join(carpeta, f'{slug}.mp4')
    texto = descripcion(open(os.path.join(carpeta, 'caption.txt'), encoding='utf-8').read().strip())
    tam = os.path.getsize(video)
    token, pagina = conf['page_token'], conf['page_id']
    print(f"Página: {pagina} | video: {slug}.mp4 ({tam / 1e6:.1f} MB) | {'BORRADOR' if borrador else 'publicar'}")

    # 1. iniciar la subida
    ini = pedir('POST', f'{api}/{pagina}/video_reels', {'upload_phase': 'start', 'access_token': token})
    vid = ini['video_id']
    print('reel creado:', vid)

    # 2. subir: preferido, que Meta baje el video de un link firmado del Release (como en Instagram); si no, los bytes
    url = link_temporal(slug)
    if url:
        r = pedir('POST', f'https://rupload.facebook.com/video-upload/{version}/{vid}',
                  cabeceras={'Authorization': f'OAuth {token}', 'file_url': url})
    else:
        with open(video, 'rb') as f:
            r = pedir('POST', f'https://rupload.facebook.com/video-upload/{version}/{vid}', cuerpo=f.read(),
                      cabeceras={'Authorization': f'OAuth {token}', 'offset': '0', 'file_size': str(tam),
                               'Content-Type': 'application/octet-stream'})  # sin esto Meta rechaza la subida (ProcessingFailedError)
    print('subida:', ('ok' if r.get('success') else r), '(del Release)' if url else '(directa)')

    # 3. portada (si falla, Facebook elige un cuadro: no frena la publicación)
    portada = os.path.join(carpeta, 'portada.png')
    if os.path.exists(portada):
        limite = '----teloexplico'
        cuerpo = (f'--{limite}\r\nContent-Disposition: form-data; name="is_preferred"\r\n\r\ntrue\r\n'
                  f'--{limite}\r\nContent-Disposition: form-data; name="source"; filename="portada.png"\r\n'
                  f'Content-Type: image/png\r\n\r\n').encode() + open(portada, 'rb').read() + f'\r\n--{limite}--\r\n'.encode()
        try:
            req = urllib.request.Request(f'{api}/{vid}/thumbnails?access_token={token}', data=cuerpo, method='POST',
                                         headers={'Content-Type': f'multipart/form-data; boundary={limite}'})
            urllib.request.urlopen(req, timeout=120).read()
            print('portada: ok')
        except Exception as e:
            print('portada: no se pudo (', str(e)[:100], ')')

    # 4. cerrar y publicar
    fin = pedir('POST', f'{api}/{pagina}/video_reels', {
        'upload_phase': 'finish', 'video_id': vid, 'video_state': 'DRAFT' if borrador else 'PUBLISHED',
        'description': texto, 'access_token': token})
    if not fin.get('success'):
        sys.exit(f'Facebook no aceptó el cierre de la subida: {fin}')

    # 5. esperar a que termine de procesar
    for intento in range(60):
        # recién cerrada la subida, Facebook a veces contesta "el objeto no existe" unos segundos (25/10): se reintenta
        try:
            st = pedir('GET', f'{api}/{vid}?' + urllib.parse.urlencode({'fields': 'status', 'access_token': token}))['status']
        except SystemExit:
            if intento >= 12:
                raise
            time.sleep(5)
            continue
        if st.get('video_status') == 'error' or st.get('processing_phase', {}).get('status') == 'error':
            sys.exit(f'Facebook rechazó el video: {st}')
        if st.get('video_status') == 'ready' and (borrador or st.get('publishing_phase', {}).get('status') == 'complete'):
            break
        time.sleep(5)
    else:
        sys.exit(f'Se cortó la espera: Facebook sigue procesando el reel {vid}')

    if borrador:
        print('BORRADOR listo:', vid)
        return
    info = pedir('GET', f'{api}/{vid}?' + urllib.parse.urlencode({'fields': 'permalink_url,created_time', 'access_token': token}))
    link = 'https://www.facebook.com' + info['permalink_url'] if info.get('permalink_url', '').startswith('/') else info.get('permalink_url')
    print('PUBLICADO:', link)
    registro = json.load(open(registro_json, encoding='utf-8')) if os.path.exists(registro_json) else []
    registro.append({'slug': slug, 'video_id': vid, 'permalink': link, 'publicado': info.get('created_time')})
    json.dump(registro, open(registro_json, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')  # los sys.exit con tildes salen por stderr
    main()

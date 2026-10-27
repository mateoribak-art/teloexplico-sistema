"""Sube un reel a YouTube Shorts (@teloexplicoar, sin punto) con la API oficial (videos.insert, subida resumable).

Uso:
  python -I publicar_youtube.py autorizar      una sola vez, en la notebook: abre el navegador, entrás con la cuenta del canal
  python -I publicar_youtube.py <slug>         sube videos/<slug>/<slug>.mp4 con los textos de youtube.txt (multired.py)
  python -I publicar_youtube.py portada <slug> le pone videos/<slug>/portada.png a un Short ya subido (está en el registro)

Credenciales: secretos/youtube.json (cliente "App de escritorio" de Google Cloud, proyecto "Te lo explico publicador")
y secretos/youtube_token.json (refresh token; no vence porque la app está "En producción"). Nunca se imprimen.
OJO: hasta que YouTube apruebe la auditoría de la API, todo lo que se sube queda PRIVADO (regla de Google para proyectos
sin auditar). Por eso el publicador solo lo llama si existe secretos/youtube_activo (se crea cuando aprueben).
Registro: videos/publicados_youtube.json
"""
import http.server, json, os, secrets, sys, threading, urllib.parse, urllib.request, webbrowser

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRETOS = os.path.join(RAIZ, 'secretos')
REGISTRO = os.path.join(RAIZ, 'videos', 'publicados_youtube.json')
ALCANCE = 'https://www.googleapis.com/auth/youtube.upload'


def cliente():
    c = json.load(open(os.path.join(SECRETOS, 'youtube.json'), encoding='utf-8'))
    return c.get('installed') or c.get('web')


def pedir(url, datos=None, cabeceras=None, cuerpo=None, metodo=None):
    if datos is not None:
        cuerpo = urllib.parse.urlencode(datos).encode()
    req = urllib.request.Request(url, data=cuerpo, headers=cabeceras or {}, method=metodo)
    try:
        r = urllib.request.urlopen(req, timeout=600)
        return r, r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f'Error de Google ({e.code}): {e.read().decode(errors="replace")[:400]}')


def autorizar():
    """Flujo de app de escritorio con redirección a 127.0.0.1 (lo que Google pide hoy en vez del código copiado)."""
    c = cliente()
    recibido = {}

    class Vuelta(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            recibido.update(urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query))
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write('<h2>Listo: YouTube conectado. Ya podés cerrar esta pestaña.</h2>'.encode())

        def log_message(self, *a):
            pass

    srv = http.server.HTTPServer(('127.0.0.1', 0), Vuelta)
    vuelta = f'http://127.0.0.1:{srv.server_port}'
    estado = secrets.token_urlsafe(16)
    url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode({
        'client_id': c['client_id'], 'redirect_uri': vuelta, 'response_type': 'code', 'scope': ALCANCE,
        'access_type': 'offline', 'prompt': 'consent', 'state': estado})
    print('Se abre el navegador: entrá con la cuenta del canal (teloexplicoar@gmail.com), elegí el canal y aceptá.')
    print('Si aparece "Google no verificó esta app": Configuración avanzada › Ir a Te lo explico publicador.')
    webbrowser.open(url)
    hilo = threading.Thread(target=srv.handle_request)
    hilo.start()
    hilo.join(timeout=600)
    if recibido.get('state', [''])[0] != estado or 'code' not in recibido:
        sys.exit('No llegó la autorización (¿se cerró la pestaña o pasaron 10 minutos?).')
    _, crudo = pedir('https://oauth2.googleapis.com/token', {
        'code': recibido['code'][0], 'client_id': c['client_id'], 'client_secret': c['client_secret'],
        'redirect_uri': vuelta, 'grant_type': 'authorization_code'})
    t = json.loads(crudo)
    if 'refresh_token' not in t:
        sys.exit('Google no devolvió el refresh token: volvé a correr "autorizar".')
    json.dump({'refresh_token': t['refresh_token']}, open(os.path.join(SECRETOS, 'youtube_token.json'), 'w', encoding='utf-8'))
    print('AUTORIZADO: token guardado en secretos/youtube_token.json')


def acceso():
    c = cliente()
    rt = json.load(open(os.path.join(SECRETOS, 'youtube_token.json'), encoding='utf-8'))['refresh_token']
    _, crudo = pedir('https://oauth2.googleapis.com/token', {
        'client_id': c['client_id'], 'client_secret': c['client_secret'], 'refresh_token': rt, 'grant_type': 'refresh_token'})
    return json.loads(crudo)['access_token']


def poner_portada(video_id, slug, token=None):
    """Portada diseñada (la misma de Instagram). Si Google la rechaza (p. ej. canal sin verificar), el Short queda igual."""
    portada = os.path.join(RAIZ, 'videos', slug, 'portada.png')
    if not os.path.exists(portada):
        print('portada: no hay portada.png')
        return
    try:
        pedir(f'https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId={video_id}', cuerpo=open(portada, 'rb').read(),
              metodo='POST', cabeceras={'Authorization': f'Bearer {token or acceso()}', 'Content-Type': 'image/png'})
        print('portada: ok')
    except SystemExit as e:
        print('portada: no se pudo (', str(e)[:200], ')')


def subir(slug):
    carpeta = os.path.join(RAIZ, 'videos', slug)
    video = os.path.join(carpeta, f'{slug}.mp4')
    yt = os.path.join(carpeta, 'youtube.txt')
    if not os.path.exists(yt):  # los textos los arma multired.py (título ≤100 con #Shorts y descripción)
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import multired
        _, titulo, descripcion = multired.textos(open(os.path.join(carpeta, 'caption.txt'), encoding='utf-8').read())
    else:
        texto = open(yt, encoding='utf-8').read()
        titulo = texto.split('TÍTULO:\n', 1)[1].split('\n\n', 1)[0].strip()
        descripcion = texto.split('DESCRIPCIÓN:\n', 1)[1].strip()
    meta = {
        'snippet': {'title': titulo[:100], 'description': descripcion[:4900], 'categoryId': '27',  # Educación
                    'defaultLanguage': 'es-419', 'defaultAudioLanguage': 'es-419'},
        # la voz es sintética: YouTube pide declararlo (contenido alterado o sintético realista)
        'status': {'privacyStatus': 'public', 'selfDeclaredMadeForKids': False, 'containsSyntheticMedia': True},
    }
    token = acceso()
    tam = os.path.getsize(video)
    r, _ = pedir('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
                 cuerpo=json.dumps(meta).encode(), metodo='POST',
                 cabeceras={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json; charset=UTF-8',
                            'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': str(tam)})
    destino = r.headers['Location']
    _, crudo = pedir(destino, cuerpo=open(video, 'rb').read(), metodo='PUT',
                     cabeceras={'Authorization': f'Bearer {token}', 'Content-Type': 'video/mp4'})
    v = json.loads(crudo)
    link = f"https://youtube.com/shorts/{v['id']}"
    registro = json.load(open(REGISTRO, encoding='utf-8')) if os.path.exists(REGISTRO) else []
    registro.append({'slug': slug, 'video_id': v['id'], 'link': link, 'privacidad': v.get('status', {}).get('privacyStatus')})
    json.dump(registro, open(REGISTRO, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('SUBIDO:', link, '| privacidad:', v.get('status', {}).get('privacyStatus'))
    poner_portada(v['id'], slug, token)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    if sys.argv[1] == 'autorizar':
        autorizar()
    elif sys.argv[1] == 'portada':
        hecho = [x for x in json.load(open(REGISTRO, encoding='utf-8')) if x['slug'] == sys.argv[2]]
        poner_portada(hecho[-1]['video_id'], sys.argv[2]) if hecho else sys.exit('Ese slug no está en el registro de YouTube.')
    else:
        subir(sys.argv[1])

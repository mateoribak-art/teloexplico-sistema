"""Pantalla para publicar en TikTok (@teloexplico.ar) con la API de publicación directa.

Uso: python -I tiktok_web.py      → abre http://localhost:8790 en el navegador

Cumple las pautas de TikTok para publicar desde apps (developers.tiktok.com/doc/content-sharing-guidelines):
- muestra la cuenta (foto y nombre) con la que se publica, leída en el momento (creator_info);
- el texto se puede editar; la privacidad la elige la persona (sin opción marcada de antemano);
- comentarios, dúos y stitch arrancan apagados y se bloquean si la cuenta los tiene desactivados;
- declaración de contenido comercial (tu marca / contenido de marca) con sus avisos y reglas;
- vista previa del video, aviso legal de TikTok y publicación solo cuando la persona toca "Publicar";
- después muestra el estado hasta que TikTok termina de procesarlo.
Los tokens quedan en secretos/tiktok_token.json (nunca se muestran).
"""
import hashlib, http.server, json, os, secrets, socketserver, sys, threading, time, urllib.parse, webbrowser

H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, H)
import publicar_tiktok as pt  # noqa: E402

RAIZ = pt.RAIZ
PUERTO = 8790
REDIRECT = f'http://localhost:{PUERTO}/callback/'
SCOPES = 'user.info.basic,video.upload,video.publish'
ESTADO_OAUTH = {}


def videos():
    """Videos ya publicados en Instagram (o listos) para ofrecer en TikTok, del más nuevo al más viejo."""
    cola = json.load(open(os.path.join(RAIZ, 'videos', 'cola.json'), encoding='utf-8'))
    hechos = {x['slug'] for x in json.load(open(pt.REGISTRO, encoding='utf-8'))
              if x.get('directo')} if os.path.exists(pt.REGISTRO) else set()
    salida = []
    for v in reversed(cola):
        slug = v['slug']
        mp4 = os.path.join(RAIZ, 'videos', slug, f'{slug}.mp4')
        if v['estado'] not in ('publicado', 'listo') or not os.path.exists(mp4):
            continue
        txt = os.path.join(RAIZ, 'videos', slug, 'tiktok.txt')
        cap = os.path.join(RAIZ, 'videos', slug, 'caption.txt')
        texto = open(txt if os.path.exists(txt) else cap, encoding='utf-8').read().strip()
        meta = os.path.join(RAIZ, 'videos', slug, 'meta.json')
        portada = json.load(open(meta, encoding='utf-8')).get('portada_ms', 0) if os.path.exists(meta) else 0
        salida.append({'slug': slug, 'tema': v.get('tema', slug), 'texto': texto[:2200], 'portada_ms': portada,
                       'publicado_tiktok': slug in hechos})
    return salida


def creador():
    t = pt.token()
    r = pt.pedir('POST', f'{pt.API}/post/publish/creator_info/query/', cabeceras={'Authorization': f'Bearer {t}'}, json_body={})
    return r


def publicar(d):
    slug = d['slug']
    video = os.path.join(RAIZ, 'videos', slug, f'{slug}.mp4')
    tam = os.path.getsize(video)
    trozos = max(1, tam // pt.TROZO)
    tam_trozo = tam if trozos == 1 else pt.TROZO
    auth = {'Authorization': f'Bearer {pt.token()}'}
    post_info = {
        'title': d['titulo'][:2200],
        'privacy_level': d['privacidad'],
        'disable_comment': not d['comentarios'],
        'disable_duet': not d['duo'],
        'disable_stitch': not d['stitch'],
        'video_cover_timestamp_ms': int(d.get('portada_ms') or 0),
        'brand_content_toggle': bool(d.get('contenido_marca')),
        'brand_organic_toggle': bool(d.get('tu_marca')),
        'is_aigc': True,  # la voz es sintética: se declara como contenido generado con IA
    }
    ini = pt.pedir('POST', f'{pt.API}/post/publish/video/init/', cabeceras=auth, json_body={
        'post_info': post_info,
        'source_info': {'source': 'FILE_UPLOAD', 'video_size': tam, 'chunk_size': tam_trozo, 'total_chunk_count': trozos}})
    if ini.get('error', {}).get('code') != 'ok':
        return {'error': ini.get('error')}
    pid, url = ini['data']['publish_id'], ini['data']['upload_url']
    with open(video, 'rb') as f:
        for i in range(trozos):
            desde = i * tam_trozo
            datos = f.read(tam - desde if i == trozos - 1 else tam_trozo)
            pt.pedir('PUT', url, cuerpo=datos, cabeceras={'Content-Type': 'video/mp4', 'Content-Length': str(len(datos)),
                                                         'Content-Range': f'bytes {desde}-{desde + len(datos) - 1}/{tam}'})
    registro = json.load(open(pt.REGISTRO, encoding='utf-8')) if os.path.exists(pt.REGISTRO) else []
    registro.append({'slug': slug, 'publish_id': pid, 'enviado': time.strftime('%Y-%m-%dT%H:%M:%S'), 'directo': True,
                     'privacidad': d['privacidad']})
    json.dump(registro, open(pt.REGISTRO, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    return {'publish_id': pid}


def estado(pid):
    r = pt.pedir('POST', f'{pt.API}/post/publish/status/fetch/', cabeceras={'Authorization': f'Bearer {pt.token()}'},
                 json_body={'publish_id': pid})
    return r.get('data', {})


class Manejador(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def responder(self, codigo, cuerpo, tipo='application/json; charset=utf-8', extra=None):
        datos = cuerpo if isinstance(cuerpo, bytes) else json.dumps(cuerpo, ensure_ascii=False).encode()
        self.send_response(codigo)
        self.send_header('Content-Type', tipo)
        self.send_header('Content-Length', str(len(datos)))
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(datos)

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        try:
            if u.path == '/':
                html = open(os.path.join(H, 'tiktok_web.html'), encoding='utf-8').read()
                return self.responder(200, html.encode(), 'text/html; charset=utf-8')
            if u.path == '/login':
                verificador = secrets.token_urlsafe(48)
                st = secrets.token_hex(8)
                ESTADO_OAUTH[st] = verificador
                p = {'client_key': pt.CONF['client_key'], 'scope': SCOPES, 'response_type': 'code', 'redirect_uri': REDIRECT,
                     'state': st, 'code_challenge': hashlib.sha256(verificador.encode()).hexdigest(), 'code_challenge_method': 'S256'}
                return self.responder(302, b'', extra={'Location': 'https://www.tiktok.com/v2/auth/authorize/?' + urllib.parse.urlencode(p)})
            if u.path == '/callback/':
                st = q.get('state', [''])[0]
                if st not in ESTADO_OAUTH or 'code' not in q:
                    return self.responder(400, f"No se pudo conectar: {q.get('error_description', q.get('error', ['?']))}".encode(), 'text/plain; charset=utf-8')
                t = pt.pedir('POST', f'{pt.API}/oauth/token/', datos={
                    'client_key': pt.CONF['client_key'], 'client_secret': pt.CONF['client_secret'], 'code': q['code'][0],
                    'grant_type': 'authorization_code', 'redirect_uri': REDIRECT, 'code_verifier': ESTADO_OAUTH.pop(st)})
                if 'access_token' not in t:
                    return self.responder(400, f'No se pudo conectar: {t}'.encode(), 'text/plain; charset=utf-8')
                pt.guardar_token(t)
                return self.responder(302, b'', extra={'Location': '/'})
            if u.path == '/logout':
                # revoca el permiso en TikTok y borra el token local
                if os.path.exists(pt.TOKEN):
                    tok = json.load(open(pt.TOKEN, encoding='utf-8'))
                    try:
                        pt.pedir('POST', f'{pt.API}/oauth/revoke/', datos={'client_key': pt.CONF['client_key'],
                                 'client_secret': pt.CONF['client_secret'], 'token': tok.get('access_token', '')})
                    except SystemExit:
                        pass
                    os.remove(pt.TOKEN)
                return self.responder(302, b'', extra={'Location': '/'})
            if u.path == '/api/sesion':
                if not os.path.exists(pt.TOKEN):
                    return self.responder(200, {'conectado': False})
                tok = json.load(open(pt.TOKEN, encoding='utf-8'))
                return self.responder(200, {'conectado': True, 'puede_publicar': 'video.publish' in tok.get('scope', '')})
            if u.path == '/api/creador':
                return self.responder(200, creador())
            if u.path == '/api/videos':
                return self.responder(200, videos())
            if u.path == '/api/estado':
                return self.responder(200, estado(q['id'][0]))
            if u.path.startswith('/video/'):
                slug = os.path.basename(u.path)
                ruta = os.path.join(RAIZ, 'videos', slug, f'{slug}.mp4')
                tam = os.path.getsize(ruta)
                rango = self.headers.get('Range')
                ini, fin = 0, tam - 1
                if rango:
                    a, b = rango.replace('bytes=', '').split('-')
                    ini, fin = int(a or 0), int(b) if b else tam - 1
                with open(ruta, 'rb') as f:
                    f.seek(ini)
                    datos = f.read(fin - ini + 1)
                self.send_response(206 if rango else 200)
                self.send_header('Content-Type', 'video/mp4')
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Content-Length', str(len(datos)))
                if rango:
                    self.send_header('Content-Range', f'bytes {ini}-{fin}/{tam}')
                self.end_headers()
                self.wfile.write(datos)
                return
            self.responder(404, {'error': 'no existe'})
        except SystemExit as e:  # errores de la API de TikTok (publicar_tiktok.pedir hace sys.exit)
            self.responder(502, {'error': str(e)})
        except Exception as e:
            self.responder(500, {'error': str(e)[:300]})

    def do_POST(self):
        try:
            largo = int(self.headers.get('Content-Length', 0))
            d = json.loads(self.rfile.read(largo) or b'{}')
            if self.path == '/api/publicar':
                return self.responder(200, publicar(d))
            self.responder(404, {'error': 'no existe'})
        except SystemExit as e:
            self.responder(502, {'error': str(e)})
        except Exception as e:
            self.responder(500, {'error': str(e)[:300]})


class Servidor(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = False  # en Windows "True" deja que dos programas compartan el puerto


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    srv = Servidor(('127.0.0.1', PUERTO), Manejador)
    print(f'Pantalla de TikTok en http://localhost:{PUERTO} (Ctrl+C para cerrar)')
    if '--sin-abrir' not in sys.argv:
        threading.Timer(1, lambda: webbrowser.open(f'http://localhost:{PUERTO}')).start()
    srv.serve_forever()

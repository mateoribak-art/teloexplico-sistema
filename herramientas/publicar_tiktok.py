"""Manda un reel a la bandeja de TikTok de @teloexplico.ar como borrador (Content Posting API, "Upload to TikTok").

El video aparece en las notificaciones de TikTok ("bandeja de entrada"): Mateo lo abre, pega el texto y publica.
La API no deja publicar directo sin auditoría (sin auditoría todo queda privado), por eso va como borrador.

Uso:
  python -I publicar_tiktok.py autorizar          imprime el link para autorizar la app (una sola vez)
  python -I publicar_tiktok.py codigo <url>       canjea la URL a la que volvió TikTok después de autorizar
  python -I publicar_tiktok.py <slug>             sube videos/<slug>/<slug>.mp4 como borrador

Credenciales: secretos/tiktok.json (client_key, client_secret, redirect_uri) y secretos/tiktok_token.json
(refresh token: dura 365 días; el access token dura 24 h y se renueva solo en cada subida). Nunca se imprimen.
"""
import base64, hashlib, json, math, os, secrets, sys, time, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRETOS = os.path.join(RAIZ, 'secretos')
CONF = json.load(open(os.path.join(SECRETOS, 'tiktok.json'), encoding='utf-8'))
TOKEN = os.path.join(SECRETOS, 'tiktok_token.json')
PKCE = os.path.join(SECRETOS, 'tiktok_pkce.json')
API = 'https://open.tiktokapis.com/v2'
REGISTRO = os.path.join(RAIZ, 'videos', 'publicados_tiktok.json')
TROZO = 10 * 1024 * 1024  # TikTok acepta trozos de 5 a 64 MB; el último puede ser más grande


def pedir(metodo, url, datos=None, json_body=None, cabeceras=None, cuerpo=None):
    cab = dict(cabeceras or {})
    if datos is not None:
        cuerpo = urllib.parse.urlencode(datos).encode()
        cab['Content-Type'] = 'application/x-www-form-urlencoded'
    if json_body is not None:
        cuerpo = json.dumps(json_body).encode()
        cab['Content-Type'] = 'application/json; charset=UTF-8'
    req = urllib.request.Request(url, data=cuerpo, method=metodo, headers=cab)
    try:
        r = urllib.request.urlopen(req, timeout=300)
        texto = r.read()
        return json.loads(texto) if texto else {}
    except urllib.error.HTTPError as e:
        sys.exit(f'Error de la API de TikTok ({e.code}): {e.read().decode(errors="replace")[:400]}')


def guardar_token(t):
    t['vence'] = time.time() + t.get('expires_in', 86400) - 300
    json.dump(t, open(TOKEN, 'w', encoding='utf-8'), indent=2)


def autorizar():
    # PKCE: TikTok usa el SHA256 en hexadecimal (no base64url) como code_challenge
    verificador = secrets.token_urlsafe(48)
    estado = secrets.token_hex(8)
    json.dump({'verificador': verificador, 'estado': estado}, open(PKCE, 'w', encoding='utf-8'))
    q = {'client_key': CONF['client_key'], 'scope': 'user.info.basic,video.upload', 'response_type': 'code',
         'redirect_uri': CONF['redirect_uri'], 'state': estado,
         'code_challenge': hashlib.sha256(verificador.encode()).hexdigest(), 'code_challenge_method': 'S256'}
    print('https://www.tiktok.com/v2/auth/authorize/?' + urllib.parse.urlencode(q))


def canjear(url_vuelta):
    q = urllib.parse.parse_qs(urllib.parse.urlparse(url_vuelta).query)
    p = json.load(open(PKCE, encoding='utf-8'))
    if q.get('state', [''])[0] != p['estado']:
        sys.exit('El state no coincide: volvé a correr "autorizar".')
    if 'code' not in q:
        sys.exit(f"TikTok no devolvió código: {q.get('error_description', q)}")
    t = pedir('POST', f'{API}/oauth/token/', datos={
        'client_key': CONF['client_key'], 'client_secret': CONF['client_secret'], 'code': q['code'][0],
        'grant_type': 'authorization_code', 'redirect_uri': CONF['redirect_uri'], 'code_verifier': p['verificador']})
    if 'access_token' not in t:
        sys.exit(f'No se pudo canjear el código: {t}')
    guardar_token(t)
    os.remove(PKCE)
    print('Autorizado. Permisos:', t.get('scope'))
    yo = pedir('GET', f'{API}/user/info/?fields=open_id,display_name', cabeceras={'Authorization': f"Bearer {t['access_token']}"})
    print('Cuenta:', yo.get('data', {}).get('user', {}).get('display_name'))


def token():
    t = json.load(open(TOKEN, encoding='utf-8'))
    if time.time() < t.get('vence', 0):
        return t['access_token']
    n = pedir('POST', f'{API}/oauth/token/', datos={
        'client_key': CONF['client_key'], 'client_secret': CONF['client_secret'],
        'grant_type': 'refresh_token', 'refresh_token': t['refresh_token']})
    if 'access_token' not in n:
        sys.exit(f'No se pudo renovar el token de TikTok (¿hay que volver a autorizar?): {n}')
    guardar_token(n)
    return n['access_token']


def subir(slug):
    video = os.path.join(RAIZ, 'videos', slug, f'{slug}.mp4')
    tam = os.path.getsize(video)
    trozos = max(1, tam // TROZO)
    tam_trozo = tam if trozos == 1 else TROZO
    auth = {'Authorization': f'Bearer {token()}'}
    print(f'video: {slug}.mp4 ({tam / 1e6:.1f} MB, {trozos} trozo/s)')

    ini = pedir('POST', f'{API}/post/publish/inbox/video/init/', cabeceras=auth, json_body={
        'source_info': {'source': 'FILE_UPLOAD', 'video_size': tam, 'chunk_size': tam_trozo, 'total_chunk_count': trozos}})
    if ini.get('error', {}).get('code') != 'ok':
        sys.exit(f"TikTok no aceptó el inicio de la subida: {ini.get('error')}")
    pid, url = ini['data']['publish_id'], ini['data']['upload_url']

    with open(video, 'rb') as f:
        for i in range(trozos):
            ini_b = i * tam_trozo
            datos = f.read(tam - ini_b if i == trozos - 1 else tam_trozo)  # el último se lleva el resto
            pedir('PUT', url, cuerpo=datos, cabeceras={
                'Content-Type': 'video/mp4', 'Content-Length': str(len(datos)),
                'Content-Range': f'bytes {ini_b}-{ini_b + len(datos) - 1}/{tam}'})
    print('subida: ok')

    for _ in range(60):
        st = pedir('POST', f'{API}/post/publish/status/fetch/', cabeceras=auth, json_body={'publish_id': pid})['data']
        estado = st.get('status')
        if estado == 'SEND_TO_USER_INBOX':
            break
        if estado == 'FAILED':
            sys.exit(f"TikTok rechazó el video: {st.get('fail_reason')}")
        time.sleep(5)
    else:
        sys.exit(f'Se cortó la espera: TikTok sigue procesando ({pid})')
    print('EN BANDEJA:', pid)
    registro = json.load(open(REGISTRO, encoding='utf-8')) if os.path.exists(REGISTRO) else []
    registro.append({'slug': slug, 'publish_id': pid, 'enviado': time.strftime('%Y-%m-%dT%H:%M:%S')})
    json.dump(registro, open(REGISTRO, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')  # los sys.exit con tildes salen por stderr
    a = sys.argv[1:]
    if a[0] == 'autorizar':
        autorizar()
    elif a[0] == 'codigo':
        canjear(a[1])
    else:
        subir(a[0])

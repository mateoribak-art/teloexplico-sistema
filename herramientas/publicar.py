"""Publica un reel en @teloexplico.ar con la API oficial de Instagram (subida resumable desde la PC).

Uso:
  python -I publicar.py <slug> [--trial] [--portada-ms 5000] [--probar]

  <slug>         carpeta en videos/ (usa <slug>.mp4 y caption.txt)
  --trial        lo sube como Trial Reel (solo lo ven no seguidores; se pasa a normal desde la app)
  --portada-ms   milisegundo del video que se usa de portada (por defecto 0)
  --probar       sube el video y deja el contenedor listo, pero NO publica

Las credenciales salen de secretos/meta.json (token de página, que no vence). Nunca se imprimen.
El ID de Instagram queda fijo en ese archivo: no puede publicar en otra cuenta por error.
"""
import json, os, sys, time, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONF = json.load(open(os.path.join(RAIZ, 'secretos', 'meta.json'), encoding='utf-8'))
API = f"https://graph.facebook.com/{CONF['graph_version']}"
REGISTRO = os.path.join(RAIZ, 'videos', 'publicados.json')
INTENTOS = 4  # contenedores nuevos que se prueban si la subida falla


def pedir(metodo, url, datos=None, cabeceras=None, cuerpo=None):
    if datos is not None:
        cuerpo = urllib.parse.urlencode(datos).encode()
    req = urllib.request.Request(url, data=cuerpo, method=metodo, headers=cabeceras or {})
    try:
        return json.load(urllib.request.urlopen(req, timeout=300))
    except urllib.error.HTTPError as e:
        crudo = e.read() or b'{}'
        try:
            cuerpo_err = json.loads(crudo)
        except ValueError:
            cuerpo_err = {}
        detalle = cuerpo_err.get('error') or {}
        if not detalle:  # la subida de bytes (rupload) devuelve otro formato: mostrarlo tal cual
            sys.exit(f"Error de la API ({e.code}) en {url.split('?')[0][:60]}: {crudo.decode(errors='replace')[:300]}")
        sys.exit(f"Error de la API ({e.code}): {detalle.get('message')} [{detalle.get('error_user_msg', '')}]")


def main():
    args = sys.argv[1:]
    slug = args[0]
    trial = '--trial' in args
    probar = '--probar' in args
    portada = int(args[args.index('--portada-ms') + 1]) if '--portada-ms' in args else 0

    carpeta = os.path.join(RAIZ, 'videos', slug)
    video = os.path.join(carpeta, f'{slug}.mp4')
    caption = open(os.path.join(carpeta, 'caption.txt'), encoding='utf-8').read().strip()
    tam = os.path.getsize(video)
    token, ig = CONF['page_token'], CONF['ig_id']
    print(f"Cuenta: @{CONF['ig_usuario']} | video: {slug}.mp4 ({tam / 1e6:.1f} MB) | {'TRIAL REEL' if trial else 'reel normal'}")

    # 1-3. contenedor + subida + espera, con reintentos.
    # Meta a veces contesta 400 ProcessingFailedError: a veces el video llegó igual (el contenedor termina en FINISHED)
    # y a veces no (queda IN_PROGRESS para siempre). Por eso: hasta INTENTOS contenedores nuevos, y en cada uno se mira
    # el estado real; se publica el primero que quede listo.
    # is_ai_generated: la voz es sintética y Meta pide declarar el audio realista generado con IA
    # (además, los perfiles que no lo declaran reciben menos recomendaciones). No se puede agregar después.
    datos = {'media_type': 'REELS', 'upload_type': 'resumable', 'caption': caption,
             'share_to_feed': 'true', 'thumb_offset': str(portada), 'is_ai_generated': 'true', 'access_token': token}
    if trial:
        datos['trial_params'] = json.dumps({'graduation_strategy': 'MANUAL'})
    bytes_video = open(video, 'rb').read()
    cid = None
    for intento in range(1, INTENTOS + 1):
        cont = pedir('POST', f'{API}/{ig}/media', datos)
        print(f'intento {intento}: contenedor {cont["id"]}')
        try:
            r = pedir('POST', cont['uri'], cuerpo=bytes_video,
                      cabeceras={'Authorization': f'OAuth {token}', 'offset': '0', 'file_size': str(tam),
                                 'Content-Type': 'application/octet-stream'})
        except SystemExit as e:
            r = {'aviso': str(e)}
        print('  subida:', 'ok' if r.get('success') else 'Meta respondió error, se mira el estado igual')
        # si la subida dio ok se espera hasta 5 min; si dio error, 90 s (si no arrancó en ese tiempo, no llegó)
        for _ in range(60 if r.get('success') else 18):
            estado = pedir('GET', f'{API}/{cont["id"]}?' + urllib.parse.urlencode({'fields': 'status_code,status', 'access_token': token}))
            if estado.get('status_code') in ('FINISHED', 'ERROR'):
                break
            time.sleep(5)
        if estado.get('status_code') == 'FINISHED':
            cid = cont['id']
            break
        print('  estado:', estado.get('status_code'), estado.get('status', '')[:80])
        time.sleep(15)
    if cid is None:
        sys.exit(f'Instagram no terminó de recibir el video después de {INTENTOS} intentos (falla de la subida de Meta).')
    print('procesado: listo')

    if probar:
        print('Modo prueba: NO se publicó. Contenedor listo:', cid)
        return

    # 4. publicar
    pub = pedir('POST', f'{API}/{ig}/media_publish', {'creation_id': cid, 'access_token': token})
    mid = pub['id']
    info = pedir('GET', f'{API}/{mid}?' + urllib.parse.urlencode({'fields': 'permalink,timestamp', 'access_token': token}))
    print('PUBLICADO:', info.get('permalink'))

    registro = json.load(open(REGISTRO, encoding='utf-8')) if os.path.exists(REGISTRO) else []
    registro.append({'slug': slug, 'media_id': mid, 'permalink': info.get('permalink'),
                     'publicado': info.get('timestamp'), 'trial': trial})
    json.dump(registro, open(REGISTRO, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')  # los sys.exit con tildes salen por stderr
    main()

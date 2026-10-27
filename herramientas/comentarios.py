"""Comentarios de los reels de @teloexplico.ar.

Uso:
  python -I comentarios.py pendientes            lista los comentarios nuevos sin responder (JSON)
  python -I comentarios.py responder <id> "<texto>"   responde un comentario (una sola vez por comentario)
  python -I comentarios.py saltear <id> "<motivo>"    lo marca como visto sin responder (spam, insulto, emoji solo)
  python -I comentarios.py alerta <id> "<motivo>"     lo marca y te avisa al celular (ej.: dicen que un dato está mal)

Con TLX_CUENTA=en, los de @letmeexplain.us (videos/en/, meta_en.json; cuenta.py).
Registro: videos/comentarios.json  {comment_id: {"estado": "respondido|salteado|alerta", "texto", "respuesta", "cuando"}}
"""
import datetime, json, os, sys, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from avisar import avisar  # noqa: E402
import cuenta  # noqa: E402

V = cuenta.ACTUAL['videos']
REGISTRO = os.path.join(V, 'comentarios.json')
CONF = json.load(open(cuenta.ACTUAL['meta'], encoding='utf-8-sig'))
API = f"https://graph.facebook.com/{CONF['graph_version']}"
MAX_RESPUESTA = 300


def pedir(metodo, path, **params):
    params['access_token'] = CONF['page_token']
    datos = urllib.parse.urlencode(params).encode() if metodo == 'POST' else None
    url = f'{API}/{path}' + ('' if metodo == 'POST' else '?' + urllib.parse.urlencode(params))
    try:
        return json.load(urllib.request.urlopen(urllib.request.Request(url, data=datos, method=metodo), timeout=30))
    except urllib.error.HTTPError as e:
        return {'error': json.loads(e.read() or b'{}').get('error', {})}


def registro():
    return json.load(open(REGISTRO, encoding='utf-8')) if os.path.exists(REGISTRO) else {}


def guardar(r):
    json.dump(r, open(REGISTRO, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def pendientes():
    r = registro()
    publicados = json.load(open(os.path.join(V, 'publicados.json'), encoding='utf-8')) if os.path.exists(os.path.join(V, 'publicados.json')) else []
    salida = []
    for p in publicados[-20:]:
        cs = pedir('GET', f"{p['media_id']}/comments", fields='id,text,username,timestamp,replies{username}', limit=50)
        for c in cs.get('data', []):
            if c['id'] in r or c.get('username') == CONF['ig_usuario']:
                continue
            ya = any(x.get('username') == CONF['ig_usuario'] for x in c.get('replies', {}).get('data', []))
            if ya:
                continue
            salida.append({'id': c['id'], 'video': p['slug'], 'usuario': c.get('username'), 'texto': c.get('text'), 'cuando': c.get('timestamp')})
    return salida


def marcar(cid, estado, texto='', respuesta=''):
    r = registro()
    r[cid] = {'estado': estado, 'texto': texto, 'respuesta': respuesta, 'cuando': datetime.datetime.now().isoformat(timespec='minutes')}
    guardar(r)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    a = sys.argv[1:]
    if not a or a[0] == 'pendientes':
        print(json.dumps(pendientes(), ensure_ascii=False, indent=1))
    elif a[0] == 'contar':
        print(len(pendientes()))
    elif a[0] == 'responder':
        cid, texto = a[1], ' '.join(a[2:]).strip()
        if cid in registro():
            sys.exit('Ese comentario ya fue procesado.')
        if not texto or len(texto) > MAX_RESPUESTA or 'http' in texto.lower():
            sys.exit(f'Respuesta inválida (vacía, más de {MAX_RESPUESTA} caracteres o con links).')
        res = pedir('POST', f'{cid}/replies', message=texto)
        if 'error' in res:
            sys.exit('Error de la API: ' + res['error'].get('message', ''))
        marcar(cid, 'respondido', respuesta=texto)
        print('respondido')
    elif a[0] == 'saltear':
        marcar(a[1], 'salteado', texto=' '.join(a[2:]))
        print('salteado')
    elif a[0] == 'alerta':
        marcar(a[1], 'alerta', texto=' '.join(a[2:]))
        avisar('👀 Comentario para revisar', ' '.join(a[2:])[:400], 'alta')
        print('alerta enviada')
    else:
        sys.exit(__doc__)

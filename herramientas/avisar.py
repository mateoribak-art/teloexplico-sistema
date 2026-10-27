"""Notificaciones al celular con ntfy (app gratis, sin cuenta).

Uso desde otros scripts:  from avisar import avisar; avisar('Título', 'mensaje', prioridad='default', link=None)
Uso suelto:               python -I avisar.py "Título" "mensaje" [alta]

El tema (canal) está en secretos/avisos.json: es un nombre al azar, funciona como contraseña del canal.
Los avisos llevan solo estados y links públicos de Instagram, nunca credenciales.
Si no hay internet, el aviso queda guardado en videos/avisos_pendientes.json y sale en el próximo envío.
"""
import json, os, sys, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PENDIENTES = os.path.join(RAIZ, 'videos', 'avisos_pendientes.json')
PRIORIDAD = {'baja': '2', 'default': '3', 'alta': '4', 'urgente': '5'}


def _tema():
    return json.load(open(os.path.join(RAIZ, 'secretos', 'avisos.json'), encoding='utf-8'))['ntfy_tema']


def _enviar(titulo, mensaje, prioridad, link):
    cabeceras = {'Title': titulo.encode('utf-8'), 'Priority': PRIORIDAD.get(prioridad, '3'),
                 'Tags': 'speech_balloon'}
    if link:
        cabeceras['Click'] = link
    req = urllib.request.Request(f'https://ntfy.sh/{_tema()}', data=mensaje.encode('utf-8'), headers=cabeceras, method='POST')
    urllib.request.urlopen(req, timeout=20).read()


def avisar(titulo, mensaje, prioridad='default', link=None):
    titulo = ('[EN] ' if os.environ.get('TLX_CUENTA') == 'en' else '') + titulo  # para distinguir las dos cuentas en el celular
    pendientes = json.load(open(PENDIENTES, encoding='utf-8')) if os.path.exists(PENDIENTES) else []
    pendientes.append({'titulo': titulo, 'mensaje': mensaje, 'prioridad': prioridad, 'link': link})
    quedan = []
    for a in pendientes:
        try:
            _enviar(a['titulo'], a['mensaje'], a['prioridad'], a['link'])
        except Exception:
            quedan.append(a)
    if quedan:
        json.dump(quedan, open(PENDIENTES, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    elif os.path.exists(PENDIENTES):
        os.remove(PENDIENTES)
    return not quedan


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    ok = avisar(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else 'default')
    print('enviado' if ok else 'sin conexión: quedó pendiente')

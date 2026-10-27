"""Métricas de @teloexplico.ar: guarda cómo le va a cada reel y a la cuenta.

Uso:
  python -I metricas.py actualizar     baja las métricas de todos los reels publicados y los seguidores de hoy
  python -I metricas.py ranking        tabla de reels ordenados por rendimiento (para elegir temas y hooks)
  python -I metricas.py carruseles     tabla de carruseles (desde el 27/10)

Guarda en videos/metricas.json:
  {"cuenta": {"YYYY-MM-DD": {"seguidores": N, "posts": N}}, "reels": {media_id: {"slug", "publicado", "duracion", "ultimo": {...}}},
   "carruseles": {media_id: {"clave", "publicado", "ultimo": {...}}}}
Puntaje = (compartidos*3 + guardados*2 + comentarios + me gusta*0,5) / alcance * 1000 (las métricas que Instagram más premia).
"""
import datetime, json, os, subprocess, sys, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # con python -I no se agrega solo
import cuenta  # noqa: E402
# cada cuenta con sus métricas (TLX_CUENTA=en: videos/en/metricas.json con meta_en.json)
V = cuenta.ACTUAL['videos']
ARCHIVO = os.path.join(V, 'metricas.json')
CONF = json.load(open(cuenta.ACTUAL['meta'], encoding='utf-8-sig'))
API = f"https://graph.facebook.com/{CONF['graph_version']}"
METRICAS = ['views', 'reach', 'likes', 'comments', 'shares', 'saved', 'total_interactions',
            'ig_reels_avg_watch_time', 'ig_reels_video_view_total_time']
# a los carruseles les sirve más saber si traen gente al perfil (los reels no aceptan estas dos)
METRICAS_CARRUSEL = ['views', 'reach', 'likes', 'comments', 'shares', 'saved', 'total_interactions',
                     'profile_visits', 'follows']


def get(path, **params):
    params['access_token'] = CONF['page_token']
    try:
        return json.load(urllib.request.urlopen(f'{API}/{path}?' + urllib.parse.urlencode(params), timeout=30))
    except urllib.error.HTTPError as e:
        return {'error': json.loads(e.read() or b'{}').get('error', {})}


def insights(media_id, metricas=METRICAS):
    """Pide todas las métricas juntas; si alguna no existe en esta versión de la API, las pide de a una."""
    r = get(f'{media_id}/insights', metric=','.join(metricas))
    if 'data' not in r:
        datos = {}
        for m in metricas:
            x = get(f'{media_id}/insights', metric=m)
            for d in x.get('data', []):
                datos[d['name']] = d['values'][0]['value']
        return datos
    return {d['name']: d['values'][0]['value'] for d in r['data']}


def duracion(slug):
    video = os.path.join(V, slug, f'{slug}.mp4')
    if not os.path.exists(video):
        return None
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video],
                       capture_output=True, text=True)
    return float(r.stdout.strip() or 0) or None


def actualizar():
    base = json.load(open(ARCHIVO, encoding='utf-8')) if os.path.exists(ARCHIVO) else {'cuenta': {}, 'reels': {}}
    c = get(CONF['ig_id'], fields='followers_count,media_count')
    if 'error' not in c:
        base['cuenta'][datetime.date.today().isoformat()] = {'seguidores': c['followers_count'], 'posts': c['media_count']}
    publicados = json.load(open(os.path.join(V, 'publicados.json'), encoding='utf-8')) if os.path.exists(os.path.join(V, 'publicados.json')) else []
    for p in publicados:
        r = base['reels'].setdefault(p['media_id'], {'slug': p['slug'], 'publicado': p['publicado'], 'duracion': duracion(p['slug'])})
        m = insights(p['media_id'])
        if m:
            m['cuando'] = datetime.datetime.now().isoformat(timespec='minutes')
            r['ultimo'] = m
    lista = os.path.join(V, 'carruseles', 'publicados.json')
    for p in (json.load(open(lista, encoding='utf-8')) if os.path.exists(lista) else []):
        r = base.setdefault('carruseles', {}).setdefault(p['media_id'], {'clave': p['clave'], 'publicado': p['publicado']})
        m = insights(p['media_id'], METRICAS_CARRUSEL)
        if m:
            m['cuando'] = datetime.datetime.now().isoformat(timespec='minutes')
            r['ultimo'] = m
    json.dump(base, open(ARCHIVO, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return base


def puntaje(m):
    # los enviados pesan más que todo: es lo que más empuja el alcance en Instagram (el 001 explotó por eso, 26/10)
    alcance = max(1, m.get('reach', 0))
    return (m.get('shares', 0) * 5 + m.get('saved', 0) * 2 + m.get('comments', 0) + m.get('likes', 0) * 0.5) / alcance * 1000


def ranking(base=None):
    base = base or (json.load(open(ARCHIVO, encoding='utf-8')) if os.path.exists(ARCHIVO) else {'reels': {}})
    filas = []
    for r in base['reels'].values():
        m = r.get('ultimo')
        if not m:
            continue
        ver = (m.get('ig_reels_avg_watch_time', 0) / 1000) / r['duracion'] * 100 if r.get('duracion') else None
        filas.append((puntaje(m), r['slug'], m, ver))
    filas.sort(reverse=True)
    return filas


def texto_ranking(filas, n=10):
    lineas = [f"{'slug':<28} {'puntaje':>7} {'alcance':>7} {'vistas':>7} {'compart':>7} {'guard':>6} {'coment':>6} {'% visto':>7}"]
    for pt, slug, m, ver in filas[:n]:
        lineas.append(f"{slug:<28} {pt:7.1f} {m.get('reach', 0):7} {m.get('views', 0):7} {m.get('shares', 0):7} "
                      f"{m.get('saved', 0):6} {m.get('comments', 0):6} {(f'{ver:.0f}%' if ver else '-'):>7}")
    return '\n'.join(lineas)


def texto_carruseles(base=None):
    """Carruseles con las horas que llevan publicados: el alcance de uno de 8 h no se compara con uno de 3 días."""
    base = base or (json.load(open(ARCHIVO, encoding='utf-8')) if os.path.exists(ARCHIVO) else {})
    lineas = [f"{'clave':<20} {'horas':>5} {'alcance':>7} {'vistas':>6} {'compart':>7} {'guard':>5} {'perfil':>6} {'siguen':>6} {'puntaje':>7}"]
    for r in sorted(base.get('carruseles', {}).values(), key=lambda r: r['publicado']):
        m = r.get('ultimo')
        if not m:
            continue
        horas = (datetime.datetime.fromisoformat(m['cuando']) - datetime.datetime.strptime(r['publicado'], '%Y-%m-%dT%H:%M:%S%z')
                 .astimezone().replace(tzinfo=None)).total_seconds() / 3600
        lineas.append(f"{r['clave']:<20} {horas:5.0f} {m.get('reach', 0):7} {m.get('views', 0):6} {m.get('shares', 0):7} "
                      f"{m.get('saved', 0):5} {m.get('profile_visits', 0):6} {m.get('follows', 0):6} {puntaje(m):7.1f}")
    return '\n'.join(lineas)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    modo = sys.argv[1] if len(sys.argv) > 1 else 'ranking'
    if modo == 'actualizar':
        b = actualizar()
        print(f"actualizado: {len(b['reels'])} reels, {len(b.get('carruseles', {}))} carruseles")
    if modo == 'carruseles':
        print(texto_carruseles())
    else:
        print(texto_ranking(ranking()))
        if modo == 'actualizar':
            print('\n' + texto_carruseles())

"""Referentes: baja los reels de las cuentas de la competencia y los deja listos para que Vera (la investigadora) los estudie.

Uso:
  python -I referentes.py bajar [--cuentas a,b] [--top N]   reels recientes de cada cuenta, los que más le ganaron a su propia mediana
                                                              (me gusta de la API, business_discovery) + hoja de cuadros de cada uno
  python -I referentes.py lista                               las cuentas que se siguen
  python -I referentes.py agregar <usuario> [nota]            suma una cuenta (tiene que ser profesional/creador)
  python -I referentes.py quitar <usuario>

Salida (todo dentro de videos/referentes/):
  cuentas.json                    cuentas seguidas {usuario: {"nota", "pais"}}
  ranking.json / ranking.md       los reels elegidos, con "veces su mediana" (el puntaje que importa)
  <usuario>/<id>_hoja.jpg         8 cuadros del reel en una grilla (para mirarlos con Read)
Los videos y cuadros sueltos se borran: solo queda la hoja. No se copia nada de ellos: se estudian el gancho, la estructura y lo visual.
"""
import datetime, json, os, statistics, subprocess, sys, tempfile, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cuenta  # noqa: E402

D = os.path.join(RAIZ, 'videos', 'referentes')
CUENTAS = os.path.join(D, 'cuentas.json')
INICIAL = {
    'miravosarg': {'nota': 'mapas y tamaños de Argentina; su reel de comparar tamaños hizo 1,1 M', 'pais': 'AR'},
    'spott.ar': {'nota': 'matemática de estacionar en Palermo; 540 mil con 1.228 seguidores', 'pais': 'AR'},
    'posta.explica': {'nota': 'explicativos animados rioplatenses; la competencia directa', 'pais': 'AR'},
    '1bit1pixel': {'nota': 'tu vida en una grilla; una sola imagen que se transforma', 'pais': 'ES'},
    '1action1reaction': {'nota': 'física en un escenario con pasos numerados', 'pais': 'ES'},
    'proyecto_atom': {'nota': '3D low-poly con IA, un mundo que se recorre', 'pais': 'ES'},
    'la_ciencia_dice': {'nota': 'ciencia y naturaleza, explicadores de actualidad', 'pais': 'ES'},
    'nandomovie': {'nota': '3D low-poly de noche; 182 mil con "envíaselo a ese amigo que…"', 'pais': 'ES'},
    'porquetuperro': {'nota': '2D con gráfico; 147 mil con consejo para hoy', 'pais': 'ES'},
    'escuela.evo': {'nota': 'negocios con stickers; avión que se repite', 'pais': 'LATAM'},
}


def cargar_cuentas():
    os.makedirs(D, exist_ok=True)
    if not os.path.exists(CUENTAS):
        json.dump(INICIAL, open(CUENTAS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return json.load(open(CUENTAS, encoding='utf-8'))


def conf():
    c = json.load(open(cuenta.CUENTAS['es']['meta'], encoding='utf-8-sig'))
    return c, f"https://graph.facebook.com/{c['graph_version']}"


def media_de(usuario):
    c, api = conf()
    campos = ('business_discovery.username(%s){followers_count,media_count,media.limit(50)'
              '{caption,like_count,comments_count,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp}}' % usuario)
    url = f"{api}/{c['ig_id']}?" + urllib.parse.urlencode({'fields': campos, 'access_token': c['page_token']})
    try:
        return json.load(urllib.request.urlopen(url, timeout=40))['business_discovery']
    except urllib.error.HTTPError as e:
        err = json.loads(e.read() or b'{}').get('error', {}).get('message', str(e))
        print(f'  {usuario}: no se pudo leer ({err[:120]})')
    except Exception as e:  # una cuenta caída no frena a las demás
        print(f'  {usuario}: {str(e)[:120]}')
    return None


def hoja(video_url, destino, permalink=None):
    """8 cuadros repartidos en toda la duración, en grilla de 4x2, chicos pero legibles."""
    with tempfile.TemporaryDirectory() as t:
        mp4 = os.path.join(t, 'v.mp4')
        try:
            if video_url:
                urllib.request.urlretrieve(video_url, mp4)
            else:
                raise ValueError('sin media_url')
        except Exception:
            # la API a veces no trae el video (música con derechos): yt-dlp anda con reels sueltos sin login
            r = subprocess.run(['yt-dlp', '-q', '-f', 'mp4/best', '-o', mp4, permalink or ''], capture_output=True, text=True)
            if r.returncode != 0 or not os.path.exists(mp4):
                print('   sin video:', (r.stderr or '')[-80:].strip())
                return None
        try:
            dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4],
                                       capture_output=True, text=True).stdout.strip() or 0)
        except Exception as e:
            print('   sin video:', str(e)[:80])
            return None
        if dur <= 0:
            return None
        r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-vf',
                            f'fps=8/{dur:.2f},scale=270:-2,tile=4x2:padding=6:color=white', '-frames:v', '1', '-q:v', '4', destino],
                           capture_output=True)
        return round(dur) if r.returncode == 0 and os.path.exists(destino) else None


def bajar(cuentas=None, top=3):
    todas = cargar_cuentas()
    elegidas = cuentas or list(todas)
    ranking = []
    for u in elegidas:
        print(f'@{u}')
        bd = media_de(u)
        if not bd:
            continue
        reels = [m for m in bd.get('media', {}).get('data', []) if m.get('media_product_type') == 'REELS' or m.get('media_type') == 'VIDEO']
        likes = [m.get('like_count', 0) for m in reels if m.get('like_count', 0) > 0]
        if len(likes) < 5:
            print('  muy pocos reels con datos')
            continue
        mediana = statistics.median(likes)
        for m in reels:
            m['veces_mediana'] = round(m.get('like_count', 0) / mediana, 1) if mediana else 0
        mejores = sorted(reels, key=lambda m: m['veces_mediana'], reverse=True)[:top]
        carpeta = os.path.join(D, u)
        os.makedirs(carpeta, exist_ok=True)
        for m in mejores:
            if m['veces_mediana'] < 1.5:
                continue
            h = os.path.join(carpeta, f"{m['id']}_hoja.jpg")
            dur = hoja(m.get('media_url'), h, m['permalink']) if not os.path.exists(h) else None
            ranking.append({'usuario': u, 'seguidores': bd.get('followers_count'), 'id': m['id'], 'permalink': m['permalink'],
                            'publicado': m['timestamp'][:10], 'likes': m.get('like_count'), 'comentarios': m.get('comments_count'),
                            'mediana_cuenta': mediana, 'veces_mediana': m['veces_mediana'], 'duracion': dur,
                            'hoja': os.path.relpath(h, RAIZ).replace('\\', '/') if os.path.exists(h) else None,
                            'caption': (m.get('caption') or '')[:700]})
            print(f"  {m['veces_mediana']}x su mediana · {m.get('like_count')} ♥ · {m['permalink']}")
    if not ranking:
        print('Nada nuevo para estudiar.')
        return
    previo = json.load(open(os.path.join(D, 'ranking.json'), encoding='utf-8')) if os.path.exists(os.path.join(D, 'ranking.json')) else []
    vistos = {r['id'] for r in previo}
    todos = previo + [r for r in ranking if r['id'] not in vistos]
    todos = sorted(todos, key=lambda r: r['veces_mediana'], reverse=True)[:60]
    json.dump(todos, open(os.path.join(D, 'ranking.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    md = ['# Reels de la competencia que le ganaron a su propia mediana', f'Actualizado {datetime.date.today()}. Hoja de cuadros = `hoja`.', '']
    for r in todos:
        md.append(f"- **{r['veces_mediana']}x** @{r['usuario']} ({r['seguidores']} seg.) · {r['likes']} ♥ · {r['duracion'] or '?'} s · {r['publicado']} · {r['permalink']}\n  hoja: `{r['hoja']}`\n  caption: {r['caption'][:200].replace(chr(10), ' ')}")
    open(os.path.join(D, 'ranking.md'), 'w', encoding='utf-8').write('\n'.join(md) + '\n')
    print(f'{len(ranking)} reels nuevos; ranking en videos/referentes/ranking.md')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    if a[0] == 'bajar':
        cs = a[a.index('--cuentas') + 1].split(',') if '--cuentas' in a else None
        t = int(a[a.index('--top') + 1]) if '--top' in a else 3
        bajar(cs, t)
    elif a[0] == 'lista':
        for u, d in cargar_cuentas().items():
            print(f"@{u} — {d.get('nota', '')}")
    elif a[0] == 'agregar' and len(a) > 1:
        c = cargar_cuentas()
        c[a[1].lstrip('@')] = {'nota': ' '.join(a[2:]), 'pais': ''}
        json.dump(c, open(CUENTAS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('agregada')
    elif a[0] == 'quitar' and len(a) > 1:
        c = cargar_cuentas()
        c.pop(a[1].lstrip('@'), None)
        json.dump(c, open(CUENTAS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('quitada')
    else:
        sys.exit(__doc__)

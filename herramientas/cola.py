r"""Cola de videos de @teloexplico.ar: qué hay, en qué estado y qué sale después.

Estados: idea -> produccion -> listo -> publicado
                          \-> apartado (falló el chequeo de datos o el control técnico: nunca se publica solo)

Cada cuenta tiene su cola (TLX_CUENTA=en: videos/en/cola.json, ver cuenta.py).

Uso:
  python -I cola.py                      muestra la cola
  python -I cola.py estado <slug> <estado> [motivo]
  python -I cola.py agregar <slug> "<tema>" [--actualidad]   (--actualidad: pasa adelante, vence a las 48 h, avisa al celular)
"""
import json, os, sys, datetime

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # con python -I no se agrega solo
import cuenta  # noqa: E402
ARCHIVO = os.path.join(cuenta.ACTUAL['videos'], 'cola.json')
# render: escenas terminadas por Claude; producir.py lo renderiza y controla después, sin Claude (videos 3D, 26/10)
ESTADOS = ('idea', 'produccion', 'render', 'listo', 'publicado', 'apartado')


def cargar():
    if not os.path.exists(ARCHIVO):
        return []
    return json.load(open(ARCHIVO, encoding='utf-8'))


def guardar(cola):
    os.makedirs(os.path.dirname(ARCHIVO), exist_ok=True)
    tmp = ARCHIVO + '.tmp'
    json.dump(cola, open(tmp, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    os.replace(tmp, ARCHIVO)


def ahora():
    return datetime.datetime.now().isoformat(timespec='minutes')


def buscar(cola, slug):
    return next((v for v in cola if v['slug'] == slug), None)


def cambiar_estado(slug, estado, motivo=''):
    assert estado in ESTADOS, estado
    cola = cargar()
    v = buscar(cola, slug)
    if v is None:
        sys.exit(f'No está {slug} en la cola')
    v['estado'] = estado
    v['historial'] = v.get('historial', []) + [{'estado': estado, 'cuando': ahora(), 'motivo': motivo}]
    guardar(cola)


VIGENCIA_ACTUALIDAD_H = 48  # un tema del momento que no salió en 48 h ya no rinde


def agregar(slug, tema, estado='idea', actualidad=False):
    if cuenta.de_slug(slug) != cuenta.CUENTA:
        sys.exit(f'{slug} no es de la cuenta {cuenta.CUENTA} (los de inglés empiezan con "en-" y van con TLX_CUENTA=en)')
    cola = cargar()
    if buscar(cola, slug):
        sys.exit(f'{slug} ya está en la cola')
    v = {'slug': slug, 'tema': tema, 'estado': estado,
         'historial': [{'estado': estado, 'cuando': ahora(), 'motivo': ''}]}
    if actualidad:
        v['prioridad'] = 'actualidad'
        v['creado'] = ahora()
    cola.append(v)
    guardar(cola)


def vencido(v):
    if v.get('prioridad') != 'actualidad':
        return False
    creado = datetime.datetime.fromisoformat(v.get('creado') or v['historial'][0]['cuando'])
    return datetime.datetime.now() - creado > datetime.timedelta(hours=VIGENCIA_ACTUALIDAD_H)


def proximo_listo():
    """Primero los temas del momento (todavía vigentes); después el listo más viejo."""
    listos = [v for v in cargar() if v['estado'] == 'listo']
    for v in listos:
        if vencido(v):
            cambiar_estado(v['slug'], 'apartado', f'tema de actualidad vencido (más de {VIGENCIA_ACTUALIDAD_H} h)')
    listos = [v for v in cargar() if v['estado'] == 'listo']
    v = next((v for v in listos if v.get('prioridad') == 'actualidad'), None) or (listos[0] if listos else None)
    return primero_de_su_serie(v, listos)


def primero_de_su_serie(v, listos):
    """Si el elegido es el capítulo #4 de una serie y el #3 todavía no salió, sale antes el #3 (series.json, 27/10)."""
    if v is None:
        return None
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import series
        cap = series.capitulo(v['slug'])
        if not cap:
            return v
        anteriores = [(c[2], w) for w in listos if (c := series.capitulo(w['slug'])) and c[0] == cap[0] and c[2] < cap[2]]
        return min(anteriores, key=lambda x: x[0])[1] if anteriores else v
    except Exception as e:  # la serie nunca frena una publicación
        print('series:', str(e)[:120])
        return v


def mostrar():
    for v in cargar():
        marca = '🔥' if v.get('prioridad') == 'actualidad' else '  '
        print(f"{v['estado']:<11} {marca} {v['slug']:<28} {v.get('tema', '')}")


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    a = sys.argv[1:]
    if not a:
        mostrar()
    elif a[0] == 'estado':
        cambiar_estado(a[1], a[2], ' '.join(a[3:]))
    elif a[0] == 'agregar':
        agregar(a[1], a[2], actualidad='--actualidad' in a)
        if '--actualidad' in a:
            sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
            from avisar import avisar
            avisar('🔥 Tema del momento detectado', f'{a[2]}\nSe está produciendo y sale en el próximo turno.', 'default')
    else:
        sys.exit(__doc__)

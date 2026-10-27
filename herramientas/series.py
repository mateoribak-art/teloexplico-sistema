r"""Series de @teloexplico.ar: cada video es un capítulo numerado ("Mitos de cocina #3").

Desde el 27/10/2026: 80 mil vistas trajeron 179 seguidores. La serie le da a la gente una razón para seguir la cuenta:
la portada, el cierre del reel ("seguí @teloexplico.ar para el #4") y el caption nombran la serie y el capítulo.
El registro vive en motor/src/kit/series.json (lo leen la portada y el cierre del motor, y la cola para publicar en orden).

Uso:
  python -I series.py                         muestra las series y sus capítulos
  python -I series.py asignar <slug> <serie>  le da al video el capítulo siguiente de la serie y actualiza su caption
  python -I series.py textos <slug>           rehace el renglón "📚 … Seguí a @teloexplico.ar …" del caption
"""
import json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARCHIVO = os.path.join(RAIZ, 'motor', 'src', 'kit', 'series.json')
SEGUI = re.compile(r'^(📚 .*|Seguí a @teloexplico\.ar.*)$', re.M)


def cargar():
    return json.load(open(ARCHIVO, encoding='utf-8'))


def guardar(d):
    tmp = ARCHIVO + '.tmp'
    json.dump(d, open(tmp, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
    os.replace(tmp, ARCHIVO)


def capitulo(slug):
    """(clave, nombre, número) o None si el video no es de ninguna serie."""
    d = cargar()
    v = d['videos'].get(slug)
    return (v[0], d['series'].get(v[0], v[0]), v[1]) if v else None


def renglon(slug):
    cap = capitulo(slug)
    if not cap:
        return 'Seguí a @teloexplico.ar: un dato por día.'
    return f'📚 {cap[1]} #{cap[2]} · Seguí a @teloexplico.ar para no perderte el #{cap[2] + 1}.'


def textos(slug):
    ruta = os.path.join(RAIZ, 'videos', slug, 'caption.txt')
    if not os.path.exists(ruta):
        return
    c = open(ruta, encoding='utf-8').read()
    nuevo = SEGUI.sub(renglon(slug), c, count=1) if SEGUI.search(c) else c.rstrip() + '\n\n' + renglon(slug) + '\n'
    if nuevo != c:
        open(ruta, 'w', encoding='utf-8').write(nuevo)


def asignar(slug, clave):
    d = cargar()
    if clave not in d['series']:
        sys.exit(f'No existe la serie "{clave}". Series: {", ".join(d["series"])}')
    if slug not in d['videos']:
        n = max([v[1] for v in d['videos'].values() if v[0] == clave], default=0) + 1
        d['videos'][slug] = [clave, n]
        guardar(d)
    textos(slug)
    print(f'{slug}: {d["series"][clave]} #{d["videos"][slug][1]}')


def mostrar():
    d = cargar()
    for clave, nombre in d['series'].items():
        caps = sorted((v[1], s) for s, v in d['videos'].items() if v[0] == clave)
        print(f'{clave:<10} {nombre:<22} ' + ' · '.join(f'#{n} {s}' for n, s in caps))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    a = sys.argv[1:]
    if not a:
        mostrar()
    elif a[0] == 'asignar' and len(a) == 3:
        asignar(a[1], a[2])
    elif a[0] == 'textos' and len(a) == 2:
        textos(a[1])
    else:
        sys.exit(__doc__)

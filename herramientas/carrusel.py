r"""Carruseles de @teloexplico.ar (desde el 27/10/2026, uno por día a las 16:00, automático).

Uso:
  python -I carrusel.py <clave>             renderiza videos/carruseles/<clave>/placas.json (01.jpg, 02.jpg…, hoja.png),
                                            lo controla y lo deja listo (o apartado, con el motivo)
  python -I carrusel.py controlar <clave>   solo el control
  python -I carrusel.py cola                estado de todos los carruseles

Control (nada sale si falla algo):
- los reels de origen están publicados y tienen el chequeo de datos aprobado;
- cada número de las placas y del caption está en el chequeo, el guion o el caption de algún reel de origen
  (los de una cifra también valen si son la cantidad de renglones del resumen, como "en 4 reglas", o un 0);
- 5 a 10 placas, empieza con tapa y termina con cierre, textos que entran, caption con "Seguí a @teloexplico.ar", nada de "posta".
Las placas son JPEG porque la API de Instagram no acepta PNG en carruseles.
"""
import datetime, json, os, re, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = os.path.join(RAIZ, 'motor')
C = os.path.join(RAIZ, 'videos', 'carruseles')
REGISTRO = os.path.join(C, 'carruseles.json')
GL = 'angle' if os.name == 'nt' else 'swangle'
NUM = re.compile(r'\d+(?:[.,]\d+)?')
TEXTOS = ('arriba', 'grande', 'promesa', 'etiqueta', 'titulo', 'cuerpo', 'dato', 'fuente', 'texto')
LARGOS = {'arriba': 60, 'grande': 14, 'promesa': 32, 'etiqueta': 30, 'titulo': 80, 'cuerpo': 170, 'dato': 10, 'texto': 90, 'fuente': 45}


# ---------- registro ----------
def cargar():
    return json.load(open(REGISTRO, encoding='utf-8')) if os.path.exists(REGISTRO) else []


def guardar(reg):
    tmp = REGISTRO + '.tmp'
    json.dump(reg, open(tmp, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    os.replace(tmp, REGISTRO)


def cambiar_estado(clave, estado, motivo='', origen=None):
    reg = cargar()
    v = next((x for x in reg if x['clave'] == clave), None)
    if v is None:
        v = {'clave': clave, 'estado': estado, 'origen': origen or [], 'historial': []}
        reg.append(v)
    v['estado'] = estado
    if origen:
        v['origen'] = origen
    v['historial'].append({'estado': estado, 'cuando': datetime.datetime.now().isoformat(timespec='minutes'), 'motivo': motivo})
    guardar(reg)


def listos():
    return [x for x in cargar() if x['estado'] == 'listo']


# ---------- control ----------
def textos_de(datos):
    for p in datos['placas']:
        for k in TEXTOS:
            if isinstance(p.get(k), str):
                yield k, p[k]
        for _, t in p.get('items', []):
            yield 'item', t


def controlar(clave, con_imagenes=True):
    carpeta = os.path.join(C, clave)
    problemas = []
    try:
        datos = json.load(open(os.path.join(carpeta, 'placas.json'), encoding='utf-8'))
        caption = open(os.path.join(carpeta, 'caption.txt'), encoding='utf-8').read()
    except (OSError, ValueError) as e:
        return [f'falta o está roto placas.json / caption.txt ({e})']
    placas = datos.get('placas', [])
    if not 5 <= len(placas) <= 10:
        problemas.append(f'{len(placas)} placas (van de 5 a 10)')
    if placas and (placas[0].get('tipo') != 'tapa' or placas[-1].get('tipo') != 'cierre'):
        problemas.append('tiene que empezar con la tapa y terminar con el cierre')

    cola = {v['slug']: v for v in json.load(open(os.path.join(RAIZ, 'videos', 'cola.json'), encoding='utf-8'))}
    fuentes = ''
    for slug in datos.get('origen', []):
        if cola.get(slug, {}).get('estado') != 'publicado':
            problemas.append(f'el reel de origen {slug} no está publicado')
        try:
            chequeo = json.load(open(os.path.join(RAIZ, 'videos', slug, 'chequeo.json'), encoding='utf-8'))
        except (OSError, ValueError):
            problemas.append(f'{slug} no tiene chequeo.json')
            continue
        if chequeo.get('veredicto') != 'aprobado':
            problemas.append(f'el chequeo de {slug} no está aprobado')
        fuentes += json.dumps(chequeo, ensure_ascii=False)
        for archivo in ('guion.json', 'caption.txt'):
            ruta = os.path.join(RAIZ, 'videos', slug, archivo)
            if os.path.exists(ruta):
                fuentes += open(ruta, encoding='utf-8').read()
    if not datos.get('origen'):
        problemas.append('placas.json no dice de qué reels sale ("origen")')

    validos = {n.replace(',', '.') for n in NUM.findall(fuentes)}
    cantidades = {str(len(p.get('items', []))) for p in placas if p.get('tipo') == 'resumen'} | {'0'}
    sin_fuente = []
    cuerpo_caption = '\n'.join(l for l in caption.splitlines() if not l.startswith('#'))
    for k, t in list(textos_de(datos)) + [('caption', cuerpo_caption)]:
        for n in NUM.findall(t):
            n = n.replace(',', '.')
            if n not in validos and not (len(n) == 1 and n in cantidades):
                sin_fuente.append(f'{n} ({k})')
        if k in LARGOS and len(t) > LARGOS[k]:
            problemas.append(f'{k} demasiado largo ({len(t)} > {LARGOS[k]}): "{t[:40]}…"')
        if k == 'item' and len(t) > 50:
            problemas.append(f'renglón del resumen demasiado largo: "{t[:40]}…"')
        if re.search(r'(?i)\bposta\b', t):
            problemas.append('dice "posta" (es la marca de otra cuenta)')
    if sin_fuente:
        problemas.append('números que no están en el chequeo de los reels de origen: ' + ', '.join(sorted(set(sin_fuente))))
    if 'Seguí a @teloexplico.ar' not in caption:
        problemas.append('al caption le falta "Seguí a @teloexplico.ar"')
    if con_imagenes:
        hechas = [f for f in os.listdir(carpeta) if re.fullmatch(r'\d\d\.jpg', f)]
        if len(hechas) != len(placas):
            problemas.append(f'hay {len(hechas)} imágenes para {len(placas)} placas')
    return problemas


# ---------- render ----------
def npx(*args):
    return subprocess.run(['npx', *args], cwd=M, capture_output=True, text=True, encoding='utf-8', errors='replace', shell=os.name == 'nt')


def renderizar(clave):
    carpeta = os.path.join(C, clave)
    datos = json.load(open(os.path.join(carpeta, 'placas.json'), encoding='utf-8'))
    for f in os.listdir(carpeta):  # si se rehace con menos placas, que no queden imágenes viejas
        if re.fullmatch(r'\d\d\.jpg', f):
            os.remove(os.path.join(carpeta, f))
    bundle = os.path.join(M, '.bundle-cuadros')
    r = npx('remotion', 'bundle', f'--out-dir={bundle}', '--log=error')
    if r.returncode:
        sys.exit(r.stderr[-800:])
    placas = []
    for i in range(len(datos['placas'])):
        props = os.path.join(tempfile.gettempdir(), f'carrusel-{clave}-{i}.json')
        json.dump({'datos': datos, 'i': i}, open(props, 'w', encoding='utf-8'), ensure_ascii=False)
        destino = os.path.join(carpeta, f'{i + 1:02d}.jpg')
        r = npx('remotion', 'still', bundle, 'carrusel', destino, f'--props={props}',
                '--image-format=jpeg', '--jpeg-quality=92', f'--gl={GL}', '--log=error')
        if r.returncode or not os.path.exists(destino):
            sys.exit(f'No salió la placa {i + 1}: {r.stderr[-500:]}')
        placas.append(destino)
    entradas = sum((['-i', p] for p in placas), [])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *entradas, '-filter_complex',
                    f'concat=n={len(placas)}:v=1:a=0,scale=360:450,tile=5x{(len(placas) + 4) // 5}:padding=8:color=white',
                    '-frames:v', '1', os.path.join(carpeta, 'hoja.png')], check=True)
    return datos


def hacer(clave):
    problemas = controlar(clave, con_imagenes=False)  # antes de gastar el render
    datos = None
    if not problemas:
        datos = renderizar(clave)
        problemas = controlar(clave)
    origen = (datos or {}).get('origen')
    if problemas:
        cambiar_estado(clave, 'apartado', '; '.join(problemas)[:500], origen)
        print('APARTADO:', '; '.join(problemas))
        return 1
    cambiar_estado(clave, 'listo', 'control OK', origen)
    print(f'LISTO: {len(datos["placas"])} placas en videos/carruseles/{clave}/ (revisá hoja.png)')
    return 0


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    a = sys.argv[1:]
    if a == ['cola']:
        for v in cargar():
            print(f"{v['estado']:<10} {v['clave']:<28} {', '.join(v.get('origen', []))}")
    elif len(a) == 2 and a[0] == 'controlar':
        p = controlar(a[1])
        print('\n'.join(p) if p else 'control OK')
        sys.exit(1 if p else 0)
    elif len(a) == 1:
        sys.exit(hacer(a[0]))
    else:
        sys.exit(__doc__)

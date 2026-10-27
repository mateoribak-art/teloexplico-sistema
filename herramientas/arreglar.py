"""El técnico de la oficina: Mateo toca "Arreglar con Claude" en un empleado con problemas y esto lo resuelve en la nube.

Nada se aplica solo (como el "va" del reel de referencia):
1. proponer: Claude busca la causa y, si es de código o de reglas, hace el cambio en la rama arreglo/<id>
   (no en main). Queda anotado en estado/arreglos.json con un resumen en castellano para Mateo.
2. aplicar: combina la rama en main (lo que ve la nube desde el próximo turno).
3. descartar: borra la propuesta.
Lo corre .github/workflows/arreglar.yml (botones de oficina/index.html); después sincronizar.py guarda estado/arreglos.json.

Uso: python -I arreglar.py proponer|aplicar|descartar
     (datos por variables de entorno, nunca en la línea de comandos: ARREGLO_ID, ARREGLO_EMPLEADO "es/jefe", ARREGLO_PROBLEMA)
"""
import datetime, json, os, re, subprocess, sys

H = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(H)
sys.path.insert(0, H)
from producir import LIMITE, TERMINAL  # noqa: E402

REGISTRO = os.path.join(RAIZ, 'estado', 'arreglos.json')
MODELO = 'sonnet'
# además de lo de .claude/settings.json (videos/** y motor/src/**): el código y los manuales de las tareas
PERMISOS = ['Edit(/herramientas/**)', 'Write(/herramientas/**)', 'Edit(/.claude/skills/**)', 'Write(/.claude/skills/**)']

PEDIDO = """{terminal}

Sos el técnico de la oficina de Te lo explico / Let me explain (el sistema está explicado en SISTEMA.md: herramientas/, .claude/skills/, motor/, videos/).
Mateo tocó "Arreglar con Claude" en este problema:
---
{problema}
---
1. Encontrá la causa leyendo el código y los registros (Read, Grep, Glob).
2. Si se arregla cambiando código o reglas (herramientas/**, .claude/skills/**, motor/src/**, videos/**), hacé el cambio MÍNIMO con Edit o Write,
   respetando el estilo del archivo. No toques secretos/, .github/ ni .claude/settings.json, y no corras nada que publique.
3. Si no hace falta tocar código (una cuota que se libera sola, un video que tiene que decidir Mateo, un paso que solo puede hacer él), no cambies nada.
Tu cambio NO se aplica solo: Mateo lo lee y decide.
Al final respondé SOLO esto, en castellano rioplatense simple (Mateo no es programador):
TITULO: <una línea: qué arreglaste o qué pasa>
RESUMEN: <2 a 4 líneas: cuál era la causa, qué cambiaste y qué va a pasar ahora; o, si no cambiaste nada, qué tiene que hacer Mateo>"""


def git(*args):
    return subprocess.run(['git', *args], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8', errors='replace')


def registro():
    try:
        return json.load(open(REGISTRO, encoding='utf-8'))
    except Exception:
        return []


def anotar(id_, **datos):
    lista = registro()
    a = next((x for x in lista if x['id'] == id_), None)
    if a is None:
        a = {'id': id_}
        lista.append(a)
    a.update(datos, actualizado=datetime.datetime.now().isoformat(timespec='minutes'))
    os.makedirs(os.path.dirname(REGISTRO), exist_ok=True)
    json.dump(lista[-30:], open(REGISTRO, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    return a


def cambios():
    """Archivos que cambió Claude (sin contar el registro de arreglos)."""
    return [l[3:].strip().strip('"') for l in git('status', '--porcelain').stdout.splitlines() if 'estado/arreglos.json' not in l]


def deshacer(archivos):
    git('checkout', '--', '.')
    for f in archivos:  # los nuevos (git checkout no los toca)
        p = os.path.join(RAIZ, f)
        if os.path.isfile(p) and git('ls-files', '--error-unmatch', f).returncode != 0:
            os.remove(p)


def proponer(id_, empleado, problema):
    anotar(id_, empleado=empleado, estado='trabajando', problema=problema[:1500], creado=datetime.datetime.now().isoformat(timespec='minutes'))
    try:
        r = subprocess.run(['claude', '-p', PEDIDO.format(terminal=TERMINAL, problema=problema[:6000]), '--model', MODELO,
                            '--permission-mode', 'dontAsk', '--allowedTools', *PERMISOS, '--output-format', 'json'],
                           cwd=RAIZ, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=40 * 60)
        try:
            texto = json.loads(r.stdout).get('result') or ''
        except ValueError:
            texto = r.stdout[-2000:]
        salida = texto + r.stderr
    except subprocess.TimeoutExpired:
        texto, salida = '', 'CORTADO: pasaron 40 minutos'
    if LIMITE.search(salida) or not texto:
        deshacer(cambios())
        return anotar(id_, estado='fallo', titulo='Claude no pudo trabajar ahora',
                      resumen='Claude se quedó sin cuota o no respondió. Probá de nuevo más tarde.' if LIMITE.search(salida) else salida.strip()[-400:])
    titulo = (re.search(r'TITULO:\s*(.+)', texto) or [None, 'Arreglo'])[1].strip()[:140]
    resumen = (re.search(r'RESUMEN:\s*(.+)', texto, re.S) or [None, texto])[1].strip()[:900]
    archivos = cambios()
    # que no rompa el código: si algún .py cambiado no compila, se descarta todo
    rotos = [f for f in archivos if f.endswith('.py') and os.path.exists(os.path.join(RAIZ, f))
             and subprocess.run([sys.executable, '-m', 'py_compile', os.path.join(RAIZ, f)], capture_output=True).returncode != 0]
    prohibidos = [f for f in archivos if f.startswith(('secretos/', '.github/', '.claude/settings'))]
    if rotos or prohibidos:
        deshacer(archivos)
        return anotar(id_, estado='fallo', titulo=titulo, resumen=resumen,
                      error=f"Se descartó: {'no compila ' + ', '.join(rotos) if rotos else 'tocó archivos prohibidos ' + ', '.join(prohibidos)}")
    if not archivos:
        return anotar(id_, estado='explicado', titulo=titulo, resumen=resumen)
    rama = f'arreglo/{id_}'
    git('checkout', '-q', '-b', rama)
    git('add', '-A', '--', *archivos)
    git('commit', '-q', '-m', f'Arreglo propuesto: {titulo}')
    subido = git('push', '-q', 'origin', rama)
    git('checkout', '-q', 'main')
    if subido.returncode != 0:
        return anotar(id_, estado='fallo', titulo=titulo, resumen=resumen, error='no se pudo subir la propuesta: ' + subido.stderr[-200:])
    return anotar(id_, estado='propuesto', titulo=titulo, resumen=resumen, rama=rama, archivos=archivos)


def aplicar(id_):
    a = next((x for x in registro() if x['id'] == id_), {})
    rama = a.get('rama') or f'arreglo/{id_}'
    if git('fetch', '-q', 'origin', rama).returncode != 0:
        return anotar(id_, estado='fallo', error='la propuesta ya no existe')
    if git('merge', '--squash', 'FETCH_HEAD').returncode != 0:
        git('reset', '-q', '--hard', 'HEAD')
        return anotar(id_, estado='conflicto', error='el sistema cambió desde la propuesta: descartala y pedí el arreglo de nuevo')
    git('commit', '-q', '-m', f"Arreglo aplicado desde la oficina: {a.get('titulo', id_)}")
    return anotar(id_, estado='aplicado')


def descartar(id_):
    return anotar(id_, estado='descartado')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    accion = sys.argv[1] if len(sys.argv) > 1 else ''
    id_ = os.environ.get('ARREGLO_ID', '').strip()
    if accion not in ('proponer', 'aplicar', 'descartar') or not re.fullmatch(r'[\w-]{1,40}', id_):
        sys.exit(__doc__)
    if accion == 'proponer':
        r = proponer(id_, os.environ.get('ARREGLO_EMPLEADO', ''), os.environ.get('ARREGLO_PROBLEMA', ''))
    else:
        r = globals()[accion](id_)
    print(json.dumps(r, ensure_ascii=False, indent=1))

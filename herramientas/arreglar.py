"""El técnico de la oficina: cuando un empleado tiene un problema que no se resuelve solo, Claude lo arregla en la nube.

Trabaja solo (pedido de Mateo, 27/10: "que frene solo si realmente necesitan algo de mí"):
- revisar: lo corre la vigilancia (tareas.yml, cada 2 h). Mira estado/oficina.json y, por cada problema nuevo que no se
  arregla solo (una cuota que se libera, un reintento programado), dispara arreglar.yml. Un intento por problema, 4 por día.
- arreglar: Claude busca la causa y la resuelve (código, reglas, cola, relanzar un flujo). Si el cambio pasa los chequeos,
  queda aplicado en main y avisa al celular; Mateo lo puede deshacer desde la oficina. Si de verdad hace falta Mateo
  (login, clave, pago, una decisión suya), queda "necesita" y le llega el aviso.
- deshacer: revierte un arreglo aplicado. visto: Mateo ya hizo lo que se le pedía.
Lo corre .github/workflows/arreglar.yml (también los botones de oficina/index.html); después sincronizar.py guarda todo.

Uso: python -I arreglar.py revisar | arreglar | deshacer | visto
     (datos por variables de entorno, nunca en la línea de comandos: ARREGLO_ID, ARREGLO_EMPLEADO "es/jefe", ARREGLO_PROBLEMA)
"""
import datetime, hashlib, json, os, re, subprocess, sys, time

H = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(H)
sys.path.insert(0, H)
from avisar import avisar  # noqa: E402
from producir import LIMITE, TERMINAL  # noqa: E402

REGISTRO = os.path.join(RAIZ, 'estado', 'arreglos.json')
OFICINA = os.path.join(RAIZ, 'estado', 'oficina.json')
MODELO = 'sonnet'
POR_DIA = 4  # arreglos automáticos como mucho por día (la cuota de Claude es la misma que la de producción)
# además de lo de .claude/settings.json (videos/**, motor/src/**, tlx): el código, los manuales de las tareas y relanzar flujos
PERMISOS = ['Edit(/herramientas/**)', 'Write(/herramientas/**)', 'Edit(/.claude/skills/**)', 'Write(/.claude/skills/**)',
            'Bash(gh workflow run:*)', 'Bash(gh run list:*)', 'Bash(gh run view:*)']

PEDIDO = """{terminal}
- También podés usar `gh run list`, `gh run view <id> --log-failed` (ver por qué falló un flujo) y `gh workflow run <flujo>.yml -f ...` (relanzarlo).

Sos el técnico de la oficina de Te lo explico / Let me explain (el sistema está explicado en SISTEMA.md: herramientas/, .claude/skills/,
motor/, videos/, .github/workflows/). Trabajás solo: nadie revisa antes, así que resolvelo de punta a punta.
El problema:
---
{problema}
---
1. Encontrá la causa (código, registros, corridas de GitHub).
2. Resolvelo vos: arreglá el código o las reglas con Edit/Write (cambio mínimo, con el estilo del archivo), mové videos en la cola con
   `./herramientas/tlx cola ...` (por ejemplo, rehacer uno apartado) o relanzá el flujo que corresponda. No toques secretos/, .github/
   ni .claude/settings.json, y no publiques nada a mano.
3. Si se arregla solo (una cuota que se libera, un reintento ya programado), no cambies nada.
4. Pedí a Mateo SOLO lo que una máquina no puede hacer: iniciar sesión, cargar o renovar una clave, pagar, dar un permiso en una cuenta,
   o una decisión que de verdad es suya. Todo lo demás lo decidís vos con el criterio de los skills.
Al final respondé SOLO esto, en castellano rioplatense simple (Mateo no es programador):
TITULO: <una línea: qué pasaba y qué hiciste>
RESUMEN: <2 a 4 líneas: la causa, qué cambiaste o hiciste, y qué va a pasar ahora>
NECESITA_A_MATEO: <si | no>
QUE_HACER: <si es "si": el paso exacto que tiene que hacer Mateo; si es "no": ->"""


def git(*args):
    return subprocess.run(['git', *args], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8', errors='replace')


def leer(ruta, defecto):
    try:
        return json.load(open(ruta, encoding='utf-8'))
    except Exception:
        return defecto


def anotar(id_, **datos):
    lista = leer(REGISTRO, [])
    a = next((x for x in lista if x['id'] == id_), None)
    if a is None:
        a = {'id': id_, 'creado': datetime.datetime.now().isoformat(timespec='minutes')}
        lista.append(a)
    a.update(datos, actualizado=datetime.datetime.now().isoformat(timespec='minutes'))
    os.makedirs(os.path.dirname(REGISTRO), exist_ok=True)
    json.dump(lista[-40:], open(REGISTRO, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    return a


def firma(clave, e):
    return hashlib.md5(f"{clave}/{e['id']}:{e['resumen']}".encode()).hexdigest()[:12]


def cambios():
    """Archivos que cambió Claude (sin contar los registros de la oficina)."""
    return [l[3:].strip().strip('"') for l in git('status', '--porcelain').stdout.splitlines()
            if not l[3:].strip().startswith(('estado/arreglos.json', 'estado/oficina.json'))]


def deshacer_cambios(archivos):
    git('checkout', '--', '.')
    for f in archivos:  # los nuevos (git checkout no los toca)
        p = os.path.join(RAIZ, f)
        if os.path.isfile(p) and git('ls-files', '--error-unmatch', f).returncode != 0:
            os.remove(p)


def revisar():
    """Dispara el técnico para cada problema nuevo de la oficina que no se arregla solo."""
    if os.path.exists(os.path.join(RAIZ, 'PAUSA')):
        return print('PAUSA activa: el técnico no sale')
    datos = leer(OFICINA, {})
    lista = leer(REGISTRO, [])
    hechas = {a.get('firma') for a in lista}
    desde = (datetime.datetime.now() - datetime.timedelta(days=1)).isoformat(timespec='minutes')
    hoy = sum(1 for a in lista if a.get('auto') and a.get('creado', '') >= desde)
    for o in datos.get('oficinas', []):
        for e in o['empleados']:
            f = e.get('firma') or firma(o['clave'], e)
            if e['estado'] not in ('aviso', 'falla') or e.get('solo') or f in hechas:
                continue
            if hoy >= POR_DIA:
                print(f'tope de {POR_DIA} arreglos automáticos por día: queda para mañana', e['id'])
                return
            id_ = f"{datetime.datetime.now():%m%d%H%M}-{o['clave']}-{e['id']}"
            problema = '\n'.join([f"En la oficina de {o['ciudad']} (@{o['usuario']}), {e['nombre']} ({e['puesto']}) está en \"{e['estado']}\": {e['resumen']}",
                                  f"Lo que sugiere la oficina: {e['arreglo']}" if e.get('arreglo') else '',
                                  'Tareas:\n' + '\n'.join(e['tareas']) if e['tareas'] else '',
                                  'Registro:\n' + '\n'.join(e['detalle'][-10:]) if e['detalle'] else ''])
            r = subprocess.run(['gh', 'workflow', 'run', 'arreglar.yml', '-f', 'accion=arreglar', '-f', f'id={id_}', '-f', f"empleado={o['clave']}/{e['id']}",
                                '-f', f'problema={problema[:6000]}', '-f', 'auto=si'], cwd=RAIZ, capture_output=True, text=True)
            if r.returncode == 0:
                anotar(id_, empleado=f"{o['clave']}/{e['id']}", firma=f, estado='pedido', auto=True, problema=problema[:1500])
                hechas.add(f); hoy += 1
                print('técnico lanzado:', id_)
                time.sleep(2)
            else:
                print('no se pudo lanzar el técnico:', r.stderr[-200:])


def arreglar(id_, empleado, problema, auto):
    # pedido desde el botón: se anota la firma del problema para que la vigilancia no lance otro igual
    extra = {}
    for o in leer(OFICINA, {}).get('oficinas', []):
        for e in o['empleados']:
            if f"{o['clave']}/{e['id']}" == empleado and e['estado'] in ('aviso', 'falla'):
                extra['firma'] = e.get('firma') or firma(o['clave'], e)
    anotar(id_, empleado=empleado, estado='trabajando', auto=auto, problema=problema[:1500], **extra)
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
        deshacer_cambios(cambios())
        # sin cuota: se olvida la firma para que la próxima vigilancia lo vuelva a intentar
        return anotar(id_, estado='fallo', firma=None, titulo='Claude no pudo trabajar ahora',
                      resumen='Claude se quedó sin cuota o no respondió. Se vuelve a intentar solo más tarde.' if LIMITE.search(salida) else salida.strip()[-400:])
    campo = lambda n, hasta: (re.search(rf'{n}:\s*(.+?)\s*(?=\n[A-Z_]+:|\Z)', texto, re.S) or [None, ''])[1].strip()[:hasta]
    titulo, resumen = campo('TITULO', 140) or 'Arreglo', campo('RESUMEN', 900) or texto[-900:]
    necesita = campo('NECESITA_A_MATEO', 5).lower().startswith('s')
    que_hacer = campo('QUE_HACER', 600)
    archivos = cambios()
    # red de seguridad: si algún .py cambiado no compila o tocó algo prohibido, se descarta todo
    rotos = [f for f in archivos if f.endswith('.py') and os.path.exists(os.path.join(RAIZ, f))
             and subprocess.run([sys.executable, '-m', 'py_compile', os.path.join(RAIZ, f)], capture_output=True).returncode != 0]
    prohibidos = [f for f in archivos if f.startswith(('secretos/', '.github/', '.claude/settings'))]
    if rotos or prohibidos:
        deshacer_cambios(archivos)
        avisar('🔧 El técnico no pudo arreglar algo', f'{titulo}\nSe descartó su cambio porque ' + ('no compilaba.' if rotos else 'tocaba archivos prohibidos.'))
        return anotar(id_, estado='fallo', titulo=titulo, resumen=resumen,
                      error=f"Se descartó el cambio: {'no compila ' + ', '.join(rotos) if rotos else 'tocó archivos prohibidos ' + ', '.join(prohibidos)}")
    commit = None
    if archivos:
        git('add', '-A', '--', *archivos)
        git('commit', '-q', '-m', f'Arreglo del técnico ({empleado}): {titulo}')
        commit = git('rev-parse', 'HEAD').stdout.strip()
    if necesita:
        avisar('🙋 La oficina necesita algo tuyo', f'{titulo}\n{que_hacer}', 'alta')
        return anotar(id_, estado='necesita', titulo=titulo, resumen=resumen, que_hacer=que_hacer, commit=commit, archivos=archivos)
    if commit:
        avisar('🔧 La oficina arregló algo sola', f'{titulo}\n{resumen[:300]}\n(Si no te gusta, en la oficina está el botón Deshacer.)', 'baja')
        return anotar(id_, estado='aplicado', titulo=titulo, resumen=resumen, commit=commit, archivos=archivos)
    return anotar(id_, estado='explicado', titulo=titulo, resumen=resumen)


def deshacer(id_):
    a = next((x for x in leer(REGISTRO, []) if x['id'] == id_), {})
    if not a.get('commit'):
        return anotar(id_, estado='fallo', error='no hay cambio para deshacer')
    if git('revert', '--no-edit', a['commit']).returncode != 0:
        git('revert', '--abort')
        return anotar(id_, estado='fallo', error='el sistema cambió después del arreglo y no se puede deshacer solo')
    return anotar(id_, estado='deshecho')


def visto(id_):
    return anotar(id_, estado='visto')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    accion = sys.argv[1] if len(sys.argv) > 1 else ''
    if accion == 'revisar':
        revisar()
        sys.exit()
    id_ = os.environ.get('ARREGLO_ID', '').strip()
    if accion not in ('arreglar', 'deshacer', 'visto') or not re.fullmatch(r'[\w-]{1,40}', id_):
        sys.exit(__doc__)
    if accion == 'arreglar':
        r = arreglar(id_, os.environ.get('ARREGLO_EMPLEADO', ''), os.environ.get('ARREGLO_PROBLEMA', ''), os.environ.get('ARREGLO_AUTO') == 'si')
    else:
        r = globals()[accion](id_)
    print(json.dumps(r, ensure_ascii=False, indent=1))

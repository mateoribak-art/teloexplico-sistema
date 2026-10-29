"""Autorreparación sin Claude (29/10/2026): lo que se puede arreglar con reglas no espera a que alguien lo vea.

Lo corre la vigilancia (tareas.yml) antes del técnico. Hace dos cosas:
1. Videos apartados por render/control (voz que "no coincide", render caído): vuelven a `render` UNA vez, así producir.py los
   renderiza y controla de nuevo (la mayoría son falsos rechazos del control). Si fallan otra vez, quedan para el técnico.
2. Flujos de GitHub Actions que fallan 2 veces seguidas (como el Carrusel, que falló 8 veces sin que nadie lo viera): despierta al
   técnico con el final del log, una vez por error distinto y hasta TOPE_FLUJOS por día (aparte del tope de arreglar.py).

Uso: python -I reparar.py
"""
import datetime, hashlib, json, os, re, subprocess, sys

H = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(H)
sys.path.insert(0, H)
import cuenta  # noqa: E402
import arreglar  # noqa: E402

REPO = 'mateoribak-art/teloexplico-sistema'
FLUJOS = ['Carrusel', 'Publicar', 'Claude', 'Resumen y vigilancia']
TOPE_FLUJOS = 3
MARCA = 'reintento auto'


def reintentar_apartados():
    if os.path.exists(os.path.join(RAIZ, 'PAUSA')):
        return
    for clave, c in cuenta.CUENTAS.items():
        ruta = os.path.join(c['videos'], 'cola.json')
        if not os.path.exists(ruta):
            continue
        cola = json.load(open(ruta, encoding='utf-8'))
        tocado = False
        for v in cola:
            hist = v.get('historial', [])
            if v['estado'] != 'apartado' or not hist or not hist[-1].get('motivo', '').startswith('render/control'):
                continue
            if any(h.get('motivo', '').startswith(MARCA) for h in hist):
                continue  # ya se reintentó una vez: ahora lo mira el técnico
            tsx = os.path.join(RAIZ, 'motor', 'src', 'videos', v['slug'], 'Video.tsx')
            if not os.path.exists(tsx):
                continue  # sin escenas en el repo no hay qué renderizar
            ahora = datetime.datetime.now().isoformat(timespec='minutes')
            v['estado'] = 'render'
            hist.append({'estado': 'render', 'cuando': ahora, 'motivo': f'{MARCA}: apartado por render/control; se renderiza y controla de nuevo'})
            v['historial'] = hist
            tocado = True
            print(f'{clave}: {v["slug"]} vuelve a render (reintento automático)')
        if tocado:
            json.dump(cola, open(ruta, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)


def gh(*args):
    return subprocess.run(['gh', *args, '-R', REPO], capture_output=True, text=True, encoding='utf-8', errors='replace', cwd=RAIZ)


def flujos_caidos():
    if os.path.exists(os.path.join(RAIZ, 'PAUSA')):
        return
    lista = arreglar.leer(arreglar.REGISTRO, [])
    hechas = {a.get('firma') for a in lista}
    desde = (datetime.datetime.now() - datetime.timedelta(days=1)).isoformat(timespec='minutes')
    hoy = sum(1 for a in lista if a.get('flujo') and a.get('creado', '') >= desde)
    for nombre in FLUJOS:
        r = gh('run', 'list', '-w', nombre, '-L', '4', '--json', 'databaseId,conclusion,status')
        try:
            corridas = [x for x in json.loads(r.stdout) if x['status'] == 'completed' and x['conclusion'] != 'cancelled']
        except Exception:
            continue
        if len(corridas) < 2 or any(x['conclusion'] != 'failure' for x in corridas[:2]):
            continue
        log = gh('run', 'view', str(corridas[0]['databaseId']), '--log-failed').stdout
        errores = [l.split('Z ', 1)[-1] for l in log.splitlines() if re.search(r'Error|Traceback|exit code|No such file|not found', l)]
        final = '\n'.join(errores[-6:])[:1500] or log[-1500:]
        f = hashlib.md5(f'{nombre}:{errores[-1] if errores else ""}'.encode()).hexdigest()[:12]
        if f in hechas:
            continue
        if hoy >= TOPE_FLUJOS:
            print('tope diario de arreglos de flujos')
            return
        id_ = f"{datetime.datetime.now():%m%d%H%M}-flujo-{re.sub(r'[^a-z]', '', nombre.lower())[:10]}"
        problema = (f'El flujo de GitHub Actions "{nombre}" falló las últimas 2 veces seguidas (corrida {corridas[0]["databaseId"]}). '
                    f'Es un error de código o de configuración: leé el log con `gh run view {corridas[0]["databaseId"]} --log-failed`, '
                    f'encontrá la causa en herramientas/ o .github/workflows y corregila (sin tocar secretos).\nFinal del log:\n{final}')
        r = subprocess.run(['gh', 'workflow', 'run', 'arreglar.yml', '-f', 'accion=arreglar', '-f', f'id={id_}', '-f', f'empleado=es/flujo-{nombre}',
                            '-f', f'problema={problema[:6000]}', '-f', 'auto=si'], cwd=RAIZ, capture_output=True, text=True)
        if r.returncode == 0:
            arreglar.anotar(id_, empleado=f'es/flujo-{nombre}', firma=f, estado='pedido', auto=True, flujo=nombre, problema=problema[:1500])
            hechas.add(f); hoy += 1
            print('técnico lanzado por flujo caído:', nombre)
        else:
            print('no se pudo lanzar el técnico:', r.stderr[-200:])


if __name__ == '__main__':
    reintentar_apartados()
    flujos_caidos()

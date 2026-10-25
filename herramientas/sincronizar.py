"""Sincroniza el estado de @teloexplico.ar con el repo privado (mateoribak-art/teloexplico-sistema).

Lo usan la notebook (antes y después de producir) y la nube (al final de cada turno de GitHub Actions):
1. Sube al Release "videos" los .mp4 de los videos listos que todavía no estén ahí (el repo no guarda videos).
2. En la nube: si el token de TikTok se renovó, lo vuelve a guardar cifrado en estado/tiktok_token.enc.
3. Guarda los cambios (cola, registros, guiones, logs) en un commit, trae lo de la otra punta y sube.

Uso: python -I sincronizar.py ["mensaje del commit"]
Sale con código 1 si no pudo subir (y avisa al celular).
"""
import hashlib, json, os, subprocess, sys, time

H = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(H)
sys.path.insert(0, H)
from avisar import avisar  # noqa: E402

NUBE = bool(os.environ.get('TLX_NUBE'))


def correr(*args, **kw):
    return subprocess.run(list(args), cwd=RAIZ, capture_output=True, text=True, encoding='utf-8', errors='replace', **kw)


def subir_videos():
    r = correr('gh', 'release', 'view', 'videos', '--json', 'assets', '--jq', '.assets[].name')
    if r.returncode != 0:
        return [f'no se pudo leer el Release: {r.stderr.strip()[-200:]}']
    en_release = set(r.stdout.split())
    errores = []
    for v in json.load(open(os.path.join(RAIZ, 'videos', 'cola.json'), encoding='utf-8')):
        nombre = f"{v['slug']}.mp4"
        local = os.path.join(RAIZ, 'videos', v['slug'], nombre)
        if v['estado'] == 'listo' and nombre not in en_release and os.path.exists(local):
            s = correr('gh', 'release', 'upload', 'videos', local, '--clobber')
            print(('subido ' if s.returncode == 0 else 'NO se pudo subir ') + nombre)
            if s.returncode != 0:
                errores.append(f'{nombre}: {s.stderr.strip()[-150:]}')
    return errores


def guardar_token_tiktok():
    """En la nube el token vive cifrado en el repo; si publicar_tiktok.py lo renovó, se vuelve a cifrar."""
    plano = os.path.join(RAIZ, 'secretos', 'tiktok_token.json')
    marca = os.path.join(RAIZ, 'secretos', '.tiktok_token.sha')
    if not (NUBE and os.path.exists(plano)):
        return
    actual = hashlib.sha256(open(plano, 'rb').read()).hexdigest()
    if os.path.exists(marca) and open(marca).read().strip() == actual:
        return
    os.makedirs(os.path.join(RAIZ, 'estado'), exist_ok=True)
    correr('openssl', 'enc', '-aes-256-cbc', '-pbkdf2', '-salt', '-pass', 'env:CLAVE_ESTADO',
           '-in', plano, '-out', os.path.join(RAIZ, 'estado', 'tiktok_token.enc'), check=True)
    print('token de TikTok renovado: guardado cifrado')


def combinar(ruta, remoto, local):
    """Combina un archivo de estado que cambió en las dos puntas a la vez. Nunca se pierde un "publicado"."""
    nombre = os.path.basename(ruta)
    if nombre == 'cola.json':
        # por video gana el que tiene el historial más largo (el estado más avanzado)
        r, l = json.loads(remoto), json.loads(local)
        todos = {v['slug']: v for v in r}
        for v in l:
            if v['slug'] not in todos or len(v.get('historial', [])) > len(todos[v['slug']].get('historial', [])):
                todos[v['slug']] = v
        orden = [v['slug'] for v in r] + [v['slug'] for v in l if v['slug'] not in {x['slug'] for x in r}]
        return json.dumps([todos[s] for s in orden], ensure_ascii=False, indent=1)
    if nombre.startswith('publicados') and nombre.endswith('.json'):
        r, l = json.loads(remoto), json.loads(local)
        vistos = {json.dumps(x, sort_keys=True) for x in r}
        return json.dumps(r + [x for x in l if json.dumps(x, sort_keys=True) not in vistos], ensure_ascii=False, indent=1)
    if nombre == 'metricas.json':
        r, l = json.loads(remoto), json.loads(local)
        for k in ('cuenta', 'reels'):
            r.setdefault(k, {}).update(l.get(k, {}))
        return json.dumps(r, ensure_ascii=False, indent=1)
    if nombre == 'ideas.md':
        # gana la versión marcada ([usada → …], [descartada …]) de cada idea; las ideas nuevas se suman al final
        clave = lambda x: x.split(']', 1)[1].strip() if x.startswith('- [') and ']' in x else None
        lineas = remoto.splitlines()
        donde = {clave(x): i for i, x in enumerate(lineas) if clave(x)}
        for x in local.splitlines():
            k = clave(x)
            if k is None or x in lineas:
                continue
            if k in donde:
                if not x.startswith('- [ ]'):
                    lineas[donde[k]] = x
            else:
                lineas.append(x)
        return '\n'.join(lineas) + '\n'
    if nombre.endswith('.log'):
        r = remoto.splitlines()
        ya = set(r)
        return '\n'.join(r + [x for x in local.splitlines() if x not in ya]) + '\n'
    return local  # avisos, panel, guiones: vale lo último


def resolver_conflictos():
    """Durante un pull --rebase: :2: es lo que ya está en el repo y :3: el commit local que se está aplicando."""
    for _ in range(20):
        en_conflicto = correr('git', 'diff', '--name-only', '--diff-filter=U').stdout.split()
        if not en_conflicto:
            return True
        for ruta in en_conflicto:
            remoto, local = correr('git', 'show', f':2:{ruta}'), correr('git', 'show', f':3:{ruta}')
            if remoto.returncode != 0 or local.returncode != 0:
                return False  # borrado de un lado: no se adivina
            open(os.path.join(RAIZ, ruta), 'w', encoding='utf-8', newline='\n').write(combinar(ruta, remoto.stdout, local.stdout))
            correr('git', 'add', ruta)
            print(f'combinado: {ruta}')
        if correr('git', '-c', 'core.editor=true', 'rebase', '--continue').returncode != 0 and \
                not correr('git', 'diff', '--name-only', '--diff-filter=U').stdout.split():
            return False
    return False


def main(mensaje):
    errores = subir_videos()
    guardar_token_tiktok()
    if NUBE:
        correr('git', 'config', 'user.name', 'teloexplico-nube')
        correr('git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
    correr('git', 'add', '-A')
    if correr('git', 'diff', '--cached', '--quiet').returncode != 0:
        correr('git', 'commit', '-q', '-m', mensaje)
    for intento in range(5):
        p = correr('git', 'pull', '--rebase', '-q')
        if p.returncode != 0 and not resolver_conflictos():
            correr('git', 'rebase', '--abort')
            errores.append(f'no se pudo combinar con el repo: {(p.stdout + p.stderr).strip()[-200:]}')
            break
        s = correr('git', 'push', '-q')
        if s.returncode == 0:
            print('sincronizado')
            break
        time.sleep(5 * (intento + 1))
    else:
        errores.append('no se pudo subir el estado al repo después de 5 intentos')
    if errores:
        print('\n'.join(errores))
        avisar('⚠️ Sincronización', ('nube' if NUBE else 'notebook') + ': ' + ' | '.join(errores)[:300])
        return 1
    return 0


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else 'Estado actualizado'))

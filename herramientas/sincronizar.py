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
        if p.returncode != 0:
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

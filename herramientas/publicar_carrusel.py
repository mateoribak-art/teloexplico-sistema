r"""Publica un carrusel en @teloexplico.ar con la API oficial de Instagram (27/10/2026).

Uso:
  python -I publicar_carrusel.py <clave> [--probar]

  <clave>    carpeta en videos/carruseles/ (usa 01.jpg, 02.jpg… y caption.txt; las arma carrusel.py)
  --probar   arma el carrusel en Instagram pero NO lo publica

Las placas se suben al Release "videos" del repo privado (carrusel-<clave>-NN.jpg) y Meta las baja de ahí con un link firmado,
igual que los reels. No es parte del publicador automático: un carrusel sale solo cuando Mateo lo pide.
"""
import glob, json, os, subprocess, sys, time, urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from publicar import API, CONF, REPO, RAIZ, link_temporal, pedir  # noqa: E402

REGISTRO = os.path.join(RAIZ, 'videos', 'carruseles', 'publicados.json')


def esperar(cid, token):
    for _ in range(40):
        e = pedir('GET', f'{API}/{cid}?' + urllib.parse.urlencode({'fields': 'status_code', 'access_token': token}))
        if e.get('status_code') in ('FINISHED', 'ERROR', 'EXPIRED'):
            return e.get('status_code')
        time.sleep(3)
    return 'IN_PROGRESS'


def main():
    args = sys.argv[1:]
    clave, probar = args[0], '--probar' in args
    carpeta = os.path.join(RAIZ, 'videos', 'carruseles', clave)
    placas = sorted(glob.glob(os.path.join(carpeta, '[0-9][0-9].jpg')))
    if not 2 <= len(placas) <= 20:
        sys.exit(f'Un carrusel lleva de 2 a 20 placas; en {clave} hay {len(placas)}.')
    caption = open(os.path.join(carpeta, 'caption.txt'), encoding='utf-8').read().strip()
    token, ig = CONF['page_token'], CONF['ig_id']
    print(f"Cuenta: @{CONF['ig_usuario']} | carrusel: {clave} ({len(placas)} placas)")

    nombres = [f'carrusel-{clave}-{os.path.basename(p)}' for p in placas]
    copias = []
    for p, n in zip(placas, nombres):  # gh sube con el nombre del archivo: copia con el nombre del Release
        destino = os.path.join(os.environ.get('TEMP', '/tmp'), n)
        open(destino, 'wb').write(open(p, 'rb').read())
        copias.append(destino)
    subprocess.run(['gh', 'release', 'upload', 'videos', *copias, '--clobber', '-R', REPO], check=True, capture_output=True)

    hijos = []
    for n in nombres:
        url = link_temporal(None, n)
        if not url:
            sys.exit(f'No se pudo armar el link de {n} en el Release.')
        h = pedir('POST', f'{API}/{ig}/media', {'image_url': url, 'is_carousel_item': 'true', 'access_token': token})
        if esperar(h['id'], token) != 'FINISHED':
            sys.exit(f'Instagram no procesó la placa {n}.')
        hijos.append(h['id'])
        print(f'  placa {n}: ok')

    cont = pedir('POST', f'{API}/{ig}/media', {'media_type': 'CAROUSEL', 'children': ','.join(hijos), 'caption': caption, 'access_token': token})
    if esperar(cont['id'], token) != 'FINISHED':
        sys.exit('Instagram no terminó de armar el carrusel.')
    if probar:
        print('Modo prueba: NO se publicó. Contenedor listo:', cont['id'])
        return

    pub = pedir('POST', f'{API}/{ig}/media_publish', {'creation_id': cont['id'], 'access_token': token})
    info = pedir('GET', f'{API}/{pub["id"]}?' + urllib.parse.urlencode({'fields': 'permalink,timestamp', 'access_token': token}))
    print('PUBLICADO:', info.get('permalink'))
    registro = json.load(open(REGISTRO, encoding='utf-8')) if os.path.exists(REGISTRO) else []
    registro.append({'clave': clave, 'media_id': pub['id'], 'permalink': info.get('permalink'), 'publicado': info.get('timestamp')})
    json.dump(registro, open(REGISTRO, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    if not sys.argv[1:]:
        sys.exit(__doc__)
    main()

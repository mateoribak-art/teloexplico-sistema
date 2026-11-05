r"""Publica un carrusel en @teloexplico.ar con la API oficial de Instagram (27/10/2026).

Uso:
  python -I publicar_carrusel.py <clave> [--probar]
  python -I publicar_carrusel.py --toca      "si" si el turno de las 16:00 de hoy no está cubierto (lo usa carrusel.yml)
  python -I publicar_carrusel.py --turno     publica el próximo carrusel listo (registro: videos/carruseles/carruseles.json)

  <clave>    carpeta en videos/carruseles/ (usa 01.jpg, 02.jpg… y caption.txt; las arma carrusel.py)
  --probar   arma el carrusel en Instagram pero NO lo publica

Las placas se suben al Release "videos" del repo privado (carrusel-<clave>-NN.jpg) y Meta las baja de ahí con un link firmado,
igual que los reels. Desde el 27/10 sale uno por día a las 16:00 (GitHub Actions, carrusel.yml), entre los reels de 12:30 y 19:30.
"""
import datetime, glob, json, os, subprocess, sys, time, urllib.parse, zoneinfo

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from publicar import REPO, RAIZ, link_temporal, pedir  # noqa: E402
import cuenta  # noqa: E402
import carrusel  # noqa: E402
from avisar import avisar  # noqa: E402

# los carruseles son solo de @teloexplico.ar (publicar.py ya no exporta API/CONF desde que hay dos cuentas)
CONF = json.load(open(cuenta.CUENTAS['es']['meta'], encoding='utf-8-sig'))
API = f"https://graph.facebook.com/{CONF['graph_version']}"
REGISTRO = os.path.join(RAIZ, 'videos', 'carruseles', 'publicados.json')
ARGENTINA = zoneinfo.ZoneInfo('America/Argentina/Buenos_Aires')
TURNO = (16, 0)


def esperar(cid, token):
    for _ in range(40):
        e = pedir('GET', f'{API}/{cid}?' + urllib.parse.urlencode({'fields': 'status_code', 'access_token': token}))
        if e.get('status_code') in ('FINISHED', 'ERROR', 'EXPIRED'):
            return e.get('status_code')
        time.sleep(3)
    return 'IN_PROGRESS'


def publicar(clave, probar=False):
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

    for intento in range(4):  # Instagram a veces devuelve un 500 pasajero; armar el contenedor se puede repetir sin riesgo
        try:
            cont = pedir('POST', f'{API}/{ig}/media', {'media_type': 'CAROUSEL', 'children': ','.join(hijos), 'caption': caption, 'access_token': token})
            break
        except SystemExit as e:
            if intento == 3 or '(500)' not in str(e.code):
                raise
            print(f'  Instagram dio 500 al armar el carrusel; reintento {intento + 1}/3')
            time.sleep(20 * (intento + 1))
    if esperar(cont['id'], token) != 'FINISHED':
        sys.exit('Instagram no terminó de armar el carrusel.')
    if probar:
        print('Modo prueba: NO se publicó. Contenedor listo:', cont['id'])
        return None

    pub = pedir('POST', f'{API}/{ig}/media_publish', {'creation_id': cont['id'], 'access_token': token})
    info = pedir('GET', f'{API}/{pub["id"]}?' + urllib.parse.urlencode({'fields': 'permalink,timestamp', 'access_token': token}))
    print('PUBLICADO:', info.get('permalink'))
    registro = json.load(open(REGISTRO, encoding='utf-8')) if os.path.exists(REGISTRO) else []
    registro.append({'clave': clave, 'media_id': pub['id'], 'permalink': info.get('permalink'), 'publicado': info.get('timestamp')})
    json.dump(registro, open(REGISTRO, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    return info.get('permalink')


def turno_cubierto():
    """GitHub arranca tarde o saltea lo programado: hay varios intentos y el primero que corre publica."""
    ahora = datetime.datetime.now(ARGENTINA)
    inicio = ahora.replace(hour=TURNO[0], minute=TURNO[1], second=0, microsecond=0)
    if ahora < inicio:
        return True  # todavía no es la hora
    for p in (json.load(open(REGISTRO, encoding='utf-8')) if os.path.exists(REGISTRO) else []):
        try:
            if datetime.datetime.strptime(p['publicado'], '%Y-%m-%dT%H:%M:%S%z') >= inicio:
                return True
        except (KeyError, ValueError):
            continue
    return False


def turno():
    if os.path.exists(os.path.join(RAIZ, 'PAUSA')):
        print('PAUSA activa: no se publica el carrusel.')
        return
    if turno_cubierto():
        print('El turno del carrusel ya está cubierto.')
        return
    for v in carrusel.listos():
        problemas = carrusel.controlar(v['clave'])
        if problemas:
            carrusel.cambiar_estado(v['clave'], 'apartado', '; '.join(problemas)[:500])
            avisar('⚠️ Carrusel apartado', f"{v['clave']}: {'; '.join(problemas)[:300]}")
            continue
        link = publicar(v['clave'])
        carrusel.cambiar_estado(v['clave'], 'publicado', link or '')
        avisar('✅ Carrusel publicado', v['clave'], 'baja', link=link)
        return
    print('No hay carruseles listos: hoy no sale ninguno.')
    avisar('ℹ️ Sin carrusel hoy', 'No había carruseles listos para las 16:00. La producción arma uno en el próximo turno.', 'baja')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    a = sys.argv[1:]
    if a == ['--toca']:
        print('no' if turno_cubierto() or os.path.exists(os.path.join(RAIZ, 'PAUSA')) else 'si')
    elif a == ['--turno']:
        turno()
    elif a and not a[0].startswith('--'):
        publicar(a[0], '--probar' in a)
    else:
        sys.exit(__doc__)

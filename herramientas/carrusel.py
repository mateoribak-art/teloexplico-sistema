r"""Carruseles de @teloexplico.ar (27/10/2026): renderiza las placas de motor/src/carruseles/Carrusel.tsx.

Uso:
  python -I carrusel.py <clave>       placas en videos/carruseles/<clave>/01.jpg, 02.jpg… y hoja.png para revisar

Las placas son JPEG porque la API de Instagram no acepta PNG en carruseles. El texto del post va en caption.txt de esa carpeta.
"""
import os, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = os.path.join(RAIZ, 'motor')
GL = 'angle' if os.name == 'nt' else 'swangle'


def npx(*args):
    return subprocess.run(['npx', *args], cwd=M, capture_output=True, text=True, encoding='utf-8', errors='replace', shell=os.name == 'nt')


def main(clave):
    salida = os.path.join(RAIZ, 'videos', 'carruseles', clave)
    os.makedirs(salida, exist_ok=True)
    bundle = os.path.join(M, '.bundle-cuadros')
    r = npx('remotion', 'bundle', f'--out-dir={bundle}', '--log=error')
    if r.returncode:
        sys.exit(r.stderr[-800:])
    placas = []
    for i in range(20):  # tope de Instagram; corta en la primera placa que no existe
        destino = os.path.join(salida, f'{i + 1:02d}.jpg')
        r = npx('remotion', 'still', bundle, 'carrusel', destino, f'--props={{"clave":"{clave}","i":{i}}}',
                '--image-format=jpeg', '--jpeg-quality=92', f'--gl={GL}', '--log=error')
        if r.returncode or not os.path.exists(destino):
            break
        placas.append(destino)
    if not placas:
        sys.exit(f'No se pudo renderizar ninguna placa de "{clave}": {r.stderr[-500:]}')
    entradas = sum((['-i', p] for p in placas), [])
    filas = (len(placas) + 4) // 5
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *entradas, '-filter_complex',
                    f'concat=n={len(placas)}:v=1:a=0,scale=360:450,tile=5x{filas}:padding=8:color=white', '-frames:v', '1',
                    os.path.join(salida, 'hoja.png')], check=True)
    print(f'{len(placas)} placas en videos/carruseles/{clave}/ (hoja.png para revisar)')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])

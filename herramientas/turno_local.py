"""Turnos en la notebook para las DOS cuentas (desde el 20/11/2026: GitHub Actions quedó bloqueado por facturación).

Uso: python -I turno_local.py produccion | publicar

- produccion: sincroniza, corre producir.py produccion para español y después para inglés (TLX_CUENTA=en),
  que renderiza los videos en estado `render`, produce si falta colchón, corre el radar y los carruseles; vuelve a sincronizar.
- publicar: publicador.py para español y para inglés (cada uno con su cola y sus turnos 12:30 y 19:30).
Reemplaza a producir_noche.ps1, que no renderizaba los 3D ni trabajaba para @letmeexplain.us.
"""
import ctypes, datetime, os, subprocess, sys

H = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(H)
PY = sys.executable
LOG = os.path.join(RAIZ, 'videos', 'turno_local.log')


def escribir(msg):
    with open(LOG, 'a', encoding='utf-8') as f:
        f.write(f'{datetime.datetime.now():%Y-%m-%d %H:%M} {msg}\n')


def correr(args, cuenta, minutos):
    env = dict(os.environ, TLX_CUENTA=cuenta)
    try:
        r = subprocess.run([PY, '-I'] + args, cwd=H, env=env, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=minutos * 60)
        escribir(f'[{cuenta}] {" ".join(args)} -> código {r.returncode} {(r.stdout + r.stderr).strip()[-300:]}')
    except subprocess.TimeoutExpired:
        escribir(f'[{cuenta}] {" ".join(args)} -> cortado a los {minutos} min')


def sincronizar(msg):
    correr(['sincronizar.py', msg], 'es', 15)


if __name__ == '__main__':
    modo = sys.argv[1] if len(sys.argv) > 1 else ''
    try:  # que Windows no se suspenda mientras dura el turno
        ctypes.windll.kernel32.SetThreadExecutionState(0x80000001)
    except Exception:
        pass
    if modo == 'produccion':
        sincronizar('Notebook: antes de producir')
        correr(['producir.py', 'produccion'], 'es', 240)
        sincronizar('Notebook: producción es')
        correr(['producir.py', 'produccion'], 'en', 180)
        sincronizar('Notebook: producción en')
    elif modo == 'comentarios':
        correr(['producir.py', 'comentarios'], 'es', 40)
        correr(['producir.py', 'comentarios'], 'en', 40)
        sincronizar('Notebook: comentarios')
    elif modo == 'radar':  # temas del momento para las dos cuentas: si hay uno, se produce en el acto
        correr(['producir.py', 'radar'], 'es', 100)
        correr(['producir.py', 'radar'], 'en', 100)
        sincronizar('Notebook: radar')
    elif modo == 'vigilar':  # la oficina: vigilancia, estado de cada empleado y el técnico que arregla solo
        correr(['estado.py', 'vigilar'], 'es', 10)
        correr(['estado.py', 'vigilar'], 'en', 10)
        correr(['oficina.py'], 'es', 5)
        os.environ['TLX_LOCAL'] = 'si'
        correr(['arreglar.py', 'revisar'], 'es', 100)
        sincronizar('Notebook: oficina')
    elif modo == 'respaldo-publicar':
        # red de seguridad con la nube activa: trae el estado y publica SOLO si el turno sigue sin cubrir
        # (publicador.py mira publicados.json: si la nube ya publicó, no hace nada)
        sincronizar('Notebook: respaldo antes de publicar')
        correr(['publicador.py'], 'es', 25)
        correr(['publicador.py'], 'en', 25)
        sincronizar('Notebook: respaldo publicación')
    elif modo == 'respaldo-produccion':
        # si la cola de una cuenta está por vaciarse (la nube no produjo), la notebook produce
        sincronizar('Notebook: respaldo antes de producir')
        sys.path.insert(0, H)
        for c in ('es', 'en'):
            r = subprocess.run([PY, '-I', '-c', 'import sys; sys.path.insert(0, r"%s"); import cola; print(sum(v["estado"] == "listo" for v in cola.cargar()))' % H],
                               cwd=H, env=dict(os.environ, TLX_CUENTA=c), capture_output=True, text=True)
            n = int(r.stdout.strip() or 99)
            if n <= 1:
                escribir(f'[{c}] respaldo: quedan {n} listos (la nube no llegó), la notebook produce')
                correr(['producir.py', 'produccion'], c, 200)
                sincronizar(f'Notebook: respaldo producción {c}')
            else:
                escribir(f'[{c}] respaldo: {n} listos, no hace falta')
    elif modo == 'publicar':
        correr(['publicador.py'], 'es', 25)
        correr(['publicador.py'], 'en', 25)
        sincronizar('Notebook: publicación')
    else:
        sys.exit(__doc__)

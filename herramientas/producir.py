"""Turnos con Claude de @teloexplico.ar (en la nube; también corre en la notebook).

Uso: python -I producir.py produccion | radar | comentarios | hay-trabajo <modo>

- produccion: si hay menos de META videos listos, Claude produce hasta 2 con el skill producir-video.
  Si sobran, en el turno de la mañana corre solo el radar de actualidad.
- radar: el skill radar-actualidad (produce en el momento si encuentra un tema del día).
- comentarios: si hay comentarios nuevos, Claude los responde (skill responder-comentarios).
- hay-trabajo <modo>: imprime "si" o "no" sin gastar nada (la nube lo usa para no instalar el motor al divino botón).

Si Claude no responde (límite de la suscripción o cualquier error) y quedan PLAN_B o menos videos listos,
produce el plan B sin Claude (Gemini + Wikipedia + plantilla). Se frena con el archivo PAUSA.
Logs: videos/noche_<fecha>.log (producción), videos/radar_corridas.log, videos/comentarios.log.
"""
import datetime, json, os, re, subprocess, sys

H = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(H)
V = os.path.join(RAIZ, 'videos')
PY = sys.executable
META = 10    # colchón: 5 días de publicaciones (2 por día)
PLAN_B = 3   # con esto o menos listos y sin Claude, produce el plan B
LIMITE = re.compile(r'(?i)(usage limit|limit reached|hit your (session |weekly |daily )?limit|session limit|weekly limit|rate limit|out of (extra )?usage|resets? (at|in|\d))')
AHORA = datetime.datetime.now()

PEDIDO = f"""Producción automática. Usá el skill producir-video y seguilo al pie de la letra (incluida la dirección de arte de marca/DIRECCION_ARTE.md).
Producí 1 video completo. Si al terminar quedan menos de {META} videos listos en la cola y la cuota de Gemini no se agotó, producí otro (máximo 2 en total).
Recordá el criterio de veracidad del skill: nada inventado, lo probable con matiz, salud/seguridad/plata solo verificado; el chequeo lo hace un subagente aparte.
Al final escribí un resumen de 3 líneas: qué slugs quedaron listos, apartados o incompletos y por qué."""
RADAR = ('Usá el skill radar-actualidad. Si encontrás un tema del momento que cumpla todos los criterios, producilo completo '
         'con el skill producir-video (prioridad actualidad). Si no, anotá los candidatos descartados y terminá. '
         'Al final, una línea con lo que decidiste.')
COMENTARIOS = ('Usá el skill responder-comentarios y procesá todos los comentarios pendientes. '
               'Al final, una línea con cuántos respondiste, salteaste y alertaste.')


def escribir(log, msg):
    with open(os.path.join(V, log), 'a', encoding='utf-8') as f:
        f.write(f'{datetime.datetime.now():%Y-%m-%d %H:%M} {msg}\n')


def listos():
    return sum(1 for v in json.load(open(os.path.join(V, 'cola.json'), encoding='utf-8')) if v['estado'] == 'listo')


def manana():
    return 5 <= AHORA.hour < 12


def comentarios_nuevos():
    r = subprocess.run([PY, '-I', 'comentarios.py', 'contar'], cwd=H, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return int(r.stdout.strip()) if r.stdout.strip().isdigit() else -1


def claude(pedido, log, minutos):
    try:
        r = subprocess.run(['claude', '-p', pedido, '--permission-mode', 'dontAsk'], cwd=RAIZ, capture_output=True,
                           text=True, encoding='utf-8', errors='replace', timeout=minutos * 60)
        salida, codigo = r.stdout + r.stderr, r.returncode
    except subprocess.TimeoutExpired as e:
        salida, codigo = f'{e.stdout or ""}\nCORTADO: pasó el tiempo máximo de {minutos} min', 124
    except FileNotFoundError:
        salida, codigo = 'no está instalado el comando claude', 127
    with open(os.path.join(V, log), 'a', encoding='utf-8') as f:
        f.write(salida.strip()[-6000:] + '\n')
    if LIMITE.search(salida):
        escribir(log, 'LIMITE CLAUDE: la suscripción no tiene cuota ahora. Se reintenta en el próximo turno.')
    return codigo == 0 and not LIMITE.search(salida)


def plan_b(log):
    quedan = listos()
    if quedan > PLAN_B:
        return
    escribir(log, f'Quedan {quedan} listos y Claude no respondió: arranca el PLAN B (sin Claude).')
    r = subprocess.run([PY, '-I', 'plan_b.py'], cwd=H, capture_output=True, text=True, encoding='utf-8', errors='replace')
    with open(os.path.join(V, log), 'a', encoding='utf-8') as f:
        f.write((r.stdout + r.stderr).strip()[-3000:] + '\n')
    escribir(log, f'Termina el plan B (código {r.returncode}).')


def aviso_noche():
    subprocess.run([PY, '-I', 'estado.py', 'noche'], cwd=H, capture_output=True)


def produccion():
    log = f'noche_{AHORA:%Y-%m-%d}.log'
    if os.path.exists(os.path.join(RAIZ, 'PAUSA')):
        escribir(log, 'PAUSA activa: no se produce nada.')
        return
    n = listos()
    if n >= META:
        if not manana():
            escribir(log, f'Hay {n} videos listos (meta {META}): no hace falta producir ahora.')
            return
        # sobran videos comunes, pero el tema del momento no espera: solo se corre el radar
        escribir(log, f'Hay {n} videos listos: no hace falta producir hoy. Corre solo el radar de actualidad.')
        ok = claude(RADAR, log, 90)
        escribir(log, f'Termina el radar ({"ok" if ok else "con problemas"}).')
        return aviso_noche()
    escribir(log, f'Arranca la producción ({n} listos en la cola, meta {META}).')
    ok = claude(PEDIDO, log, 110)
    if not ok:
        plan_b(log)
    escribir(log, f'Termina la producción ({"ok" if ok else "Claude no terminó bien"}).')
    aviso_noche()


def radar():
    log = 'radar_corridas.log'
    if os.path.exists(os.path.join(RAIZ, 'PAUSA')):
        return escribir(log, 'PAUSA activa: no se corre el radar.')
    escribir(log, 'Arranca el radar.')
    ok = claude(RADAR, log, 90)
    escribir(log, f'Termina el radar ({"ok" if ok else "con problemas"}).')


def comentarios():
    log = 'comentarios.log'
    if os.path.exists(os.path.join(RAIZ, 'PAUSA')):
        return escribir(log, 'PAUSA activa: no se responden comentarios.')
    n = comentarios_nuevos()
    if n <= 0:
        return escribir(log, 'Sin comentarios nuevos.' if n == 0 else 'No se pudieron leer los comentarios.')
    escribir(log, f'Hay {n} comentarios nuevos: arranca la respuesta.')
    ok = claude(COMENTARIOS, log, 30)
    escribir(log, f'Termina la respuesta de comentarios ({"ok" if ok else "con problemas"}).')


def hay_trabajo(modo):
    if os.path.exists(os.path.join(RAIZ, 'PAUSA')):
        return False
    if modo == 'produccion':
        return listos() < META or manana()
    if modo == 'comentarios':
        return comentarios_nuevos() != 0
    return True


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    modo = sys.argv[1] if len(sys.argv) > 1 else ''
    if modo == 'hay-trabajo':
        print('si' if hay_trabajo(sys.argv[2]) else 'no')
    elif modo in ('produccion', 'radar', 'comentarios'):
        globals()[modo]()
    else:
        sys.exit(__doc__)

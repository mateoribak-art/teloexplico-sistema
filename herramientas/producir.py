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

# en modo dontAsk solo corren los comandos de .claude/settings.json: un "| tail" o "; echo" de más hace que se niegue todo el comando
TERMINAL = """REGLAS DE TERMINAL (corrida automática, nadie aprueba permisos):
- Corré cada comando SOLO, tal cual: `./herramientas/tlx voz <slug>`, `./herramientas/tlx render <slug>`, etc.
  Nada de `2>&1`, `| tail`, `| head`, `; echo`, `&&` ni `cd`: cualquier agregado hace que se niegue el comando entero.
- Permitidos: ./herramientas/tlx (todos sus subcomandos), ls, cat, grep, mkdir, date, echo. Para leer archivos usá Read, Glob y Grep.
- Podés crear y editar archivos en videos/** y motor/src/** con Write y Edit (incluidos los logs de videos/)."""

PEDIDO = f"""{TERMINAL}

Producción automática. Usá el skill producir-video y seguilo al pie de la letra (incluida la dirección de arte de marca/DIRECCION_ARTE.md).
Producí 1 video completo. Si al terminar quedan menos de {META} videos listos en la cola y la cuota de Gemini no se agotó, producí otro (máximo 2 en total).
Recordá el criterio de veracidad del skill: nada inventado, lo probable con matiz, salud/seguridad/plata solo verificado; el chequeo lo hace un subagente aparte.
Al final escribí un resumen de 3 líneas: qué slugs quedaron listos, apartados o incompletos y por qué."""
RADAR = (TERMINAL + '\n\nUsá el skill radar-actualidad. Si encontrás un tema del momento que cumpla todos los criterios, producilo completo '
         'con el skill producir-video (prioridad actualidad). Si no, anotá los candidatos descartados y terminá. '
         'Al final, una línea con lo que decidiste.')
COMENTARIOS = (TERMINAL + '\n\nUsá el skill responder-comentarios y procesá todos los comentarios pendientes. '
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


def resumir(crudo):
    """De la salida stream-json de Claude: el texto final, los permisos negados y los errores (para el log)."""
    final, negados, otros = '', [], []
    for linea in crudo.splitlines():
        try:
            d = json.loads(linea)
        except ValueError:
            otros.append(linea)
            continue
        if d.get('type') == 'result':
            final = d.get('result') or d.get('subtype', '')
            # cuánto gastó el turno (26/10: para ver qué tarea consume más cuota y ajustar)
            u = d.get('usage') or {}
            otros.append(f"Uso: {d.get('num_turns', '?')} pasos · {u.get('input_tokens', 0) + u.get('cache_creation_input_tokens', 0):,} tokens nuevos · "
                         f"{u.get('cache_read_input_tokens', 0):,} de caché · {u.get('output_tokens', 0):,} escritos"
                         + (f" · equivale a US$ {d['total_cost_usd']:.2f} de API" if d.get('total_cost_usd') is not None else ''))
            negados = [f"{x.get('tool_name')}: {json.dumps(x.get('tool_input'), ensure_ascii=False)[:150]}" for x in d.get('permission_denials') or []]
    uso = [x for x in otros if x.startswith('Uso: ')]
    texto = final.strip() or '\n'.join(x for x in otros if not x.startswith('Uso: ')).strip()
    if uso:
        texto += '\n' + uso[-1]
    if negados:
        texto += '\nPermisos negados (' + str(len(negados)) + '):\n  ' + '\n  '.join(negados[:15])
    return texto


# Modelo por tarea (26/10, pedido de Mateo: que gaste la menor cuota posible). Sin --model, claude usa Opus,
# el que más cuota consume. Sonnet para lo que necesita criterio (producir, radar); Haiku para lo simple.
MODELO_PRODUCIR = 'sonnet'
MODELO_RADAR = 'sonnet'
MODELO_COMENTARIOS = 'haiku'


def claude(pedido, log, minutos, modelo=MODELO_PRODUCIR):
    try:
        r = subprocess.run(['claude', '-p', pedido, '--model', modelo, '--permission-mode', 'dontAsk', '--output-format', 'stream-json', '--verbose'],
                           cwd=RAIZ, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=minutos * 60)
        salida, codigo = resumir(r.stdout) + r.stderr, r.returncode
    except subprocess.TimeoutExpired as e:
        salida, codigo = f'{e.stdout or ""}\nCORTADO: pasó el tiempo máximo de {minutos} min', 124
    except FileNotFoundError:
        salida, codigo = 'no está instalado el comando claude', 127
    with open(os.path.join(V, log), 'a', encoding='utf-8') as f:
        f.write(salida.strip()[-6000:] + '\n')
    if LIMITE.search(salida):
        escribir(log, 'LIMITE CLAUDE: la suscripción no tiene cuota ahora. Se reintenta en el próximo turno.')
    return codigo == 0 and not LIMITE.search(salida) and 'Permisos negados' not in salida


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


def renderizar_pendientes(log):
    """Videos en estado `render` (escenas 3D listas): render + control sin Claude. En la nube el 3D va por software
    (~20 min por video): Claude no espera ese render, que además pasa el límite de 10 min de sus comandos."""
    cola = json.load(open(os.path.join(V, 'cola.json'), encoding='utf-8'))
    for v in (cola if isinstance(cola, list) else cola['videos']):
        if v['estado'] != 'render':
            continue
        slug = v['slug']
        tlx = ['bash', os.path.join(RAIZ, 'herramientas', 'tlx')]
        escribir(log, f'Render de {slug} (sin Claude).')
        try:
            r = subprocess.run(tlx + ['render', slug], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=50 * 60)
            ok, salida = r.returncode == 0, r.stdout + r.stderr
        except subprocess.TimeoutExpired:
            ok, salida = False, 'el render pasó los 50 min'
        if ok:
            c = subprocess.run(tlx + ['control', slug], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8', errors='replace')
            ok, salida = c.stdout.strip().endswith('OK'), c.stdout
        estado, motivo = ('listo', 'render sin Claude') if ok else ('apartado', 'render/control: ' + salida.strip()[-300:])
        subprocess.run(tlx + ['cola', 'estado', slug, estado, motivo], cwd=RAIZ)
        escribir(log, f'{slug}: {estado} ({motivo[:200]})')


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
        ok = claude(RADAR, log, 90, MODELO_RADAR)
        escribir(log, f'Termina el radar ({"ok" if ok else "con problemas"}).')
        return aviso_noche()
    escribir(log, f'Arranca la producción ({n} listos en la cola, meta {META}).')
    renderizar_pendientes(log)  # quedó alguno de un turno anterior
    ok = claude(PEDIDO, log, 110)
    renderizar_pendientes(log)
    if not ok:
        plan_b(log)
    escribir(log, f'Termina la producción ({"ok" if ok else "Claude no terminó bien"}).')
    aviso_noche()


def radar():
    log = 'radar_corridas.log'
    if os.path.exists(os.path.join(RAIZ, 'PAUSA')):
        return escribir(log, 'PAUSA activa: no se corre el radar.')
    escribir(log, 'Arranca el radar.')
    ok = claude(RADAR, log, 90, MODELO_RADAR)
    escribir(log, f'Termina el radar ({"ok" if ok else "con problemas"}).')


def comentarios():
    log = 'comentarios.log'
    if os.path.exists(os.path.join(RAIZ, 'PAUSA')):
        return escribir(log, 'PAUSA activa: no se responden comentarios.')
    n = comentarios_nuevos()
    if n <= 0:
        return escribir(log, 'Sin comentarios nuevos.' if n == 0 else 'No se pudieron leer los comentarios.')
    escribir(log, f'Hay {n} comentarios nuevos: arranca la respuesta.')
    ok = claude(COMENTARIOS, log, 30, MODELO_COMENTARIOS)
    escribir(log, f'Termina la respuesta de comentarios ({"ok" if ok else "con problemas"}).')


def diagnostico():
    """Pedido mínimo con el detalle de cada herramienta que intenta Claude y cada permiso negado (videos/diagnostico.jsonl)."""
    r = subprocess.run(['claude', '-p', '--model', 'haiku', 'Corré exactamente `./herramientas/tlx cola` y copiá la salida. Nada más.',
                        '--permission-mode', 'dontAsk', '--output-format', 'stream-json', '--verbose'],
                       cwd=RAIZ, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=600)
    open(os.path.join(V, 'diagnostico.jsonl'), 'w', encoding='utf-8').write(r.stdout + '\n' + r.stderr)
    print(r.stdout[-3000:], r.stderr[-2000:])


def prueba_plan_b():
    """Plan B de prueba: produce sin Claude pero deja el video apartado para revisarlo (no se publica)."""
    log = f'noche_{AHORA:%Y-%m-%d}.log'
    escribir(log, 'Arranca la PRUEBA del plan B (queda apartado, no se publica).')
    r = subprocess.run([PY, '-I', 'plan_b.py', '--revisar'], cwd=H, capture_output=True, text=True, encoding='utf-8', errors='replace')
    with open(os.path.join(V, log), 'a', encoding='utf-8') as f:
        f.write((r.stdout + r.stderr).strip()[-3000:] + '\n')
    escribir(log, f'Termina la prueba del plan B (código {r.returncode}).')


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
    elif modo == 'plan_b':
        prueba_plan_b()
    elif modo in ('produccion', 'radar', 'comentarios', 'diagnostico'):
        globals()[modo]()
    else:
        sys.exit(__doc__)

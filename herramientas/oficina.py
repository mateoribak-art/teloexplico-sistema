"""La oficina: cada parte del sistema es un empleado con su estado (trabajando, al día, aviso, falla).

Lee los registros de las dos cuentas (logs, cola, publicados, chequeos, métricas, comentarios) y escribe
estado/oficina.json, que muestra oficina/index.html (en la web lo lee con el token de Mateo desde GitHub).
Lo corre sincronizar.py antes de cada commit: después de cada turno de la nube la oficina queda al día.
No usa internet ni claves: solo archivos del repo.

Uso: python -I oficina.py           escribe estado/oficina.json
     python -I oficina.py --html    además arma OFICINA.html (la oficina con los datos adentro, para abrir sin token)
"""
import datetime, glob, importlib, json, os, re, sys

H = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(H)
sys.path.insert(0, H)
import cuenta  # noqa: E402

AHORA = datetime.datetime.now()
SALIDA = os.path.join(RAIZ, 'estado', 'oficina.json')
LINEA = re.compile(r'^(\d{4}-\d{2}-\d{2})(?: (\d{2}:\d{2}))? (.*)$')  # algunos logs anotan solo la fecha

# quién es quién: (id, nombre, puesto, emoji, qué hace, cuándo trabaja). Los de inglés tienen nombres de allá.
PLANTEL = {
    'es': [
        ('jefe', 'Rocío', 'Jefa de producción', '📋', 'Arranca cada turno de producción, decide si hace falta un video y le pasa el trabajo a Claude.', '00:30 · 06:30 · 12:50 · 18:50'),
        ('radar', 'Tano', 'Radar de actualidad', '📡', 'Busca el tema del momento (clima, noticias, tendencias) y lo manda adelante en la cola.', '10:30 y antes de producir'),
        ('chequeo', 'Bea', 'Chequeo de datos', '🔎', 'Revisa cada dato del guion contra las fuentes. Sin su OK, el video no sigue.', 'en cada video'),
        ('voz', 'Nacho', 'Locutor', '🎙️', 'Graba la voz con Gemini (10 pedidos gratis por día, compartidos con la oficina de Nueva York).', 'en cada video'),
        ('animador', 'Juli', 'Animación y render', '🎬', 'Arma el video en Remotion (2D o 3D) y lo renderiza.', 'en cada video'),
        ('control', 'Ramiro', 'Control de calidad', '✅', 'Controla duración, voz contra guion, portada y caption antes de dejar el video listo.', 'en cada video y antes de publicar'),
        ('publicador', 'Sofi', 'Publica en Instagram y Facebook', '📤', 'Sube el próximo video listo a Instagram y Facebook.', '12:30 y 19:30'),
        ('redes', 'Facu', 'TikTok, YouTube y Telegram', '📲', 'Sube a YouTube Shorts, deja el borrador en TikTok y te manda el paquete por Telegram.', 'después de cada publicación'),
        ('carruseles', 'Lucho', 'Carruseles', '🖼️', 'Arma carruseles con datos ya chequeados y publica uno por día.', '16:00'),
        ('comentarios', 'Caro', 'Comentarios', '💬', 'Lee los comentarios nuevos, responde los que puede y te avisa los delicados.', '14:30 y 22:00'),
        ('analista', 'Pato', 'Métricas', '📊', 'Junta vistas, enviados y seguidores; arma el ranking que usa la producción.', 'resumen de las 21:00'),
        ('vigilante', 'Don Héctor', 'Vigilancia', '🛡️', 'Recorre todo cada 2 horas y te avisa al celular si algo se trabó.', 'cada 2 h de 8 a 24'),
        ('planb', 'Gemi', 'Plan B (sin Claude)', '🛟', 'Si Claude se queda sin cuota y quedan pocos videos, produce con Gemini + Wikipedia.', 'solo si hace falta'),
    ],
    'en': [
        ('jefe', 'Mia', 'Jefa de producción', '📋', 'Arranca cada turno de producción en inglés (adaptados de español y temas de EE. UU.).', 'después de cada turno de español'),
        ('radar', 'Jake', 'Radar de actualidad (EE. UU.)', '📡', 'Busca el tema del momento en EE. UU. y lo manda adelante en la cola.', '10:30 y antes de producir'),
        ('chequeo', 'Grace', 'Chequeo de datos', '🔎', 'Revisa cada dato del guion contra las fuentes. Sin su OK, el video no sigue.', 'en cada video'),
        ('voz', 'Leo', 'Locutor', '🎙️', 'Graba la voz con Gemini (en-us-podcaster-5; la cuota gratis es compartida con Buenos Aires).', 'en cada video'),
        ('animador', 'Ava', 'Animación y render', '🎬', 'Arma el video en Remotion (2D o 3D) y lo renderiza.', 'en cada video'),
        ('control', 'Ben', 'Control de calidad', '✅', 'Controla duración, voz contra guion, portada y caption antes de dejar el video listo.', 'en cada video y antes de publicar'),
        ('publicador', 'Chloe', 'Publica en Instagram y Facebook', '📤', 'Sube el próximo video listo a Instagram y Facebook.', '11:30 y 19:00 (Nueva York)'),
        ('redes', 'Tyler', 'TikTok y Telegram', '📲', 'Deja el borrador en TikTok y te manda el paquete por Telegram (YouTube todavía no: falta el canal).', 'después de cada publicación'),
        ('comentarios', 'Zoe', 'Comentarios', '💬', 'Lee los comentarios nuevos, responde los que puede y te avisa los delicados.', '14:30 y 22:00 (Argentina)'),
        ('analista', 'Max', 'Métricas', '📊', 'Junta vistas, enviados y seguidores.', 'resumen de las 21:00'),
        ('vigilante', 'Walt', 'Vigilancia', '🛡️', 'Recorre todo cada 2 horas y te avisa al celular si algo se trabó.', 'cada 2 h de 8 a 24'),
    ],
}

# qué botón ofrece cada empleado (lo dispara la página con el token: workflow_dispatch del flujo indicado)
RELANZAR = {
    'jefe': ('claude.yml', {'modo': 'produccion'}),
    'chequeo': ('claude.yml', {'modo': 'produccion'}),
    'voz': ('claude.yml', {'modo': 'produccion'}),
    'animador': ('claude.yml', {'modo': 'produccion'}),
    'control': ('claude.yml', {'modo': 'produccion'}),
    'radar': ('claude.yml', {'modo': 'radar'}),
    'comentarios': ('claude.yml', {'modo': 'comentarios'}),
    'publicador': ('publicar.yml', {'modo': 'publicar'}),
    'redes': ('publicar.yml', {'modo': 'publicar'}),
    'carruseles': ('carrusel.yml', {}),
    'analista': ('tareas.yml', {'modo': 'resumen'}),
    'vigilante': ('tareas.yml', {'modo': 'vigilar'}),
    'planb': ('claude.yml', {'modo': 'plan_b'}),
}


def leer(ruta, defecto=None):
    try:
        if ruta.endswith('.json'):
            return json.load(open(ruta, encoding='utf-8'))
        return open(ruta, encoding='utf-8', errors='replace').read()
    except Exception:
        return defecto


def lineas_con_hora(texto):
    """[(datetime, mensaje)] de las líneas que empiezan con "AAAA-MM-DD HH:MM"."""
    salida = []
    for l in (texto or '').splitlines():
        m = LINEA.match(l)
        if m:
            salida.append((datetime.datetime.strptime(f'{m[1]} {m[2] or "00:00"}', '%Y-%m-%d %H:%M'), m[3]))
    return salida


def hace(t):
    if not t:
        return 'nunca'
    m = int((AHORA - t).total_seconds() // 60)
    if m < 1:
        return 'recién'
    if m < 60:
        return f'hace {m} min'
    if m < 48 * 60:
        return f'hace {m // 60} h'
    return f'hace {m // 1440} días'


def ultimo_bloque(texto, inicio):
    """El texto desde la última línea que contiene `inicio` (la última corrida de un log que junta varias)."""
    i = (texto or '').rfind(inicio)
    if i < 0:
        return ''
    return texto[texto.rfind('\n', 0, i) + 1:]


def recortar(texto, n=14):
    ls = [l.rstrip()[:240] for l in (texto or '').strip().splitlines() if l.strip()]
    return ls[-n:]


def recientes(cola, horas=48):
    desde = (AHORA - datetime.timedelta(hours=horas)).isoformat(timespec='minutes')
    for v in cola:
        h = v.get('historial') or []
        if h and h[-1]['cuando'] >= desde:
            yield v, h[-1]


def empleado(e, estado, resumen, cuando=None, detalle=None, tareas=None, arreglo=None):
    e.update(estado=estado, resumen=resumen, cuando=cuando.isoformat(timespec='minutes') if cuando else None,
             hace=hace(cuando), detalle=detalle or [], tareas=tareas or [], arreglo=arreglo)
    return e


def oficina(clave):
    os.environ['TLX_CUENTA'] = clave
    importlib.reload(cuenta)
    import estado
    importlib.reload(estado)
    CU = cuenta.ACTUAL
    V = CU['videos']
    cola = leer(os.path.join(V, 'cola.json'), [])
    cola = cola if isinstance(cola, list) else cola.get('videos', [])
    listos = [v for v in cola if v['estado'] == 'listo']
    publicados = leer(os.path.join(V, 'publicados.json'), [])
    pub_log = leer(os.path.join(V, 'publicador.log'), '')
    noches = sorted(glob.glob(os.path.join(V, 'noche_*.log')))
    noche = leer(noches[-1], '') if noches else ''
    pausa = os.path.exists(os.path.join(RAIZ, 'PAUSA'))
    gente = {p[0]: {'id': p[0], 'nombre': p[1], 'puesto': p[2], 'emoji': p[3], 'hace_que': p[4], 'horario': p[5],
                    'relanzar': {'flujo': RELANZAR[p[0]][0], 'inputs': {**RELANZAR[p[0]][1], **({'cuenta': clave} if RELANZAR[p[0]][0] in ('claude.yml', 'publicar.yml') else {})}}}
             for p in PLANTEL[clave]}
    apartados = list(recientes([v for v in cola if v['estado'] == 'apartado']))

    # --- Jefa de producción: la última corrida del log de producción
    b = ultimo_bloque(noche, 'Arranca la producción') or ultimo_bloque(noche, 'no hace falta producir') or noche
    hs = lineas_con_hora(b)
    t = hs[-1][0] if hs else None
    uso = next((l for l in b.splitlines() if l.startswith('Uso:')), '')
    if pausa:
        r = empleado(gente['jefe'], 'pausa', 'Pausa activa: no se produce nada.', t)
    elif not hs:
        r = empleado(gente['jefe'], 'descanso', 'Todavía no corrió ningún turno.', None)
    elif 'LIMITE CLAUDE' in b:
        r = empleado(gente['jefe'], 'aviso', 'Claude se quedó sin cuota: se reintenta sola en el próximo turno.', t, recortar(b),
                     arreglo='No hace falta tocar nada. Si quedan pocos videos listos, Gemi (plan B) produce sin Claude.')
    elif 'Termina la producción (ok)' in b or 'no hace falta producir' in b:
        r = empleado(gente['jefe'], 'ok', 'Último turno sin problemas.' if 'Termina' in b else hs[-1][1], t, recortar(b))
    elif 'Claude no terminó bien' in b and 'Permisos negados' in b:
        r = empleado(gente['jefe'], 'aviso', 'El video salió, pero Claude intentó un comando que no tiene permitido (por eso figura "no terminó bien"' + (' y se saltea el carrusel).' if clave == 'es' else ').'),
                     t, recortar(b), arreglo='Ajustar las reglas de terminal del pedido (producir.py) o sumar ese comando a los permisos del proyecto.')
    elif 'Termina la producción' in b:
        r = empleado(gente['jefe'], 'falla', 'El último turno terminó mal.', t, recortar(b), arreglo='Mirá el detalle y relanzá el turno.')
    elif t and AHORA - t > datetime.timedelta(hours=3):
        r = empleado(gente['jefe'], 'falla', 'El último turno arrancó y nunca terminó (¿se cortó la máquina?).', t, recortar(b), arreglo='Relanzá el turno.')
    else:
        r = empleado(gente['jefe'], 'trabajando', 'Turno en curso.', t, recortar(b))
    if uso:
        r['detalle'].insert(0, uso)
    r['tareas'] = [f"{v['slug']} — {v.get('tema', '')}" for v in cola if v['estado'] in ('idea', 'guion', 'render', 'produciendo')][:6]

    # --- Radar: corridas propias + las que van dentro de la producción
    rc = leer(os.path.join(V, 'radar_corridas.log'), '')
    todas = sorted(lineas_con_hora(rc) + [x for x in lineas_con_hora(noche) if 'radar' in x[1].lower()])
    ultima = next((x for x in reversed(todas) if x[1].startswith('Termina el radar')), None)
    decision = lineas_con_hora(leer(os.path.join(V, 'radar.log'), ''))[-3:]
    det = [f'{d:%d/%m %H:%M} {m}' for d, m in decision]
    fuego = [f"🔥 {v['slug']} — {v.get('tema', '')}" for v in cola if v.get('actualidad') or v.get('prioridad') == 'actualidad']
    if pausa:
        empleado(gente['radar'], 'pausa', 'Pausa activa.', ultima and ultima[0], det)
    elif ultima is None and not decision:
        empleado(gente['radar'], 'descanso', 'Todavía no corrió.', None, det)
    elif ultima and 'con problemas' in ultima[1]:
        empleado(gente['radar'], 'aviso', 'La última búsqueda terminó con problemas (casi siempre: Claude sin cuota).', ultima[0], det + recortar(ultimo_bloque(rc, 'Arranca el radar'), 6),
                 arreglo='Se reintenta solo. Si es urgente, relanzalo.')
    else:
        empleado(gente['radar'], 'ok', decision[-1][1].lstrip('| ')[:160] if decision else 'Última búsqueda sin problemas.', max(x[0] for x in [ultima] + decision[-1:] if x), det, fuego)

    # --- Chequeo, voz, animación y control: los videos de las últimas 48 h
    def motivo_de(*palabras):
        return [(v, h) for v, h in apartados if any(p in (h.get('motivo') or '').lower() for p in palabras)]

    chequeos = []
    for v in cola[-8:]:
        c = leer(os.path.join(V, v['slug'], 'chequeo.json'))
        if c:
            chequeos.append(f"{v['slug']}: {c.get('veredicto', '?')} — {(c.get('motivo') or '')[:140]}")
    malos = motivo_de('chequeo', 'dato', 'fuente')
    ult_listo = max((h[-1]['cuando'] for v in cola for h in [v.get('historial') or []] if h and v['estado'] in ('listo', 'publicado')), default=None)
    t_listo = datetime.datetime.fromisoformat(ult_listo) if ult_listo else None
    if malos:
        empleado(gente['chequeo'], 'aviso', f"Frenó {len(malos)} video(s): {malos[-1][0]['slug']}.", t_listo, chequeos,
                 [f"{v['slug']}: {h.get('motivo', '')[:160]}" for v, h in malos], 'Está bien que frene lo dudoso. Si querés rescatarlo, dejale un pedido a la jefa con otro ángulo.')
    else:
        empleado(gente['chequeo'], 'ok', f'Aprobó {sum("aprobado" in c for c in chequeos)} de los últimos {len(chequeos)} guiones.' if chequeos else 'Sin chequeos todavía.', t_listo, chequeos)

    cuota = 'CUOTA AGOTADA' in b or 'código 3' in b
    malos = motivo_de('voz')
    if cuota:
        empleado(gente['voz'], 'aviso', 'Se agotó la cuota gratis de Gemini de hoy (10 pedidos, compartidos entre las dos oficinas).', t, recortar(b, 6),
                 arreglo='Se libera sola a la medianoche del Pacífico (04:00/05:00 de Argentina). No hace falta tocar nada.')
    elif malos:
        empleado(gente['voz'], 'aviso', f"La voz no coincidió con el guion en {malos[-1][0]['slug']}.", t_listo, [],
                 [f"{v['slug']}: {h.get('motivo', '')[:160]}" for v, h in malos], 'Suele ser un falso rechazo del control (91–92 %). Si lo querés publicar igual, pasalo a listo.')
    else:
        empleado(gente['voz'], 'ok', f"Voz {CU['voz']} sin problemas.", t_listo)

    en_render = [v for v in cola if v['estado'] == 'render']
    malos = motivo_de('render')
    if malos:
        empleado(gente['animador'], 'falla', f"Falló el render de {malos[-1][0]['slug']}.", t_listo, [],
                 [f"{v['slug']}: {h.get('motivo', '')[:200]}" for v, h in malos], 'Relanzá la producción: los videos en estado render se vuelven a renderizar solos.')
    elif en_render:
        empleado(gente['animador'], 'trabajando', f"{len(en_render)} video(s) esperando render 3D (~20 min cada uno, sin Claude).", t_listo, [],
                 [v['slug'] for v in en_render])
    else:
        empleado(gente['animador'], 'ok', f"Último video terminado: {ult_listo.replace('T', ' ') if ult_listo else '—'}.", t_listo)

    malos = [(v, h) for v, h in apartados if (v, h) not in motivo_de('chequeo', 'dato', 'fuente', 'voz', 'render')]
    if malos:
        empleado(gente['control'], 'aviso', f"Apartó {len(malos)} video(s) en las últimas 48 h.", t_listo, [],
                 [f"{v['slug']}: {h.get('motivo', '')[:200]}" for v, h in malos], 'Revisalo: si está bien, pasalo a listo; si no, queda apartado.')
    else:
        empleado(gente['control'], 'ok', f'{len(listos)} videos listos, ninguno apartado en las últimas 48 h.', t_listo)

    # --- Publicador (IG + FB): turnos cubiertos y últimas líneas del log
    pl = lineas_con_hora(pub_log)
    t_pub = pl[-1][0] if pl else None
    det = [f'{d:%d/%m %H:%M} {m}' for d, m in pl[-10:]]
    d = {'cola': cola, 'publicados': publicados, 'ultima_noche': noche, 'noche_archivo': os.path.basename(noches[-1]) if noches else None,
         'pub_log': pub_log.splitlines()[-15:], 'cuenta': {}}
    try:
        problemas = estado.problemas(d)
    except Exception as ex:
        problemas = [('aviso', f'No se pudo revisar el estado: {str(ex)[:120]}')]
    perdido = [m for _, m in problemas if 'No salió la publicación' in m]
    proximo = [f"Próximo: {listos[0]['slug']} — {listos[0].get('tema', '')}"] if listos else []
    if pausa:
        empleado(gente['publicador'], 'pausa', 'Pausa activa.', t_pub, det, proximo)
    elif perdido:
        empleado(gente['publicador'], 'falla', perdido[0], t_pub, det, proximo, 'Relanzá la publicación: cubre el turno que falta (no publica doble).')
    elif any('ERROR' in m for _, m in pl[-3:]):
        empleado(gente['publicador'], 'falla', 'Error en los últimos intentos.', t_pub, det, proximo, 'Relanzá la publicación; si se repite, mirá la corrida en GitHub.')
    elif not listos:
        empleado(gente['publicador'], 'aviso', 'No hay videos listos: el próximo turno no va a publicar nada.', t_pub, det, [],
                 'Relanzá la producción para que haga uno.')
    else:
        ult = publicados[-1] if publicados else None
        empleado(gente['publicador'], 'ok', f"Último: {ult['slug']}." if ult else 'Todavía no publicó.', t_pub, det, proximo)

    # --- TikTok / YouTube / Telegram
    red = [(d, m) for d, m in pl if any(k in m.lower() for k in ('tiktok', 'youtube', 'telegram', 'paquete'))]
    det = [f'{d:%d/%m %H:%M} {m}' for d, m in red[-8:]]
    fallas = [m for _, m in red[-4:] if any(k in m.lower() for k in ('error', 'falló', 'no se pudo'))]
    if fallas:
        empleado(gente['redes'], 'aviso', fallas[-1][:160], red[-1][0], det, arreglo='Si TikTok no recibió el borrador, el paquete igual llegó por Telegram: subilo a mano.')
    else:
        empleado(gente['redes'], 'ok' if red else 'descanso', 'Borrador en TikTok y paquete por Telegram al día.' if red else 'Todavía sin envíos.', red[-1][0] if red else None, det,
                 ['TikTok: la publicación la confirmás vos desde la bandeja (la API no permite publicar directo sin auditoría).'])

    # --- Carruseles (solo español)
    if 'carruseles' in gente:
        car = leer(os.path.join(V, 'carruseles', 'carruseles.json'), [])
        car_listos = [c['clave'] for c in car if c['estado'] == 'listo']
        hist = sorted((h['cuando'], c['clave'], h['estado'], h.get('motivo', '')) for c in car for h in c.get('historial', []))
        t_car = datetime.datetime.fromisoformat(hist[-1][0]) if hist else None
        det = [f'{w[:16].replace("T", " ")} {k}: {e} {m[:80]}' for w, k, e, m in hist[-6:]]
        if any(c['estado'] == 'apartado' for c in car if c.get('historial') and c['historial'][-1]['cuando'] >= (AHORA - datetime.timedelta(days=2)).isoformat()):
            empleado(gente['carruseles'], 'aviso', 'Apartó un carrusel reciente.', t_car, det, car_listos)
        elif not car_listos:
            empleado(gente['carruseles'], 'aviso', 'No quedan carruseles listos: el de las 16:00 no sale.', t_car, det, [],
                     'La jefa arma uno en el próximo turno de producción si Claude termina bien.')
        else:
            empleado(gente['carruseles'], 'ok', f'{len(car_listos)} listo(s) para las 16:00.', t_car, det, car_listos)

    # --- Comentarios
    cl = leer(os.path.join(V, 'comentarios.log'), '')
    ch = lineas_con_hora(cl)
    com = leer(os.path.join(V, 'comentarios.json'), {}) or {}
    cuenta_estados = {}
    for x in com.values():
        cuenta_estados[x.get('estado', '?')] = cuenta_estados.get(x.get('estado', '?'), 0) + 1
    tareas = [f'{n} {e}' for e, n in sorted(cuenta_estados.items())]
    alertas = [f"⚠️ {x.get('texto', '')[:120]}" for x in com.values() if x.get('estado') == 'alerta'][-3:]
    ult = next((x for x in reversed(ch) if x[1].startswith(('Termina', 'Sin comentarios', '(sesión'))), None)
    det = [f'{d:%d/%m %H:%M} {m}' for d, m in ch[-8:]]
    if not ch:
        empleado(gente['comentarios'], 'descanso', 'Todavía no hubo comentarios para responder.', None)
    elif ult and 'con problemas' in ult[1]:
        empleado(gente['comentarios'], 'aviso', 'La última ronda terminó con problemas (casi siempre: Claude sin cuota).', ult[0], det, tareas + alertas,
                 'Se reintenta en la próxima ronda. Si hay muchos pendientes, relanzala.')
    else:
        empleado(gente['comentarios'], 'ok', (ult or ch[-1])[1][:160], (ult or ch[-1])[0], det, tareas + alertas)

    # --- Métricas
    met = leer(os.path.join(V, 'metricas.json'), {}) or {}
    dias = sorted(met.get('cuenta', {}))
    reels = sorted(met.get('reels', {}).values(), key=lambda r: -(r.get('ultimo') or {}).get('views', 0))
    top = [f"{r['slug']}: {r['ultimo'].get('views', 0):,} vistas · {r['ultimo'].get('shares', 0)} enviados · {r['ultimo'].get('likes', 0)} ♥".replace(',', '.')
           for r in reels[:5] if r.get('ultimo')]
    t_met = max((datetime.datetime.fromisoformat(r['ultimo']['cuando']) for r in reels if r.get('ultimo', {}).get('cuando')), default=None)
    seg = [f"{x[8:]}/{x[5:7]}: {met['cuenta'][x].get('seguidores', '?')} seguidores" for x in dias[-4:]]
    if not dias:
        empleado(gente['analista'], 'descanso', 'Todavía sin métricas (arrancan con el primer resumen).', None)
    elif t_met and AHORA - t_met > datetime.timedelta(hours=30):
        empleado(gente['analista'], 'aviso', 'Las métricas tienen más de un día.', t_met, seg, top, '¿Vencido el token de Meta? Relanzá el resumen y mirá si falla.')
    else:
        empleado(gente['analista'], 'ok', seg[-1] if seg else 'Al día.', t_met, seg, top)

    # --- Vigilancia: el mismo chequeo que avisa al celular
    graves = [m for tp, m in problemas if tp == 'grave']
    empleado(gente['vigilante'], 'falla' if graves else 'aviso' if problemas else 'ok',
             graves[0] if graves else problemas[0][1] if problemas else 'Todo en orden ✓', AHORA,
             [f"{'❗' if tp == 'grave' else '⚠️'} {m}" for tp, m in problemas])

    # --- Plan B (solo español)
    if 'planb' in gente:
        pb = [x for x in lineas_con_hora(noche) if 'plan b' in x[1].lower()]
        if pb:
            empleado(gente['planb'], 'ok' if 'código 0' in pb[-1][1] or 'Arranca' not in pb[-1][1] else 'aviso', pb[-1][1][:160], pb[-1][0],
                     [f'{d:%d/%m %H:%M} {m}' for d, m in pb[-5:]])
        else:
            empleado(gente['planb'], 'descanso', 'En reserva: entra solo si Claude no responde y quedan 3 videos listos o menos.', None)

    seguidores = met['cuenta'][dias[-1]].get('seguidores') if dias else None
    pendientes = [m for tp, m in problemas if tp == 'grave'] + [f"Revisar apartado: {v['slug']} — {(h.get('motivo') or '')[:120]}" for v, h in apartados]
    return {
        'clave': clave, 'usuario': CU['usuario'], 'ciudad': 'Buenos Aires' if clave == 'es' else 'Nueva York', 'zona': CU['zona'],
        'seguidores': seguidores, 'listos': len(listos), 'dias': len(listos) / 2, 'proximo': listos[0]['slug'] if listos else None,
        'publicados': len(publicados), 'pausa': pausa, 'pendientes': pendientes,
        'ultimas': [{'slug': p['slug'], 'link': p.get('permalink'), 'cuando': p['publicado'][:16]} for p in publicados[-5:]][::-1],
        # la línea de producción (tarjeta "En producción"): lo que está en camino, lo apartado y lo último publicado
        'linea': [{'slug': v['slug'], 'tema': v.get('tema', ''), 'estado': v['estado'], 'cuando': (v.get('historial') or [{}])[-1].get('cuando'),
                   'motivo': ((v.get('historial') or [{}])[-1].get('motivo') or '')[:160]}
                  for v in [v for v in cola if v['estado'] not in ('listo', 'publicado', 'apartado')] + listos[:4]
                  + [v for v, _ in apartados] + [v for v in cola if v['estado'] == 'publicado'][-2:]],
        'empleados': list(gente.values()),
    }


def main():
    datos = {'actualizado': AHORA.isoformat(timespec='minutes'), 'oficinas': [oficina(c) for c in cuenta.CUENTAS
                                                                             if os.path.exists(os.path.join(cuenta.CUENTAS[c]['videos'], 'cola.json'))]}
    # arreglos del técnico (arreglar.py): el empleado con uno aplicado figura arreglado hasta que su próximo turno lo confirme
    arreglos = leer(os.path.join(RAIZ, 'estado', 'arreglos.json'), []) or []
    datos['arreglos'] = arreglos[-15:]
    for o in datos['oficinas']:
        for e in o['empleados']:
            hecho = [x for x in arreglos if x.get('empleado') == f"{o['clave']}/{e['id']}" and x.get('estado') == 'aplicado']
            if hecho and e['estado'] in ('aviso', 'falla') and (not e['cuando'] or hecho[-1]['actualizado'] > e['cuando']):
                e.update(estado='ok', resumen=f"Arreglado desde la oficina: {hecho[-1].get('titulo', '')}. Se confirma en su próximo turno.", arreglo=None)
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    json.dump(datos, open(SALIDA, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    if '--html' in sys.argv:
        pagina = open(os.path.join(RAIZ, 'oficina', 'index.html'), encoding='utf-8').read()
        incrustado = '<script>window.DATOS = ' + json.dumps(datos, ensure_ascii=False).replace('</', '<\\/') + ';</script>\n'
        open(os.path.join(RAIZ, 'OFICINA.html'), 'w', encoding='utf-8').write(pagina.replace('<!--DATOS-->', incrustado, 1))
    for o in datos['oficinas']:
        print(o['ciudad'] + ':', ', '.join(f"{e['nombre']} {e['estado']}" for e in o['empleados']))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()

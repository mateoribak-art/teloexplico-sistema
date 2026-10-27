"""Estado del sistema: detecta problemas, arma el panel y avisa al celular.

Uso:
  python -I estado.py resumen    resumen diario (21:00): qué salió, seguidores, qué viene, problemas
  python -I estado.py noche      después de la producción nocturna: cuántos videos quedaron listos
  python -I estado.py vigilar    solo avisa si hay problemas nuevos (no repite el mismo aviso)
  python -I estado.py panel      solo regenera PANEL.html
"""
import datetime, glob, hashlib, html, json, os, sys, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from avisar import avisar  # noqa: E402

V = os.path.join(RAIZ, 'videos')
AHORA = datetime.datetime.now()


def leer_json(ruta, defecto):
    try:
        return json.load(open(ruta, encoding='utf-8'))
    except Exception:
        return defecto


def cuenta():
    """Seguidores y posts de @teloexplico.ar (None si la API no responde: eso también es un problema)."""
    c = leer_json(os.path.join(RAIZ, 'secretos', 'meta.json'), {})
    try:
        url = f"https://graph.facebook.com/{c['graph_version']}/{c['ig_id']}?" + urllib.parse.urlencode(
            {'fields': 'followers_count,media_count', 'access_token': c['page_token']})
        return json.load(urllib.request.urlopen(url, timeout=30))
    except Exception as e:
        return {'error': str(e)[:150]}


def datos():
    cola = leer_json(os.path.join(V, 'cola.json'), [])
    publicados = leer_json(os.path.join(V, 'publicados.json'), [])
    noches = sorted(glob.glob(os.path.join(V, 'noche_*.log')))
    ultima_noche = open(noches[-1], encoding='utf-8', errors='replace').read() if noches else ''
    pub_log = open(os.path.join(V, 'publicador.log'), encoding='utf-8').read().splitlines() if os.path.exists(os.path.join(V, 'publicador.log')) else []
    return {'cola': cola, 'publicados': publicados, 'ultima_noche': ultima_noche,
            'noche_archivo': os.path.basename(noches[-1]) if noches else None, 'pub_log': pub_log[-15:], 'cuenta': cuenta()}


def cuando(v):
    return datetime.datetime.fromisoformat(v['publicado'].replace('+0000', '+00:00')).astimezone().replace(tzinfo=None)


def problemas(d):
    p = []
    listos = [v for v in d['cola'] if v['estado'] == 'listo']
    if os.path.exists(os.path.join(RAIZ, 'PAUSA')):
        p.append(('aviso', 'El sistema está en PAUSA (archivo PAUSA en la carpeta del proyecto).'))
    if 'error' in d['cuenta']:
        p.append(('grave', f"No responde la API de Instagram (¿token vencido?): {d['cuenta']['error']}"))
    if d['publicados']:
        # último turno (12:30 o 19:30) que pasó hace más de 1 h: tiene que haber una publicación desde entonces
        turnos = [datetime.datetime.combine(AHORA.date() - datetime.timedelta(days=dd), datetime.time(h, 30))
                  for dd in (0, 1) for h in (19, 12)]
        vencido = max((t for t in turnos if t <= AHORA - datetime.timedelta(hours=1)), default=None)
        primera = cuando(d['publicados'][0])
        if vencido and vencido > primera and cuando(d['publicados'][-1]) < vencido - datetime.timedelta(minutes=10):
            p.append(('grave', f'No salió la publicación del turno de las {vencido:%H:%M} ({vencido:%d/%m}).'))
    if len(listos) == 0:
        p.append(('grave', 'No hay ningún video listo en la cola: el próximo turno no va a publicar.'))
    elif len(listos) <= 2:
        p.append(('aviso', f'Quedan {len(listos)} videos listos: alcanza para {len(listos) / 2:g} día(s).'))
    for v in d['cola']:
        h = v.get('historial', [])
        if v['estado'] == 'apartado' and h and h[-1]['cuando'] >= (AHORA - datetime.timedelta(days=1)).isoformat(timespec='minutes'):
            p.append(('aviso', f"Video apartado: {v['slug']} — {h[-1].get('motivo', '')[:120]}"))
    # solo la última corrida del día: el log junta todos los turnos y un límite de la mañana avisaba aunque después anduviera (26/10)
    n = d['ultima_noche'].rsplit('Arranca la producción', 1)[-1]
    if 'LIMITE CLAUDE' in n:
        p.append(('aviso', f'Claude se quedó sin cuota en la última producción (se reintenta sola en el próximo turno: 00:30, 06:30, 12:50 o 18:50). '
                           f'Colchón: {len(listos)} videos listos ≈ {len(listos) / 2:g} días.'))
    if 'CUOTA AGOTADA' in n:
        p.append(('aviso', 'La producción de anoche se cortó: se agotó la cuota diaria de voz de Gemini.'))
    if d['noche_archivo'] and 'Termina la producci' not in n and 'no hace falta producir' not in n and 'PAUSA' not in n:
        p.append(('grave', f"La producción nocturna ({d['noche_archivo']}) no terminó bien."))
    if any('ERROR' in l for l in d['pub_log'][-3:]):
        p.append(('grave', 'El publicador tuvo un error en sus últimos intentos (ver publicador.log).'))
    if os.path.exists(os.path.join(V, 'avisos_pendientes.json')):
        p.append(('aviso', 'Hubo avisos que no se pudieron mandar (¿sin internet?).'))
    return p


def panel(d, p):
    e = html.escape
    filas = ''.join(f"<tr><td>{e(v['slug'])}</td><td class='{e(v['estado'])}'>{e(v['estado'])}</td><td>{e(v.get('tema', ''))}</td></tr>" for v in d['cola'])
    pubs = ''.join(f"<li>{e(x['publicado'][:16].replace('T', ' '))} · <a href='{e(x.get('permalink') or '')}'>{e(x['slug'])}</a></li>" for x in reversed(d['publicados'][-10:]))
    probs = ''.join(f"<li class='{t}'>{e(m)}</li>" for t, m in p) or "<li class='ok'>Todo en orden ✓</li>"
    c = d['cuenta']
    seg = f"{c.get('followers_count', '?')} seguidores · {c.get('media_count', '?')} posts" if 'error' not in c else 'API sin respuesta'
    pagina = f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="300"><title>Te lo explico · panel</title>
<style>body{{font-family:system-ui,sans-serif;background:#FFF6E5;color:#111;margin:0;padding:24px;max-width:900px}}
h1{{margin:0 0 4px}}.sub{{color:#555;margin-bottom:20px}}section{{background:#fff;border:3px solid #111;border-radius:14px;box-shadow:5px 5px 0 #111;padding:14px 18px;margin-bottom:18px}}
table{{width:100%;border-collapse:collapse}}td{{padding:6px 4px;border-bottom:1px solid #eee}}.listo{{color:#1a8f4c;font-weight:700}}.publicado{{color:#2E4BFF}}
.apartado,.grave{{color:#d33;font-weight:700}}.aviso{{color:#b07800}}.ok{{color:#1a8f4c;font-weight:700}}pre{{white-space:pre-wrap;font-size:12px}}</style></head><body>
<h1>Te lo explico 💬</h1><div class="sub">@teloexplico.ar · {e(seg)} · actualizado {AHORA:%d/%m %H:%M}</div>
<section><h2>Estado</h2><ul>{probs}</ul></section>
<section><h2>Últimas publicaciones</h2><ul>{pubs or '<li>Todavía nada</li>'}</ul></section>
<section><h2>Cola</h2><table>{filas}</table></section>
<section><h2>Publicador (últimas líneas)</h2><pre>{e(chr(10).join(d['pub_log']))}</pre></section>
<section><h2>Producción nocturna ({e(d['noche_archivo'] or '-')})</h2><pre>{e(d['ultima_noche'][-2500:])}</pre></section>
</body></html>"""
    open(os.path.join(RAIZ, 'PANEL.html'), 'w', encoding='utf-8').write(pagina)


def main(modo):
    d = datos()
    p = problemas(d)
    panel(d, p)
    graves = [m for t, m in p if t == 'grave']
    if modo == 'resumen':
        hoy = [x for x in d['publicados'] if cuando(x).date() == AHORA.date()]
        listos = [v['slug'] for v in d['cola'] if v['estado'] == 'listo']
        c = d['cuenta']
        seguidores = f"Seguidores: {c.get('followers_count', '?')}" if 'error' not in c else 'Instagram: sin respuesta de la API'
        mejor = ''
        try:
            import metricas
            base = metricas.actualizar()
            dias = sorted(base['cuenta'])
            if len(dias) >= 2:
                dif = base['cuenta'][dias[-1]]['seguidores'] - base['cuenta'][dias[-2]]['seguidores']
                seguidores += f' ({dif:+d} desde {dias[-2][8:]}/{dias[-2][5:7]})'
            top = metricas.ranking(base)
            if top:
                pt, slug, m, ver = top[0]
                mejor = f"Mejor reel: {slug} · {m.get('views', 0)} vistas, {m.get('shares', 0)} compartidos, {m.get('saved', 0)} guardados"
            car = sorted((r for r in base.get('carruseles', {}).values() if r.get('ultimo')), key=lambda r: r['publicado'])
            if car:
                m = car[-1]['ultimo']
                mejor += (f"\nÚltimo carrusel: {car[-1]['clave']} · alcance {m.get('reach', 0)}, {m.get('shares', 0)} compartidos, "
                          f"{m.get('saved', 0)} guardados, {m.get('follows', 0)} seguidores nuevos")
        except Exception as e:
            mejor = f'(no se pudieron leer las métricas: {str(e)[:80]})'
        lineas = [f"Hoy: {len(hoy)} publicado(s)." + (' ' + ', '.join(x['slug'] for x in hoy) if hoy else ''),
                  seguidores] + ([mejor] if mejor else []) + [
                  f"En cola listos: {len(listos)} ≈ {len(listos) / 2:g} días" + (f" (próximo: {listos[0]})" if listos else ''),
                  ('Problemas: ' + ' | '.join(m for _, m in p)) if p else 'Todo en orden ✓']
        avisar('📊 Resumen del día' if not graves else '⚠️ Resumen del día: hay problemas', '\n'.join(lineas),
               'alta' if graves else 'default')
    elif modo == 'noche':
        listos = [v['slug'] for v in d['cola'] if v['estado'] == 'listo']
        if 'PAUSA activa' in d['ultima_noche'].splitlines()[-1:][0] if d['ultima_noche'].strip() else False:
            avisar('⏸️ Producción en pausa', 'Está el archivo PAUSA: esta noche no se produjo nada.', 'baja')
        elif any('Termina la producci' in l or 'no hace falta producir' in l or 'Termina el radar' in l for l in d['ultima_noche'].splitlines()):
            avisar('🌙 Producción nocturna', f"Videos listos en la cola: {len(listos)} (≈ {len(listos) / 2:g} días)." +(('\n' + ' | '.join(m for _, m in p)) if p else ''),
                   'alta' if graves else 'baja')
        else:
            avisar('❌ Falló la producción nocturna', 'Revisá el log de la noche en videos/.', 'alta')
    elif modo == 'vigilar' and p:
        firma = hashlib.md5(json.dumps(p).encode()).hexdigest()
        ultima = os.path.join(V, 'ultimo_aviso.txt')
        if not os.path.exists(ultima) or open(ultima).read() != firma:
            avisar('⚠️ Te lo explico necesita atención', '\n'.join(m for _, m in p), 'alta' if graves else 'default')
            open(ultima, 'w').write(firma)
    print('problemas:', p or 'ninguno')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main(sys.argv[1] if len(sys.argv) > 1 else 'panel')

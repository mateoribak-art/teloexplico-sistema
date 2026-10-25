"""Publicador automático: lo corre Windows a las 12:30 y a las 19:30.

Toma el próximo video 'listo' de la cola, lo vuelve a controlar y lo publica en @teloexplico.ar.
- Si existe el archivo PAUSA en la raíz del proyecto, no hace nada.
- Si el control técnico falla, aparta el video y prueba con el siguiente.
- Si no hay nada listo, lo deja anotado en el log y termina.
Log: videos/publicador.log
"""
import datetime, json, os, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cola  # noqa: E402
from control import controlar  # noqa: E402
from avisar import avisar  # noqa: E402

PY = sys.executable
LOG = os.path.join(RAIZ, 'videos', 'publicador.log')


def log(msg):
    linea = f"{datetime.datetime.now():%Y-%m-%d %H:%M} {msg}"
    print(linea)
    with open(LOG, 'a', encoding='utf-8') as f:
        f.write(linea + '\n')


def fin():
    """Actualiza el panel después de cada turno (si falla, no frena la publicación)."""
    try:
        import estado
        estado.main('panel')
    except Exception as e:
        log(f'no se pudo actualizar el panel: {e}')


def main():
    if os.path.exists(os.path.join(RAIZ, 'PAUSA')):
        log('PAUSA activa: no se publica nada.')
        return fin()
    for _ in range(5):
        v = cola.proximo_listo()
        if v is None:
            log('No hay videos listos en la cola.')
            avisar('❌ No se publicó nada', 'No hay videos listos en la cola para este turno.', 'alta')
            return fin()
        slug = v['slug']
        problemas = controlar(slug)
        if problemas:
            cola.cambiar_estado(slug, 'apartado', '; '.join(problemas))
            log(f'{slug} apartado: {"; ".join(problemas)}')
            avisar('⚠️ Video apartado', f'{slug} no pasó el control y no se publica: {"; ".join(problemas)[:300]}')
            continue
        meta = json.load(open(os.path.join(RAIZ, 'videos', slug, 'meta.json'), encoding='utf-8')) \
            if os.path.exists(os.path.join(RAIZ, 'videos', slug, 'meta.json')) else {}
        args = [PY, '-I', 'publicar.py', slug, '--portada-ms', str(meta.get('portada_ms', 0))]
        r = subprocess.run(args, cwd=os.path.dirname(os.path.abspath(__file__)), capture_output=True, text=True, encoding='utf-8', errors='replace')
        if r.returncode == 0 and 'PUBLICADO:' in r.stdout:
            link = r.stdout.split('PUBLICADO:')[-1].strip()
            cola.cambiar_estado(slug, 'publicado', link)
            log(f'{slug} publicado: {link}')
            avisar('✅ Publicado', f"{v.get('tema', slug)}", 'baja', link=link)
            # el mismo reel en la página de Facebook (si falla, Instagram ya salió: solo avisa)
            rf = subprocess.run([PY, '-I', 'publicar_fb.py', slug], cwd=os.path.dirname(os.path.abspath(__file__)),
                                capture_output=True, text=True, encoding='utf-8', errors='replace')
            if rf.returncode == 0 and 'PUBLICADO:' in rf.stdout:
                log(f"{slug} publicado en Facebook: {rf.stdout.split('PUBLICADO:')[-1].strip()}")
            else:
                log(f'{slug} falló Facebook: {(rf.stdout + rf.stderr).strip()[-300:]}')
                avisar('⚠️ Facebook', f'{slug} salió en Instagram pero no en Facebook: {(rf.stdout + rf.stderr).strip()[-200:]}')
            # TikTok: va a la bandeja como borrador (la API sin auditoría no deja publicar directo)
            rt = subprocess.run([PY, '-I', 'publicar_tiktok.py', slug], cwd=os.path.dirname(os.path.abspath(__file__)),
                                capture_output=True, text=True, encoding='utf-8', errors='replace')
            en_bandeja = rt.returncode == 0 and 'EN BANDEJA:' in rt.stdout
            log(f'{slug} ' + ('en la bandeja de TikTok' if en_bandeja else f'falló TikTok: {(rt.stdout + rt.stderr).strip()[-300:]}'))
            # paquete para TikTok y YouTube Shorts (subida desde el celular hasta que aprueben sus APIs)
            try:
                import multired
                multired.main(slug, tiktok_en_bandeja=en_bandeja)
                log(f'{slug} paquete para TikTok/YouTube enviado')
            except Exception as e:
                log(f'{slug} no se pudo armar el paquete para TikTok/YouTube: {e}')
                avisar('⚠️ Paquete TikTok/YouTube', f'No se pudo armar el de {slug}: {str(e)[:200]}')
        else:
            # un error de la API no aparta el video: puede ser algo pasajero; se reintenta en el próximo turno
            log(f'{slug} ERROR al publicar: {(r.stdout + r.stderr).strip()[-400:]}')
            detalle = (r.stdout + r.stderr).strip()[-250:]
            avisar('❌ Error al publicar', f'{slug}: {detalle}\nSe reintenta en el próximo turno.', 'alta')
        return fin()


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    # que Windows no vuelva a suspenderse en medio de la subida (al despertar solo, se duerme a los 2 minutos)
    import ctypes
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000001)
    # el 24/10 a las 19:30 se cayó sin dejar rastro: cualquier error inesperado queda en el log y avisa
    try:
        main()
    except Exception as e:
        import traceback
        log(f'ERROR inesperado del publicador: {traceback.format_exc()[-600:]}')
        try:
            avisar('❌ El publicador se cayó', f'{type(e).__name__}: {str(e)[:250]}\nSe reintenta en el próximo turno.', 'alta')
        except Exception:
            pass  # sin internet no hay aviso posible: queda el log y la vigilancia lo detecta por turno perdido
        sys.exit(1)

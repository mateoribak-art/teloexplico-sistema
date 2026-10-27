r"""Cuenta con la que trabajan las herramientas (27/10/2026): @teloexplico.ar (es) o @letmeexplain.us (en).

- Lo que trabaja sobre un video (voz, control, series, publicar…) saca la cuenta del slug: los de inglés empiezan con "en-"
  ("en-001-phone-rice"). Así el slug no choca con los de español en el Release, en motor/public ni en los ids del motor
  (que también reconoce la cuenta por el prefijo: motor/src/kit/cuenta.ts).
- Lo que trabaja sobre la cuenta entera (publicador, cola, estado) la saca de la variable TLX_CUENTA (es por defecto).

Uso: from cuenta import CUENTA, para; para(slug)['videos'] …
"""
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CUENTAS = {
    'es': {
        'clave': 'es',
        'usuario': 'teloexplico.ar',
        'prefijo': '',
        'videos': os.path.join(RAIZ, 'videos'),
        'series': os.path.join(RAIZ, 'motor', 'src', 'kit', 'series.json'),
        'meta': os.path.join(RAIZ, 'secretos', 'meta.json'),
        'panel': os.path.join(RAIZ, 'PANEL.html'),
        'voz': 'es-419-assistant-7',
        'idioma': 'es',
        # se suma al estilo de cada frase: sin esto Gemini tiende a apurarse (7 sílabas/s; posta va a 5,6)
        'ritmo': ' Sin apurarte: ritmo pausado y natural, respirando entre frases.',
        'zona': 'America/Argentina/Buenos_Aires',
        'turnos': ((12, 30), (19, 30)),
        'segui': 'Seguí a @teloexplico.ar',
        'renglon_serie': '📚 {serie} #{n} · Seguí a @teloexplico.ar para no perderte el #{sig}.',
        'renglon_suelto': 'Seguí a @teloexplico.ar: un dato por día.',
        'tiktok_token': os.path.join(RAIZ, 'secretos', 'tiktok_token.json'),
        'tiktok_cifrado': os.path.join(RAIZ, 'estado', 'tiktok_token.enc'),
        'tiktok_extra': '#aprendeentiktok',
        'youtube': True,
    },
    'en': {
        'clave': 'en',
        'usuario': 'letmeexplain.us',
        'prefijo': 'en-',
        'videos': os.path.join(RAIZ, 'videos', 'en'),
        'series': os.path.join(RAIZ, 'motor', 'src', 'kit', 'series_en.json'),
        'meta': os.path.join(RAIZ, 'secretos', 'meta_en.json'),
        'panel': os.path.join(RAIZ, 'PANEL_en.html'),
        'voz': 'en-us-podcaster-5',
        'idioma': 'en',
        'ritmo': ' Natural pace, like talking to a friend, short pauses between sentences.',
        'zona': 'America/New_York',
        'turnos': ((11, 30), (19, 0)),
        'segui': 'Follow @letmeexplain.us',
        'renglon_serie': '📚 {serie} #{n} · Follow @letmeexplain.us so you don’t miss #{sig}.',
        'renglon_suelto': 'Follow @letmeexplain.us: one myth a day.',
        # misma app de TikTok, otro usuario autorizado: su token va aparte (si no existe, no se manda nada a TikTok)
        'tiktok_token': os.path.join(RAIZ, 'secretos', 'tiktok_token_en.json'),
        'tiktok_cifrado': os.path.join(RAIZ, 'estado', 'tiktok_token_en.enc'),
        'tiktok_extra': '#learnontiktok',
        # YouTube @letmeexplainus todavía no existe: nada de YouTube para esta cuenta
        'youtube': False,
    },
}


def de_slug(slug):
    return 'en' if slug.startswith('en-') else 'es'


def para(slug=None):
    """Datos de la cuenta del slug (o de TLX_CUENTA si no hay slug)."""
    return CUENTAS[de_slug(slug) if slug else CUENTA]


def carpeta(slug):
    return os.path.join(para(slug)['videos'], slug)


CUENTA = os.environ.get('TLX_CUENTA', 'es')
if CUENTA not in CUENTAS:
    raise SystemExit(f'TLX_CUENTA="{CUENTA}" no existe (es | en)')
ACTUAL = CUENTAS[CUENTA]

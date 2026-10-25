"""Efectos de sonido de la marca, sintetizados (sin derechos de terceros).

Uso: python -I sfx.py   ->  motor/public/sfx/{pop,whoosh,ding,sello,tic,burbuja,error}.wav
"""
import os, wave
import numpy as np

SR = 48000
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, 'motor', 'public', 'sfx')
rng = np.random.default_rng(7)


def t(seg):
    return np.arange(int(SR * seg)) / SR


def env(n, ataque=0.003, caida=8.0):
    x = np.arange(n) / SR
    return np.minimum(1, x / ataque) * np.exp(-caida * x)


def guardar(nombre, y, pico=0.8):
    y = y / (np.abs(y).max() + 1e-9) * pico
    y = np.concatenate([y, np.zeros(int(SR * 0.02))])
    with wave.open(os.path.join(DESTINO, nombre + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y * 32767).astype(np.int16).tobytes())


def pop():
    # burbuja que sube de tono rápido: aparición de un elemento
    x = t(0.09)
    f = 380 + 900 * (x / x[-1]) ** 0.6
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.002, 45)


def whoosh():
    # ruido filtrado con barrido: cambio de escena
    x = t(0.38)
    ruido = rng.standard_normal(len(x))
    corte = 600 + 5000 * np.sin(np.pi * x / x[-1]) ** 2
    y, prev = np.zeros_like(ruido), 0.0
    for i, (r, c) in enumerate(zip(ruido, corte)):
        a = 1 - np.exp(-2 * np.pi * c / SR)
        prev += a * (r - prev)
        y[i] = prev
    return y * np.abs(np.sin(np.pi * x / x[-1])) ** 1.5


def ding():
    # campanita: dato clave
    x = t(0.9)
    y = sum(a * np.sin(2 * np.pi * f * x) for f, a in [(1318.5, 1), (2637, .35), (3955, .12), (1975.5, .25)])
    return y * env(len(x), 0.002, 5.5)


def sello():
    # golpe grave + chasquido: sello MITO / POSTA que cae
    x = t(0.28)
    f = 160 * np.exp(-18 * x) + 55
    golpe = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.001, 16)
    chasquido = rng.standard_normal(len(x)) * env(len(x), 0.0005, 90) * 0.5
    return golpe + chasquido


def tic():
    # tic de reloj / contador
    x = t(0.05)
    return np.sin(2 * np.pi * 2400 * x) * env(len(x), 0.0005, 120)


def burbuja():
    # dos pops seguidos, más suave: aparición de subtítulo o etiqueta chica
    a, b = pop() * 0.6, pop() * 0.4
    hueco = np.zeros(int(SR * 0.05))
    return np.concatenate([a, hueco, b])


def error():
    # buzzer cómico corto: "es al revés"
    x = t(0.32)
    onda = np.sign(np.sin(2 * np.pi * 140 * x)) * 0.5 + np.sin(2 * np.pi * 147 * x) * 0.5
    return onda * env(len(x), 0.004, 7)


def boing():
    # resorte de dibujito animado: personaje que salta o rebota
    x = t(0.45)
    f = 180 + 220 * np.exp(-6 * x) * (1 + 0.5 * np.sin(2 * np.pi * 18 * x))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.002, 6)


def scratch():
    # disco que frena: "¿cómo?", el giro del video
    x = t(0.35)
    vel = np.interp(x, [0, 0.12, 0.2, 0.35], [1.0, -0.8, 0.9, 0.0])
    fase = np.cumsum(vel) / SR
    ruido = rng.standard_normal(len(x))
    tono = np.sin(2 * np.pi * 900 * fase * 3) * 0.6
    return (ruido * 0.5 + tono) * np.abs(vel) * env(len(x), 0.002, 4)


def fiesta():
    # cornetita de cumpleaños: algo festeja (las bacterias)
    x = t(0.55)
    f = 520 + 120 * np.minimum(1, x / 0.08)
    onda = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.4 + np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * 0.3
    vibrato = 1 + 0.15 * np.sin(2 * np.pi * 7 * x)
    return onda * vibrato * env(len(x), 0.02, 3.5)


def latigo():
    # whip corto y agudo: transición rápida entre escenas
    x = t(0.18)
    ruido = rng.standard_normal(len(x))
    y = np.diff(ruido, prepend=0) * np.abs(np.sin(np.pi * x / x[-1])) ** 3
    return y


if __name__ == '__main__':
    os.makedirs(DESTINO, exist_ok=True)
    for nombre, fn in [('pop', pop), ('whoosh', whoosh), ('ding', ding), ('sello', sello),
                       ('tic', tic), ('burbuja', burbuja), ('error', error),
                       ('boing', boing), ('scratch', scratch), ('fiesta', fiesta), ('latigo', latigo)]:
        guardar(nombre, fn())
    print('sfx listos en', DESTINO, sorted(os.listdir(DESTINO)))

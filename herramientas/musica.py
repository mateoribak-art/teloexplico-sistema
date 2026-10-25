"""Cama musical de la marca: loop alegre de 4 compases, sintetizado (sin derechos de terceros).

Uso: python -I musica.py  ->  motor/public/musica/loop.wav
Se usa en loop muy bajo debajo de la voz: da ritmo y energía sin competir con lo que se dice.
"""
import os, wave
import numpy as np

SR = 48000
BPM = 112
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, 'motor', 'public', 'musica')
rng = np.random.default_rng(3)

negra = 60 / BPM
compas = 4 * negra
total = int(SR * compas * 4)
mix = np.zeros(total)


def poner(señal, seg, vol=1.0):
    i = int(seg * SR)
    n = min(len(señal), total - i)
    mix[i:i + n] += señal[:n] * vol


def env(n, ataque, caida):
    x = np.arange(n) / SR
    return np.minimum(1, x / ataque) * np.exp(-caida * x)


def bombo():
    x = np.arange(int(SR * 0.35)) / SR
    f = 50 + 110 * np.exp(-35 * x)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.001, 9)


def palmas():
    n = int(SR * 0.2)
    r = rng.standard_normal(n)
    # tres golpecitos muy juntos, como un clap
    e = sum(env(n, 0.0005, 60) * (np.arange(n) >= int(SR * d)) for d in (0, 0.008, 0.016))
    return np.diff(r, prepend=0) * e * 0.8 + r * env(n, 0.001, 25) * 0.3


def hat():
    n = int(SR * 0.05)
    return np.diff(rng.standard_normal(n), prepend=0) * env(n, 0.0005, 90)


def pluck(freq, dur):
    # cuerda pulsada (Karplus-Strong): suena a ukelele/marimba, simpático
    n = int(SR * dur)
    largo = int(SR / freq)
    buf = rng.uniform(-1, 1, largo)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % largo]
        buf[i % largo] = 0.5 * (buf[i % largo] + buf[(i + 1) % largo]) * 0.996
    return out * env(n, 0.002, 2.5)


def bajo(freq, dur):
    x = np.arange(int(SR * dur)) / SR
    onda = np.sin(2 * np.pi * freq * x) + 0.3 * np.sin(2 * np.pi * 2 * freq * x)
    return onda * env(len(x), 0.005, 3)


nota = lambda m: 440 * 2 ** ((m - 69) / 12)
# progresión I–V–vi–IV en Do: alegre y conocida
acordes = [(60, 64, 67), (55, 59, 62), (57, 60, 64), (53, 57, 60)]
raices = [36, 43, 45, 41]

for c, (acorde, raiz) in enumerate(zip(acordes, raices)):
    base = c * compas
    for b in range(4):
        poner(bombo(), base + b * negra, 0.9 if b in (0, 2) else 0.0)
        if b in (1, 3):
            poner(palmas(), base + b * negra, 0.45)
    for k in range(8):
        poner(hat(), base + k * negra / 2, 0.25 if k % 2 else 0.12)
    # bajo: raíz en 1 y en el "y" del 3
    poner(bajo(nota(raiz), negra * 1.4), base, 0.55)
    poner(bajo(nota(raiz), negra * 0.9), base + 2.5 * negra, 0.45)
    # acorde arpegiado en corcheas con un ritmito sincopado
    patron = [0, 1, 2, 1, 0, 2, 1, 2]
    for k, idx in enumerate(patron):
        if k in (3, 6):
            continue
        poner(pluck(nota(acorde[idx] + 12), negra), base + k * negra / 2, 0.28)

mix = mix / np.abs(mix).max() * 0.9
# micro fundido en los bordes para que el loop no haga click
borde = int(SR * 0.004)
mix[:borde] *= np.linspace(0, 1, borde)
mix[-borde:] *= np.linspace(1, 0, borde)

os.makedirs(DESTINO, exist_ok=True)
with wave.open(os.path.join(DESTINO, 'loop.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(f'loop listo: {total / SR:.2f} s a {BPM} BPM')

"""Números escritos en palabras → cifras ("dos mil trece" → "2013"), para comparar el guion con lo que transcribe whisper."""
import re, unicodedata

UNIDADES = {'cero': 0, 'un': 1, 'uno': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8,
            'nueve': 9, 'diez': 10, 'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciseis': 16,
            'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20, 'veintiun': 21, 'veintiuno': 21, 'veintidos': 22,
            'veintitres': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiseis': 26, 'veintisiete': 27, 'veintiocho': 28,
            'veintinueve': 29, 'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60, 'setenta': 70, 'ochenta': 80,
            'noventa': 90, 'cien': 100, 'ciento': 100, 'doscientos': 200, 'trescientos': 300, 'cuatrocientos': 400,
            'quinientos': 500, 'seiscientos': 600, 'setecientos': 700, 'ochocientos': 800, 'novecientos': 900}
MULT = {'mil': 1000, 'millon': 1_000_000, 'millones': 1_000_000}


def _sin_acentos(w):
    return ''.join(c for c in unicodedata.normalize('NFD', w.lower()) if unicodedata.category(c) != 'Mn')


def a_cifras(texto, minimo=10):
    """Reemplaza cada número escrito en palabras (desde `minimo`) por sus cifras. "por ciento" no cuenta como número."""
    palabras = re.findall(r'\w+|\W+', texto)
    salida, i = [], 0
    while i < len(palabras):
        w = _sin_acentos(palabras[i])
        previo = _sin_acentos(palabras[i - 2]) if i >= 2 else ''
        if (w in UNIDADES or w in MULT) and not (w == 'ciento' and previo == 'por'):
            total, actual, j, fin = 0, 0, i, i
            while j < len(palabras):
                x = _sin_acentos(palabras[j])
                if x in UNIDADES:
                    actual += UNIDADES[x]
                elif x in MULT:
                    total += (actual or 1) * MULT[x]
                    actual = 0
                elif (x == 'y' and actual >= 30 and actual % 10 == 0 and j + 2 < len(palabras)
                      and UNIDADES.get(_sin_acentos(palabras[j + 2]), 99) < 10):
                    pass  # "treinta y ocho": la "y" solo une decenas con unidades
                elif not x.strip():  # espacio entre palabras del número
                    j += 1
                    continue
                else:
                    break
                fin = j
                j += 1
            valor = total + actual
            if valor >= minimo:
                salida.append(str(valor))
                i = fin + 1
                continue
        salida.append(palabras[i])
        i += 1
    return ''.join(salida)

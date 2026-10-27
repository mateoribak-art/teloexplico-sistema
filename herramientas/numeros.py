"""Números escritos en palabras → cifras ("dos mil trece" → "2013", "twenty-four" → "24"), para comparar el guion con lo que transcribe whisper."""
import re, unicodedata

UNIDADES = {'cero': 0, 'un': 1, 'uno': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8,
            'nueve': 9, 'diez': 10, 'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciseis': 16,
            'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20, 'veintiun': 21, 'veintiuno': 21, 'veintidos': 22,
            'veintitres': 23, 'veinticuatro': 24, 'veinticinco': 25, 'veintiseis': 26, 'veintisiete': 27, 'veintiocho': 28,
            'veintinueve': 29, 'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60, 'setenta': 70, 'ochenta': 80,
            'noventa': 90, 'cien': 100, 'ciento': 100, 'doscientos': 200, 'trescientos': 300, 'cuatrocientos': 400,
            'quinientos': 500, 'seiscientos': 600, 'setecientos': 700, 'ochocientos': 800, 'novecientos': 900}
MULT = {'mil': 1000, 'millon': 1_000_000, 'millones': 1_000_000}
# inglés (@letmeexplain.us, 27/10): "hundred" multiplica lo que va antes ("two hundred"), por eso va aparte
UNIDADES_EN = {'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
               'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16,
               'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
               'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90}
MULT_EN = {'thousand': 1000, 'million': 1_000_000, 'millions': 1_000_000}


def _sin_acentos(w):
    return ''.join(c for c in unicodedata.normalize('NFD', w.lower()) if unicodedata.category(c) != 'Mn')


def a_cifras(texto, minimo=10, idioma='es'):
    """Reemplaza cada número escrito en palabras (desde `minimo`) por sus cifras. "por ciento" no cuenta como número."""
    if idioma == 'en':
        return _a_cifras_en(texto, minimo)
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


def _a_cifras_en(texto, minimo):
    """Como a_cifras, en inglés: "twenty-four" → 24, "two hundred and five" → 205, "one thousand" → 1000."""
    palabras = re.findall(r"\w+|\W+", texto)
    salida, i = [], 0
    while i < len(palabras):
        w = palabras[i].lower()
        if w in UNIDADES_EN or w in MULT_EN or (w == 'hundred' and i == 0):
            total, actual, j, fin = 0, 0, i, i
            while j < len(palabras):
                x = palabras[j].lower()
                if x in UNIDADES_EN:
                    actual += UNIDADES_EN[x]
                elif x == 'hundred':
                    actual = (actual or 1) * 100
                elif x in MULT_EN:
                    total += (actual or 1) * MULT_EN[x]
                    actual = 0
                elif x == 'and' and (actual >= 100 or total) and j + 2 < len(palabras) and palabras[j + 2].lower() in UNIDADES_EN:
                    pass  # "two hundred and five"
                elif x.strip() in ('', '-'):  # espacio o guion entre palabras del número ("twenty-four")
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

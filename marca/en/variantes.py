# Variantes de color de la foto de perfil (misma burbuja que marca/perfil.html) para Let me explain
import subprocess, os
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
<rect width="1080" height="1080" fill="{fondo}"/>
<path transform="translate(36 36)" d="M250 230h580a90 90 0 0 1 90 90v330a90 90 0 0 1-90 90H520l-190 150v-150h-80a90 90 0 0 1-90-90V320a90 90 0 0 1 90-90z" fill="#111"/>
<path d="M250 230h580a90 90 0 0 1 90 90v330a90 90 0 0 1-90 90H520l-190 150v-150h-80a90 90 0 0 1-90-90V320a90 90 0 0 1 90-90z" fill="{cuerpo}" stroke="#111" stroke-width="26" stroke-linejoin="round"/>
<circle cx="430" cy="440" r="72" fill="#fff" stroke="#111" stroke-width="20"/>
<circle cx="650" cy="440" r="72" fill="#fff" stroke="#111" stroke-width="20"/>
<circle cx="448" cy="452" r="30" fill="#111"/><circle cx="668" cy="452" r="30" fill="#111"/>
<path d="M590 335 q60 -40 120 -8" fill="none" stroke="#111" stroke-width="20" stroke-linecap="round"/>
<path d="M440 590 q120 70 210 -20" fill="none" stroke="#111" stroke-width="22" stroke-linecap="round"/>
</svg>'''
VARIANTES = {  # nombre: (fondo, burbuja)
    'a_rojo_celeste': ('#7FD3FF', '#FF4D2E'),
    'b_rojo_amarillo': ('#FFE14D', '#FF4D2E'),
    'c_rojo_menta': ('#2BD67B', '#FF4D2E'),
    'd_amarillo_rojo': ('#FF4D2E', '#FFE14D'),
}
celdas = ''
for n, (f, c) in VARIANTES.items():
    s = SVG.format(fondo=f, cuerpo=c)
    open(f'{n}.svg', 'w', encoding='utf-8').write(s)
    celdas += f'<div><img src="{n}.svg" width="300" style="border-radius:50%"><img src="{n}.svg" width="44" style="border-radius:50%;margin-left:12px"><p>{n[0].upper()}</p></div>'
celdas = '<div><img src="../FOTO_PERFIL.png" width="300" style="border-radius:50%"><img src="../FOTO_PERFIL.png" width="44" style="border-radius:50%;margin-left:12px"><p>español</p></div>' + celdas
open('comparacion.html', 'w', encoding='utf-8').write(
    '<html><body style="margin:0;background:#fff;font:bold 28px sans-serif;display:flex;gap:28px;padding:30px;align-items:end">' + celdas + '</body></html>')
aqui = __import__('pathlib').Path('.').resolve().as_posix()
subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1880,440',
                f'--screenshot={aqui}/comparacion.png', f'file:///{aqui}/comparacion.html'], check=True, capture_output=True)

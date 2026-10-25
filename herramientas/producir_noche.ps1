# Producción de @teloexplico.ar (la corre el Programador de tareas a las 00:30 y a las 06:00).
# Objetivo: tener siempre $META videos listos (3 días de colchón) para que una noche sin Claude no corte las publicaciones.
# - Si faltan videos, le pide a Claude que produzca hasta 2 con el skill producir-video.
# - Si sobran, en la corrida de la mañana solo corre el radar de actualidad.
# - Si Claude no tiene cuota (límite de la suscripción), lo anota como LIMITE CLAUDE y la próxima corrida lo reintenta.
# Se frena con el archivo PAUSA en la raíz del proyecto. Log: videos/noche_<fecha>.log
# Al terminar (siempre) manda el aviso de la noche al celular con estado.py noche.
$ErrorActionPreference = "Continue"
# la salida de claude viene en UTF-8: sin esto los acentos del log quedan rotos
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$raiz = "C:\Users\Mateo\teloexplico"
$py = "C:\Users\Mateo\AppData\Local\Programs\Python\Python312\python.exe"
$META = 6
Set-Location $raiz
# que Windows no vuelva a suspenderse mientras dura la tarea (al despertar solo, se duerme a los 2 minutos)
Add-Type -Namespace TeLoExplico -Name Energia -MemberDefinition '[System.Runtime.InteropServices.DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f);'
[TeLoExplico.Energia]::SetThreadExecutionState([uint32]"0x80000001") | Out-Null
$log = Join-Path $raiz ("videos\noche_{0:yyyy-MM-dd}.log" -f (Get-Date))

function Escribir($msg) { "{0:yyyy-MM-dd HH:mm} {1}" -f (Get-Date), $msg | Out-File -FilePath $log -Append -Encoding utf8 }
# el estado vive en el repo privado (la nube publica): se trae antes de producir y se sube al terminar (videos al Release)
function Sincronizar($msg) {
  $s = & $py -I (Join-Path $raiz "herramientas\sincronizar.py") $msg 2>&1 | Out-String
  Escribir "Sincronización: $($s.Trim())"
}
function Avisar { Sincronizar "Notebook: producción"; & $py -I (Join-Path $raiz "herramientas\estado.py") noche | Out-Null }
# la suscripción de Claude tiene límite por ventanas de 5 h y por semana: si se agotó, lo dejamos dicho para reintentar
function RevisarLimite($salida) {
  if ($salida -match "(?i)(usage limit|limit reached|hit your limit|rate limit|out of (extra )?usage|resets? (at|in))") {
    Escribir "LIMITE CLAUDE: la suscripción no tiene cuota ahora. Se reintenta en la próxima corrida."
    # si además la cola se está vaciando, el plan B produce un video sin Claude (Gemini + Wikipedia + plantilla)
    $c = Get-Content (Join-Path $raiz "videos\cola.json") -Raw -Encoding utf8 | ConvertFrom-Json
    $quedan = @($c | Where-Object { $_.estado -eq "listo" }).Count
    if ($quedan -le 2) {
      Escribir "Quedan $quedan listos: arranca el PLAN B (sin Claude)."
      $pb = & $py -I (Join-Path $raiz "herramientas\plan_b.py") 2>&1 | Out-String
      $pb | Out-File -FilePath $log -Append -Encoding utf8
      Escribir "Termina el plan B (código $LASTEXITCODE)."
    }
  }
}

Sincronizar "Notebook: antes de producir"
if (Test-Path (Join-Path $raiz "PAUSA")) { Escribir "PAUSA activa: no se produce nada."; Avisar; exit 0 }

$cola = Get-Content (Join-Path $raiz "videos\cola.json") -Raw -Encoding utf8 | ConvertFrom-Json
$listos = @($cola | Where-Object { $_.estado -eq "listo" }).Count
$manana = (Get-Date).Hour -ge 5
if ($listos -ge $META) {
  if (-not $manana) { Escribir "Hay $listos videos listos (meta $META): no hace falta producir ahora."; exit 0 }
  # sobran videos comunes, pero el tema del momento no espera: solo se corre el radar
  Escribir "Hay $listos videos listos: no hace falta producir hoy. Corre solo el radar de actualidad."
  $salida = & claude -p "Usá el skill radar-actualidad. Si encontrás un tema del momento que cumpla todos los criterios, producilo completo con el skill producir-video (prioridad actualidad). Si no, anotá los candidatos descartados y terminá." --permission-mode dontAsk 2>&1 | Out-String
  $salida | Out-File -FilePath $log -Append -Encoding utf8
  RevisarLimite $salida
  Escribir "Termina el radar (código $LASTEXITCODE)."
  Avisar; exit 0
}

$pedido = @"
Producción automática. Usá el skill producir-video y seguilo al pie de la letra (incluida la dirección de arte de marca/DIRECCION_ARTE.md).
Producí 1 video completo. Si al terminar quedan menos de $META videos listos en la cola y la cuota de Gemini no se agotó, producí otro (máximo 2 en total).
Recordá el criterio de veracidad del skill: nada inventado, lo probable con matiz, salud/seguridad/plata solo verificado; el chequeo lo hace un subagente aparte.
Al final escribí un resumen de 3 líneas: qué slugs quedaron listos, apartados o incompletos y por qué.
"@

Escribir "Arranca la producción ($listos listos en la cola, meta $META)."
$salida = & claude -p $pedido --permission-mode dontAsk 2>&1 | Out-String
$salida | Out-File -FilePath $log -Append -Encoding utf8
RevisarLimite $salida
Escribir "Termina la producción (código $LASTEXITCODE)."
Avisar

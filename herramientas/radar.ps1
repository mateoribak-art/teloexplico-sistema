# Radar de actualidad de media mañana (10:30): si hay un tema del momento, lo produce para que salga a las 19:30.
# Se frena con el archivo PAUSA. Log: videos/radar.log (lo escribe Claude) y videos/radar_corridas.log (este script).
$ErrorActionPreference = "Continue"
# la salida de claude viene en UTF-8: sin esto los acentos del log quedan rotos
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$raiz = "C:\Users\Mateo\teloexplico"
Set-Location $raiz
# que Windows no vuelva a suspenderse mientras dura la tarea (al despertar solo, se duerme a los 2 minutos)
Add-Type -Namespace TeLoExplico -Name Energia -MemberDefinition '[System.Runtime.InteropServices.DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f);'
[TeLoExplico.Energia]::SetThreadExecutionState([uint32]"0x80000001") | Out-Null
$log = Join-Path $raiz "videos\radar_corridas.log"
function Escribir($msg) { "{0:yyyy-MM-dd HH:mm} {1}" -f (Get-Date), $msg | Out-File -FilePath $log -Append -Encoding utf8 }

if (Test-Path (Join-Path $raiz "PAUSA")) { Escribir "PAUSA activa: no se corre el radar."; exit 0 }

Escribir "Arranca el radar."
$pedido = "Usá el skill radar-actualidad. Si encontrás un tema del momento que cumpla todos los criterios, producilo completo con el skill producir-video (prioridad actualidad). Si no, anotá los candidatos descartados y terminá. Al final, una línea con lo que decidiste."
$salida = & claude -p $pedido --permission-mode dontAsk 2>&1 | Out-String
$salida | Out-File -FilePath $log -Append -Encoding utf8
if ($salida -match "(?i)(usage limit|limit reached|hit your limit|rate limit|out of (extra )?usage|resets? (at|in))") { Escribir "LIMITE CLAUDE: la suscripción no tiene cuota ahora." }
Escribir "Termina el radar (código $LASTEXITCODE)."

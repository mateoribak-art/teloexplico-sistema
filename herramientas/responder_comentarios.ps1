# Respuesta automática de comentarios de @teloexplico.ar (14:30 y 22:00, unas horas después de cada publicación).
# Solo llama a Claude si hay comentarios nuevos. Se frena con el archivo PAUSA. Log: videos/comentarios.log
$ErrorActionPreference = "Continue"
# la salida de claude viene en UTF-8: sin esto los acentos del log quedan rotos
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$raiz = "C:\Users\Mateo\teloexplico"
$py = "C:\Users\Mateo\AppData\Local\Programs\Python\Python312\python.exe"
Set-Location $raiz
# que Windows no vuelva a suspenderse mientras dura la tarea (al despertar solo, se duerme a los 2 minutos)
Add-Type -Namespace TeLoExplico -Name Energia -MemberDefinition '[System.Runtime.InteropServices.DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f);'
[TeLoExplico.Energia]::SetThreadExecutionState([uint32]"0x80000001") | Out-Null
$log = Join-Path $raiz "videos\comentarios.log"
function Escribir($msg) { "{0:yyyy-MM-dd HH:mm} {1}" -f (Get-Date), $msg | Out-File -FilePath $log -Append -Encoding utf8 }

if (Test-Path (Join-Path $raiz "PAUSA")) { Escribir "PAUSA activa: no se responden comentarios."; exit 0 }
# el estado vive en el repo privado (la nube publica): traer antes, subir al terminar
& "C:\Users\Mateo\AppData\Local\Programs\Python\Python312\python.exe" -I (Join-Path $raiz "herramientas\sincronizar.py") "Notebook: antes de comentarios" 2>&1 | Out-File -FilePath $log -Append -Encoding utf8

$cuenta = (& $py -I (Join-Path $raiz "herramientas\comentarios.py") contar | Out-String).Trim()
$n = 0
if (-not [int]::TryParse($cuenta, [ref]$n)) { Escribir "No se pudieron leer los comentarios: $cuenta"; exit 1 }
if ($n -eq 0) { Escribir "Sin comentarios nuevos."; exit 0 }

Escribir "Hay $n comentarios nuevos: arranca la respuesta."
$salida = & claude -p "Usá el skill responder-comentarios y procesá todos los comentarios pendientes. Al final, una línea con cuántos respondiste, salteaste y alertaste." --permission-mode dontAsk 2>&1 | Out-String
$salida | Out-File -FilePath $log -Append -Encoding utf8
if ($salida -match "(?i)(usage limit|limit reached|hit your (session |weekly |daily )?limit|session limit|weekly limit|rate limit|out of (extra )?usage|resets? (at|in|\d))") { Escribir "LIMITE CLAUDE: la suscripción no tiene cuota ahora." }
Escribir "Termina la respuesta de comentarios (código $LASTEXITCODE)."
& "C:\Users\Mateo\AppData\Local\Programs\Python\Python312\python.exe" -I (Join-Path $raiz "herramientas\sincronizar.py") "Notebook: comentarios" 2>&1 | Out-File -FilePath $log -Append -Encoding utf8

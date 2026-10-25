# Conecta el bot de Telegram que te manda cada video al celular (para subirlo a YouTube Shorts).
# Antes: en Telegram, @BotFather › /newbot › nombre › usuario terminado en "bot" › copiar el token. Abrir el bot y mandarle "hola".
$ErrorActionPreference = 'Continue'
# PowerShell 5.1 no usa TLS 1.2 por defecto y Telegram lo exige
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$repo = 'mateoribak-art/teloexplico-sistema'
Write-Host ''
Write-Host 'Pegá el TOKEN que te dio @BotFather (clic derecho) y apretá Enter:' -ForegroundColor Cyan
$token = (Read-Host).Trim()
try {
    $upd = Invoke-RestMethod "https://api.telegram.org/bot$token/getUpdates"
} catch {
    Write-Host "No pude conectar con Telegram: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host '(Si dice 401 o 404, el token está mal copiado: copialo de nuevo de @BotFather.)'
    Read-Host 'Enter para cerrar'; exit 1
}
$chat = ($upd.result | ForEach-Object { $_.message.chat.id } | Select-Object -Last 1)
if (-not $chat) {
    Write-Host 'No encuentro tu chat: abrí el bot en Telegram, mandale "hola" y volvé a correr esto.' -ForegroundColor Red; Read-Host 'Enter para cerrar'; exit 1
}
$conf = @{ token = $token; chat_id = "$chat" } | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText('C:\Users\Mateo\teloexplico\secretos\telegram.json', $conf)
& gh secret set TELEGRAM_JSON -R $repo --body $conf
if ($LASTEXITCODE -ne 0) { Write-Host 'No se pudo guardar en GitHub.' -ForegroundColor Red; Read-Host 'Enter para cerrar'; exit 1 }
Invoke-RestMethod "https://api.telegram.org/bot$token/sendMessage" -Method Post -Body @{ chat_id = $chat; text = '✅ Listo: desde la próxima publicación te llega acá cada video con su título y descripción para YouTube Shorts.' } | Out-Null
Write-Host ''
Write-Host 'LISTO: te tiene que haber llegado un mensaje del bot en Telegram.' -ForegroundColor Green
Read-Host 'Enter para cerrar'

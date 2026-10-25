# Conecta la suscripción de Claude a la nube de GitHub (una vez; el token dura un año).
# Junta el token aunque se pegue en varios renglones, lo prueba con Claude aislado y recién ahí lo guarda cifrado.
$ErrorActionPreference = 'Continue'
$repo = 'mateoribak-art/teloexplico-sistema'

Write-Host ''
Write-Host 'PASO 1: se abre el navegador para entrar a Claude. Al terminar, acá aparece un token largo (empieza con sk-ant-oat01-).' -ForegroundColor Cyan
& claude setup-token
Write-Host ''
Write-Host 'PASO 2: copiá el token COMPLETO (puede ocupar 2 renglones) y pegalo acá con clic derecho.' -ForegroundColor Cyan
Write-Host '        Después apretá Enter dos veces.' -ForegroundColor Cyan
$token = ''
while ($true) {
    $linea = Read-Host
    if ([string]::IsNullOrWhiteSpace($linea)) { if ($token) { break } else { continue } }
    $token += $linea
}
$token = $token -replace '\s', ''
if ($token -notmatch '^sk-ant-oat01-[A-Za-z0-9_-]{40,}$') {
    Write-Host "Eso no parece el token (tiene que empezar con sk-ant-oat01- y ser largo; pegaste $($token.Length) caracteres)." -ForegroundColor Red
    Read-Host 'Enter para cerrar y volver a probar'
    exit 1
}

Write-Host ''
Write-Host 'PASO 3: probando el token (Claude aislado, sin tu sesión normal)...' -ForegroundColor Cyan
$aislado = Join-Path $env:TEMP ('claude-prueba-' + [guid]::NewGuid())
New-Item -ItemType Directory $aislado | Out-Null
$env:CLAUDE_CONFIG_DIR = $aislado
$env:CLAUDE_CODE_OAUTH_TOKEN = $token
$respuesta = (& claude -p 'Respondé solo con la palabra: funciona' 2>&1 | Out-String)
Remove-Item Env:CLAUDE_CONFIG_DIR, Env:CLAUDE_CODE_OAUTH_TOKEN
Remove-Item -Recurse -Force $aislado -ErrorAction SilentlyContinue
if ($respuesta -notmatch '(?i)funciona') {
    Write-Host 'El token NO funcionó. Respuesta de Claude:' -ForegroundColor Red
    Write-Host $respuesta.Trim()
    Read-Host 'Enter para cerrar y volver a probar'
    exit 1
}

& gh secret set CLAUDE_CODE_OAUTH_TOKEN -R $repo --body $token
if ($LASTEXITCODE -ne 0) {
    Write-Host 'No se pudo guardar en GitHub (mirá el mensaje de arriba).' -ForegroundColor Red
    Read-Host 'Enter para cerrar'
    exit 1
}
Write-Host ''
Write-Host 'LISTO: el token funciona y quedó guardado cifrado en GitHub. Ya podés cerrar y avisarle a Claude.' -ForegroundColor Green
Read-Host 'Enter para cerrar'

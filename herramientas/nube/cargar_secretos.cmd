@echo off
chcp 65001 >nul
rem Carga las claves de secretos\ en los secretos cifrados del repo privado (GitHub nunca las muestra).
rem Se corre UNA vez con doble clic (y de nuevo si cambia alguna clave). No imprime ninguna clave.
cd /d C:\Users\Mateo\teloexplico
set R=mateoribak-art/teloexplico-sistema
set OSSL="C:\Program Files\Git\usr\bin\openssl.exe"

if not exist secretos\clave_estado.txt %OSSL% rand -hex 32 > secretos\clave_estado.txt
set /p CLAVE_ESTADO=<secretos\clave_estado.txt

echo Cargando claves en GitHub...
gh secret set CLAVE_ESTADO -R %R% --body "%CLAVE_ESTADO%" || goto error
gh secret set META_JSON -R %R% < secretos\meta.json || goto error
if exist secretos\meta_en.json gh secret set META_EN_JSON -R %R% < secretos\meta_en.json || goto error
gh secret set AVISOS_JSON -R %R% < secretos\avisos.json || goto error
gh secret set TIKTOK_JSON -R %R% < secretos\tiktok.json || goto error
gh secret set GEMINI_KEY -R %R% < secretos\gemini_key.txt || goto error

rem el token de TikTok se renueva solo: viaja cifrado dentro del repo
rem (27/10) solo si todavía no está: la nube lo renueva y la copia de la notebook puede estar vieja; pisarlo cortaría TikTok.
rem Si se vuelve a autorizar una cuenta, borrar antes su estado\tiktok_token*.enc.
if not exist estado mkdir estado
if not exist estado\tiktok_token.enc %OSSL% enc -aes-256-cbc -pbkdf2 -salt -pass env:CLAVE_ESTADO -in secretos\tiktok_token.json -out estado\tiktok_token.enc || goto error
rem @letmeexplain.us: su token de TikTok, si ya se autorizó
if exist secretos\tiktok_token_en.json if not exist estado\tiktok_token_en.enc %OSSL% enc -aes-256-cbc -pbkdf2 -salt -pass env:CLAVE_ESTADO -in secretos\tiktok_token_en.json -out estado\tiktok_token_en.enc || goto error

echo.
gh secret list -R %R%
echo.
echo LISTO. Ya podes cerrar esta ventana y avisarle a Claude.
pause
exit /b 0

:error
echo.
echo Algo fallo (mira el mensaje de arriba). Avisale a Claude.
pause
exit /b 1

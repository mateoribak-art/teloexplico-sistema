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
gh secret set AVISOS_JSON -R %R% < secretos\avisos.json || goto error
gh secret set TIKTOK_JSON -R %R% < secretos\tiktok.json || goto error
gh secret set GEMINI_KEY -R %R% < secretos\gemini_key.txt || goto error

rem el token de TikTok se renueva solo: viaja cifrado dentro del repo
if not exist estado mkdir estado
%OSSL% enc -aes-256-cbc -pbkdf2 -salt -pass env:CLAVE_ESTADO -in secretos\tiktok_token.json -out estado\tiktok_token.enc || goto error

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

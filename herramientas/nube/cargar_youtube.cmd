@echo off
rem Carga las claves de YouTube en los secretos cifrados de GitHub (no las muestra). Doble clic una vez.
cd /d C:\Users\Mateo\teloexplico
gh secret set YOUTUBE_JSON -R mateoribak-art/teloexplico-sistema < secretos\youtube.json || goto error
gh secret set YOUTUBE_TOKEN_JSON -R mateoribak-art/teloexplico-sistema < secretos\youtube_token.json || goto error
echo.
echo LISTO. Ya podes cerrar esta ventana.
pause
exit /b 0
:error
echo Algo fallo (mira el mensaje de arriba).
pause
exit /b 1

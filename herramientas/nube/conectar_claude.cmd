@echo off
chcp 65001 >nul
rem Conecta la suscripcion de Claude a la nube (una vez; el token dura un ano).
cd /d C:\Users\Mateo\teloexplico
echo PASO 1: se abre el navegador para entrar a Claude. Al terminar, aca aparece un token largo (empieza con sk-ant-oat).
echo.
call claude setup-token
echo.
echo PASO 2: copia ese token (seleccionalo con el mouse y Enter) y pegalo abajo cuando lo pida (clic derecho pega). No se va a ver.
gh secret set CLAUDE_CODE_OAUTH_TOKEN -R mateoribak-art/teloexplico-sistema || goto error
echo.
echo LISTO. Ya podes cerrar esta ventana y avisarle a Claude.
pause
exit /b 0
:error
echo Algo fallo (mira el mensaje de arriba). Avisale a Claude.
pause
exit /b 1

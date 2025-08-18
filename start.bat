@echo off
echo ========================================
echo   Club Comandante Espora - Inicio
echo ========================================
echo.
echo Iniciando servidores...
echo.
echo [1/2] Iniciando Backend (Puerto 3001)...
cd /d "%~dp0\BackendCCE"
start "CCE Backend" cmd /k "npm run dev"
echo.
echo [2/2] Iniciando Frontend (Puerto 3000)...
cd /d "%~dp0\FrontendCCE"
start "CCE Frontend" cmd /k "npm run dev"
echo.
echo ========================================
echo Servidores iniciados correctamente!
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para continuar...
echo ========================================
pause >nul
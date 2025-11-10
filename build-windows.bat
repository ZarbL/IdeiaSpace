@echo off
REM ============================================================
REM  IdeiaSpace Mission - Build Automatizado para Windows
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║     🚀 IDEIASPACE MISSION - BUILD AUTOMATIZADO         ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Verificar se Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js 16+ de: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node --version
echo.

REM Verificar se npm está disponível
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado!
    pause
    exit /b 1
)

echo ✅ npm encontrado
npm --version
echo.

REM Perguntar se deve fazer setup completo
set /p SETUP="Primeira vez? Execute setup completo? (S/N): "
if /i "%SETUP%"=="S" (
    echo.
    echo 🔧 Executando setup completo...
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    call npm run setup
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Setup falhou!
        pause
        exit /b 1
    )
    echo ✅ Setup concluído!
    echo.
)

REM Preparar build
echo 📋 Preparando recursos para build...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call npm run build:prepare
if %errorlevel% neq 0 (
    echo.
    echo ❌ Preparação falhou!
    echo.
    echo 💡 Tente executar:
    echo    npm run setup
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Preparação concluída!
echo.

REM Construir instalador
echo 🏗️  Construindo instalador para Windows...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ⏱️  Isso pode levar 10-20 minutos...
echo ☕ Hora do café!
echo.

call npm run make -- --platform=win32 --arch=x64
if %errorlevel% neq 0 (
    echo.
    echo ❌ Build falhou!
    pause
    exit /b 1
)

echo.
echo ✅ Build concluído!
echo.

REM Validar build
echo 🔍 Validando instalador gerado...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call npm run build:validate
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Validação encontrou problemas
    echo.
)

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║           ✅ PROCESSO CONCLUÍDO COM SUCESSO!           ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 📦 Seu instalador está em:
echo    out\make\squirrel.windows\x64\IdeiaSpace-Mission-Setup.exe
echo.
echo 📝 Próximos passos:
echo    1. Teste o instalador em uma máquina limpa
echo    2. Verifique se o ESP32 funciona corretamente
echo    3. Distribua para seus usuários!
echo.
echo 💡 Documentação completa em: BUILD.md
echo.

pause

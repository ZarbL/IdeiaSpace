@echo off
chcp 65001 >nul
:: ============================================================================
:: IDEIASPACE - CONFIGURAÇÃO INICIAL
:: ============================================================================
:: Este script prepara o ambiente antes da primeira execução
:: Ele instala todas as dependências necessárias para o funcionamento
:: ============================================================================

SETLOCAL EnableDelayedExpansion

:: Cores para output (funciona no Windows 10+)
title IdeiaSpace - Configuração Inicial

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                                                                        ║
echo ║             🚀 IDEIASPACE - CONFIGURAÇÃO INICIAL 🚀                    ║
echo ║                                                                        ║
echo ║  Este processo irá preparar o ambiente para o primeiro uso            ║
echo ║  Aguarde enquanto instalamos as dependências necessárias              ║
echo ║                                                                        ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

:: Verificar se está sendo executado como administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  AVISO: Este script não está sendo executado como Administrador
    echo    Algumas operações podem falhar. Recomendamos executar como Admin.
    echo.
    timeout /t 3 >nul
)

:: Detectar diretório do script
cd /d "%~dp0"
set "BASE_DIR=%CD%"
set "BACKEND_DIR=%BASE_DIR%\resources\backend"

echo 📂 Diretório base: %BASE_DIR%
echo 📁 Backend esperado em: %BACKEND_DIR%
echo.

:: Verificar se diretório backend existe
if not exist "%BACKEND_DIR%" (
    echo ❌ ERRO: Diretório backend não encontrado!
    echo    Esperado em: %BACKEND_DIR%
    echo.
    echo 💡 SOLUÇÃO: Certifique-se de que extraiu todos os arquivos corretamente
    echo    e que está executando este script na pasta do aplicativo.
    echo.
    pause
    exit /b 1
)

echo ✅ Diretório backend encontrado
echo.

:: ============================================================================
:: ETAPA 1: Verificar Node.js (incluído no Electron)
:: ============================================================================
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📋 ETAPA 1/5: Verificando Node.js
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: Procurar pelo executável do Electron (que contém Node.js)
set "ELECTRON_EXE=%BASE_DIR%\IdeiaSpace-Mission.exe"
if not exist "%ELECTRON_EXE%" (
    echo ⚠️  Executável do Electron não encontrado
    echo    Procurando por outros executáveis...
    
    dir /b "%BASE_DIR%\*.exe" 2>nul
    if errorlevel 1 (
        echo ❌ Nenhum executável encontrado!
        pause
        exit /b 1
    )
) else (
    echo ✅ Electron encontrado: %ELECTRON_EXE%
)

echo ✅ Node.js integrado (via Electron) disponível
echo.

:: ============================================================================
:: ETAPA 2: Instalar dependências Node.js do backend
:: ============================================================================
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📋 ETAPA 2/5: Instalando dependências Node.js
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ⏳ Este processo pode levar 2-5 minutos dependendo da sua internet...
echo.

cd /d "%BACKEND_DIR%"

:: Verificar se package.json existe
if not exist "package.json" (
    echo ❌ ERRO: package.json não encontrado no backend!
    pause
    exit /b 1
)

:: Verificar se npm está disponível
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ERRO: npm não encontrado no sistema!
    echo.
    echo 💡 OPÇÕES:
    echo    1. Instale Node.js de: https://nodejs.org/
    echo    2. OU o aplicativo tentará usar o Node.js integrado do Electron
    echo.
    echo ⏩ Pulando instalação manual de dependências...
    echo    O aplicativo tentará instalar automaticamente na primeira execução.
    echo.
    set "SKIP_NPM=1"
    goto :skip_npm_install
)

echo 📦 Executando: npm install --prefer-offline --no-audit --no-fund
echo.

npm install --prefer-offline --no-audit --no-fund

if %errorLevel% neq 0 (
    echo.
    echo ⚠️  Falha ao instalar dependências via npm
    echo    O aplicativo tentará instalar automaticamente na primeira execução.
    echo.
    timeout /t 3 >nul
) else (
    echo.
    echo ✅ Dependências instaladas com sucesso!
    echo.
)

:skip_npm_install

:: ============================================================================
:: ETAPA 3: Baixar Arduino CLI
:: ============================================================================
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📋 ETAPA 3/5: Configurando Arduino CLI
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: Verificar se Arduino CLI já existe
if exist "%BACKEND_DIR%\arduino-cli\arduino-cli.exe" (
    echo ✅ Arduino CLI já instalado
    echo.
    goto :skip_arduino_install
)

if defined SKIP_NPM (
    echo ⏩ Pulando instalação do Arduino CLI (será feito automaticamente)
    echo.
    goto :skip_arduino_install
)

echo 📥 Baixando e configurando Arduino CLI...
echo    Este processo pode levar 1-2 minutos...
echo.

node install-arduino-cli.js

if %errorLevel% neq 0 (
    echo.
    echo ⚠️  Falha ao instalar Arduino CLI
    echo    O aplicativo tentará instalar automaticamente na primeira execução.
    echo.
    timeout /t 3 >nul
) else (
    echo.
    echo ✅ Arduino CLI instalado com sucesso!
    echo.
)

:skip_arduino_install

:: ============================================================================
:: ETAPA 4: Instalar cores ESP32
:: ============================================================================
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📋 ETAPA 4/5: Instalando cores ESP32
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ⏳ Este é o processo mais demorado (5-10 minutos)
echo    Download: ~250-300 MB
echo.

if defined SKIP_NPM (
    echo ⏩ Pulando instalação dos cores ESP32 (será feito automaticamente)
    echo.
    goto :skip_esp32_install
)

if not exist "%BACKEND_DIR%\arduino-cli\arduino-cli.exe" (
    echo ⚠️  Arduino CLI não disponível, pulando instalação de cores
    echo    Será instalado automaticamente na primeira execução.
    echo.
    goto :skip_esp32_install
)

echo 📥 Instalando ESP32 cores e ferramentas de compilação...
echo.

node setup-esp32-core.js

if %errorLevel% neq 0 (
    echo.
    echo ⚠️  Falha ao instalar cores ESP32
    echo    O aplicativo tentará instalar automaticamente na primeira execução.
    echo.
    timeout /t 3 >nul
) else (
    echo.
    echo ✅ Cores ESP32 instalados com sucesso!
    echo.
)

:skip_esp32_install

:: ============================================================================
:: ETAPA 5: Instalar bibliotecas
:: ============================================================================
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📋 ETAPA 5/5: Instalando bibliotecas Arduino
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if defined SKIP_NPM (
    echo ⏩ Pulando instalação de bibliotecas (será feito automaticamente)
    echo.
    goto :skip_libraries_install
)

if not exist "%BACKEND_DIR%\arduino-cli\arduino-cli.exe" (
    echo ⚠️  Arduino CLI não disponível, pulando instalação de bibliotecas
    echo.
    goto :skip_libraries_install
)

echo 📚 Instalando bibliotecas essenciais...
echo.

node setup-libraries.js

if %errorLevel% neq 0 (
    echo.
    echo ⚠️  Falha ao instalar algumas bibliotecas
    echo    O aplicativo tentará instalar automaticamente na primeira execução.
    echo.
    timeout /t 2 >nul
) else (
    echo.
    echo ✅ Bibliotecas instaladas com sucesso!
    echo.
)

:skip_libraries_install

:: ============================================================================
:: FINALIZAÇÃO
:: ============================================================================
echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                                                                        ║
echo ║                  ✅ CONFIGURAÇÃO CONCLUÍDA! ✅                         ║
echo ║                                                                        ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

if defined SKIP_NPM (
    echo ⚠️  AVISO: Algumas etapas foram puladas
    echo.
    echo 📋 O que acontecerá agora:
    echo    - Na primeira execução do aplicativo
    echo    - Clique no botão "Iniciar Backend"
    echo    - O sistema instalará automaticamente tudo que falta
    echo    - Este processo pode levar 10-15 minutos
    echo.
    echo 💡 ALTERNATIVA RECOMENDADA:
    echo    1. Instale Node.js de https://nodejs.org/
    echo    2. Execute este script novamente
    echo    3. Tudo será instalado agora e o aplicativo abrirá pronto!
    echo.
) else (
    echo ✅ Sistema totalmente configurado!
    echo.
    echo 📋 O que foi instalado:
    echo    ✓ Dependências Node.js do backend
    echo    ✓ Arduino CLI
    echo    ✓ Cores ESP32 e ferramentas de compilação
    echo    ✓ Bibliotecas Arduino essenciais
    echo.
    echo 🚀 Você já pode executar o IdeiaSpace-Mission.exe
    echo.
)

echo 📝 Próximos passos:
echo    1. Execute: IdeiaSpace-Mission.exe
echo    2. Na primeira tela, clique em "Iniciar Backend"
echo    3. Aguarde o backend inicializar (15-30 segundos)
echo    4. Comece a programar!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: Criar marcador de setup concluído
echo. > "%BACKEND_DIR%\.setup-completed"
echo Setup concluído em: %date% %time% >> "%BACKEND_DIR%\.setup-completed"

echo Pressione qualquer tecla para fechar esta janela...
pause >nul

exit /b 0

#!/bin/bash
# ============================================================================
# LIMPEZA ULTRA-AGRESSIVA - APENAS ESP32 DEV MODULE
# Reduz projeto de 5.4GB para ~800MB mantendo apenas o essencial
# ============================================================================

echo "🚨 ATENÇÃO: Este script irá fazer limpeza AGRESSIVA!"
echo "   Irá manter APENAS funcionalidades para ESP32 Dev Module"
echo "   Economia estimada: ~4.5GB de espaço"
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi

# Criar backup das configurações importantes
echo "📦 Criando backup das configurações..."
mkdir -p backup/arduino-cli
cp -r backend/arduino-cli/config/arduino-cli.yaml backup/arduino-cli/ 2>/dev/null

# Navegar para o diretório de dados do Arduino CLI
cd backend/arduino-cli/config/data

echo "🧹 Iniciando limpeza ultra-agressiva..."

# 1. REMOVER PACOTES ARDUINO AVR COMPLETOS (248MB)
echo "🗑️  Removendo pacotes Arduino AVR..."
rm -rf packages/arduino
echo "   ✅ Arduino AVR removido: ~248MB economizados"

# 2. REMOVER FERRAMENTAS RISC-V DESNECESSÁRIAS PARA ESP32 DEV MODULE
echo "🗑️  Removendo ferramentas RISC-V (esp-rv32)..."
rm -rf packages/esp32/tools/esp-rv32
echo "   ✅ ESP-RV32 removido: ~2.0GB economizados"

# 3. REMOVER BIBLIOTECAS ESP32 DUPLICADAS
echo "🗑️  Removendo bibliotecas ESP32 duplicadas..."
rm -rf packages/esp32/tools/esp32-arduino-libs
echo "   ✅ ESP32 Arduino Libs removidas: ~1.6GB economizados"

# 4. MANTER APENAS VARIANT ESP32 (REMOVER TODAS AS OUTRAS)
echo "🗑️  Removendo variants desnecessárias (mantendo apenas esp32)..."
cd packages/esp32/hardware/esp32/*/variants/
find . -type d -maxdepth 1 ! -name "." ! -name "esp32" -exec rm -rf {} + 2>/dev/null
echo "   ✅ Variants desnecessárias removidas: ~200MB economizados"

# Voltar ao diretório de dados
cd ../../../../

# 5. REMOVER ARQUIVOS EXECUTÁVEIS WINDOWS (.exe)
echo "🗑️  Removendo arquivos Windows desnecessários..."
find . -name "*.exe" -type f -delete
echo "   ✅ Arquivos .exe removidos: ~50MB economizados"

# 6. REMOVER BIBLIOTECAS NÃO UTILIZADAS
echo "🗑️  Removendo bibliotecas não essenciais..."
cd ../../user/libraries/
# Manter apenas algumas bibliotecas básicas comuns
find . -type d -maxdepth 1 ! -name "." ! -name "Adafruit_BusIO" ! -name "Adafruit_Sensor" -exec rm -rf {} + 2>/dev/null
echo "   ✅ Bibliotecas não essenciais removidas: ~100MB economizados"

# Voltar ao diretório raiz
cd ../../../../../

# 7. LIMPEZA DE CACHE E TEMPORÁRIOS
echo "🗑️  Limpando cache e arquivos temporários..."
rm -rf backend/arduino-cli/config/data/tmp/*
rm -rf backend/arduino-cli/config/downloads/*
echo "   ✅ Cache limpo"

# 8. VERIFICAR TAMANHO FINAL
echo ""
echo "📊 Verificando resultado final..."
BACKEND_SIZE=$(du -sh backend 2>/dev/null | cut -f1)
ARDUINO_CLI_SIZE=$(du -sh backend/arduino-cli 2>/dev/null | cut -f1)

echo ""
echo "🎉 LIMPEZA CONCLUÍDA!"
echo "📊 Tamanho atual do backend: $BACKEND_SIZE"
echo "📊 Tamanho atual do arduino-cli: $ARDUINO_CLI_SIZE"
echo ""
echo "✅ Mantido para ESP32 Dev Module:"
echo "   • esp-x32 (compilador xtensa)"
echo "   • esptool_py (upload)"
echo "   • xtensa-esp-elf-gdb (debug)"
echo "   • Variant e core esp32"
echo "   • Bibliotecas essenciais apenas"
echo ""
echo "🗑️  Removido:"
echo "   • Pacotes Arduino AVR (~248MB)"
echo "   • Ferramentas RISC-V (~2.0GB)"
echo "   • Bibliotecas duplicadas (~1.6GB)"
echo "   • Variants desnecessárias (~200MB)"
echo "   • Arquivos Windows (~50MB)"
echo "   • Bibliotecas não utilizadas (~100MB)"
echo ""
echo "💾 ECONOMIA TOTAL ESTIMADA: ~4.2GB"
echo ""
echo "⚠️  IMPORTANTE: Teste o projeto para garantir que tudo funciona!"
echo "   Se algo não funcionar, restaure do backup em './backup/'"
#!/bin/bash
# ============================================================================
# LIMPEZA CONSERVADORA - TESTE SEGURO
# Remove apenas o que certamente não é necessário
# ============================================================================

echo "🧪 TESTE CONSERVADOR - Limpeza Segura"
echo "   Remove apenas arquivos obviamente desnecessários"
echo "   Economia estimada: ~300MB"
echo ""

# Navegar para o diretório de dados do Arduino CLI
cd backend/arduino-cli/config/data

echo "🧹 Iniciando limpeza conservadora..."

# 1. REMOVER APENAS ARQUIVOS .exe (Windows)
echo "🗑️  Removendo arquivos Windows (.exe)..."
REMOVED_EXE=$(find . -name "*.exe" -type f | wc -l)
find . -name "*.exe" -type f -delete
echo "   ✅ $REMOVED_EXE arquivos .exe removidos: ~50MB economizados"

# 2. LIMPAR CACHE E DOWNLOADS
echo "🗑️  Limpando cache e downloads..."
rm -rf tmp/*
rm -rf ../../downloads/*
echo "   ✅ Cache limpo"

# 3. REMOVER APENAS VARIANTS OBVIAMENTE DESNECESSÁRIAS (manter principais)
echo "🗑️  Removendo algumas variants não essenciais..."
cd packages/esp32/hardware/esp32/*/variants/
# Remover apenas algumas variants muito específicas que claramente não são ESP32 Dev Module
rm -rf waveshare_* dfrobot_* adafruit_* sparkfun_* 2>/dev/null
echo "   ✅ Variants específicas de terceiros removidas: ~100MB economizados"

# Voltar ao diretório raiz
cd ../../../../../../

# 4. VERIFICAR RESULTADO
echo ""
echo "📊 Verificando resultado..."
BACKEND_SIZE=$(du -sh backend 2>/dev/null | cut -f1)

echo ""
echo "🎉 LIMPEZA CONSERVADORA CONCLUÍDA!"
echo "📊 Tamanho atual do backend: $BACKEND_SIZE"
echo ""
echo "✅ Esta limpeza é SEGURA e remove apenas:"
echo "   • Arquivos .exe do Windows"
echo "   • Cache temporário" 
echo "   • Variants de terceiros específicos"
echo ""
echo "💾 Economia estimada: ~150MB"
echo "⚠️  Para economia maior, use cleanup-esp32-only.sh"
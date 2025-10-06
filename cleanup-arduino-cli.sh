#!/bin/bash

# Script de Limpeza do Arduino CLI para Reduzir Consumo de Memória
# Este script remove arquivos temporários e cache desnecessários

echo "🧹 Iniciando limpeza do Arduino CLI..."

ARDUINO_CLI_DIR="/Users/luiszarbielli/Trabalho/IdeiaSpace/backend/arduino-cli"

if [ ! -d "$ARDUINO_CLI_DIR" ]; then
    echo "❌ Diretório Arduino CLI não encontrado: $ARDUINO_CLI_DIR"
    exit 1
fi

cd "$ARDUINO_CLI_DIR"

echo "📊 Tamanho ANTES da limpeza:"
du -sh .

echo ""
echo "🗑️ Removendo arquivos temporários..."

# Remover downloads de packages (podem ser baixados novamente se necessário)
if [ -d "downloads/packages" ]; then
    echo "  - Limpando downloads/packages..."
    find downloads/packages -name "*.tar.bz2" -delete 2>/dev/null || true
    find downloads/packages -name "*.tar.gz" -delete 2>/dev/null || true
    find downloads/packages -name "*.zip" -delete 2>/dev/null || true
    echo "    ✅ Archives removidos"
fi

# Limpar pasta tmp
if [ -d "config/tmp" ]; then
    echo "  - Limpando config/tmp..."
    rm -rf config/tmp/* 2>/dev/null || true
    echo "    ✅ Temporários removidos"
fi

# Remover logs antigos se existirem
if [ -d "logs" ]; then
    echo "  - Limpando logs antigos..."
    find logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
    echo "    ✅ Logs antigos removidos"
fi

# Limpar cache desnecessário
if [ -d "config/data" ]; then
    echo "  - Otimizando cache..."
    # Manter apenas os index files essenciais, remover outros
    find config/data -name "*.tmp" -delete 2>/dev/null || true
    find config/data -name "*.lock" -delete 2>/dev/null || true
    echo "    ✅ Cache otimizado"
fi

echo ""
echo "📊 Tamanho APÓS a limpeza:"
du -sh .

echo ""
echo "🎉 Limpeza concluída com sucesso!"
echo "💡 Se o Arduino CLI precisar de algum package, ele será baixado automaticamente quando necessário."

# Criar arquivo .gitignore para evitar commit de arquivos grandes
cat > .gitignore << 'EOF'
# Arquivos temporários e cache
downloads/packages/*.tar.bz2
downloads/packages/*.tar.gz
downloads/packages/*.zip
config/tmp/*
logs/*.log
*.tmp
*.lock
EOF

echo "📝 Arquivo .gitignore criado para evitar commit de cache."
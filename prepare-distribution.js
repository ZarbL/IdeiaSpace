#!/usr/bin/env node

/**
 * Script de Preparação para Distribuição
 * Cria o pacote final pronto para upload
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const VERSION = '1.0.0';
const OUT_DIR = path.join(__dirname, 'out');
const DIST_DIR = path.join(__dirname, 'distribution');

console.log('🚀 PREPARAÇÃO PARA DISTRIBUIÇÃO - IdeiaSpace Mission\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function main() {
  try {
    // 1. Verificar se o build existe
    console.log('📦 [1/6] Verificando build...');
    const buildPath = path.join(OUT_DIR, 'IdeiaSpace Mission-win32-x64');
    if (!fs.existsSync(buildPath)) {
      console.log('   ❌ Build não encontrado!');
      console.log('   💡 Execute: npm run make\n');
      process.exit(1);
    }
    console.log('   ✅ Build encontrado\n');

    // 2. Criar diretório de distribuição
    console.log('📁 [2/6] Criando diretório de distribuição...');
    if (fs.existsSync(DIST_DIR)) {
      fs.removeSync(DIST_DIR);
    }
    fs.mkdirSync(DIST_DIR, { recursive: true });
    console.log('   ✅ Diretório criado\n');

    // 3. Copiar build
    console.log('📋 [3/6] Copiando arquivos do build...');
    const distBuildPath = path.join(DIST_DIR, 'IdeiaSpace Mission-win32-x64');
    fs.copySync(buildPath, distBuildPath);
    console.log('   ✅ Build copiado\n');

    // 4. Copiar PRIMEIRO-SETUP.bat para raiz
    console.log('📄 [4/6] Adicionando scripts de instalação...');
    const setupBatSource = path.join(__dirname, 'PRIMEIRO-SETUP.bat');
    if (fs.existsSync(setupBatSource)) {
      fs.copySync(setupBatSource, path.join(DIST_DIR, 'PRIMEIRO-SETUP.bat'));
      console.log('   ✅ PRIMEIRO-SETUP.bat copiado\n');
    } else {
      console.log('   ⚠️  PRIMEIRO-SETUP.bat não encontrado\n');
    }

    // 5. Criar INSTRUÇÕES.txt
    console.log('📝 [5/6] Criando arquivo de instruções...');
    const instructions = `╔════════════════════════════════════════════════════════╗
║      IDEIA SPACE MISSION - INSTRUÇÕES DE USO          ║
╚════════════════════════════════════════════════════════╝

🚀 PRIMEIRA EXECUÇÃO (RECOMENDADO):
   1. Extrair todo o conteúdo do ZIP
   2. Executar PRIMEIRO-SETUP.bat (aguardar 10-20 minutos)
   3. Abrir "IdeiaSpace Mission-win32-x64/IdeiaSpace-Mission.exe"

⚡ EXECUÇÃO RÁPIDA (sem setup prévio):
   1. Extrair todo o conteúdo do ZIP
   2. Abrir "IdeiaSpace Mission-win32-x64/IdeiaSpace-Mission.exe"
   3. O sistema fará a instalação automaticamente (primeira vez)

📋 REQUISITOS:
   - Windows 7 ou superior (64-bit)
   - 2GB de RAM (mínimo)
   - 500MB de espaço livre em disco
   - Conexão com internet (necessário na primeira execução)

⚠️ IMPORTANTE:
   - NÃO mover arquivos entre pastas
   - Manter toda a estrutura de pastas intacta
   - Aguardar a instalação completa na primeira vez
   - O Arduino CLI e bibliotecas serão baixados automaticamente

🔧 O QUE SERÁ INSTALADO AUTOMATICAMENTE:
   - Arduino CLI (ferramenta de compilação)
   - ESP32 Core (suporte para placas ESP32)
   - Bibliotecas necessárias (sensores, displays, etc)

🆘 PROBLEMAS COMUNS:

   ❓ "Falha ao iniciar backend"
      → Execute PRIMEIRO-SETUP.bat antes de abrir o programa

   ❓ "Erro ao baixar Arduino CLI"
      → Verifique sua conexão com internet
      → Tente executar como Administrador

   ❓ Antivírus bloqueia o programa
      → Adicione exceção no antivírus
      → O programa é seguro (código-fonte disponível)

   ❓ Mais ajuda?
      → Abra o arquivo "LEIA-ME-INSTALACAO.md" dentro da pasta
         "IdeiaSpace Mission-win32-x64/resources"

📧 SUPORTE:
   Email: contato@ideiaspace.com.br
   Site: https://ideiaspace.com.br

Versão: ${VERSION}
Data: ${new Date().toLocaleDateString('pt-BR')}
`;
    
    fs.writeFileSync(path.join(DIST_DIR, 'INSTRUÇÕES.txt'), instructions, 'utf8');
    console.log('   ✅ INSTRUÇÕES.txt criado\n');

    // 6. Criar arquivo de versionamento
    console.log('📌 [6/6] Criando arquivo de versão...');
    const versionInfo = {
      version: VERSION,
      buildDate: new Date().toISOString(),
      platform: 'win32-x64',
      electron: require('./package.json').devDependencies.electron,
      nodejs: process.version
    };
    fs.writeFileSync(
      path.join(DIST_DIR, 'VERSION.json'),
      JSON.stringify(versionInfo, null, 2),
      'utf8'
    );
    console.log('   ✅ VERSION.json criado\n');

    // Resumo
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ DISTRIBUIÇÃO PRONTA!\n');
    console.log('📁 Localização: distribution/\n');
    console.log('📦 Próximos passos:\n');
    console.log('   1. Compactar a pasta "distribution" em ZIP');
    console.log('   2. Nomear como: IdeiaSpace-v' + VERSION + '-Windows.zip');
    console.log('   3. Fazer upload para GitHub Releases, Google Drive, etc\n');
    console.log('💡 Dica: Use ferramentas como 7-Zip ou WinRAR');
    console.log('   para melhor compressão\n');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    process.exit(1);
  }
}

main();

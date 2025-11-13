#!/usr/bin/env node

/**
 * Script de Verificação Pré-Build
 * Garante que todos os requisitos estão prontos antes de fazer o build
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICAÇÃO PRÉ-BUILD - IdeiaSpace Mission\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let allOk = true;
const issues = [];

// 1. Verificar backend/node_modules
console.log('📦 [1/9] Verificando backend/node_modules...');
const nodeModulesPath = path.join(__dirname, 'backend', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  // Verificar dependências críticas
  const criticalDeps = ['express', 'serialport', 'ws', 'cors'];
  const missingDeps = criticalDeps.filter(dep => 
    !fs.existsSync(path.join(nodeModulesPath, dep))
  );
  
  if (missingDeps.length > 0) {
    console.log(`   ❌ Dependências faltando: ${missingDeps.join(', ')}`);
    issues.push('Execute: cd backend && npm install');
    allOk = false;
  } else {
    console.log('   ✅ backend/node_modules completo\n');
  }
} else {
  console.log('   ❌ backend/node_modules NÃO EXISTE!');
  issues.push('Execute: cd backend && npm install');
  allOk = false;
}

// 2. Verificar node_modules do frontend (Blockly)
console.log('🎨 [2/9] Verificando node_modules do frontend (Blockly)...');
const frontendNodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(frontendNodeModulesPath)) {
  const blocklyPath = path.join(frontendNodeModulesPath, 'blockly');
  if (fs.existsSync(blocklyPath)) {
    console.log('   ✅ Blockly instalado no frontend\n');
  } else {
    console.log('   ❌ Blockly NÃO ENCONTRADO!');
    issues.push('Execute: npm install (no diretório raiz)');
    allOk = false;
  }
} else {
  console.log('   ❌ node_modules do frontend NÃO EXISTE!');
  issues.push('Execute: npm install (no diretório raiz)');
  allOk = false;
}

// 3. Verificar backend/package.json
console.log('📋 [3/9] Verificando backend/package.json...');
const packageJsonPath = path.join(__dirname, 'backend', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('   ✅ backend/package.json presente\n');
} else {
  console.log('   ❌ backend/package.json NÃO ENCONTRADO!');
  issues.push('Arquivo crítico faltando!');
  allOk = false;
}

// 4. Verificar forge.config.js
console.log('⚙️  [4/9] Verificando forge.config.js...');
const forgeConfigPath = path.join(__dirname, 'forge.config.js');
if (fs.existsSync(forgeConfigPath)) {
  const forgeConfig = fs.readFileSync(forgeConfigPath, 'utf8');
  
  // Verificar se node_modules está sendo EXCLUÍDO (erro!)
  if (forgeConfig.includes("'!node_modules/**'")) {
    console.log('   ❌ ERRO: forge.config.js exclui node_modules!');
    console.log('   💡 Remova a linha: \'!node_modules/**\'');
    issues.push('forge.config.js exclui node_modules (crítico!)');
    allOk = false;
  } else {
    console.log('   ✅ forge.config.js OK (não exclui node_modules)\n');
  }
} else {
  console.log('   ❌ forge.config.js NÃO ENCONTRADO!');
  issues.push('Arquivo de configuração do build faltando!');
  allOk = false;
}

// 5. Verificar PRIMEIRO-SETUP.bat
console.log('📄 [5/9] Verificando PRIMEIRO-SETUP.bat...');
const setupBatPath = path.join(__dirname, 'PRIMEIRO-SETUP.bat');
if (fs.existsSync(setupBatPath)) {
  console.log('   ✅ PRIMEIRO-SETUP.bat presente\n');
} else {
  console.log('   ❌ PRIMEIRO-SETUP.bat NÃO ENCONTRADO!');
  issues.push('Script de instalação para usuário final faltando!');
  allOk = false;
}

// 6. Verificar LEIA-ME-INSTALACAO.md
console.log('📚 [6/9] Verificando LEIA-ME-INSTALACAO.md...');
const readmePath = path.join(__dirname, 'LEIA-ME-INSTALACAO.md');
if (fs.existsSync(readmePath)) {
  console.log('   ✅ LEIA-ME-INSTALACAO.md presente\n');
} else {
  console.log('   ⚠️  LEIA-ME-INSTALACAO.md não encontrado (recomendado)');
}

// 7. Verificar src/main/main.js usa process.execPath
console.log('🔧 [7/9] Verificando src/main/main.js...');
const mainJsPath = path.join(__dirname, 'src', 'main', 'main.js');
if (fs.existsSync(mainJsPath)) {
  const mainJs = fs.readFileSync(mainJsPath, 'utf8');
  
  if (mainJs.includes("spawn('node'") || mainJs.includes('spawn("node"')) {
    console.log('   ❌ ERRO: main.js usa spawn(\'node\') ao invés de process.execPath!');
    console.log('   💡 Use: spawn(process.execPath, ...)');
    issues.push('main.js não usa Node.js do Electron');
    allOk = false;
  } else if (mainJs.includes('process.execPath')) {
    console.log('   ✅ main.js usa process.execPath corretamente\n');
  } else {
    console.log('   ⚠️  Não foi possível verificar uso do Node.js');
  }
} else {
  console.log('   ❌ src/main/main.js NÃO ENCONTRADO!');
  issues.push('Arquivo principal do Electron faltando!');
  allOk = false;
}

// 8. Verificar backend/config.js detecta ambiente empacotado
console.log('🌍 [8/9] Verificando backend/config.js...');
const configPath = path.join(__dirname, 'backend', 'config.js');
if (fs.existsSync(configPath)) {
  const configJs = fs.readFileSync(configPath, 'utf8');
  
  if (configJs.includes('process.resourcesPath') && configJs.includes('getBackendDir')) {
    console.log('   ✅ config.js detecta ambiente empacotado\n');
  } else {
    console.log('   ⚠️  config.js pode não detectar ambiente empacotado corretamente');
    issues.push('config.js pode precisar de getBackendDir()');
  }
} else {
  console.log('   ❌ backend/config.js NÃO ENCONTRADO!');
  issues.push('Arquivo de configuração do backend faltando!');
  allOk = false;
}

// 9. Verificar backend/minimal-server.js (fallback)
console.log('🆘 [9/9] Verificando backend/minimal-server.js...');
const minimalServerPath = path.join(__dirname, 'backend', 'minimal-server.js');
if (fs.existsSync(minimalServerPath)) {
  console.log('   ✅ minimal-server.js presente (fallback de emergência)\n');
} else {
  console.log('   ⚠️  minimal-server.js não encontrado (recomendado ter fallback)');
}

// Resumo Final
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (allOk) {
  console.log('✅ TUDO OK! Pronto para fazer o build!');
  console.log('\n💡 Próximo passo: npm run make\n');
  process.exit(0);
} else {
  console.log('❌ PROBLEMAS ENCONTRADOS!\n');
  console.log('🔧 Ações necessárias:\n');
  issues.forEach((issue, idx) => {
    console.log(`   ${idx + 1}. ${issue}`);
  });
  console.log('\n💡 Corrija os problemas acima antes de fazer o build\n');
  process.exit(1);
}

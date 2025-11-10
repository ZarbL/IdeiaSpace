/**
 * Electron Forge Hooks
 * Scripts executados durante o processo de build
 */

const fs = require('fs-extra');
const path = require('path');

module.exports = {
  /**
   * Hook executado após copiar arquivos para o diretório de build
   * Usado para ajustar permissões e limpar arquivos desnecessários
   */
  afterCopy: async (buildPath, electronVersion, platform, arch, callback) => {
    console.log('\n🔧 Executando hooks pós-cópia...');
    console.log(`📂 Build path: ${buildPath}`);
    console.log(`💻 Platform: ${platform} (${arch})`);
    
    try {
      // Caminho do backend no build (extraResources)
      const backendPath = path.join(buildPath, '..', 'backend');
      
      if (!fs.existsSync(backendPath)) {
        console.warn('⚠️ Diretório backend não encontrado em:', backendPath);
        callback();
        return;
      }

      console.log('✅ Backend encontrado em:', backendPath);

      // 1. Limpar arquivos temporários e desnecessários
      await cleanTemporaryFiles(backendPath);

      // 2. Garantir que arduino-cli.exe tenha permissões corretas (Windows)
      await ensureExecutablePermissions(backendPath, platform);

      // 3. Validar estrutura de arquivos
      await validateBuildStructure(backendPath);

      // 4. Criar arquivo de versão/build info
      await createBuildInfo(backendPath);

      console.log('✅ Hooks pós-cópia concluídos com sucesso!\n');
      callback();

    } catch (error) {
      console.error('❌ Erro durante hooks pós-cópia:', error);
      callback(error);
    }
  }
};

/**
 * Remove arquivos temporários e desnecessários
 */
async function cleanTemporaryFiles(backendPath) {
  console.log('🧹 Limpando arquivos temporários...');

  const pathsToClean = [
    // Temporários do Arduino CLI
    path.join(backendPath, 'arduino-cli', 'config', 'tmp'),
    path.join(backendPath, 'arduino-cli', 'config', 'data', 'tmp'),
    path.join(backendPath, 'arduino-cli', 'config', 'downloads'),
    
    // Node modules do backend (não necessário em produção)
    path.join(backendPath, 'node_modules'),
    
    // Arquivos de sistema
    path.join(backendPath, '.DS_Store'),
    path.join(backendPath, 'Thumbs.db'),
    
    // Logs antigos
    path.join(backendPath, '*.log')
  ];

  for (const pathToClean of pathsToClean) {
    try {
      if (fs.existsSync(pathToClean)) {
        await fs.remove(pathToClean);
        console.log(`  ✓ Removido: ${path.basename(pathToClean)}`);
      }
    } catch (error) {
      console.warn(`  ⚠️ Não foi possível remover ${pathToClean}:`, error.message);
    }
  }
}

/**
 * Garante permissões de execução para Arduino CLI
 */
async function ensureExecutablePermissions(backendPath, platform) {
  console.log('🔐 Configurando permissões de execução...');

  const arduinoCliExe = path.join(backendPath, 'arduino-cli', 'arduino-cli.exe');

  if (fs.existsSync(arduinoCliExe)) {
    console.log(`  ✓ Arduino CLI encontrado: ${arduinoCliExe}`);
    
    // No Windows, geralmente não precisa chmod, mas vamos garantir que existe
    const stats = await fs.stat(arduinoCliExe);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  ✓ Tamanho: ${sizeInMB} MB`);
    
  } else {
    console.warn('  ⚠️ arduino-cli.exe NÃO encontrado!');
    throw new Error('Arduino CLI executable não encontrado no build!');
  }
}

/**
 * Valida a estrutura de arquivos essenciais
 */
async function validateBuildStructure(backendPath) {
  console.log('🔍 Validando estrutura do build...');

  const requiredPaths = [
    // Arquivos principais
    { path: 'server.js', type: 'file', critical: true },
    { path: 'config.js', type: 'file', critical: true },
    { path: 'auto-setup.js', type: 'file', critical: true },
    { path: 'package.json', type: 'file', critical: true },
    
    // Arduino CLI
    { path: 'arduino-cli/arduino-cli.exe', type: 'file', critical: true },
    { path: 'arduino-cli/arduino-cli.yaml', type: 'file', critical: false },
    
    // Cores ESP32
    { path: 'arduino-cli/config/data/packages/esp32', type: 'directory', critical: true },
    
    // Bibliotecas
    { path: 'arduino-cli/config/user/libraries', type: 'directory', critical: true }
  ];

  let hasErrors = false;

  for (const item of requiredPaths) {
    const fullPath = path.join(backendPath, item.path);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      const icon = item.type === 'directory' ? '📁' : '📄';
      console.log(`  ✓ ${icon} ${item.path}`);
    } else {
      const icon = item.critical ? '❌' : '⚠️';
      console.log(`  ${icon} FALTANDO: ${item.path}`);
      if (item.critical) {
        hasErrors = true;
      }
    }
  }

  // Validar bibliotecas instaladas
  const librariesPath = path.join(backendPath, 'arduino-cli/config/user/libraries');
  if (fs.existsSync(librariesPath)) {
    const libraries = fs.readdirSync(librariesPath);
    console.log(`  ✓ ${libraries.length} bibliotecas encontradas`);
    
    if (libraries.length < 5) {
      console.warn('  ⚠️ Poucas bibliotecas instaladas! Esperado pelo menos 9.');
    }
  }

  if (hasErrors) {
    throw new Error('Validação falhou: arquivos críticos faltando!');
  }

  console.log('  ✅ Estrutura validada com sucesso!');
}

/**
 * Cria arquivo com informações do build
 */
async function createBuildInfo(backendPath) {
  console.log('📝 Criando informações do build...');

  const buildInfo = {
    buildDate: new Date().toISOString(),
    version: require('./package.json').version,
    platform: 'win32',
    arch: 'x64',
    includesArduinoCLI: true,
    includesESP32Cores: true,
    includesLibraries: true,
    buildType: 'production'
  };

  const buildInfoPath = path.join(backendPath, 'build-info.json');
  await fs.writeJson(buildInfoPath, buildInfo, { spaces: 2 });
  
  console.log(`  ✓ Build info criado: ${buildInfoPath}`);
}

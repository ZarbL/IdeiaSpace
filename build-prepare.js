/**
 * Script de Preparação para Build
 * Executa limpeza e validações antes de criar o pacote de distribuição
 */

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class BuildPrepare {
  constructor() {
    this.rootDir = __dirname;
    this.backendDir = path.join(this.rootDir, 'backend');
  }

  async prepare() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     🚀 PREPARAÇÃO PARA BUILD - IDEIASPACE MISSION      ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    try {
      // 1. Validar que todas as dependências estão instaladas
      await this.validateDependencies();

      // 2. Validar que Arduino CLI está presente
      await this.validateArduinoCLI();

      // 3. Validar cores ESP32
      await this.validateESP32Cores();

      // 4. Validar bibliotecas
      await this.validateLibraries();

      // 5. Limpar pacotes ESP32 (remover symlinks e arquivos problemáticos)
      await this.cleanESP32Packages();

      // 6. Limpar arquivos temporários
      await this.cleanTemporaryFiles();

      // 7. Instalar dependências do backend (se necessário)
      await this.installBackendDependencies();

      // 8. Gerar manifesto de build
      await this.generateBuildManifest();

      console.log('\n╔══════════════════════════════════════════════════════════╗');
      console.log('║           ✅ PREPARAÇÃO CONCLUÍDA COM SUCESSO!         ║');
      console.log('╚══════════════════════════════════════════════════════════╝\n');
      console.log('💡 Agora você pode executar: npm run make\n');

    } catch (error) {
      console.error('\n❌ ERRO na preparação do build:', error.message);
      console.error('\nDetalhes:', error);
      process.exit(1);
    }
  }

  async validateDependencies() {
    console.log('📦 [1/7] Validando dependências do projeto...');
    
    const nodeModulesExists = fs.existsSync(path.join(this.rootDir, 'node_modules'));
    
    if (!nodeModulesExists) {
      console.log('  ⚠️ node_modules não encontrado, instalando...');
      await execAsync('npm install', { cwd: this.rootDir });
      console.log('  ✅ Dependências instaladas');
    } else {
      console.log('  ✅ Dependências OK');
    }
  }

  async validateArduinoCLI() {
    console.log('🔧 [2/7] Validando Arduino CLI...');
    
    const arduinoCliPath = path.join(this.backendDir, 'arduino-cli', 'arduino-cli.exe');
    
    if (!fs.existsSync(arduinoCliPath)) {
      console.error('  ❌ Arduino CLI não encontrado!');
      console.log('  💡 Execute: cd backend && npm run install-cli');
      throw new Error('Arduino CLI não instalado');
    }

    // Verificar tamanho do arquivo (deve ter pelo menos 10MB)
    const stats = fs.statSync(arduinoCliPath);
    const sizeInMB = stats.size / (1024 * 1024);

    if (sizeInMB < 10) {
      throw new Error('Arduino CLI parece corrompido (tamanho muito pequeno)');
    }

    console.log(`  ✅ Arduino CLI OK (${sizeInMB.toFixed(2)} MB)`);
  }

  async validateESP32Cores() {
    console.log('📡 [3/7] Validando cores ESP32...');
    
    const esp32CorePath = path.join(
      this.backendDir,
      'arduino-cli/config/data/packages/esp32/hardware/esp32'
    );

    if (!fs.existsSync(esp32CorePath)) {
      console.error('  ❌ Cores ESP32 não encontrados!');
      console.log('  💡 Execute: cd backend && npm run install-esp32');
      throw new Error('Cores ESP32 não instalados');
    }

    // Verificar versões instaladas
    const versions = fs.readdirSync(esp32CorePath)
      .filter(v => fs.statSync(path.join(esp32CorePath, v)).isDirectory());

    if (versions.length === 0) {
      throw new Error('Nenhuma versão do core ESP32 encontrada');
    }

    console.log(`  ✅ ESP32 Cores OK (${versions.length} versão/versões)`);
    versions.forEach(v => console.log(`     - ${v}`));
  }

  async validateLibraries() {
    console.log('📚 [4/7] Validando bibliotecas...');
    
    const librariesPath = path.join(
      this.backendDir,
      'config/user/libraries'
    );

    if (!fs.existsSync(librariesPath)) {
      console.error('  ❌ Diretório de bibliotecas não encontrado!');
      console.log('  💡 Execute: cd backend && npm run install-libraries');
      throw new Error('Bibliotecas não instaladas');
    }

    const libraries = fs.readdirSync(librariesPath)
      .filter(lib => fs.statSync(path.join(librariesPath, lib)).isDirectory());

    const requiredLibraries = [
      'Adafruit_MPU6050',
      'Adafruit_HMC5883_Unified',
      'BH1750',
      'DHT_sensor_library',
      'Adafruit_BMP085_Library',
      'Adafruit_Unified_Sensor',
      'Adafruit_BusIO',
      'Adafruit_GFX_Library',
      'Adafruit_SSD1306'
    ];

    const missingLibs = requiredLibraries.filter(req => 
      !libraries.some(lib => lib === req || lib.includes(req))
    );

    if (missingLibs.length > 0) {
      console.error('  ❌ Bibliotecas faltando:', missingLibs);
      console.log('  💡 Execute: cd backend && npm run install-libraries');
      throw new Error('Bibliotecas obrigatórias faltando');
    }

    console.log(`  ✅ ${libraries.length} bibliotecas instaladas`);
  }

  async cleanESP32Packages() {
    console.log('🔧 [5/8] Limpando pacotes ESP32 (removendo arquivos problemáticos)...');
    
    const ESP32Cleaner = require('./clean-esp32-packages');
    const cleaner = new ESP32Cleaner();
    
    try {
      await cleaner.clean();
      console.log('  ✅ Pacotes ESP32 limpos');
    } catch (err) {
      console.warn('  ⚠️  Aviso ao limpar ESP32:', err.message);
      // Não falha o build, apenas avisa
    }
  }

  async cleanTemporaryFiles() {
    console.log('🧹 [6/8] Limpando arquivos temporários...');
    
    const pathsToClean = [
      // Temporários do Arduino CLI
      path.join(this.backendDir, 'arduino-cli/config/tmp'),
      path.join(this.backendDir, 'arduino-cli/config/data/tmp'),
      path.join(this.backendDir, 'arduino-cli/config/downloads'),
      
      // Builds anteriores
      path.join(this.rootDir, 'out'),
      path.join(this.rootDir, 'dist'),
      
      // Logs
      path.join(this.backendDir, '*.log'),
      
      // Cache
      path.join(this.rootDir, '.cache')
    ];

    for (const pathToClean of pathsToClean) {
      try {
        if (fs.existsSync(pathToClean)) {
          await fs.remove(pathToClean);
          console.log(`  ✓ Removido: ${path.basename(pathToClean)}`);
        }
      } catch (error) {
        console.warn(`  ⚠️ Não foi possível remover ${pathToClean}`);
      }
    }

    console.log('  ✅ Limpeza concluída');
  }

  async installBackendDependencies() {
    console.log('📦 [7/8] Verificando dependências do backend...');
    
    const backendNodeModules = path.join(this.backendDir, 'node_modules');
    const backendPackageJson = path.join(this.backendDir, 'package.json');

    if (!fs.existsSync(backendPackageJson)) {
      console.log('  ⚠️ package.json do backend não encontrado, pulando...');
      return;
    }

    if (!fs.existsSync(backendNodeModules)) {
      console.log('  ⚠️ Instalando dependências do backend...');
      await execAsync('npm install', { cwd: this.backendDir });
      console.log('  ✅ Dependências do backend instaladas');
    } else {
      console.log('  ✅ Dependências do backend OK');
    }
  }

  async generateBuildManifest() {
    console.log('📝 [8/8] Gerando manifesto de build...');
    
    const packageJson = require('./package.json');
    
    const manifest = {
      name: packageJson.name,
      version: packageJson.version,
      buildDate: new Date().toISOString(),
      platform: 'win32',
      arch: 'x64',
      includes: {
        arduinoCLI: true,
        esp32Cores: true,
        libraries: true
      },
      buildType: 'production',
      userFriendly: true,
      offline: true
    };

    const manifestPath = path.join(this.rootDir, 'build-manifest.json');
    await fs.writeJson(manifestPath, manifest, { spaces: 2 });
    
    console.log('  ✅ Manifesto criado:', manifestPath);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const prepare = new BuildPrepare();
  prepare.prepare().catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = new BuildPrepare();

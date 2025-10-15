#!/usr/bin/env node

/**
 * Script de Auto-Setup do Backend IdeiaSpace
 * Configuração automática executada antes do start
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

class AutoSetup {
  constructor() {
    this.backendDir = __dirname;
  }

  async run() {
    console.log('🔧 Auto-setup do backend...');

    try {
      // SEMPRE validar e corrigir configurações primeiro
      await this.validateAndFixConfigs();
      
      // Verificar se já está configurado
      if (await this.isAlreadySetup()) {
        console.log('✅ Backend já configurado.');
        return;
      }

      // Auto-instalar dependências se necessário
      await this.autoInstallDependencies();
      
      // Auto-configurar Arduino CLI se necessário
      await this.autoSetupArduinoCLI();
      
      // Auto-instalar cores ESP32 se necessário
      await this.autoInstallEsp32Cores();
      
      console.log('✅ Auto-setup concluído.');
      
    } catch (error) {
      console.error('⚠️ Auto-setup falhou:', error.message);
      console.log('💡 Execute manualmente: npm run setup');
    }
  }

  async isAlreadySetup() {
    const nodeModulesExists = fs.existsSync(path.join(this.backendDir, 'node_modules'));
    const arduinoCliExists = fs.existsSync(path.join(this.backendDir, 'arduino-cli', 'arduino-cli.exe'));
    const esp32CoreExists = await this.checkESP32Core();
    
    return nodeModulesExists && arduinoCliExists && esp32CoreExists;
  }

  async checkESP32Core() {
    try {
      const cliPath = path.join(this.backendDir, 'arduino-cli', 'arduino-cli.exe');
      const configPath = path.join(this.backendDir, 'arduino-cli', 'arduino-cli.yaml');
      
      if (!fs.existsSync(cliPath)) return false;
      
      const command = `"${cliPath}" --config-file "${configPath}" core list`;
      const { stdout } = await execAsync(command, { timeout: 10000 });
      
      return stdout.includes('esp32:esp32') || stdout.includes('esp32');
    } catch (error) {
      return false;
    }
  }

  async autoInstallDependencies() {
    const nodeModulesPath = path.join(this.backendDir, 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('📦 Instalando dependências automaticamente...');
      
      try {
        await execAsync('npm install', { cwd: this.backendDir });
        console.log('✅ Dependências instaladas.');
      } catch (error) {
        throw new Error('Falha na instalação das dependências');
      }
    }
  }

  async autoSetupArduinoCLI() {
    // Detectar executável correto baseado no sistema operacional
    const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
    const arduinoCliPath = path.join(this.backendDir, 'arduino-cli', executable);
    
    if (!fs.existsSync(arduinoCliPath)) {
      console.log(`⚙️ Configurando Arduino CLI automaticamente para ${process.platform}...`);
      
      try {
        await execAsync('node install-arduino-cli.js', { cwd: this.backendDir });
        console.log('✅ Arduino CLI configurado.');
      } catch (error) {
        console.log('⚠️ Falha na configuração automática do Arduino CLI');
        console.log('💡 Execute: npm run install-cli');
      }
    }
    
    // Verificar e instalar ESP32 core se necessário
    await this.autoSetupESP32Core();
  }
  
  async autoSetupESP32Core() {
    const hasESP32 = await this.checkESP32Core();
    
    if (!hasESP32) {
      console.log('📱 ESP32 core não encontrado. Instalando...');
      
      try {
        await execAsync('node setup-esp32-core.js', { 
          cwd: this.backendDir,
          timeout: 600000 // 10 minutos timeout para download do ESP32
        });
        console.log('✅ ESP32 core instalado.');
      } catch (error) {
        console.log('⚠️ Falha na instalação automática do ESP32 core');
        console.log('💡 Execute manualmente: npm run install-esp32');
        console.log('   Erro:', error.message);
      }
    }
    
    // Verificar e instalar bibliotecas necessárias
    await this.autoSetupLibraries();
  }
  
  async autoSetupLibraries() {
    console.log('📚 Verificando bibliotecas dos sensores...');
    
    try {
      // Executar instalação de bibliotecas silenciosamente
      await execAsync('node setup-libraries.js', { 
        cwd: this.backendDir,
        timeout: 300000 // 5 minutos timeout
      });
      console.log('✅ Bibliotecas verificadas e instaladas.');
    } catch (error) {
      console.log('⚠️ Algumas bibliotecas podem não ter sido instaladas');
      console.log('💡 Execute manualmente: npm run install-libraries');
    }
  }
  
  async validateAndFixConfigs() {
    console.log('🔍 Validando arquivos de configuração...');
    
    const configFiles = [
      {
        path: path.join(this.backendDir, 'arduino-cli', 'arduino-cli.yaml'),
        type: 'yaml'
      },
      {
        path: path.join(this.backendDir, 'arduino-cli', 'config', 'arduino-cli.yaml'),
        type: 'json'
      }
    ];
    
    for (const configFile of configFiles) {
      if (fs.existsSync(configFile.path)) {
        try {
          const content = fs.readFileSync(configFile.path, 'utf-8');
          
          // Verificar se há caminhos absolutos hardcoded
          if (content.includes('C:\\Users\\') || content.includes('C:/Users/')) {
            console.log(`⚠️ Detectado caminho hardcoded em: ${configFile.path}`);
            console.log('🔧 Corrigindo configuração...');
            
            if (configFile.type === 'yaml') {
              // Corrigir YAML
              const yamlConfig = `board_manager:
    additional_urls:
        - https://espressif.github.io/arduino-esp32/package_esp32_index.json
        - https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_dev_index.json

directories:
    user: config/user
    data: config/data
    downloads: config/downloads

library:
    enable_unsafe_install: false

daemon:
    port: "50051"

logging:
    level: warn

sketch:
    always_export_binaries: false

build_cache:
    compilations_before_purge: 10
    ttl: 720h0m0s
`;
              fs.writeFileSync(configFile.path, yamlConfig, 'utf-8');
            } else {
              // Corrigir JSON
              const jsonConfig = {
                board_manager: {
                  additional_urls: [
                    'https://espressif.github.io/arduino-esp32/package_esp32_index.json',
                    'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_dev_index.json'
                  ]
                },
                daemon: { port: '50051' },
                directories: {
                  data: 'data',
                  downloads: 'downloads',
                  user: 'user'
                },
                library: { enable_unsafe_install: false },
                logging: { level: 'info', format: 'text' },
                metrics: { enabled: false },
                sketch: { always_export_binaries: false }
              };
              fs.writeFileSync(configFile.path, JSON.stringify(jsonConfig, null, 2), 'utf-8');
            }
            
            console.log(`✅ Configuração corrigida: ${configFile.path}`);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao validar ${configFile.path}: ${error.message}`);
        }
      }
    }
    
    // Garantir que diretórios necessários existam
    const requiredDirs = [
      path.join(this.backendDir, 'arduino-cli', 'config', 'data'),
      path.join(this.backendDir, 'arduino-cli', 'config', 'downloads'),
      path.join(this.backendDir, 'arduino-cli', 'config', 'user'),
      path.join(this.backendDir, 'arduino-cli', 'config', 'user', 'libraries')
    ];
    
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Diretório criado: ${path.relative(this.backendDir, dir)}`);
      }
    }
    
    console.log('✅ Validação de configuração concluída.');
  }

  async autoInstallEsp32Cores() {
    try {
      const ESP32CoreManager = require('./setup-esp32-core.js');
      const coreManager = new ESP32CoreManager();
      
      console.log('⚙️ Configurando cores ESP32 (únicos necessários)...');
      
      const success = await coreManager.setupESP32CoreOffline();
      
      if (success) {
        console.log('✅ Cores ESP32 configurados com sucesso.');
      } else {
        console.log('⚠️ Problema na configuração dos cores ESP32.');
        console.log('� Funcionalidade pode ser limitada até resolver.');
      }
      
    } catch (error) {
      console.log('⚠️ Erro ao configurar cores ESP32:', error.message);
      console.log('💡 Você pode tentar manualmente executando:');
      console.log('   arduino-cli core install esp32:esp32');
      console.log('💡 Ou através do botão "Iniciar Backend" na interface');
    }
  }

  async executeWithRetry(command, description, maxAttempts = 3, timeout = 60000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`   Tentativa ${attempt}/${maxAttempts}: ${description}...`);
        
        await execAsync(command, { 
          cwd: this.backendDir,
          timeout: timeout 
        });
        
        console.log(`   ✅ ${description} concluído!`);
        return;
        
      } catch (error) {
        console.log(`   ❌ Tentativa ${attempt} falhou: ${error.message}`);
        
        if (attempt === maxAttempts) {
          throw new Error(`${description} falhou após ${maxAttempts} tentativas: ${error.message}`);
        }
        
        // Aguardar antes da próxima tentativa
        console.log(`   ⏳ Aguardando 5 segundos antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}

// Executar auto-setup se chamado diretamente
if (require.main === module) {
  const autoSetup = new AutoSetup();
  autoSetup.run();
}

module.exports = AutoSetup;
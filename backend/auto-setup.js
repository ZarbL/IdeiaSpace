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
    
    // Detectar executável correto baseado no sistema operacional
    const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
    const arduinoCliExists = fs.existsSync(path.join(this.backendDir, 'arduino-cli', executable));
    
    // Verificar se os cores ESP32 estão instalados
    const esp32CoreInstalled = await this.checkEsp32CoreInstalled();
    
    return nodeModulesExists && arduinoCliExists && esp32CoreInstalled;
  }

  async checkEsp32CoreInstalled() {
    try {
      const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
      const cliPath = path.join(this.backendDir, 'arduino-cli', executable);
      const configPath = path.join(this.backendDir, 'arduino-cli', 'config', 'arduino-cli.yaml');
      
      if (!fs.existsSync(cliPath)) {
        return false;
      }

      // Verificar cores instalados
      const command = `"${cliPath}" --config-file "${configPath}" core list --format json`;
      const { stdout } = await execAsync(command);
      
      if (stdout && stdout.trim()) {
        try {
          const coreData = JSON.parse(stdout);
          
          // O formato real é { "platforms": [...] } ou { "platforms": null }
          if (coreData.platforms && Array.isArray(coreData.platforms)) {
            const esp32Core = coreData.platforms.find(core => 
              core.id && (core.id.includes('esp32') || core.id === 'esp32:esp32')
            );
            return !!esp32Core;
          } else {
            // Não há cores instalados (platforms é null ou vazio)
            return false;
          }
        } catch (parseError) {
          console.log('⚠️ Erro ao interpretar resposta dos cores:', parseError.message);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.log('⚠️ Não foi possível verificar cores ESP32:', error.message);
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
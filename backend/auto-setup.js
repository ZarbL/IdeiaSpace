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
    
    return nodeModulesExists && arduinoCliExists;
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
}

// Executar auto-setup se chamado diretamente
if (require.main === module) {
  const autoSetup = new AutoSetup();
  autoSetup.run();
}

module.exports = AutoSetup;
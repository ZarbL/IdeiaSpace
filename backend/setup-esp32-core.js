#!/usr/bin/env node

/**
 * Script para instalar ESP32 Core no Arduino CLI
 * Garante que o ESP32 esteja disponível para uploads
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

class ESP32CoreInstaller {
  constructor() {
    this.backendDir = __dirname;
    this.cliPath = path.join(this.backendDir, 'arduino-cli', 'arduino-cli.exe');
    this.configPath = path.join(this.backendDir, 'arduino-cli', 'arduino-cli.yaml');
  }

  async install() {
    console.log('🚀 Instalador de ESP32 Core');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Verificar se Arduino CLI existe
      if (!fs.existsSync(this.cliPath)) {
        throw new Error('❌ Arduino CLI não encontrado. Execute: npm run backend:setup');
      }

      // Verificar se ESP32 já está instalado
      console.log('🔍 Verificando cores instalados...');
      const isInstalled = await this.checkESP32Installed();
      
      if (isInstalled) {
        console.log('✅ ESP32 core já está instalado!');
        await this.showInstalledCores();
        return;
      }

      console.log('📥 ESP32 core não encontrado. Iniciando instalação...\n');

      // Atualizar índices
      console.log('🔄 [1/3] Atualizando índices de pacotes...');
      await this.updateIndex();
      console.log('✅ Índices atualizados!\n');

      // Instalar ESP32 core
      console.log('📦 [2/3] Instalando ESP32 core (isso pode demorar alguns minutos)...');
      console.log('⏳ Baixando ferramentas e compiladores ESP32...');
      await this.installESP32Core();
      console.log('✅ ESP32 core instalado!\n');

      // Verificar instalação
      console.log('🔍 [3/3] Verificando instalação...');
      const verified = await this.verifyInstallation();
      
      if (verified) {
        console.log('✅ Verificação completa!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 ESP32 Core instalado com sucesso!');
        console.log('📋 Cores disponíveis:');
        await this.showInstalledCores();
        console.log('\n💡 Agora você pode fazer upload para ESP32!');
      } else {
        throw new Error('Falha na verificação da instalação');
      }

    } catch (error) {
      console.error('\n❌ Erro durante instalação:', error.message);
      console.error('\n💡 Possíveis soluções:');
      console.error('   1. Verifique sua conexão com a internet');
      console.error('   2. Tente novamente (pode ser timeout)');
      console.error('   3. Execute: npm run backend:setup');
      process.exit(1);
    }
  }

  async checkESP32Installed() {
    try {
      const command = `"${this.cliPath}" --config-file "${this.configPath}" core list`;
      const { stdout } = await execAsync(command, { timeout: 30000 });
      
      // Procurar por esp32:esp32
      return stdout.includes('esp32:esp32') || stdout.includes('esp32');
    } catch (error) {
      return false;
    }
  }

  async updateIndex() {
    const command = `"${this.cliPath}" --config-file "${this.configPath}" core update-index`;
    
    try {
      const { stdout, stderr } = await execAsync(command, { 
        timeout: 120000, // 2 minutos
        maxBuffer: 1024 * 1024 * 50 // 50MB
      });
      
      if (stderr && !stderr.includes('Downloading') && !stderr.includes('Downloaded')) {
        console.log('⚠️ Avisos durante atualização:', stderr);
      }
      
      return true;
    } catch (error) {
      throw new Error(`Falha ao atualizar índices: ${error.message}`);
    }
  }

  async installESP32Core() {
    const command = `"${this.cliPath}" --config-file "${this.configPath}" core install esp32:esp32`;
    
    try {
      // Usar spawn para ver o progresso em tempo real
      const { spawn } = require('child_process');
      
      return new Promise((resolve, reject) => {
        const child = spawn(this.cliPath, [
          '--config-file', this.configPath,
          'core', 'install', 'esp32:esp32'
        ], {
          stdio: 'inherit' // Mostrar output em tempo real
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Instalação falhou com código ${code}`));
          }
        });

        child.on('error', (err) => {
          reject(new Error(`Erro ao executar comando: ${err.message}`));
        });
      });
      
    } catch (error) {
      throw new Error(`Falha ao instalar ESP32 core: ${error.message}`);
    }
  }

  async verifyInstallation() {
    try {
      const command = `"${this.cliPath}" --config-file "${this.configPath}" core list`;
      const { stdout } = await execAsync(command, { timeout: 30000 });
      
      return stdout.includes('esp32:esp32');
    } catch (error) {
      return false;
    }
  }

  async showInstalledCores() {
    try {
      const command = `"${this.cliPath}" --config-file "${this.configPath}" core list`;
      const { stdout } = await execAsync(command, { timeout: 30000 });
      
      const lines = stdout.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        if (line.includes('esp32')) {
          console.log('   📱 ' + line.trim());
        } else if (line.trim() && !line.includes('ID') && !line.includes('==')) {
          console.log('   📋 ' + line.trim());
        }
      });
    } catch (error) {
      console.log('   ⚠️ Não foi possível listar cores');
    }
  }
}

// Executar instalação se chamado diretamente
if (require.main === module) {
  const installer = new ESP32CoreInstaller();
  installer.install();
}

module.exports = ESP32CoreInstaller;

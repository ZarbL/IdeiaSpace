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
  constructor(logFunction = null) {
    this.backendDir = __dirname;
    // Detectar executável correto baseado na plataforma
    const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
    this.cliPath = path.join(this.backendDir, 'arduino-cli', executable);
    this.configPath = path.join(this.backendDir, 'arduino-cli', 'arduino-cli.yaml');
    this.log = logFunction || console.log; // Usar função customizada ou console.log
  }

  async install() {
    this.log('🚀 Instalador de ESP32 Core');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Verificar se Arduino CLI existe
      if (!fs.existsSync(this.cliPath)) {
        throw new Error('❌ Arduino CLI não encontrado. O auto-setup deve instalar automaticamente. Se o problema persistir, use o script PRIMEIRO-SETUP.bat');
      }

      // Verificar se ESP32 já está instalado
      this.log('🔍 Verificando cores instalados...');
      const isInstalled = await this.checkESP32Installed();
      
      if (isInstalled) {
        this.log('✅ ESP32 core já está instalado!');
        await this.showInstalledCores();
        return;
      }

      this.log('📥 ESP32 core não encontrado. Iniciando instalação...\n');

      // Atualizar índices
      this.log('🔄 [1/3] Atualizando índices de pacotes...');
      await this.updateIndex();
      this.log('✅ Índices atualizados!\n');

      // Instalar ESP32 core
      this.log('📦 [2/3] Instalando ESP32 core (isso pode demorar alguns minutos)...');
      this.log('⏳ Baixando ferramentas e compiladores ESP32...');
      await this.installESP32Core();
      this.log('✅ ESP32 core instalado!\n');

      // Verificar instalação
      this.log('🔍 [3/3] Verificando instalação...');
      const verified = await this.verifyInstallation();
      
      if (verified) {
        this.log('✅ Verificação completa!\n');
        this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.log('🎉 ESP32 Core instalado com sucesso!');
        this.log('📋 Cores disponíveis:');
        await this.showInstalledCores();
        this.log('\n💡 Agora você pode fazer upload para ESP32!');
      } else {
        throw new Error('Falha na verificação da instalação');
      }

    } catch (error) {
      this.log('\n❌ Erro durante instalação: ' + error.message);
      this.log('\n💡 Possíveis soluções:');
      this.log('   1. Verifique sua conexão com a internet');
      this.log('   2. Tente novamente (pode ser timeout)');
      this.log('   3. Use o script PRIMEIRO-SETUP.bat');
      throw error; // Re-lançar erro para auto-setup.js capturar
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
        this.log('⚠️ Avisos durante atualização: ' + stderr);
      }
      
      return true;
    } catch (error) {
      throw new Error(`Falha ao atualizar índices: ${error.message}`);
    }
  }

  async installESP32Core() {
    const command = `"${this.cliPath}" --config-file "${this.configPath}" core install esp32:esp32`;
    
    try {
      this.log('    ⬇️  Fazendo download dos pacotes ESP32...');
      this.log('    ⏱️  Tempo estimado: 3-5 minutos (dependendo da conexão)');
      this.log('    📦 Tamanho aproximado: 200-300 MB');
      this.log('');
      
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
            this.log('');
            this.log('    ✅ Download e instalação concluídos!');
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
          this.log('   📱 ' + line.trim());
        } else if (line.trim() && !line.includes('ID') && !line.includes('==')) {
          this.log('   📋 ' + line.trim());
        }
      });
    } catch (error) {
      this.log('   ⚠️ Não foi possível listar cores');
    }
  }
}

// Executar instalação se chamado diretamente
if (require.main === module) {
  const installer = new ESP32CoreInstaller();
  installer.install();
}

module.exports = ESP32CoreInstaller;

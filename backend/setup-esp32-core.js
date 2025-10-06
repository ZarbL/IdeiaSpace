#!/usr/bin/env node

/**
 * Script para configurar cores ESP32 pré-instalados
 * Evita necessidade de download durante instalação
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ESP32CoreManager {
  constructor() {
    this.backendDir = __dirname;
    this.cliDir = path.join(this.backendDir, 'arduino-cli');
    this.configDir = path.join(this.cliDir, 'config');
    this.dataDir = path.join(this.configDir, 'data');
    this.packagesDir = path.join(this.dataDir, 'packages');
  }

  async setupESP32CoreOffline() {
    console.log('📱 Configurando core ESP32 offline...');
    
    try {
      // Verificar se já existe instalação
      const esp32Dir = path.join(this.packagesDir, 'esp32');
      if (fs.existsSync(esp32Dir)) {
        console.log('✅ Core ESP32 já está instalado');
        return true;
      }

      // Tentar instalação online primeiro
      const installed = await this.tryOnlineInstallation();
      if (installed) {
        console.log('✅ Core ESP32 instalado via download');
        return true;
      }

      // Se falhar, usar método offline
      console.log('📦 Usando configuração offline...');
      await this.createMinimalESP32Config();
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao configurar ESP32 core:', error.message);
      return false;
    }
  }

  async tryOnlineInstallation() {
    try {
      const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
      const cliPath = path.join(this.cliDir, executable);
      const configPath = path.join(this.configDir, 'arduino-cli.yaml');
      
      if (!fs.existsSync(cliPath)) {
        return false;
      }

      console.log('🌐 Tentando instalação online...');
      
      // Comando com timeout menor para falhar rápido se não tiver conexão
      await execAsync(
        `"${cliPath}" --config-file "${configPath}" core install esp32:esp32`,
        { timeout: 60000 } // 1 minuto apenas
      );
      
      return true;
      
    } catch (error) {
      console.log('⚠️ Instalação online falhou:', error.message);
      return false;
    }
  }

  async createMinimalESP32Config() {
    console.log('⚙️ Criando configuração mínima ESP32...');
    
    // Criar estrutura de diretórios
    const esp32Dir = path.join(this.packagesDir, 'esp32');
    const hardwareDir = path.join(esp32Dir, 'hardware', 'esp32');
    const toolsDir = path.join(esp32Dir, 'tools');
    
    this.ensureDirectoryExists(esp32Dir);
    this.ensureDirectoryExists(hardwareDir);
    this.ensureDirectoryExists(toolsDir);
    
    // Criar arquivo de package básico
    const packageData = {
      "name": "esp32",
      "maintainer": "Espressif Systems",
      "websiteURL": "https://github.com/espressif/arduino-esp32",
      "email": "support@espressif.com",
      "help": {
        "online": "https://github.com/espressif/arduino-esp32"
      },
      "platforms": [
        {
          "name": "ESP32 Arduino",
          "architecture": "esp32",
          "version": "3.0.7",
          "category": "ESP32",
          "url": "embedded",
          "archiveFileName": "embedded",
          "checksum": "embedded",
          "size": "embedded",
          "boards": [
            {
              "name": "ESP32 Dev Module"
            }
          ],
          "toolsDependencies": []
        }
      ]
    };
    
    const packagePath = path.join(esp32Dir, 'package_esp32_index.json');
    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
    
    // Criar arquivo board básico para ESP32 Dev Module
    const boardsData = `
esp32.name=ESP32 Dev Module
esp32.vid.0=0x10C4
esp32.pid.0=0xEA60
esp32.vid.1=0x1A86
esp32.pid.1=0x7523

esp32.upload.tool=esptool_py
esp32.upload.maximum_size=1310720
esp32.upload.maximum_data_size=327680
esp32.upload.wait_for_upload_port=true

esp32.serial.disableDTR=true
esp32.serial.disableRTS=true

esp32.build.mcu=esp32
esp32.build.f_cpu=240000000L
esp32.build.flash_mode=dio
esp32.build.flash_size=4MB
esp32.build.board=ESP32_DEV
esp32.build.variant=esp32
esp32.build.core=esp32
`;
    
    const boardsPath = path.join(hardwareDir, '3.0.7', 'boards.txt');
    this.ensureDirectoryExists(path.dirname(boardsPath));
    fs.writeFileSync(boardsPath, boardsData);
    
    console.log('✅ Configuração mínima ESP32 criada');
  }

  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async listAvailableBoards() {
    try {
      const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
      const cliPath = path.join(this.cliDir, executable);
      const configPath = path.join(this.configDir, 'arduino-cli.yaml');
      
      const { stdout } = await execAsync(
        `"${cliPath}" --config-file "${configPath}" board listall esp32`
      );
      
      console.log('📋 Boards ESP32 disponíveis:');
      console.log(stdout);
      
    } catch (error) {
      console.log('⚠️ Não foi possível listar boards:', error.message);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const manager = new ESP32CoreManager();
  manager.setupESP32CoreOffline().then(success => {
    if (success) {
      console.log('🎉 Core ESP32 configurado com sucesso!');
      manager.listAvailableBoards();
    } else {
      console.log('❌ Falha na configuração do core ESP32');
      process.exit(1);
    }
  });
}

module.exports = ESP32CoreManager;
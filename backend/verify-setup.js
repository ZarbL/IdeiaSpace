#!/usr/bin/env node

/**
 * Script de verificação completa do setup
 * Mostra o status de todos os componentes
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

class SetupVerifier {
  constructor() {
    this.backendDir = __dirname;
    // Detectar executável correto baseado na plataforma
    const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
    this.cliPath = path.join(this.backendDir, 'arduino-cli', executable);
    this.configPath = path.join(this.backendDir, 'arduino-cli', 'arduino-cli.yaml');
  }

  async verify() {
    console.log('🔍 VERIFICAÇÃO COMPLETA DO SETUP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    let allOk = true;

    // 1. Verificar Arduino CLI
    console.log('📦 [1/5] Arduino CLI');
    if (fs.existsSync(this.cliPath)) {
      try {
        const { stdout } = await execAsync(`"${this.cliPath}" version`, { timeout: 5000 });
        const version = stdout.trim().split('\n')[0];
        console.log(`   ✅ Instalado: ${version}\n`);
      } catch (error) {
        console.log('   ⚠️ Instalado mas com erro\n');
        allOk = false;
      }
    } else {
      console.log('   ❌ NÃO INSTALADO');
      console.log('   💡 Use o script PRIMEIRO-SETUP.bat ou reinicie o backend para auto-setup\n');
      allOk = false;
    }

    // 2. Verificar ESP32 Core
    console.log('📱 [2/5] ESP32 Core');
    try {
      const { stdout } = await execAsync(`"${this.cliPath}" --config-file "${this.configPath}" core list`, { timeout: 10000 });
      
      if (stdout.includes('esp32:esp32')) {
        const match = stdout.match(/esp32:esp32\s+([\d.]+)/);
        const version = match ? match[1] : 'instalado';
        console.log(`   ✅ ESP32 Core ${version} instalado\n`);
      } else {
        console.log('   ❌ NÃO INSTALADO');
        console.log('   💡 Use o script PRIMEIRO-SETUP.bat ou aguarde o auto-setup na próxima inicialização\n');
        allOk = false;
      }
    } catch (error) {
      console.log('   ❌ Erro ao verificar');
      console.log('   💡 Use o script PRIMEIRO-SETUP.bat ou aguarde o auto-setup na próxima inicialização\n');
      allOk = false;
    }

    // 3. Verificar Bibliotecas
    console.log('📚 [3/5] Bibliotecas');
    try {
      const { stdout } = await execAsync(`"${this.cliPath}" --config-file "${this.configPath}" lib list`, { timeout: 10000 });
      
      const requiredLibs = [
        'Adafruit MPU6050',
        'Adafruit BMP085',
        'Adafruit HMC5883',
        'BH1750',
        'DHT sensor library',
        'Adafruit SSD1306',
        'Adafruit GFX',
        'Adafruit BusIO',
        'Adafruit Unified Sensor'
      ];

      let installedCount = 0;
      requiredLibs.forEach(lib => {
        if (stdout.toLowerCase().includes(lib.toLowerCase())) {
          installedCount++;
        }
      });

      if (installedCount === requiredLibs.length) {
        console.log(`   ✅ Todas as ${requiredLibs.length} bibliotecas instaladas\n`);
      } else if (installedCount > 0) {
        console.log(`   ⚠️ ${installedCount}/${requiredLibs.length} bibliotecas instaladas`);
        console.log('   💡 Use o script PRIMEIRO-SETUP.bat ou aguarde o auto-setup completar\n');
        allOk = false;
      } else {
        console.log(`   ❌ Nenhuma biblioteca instalada`);
        console.log('   💡 Use o script PRIMEIRO-SETUP.bat ou aguarde o auto-setup completar\n');
        allOk = false;
      }
    } catch (error) {
      console.log('   ⚠️ Erro ao verificar bibliotecas\n');
    }

    // 4. Verificar Portas COM
    console.log('🔌 [4/5] Portas Seriais');
    try {
      const { stdout } = await execAsync(`"${this.cliPath}" --config-file "${this.configPath}" board list`, { timeout: 10000 });
      
      const ports = stdout.split('\n').filter(line => line.includes('COM') || line.includes('/dev/tty'));
      
      if (ports.length > 0) {
        console.log(`   ✅ ${ports.length} porta(s) disponível(is):`);
        ports.forEach((port, i) => {
          if (port.trim() && i < 5) { // Mostrar no máximo 5 portas
            const match = port.match(/(COM\d+|\/dev\/tty\w+)/);
            if (match) {
              console.log(`      • ${match[1]}`);
            }
          }
        });
        console.log('');
      } else {
        console.log('   ⚠️ Nenhuma porta detectada');
        console.log('   💡 Conecte um dispositivo USB\n');
      }
    } catch (error) {
      console.log('   ⚠️ Erro ao listar portas\n');
    }

    // 5. Verificar Configuração
    console.log('⚙️ [5/5] Arquivos de Configuração');
    const configFiles = [
      { path: this.configPath, name: 'arduino-cli.yaml' },
      { path: path.join(this.backendDir, 'arduino-cli', 'config', 'arduino-cli.yaml'), name: 'config/arduino-cli.yaml' }
    ];

    let configOk = true;
    configFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        const content = fs.readFileSync(file.path, 'utf-8');
        // Verificar se tem caminhos hardcoded
        if (content.includes('C:\\Users\\') || content.includes('/Users/')) {
          console.log(`   ⚠️ ${file.name} - Caminho hardcoded detectado`);
          configOk = false;
          allOk = false;
        }
      }
    });

    if (configOk) {
      console.log('   ✅ Todos os arquivos corretos\n');
    } else {
      console.log('   💡 Execute: node auto-setup.js\n');
    }

    // Resumo Final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (allOk) {
      console.log('🎉 TUDO OK! Sistema pronto para uso!');
      console.log('💡 Você pode iniciar o backend pelo aplicativo');
    } else {
      console.log('⚠️ Alguns componentes precisam de atenção');
      console.log('💡 Use o script PRIMEIRO-SETUP.bat ou aguarde o auto-setup automático');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}

// Executar verificação se chamado diretamente
if (require.main === module) {
  const verifier = new SetupVerifier();
  verifier.verify().catch(console.error);
}

module.exports = SetupVerifier;

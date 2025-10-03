#!/usr/bin/env node

/**
 * Diagnóstico Avançado de ESP32 - IdeiaSpace
 * Detecta problemas comuns com ESP32 no macOS
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

class ESP32Diagnostic {
  constructor() {
    this.platform = process.platform;
    this.arch = process.arch;
  }

  async run() {
    console.log('🔬 Diagnóstico Avançado ESP32 - IdeiaSpace');
    console.log('=====================================\n');
    
    console.log(`💻 Sistema: ${this.platform} ${this.arch}\n`);

    try {
      await this.checkUSBDevices();
      await this.checkSerialPorts();
      await this.checkDrivers();
      await this.checkESP32Specific();
      await this.provideSolutions();
      
    } catch (error) {
      console.error('❌ Erro durante diagnóstico:', error.message);
    }
  }

  async checkUSBDevices() {
    console.log('🔌 1. Verificando Dispositivos USB...');
    
    try {
      const { stdout } = await execAsync('system_profiler SPUSBDataType');
      
      // Procurar por chips comuns da ESP32
      const esp32Chips = [
        'CP210', 'CP2102', 'CP2104', 'Silicon Labs',
        'CH340', 'CH341', 'QinHeng',
        'FTDI', 'FT232', 'Future Technology',
        'Espressif', 'ESP32', 'ESP8266'
      ];
      
      const foundChips = [];
      for (const chip of esp32Chips) {
        if (stdout.toLowerCase().includes(chip.toLowerCase())) {
          foundChips.push(chip);
        }
      }
      
      if (foundChips.length > 0) {
        console.log(`   ✅ Chips ESP32 detectados: ${foundChips.join(', ')}`);
      } else {
        console.log('   ❌ Nenhum chip ESP32 comum detectado');
        console.log('   💡 Verifique se a ESP32 está conectada via USB');
      }
      
      // Verificar dispositivos desconhecidos
      const unknownDevices = stdout.match(/Product ID: 0x[0-9a-fA-F]{4}[\s\S]*?Vendor ID: 0x[0-9a-fA-F]{4}/g);
      if (unknownDevices) {
        console.log('   🔍 Dispositivos USB encontrados:');
        unknownDevices.forEach((device, index) => {
          const productMatch = device.match(/Product ID: (0x[0-9a-fA-F]{4})/);
          const vendorMatch = device.match(/Vendor ID: (0x[0-9a-fA-F]{4})/);
          if (productMatch && vendorMatch) {
            console.log(`      ${index + 1}. Vendor: ${vendorMatch[1]}, Product: ${productMatch[1]}`);
          }
        });
      }
      
    } catch (error) {
      console.log('   ❌ Erro ao verificar dispositivos USB');
    }
  }

  async checkSerialPorts() {
    console.log('\n📡 2. Verificando Portas Seriais...');
    
    try {
      // Verificar portas /dev/cu.*
      const { stdout: cuPorts } = await execAsync('ls /dev/cu.* 2>/dev/null || echo "Nenhuma"');
      console.log('   📋 Portas /dev/cu.*:');
      cuPorts.split('\n').filter(p => p.trim()).forEach(port => {
        const portName = port.trim();
        if (portName !== 'Nenhuma') {
          console.log(`      ${portName}`);
        }
      });
      
      // Verificar portas /dev/tty.*
      const { stdout: ttyPorts } = await execAsync('ls /dev/tty.* 2>/dev/null || echo "Nenhuma"');
      console.log('   📋 Portas /dev/tty.*:');
      ttyPorts.split('\n').filter(p => p.trim()).forEach(port => {
        const portName = port.trim();
        if (portName !== 'Nenhuma') {
          console.log(`      ${portName}`);
        }
      });
      
      // Verificar padrões comuns da ESP32
      const esp32Patterns = [
        'usbserial', 'SLAB_USBtoUART', 'wchusbserial',
        'usbmodem', 'ttyUSB', 'cu.wch'
      ];
      
      const allPorts = cuPorts + '\n' + ttyPorts;
      const foundESP32Ports = [];
      
      for (const pattern of esp32Patterns) {
        if (allPorts.toLowerCase().includes(pattern.toLowerCase())) {
          foundESP32Ports.push(pattern);
        }
      }
      
      if (foundESP32Ports.length > 0) {
        console.log(`   ✅ Padrões ESP32 encontrados: ${foundESP32Ports.join(', ')}`);
      } else {
        console.log('   ❌ Nenhuma porta ESP32 típica encontrada');
      }
      
    } catch (error) {
      console.log('   ❌ Erro ao verificar portas seriais');
    }
  }

  async checkDrivers() {
    console.log('\n🚗 3. Verificando Drivers USB-Serial...');
    
    try {
      // Verificar kexts (drivers) carregados
      const { stdout } = await execAsync('kextstat | grep -i "usb\\|serial\\|slab\\|prolific\\|ftdi"');
      
      if (stdout.trim()) {
        console.log('   ✅ Drivers USB-Serial carregados:');
        stdout.split('\n').filter(line => line.trim()).forEach(line => {
          const match = line.match(/com\.[^\\s]+/);
          if (match) {
            console.log(`      ${match[0]}`);
          }
        });
      } else {
        console.log('   ❌ Nenhum driver USB-Serial detectado');
        console.log('   💡 Pode ser necessário instalar drivers');
      }
      
    } catch (error) {
      console.log('   ⚠️ Não foi possível verificar drivers carregados');
    }
  }

  async checkESP32Specific() {
    console.log('\n🔍 4. Testes Específicos ESP32...');
    
    // Teste com Arduino CLI
    try {
      const cliPath = path.join(__dirname, 'arduino-cli', process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli');
      
      if (fs.existsSync(cliPath)) {
        console.log('   🔧 Testando detecção via Arduino CLI...');
        const { stdout } = await execAsync(`"${cliPath}" board list --format json`);
        const boards = JSON.parse(stdout);
        
        if (boards.length > 0) {
          console.log('   📋 Placas detectadas pelo Arduino CLI:');
          boards.forEach(board => {
            console.log(`      ${board.address} - ${board.protocol || 'Desconhecido'}`);
            if (board.boards && board.boards.length > 0) {
              board.boards.forEach(b => {
                console.log(`         └─ ${b.name || 'Placa desconhecida'}`);
              });
            }
          });
        } else {
          console.log('   ❌ Nenhuma placa detectada pelo Arduino CLI');
        }
      } else {
        console.log('   ❌ Arduino CLI não encontrado');
      }
      
    } catch (error) {
      console.log('   ❌ Erro ao testar Arduino CLI:', error.message);
    }
  }

  async provideSolutions() {
    console.log('\n💡 5. Soluções Recomendadas...');
    console.log('=====================================');
    
    console.log('\n🔧 Se a ESP32 não foi detectada:');
    console.log('   1. Verifique se o cabo USB funciona para transferência de dados (não apenas energia)');
    console.log('   2. Conecte a ESP32 em uma porta USB diferente');
    console.log('   3. Pressione o botão RESET na ESP32 após conectar');
    
    console.log('\n🚗 Para instalar drivers no macOS:');
    console.log('   • CP210x (Silicon Labs): https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers');
    console.log('   • CH340/CH341: https://github.com/adrianmihalko/ch340g-ch341-osx-plx');
    console.log('   • FTDI: https://ftdichip.com/drivers/vcp-drivers/');
    
    console.log('\n🔄 Reinicialização recomendada:');
    console.log('   1. Desconecte a ESP32');
    console.log('   2. Reinicie o computador (se instalou drivers)');
    console.log('   3. Reconecte a ESP32');
    console.log('   4. Execute este diagnóstico novamente');
    
    console.log('\n🧪 Testes adicionais:');
    console.log('   • Arduino IDE: Pode detectar a placa onde o Arduino CLI falha');
    console.log('   • PlatformIO: Alternativa ao Arduino IDE');
    console.log('   • Comando: ls /dev/cu.* (após conectar/desconectar para ver diferenças)');
    
    console.log('\n📱 Modelos ESP32 comuns e seus chips:');
    console.log('   • ESP32 DevKit: CP2102 (Silicon Labs)');
    console.log('   • ESP32 WROOM: CH340G');
    console.log('   • ESP32-CAM: FTDI ou CH340');
    console.log('   • NodeMCU ESP32: CP2102 ou CH340');
  }
}

// Executar diagnóstico se chamado diretamente
if (require.main === module) {
  const diagnostic = new ESP32Diagnostic();
  diagnostic.run();
}

module.exports = ESP32Diagnostic;
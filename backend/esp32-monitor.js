#!/usr/bin/env node

/**
 * Monitor de Conexão ESP32 - IdeiaSpace
 * Monitora em tempo real a conexão/desconexão de dispositivos USB
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ESP32Monitor {
  constructor() {
    this.previousPorts = new Set();
    this.isMonitoring = false;
    this.interval = null;
    this.onDeviceConnected = null; // Callback para dispositivo conectado
    this.onDeviceDisconnected = null; // Callback para dispositivo desconectado
    this.verboseMode = false; // Modo silencioso por padrão quando integrado
  }

  async start(verbose = false) {
    this.verboseMode = verbose;
    
    if (this.verboseMode) {
      console.log('🔍 Monitor ESP32 - IdeiaSpace');
      console.log('============================');
      console.log('📡 Monitorando conexões USB em tempo real...');
      console.log('💡 Conecte sua ESP32 agora para detectar automaticamente');
      console.log('⌨️  Pressione Ctrl+C para parar\n');
    } else {
      console.log('📡 Monitor ESP32 ativo em background...');
    }

    // Capturar estado inicial
    await this.updatePortList();
    
    this.isMonitoring = true;
    this.interval = setInterval(() => {
      this.checkForChanges();
    }, 1000); // Verificar a cada segundo

    // Configurar graceful shutdown
    process.on('SIGINT', () => {
      this.stop();
    });
  }

  async stop() {
    console.log('\n🛑 Parando monitor...');
    this.isMonitoring = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
    process.exit(0);
  }

  async updatePortList() {
    try {
      const { stdout } = await execAsync('ls /dev/cu.* /dev/tty.* 2>/dev/null || echo ""');
      const currentPorts = new Set(
        stdout.split('\n')
          .filter(port => port.trim() && !port.includes('Bluetooth') && !port.includes('debug-console'))
          .map(port => port.trim())
      );
      
      return currentPorts;
    } catch (error) {
      return new Set();
    }
  }

  async checkForChanges() {
    if (!this.isMonitoring) return;

    try {
      const currentPorts = await this.updatePortList();
      
      // Detectar novas portas (dispositivos conectados)
      const newPorts = [...currentPorts].filter(port => !this.previousPorts.has(port));
      const removedPorts = [...this.previousPorts].filter(port => !currentPorts.has(port));
      
      if (newPorts.length > 0) {
        if (this.verboseMode) {
          console.log(`🔌 Dispositivo conectado detectado!`);
        }
        for (const port of newPorts) {
          if (this.verboseMode) {
            console.log(`   ✅ Nova porta: ${port}`);
          }
          const deviceInfo = await this.analyzePort(port);
          
          // Chamar callback se definido
          if (this.onDeviceConnected) {
            this.onDeviceConnected({ port, ...deviceInfo });
          }
        }
        await this.testWithArduinoCLI();
      }
      
      if (removedPorts.length > 0) {
        if (this.verboseMode) {
          console.log(`🔌 Dispositivo desconectado detectado!`);
        }
        for (const port of removedPorts) {
          if (this.verboseMode) {
            console.log(`   ❌ Porta removida: ${port}`);
          }
          
          // Chamar callback se definido
          if (this.onDeviceDisconnected) {
            this.onDeviceDisconnected({ port });
          }
        }
      }
      
      this.previousPorts = currentPorts;
      
    } catch (error) {
      // Silenciar erros para não poluir o output
    }
  }

  async analyzePort(port) {
    try {
      // Tentar identificar o tipo de dispositivo
      const portName = port.toLowerCase();
      let deviceType = 'generic';
      
      if (portName.includes('usbserial') || portName.includes('slab')) {
        deviceType = 'CP210x';
        if (this.verboseMode) console.log(`   🔍 Tipo detectado: CP210x (Silicon Labs)`);
      } else if (portName.includes('wchusbserial') || portName.includes('wch')) {
        deviceType = 'CH340';
        if (this.verboseMode) console.log(`   🔍 Tipo detectado: CH340/CH341`);
      } else if (portName.includes('usbmodem')) {
        deviceType = 'usbmodem';
        if (this.verboseMode) console.log(`   🔍 Tipo detectado: Possível ESP32 ou Arduino`);
      } else {
        if (this.verboseMode) console.log(`   🔍 Tipo detectado: Dispositivo serial genérico`);
      }
      
      if (this.verboseMode) {
        console.log(`   🧪 Testando comunicação em ${port}...`);
      }
      
      return { deviceType, isESP32Compatible: ['CP210x', 'CH340', 'usbmodem'].includes(deviceType) };
      
    } catch (error) {
      if (this.verboseMode) {
        console.log(`   ⚠️ Erro ao analisar porta: ${error.message}`);
      }
      return { deviceType: 'unknown', isESP32Compatible: false };
    }
  }

  async testWithArduinoCLI() {
    try {
      const cliPath = process.platform === 'win32' ? 
        './arduino-cli/arduino-cli.exe' : 
        './arduino-cli/arduino-cli';
      
      console.log('   🔧 Testando com Arduino CLI...');
      const { stdout } = await execAsync(`"${cliPath}" board list --format json`);
      const boards = JSON.parse(stdout);
      
      if (boards.length > 0) {
        console.log('   🎉 SUCESSO! Placas detectadas:');
        boards.forEach(board => {
          console.log(`      📍 ${board.address}`);
          if (board.boards && board.boards.length > 0) {
            board.boards.forEach(b => {
              console.log(`         └─ ${b.name || 'Placa ESP32'} (${b.fqbn || 'esp32:esp32:esp32'})`);
            });
          }
        });
        console.log('   💡 Agora você pode usar esta porta no IdeiaSpace!');
      } else {
        console.log('   ⚠️ Arduino CLI ainda não detectou placas');
      }
      
    } catch (error) {
      console.log('   ❌ Erro ao testar Arduino CLI');
    }
  }

  async showCurrentStatus() {
    console.log('\n📊 Status atual das portas:');
    const ports = await this.updatePortList();
    
    if (ports.size === 0) {
      console.log('   ❌ Nenhuma porta serial detectada');
    } else {
      console.log(`   📡 ${ports.size} porta(s) detectada(s):`);
      ports.forEach(port => {
        console.log(`      ${port}`);
      });
    }
  }
}

// Executar monitor se chamado diretamente
if (require.main === module) {
  const monitor = new ESP32Monitor();
  monitor.start();
}

module.exports = ESP32Monitor;
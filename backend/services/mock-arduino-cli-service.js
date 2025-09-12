/**
 * Mock do Arduino CLI Service para testes
 * Remove dependência do binário para desenvolvimento
 */

const path = require('path');
const fs = require('fs');

class MockArduinoCLIService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    console.log('🚀 Mock Arduino CLI Service inicializado (modo desenvolvimento)');
    this.isInitialized = true;
  }

  async executeCommand(command, options = {}) {
    console.log(`🔧 Mock executando: ${command}`);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      output: `Mock output for: ${command}`,
      error: null
    };
  }

  async listPorts() {
    return {
      ports: [
        {
          address: 'COM3',
          protocol: 'serial',
          protocolLabel: 'Serial Port',
          boards: [{ name: 'ESP32', fqbn: 'esp32:esp32:esp32' }],
          serialNumber: 'MOCK123',
          vid: '0x1234',
          pid: '0x5678'
        },
        {
          address: 'COM4',
          protocol: 'serial',
          protocolLabel: 'Serial Port',
          boards: [{ name: 'Arduino Uno', fqbn: 'arduino:avr:uno' }],
          serialNumber: 'MOCK456',
          vid: '0x2341',
          pid: '0x0043'
        }
      ],
      error: null
    };
  }

  async compileSketch(code, board = 'esp32:esp32:esp32', options = {}) {
    console.log(`🔨 Mock compilando para ${board}`);
    
    // Simular compilação
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (code.includes('error')) {
      return {
        success: false,
        message: 'Erro na compilação (mock)',
        error: 'Erro simulado: sintaxe inválida',
        output: 'Mock compilation failed'
      };
    }
    
    return {
      success: true,
      message: 'Compilação bem-sucedida! (mock)',
      output: 'Mock compilation successful\nSketch uses 234567 bytes (18%) of program storage space.',
      binPath: null
    };
  }

  async uploadSketch(code, port, board = 'esp32:esp32:esp32', options = {}) {
    console.log(`📤 Mock upload para ${port} (${board})`);
    
    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (port === 'COM999') {
      return {
        success: false,
        message: 'Erro no upload (mock)',
        error: 'Porta não encontrada (mock)',
        output: 'Mock upload failed - port not found'
      };
    }
    
    return {
      success: true,
      message: 'Upload realizado com sucesso! (mock)',
      output: 'Mock upload successful\nConnecting...\nUploading...\nDone!'
    };
  }

  async listBoards() {
    return {
      boards: [
        {
          name: 'ESP32 Dev Module',
          fqbn: 'esp32:esp32:esp32',
          platform: 'ESP32 Arduino',
          architectures: ['xtensa']
        },
        {
          name: 'Arduino Uno',
          fqbn: 'arduino:avr:uno',
          platform: 'Arduino AVR Boards',
          architectures: ['avr']
        },
        {
          name: 'Arduino Mega',
          fqbn: 'arduino:avr:mega',
          platform: 'Arduino AVR Boards',
          architectures: ['avr']
        }
      ],
      error: null
    };
  }

  async installLibrary(libraryName, version = null) {
    console.log(`📚 Mock instalando biblioteca: ${libraryName}${version ? `@${version}` : ''}`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      message: `Biblioteca ${libraryName} instalada com sucesso! (mock)`,
      output: `Mock library installation for ${libraryName}`,
      error: null
    };
  }

  async listInstalledLibraries() {
    return {
      libraries: [
        {
          name: 'WiFi',
          version: '1.0.0',
          author: 'Arduino',
          sentence: 'WiFi library for ESP32',
          location: '/mock/path/WiFi'
        },
        {
          name: 'ArduinoJson',
          version: '6.19.4',
          author: 'Benoit Blanchon',
          sentence: 'JSON library for Arduino',
          location: '/mock/path/ArduinoJson'
        }
      ],
      error: null
    };
  }

  async updateIndexes() {
    console.log('🔄 Mock atualizando índices...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: 'Índices atualizados (mock)',
      coreOutput: 'Mock core index updated',
      libOutput: 'Mock library index updated',
      error: null
    };
  }

  cleanupTempDir(tempDir) {
    console.log(`🧹 Mock limpeza do diretório: ${tempDir}`);
  }

  async healthCheck() {
    return {
      success: true,
      version: 'arduino-cli 0.34.2 (mock)',
      error: null
    };
  }
}

module.exports = MockArduinoCLIService;
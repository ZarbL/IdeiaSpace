/**
 * Configuração Centralizada do Backend
 * Remove valores hardcoded e centraliza configurações
 */

const path = require('path');
const os = require('os');

class AppConfig {
  constructor() {
    this.platform = process.platform;
    this.isWindows = this.platform === 'win32';
    this.isMac = this.platform === 'darwin';
    this.isLinux = this.platform === 'linux';
    
    // Detectar se está rodando em ambiente empacotado (produção)
    this.isPackaged = this.detectPackaged();
  }

  /**
   * Detecta se a aplicação está empacotada (Electron)
   */
  detectPackaged() {
    // Em produção, process.resourcesPath existe e é diferente de process.cwd()
    if (process.resourcesPath) {
      const isDefaultPath = process.resourcesPath.includes('node_modules');
      return !isDefaultPath;
    }
    return false;
  }

  /**
   * Obtém o diretório raiz do backend
   * Em desenvolvimento: usa __dirname
   * Em produção: usa process.resourcesPath/backend
   */
  getBackendDir() {
    if (this.isPackaged && process.resourcesPath) {
      // Em produção, backend está em resources/backend
      return path.join(process.resourcesPath, 'backend');
    }
    // Em desenvolvimento
    return __dirname;
  }

  /**
   * Configurações de Rede
   */
  getNetworkConfig() {
    return {
      httpPort: process.env.PORT || 3001,
      wsPort: process.env.WS_PORT || 8080,
      host: process.env.HOST || 'localhost'
    };
  }

  /**
   * URLs completas para uso
   */
  getUrls() {
    const { httpPort, wsPort, host } = this.getNetworkConfig();
    return {
      http: `http://${host}:${httpPort}`,
      ws: `ws://${host}:${wsPort}`,
      httpPort,
      wsPort,
      host
    };
  }

  /**
   * Caminhos do Arduino CLI baseado na plataforma
   * ATUALIZADO: Suporta ambiente empacotado
   */
  getArduinoCLIPaths() {
    const backendDir = this.getBackendDir(); // Usa método que detecta ambiente
    // Detectar executável correto baseado na plataforma
    const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
    
    const arduinoCliBase = path.join(backendDir, 'arduino-cli');
    
    return {
      executable: executable,
      cliPath: path.join(arduinoCliBase, executable),
      
      // Configuração principal
      configPath: path.join(arduinoCliBase, 'arduino-cli.yaml'),
      altConfigPath: path.join(arduinoCliBase, 'config', 'arduino-cli.yaml'),
      
      // Diretórios de dados (onde ficam os cores instalados)
      dataDir: path.join(arduinoCliBase, 'config', 'data'),
      downloadsDir: path.join(arduinoCliBase, 'config', 'downloads'),
      userDir: path.join(arduinoCliBase, 'config', 'user'),
      
      // Diretórios específicos para verificação
      packagesDir: path.join(arduinoCliBase, 'config', 'data', 'packages'),
      librariesDir: path.join(arduinoCliBase, 'config', 'user', 'libraries'),
      
      // Path específico do ESP32 para detecção rápida
      esp32CorePath: path.join(arduinoCliBase, 'config', 'data', 'packages', 'esp32', 'hardware', 'esp32'),
      
      // Cache de compilação
      buildCacheDir: path.join(arduinoCliBase, 'config', 'data', 'build_cache')
    };
  }

  /**
   * Configurações específicas do ESP32
   */
  getESP32Config() {
    return {
      coreName: 'esp32:esp32',
      boardName: 'esp32:esp32:esp32',
      urls: [
        'https://espressif.github.io/arduino-esp32/package_esp32_index.json',
        'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_dev_index.json'
      ],
      requiredLibraries: [
        'Adafruit MPU6050',
        'Adafruit HMC5883 Unified',
        'BH1750',
        'DHT sensor library',
        'Adafruit BMP085 Library',
        'Adafruit Unified Sensor',
        'Adafruit BusIO',
        'Adafruit GFX Library',
        'Adafruit SSD1306'
      ]
    };
  }

  /**
   * Verificar se os cores ESP32 já estão instalados localmente
   * IMPORTANTE: Permite distribuir projeto com cores pré-instalados
   */
  isESP32CoreInstalled() {
    const { esp32CorePath } = this.getArduinoCLIPaths();
    
    try {
      const fs = require('fs');
      
      // Verifica se o diretório existe
      if (!fs.existsSync(esp32CorePath)) {
        return false;
      }
      
      // Verifica se tem pelo menos uma versão instalada
      const versions = fs.readdirSync(esp32CorePath);
      const validVersions = versions.filter(v => {
        const versionPath = path.join(esp32CorePath, v);
        return fs.statSync(versionPath).isDirectory();
      });
      
      return validVersions.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obter versões instaladas do ESP32
   */
  getInstalledESP32Versions() {
    const { esp32CorePath } = this.getArduinoCLIPaths();
    
    try {
      const fs = require('fs');
      
      if (!fs.existsSync(esp32CorePath)) {
        return [];
      }
      
      return fs.readdirSync(esp32CorePath)
        .filter(version => {
          const versionPath = path.join(esp32CorePath, version);
          try {
            return fs.statSync(versionPath).isDirectory();
          } catch {
            return false;
          }
        })
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true })); // Versão mais recente primeiro
    } catch (error) {
      return [];
    }
  }

  /**
   * Obter informações detalhadas dos cores instalados
   */
  getESP32CoreInfo() {
    const { esp32CorePath } = this.getArduinoCLIPaths();
    const versions = this.getInstalledESP32Versions();
    
    if (versions.length === 0) {
      return null;
    }
    
    const fs = require('fs');
    const latestVersion = versions[0];
    const corePath = path.join(esp32CorePath, latestVersion);
    
    try {
      // Verificar se platform.txt existe (indica instalação completa)
      const platformTxt = path.join(corePath, 'platform.txt');
      const hasCompiler = fs.existsSync(platformTxt);
      
      // Verificar tamanho aproximado
      const getDirectorySize = (dirPath) => {
        let size = 0;
        try {
          const files = fs.readdirSync(dirPath);
          files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
              size += getDirectorySize(filePath);
            } else {
              size += stats.size;
            }
          });
        } catch {}
        return size;
      };
      
      const sizeBytes = getDirectorySize(corePath);
      const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
      
      return {
        installed: true,
        versions: versions,
        latestVersion: latestVersion,
        path: corePath,
        hasCompiler: hasCompiler,
        sizeMB: sizeMB,
        isComplete: hasCompiler && sizeBytes > 100 * 1024 * 1024 // Pelo menos 100MB
      };
    } catch (error) {
      return {
        installed: true,
        versions: versions,
        latestVersion: latestVersion,
        path: corePath,
        hasCompiler: false,
        sizeMB: '0',
        isComplete: false,
        error: error.message
      };
    }
  }

  /**
   * Timeouts e Limites
   */
  getTimeouts() {
    return {
      arduinoCliCommand: 30000, // 30 segundos
      coreInstall: 600000, // 10 minutos
      coreUpdate: 120000, // 2 minutos
      libraryInstall: 300000, // 5 minutos
      upload: 60000, // 1 minuto
      serialConnection: 5000 // 5 segundos
    };
  }

  /**
   * Configuração de Buffer
   */
  getBufferConfig() {
    return {
      maxBufferSize: 1024 * 1024 * 100, // 100MB para downloads grandes
      serialBufferSize: 8192 // Buffer para porta serial
    };
  }

  /**
   * Detectar portas seriais Windows (COM)
   */
  async detectWindowsComPorts() {
    if (!this.isWindows) {
      return [];
    }

    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // Usar PowerShell para detectar portas COM
      const psCommand = `
        Get-WmiObject Win32_PnPEntity | 
        Where-Object { $_.Name -match 'COM\\d+' } | 
        Select-Object Name, DeviceID | 
        ConvertTo-Json
      `;

      const { stdout } = await execAsync(`powershell -Command "${psCommand}"`, {
        timeout: 5000
      });

      if (!stdout || stdout.trim() === '') {
        return [];
      }

      const devices = JSON.parse(stdout);
      const ports = [];

      if (Array.isArray(devices)) {
        devices.forEach(device => {
          const match = device.Name.match(/\(COM(\d+)\)/);
          if (match) {
            ports.push({
              port: `COM${match[1]}`,
              name: device.Name,
              deviceId: device.DeviceID
            });
          }
        });
      } else if (devices && devices.Name) {
        const match = devices.Name.match(/\(COM(\d+)\)/);
        if (match) {
          ports.push({
            port: `COM${match[1]}`,
            name: devices.Name,
            deviceId: devices.DeviceID
          });
        }
      }

      return ports;
    } catch (error) {
      console.error('Erro ao detectar portas COM:', error.message);
      return [];
    }
  }

  /**
   * Método alternativo: Detectar via SerialPort
   */
  async detectSerialPorts() {
    try {
      const { SerialPort } = require('serialport');
      const ports = await SerialPort.list();
      
      return ports.map(port => ({
        port: port.path,
        name: port.friendlyName || port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        vendorId: port.vendorId,
        productId: port.productId
      }));
    } catch (error) {
      console.error('Erro ao listar portas seriais:', error.message);
      return [];
    }
  }

  /**
   * Detectar todas as portas disponíveis (híbrido)
   */
  async detectAllPorts() {
    const serialPorts = await this.detectSerialPorts();
    
    if (this.isWindows) {
      const comPorts = await this.detectWindowsComPorts();
      // Mesclar resultados, priorizando informações mais detalhadas
      const allPorts = [...serialPorts];
      
      comPorts.forEach(comPort => {
        if (!allPorts.find(p => p.port === comPort.port)) {
          allPorts.push(comPort);
        }
      });
      
      return allPorts;
    }
    
    return serialPorts;
  }

  /**
   * Informações do Sistema
   */
  getSystemInfo() {
    return {
      platform: this.platform,
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      hostname: os.hostname(),
      userInfo: os.userInfo()
    };
  }
}

// Exportar instância única (singleton)
module.exports = new AppConfig();

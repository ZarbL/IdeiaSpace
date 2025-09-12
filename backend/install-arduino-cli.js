/**
 * Script para baixar e configurar o Arduino CLI
 * Automatiza o download e configuração inicial
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ArduinoCLIInstaller {
  constructor() {
    this.baseDir = __dirname;
    this.cliDir = path.join(this.baseDir, 'arduino-cli');
    this.configDir = path.join(this.cliDir, 'config');
    
    // URLs dos binários para diferentes plataformas
    this.downloadUrls = {
      win32: 'https://github.com/arduino/arduino-cli/releases/download/v0.34.2/arduino-cli_0.34.2_Windows_64bit.zip',
      darwin: 'https://github.com/arduino/arduino-cli/releases/download/v0.34.2/arduino-cli_0.34.2_macOS_64bit.tar.gz',
      linux: 'https://github.com/arduino/arduino-cli/releases/download/v0.34.2/arduino-cli_0.34.2_Linux_64bit.tar.gz'
    };
  }

  async install() {
    try {
      console.log('🚀 Iniciando instalação do Arduino CLI...');
      
      // Criar diretórios necessários
      await this.createDirectories();
      
      // Verificar se já existe
      if (await this.isInstalled()) {
        console.log('✅ Arduino CLI já está instalado!');
        return await this.configure();
      }
      
      // Baixar Arduino CLI
      await this.downloadCLI();
      
      // Configurar
      await this.configure();
      
      console.log('🎉 Arduino CLI instalado e configurado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro durante a instalação:', error.message);
      throw error;
    }
  }

  async createDirectories() {
    const dirs = [this.cliDir, this.configDir];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Diretório criado: ${dir}`);
      }
    }
  }

  async isInstalled() {
    const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
    const cliPath = path.join(this.cliDir, executable);
    return fs.existsSync(cliPath);
  }

  async downloadCLI() {
    const platform = process.platform;
    const downloadUrl = this.downloadUrls[platform];
    
    if (!downloadUrl) {
      throw new Error(`Plataforma não suportada: ${platform}`);
    }

    console.log(`📥 Baixando Arduino CLI para ${platform}...`);
    
    const fileName = path.basename(downloadUrl);
    const filePath = path.join(this.cliDir, fileName);
    
    await this.downloadFile(downloadUrl, filePath);
    console.log('✅ Download concluído!');
    
    // Extrair arquivo
    await this.extractFile(filePath);
    console.log('📦 Arquivo extraído!');
    
    // Remover arquivo compactado
    fs.unlinkSync(filePath);
  }

  downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      
      https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Seguir redirecionamento
          return https.get(response.headers.location, (redirectResponse) => {
            redirectResponse.pipe(file);
            
            file.on('finish', () => {
              file.close();
              resolve();
            });
          }).on('error', reject);
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve();
        });
        
      }).on('error', reject);
    });
  }

  async extractFile(filePath) {
    const isZip = filePath.endsWith('.zip');
    
    if (isZip) {
      // Windows - usar PowerShell para extrair
      console.log('📦 Extraindo arquivo ZIP...');
      const tempDir = path.join(this.cliDir, 'temp');
      
      // Criar diretório temporário
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const command = `powershell -command "Expand-Archive -Path '${filePath}' -DestinationPath '${tempDir}' -Force"`;
      await execAsync(command);
      
      // Mover executável para o diretório correto
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        const sourcePath = path.join(tempDir, file);
        const destPath = path.join(this.cliDir, file);
        
        if (fs.statSync(sourcePath).isFile()) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`📁 Movido: ${file}`);
        }
      }
      
      // Remover diretório temporário
      fs.rmSync(tempDir, { recursive: true, force: true });
      
    } else {
      // Linux/macOS - usar tar
      const command = `tar -xzf "${filePath}" -C "${this.cliDir}"`;
      await execAsync(command);
    }
  }

  async configure() {
    console.log('⚙️ Configurando Arduino CLI...');
    
    const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
    const cliPath = path.join(this.cliDir, executable);
    
    // Tornar executável (Linux/macOS)
    if (process.platform !== 'win32') {
      await execAsync(`chmod +x "${cliPath}"`);
    }
    
    // Criar arquivo de configuração
    const configPath = path.join(this.configDir, 'arduino-cli.yaml');
    const config = {
      board_manager: {
        additional_urls: [
          'https://espressif.github.io/arduino-esp32/package_esp32_index.json',
          'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_dev_index.json'
        ]
      },
      daemon: {
        port: '50051'
      },
      directories: {
        data: path.join(this.configDir, 'data'),
        downloads: path.join(this.configDir, 'downloads'),
        user: path.join(this.configDir, 'user')
      },
      library: {
        enable_unsafe_install: false
      },
      logging: {
        level: 'info',
        format: 'text'
      },
      metrics: {
        enabled: false
      },
      sketch: {
        always_export_binaries: false
      }
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('📄 Arquivo de configuração criado!');
    
    // Inicializar core
    try {
      await execAsync(`"${cliPath}" --config-file "${configPath}" core update-index`);
      console.log('🔄 Índices atualizados!');
      
      // Instalar core ESP32
      await execAsync(`"${cliPath}" --config-file "${configPath}" core install esp32:esp32`);
      console.log('📱 Core ESP32 instalado!');
      
      // Instalar core Arduino AVR
      await execAsync(`"${cliPath}" --config-file "${configPath}" core install arduino:avr`);
      console.log('🔵 Core Arduino AVR instalado!');
      
    } catch (error) {
      console.log('⚠️ Alguns cores podem não ter sido instalados automaticamente');
      console.log('Você pode instalá-los manualmente depois');
    }
    
    console.log('✅ Configuração concluída!');
  }

  async getExecutablePath() {
    const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
    return path.join(this.cliDir, executable);
  }

  async getConfigPath() {
    return path.join(this.configDir, 'arduino-cli.yaml');
  }
}

// Executar instalação se chamado diretamente
if (require.main === module) {
  const installer = new ArduinoCLIInstaller();
  installer.install().catch(console.error);
}

module.exports = ArduinoCLIInstaller;
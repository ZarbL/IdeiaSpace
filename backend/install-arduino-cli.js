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
    
    // Detectar arquitetura correta
    this.arch = this.getArchitecture();
    
    // URLs atualizadas para Arduino CLI v1.0.4 (mais recente)
    this.downloadUrls = {
      win32: [
        'https://github.com/arduino/arduino-cli/releases/download/v1.0.4/arduino-cli_1.0.4_Windows_64bit.zip',
        'https://github.com/arduino/arduino-cli/releases/download/v0.35.3/arduino-cli_0.35.3_Windows_64bit.zip',
        'https://github.com/arduino/arduino-cli/releases/download/v0.34.2/arduino-cli_0.34.2_Windows_64bit.zip'
      ],
      darwin: this.arch === 'arm64' ? [
        'https://github.com/arduino/arduino-cli/releases/download/v1.0.4/arduino-cli_1.0.4_macOS_ARM64.tar.gz',
        'https://github.com/arduino/arduino-cli/releases/download/v0.35.3/arduino-cli_0.35.3_macOS_ARM64.tar.gz',
        'https://github.com/arduino/arduino-cli/releases/download/v0.34.2/arduino-cli_0.34.2_macOS_ARM64.tar.gz'
      ] : [
        'https://github.com/arduino/arduino-cli/releases/download/v1.0.4/arduino-cli_1.0.4_macOS_64bit.tar.gz',
        'https://github.com/arduino/arduino-cli/releases/download/v0.35.3/arduino-cli_0.35.3_macOS_64bit.tar.gz',
        'https://github.com/arduino/arduino-cli/releases/download/v0.34.2/arduino-cli_0.34.2_macOS_64bit.tar.gz'
      ],
      linux: [
        'https://github.com/arduino/arduino-cli/releases/download/v1.0.4/arduino-cli_1.0.4_Linux_64bit.tar.gz',
        'https://github.com/arduino/arduino-cli/releases/download/v0.35.3/arduino-cli_0.35.3_Linux_64bit.tar.gz', 
        'https://github.com/arduino/arduino-cli/releases/download/v0.34.2/arduino-cli_0.34.2_Linux_64bit.tar.gz'
      ]
    };
  }

  getArchitecture() {
    // Detectar arquitetura do sistema
    const arch = process.arch;
    console.log(`🔍 Sistema detectado: ${process.platform} ${arch}`);
    return arch;
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
    const urls = this.downloadUrls[platform];
    
    if (!urls) {
      throw new Error(`Plataforma não suportada: ${platform}`);
    }

    console.log(`📥 Baixando Arduino CLI para ${platform}...`);
    
    // Tenta cada URL até conseguir uma que funcione
    for (let urlIndex = 0; urlIndex < urls.length; urlIndex++) {
      const downloadUrl = urls[urlIndex];
      const fileName = path.basename(downloadUrl);
      const filePath = path.join(this.cliDir, fileName);
      
      console.log(`   🔗 Tentando URL ${urlIndex + 1}/${urls.length}...`);
      
      // Tentar download com retry para esta URL
      let attempts = 0;
      const maxAttempts = 3;
      let urlSuccess = false;
      
      while (attempts < maxAttempts && !urlSuccess) {
        try {
          await this.downloadFileWithRetry(downloadUrl, filePath);
          console.log(`   ✅ Download concluído da URL ${urlIndex + 1}/${urls.length}!`);
          
          // Extrair arquivo
          await this.extractFile(filePath);
          console.log('   📦 Arquivo extraído!');
          
          // Remover arquivo compactado
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          
          urlSuccess = true;
          return; // Download bem-sucedido, sair da função
        } catch (error) {
          attempts++;
          console.log(`   ❌ URL ${urlIndex + 1}, Tentativa ${attempts}/${maxAttempts} falhou: ${error.message}`);
          
          if (attempts < maxAttempts) {
            console.log('   ⏳ Aguardando 2 segundos antes da próxima tentativa...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    }
    
    // Se chegou aqui, todas as URLs falharam
    throw new Error(`Falha no download após tentar todas as URLs disponíveis`);
  }

  downloadFileWithRetry(url, dest) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      let totalBytes = 0;
      let downloadedBytes = 0;
      
      const request = https.get(url, (response) => {
        // Seguir redirecionamentos
        if (response.statusCode === 302 || response.statusCode === 301) {
          file.close();
          fs.unlinkSync(dest);
          return this.downloadFileWithRetry(response.headers.location, dest)
            .then(resolve)
            .catch(reject);
        }
        
        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
        
        totalBytes = parseInt(response.headers['content-length'], 10) || 0;
        
        response.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          if (totalBytes > 0) {
            const percent = Math.round((downloadedBytes / totalBytes) * 100);
            process.stdout.write(`\r   📥 Progresso: ${percent}% (${Math.round(downloadedBytes / 1024 / 1024)}MB/${Math.round(totalBytes / 1024 / 1024)}MB)`);
          }
        });
        
        response.pipe(file);
        
        file.on('finish', () => {
          console.log('\n'); // Nova linha após progresso
          file.close();
          resolve();
        });
        
        file.on('error', (err) => {
          file.close();
          fs.unlinkSync(dest);
          reject(err);
        });
        
      });
      
      request.on('error', (err) => {
        file.close();
        if (fs.existsSync(dest)) {
          fs.unlinkSync(dest);
        }
        reject(err);
      });
      
      // Timeout de 5 minutos
      request.setTimeout(300000, () => {
        request.abort();
        file.close();
        if (fs.existsSync(dest)) {
          fs.unlinkSync(dest);
        }
        reject(new Error('Download timeout (5 minutos)'));
      });
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
    
    // Inicializar core com retry e timeout aumentado
    try {
      console.log('🔄 Atualizando índices...');
      await this.executeWithRetry(
        `"${cliPath}" --config-file "${configPath}" core update-index`,
        'Atualização de índices',
        3, // 3 tentativas
        120000 // 2 minutos timeout
      );
      console.log('✅ Índices atualizados!');
      
      // Instalar core ESP32 com retry
      console.log('📱 Instalando core ESP32...');
      await this.executeWithRetry(
        `"${cliPath}" --config-file "${configPath}" core install esp32:esp32`,
        'Instalação ESP32 core',
        2, // 2 tentativas (instalação é mais demorada)
        600000 // 10 minutos timeout
      );
      console.log('✅ Core ESP32 instalado!');
      
      // Instalar core Arduino AVR com retry
      console.log('🔵 Instalando core Arduino AVR...');
      await this.executeWithRetry(
        `"${cliPath}" --config-file "${configPath}" core install arduino:avr`,
        'Instalação Arduino AVR core',
        2, // 2 tentativas
        300000 // 5 minutos timeout
      );
      console.log('✅ Core Arduino AVR instalado!');
      
    } catch (error) {
      console.log('⚠️ Alguns cores podem não ter sido instalados automaticamente');
      console.log('Isso pode ser devido à conexão de rede ou firewall');
      console.log('Você pode instalá-los manualmente depois executando:');
      console.log('  arduino-cli core install esp32:esp32');
      console.log('  arduino-cli core install arduino:avr');
    }
    
    console.log('✅ Configuração concluída!');
  }

  async executeWithRetry(command, description, maxAttempts = 3, timeout = 60000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`   Tentativa ${attempt}/${maxAttempts}: ${description}...`);
        
        const { stdout, stderr } = await execAsync(command, { 
          timeout: timeout,
          maxBuffer: 1024 * 1024 * 50 // 50MB buffer para downloads grandes
        });
        
        return { stdout, stderr };
        
      } catch (error) {
        console.log(`   ❌ Tentativa ${attempt} falhou: ${error.message}`);
        
        if (attempt === maxAttempts) {
          throw new Error(`${description} falhou após ${maxAttempts} tentativas: ${error.message}`);
        }
        
        // Aguardar antes da próxima tentativa (progressivo: 2s, 5s, 10s)
        const delay = attempt * 2000 + 1000;
        console.log(`   ⏳ Aguardando ${delay/1000}s antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
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
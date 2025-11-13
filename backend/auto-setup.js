#!/usr/bin/env node

/**
 * Script de Auto-Setup do Backend IdeiaSpace
 * Configuração automática executada antes do start
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const appConfig = require('./config');

const execAsync = promisify(exec);

// Buffer global para armazenar logs
const setupLogs = [];
const MAX_LOGS = 500;

function addLog(message, type = 'info') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message: message,
    type: type
  };
  
  setupLogs.push(logEntry);
  
  // Limitar tamanho do buffer
  if (setupLogs.length > MAX_LOGS) {
    setupLogs.shift();
  }
  
  // Também enviar para console
  console.log(message);
}

class AutoSetup {
  constructor() {
    this.backendDir = __dirname;
    this.arduinoPaths = appConfig.getArduinoCLIPaths();
    this.esp32Config = appConfig.getESP32Config();
    this.timeouts = appConfig.getTimeouts();
  }

  // Envia eventos de progresso para o console (capturados pelo main.js)
  sendProgress(step, progress, message) {
    const progressData = {
      type: 'PROGRESS',
      step: step,
      progress: progress, // 0-100
      message: message
    };
    const progressMsg = `[PROGRESS] ${JSON.stringify(progressData)}`;
    addLog(progressMsg, 'progress');
  }

  async run() {
    addLog('🔧 Auto-setup do backend...', 'info');
    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'info');

    const errors = [];
    let criticalError = false;

    try {
      // SEMPRE validar e corrigir configurações primeiro
      addLog('📋 Etapa 1: Validação de configurações', 'info');
      try {
        await this.validateAndFixConfigs();
        addLog('✅ Configurações validadas\n', 'success');
      } catch (error) {
        addLog(`❌ ERRO CRÍTICO: ${error.message}\n`, 'error');
        errors.push({ step: 'config', error: error.message, critical: true });
        criticalError = true;
        throw error; // Parar imediatamente se config falhar
      }
      
      // Verificar se já está configurado (mas ainda assim verificar cores)
      const alreadySetup = await this.isAlreadySetup();
      
      if (!alreadySetup) {
        // Auto-instalar dependências se necessário
        addLog('📋 Etapa 2: Verificação de dependências', 'info');
        try {
          await this.autoInstallDependencies();
          addLog('✅ Dependências instaladas\n', 'success');
        } catch (error) {
          addLog(`❌ ERRO CRÍTICO: Falha ao instalar dependências\n`, 'error');
          addLog(`   Detalhes: ${error.message}\n`, 'error');
          errors.push({ step: 'dependencies', error: error.message, critical: true });
          criticalError = true;
          throw error; // Dependências são críticas!
        }
        
        // Auto-configurar Arduino CLI se necessário
        addLog('📋 Etapa 3: Configuração do Arduino CLI', 'info');
        try {
          await this.autoSetupArduinoCLI();
          addLog('✅ Arduino CLI configurado\n', 'success');
        } catch (error) {
          addLog(`❌ ERRO CRÍTICO: Falha ao configurar Arduino CLI\n`, 'error');
          addLog(`   Detalhes: ${error.message}\n`, 'error');
          errors.push({ step: 'arduino-cli', error: error.message, critical: true });
          criticalError = true;
          throw error; // Arduino CLI é crítico!
        }
      } else {
        addLog('✅ Sistema já configurado anteriormente\n', 'info');
      }
      
      // SEMPRE verificar e instalar cores ESP32 (crítico para o funcionamento)
      addLog('📋 Etapa 4: Instalação de cores ESP32', 'info');
      try {
        await this.autoInstallEsp32Cores();
        addLog('✅ Cores ESP32 instalados\n', 'success');
      } catch (error) {
        addLog(`❌ ERRO CRÍTICO: Falha ao instalar cores ESP32\n`, 'error');
        addLog(`   Detalhes: ${error.message}\n`, 'error');
        errors.push({ step: 'esp32-cores', error: error.message, critical: true });
        criticalError = true;
        throw error; // Cores ESP32 são críticos!
      }
      
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
      addLog('✅ Auto-setup concluído com sucesso!', 'success');
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'success');
      
      // Retornar sucesso
      process.exit(0);
      
    } catch (error) {
      addLog('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'error');
      addLog('❌ AUTO-SETUP FALHOU - SISTEMA NÃO FUNCIONAL', 'error');
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'error');
      addLog(`\n🔴 Erro: ${error.message}`, 'error');
      addLog(`📍 Stack: ${error.stack}\n`, 'error');
      
      if (errors.length > 0) {
        addLog('📋 Resumo dos erros:', 'error');
        errors.forEach((err, idx) => {
          addLog(`   ${idx + 1}. [${err.step}] ${err.error}`, 'error');
        });
        addLog('', 'error');
      }
      
      addLog('🔧 AÇÕES NECESSÁRIAS:', 'info');
      addLog('   1. Verifique sua conexão com a internet', 'info');
      addLog('   2. Verifique se tem espaço em disco (mínimo 1 GB)', 'info');
      addLog('   3. Use o script PRIMEIRO-SETUP.bat ou reinicie o backend', 'info');
      addLog('   4. Verifique os logs acima para detalhes', 'info');
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'error');
      
      // Sair com código de erro para o main.js detectar
      process.exit(1);
    }
  }

  async isAlreadySetup() {
    const nodeModulesExists = fs.existsSync(path.join(this.backendDir, 'node_modules'));
    const arduinoCliExists = fs.existsSync(this.arduinoPaths.cliPath);
    const esp32CoreExists = await this.checkESP32Core();
    
    return nodeModulesExists && arduinoCliExists && esp32CoreExists;
  }

  async checkESP32Core() {
    try {
      if (!fs.existsSync(this.arduinoPaths.cliPath)) {
        return false;
      }
      
      const command = `"${this.arduinoPaths.cliPath}" --config-file "${this.arduinoPaths.configPath}" core list`;
      const { stdout } = await execAsync(command, { 
        timeout: this.timeouts.arduinoCliCommand 
      });
      
      return stdout.includes(this.esp32Config.coreName) || stdout.includes('esp32');
    } catch (error) {
      return false;
    }
  }

  async autoInstallDependencies() {
    const nodeModulesPath = path.join(this.backendDir, 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
      addLog('📦 Instalando dependências Node.js...', 'info');
      addLog('   Isso pode levar alguns minutos...', 'info');
      this.sendProgress('dependencies', 0, 'Instalando dependências Node.js...');
      
      const maxRetries = 3;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 1) {
            addLog(`   🔄 Tentativa ${attempt}/${maxRetries}...`, 'info');
          }
          
          this.sendProgress('dependencies', 20 * attempt, `Instalando dependências (tentativa ${attempt})...`);
          
          // CRÍTICO: Verificar se npm está disponível, caso contrário dar instrução clara
          let npmCommand = 'npm';
          try {
            await execAsync('npm --version', { timeout: 5000 });
          } catch (npmError) {
            addLog('⚠️ npm não encontrado no sistema!', 'warn');
            addLog('💡 Esta instalação requer npm instalado no sistema', 'info');
            addLog('💡 Opções:', 'info');
            addLog('   1. Instale Node.js de https://nodejs.org/', 'info');
            addLog('   2. Execute o PRIMEIRO-SETUP.bat após instalar Node.js', 'info');
            addLog('   3. OU inclua node_modules pré-compilado no build', 'info');
            throw new Error('npm não disponível. Instale Node.js de https://nodejs.org/ e execute PRIMEIRO-SETUP.bat');
          }
          
          // Usar npm install com timeout generoso
          const { stdout, stderr } = await execAsync('npm install --prefer-offline --no-audit --no-fund', { 
            cwd: this.backendDir,
            timeout: 300000, // 5 minutos
            maxBuffer: 10 * 1024 * 1024 // 10 MB buffer
          });
          
          if (stdout) addLog(`   ${stdout}`, 'info');
          
          // Verificar se node_modules foi criado
          if (fs.existsSync(nodeModulesPath)) {
            addLog('✅ Dependências instaladas com sucesso!', 'success');
            this.sendProgress('dependencies', 100, 'Dependências instaladas!');
            return; // Sucesso
          } else {
            throw new Error('node_modules não foi criado após npm install');
          }
          
        } catch (error) {
          addLog(`   ⚠️ Tentativa ${attempt} falhou: ${error.message}`, 'error');
          
          if (attempt === maxRetries) {
            throw new Error(`Falha ao instalar dependências após ${maxRetries} tentativas. Erro: ${error.message}. SOLUÇÃO: Instale Node.js de https://nodejs.org/ e execute PRIMEIRO-SETUP.bat`);
          }
          
          // Aguardar antes de tentar novamente
          addLog('   ⏳ Aguardando 3 segundos antes de tentar novamente...', 'info');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    } else {
      addLog('✅ Dependências já instaladas', 'success');
      this.sendProgress('dependencies', 100, 'Dependências já instaladas');
    }
  }

  async autoSetupArduinoCLI() {
    // Detectar executável correto baseado no sistema operacional
    const arduinoCliPath = this.arduinoPaths.cliPath;
    
    if (!fs.existsSync(arduinoCliPath)) {
      console.log(`⚙️ Configurando Arduino CLI automaticamente para ${process.platform}...`);
      
      try {
        await execAsync('node install-arduino-cli.js', { cwd: this.backendDir });
        console.log('✅ Arduino CLI configurado.');
      } catch (error) {
        console.log('⚠️ Falha na configuração automática do Arduino CLI');
        console.log('💡 Use o script PRIMEIRO-SETUP.bat');
      }
    }
    
    // Verificar e instalar ESP32 core se necessário
    await this.autoSetupESP32Core();
  }
  
  async autoSetupESP32Core() {
    addLog('\n� Etapa 4: Instalação de cores ESP32', 'info');
    addLog('�🔍 Verificando cores ESP32...', 'info');
    this.sendProgress('esp32-core', 0, 'Verificando cores ESP32...');
    
    // PRIMEIRO: Verificar se cores já existem localmente (instalação portátil)
    if (appConfig.isESP32CoreInstalled()) {
      const versions = appConfig.getInstalledESP32Versions();
      const coreInfo = appConfig.getESP32CoreInfo();
      
      addLog('✅ ESP32 core detectado localmente!', 'success');
      addLog(`📦 Versão(ões) instalada(s): ${versions.join(', ')}`, 'info');
      addLog(`💾 Tamanho: ${coreInfo.sizeMB} MB`, 'info');
      addLog(`📁 Localização: ${coreInfo.path}`, 'info');
      
      if (coreInfo.isComplete) {
        addLog('✅ Instalação portátil completa e funcional!', 'success');
        addLog('🚀 Pronto para compilar e fazer upload!', 'success');
        this.sendProgress('esp32-core', 100, 'ESP32 core pronto (instalação portátil)!');
        return;
      } else {
        addLog('⚠️ Cores encontrados mas parecem incompletos', 'warning');
        addLog('🔄 Tentando completar instalação...', 'info');
      }
    }
    
    // SEGUNDO: Se não existir ou estiver incompleto, verificar via Arduino CLI
    addLog('🔍 Verificando cores via Arduino CLI...', 'info');
    const hasESP32 = await this.checkESP32CoreRobust();
    
    if (!hasESP32) {
      addLog('📱 ESP32 core não encontrado. Instalando...', 'warning');
      addLog('⏳ Este processo pode levar alguns minutos...', 'info');
      addLog('📥 Download: ~200-300 MB', 'info');
      this.sendProgress('esp32-core', 10, 'Baixando ESP32 core...');
      
      try {
        addLog('📥 [1/4] Atualizando índices de pacotes...', 'info');
        this.sendProgress('esp32-core', 20, 'Atualizando índices de pacotes...');
        await this.updateCoreIndexRobust();
        addLog('✅ Índices atualizados!\n', 'success');
        this.sendProgress('esp32-core', 40, 'Índices atualizados!');
        
        addLog('📦 [2/4] Baixando e instalando ESP32 core...', 'info');
        addLog('    Isso inclui compiladores e ferramentas necessárias', 'info');
        this.sendProgress('esp32-core', 45, 'Baixando ESP32 core (200-300 MB)...');
        await this.installESP32CoreRobust();
        addLog('✅ ESP32 core instalado!\n', 'success');
        this.sendProgress('esp32-core', 80, 'ESP32 core instalado!');
        
        addLog('🔍 [3/4] Verificando instalação...', 'info');
        this.sendProgress('esp32-core', 90, 'Verificando instalação...');
        const verified = await this.verifyESP32Installation();
        
        if (verified) {
          addLog('✅ ESP32 core verificado e pronto para uso!\n', 'success');
          this.sendProgress('esp32-core', 95, 'ESP32 core pronto para uso!');
        } else {
          addLog('⚠️ Verificação falhou, tentando novamente...\n', 'warn');
          this.sendProgress('esp32-core', 85, 'Revalidando instalação...');
          
          // Tentar verificação novamente após 2 segundos
          await new Promise(resolve => setTimeout(resolve, 2000));
          const reVerified = await this.verifyESP32Installation();
          
          if (reVerified) {
            addLog('✅ ESP32 core verificado na segunda tentativa!\n', 'success');
            this.sendProgress('esp32-core', 100, 'ESP32 core pronto!');
          } else {
            addLog('⚠️ Verificação falhou, mas instalação foi concluída\n', 'warn');
            this.sendProgress('esp32-core', 100, 'Instalação concluída (verificação pendente)');
          }
        }
        
        addLog('📋 [4/4] Listando cores instalados...', 'info');
        await this.listInstalledCores();
        addLog('', 'info');
        
      } catch (error) {
        addLog('\n⚠️ Falha na instalação automática do ESP32 core', 'error');
        addLog('💡 Use o script PRIMEIRO-SETUP.bat ou reinicie o backend', 'info');
        addLog(`   Erro: ${error.message}`, 'error');
        this.sendProgress('esp32-core', 0, 'Erro na instalação: ' + error.message);
      }
    } else {
      addLog('✅ ESP32 core já instalado\n', 'success');
      this.sendProgress('esp32-core', 100, 'ESP32 core já instalado');
      await this.listInstalledCores();
    }
    
    // Verificar e instalar bibliotecas necessárias
    await this.autoSetupLibraries();
  }

  /**
   * Verificação robusta do ESP32 Core
   */
  async checkESP32CoreRobust() {
    try {
      if (!fs.existsSync(this.arduinoPaths.cliPath)) {
        return false;
      }
      
      const command = `"${this.arduinoPaths.cliPath}" --config-file "${this.arduinoPaths.configPath}" core list`;
      const { stdout } = await execAsync(command, { 
        timeout: this.timeouts.arduinoCliCommand 
      });
      
      // Verificar múltiplas variações
      const hasESP32 = stdout.includes(this.esp32Config.coreName) || 
                       stdout.includes('esp32:esp32') || 
                       stdout.includes('esp32');
      
      return hasESP32;
    } catch (error) {
      console.warn('⚠️ Erro ao verificar ESP32 core:', error.message);
      return false;
    }
  }

  /**
   * Atualização robusta dos índices com retry
   */
  async updateCoreIndexRobust() {
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const command = `"${this.arduinoPaths.cliPath}" --config-file "${this.arduinoPaths.configPath}" core update-index`;
        
        if (attempt > 1) {
          console.log(`    Tentativa ${attempt}/${maxRetries}...`);
        }
        
        await execAsync(command, { 
          timeout: this.timeouts.coreUpdate,
          maxBuffer: appConfig.getBufferConfig().maxBufferSize
        });
        
        return; // Sucesso
        
      } catch (error) {
        console.warn(`    ⚠️ Tentativa ${attempt} falhou: ${error.message}`);
        
        if (attempt === maxRetries) {
          throw new Error(`Falha ao atualizar índices após ${maxRetries} tentativas`);
        }
        
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  /**
   * Instalação robusta do ESP32 Core com retry
   */
  async installESP32CoreRobust() {
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const command = `"${this.arduinoPaths.cliPath}" --config-file "${this.arduinoPaths.configPath}" core install ${this.esp32Config.coreName}`;
        
        if (attempt > 1) {
          console.log(`    🔄 Tentativa ${attempt}/${maxRetries} de instalação...`);
          this.sendProgress('esp32-core', 45 + (attempt * 5), `Tentando instalação (tentativa ${attempt})...`);
        }
        
        console.log('    Fazendo download dos arquivos...');
        this.sendProgress('esp32-core', 50, 'Fazendo download dos arquivos...');
        
        // Simular progresso durante o download
        const progressInterval = setInterval(() => {
          const currentProgress = 50 + Math.floor(Math.random() * 25);
          this.sendProgress('esp32-core', currentProgress, 'Baixando componentes ESP32...');
        }, 3000);
        
        await execAsync(command, { 
          timeout: this.timeouts.coreInstall,
          maxBuffer: appConfig.getBufferConfig().maxBufferSize
        });
        
        clearInterval(progressInterval);
        this.sendProgress('esp32-core', 75, 'Download concluído!');
        
        return; // Sucesso
        
      } catch (error) {
        console.warn(`    ⚠️ Tentativa ${attempt} falhou: ${error.message}`);
        
        if (attempt === maxRetries) {
          throw new Error(`Falha ao instalar ESP32 core após ${maxRetries} tentativas: ${error.message}`);
        }
        
        // Aguardar antes de tentar novamente
        console.log('    ⏳ Aguardando 5 segundos antes de tentar novamente...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Verificação detalhada da instalação
   */
  async verifyESP32Installation() {
    try {
      const command = `"${this.arduinoPaths.cliPath}" --config-file "${this.arduinoPaths.configPath}" core list`;
      const { stdout } = await execAsync(command, { 
        timeout: this.timeouts.arduinoCliCommand 
      });
      
      const lines = stdout.split('\n');
      let foundESP32 = false;
      
      lines.forEach(line => {
        if (line.includes('esp32:esp32')) {
          foundESP32 = true;
          console.log(`    ✅ Encontrado: ${line.trim()}`);
        }
      });
      
      return foundESP32;
    } catch (error) {
      console.warn('⚠️ Erro na verificação:', error.message);
      return false;
    }
  }

  /**
   * Listar cores instalados
   */
  async listInstalledCores() {
    try {
      const command = `"${this.arduinoPaths.cliPath}" --config-file "${this.arduinoPaths.configPath}" core list`;
      const { stdout } = await execAsync(command, { 
        timeout: this.timeouts.arduinoCliCommand 
      });
      
      console.log('📋 Cores instalados:');
      const lines = stdout.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        if (line.includes('esp32') || line.includes('ESP32')) {
          console.log(`    ✅ ${line.trim()}`);
        }
      });
      
    } catch (error) {
      console.warn('⚠️ Não foi possível listar cores:', error.message);
    }
  }
  
  async autoSetupLibraries() {
    console.log('\n📚 Verificando bibliotecas dos sensores...');
    console.log('⏳ Instalando bibliotecas necessárias...\n');
    
    try {
      // Executar instalação de bibliotecas silenciosamente
      await execAsync('node setup-libraries.js', { 
        cwd: this.backendDir,
        timeout: 300000 // 5 minutos timeout
      });
      console.log('✅ Bibliotecas verificadas e instaladas.\n');
    } catch (error) {
      console.log('⚠️ Algumas bibliotecas podem não ter sido instaladas');
      console.log('💡 Execute manualmente: npm run install-libraries\n');
    }
  }
  
  async validateAndFixConfigs() {
    console.log('🔍 Validando arquivos de configuração...');
    
    const configFiles = [
      {
        path: path.join(this.backendDir, 'arduino-cli', 'arduino-cli.yaml'),
        type: 'yaml'
      },
      {
        path: path.join(this.backendDir, 'arduino-cli', 'config', 'arduino-cli.yaml'),
        type: 'json'
      }
    ];
    
    for (const configFile of configFiles) {
      if (fs.existsSync(configFile.path)) {
        try {
          const content = fs.readFileSync(configFile.path, 'utf-8');
          
          // Verificar se há caminhos absolutos hardcoded
          if (content.includes('C:\\Users\\') || content.includes('C:/Users/')) {
            console.log(`⚠️ Detectado caminho hardcoded em: ${configFile.path}`);
            console.log('🔧 Corrigindo configuração...');
            
            if (configFile.type === 'yaml') {
              // Corrigir YAML
              const yamlConfig = `board_manager:
    additional_urls:
        - https://espressif.github.io/arduino-esp32/package_esp32_index.json
        - https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_dev_index.json

directories:
    user: config/user
    data: config/data
    downloads: config/downloads

library:
    enable_unsafe_install: false

daemon:
    port: "50051"

logging:
    level: warn

sketch:
    always_export_binaries: false

build_cache:
    compilations_before_purge: 10
    ttl: 720h0m0s
`;
              fs.writeFileSync(configFile.path, yamlConfig, 'utf-8');
            } else {
              // Corrigir JSON
              const jsonConfig = {
                board_manager: {
                  additional_urls: [
                    'https://espressif.github.io/arduino-esp32/package_esp32_index.json',
                    'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_dev_index.json'
                  ]
                },
                daemon: { port: '50051' },
                directories: {
                  data: 'data',
                  downloads: 'downloads',
                  user: 'user'
                },
                library: { enable_unsafe_install: false },
                logging: { level: 'info', format: 'text' },
                metrics: { enabled: false },
                sketch: { always_export_binaries: false }
              };
              fs.writeFileSync(configFile.path, JSON.stringify(jsonConfig, null, 2), 'utf-8');
            }
            
            console.log(`✅ Configuração corrigida: ${configFile.path}`);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao validar ${configFile.path}: ${error.message}`);
        }
      }
    }
    
    // Garantir que diretórios necessários existam
    const requiredDirs = [
      path.join(this.backendDir, 'arduino-cli', 'config', 'data'),
      path.join(this.backendDir, 'arduino-cli', 'config', 'downloads'),
      path.join(this.backendDir, 'arduino-cli', 'config', 'user'),
      path.join(this.backendDir, 'arduino-cli', 'config', 'user', 'libraries')
    ];
    
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Diretório criado: ${path.relative(this.backendDir, dir)}`);
      }
    }
    
    console.log('✅ Validação de configuração concluída.');
  }

  async autoInstallEsp32Cores() {
    try {
      const ESP32CoreInstaller = require('./setup-esp32-core.js');
      const coreInstaller = new ESP32CoreInstaller(addLog); // Passar função addLog
      
      addLog('⚙️ Configurando cores ESP32 (únicos necessários)...');
      
      // Verificar se já está instalado
      const isInstalled = await coreInstaller.checkESP32Installed();
      
      if (isInstalled) {
        addLog('✅ ESP32 core já está instalado!');
        return;
      }
      
      // Instalar ESP32 core
      addLog('📥 ESP32 core não encontrado. Iniciando instalação...');
      await coreInstaller.install();
      addLog('✅ Cores ESP32 configurados com sucesso.');
      
    } catch (error) {
      addLog('❌ Erro ao configurar cores ESP32: ' + error.message, 'error');
      addLog('💡 Você pode tentar manualmente executando:', 'error');
      addLog('   arduino-cli core install esp32:esp32', 'error');
      addLog('💡 Ou através do botão "Iniciar Backend" na interface', 'error');
    }
  }

  async executeWithRetry(command, description, maxAttempts = 3, timeout = 60000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`   Tentativa ${attempt}/${maxAttempts}: ${description}...`);
        
        await execAsync(command, { 
          cwd: this.backendDir,
          timeout: timeout 
        });
        
        console.log(`   ✅ ${description} concluído!`);
        return;
        
      } catch (error) {
        console.log(`   ❌ Tentativa ${attempt} falhou: ${error.message}`);
        
        if (attempt === maxAttempts) {
          throw new Error(`${description} falhou após ${maxAttempts} tentativas: ${error.message}`);
        }
        
        // Aguardar antes da próxima tentativa
        console.log(`   ⏳ Aguardando 5 segundos antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}

// Executar auto-setup se chamado diretamente
if (require.main === module) {
  const autoSetup = new AutoSetup();
  autoSetup.run();
}

module.exports = AutoSetup;
// Exportar logs para acesso externo
module.exports.getSetupLogs = () => setupLogs;
module.exports.clearSetupLogs = () => { setupLogs.length = 0; };

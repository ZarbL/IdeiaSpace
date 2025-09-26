/**
 * Serviço Arduino CLI - Abstração para comandos do Arduino CLI
 * Gerencia compilação, upload, portas seriais e bibliotecas
 */

const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

class ArduinoCLIService {
  constructor() {
    this.cliPath = null;
    this.configPath = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
    this.cliPath = path.join(__dirname, '..', 'arduino-cli', executable);
    this.configPath = path.join(__dirname, '..', 'arduino-cli', 'config', 'arduino-cli.yaml');

    console.log(`🔍 Procurando Arduino CLI em: ${this.cliPath}`);
    
    if (!fs.existsSync(this.cliPath)) {
      throw new Error(`❌ Arduino CLI não encontrado em ${this.cliPath}.\n💡 Execute: npm run install-cli`);
    }

    this.isInitialized = true;
    console.log('🚀 Arduino CLI Service inicializado');
  }

  /**
   * Executa comando do Arduino CLI
   */
  async executeCommand(command, options = {}) {
    await this.initialize();
    
    const fullCommand = `"${this.cliPath}" --config-file "${this.configPath}" ${command}`;
    
    try {
      console.log(`🔧 Executando: ${command}`);
      const { stdout, stderr } = await execAsync(fullCommand, {
        timeout: options.timeout || 30000,
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer para evitar overflow
        ...options
      });
      
      return {
        success: true,
        output: stdout,
        error: stderr
      };
    } catch (error) {
      console.error(`❌ Erro no comando: ${command}`, error.message);
      return {
        success: false,
        output: error.stdout || '',
        error: error.stderr || error.message
      };
    }
  }

  /**
   * Lista todas as portas seriais disponíveis
   */
  async listPorts() {
    const result = await this.executeCommand('board list --format json');
    
    if (!result.success) {
      return { ports: [], error: result.error };
    }

    try {
      const data = JSON.parse(result.output || '{"detected_ports": []}');
      const detectedPorts = data.detected_ports || [];
      
      const ports = detectedPorts.map(portData => ({
        address: portData.port?.address || '',
        protocol: portData.port?.protocol || 'serial',
        protocolLabel: portData.port?.protocol_label || 'Serial Port',
        boards: portData.matching_boards || [],
        serialNumber: portData.port?.properties?.serialNumber || '',
        vid: portData.port?.properties?.vid || '',
        pid: portData.port?.properties?.pid || ''
      }));

      return { ports, error: null };
    } catch (parseError) {
      console.error('Erro ao analisar JSON das portas:', parseError.message);
      console.error('Saída recebida:', result.output);
      return { ports: [], error: 'Erro ao analisar lista de portas' };
    }
  }

  /**
   * Valida e limpa o código antes da compilação
   */
  validateAndCleanCode(code) {
    if (!code || typeof code !== 'string') {
      throw new Error('Código deve ser uma string válida');
    }
    
    // Remove BOM se existir
    const cleanCode = code.replace(/^\uFEFF/, '');
    
    // Verifica se tem pelo menos setup() e loop()
    if (!cleanCode.includes('setup()') && !cleanCode.includes('void setup()')) {
      throw new Error('Código deve conter uma função setup()');
    }
    
    if (!cleanCode.includes('loop()') && !cleanCode.includes('void loop()')) {
      throw new Error('Código deve conter uma função loop()');
    }
    
    return cleanCode;
  }

  /**
   * Compila um sketch Arduino
   */
  async compileSketch(code, board = 'esp32:esp32:esp32', options = {}) {
    // Criar diretório temporário para o sketch
    const tempDir = path.join(__dirname, 'temp', `sketch_${Date.now()}`);
    const sketchDir = path.join(tempDir, 'sketch');
    const sketchFile = path.join(sketchDir, 'sketch.ino');

    try {
      // Validar e limpar código
      const cleanCode = this.validateAndCleanCode(code);
      
      // Criar diretórios
      fs.mkdirSync(sketchDir, { recursive: true });
      
      // Escrever código no arquivo garantindo UTF-8 sem BOM
      // Usar Buffer para evitar BOM automaticamente inserido pelo Node.js
      const buffer = Buffer.from(cleanCode, 'utf8');
      fs.writeFileSync(sketchFile, buffer, { flag: 'w' });

      // Comando de compilação
      const compileCommand = `compile --fqbn ${board} "${sketchDir}"`;
      
      const result = await this.executeCommand(compileCommand, {
        timeout: options.timeout || 60000
      });

      // Limpar diretório temporário
      this.cleanupTempDir(tempDir);

      if (result.success) {
        return {
          success: true,
          message: 'Compilação bem-sucedida!',
          output: result.output,
          binPath: null // O Arduino CLI não retorna o caminho do binário por padrão
        };
      } else {
        return {
          success: false,
          message: 'Erro na compilação',
          error: result.error,
          output: result.output
        };
      }

    } catch (error) {
      this.cleanupTempDir(tempDir);
      return {
        success: false,
        message: 'Erro interno na compilação',
        error: error.message
      };
    }
  }

  /**
   * Faz upload de um sketch para a placa com configuração automática do bootloader
   */
  async uploadSketch(code, port, board = 'esp32:esp32:esp32', options = {}) {
    const tempDir = path.join(__dirname, 'temp', `upload_${Date.now()}`);
    const sketchDir = path.join(tempDir, 'sketch');
    const sketchFile = path.join(sketchDir, 'sketch.ino');

    try {
      // Validar e limpar código  
      const cleanCode = this.validateAndCleanCode(code);
      
      // Criar diretórios
      fs.mkdirSync(sketchDir, { recursive: true });
      
      // Escrever código no arquivo garantindo UTF-8 sem BOM
      // Usar Buffer para evitar BOM automaticamente inserido pelo Node.js
      const buffer = Buffer.from(cleanCode, 'utf8');
      fs.writeFileSync(sketchFile, buffer, { flag: 'w' });

      // Verificar se a porta existe - OBRIGATÓRIO
      console.log(`🔍 Verificando disponibilidade da porta ${port}...`);
      
      const portsCheck = await this.listPorts();
      const portAvailable = portsCheck.ports && portsCheck.ports.some(p => p.address === port);
      
      if (!portAvailable) {
        const availablePorts = portsCheck.ports?.map(p => p.address).join(', ') || 'nenhuma';
        throw new Error(`❌ Porta ${port} não encontrada.\n📋 Portas disponíveis: ${availablePorts}\n💡 Conecte a ESP32 e verifique os drivers.`);
      }

      // Detectar configuração específica do board
      const boardConfig = this.getEsp32BoardConfig(board);
      console.log(`🎯 Configuração detectada: ${boardConfig.name}`);
      
      // Construir comando de upload com configurações automáticas do bootloader
      let uploadCommand = `compile --upload --fqbn ${board} --port ${port}`;
      
      // Configurações específicas baseadas no tipo de ESP32
      uploadCommand += ` --build-property upload.speed=${boardConfig.uploadSpeed}`;
      uploadCommand += ` --build-property build.flash_freq=${boardConfig.flashFreq}`;
      uploadCommand += ` --build-property build.flash_mode=${boardConfig.flashMode}`;
      uploadCommand += ` --build-property build.flash_size=${boardConfig.flashSize}`;
      
      // CONFIGURAÇÃO AUTOMÁTICA DO BOOTLOADER - ESP32 específico
      if (board.includes('esp32')) {
        // Configurações para entrada automática no modo bootloader
        uploadCommand += ` --build-property upload.before_reset=default_reset`;
        uploadCommand += ` --build-property upload.after_reset=hard_reset`;
        uploadCommand += ` --build-property upload.use_1200bps_touch=false`;
        uploadCommand += ` --build-property upload.wait_for_upload_port=false`;
        
        // Configurações específicas do esptool para auto-reset
        uploadCommand += ` --build-property tools.esptool_py.upload.protocol=esp32`;
        uploadCommand += ` --build-property tools.esptool_py.upload.params.verbose=-v`;
        uploadCommand += ` --build-property upload.maximum_size=${boardConfig.maxSize}`;
        uploadCommand += ` --build-property upload.maximum_data_size=${boardConfig.maxDataSize}`;
        
        // Habilitar auto-reset no esptool (força entrada no bootloader)
        uploadCommand += ` --build-property upload.extra_flags=--before=default_reset --after=hard_reset`;
      }
      
      // Opções verbosas para debug se solicitado
      if (options.verbose) {
        uploadCommand += ' --verbose';
      }
      
      uploadCommand += ` "${sketchDir}"`;
      
      console.log(`🚀 Upload ${boardConfig.name} - Auto-reset habilitado`);
      console.log(`📡 Velocidade: ${boardConfig.uploadSpeed}, Modo: ${boardConfig.flashMode}`);
      
      // Tentar upload com timeout baseado no tipo de placa
      const result = await this.executeCommand(uploadCommand, {
        timeout: boardConfig.timeout
      });

      // Limpar diretório temporário
      this.cleanupTempDir(tempDir);

      if (result.success) {
        return {
          success: true,
          message: `Upload realizado com sucesso! (${boardConfig.name})`,
          output: result.output,
          boardUsed: boardConfig.name
        };
      } else {
        // Analisar o tipo de erro para dar feedback específico
        let errorAnalysis = this.analyzeUploadError(result.error, port);
        
        const errorMessage = `❌ UPLOAD FALHOU - ${errorAnalysis.type}\n` + 
                           `🎯 Placa: ${boardConfig.name}\n` +
                           `📝 Detalhes: ${result.error}\n` +
                           `💡 Sugestões:\n` +
                           errorAnalysis.suggestions.map(s => `   • ${s}`).join('\n');
        
        return {
          success: false,
          message: errorMessage,
          error: result.error,
          output: result.output,
          errorType: errorAnalysis.type,
          suggestions: errorAnalysis.suggestions,
          boardUsed: boardConfig.name
        };
      }

    } catch (error) {
      this.cleanupTempDir(tempDir);
      return {
        success: false,
        message: 'Erro interno no upload',
        error: error.message
      };
    }
  }

  /**
   * Obtém configurações específicas para cada tipo de ESP32
   */
  getEsp32BoardConfig(board) {
    const configs = {
      'esp32:esp32:esp32': {
        name: 'ESP32 Dev Module',
        uploadSpeed: '921600',
        flashFreq: '80m',
        flashMode: 'dio',
        flashSize: '4MB',
        maxSize: '1310720',
        maxDataSize: '327680',
        timeout: 120000,
        description: 'ESP32 genérico com configurações padrão'
      },
      'esp32:esp32:esp32wrover': {
        name: 'ESP32 WROVER Module',
        uploadSpeed: '460800', // Mais conservativo para WROVER
        flashFreq: '80m',
        flashMode: 'dio',
        flashSize: '4MB',
        maxSize: '1310720',
        maxDataSize: '327680', 
        timeout: 150000, // Timeout maior para WROVER
        description: 'ESP32 WROVER com PSRAM e configurações otimizadas'
      },
      'esp32:esp32:esp32doit-devkit-v1': {
        name: 'DOIT ESP32 DevKit V1',
        uploadSpeed: '921600',
        flashFreq: '80m',
        flashMode: 'dio',
        flashSize: '4MB',
        maxSize: '1310720',
        maxDataSize: '327680',
        timeout: 120000,
        description: 'DOIT DevKit V1 com auto-reset aprimorado'
      },
      'arduino:avr:uno': {
        name: 'Arduino Uno',
        uploadSpeed: '115200',
        flashFreq: '16m', 
        flashMode: 'dio',
        flashSize: '32KB',
        maxSize: '32256',
        maxDataSize: '2048',
        timeout: 60000,
        description: 'Arduino Uno R3 com ATmega328P'
      },
      'arduino:avr:mega': {
        name: 'Arduino Mega',
        uploadSpeed: '115200',
        flashFreq: '16m',
        flashMode: 'dio', 
        flashSize: '256KB',
        maxSize: '253952',
        maxDataSize: '8192',
        timeout: 90000,
        description: 'Arduino Mega 2560 com ATmega2560'
      }
    };
    
    // Retorna configuração específica ou padrão ESP32 Dev Module
    return configs[board] || configs['esp32:esp32:esp32'];
  }

  /**
   * Analisa erros de upload para dar sugestões específicas
   */
  analyzeUploadError(errorMessage, port) {
    const error = (errorMessage || '').toLowerCase();
    
    // Erro de codificação de arquivo (BOM/UTF-16)
    if (error.includes('stray') && (error.includes('377') || error.includes('376'))) {
      return {
        type: 'FILE_ENCODING',
        suggestions: [
          'Erro de codificação de arquivo detectado',
          'O arquivo .ino foi criado com codificação UTF-16 (BOM)',
          'Recriar o arquivo com codificação UTF-8 sem BOM',
          'Verificar se o sistema está salvando arquivos corretamente'
        ]
      };
    }
    
    // Erro de porta em uso
    if (error.includes('resource busy') || error.includes('permission denied') || 
        error.includes('access denied') || error.includes('device busy')) {
      return {
        type: 'PORT_BUSY',
        suggestions: [
          'ERRO: Porta está em uso por outro processo',
          'Feche qualquer Monitor Serial que esteja aberto',
          'Feche o Arduino IDE se estiver usando a mesma porta',
          'Desconecte e reconecte o cabo USB da ESP32'
        ]
      };
    }
    
    // Erro de comunicação com ESP32 - "Packet content transfer stopped"
    if (error.includes('packet content transfer stopped') || 
        error.includes('failed uploading') || 
        error.includes('timeout') ||
        error.includes('exit status 2')) {
      return {
        type: 'ESP32_COMMUNICATION',
        suggestions: [
          '❌ FALHA NA COMUNICAÇÃO - Auto-reset não funcionou',
          '',
          '🔄 TENTATIVA AUTOMÁTICA REALIZADA:',
          '• Sistema tentou forçar ESP32 no modo bootloader automaticamente',
          '• Configuração de auto-reset --before=default_reset aplicada',
          '• Falha na entrada automática no modo download',
          '',
          '🔧 PROCEDIMENTO MANUAL NECESSÁRIO:',
          '1. Pressione e MANTENHA o botão BOOT da ESP32',
          '2. Ainda segurando BOOT, pressione e solte RESET', 
          '3. Solte o botão BOOT (ESP32 deve entrar no modo download)',
          '4. Tente o upload novamente EM POUCOS SEGUNDOS',
          '',
          '⚠️  IMPORTANTE:',
          '• A ESP32 sai do modo bootloader em ~10 segundos',
          '• Use cabo USB de melhor qualidade (dados, não só energia)',
          '• Teste outra porta USB (USB 2.0 pode ser mais estável)',
          '• Verifique drivers CH340/CP2102 instalados corretamente',
          '• Alguns ESP32 clones não suportam auto-reset'
        ]
      };
    }
    
    // Porta não encontrada
    if (error.includes('no such file') || error.includes('port not found') || 
        error.includes('device not found')) {
      return {
        type: 'PORT_NOT_FOUND',
        suggestions: [
          'ERRO: Dispositivo não encontrado',
          'ESP32 não está conectada ou não é reconhecida',
          'Instale os drivers CH340 ou CP2102',
          'Verifique se o cabo USB é de dados (não apenas carregamento)',
          'Teste uma porta USB diferente'
        ]
      };
    }
    
    // Core ESP32 não encontrado
    if (error.includes('platform not installed') || error.includes('esp32:esp32')) {
      return {
        type: 'CORE_MISSING',
        suggestions: [
          'ERRO: ESP32 core não instalado',
          'Execute: npm run install-cli',
          'Execute: arduino-cli core install esp32:esp32',
          'Verifique se as URLs do ESP32 estão configuradas'
        ]
      };
    }
    
    return {
      type: 'UNKNOWN',
      suggestions: [
        'ERRO: Falha no upload - motivo desconhecido',
        'Verifique a conexão da ESP32',
        'Reinicie a ESP32 pressionando o botão RESET',
        'Verifique os logs completos para mais detalhes'
      ]
    };
  }

  /**
   * Lista placas instaladas
   */
  async listBoards() {
    const result = await this.executeCommand('board listall --format json');
    
    if (!result.success) {
      return { boards: [], error: result.error };
    }

    try {
      const data = JSON.parse(result.output || '[]');
      const boards = data.map(board => ({
        name: board.name,
        fqbn: board.fqbn,
        platform: board.platform?.name || '',
        architectures: board.platform?.architecture || []
      }));

      return { boards, error: null };
    } catch (parseError) {
      return { boards: [], error: 'Erro ao analisar lista de placas' };
    }
  }

  /**
   * Instala uma biblioteca
   */
  async installLibrary(libraryName, version = null) {
    const versionStr = version ? `@${version}` : '';
    const command = `lib install "${libraryName}${versionStr}"`;
    
    const result = await this.executeCommand(command, {
      timeout: 60000
    });

    return {
      success: result.success,
      message: result.success ? 
        `Biblioteca ${libraryName} instalada com sucesso!` : 
        `Erro ao instalar biblioteca ${libraryName}`,
      output: result.output,
      error: result.error
    };
  }

  /**
   * Lista bibliotecas instaladas
   */
  async listInstalledLibraries() {
    const result = await this.executeCommand('lib list --format json');
    
    if (!result.success) {
      return { libraries: [], error: result.error };
    }

    try {
      const data = JSON.parse(result.output || '[]');
      const libraries = data.map(lib => ({
        name: lib.library?.name || '',
        version: lib.library?.version || '',
        author: lib.library?.author || '',
        sentence: lib.library?.sentence || '',
        location: lib.library?.location || ''
      }));

      return { libraries, error: null };
    } catch (parseError) {
      return { libraries: [], error: 'Erro ao analisar bibliotecas instaladas' };
    }
  }

  /**
   * Atualiza índices de cores e bibliotecas
   */
  async updateIndexes() {
    console.log('🔄 Atualizando índices...');
    
    const coreResult = await this.executeCommand('core update-index', {
      timeout: 60000
    });
    
    const libResult = await this.executeCommand('lib update-index', {
      timeout: 60000
    });

    return {
      success: coreResult.success && libResult.success,
      message: 'Índices atualizados',
      coreOutput: coreResult.output,
      libOutput: libResult.output,
      error: coreResult.error || libResult.error
    };
  }

  /**
   * Instala core (ESP32, Arduino, etc.)
   */
  async installCore(coreName) {
    console.log(`🔧 Instalando core: ${coreName}`);
    
    try {
      // Verificar se o core já está instalado
      console.log('🔍 Verificando se core já está instalado...');
      const listCoresResult = await this.executeCommand('core list --format json', {
        timeout: 30000
      });
      
      if (listCoresResult.success && listCoresResult.output) {
        try {
          const installedCores = JSON.parse(listCoresResult.output);
          const isInstalled = installedCores.some(core => 
            core.id === coreName || core.id.includes(coreName.split(':')[0])
          );
          
          if (isInstalled) {
            console.log(`✅ Core ${coreName} já está instalado`);
            return {
              success: true,
              message: `Core ${coreName} já está instalado`,
              output: 'Core already installed'
            };
          }
        } catch (parseError) {
          console.warn('⚠️ Erro ao analisar cores instalados, continuando com instalação...');
        }
      }

      // Primeiro, atualizar índices para ter as informações mais recentes
      console.log('🔄 Atualizando índices antes da instalação...');
      const updateResult = await this.executeCommand('core update-index', {
        timeout: 120000 // 2 minutos para update
      });
      
      if (!updateResult.success) {
        console.warn('⚠️ Falha ao atualizar índices, continuando...');
      }

      // Instalar o core
      console.log(`📦 Iniciando instalação do core ${coreName}...`);
      const result = await this.executeCommand(`core install ${coreName}`, {
        timeout: 600000 // 10 minutos para instalação de core (ESP32 pode ser grande)
      });

      if (result.success) {
        console.log(`✅ Core ${coreName} instalado com sucesso`);
        
        // Verificar se a instalação foi bem-sucedida listando novamente
        const verifyResult = await this.executeCommand('core list --format json', {
          timeout: 30000
        });
        
        return {
          success: true,
          message: `Core ${coreName} instalado com sucesso`,
          output: result.output,
          verification: verifyResult.success ? 'Verified' : 'Install completed but verification failed'
        };
      } else {
        console.error(`❌ Erro ao instalar core ${coreName}:`, result.error);
        return {
          success: false,
          message: `Erro ao instalar core ${coreName}`,
          error: result.error,
          output: result.output
        };
      }
    } catch (error) {
      console.error(`❌ Exceção ao instalar core ${coreName}:`, error.message);
      return {
        success: false,
        message: `Exceção ao instalar core ${coreName}`,
        error: error.message
      };
    }
  }

  /**
   * Limpa diretório temporário
   */
  cleanupTempDir(tempDir) {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('Erro ao limpar diretório temporário:', error.message);
    }
  }

  /**
   * Verifica se o ESP32 core está instalado e disponível
   */
  async checkEsp32CoreAvailable() {
    try {
      console.log('🔍 Verificando disponibilidade do ESP32 core...');
      
      // Método 1: Verificar cores instalados (mais confiável)
      const listResult = await this.executeCommand('core list --format json');
      if (listResult.success && listResult.output) {
        try {
          const installedCores = JSON.parse(listResult.output);
          // Verificar se é array
          if (Array.isArray(installedCores)) {
            const esp32Core = installedCores.find(core => 
              core.id && (core.id.includes('esp32') || core.id === 'esp32:esp32')
            );
          
            if (esp32Core) {
              console.log('✅ ESP32 core encontrado via core list:', esp32Core.id);
              return {
                installed: true,
                core: esp32Core,
                version: esp32Core.installed || esp32Core.version || 'unknown',
                method: 'core_list'
              };
            }
          }
        } catch (parseError) {
          console.warn('⚠️ Erro ao analisar JSON dos cores instalados:', parseError.message);
        }
      }
      
      // Método 2: Teste direto de compilação (mais definitivo)
      console.log('🧪 Testando compilação ESP32 como verificação...');
      const testCode = 'void setup(){} void loop(){}';
      const tempDir = path.join(__dirname, 'temp', `esp32_test_${Date.now()}`);
      const sketchDir = path.join(tempDir, 'sketch');
      const sketchFile = path.join(sketchDir, 'sketch.ino');
      
      try {
        fs.mkdirSync(sketchDir, { recursive: true });
        fs.writeFileSync(sketchFile, testCode, { encoding: 'utf8', flag: 'w' });
        
        const compileTest = await this.executeCommand(`compile --fqbn esp32:esp32:esp32 "${sketchDir}"`, {
          timeout: 30000
        });
        
        // Limpar teste
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        if (compileTest.success) {
          console.log('✅ ESP32 core encontrado via teste de compilação');
          return {
            installed: true,
            method: 'compile_test',
            version: 'detected'
          };
        } else if (compileTest.error && compileTest.error.includes('platform not installed')) {
          console.log('❌ ESP32 core definitivamente não instalado');
          return {
            installed: false,
            message: 'ESP32 platform not installed',
            method: 'compile_test_failed'
          };
        }
      } catch (testError) {
        console.warn('⚠️ Erro no teste de compilação:', testError.message);
        // Limpar em caso de erro
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
      }
      
      console.log('❌ ESP32 core não encontrado por nenhum método');
      return {
        installed: false,
        message: 'ESP32 core não detectado'
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar ESP32 core:', error.message);
      return {
        installed: false,
        error: error.message
      };
    }
  }

  /**
   * Instalação inteligente do ESP32 core com verificações
   */
  async ensureEsp32CoreInstalled() {
    console.log('🚀 Verificando/instalando ESP32 core...');
    
    try {
      // Verificar se já está instalado
      const checkResult = await this.checkEsp32CoreAvailable();
      
      if (checkResult.installed) {
        console.log('✅ ESP32 core já está disponível');
        return {
          success: true,
          message: 'ESP32 core já instalado',
          alreadyInstalled: true,
          details: checkResult
        };
      }
      
      console.log('📦 ESP32 core não encontrado, iniciando instalação...');
      
      // Tentar instalar o ESP32 core
      const installResult = await this.installCore('esp32:esp32');
      
      if (installResult.success) {
        // Verificar novamente após instalação
        const verifyResult = await this.checkEsp32CoreAvailable();
        
        return {
          success: true,
          message: 'ESP32 core instalado com sucesso',
          freshInstall: true,
          installOutput: installResult.output,
          verification: verifyResult
        };
      } else {
        return {
          success: false,
          message: 'Falha ao instalar ESP32 core',
          error: installResult.error,
          installOutput: installResult.output
        };
      }
      
    } catch (error) {
      console.error('❌ Erro no processo de instalação ESP32:', error.message);
      return {
        success: false,
        message: 'Erro interno na instalação ESP32',
        error: error.message
      };
    }
  }

  /**
   * Upload funcional e simples para ESP32 
   */
  async strictUploadTest(code, port, board = 'esp32:esp32:esp32') {
    console.log('� Upload ESP32 - Método Direto');
    
    // 1. Validar código
    try {
      this.validateAndCleanCode(code);
      console.log('✅ Código validado');
    } catch (error) {
      throw new Error(`❌ CÓDIGO INVÁLIDO: ${error.message}`);
    }
    
    // 2. Verificar porta
    const portsResult = await this.listPorts();
    const portExists = portsResult.ports?.some(p => p.address === port);
    if (!portExists) {
      const available = portsResult.ports?.map(p => p.address).join(', ') || 'nenhuma';
      throw new Error(`❌ PORTA ${port} NÃO ENCONTRADA. Disponíveis: ${available}`);
    }
    console.log('✅ Porta disponível');
    
    // 3. Verificar ESP32 core
    const esp32Check = await this.checkEsp32CoreAvailable();
    if (!esp32Check.installed) {
      throw new Error(`❌ ESP32 CORE NÃO INSTALADO`);
    }
    console.log('✅ ESP32 core OK');
    
    // 4. Upload direto
    console.log('� Executando upload...');
    return await this.uploadSketch(code, port, board, { 
      timeout: 120000
    });
  }

  /**
   * Upload inteligente com auto-reset e fallback para ESP32
   */
  async uploadWithAutoBootloader(code, port, board = 'esp32:esp32:esp32') {
    console.log('🎯 Upload Inteligente ESP32 - Auto-reset + Fallback');
    
    const boardConfig = this.getEsp32BoardConfig(board);
    console.log(`📋 Placa: ${boardConfig.name} - ${boardConfig.description}`);
    
    // Estratégias de upload em ordem de tentativa
    const uploadStrategies = [
      {
        name: 'Auto-Reset Padrão',
        description: 'Tentativa automática com esptool auto-reset',
        options: {
          baudRate: boardConfig.uploadSpeed,
          flashMode: boardConfig.flashMode,
          timeout: boardConfig.timeout,
          autoReset: true,
          verbose: false
        }
      },
      {
        name: 'Auto-Reset Conservativo', 
        description: 'Velocidade reduzida + timeout estendido',
        options: {
          baudRate: '460800', // Velocidade mais conservativa
          flashMode: 'dio',
          timeout: boardConfig.timeout + 60000, // +1 minuto
          autoReset: true,
          verbose: false
        }
      },
      {
        name: 'Manual Reset Required',
        description: 'Última tentativa - requer reset manual',
        options: {
          baudRate: '115200', // Velocidade mais lenta e confiável
          flashMode: 'dio',
          timeout: boardConfig.timeout + 120000, // +2 minutos
          autoReset: false, // Sem auto-reset, usuário deve fazer manualmente
          verbose: true // Verbose para debug
        }
      }
    ];

    let lastError = null;
    
    for (let i = 0; i < uploadStrategies.length; i++) {
      const strategy = uploadStrategies[i];
      console.log(`📡 Estratégia ${i + 1}/${uploadStrategies.length}: ${strategy.name}`);
      console.log(`   ${strategy.description}`);
      
      try {
        const result = await this.uploadSketch(code, port, board, strategy.options);

        if (result.success) {
          console.log(`✅ Upload bem-sucedido com estratégia: ${strategy.name}`);
          return {
            ...result,
            strategy: strategy.name,
            attempts: i + 1,
            totalStrategies: uploadStrategies.length
          };
        } else {
          console.log(`❌ Estratégia ${i + 1} falhou: ${result.message}`);
          lastError = result;
          
          // Se é a última tentativa, retornar o erro
          if (i === uploadStrategies.length - 1) {
            return {
              ...result,
              message: `❌ TODAS AS ESTRATÉGIAS FALHARAM\n\n` +
                      `🔍 Última tentativa (${strategy.name}):\n${result.message}\n\n` +
                      `💡 PROCEDIMENTO MANUAL RECOMENDADO:\n` +
                      `1. Mantenha BOOT pressionado na ESP32\n` +
                      `2. Pressione e solte RESET (ainda segurando BOOT)\n` +
                      `3. Solte BOOT e tente novamente IMEDIATAMENTE`,
              strategy: 'ALL_FAILED',
              attempts: uploadStrategies.length,
              totalStrategies: uploadStrategies.length
            };
          }
          
          // Aguardar antes da próxima tentativa se for erro de comunicação
          if (result.errorType === 'ESP32_COMMUNICATION') {
            console.log('⏳ Aguardando 5 segundos antes da próxima estratégia...');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      } catch (error) {
        console.log(`❌ Exceção na estratégia ${i + 1}: ${error.message}`);
        
        if (i === uploadStrategies.length - 1) {
          return {
            success: false,
            message: `Todas as estratégias falharam. Último erro: ${error.message}`,
            error: error.message,
            strategy: 'EXCEPTION',
            attempts: uploadStrategies.length,
            totalStrategies: uploadStrategies.length
          };
        }
      }
    }
    
    // Fallback (não deve chegar aqui, mas por segurança)
    return lastError || {
      success: false,
      message: 'Erro desconhecido no upload inteligente',
      strategy: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Upload com retry específico para ESP32 - resolve problema "Packet content transfer stopped"
   */
  async uploadWithEsp32Retry(code, port, board = 'esp32:esp32:esp32') {
    console.log('� Upload ESP32 com configurações adaptativas...');
    
    // Configurações de upload para ESP32 em ordem de preferência
    const uploadConfigs = [
      // Configuração 1: Padrão ESP32 - mais rápida
      {
        name: 'Padrão ESP32 (921600 bps)',
        baudRate: '921600',
        flashMode: 'dio',
        timeout: 120000
      },
      // Configuração 2: Mais compatível - velocidade reduzida
      {
        name: 'Compatibilidade (460800 bps)',
        baudRate: '460800', 
        flashMode: 'dio',
        timeout: 150000
      },
      // Configuração 3: Máxima compatibilidade - mais lenta mas confiável
      {
        name: 'Máxima Compatibilidade (115200 bps)',
        baudRate: '115200',
        flashMode: 'dio',
        timeout: 180000
      }
    ];

    for (let i = 0; i < uploadConfigs.length; i++) {
      const config = uploadConfigs[i];
      console.log(`📡 Tentativa ${i + 1}/3: ${config.name}`);
      
      try {
        const result = await this.uploadSketch(code, port, board, {
          baudRate: config.baudRate,
          flashMode: config.flashMode,
          timeout: config.timeout,
          verbose: i === (uploadConfigs.length - 1) // Verbose apenas na última tentativa
        });

        if (result.success) {
          console.log(`✅ Upload bem-sucedido com configuração: ${config.name}`);
          return result;
        } else {
          console.log(`❌ Tentativa ${i + 1} falhou: ${result.message}`);
          
          // Se é a última tentativa, retornar o erro
          if (i === uploadConfigs.length - 1) {
            return result;
          }
          
          // Para ESP32_COMMUNICATION, aguardar um pouco antes da próxima tentativa
          if (result.errorType === 'ESP32_COMMUNICATION') {
            console.log('⏳ Aguardando 3 segundos antes da próxima tentativa...');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      } catch (error) {
        console.log(`❌ Exceção na tentativa ${i + 1}: ${error.message}`);
        
        if (i === uploadConfigs.length - 1) {
          return {
            success: false,
            message: `Todas as tentativas falharam. Último erro: ${error.message}`,
            error: error.message
          };
        }
      }
    }
  }

  /**
   * Diagnóstico completo do ESP32 para debug
   */
  async diagnosticEsp32() {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      tests: []
    };
    
    try {
      // Teste 1: Arduino CLI funcionando
      console.log('🧪 Teste 1: Verificando Arduino CLI...');
      const cliTest = await this.executeCommand('version');
      diagnostics.tests.push({
        name: 'Arduino CLI Version',
        success: cliTest.success,
        output: cliTest.output?.trim(),
        error: cliTest.error
      });
      
      // Teste 2: Listar cores instalados
      console.log('🧪 Teste 2: Listando cores...');
      const coreTest = await this.executeCommand('core list');
      diagnostics.tests.push({
        name: 'Core List (text)',
        success: coreTest.success,
        output: coreTest.output?.substring(0, 500), // Limitar output
        containsEsp32: coreTest.output?.includes('esp32')
      });
      
      // Teste 3: Compilação de teste
      console.log('🧪 Teste 3: Teste de compilação ESP32...');
      const testCode = 'void setup(){Serial.begin(115200);} void loop(){delay(1000);}';
      const compileResult = await this.compileSketch(testCode, 'esp32:esp32:esp32');
      diagnostics.tests.push({
        name: 'ESP32 Compile Test',
        success: compileResult.success,
        message: compileResult.message,
        error: compileResult.error
      });
      
      // Teste 4: Verificar configuração
      console.log('🧪 Teste 4: Verificando configuração...');
      const configExists = fs.existsSync(this.configPath);
      diagnostics.tests.push({
        name: 'Config File',
        success: configExists,
        path: this.configPath,
        exists: configExists
      });
      
      return diagnostics;
      
    } catch (error) {
      diagnostics.error = error.message;
      return diagnostics;
    }
  }

  /**
   * Verifica se o Arduino CLI está funcionando
   */
  async healthCheck() {
    try {
      const result = await this.executeCommand('version');
      return {
        success: result.success,
        version: result.output.trim(),
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        version: null,
        error: error.message
      };
    }
  }
}

module.exports = ArduinoCLIService;
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
      // Tentar baixar automaticamente
      console.log('⬬ Arduino CLI não encontrado, tentando instalar...');
      const ArduinoCLIInstaller = require('../install-arduino-cli');
      const installer = new ArduinoCLIInstaller();
      await installer.install();
      
      // Verificar novamente
      if (!fs.existsSync(this.cliPath)) {
        throw new Error(`Arduino CLI não encontrado em ${this.cliPath}. Execute: npm run install-cli`);
      }
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
   * Compila um sketch Arduino
   */
  async compileSketch(code, board = 'esp32:esp32:esp32', options = {}) {
    // Criar diretório temporário para o sketch
    const tempDir = path.join(__dirname, 'temp', `sketch_${Date.now()}`);
    const sketchDir = path.join(tempDir, 'sketch');
    const sketchFile = path.join(sketchDir, 'sketch.ino');

    try {
      // Criar diretórios
      fs.mkdirSync(sketchDir, { recursive: true });
      
      // Escrever código no arquivo
      fs.writeFileSync(sketchFile, code, 'utf8');

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
   * Faz upload de um sketch para a placa
   */
  async uploadSketch(code, port, board = 'esp32:esp32:esp32', options = {}) {
    const tempDir = path.join(__dirname, 'temp', `upload_${Date.now()}`);
    const sketchDir = path.join(tempDir, 'sketch');
    const sketchFile = path.join(sketchDir, 'sketch.ino');

    try {
      // Criar diretórios
      fs.mkdirSync(sketchDir, { recursive: true });
      
      // Escrever código no arquivo
      fs.writeFileSync(sketchFile, code, 'utf8');

      // Verificar se a porta existe antes de tentar usar
      console.log(`🔍 Verificando disponibilidade da porta ${port}...`);
      
      // Listar portas disponíveis primeiro
      const portsCheck = await this.listPorts();
      const portAvailable = portsCheck.ports && portsCheck.ports.some(p => p.address === port);
      
      if (!portAvailable) {
        console.warn(`⚠️ Porta ${port} não encontrada nas portas disponíveis`);
        console.log('📋 Portas disponíveis:', portsCheck.ports?.map(p => p.address).join(', ') || 'nenhuma');
      }

      // Construir comando de upload com opções avançadas
      let uploadCommand = `compile --upload --fqbn ${board} --port ${port}`;
      
      // Adicionar opções avançadas usando --build-property (sintaxe correta do Arduino CLI)
      if (options.baudRate) {
        uploadCommand += ` --build-property upload.speed=${options.baudRate}`;
      }
      
      if (options.flashMode) {
        uploadCommand += ` --build-property build.flash_mode=${options.flashMode}`;
      }
      
      if (options.flashSize) {
        uploadCommand += ` --build-property build.flash_size=${options.flashSize}`;
      }
      
      // Opções verbosas para debug
      if (options.verbose) {
        uploadCommand += ' --verbose';
      }
      
      uploadCommand += ` "${sketchDir}"`;
      
      console.log(`🚀 Executando comando de upload: ${uploadCommand}`);
      
      // Aguardar um pouco para garantir que a porta está livre
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await this.executeCommand(uploadCommand, {
        timeout: options.timeout || 120000 // 2 minutos para upload por padrão
      });

      // Limpar diretório temporário
      this.cleanupTempDir(tempDir);

      if (result.success) {
        return {
          success: true,
          message: 'Upload realizado com sucesso!',
          output: result.output
        };
      } else {
        // Analisar o tipo de erro para dar feedback específico
        let errorAnalysis = this.analyzeUploadError(result.error, port);
        
        return {
          success: false,
          message: 'Erro no upload',
          error: result.error,
          output: result.output,
          errorType: errorAnalysis.type,
          suggestions: errorAnalysis.suggestions
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
   * Analisa erros de upload para dar sugestões específicas
   */
  analyzeUploadError(errorMessage, port) {
    const error = (errorMessage || '').toLowerCase();
    
    // Erro de porta em uso
    if (error.includes('resource busy') || error.includes('permission denied') || 
        error.includes('access denied') || error.includes('device busy')) {
      return {
        type: 'PORT_BUSY',
        suggestions: [
          'Feche qualquer Monitor Serial que esteja aberto',
          'Feche o Arduino IDE se estiver usando a mesma porta',
          'Desconecte e reconecte o cabo USB da ESP32',
          'Aguarde 5 segundos e tente novamente'
        ]
      };
    }
    
    // Erro de comunicação com ESP32
    if (error.includes('packet content transfer stopped') || 
        error.includes('failed uploading') || 
        error.includes('timeout')) {
      return {
        type: 'ESP32_COMMUNICATION',
        suggestions: [
          'Pressione e mantenha o botão BOOT na ESP32',
          'Pressione o botão RESET enquanto mantém BOOT pressionado',
          'Solte RESET primeiro, depois BOOT',
          'Tente o upload imediatamente após soltar os botões'
        ]
      };
    }
    
    // Porta não encontrada
    if (error.includes('no such file') || error.includes('port not found') || 
        error.includes('device not found')) {
      return {
        type: 'PORT_NOT_FOUND',
        suggestions: [
          'Verifique se a ESP32 está conectada via USB',
          'Instale os drivers CH340 ou CP2102',
          'Tente uma porta USB diferente',
          'Verifique se o cabo USB é de dados (não apenas carregamento)'
        ]
      };
    }
    
    // Core ESP32 não encontrado
    if (error.includes('platform not installed') || error.includes('esp32:esp32')) {
      return {
        type: 'CORE_MISSING',
        suggestions: [
          'Instale o ESP32 core: arduino-cli core install esp32:esp32',
          'Atualize os índices: arduino-cli core update-index',
          'Verifique se as URLs do ESP32 estão configuradas'
        ]
      };
    }
    
    return {
      type: 'UNKNOWN',
      suggestions: [
        'Verifique a conexão da ESP32',
        'Reinicie a ESP32 pressionando o botão RESET',
        'Tente usar uma taxa de transmissão menor (115200)',
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
      
      // Verificar cores instalados
      const listResult = await this.executeCommand('core list --format json');
      if (listResult.success && listResult.output) {
        try {
          const installedCores = JSON.parse(listResult.output);
          const esp32Core = installedCores.find(core => 
            core.id && (core.id.includes('esp32') || core.id === 'esp32:esp32')
          );
          
          if (esp32Core) {
            console.log('✅ ESP32 core encontrado:', esp32Core.id);
            return {
              installed: true,
              core: esp32Core,
              version: esp32Core.installed || esp32Core.version || 'unknown'
            };
          }
        } catch (parseError) {
          console.warn('⚠️ Erro ao analisar cores instalados');
        }
      }
      
      // Verificar se ESP32 boards estão disponíveis
      const boardsResult = await this.executeCommand('board listall esp32 --format json');
      if (boardsResult.success && boardsResult.output) {
        try {
          const esp32Boards = JSON.parse(boardsResult.output);
          if (esp32Boards && esp32Boards.length > 0) {
            console.log(`✅ ${esp32Boards.length} placas ESP32 detectadas`);
            return {
              installed: true,
              boards: esp32Boards.slice(0, 3), // Mostrar apenas as primeiras 3
              boardCount: esp32Boards.length
            };
          }
        } catch (parseError) {
          console.warn('⚠️ Erro ao analisar placas ESP32');
        }
      }
      
      console.log('❌ ESP32 core não encontrado');
      return {
        installed: false,
        message: 'ESP32 core não está instalado'
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
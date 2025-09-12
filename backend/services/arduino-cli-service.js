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
      const data = JSON.parse(result.output || '[]');
      const ports = data.map(port => ({
        address: port.port?.address || '',
        protocol: port.port?.protocol || 'serial',
        protocolLabel: port.port?.protocol_label || 'Serial Port',
        boards: port.matching_boards || [],
        serialNumber: port.port?.properties?.serialNumber || '',
        vid: port.port?.properties?.vid || '',
        pid: port.port?.properties?.pid || ''
      }));

      return { ports, error: null };
    } catch (parseError) {
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

      // Comando de upload
      const uploadCommand = `compile --upload --fqbn ${board} --port ${port} "${sketchDir}"`;
      
      const result = await this.executeCommand(uploadCommand, {
        timeout: options.timeout || 120000 // 2 minutos para upload
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
        return {
          success: false,
          message: 'Erro no upload',
          error: result.error,
          output: result.output
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
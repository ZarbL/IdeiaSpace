/**
 * Serviço Arduino CLI - Abstração para comandos do Arduino CLI
 * Gerencia compilação, upload, portas seriais e bibliotecas
 */

const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const { SerialPort } = require('serialport');

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
    // USAR O ARQUIVO DE CONFIGURAÇÃO PRINCIPAL (onde os cores estão instalados)
    this.configPath = path.join(__dirname, '..', 'arduino-cli', 'arduino-cli.yaml');

    // GARANTIR que o Arduino CLI use APENAS configurações locais
    process.env.ARDUINO_CONFIG_FILE = this.configPath;
    process.env.ARDUINO_DATA_DIR = path.join(__dirname, '..', 'arduino-cli', 'config', 'data');
    process.env.ARDUINO_LIBRARY_DIR = path.join(__dirname, '..', 'arduino-cli', 'config', 'user', 'libraries');

    // Logs apenas na primeira inicialização
    console.log(`🔍 Procurando Arduino CLI em: ${this.cliPath}`);
    console.log(`🔧 Configuração: ${this.configPath}`);
    
    if (!fs.existsSync(this.cliPath)) {
      throw new Error(`❌ Arduino CLI não encontrado em ${this.cliPath}.\n💡 O auto-setup deve instalar automaticamente. Use PRIMEIRO-SETUP.bat se necessário`);
    }

    this.isInitialized = true;
    console.log('✅ Arduino CLI Service inicializado');
  }

  /**
   * Retorna o diretório temporário correto para o OS atual
   */
  getTempDirectory(subPath = '') {
    let osTempDir;
    
    if (process.platform === 'win32') {
      // Windows: tentar variáveis de ambiente, senão usar localAppData
      osTempDir = process.env.TEMP || process.env.TMP || 
                  path.join(process.env.LOCALAPPDATA || process.env.USERPROFILE || 'C:\\Users\\Default', 'Temp');
    } else {
      // macOS/Linux: usar TMPDIR ou /tmp
      osTempDir = process.env.TMPDIR || '/tmp';
    }
    
    // Limpar trailing slashes
    osTempDir = osTempDir.replace(/[\/\\]+$/, '');
    
    return subPath ? path.join(osTempDir, subPath) : osTempDir;
  }

  /**
   * Executa comando do Arduino CLI
   */
  async executeCommand(command, options = {}) {
    await this.initialize();
    
    const fullCommand = `"${this.cliPath}" --config-file "${this.configPath}" ${command}`;
    
    // Se há callback onData, usar spawn direto sem cmd
    if (options.onData) {
      const { spawn } = require('child_process');
      
      return new Promise((resolve) => {
        console.log(`🔧 Executando com callback: ${command}`);
        
        // Parser inteligente para argumentos com aspas
        const parseArgs = (cmd) => {
          const args = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < cmd.length; i++) {
            const char = cmd[i];
            
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ' ' && !inQuotes) {
              if (current.trim()) {
                args.push(current.trim());
                current = '';
              }
            } else {
              current += char;
            }
          }
          
          if (current.trim()) {
            args.push(current.trim());
          }
          
          return args;
        };
        
        const commandArgs = parseArgs(command);
        const args = ['--config-file', this.configPath, ...commandArgs];
        console.log(`🔧 Args parseados: ${JSON.stringify(args)}`);
        
        const child = spawn(this.cliPath, args, {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
          const text = data.toString();
          stdout += text;
          
          text.split('\n').forEach(line => {
            if (line.trim()) {
              options.onData(line.trim());
            }
          });
        });

        child.stderr.on('data', (data) => {
          const text = data.toString();
          stderr += text;
          
          text.split('\n').forEach(line => {
            if (line.trim()) {
              options.onData(line.trim());
            }
          });
        });

        child.on('close', (code) => {
          resolve({
            success: code === 0,
            output: stdout,
            error: stderr,
            exitCode: code
          });
        });

        if (options.timeout) {
          setTimeout(() => {
            child.kill();
            resolve({
              success: false,
              output: stdout,
              error: stderr + '\nTimeout exceeded',
              exitCode: -1
            });
          }, options.timeout);
        }
      });
    }
    
    // Comportamento original para comandos sem callback
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
      
      // Análise específica de tipos de erro
      let errorCategory = 'unknown';
      let userFriendlyMessage = error.message;
      
      if (error.code === 'ENOENT') {
        errorCategory = 'file_not_found';
        userFriendlyMessage = 'Arduino CLI não encontrado. Verifique a instalação.';
      } else if (error.code === 'TIMEOUT' || error.signal === 'SIGTERM') {
        errorCategory = 'timeout';
        userFriendlyMessage = 'Comando demorou muito para responder. Tente novamente.';
      } else if (error.stderr && error.stderr.includes('permission denied')) {
        errorCategory = 'permission';
        userFriendlyMessage = 'Permissão negada. Execute como administrador.';
      } else if (error.stderr && (error.stderr.includes('not found') || error.stderr.includes('No such'))) {
        errorCategory = 'resource_not_found';
        userFriendlyMessage = 'Recurso não encontrado. Verifique a configuração.';
      } else if (error.stderr && error.stderr.includes('connection')) {
        errorCategory = 'connection';
        userFriendlyMessage = 'Problema de conexão. Verifique a internet e portas USB.';
      }
      
      return {
        success: false,
        output: error.stdout || '',
        error: error.stderr || error.message,
        errorCategory: errorCategory,
        userFriendlyMessage: userFriendlyMessage,
        originalError: error
      };
    }
  }

  /**
   * Lista todas as portas seriais disponíveis
   */
  async listPorts() {
    try {
      // Log reduzido - apenas em debug
      // console.log('🔍 Listando portas seriais disponíveis...');
      const result = await this.executeCommand('board list --format json --discovery-timeout 5s');
      
      if (!result.success) {
        console.error('❌ Erro ao executar comando board list:', result.error);
        return { ports: [], error: result.error };
      }

      // Verificar se há output válido
      if (!result.output || result.output.trim() === '') {
        console.warn('⚠️ Output vazio do comando board list');
        return { ports: [], error: 'Nenhuma resposta do Arduino CLI' };
      }

      try {
        const data = JSON.parse(result.output.trim());
        const detectedPorts = data.detected_ports || [];
        
        // Log reduzido
        // console.log(`📡 Encontradas ${detectedPorts.length} portas`);
        
        const ports = detectedPorts.map(portData => {
          const port = portData.port || {};
          return {
            address: port.address || '',
            protocol: port.protocol || 'serial',
            protocolLabel: port.protocol_label || 'Serial Port',
            boards: portData.matching_boards || [],
            serialNumber: port.properties?.serialNumber || '',
            vid: port.properties?.vid || '',
            pid: port.properties?.pid || '',
            manufacturer: this.getManufacturerFromVID(port.properties?.vid)
          };
        });

        // Log simplificado
        console.log(`✅ ${detectedPorts.length} porta(s) detectada(s)`);
        return { ports, error: null };
        
      } catch (parseError) {
        console.error('❌ Erro ao analisar JSON das portas:', parseError.message);
        console.error('📄 Output recebido:', result.output.substring(0, 500) + '...');
        
        // Fallback: tentar extrair portas do texto plano
        return this.extractPortsFromPlainText(result.output);
      }
    } catch (error) {
      console.error('❌ Erro crítico ao listar portas:', error.message);
      return { ports: [], error: `Erro crítico: ${error.message}` };
    }
  }

  /**
   * Extrai portas do output em texto plano como fallback
   */
  extractPortsFromPlainText(output) {
    try {
      console.log('🔄 Tentando extrair portas do texto plano...');
      const lines = output.split('\n').filter(line => line.trim());
      const ports = [];
      
      for (const line of lines) {
        // Buscar padrão: COMx serial "descrição"
        const comMatch = line.match(/^(COM\d+)\s+(\w+)\s+(.+)/);
        if (comMatch) {
          ports.push({
            address: comMatch[1],
            protocol: comMatch[2] || 'serial',
            protocolLabel: comMatch[3] || 'Serial Port',
            boards: [],
            serialNumber: '',
            vid: '',
            pid: '',
            manufacturer: 'Unknown'
          });
        }
      }
      
      if (ports.length > 0) {
        console.log(`✅ Extraídas ${ports.length} portas do texto plano`);
        return { ports, error: null };
      } else {
        console.log('❌ Nenhuma porta encontrada no texto plano');
        return { ports: [], error: 'Nenhuma porta detectada' };
      }
    } catch (error) {
      console.error('❌ Erro no fallback de texto plano:', error.message);
      return { ports: [], error: 'Erro no processamento de portas' };
    }
  }

  /**
   * Obtém fabricante baseado no VID (Vendor ID)
   */
  getManufacturerFromVID(vid) {
    if (!vid) return 'Unknown';
    
    const vendors = {
      '0X1A86': 'QinHeng Electronics (CH340/CH341)',
      '0X10C4': 'Silicon Labs (CP210x)',
      '0X0403': 'FTDI',
      '0X2341': 'Arduino',
      '0X239A': 'Adafruit',
      '0X1B4F': 'SparkFun',
      '0X16C0': 'Van Ooijen Technische Informatica',
      '0X303A': 'Espressif Systems (ESP32)',
      '0X04D8': 'Microchip Technology',
      '0X2E8A': 'Raspberry Pi (Pico)',
      '0X1366': 'SEGGER (J-Link)',
      '0X0D28': 'ARM (DAPLink)'
    };
    
    return vendors[vid.toUpperCase()] || `Unknown (${vid})`;
  }

  /**
   * Verifica se uma porta é uma ESP32 baseado em VID/PID
   */
  isESP32Port(vid, pid) {
    if (!vid) return false;
    
    const vidUpper = vid.toUpperCase();
    const pidUpper = pid ? pid.toUpperCase() : '';
    
    // VIDs conhecidos de ESP32
    const esp32VIDs = [
      '0X303A',  // Espressif oficial
      '0X10C4',  // CP210x (usado em muitas ESP32)
      '0X1A86',  // CH340 (comum em clones ESP32)
      '0X0403'   // FTDI (algumas ESP32 DevKit)
    ];
    
    // PIDs específicos de ESP32
    const esp32PIDs = {
      '0X303A': ['0X1001', '0X0002'],  // ESP32-S2, ESP32-C3
      '0X10C4': ['0XEA60'],            // CP2102 (comum em ESP32)
      '0X1A86': ['0X7523', '0X5523']   // CH340G/C (clones ESP32)
    };
    
    // Verificar VID
    if (!esp32VIDs.includes(vidUpper)) {
      return false;
    }
    
    // Se for VID oficial da Espressif, é ESP32 com certeza
    if (vidUpper === '0X303A') {
      return true;
    }
    
    // Para outros VIDs, verificar PID se disponível
    if (pidUpper && esp32PIDs[vidUpper]) {
      return esp32PIDs[vidUpper].includes(pidUpper);
    }
    
    // Se não tem PID mas tem VID comum de ESP32, considerar como possível
    return true;
  }

  /**
   * Lista portas e identifica ESP32 automaticamente
   */
  async listPortsWithESP32Detection() {
    try {
      // Log reduzido
      // console.log('🔍 Listando portas com detecção de ESP32...');
      const result = await this.listPorts();
      
      if (result.error || !result.ports) {
        return result;
      }

      // Enriquecer informações das portas
      const portsEnriched = result.ports.map(port => {
        const isESP32 = this.isESP32Port(port.vid, port.pid);
        const manufacturer = this.getManufacturerFromVID(port.vid);
        
        return {
          ...port,
          isESP32: isESP32,
          deviceType: isESP32 ? 'ESP32' : 'Other',
          manufacturerDetailed: manufacturer,
          description: this.getPortDescription(port, isESP32, manufacturer)
        };
      });

      // Ordenar: ESP32 primeiro
      portsEnriched.sort((a, b) => {
        if (a.isESP32 && !b.isESP32) return -1;
        if (!a.isESP32 && b.isESP32) return 1;
        return a.address.localeCompare(b.address);
      });

      const esp32Count = portsEnriched.filter(p => p.isESP32).length;
      console.log(`✅ Encontradas ${portsEnriched.length} portas (${esp32Count} ESP32)`);
      
      return { 
        ports: portsEnriched, 
        error: null,
        esp32Count: esp32Count
      };
      
    } catch (error) {
      console.error('❌ Erro ao detectar ESP32:', error.message);
      return { ports: [], error: error.message, esp32Count: 0 };
    }
  }

  /**
   * Gera descrição amigável da porta
   */
  getPortDescription(port, isESP32, manufacturer) {
    if (isESP32) {
      if (manufacturer.includes('Espressif')) {
        return `🎯 ESP32 Official (${port.address})`;
      } else if (manufacturer.includes('CH340')) {
        return `🎯 ESP32 DevKit (CH340) - ${port.address}`;
      } else if (manufacturer.includes('CP210')) {
        return `🎯 ESP32 DevKit (CP2102) - ${port.address}`;
      } else {
        return `🎯 ESP32 (${manufacturer}) - ${port.address}`;
      }
    }
    
    return `${port.protocolLabel} - ${port.address}`;
  }

  /**
   * Valida e limpa o código antes da compilação
   */
  validateAndCleanCode(code) {
    console.log('🧹 Iniciando validação do código...');
    console.log('📝 Código recebido (tipo):', typeof code);
    console.log('📝 Código recebido (tamanho):', code ? code.length : 'null');
    
    if (!code || typeof code !== 'string') {
      console.error('❌ Código deve ser uma string válida');
      throw new Error('Código deve ser uma string válida');
    }
    
    // Remove diferentes tipos de BOM e caracteres de controle
    let cleanCode = code
      .replace(/^\uFEFF/, '')  // UTF-8 BOM
      .replace(/^\uFFFE/, '')  // UTF-16 BE BOM
      .replace(/^\u0000\uFEFF/, '')  // UTF-16 LE BOM
      .replace(/^[\u0000-\u001F\u007F-\u009F]+/, '')  // Caracteres de controle
      .trim();
    
    console.log(`🧹 Código após limpeza (primeiros 100 chars): ${cleanCode.substring(0, 100)}...`);
    console.log(`📊 Tamanho após limpeza: ${cleanCode.length} chars`);
    
    // Verificar se tem pelo menos setup() e loop()
    const hasSetup = cleanCode.includes('setup()') || cleanCode.includes('void setup()');
    const hasLoop = cleanCode.includes('loop()') || cleanCode.includes('void loop()');
    
    console.log('🔍 Verificação de estrutura:');
    console.log('  - setup():', hasSetup);
    console.log('  - loop():', hasLoop);
    
    if (!hasSetup) {
      console.error('❌ Validação falhou: setup() não encontrado');
      console.error('📝 Código recebido (amostra):', cleanCode.substring(0, 200));
      throw new Error('Código deve conter uma função setup()');
    }
    
    if (!hasLoop) {
      console.error('❌ Validação falhou: loop() não encontrado');
      console.error('📝 Código recebido (amostra):', cleanCode.substring(0, 200));
      throw new Error('Código deve conter uma função loop()');
    }
    
    console.log('✅ Validação do código bem-sucedida');
    return cleanCode;
  }

  /**
   * Compila um sketch Arduino
   */
  async compileSketch(code, board = 'esp32:esp32:esp32', options = {}) {
    const tempDir = this.getTempDirectory(path.join('ideiaspace', 'arduino_sketches', `compile_${Date.now()}`));
    const sketchDir = path.join(tempDir, 'sketch');
    const sketchFile = path.join(sketchDir, 'sketch.ino');
    const buildDir = this.getTempDirectory(path.join('ideiaspace', 'arduino_builds', `build_${Date.now()}`));

    try {
      // Validar código
      const cleanCode = this.validateAndCleanCode(code);
      
      // Criar diretórios
      fs.mkdirSync(sketchDir, { recursive: true });
      fs.mkdirSync(buildDir, { recursive: true });
      
      // Escrever código no arquivo
      fs.writeFileSync(sketchFile, cleanCode, 'utf8');

      // Obter caminho das bibliotecas
      const librariesPath = path.join(__dirname, '..', 'arduino-cli', 'config', 'user', 'libraries');
      
      // Comando de compilação com build-path alternativo
      const compileCommand = `compile --fqbn ${board} --build-path "${buildDir}" --libraries "${librariesPath}" "${sketchDir}"`;
      
      console.log(`🔨 Compilando para ${board}...`);
      console.log(`📁 Usando build path: ${buildDir}`);
      console.log(`📚 Usando bibliotecas: ${librariesPath}`);
      const result = await this.executeCommand(compileCommand, {
        timeout: options.timeout || 60000
      });

      // Limpar diretórios temporários
      this.cleanupTempDir(tempDir);
      this.cleanupTempDir(buildDir);

      if (result.success) {
        return {
          success: true,
          message: 'Compilação bem-sucedida!',
          output: result.output,
          board: board
        };
      } else {
        return {
          success: false,
          message: 'Erro na compilação',
          error: result.error,
          output: result.output,
          board: board
        };
      }

    } catch (error) {
      this.cleanupTempDir(tempDir);
      this.cleanupTempDir(buildDir);
      return {
        success: false,
        message: 'Erro interno na compilação',
        error: error.message,
        board: board
      };
    }
  }

  /**
   * Compila sketch e retorna informações detalhadas sobre o binário
   */
  async compileWithOutput(code, board = 'esp32:esp32:esp32', options = {}) {
    const tempDir = this.getTempDirectory(path.join('ideiaspace', 'arduino_sketches', `compile_output_${Date.now()}`));
    const sketchDir = path.join(tempDir, 'sketch');
    const sketchFile = path.join(sketchDir, 'sketch.ino');
    const buildDir = path.join(tempDir, 'build');

    try {
      // Validar código
      const cleanCode = this.validateAndCleanCode(code);
      
      // Criar diretórios
      fs.mkdirSync(sketchDir, { recursive: true });
      fs.mkdirSync(buildDir, { recursive: true });
      
      // Escrever código no arquivo
      fs.writeFileSync(sketchFile, cleanCode, 'utf8');

      // Obter caminho das bibliotecas
      const librariesPath = path.join(__dirname, '..', 'arduino-cli', 'config', 'user', 'libraries');
      
      // Comando de compilação com saída em diretório específico
      const compileCommand = `compile --fqbn ${board} --build-path "${buildDir}" --libraries "${librariesPath}" "${sketchDir}"`;
      
      console.log(`🔨 Compilando com saída para ${board}...`);
      const result = await this.executeCommand(compileCommand, {
        timeout: options.timeout || 90000
      });

      if (result.success) {
        // Buscar arquivos binários gerados
        const binFiles = [];
        if (fs.existsSync(buildDir)) {
          const files = fs.readdirSync(buildDir);
          files.forEach(file => {
            if (file.endsWith('.bin') || file.endsWith('.hex') || file.endsWith('.elf')) {
              const filePath = path.join(buildDir, file);
              const stats = fs.statSync(filePath);
              binFiles.push({
                name: file,
                path: filePath,
                size: stats.size,
                type: path.extname(file)
              });
            }
          });
        }

        // Manter arquivos temporários por um tempo para upload posterior
        const cleanup = () => this.cleanupTempDir(tempDir);
        setTimeout(cleanup, 300000); // Limpar após 5 minutos

        return {
          success: true,
          message: 'Compilação bem-sucedida com saída!',
          output: result.output,
          board: board,
          buildPath: buildDir,
          binFiles: binFiles,
          tempDir: tempDir
        };
      } else {
        this.cleanupTempDir(tempDir);
        return {
          success: false,
          message: 'Erro na compilação',
          error: result.error,
          output: result.output,
          board: board
        };
      }

    } catch (error) {
      this.cleanupTempDir(tempDir);
      return {
        success: false,
        message: 'Erro interno na compilação',
        error: error.message,
        board: board
      };
    }
  }

  /**
   * Tenta colocar ESP32 em modo boot usando sinais DTR/RTS
   * Sequência: DTR=LOW, RTS=HIGH → delay → DTR=HIGH, RTS=LOW
   * Equivale a: EN=LOW (reset), IO0=LOW (boot) → EN=HIGH (run in boot mode)
   */
  async resetESP32ToBootMode(port) {
    return new Promise((resolve, reject) => {
      console.log(`🔄 Abrindo porta ${port} para reset...`);
      
      const serialPort = new SerialPort({
        path: port,
        baudRate: 115200,
        autoOpen: false
      });

      serialPort.open((err) => {
        if (err) {
          return reject(new Error(`Não foi possível abrir porta: ${err.message}`));
        }

        console.log('📡 Porta aberta, enviando sequência de reset...');

        // Sequência de reset para modo boot
        // DTR controla EN (reset), RTS controla IO0 (boot)
        
        // Passo 1: EN=LOW (reset), IO0=LOW (boot mode)
        serialPort.set({ dtr: false, rts: true }, (err) => {
          if (err) {
            serialPort.close();
            return reject(new Error(`Erro ao setar DTR/RTS: ${err.message}`));
          }

          console.log('📍 Passo 1: EN=LOW, IO0=LOW (entrando em reset + boot)');

          // Aguardar 100ms
          setTimeout(() => {
            // Passo 2: EN=HIGH (sair do reset mantendo IO0=LOW)
            serialPort.set({ dtr: true, rts: true }, (err) => {
              if (err) {
                serialPort.close();
                return reject(new Error(`Erro ao liberar reset: ${err.message}`));
              }

              console.log('📍 Passo 2: EN=HIGH, IO0=LOW (ESP32 inicia em modo boot)');

              // Aguardar 50ms
              setTimeout(() => {
                // Passo 3: Liberar IO0
                serialPort.set({ dtr: true, rts: false }, (err) => {
                  if (err) {
                    serialPort.close();
                    return reject(new Error(`Erro ao liberar IO0: ${err.message}`));
                  }

                  console.log('📍 Passo 3: IO0=HIGH (modo boot ativo)');

                  // Fechar porta
                  serialPort.close((err) => {
                    if (err) {
                      console.log(`⚠️ Aviso ao fechar porta: ${err.message}`);
                    }
                    console.log('✅ Sequência de reset completa');
                    resolve();
                  });
                });
              }, 50);
            });
          }, 100);
        });
      });
    });
  }

  /**
   * Upload DIRETO e SIMPLES para ESP32 - SEM ESTRATÉGIAS MÚLTIPLAS
   * Suporta apenas: ESP32 Dev Module e ESP32 Wrover via cabo
   */
  async uploadESP32Direct(code, port, board = 'esp32:esp32:esp32', onProgress = null) {
    const timestamp = Date.now();
    const sketchName = 'esp32_sketch';
    
    // Usar método auxiliar para diretório temporário
    const tempDir = this.getTempDirectory(path.join('ideiaspace', `${timestamp}`));
    const sketchDir = path.join(tempDir, sketchName);
    const sketchFile = path.join(sketchDir, `${sketchName}.ino`);

    try {
      // 1. Validar código
      console.log('🔍 Validando código ESP32...');
      const cleanCode = this.validateAndCleanCode(code);
      
      // 2. Criar estrutura mínima
      console.log(`📁 Criando sketch: ${sketchDir}`);
      fs.mkdirSync(sketchDir, { recursive: true });
      fs.writeFileSync(sketchFile, cleanCode, 'utf8');
      
      // 3. Verificar porta
      console.log(`📡 Verificando porta ${port}...`);
      const portsResult = await this.listPorts();
      const portExists = portsResult.ports?.some(p => p.address === port);
      if (!portExists) {
        const available = portsResult.ports?.map(p => p.address).join(', ') || 'nenhuma';
        throw new Error(`Porta ${port} não encontrada. Disponíveis: ${available}`);
      }

      // 3.5. Tentar reset automático da ESP32 (DTR/RTS)
      console.log(`🔄 Tentando reset automático da ESP32 em ${port}...`);
      try {
        await this.resetESP32ToBootMode(port);
        console.log('✅ Reset automático enviado - ESP32 deve estar em modo boot');
        if (onProgress) {
          onProgress({
            type: 'upload_info',
            message: '🔄 Reset automático enviado para ESP32',
            timestamp: Date.now()
          });
        }
      } catch (resetError) {
        console.log(`⚠️ Reset automático falhou: ${resetError.message}`);
        console.log('💡 Se o upload falhar, use o modo manual (botões BOOT + EN)');
        if (onProgress) {
          onProgress({
            type: 'upload_warning',
            message: '⚠️ Reset automático não funcionou - modo manual pode ser necessário',
            timestamp: Date.now()
          });
        }
      }

      // 4. Upload com sistema de fallback: Windows primeiro, depois macOS
      console.log(`🚀 Upload ESP32 para ${port} (tentativa múltipla)...`);
      
      // Obter caminho das bibliotecas
      const librariesPath = path.join(__dirname, '..', 'arduino-cli', 'config', 'user', 'libraries');
      
      // Primeira tentativa: configurações Windows (padrão que funcionava)
      let uploadCommand = `compile --fqbn ${board} --upload --port ${port} --verify "${sketchDir}" --libraries "${librariesPath}" --build-property "upload.speed=115200"`;
      console.log(`🔧 Primeira tentativa (Windows config): ${uploadCommand}`);
      
      // Variável para detectar wrong boot mode
      let wrongBootModeDetected = false;
      
      // Progress callback com instruções específicas para macOS
      const handleProgress = (line) => {
        // Detectar wrong boot mode
        if (line.includes('Wrong boot mode detected') || line.includes('0x13')) {
          wrongBootModeDetected = true;
          console.log('⚠️ Wrong boot mode detectado (0x13) - ESP32 está em execução normal');
        }
        
        if (onProgress && (
          line.includes('Connecting') || 
          line.includes('Uploading') ||
          line.includes('Writing') ||
          line.includes('Hash of data verified') ||
          line.includes('Hard resetting') ||
          line.includes('%')
        )) {
          onProgress({
            type: 'upload_progress',
            message: line.trim(),
            timestamp: Date.now()
          });
        }
        
        // Instruções específicas para macOS durante conexão
        if (line.includes('Connecting') && process.platform === 'darwin') {
          if (onProgress) {
            onProgress({
              type: 'upload_instruction',
              message: '🍎 macOS: Segure o botão BOOT no ESP32 e pressione o botão EN (reset) uma vez, depois solte o BOOT',
              timestamp: Date.now()
            });
          }
        }
        
        console.log(`📡 ${line}`);
      };
      
      // SISTEMA DE TENTATIVAS MÚLTIPLAS
      let result;
      let attemptNumber = 1;
      let lastError = '';
      
      // Primeira tentativa: configurações Windows (padrão)
      console.log(`🔄 Tentativa ${attemptNumber}: Configurações Windows`);
      result = await this.executeCommand(uploadCommand, {
        timeout: 120000, // 2 minutos para ESP32
        onData: handleProgress
      });

      // Se falhou e estamos no macOS, tentar configurações específicas do macOS
      if (!result.success && process.platform === 'darwin') {
        lastError = result.error;
        attemptNumber = 2;
        
        console.log(`⚠️ Primeira tentativa falhou no macOS, tentando configurações otimizadas...`);
        
        // Segunda tentativa: configurações macOS
        uploadCommand = `compile --fqbn ${board} --upload --port ${port} --verify "${sketchDir}" --libraries "${librariesPath}" --build-property "upload.speed=9600" --build-property "upload.resetmethod=no_reset"`;
        console.log(`🔄 Tentativa ${attemptNumber} (macOS otimizado): ${uploadCommand}`);
        
        // Callback específico para macOS
        const handleProgressMacOS = (line) => {
          if (onProgress && (
            line.includes('Connecting') || 
            line.includes('Uploading') ||
            line.includes('Writing') ||
            line.includes('Hash of data verified') ||
            line.includes('Hard resetting') ||
            line.includes('%')
          )) {
            onProgress({
              type: 'upload_progress',
              message: line.trim(),
              timestamp: Date.now()
            });
          }
          
          // Instruções específicas para macOS durante conexão
          if (line.includes('Connecting')) {
            if (onProgress) {
              onProgress({
                type: 'upload_instruction',
                message: '🍎 macOS Modo Manual: Segure BOOT → Pressione EN → Solte EN → Solte BOOT',
                timestamp: Date.now()
              });
            }
          }
          
          console.log(`📡 ${line}`);
        };
        
        result = await this.executeCommand(uploadCommand, {
          timeout: 180000, // 3 minutos para macOS (mais tempo)
          onData: handleProgressMacOS
        });
      }

      // 5. Limpar e retornar resultado
      this.cleanupTempDir(tempDir);

      if (result.success) {
        console.log(`✅ Upload ESP32 concluído na tentativa ${attemptNumber}!`);
        return {
          success: true,
          message: `Upload ESP32 realizado com sucesso! (tentativa ${attemptNumber})`,
          output: result.output,
          board: board,
          port: port,
          method: attemptNumber === 1 ? 'esp32_windows_config' : 'esp32_macos_config'
        };
      } else {
        console.log(`❌ Upload ESP32 falhou após ${attemptNumber} tentativa(s)`);
        
        // Análise específica para ESP32 com instruções para macOS
        let errorMessage = `Falha no upload ESP32 após ${attemptNumber} tentativa(s)`;
        let suggestion = 'Verifique conexão USB e tente novamente';
        
        // Mostrar erro da tentativa mais relevante
        const finalError = result.error;
        
        // Detectar Wrong Boot Mode (0x13)
        if (wrongBootModeDetected || finalError.includes('Wrong boot mode') || finalError.includes('0x13')) {
          errorMessage = 'ESP32 está em modo de execução (0x13) - precisa entrar em modo de download';
          suggestion = '🔄 MODO MANUAL DE BOOT:\n\n' +
                      '1. Segure o botão BOOT (ou IO0) na ESP32\n' +
                      '2. Pressione e solte o botão EN (ou RESET)\n' +
                      '3. Solte o botão BOOT\n' +
                      '4. Clique em "Upload" novamente\n\n' +
                      '💡 A ESP32 entrará em modo de download e ficará esperando o código.\n' +
                      '⚠️ Se sua ESP32 não tem botões, conecte GPIO0 ao GND antes de resetar.';
        }
        
        if (finalError.includes('Packet content transfer stopped') || finalError.includes('chip stopped responding')) {
          errorMessage = 'ESP32 saiu do modo de programação';
          if (process.platform === 'darwin') {
            suggestion = '🍎 macOS: 1) Segure botão BOOT, 2) Pressione EN (reset), 3) Solte EN, 4) Solte BOOT, 5) Tente upload novamente. Se persistir, verifique drivers CH340/CP210x.';
          } else {
            suggestion = 'Segure botão BOOT na ESP32 durante o upload';
          }
        } else if (finalError.includes('Failed to communicate with the flash chip')) {
          errorMessage = 'Problema de comunicação com flash ESP32';
          if (process.platform === 'darwin') {
            suggestion = '🍎 macOS: Verifique cabo USB (deve ser de dados), drivers CH340/CP210x, e tente com velocidade menor';
          } else {
            suggestion = 'Verifique cabo USB (deve ser de dados) e alimentação da ESP32';
          }
        } else if (finalError.includes('No serial port found')) {
          errorMessage = 'Porta serial não encontrada';
          if (process.platform === 'darwin') {
            suggestion = '🍎 macOS: Instale drivers CH340/CP210x e verifique em Configurações > Segurança se o driver foi bloqueado';
          } else {
            suggestion = 'Verifique se ESP32 está conectada e drivers instalados';
          }
        }
        
        // Adicionar informação sobre as tentativas no macOS
        if (process.platform === 'darwin' && attemptNumber === 2) {
          suggestion += '\n\n💡 Foram testadas configurações Windows e macOS. Problema pode ser hardware/drivers.';
        }
        
        return {
          success: false,
          message: errorMessage,
          error: result.error,
          output: result.output,
          board: board,
          port: port,
          method: 'esp32_direct',
          suggestion: suggestion
        };
      }

    } catch (error) {
      this.cleanupTempDir(tempDir);
      console.error('❌ Erro interno ESP32:', error.message);
      
      return {
        success: false,
        message: 'Erro interno no upload ESP32',
        error: error.message,
        board: board,
        port: port,
        method: 'esp32_direct'
      };
    }
  }

  /**
   * Faz upload de um sketch para a placa usando Arduino CLI
   */
  async uploadSketch(code, port, board = 'esp32:esp32:esp32', onProgress = null) {
    const timestamp = Date.now();
    const tempDir = path.join('C:', 'temp', 'arduino_sketches', `upload_${timestamp}`);
    const sketchDir = path.join(tempDir, 'sketch');
    const sketchFile = path.join(sketchDir, 'sketch.ino');
    const buildDir = path.join('C:', 'temp', 'arduino_builds', `build_${timestamp}`);

    try {
      // Validar código
      const cleanCode = this.validateAndCleanCode(code);
      
      // Criar diretórios
      console.log(`📁 Criando diretório sketch: ${sketchDir}`);
      fs.mkdirSync(sketchDir, { recursive: true });
      console.log(`📁 Criando diretório build: ${buildDir}`);
      fs.mkdirSync(buildDir, { recursive: true });
      
      // Escrever código no arquivo
      fs.writeFileSync(sketchFile, cleanCode, 'utf8');
      console.log(`📄 Arquivo sketch criado: ${sketchFile}`);

      // Verificar se a porta existe
      console.log(`🔍 Verificando porta ${port}...`);
      const portsCheck = await this.listPorts();
      const portAvailable = portsCheck.ports && portsCheck.ports.some(p => p.address === port);
      
      if (!portAvailable) {
        const availablePorts = portsCheck.ports?.map(p => p.address).join(', ') || 'nenhuma';
        throw new Error(`Porta ${port} não encontrada. Portas disponíveis: ${availablePorts}`);
      }

      // Primeiro: Compilar apenas
      console.log(`🔧 Compilando para ${board}...`);
      console.log(`📁 Build path: ${buildDir}`);
      console.log(`📁 Sketch path: ${sketchDir}`);
      
      // Obter caminho das bibliotecas
      const librariesPath = path.join(__dirname, '..', 'arduino-cli', 'config', 'user', 'libraries');
      console.log(`📚 Libraries path: ${librariesPath}`);
      
      const compileCommand = `compile --fqbn ${board} --build-path "${buildDir}" --libraries "${librariesPath}" "${sketchDir}"`;
      
      const compileResult = await this.executeCommand(compileCommand, {
        timeout: 90000 // 1.5 minutos para compilação
      });

      if (!compileResult.success) {
        this.cleanupTempDir(tempDir);
        this.cleanupTempDir(buildDir);
        return {
          success: false,
          message: 'Falha na compilação',
          error: compileResult.error,
          output: compileResult.output,
          board: board,
          port: port
        };
      }

      console.log(`✅ Compilação concluída com sucesso`);
      
      // Verificar se os arquivos de build foram criados
      console.log(`🔍 Verificando arquivos de build em: ${buildDir}`);
      if (fs.existsSync(buildDir)) {
        const files = fs.readdirSync(buildDir);
        console.log(`📁 Arquivos encontrados: ${files.length}`);
        files.forEach(file => {
          console.log(`  - ${file}`);
        });
      } else {
        console.error(`❌ Diretório de build não existe: ${buildDir}`);
      }
      
      // Verificar se a porta está disponível antes do upload
      console.log(`🔍 Verificando disponibilidade da porta ${port}...`);
      const finalPortCheck = await this.listPorts();
      const isPortReady = finalPortCheck.ports?.some(p => p.address === port);
      if (!isPortReady) {
        console.warn(`⚠️ Porta ${port} não está mais disponível`);
        // Continuar mesmo assim - pode ser temporário
      } else {
        console.log(`✅ Porta ${port} disponível para upload`);
      }
      
      // Aguardar um pouco antes do upload
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar qualidade da conexão antes do upload
      console.log(`🔍 Testando qualidade da conexão ${port}...`);
      await this.testSerialConnection(port);

      // Segundo: Upload do binário compilado com streaming
      console.log(`🚀 Fazendo upload para ${board} na porta ${port}...`);
      
      // Normalizar caminho para evitar problemas de encoding
      const normalizedBuildDir = path.normalize(buildDir).replace(/\\/g, '/');
      console.log(`📁 Usando input-dir: ${buildDir}`);
      console.log(`📁 Caminho normalizado: ${normalizedBuildDir}`);
      
      const uploadCommand = `upload --fqbn ${board} --port ${port} --input-dir "${normalizedBuildDir}" --verify`;
      console.log(`🔧 Comando de upload: ${uploadCommand}`);
      
      // Função para transmitir progresso do upload
      const handleUploadProgress = (line) => {
        if (onProgress) {
          // Identificar tipos de mensagens importantes
          if (line.includes('Connecting') || 
              line.includes('Connected to ESP32') ||
              line.includes('Uploading') ||
              line.includes('Running') ||
              line.includes('Changing baud rate') ||
              line.includes('Configuring flash') ||
              line.includes('Flash will be erased') ||
              line.includes('Compressed') ||
              line.includes('Writing at') ||
              line.includes('Wrote') ||
              line.includes('Hash of data verified') ||
              line.includes('Hard resetting') ||
              line.includes('New upload port') ||
              line.includes('%')) {
            
            onProgress({
              type: 'upload_progress',
              message: line,
              timestamp: Date.now()
            });
          }
        }
        console.log(`📡 Upload: ${line}`);
      };
      
      // Tentativas de upload com diferentes estratégias
      let result = null;
      let lastError = '';
      
      const uploadStrategies = [
        { name: 'Upload Direto (padrão)', extraArgs: '' },
        { name: 'Upload com erase automático', extraArgs: '--erase-flash' },
        { name: 'Sem verificação', extraArgs: '', removeVerify: true },
        { name: 'Verbose + delay', extraArgs: '--verbose', delay: 2000 },
        { name: 'Reset manual ESP32', extraArgs: '', reset: true },
        { name: 'Hard Reset + erase', extraArgs: '--erase-flash', hardReset: true },
        { name: 'Verbose sem verificação', extraArgs: '--verbose', removeVerify: true },
        { name: 'Modo conservativo', extraArgs: '', delay: 3000, removeVerify: true },
        { name: 'Último recurso', extraArgs: '--verbose --erase-flash', removeVerify: true, delay: 5000 }
      ];
      
      for (let attempt = 0; attempt < uploadStrategies.length; attempt++) {
        const strategy = uploadStrategies[attempt];
        
        if (onProgress) {
          onProgress({
            type: 'upload_progress',
            message: `Tentativa ${attempt + 1}/${uploadStrategies.length}: ${strategy.name}`,
            timestamp: Date.now()
          });
        }
        
        // Verificar se há argumento de erase flash
        
        if (strategy.extraArgs && strategy.extraArgs.includes('--erase-flash')) {
          // O esptool já cuida da limpeza automaticamente com --erase-flash
          console.log('🗑️ Usando erase automático do esptool...');
          if (onProgress) {
            onProgress({
              type: 'upload_progress',
              message: '🗑️ Flash será limpa automaticamente pelo esptool',
              timestamp: Date.now()
            });
          }
        }
        
        // Hard reset da ESP32 se especificado
        if (strategy.hardReset) {
          if (onProgress) {
            onProgress({
              type: 'upload_progress',
              message: '🔄 Preparando ESP32 para upload...',
              timestamp: Date.now()
            });
          }
          
          console.log('🔄 Preparando ESP32 para upload...');
          // Aguardar um pouco para estabilizar
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Reset manual se especificado
        if (strategy.reset) {
          if (onProgress) {
            onProgress({
              type: 'upload_progress',
              message: 'RESET MANUAL NECESSÁRIO: Pressione e segure BOOT + RESET no ESP32, depois solte RESET',
              timestamp: Date.now()
            });
          }
          console.log('🔄 Aguardando reset manual do ESP32...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          if (onProgress) {
            onProgress({
              type: 'upload_progress',
              message: 'Agora solte o botão BOOT e tente novamente',
              timestamp: Date.now()
            });
          }
        }
        
        // Aguardar delay se especificado
        if (strategy.delay) {
          console.log(`⏳ Aguardando ${strategy.delay}ms antes da tentativa...`);
          await new Promise(resolve => setTimeout(resolve, strategy.delay));
        }
        
        // Modificar comando baseado na estratégia
        let currentUploadCommand = uploadCommand;
        
        if (strategy.removeVerify) {
          currentUploadCommand = currentUploadCommand.replace(' --verify', '');
        }
        
        if (strategy.extraArgs) {
          currentUploadCommand += ` ${strategy.extraArgs}`;
        }
        
        console.log(`🔄 Tentativa ${attempt + 1}: ${strategy.name}`);
        console.log(`🔧 Comando: ${currentUploadCommand}`);
        
        result = await this.executeCommand(currentUploadCommand, {
          timeout: 120000, // 2 minutos para upload (aumentado)
          onData: handleUploadProgress
        });
        
        if (result.success) {
          console.log(`✅ Upload concluído com sucesso na tentativa ${attempt + 1}`);
          break;
        } else {
          lastError = result.error;
          console.log(`❌ Tentativa ${attempt + 1} falhou: ${result.error}`);
          
          // Verificar se é erro específico de comunicação
          const isCommError = result.error.includes('Packet content transfer stopped') || 
                             result.error.includes('Failed to communicate with the flash chip') ||
                             result.error.includes('A serial exception error occurred') ||
                             result.error.includes('Serial port not found');
          
          const isPacketError = result.error.includes('Packet content transfer stopped');
          
          if (isPacketError) {
            console.log('🔧 Detectado erro de transferência de pacote - ESP32 saiu do modo programação');
            if (onProgress) {
              onProgress({
                type: 'upload_progress',
                message: '⚠️ ESP32 saiu do modo programação - tentando próxima estratégia...',
                timestamp: Date.now()
              });
            }
            // Aguardar mais tempo para ESP32 se estabilizar
            await new Promise(resolve => setTimeout(resolve, 3000));
          } else if (isCommError) {
            console.log('🔧 Detectado erro de comunicação - aguardando mais tempo...');
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos para erros de comunicação
          }
          
          // Aguardar um pouco antes da próxima tentativa
          if (attempt < uploadStrategies.length - 1) {
            const waitTime = isPacketError ? 4000 : (isCommError ? 2000 : 3000);
            console.log(`⏳ Aguardando ${waitTime}ms antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      // Limpar diretórios temporários
      this.cleanupTempDir(tempDir);
      this.cleanupTempDir(buildDir);

      if (result && result.success) {
        return {
          success: true,
          message: 'Upload realizado com sucesso!',
          output: result.output,
          board: board,
          port: port
        };
      } else {
        // Verificar se é erro específico de comunicação
        const isCommError = lastError.includes('Packet content transfer stopped') || 
                           lastError.includes('Failed to communicate with the flash chip') ||
                           lastError.includes('A serial exception error occurred');
        
        const isFlashError = lastError.includes('Failed to communicate with the flash chip') || 
                           lastError.includes('Packet content transfer stopped');
        
        const isPacketError = lastError.includes('Packet content transfer stopped');
        
        let errorMessage = `Falha no upload após ${uploadStrategies.length} tentativas`;
        let troubleshooting = `Tentativas realizadas: ${uploadStrategies.map(s => s.name).join(', ')}.`;
        
        if (isPacketError) {
          errorMessage = 'ESP32 saiu do modo de programação durante upload';
          troubleshooting = `
PROBLEMA: ESP32 SAIU DO MODO DE PROGRAMAÇÃO:

🔧 SOLUÇÕES PRINCIPAIS:
1. 🔄 Pressione e MANTENHA o botão BOOT na ESP32
2. 🔌 Clique no botão de upload enquanto segura BOOT
3. ⏱️ Quando aparecer "Connecting...", solte o botão BOOT
4. 🔗 Mantenha cabo USB bem conectado

📋 VERIFICAÇÕES ADICIONAIS:
- Cabo USB de boa qualidade (alguns só carregam)
- Porta USB com energia suficiente (evite hubs)
- Driver USB-Serial atualizado
- ESP32 com alimentação estável

🎯 MÉTODO GARANTIDO:
1. Segure BOOT + RESET na ESP32
2. Solte RESET (continue segurando BOOT)  
3. Clique em upload
4. Quando iniciar upload, solte BOOT
          `.trim();
        } else if (isCommError || isFlashError) {
          errorMessage = 'Problema de comunicação com a ESP32 detectado';
          troubleshooting = `
PROBLEMA DE COMUNICAÇÃO DETECTADO:

🔧 VERIFICAÇÕES BÁSICAS:
1. 🔌 Teste outro cabo USB (causa mais comum)
2. 💻 Troque para outra porta USB do computador
3. ⚡ Verifique se a ESP32 tem LED aceso (alimentação)
4. 🔄 Desconecte e reconecte a ESP32

📱 MODO DE PROGRAMAÇÃO MANUAL:
Se o problema persistir, tente:
1. Pressione e MANTENHA os botões BOOT + RESET
2. Solte apenas o botão RESET (continue segurando BOOT)
3. Clique em upload novamente
4. Quando aparecer "Connecting...", solte o botão BOOT

🛠️ OUTRAS SOLUÇÕES:
- Feche programas que podem usar a porta (Arduino IDE, PlatformIO)
- Reinstale drivers USB-Serial
- Teste velocidades mais baixas (57600 baud)
          `.trim();
        }
        
        return {
          success: false,
          message: errorMessage,
          error: lastError,
          output: result ? result.output : '',
          board: board,
          port: port,
          details: troubleshooting,
          hardwareIssue: isFlashError || isCommError,
          retryAttempts: uploadStrategies.length
        };
      }

    } catch (error) {
      this.cleanupTempDir(tempDir);
      this.cleanupTempDir(buildDir);
      return {
        success: false,
        message: 'Erro interno no upload',
        error: error.message,
        board: board,
        port: port
      };
    }
  }

  /**
   * MÉTODO PRINCIPAL DE UPLOAD - APENAS ESP32 - SUBSTITUI uploadWithPrerequisites
   */
  async uploadToESP32(code, port, boardType = 'dev', onProgress = null) {
    console.log('🎯 === UPLOAD ESP32 SIMPLIFICADO ===');
    
    // Mapear tipo de board para FQBN correto
    const boardMap = {
      'dev': 'esp32:esp32:esp32',
      'wrover': 'esp32:esp32:esp32wrover'
    };
    
    const board = boardMap[boardType] || boardMap.dev;
    console.log(`📋 Board: ${board} (${boardType})`);
    console.log(`� Porta: ${port}`);

    try {
      // 1. Validação rápida do sistema
      console.log('🔍 Verificando Arduino CLI...');
      const healthCheck = await this.healthCheck();
      if (!healthCheck.success) {
        return {
          success: false,
          message: 'Arduino CLI não disponível',
          error: healthCheck.error || 'Sistema indisponível'
        };
      }

      // 2. Verificar ESP32 core (rápido)
      console.log('� Verificando ESP32 core...');
      const coreCheck = await this.checkEsp32CoreAvailable();
      if (!coreCheck.installed) {
        return {
          success: false,
          message: 'ESP32 core não instalado',
          error: 'Execute a instalação do ESP32 core primeiro',
          prerequisiteFailed: 'ESP32_CORE_MISSING'
        };
      }

      // 3. Upload DIRETO
      console.log('🚀 Iniciando upload ESP32...');
      const uploadResult = await this.uploadESP32Direct(code, port, board, onProgress);
      
      console.log(`✅ Upload finalizado: ${uploadResult.success ? 'SUCESSO' : 'FALHA'}`);
      return uploadResult;

    } catch (error) {
      console.error('❌ Erro crítico no upload ESP32:', error);
      return {
        success: false,
        message: 'Erro crítico no sistema de upload',
        error: error.message,
        method: 'esp32_direct'
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
      console.log(`   📂 Usando config: ${this.configPath}`);
      console.log(`   📂 CLI Path: ${this.cliPath}`);
      
      // MÉTODO SIMPLES PRIMEIRO (mais confiável - texto plano)
      console.log('🔍 Tentando verificação simples (texto plano)...');
      const simpleListResult = await this.executeCommand('core list');
      
      if (simpleListResult.success && simpleListResult.output) {
        const hasEsp32 = simpleListResult.output.toLowerCase().includes('esp32');
        if (hasEsp32) {
          // Extrair versão do output texto
          const lines = simpleListResult.output.split('\n');
          const esp32Line = lines.find(line => line.toLowerCase().includes('esp32'));
          
          if (esp32Line) {
            const parts = esp32Line.trim().split(/\s+/);
            const version = parts.length >= 2 ? parts[1] : 'unknown';
            
            console.log(`✅ ESP32 core encontrado (texto simples): ${parts[0]} versão ${version}`);
            return {
              installed: true,
              core: { id: 'esp32:esp32', version: version },
              version: version,
              id: 'esp32:esp32',
              method: 'simple_text_search'
            };
          }
        }
      }
      
      // Fallback: Tentar JSON (menos confiável)
      console.log('🔍 Tentando verificação JSON...');
      const listResult = await this.executeCommand('core list --format json');
      console.log(`   📊 Resultado success: ${listResult.success}`);
      console.log(`   📊 Output length: ${listResult.output ? listResult.output.length : 0}`);
      
      if (listResult.success && listResult.output) {
        try {
          console.log(`   📄 Raw output: ${listResult.output.substring(0, 200)}...`);
          const installedCores = JSON.parse(listResult.output);
          
          // O formato real retorna um array de objetos com estrutura:
          // [{ "id": "esp32:esp32", "installed_version": "3.3.1", "latest_version": "3.3.1", "name": "esp32", "maintainer": "Espressif Systems", "email": "...", "boards": [...] }]
          if (Array.isArray(installedCores) && installedCores.length > 0) {
            console.log(`   📊 Cores encontrados no array: ${installedCores.length}`);
            
            // Procurar ESP32 core no array
            const esp32Core = installedCores.find(core => {
              // Verificar se é um objeto válido
              if (!core || typeof core !== 'object') return false;
              
              // Verificar diferentes formatos possíveis
              const coreId = core.id || core.ID || '';
              const installed = core.installed_version || core.installed || core.InstalledVersion;
              
              // Procurar por 'esp32' no ID
              const isESP32 = coreId.toLowerCase().includes('esp32');
              
              console.log(`   🔍 Verificando core: ${coreId}, instalado: ${installed ? 'SIM' : 'NÃO'}, é ESP32: ${isESP32}`);
              
              return isESP32 && installed;
            });
          
            if (esp32Core) {
              const version = esp32Core.installed_version || esp32Core.latest_version || 'unknown';
              console.log(`✅ ESP32 core encontrado: ${esp32Core.id} versão: ${version}`);
              return {
                installed: true,
                core: esp32Core,
                version: version,
                id: esp32Core.id,
                method: 'core_list_json'
              };
            } else {
              console.log('   ⚠️ ESP32 não encontrado no array de cores');
            }
          } else {
            console.log(`   ⚠️ Array de cores vazio ou inválido: ${JSON.stringify(installedCores).substring(0, 100)}`);
          }
          
          // Fallback: tentar buscar na estrutura aninhada se existir
          console.log('🔍 Tentando fallback na busca de cores...');
          const flattenedCores = this.flattenCoreStructure(installedCores);
          const esp32CoreFallback = flattenedCores.find(core => 
            core.id && (core.id.includes('esp32') || core.id === 'esp32:esp32')
          );
          
          if (esp32CoreFallback) {
            console.log('✅ ESP32 core encontrado (fallback):', esp32CoreFallback.id);
            return {
              installed: true,
              core: esp32CoreFallback,
              version: esp32CoreFallback.version || 'unknown',
              id: esp32CoreFallback.id,
              method: 'fallback_search'
            };
          }
          
        } catch (parseError) {
          console.warn('⚠️ Erro ao analisar JSON dos cores instalados:', parseError.message);
          console.warn('Output recebido:', listResult.output.substring(0, 500) + '...');
        }
      }
      
      console.log('❌ ESP32 core não encontrado em nenhuma verificação');
      return {
        installed: false,
        message: 'ESP32 core não detectado em nenhuma verificação'
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
   * Função auxiliar para achatar estruturas aninhadas de cores
   */
  flattenCoreStructure(data, result = []) {
    if (Array.isArray(data)) {
      data.forEach(item => this.flattenCoreStructure(item, result));
    } else if (typeof data === 'object' && data !== null) {
      if (data.id) {
        result.push(data);
      }
      Object.values(data).forEach(value => {
        if (typeof value === 'object') {
          this.flattenCoreStructure(value, result);
        }
      });
    }
    return result;
  }

  /**
   * Instala o ESP32 core se necessário
   */
  async ensureEsp32CoreInstalled() {
    console.log('🚀 Verificando/instalando ESP32 core...');
    
    try {
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
      
      console.log('⚠️ ESP32 core não encontrado');
      console.log('💡 Execute o botão "Iniciar Backend" para configurar automaticamente');
      
      return {
        success: false,
        message: 'ESP32 core não encontrado. Execute "Iniciar Backend" para configurar automaticamente.',
        requiresSetup: true,
        details: checkResult
      };
      
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

  /**
   * Testa a qualidade da conexão serial com a ESP32
   */
  async testSerialConnection(port) {
    try {
      console.log(`🔍 Testando conexão serial na porta ${port}...`);
      
      // Verificar se a porta ainda está disponível
      const portsResult = await this.listPorts();
      const portExists = portsResult.ports?.some(p => p.address === port);
      
      if (!portExists) {
        console.warn(`⚠️ Porta ${port} não está mais disponível`);
        return false;
      }
      
      // Usar comando correto do Arduino CLI para teste básico
      const boardCheckResult = await this.executeCommand(`board list --discovery-timeout 5s`, {
        timeout: 10000
      });
      
      if (boardCheckResult.success && boardCheckResult.output.includes(port)) {
        console.log(`✅ Conexão serial testada com sucesso em ${port}`);
        return true;
      } else {
        console.warn(`⚠️ Teste de conexão falhou para ${port}, mas continuando...`);
        return false;
      }
      
    } catch (error) {
      console.warn(`⚠️ Não foi possível testar conexão em ${port}: ${error.message}`);
      return false;
    }
  }
}

module.exports = ArduinoCLIService;
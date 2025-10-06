/**
 * Servidor Backend Principal - Express + WebSocket
 * Integra Arduino CLI e comunicação serial para o IdeiaSpace
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
// Auto-setup e Arduino CLI Service
const AutoSetup = require('./auto-setup');
const ArduinoCLIService = require('./services/arduino-cli-service');
const SerialService = require('./services/serial-service');
const ESP32Diagnostic = require('./esp32-diagnostic');
const ESP32Monitor = require('./esp32-monitor');

class BackendServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.wsPort = process.env.WS_PORT || 8080;
    
    this.arduinoService = new ArduinoCLIService();
    this.serialService = new SerialService(this.arduinoService);
    this.esp32Diagnostic = new ESP32Diagnostic();
    this.esp32Monitor = null; // Será inicializado conforme necessário
    this.isMonitoringESP32 = false;
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // CORS para permitir requisições do Electron
    this.app.use(cors({
      origin: true, // Permitir qualquer origem para Electron
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: false
    }));

    // Parser JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Middleware de logging melhorado
    this.app.use((req, res, next) => {
      const origin = req.headers.origin || 'unknown';
      console.log(`🌐 ${req.method} ${req.path} - Origin: ${origin} - ${new Date().toISOString()}`);
      next();
    });

    // Headers de segurança adicionais para Electron
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.header('Access-Control-Max-Age', '86400'); // Cache preflight por 24h
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      
      next();
    });
  }

  setupRoutes() {
        // Endpoint básico de ping
    this.app.get('/ping', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'IdeiaSpace Backend Running'
      });
    });

    // Health check endpoint mais detalhado  
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        platform: process.platform,
        arch: process.arch,
        node_version: process.version,
        uptime: process.uptime(),
        arduino_cli: {
          available: this.arduinoService ? true : false
        }
      });
    });

    // Rotas do Arduino CLI
    this.setupArduinoRoutes();
    
    // Rotas de informações
    this.setupInfoRoutes();

    // Middleware de erro
    this.app.use((error, req, res, next) => {
      console.error('❌ Erro no servidor:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    });

    // Rota 404
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint não encontrado'
      });
    });
  }

  setupArduinoRoutes() {
    // === ROTAS ESP32 DIAGNÓSTICO E MONITORAMENTO ===
    
    // Diagnóstico automático ESP32
    this.app.get('/api/esp32/diagnostic', async (req, res) => {
      try {
        console.log('🔬 Executando diagnóstico ESP32...');
        
        // Capturar output do diagnóstico
        const diagnosticResult = await this.runESP32Diagnostic();
        
        res.json({
          success: true,
          diagnostic: diagnosticResult,
          timestamp: new Date().toISOString(),
          platform: process.platform,
          arch: process.arch
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro no diagnóstico ESP32',
          error: error.message
        });
      }
    });

    // Iniciar monitoramento ESP32
    this.app.post('/api/esp32/start-monitor', async (req, res) => {
      try {
        if (this.isMonitoringESP32) {
          return res.json({
            success: true,
            message: 'Monitor ESP32 já está ativo',
            isMonitoring: true
          });
        }

        console.log('📡 Iniciando monitor ESP32...');
        await this.startESP32Monitor();
        
        res.json({
          success: true,
          message: 'Monitor ESP32 iniciado com sucesso',
          isMonitoring: true
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro ao iniciar monitor ESP32',
          error: error.message
        });
      }
    });

    // Parar monitoramento ESP32
    this.app.post('/api/esp32/stop-monitor', async (req, res) => {
      try {
        if (!this.isMonitoringESP32) {
          return res.json({
            success: true,
            message: 'Monitor ESP32 não está ativo',
            isMonitoring: false
          });
        }

        console.log('🛑 Parando monitor ESP32...');
        await this.stopESP32Monitor();
        
        res.json({
          success: true,
          message: 'Monitor ESP32 parado',
          isMonitoring: false
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro ao parar monitor ESP32',
          error: error.message
        });
      }
    });

    // Status do monitor ESP32
    this.app.get('/api/esp32/monitor-status', (req, res) => {
      res.json({
        success: true,
        isMonitoring: this.isMonitoringESP32,
        platform: process.platform,
        hasESP32Monitor: !!this.esp32Monitor
      });
    });

    // === ROTAS ARDUINO ORIGINAIS ===
    
    // Compilação
    this.app.post('/api/arduino/compile', async (req, res) => {
      try {
        const { code, board = 'esp32:esp32:esp32', options = {} } = req.body;
        
        if (!code || !code.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Código é obrigatório'
          });
        }

        console.log(`🔨 Iniciando compilação para ${board}`);
        const result = await this.arduinoService.compileSketch(code, board, options);
        
        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro na compilação',
          error: error.message
        });
      }
    });

    // Upload ESP32 DIRETO - SEM MÚLTIPLAS ESTRATÉGIAS
    this.app.post('/api/arduino/upload', async (req, res) => {
      try {
        const { code, port, board = 'dev', cleanFlash = true } = req.body;
        
        console.log('🎯 === UPLOAD ESP32 SIMPLIFICADO ===');
        console.log('  - Porta:', port);
        console.log('  - Tipo ESP32:', board); // 'dev' ou 'wrover'
        console.log('  - Código recebido:', code ? `${code.length} caracteres` : 'null');
        
        if (!code || !code.trim()) {
          console.error('❌ Código está vazio ou nulo');
          return res.status(400).json({
            success: false,
            message: 'Código é obrigatório'
          });
        }
        
        if (!port) {
          return res.status(400).json({
            success: false,
            message: 'Porta é obrigatória'
          });
        }

        // IMPORTANTE: Fechar conexões seriais na porta antes do upload
        console.log(`🔌 Verificando conexões seriais na porta ${port}...`);
        const connectionStatus = this.serialService.getConnectionsStatus();
        if (connectionStatus[port]) {
          console.log(`🛑 Fechando conexão serial existente na porta ${port}...`);
          await this.serialService.forceClosePort(port);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2s para liberação da porta
        }

        console.log(`🚀 Upload ESP32 DIRETO para ${port} (${board})`);
        
        // Callback para progresso do upload
        const uploadProgressCallback = (progressData) => {
          console.log(`📡 Progresso: ${progressData.message}`);
          this.serialService.broadcastToAllClients({
            type: 'upload_progress',
            port: port,
            data: progressData.message,
            timestamp: progressData.timestamp
          });
        };
        
        // UPLOAD ESP32 DIRETO - MÉTODO ÚNICO
        console.log('🎯 Executando upload ESP32 direto...');
        const result = await this.arduinoService.uploadToESP32(
          code, 
          port, 
          board, // 'dev' ou 'wrover'
          uploadProgressCallback
        );
        
        if (result.success) {
          console.log('✅ Upload ESP32 concluído com sucesso');
        } else {
          console.error('❌ Upload ESP32 falhou:', result.message);
          
          // Verificar se é necessário instalar ESP32 core
          if (result.prerequisiteFailed === 'ESP32_CORE_MISSING') {
            console.log('💡 Solução: Execute a instalação do ESP32 core primeiro');
          }
        }
        
        res.json(result);
      } catch (error) {
        console.error('❌ Erro crítico no upload:', error.message);
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
          error: error.message
        });
      }
    });

    // Listar portas
    this.app.get('/api/arduino/ports', async (req, res) => {
      try {
        console.log('🔍 Endpoint /api/arduino/ports chamado');
        const result = await this.arduinoService.listPorts();
        console.log('📡 Resultado das portas:', JSON.stringify(result, null, 2));
        
        // Garantir que sempre retornamos um formato consistente
        const response = {
          ports: result.ports || [],
          error: result.error || null,
          timestamp: new Date().toISOString(),
          platform: process.platform
        };
        
        res.json(response);
      } catch (error) {
        console.error('❌ Erro crítico no endpoint de portas:', error);
        res.status(500).json({
          ports: [],
          error: error.message,
          timestamp: new Date().toISOString(),
          platform: process.platform
        });
      }
    });

    // Listar placas
    this.app.get('/api/arduino/boards', async (req, res) => {
      try {
        const result = await this.arduinoService.listBoards();
        res.json(result);
      } catch (error) {
        res.status(500).json({
          boards: [],
          error: error.message
        });
      }
    });

    // Instalar biblioteca
    this.app.post('/api/arduino/library/install', async (req, res) => {
      try {
        const { name, version } = req.body;
        
        if (!name) {
          return res.status(400).json({
            success: false,
            message: 'Nome da biblioteca é obrigatório'
          });
        }

        console.log(`📚 Instalando biblioteca: ${name}${version ? `@${version}` : ''}`);
        const result = await this.arduinoService.installLibrary(name, version);
        
        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro ao instalar biblioteca',
          error: error.message
        });
      }
    });

    // Listar bibliotecas instaladas
    this.app.get('/api/arduino/libraries', async (req, res) => {
      try {
        const result = await this.arduinoService.listInstalledLibraries();
        res.json(result);
      } catch (error) {
        res.status(500).json({
          libraries: [],
          error: error.message
        });
      }
    });

    // Atualizar índices
    this.app.post('/api/arduino/update', async (req, res) => {
      try {
        console.log('🔄 Atualizando índices do Arduino CLI...');
        const result = await this.arduinoService.updateIndexes();
        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro ao atualizar índices',
          error: error.message
        });
      }
    });

    // Apenas compilar sem fazer upload
    this.app.post('/api/arduino/compile-only', async (req, res) => {
      try {
        const { code, board = 'esp32:esp32:esp32', withOutput = false } = req.body;
        
        if (!code || !code.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Código é obrigatório'
          });
        }

        console.log(`🔨 Compilação apenas (sem upload) para ${board}`);
        
        // Usar compilação com ou sem saída detalhada
        const result = withOutput ? 
          await this.arduinoService.compileWithOutput(code, board) :
          await this.arduinoService.compileSketch(code, board);
        
        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro na compilação',
          error: error.message
        });
      }
    });

    // Instalar core (ESP32, Arduino, etc.)
    this.app.post('/api/arduino/core/install', async (req, res) => {
      try {
        const { core } = req.body;
        
        if (!core) {
          return res.status(400).json({
            success: false,
            message: 'Nome do core é obrigatório'
          });
        }

        console.log(`🔧 Instalando core: ${core}`);
        const result = await this.arduinoService.installCore(core);
        
        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro ao instalar core',
          error: error.message
        });
      }
    });

    // Verificar status do ESP32 core
    this.app.get('/api/arduino/esp32/status', async (req, res) => {
      try {
        console.log('🔍 Verificando status do ESP32 core...');
        const result = await this.arduinoService.checkEsp32CoreAvailable();
        
        res.json({
          success: true,
          esp32Status: result
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro ao verificar ESP32 core',
          error: error.message
        });
      }
    });

    // Instalar ESP32 core
    this.app.post('/api/arduino/esp32/install', async (req, res) => {
      try {
        console.log('📦 Instalação do ESP32 core solicitada...');
        const result = await this.arduinoService.ensureEsp32CoreInstalled();
        
        res.json(result);
      } catch (error) {
        console.error('❌ Erro na instalação do ESP32 core:', error.message);
        res.status(500).json({
          success: false,
          message: 'Erro na instalação do ESP32 core',
          error: error.message
        });
      }
    });

    // Limpar flash da ESP32
    this.app.post('/api/arduino/esp32/erase-flash', async (req, res) => {
      try {
        const { port } = req.body;
        
        if (!port) {
          return res.status(400).json({
            success: false,
            message: 'Porta é obrigatória'
          });
        }

        console.log(`🗑️ Solicitação para limpar flash da ESP32 na porta ${port}...`);
        
        // Importar serviço de flash se não existir
        if (!this.esp32FlashService) {
          const ESP32FlashService = require('./services/esp32-flash-service');
          this.esp32FlashService = new ESP32FlashService();
          await this.esp32FlashService.initialize();
        }

        // Fechar conexões seriais na porta primeiro
        const connectionStatus = this.serialService.getConnectionsStatus();
        if (connectionStatus[port]) {
          console.log(`🛑 Fechando conexão serial na porta ${port} para limpeza...`);
          await this.serialService.forceClosePort(port);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const result = await this.esp32FlashService.eraseFlash(port);
        
        res.json(result);
      } catch (error) {
        console.error('❌ Erro na limpeza da flash:', error.message);
        res.status(500).json({
          success: false,
          message: 'Erro na limpeza da flash ESP32',
          error: error.message
        });
      }
    });

    // Verificar status da flash ESP32
    this.app.get('/api/arduino/esp32/flash-status/:port', async (req, res) => {
      try {
        const { port } = req.params;
        
        console.log(`🔍 Verificando status da flash ESP32 na porta ${port}...`);
        
        // Importar serviço de flash se não existir
        if (!this.esp32FlashService) {
          const ESP32FlashService = require('./services/esp32-flash-service');
          this.esp32FlashService = new ESP32FlashService();
          await this.esp32FlashService.initialize();
        }

        const result = await this.esp32FlashService.checkFlashStatus(port);
        
        res.json({
          success: true,
          flashStatus: result
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro ao verificar status da flash',
          error: error.message
        });
      }
    });
  }

  setupInfoRoutes() {
    // Informações do servidor
    this.app.get('/api/info', (req, res) => {
      res.json({
        name: 'IdeiaSpace Backend',
        version: '2.0.0',
        description: 'Backend simplificado para Arduino CLI e comunicação serial',
        endpoints: {
          health: 'GET /health',
          compile: 'POST /api/arduino/compile',
          compile_only: 'POST /api/arduino/compile-only',
          upload: 'POST /api/arduino/upload',
          ports: 'GET /api/arduino/ports',
          boards: 'GET /api/arduino/boards',
          libraries: 'GET /api/arduino/libraries',
          install_library: 'POST /api/arduino/library/install',
          install_core: 'POST /api/arduino/core/install',
          update: 'POST /api/arduino/update',
          esp32_status: 'GET /api/arduino/esp32/status',
          esp32_install: 'POST /api/arduino/esp32/install',
          esp32_diagnostic: 'GET /api/esp32/diagnostic',
          esp32_monitor_start: 'POST /api/esp32/start-monitor',
          esp32_monitor_stop: 'POST /api/esp32/stop-monitor',
          esp32_monitor_status: 'GET /api/esp32/monitor-status'
        },
        websocket: {
          port: this.wsPort,
          url: `ws://localhost:${this.wsPort}`
        },
        improvements: [
          'Upload simplificado e mais confiável',
          'Verificação automática de pré-requisitos',
          'Compilação otimizada para ESP32',
          'Melhor tratamento de erros',
          'Auto-detecção ESP32 por sistema operacional',
          'Monitor ESP32 automático para macOS',
          'Diagnóstico avançado de conectividade USB'
        ]
      });
    });
  }

  // === MÉTODOS ESP32 DIAGNÓSTICO E MONITORAMENTO ===

  async runESP32Diagnostic() {
    console.log('🔬 Executando diagnóstico ESP32 completo...');
    
    try {
      // Simular execução do diagnóstico e capturar resultados
      const diagnosticData = {
        platform: process.platform,
        arch: process.arch,
        usbDevices: await this.checkUSBDevices(),
        serialPorts: await this.checkSerialPorts(),
        drivers: await this.checkDrivers(),
        arduinoCLI: await this.testArduinoCLI()
      };

      return diagnosticData;
    } catch (error) {
      throw new Error(`Falha no diagnóstico ESP32: ${error.message}`);
    }
  }

  async checkUSBDevices() {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      if (process.platform === 'darwin') {
        const { stdout } = await execAsync('system_profiler SPUSBDataType');
        
        // Procurar chips ESP32 comuns
        const esp32Chips = ['CP210', 'CP2102', 'CH340', 'CH341', 'FTDI', 'Espressif', 'ESP32'];
        const foundChips = esp32Chips.filter(chip => 
          stdout.toLowerCase().includes(chip.toLowerCase())
        );

        return {
          found: foundChips.length > 0,
          chips: foundChips,
          rawData: stdout.substring(0, 1000) // Primeiros 1000 chars para análise
        };
      }
      
      return { found: false, chips: [], rawData: 'Plataforma não suportada para USB scan' };
    } catch (error) {
      return { found: false, chips: [], error: error.message };
    }
  }

  async checkSerialPorts() {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      const { stdout: cuPorts } = await execAsync('ls /dev/cu.* 2>/dev/null || echo ""');
      const { stdout: ttyPorts } = await execAsync('ls /dev/tty.* 2>/dev/null || echo ""');
      
      const allPorts = (cuPorts + '\n' + ttyPorts)
        .split('\n')
        .filter(port => port.trim() && !port.includes('Bluetooth') && !port.includes('debug-console'));

      const esp32Patterns = ['usbserial', 'SLAB_USBtoUART', 'wchusbserial', 'usbmodem', 'wch'];
      const esp32Ports = allPorts.filter(port => 
        esp32Patterns.some(pattern => port.toLowerCase().includes(pattern.toLowerCase()))
      );

      return {
        allPorts,
        esp32Ports,
        hasESP32: esp32Ports.length > 0
      };
    } catch (error) {
      return { allPorts: [], esp32Ports: [], hasESP32: false, error: error.message };
    }
  }

  async checkDrivers() {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      if (process.platform === 'darwin') {
        const { stdout } = await execAsync('kextstat | grep -i "usb\\|serial\\|slab\\|prolific\\|ftdi" || echo ""');
        
        const drivers = stdout.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const match = line.match(/com\.[^\s]+/);
            return match ? match[0] : line.trim().substring(0, 50);
          });

        return {
          found: drivers.length > 0,
          drivers,
          count: drivers.length
        };
      }
      
      return { found: false, drivers: [], count: 0 };
    } catch (error) {
      return { found: false, drivers: [], count: 0, error: error.message };
    }
  }

  async testArduinoCLI() {
    try {
      const result = await this.arduinoService.listPorts();
      return {
        working: true,
        ports: result.ports || [],
        count: result.ports ? result.ports.length : 0
      };
    } catch (error) {
      return {
        working: false,
        error: error.message,
        ports: [],
        count: 0
      };
    }
  }

  async startESP32Monitor() {
    if (this.isMonitoringESP32) {
      return;
    }

    console.log('📡 Iniciando monitoramento ESP32 em background...');
    
    this.esp32Monitor = new ESP32Monitor();
    this.isMonitoringESP32 = true;

    // Configurar callbacks para detectar mudanças
    this.esp32Monitor.onDeviceConnected = (deviceInfo) => {
      console.log(`🔌 ESP32 detectada: ${deviceInfo.port}`);
      // Aqui poderia emitir evento via WebSocket para o frontend
    };

    this.esp32Monitor.onDeviceDisconnected = (deviceInfo) => {
      console.log(`🔌 ESP32 desconectada: ${deviceInfo.port}`);
    };

    // Iniciar monitoramento de forma não-bloqueante
    setTimeout(() => {
      this.esp32Monitor.start().catch(error => {
        console.error('❌ Erro no monitor ESP32:', error.message);
        this.isMonitoringESP32 = false;
      });
    }, 1000);
  }

  async stopESP32Monitor() {
    if (!this.isMonitoringESP32 || !this.esp32Monitor) {
      return;
    }

    console.log('🛑 Parando monitor ESP32...');
    
    try {
      await this.esp32Monitor.stop();
    } catch (error) {
      console.error('⚠️ Erro ao parar monitor:', error.message);
    }
    
    this.esp32Monitor = null;
    this.isMonitoringESP32 = false;
  }

  async autoDetectAndSetupESP32() {
    console.log('🔍 Auto-detecção ESP32 para ' + process.platform + '...');
    
    try {
      // Executar diagnóstico rápido
      const diagnostic = await this.runESP32Diagnostic();
      
      // Se não encontrou ESP32, iniciar monitor automaticamente em macOS
      if (process.platform === 'darwin' && !diagnostic.serialPorts.hasESP32) {
        console.log('🍎 macOS detectado - ESP32 não encontrada, iniciando monitor automático...');
        await this.startESP32Monitor();
      }
      
      return diagnostic;
    } catch (error) {
      console.error('❌ Erro na auto-detecção ESP32:', error.message);
      return null;
    }
  }

  async start() {
    try {
      // Executar auto-setup antes de inicializar serviços
      console.log('🔧 Executando auto-setup...');
      const autoSetup = new AutoSetup();
      await autoSetup.run();
      
      // Inicializar serviços
      console.log('🚀 Inicializando Arduino CLI Service...');
      await this.arduinoService.initialize();
      
      console.log('🌐 Inicializando Serial WebSocket Service...');
      this.serialService.startWebSocketServer(this.wsPort);
      
      // Auto-detecção e setup ESP32 (especialmente para macOS)
      console.log('🔍 Executando auto-detecção ESP32...');
      await this.autoDetectAndSetupESP32();
      
      // Iniciar servidor HTTP
      this.server = this.app.listen(this.port, () => {
        console.log('');
        console.log('🎉 IdeiaSpace Backend v2.0 iniciado com sucesso!');
        console.log('');
        console.log(`📡 Servidor HTTP: http://localhost:${this.port}`);
        console.log(`🔌 WebSocket Serial: ws://localhost:${this.wsPort}`);
        console.log(`📋 Health Check: http://localhost:${this.port}/health`);
        console.log(`📖 Info: http://localhost:${this.port}/api/info`);
        console.log('');
        console.log('🎯 Endpoints principais:');
        console.log(`   POST /api/arduino/compile - Compilar código`);
        console.log(`   POST /api/arduino/upload - Upload para placa (com verificações)`);
        console.log(`   GET  /api/arduino/ports - Listar portas`);
        console.log(`   GET  /api/arduino/boards - Listar placas`);
        console.log('');
        console.log('✨ Melhorias v2.0:');
        console.log('   • Upload simplificado e mais confiável');
        console.log('   • Verificação automática de pré-requisitos ESP32');
        console.log('   • Compilação otimizada');
        console.log('   • Melhor tratamento de erros');
        console.log('');
      });

      // Graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Recebido SIGINT, parando servidor...');
        this.stop();
      });

      process.on('SIGTERM', () => {
        console.log('\n🛑 Recebido SIGTERM, parando servidor...');
        this.stop();
      });

    } catch (error) {
      console.error('❌ Erro ao iniciar servidor:', error.message);
      process.exit(1);
    }
  }

  stop() {
    console.log('🛑 Parando serviços...');
    
    if (this.serialService) {
      this.serialService.stop();
    }
    
    if (this.server) {
      this.server.close(() => {
        console.log('✅ Servidor HTTP parado');
        process.exit(0);
      });
    }
  }
}

// Executar servidor se chamado diretamente
if (require.main === module) {
  const server = new BackendServer();
  server.start();
}

module.exports = BackendServer;
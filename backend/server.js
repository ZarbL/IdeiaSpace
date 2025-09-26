/**
 * Servidor Backend Principal - Express + WebSocket
 * Integra Arduino CLI e comunicação serial para o IdeiaSpace
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
// Arduino CLI Service configurado e funcionando
const ArduinoCLIService = require('./services/arduino-cli-service');
const SerialService = require('./services/serial-service');

class BackendServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.wsPort = process.env.WS_PORT || 8080;
    
    this.arduinoService = new ArduinoCLIService();
    this.serialService = new SerialService();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // CORS para permitir requisições do Electron
    this.app.use(cors({
      origin: ['http://localhost:*', 'file://*', '*'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Parser JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Middleware de logging
    this.app.use((req, res, next) => {
      console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });

    // Headers de segurança
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      
      next();
    });
  }

  setupRoutes() {
    // Rota de health check
    this.app.get('/health', async (req, res) => {
      try {
        const arduinoHealth = await this.arduinoService.healthCheck();
        const serialStatus = this.serialService.getConnectionsStatus();
        
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          arduino_cli: arduinoHealth,
          serial_connections: serialStatus,
          server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
          }
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: error.message
        });
      }
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

    // Upload Inteligente com Auto-Bootloader
    this.app.post('/api/arduino/upload', async (req, res) => {
      try {
        const { code, port, board = 'esp32:esp32:esp32', mode = 'smart' } = req.body;
        
        if (!code || !code.trim()) {
          return res.status(400).json({
            success: false,
            message: '❌ ERRO: Código é obrigatório'
          });
        }
        
        if (!port) {
          return res.status(400).json({
            success: false,
            message: '❌ ERRO: Porta é obrigatória'
          });
        }

        console.log(`🎯 Upload para ${port} (${board}) - Modo: ${mode}`);
        
        let result;
        
        if (mode === 'smart' && board.includes('esp32')) {
          // Upload inteligente com auto-reset para ESP32
          console.log('🚀 Usando upload inteligente com auto-bootloader...');
          result = await this.arduinoService.uploadWithAutoBootloader(code, port, board);
        } else {
          // Upload tradicional para outras placas ou modo específico
          console.log('🔨 Usando upload tradicional...');
          result = await this.arduinoService.uploadSketch(code, port, board);
        }
        
        if (result.success) {
          console.log('✅ Upload concluído com sucesso');
          if (result.strategy) {
            console.log(`📋 Estratégia usada: ${result.strategy} (${result.attempts}/${result.totalStrategies})`);
          }
        } else {
          console.error('❌ Upload falhou:', result.message);
        }
        
        res.json(result);
      } catch (error) {
        console.error('❌ Erro crítico no upload:', error.message);
        res.status(500).json({
          success: false,
          message: error.message,
          error: error.message,
          criticalFailure: true
        });
      }
    });

    // Listar portas
    this.app.get('/api/arduino/ports', async (req, res) => {
      try {
        const result = await this.arduinoService.listPorts();
        res.json(result);
      } catch (error) {
        res.status(500).json({
          ports: [],
          error: error.message
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
        const { code, board = 'esp32:esp32:esp32', options = {} } = req.body;
        
        if (!code || !code.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Código é obrigatório'
          });
        }

        console.log(`🔨 Compilação apenas (sem upload) para ${board}`);
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

    // Instalar ESP32 core MANUALMENTE (sem verificação automática)
    this.app.post('/api/arduino/esp32/install', async (req, res) => {
      try {
        console.log('� Instalação MANUAL do ESP32 core solicitada...');
        const result = await this.arduinoService.installCore('esp32:esp32');
        
        res.json({
          success: result.success,
          message: result.success ? 'ESP32 core instalado manualmente' : 'Falha na instalação manual do ESP32 core',
          ...result
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro na instalação manual do ESP32 core',
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

    // Diagnóstico completo do ESP32
    this.app.get('/api/arduino/esp32/diagnostic', async (req, res) => {
      try {
        console.log('🩺 Executando diagnóstico completo do ESP32...');
        const result = await this.arduinoService.diagnosticEsp32();
        
        res.json({
          success: true,
          diagnostic: result
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro no diagnóstico ESP32',
          error: error.message
        });
      }
    });

    // Teste das configurações das placas
    this.app.get('/api/arduino/board-configs', async (req, res) => {
      try {
        console.log('📋 Obtendo configurações das placas...');
        
        const configs = {
          'esp32:esp32:esp32': this.arduinoService.getEsp32BoardConfig('esp32:esp32:esp32'),
          'esp32:esp32:esp32wrover': this.arduinoService.getEsp32BoardConfig('esp32:esp32:esp32wrover'),
          'esp32:esp32:esp32doit-devkit-v1': this.arduinoService.getEsp32BoardConfig('esp32:esp32:esp32doit-devkit-v1'),
          'arduino:avr:uno': this.arduinoService.getEsp32BoardConfig('arduino:avr:uno'),
          'arduino:avr:mega': this.arduinoService.getEsp32BoardConfig('arduino:avr:mega')
        };
        
        res.json({
          success: true,
          configs: configs,
          message: 'Configurações das placas obtidas com sucesso'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro ao obter configurações das placas',
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
        version: '1.0.0',
        description: 'Backend para Arduino CLI e comunicação serial',
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
          esp32_install_manual: 'POST /api/arduino/esp32/install'
        },
        websocket: {
          port: this.wsPort,
          url: `ws://localhost:${this.wsPort}`
        }
      });
    });
  }

  async start() {
    try {
      // Inicializar serviços
      console.log('🚀 Inicializando Arduino CLI Service...');
      await this.arduinoService.initialize();
      
      console.log('🌐 Inicializando Serial WebSocket Service...');
      this.serialService.startWebSocketServer(this.wsPort);
      
      // Iniciar servidor HTTP
      this.server = this.app.listen(this.port, () => {
        console.log('');
        console.log('🎉 IdeiaSpace Backend iniciado com sucesso!');
        console.log('');
        console.log(`📡 Servidor HTTP: http://localhost:${this.port}`);
        console.log(`🔌 WebSocket Serial: ws://localhost:${this.wsPort}`);
        console.log(`📋 Health Check: http://localhost:${this.port}/health`);
        console.log(`📖 Info: http://localhost:${this.port}/api/info`);
        console.log('');
        console.log('🎯 Endpoints principais:');
        console.log(`   POST /api/arduino/compile - Compilar código`);
        console.log(`   POST /api/arduino/upload - Upload para placa`);
        console.log(`   GET  /api/arduino/ports - Listar portas`);
        console.log(`   GET  /api/arduino/boards - Listar placas`);
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
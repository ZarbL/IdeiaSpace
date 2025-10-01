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
          esp32_install: 'POST /api/arduino/esp32/install'
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
          'Remoção de lógica redundante'
        ]
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
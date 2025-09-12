/**
 * Servidor Backend Principal - Express + WebSocket
 * Integra Arduino CLI e comunicação serial para o IdeiaSpace
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
// Usar mock temporariamente até o Arduino CLI ser configurado
const ArduinoCLIService = require('./services/mock-arduino-cli-service');
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

    // Upload
    this.app.post('/api/arduino/upload', async (req, res) => {
      try {
        const { code, port, board = 'esp32:esp32:esp32', options = {} } = req.body;
        
        if (!code || !code.trim()) {
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

        console.log(`📤 Iniciando upload para ${port} (${board})`);
        const result = await this.arduinoService.uploadSketch(code, port, board, options);
        
        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Erro no upload',
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
          upload: 'POST /api/arduino/upload',
          ports: 'GET /api/arduino/ports',
          boards: 'GET /api/arduino/boards',
          libraries: 'GET /api/arduino/libraries',
          install_library: 'POST /api/arduino/library/install',
          update: 'POST /api/arduino/update'
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
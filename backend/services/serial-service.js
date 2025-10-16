/**
 * Serviço de Comunicação Serial - WebSocket
 * Gerencia conexões seriais em tempo real via WebSocket
 */

const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const appConfig = require('../config');

class SerialService {
  constructor(arduinoService = null) {
    this.connections = new Map(); // port -> { serialPort, clients }
    this.wsServer = null;
    this.arduinoService = arduinoService;
  }

  /**
   * Inicia servidor WebSocket
   */
  startWebSocketServer(port = null) {
    const wsPort = port || appConfig.getNetworkConfig().wsPort;
    this.wsServer = new WebSocket.Server({ port: wsPort });
    
    this.wsServer.on('connection', (ws) => {
      console.log('🔌 Nova conexão WebSocket estabelecida');
      
      ws.on('message', async (message) => {
        try {
          // Validar se a mensagem não está vazia
          if (!message || message.length === 0) {
            console.warn('⚠️ Mensagem WebSocket vazia recebida');
            this.sendToClient(ws, {
              type: 'error',
              message: 'Mensagem vazia não é válida'
            });
            return;
          }

          // Tentar fazer parse do JSON
          let data;
          try {
            data = JSON.parse(message);
          } catch (parseError) {
            console.error('❌ Erro ao fazer parse JSON da mensagem WebSocket:', parseError.message);
            console.error('📄 Mensagem recebida:', message.toString().substring(0, 200));
            this.sendToClient(ws, {
              type: 'error',
              message: 'Formato JSON inválido'
            });
            return;
          }

          // Validar estrutura básica
          if (!data || typeof data !== 'object') {
            console.error('❌ Dados WebSocket não são um objeto válido:', typeof data);
            this.sendToClient(ws, {
              type: 'error',
              message: 'Estrutura de dados inválida'
            });
            return;
          }

          await this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('❌ Erro crítico ao processar mensagem WebSocket:', error.message);
          console.error('📄 Stack trace:', error.stack);
          this.sendToClient(ws, {
            type: 'error',
            message: 'Erro interno no servidor'
          });
        }
      });

      ws.on('close', () => {
        console.log('🔌 Conexão WebSocket fechada');
        this.removeClientFromAllConnections(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ Erro na conexão WebSocket:', error.message);
      });

      // Enviar lista de portas disponíveis ao conectar
      this.sendAvailablePorts(ws);
    });

    console.log(`🌐 Servidor WebSocket iniciado na porta ${wsPort}`);
  }

  /**
   * Processa mensagens do WebSocket
   */
  async handleWebSocketMessage(ws, data) {
    try {
      const { type, payload } = data;

      // Validar estrutura básica da mensagem
      if (!type) {
        this.sendToClient(ws, {
          type: 'error',
          message: 'Tipo de mensagem não especificado'
        });
        return;
      }

      console.log(`📨 Mensagem WebSocket recebida: ${type}`, payload ? `com payload` : 'sem payload');

      // Log detalhado para debug de conexões sem payload
      if (type === 'connect' && (!payload || !payload.port)) {
        console.error('🔍 [DEBUG] Tentativa de conexão sem payload detectada:');
        console.error('  - Tipo:', type);
        console.error('  - Payload:', payload);
        console.error('  - Dados completos:', JSON.stringify(data, null, 2));
        console.error('  - Timestamp:', new Date().toISOString());
      }

      switch (type) {
        case 'list_ports':
        case 'listPorts':
          await this.sendAvailablePorts(ws);
          break;

        case 'connect':
          if (!payload || !payload.port) {
            this.sendToClient(ws, {
              type: 'error',
              message: 'Porta não especificada para conexão'
            });
            return;
          }
          await this.connectToPort(ws, payload.port, payload.baudRate || 115200);
          break;

        case 'disconnect':
          if (!payload || !payload.port) {
            this.sendToClient(ws, {
              type: 'error',
              message: 'Porta não especificada para desconexão'
            });
            return;
          }
          await this.disconnectFromPort(ws, payload.port);
          break;

        case 'send_data':
          if (!payload || !payload.port || payload.data === undefined) {
            this.sendToClient(ws, {
              type: 'error',
              message: 'Porta ou dados não especificados para envio'
            });
            return;
          }
          await this.sendDataToPort(payload.port, payload.data);
          break;

        case 'ping':
          this.sendToClient(ws, { type: 'pong', timestamp: Date.now() });
          break;

        default:
          console.log(`⚠️ Tipo de mensagem desconhecido: ${type}`);
          this.sendToClient(ws, {
            type: 'error',
            message: `Tipo de mensagem desconhecido: ${type}`
          });
      }
    } catch (error) {
      console.error('❌ Erro interno ao processar mensagem WebSocket:', error.message);
      this.sendToClient(ws, {
        type: 'error',
        message: 'Erro interno no processamento da mensagem'
      });
    }
  }

  /**
   * Lista portas seriais disponíveis
   */
  async getAvailablePorts() {
    try {
      // Se temos Arduino CLI Service, usar ele primeiro
      if (this.arduinoService) {
        console.log('🔍 Usando Arduino CLI Service para listar portas...');
        const result = await this.arduinoService.listPorts();
        if (result.ports && result.ports.length > 0) {
          return result.ports.map(port => ({
            path: port.address,
            manufacturer: port.manufacturer || 'Desconhecido',
            serialNumber: port.serialNumber || '',
            protocol: port.protocol || 'serial',
            protocolLabel: port.protocolLabel || 'Serial Port',
            vid: port.vid || '',
            pid: port.pid || ''
          }));
        }
      }
      
      // Fallback para SerialPort nativo
      console.log('🔍 Usando SerialPort nativo como fallback...');
      const ports = await SerialPort.list();
      return ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer || 'Desconhecido',
        serialNumber: port.serialNumber || '',
        locationId: port.locationId || '',
        vendorId: port.vendorId || '',
        productId: port.productId || '',
        pnpId: port.pnpId || ''
      }));
    } catch (error) {
      console.error('❌ Erro ao listar portas:', error.message);
      return [];
    }
  }

  /**
   * Envia lista de portas para cliente WebSocket
   */
  async sendAvailablePorts(ws) {
    const ports = await this.getAvailablePorts();
    this.sendToClient(ws, {
      type: 'ports',
      ports: ports,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Conecta a uma porta serial
   */
  async connectToPort(ws, portPath, baudRate) {
    try {
      // Verificar se já existe conexão
      if (this.connections.has(portPath)) {
        const connection = this.connections.get(portPath);
        connection.clients.add(ws);
        
        this.sendToClient(ws, {
          type: 'connected',
          port: portPath,
          baudRate: baudRate,
          message: 'Conectado à porta existente'
        });
        return;
      }

      // Criar nova conexão serial
      const serialPort = new SerialPort({
        path: portPath,
        baudRate: parseInt(baudRate),
        autoOpen: false
      });

      // Parser para ler linhas
      const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      // Configurar eventos
      serialPort.on('open', () => {
        console.log(`✅ Porta ${portPath} aberta com sucesso`);
        console.log(`📡 [DEBUG] Configurações da porta:`);
        console.log(`  - Porta: ${portPath}`);
        console.log(`  - Baud Rate: ${baudRate}`);
        console.log(`  - Parser: ReadlineParser com delimiter \\r\\n`);
        console.log(`📡 [DEBUG] Aguardando dados da ESP32...`);
        
        const connection = {
          serialPort: serialPort,
          parser: parser,
          clients: new Set([ws]),
          baudRate: baudRate
        };
        
        this.connections.set(portPath, connection);

        // Notificar cliente
        this.sendToClient(ws, {
          type: 'connected',
          port: portPath,
          baudRate: baudRate,
          message: 'Conectado com sucesso'
        });

        // Configurar recepção de dados
        parser.on('data', (data) => {
          console.log(`📡 [DEBUG] Dados recebidos da porta ${portPath}:`, data);
          console.log(`📡 [DEBUG] Dados após trim: "${data.trim()}"`);
          console.log(`📡 [DEBUG] Tamanho dos dados: ${data.length} caracteres`);
          
          this.broadcastToPortClients(portPath, {
            type: 'serial_data',
            port: portPath,
            data: data.trim(),
            timestamp: Date.now()
          });
          
          console.log(`📡 [DEBUG] Broadcast realizado para ${connection.clients.size} clientes`);
        });
        
        // Debug: Adicionar listener para dados brutos também
        serialPort.on('data', (rawData) => {
          console.log(`📡 [DEBUG] Dados brutos recebidos: ${rawData.length} bytes`);
          console.log(`📡 [DEBUG] Dados brutos (string): "${rawData.toString()}"`);
          console.log(`📡 [DEBUG] Dados brutos (hex): ${rawData.toString('hex')}`);
          
          // Enviar dados brutos também, mesmo que não sejam uma linha completa
          // Isso ajuda a diagnosticar problemas de baud rate
          const rawString = rawData.toString();
          if (rawString.length > 0) {
            this.broadcastToPortClients(portPath, {
              type: 'serial_data_raw',
              port: portPath,
              data: rawString,
              dataHex: rawData.toString('hex'),
              timestamp: Date.now(),
              isRaw: true
            });
          }
        });
      });

      serialPort.on('error', (error) => {
        console.error(`❌ Erro na porta ${portPath}:`, error.message);
        
        this.sendToClient(ws, {
          type: 'connection_error',
          port: portPath,
          error: error.message
        });

        this.connections.delete(portPath);
      });

      serialPort.on('close', () => {
        console.log(`🔌 Porta ${portPath} fechada`);
        
        this.broadcastToPortClients(portPath, {
          type: 'disconnected',
          port: portPath,
          message: 'Conexão fechada'
        });

        this.connections.delete(portPath);
      });

      // Abrir porta
      serialPort.open();

    } catch (error) {
      console.error(`❌ Erro ao conectar na porta ${portPath}:`, error.message);
      
      this.sendToClient(ws, {
        type: 'connection_error',
        port: portPath,
        error: error.message
      });
    }
  }

  /**
   * Desconecta de uma porta serial
   */
  async disconnectFromPort(ws, portPath) {
    const connection = this.connections.get(portPath);
    
    if (!connection) {
      this.sendToClient(ws, {
        type: 'error',
        message: `Porta ${portPath} não está conectada`
      });
      return;
    }

    // Remover cliente da conexão
    connection.clients.delete(ws);

    // Se não há mais clientes, fechar porta
    if (connection.clients.size === 0) {
      try {
        connection.serialPort.close();
        this.connections.delete(portPath);
        console.log(`🔌 Porta ${portPath} fechada - sem clientes`);
      } catch (error) {
        console.error(`❌ Erro ao fechar porta ${portPath}:`, error.message);
      }
    }

    this.sendToClient(ws, {
      type: 'disconnected',
      port: portPath,
      message: 'Desconectado'
    });
  }

  /**
   * Envia dados para uma porta serial
   */
  async sendDataToPort(portPath, data) {
    const connection = this.connections.get(portPath);
    
    if (!connection) {
      console.error(`❌ Porta ${portPath} não está conectada`);
      return false;
    }

    try {
      connection.serialPort.write(data + '\n');
      console.log(`📤 Dados enviados para ${portPath}: ${data}`);
      
      // Broadcast para clientes que dados foram enviados
      this.broadcastToPortClients(portPath, {
        type: 'data_sent',
        port: portPath,
        data: data,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error(`❌ Erro ao enviar dados para ${portPath}:`, error.message);
      
      this.broadcastToPortClients(portPath, {
        type: 'send_error',
        port: portPath,
        error: error.message
      });
      
      return false;
    }
  }

  /**
   * Envia mensagem para um cliente WebSocket
   */
  sendToClient(ws, message) {
    try {
      // Validar se WebSocket existe e está aberto
      if (!ws) {
        console.warn('⚠️ Tentativa de enviar mensagem para WebSocket inexistente');
        return false;
      }

      if (ws.readyState !== WebSocket.OPEN) {
        console.warn(`⚠️ WebSocket não está aberto (estado: ${ws.readyState})`);
        return false;
      }

      // Validar mensagem
      if (!message || typeof message !== 'object') {
        console.warn('⚠️ Tentativa de enviar mensagem inválida:', typeof message);
        return false;
      }

      // Serializar e enviar
      const jsonMessage = JSON.stringify(message);
      ws.send(jsonMessage);
      return true;

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem WebSocket:', error.message);
      console.error('📄 Mensagem que causou erro:', message);
      return false;
    }
  }

  /**
   * Faz broadcast para todos os clientes de uma porta
   */
  broadcastToPortClients(portPath, message) {
    const connection = this.connections.get(portPath);
    
    if (connection) {
      connection.clients.forEach(client => {
        this.sendToClient(client, message);
      });
    }
  }

  /**
   * Faz broadcast para todos os clientes conectados (todas as portas)
   */
  broadcastToAllClients(message) {
    if (this.wsServer) {
      this.wsServer.clients.forEach(client => {
        this.sendToClient(client, message);
      });
    }
  }

  /**
   * Remove cliente de todas as conexões
   */
  removeClientFromAllConnections(ws) {
    for (const [portPath, connection] of this.connections) {
      connection.clients.delete(ws);
      
      // Se não há mais clientes, fechar porta
      if (connection.clients.size === 0) {
        try {
          connection.serialPort.close();
          this.connections.delete(portPath);
          console.log(`🔌 Porta ${portPath} fechada - cliente desconectado`);
        } catch (error) {
          console.error(`❌ Erro ao fechar porta ${portPath}:`, error.message);
        }
      }
    }
  }

  /**
   * Para o servidor WebSocket
   */
  stop() {
    // Fechar todas as conexões seriais
    for (const [portPath, connection] of this.connections) {
      try {
        connection.serialPort.close();
      } catch (error) {
        console.error(`❌ Erro ao fechar porta ${portPath}:`, error.message);
      }
    }
    
    this.connections.clear();

    // Fechar servidor WebSocket
    if (this.wsServer) {
      this.wsServer.close();
      console.log('🛑 Servidor WebSocket parado');
    }
  }

  /**
   * Força o fechamento de uma porta específica (para liberar para upload)
   */
  async forceClosePort(portPath) {
    const connection = this.connections.get(portPath);
    
    if (connection) {
      console.log(`🛑 Forçando fechamento da porta ${portPath} para upload...`);
      
      try {
        // Notificar clientes sobre fechamento forçado
        this.broadcastToPortClients(portPath, {
          type: 'forced_disconnect',
          port: portPath,
          message: 'Porta fechada para upload de código',
          timestamp: Date.now()
        });
        
        // Fechar porta serial
        if (connection.serialPort && connection.serialPort.isOpen) {
          connection.serialPort.close();
        }
        
        // Remover da lista de conexões
        this.connections.delete(portPath);
        
        console.log(`✅ Porta ${portPath} fechada com sucesso`);
        return true;
        
      } catch (error) {
        console.error(`❌ Erro ao fechar porta ${portPath}:`, error.message);
        this.connections.delete(portPath); // Remover mesmo assim
        return false;
      }
    } else {
      console.log(`ℹ️ Porta ${portPath} não estava conectada`);
      return true;
    }
  }

  /**
   * Obtém status das conexões
   */
  getConnectionsStatus() {
    const status = {};
    
    for (const [portPath, connection] of this.connections) {
      status[portPath] = {
        isOpen: connection.serialPort.isOpen,
        baudRate: connection.baudRate,
        clientCount: connection.clients.size
      };
    }
    
    return status;
  }
}

module.exports = SerialService;
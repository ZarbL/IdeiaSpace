/**
 * Serviço de Comunicação Serial - WebSocket
 * Gerencia conexões seriais em tempo real via WebSocket
 */

const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

class SerialService {
  constructor() {
    this.connections = new Map(); // port -> { serialPort, clients }
    this.wsServer = null;
  }

  /**
   * Inicia servidor WebSocket
   */
  startWebSocketServer(port = 8080) {
    this.wsServer = new WebSocket.Server({ port });
    
    this.wsServer.on('connection', (ws) => {
      console.log('🔌 Nova conexão WebSocket estabelecida');
      
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem WebSocket:', error.message);
          this.sendToClient(ws, {
            type: 'error',
            message: 'Formato de mensagem inválido'
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

    console.log(`🌐 Servidor WebSocket iniciado na porta ${port}`);
  }

  /**
   * Processa mensagens do WebSocket
   */
  async handleWebSocketMessage(ws, data) {
    const { type, payload } = data;

    switch (type) {
      case 'list_ports':
        await this.sendAvailablePorts(ws);
        break;

      case 'connect':
        await this.connectToPort(ws, payload.port, payload.baudRate || 115200);
        break;

      case 'disconnect':
        await this.disconnectFromPort(ws, payload.port);
        break;

      case 'send_data':
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
  }

  /**
   * Lista portas seriais disponíveis
   */
  async getAvailablePorts() {
    try {
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
      type: 'ports_list',
      ports: ports
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
          this.broadcastToPortClients(portPath, {
            type: 'serial_data',
            port: portPath,
            data: data.trim(),
            timestamp: Date.now()
          });
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
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
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
/**
 * Arduino CLI Client Service
 * Integração entre frontend e backend para detecção de portas e operações Arduino
 */

class ArduinoCLIClient {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.isConnected = false;
    console.log(`🔧 ArduinoCLIClient inicializado com baseUrl: ${this.baseUrl}`);
    
    // Detectar contexto (Electron vs Browser)
    this.isElectron = typeof window !== 'undefined' && window.process && window.process.versions && window.process.versions.electron;
    console.log(`🌐 Contexto detectado: ${this.isElectron ? 'Electron' : 'Browser'}`);
  }

  /**
   * Testa conexão com o backend
   */
  async testConnection() {
    try {
      console.log(`🔍 Testando conexão com backend: ${this.baseUrl}`);
      
      // Primeiro, teste de ping rápido
      console.log('📡 Executando ping...');
      const pingResponse = await fetch(`${this.baseUrl}/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(3000) // 3 segundos para ping
      });
      
      if (!pingResponse.ok) {
        throw new Error(`Ping failed: ${pingResponse.status} ${pingResponse.statusText}`);
      }
      
      const pingData = await pingResponse.json();
      console.log('✅ Ping successful:', pingData);
      
      // Agora, health check completo
      console.log('🏥 Executando health check...');
      const healthResponse = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 segundos para health
      });
      
      console.log(`📡 Health check response: ${healthResponse.status} ${healthResponse.statusText}`);
      
      const healthData = await healthResponse.json();
      this.isConnected = healthResponse.ok;
      
      if (this.isConnected) {
        console.log('✅ Backend conectado com sucesso:', healthData);
      } else {
        console.warn('⚠️ Backend respondeu mas com erro:', healthData);
      }
      
      return { success: this.isConnected, data: healthData };
    } catch (error) {
      console.error('❌ Erro na conexão com backend:', {
        message: error.message,
        name: error.name,
        url: this.baseUrl,
        timeout: error.name === 'AbortError'
      });
      
      this.isConnected = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * Lista portas seriais disponíveis
   */
  async listPorts() {
    try {
      console.log(`🔍 Listando portas via: ${this.baseUrl}/api/arduino/ports`);
      
      // Primeiro, verificar se a conexão está funcionando
      if (!this.isConnected) {
        console.log('🔗 Conexão não verificada, testando primeiro...');
        const connectionTest = await this.testConnection();
        if (!connectionTest.success) {
          throw new Error(`Backend não está acessível: ${connectionTest.error}`);
        }
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏱️ Timeout na listagem de portas, cancelando...');
        controller.abort();
      }, 10000); // 10 segundos
      
      const response = await fetch(`${this.baseUrl}/api/arduino/ports`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Response error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('❌ Response não é JSON:', responseText);
        throw new Error(`Expected JSON response but got: ${contentType}`);
      }
      
      const data = await response.json();
      console.log('✅ Portas recebidas:', data);
      
      // Filtrar especificamente portas do ESP32 (CH340, CP2102, etc.)
      if (data.ports && Array.isArray(data.ports)) {
        const esp32Ports = data.ports.filter(port => {
          const isEsp32Port = port.port && (
            port.port.includes('cu.usbserial') ||  // macOS ESP32
            port.port.includes('cu.SLAB_USBtoUART') || // CP2102
            port.port.includes('ttyUSB') ||         // Linux ESP32
            port.port.includes('COM')               // Windows ESP32
          );
          if (isEsp32Port) {
            console.log(`🎯 ESP32 port detected: ${port.port}`);
          }
          return isEsp32Port;
        });
        
        console.log(`📊 Total ports: ${data.ports.length}, ESP32 ports: ${esp32Ports.length}`);
        
        return {
          ...data,
          esp32Ports: esp32Ports,
          totalPorts: data.ports.length
        };
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erro completo ao listar portas:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        url: `${this.baseUrl}/api/arduino/ports`,
        isTimeout: error.name === 'AbortError'
      });
      
      // Verificar se é erro de rede/conexão
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { 
          ports: [], 
          error: `Erro de conexão com backend (${this.baseUrl}). Verifique se o backend está rodando.` 
        };
      }
      
      if (error.name === 'AbortError') {
        return {
          ports: [],
          error: 'Timeout ao listar portas - verifique se o backend está respondendo'
        };
      }
      
      return { ports: [], error: error.message };
    }
  }

  /**
   * Lista placas disponíveis
   */
  async listBoards() {
    try {
      const response = await fetch(`${this.baseUrl}/api/arduino/boards`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao listar placas');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao listar placas:', error.message);
      return { boards: [], error: error.message };
    }
  }

  /**
   * Compila código Arduino
   */
  async compileCode(code, board = 'esp32:esp32:esp32', options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/arduino/compile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, board, options })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro na compilação');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erro na compilação:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Faz upload do código para a placa
   * Agora usa implementação simplificada do Arduino CLI v2.0
   */
  async uploadCode(code, port, board = 'esp32:esp32:esp32') {
    try {
      console.log(`📤 Iniciando upload do código para porta: ${port}`);
      
      const response = await fetch(`${this.baseUrl}/api/arduino/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, port, board })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro no upload');
      }
      
      console.log('✅ Upload concluído com sucesso');
      return data;
    } catch (error) {
      console.error('❌ Erro no upload:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Apenas compila o código sem fazer upload
   */
  async compileOnly(code, board = 'esp32:esp32:esp32', withOutput = false) {
    try {
      const response = await fetch(`${this.baseUrl}/api/arduino/compile-only`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, board, withOutput })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro na compilação');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erro na compilação:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verifica status do ESP32 core
   */
  async checkEsp32Status() {
    try {
      const response = await fetch(`${this.baseUrl}/api/arduino/esp32/status`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao verificar ESP32');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao verificar ESP32:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Atualiza índices do Arduino CLI
   */
  async updateIndexes() {
    try {
      const response = await fetch(`${this.baseUrl}/api/arduino/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar índices');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao atualizar índices:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Tornar disponível globalmente para o renderer
window.ArduinoCLIClient = ArduinoCLIClient;
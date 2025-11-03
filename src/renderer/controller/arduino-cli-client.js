/**
 * Arduino CLI Client Service
 * Integração entre frontend e backend para detecção de portas e operações Arduino
 */

class ArduinoCLIClient {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 10;
    console.log(`🔧 ArduinoCLIClient inicializado com baseUrl: ${this.baseUrl}`);
    
    // Detectar contexto (Electron vs Browser)
    this.isElectron = typeof window !== 'undefined' && window.process && window.process.versions && window.process.versions.electron;
    console.log(`🌐 Contexto detectado: ${this.isElectron ? 'Electron' : 'Browser'}`);
  }

  /**
   * Aguarda o backend estar pronto com retry exponencial
   */
  async waitForBackend(maxAttempts = 10, initialDelay = 500) {
    console.log(`⏳ Aguardando backend estar pronto (máx ${maxAttempts} tentativas)...`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const delay = initialDelay * Math.pow(1.5, attempt - 1); // Backoff exponencial
        console.log(`🔄 Tentativa ${attempt}/${maxAttempts} (aguardando ${Math.round(delay)}ms)...`);
        
        const response = await fetch(`${this.baseUrl}/ping`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          console.log(`✅ Backend pronto na tentativa ${attempt}!`);
          this.isConnected = true;
          return true;
        }
      } catch (error) {
        console.log(`⚠️ Tentativa ${attempt} falhou: ${error.message}`);
        
        if (attempt < maxAttempts) {
          const delay = initialDelay * Math.pow(1.5, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`❌ Backend não respondeu após ${maxAttempts} tentativas`);
    return false;
  }

  /**
   * Testa conexão com o backend
   */
  async testConnection() {
    try {
      console.log(`🔍 Testando conexão com backend: ${this.baseUrl}`);
      
      // Se já tentamos muitas vezes, aguardar o backend
      if (this.connectionAttempts > 3 && !this.isConnected) {
        console.log('🔄 Muitas tentativas falhadas, aguardando backend...');
        const ready = await this.waitForBackend();
        if (!ready) {
          throw new Error('Backend não está respondendo');
        }
      }
      
      this.connectionAttempts++;
      
      // Primeiro, teste de ping rápido
      console.log('📡 Executando ping...');
      const pingResponse = await fetch(`${this.baseUrl}/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 segundos para ping
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
  async listPorts(retryCount = 0) {
    const maxRetries = 3;
    
    try {
      console.log(`🔍 Listando portas via: ${this.baseUrl}/api/arduino/ports (tentativa ${retryCount + 1})`);
      console.log(`🌐 User Agent: ${navigator.userAgent}`);
      console.log(`🔧 Contexto: ${this.isElectron ? 'Electron' : 'Browser'}`);
      
      // NOVO: Primeiro verificar se backend está pronto via health check
      console.log('🏥 Verificando se backend está pronto...');
      try {
        const healthResponse = await fetch(`${this.baseUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log('🏥 Health check resultado:', healthData);
          
          // Se backend ainda está inicializando, esperar um pouco
          if (healthData.status === 'initializing' || !healthData.ready) {
            if (retryCount < maxRetries) {
              console.log('⏳ Backend inicializando, aguardando 2 segundos...');
              await new Promise(resolve => setTimeout(resolve, 2000));
              return this.listPorts(retryCount + 1);
            } else {
              throw new Error('Backend não ficou pronto após ' + maxRetries + ' tentativas');
            }
          }
          
          console.log('✅ Backend pronto, prosseguindo com listagem de portas...');
        }
      } catch (healthError) {
        console.warn('⚠️ Health check falhou:', healthError.message);
        // Continuar mesmo assim, pois pode ser versão antiga do backend
      }
      
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
          const portAddress = port.address || port.port || '';
          const isEsp32Port = portAddress && (
            portAddress.includes('cu.usbserial') ||  // macOS ESP32
            portAddress.includes('cu.SLAB_USBtoUART') || // CP2102
            portAddress.includes('ttyUSB') ||         // Linux ESP32
            portAddress.includes('COM')               // Windows ESP32
          );
          if (isEsp32Port) {
            console.log(`🎯 ESP32 port detected: ${portAddress}`);
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
        console.log('🔄 Tentando fallback via WebSocket...');
        const fallbackResult = await this.listPortsViaWebSocket();
        if (fallbackResult.success) {
          return fallbackResult.data;
        }
        
        // Se WebSocket também falhou e ainda temos tentativas
        if (retryCount < maxRetries) {
          console.log(`🔄 Tentando novamente em 2 segundos... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.listPorts(retryCount + 1);
        }
        
        return { 
          ports: [], 
          error: `Erro de conexão com backend (${this.baseUrl}). Verifique se o backend está rodando.` 
        };
      }
      
      if (error.name === 'AbortError') {
        if (retryCount < maxRetries) {
          console.log(`🔄 Timeout - tentando novamente... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.listPorts(retryCount + 1);
        }
        
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
   * Fallback para listar portas via WebSocket
   */
  async listPortsViaWebSocket() {
    return new Promise((resolve) => {
      try {
        const wsUrl = this.baseUrl.replace('http', 'ws').replace('3001', '8080');
        console.log(`🔄 Tentando WebSocket fallback: ${wsUrl}`);
        
        const ws = new WebSocket(wsUrl);
        const timeout = setTimeout(() => {
          ws.close();
          resolve({ success: false, error: 'WebSocket timeout' });
        }, 5000);
        
        ws.onopen = () => {
          console.log('✅ WebSocket conectado');
          ws.send(JSON.stringify({
            type: 'listPorts'
          }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'ports') {
              clearTimeout(timeout);
              ws.close();
              resolve({ success: true, data: data.ports });
            }
          } catch (error) {
            console.error('❌ Erro ao processar resposta WebSocket:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('❌ Erro WebSocket:', error);
          clearTimeout(timeout);
          resolve({ success: false, error: 'WebSocket error' });
        };
        
        ws.onclose = () => {
          clearTimeout(timeout);
        };
      } catch (error) {
        resolve({ success: false, error: error.message });
      }
    });
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
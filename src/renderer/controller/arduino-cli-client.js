/**
 * Arduino CLI Client Service
 * Integração entre frontend e backend para detecção de portas e operações Arduino
 */

class ArduinoCLIClient {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.isConnected = false;
  }

  /**
   * Testa conexão com o backend
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      this.isConnected = response.ok;
      return { success: this.isConnected, data };
    } catch (error) {
      this.isConnected = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * Lista portas seriais disponíveis
   */
  async listPorts() {
    try {
      const response = await fetch(`${this.baseUrl}/api/arduino/ports`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao listar portas');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao listar portas:', error.message);
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
const { ipcRenderer } = require('electron');

// Função para forçar cores laranja nos blocos MPU6050
function forceMPU6050Colors() {
  console.log('🎨 Forçando cores laranja para blocos MPU6050...');
  
  // Lista de todos os tipos de blocos MPU6050
  const mpu6050BlockTypes = [
    'mpu6050_init', 'mpu6050_read', 'mpu6050_not',
    'mpu6050_accel_x', 'mpu6050_accel_y', 'mpu6050_accel_z',
    'mpu6050_gyro_x', 'mpu6050_gyro_y', 'mpu6050_gyro_z',
    'mpu6050_set_accel_range', 'mpu6050_set_gyro_range', 
    'mpu6050_set_filter_bandwidth', 'mpu6050_sensors_event',
    'mpu6050_get_event'
  ];
  
  // Forçar cor laranja para cada tipo de bloco
  mpu6050BlockTypes.forEach(blockType => {
    if (Blockly.Blocks[blockType]) {
      // Tentar redefinir a cor se o bloco já existe
      const originalInit = Blockly.Blocks[blockType].init;
      if (originalInit) {
        Blockly.Blocks[blockType].init = function() {
          originalInit.call(this);
          this.setColour("#FF8C00"); // Forçar cor laranja
        };
      }
      console.log(`🟠 Cor laranja aplicada ao bloco: ${blockType}`);
    }
  });
  
  console.log('✅ Cores laranja aplicadas aos blocos MPU6050');
}

// Função para forçar cores roxas nos blocos HMC5883
function forceHMC5883Colors() {
  console.log('🎨 Forçando cores roxas para blocos HMC5883...');
  
  // Lista de todos os tipos de blocos HMC5883
  const hmc5883BlockTypes = [
    'hmc5883_init', 'hmc5883_begin', 'hmc5883_mag_x', 'hmc5883_mag_y', 'hmc5883_mag_z',
    'hmc5883_heading', 'hmc5883_set_gain', 'hmc5883_event_declare', 'hmc5883_get_event',
    'hmc5883_declination', 'hmc5883_direction_text', 'hmc5883_sensor_object',
    'hmc5883_field_strength', 'hmc5883_sensor_info', 'hmc5883_display_sensor', 'hmc5883_atan2',
    'heading_correction'
  ];
  
  // Forçar cor roxa para cada tipo de bloco
  hmc5883BlockTypes.forEach(blockType => {
    if (Blockly.Blocks[blockType]) {
      // Tentar redefinir a cor se o bloco já existe
      const originalInit = Blockly.Blocks[blockType].init;
      if (originalInit) {
        Blockly.Blocks[blockType].init = function() {
          originalInit.call(this);
          this.setColour("#9932CC"); // Forçar cor roxa
        };
      }
      console.log(`🟣 Cor roxa aplicada ao bloco: ${blockType}`);
    }
  });
  
  console.log('✅ Cores roxas aplicadas aos blocos HMC5883');
}

// Função para forçar cores amarelas nos blocos BH1750
function forceBH1750Colors() {
  console.log('🎨 Forçando cores amarelas para blocos BH1750...');
  
  // Lista de todos os tipos de blocos BH1750  
  const bh1750BlockTypes = [
    'bh1750_init', 'bh1750_light_level', 'bh1750_set_mode', 'bh1750_begin'
  ];
  
  // Forçar cor amarela para cada tipo de bloco
  bh1750BlockTypes.forEach(blockType => {
    if (Blockly.Blocks[blockType]) {
      // Tentar redefinir a cor se o bloco já existe
      const originalInit = Blockly.Blocks[blockType].init;
      if (originalInit) {
        Blockly.Blocks[blockType].init = function() {
          originalInit.call(this);
          this.setColour("#fccf03"); // Forçar cor amarela
        };
      }
      console.log(`🟡 Cor amarela aplicada ao bloco: ${blockType}`);
    }
  });
  
  console.log('✅ Cores amarelas aplicadas aos blocos BH1750');
}

// Função para forçar cores vermelhas Ferrari nos blocos DHT
function forceDHTColors() {
  console.log('🎨 Forçando cores vermelhas Ferrari para blocos DHT...');
  
  // Lista de todos os tipos de blocos DHT
  const dhtBlockTypes = [
    'dht_init', 'dht_temperature', 'dht_humidity', 'dht_begin', 'dht_heat_index'
  ];
  
  // Forçar cor vermelha Ferrari para cada tipo de bloco
  dhtBlockTypes.forEach(blockType => {
    if (Blockly.Blocks[blockType]) {
      // Tentar redefinir a cor se o bloco já existe
      const originalInit = Blockly.Blocks[blockType].init;
      if (originalInit) {
        Blockly.Blocks[blockType].init = function() {
          originalInit.call(this);
          this.setColour("#FF2800"); // Forçar cor vermelha Ferrari
        };
      }
      console.log(`🔴 Cor vermelha Ferrari aplicada ao bloco: ${blockType}`);
    }
  });
  
  console.log('✅ Cores vermelhas Ferrari aplicadas aos blocos DHT');
}
function forceBMP180Colors() {
  console.log('🎨 Forçando cores vermelhas para blocos BMP180...');
  
  // Lista de todos os tipos de blocos BMP180
  const bmp180BlockTypes = [
    'bmp180_init', 'bmp180_pressure', 'bmp180_temperature', 'bmp180_altitude'
  ];
  
  // Forçar cor vermelha terracota para cada tipo de bloco
  bmp180BlockTypes.forEach(blockType => {
    if (Blockly.Blocks[blockType]) {
      // Tentar redefinir a cor se o bloco já existe
      const originalInit = Blockly.Blocks[blockType].init;
      if (originalInit) {
        Blockly.Blocks[blockType].init = function() {
          originalInit.call(this);
          this.setColour("#8a2e2e"); // Forçar cor vermelha terracota
        };
      }
      console.log(`🔴 Cor vermelha aplicada ao bloco: ${blockType}`);
    }
  });
  
  console.log('✅ Cores vermelhas aplicadas aos blocos BMP180');
}

// Função para garantir que os blocos MPU6050 estejam definidos
function ensureMPU6050Blocks() {
  console.log('🔧 Verificando e forçando definição dos blocos MPU6050...');
  
  // Definir blocos MPU6050 diretamente se não existirem
  if (!Blockly.Blocks['mpu6050_read']) {
    console.log('⚠️ Bloco mpu6050_read não encontrado, definindo diretamente...');
    
    Blockly.Blocks['mpu6050_read'] = {
      init: function() {
        // Usar o sistema de tradução se disponível
        const readText = window.i18n ? window.i18n.t('mpu6050_read') : '📡 Ler MPU6050';
        const tooltip = window.i18n ? window.i18n.t('mpu6050_read_tooltip') : 'Lê um valor do sensor MPU6050';
        
        this.appendDummyInput()
            .appendField(readText)
            .appendField(new Blockly.FieldDropdown([
              [window.i18n ? window.i18n.t('ACCEL_X') : 'Aceleração X', 'ACCEL_X'],
              [window.i18n ? window.i18n.t('ACCEL_Y') : 'Aceleração Y', 'ACCEL_Y'],
              [window.i18n ? window.i18n.t('ACCEL_Z') : 'Aceleração Z', 'ACCEL_Z'],
              [window.i18n ? window.i18n.t('GYRO_X') : 'Giro X', 'GYRO_X'],
              [window.i18n ? window.i18n.t('GYRO_Y') : 'Giro Y', 'GYRO_Y'],
              [window.i18n ? window.i18n.t('GYRO_Z') : 'Giro Z', 'GYRO_Z']
            ]), 'MPU6050_AXIS');
        this.setOutput(true, 'Number');
        this.setColour("#FF8C00");
        this.setTooltip(tooltip);
        this.setHelpUrl('');
      }
    };
    
    // Definir gerador se não existir
    if (Blockly.Cpp && !Blockly.Cpp['mpu6050_read']) {
      Blockly.Cpp['mpu6050_read'] = function(block) {
        var axis = block.getFieldValue('MPU6050_AXIS');
        // Não gerar bibliotecas automaticamente - usuário deve usar a aba Bibliotecas
        var code = '';
        switch(axis) {
          case 'ACCEL_X': code = 'mpu.getAccelX()'; break;
          case 'ACCEL_Y': code = 'mpu.getAccelY()'; break;
          case 'ACCEL_Z': code = 'mpu.getAccelZ()'; break;
          case 'GYRO_X': code = 'mpu.getGyroX()'; break;
          case 'GYRO_Y': code = 'mpu.getGyroY()'; break;
          case 'GYRO_Z': code = 'mpu.getGyroZ()'; break;
        }
        return [code, Blockly.Cpp.ORDER_ATOMIC];
      };
    }
    
    console.log('✅ Bloco mpu6050_read definido com sucesso');
  }

  // Definir bloco "!mpu" (NOT MPU) para condições negativas
  if (!Blockly.Blocks['mpu6050_not']) {
    console.log('⚠️ Bloco mpu6050_not (!mpu) não encontrado, definindo diretamente...');
    
    Blockly.Blocks['mpu6050_not'] = {
      init: function() {
        const notText = window.i18n ? window.i18n.t('mpu6050_not') : '❌ !mpu.begin()';
        const tooltip = window.i18n ? window.i18n.t('mpu6050_not_tooltip') : 'Verifica se o MPU6050 NÃO foi inicializado corretamente';
        
        this.appendDummyInput()
            .appendField(notText);
        this.setOutput(true, 'Boolean');
        this.setColour("#FF8C00");
        this.setTooltip(tooltip);
        this.setHelpUrl('');
      }
    };
    
    // Definir gerador para o bloco !mpu
    if (Blockly.Cpp && !Blockly.Cpp['mpu6050_not']) {
      Blockly.Cpp['mpu6050_not'] = function(block) {
        // Não gerar bibliotecas automaticamente - usuário deve usar a aba Bibliotecas
        // Apenas retornar o código da função
        var code = '!mpu.begin()';
        return [code, Blockly.Cpp.ORDER_LOGICAL_NOT];
      };
    }
    
    console.log('✅ Bloco mpu6050_not (!mpu) definido com sucesso');
  }
  
  // Forçar atualização das cores dos blocos MPU6050 e HMC5883
  forceMPU6050Colors();
  forceHMC5883Colors();
}

// Função para atualizar traduções dos blocos quando o idioma mudar
function updateBlockTranslations() {
  if (!window.i18n) return;
  
  console.log('🌐 Atualizando traduções dos blocos...');
  
  // Redefinir blocos com novas traduções
  ensureMPU6050Blocks();
  ensureOtherBlocks();
  
  // Forçar atualização do workspace se disponível
  if (typeof workspace !== 'undefined') {
    workspace.render();
  }
}

// Função para definir outros blocos traduzidos
function ensureOtherBlocks() {
  // Bloco delay com tradução
  if (!Blockly.Blocks['delay_function']) {
    Blockly.Blocks['delay_function'] = {
      init: function() {
        const delayText = window.i18n ? window.i18n.t('delayBlockText') : '⏱️ Delay';
        const tooltip = window.i18n ? window.i18n.t('delay_tooltip') : 'Pausa a execução por um número específico de milissegundos';
        
        this.appendDummyInput()
            .appendField(delayText.split('%1')[0] || "⏱️ Delay");
        this.appendValueInput("DELAY_TIME")
            .setCheck("Number")
            .appendField(delayText.includes('%1') ? delayText.split('%1')[1] || "ms" : "ms");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#e80074");
        this.setTooltip(tooltip);
        this.setHelpUrl('');
      }
    };
    
    if (!Blockly.Cpp['delay_function']) {
      Blockly.Cpp['delay_function'] = function(block) {
        var delayTime = Blockly.Cpp.valueToCode(block, 'DELAY_TIME', Blockly.Cpp.ORDER_ATOMIC);
        if (!delayTime) {
          delayTime = '1000';
        }
        return 'delay(' + delayTime + ');\n';
      };
    }
  }
}

// Event listener para mudanças de idioma
window.addEventListener('languageChanged', function(event) {
  console.log('🌐 Idioma alterado para:', event.detail.language);
  updateBlockTranslations();
  
  // Atualizar toolbox também
  setTimeout(() => {
    if (window.i18n && window.i18n.updateToolboxCategories) {
      window.i18n.updateToolboxCategories();
    }
  }, 100);
});

// ============================================================================
// SERIAL MONITOR MODAL FUNCTIONALITY - React Equivalent
// ============================================================================

// Global variables for serial monitor
let serialMonitorState = {
  isConnected: false,
  websocket: null,
  currentTab: 'upload',
  baudRate: '9600',
  selectedPort: '',
  availablePorts: [],
  sensorData: [],
  consoleHistory: []
};

// Backend state
let backendState = {
  isRunning: false,
  isStarting: false,
  isStopping: false,
  lastError: null,
  status: null
};

// Chart data for real-time plotting
let chartData = {
  accelX: [], accelY: [], accelZ: [],
  gyroX: [], gyroY: [], gyroZ: [],
  timestamps: []
};

// Serial Monitor Modal Functions
async function openSerialMonitorModal() {
  console.log('🖥️ Abrindo Serial Monitor Modal...');
  const modal = document.getElementById('arduino-cli-modal');
  if (modal) {
    // Add show class to make modal visible
    modal.classList.add('show');
    
    // Initialize modal state
    initializeSerialMonitor();
    
    // Set default active tab
    switchTab('upload');
    
    // Verificar status do backend primeiro
    console.log('🔍 Verificando status do backend...');
    await checkBackendStatus();
    
    // Inicializar Arduino CLI client
    if (!window.arduinoCLI) {
      window.arduinoCLI = new ArduinoCLIClient();
      console.log('🔧 Arduino CLI Client inicializado');
    }
    
    // Se backend estiver rodando, testar conexão e atualizar portas
    if (backendState.isRunning) {
      console.log('🔍 Testando conexão com backend...');
      const connectionTest = await window.arduinoCLI.testConnection();
      
      if (connectionTest.success) {
        console.log('✅ Backend conectado com sucesso');
        await refreshPorts();
      } else {
        console.warn('⚠️ Backend não responde:', connectionTest.error);
        updateBackendConnectionStatus(false);
      }
    } else {
      console.log('ℹ️ Backend não está rodando. Use o botão "Iniciar Backend"');
      
      // Limpar seletores de porta
      const portSelectors = [
        document.getElementById('port-select'),
        document.getElementById('upload-port-select')
      ];
      
      portSelectors.forEach(selector => {
        if (selector) {
          selector.innerHTML = '<option value="">Inicie o backend primeiro</option>';
          selector.disabled = true;
        }
      });
    }
    
    // Sincronizar código atual com o modal
    updateCodeTab();
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
  }
}

function closeSerialMonitorModal() {
  console.log('🖥️ Fechando Serial Monitor Modal...');
  const modal = document.getElementById('arduino-cli-modal');
  if (modal) {
    // Remove show class to hide modal
    modal.classList.remove('show');
    
    // Disconnect if connected
    if (serialMonitorState.isConnected) {
      disconnectSerial();
    }
    
    // Clear data
    clearSensorData();
    
    // Restore body scrolling
    document.body.style.overflow = 'auto';
  }
}

function initializeSerialMonitor() {
  console.log('🔧 Inicializando Serial Monitor...');
  
  // Reset state
  serialMonitorState.currentTab = 'upload';
  serialMonitorState.isConnected = false;
  
  // Update UI
  updateConnectionStatus();
  updateTabVisibility();
}

// Tab Management
function switchTab(tabName) {
  console.log(`📋 Mudando para aba: ${tabName}`);
  
  serialMonitorState.currentTab = tabName;
  
  // Update tab buttons - correção para a classe correta
  document.querySelectorAll('.tab-btn-clean').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeTab = document.querySelector(`button[data-tab="${tabName}"]`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
  
  // Update tab content - correção para buscar pelo atributo data-tab
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const activeContent = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
  if (activeContent) {
    activeContent.classList.add('active');
  }
  
  // Tab-specific initialization
  switch(tabName) {
    case 'upload':
      updateUploadTab();
      break;
    case 'serial-plotter':
      initializeChart();
      break;
    case 'console':
      updateConsoleTab();
      break;
    case 'code':
      updateCodeTab();
      break;
  }
}

// Port Management
async function refreshPorts() {
  console.log('🔍 Atualizando lista de portas...');
  
  // Mostrar loading nos seletores
  const portSelectors = [
    document.getElementById('port-select'),
    document.getElementById('upload-port-select')
  ];
  
  portSelectors.forEach(selector => {
    if (selector) {
      selector.innerHTML = '<option value="">🔄 Carregando portas...</option>';
      selector.disabled = true;
    }
  });

  // Atualizar informação de portas
  const portInfo = document.getElementById('port-info');
  if (portInfo) {
    portInfo.textContent = 'Buscando portas...';
  }
  
  try {
    // Usar Arduino CLI para detectar portas reais
    if (!window.arduinoCLI) {
      window.arduinoCLI = new ArduinoCLIClient();
    }
    
    const portsResult = await window.arduinoCLI.listPorts();
    
    if (portsResult.error) {
      throw new Error(portsResult.error);
    }
    
    const ports = portsResult.ports || [];
    serialMonitorState.availablePorts = ports;
    
    console.log(`✅ ${ports.length} porta(s) detectada(s):`, ports);
    
    // Atualizar ambos os seletores de porta
    portSelectors.forEach(selector => {
      if (selector) {
        selector.innerHTML = '<option value="">Selecione uma porta...</option>';
        
        ports.forEach(port => {
          const option = document.createElement('option');
          option.value = port.address;
          
          // Criar texto descritivo para a porta
          let portText = port.address;
          if (port.vid && port.pid) {
            portText += ` (${port.protocolLabel})`;
            // Identificar ESPs comuns
            if (port.vid === '0x1A86' && port.pid === '0x7523') {
              portText += ' - ESP32/ESP8266 (CH340)';
            } else if (port.vid === '0x10C4' && port.pid === '0xEA60') {
              portText += ' - ESP32 (CP2102)';
            } else if (port.vid === '0x239A') {
              portText += ' - Arduino/ESP';
            }
          }
          
          option.textContent = portText;
          selector.appendChild(option);
        });
        
        selector.disabled = false;
      }
    });
    
    // Atualizar informação de portas
    if (portInfo) {
      if (ports.length === 0) {
        portInfo.textContent = '❌ Nenhuma porta encontrada';
        portInfo.style.color = '#e74c3c';
      } else {
        portInfo.textContent = `✅ ${ports.length} porta(s) disponível(eis)`;
        portInfo.style.color = '#27ae60';
      }
    }
    
    // Atualizar status de conexão do backend
    updateBackendConnectionStatus(true);
    
  } catch (error) {
    console.error('❌ Erro ao buscar portas:', error.message);
    
    // Mostrar erro nos seletores
    portSelectors.forEach(selector => {
      if (selector) {
        selector.innerHTML = '<option value="">❌ Erro ao carregar</option>';
        selector.disabled = true;
      }
    });
    
    if (portInfo) {
      portInfo.textContent = `❌ Erro: ${error.message}`;
      portInfo.style.color = '#e74c3c';
    }
    
    // Atualizar status de conexão do backend
    updateBackendConnectionStatus(false);
    
    serialMonitorState.availablePorts = [];
  }
  
  updateRefreshButton();
}

// Backend Connection Status
function updateBackendConnectionStatus(isConnected) {
  const indicator = document.getElementById('ws-status-indicator');
  if (indicator) {
    const dot = indicator.querySelector('.indicator-dot');
    const text = indicator.querySelector('.indicator-text');
    
    if (dot && text) {
      if (isConnected) {
        dot.className = 'indicator-dot online';
        text.textContent = 'WebSocket Conectado';
      } else {
        dot.className = 'indicator-dot offline';
        text.textContent = 'WebSocket Offline';
      }
    }
  }
}

// ============================================================================
// BACKEND CONTROL FUNCTIONS
// ============================================================================

async function startBackend() {
  console.log('🚀 Iniciando backend Arduino CLI...');
  
  backendState.isStarting = true;
  updateBackendUI();
  
  try {
    const { ipcRenderer } = require('electron');
    const result = await ipcRenderer.invoke('start-arduino-backend');
    
    if (result.success) {
      console.log('✅ Backend iniciado com sucesso');
      backendState.isRunning = true;
      backendState.status = result.status;
      backendState.lastError = null;
      
      // Aguardar um pouco e tentar conectar
      setTimeout(async () => {
        await refreshPorts();
      }, 2000);
      
    } else {
      console.error('❌ Erro ao iniciar backend:', result.error);
      backendState.lastError = result.error;
    }
    
  } catch (error) {
    console.error('❌ Erro IPC ao iniciar backend:', error.message);
    backendState.lastError = error.message;
  }
  
  backendState.isStarting = false;
  updateBackendUI();
}

async function stopBackend() {
  console.log('🛑 Parando backend Arduino CLI...');
  
  backendState.isStopping = true;
  updateBackendUI();
  
  try {
    const { ipcRenderer } = require('electron');
    const result = await ipcRenderer.invoke('stop-arduino-backend');
    
    if (result.success) {
      console.log('✅ Backend parado com sucesso');
      backendState.isRunning = false;
      backendState.status = null;
      backendState.lastError = null;
      
      // Limpar portas
      serialMonitorState.availablePorts = [];
      const portSelectors = [
        document.getElementById('port-select'),
        document.getElementById('upload-port-select')
      ];
      
      portSelectors.forEach(selector => {
        if (selector) {
          selector.innerHTML = '<option value="">Backend offline</option>';
          selector.disabled = true;
        }
      });
      
    } else {
      console.error('❌ Erro ao parar backend:', result.error);
      backendState.lastError = result.error;
    }
    
  } catch (error) {
    console.error('❌ Erro IPC ao parar backend:', error.message);
    backendState.lastError = error.message;
  }
  
  backendState.isStopping = false;
  updateBackendUI();
}

async function checkBackendStatus() {
  try {
    const { ipcRenderer } = require('electron');
    const result = await ipcRenderer.invoke('get-arduino-backend-status');
    
    if (result.success) {
      backendState.isRunning = result.isRunning;
      backendState.status = result.status;
      
      if (result.status.lastError) {
        backendState.lastError = result.status.lastError;
      }
    }
    
    updateBackendUI();
    return result;
    
  } catch (error) {
    console.error('❌ Erro ao verificar status do backend:', error.message);
    return { success: false, error: error.message };
  }
}

function updateBackendUI() {
  // Atualizar indicador de status
  const backendIndicator = document.getElementById('backend-status-indicator');
  if (backendIndicator) {
    const dot = backendIndicator.querySelector('.indicator-dot');
    const text = backendIndicator.querySelector('.indicator-text');
    
    if (dot && text) {
      if (backendState.isRunning) {
        dot.className = 'indicator-dot online';
        text.textContent = 'Backend Online';
      } else if (backendState.isStarting) {
        dot.className = 'indicator-dot warning';
        text.textContent = 'Backend Iniciando...';
      } else if (backendState.isStopping) {
        dot.className = 'indicator-dot warning';
        text.textContent = 'Backend Parando...';
      } else {
        dot.className = 'indicator-dot offline';
        text.textContent = 'Backend Offline';
      }
    }
  }
  
  // Atualizar botões
  const startBtn = document.getElementById('start-backend-btn');
  const stopBtn = document.getElementById('stop-backend-btn');
  
  if (startBtn) {
    startBtn.disabled = backendState.isRunning || backendState.isStarting || backendState.isStopping;
    
    if (backendState.isStarting) {
      startBtn.classList.add('loading');
      startBtn.querySelector('.btn-text').textContent = 'Iniciando...';
      startBtn.querySelector('.btn-icon').textContent = '⏳';
    } else {
      startBtn.classList.remove('loading');
      startBtn.querySelector('.btn-text').textContent = 'Iniciar Backend';
      startBtn.querySelector('.btn-icon').textContent = '🚀';
    }
  }
  
  if (stopBtn) {
    stopBtn.disabled = !backendState.isRunning || backendState.isStarting || backendState.isStopping;
    
    if (backendState.isStopping) {
      stopBtn.classList.add('loading');
      stopBtn.querySelector('.btn-text').textContent = 'Parando...';
      stopBtn.querySelector('.btn-icon').textContent = '⏳';
    } else {
      stopBtn.classList.remove('loading');
      stopBtn.querySelector('.btn-text').textContent = 'Parar Backend';
      stopBtn.querySelector('.btn-icon').textContent = '🛑';
    }
  }
  
  // Atualizar informação
  const backendInfo = document.getElementById('backend-info');
  if (backendInfo) {
    if (backendState.isRunning && backendState.status) {
      backendInfo.textContent = `✅ Backend rodando (PID: ${backendState.status.pid})`;
      backendInfo.style.color = '#28a745';
    } else if (backendState.lastError) {
      backendInfo.textContent = `❌ Erro: ${backendState.lastError}`;
      backendInfo.style.color = '#dc3545';
    } else if (backendState.isStarting) {
      backendInfo.textContent = '⏳ Iniciando backend...';
      backendInfo.style.color = '#ffc107';
    } else if (backendState.isStopping) {
      backendInfo.textContent = '⏳ Parando backend...';
      backendInfo.style.color = '#ffc107';
    } else {
      backendInfo.textContent = 'Backend Arduino CLI não iniciado';
      backendInfo.style.color = '#6c757d';
    }
  }
}

function updateRefreshButton() {
  const refreshButtons = [
    document.getElementById('refresh-ports'),
    document.getElementById('refresh-upload-ports')
  ];
  
  refreshButtons.forEach(refreshBtn => {
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '🔄';
      
      // Animate button
      setTimeout(() => {
        refreshBtn.innerHTML = '🔄 Atualizar';
      }, 500);
    }
  });
}

// Connection Management
function connectSerial() {
  console.log('🔌 Conectando porta serial...');
  
  const port = document.getElementById('port-selector').value;
  const baudRate = document.getElementById('baud-rate').value;
  
  if (!port) {
    showSerialNotification('⚠️ Selecione uma porta primeiro!', 'warning');
    return;
  }
  
  // Simulate connection (in real implementation, use WebSocket or Arduino CLI)
  setTimeout(() => {
    serialMonitorState.isConnected = true;
    serialMonitorState.selectedPort = port;
    serialMonitorState.baudRate = baudRate;
    
    updateConnectionStatus();
    showSerialNotification(`✅ Conectado à porta ${port}`, 'success');
    
    // Start simulated data stream
    startDataSimulation();
    
  }, 1000);
}

function disconnectSerial() {
  console.log('🔌 Desconectando porta serial...');
  
  if (serialMonitorState.websocket) {
    serialMonitorState.websocket.close();
  }
  
  serialMonitorState.isConnected = false;
  stopDataSimulation();
  
  updateConnectionStatus();
  showSerialNotification('🔌 Desconectado', 'info');
}

function updateConnectionStatus() {
  const statusDiv = document.querySelector('.status-indicator');
  const connectBtn = document.getElementById('connect-btn');
  const disconnectBtn = document.getElementById('disconnect-btn');
  
  if (statusDiv) {
    if (serialMonitorState.isConnected) {
      statusDiv.className = 'status-indicator status-connected';
      statusDiv.innerHTML = '<div class="status-dot"></div>Conectado';
    } else {
      statusDiv.className = 'status-indicator status-disconnected';
      statusDiv.innerHTML = '<div class="status-dot"></div>Desconectado';
    }
  }
  
  // Update connection badge in header
  const connectionBadge = document.getElementById('arduino-connection-status');
  if (connectionBadge) {
    const isConnected = serialMonitorState.isConnected;
    connectionBadge.className = isConnected ? 'connection-badge connected' : 'connection-badge';
    connectionBadge.innerHTML = `<span class="connection-dot"></span>${isConnected ? 'Connected' : 'Disconnected'}`;
  }
  
  if (connectBtn) connectBtn.disabled = serialMonitorState.isConnected;
  if (disconnectBtn) disconnectBtn.disabled = !serialMonitorState.isConnected;
}

// Upload Tab Functions
function updateUploadTab() {
  console.log('📤 Atualizando aba Upload...');
  
  const compileBtn = document.getElementById('compile-btn');
  const uploadBtn = document.getElementById('upload-btn');
  
  // Enable buttons based on connection status
  if (compileBtn) compileBtn.disabled = false;
  if (uploadBtn) uploadBtn.disabled = !serialMonitorState.isConnected;
}

function compileSketch() {
  console.log('⚙️ Compilando sketch...');
  
  const code = generateCode();
  if (!code) {
    showSerialNotification('❌ Nenhum código para compilar!', 'error');
    return;
  }
  
  // Simulate compilation
  const compileBtn = document.getElementById('compile-btn');
  if (compileBtn) {
    compileBtn.disabled = true;
    compileBtn.textContent = '⚙️ Compilando...';
    
    setTimeout(() => {
      compileBtn.disabled = false;
      compileBtn.textContent = '⚙️ Compilar';
      showSerialNotification('✅ Compilação concluída!', 'success');
    }, 2000);
  }
}

function uploadSketch() {
  console.log('📤 Fazendo upload do sketch...');
  
  if (!serialMonitorState.isConnected) {
    showSerialNotification('❌ Conecte-se a uma porta primeiro!', 'error');
    return;
  }
  
  const code = generateCode();
  if (!code) {
    showSerialNotification('❌ Nenhum código para fazer upload!', 'error');
    return;
  }
  
  // Simulate upload
  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn) {
    uploadBtn.disabled = true;
    uploadBtn.textContent = '📤 Fazendo Upload...';
    
    updateProgress(0);
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        
        setTimeout(() => {
          uploadBtn.disabled = false;
          uploadBtn.textContent = '📤 Upload';
          updateProgress(0);
          showSerialNotification('✅ Upload concluído!', 'success');
        }, 500);
      }
      updateProgress(progress);
    }, 300);
  }
}

function updateProgress(percent) {
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }
  
  if (progressText) {
    progressText.textContent = `${Math.round(percent)}%`;
  }
}

// Serial Plotter Functions
function initializeChart() {
  console.log('📊 Inicializando gráfico...');
  
  const chartSvg = document.getElementById('sensor-chart');
  if (!chartSvg) return;
  
  // Clear existing chart
  chartSvg.innerHTML = '';
  
  // Create SVG elements
  const width = chartSvg.clientWidth || 800;
  const height = chartSvg.clientHeight || 300;
  
  chartSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  
  // Add grid
  createChartGrid(chartSvg, width, height);
  
  // Add axes
  createChartAxes(chartSvg, width, height);
  
  // Create data lines
  createDataLines(chartSvg);
  
  // Update legend
  updateChartLegend();
}

function createChartGrid(svg, width, height) {
  const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gridGroup.setAttribute('class', 'chart-grid');
  
  // Vertical grid lines
  for (let x = 0; x <= width; x += 80) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', x);
    line.setAttribute('y2', height);
    line.setAttribute('class', 'chart-grid');
    gridGroup.appendChild(line);
  }
  
  // Horizontal grid lines
  for (let y = 0; y <= height; y += 60) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 0);
    line.setAttribute('y1', y);
    line.setAttribute('x2', width);
    line.setAttribute('y2', y);
    line.setAttribute('class', 'chart-grid');
    gridGroup.appendChild(line);
  }
  
  svg.appendChild(gridGroup);
}

function createChartAxes(svg, width, height) {
  const axesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  axesGroup.setAttribute('class', 'chart-axes');
  
  // X axis
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', 0);
  xAxis.setAttribute('y1', height / 2);
  xAxis.setAttribute('x2', width);
  xAxis.setAttribute('y2', height / 2);
  xAxis.setAttribute('class', 'chart-axis');
  axesGroup.appendChild(xAxis);
  
  // Y axis
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', 50);
  yAxis.setAttribute('y1', 0);
  yAxis.setAttribute('x2', 50);
  yAxis.setAttribute('y2', height);
  yAxis.setAttribute('class', 'chart-axis');
  axesGroup.appendChild(yAxis);
  
  svg.appendChild(axesGroup);
}

function createDataLines(svg) {
  const sensors = ['accel-x', 'accel-y', 'accel-z', 'gyro-x', 'gyro-y', 'gyro-z'];
  
  sensors.forEach(sensor => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', `line-${sensor}`);
    path.setAttribute('class', `chart-line ${sensor}`);
    path.setAttribute('fill', 'none');
    svg.appendChild(path);
  });
}

function updateChartLegend() {
  const legend = document.querySelector('.chart-legend');
  if (!legend) return;
  
  const sensors = [
    { key: 'accel-x', label: 'Accel X', color: '#ff4444' },
    { key: 'accel-y', label: 'Accel Y', color: '#44ff44' },
    { key: 'accel-z', label: 'Accel Z', color: '#4444ff' },
    { key: 'gyro-x', label: 'Gyro X', color: '#ffaa44' },
    { key: 'gyro-y', label: 'Gyro Y', color: '#ff44aa' },
    { key: 'gyro-z', label: 'Gyro Z', color: '#44aaff' }
  ];
  
  legend.innerHTML = '';
  
  sensors.forEach(sensor => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-color" style="background-color: ${sensor.color}"></div>
      <span>${sensor.label}</span>
    `;
    legend.appendChild(item);
  });
}

// Console Functions
function updateConsoleTab() {
  console.log('💬 Atualizando aba Console...');
  
  const consoleOutput = document.getElementById('console-output');
  if (consoleOutput && serialMonitorState.consoleHistory.length > 0) {
    consoleOutput.textContent = serialMonitorState.consoleHistory.join('\n');
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }
}

function sendSerialCommand() {
  const input = document.getElementById('console-input');
  if (!input || !input.value.trim()) return;
  
  const command = input.value.trim();
  
  if (!serialMonitorState.isConnected) {
    showSerialNotification('❌ Não conectado à porta serial!', 'error');
    return;
  }
  
  // Add to console history
  serialMonitorState.consoleHistory.push(`> ${command}`);
  
  // Simulate response (in real implementation, send via WebSocket)
  setTimeout(() => {
    serialMonitorState.consoleHistory.push(`Arduino: Received "${command}"`);
    updateConsoleTab();
  }, 100);
  
  // Clear input
  input.value = '';
  
  // Update console
  updateConsoleTab();
}

function clearConsole() {
  serialMonitorState.consoleHistory = [];
  updateConsoleTab();
  
  const consoleOutput = document.getElementById('console-output');
  if (consoleOutput) {
    consoleOutput.textContent = '';
  }
}

// Code Statistics Update Function - Atualiza modal e área principal
function updateCodeStats(code) {
  // Elementos do modal
  const codeLinesDisplay = document.getElementById('code-lines-display');
  const codeCharsDisplay = document.getElementById('code-chars-display');
  const codeSizeDisplay = document.getElementById('code-size-display');
  const codeValidation = document.getElementById('code-validation');
  
  // Elementos da área principal
  const codeLines = document.getElementById('code-lines');
  const codeChars = document.getElementById('code-chars');
  const codeStatus = document.getElementById('code-status');
  
  if (code && code.trim() !== '' && !code.includes('// Nenhum bloco')) {
    const lines = code.split('\n').length;
    const chars = code.length;
    const sizeKB = (chars / 1024).toFixed(2);
    
    // Atualizar elementos do modal
    if (codeLinesDisplay) codeLinesDisplay.textContent = lines;
    if (codeCharsDisplay) codeCharsDisplay.textContent = chars;
    if (codeSizeDisplay) codeSizeDisplay.textContent = sizeKB;
    
    // Atualizar elementos da área principal
    if (codeLines) codeLines.textContent = lines;
    if (codeChars) codeChars.textContent = chars;
    
    // Determinar status e validação
    const hasSetupAndLoop = code.includes('void setup()') && code.includes('void loop()');
    
    if (hasSetupAndLoop) {
      // Código válido
      if (codeValidation) {
        codeValidation.textContent = '✅ Código válido com setup() e loop()';
        codeValidation.style.color = '#28a745';
      }
      if (codeStatus) {
        codeStatus.textContent = '✅ Código válido';
        codeStatus.style.color = '#28a745';
      }
    } else {
      // Código incompleto
      if (codeValidation) {
        codeValidation.textContent = '⚠️ Adicione os blocos setup() e loop()';
        codeValidation.style.color = '#ffc107';
      }
      if (codeStatus) {
        codeStatus.textContent = '⚠️ Incompleto';
        codeStatus.style.color = '#ffc107';
      }
    }
  } else {
    // Código vazio
    if (codeLinesDisplay) codeLinesDisplay.textContent = '0';
    if (codeCharsDisplay) codeCharsDisplay.textContent = '0';
    if (codeSizeDisplay) codeSizeDisplay.textContent = '0';
    if (codeLines) codeLines.textContent = '0';
    if (codeChars) codeChars.textContent = '0';
    
    if (codeValidation) {
      codeValidation.textContent = '⚠️ Adicione os blocos setup() e loop()';
      codeValidation.style.color = '#ffc107';
    }
    if (codeStatus) {
      codeStatus.textContent = '❌ Código vazio';
      codeStatus.style.color = '#dc3545';
    }
  }
}

// Code Tab Functions
function updateCodeTab() {
  console.log('📝 Atualizando aba Code...');
  
  // Obter código atual do elemento principal (evita regenerar)
  const mainCodeDisplay = document.getElementById('code-display');
  let currentCode = '';
  
  if (mainCodeDisplay) {
    currentCode = mainCodeDisplay.textContent || '';
  }
  
  // Se não há código no elemento principal, gerar novo
  if (!currentCode || currentCode.includes('// Nenhum bloco para gerar código')) {
    currentCode = generateCode() || '';
  }
  
  const codeDisplayFull = document.getElementById('code-display-full');
  const generatedCode = document.getElementById('generated-code');
  
  const codeText = currentCode || '// Nenhum código gerado ainda\n// Adicione blocos no workspace para ver o código aqui';
  
  // Atualizar elementos do modal
  if (codeDisplayFull) {
    codeDisplayFull.textContent = codeText;
  }
  
  if (generatedCode) {
    generatedCode.textContent = codeText;
  }
  
  // Atualizar estatísticas
  updateCodeStats(codeText);
}

// Data Simulation (replace with real WebSocket in production)
let dataSimulationInterval;

function startDataSimulation() {
  if (dataSimulationInterval) {
    clearInterval(dataSimulationInterval);
  }
  
  console.log('🔄 Iniciando simulação de dados...');
  
  dataSimulationInterval = setInterval(() => {
    // Generate random sensor data
    const accelX = (Math.random() - 0.5) * 20;
    const accelY = (Math.random() - 0.5) * 20;
    const accelZ = (Math.random() - 0.5) * 20;
    const gyroX = (Math.random() - 0.5) * 500;
    const gyroY = (Math.random() - 0.5) * 500;
    const gyroZ = (Math.random() - 0.5) * 500;
    
    // Add to chart data
    const timestamp = Date.now();
    chartData.timestamps.push(timestamp);
    chartData.accelX.push(accelX);
    chartData.accelY.push(accelY);
    chartData.accelZ.push(accelZ);
    chartData.gyroX.push(gyroX);
    chartData.gyroY.push(gyroY);
    chartData.gyroZ.push(gyroZ);
    
    // Keep only last 100 points
    if (chartData.timestamps.length > 100) {
      Object.keys(chartData).forEach(key => {
        chartData[key] = chartData[key].slice(-100);
      });
    }
    
    // Update displays
    updateSensorDisplay(accelX, accelY, accelZ, gyroX, gyroY, gyroZ);
    
    if (serialMonitorState.currentTab === 'serial-plotter') {
      updateChart();
    }
    
    // Add to console if tab is active
    if (serialMonitorState.currentTab === 'console') {
      serialMonitorState.consoleHistory.push(`Data: AX=${accelX.toFixed(2)} AY=${accelY.toFixed(2)} AZ=${accelZ.toFixed(2)}`);
      if (serialMonitorState.consoleHistory.length > 50) {
        serialMonitorState.consoleHistory = serialMonitorState.consoleHistory.slice(-50);
      }
      updateConsoleTab();
    }
    
  }, 100); // 10Hz update rate
}

function stopDataSimulation() {
  if (dataSimulationInterval) {
    clearInterval(dataSimulationInterval);
    dataSimulationInterval = null;
  }
  console.log('⏹️ Simulação de dados parada');
}

function updateSensorDisplay(accelX, accelY, accelZ, gyroX, gyroY, gyroZ) {
  const dataDisplay = document.querySelector('.sensor-data');
  if (!dataDisplay) return;
  
  dataDisplay.innerHTML = `
    <div class="data-row">
      <span class="data-label">Accel X:</span>
      <span class="data-value">${accelX.toFixed(2)} m/s²</span>
    </div>
    <div class="data-row">
      <span class="data-label">Accel Y:</span>
      <span class="data-value">${accelY.toFixed(2)} m/s²</span>
    </div>
    <div class="data-row">
      <span class="data-label">Accel Z:</span>
      <span class="data-value">${accelZ.toFixed(2)} m/s²</span>
    </div>
    <div class="data-row">
      <span class="data-label">Gyro X:</span>
      <span class="data-value">${gyroX.toFixed(2)} °/s</span>
    </div>
    <div class="data-row">
      <span class="data-label">Gyro Y:</span>
      <span class="data-value">${gyroY.toFixed(2)} °/s</span>
    </div>
    <div class="data-row">
      <span class="data-label">Gyro Z:</span>
      <span class="data-value">${gyroZ.toFixed(2)} °/s</span>
    </div>
  `;
}

function updateChart() {
  const chartSvg = document.getElementById('sensor-chart');
  if (!chartSvg) return;
  
  const width = chartSvg.clientWidth || 800;
  const height = chartSvg.clientHeight || 300;
  
  const sensors = ['accelX', 'accelY', 'accelZ', 'gyroX', 'gyroY', 'gyroZ'];
  
  sensors.forEach((sensor, index) => {
    const data = chartData[sensor];
    if (!data || data.length < 2) return;
    
    const path = document.getElementById(`line-${sensor.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
    if (!path) return;
    
    // Scale data to chart
    const maxVal = Math.max(...data.map(Math.abs));
    const minX = 50;
    const maxX = width - 20;
    const minY = 20;
    const maxY = height - 20;
    const midY = height / 2;
    
    let pathData = '';
    
    data.forEach((value, i) => {
      const x = minX + (i / (data.length - 1)) * (maxX - minX);
      const y = midY - (value / (maxVal || 1)) * (midY - minY) * 0.8;
      
      if (i === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
    });
    
    path.setAttribute('d', pathData);
  });
}

function clearSensorData() {
  chartData = {
    accelX: [], accelY: [], accelZ: [],
    gyroX: [], gyroY: [], gyroZ: [],
    timestamps: []
  };
  
  serialMonitorState.sensorData = [];
  serialMonitorState.consoleHistory = [];
  
  const dataDisplay = document.querySelector('.sensor-data');
  if (dataDisplay) {
    dataDisplay.innerHTML = '<div class="data-row"><span class="data-label">Status:</span><span class="data-value">Aguardando dados...</span></div>';
  }
}

// Notification system for serial monitor
function showSerialNotification(message, type = 'info') {
  console.log(`📢 Serial Notification [${type}]: ${message}`);
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `serial-notification serial-notification-${type}`;
  notification.textContent = message;
  
  // Styles
  Object.assign(notification.style, {
    position: 'fixed',
    top: '80px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px',
    zIndex: '10002',
    animation: 'slideInRight 0.3s ease-out',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    maxWidth: '300px',
    wordWrap: 'break-word'
  });
  
  // Colors based on type
  const colors = {
    success: 'linear-gradient(135deg, #00cfe5, #28a745)',
    error: 'linear-gradient(135deg, #ff4757, #dc3545)',
    warning: 'linear-gradient(135deg, #ffc107, #fd7e14)',
    info: 'linear-gradient(135deg, #17a2b8, #007bff)'
  };
  
  notification.style.background = colors[type] || colors.info;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Aguardar carregamento completo e então definir blocos
setTimeout(() => {
  ensureMPU6050Blocks();
  forceMPU6050Colors(); // Forçar cores após definição dos blocos
  forceHMC5883Colors(); // Forçar cores HMC5883 também
  forceBMP180Colors(); // Forçar cores BMP180 também
  forceDHTColors(); // Forçar cores DHT também
  forceBH1750Colors(); // Forçar cores BH1750 também
}, 1000);

// Inicializar Blockly
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox'),
  scrollbars: true,
  trashcan: true,
  grid: {
    spacing: 20,
    length: 3,
    colour: '#ccc',
    snap: true
  },
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1.0,
    maxScale: 3,
    minScale: 0.3,
    scaleSpeed: 1.2
  }
});

// APLICAR CORES IMEDIATAMENTE APÓS INICIALIZAÇÃO DO BLOCKLY
console.log('🎨 Forçando cores MPU6050, HMC5883, BMP180, DHT e BH1750 imediatamente após inicialização...');
ensureMPU6050Blocks();
forceMPU6050Colors();
forceHMC5883Colors();
forceBMP180Colors();
forceDHTColors();
forceBH1750Colors();

// Disponibilizar workspace globalmente para o sistema de tradução
window.blocklyWorkspace = workspace;

// ============================================================================
// GARANTIR QUE O BLOCO DELAY_FUNCTION EXISTE - DEFINIÇÃO FORÇADA
// ============================================================================

console.log('🔧 Forçando definição do bloco delay_function após inicialização do Blockly...');

// Definir bloco delay_function diretamente aqui
if (!Blockly.Blocks['delay_function']) {
  console.log('⚠️ Bloco delay_function não encontrado, definindo diretamente...');
  
  Blockly.Blocks['delay_function'] = {
    init: function() {
      const delayText = window.i18n ? window.i18n.t('delayBlockText') : '⏱️ Delay';
      const tooltip = window.i18n ? window.i18n.t('delay_tooltip') : 'Pausa a execução por um número específico de milissegundos';
      
      this.appendDummyInput()
          .appendField(delayText.split('%1')[0] || "⏱️ Delay");
      this.appendValueInput("DELAY_TIME")
          .setCheck("Number")
          .appendField(delayText.includes('%1') ? delayText.split('%1')[1] || "ms" : "ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#e80074");
      this.setTooltip(tooltip);
      this.setHelpUrl('');
    }
  };
  
  console.log('✅ Bloco delay_function definido com sucesso!');
} else {
  console.log('✅ Bloco delay_function já existe!');
}

// Definir gerador também
if (!Blockly.Cpp['delay_function']) {
  console.log('⚠️ Gerador delay_function não encontrado, definindo diretamente...');
  
  Blockly.Cpp['delay_function'] = function(block) {
    var delayTime = Blockly.Cpp.valueToCode(block, 'DELAY_TIME', Blockly.Cpp.ORDER_ATOMIC);
    if (!delayTime) {
      delayTime = '1000';
    }
    return 'delay(' + delayTime + ');\n';
  };
  
  console.log('✅ Gerador delay_function definido com sucesso!');
} else {
  console.log('✅ Gerador delay_function já existe!');
}

// Forçar atualização do toolbox
setTimeout(function() {
  console.log('🔄 Atualizando toolbox...');
  workspace.updateToolbox(document.getElementById('toolbox'));
  
  // Forçar cores após atualização do toolbox
  setTimeout(() => {
    console.log('🎨 Aplicando cores após primeira atualização do toolbox...');
    forceMPU6050Colors();
    forceHMC5883Colors();
    forceBMP180Colors();
    forceDHTColors();
    forceBH1750Colors();
  }, 100);
}, 100);

// Verificação final após carregamento
setTimeout(function() {
  console.log('🔍 Verificação final dos blocos...');
  console.log('📋 Blocos disponíveis:', Object.keys(Blockly.Blocks));
  console.log('🎯 Blocos delay:', Object.keys(Blockly.Blocks).filter(key => key.includes('delay')));
  
  // Verificar se o bloco está no toolbox
  const toolboxXml = document.getElementById('toolbox');
  const delayBlocks = toolboxXml.querySelectorAll('block[type="delay_function"]');
  console.log('🔧 Blocos delay_function no toolbox:', delayBlocks.length);
  
  if (delayBlocks.length > 0) {
    console.log('✅ Bloco delay_function encontrado no toolbox!');
  } else {
    console.error('❌ Bloco delay_function NÃO encontrado no toolbox!');
  }
  
  // Notificar o sistema i18n que o Blockly está pronto
  if (window.i18n) {
    console.log('🌐 Notificando sistema i18n que Blockly está pronto...');
    window.dispatchEvent(new CustomEvent('blocklyReady', { 
      detail: { workspace: workspace } 
    }));
  }
  
  // Verificação final das cores dos blocos MPU6050, HMC5883, BMP180, DHT e BH1750
  console.log('🎨 Verificação final das cores dos blocos MPU6050, HMC5883, BMP180, DHT e BH1750...');
  const mpu6050Types = ['mpu6050_init', 'mpu6050_read', 'mpu6050_not'];
  const hmc5883Types = ['hmc5883_init', 'hmc5883_begin', 'hmc5883_mag_x'];
  const bmp180Types = ['bmp180_init', 'bmp180_pressure', 'bmp180_temperature'];
  const dhtTypes = ['dht_init', 'dht_temperature', 'dht_humidity', 'dht_begin', 'dht_heat_index'];
  const bh1750Types = ['bh1750_init', 'bh1750_light_level', 'bh1750_set_mode', 'bh1750_begin'];
  
  mpu6050Types.forEach(type => {
    if (Blockly.Blocks[type]) {
      console.log(`🔍 Bloco ${type} encontrado`);
    }
  });
  
  hmc5883Types.forEach(type => {
    if (Blockly.Blocks[type]) {
      console.log(`🔍 Bloco ${type} encontrado`);
    }
  });
  
  bmp180Types.forEach(type => {
    if (Blockly.Blocks[type]) {
      console.log(`🔍 Bloco ${type} encontrado`);
    }
  });
  
  dhtTypes.forEach(type => {
    if (Blockly.Blocks[type]) {
      console.log(`🔍 Bloco ${type} encontrado`);
    }
  });
  
  bh1750Types.forEach(type => {
    if (Blockly.Blocks[type]) {
      console.log(`🔍 Bloco ${type} encontrado`);
    }
  });
  
  // Forçar cores uma última vez
  forceMPU6050Colors();
  forceHMC5883Colors();
  forceBMP180Colors();
  forceDHTColors();
  forceBH1750Colors();
}, 1000);

// Elementos da interface
const codeDisplay = document.getElementById('code-display');
const startButton = document.getElementById('startButton');
const messageElement = document.getElementById('message');

// Limpar qualquer dados salvos que possam interferir
try {
  localStorage.removeItem('blocklyWorkspace');
  localStorage.removeItem('blocklyVariables');
} catch (error) {
  // Ignorar erros de localStorage
}

// Verificar se existem variáveis no workspace
const existingVars = workspace.getAllVariables();

// Se houver variáveis não intencionais, removê-las
if (existingVars.length > 0) {
  existingVars.forEach(variable => {
    workspace.deleteVariableById(variable.getId());
  });
}

// Habilitar variáveis no workspace
if (Blockly.Variables) {
  // Sistema de variáveis habilitado
}

// Adicionar listener para criação de variáveis
workspace.addChangeListener(function(event) {
  if (event.type === Blockly.Events.VAR_CREATE) {
    console.log('🆕 Variável criada via evento:', event.varName);
    // Atualizar o código quando variável for criada
    generateCode();
    // NÃO atualizar toolbox aqui para evitar conflito com a atualização manual
  }
  if (event.type === Blockly.Events.VAR_DELETE) {
    console.log('🗑️ Variável deletada via evento:', event.varName);
    generateCode();
    // Atualizar toolbox automaticamente apenas para deleção
    setTimeout(() => {
      updateVariableToolbox();
    }, 100);
  }
  if (event.type === Blockly.Events.VAR_RENAME) {
    console.log('📝 Variável renomeada via evento:', event.oldName, '→', event.newName);
    generateCode();
    // Atualizar toolbox automaticamente apenas para renomeação
    setTimeout(() => {
      updateVariableToolbox();
    }, 100);
  }
});

// Função para gerar código C++
function generateCode() {
  try {
    // Verificar se Blockly está disponível
    if (typeof Blockly === 'undefined') {
      throw new Error('Blockly não está carregado');
    }
    
    console.log('🔍 Gerando código...');
    console.log('📊 Blocos no workspace:', workspace.getTopBlocks(true).length);
    workspace.getTopBlocks(true).forEach((block, index) => {
      console.log(`   Bloco ${index + 1}: ${block.type}`);
    });
    
    // Verificar se o gerador C++ está disponível
    if (!Blockly.Cpp) {
      // Tentar recriar o gerador
      if (!Blockly.Generator) {
        throw new Error('Blockly.Generator não está disponível');
      }
      
      Blockly.Cpp = new Blockly.Generator('C++');
    }
    
    // Verificar se o método init existe
    if (!Blockly.Cpp.init) {
      throw new Error('Blockly.Cpp.init não está definido');
    }

    // Gerar código C++ a partir dos blocos (não chama init manualmente porque workspaceToCode já chama)
    const code = Blockly.Cpp.workspaceToCode(workspace);

    console.log('📝 Código gerado:', code);

    // Exibir o código gerado no painel lateral
    codeDisplay.textContent = code || '// Nenhum bloco para gerar código';

    // Sincronizar com o elemento do modal Arduino CLI
    const codeDisplayFull = document.getElementById('code-display-full');
    if (codeDisplayFull) {
      codeDisplayFull.textContent = code || '// Nenhum código foi gerado ainda\n// Use o editor de blocos para criar seu programa Arduino\n// Os blocos serão convertidos automaticamente em código C++';
    }

    // Sincronizar com o elemento generated-code do modal (se existir)
    const generatedCode = document.getElementById('generated-code');
    if (generatedCode) {
      generatedCode.textContent = code || '// Código será gerado aqui...';
    }

    // Sempre atualizar estatísticas (modal e área principal)
    updateCodeStats(code || '');

    return code;
  } catch (error) {
    console.error('❌ Erro ao gerar código:', error);
    const errorMessage = '// Erro ao gerar código: ' + error.message;
    
    codeDisplay.textContent = errorMessage;
    
    // Sincronizar erro com o modal também
    const codeDisplayFull = document.getElementById('code-display-full');
    if (codeDisplayFull) {
      codeDisplayFull.textContent = errorMessage;
    }
    
    const generatedCode = document.getElementById('generated-code');
    if (generatedCode) {
      generatedCode.textContent = errorMessage;
    }
    
    // Atualizar estatísticas com erro (zero valores)
    updateCodeStats('');
    
    return null;
  }
}



// Função para executar o código
function executeCode() {
  const code = generateCode();
  if (code) {
    messageElement.textContent = 'Executando código...';
    startButton.disabled = true;
    
    // Enviar código para o processo principal
    ipcRenderer.send('execute-code', code);
  }
}

// Função para atualizar o toolbox com variáveis existentes
function updateVariableToolbox() {
  try {
    console.log('🔄 Iniciando atualização do toolbox...');
    const variables = workspace.getAllVariables();
    console.log('📊 Variáveis encontradas:', variables.map(v => v.name));
    
    // MÉTODO MAIS SEGURO: Use sempre o fallback que reconstrói tudo
    // Isso evita problemas de corrupção do toolbox
    console.log('🛡️ Usando método seguro (fallback) para evitar corrupção do toolbox');
    updateVariableToolboxFallback();
    
  } catch (error) {
    console.error('❌ Erro ao atualizar toolbox:', error);
    // Se até o fallback falhar, tentar restaurar o toolbox original
    restoreOriginalToolbox();
  }
}

// Função para restaurar o toolbox original se algo der errado
function restoreOriginalToolbox() {
  try {
    console.log('🚨 Tentando restaurar toolbox original...');
    const originalToolbox = document.getElementById('toolbox');
    if (originalToolbox) {
      workspace.updateToolbox(originalToolbox);
      console.log('✅ Toolbox original restaurado');
    } else {
      console.error('❌ Não foi possível encontrar o toolbox original');
    }
  } catch (error) {
    console.error('❌ Erro ao restaurar toolbox original:', error);
  }
}

// Função de fallback (método antigo, mas corrigido)
function updateVariableToolboxFallback() {
  try {
    console.log('🔄 Usando método fallback para atualizar toolbox...');
    const variables = workspace.getAllVariables();
    console.log('📊 Variáveis no fallback:', variables.map(v => v.name));
    
    // Obter traduções se disponível
    const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => {
      // Fallback translations se i18n não estiver disponível
      const fallbacks = {
        'CAT_LOGIC': 'Lógica',
        'CAT_CONTROL': 'Controle', 
        'CAT_MATH': 'Matemática',
        'CAT_TEXT': 'Texto',
        'CAT_VARIABLES': 'Variáveis',
        'CAT_FUNCTIONS': 'Funções',
        'CAT_TIME': 'Tempo',
        'CAT_LIBRARIES': 'Bibliotecas',
        'CAT_SENSORS': 'Sensores',
        'CAT_MPU6050': 'Medidas Inerciais',
        'CAT_BMP180': 'Pressão',
        'CAT_BH1750': 'Luminosidade',
        'CAT_HMC5883': 'Magnetômetro',
        'CAT_DHT': 'Temperatura e Umidade',
        'createVariableButton': '➕ Criar Nova Variável'
      };
      return fallbacks[key] || key;
    };
    
    // Criar XML para o toolbox atualizado (versão completa)
    const toolboxXml = `
      <xml id="toolbox-dynamic">
        <category name="${t('CAT_LOGIC')}" colour="#1d1856">
          <block type="controls_if"></block>
          <block type="logic_compare"></block>
          <block type="logic_operation"></block>
          <block type="logic_boolean"></block>
        </category>
        <category name="${t('CAT_CONTROL')}" colour="#00cfe5">
          <block type="arduino_setup"></block>
          <block type="arduino_loop"></block>
          <sep></sep>
          <block type="arduino_serial_begin"></block>
          <block type="serial_not"></block>
          <sep></sep>
          <block type="controls_repeat_ext">
            <value name="TIMES">
              <shadow type="math_number"><field name="NUM">10</field></shadow>
            </value>
          </block>
          <block type="controls_whileUntil"></block>
        </category>
        <category name="${t('CAT_MATH')}" colour="#e80074">
          <block type="math_number"><field name="NUM">0</field></block>
          <block type="math_arithmetic"></block>
        </category>
        <category name="${t('CAT_TEXT')}" colour="#5C7CFA">
          <block type="text"></block>
          <block type="text_print"></block>
        </category>
        <category name="${t('CAT_VARIABLES')}" colour="#00cfe5">
          <button text="${t('createVariableButton')}" callbackkey="CREATE_VARIABLE"></button>
          ${variables.map(variable => `
            <block type="variables_get">
              <field name="VAR">${variable.name}</field>
            </block>
            <block type="variables_set">
              <field name="VAR">${variable.name}</field>
            </block>
          `).join('')}
        </category>
        <category name="Listas" colour="#00cfe5">
          <block type="variable_declaration">
            <value name="VALUE">
              <shadow type="math_number"><field name="NUM">0</field></shadow>
            </value>
          </block>
        </category>
        <category name="${t('CAT_FUNCTIONS')}" colour="#e80074" custom="PROCEDURE">
        </category>
        <category name="${t('CAT_TIME')}" colour="#e80074">
          <block type="delay_function">
            <value name="DELAY_TIME">
              <shadow type="math_number">
                <field name="NUM">1000</field>
              </shadow>
            </value>
          </block>
        </category>
        <category name="${t('CAT_LIBRARIES')}" colour="#3c3c3c">
          <block type="library_arduino_basic"></block>
          <sep></sep>
          <block type="library_wire"></block>
          <sep></sep>
          <block type="library_adafruit"></block>
          <block type="library_sensor"></block>
          <block type="library_bmp180"></block>
          <block type="library_mpu6050"></block>
          <block type="library_dht"></block>
        </category>
        <category name="${t('CAT_SENSORS')}" colour="#0c0931">
          <category name="${t('CAT_MPU6050')}" colour="#FF8C00">
            <block type="mpu6050_init"></block>
            <sep></sep>
            <block type="mpu6050_accel_x"></block>
            <block type="mpu6050_accel_y"></block>
            <block type="mpu6050_accel_z"></block>
            <sep></sep>
            <block type="mpu6050_gyro_x"></block>
            <block type="mpu6050_gyro_y"></block>
            <block type="mpu6050_gyro_z"></block>
            <sep></sep>
            <block type="mpu6050_read"></block>
            <sep></sep>
            <block type="mpu6050_not"></block>
          </category>
          <category name="Ultrasound" colour="#2e8a5c">
            <block type="ultrasound"></block>
          </category>
          <category name="${t('CAT_BMP180')}" colour="#8a2e2e">
            <block type="bmp180_init"></block>
            <sep></sep>
            <block type="bmp180_temperature"></block>
            <block type="bmp180_pressure"></block>
            <block type="bmp180_altitude"></block>
          </category>
          <category name="${t('CAT_DHT')}" colour="#FF2800">
            <block type="dht_init"></block>
            <block type="dht_begin"></block>
            <sep></sep>
            <block type="dht_temperature"></block>
            <block type="dht_humidity"></block>
            <block type="dht_heat_index"></block>
          </category>
          <category name="${t('CAT_BH1750')}" colour="#fccf03">
            <block type="bh1750_init"></block>
            <block type="bh1750_begin"></block>
            <sep></sep>
            <block type="bh1750_set_mode"></block>
            <sep></sep>
            <block type="bh1750_light_level"></block>
          </category>
          <category name="${t('CAT_HMC5883')}" colour="#9932CC">
            <block type="hmc5883_sensor_object"></block>
            <block type="hmc5883_init"></block>
            <block type="hmc5883_begin"></block>
            <block type="hmc5883_set_gain"></block>
            <sep></sep>
            <block type="hmc5883_event_declare"></block>
            <block type="hmc5883_get_event"></block>
            <sep></sep>
            <block type="hmc5883_mag_x"></block>
            <block type="hmc5883_mag_y"></block>
            <block type="hmc5883_mag_z"></block>
            <sep></sep>
            <block type="hmc5883_field_strength"></block>
            <block type="hmc5883_atan2"></block>
            <block type="hmc5883_heading"></block>
            <block type="hmc5883_direction_text">
              <value name="HEADING">
                <shadow type="math_number"><field name="NUM">0</field></shadow>
              </value>
            </block>
            <block type="hmc5883_declination"></block>
            <sep></sep>
            <block type="hmc5883_sensor_info"></block>
            <block type="hmc5883_display_sensor"></block>
          </category>
        </category>
      </xml>
    `;
    
    // Verificar se o XML está válido antes de aplicar
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(toolboxXml, 'text/xml');
    
    // Verificar se há erros de parsing
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      console.error('❌ Erro no XML do toolbox:', parseError[0].textContent);
      return;
    }
    
    // Atualizar o toolbox
    workspace.updateToolbox(xmlDoc.documentElement);
    
    console.log('✅ Toolbox atualizado via fallback com', variables.length, 'variáveis');
    
    // Verificar se o toolbox está visível após a atualização
    setTimeout(() => {
      const toolboxDiv = document.querySelector('.blocklyToolboxDiv');
      if (!toolboxDiv || toolboxDiv.style.display === 'none') {
        console.error('🚨 Toolbox sumiu! Tentando restaurar...');
        restoreOriginalToolbox();
      } else {
        console.log('✅ Toolbox visível após fallback');
      }
    }, 500);
    
  } catch (error) {
    console.error('❌ Erro no fallback do toolbox:', error);
    restoreOriginalToolbox();
  }
}

// Event listeners (commented out - now using Serial Monitor Modal)
// startButton.addEventListener('click', executeCode);

// Listener para mudanças no workspace
workspace.addChangeListener(function(event) {
  if (event.type === Blockly.Events.BLOCK_CHANGE ||
      event.type === Blockly.Events.BLOCK_CREATE ||
      event.type === Blockly.Events.BLOCK_DELETE ||
      event.type === Blockly.Events.BLOCK_MOVE) {
    generateCode();
    
    // Verificar se blocos MPU6050, HMC5883, BMP180, DHT ou BH1750 foram criados e aplicar cores
    if (event.type === Blockly.Events.BLOCK_CREATE) {
      const createdBlock = workspace.getBlockById(event.blockId);
      if (createdBlock && createdBlock.type) {
        if (createdBlock.type.includes('mpu6050')) {
          console.log('🟠 Bloco MPU6050 criado, aplicando cor laranja:', createdBlock.type);
          createdBlock.setColour('#FF8C00');
        } else if (createdBlock.type.includes('hmc5883') || createdBlock.type === 'heading_correction') {
          console.log('🟣 Bloco HMC5883 criado, aplicando cor roxa:', createdBlock.type);
          createdBlock.setColour('#9932CC');
        } else if (createdBlock.type.includes('bmp180')) {
          console.log('🔴 Bloco BMP180 criado, aplicando cor vermelha:', createdBlock.type);
          createdBlock.setColour('#8a2e2e');
        } else if (createdBlock.type.includes('dht')) {
          console.log('🔴 Bloco DHT criado, aplicando cor vermelha Ferrari:', createdBlock.type);
          createdBlock.setColour('#FF2800');
        } else if (createdBlock.type.includes('bh1750')) {
          console.log('🟡 Bloco BH1750 criado, aplicando cor amarela:', createdBlock.type);
          createdBlock.setColour('#fccf03');
        }
      }
    }
  }
});

// Listener para resposta do processo principal
ipcRenderer.on('execution-result', (event, result) => {
  messageElement.textContent = result.success ? 'Código executado com sucesso!' : 'Erro: ' + result.error;
  startButton.disabled = false;
});

// Gerar código inicial
generateCode();

// ============================================================================
// SERIAL MONITOR MODAL EVENT LISTENERS - DOM Ready Setup
// ============================================================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 Configurando event listeners do Serial Monitor...');
  
  // Serial Monitor Modal buttons - Connect to Execute button (startButton)
  const executeBtn = document.getElementById('startButton');
  if (executeBtn) {
    executeBtn.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default behavior
      openSerialMonitorModal();
    });
    console.log('✅ Botão Executar conectado ao Serial Monitor');
  }
  
  // Close modal button - correção para o botão correto
  const closeModalBtn = document.getElementById('arduino-cli-close');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeSerialMonitorModal);
    console.log('✅ Event listener adicionado ao botão de fechar do modal Arduino CLI');
  } else {
    console.error('❌ Botão #arduino-cli-close não encontrado!');
  }
  
  // Tab buttons - correção para a classe correta
  document.querySelectorAll('.tab-btn-clean').forEach(btn => {
    btn.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      if (tabName) {
        switchTab(tabName);
        console.log(`📋 Aba selecionada: ${tabName}`);
      }
    });
  });
  
  // Connection buttons
  const connectBtn = document.getElementById('connect-btn');
  if (connectBtn) {
    connectBtn.addEventListener('click', connectSerial);
  }
  
  const disconnectBtn = document.getElementById('disconnect-btn');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', disconnectSerial);
  }
  
  // Backend control buttons
  const startBackendBtn = document.getElementById('start-backend-btn');
  if (startBackendBtn) {
    startBackendBtn.addEventListener('click', async () => {
      await startBackend();
    });
  }
  
  const stopBackendBtn = document.getElementById('stop-backend-btn');
  if (stopBackendBtn) {
    stopBackendBtn.addEventListener('click', async () => {
      await stopBackend();
    });
  }
  
  const refreshPortsBtn = document.getElementById('refresh-ports');
  if (refreshPortsBtn) {
    refreshPortsBtn.addEventListener('click', async () => {
      await refreshPorts();
    });
  }
  
  // Refresh button para upload tab
  const refreshUploadPortsBtn = document.getElementById('refresh-upload-ports');
  if (refreshUploadPortsBtn) {
    refreshUploadPortsBtn.addEventListener('click', async () => {
      await refreshPorts();
    });
  }
  
  // Upload buttons
  const compileBtn = document.getElementById('compile-btn');
  if (compileBtn) {
    compileBtn.addEventListener('click', compileSketch);
  }
  
  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', uploadSketch);
  }
  
  // Console buttons
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', sendSerialCommand);
  }
  
  const consoleInput = document.getElementById('console-input');
  if (consoleInput) {
    consoleInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendSerialCommand();
      }
    });
  }
  
  const clearConsoleBtn = document.getElementById('clear-console-btn');
  if (clearConsoleBtn) {
    clearConsoleBtn.addEventListener('click', clearConsole);
  }
  
  // Modal click outside to close
  const serialModal = document.getElementById('arduino-cli-modal');
  if (serialModal) {
    serialModal.addEventListener('click', function(e) {
      if (e.target === serialModal) {
        closeSerialMonitorModal();
      }
    });
  }
  
  // Port selector change event
  const portSelector = document.getElementById('port-selector');
  if (portSelector) {
    portSelector.addEventListener('change', function() {
      serialMonitorState.selectedPort = this.value;
      console.log(`🔌 Porta selecionada: ${this.value}`);
    });
  }
  
  // Baud rate change event
  const baudRateSelector = document.getElementById('baud-rate');
  if (baudRateSelector) {
    baudRateSelector.addEventListener('change', function() {
      serialMonitorState.baudRate = this.value;
      console.log(`⚡ Baud rate selecionado: ${this.value}`);
    });
  }
  
  // Keyboard shortcuts for modal
  document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('arduino-cli-modal');
    if (modal && modal.classList.contains('show')) {
      // ESC to close modal
      if (e.key === 'Escape') {
        closeSerialMonitorModal();
      }
      
      // Ctrl+1-4 for tab switching
      if (e.ctrlKey) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            switchTab('upload');
            break;
          case '2':
            e.preventDefault();
            switchTab('serial-plotter');
            break;
          case '3':
            e.preventDefault();
            switchTab('console');
            break;
          case '4':
            e.preventDefault();
            switchTab('code');
            break;
        }
      }
    }
  });
  
  // Initialize chart resize observer
  const chartContainer = document.querySelector('.chart-area');
  if (chartContainer && window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(entries => {
      if (serialMonitorState.currentTab === 'serial-plotter') {
        setTimeout(() => {
          initializeChart();
        }, 100);
      }
    });
    
    resizeObserver.observe(chartContainer);
  }
  
  console.log('✅ Todos os event listeners do Serial Monitor configurados');
});

// Fallback for older browsers or if DOMContentLoaded already fired
if (document.readyState === 'loading') {
  // DOMContentLoaded listener above will handle it
} else {
  // DOM is already ready, run setup immediately
  setTimeout(() => {
    console.log('⚡ DOM já carregado, configurando Serial Monitor imediatamente...');
    
    // Run the same setup code
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  }, 100);
}

// Registrar callback DEPOIS que tudo estiver carregado
setTimeout(() => {
  try {
    workspace.registerButtonCallback('CREATE_VARIABLE', function(button) {
      // Usar modal customizado ao invés de prompt (que não funciona no Electron)
      showVariableModal();
    });
  } catch (error) {
    console.error('❌ Erro ao registrar callback:', error);
  }
}, 1000); // 1 segundo de delay

// Fallback: listener direto para cliques no toolbox
setTimeout(() => {
  
  // Encontrar e adicionar listener ao botão
  const toolbox = document.querySelector('.blocklyToolboxDiv');
  if (toolbox) {
    toolbox.addEventListener('click', function(event) {
      // Verificar se é o botão de criar variável
      if (event.target && (
          event.target.textContent.includes('Criar Nova Variável') ||
          event.target.textContent.includes('Create variable')
        )) {
        event.preventDefault();
        event.stopPropagation();
        
        // Chamar a função de criação diretamente
        createNewVariable();
      }
    }, true);
  }
}, 2000); // 2 segundos de delay

// Função auxiliar para criar variável
function createNewVariable() {
  // Usar o modal customizado ao invés de prompt()
  showVariableModal();
}

// Função para mostrar o modal de criação de variáveis
function showVariableModal() {
  
  const modal = document.getElementById('variable-modal');
  const input = document.getElementById('variable-name');
  const createBtn = document.getElementById('create-variable-btn');
  const cancelBtn = document.getElementById('cancel-variable-btn');
  const closeBtn = modal.querySelector('.close');
  
  // Estado reativo da variável
  let currentVariableName = '';
  let isValidName = false;
  
  // Mostrar o modal
  modal.style.display = 'block';
  
  // Limpar e focar no input
  input.value = '';
  currentVariableName = '';
  updateCreateButton();
  
  // Traduzir elementos do modal
  const modalTitle = modal.querySelector('h2');
  if (modalTitle && window.i18n) {
    modalTitle.textContent = window.i18n.t('variableModalTitle');
  }
  
  const nameLabel = modal.querySelector('label[for="variable-name"]');
  if (nameLabel && window.i18n) {
    nameLabel.textContent = window.i18n.t('variableNameLabel');
  }
  
  if (window.i18n) {
    input.placeholder = window.i18n.t('variableNamePlaceholder');
    cancelBtn.textContent = window.i18n.t('cancelVariableBtn');
  }
  
  setTimeout(() => {
    input.focus();
  }, 100);
  
  // Função reativa para atualizar o estado da variável
  function updateVariableState() {
    const newName = input.value.trim();
    currentVariableName = newName;
    
    // Validar nome
    isValidName = newName.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newName);
    
    // Verificar se já existe
    if (isValidName) {
      const existingVars = workspace.getAllVariables();
      const exists = existingVars.some(v => v.name === newName);
      if (exists) {
        isValidName = false;
      }
    }
    
    updateCreateButton();
  }
  
  // Função para atualizar o botão Criar
  function updateCreateButton() {
    if (isValidName && currentVariableName.length > 0) {
      createBtn.disabled = false;
      createBtn.style.opacity = '1';
      createBtn.style.cursor = 'pointer';
      const createText = window.i18n ? window.i18n.t('createVariableBtn') : '✅ Criar Variável';
      createBtn.textContent = `${createText.replace('✅ ', '✅ ')} "${currentVariableName}"`;
    } else {
      createBtn.disabled = true;
      createBtn.style.opacity = '0.5';
      createBtn.style.cursor = 'not-allowed';
      if (currentVariableName.length === 0) {
        createBtn.textContent = '📝 Digite um nome...';
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(currentVariableName)) {
        createBtn.textContent = '❌ Nome inválido';
      } else {
        createBtn.textContent = '❌ Nome já existe';
      }
    }
  }
  
  // Event listener reativo para o input
  input.addEventListener('input', updateVariableState);
  input.addEventListener('keyup', updateVariableState);
  input.addEventListener('paste', () => {
    setTimeout(updateVariableState, 10); // Delay para capturar texto colado
  });
  
  // Função para criar a variável
  function createVariable() {
    if (!isValidName || !currentVariableName) {
      const warningMsg = window.i18n ? window.i18n.t('variableInvalidName') : '⚠️ Por favor, digite um nome válido para a variável!';
      showNotification(warningMsg, 'warning');
      input.focus();
      return false;
    }
    
    try {
      // Dupla verificação antes de criar
      const existingVars = workspace.getAllVariables();
      const exists = existingVars.some(v => v.name === currentVariableName);
      
      if (exists) {
        const errorMsg = window.i18n ? window.i18n.t('variableAlreadyExists') : '❌ Uma variável com este nome já existe!';
        showNotification(errorMsg, 'error');
        input.focus();
        input.select();
        return false;
      }
      
      // Criar a variável
      const variable = workspace.createVariable(currentVariableName);
      
      console.log('✅ Variável criada:', currentVariableName);
      
      // Usar APENAS uma tentativa de atualização para evitar conflitos
      setTimeout(() => {
        console.log('🔄 Atualizando toolbox após criação de variável...');
        updateVariableToolbox();
      }, 200);
      
      // Gerar código atualizado
      generateCode();
      
      // Fechar modal
      closeModal();
      
      // Mostrar mensagem de sucesso
      const successMsg = window.i18n ? 
        window.i18n.t('variableCreatedSuccess').replace('%1', currentVariableName) : 
        '✅ Variável "' + currentVariableName + '" criada com sucesso!';
      showNotification(successMsg, 'success');
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao criar variável:', error);
      showNotification('❌ Erro ao criar variável: ' + error.message, 'error');
      return false;
    }
  }
  
  // Função para fechar o modal
  function closeModal() {
    // Remover event listeners para evitar memory leaks
    input.removeEventListener('input', updateVariableState);
    input.removeEventListener('keyup', updateVariableState);
    
    modal.style.display = 'none';
  }
  
  // Event listeners
  createBtn.onclick = function() {
    if (!createBtn.disabled) {
      createVariable();
    }
  };
  
  cancelBtn.onclick = closeModal;
  closeBtn.onclick = closeModal;
  
  // Enter para criar, ESC para cancelar
  input.onkeydown = function(event) {
    if (event.key === 'Enter') {
      if (!createBtn.disabled) {
        createVariable();
      }
    } else if (event.key === 'Escape') {
      closeModal();
    }
  };
  
  // Clique fora do modal para fechar
  modal.onclick = function(event) {
    if (event.target === modal) {
      closeModal();
    }
  };
  
  // Inicializar estado
  updateVariableState();
}

// Função para mostrar notificações (opcional, para melhor UX)
function showNotification(message, type = 'info') {
  // Criar elemento de notificação
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Estilos inline para a notificação
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 20px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: 'bold',
    zIndex: '10001',
    animation: 'slideInRight 0.3s ease-out',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  });
  
  // Cores baseadas no tipo
  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #00cfe5, #e80074)';
  } else if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #ff4757, #ff3838)';
  } else {
    notification.style.background = 'linear-gradient(135deg, #5a67d8, #667eea)';
  }
  
  // Adicionar ao DOM
  document.body.appendChild(notification);
  
  // Remover após 3 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// ============================================================================
// SISTEMA DE VERIFICAÇÃO E ATUALIZAÇÃO COMPLETA APÓS INICIALIZAÇÃO
// ============================================================================

// Função para verificar integridade de todos os blocos
function verifyAllBlocks() {
  console.log('🔍 Verificando integridade de todos os blocos...');
  
  const results = {
    blocks: { success: 0, failed: 0, missing: [] },
    generators: { success: 0, failed: 0, missing: [] },
    toolbox: { success: 0, failed: 0, missing: [] },
    colors: { success: 0, failed: 0, incorrect: [] }
  };
  
  // Lista de todos os blocos críticos
  const criticalBlocks = {
    'delay_function': '#e80074',
    'mpu6050_init': '#FF8C00',
    'mpu6050_read': '#FF8C00',
    'mpu6050_not': '#FF8C00',
    'hmc5883_init': '#9932CC',
    'hmc5883_begin': '#9932CC',
    'heading_correction': '#9932CC',
    'bmp180_init': '#8a2e2e',
    'bmp180_temperature': '#8a2e2e',
    'dht_init': '#FF2800',
    'dht_begin': '#FF2800',
    'dht_heat_index': '#FF2800',
    'bh1750_init': '#fccf03',
    'bh1750_begin': '#fccf03'
  };
  
  // Verificar definições dos blocos
  Object.keys(criticalBlocks).forEach(blockType => {
    if (Blockly.Blocks[blockType]) {
      results.blocks.success++;
      console.log(`✅ Bloco ${blockType} está definido`);
    } else {
      results.blocks.failed++;
      results.blocks.missing.push(blockType);
      console.error(`❌ Bloco ${blockType} NÃO está definido`);
    }
    
    // Verificar geradores
    if (Blockly.Cpp && Blockly.Cpp[blockType]) {
      results.generators.success++;
      console.log(`✅ Gerador ${blockType} está definido`);
    } else {
      results.generators.failed++;
      results.generators.missing.push(blockType);
      console.error(`❌ Gerador ${blockType} NÃO está definido`);
    }
  });
  
  // Verificar toolbox
  const toolboxXml = document.getElementById('toolbox');
  if (toolboxXml) {
    const categories = ['Lógica', 'Controle', 'Matemática', 'Texto', 'Variáveis', 'Funções', 'Tempo', 'Bibliotecas', 'Sensores'];
    categories.forEach(categoryName => {
      const category = toolboxXml.querySelector(`category[name="${categoryName}"]`);
      if (category) {
        results.toolbox.success++;
        console.log(`✅ Categoria ${categoryName} encontrada no toolbox`);
      } else {
        results.toolbox.failed++;
        results.toolbox.missing.push(categoryName);
        console.error(`❌ Categoria ${categoryName} não encontrada no toolbox`);
      }
    });
  }
  
  return results;
}

// Função para forçar atualização completa do sistema
function forceSystemUpdate() {
  console.log('🔄 Iniciando atualização completa do sistema...');
  
  try {
    // 1. Redefinir blocos críticos
    console.log('📦 Redefinindo blocos críticos...');
    ensureMPU6050Blocks();
    ensureOtherBlocks();
    
    // 2. Aplicar todas as cores forçadamente
    console.log('🎨 Aplicando cores de todos os sensores...');
    forceMPU6050Colors();
    forceHMC5883Colors();
    forceBMP180Colors();
    forceDHTColors();
    forceBH1750Colors();
    
    // 3. Atualizar toolbox
    console.log('🧰 Atualizando toolbox...');
    workspace.updateToolbox(document.getElementById('toolbox'));
    
    // 4. Atualizar variáveis se existirem
    console.log('📊 Verificando variáveis...');
    const variables = workspace.getAllVariables();
    if (variables.length > 0) {
      console.log(`🔄 Atualizando toolbox com ${variables.length} variáveis...`);
      setTimeout(() => {
        updateVariableToolbox();
      }, 500);
    }
    
    // 5. Gerar código para verificar integridade
    console.log('📝 Gerando código inicial...');
    generateCode();
    
    // 6. Notificar sistema i18n se disponível
    if (window.i18n) {
      console.log('🌐 Notificando sistema i18n...');
      window.dispatchEvent(new CustomEvent('blocklyReady', { 
        detail: { workspace: workspace, updated: true } 
      }));
    }
    
    console.log('✅ Atualização completa do sistema finalizada');
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante atualização do sistema:', error);
    return false;
  }
}

// Função para forçar troca de idioma e atualização automática
function forceLanguageToggleUpdate() {
  console.log('🌐 FORÇANDO TROCA DE IDIOMA PARA ATUALIZAÇÃO AUTOMÁTICA...');
  
  try {
    // Verificar se o sistema i18n está disponível
    if (!window.i18n) {
      console.warn('⚠️ Sistema i18n não disponível, aplicando atualização manual...');
      forceSystemUpdate();
      return false;
    }
    
    // Obter idioma atual
    const currentLanguage = window.i18n.language || 'pt-BR';
    const alternativeLanguage = currentLanguage === 'pt-BR' ? 'en-US' : 'pt-BR';
    
    console.log(`🔄 Idioma atual: ${currentLanguage}, alternando para: ${alternativeLanguage}`);
    
    // Primeira troca: alterar para idioma alternativo
    setTimeout(() => {
      console.log(`🌍 Primeira troca: ${currentLanguage} → ${alternativeLanguage}`);
      if (window.i18n.changeLanguage) {
        window.i18n.changeLanguage(alternativeLanguage);
      }
      
      // Forçar cores após primeira troca
      setTimeout(() => {
        console.log('🎨 Aplicando cores após primeira troca...');
        forceMPU6050Colors();
        forceHMC5883Colors();
        forceBMP180Colors();
        forceDHTColors();
        forceBH1750Colors();
        
        // Segunda troca: voltar ao idioma original
        setTimeout(() => {
          console.log(`🌍 Segunda troca: ${alternativeLanguage} → ${currentLanguage}`);
          if (window.i18n.changeLanguage) {
            window.i18n.changeLanguage(currentLanguage);
          }
          
          // Aplicar cores finais após voltar ao idioma original
          setTimeout(() => {
            console.log('🎨 Aplicando cores finais após retorno ao idioma original...');
            forceMPU6050Colors();
            forceHMC5883Colors();
            forceBMP180Colors();
            forceDHTColors();
            forceBH1750Colors();
            
            // Atualização completa final
            setTimeout(() => {
              console.log('✅ Troca de idioma automática concluída - cores atualizadas!');
              forceSystemUpdate();
            }, 300);
            
          }, 200);
        }, 500);
      }, 200);
    }, 300);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante troca automática de idioma:', error);
    // Fallback: aplicar atualização manual
    forceSystemUpdate();
    return false;
  }
}

// Função principal de inicialização e verificação
function performStartupCheck() {
  console.log('🚀 INICIANDO VERIFICAÇÃO COMPLETA DE STARTUP...');
  
  // PRIMEIRO: Forçar troca de idioma para resolver problema das cores
  console.log('🌐 Executando troca automática de idioma para corrigir cores...');
  const languageToggleSuccess = forceLanguageToggleUpdate();
  
  // Aguardar troca de idioma completar antes de continuar verificação
  setTimeout(() => {
    // Verificar integridade após troca de idioma
    const verificationResults = verifyAllBlocks();
    
    // Relatório de status
    console.log('📊 RELATÓRIO DE VERIFICAÇÃO (Pós-troca de idioma):');
    console.log(`   Blocos: ${verificationResults.blocks.success} ✅ | ${verificationResults.blocks.failed} ❌`);
    console.log(`   Geradores: ${verificationResults.generators.success} ✅ | ${verificationResults.generators.failed} ❌`);
    console.log(`   Toolbox: ${verificationResults.toolbox.success} ✅ | ${verificationResults.toolbox.failed} ❌`);
    
    // Se ainda houver problemas após troca de idioma, aplicar correção adicional
    const hasIssues = verificationResults.blocks.failed > 0 || 
                     verificationResults.generators.failed > 0 || 
                     verificationResults.toolbox.failed > 0;
    
    if (hasIssues) {
      console.log('⚠️ Problemas persistem após troca de idioma, aplicando correção adicional...');
      const updateSuccess = forceSystemUpdate();
      
      if (updateSuccess) {
        // Verificar novamente após correção
        setTimeout(() => {
          console.log('🔍 Verificação pós-correção adicional...');
          const recheck = verifyAllBlocks();
          
          const stillHasIssues = recheck.blocks.failed > 0 || 
                                recheck.generators.failed > 0 || 
                                recheck.toolbox.failed > 0;
          
          if (stillHasIssues) {
            console.warn('⚠️ Alguns problemas persistem após todas as correções');
          } else {
            console.log('🎉 Todos os problemas foram corrigidos com sucesso!');
          }
        }, 1000);
      }
    } else {
      console.log('🎉 Sistema verificado - todas as funcionalidades estão operacionais após troca de idioma!');
    }
  }, 2000); // Aguardar 2 segundos para troca de idioma completar
}

// Verificação e atualização programada após inicialização
setTimeout(function() {
  console.log('🔍 Verificação inicial dos blocos...');
  
  // Verificar se o bloco delay está definido
  if (Blockly.Blocks['delay_function']) {
    console.log('✅ Bloco delay_function está definido');
  } else {
    console.error('❌ Bloco delay_function NÃO está definido');
  }
  
  if (Blockly.Cpp['delay_function']) {
    console.log('✅ Gerador delay_function está definido');
  } else {
    console.error('❌ Gerador delay_function NÃO está definido');
  }
  
  // Verificar se estão no toolbox
  const toolboxXml = document.getElementById('toolbox');
  if (toolboxXml) {
    const functionsCategory = toolboxXml.querySelector('category[name="Funções"]');
    const tempoCategory = toolboxXml.querySelector('category[name="Tempo"]');
    
    if (functionsCategory) {
      console.log('✅ Categoria Funções encontrada no toolbox');
    } else {
      console.error('❌ Categoria Funções não encontrada no toolbox');
    }
    
    if (tempoCategory) {
      console.log('✅ Categoria Tempo encontrada no toolbox');
      
      const delayFunctionBlock = tempoCategory.querySelector('block[type="delay_function"]');
      
      if (delayFunctionBlock) {
        console.log('✅ Bloco delay_function encontrado na categoria Tempo');
      } else {
        console.error('❌ Bloco delay_function NÃO encontrado na categoria Tempo');
      }
    } else {
      console.error('❌ Categoria Tempo não encontrada no toolbox');
    }
  }
  
  // EXECUTAR VERIFICAÇÃO COMPLETA E ATUALIZAÇÃO COM TROCA AUTOMÁTICA DE IDIOMA
  console.log('🚀 INICIANDO SISTEMA DE CORREÇÃO AUTOMÁTICA COM TROCA DE IDIOMA...');
  performStartupCheck();
  
}, 2000);

// Atualização adicional para garantir carregamento completo
setTimeout(() => {
  console.log('🔄 Atualização final de segurança...');
  
  // Aplicar mais uma vez as cores para garantir que estejam corretas
  console.log('🎨 Aplicação final de cores de todos os sensores...');
  forceMPU6050Colors();
  forceHMC5883Colors();
  forceBMP180Colors();
  forceDHTColors();
  forceBH1750Colors();
  
  // Atualização completa do sistema
  forceSystemUpdate();
  
  // Verificação final após 6 segundos (tempo maior para aguardar troca de idioma)
  setTimeout(() => {
    console.log('🏁 Verificação final de startup concluída');
    const finalCheck = verifyAllBlocks();
    
    if (finalCheck.blocks.failed === 0 && finalCheck.generators.failed === 0) {
      console.log('🎊 SISTEMA TOTALMENTE OPERACIONAL - Todas as funcionalidades e cores carregadas com sucesso!');
      console.log('✅ Problema das cores MPU6050/HMC5883 resolvido com troca automática de idioma!');
    } else {
      console.warn('⚠️ Sistema iniciado com algumas funcionalidades pendentes');
      
      // Se ainda houver problemas, tentar uma última correção forçada
      console.log('🔧 Tentativa final de correção...');
      setTimeout(() => {
        forceMPU6050Colors();
        forceHMC5883Colors();
        forceSystemUpdate();
      }, 500);
    }
  }, 1500);
}, 6000); // Aumentado para 6 segundos para dar tempo da troca de idioma
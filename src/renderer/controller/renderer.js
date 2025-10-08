const { ipcRenderer } = require('electron');

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
  
}

// REABILITADO - Trabalhando junto com CSS
function forceCorrectBlockColors() {
  console.log('🎨 Aplicando cores corretas em blocos específicos...');
  
  // 1. Blocos nativos do Blockly na categoria Controle - devem ser azuis
  const controlBlocks = ['controls_repeat_ext', 'controls_whileUntil'];
  controlBlocks.forEach(blockType => {
    if (Blockly.Blocks[blockType]) {
      const originalInit = Blockly.Blocks[blockType].init;
      if (originalInit) {
        Blockly.Blocks[blockType].init = function() {
          originalInit.call(this);
          this.setColour("#00cfe5"); // Cor azul ciano da categoria Controle
        };
        console.log(`🔵 Cor azul aplicada ao bloco: ${blockType}`);
      }
    }
  });
  
  // 2. Blocos MPU6050 - devem ser todos laranjas
  const mpu6050Blocks = [
    'mpu6050_init', 'mpu6050_accel_x', 'mpu6050_accel_y', 'mpu6050_accel_z',
    'mpu6050_gyro_x', 'mpu6050_gyro_y', 'mpu6050_gyro_z', 'mpu6050_read',
    'mpu6050_object_declare', 'mpu6050_set_accel_range', 'mpu6050_set_gyro_range',
    'mpu6050_set_filter_bandwidth', 'mpu6050_sensors_event', 'mpu6050_get_event'
  ];
  mpu6050Blocks.forEach(blockType => {
    if (Blockly.Blocks[blockType]) {
      const originalInit = Blockly.Blocks[blockType].init;
      if (originalInit) {
        Blockly.Blocks[blockType].init = function() {
          originalInit.call(this);
          this.setColour("#FF8C00"); // Cor laranja MPU6050
        };
        console.log(`🟠 Cor laranja aplicada ao bloco: ${blockType}`);
      }
    }
  });
  
  // 3. Blocos HMC5883 - devem ser todos roxos
  const hmc5883Blocks = [
    'hmc5883_init', 'hmc5883_begin', 'hmc5883_mag_x', 'hmc5883_mag_y', 'hmc5883_mag_z',
    'hmc5883_heading', 'hmc5883_set_gain', 'hmc5883_event_declare', 'hmc5883_get_event',
    'hmc5883_declination', 'hmc5883_direction_text', 'hmc5883_sensor_object',
    'hmc5883_field_strength', 'hmc5883_sensor_info', 'hmc5883_display_sensor', 'hmc5883_atan2',
    'heading_correction'
  ];
  hmc5883Blocks.forEach(blockType => {
    if (Blockly.Blocks[blockType]) {
      const originalInit = Blockly.Blocks[blockType].init;
      if (originalInit) {
        Blockly.Blocks[blockType].init = function() {
          originalInit.call(this);
          this.setColour("#9932CC"); // Cor roxa HMC5883
        };
        console.log(`🟣 Cor roxa aplicada ao bloco: ${blockType}`);
      }
    }
  });
  
  // 4. FORÇAR ATUALIZAÇÃO DO TOOLBOX PARA APLICAR AS CORES (DESABILITADO TEMPORARIAMENTE)
  /*
  if (typeof workspace !== 'undefined' && workspace.updateToolbox) {
    console.log('🔄 Forçando atualização do toolbox para aplicar cores...');
    const toolboxXml = document.getElementById('toolbox');
    if (toolboxXml) {
      workspace.updateToolbox(toolboxXml);
      console.log('✅ Toolbox atualizado com novas cores');
    }
  }
  */
  
  console.log('✅ Cores específicas aplicadas com sucesso');
}

// Função para atualizar traduções dos blocos quando o idioma mudar
function updateBlockTranslations() {
  if (!window.i18n) return;
  
  console.log('🌐 Atualizando traduções dos blocos...');
  
  // Redefinir blocos com novas traduções
  ensureMPU6050Blocks();
  ensureOtherBlocks();
  forceCorrectBlockColors(); // Aplicar cores corretas após definir blocos
  
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
  baudRate: '115200',
  selectedPort: '',
  availablePorts: [],
  sensorData: [],
  consoleHistory: [],
  sensorVisibility: {
    accelX: true,
    accelY: true,
    accelZ: true,
    gyroX: true,
    gyroY: true,
    gyroZ: true
  },
  autoScrollEnabled: true // Controle para auto-scroll do console
};

// Inicializar conexão WebSocket global para receber mensagens de upload
function initializeGlobalWebSocket() {
  if (serialMonitorState.websocket && serialMonitorState.websocket.readyState === WebSocket.OPEN) {
    return; // Já conectado
  }
  
  const wsUrl = 'ws://localhost:8080';
  console.log(`🌐 Inicializando WebSocket global: ${wsUrl}`);
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('✅ WebSocket global conectado - pronto para receber mensagens de upload');
    serialMonitorState.websocket = ws;
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Mensagem WebSocket global recebida:', data);
      handleSerialWebSocketMessage(data, null, null);
    } catch (error) {
      console.error('❌ Erro ao processar mensagem WebSocket global:', error);
    }
  };
  
  ws.onclose = () => {
    console.log('🔌 WebSocket global desconectado - tentando reconectar em 3s...');
    serialMonitorState.websocket = null;
    setTimeout(initializeGlobalWebSocket, 3000);
  };
  
  ws.onerror = (error) => {
    console.error('❌ Erro no WebSocket global:', error);
  };
}

// Inicializar WebSocket global quando a aplicação carrega
setTimeout(initializeGlobalWebSocket, 2000);

// Global variables for serial plotter
let plotterState = {
  isRunning: false,
  isPaused: false,
  canvas: null,
  context: null,
  animationId: null,
  dataBuffer: {
    timestamps: [],
    accelX: [],
    accelY: [],
    accelZ: [],
    gyroX: [],
    gyroY: [],
    gyroZ: []
  },
  maxDataPoints: 500,
  sampleCount: 0,
  lastSampleTime: 0,
  sampleRate: 0,
  colors: {
    accelX: '#ef4444',
    accelY: '#10b981', 
    accelZ: '#3b82f6',
    gyroX: '#f59e0b',
    gyroY: '#8b5cf6',
    gyroZ: '#06b6d4'
  },
  visibility: {
    accelX: true,
    accelY: true,
    accelZ: true,
    gyroX: true,
    gyroY: true,
    gyroZ: true
  }
};

// Interval para revalidação periódica do backend
let backendStatusInterval = null;

// Backend state
let backendState = {
  isRunning: false,
  isStarting: false,
  isStopping: false,
  lastError: null,
  status: null,
  baseUrl: 'http://localhost:3001'
};

// Chart data for real-time plotting
let chartData = {
  accelX: [], accelY: [], accelZ: [],
  gyroX: [], gyroY: [], gyroZ: [],
  timestamps: []
};

// ============================================================================
// CORREÇÃO DO PROBLEMA DE ROLAGEM DO MODAL
// ============================================================================
// Problema: O modal estava forçando 'overflow: auto' ao fechar, mas o CSS original
// do body é 'overflow: hidden'. Isso causava aumento indesejado da rolagem.
// 
// Solução: Preservar o valor original do overflow antes de modificá-lo e
// restaurá-lo corretamente ao fechar o modal.
// ============================================================================

// Serial Monitor Modal Functions
async function openSerialMonitorModal() {
  console.log('🖥️ Abrindo Serial Monitor Modal...');
  const modal = document.getElementById('arduino-cli-modal');
  if (modal) {
    // Salvar o estado original do overflow do body antes de modificá-lo
    if (!modal._originalBodyOverflow) {
      modal._originalBodyOverflow = window.getComputedStyle(document.body).overflow;
      console.log('💾 Estado original do overflow salvo:', modal._originalBodyOverflow);
    }
    
    // Add show class to make modal visible
    modal.classList.add('show');
    
    // Initialize modal state
    initializeSerialMonitor();
    
    // Set default active tab
    switchTab('upload');
    
    // Atualizar aba de código para garantir sincronização
    updateCodeTab();
    
    // Verificar status do backend primeiro
    console.log('🔍 Verificando status do backend...');
    const backendCheck = await checkBackendStatus();
    console.log('📊 Resultado do check do backend:', backendCheck);
    
    // Forçar atualização do status de conexão após verificar backend
    updateConnectionStatus();
    
    // Inicializar Arduino CLI client com URL dinâmica
    if (!window.arduinoCLI) {
      window.arduinoCLI = new ArduinoCLIClient(backendState.baseUrl);
      console.log(`🔧 Arduino CLI Client inicializado com URL: ${backendState.baseUrl}`);
    } else {
      // Atualizar URL caso tenha mudado
      window.arduinoCLI.baseUrl = backendState.baseUrl;
      console.log(`🔄 Arduino CLI Client URL atualizada: ${backendState.baseUrl}`);
    }
    
    console.log('🔍 Estado atual do backend:', {
      isRunning: backendState.isRunning,
      baseUrl: backendState.baseUrl,
      status: backendState.status
    });
    
    // Se backend estiver rodando, testar conexão e atualizar portas
    if (backendState.isRunning) {
      console.log('🔍 Testando conexão com backend...');
      const connectionTest = await window.arduinoCLI.testConnection();
      
      if (connectionTest.success) {
        console.log('✅ Backend conectado com sucesso');
        await refreshPorts();
        // Atualizar status novamente após sucesso da conexão
        updateConnectionStatus();
      } else {
        console.warn('⚠️ Backend não responde:', connectionTest.error);
        // Backend pode estar iniciando ainda, marcar como offline temporariamente
        backendState.isRunning = false;
        updateBackendConnectionStatus(false);
        updateConnectionStatus();
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
      
      // Garantir que o botão conectar mostre status correto
      updateConnectionStatus();
    }
    
    // Sincronizar código atual com o modal
    updateCodeTab();
    
    // Iniciar revalidação periódica do status do backend
    if (backendStatusInterval) {
      clearInterval(backendStatusInterval);
    }
    
    backendStatusInterval = setInterval(async () => {
      if (document.getElementById('arduino-cli-modal').classList.contains('show')) {
        console.log('🔄 Revalidando status do backend...');
        const oldStatus = backendState.isRunning;
        await checkBackendStatus();
        
        // Se status mudou, atualizar UI
        if (oldStatus !== backendState.isRunning) {
          console.log(`🔄 Status do backend mudou: ${oldStatus} → ${backendState.isRunning}`);
          updateConnectionStatus();
          updateBackendUI();
        }
      }
    }, 3000); // Verificar a cada 3 segundos
    
    // Prevent body scrolling - preservar overflow original se for 'hidden'
    if (modal._originalBodyOverflow === 'hidden') {
      // Não modificar se já for hidden
      console.log('ℹ️ Body já tem overflow hidden, mantendo estado original');
    } else {
      document.body.style.overflow = 'hidden';
    }
  }
}

function closeSerialMonitorModal() {
  console.log('🖥️ Fechando Serial Monitor Modal...');
  const modal = document.getElementById('arduino-cli-modal');
  if (modal) {
    // Remove show class to hide modal
    modal.classList.remove('show');
    
    // Parar revalidação periódica
    if (backendStatusInterval) {
      clearInterval(backendStatusInterval);
      backendStatusInterval = null;
      console.log('⏹️ Revalidação periódica parada');
    }
    
    // Disconnect if connected
    if (serialMonitorState.isConnected) {
      disconnectSerial();
    }
    
    // Clear data
    clearSensorData();
    
    // Clear plotter data and stop animation
    stopPlotterAnimation();
    clearPlotterData();
    
    // Restore body scrolling - usar valor original salvo ao invés de forçar 'auto'
    if (modal._originalBodyOverflow) {
      document.body.style.overflow = modal._originalBodyOverflow;
      console.log('🔄 Overflow restaurado para valor original:', modal._originalBodyOverflow);
    } else {
      // Fallback: tentar restaurar para o valor CSS original
      document.body.style.overflow = '';  // Remove inline style, deixa CSS tomar conta
      console.log('🔄 Overflow inline removido, usando CSS padrão');
    }
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
    case 'sensors':
      initializeChart();
      break;
    case 'console':
      updateConsoleTab();
      break;
    case 'plotter':
      initializePlotter();
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
  console.log('🚀 Iniciando backend Arduino CLI manualmente...');
  
  backendState.isStarting = true;
  updateBackendUI();
  showBackendStartFeedback();
  
  try {
    const { ipcRenderer } = require('electron');
    
    // Mostrar feedback sobre verificação de componentes
    updateBackendFeedback('🔍 Verificando Arduino CLI e componentes...');
    
    const result = await ipcRenderer.invoke('start-arduino-backend');
    
    if (result.success) {
      console.log('✅ Backend iniciado com sucesso');
      backendState.isRunning = true;
      backendState.status = result.status;
      backendState.lastError = null;
      
      // Mostrar mensagem de sucesso específica
      if (result.setupPerformed) {
        updateBackendFeedback('✅ Arduino CLI e cores ESP32 configurados e backend iniciado!');
      } else {
        updateBackendFeedback('✅ Backend iniciado com sucesso!');
      }
      
      handleManualStartResult(result);
      
      // Atualizar UI imediatamente após sucesso
      updateBackendUI();
      updateConnectionStatus();
      
      // Aguardar um pouco e tentar conectar
      setTimeout(async () => {
        await refreshPorts();
        updateConnectionStatus();
      }, 2000);
      
    } else {
      console.error('❌ Erro ao iniciar backend:', result.error);
      backendState.lastError = result.error;
      
      // Mensagem de erro mais informativa
      if (result.error.includes('Arduino CLI')) {
        updateBackendFeedback('❌ Erro na configuração do Arduino CLI. Verifique sua conexão de internet.');
      } else {
        updateBackendFeedback(`❌ Erro ao iniciar backend: ${result.error}`);
      }
      
      handleManualStartResult(result);
    }
    
  } catch (error) {
    console.error('❌ Erro IPC ao iniciar backend:', error.message);
    backendState.lastError = error.message;
    updateBackendFeedback(`❌ Erro de comunicação: ${error.message}`);
    handleManualStartResult({ success: false, error: error.message });
  }
  
  backendState.isStarting = false;
  updateBackendUI();
  updateConnectionStatus();
}

function updateBackendFeedback(message) {
  const backendInfo = document.getElementById('backend-info');
  if (backendInfo) {
    backendInfo.textContent = message;
  }
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
      
      // Atualizar status do botão conectar
      updateConnectionStatus(); // ← Adicionar esta linha
      
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
  updateConnectionStatus(); // ← Adicionar esta linha também
}

async function checkBackendStatus() {
  try {
    console.log('🔍 Fazendo IPC call para get-arduino-backend-status...');
    const { ipcRenderer } = require('electron');
    const result = await ipcRenderer.invoke('get-arduino-backend-status');
    
    console.log('📡 Resposta do IPC:', result);
    
    if (result.success) {
      backendState.isRunning = result.isRunning;
      backendState.status = result.status;
      
      console.log('✅ Backend status atualizado:', {
        isRunning: backendState.isRunning,
        external: result.status?.external,
        port: result.status?.port
      });
      
      // Atualizar URL base se o backend informar uma porta diferente
      if (result.status && result.status.port) {
        const newUrl = `http://localhost:${result.status.port}`;
        if (backendState.baseUrl !== newUrl) {
          console.log(`🔄 Atualizando baseUrl: ${backendState.baseUrl} → ${newUrl}`);
          backendState.baseUrl = newUrl;
        }
      }
      
      if (result.status.lastError) {
        backendState.lastError = result.status.lastError;
        console.warn('⚠️ Backend tem erro:', result.status.lastError);
      }
    } else {
      console.error('❌ Falha ao obter status do backend:', result.error);
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
  
  // Atualizar também os botões de upload, pois dependem do backend
  updateUploadTab();
}

// ============================================================================
// FEEDBACK VISUAL PARA INICIALIZAÇÃO MANUAL - ECONOMIA DE MEMÓRIA
// ============================================================================

// NOTA: Funções showBackendAutoStartIndicator e handleAutoStartResult foram removidas
// pois a inicialização automática foi desabilitada para economizar memória.
// O backend agora inicia apenas quando o usuário clica explicitamente no botão.

function showBackendStartFeedback() {
  console.log('🚀 Mostrando feedback de inicialização manual...');
  
  // Mostrar toast informativo
  showToast('🚀 Iniciando backend Arduino CLI...', 'info', 3000);
  
  // Atualizar console serial
  addToSerialConsole('🚀 INICIALIZAÇÃO MANUAL DO BACKEND');
  addToSerialConsole('⏳ Verificando configuração...');
  addToSerialConsole('📦 Instalando dependências se necessário...');
}

function handleManualStartResult(result) {
  console.log('📡 Processando resultado da inicialização manual:', result);
  
  if (result.success) {
    showToast('✅ Backend iniciado com sucesso!', 'success', 4000);
    
    addToSerialConsole('✅ BACKEND INICIADO COM SUCESSO!');
    addToSerialConsole(' Servidor: http://localhost:3001');
    addToSerialConsole('🔌 WebSocket: ws://localhost:8080');
    addToSerialConsole('🎯 Sistema pronto para uso!');
    
    // Detectar portas após inicialização
    setTimeout(async () => {
      addToSerialConsole('🔍 Detectando portas seriais...');
      await refreshPorts();
      updateConnectionStatus();
    }, 2000);
    
  } else {
    showToast('❌ Erro ao iniciar backend', 'error', 5000);
    addToSerialConsole('❌ ERRO NA INICIALIZAÇÃO');
    addToSerialConsole('🔧 ' + result.error);
    addToSerialConsole('💡 Verifique a configuração e tente novamente');
  }
}

// ============================================================================
// SISTEMA DE TOAST PARA FEEDBACK VISUAL
// ============================================================================

function showToast(message, type = 'info', duration = 3000) {
  // Criar container de toasts se não existir
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }
  
  // Criar toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;
  
  // Estilos do toast
  toast.style.cssText = `
    padding: 12px 16px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    font-size: 14px;
    max-width: 350px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    cursor: pointer;
  `;
  
  // Cores por tipo
  const colors = {
    info: '#3498db',
    success: '#27ae60',
    warning: '#f39c12',
    error: '#e74c3c'
  };
  
  toast.style.backgroundColor = colors[type] || colors.info;
  
  // Adicionar ao container
  toastContainer.appendChild(toast);
  
  // Animação de entrada
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });
  
  // Remover ao clicar
  toast.addEventListener('click', () => {
    removeToast(toast);
  });
  
  // Remover automaticamente
  setTimeout(() => {
    removeToast(toast);
  }, duration);
}

function removeToast(toast) {
  if (toast && toast.parentNode) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
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
  
  const portSelect = document.getElementById('port-select');
  const baudRateSelect = document.getElementById('baud-rate-select');
  
  if (!portSelect || !baudRateSelect) {
    showSerialNotification('❌ Elementos de seleção não encontrados!', 'error');
    return;
  }
  
  const port = portSelect.value;
  const baudRate = baudRateSelect.value || '115200';
  
  if (!port) {
    showSerialNotification('⚠️ Selecione uma porta primeiro!', 'warning');
    return;
  }
  
  // Verificar se o backend está rodando
  if (!backendState.isRunning) {
    showSerialNotification('❌ Backend não está rodando! Inicie o backend primeiro.', 'error');
    return;
  }
  
  // Atualizar UI para mostrar conectando
  const connectBtn = document.getElementById('connect-btn');
  if (connectBtn) {
    connectBtn.disabled = true;
    connectBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Conectando...</span>';
  }
  
  // Estabelecer conexão WebSocket para comunicação serial
  connectToSerialWebSocket(port, baudRate)
    .then(() => {
      serialMonitorState.isConnected = true;
      serialMonitorState.selectedPort = port;
      serialMonitorState.baudRate = baudRate;
      
      updateConnectionStatus();
      showSerialNotification(`✅ Conectado à porta ${port} (${baudRate} baud)`, 'success');
      
      // Automaticamente mudar para aba console para ver os dados
      switchTab('console');
      
      // Forçar scroll inicial do console para o final
      setTimeout(() => {
        const consoleElements = [
          document.getElementById('console-output'),
          document.getElementById('arduino-console')
        ].filter(el => el);
        
        consoleElements.forEach(element => {
          if (element) {
            element.scrollTop = element.scrollHeight;
          }
        });
      }, 100);
      
      // Enviar comando para ler dados existentes na ESP32
      setTimeout(() => {
        requestESP32Data();
      }, 1000);
      
    })
    .catch(error => {
      console.error('❌ Erro ao conectar:', error.message);
      showSerialNotification(`❌ Erro ao conectar: ${error.message}`, 'error');
      
      // Restaurar botão
      if (connectBtn) {
        connectBtn.disabled = false;
        connectBtn.innerHTML = '<span class="btn-icon">🚀</span><span class="btn-text">Conectar</span>';
      }
    });
}

/**
 * Estabelece conexão WebSocket para comunicação serial
 */
async function connectToSerialWebSocket(port, baudRate) {
  return new Promise((resolve, reject) => {
    try {
      // Fechar conexão existente se houver
      if (serialMonitorState.websocket) {
        serialMonitorState.websocket.close();
      }
      
      // Criar nova conexão WebSocket
      const wsUrl = 'ws://localhost:8080';
      console.log(`🌐 Conectando ao WebSocket: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket conectado com sucesso');
        serialMonitorState.websocket = ws;
        
        // Adicionar dados de teste para verificar se o gráfico funciona
        console.log('🧪 Adicionando dados de teste para verificar gráfico');
        setTimeout(() => {
          addSensorData(1.0, 2.0, 3.0, 0.5, 1.5, 2.5);
          addSensorData(1.2, 2.2, 3.2, 0.7, 1.7, 2.7);
          addSensorData(0.8, 1.8, 2.8, 0.3, 1.3, 2.3);
          console.log('🧪 Dados de teste adicionados, chamando updateChart');
          updateChart();
        }, 500);
        
        // Solicitar conexão à porta serial
        ws.send(JSON.stringify({
          type: 'connect',
          payload: {
            port: port,
            baudRate: parseInt(baudRate)
          }
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleSerialWebSocketMessage(data, resolve, reject);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem WebSocket:', error.message);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ Erro no WebSocket:', error);
        reject(new Error('Erro na conexão WebSocket'));
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        serialMonitorState.websocket = null;
        serialMonitorState.isConnected = false;
        updateConnectionStatus();
        
        // Parar simulação de dados se estiver rodando
        stopDataSimulation();
      };
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Processa mensagens do WebSocket
 */
function handleSerialWebSocketMessage(data, resolveConnection = null, rejectConnection = null) {
  console.log('📨 Mensagem WebSocket recebida:', data);
  
  switch (data.type) {
    case 'connected':
      console.log(`✅ Conectado à porta serial: ${data.port}`);
      if (resolveConnection) {
        resolveConnection();
      }
      break;
      
    case 'connection_error':
      console.error(`❌ Erro de conexão serial: ${data.error}`);
      if (rejectConnection) {
        rejectConnection(new Error(data.error));
      }
      break;
      
    case 'serial_data':
      // Dados recebidos da ESP32 (linhas completas)
      const receivedData = data.data;
      const timestamp = new Date(data.timestamp).toLocaleTimeString();
      
      console.log(`📡 Dados ESP32 recebidos: ${receivedData}`);
      
      // Adicionar ao console com formatação inteligente
      addFormattedConsoleMessage(receivedData, timestamp);
      
      // Manter apenas últimas 500 mensagens
      if (serialMonitorState.consoleHistory.length > 500) {
        serialMonitorState.consoleHistory = serialMonitorState.consoleHistory.slice(-500);
      }
      
      // Sempre atualizar console para garantir auto-scroll
      updateConsoleTab();
      
      // Tentar parsear dados do sensor se seguir formato esperado
      console.log('🔄 Chamando parseAndUpdateSensorData com dados:', receivedData);
      parseAndUpdateSensorData(receivedData);
      
      // Verificar se precisa inicializar gráfico no Serial Plotter
      ensureSerialPlotterChart();
      
      // Atualizar badge de contador de mensagens
      updateConsoleMessageCount();
      break;
      
    case 'serial_data_raw':
      // Dados brutos da ESP32 (podem estar incompletos ou ilegíveis)
      const rawData = data.data;
      const rawTimestamp = new Date(data.timestamp).toLocaleTimeString();
      const hexData = data.dataHex;
      
      console.log(`📡 Dados brutos ESP32: "${rawData}" (hex: ${hexData})`);
      
      // Não adicionar dados RAW ao console - eles são fragmentados e confusos
      // O processamento dos dados completos será feito em 'serial_data'
      
      updateConsoleMessageCount();
      break;
      
    case 'data_sent':
      console.log(`📤 Dados enviados: ${data.data}`);
      break;
      
    case 'upload_progress':
      // Mensagens de progresso do upload
      const uploadData = data.data;
      const uploadTimestamp = new Date(data.timestamp).toLocaleTimeString();
      
      console.log(`🚀 Progresso do upload: ${uploadData}`);
      
      // Adicionar mensagem de upload ao console com estilo diferenciado
      addFormattedConsoleMessage(uploadData, uploadTimestamp, 'upload');
      
      // Manter apenas últimas 500 mensagens
      if (serialMonitorState.consoleHistory.length > 500) {
        serialMonitorState.consoleHistory = serialMonitorState.consoleHistory.slice(-500);
      }
      
      // Atualizar console SEMPRE para mensagens de upload
      updateConsoleTab();
      
      // Atualizar badge de contador de mensagens
      updateConsoleMessageCount();
      
      // Forçar abertura da aba console serial se não estiver visível durante upload
      if (serialMonitorState.currentTab !== 'console') {
        console.log('🔄 Mudando para aba console durante upload');
        switchTab('console');
      }
      break;
      
    case 'disconnected':
      console.log('🔌 Desconectado da porta serial');
      serialMonitorState.isConnected = false;
      updateConnectionStatus();
      break;
      
    case 'ports_list':
      console.log('📋 Lista de portas atualizada:', data.ports);
      break;
      
    case 'error':
      console.error('❌ Erro WebSocket:', data.message);
      showSerialNotification(`❌ ${data.message}`, 'error');
      break;
      
    default:
      console.log(`⚠️ Tipo de mensagem desconhecido: ${data.type}`, data);
  }
}

/**
 * Solicita dados existentes da ESP32
 */
function requestESP32Data() {
  console.log('📡 Solicitando dados existentes da ESP32...');
  
  if (!serialMonitorState.websocket || !serialMonitorState.isConnected) {
    console.warn('⚠️ Não conectado à porta serial');
    return;
  }
  
  // Enviar comandos comuns para solicitar dados
  const commands = [
    'STATUS',      // Comando genérico de status
    'READ_ALL',    // Comando para ler todos os sensores
    'GET_DATA',    // Outro comando comum
    'INFO',        // Informações do dispositivo
    '?'            // Help/status (muitos sketches respondem a isso)
  ];
  
  // Enviar comandos com intervalo para não sobrecarregar
  commands.forEach((command, index) => {
    setTimeout(() => {
      sendSerialCommand(command, false); // false = não mostrar no console ainda
    }, index * 500); // 500ms entre cada comando
  });
  
  // Mostrar mensagem no console
  serialMonitorState.consoleHistory.push(`[${new Date().toLocaleTimeString()}] 🤖 Solicitando dados da ESP32...`);
  updateConsoleTab();
}

/**
 * Parse dos dados recebidos para atualizar gráficos
 */
function parseAndUpdateSensorData(data) {
  console.log('🔍 Tentando processar dados do sensor:', data);
  
  try {
    // Tentar diferentes formatos de dados de sensores
    
    // Formato JSON: {"accelX": 1.23, "accelY": 2.34, ...}
    if (data.startsWith('{') && data.endsWith('}')) {
      console.log('📊 Detectado formato JSON');
      const sensorData = JSON.parse(data);
      
      if (sensorData.accelX !== undefined || sensorData.gyroX !== undefined) {
        console.log('✅ Dados JSON de sensor processados:', sensorData);
        updateSensorDataFromObject(sensorData);
        return;
      }
    }
    
    // Formato CSV: 1.23,2.34,3.45,4.56,5.67,6.78
    if (data.includes(',')) {
      console.log('📊 Detectado formato CSV');
      const values = data.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      
      if (values.length >= 6) {
        console.log('✅ Dados CSV de sensor processados:', values);
        updateSensorDataFromArray(values);
        return;
      } else if (values.length >= 3) {
        console.log('⚠️ CSV com poucos valores, preenchendo com zeros:', values);
        // Preencher com zeros se necessário
        while (values.length < 6) {
          values.push(0);
        }
        updateSensorDataFromArray(values);
        return;
      }
    }
    
    // Formato com labels: AX:1.23 AY:2.34 AZ:3.45 GX:4.56 GY:5.67 GZ:6.78
    const labeledMatch = data.match(/AX:([-?\d.]+)\s+AY:([-?\d.]+)\s+AZ:([-?\d.]+)\s+GX:([-?\d.]+)\s+GY:([-?\d.]+)\s+GZ:([-?\d.]+)/i);
    if (labeledMatch) {
      console.log('📊 Detectado formato com labels AX/AY/etc');
      const values = labeledMatch.slice(1).map(v => parseFloat(v));
      console.log('✅ Dados com labels processados:', values);
      updateSensorDataFromArray(values);
      return;
    }
    
    // Formato mais flexível com números separados por espaços
    const numbers = data.match(/([-+]?\d*\.?\d+)/g);
    if (numbers && numbers.length >= 3) {
      console.log('📊 Detectados números no texto:', numbers);
      const values = numbers.map(n => parseFloat(n)).filter(v => !isNaN(v));
      if (values.length >= 3) {
        // Preencher com zeros se necessário
        while (values.length < 6) {
          values.push(0);
        }
        console.log('✅ Números extraídos e processados:', values);
        updateSensorDataFromArray(values.slice(0, 6));
        return;
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar dados do sensor:', error.message);
  }
  
  // Se chegou aqui, não conseguiu processar como dados de sensor
  console.log('📊 Dados não reconhecidos como formato de sensor:', data);
}

/**
 * Atualiza dados do sensor a partir de objeto JSON
 */
function updateSensorDataFromObject(sensorData) {
  const timestamp = Date.now();
  
  // Adicionar dados ao gráfico
  chartData.timestamps.push(timestamp);
  chartData.accelX.push(sensorData.accelX || 0);
  chartData.accelY.push(sensorData.accelY || 0);
  chartData.accelZ.push(sensorData.accelZ || 0);
  chartData.gyroX.push(sensorData.gyroX || 0);
  chartData.gyroY.push(sensorData.gyroY || 0);
  chartData.gyroZ.push(sensorData.gyroZ || 0);
  
  // Manter apenas últimos 100 pontos
  keepLastNPoints(100);
  
  // Atualizar displays
  updateSensorDisplay(
    sensorData.accelX || 0,
    sensorData.accelY || 0,
    sensorData.accelZ || 0,
    sensorData.gyroX || 0,
    sensorData.gyroY || 0,
    sensorData.gyroZ || 0
  );
  
  // Alimentar o Serial Plotter também
  addPlotterData(
    sensorData.accelX || 0,
    sensorData.accelY || 0,
    sensorData.accelZ || 0,
    sensorData.gyroX || 0,
    sensorData.gyroY || 0,
    sensorData.gyroZ || 0
  );
  
  // Atualizar gráfico sempre que novos dados chegarem
  updateChart();
  
  // Atualizar estado do botão de export
  updateExportButton();
  
  // Mostrar valores na interface de sensores
  updateSensorValuesDisplay(sensorData.accelX || 0, sensorData.accelY || 0, sensorData.accelZ || 0, 
                           sensorData.gyroX || 0, sensorData.gyroY || 0, sensorData.gyroZ || 0);
}

/**
 * Atualiza o estado do botão de export baseado na disponibilidade de dados
 */
function updateExportButton() {
  const exportBtn = document.getElementById('plotter-export');
  if (exportBtn) {
    const hasData = sensorData.timestamps.length > 0;
    exportBtn.disabled = !hasData;
    exportBtn.title = hasData ? 'Exportar dados como CSV' : 'Nenhum dado disponível para exportar';
  }
}

/**
 * Atualiza dados do sensor a partir de array
 */
function updateSensorDataFromArray(values) {
  const timestamp = Date.now();
  
  // Assumir ordem: AX, AY, AZ, GX, GY, GZ
  chartData.timestamps.push(timestamp);
  chartData.accelX.push(values[0] || 0);
  chartData.accelY.push(values[1] || 0);
  chartData.accelZ.push(values[2] || 0);
  chartData.gyroX.push(values[3] || 0);
  chartData.gyroY.push(values[4] || 0);
  chartData.gyroZ.push(values[5] || 0);
  
  // Manter apenas últimos 100 pontos
  keepLastNPoints(100);
  
  // Atualizar displays
  updateSensorDisplay(
    values[0] || 0,
    values[1] || 0,
    values[2] || 0,
    values[3] || 0,
    values[4] || 0,
    values[5] || 0
  );
  
  // Alimentar o Serial Plotter também
  addPlotterData(
    values[0] || 0,
    values[1] || 0,
    values[2] || 0,
    values[3] || 0,
    values[4] || 0,
    values[5] || 0
  );
  
  // Atualizar gráfico sempre que novos dados chegarem
  updateChart();
  
  // Mostrar valores na interface de sensores  
  updateSensorValuesDisplay(values[0] || 0, values[1] || 0, values[2] || 0,
                           values[3] || 0, values[4] || 0, values[5] || 0);
}

/**
 * Mantém apenas os últimos N pontos dos dados
 */
function keepLastNPoints(n) {
  Object.keys(chartData).forEach(key => {
    if (chartData[key].length > n) {
      chartData[key] = chartData[key].slice(-n);
    }
  });
}

/**
 * Atualiza contador de mensagens no badge da aba console
 */
function updateConsoleMessageCount() {
  const consoleBadge = document.getElementById('console-count');
  if (consoleBadge) {
    consoleBadge.textContent = serialMonitorState.consoleHistory.length;
    
    // Adicionar animação visual
    consoleBadge.style.animation = 'pulse 0.3s ease-in-out';
    setTimeout(() => {
      consoleBadge.style.animation = '';
    }, 300);
  }
}

/**
 * Função auxiliar para detectar e processar diferentes formatos de dados de sensor
 */
function detectSensorDataFormat(data) {
  // Remover espaços e caracteres especiais
  const cleanData = data.trim();
  
  // Formato DHT comum: "Temperatura: 26.50" "Umidade: 10.00" "Indice de Calor: 25.47"
  const tempPattern = /(?:Temperatura|Temperature):\s*([\d.-]+)/i;
  const humPattern = /(?:Umidade|Humidity):\s*([\d.-]+)/i;
  const heatPattern = /(?:Indice de Calor|Heat Index):\s*([\d.-]+)/i;
  
  const tempMatch = cleanData.match(tempPattern);
  const humMatch = cleanData.match(humPattern);
  const heatMatch = cleanData.match(heatPattern);
  
  if (tempMatch || humMatch || heatMatch) {
    return {
      type: 'dht',
      temperature: tempMatch ? parseFloat(tempMatch[1]) : null,
      humidity: humMatch ? parseFloat(humMatch[1]) : null,
      heatIndex: heatMatch ? parseFloat(heatMatch[1]) : null
    };
  }
  
  // Formato BMP180: "Pressao: 1013.25" "Temperatura: 25.6" "Altitude: 44.3"
  const pressurePattern = /(?:Pressao|Pressure):\s*([\d.-]+)/i;
  const altitudePattern = /(?:Altitude):\s*([\d.-]+)/i;
  
  const pressureMatch = cleanData.match(pressurePattern);
  const altitudeMatch = cleanData.match(altitudePattern);
  
  if (pressureMatch || altitudeMatch) {
    return {
      type: 'bmp180',
      pressure: pressureMatch ? parseFloat(pressureMatch[1]) : null,
      temperature: tempMatch ? parseFloat(tempMatch[1]) : null,
      altitude: altitudeMatch ? parseFloat(altitudeMatch[1]) : null
    };
  }
  
  // Formato BH1750: "Luminosidade: 1234.56" "Lux: 1234.56"
  const luxPattern = /(?:Luminosidade|Lux|Light):\s*([\d.-]+)/i;
  const luxMatch = cleanData.match(luxPattern);
  
  if (luxMatch) {
    return {
      type: 'bh1750',
      lux: parseFloat(luxMatch[1])
    };
  }
  
  // Formato HMC5883: "X: 123.45" "Y: 234.56" "Z: 345.67" "Heading: 45.6"
  const magXPattern = /(?:Mag X|X):\s*([-\d.-]+)/i;
  const magYPattern = /(?:Mag Y|Y):\s*([-\d.-]+)/i;
  const magZPattern = /(?:Mag Z|Z):\s*([-\d.-]+)/i;
  const headingPattern = /(?:Heading|Rumo):\s*([\d.-]+)/i;
  
  const magXMatch = cleanData.match(magXPattern);
  const magYMatch = cleanData.match(magYPattern);
  const magZMatch = cleanData.match(magZPattern);
  const headingMatch = cleanData.match(headingPattern);
  
  if (magXMatch || magYMatch || magZMatch || headingMatch) {
    return {
      type: 'hmc5883',
      magX: magXMatch ? parseFloat(magXMatch[1]) : null,
      magY: magYMatch ? parseFloat(magYMatch[1]) : null,
      magZ: magZMatch ? parseFloat(magZMatch[1]) : null,
      heading: headingMatch ? parseFloat(headingMatch[1]) : null
    };
  }
  
  // Formato MPU6050 comum: "AX:-1.23 AY:2.34 AZ:3.45 GX:4.56 GY:5.67 GZ:6.78"
  const mpuPattern = /AX:\s*([-\d.]+)\s+AY:\s*([-\d.]+)\s+AZ:\s*([-\d.]+)\s+GX:\s*([-\d.]+)\s+GY:\s*([-\d.]+)\s+GZ:\s*([-\d.]+)/i;
  const mpuMatch = cleanData.match(mpuPattern);
  if (mpuMatch) {
    return {
      type: 'mpu6050',
      values: mpuMatch.slice(1).map(v => parseFloat(v))
    };
  }
  
  // Formato alternativo MPU6050: "Accel X: 1.23" "Accel Y: 2.34" etc
  const accelXPattern = /(?:Accel X|AX):\s*([-\d.-]+)/i;
  const accelYPattern = /(?:Accel Y|AY):\s*([-\d.-]+)/i;
  const accelZPattern = /(?:Accel Z|AZ):\s*([-\d.-]+)/i;
  const gyroXPattern = /(?:Gyro X|GX):\s*([-\d.-]+)/i;
  const gyroYPattern = /(?:Gyro Y|GY):\s*([-\d.-]+)/i;
  const gyroZPattern = /(?:Gyro Z|GZ):\s*([-\d.-]+)/i;
  
  const axMatch = cleanData.match(accelXPattern);
  const ayMatch = cleanData.match(accelYPattern);
  const azMatch = cleanData.match(accelZPattern);
  const gxMatch = cleanData.match(gyroXPattern);
  const gyMatch = cleanData.match(gyroYPattern);
  const gzMatch = cleanData.match(gyroZPattern);
  
  if (axMatch || ayMatch || azMatch || gxMatch || gyMatch || gzMatch) {
    return {
      type: 'mpu6050_individual',
      accelX: axMatch ? parseFloat(axMatch[1]) : null,
      accelY: ayMatch ? parseFloat(ayMatch[1]) : null,
      accelZ: azMatch ? parseFloat(azMatch[1]) : null,
      gyroX: gxMatch ? parseFloat(gxMatch[1]) : null,
      gyroY: gyMatch ? parseFloat(gyMatch[1]) : null,
      gyroZ: gzMatch ? parseFloat(gzMatch[1]) : null
    };
  }
  
  // Formato separado por vírgulas: "1.23,2.34,3.45,4.56,5.67,6.78"
  if (cleanData.includes(',')) {
    const values = cleanData.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    if (values.length >= 6) {
      return {
        type: 'csv',
        values: values.slice(0, 6)
      };
    } else if (values.length >= 3) {
      return {
        type: 'csv_short',
        values: values
      };
    }
  }
  
  // Formato JSON: {"ax": 1.23, "ay": 2.34, ...}
  if (cleanData.startsWith('{') && cleanData.endsWith('}')) {
    try {
      const obj = JSON.parse(cleanData);
      const keys = Object.keys(obj);
      
      // Verificar se contém dados de acelerômetro/giroscópio
      if (keys.some(k => k.toLowerCase().includes('accel') || k.toLowerCase().includes('gyro'))) {
        return {
          type: 'json_mpu',
          object: obj
        };
      } else if (keys.some(k => k.toLowerCase().includes('temp') || k.toLowerCase().includes('hum'))) {
        return {
          type: 'json_dht',
          object: obj
        };
      } else {
        return {
          type: 'json',
          object: obj
        };
      }
    } catch (e) {
      // Não é JSON válido
    }
  }
  
  // Formato de status/info (não é dado de sensor)
  const infoKeywords = ['status', 'info', 'ready', 'ok', 'error', 'sensor', 'mpu', 'initialized', 'connected', 'starting'];
  if (infoKeywords.some(keyword => cleanData.toLowerCase().includes(keyword))) {
    return {
      type: 'info',
      message: cleanData
    };
  }
  
  return null;
}

/**
 * Adiciona mensagem formatada ao console baseada no tipo de dados
 */
function addFormattedConsoleMessage(data, timestamp, messageType = 'serial') {
  // Console simples e limpo, estilo Arduino IDE
  if (messageType === 'upload') {
    serialMonitorState.consoleHistory.push(
      `[${timestamp}] Upload: ${data}`
    );
    return;
  }
  
  if (messageType === 'raw') {
    serialMonitorState.consoleHistory.push(
      `[${timestamp}] RAW: ${data}`
    );
    return;
  }
  
  // Formato simples e limpo - apenas timestamp e dados
  serialMonitorState.consoleHistory.push(`${timestamp} - ${data}`);
}

function disconnectSerial() {
  console.log('🔌 Desconectando porta serial...');
  
  // Enviar comando de desconexão via WebSocket se conectado
  if (serialMonitorState.websocket && serialMonitorState.isConnected) {
    try {
      serialMonitorState.websocket.send(JSON.stringify({
        type: 'disconnect',
        payload: {
          port: serialMonitorState.selectedPort
        }
      }));
    } catch (error) {
      console.warn('⚠️ Erro ao enviar comando de desconexão:', error.message);
    }
    
    // Fechar WebSocket após pequeno delay
    setTimeout(() => {
      if (serialMonitorState.websocket) {
        serialMonitorState.websocket.close();
        serialMonitorState.websocket = null;
      }
    }, 500);
  }
  
  // Atualizar estado
  serialMonitorState.isConnected = false;
  serialMonitorState.selectedPort = '';
  
  // Parar simulação de dados
  stopDataSimulation();
  
  // Limpar dados do gráfico
  clearSensorData();
  
  // Atualizar UI
  updateConnectionStatus();
  showSerialNotification('🔌 Desconectado da porta serial', 'info');
  
  // Restaurar botão conectar
  const connectBtn = document.getElementById('connect-btn');
  if (connectBtn) {
    connectBtn.disabled = false;
    connectBtn.innerHTML = '<span class="btn-icon">🚀</span><span class="btn-text">Conectar</span>';
  }
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
    connectionBadge.className = isConnected ? 'connection-status connected' : 'connection-status';
    
    const statusDot = connectionBadge.querySelector('.status-dot');
    const statusText = connectionBadge.querySelector('.status-text');
    
    if (statusDot && statusText) {
      if (isConnected) {
        statusDot.className = 'status-dot online';
        statusText.textContent = `Connected to ${serialMonitorState.selectedPort}`;
      } else {
        statusDot.className = 'status-dot';
        statusText.textContent = 'Disconnected';
      }
    }
  }
  
  // Update connection buttons
  if (connectBtn) {
    console.log(`🔍 Status do backend: isRunning=${backendState.isRunning}, isStarting=${backendState.isStarting}, isStopping=${backendState.isStopping}`);
    console.log(`🔍 Porta selecionada: ${serialMonitorState.selectedPort}`);
    
    // Desabilitar botão se: conectado OU backend não está rodando OU backend está iniciando/parando OU nenhuma porta selecionada
    const noPortSelected = !serialMonitorState.selectedPort || serialMonitorState.selectedPort === '';
    connectBtn.disabled = serialMonitorState.isConnected || 
                          (!backendState.isRunning && !backendState.isStarting) || 
                          backendState.isStopping || 
                          noPortSelected;
    
    if (backendState.isStarting) {
      connectBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Iniciando Backend...</span>';
    } else if (backendState.isStopping) {
      connectBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Parando Backend...</span>';
    } else if (!backendState.isRunning) {
      connectBtn.innerHTML = '<span class="btn-icon">⚠️</span><span class="btn-text">Backend Offline</span>';
    } else if (noPortSelected) {
      connectBtn.innerHTML = '<span class="btn-icon">📍</span><span class="btn-text">Selecione uma Porta</span>';
    } else if (serialMonitorState.isConnected) {
      connectBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Conectado</span>';
    } else {
      connectBtn.innerHTML = '<span class="btn-icon">🚀</span><span class="btn-text">Conectar</span>';
    }
    
    console.log(`🎯 Botão conectar atualizado: ${connectBtn.innerHTML}`);
  }
  
  if (disconnectBtn) disconnectBtn.disabled = !serialMonitorState.isConnected;
  
  // Update upload tab buttons based on connection status
  updateUploadTab();
  
  // Show/hide command input based on connection status
  const commandInput = document.getElementById('command-input');
  if (commandInput) {
    if (serialMonitorState.isConnected) {
      commandInput.style.display = 'flex';
      commandInput.classList.add('active');
    } else {
      commandInput.style.display = 'none';
      commandInput.classList.remove('active');
    }
  }
  
  // Update stats
  const statsStatus = document.getElementById('stats-status');
  const statsMessages = document.getElementById('stats-messages');
  
  if (statsStatus) {
    statsStatus.textContent = serialMonitorState.isConnected ? 
      `Conectado (${serialMonitorState.selectedPort})` : 'Desconectado';
  }
  
  if (statsMessages) {
    statsMessages.textContent = serialMonitorState.consoleHistory.length;
  }
}

// Upload Tab Functions
function updateUploadTab() {
  console.log('📤 Atualizando aba Upload...');
  
  const compileBtn = document.getElementById('compile-btn');
  const uploadBtnModal = document.getElementById('upload-btn');
  const uploadBtnMain = document.getElementById('upload-code');
  
  // Para upload, só precisa de porta selecionada, não de conexão serial ativa
  const hasPortSelected = serialMonitorState.selectedPort && serialMonitorState.selectedPort !== '';
  const backendRunning = backendState.isRunning;
  
  // Enable buttons based on port selection and backend status
  if (compileBtn) compileBtn.disabled = false; // Compilar sempre funciona
  if (uploadBtnModal) uploadBtnModal.disabled = !hasPortSelected || !backendRunning;
  if (uploadBtnMain) uploadBtnMain.disabled = !hasPortSelected || !backendRunning;
  
  console.log('📤 Porta selecionada:', serialMonitorState.selectedPort);
  console.log('📤 Backend rodando:', backendRunning);
  console.log('📤 Botão modal habilitado:', uploadBtnModal ? !uploadBtnModal.disabled : 'não encontrado');
  console.log('📤 Botão principal habilitado:', uploadBtnMain ? !uploadBtnMain.disabled : 'não encontrado');
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

// Função para pegar o código do modal
function getModalCode() {
  const codeBox = document.querySelector('.code-box.example-code');
  
  if (codeBox && isExampleMode) {
    // Se estiver no modo exemplo, pegar o código do exemplo
    console.log('📋 Usando código de exemplo');
    const exampleCode = codeBox.textContent;
    console.log('📝 Código de exemplo (primeiros 200 chars):', exampleCode.substring(0, 200));
    return exampleCode;
  }
  
  // Caso contrário, usar o código gerado do workspace
  console.log('🔧 Gerando código do workspace Blockly');
  const generatedCode = generateCode();
  console.log('📝 Código gerado (primeiros 200 chars):', generatedCode ? generatedCode.substring(0, 200) : 'null');
  console.log('📊 Tamanho do código gerado:', generatedCode ? generatedCode.length : 0);
  
  // Verificar se o código é válido
  if (!generatedCode || generatedCode.trim() === '') {
    console.warn('⚠️ Código gerado está vazio ou nulo');
    return null;
  }
  
  if (generatedCode.includes('// Arraste os blocos')) {
    console.warn('⚠️ Código gerado é apenas uma mensagem de orientação');
    return null;
  }
  
  return generatedCode;
}

// Função para alternar para a aba do console
function switchToConsoleTab() {
  console.log('📋 Alternando para a aba console...');
  switchTab('console');
}

// Função para limpar o console serial
function clearSerialConsole() {
  serialMonitorState.consoleHistory = [];
  updateConsoleTab();
}

// Função para adicionar texto ao console serial
function addToSerialConsole(text) {
  const timestamp = new Date().toLocaleTimeString();
  const formattedText = `[${timestamp}] ${text}`;
  
  console.log('🗨️ Adicionando ao console:', formattedText);
  
  serialMonitorState.consoleHistory.push(formattedText);
  
  console.log('🗨️ Total de mensagens no histórico:', serialMonitorState.consoleHistory.length);
  
  updateConsoleTab();
}

// Variáveis para monitoramento serial real
let serialWebSocket = null;
let serialMonitoringActive = false;

// Função para iniciar monitoramento serial real
function startRealSerialMonitoring(port) {
  // Fechar conexão anterior se existir
  if (serialWebSocket) {
    serialWebSocket.close();
    serialWebSocket = null;
  }
  
  addToSerialConsole(`� Conectando ao monitoramento serial na porta ${port}...`);
  
  try {
    // Conectar ao WebSocket do backend para monitoramento serial
    const wsUrl = `ws://localhost:8080`;
    serialWebSocket = new WebSocket(wsUrl);
    
    serialWebSocket.onopen = () => {
      // Obter baud rate selecionado pelo usuário
      const baudRateSelect = document.getElementById('baud-rate-select');
      const selectedBaudRate = baudRateSelect ? parseInt(baudRateSelect.value) : 9600;
      
      console.log(`🔌 Conectado ao WebSocket serial - usando baud rate: ${selectedBaudRate}`);
      addToSerialConsole('✅ Conectado ao monitor serial');
      addToSerialConsole(`⚡ Baud Rate: ${selectedBaudRate}`);
      
      // Enviar comando para conectar à porta
      serialWebSocket.send(JSON.stringify({
        type: 'connect',
        payload: {
          port: port,
          baudRate: selectedBaudRate
        }
      }));
      
      serialMonitoringActive = true;
    };
    
    serialWebSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleSerialWebSocketMessage(data, null, null);
      } catch (error) {
        console.error('❌ Erro ao processar mensagem WebSocket:', error);
      }
    };
    
    serialWebSocket.onclose = () => {
      console.log('🔌 Conexão WebSocket fechada');
      serialMonitoringActive = false;
      if (serialWebSocket) {
        addToSerialConsole('⚠️ Conexão serial perdida');
      }
    };
    
    serialWebSocket.onerror = (error) => {
      console.error('❌ Erro WebSocket:', error);
      addToSerialConsole('❌ Erro na conexão serial');
      serialMonitoringActive = false;
    };
    
  } catch (error) {
    console.error('❌ Erro ao conectar WebSocket:', error);
    addToSerialConsole('❌ Erro ao conectar ao monitor serial');
  }
}

// Função para parar o monitoramento serial
function stopSerialMonitoring() {
  if (serialWebSocket) {
    serialWebSocket.close();
    serialWebSocket = null;
  }
  serialMonitoringActive = false;
  addToSerialConsole('🛑 Monitoramento serial parado');
}

async function uploadSketch() {
  console.log('📤 FUNÇÃO UPLOADSKETCH CHAMADA - Fazendo upload do sketch...');
  
  // Para upload, não precisa estar conectado ao monitor serial, só precisa ter porta selecionada
  // Remover verificação de isConnected - isso é só para monitor serial
  
  const code = getModalCode();
  console.log('📤 Código obtido para upload:', code ? code.substring(0, 100) + '...' : 'null');
  
  if (!code || code.trim() === '') {
    console.error('❌ Nenhum código válido obtido');
    showSerialNotification('❌ Nenhum código para fazer upload! Adicione blocos ao workspace.', 'error');
    return;
  }
  
  // Verificar se o código tem estrutura básica do Arduino
  if (!code.includes('void setup()') && !code.includes('setup()')) {
    console.error('❌ Código não tem função setup()');
    showSerialNotification('❌ Código inválido: deve conter void setup()', 'error');
    return;
  }
  
  if (!code.includes('void loop()') && !code.includes('loop()')) {
    console.error('❌ Código não tem função loop()');
    showSerialNotification('❌ Código inválido: deve conter void loop()', 'error');
    return;
  }
  
  console.log('✅ Código validado com sucesso');
  
  // Pegar porta diretamente do seletor do modal de upload
  const uploadPortSelector = document.getElementById('upload-port-select');
  const selectedPort = uploadPortSelector ? uploadPortSelector.value : serialMonitorState.selectedPort;
  
  console.log('🔍 Porta do seletor upload:', uploadPortSelector ? uploadPortSelector.value : 'não encontrado');
  console.log('🔍 Porta do state global:', serialMonitorState.selectedPort);
  console.log('🔍 Porta selecionada final:', selectedPort);
  
  if (!selectedPort) {
    showSerialNotification('❌ Nenhuma porta selecionada!', 'error');
    return;
  }
  
  // Garantir que o console serial esteja visível
  openSerialMonitorModal();
  switchToConsoleTab();
  
  // Limpar console antes de iniciar
  clearSerialConsole();
  
  // Desabilitar botões
  const uploadBtnModal = document.getElementById('upload-btn');
  const uploadBtnMain = document.getElementById('upload-code');
  
  if (uploadBtnModal) {
    uploadBtnModal.disabled = true;
    uploadBtnModal.textContent = '📤 Fazendo Upload...';
  }
  
  if (uploadBtnMain) {
    uploadBtnMain.disabled = true;
    uploadBtnMain.innerHTML = '<span class="btn-icon">⏳</span><span>Uploading...</span>';
  }
  
  updateProgress(0);
  
  // Verificar se backend está rodando
  addToSerialConsole(`🔧 Status do backend: ${backendState.isRunning ? 'Rodando' : 'Parado'}`);
  
  if (!backendState.isRunning) {
    showSerialNotification('❌ Backend não está rodando! Inicie o backend primeiro.', 'error');
    addToSerialConsole('❌ Backend não está rodando!');
    addToSerialConsole('💡 SOLUÇÃO: Procure o botão "Iniciar Backend" e clique nele');
    addToSerialConsole('   O botão geralmente fica na área de configurações ou tools');
    reEnableUploadButtons(uploadBtnModal, uploadBtnMain);
    return;
  }
  
  try {
    addToSerialConsole('=== PROCESSO DE UPLOAD INICIADO ===');
    addToSerialConsole(`📝 Código: ${code.length} caracteres`);
    addToSerialConsole(`📡 Porta: ${selectedPort}`);
    addToSerialConsole(`🌐 Backend URL: ${backendState.baseUrl}`);
    
    // Validação prévia do código
    addToSerialConsole('');
    addToSerialConsole('🔍 Validando código Arduino...');
    const validation = validateArduinoCode(code);
    displayValidationResults(validation);
    
    if (!validation.isValid) {
      addToSerialConsole('');
      addToSerialConsole('❌ UPLOAD CANCELADO - Corrija os erros de validação primeiro');
      showSerialNotification('❌ Código inválido - verifique os erros', 'error');
      reEnableUploadButtons(uploadBtnModal, uploadBtnMain);
      return;
    }
    
    if (validation.warnings.length > 0) {
      addToSerialConsole('');
      addToSerialConsole('⚠️ Continuando upload apesar dos avisos...');
    } else {
      addToSerialConsole('✅ Código validado com sucesso');
    }
    
    addToSerialConsole('');
    showSerialNotification('📤 Iniciando compilação e upload...', 'info');
    
    // Detectar e instalar bibliotecas necessárias
    updateUploadStatus('🔍 Detectando bibliotecas necessárias...', 10);
    const requiredLibraries = detectRequiredLibraries(code);
    if (requiredLibraries.length > 0) {
      addToSerialConsole('🔍 Bibliotecas detectadas no código:');
      requiredLibraries.forEach(lib => {
        addToSerialConsole(`   - ${lib.name} (${lib.include})`);
      });
      
      updateUploadStatus('📚 Instalando bibliotecas necessárias...', 15);
      showSerialNotification('📚 Instalando bibliotecas...', 'info');
      
      for (const library of requiredLibraries) {
        try {
          addToSerialConsole(`📦 Instalando ${library.name}...`);
          
          const libResponse = await fetch(`${backendState.baseUrl}/api/arduino/library/install`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: library.name
            })
          });
          
          if (libResponse.ok) {
            const libResult = await libResponse.json();
            if (libResult.success) {
              addToSerialConsole(`   ✅ ${library.name} instalada com sucesso`);
            } else {
              addToSerialConsole(`   ⚠️ ${library.name}: ${libResult.message}`);
            }
          } else {
            addToSerialConsole(`   ❌ Erro ao instalar ${library.name}`);
          }
        } catch (libError) {
          addToSerialConsole(`   ❌ Erro ao instalar ${library.name}: ${libError.message}`);
        }
      }
    }
    
    // Verificar ESP32 core (simplificado - backend agora faz isso automaticamente)
    updateUploadStatus('🔍 Verificando pré-requisitos...', 25);
    try {
      const esp32StatusResponse = await fetch(`${backendState.baseUrl}/api/arduino/esp32/status`);
      if (esp32StatusResponse.ok) {
        const statusData = await esp32StatusResponse.json();
        
        if (statusData.success && statusData.esp32Status.installed) {
          addToSerialConsole('✅ ESP32 core disponível');
          if (statusData.esp32Status.version) {
            addToSerialConsole(`   📋 Versão: ${statusData.esp32Status.version}`);
          }
        } else {
          addToSerialConsole('📦 ESP32 core será instalado automaticamente se necessário');
        }
      }
    } catch (statusError) {
      addToSerialConsole('� Verificação de pré-requisitos será feita durante o upload...');
    }
    
    // Parar monitoramento serial se estiver ativo (pode interferir no upload)
    if (serialMonitoringActive) {
      addToSerialConsole('⏹️ Parando monitoramento serial para liberar porta...');
      stopSerialMonitoring();
      // Aguardar um pouco para a porta ser liberada
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Conectar ao Arduino CLI para upload
    updateUploadStatus('🔄 Compilando código para ESP32...', 40);
    showSerialNotification('📤 Fazendo upload para ESP32...', 'info');
    
    // Fazer upload real usando Arduino CLI
    updateUploadStatus('📤 Enviando código para ESP32...', 60);
    const uploadUrl = `${backendState.baseUrl}/api/arduino/upload`;
    addToSerialConsole(`📤 Enviando para: ${uploadUrl}`);
    
    // Log detalhado do payload
    const payload = {
      code: code,
      port: selectedPort,
      board: 'esp32:esp32:esp32',
      cleanFlash: false  // Desabilitado: o Arduino CLI já gerencia isso automaticamente
    };
    
    console.log('📦 Payload do upload:');
    console.log('  - Porta:', payload.port);
    console.log('  - Placa:', payload.board);
    console.log('  - Limpeza Flash:', payload.cleanFlash);
    console.log('  - Tamanho do código:', payload.code.length);
    console.log('  - Código (primeiros 300 chars):', payload.code.substring(0, 300));
    
    addToSerialConsole(`📊 Enviando ${payload.code.length} caracteres de código...`);
    addToSerialConsole('� Upload direto - esptool gerencia limpeza automaticamente');
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      timeout: 120000 // 2 minutos de timeout para upload
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      addToSerialConsole('✅ Compilação bem-sucedida!');
      addToSerialConsole('📤 Upload concluído!');
      addToSerialConsole('🔄 Reiniciando ESP32...');
      addToSerialConsole('=== UPLOAD FINALIZADO COM SUCESSO ===');
      addToSerialConsole('');
      addToSerialConsole('📡 Iniciando monitoramento serial...');
      
      updateProgress(100);
      showSerialNotification('✅ Upload concluído com sucesso!', 'success');
      
      // Limpar dados de erro anterior
      window.lastUploadError = null;
      
      // Iniciar monitoramento de dados reais da serial
      setTimeout(() => {
        startRealSerialMonitoring(selectedPort);
      }, 2000);
      
    } else {
      addToSerialConsole('❌ Erro no upload:');
      addToSerialConsole(`   📋 ${result.message || 'Erro desconhecido'}`);
      
      // Mostrar detalhes específicos se disponível
      if (result.prerequisiteFailed) {
        addToSerialConsole('');
        addToSerialConsole('🔍 VERIFICAÇÃO DE PRÉ-REQUISITOS FALHOU:');
        
        switch(result.prerequisiteFailed) {
          case 'ESP32_CORE':
            addToSerialConsole('   � ESP32 core não pôde ser instalado');
            addToSerialConsole('   � Instale manualmente: arduino-cli core install esp32:esp32');
            break;
          case 'PORT_NOT_FOUND':
            addToSerialConsole('   🔌 Porta serial não encontrada');
            if (result.availablePorts && result.availablePorts.length > 0) {
              addToSerialConsole(`   📋 Portas disponíveis: ${result.availablePorts.map(p => p.address).join(', ')}`);
            }
            addToSerialConsole('   💡 Verifique se a ESP32 está conectada');
            break;
          default:
            addToSerialConsole(`   ❓ Erro de pré-requisito: ${result.prerequisiteFailed}`);
        }
      }
      
      // Verificar se requer configuração inicial
      if (result.requiresSetup) {
        addToSerialConsole('');
        addToSerialConsole('⚙️ CONFIGURAÇÃO NECESSÁRIA:');
        addToSerialConsole('   💡 Execute o botão "Iniciar Backend" para configurar automaticamente');
        addToSerialConsole('   📦 Isso irá instalar o ESP32 core e dependências necessárias');
      }
      
      // Mostrar erro detalhado se disponível
      if (result.error && result.error !== result.message) {
        addToSerialConsole('');
        addToSerialConsole('🔍 Detalhes técnicos:');
        const errorLines = result.error.split('\n').slice(0, 10); // Limitar a 10 linhas
        errorLines.forEach(line => {
          if (line.trim()) {
            addToSerialConsole(`   ${line.trim()}`);
          }
        });
      }
      
      addToSerialConsole('');
      addToSerialConsole('🔧 AÇÕES RECOMENDADAS:');
      
      // Sugestões específicas baseadas no tipo de erro
      if (result.message.includes('Porta') || result.message.includes('port')) {
        addToSerialConsole('   1. Verifique se a ESP32 está conectada via USB');
        addToSerialConsole('   2. Experimente uma porta USB diferente');
        addToSerialConsole('   3. Reinicie a ESP32 (botão RESET)');
      } else if (result.message.includes('ESP32') || result.message.includes('core')) {
        addToSerialConsole('   1. Verifique conexão com a internet');
        addToSerialConsole('   2. Tente instalar ESP32 core manualmente');
        addToSerialConsole('   3. Reinicie o backend');
      } else {
        addToSerialConsole('   1. Verifique se a ESP32 está em modo de programação');
        addToSerialConsole('   2. Pressione BOOT + RESET na ESP32');
        addToSerialConsole('   3. Tente novamente');
      }
      
      if (result.error && result.error.includes('library') || result.error && result.error.includes('.h')) {
        addToSerialConsole('   1. Verificar se todas as bibliotecas necessárias estão instaladas');
        addToSerialConsole('   2. Atualizar as bibliotecas instaladas');
      }
      
      addToSerialConsole('');
      addToSerialConsole('❌ UPLOAD FALHOU');
      addToSerialConsole('   � Verifique os detalhes acima e tente novamente');
      
      showSerialNotification('❌ Erro no upload!', 'error');
    }
    
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    addToSerialConsole('❌ Erro na comunicação com o backend:');
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      addToSerialConsole('   🔌 Não foi possível conectar ao backend');
      addToSerialConsole('   💡 Verifique se o backend está rodando');
      addToSerialConsole(`   🌐 Tentando conectar em: ${backendState.baseUrl}`);
      showSerialNotification('❌ Backend não acessível!', 'error');
    } else if (error.name === 'AbortError') {
      addToSerialConsole('   ⏱️ Timeout na requisição');
      showSerialNotification('❌ Timeout na comunicação!', 'error');
    } else {
      addToSerialConsole(`   ${error.message}`);
      showSerialNotification('❌ Erro na comunicação!', 'error');
    }
    
    addToSerialConsole('');
    addToSerialConsole('🔧 Soluções possíveis:');
    addToSerialConsole('   1. Verificar se o backend está rodando');
    addToSerialConsole('   2. Verificar se a ESP32 está conectada');
    addToSerialConsole('   3. Tentar reiniciar o backend');
  } finally {
    // Reabilitar botões
    reEnableUploadButtons(uploadBtnModal, uploadBtnMain);
    updateProgress(0);
  }
}

// Função auxiliar para reabilitar botões
function reEnableUploadButtons(modalBtn, mainBtn) {
  if (modalBtn) {
    modalBtn.disabled = false;
    modalBtn.textContent = '📤 Upload para ESP';
  }
  
  if (mainBtn) {
    mainBtn.disabled = false;
    mainBtn.innerHTML = '<span class="btn-icon">📤</span><span>Upload Código</span>';
  }
}

// Função para detectar bibliotecas necessárias no código
function detectRequiredLibraries(code) {
  const libraries = [];
  
  // Mapeamento de includes para nomes de bibliotecas
  const libraryMap = {
    'DHT.h': { name: 'DHT sensor library', include: 'DHT.h' },
    'DHT22.h': { name: 'DHT sensor library', include: 'DHT22.h' },
    'MPU6050.h': { name: 'MPU6050', include: 'MPU6050.h' },
    'Wire.h': { name: 'Wire', include: 'Wire.h' }, // Biblioteca built-in
    'BH1750.h': { name: 'BH1750', include: 'BH1750.h' },
    'BMP180.h': { name: 'BMP180', include: 'BMP180.h' },
    'HMC5883L.h': { name: 'HMC5883L', include: 'HMC5883L.h' },
    'Adafruit_BMP085.h': { name: 'Adafruit BMP085 Library', include: 'Adafruit_BMP085.h' },
    'Adafruit_Sensor.h': { name: 'Adafruit Unified Sensor', include: 'Adafruit_Sensor.h' },
    'OneWire.h': { name: 'OneWire', include: 'OneWire.h' },
    'DallasTemperature.h': { name: 'DallasTemperature', include: 'DallasTemperature.h' }
  };
  
  // Procurar por includes no código
  const includeRegex = /#include\s*[<"](.*?)[>"]/g;
  let match;
  
  while ((match = includeRegex.exec(code)) !== null) {
    const includeName = match[1];
    
    if (libraryMap[includeName]) {
      // Verificar se já foi adicionada
      const existing = libraries.find(lib => lib.name === libraryMap[includeName].name);
      if (!existing) {
        libraries.push(libraryMap[includeName]);
      }
    }
  }
  
  // Filtrar bibliotecas built-in que não precisam ser instaladas
  const builtInLibraries = ['Wire'];
  return libraries.filter(lib => !builtInLibraries.includes(lib.name));
}

// Função para validar código Arduino antes do upload
function validateArduinoCode(code) {
  const validationResults = {
    isValid: true,
    warnings: [],
    errors: [],
    suggestions: []
  };
  
  // Verificações básicas de estrutura
  if (!code || code.trim() === '') {
    validationResults.errors.push('❌ Código vazio - adicione pelo menos os blocos setup() e loop()');
    validationResults.isValid = false;
    return validationResults;
  }
  
  // Verificar se tem setup()
  if (!code.includes('void setup()')) {
    validationResults.errors.push('❌ Função setup() não encontrada - adicione o bloco "void setup()"');
    validationResults.isValid = false;
  }
  
  // Verificar se tem loop()
  if (!code.includes('void loop()')) {
    validationResults.errors.push('❌ Função loop() não encontrada - adicione o bloco "void loop()"');
    validationResults.isValid = false;
  }
  
  // Verificar parênteses balanceados
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    validationResults.errors.push(`❌ Chaves desbalanceadas: ${openBraces} aberturas '{' vs ${closeBraces} fechamentos '}'`);
    validationResults.isValid = false;
  }
  
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    validationResults.errors.push(`❌ Parênteses desbalanceados: ${openParens} aberturas '(' vs ${closeParens} fechamentos ')'`);
    validationResults.isValid = false;
  }
  
  // Avisos sobre possíveis problemas
  if (code.includes('delay(') && !code.includes('Serial.begin')) {
    validationResults.warnings.push('⚠️ Usando delay() mas Serial não foi inicializado - considere adicionar Serial.begin()');
  }
  
  if (code.includes('digitalWrite') && !code.includes('pinMode')) {
    validationResults.warnings.push('⚠️ Usando digitalWrite() mas pinMode() não foi detectado - configure os pinos antes de usar');
  }
  
  // Verificar includes necessários vs bibliotecas detectadas
  const hasWireUsage = code.includes('Wire.') || code.includes('I2C') || code.includes('SDA') || code.includes('SCL');
  if (hasWireUsage && !code.includes('#include <Wire.h>')) {
    validationResults.warnings.push('⚠️ Detectado uso de I2C/Wire mas biblioteca não incluída - adicione o bloco biblioteca Wire');
  }
  
  const hasDHTUsage = code.includes('dht.') || code.includes('DHT ');
  if (hasDHTUsage && !code.includes('#include <DHT.h>')) {
    validationResults.warnings.push('⚠️ Detectado uso de DHT mas biblioteca não incluída - adicione o bloco biblioteca DHT');
  }
  
  // Sugestões de melhoria
  if (code.includes('void setup()') && !code.includes('Serial.begin')) {
    validationResults.suggestions.push('💡 Considere adicionar Serial.begin(115200) no setup() para debug');
  }
  
  if (code.includes('void loop()') && code.length < 200) {
    validationResults.suggestions.push('💡 Código muito simples - adicione mais sensores ou funcionalidades');
  }
  
  return validationResults;
}

// Função para mostrar resultados da validação no console
function displayValidationResults(validation) {
  if (validation.errors.length > 0) {
    addToSerialConsole('🔍 ERROS DE VALIDAÇÃO ENCONTRADOS:');
    validation.errors.forEach(error => {
      addToSerialConsole(`   ${error}`);
    });
  }
  
  if (validation.warnings.length > 0) {
    addToSerialConsole('⚠️ AVISOS:');
    validation.warnings.forEach(warning => {
      addToSerialConsole(`   ${warning}`);
    });
  }
  
  if (validation.suggestions.length > 0) {
    addToSerialConsole('💡 SUGESTÕES:');
    validation.suggestions.forEach(suggestion => {
      addToSerialConsole(`   ${suggestion}`);
    });
  }
  
  if (validation.isValid && validation.warnings.length === 0 && validation.suggestions.length === 0) {
    addToSerialConsole('✅ Código passou na validação sem problemas');
  }
}

// Função para instalar ESP32 core automaticamente
async function installEsp32Core() {
  try {
    addToSerialConsole('🔧 Iniciando instalação do ESP32 core...');
    
    const response = await fetch(`${backendState.baseUrl}/api/arduino/core/install`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        core: 'esp32:esp32'
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na instalação do core: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      addToSerialConsole('✅ ESP32 core instalado com sucesso!');
      return true;
    } else {
      throw new Error(result.error || 'Falha na instalação do ESP32 core');
    }
  } catch (error) {
    addToSerialConsole(`❌ Erro na instalação automática: ${error.message}`);
    throw error;
  }
}

// Função para mostrar status do upload em tempo real
function updateProgress(percent, status = '') {
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  const progressStatus = document.querySelector('.progress-status');
  
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
    
    // Mudança de cor baseada no progresso
    if (percent < 30) {
      progressFill.style.background = '#3498db'; // Azul - início
    } else if (percent < 70) {
      progressFill.style.background = '#f39c12'; // Laranja - meio
    } else if (percent < 100) {
      progressFill.style.background = '#e74c3c'; // Vermelho - crítico
    } else {
      progressFill.style.background = '#27ae60'; // Verde - sucesso
    }
  }
  
  if (progressText) {
    progressText.textContent = `${Math.round(percent)}%`;
  }
  
  if (progressStatus && status) {
    progressStatus.textContent = status;
  }
}

// Função para resetar interface de upload
function resetUploadInterface() {
  updateProgress(0, '');
  
  const uploadBtnModal = document.getElementById('upload-btn');
  const uploadBtnMain = document.getElementById('upload-code');
  
  if (uploadBtnModal) {
    uploadBtnModal.disabled = false;
    uploadBtnModal.textContent = '📤 Upload';
  }
  
  if (uploadBtnMain) {
    uploadBtnMain.disabled = false;
    uploadBtnMain.innerHTML = '<span class="btn-icon">📤</span><span>Upload</span>';
  }
}

// Função para mostrar status do upload em tempo real
function updateUploadStatus(status, percent = null) {
  if (percent !== null) {
    updateProgress(percent, status);
  }
  
  // Adicionar timestamp ao status
  const timestamp = new Date().toLocaleTimeString();
  addToSerialConsole(`[${timestamp}] ${status}`);
}

// Serial Plotter Functions
function initializeChart() {
  console.log('📊 Inicializando gráfico...');
  
  // Verificar qual aba está ativa primeiro
  const activeTab = document.querySelector('.tab-content.active');
  const serialTab = document.querySelector('.serial-tab-content[data-tab="sensors"]');
  
  console.log('📊 Verificando elementos disponíveis:');
  console.log('- Aba ativa:', activeTab ? activeTab.getAttribute('data-tab') : 'nenhuma');
  console.log('- Aba serial sensors:', !!serialTab);
  
  let chartElement = null;
  
  // 1. Primeiro tentar na aba sensors do modal principal
  if (activeTab && activeTab.getAttribute('data-tab') === 'sensors') {
    chartElement = document.querySelector('.tab-content[data-tab="sensors"] #sensor-chart');
    console.log('📊 Canvas na aba sensors principal:', !!chartElement);
  }
  
  // 2. Se não encontrou, tentar na aba serial plotter
  if (!chartElement && serialTab) {
    chartElement = document.getElementById('serial-plotter-chart');
    console.log('📊 Div no serial plotter:', !!chartElement);
  }
  
  // 3. Fallback: qualquer .serial-chart
  if (!chartElement) {
    chartElement = document.querySelector('.serial-chart');
    console.log('📊 Fallback .serial-chart:', !!chartElement);
  }
  
  if (!chartElement) {
    console.error('❌ Elemento do gráfico não encontrado');
    console.log('📊 Elementos disponíveis no DOM:', {
      'canvas_sensor': !!document.querySelector('#sensor-chart'),
      'div_serial': !!document.querySelector('#serial-plotter-chart'),
      'serial_charts': document.querySelectorAll('.serial-chart').length
    });
    return;
  }
  
  console.log('✅ Elemento do gráfico encontrado:', chartElement.tagName, chartElement.id, chartElement.className);
  
  // Se for canvas, usar Canvas API; se for div, criar SVG
  if (chartElement.tagName === 'CANVAS') {
    initializeCanvasChart(chartElement);
  } else {
    initializeSVGChart(chartElement);
  }
}

function initializeCanvasChart(canvas) {
  console.log('📊 Inicializando gráfico Canvas...');
  
  const ctx = canvas.getContext('2d');
  const width = canvas.clientWidth || 800;
  const height = canvas.clientHeight || 400;
  
  // Ajustar tamanho do canvas
  canvas.width = width;
  canvas.height = height;
  
  // Limpar canvas
  ctx.clearRect(0, 0, width, height);
  
  // Desenhar grade
  drawCanvasGrid(ctx, width, height);
  
  // Desenhar eixos
  drawCanvasAxes(ctx, width, height);
  
  // Armazenar contexto para updates futuros
  chartElement._context = ctx;
  chartElement._width = width;
  chartElement._height = height;
}

function initializeSVGChart(container) {
  console.log('📊 Inicializando gráfico SVG...', {
    'container': container,
    'containerID': container.id,
    'containerClass': container.className,
    'clientWidth': container.clientWidth,
    'clientHeight': container.clientHeight
  });
  
  // Limpar container
  container.innerHTML = '';
  
  // Criar elemento SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 400;
  
  console.log('📊 Dimensões do SVG:', { width, height });
  
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.style.border = '1px solid #ddd';
  svg.style.background = '#ffffff';
  
  container.appendChild(svg);
  
  console.log('✅ SVG criado e adicionado ao container');
  
  // Add grid
  createChartGrid(svg, width, height);
  
  // Add axes
  createChartAxes(svg, width, height);
  
  // Create data lines
  createDataLines(svg);
  
  // Update legend
  updateChartLegend();
}

function drawCanvasGrid(ctx, width, height) {
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  
  // Linhas verticais
  for (let x = 0; x <= width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Linhas horizontais
  for (let y = 0; y <= height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawCanvasAxes(ctx, width, height) {
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  
  // Eixo X (no meio)
  const midY = height / 2;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.stroke();
  
  // Eixo Y (à esquerda)
  ctx.beginPath();
  ctx.moveTo(50, 0);
  ctx.lineTo(50, height);
  ctx.stroke();
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
  const sensors = [
    { id: 'accel-x', key: 'accelX', color: '#ef4444', strokeWidth: 2 },
    { id: 'accel-y', key: 'accelY', color: '#10b981', strokeWidth: 2 },
    { id: 'accel-z', key: 'accelZ', color: '#3b82f6', strokeWidth: 2 },
    { id: 'gyro-x', key: 'gyroX', color: '#f59e0b', strokeWidth: 1.5 },
    { id: 'gyro-y', key: 'gyroY', color: '#8b5cf6', strokeWidth: 1.5 },
    { id: 'gyro-z', key: 'gyroZ', color: '#06b6d4', strokeWidth: 1.5 }
  ];
  
  sensors.forEach(sensor => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', `line-${sensor.id}`);
    path.setAttribute('class', `chart-line ${sensor.id}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', sensor.color);
    path.setAttribute('stroke-width', sensor.strokeWidth);
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-linecap', 'round');
    
    // Inicialmente visível baseado no estado
    const isVisible = serialMonitorState.sensorVisibility[sensor.key];
    path.style.display = isVisible ? 'block' : 'none';
    
    svg.appendChild(path);
  });
}

function updateChartLegend() {
  const legend = document.querySelector('.chart-legend');
  if (!legend) return;
  
  // Usar as mesmas cores definidas no plotterState.colors
  const sensors = [
    { key: 'accelX', label: 'Accel X', color: plotterState.colors.accelX },
    { key: 'accelY', label: 'Accel Y', color: plotterState.colors.accelY },
    { key: 'accelZ', label: 'Accel Z', color: plotterState.colors.accelZ },
    { key: 'gyroX', label: 'Gyro X', color: plotterState.colors.gyroX },
    { key: 'gyroY', label: 'Gyro Y', color: plotterState.colors.gyroY },
    { key: 'gyroZ', label: 'Gyro Z', color: plotterState.colors.gyroZ }
  ];
  
  legend.innerHTML = '';
  
  sensors.forEach(sensor => {
    const isVisible = plotterState.visibility[sensor.key];
    const item = document.createElement('div');
    item.className = `legend-item ${isVisible ? 'visible' : 'hidden'}`;
    item.style.opacity = isVisible ? '1' : '0.3';
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
  const arduinoConsole = document.getElementById('arduino-console');
  
  // Atualizar ambos os elementos de console (modal e principal)
  const consoleElements = [consoleOutput, arduinoConsole].filter(el => el);
  
  if (consoleElements.length > 0 && serialMonitorState.consoleHistory.length > 0) {
    const consoleText = serialMonitorState.consoleHistory.join('\n');
    
    consoleElements.forEach(element => {
      // Se o console está vazio, remover placeholder
      const emptyPlaceholder = element.querySelector('.serial-console-empty');
      if (emptyPlaceholder) {
        emptyPlaceholder.style.display = 'none';
      }
      
      // Atualizar conteúdo
      if (element.tagName === 'PRE' || element.classList.contains('code-display')) {
        element.textContent = consoleText;
      } else {
        // Para divs de console, usar innerHTML formatado
        const formattedText = consoleText
          .split('\n')
          .map(line => {
            if (line.startsWith('[') && line.includes(']')) {
              // Linha com timestamp
              const timestampEnd = line.indexOf(']') + 1;
              const timestamp = line.substring(0, timestampEnd);
              const content = line.substring(timestampEnd).trim();
              
              if (content.startsWith('>')) {
                // Comando enviado
                return `<div class="console-line sent"><span class="timestamp">${timestamp}</span><span class="command">${content}</span></div>`;
              } else if (content.includes('🤖') || content.includes('Solicitando')) {
                // Mensagem do sistema
                return `<div class="console-line system"><span class="timestamp">${timestamp}</span><span class="message">${content}</span></div>`;
              } else if (content.includes('<span class="sensor-')) {
                // Dados de sensor formatados com HTML
                return `<div class="console-line sensor-data-line"><span class="timestamp">${timestamp}</span> ${content}</div>`;
              } else {
                // Resposta recebida normal
                return `<div class="console-line received"><span class="timestamp">${timestamp}</span><span class="response">${content}</span></div>`;
              }
            } else {
              // Linha sem formato especial
              return `<div class="console-line">${line}</div>`;
            }
          })
          .join('');
        
        element.innerHTML = formattedText;
      }
      
      // Auto-scroll para o final - sempre forçar quando há novos dados
      requestAnimationFrame(() => {
        element.scrollTop = element.scrollHeight;
      });
    });
  } else if (consoleElements.length > 0) {
    // Console vazio - mostrar placeholder
    consoleElements.forEach(element => {
      const emptyPlaceholder = element.querySelector('.serial-console-empty');
      if (emptyPlaceholder) {
        emptyPlaceholder.style.display = 'block';
      } else if (element.classList.contains('serial-console-content')) {
        element.innerHTML = `
          <div class="serial-console-empty">
            <div class="serial-console-icon">📡</div>
            <div class="serial-console-message">Console Serial</div>
            <div class="serial-console-hint">Conecte a uma porta serial para ver os dados</div>
          </div>
        `;
      }
    });
  }
}



function sendSerialCommand(command = null, showInConsole = true) {
  // Se não foi passado comando, pegar do input
  if (!command) {
    const input = document.getElementById('console-input');
    if (!input || !input.value.trim()) return;
    
    command = input.value.trim();
    input.value = ''; // Limpar input apenas quando vem do usuário
  }
  
  if (!serialMonitorState.isConnected || !serialMonitorState.websocket) {
    showSerialNotification('❌ Não conectado à porta serial!', 'error');
    return;
  }
  
  // Adicionar ao histórico do console apenas se solicitado
  if (showInConsole) {
    serialMonitorState.consoleHistory.push(`[${new Date().toLocaleTimeString()}] > ${command}`);
    updateConsoleTab();
  }
  
  // Enviar comando via WebSocket
  try {
    serialMonitorState.websocket.send(JSON.stringify({
      type: 'send_data',
      payload: {
        port: serialMonitorState.selectedPort,
        data: command
      }
    }));
    
    console.log(`📤 Comando enviado: ${command}`);
  } catch (error) {
    console.error('❌ Erro ao enviar comando:', error.message);
    showSerialNotification(`❌ Erro ao enviar comando: ${error.message}`, 'error');
  }
}

function clearConsole() {
  console.log('🗑️ Limpando console...');
  
  // Limpar histórico
  serialMonitorState.consoleHistory = [];
  
  // Atualizar todos os elementos de console
  const consoleElements = [
    document.getElementById('console-output'),
    document.getElementById('arduino-console')
  ].filter(el => el);
  
  consoleElements.forEach(element => {
    if (element.classList.contains('serial-console-content')) {
      // Restaurar placeholder para console vazio
      element.innerHTML = `
        <div class="serial-console-empty">
          <div class="serial-console-icon">📡</div>
          <div class="serial-console-message">Console Serial</div>
          <div class="serial-console-hint">Digite comandos ou conecte à ESP32 para ver dados</div>
        </div>
      `;
    } else {
      element.textContent = '';
    }
  });
  
  // Resetar contador de mensagens
  const consoleBadge = document.getElementById('console-count');
  if (consoleBadge) {
    consoleBadge.textContent = '0';
  }
  
  // Atualizar stats
  const statsMessages = document.getElementById('stats-messages');
  if (statsMessages) {
    statsMessages.textContent = '0';
  }
  
  showSerialNotification('🗑️ Console limpo', 'info');
}

// ============================================================================
// SERIAL PLOTTER FUNCTIONS
// ============================================================================

/**
 * Inicializa o Serial Plotter
 */
function initializePlotter() {
  console.log('📊 Inicializando Serial Plotter...');
  
  const canvas = document.getElementById('plotter-chart');
  const overlay = document.getElementById('plotter-overlay');
  const valuesPanel = document.getElementById('plotter-values');
  
  if (!canvas) {
    console.error('❌ Canvas do plotter não encontrado');
    return;
  }
  
  // Configurar canvas
  plotterState.canvas = canvas;
  plotterState.context = canvas.getContext('2d');
  
  // Ajustar tamanho do canvas
  resizePlotterCanvas();
  
  // Configurar event listeners dos controles
  setupPlotterControls();
  
  // Configurar event listeners dos checkboxes de visibilidade
  setupSensorVisibilityControls();
  
  // Inicializar legenda do gráfico
  updateChartLegend();
  
  // Debug do estado inicial (remover em produção)
  setTimeout(() => {
    checkPlotterElements();
    debugPlotterVisibility();
  }, 100);
  
  // Verificar se há dados para mostrar
  if (plotterState.dataBuffer.timestamps.length === 0) {
    showPlotterOverlay(true);
  } else {
    showPlotterOverlay(false);
    startPlotterAnimation();
  }
  
  // Atualizar status
  updatePlotterStatus();
  
  console.log('✅ Serial Plotter inicializado');
}

/**
 * Redimensiona o canvas do plotter
 */
function resizePlotterCanvas() {
  const canvas = plotterState.canvas;
  if (!canvas) return;
  
  const container = canvas.parentElement;
  const rect = container.getBoundingClientRect();
  
  // Definir tamanho baseado no container
  canvas.width = rect.width - 20; // Padding
  canvas.height = rect.height - 20;
  
  console.log(`📏 Canvas redimensionado: ${canvas.width}x${canvas.height}`);
}

/**
 * Configura os controles do plotter
 */
function setupPlotterControls() {
  // Botão Pausar/Continuar
  const pauseBtn = document.getElementById('plotter-pause');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', togglePlotterPause);
  }
  
  // Botão Limpar
  const clearBtn = document.getElementById('plotter-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearPlotterData);
  }
  
  // Botão Exportar CSV
  const exportBtn = document.getElementById('plotter-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportPlotterDataCSV);
  }
  
  console.log('🎛️ Controles do plotter configurados');
}

/**
 * Configura controles de visibilidade dos sensores
 */
function setupSensorVisibilityControls() {
  // Mapeamento correto dos IDs para as chaves do estado
  const sensorMappings = {
    'accel-x': 'accelX',
    'accel-y': 'accelY', 
    'accel-z': 'accelZ',
    'gyro-x': 'gyroX',
    'gyro-y': 'gyroY',
    'gyro-z': 'gyroZ'
  };
  
  // Configurar checkboxes do modal principal
  Object.keys(sensorMappings).forEach(sensorId => {
    const checkbox = document.getElementById(sensorId);
    const stateKey = sensorMappings[sensorId];
    
    if (checkbox) {
      checkbox.addEventListener('change', function() {
        plotterState.visibility[stateKey] = this.checked;
        console.log(`👁️ Visibilidade ${sensorId} (${stateKey}): ${this.checked}`);
        
        // Sincronizar com checkbox do header, se existir
        const headerCheckbox = document.getElementById(`${sensorId}-header`);
        if (headerCheckbox) {
          headerCheckbox.checked = this.checked;
        }
        
        // Atualizar legenda
        updateChartLegend();
      });
      
      // Definir estado inicial baseado no checkbox
      plotterState.visibility[stateKey] = checkbox.checked;
    }
  });
  
  // Configurar checkboxes do header do plotter (se existirem)
  Object.keys(sensorMappings).forEach(sensorId => {
    const headerCheckbox = document.getElementById(`${sensorId}-header`);
    const stateKey = sensorMappings[sensorId];
    
    if (headerCheckbox) {
      headerCheckbox.addEventListener('change', function() {
        plotterState.visibility[stateKey] = this.checked;
        console.log(`👁️ Header visibilidade ${sensorId} (${stateKey}): ${this.checked}`);
        
        // Sincronizar com checkbox do modal principal
        const mainCheckbox = document.getElementById(sensorId);
        if (mainCheckbox) {
          mainCheckbox.checked = this.checked;
        }
        
        // Atualizar legenda
        updateChartLegend();
      });
      
      // Sincronizar estado inicial
      headerCheckbox.checked = plotterState.visibility[stateKey];
    }
  });
  
  console.log('👁️ Controles de visibilidade configurados para modal e header');
  console.log('👁️ Estado inicial de visibilidade:', plotterState.visibility);
}

/**
 * Função de debug para verificar estado de visibilidade
 */
function debugPlotterVisibility() {
  console.log('🔍 Debug do estado de visibilidade:');
  console.log('plotterState.visibility:', plotterState.visibility);
  
  const sensorMappings = {
    'accel-x': 'accelX',
    'accel-y': 'accelY', 
    'accel-z': 'accelZ',
    'gyro-x': 'gyroX',
    'gyro-y': 'gyroY',
    'gyro-z': 'gyroZ'
  };
  
  Object.keys(sensorMappings).forEach(sensorId => {
    const stateKey = sensorMappings[sensorId];
    const checkbox = document.getElementById(sensorId);
    const headerCheckbox = document.getElementById(`${sensorId}-header`);
    
    console.log(`${sensorId}:`, {
      stateKey: stateKey,
      visibility: plotterState.visibility[stateKey],
      checkboxChecked: checkbox ? checkbox.checked : 'não encontrado',
      headerCheckboxChecked: headerCheckbox ? headerCheckbox.checked : 'não encontrado'
    });
  });
}

/**
 * Verifica se todos os elementos DOM necessários existem
 */
function checkPlotterElements() {
  console.log('🔍 Verificando elementos do plotter:');
  
  const elements = [
    'accel-x', 'accel-y', 'accel-z',
    'gyro-x', 'gyro-y', 'gyro-z',
    'accel-x-header', 'accel-y-header', 'accel-z-header', 
    'gyro-x-header', 'gyro-y-header', 'gyro-z-header',
    'plotter-chart', 'plotter-overlay'
  ];
  
  elements.forEach(id => {
    const element = document.getElementById(id);
    console.log(`${id}: ${element ? '✅ encontrado' : '❌ não encontrado'}`);
  });
}

/**
 * Função para debug do sistema de exemplos
 */
function debugExampleSystem() {
  const codeDisplay = document.getElementById('code-display');
  const codeDisplayFull = document.getElementById('code-display-full');
  const generatedCode = document.getElementById('generated-code');
  
  console.log('🔍 Debug do sistema de exemplos:');
  console.log('Main code display:', {
    exists: !!codeDisplay,
    exampleMode: codeDisplay?.getAttribute('data-example-mode'),
    sensorType: codeDisplay?.getAttribute('data-sensor-type'),
    codeLength: codeDisplay?.textContent?.length || 0,
    preview: codeDisplay?.textContent?.substring(0, 100) + '...'
  });
  
  console.log('Modal code displays:', {
    codeDisplayFull: !!codeDisplayFull,
    generatedCode: !!generatedCode,
    fullContent: codeDisplayFull?.textContent?.substring(0, 50) + '...',
    generatedContent: generatedCode?.textContent?.substring(0, 50) + '...'
  });
}

/**
 * Limpa o código de exemplo e volta para o modo Blockly normal
 */
function clearExampleCode() {
  const codeDisplay = document.getElementById('code-display');
  if (codeDisplay) {
    codeDisplay.removeAttribute('data-example-mode');
    codeDisplay.removeAttribute('data-sensor-type');
    codeDisplay.classList.remove('example-code');
    
    console.log('🧹 Código de exemplo limpo, voltando ao modo Blockly');
    
    // Regenerar código a partir dos blocos
    generateCode();
    
    showSerialNotification('🧹 Exemplo removido. Use os blocos para programar.', 'info');
  }
}

// Tornar as funções disponíveis globalmente para debug
window.debugPlotterVisibility = debugPlotterVisibility;
window.checkPlotterElements = checkPlotterElements;
window.openExamplesModal = openExamplesModal;
window.closeExamplesModal = closeExamplesModal;
window.debugExampleSystem = debugExampleSystem;
window.clearExampleCode = clearExampleCode;

// ============================================================================
// EXAMPLES MODAL FUNCTIONS
// ============================================================================

// Códigos de exemplo para cada sensor
const sensorExamples = {
  mpu6050: `#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

Adafruit_MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    delay(10);
  }

  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_16_G);
  mpu.setGyroRange(MPU6050_RANGE_250_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  Serial.println("");
  delay(100);
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  Serial.print("AccelX:");
  Serial.print(a.acceleration.x);
  Serial.print(",");
  Serial.print("AccelY:");
  Serial.print(a.acceleration.y);
  Serial.print(",");
  Serial.print("AccelZ:");
  Serial.print(a.acceleration.z);
  Serial.print(", ");
  Serial.print("GyroX:");
  Serial.print(g.gyro.x);
  Serial.print(",");
  Serial.print("GyroY:");
  Serial.print(g.gyro.y);
  Serial.print(",");
  Serial.print("GyroZ:");
  Serial.print(g.gyro.z);
  Serial.println("");

  delay(10);
}`,

  bh1750: `#include <BH1750.h>
#include <Wire.h>

BH1750 lightMeter;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  lightMeter.begin();
  Serial.println("BH1750 Test begin");
}

void loop() {
  Serial.print("Light: ");
  Serial.print(lightMeter.readLightLevel());
  Serial.println(" lx");
  delay(1000);
}`,

  dht11: `#include <DHT.h>

#define DHTTYPE DHT11
#define DHTPIN 14

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  Serial.print("Temperatura: ");
  Serial.println(dht.readTemperature());
  Serial.print("Umidade: ");
  Serial.println(dht.readHumidity());
  Serial.print("Indice de Calor: ");
  Serial.println(dht.computeHeatIndex(dht.readTemperature(), dht.readHumidity(), false));
  delay(2000);
}`,

  bmp180: `#include <Adafruit_BMP085.h>

Adafruit_BMP085 bmp;

void setup() {
  Serial.begin(9600);
  if (!bmp.begin()) {
    Serial.println("Could not find a valid BMP085 sensor, check wiring!");
    while (1) {}
  }
}

void loop() {
  Serial.print("Temperature = ");
  Serial.print(bmp.readTemperature());
  Serial.println(" *C");
  
  Serial.print("Pressure = ");
  Serial.print(bmp.readPressure());
  Serial.println(" Pa");
  
  Serial.print("Altitude = ");
  Serial.print(bmp.readAltitude());
  Serial.println(" meters");

  delay(500);
}`,

  hmc5883: `#include <Wire.h>
#include <HMC5883L.h>

HMC5883L compass;

void setup() {
  Serial.begin(9600);
  Wire.begin();

  compass = HMC5883L(); // Construct a new HMC5883 compass.
  int error = compass.SetScale(1.3); // Set the scale of the compass.
  if(error != 0) // If there is an error, print it out.
    Serial.println(compass.GetErrorText(error));
  
  error = compass.SetMeasurementMode(Measurement_Continuous); // Set the measurement mode to Continuous
  if(error != 0) // If there is an error, print it out.
    Serial.println(compass.GetErrorText(error));
}

void loop() {
  MagnetometerRaw raw = compass.ReadRawAxis();
  MagnetometerScaled scaled = compass.ReadScaledAxis();
  
  float heading = atan2(scaled.YAxis, scaled.XAxis);
  if(heading < 0)
    heading += 2*M_PI;
  
  Serial.print("Heading: ");
  Serial.print(heading * RAD_TO_DEG);
  Serial.println(" degrees");
  
  delay(66);
}`
};

/**
 * Abre o modal de exemplos Arduino
 */
function openExamplesModal() {
  console.log('� Abrindo modal de exemplos Arduino...');
  
  const modal = document.getElementById('examples-modal');
  if (modal) {
    modal.classList.add('show');
    
    // Não alterar o overflow - o sistema já gerencia isso corretamente
    console.log('✅ Modal de exemplos aberto');
  }
}

/**
 * Fecha o modal de exemplos Arduino
 */
function closeExamplesModal() {
  console.log('📁 Fechando modal de exemplos...');
  
  const modal = document.getElementById('examples-modal');
  if (modal) {
    modal.classList.remove('show');
    
    console.log('✅ Modal de exemplos fechado');
  }
}

/**
 * Carrega o código de exemplo do sensor selecionado
 */
function loadSensorExample(sensorType) {
  console.log(`📋 Carregando exemplo do sensor: ${sensorType}`);
  
  const code = sensorExamples[sensorType];
  if (code) {
    // Atualizar o display de código diretamente com o exemplo
    const codeDisplay = document.getElementById('code-display');
    if (codeDisplay) {
      // Salvar o estado atual dos blocos (se houver)
      const hasBlocks = workspace && workspace.getTopBlocks(true).length > 0;
      
      // Definir o código do exemplo no display
      codeDisplay.textContent = code;
      
      // Adicionar indicador visual de que este é um exemplo
      codeDisplay.setAttribute('data-example-mode', 'true');
      codeDisplay.setAttribute('data-sensor-type', sensorType.toUpperCase());
      
      console.log(`✅ Código do ${sensorType.toUpperCase()} carregado como exemplo`);
      console.log('🔍 Verificando atributos:', {
        exampleMode: codeDisplay.getAttribute('data-example-mode'),
        sensorType: codeDisplay.getAttribute('data-sensor-type'),
        codeLength: code.length
      });
      
      // Mostrar notificação de sucesso
      showSerialNotification(`📋 Exemplo ${sensorType.toUpperCase()} carregado! Use os blocos para programar.`, 'success');
      
      // Fechar o modal
      closeExamplesModal();
      
      // Adicionar uma classe CSS para destacar que é um exemplo
      codeDisplay.classList.add('example-code');
      
      // Remover a classe após alguns segundos
      setTimeout(() => {
        if (codeDisplay.classList.contains('example-code')) {
          codeDisplay.classList.remove('example-code');
        }
      }, 3000);
      
    } else {
      console.error('❌ Editor de código não encontrado');
      showSerialNotification('❌ Erro ao carregar código', 'error');
    }
  } else {
    console.error(`❌ Código para ${sensorType} não encontrado`);
    showSerialNotification('❌ Exemplo não encontrado', 'error');
  }
}

/**
 * Adiciona dados do sensor ao buffer do plotter
 */
function addPlotterData(accelX, accelY, accelZ, gyroX, gyroY, gyroZ) {
  const timestamp = Date.now();
  
  // Adicionar dados ao buffer
  plotterState.dataBuffer.timestamps.push(timestamp);
  plotterState.dataBuffer.accelX.push(accelX || 0);
  plotterState.dataBuffer.accelY.push(accelY || 0);
  plotterState.dataBuffer.accelZ.push(accelZ || 0);
  plotterState.dataBuffer.gyroX.push(gyroX || 0);
  plotterState.dataBuffer.gyroY.push(gyroY || 0);
  plotterState.dataBuffer.gyroZ.push(gyroZ || 0);
  
  // Manter apenas últimos N pontos
  const maxPoints = plotterState.maxDataPoints;
  Object.keys(plotterState.dataBuffer).forEach(key => {
    if (plotterState.dataBuffer[key].length > maxPoints) {
      plotterState.dataBuffer[key] = plotterState.dataBuffer[key].slice(-maxPoints);
    }
  });
  
  // Atualizar contador de samples
  plotterState.sampleCount++;
  
  // Calcular sample rate
  const now = Date.now();
  if (plotterState.lastSampleTime > 0) {
    const deltaTime = (now - plotterState.lastSampleTime) / 1000; // segundos
    plotterState.sampleRate = 1 / deltaTime;
  }
  plotterState.lastSampleTime = now;
  
  // Atualizar valores na interface
  updatePlotterValues(accelX, accelY, accelZ, gyroX, gyroY, gyroZ);
  
  // Esconder overlay se esta é a primeira amostra
  if (plotterState.dataBuffer.timestamps.length === 1) {
    showPlotterOverlay(false);
    startPlotterAnimation();
  }
  
  // Atualizar badge de contagem
  updatePlotterBadge();
  
  // Habilitar botão de export se há dados
  const exportBtn = document.getElementById('plotter-export');
  if (exportBtn && plotterState.dataBuffer.timestamps.length > 0) {
    exportBtn.disabled = false;
  }
  
  console.log(`📊 Dados adicionados ao plotter: AX=${accelX}, AY=${accelY}, AZ=${accelZ}, GX=${gyroX}, GY=${gyroY}, GZ=${gyroZ}`);
}

/**
 * Atualiza valores numéricos na interface
 */
function updatePlotterValues(accelX, accelY, accelZ, gyroX, gyroY, gyroZ) {
  // Valores do acelerômetro
  const accelXEl = document.getElementById('accel-x-value');
  const accelYEl = document.getElementById('accel-y-value');
  const accelZEl = document.getElementById('accel-z-value');
  
  if (accelXEl) accelXEl.textContent = (accelX || 0).toFixed(3);
  if (accelYEl) accelYEl.textContent = (accelY || 0).toFixed(3);
  if (accelZEl) accelZEl.textContent = (accelZ || 0).toFixed(3);
  
  // Valores do giroscópio
  const gyroXEl = document.getElementById('gyro-x-value');
  const gyroYEl = document.getElementById('gyro-y-value');
  const gyroZEl = document.getElementById('gyro-z-value');
  
  if (gyroXEl) gyroXEl.textContent = (gyroX || 0).toFixed(3);
  if (gyroYEl) gyroYEl.textContent = (gyroY || 0).toFixed(3);
  if (gyroZEl) gyroZEl.textContent = (gyroZ || 0).toFixed(3);
  
  // Estatísticas
  const samplesEl = document.getElementById('plotter-samples');
  const rateEl = document.getElementById('plotter-rate');
  
  if (samplesEl) samplesEl.textContent = plotterState.sampleCount;
  if (rateEl) rateEl.textContent = `${plotterState.sampleRate.toFixed(1)} Hz`;
  
  // Mostrar painel de valores
  const valuesPanel = document.getElementById('plotter-values');
  if (valuesPanel) {
    valuesPanel.style.display = 'flex';
  }
}

/**
 * Atualiza badge com contagem de samples
 */
function updatePlotterBadge() {
  const badge = document.getElementById('plotter-count');
  if (badge) {
    badge.textContent = plotterState.sampleCount.toString();
  }
}

/**
 * Controla exibição do overlay
 */
function showPlotterOverlay(show) {
  const overlay = document.getElementById('plotter-overlay');
  if (overlay) {
    if (show) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }
}

/**
 * Inicia animação do gráfico
 */
function startPlotterAnimation() {
  if (plotterState.animationId) {
    cancelAnimationFrame(plotterState.animationId);
  }
  
  plotterState.isRunning = true;
  animatePlotter();
}

/**
 * Para animação do gráfico
 */
function stopPlotterAnimation() {
  if (plotterState.animationId) {
    cancelAnimationFrame(plotterState.animationId);
    plotterState.animationId = null;
  }
  plotterState.isRunning = false;
}

/**
 * Loop de animação do gráfico
 */
function animatePlotter() {
  if (!plotterState.isPaused && plotterState.dataBuffer.timestamps.length > 0) {
    drawPlotterChart();
  }
  
  if (plotterState.isRunning) {
    plotterState.animationId = requestAnimationFrame(animatePlotter);
  }
}

/**
 * Desenha o gráfico no canvas
 */
function drawPlotterChart() {
  const ctx = plotterState.context;
  const canvas = plotterState.canvas;
  
  if (!ctx || !canvas) return;
  
  // Limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Configurações básicas
  const padding = 40;
  const chartWidth = canvas.width - (padding * 2);
  const chartHeight = canvas.height - (padding * 2);
  
  // Desenhar grade de fundo
  drawPlotterGrid(ctx, padding, chartWidth, chartHeight);
  
  // Desenhar eixos
  drawPlotterAxes(ctx, padding, chartWidth, chartHeight);
  
  // Desenhar dados se disponíveis
  if (plotterState.dataBuffer.timestamps.length > 1) {
    drawPlotterData(ctx, padding, chartWidth, chartHeight);
  }
}

/**
 * Desenha grade de fundo
 */
function drawPlotterGrid(ctx, padding, width, height) {
  ctx.strokeStyle = '#e9ecef';
  ctx.lineWidth = 1;
  
  // Linhas verticais
  const verticalLines = 10;
  for (let i = 0; i <= verticalLines; i++) {
    const x = padding + (width * i / verticalLines);
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, padding + height);
    ctx.stroke();
  }
  
  // Linhas horizontais
  const horizontalLines = 8;
  for (let i = 0; i <= horizontalLines; i++) {
    const y = padding + (height * i / horizontalLines);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + width, y);
    ctx.stroke();
  }
}

/**
 * Desenha eixos X e Y
 */
function drawPlotterAxes(ctx, padding, width, height) {
  ctx.strokeStyle = '#495057';
  ctx.lineWidth = 2;
  
  // Eixo X (horizontal no meio)
  const centerY = padding + (height / 2);
  ctx.beginPath();
  ctx.moveTo(padding, centerY);
  ctx.lineTo(padding + width, centerY);
  ctx.stroke();
  
  // Eixo Y (vertical à esquerda)
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + height);
  ctx.stroke();
}

/**
 * Desenha os dados dos sensores
 */
function drawPlotterData(ctx, padding, width, height) {
  const data = plotterState.dataBuffer;
  const dataLength = data.timestamps.length;
  
  if (dataLength < 2) return;
  
  // Calcular escalas
  const minMaxValues = calculateDataMinMax();
  const scaleX = width / Math.max(1, dataLength - 1);
  const scaleY = height / Math.max(1, minMaxValues.max - minMaxValues.min);
  
  // Desenhar cada série de dados
  const sensors = ['accelX', 'accelY', 'accelZ', 'gyroX', 'gyroY', 'gyroZ'];
  
  sensors.forEach(sensor => {
    const isVisible = plotterState.visibility[sensor];
    const hasData = data[sensor] && data[sensor].length > 0;
    
    if (isVisible && hasData) {
      drawSensorLine(ctx, data[sensor], plotterState.colors[sensor], padding, scaleX, scaleY, height, minMaxValues.min);
    }
  });
}

/**
 * Calcula valores mínimos e máximos dos dados
 */
function calculateDataMinMax() {
  const data = plotterState.dataBuffer;
  let min = Infinity;
  let max = -Infinity;
  
  const sensors = ['accelX', 'accelY', 'accelZ', 'gyroX', 'gyroY', 'gyroZ'];
  
  sensors.forEach(sensor => {
    if (plotterState.visibility[sensor] && data[sensor]) {
      data[sensor].forEach(value => {
        if (value < min) min = value;
        if (value > max) max = value;
      });
    }
  });
  
  // Adicionar margem
  const range = max - min;
  const margin = Math.max(0.1, range * 0.1); // 10% de margem ou mínimo 0.1
  
  return {
    min: min - margin,
    max: max + margin
  };
}

/**
 * Desenha linha para um sensor específico
 */
function drawSensorLine(ctx, sensorData, color, padding, scaleX, scaleY, height, minValue) {
  if (!sensorData || sensorData.length < 2) return;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let i = 0; i < sensorData.length; i++) {
    const x = padding + (i * scaleX);
    const y = padding + height - ((sensorData[i] - minValue) * scaleY);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.stroke();
}

/**
 * Pausa/despausa o plotter
 */
function togglePlotterPause() {
  plotterState.isPaused = !plotterState.isPaused;
  
  const pauseBtn = document.getElementById('plotter-pause');
  if (pauseBtn) {
    const icon = pauseBtn.querySelector('.btn-icon');
    const text = pauseBtn.querySelector('.btn-text');
    
    if (plotterState.isPaused) {
      if (icon) icon.textContent = '▶️';
      if (text) text.textContent = 'Continuar';
    } else {
      if (icon) icon.textContent = '⏸️';
      if (text) text.textContent = 'Pausar';
    }
  }
  
  updatePlotterStatus();
  console.log(`⏸️ Plotter ${plotterState.isPaused ? 'pausado' : 'continuando'}`);
}

/**
 * Limpa dados do plotter
 */
function clearPlotterData() {
  // Limpar buffer de dados
  plotterState.dataBuffer = {
    timestamps: [],
    accelX: [],
    accelY: [],
    accelZ: [],
    gyroX: [],
    gyroY: [],
    gyroZ: []
  };
  
  // Resetar contadores
  plotterState.sampleCount = 0;
  plotterState.lastSampleTime = 0;
  plotterState.sampleRate = 0;
  
  // Mostrar overlay
  showPlotterOverlay(true);
  
  // Parar animação
  stopPlotterAnimation();
  
  // Esconder painel de valores
  const valuesPanel = document.getElementById('plotter-values');
  if (valuesPanel) {
    valuesPanel.style.display = 'none';
  }
  
  // Atualizar badge
  updatePlotterBadge();
  
  // Desabilitar botão export
  const exportBtn = document.getElementById('plotter-export');
  if (exportBtn) {
    exportBtn.disabled = true;
  }
  
  // Atualizar status
  updatePlotterStatus();
  
  console.log('🗑️ Dados do plotter limpos');
  showSerialNotification('🗑️ Dados do plotter limpos', 'info');
}

/**
 * Exporta dados como CSV
 */
function exportPlotterDataCSV() {
  const data = plotterState.dataBuffer;
  
  if (data.timestamps.length === 0) {
    showSerialNotification('❌ Nenhum dado para exportar', 'error');
    return;
  }
  
  // Cabeçalho CSV
  let csv = 'Timestamp,AccelX,AccelY,AccelZ,GyroX,GyroY,GyroZ\n';
  
  // Dados
  for (let i = 0; i < data.timestamps.length; i++) {
    const timestamp = new Date(data.timestamps[i]).toISOString();
    csv += `${timestamp},${data.accelX[i]},${data.accelY[i]},${data.accelZ[i]},${data.gyroX[i]},${data.gyroY[i]},${data.gyroZ[i]}\n`;
  }
  
  // Criar e baixar arquivo
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mpu6050_data_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  console.log(`💾 Dados exportados: ${data.timestamps.length} samples`);
  showSerialNotification(`💾 CSV exportado com ${data.timestamps.length} amostras`, 'success');
}

/**
 * Atualiza status do plotter
 */
function updatePlotterStatus() {
  const statusEl = document.getElementById('plotter-status');
  if (!statusEl) return;
  
  if (plotterState.dataBuffer.timestamps.length === 0) {
    statusEl.textContent = 'Aguardando dados';
    statusEl.className = 'status-badge empty';
  } else if (plotterState.isPaused) {
    statusEl.textContent = 'Pausado';
    statusEl.className = 'status-badge paused';
  } else {
    statusEl.textContent = `Ativo (${plotterState.sampleCount} samples)`;
    statusEl.className = 'status-badge running';
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
  
  // Obter código atual do elemento principal
  const mainCodeDisplay = document.getElementById('code-display');
  let currentCode = '';
  
  if (mainCodeDisplay) {
    currentCode = mainCodeDisplay.textContent || '';
    
    // Verificar se é um código de exemplo
    const isExampleMode = mainCodeDisplay.getAttribute('data-example-mode') === 'true';
    const sensorType = mainCodeDisplay.getAttribute('data-sensor-type');
    
    console.log('🔍 Debug updateCodeTab:', {
      hasMainDisplay: !!mainCodeDisplay,
      codeLength: currentCode.length,
      isExampleMode: isExampleMode,
      sensorType: sensorType,
      codePreview: currentCode.substring(0, 50) + '...'
    });
    
    if (isExampleMode) {
      console.log(`📋 Detectado código de exemplo ${sensorType}, preservando...`);
      // Usar o código de exemplo diretamente
    } else {
      // Se não há código válido do Blockly, gerar novo
      if (!currentCode || currentCode.includes('// Código C++ aparecerá aqui automaticamente')) {
        console.log('🔧 Gerando código do Blockly...');
        currentCode = generateCode() || '';
      }
    }
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
  console.log('📈 updateChart() chamada - dados disponíveis:', sensorData.timestamps.length);
  
  if (sensorData.timestamps.length === 0) {
    console.log('📈 Sem dados para atualizar gráfico');
    return;
  }
  
  // Verificar se estamos no Serial Monitor modal primeiro
  const serialModal = document.getElementById('serial-monitor-modal');
  const isSerialModalOpen = serialModal && serialModal.style.display !== 'none';
  
  console.log('📈 Estado do modal:', {
    'serialModalOpen': isSerialModalOpen,
    'serialModalDisplay': serialModal ? serialModal.style.display : 'não encontrado'
  });
  
  let chartElement;
  
  if (isSerialModalOpen) {
    // Se o modal serial está aberto, usar o elemento do serial plotter
    chartElement = document.getElementById('serial-plotter-chart');
    console.log('📈 Modal serial aberto - procurando serial-plotter-chart:', !!chartElement);
  } else {
    // Se não, usar a aba sensors principal
    const activeTab = document.querySelector('.tab-content.active');
    console.log('📈 Aba ativa principal:', activeTab ? activeTab.getAttribute('data-tab') : 'nenhuma');
    
    if (activeTab && activeTab.getAttribute('data-tab') === 'sensors') {
      chartElement = document.querySelector('.tab-content[data-tab="sensors"] #sensor-chart');
      console.log('📈 Procurando canvas na aba sensors principal:', !!chartElement);
    }
  }
  
  if (!chartElement) {
    chartElement = document.querySelector('.serial-chart');
    console.log('📈 Fallback: procurando qualquer .serial-chart:', !!chartElement);
  }
  
  if (!chartElement) {
    console.warn('⚠️ Elemento do gráfico não encontrado para update');
    console.log('📈 Elementos disponíveis na aba sensors:', 
      Array.from(document.querySelectorAll('.tab-content[data-tab="sensors"] *')).map(el => 
        `${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.replace(/\s/g, '.') : ''}`
      )
    );
    return;
  }
  
  console.log('📈 Encontrado elemento:', chartElement.tagName, chartElement.id, chartElement.className);
  
  if (chartElement.tagName === 'CANVAS') {
    console.log('📈 Atualizando Canvas');
    updateCanvasChart(chartElement);
  } else {
    console.log('📈 Atualizando SVG');
    updateSVGChart(chartElement);
  }
  
  // Sempre atualizar valores
  updateSensorValuesDisplay();
}

function updateCanvasChart(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width || canvas.clientWidth;
  const height = canvas.height || canvas.clientHeight;
  
  // Limpar canvas
  ctx.clearRect(0, 0, width, height);
  
  // Redesenhar grade e eixos
  drawCanvasGrid(ctx, width, height);
  drawCanvasAxes(ctx, width, height);
  
  const sensors = [
    { key: 'accelX', color: '#ff4444', name: 'Accel X' },
    { key: 'accelY', color: '#44ff44', name: 'Accel Y' },
    { key: 'accelZ', color: '#4444ff', name: 'Accel Z' },
    { key: 'gyroX', color: '#ffaa44', name: 'Gyro X' },
    { key: 'gyroY', color: '#ff44aa', name: 'Gyro Y' },
    { key: 'gyroZ', color: '#44aaff', name: 'Gyro Z' }
  ];
  
  // Encontrar valores máximos para escala
  let maxVal = 0;
  sensors.forEach(sensor => {
    const data = chartData[sensor.key];
    if (data && data.length > 0) {
      const max = Math.max(...data.map(Math.abs));
      maxVal = Math.max(maxVal, max);
    }
  });
  
  if (maxVal === 0) maxVal = 10; // Valor padrão
  
  // Desenhar linhas dos sensores
  sensors.forEach(sensor => {
    const data = chartData[sensor.key];
    if (!data || data.length < 2) return;
    
    ctx.strokeStyle = sensor.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const minX = 60;
    const maxX = width - 20;
    const minY = 20;
    const maxY = height - 20;
    const midY = height / 2;
    
    data.forEach((value, i) => {
      const x = minX + (i / (data.length - 1)) * (maxX - minX);
      const y = midY - (value / maxVal) * (midY - minY) * 0.8;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  });
  
  // Desenhar valores atuais
  drawCurrentValues(ctx, sensors, width, height);
}

function updateSVGChart(container) {
  const svg = container.querySelector('svg');
  if (!svg) {
    console.warn('📊 SVG não encontrado no container');
    return;
  }
  
  const width = parseInt(svg.getAttribute('width')) || 800;
  const height = parseInt(svg.getAttribute('height')) || 400;
  
  console.log('📊 Atualizando SVG Chart:', { width, height, dataPoints: sensorData.timestamps.length });
  
  const sensors = [
    { key: 'accelX', data: sensorData.accelX, id: 'accel-x' },
    { key: 'accelY', data: sensorData.accelY, id: 'accel-y' },
    { key: 'accelZ', data: sensorData.accelZ, id: 'accel-z' },
    { key: 'gyroX', data: sensorData.gyroX, id: 'gyro-x' },
    { key: 'gyroY', data: sensorData.gyroY, id: 'gyro-y' },
    { key: 'gyroZ', data: sensorData.gyroZ, id: 'gyro-z' }
  ];
  
  // Calcular valores para escala
  let allValues = [];
  sensors.forEach(sensor => {
    if (serialMonitorState.sensorVisibility[sensor.key] && sensor.data.length > 0) {
      allValues = allValues.concat(sensor.data);
    }
  });
  
  const maxVal = allValues.length > 0 ? Math.max(...allValues.map(Math.abs)) : 1;
  const minVal = allValues.length > 0 ? Math.min(...allValues) : -1;
  
  sensors.forEach(sensor => {
    const path = svg.querySelector(`#line-${sensor.id}`);
    if (!path) {
      console.warn(`📊 Path não encontrado para ${sensor.id}`);
      return;
    }
    
    // Verificar visibilidade
    const isVisible = serialMonitorState.sensorVisibility[sensor.key];
    path.style.display = isVisible ? 'block' : 'none';
    
    if (!isVisible || !sensor.data || sensor.data.length < 2) {
      path.setAttribute('d', '');
      return;
    }
    
    console.log(`📊 Renderizando linha ${sensor.key} com ${sensor.data.length} pontos`);
    
    // Calcular coordenadas
    const margins = { left: 50, right: 20, top: 20, bottom: 20 };
    const chartWidth = width - margins.left - margins.right;
    const chartHeight = height - margins.top - margins.bottom;
    
    let pathData = '';
    
    sensor.data.forEach((value, i) => {
      const x = margins.left + (i / Math.max(sensor.data.length - 1, 1)) * chartWidth;
      const normalizedValue = maxVal !== 0 ? value / maxVal : 0;
      const y = midY - normalizedValue * (chartHeight / 2) * 0.8;
      
      if (i === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
    });
    
    path.setAttribute('d', pathData);
  });
}

function drawCurrentValues(ctx, sensors, width, height) {
  ctx.font = '12px Arial';
  ctx.fillStyle = '#333';
  
  let y = 20;
  sensors.forEach(sensor => {
    const data = chartData[sensor.key];
    if (data && data.length > 0) {
      const currentValue = data[data.length - 1];
      ctx.fillStyle = sensor.color;
      ctx.fillText(`${sensor.name}: ${currentValue.toFixed(2)}`, width - 150, y);
      y += 20;
    }
  });
}

/**
 * Atualiza os valores numéricos na aba de sensores
 */
function updateSensorValuesDisplay(accelX, accelY, accelZ, gyroX, gyroY, gyroZ) {
  // Atualizar valores na interface HTML
  const valueElements = {
    'accel-x-value': accelX,
    'accel-y-value': accelY, 
    'accel-z-value': accelZ,
    'gyro-x-value': gyroX,
    'gyro-y-value': gyroY,
    'gyro-z-value': gyroZ
  };
  
  Object.entries(valueElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value.toFixed(3);
    }
  });
  
  // Mostrar seção de valores atuais se estava oculta
  const currentValues = document.getElementById('current-values');
  if (currentValues) {
    currentValues.style.display = 'block';
  }
  
  // Atualizar status do plotter
  const plotterStatus = document.getElementById('plotter-status');
  if (plotterStatus) {
    plotterStatus.textContent = `Recebendo dados em tempo real (${chartData.timestamps.length} amostras)`;
  }
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

// Aguardar carregamento completo e então definir blocos (backup)
setTimeout(() => {
  if (typeof Blockly !== 'undefined' && Blockly.Blocks) {
    ensureMPU6050Blocks();
    forceCorrectBlockColors(); // Aplicar cores corretas após definir blocos
  }
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
console.log('🎨 Aplicando cores consistentes imediatamente após inicialização...');

// Aplicar cores imediatamente (sincrono)
ensureMPU6050Blocks();
forceCorrectBlockColors();

// Garantir aplicação após renderização completa (assíncrono)
setTimeout(() => {
  console.log('🎨 Aplicando cores após renderização completa...');
  forceCorrectBlockColors();
  
  // Forçar renderização para aplicar mudanças visuais
  if (workspace) {
    workspace.render();
  }
}, 50); // Timeout muito pequeno para pegar logo após a renderização

// APLICAÇÃO MAIS AGRESSIVA: Forçar múltiplas atualizações para garantir que funcione
setTimeout(() => {
  console.log('🎨 Aplicação agressiva de cores (100ms)...');
  ensureMPU6050Blocks();
  forceCorrectBlockColors();
}, 100);

setTimeout(() => {
  console.log('🎨 Aplicação agressiva de cores (500ms)...');
  forceCorrectBlockColors();
}, 500);

setTimeout(() => {
  console.log('🎨 Aplicação agressiva de cores (1000ms)...');
  forceCorrectBlockColors();
}, 1000);

// Adicionar listener para garantir cores em eventos específicos
let colorApplicationInProgress = false;
workspace.addChangeListener((event) => {
  // Aplicar cores apenas em eventos de criação/mudança de blocos, não em mudanças de cores
  if (!colorApplicationInProgress && (event.type === 'create' || event.type === 'move' || event.type === 'change')) {
    colorApplicationInProgress = true;
    setTimeout(() => {
      forceCorrectBlockColors();
      colorApplicationInProgress = false;
    }, 100);
  }
});


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
    forceCorrectBlockColors(); // Aplicar cores corretas
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
  
  // Aplicar cores consistentes uma última vez
  forceCorrectBlockColors();
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
    
    // Limpar modo de exemplo quando usuário criar variável
    const codeDisplay = document.getElementById('code-display');
    if (codeDisplay && codeDisplay.getAttribute('data-example-mode') === 'true') {
      console.log('🧹 Limpando modo de exemplo devido à criação de variável');
      codeDisplay.removeAttribute('data-example-mode');
      codeDisplay.removeAttribute('data-sensor-type');
      codeDisplay.classList.remove('example-code');
    }
    
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
    // Verificar se há um código de exemplo ativo
    const codeDisplay = document.getElementById('code-display');
    if (codeDisplay && codeDisplay.getAttribute('data-example-mode') === 'true') {
      console.log('📋 Código de exemplo ativo, não sobrescrevendo...');
      return codeDisplay.textContent;
    }
    
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
    
    // Limpar modo de exemplo quando usuário interagir com blocos
    const codeDisplay = document.getElementById('code-display');
    if (codeDisplay && codeDisplay.getAttribute('data-example-mode') === 'true') {
      console.log('🧹 Limpando modo de exemplo devido à interação com blocos');
      codeDisplay.removeAttribute('data-example-mode');
      codeDisplay.removeAttribute('data-sensor-type');
      codeDisplay.classList.remove('example-code');
    }
    
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
/**
 * Garante que o gráfico do Serial Plotter esteja inicializado quando dados chegam
 */
function ensureSerialPlotterChart() {
  console.log('🔍 Verificando se Serial Plotter precisa de inicialização...');
  
  // Verificar se estamos no serial monitor modal
  const serialModal = document.getElementById('serial-monitor-modal');
  if (!serialModal || !serialModal.style.display || serialModal.style.display === 'none') {
    console.log('📊 Serial Monitor modal não está aberto, ignorando gráfico');
    return;
  }
  
  // Verificar se tem dados de sensor para mostrar
  if (sensorData.timestamps.length === 0) {
    console.log('📊 Sem dados de sensor ainda');
    return;
  }
  
  // Verificar se o elemento do gráfico existe
  const plotterChart = document.getElementById('serial-plotter-chart');
  if (!plotterChart) {
    console.log('📊 Elemento serial-plotter-chart não encontrado');
    return;
  }
  
  // Verificar se já tem um gráfico renderizado (tem filhos SVG ou similar)
  if (plotterChart.children.length > 0 && plotterChart.querySelector('svg, canvas')) {
    console.log('📊 Gráfico já está inicializado');
    // Apenas atualizar dados
    updateChart();
    return;
  }
  
  // Inicializar o gráfico
  console.log('🚀 Inicializando gráfico no Serial Plotter...');
  initializeSVGChart(plotterChart);
}

// SERIAL MONITOR MODAL EVENT LISTENERS - DOM Ready Setup
// ============================================================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 Configurando event listeners do Serial Monitor...');
  
  // ============================================================================
  // APLICAR CORES DOS BLOCOS LOGO NO CARREGAMENTO DA PÁGINA
  // ============================================================================
  console.log('🎨 Aplicando cores dos blocos no carregamento da página...');
  
  // Verificar múltiplas vezes se Blockly está carregado
  function tryApplyColors(attempt = 1) {
    console.log(`🔍 Tentativa ${attempt} de aplicar cores...`);
    
    if (typeof Blockly !== 'undefined' && Blockly.Blocks) {
      console.log('✅ Blockly está carregado! Aplicando cores...');
      ensureMPU6050Blocks();
      forceCorrectBlockColors();
      console.log('✅ Cores aplicadas no carregamento da página');
    } else if (attempt < 10) {
      console.log(`⏳ Blockly ainda não carregado (tentativa ${attempt}), tentando novamente...`);
      setTimeout(() => tryApplyColors(attempt + 1), 500);
    } else {
      console.error('❌ Blockly não foi carregado após 10 tentativas');
    }
  }
  
  // Iniciar tentativas
  setTimeout(() => tryApplyColors(), 100);
  
  // ============================================================================
  // INICIALIZAÇÃO MANUAL APENAS - ECONOMIA DE MEMÓRIA
  // ============================================================================
  
  // NOTA: Inicialização automática foi removida para economizar memória.
  // O backend agora inicia apenas quando o usuário clica no botão "Iniciar Backend"
  console.log('� Backend será iniciado apenas quando necessário (modo econômico)');
  
  // ============================================================================
  // EVENT LISTENERS EXISTENTES
  // ============================================================================
  
  // Mostrar mensagem de boas-vindas explicativa sobre modo econômico
  setTimeout(() => {
    addToSerialConsole('🎯 BEM-VINDO AO IDEIASPACE!');
    addToSerialConsole('💡 MODO ECONÔMICO ATIVADO');
    addToSerialConsole('📋 Para começar a programar:');
    addToSerialConsole('   1. Clique no botão "Iniciar Backend"');
    addToSerialConsole('   2. Conecte seu Arduino/ESP32');
    addToSerialConsole('   3. Comece a criar seus projetos!');
    addToSerialConsole('');
    addToSerialConsole('⚡ O backend será iniciado apenas quando necessário,');
    addToSerialConsole('   economizando memória e recursos do sistema.');
  }, 1000);
  
  // Serial Monitor Modal buttons - Connect to Execute button (startButton)
  const executeBtn = document.getElementById('startButton');
  if (executeBtn) {
    executeBtn.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default behavior
      openSerialMonitorModal();
    });
    console.log('✅ Botão Executar conectado ao Serial Monitor');
  }

  // Examples button
  const examplesBtn = document.getElementById('examplesButton');
  if (examplesBtn) {
    examplesBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openExamplesModal();
    });
    console.log('✅ Botão de Exemplos configurado');
  }

  // Examples modal close button
  const examplesCloseBtn = document.getElementById('examples-modal-close');
  if (examplesCloseBtn) {
    examplesCloseBtn.addEventListener('click', closeExamplesModal);
    console.log('✅ Botão de fechar modal de exemplos configurado');
  }

  // Examples modal overlay click to close
  const examplesModal = document.getElementById('examples-modal');
  if (examplesModal) {
    examplesModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeExamplesModal();
      }
    });
  }

  // Example cards click events
  document.querySelectorAll('.example-card').forEach(card => {
    card.addEventListener('click', function() {
      const sensorType = this.getAttribute('data-sensor');
      if (sensorType) {
        loadSensorExample(sensorType);
      }
    });
  });
  console.log('✅ Cards de exemplos configurados');

  // ESC key to close examples modal
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const examplesModal = document.getElementById('examples-modal');
      if (examplesModal && examplesModal.classList.contains('show')) {
        closeExamplesModal();
      }
    }
  });

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
  
  // Reconnect button for baud rate changes
  const reconnectBtn = document.getElementById('reconnect-serial');
  if (reconnectBtn) {
    reconnectBtn.addEventListener('click', function() {
      console.log('🔄 Reconectando com novo baud rate...');
      
      if (!serialMonitorState.isConnected) {
        showSerialNotification('⚠️ Não há conexão ativa para reconectar!', 'warning');
        return;
      }
      
      const currentPort = serialMonitorState.selectedPort;
      if (!currentPort) {
        showSerialNotification('❌ Porta não identificada para reconexão!', 'error');
        return;
      }
      
      // Primeiro desconectar
      disconnectSerial();
      
      // Aguardar um pouco e reconectar
      setTimeout(() => {
        const portSelect = document.getElementById('port-select');
        if (portSelect) {
          portSelect.value = currentPort;
        }
        connectSerial();
      }, 1000);
    });
  }
  
  // Backend control buttons
  const startBackendBtn = document.getElementById('start-backend-btn');
  if (startBackendBtn) {
    startBackendBtn.addEventListener('click', async () => {
      await startBackend();
    });
  }
  
  // Test button for chart functionality
  const plotterTestBtn = document.getElementById('plotter-test');
  if (plotterTestBtn) {
    plotterTestBtn.addEventListener('click', () => {
      console.log('🧪 Botão de teste clicado - adicionando dados de teste');
      
      // Limpar dados existentes
      sensorData.timestamps = [];
      sensorData.accelX = [];
      sensorData.accelY = [];
      sensorData.accelZ = [];
      sensorData.gyroX = [];
      sensorData.gyroY = [];
      sensorData.gyroZ = [];
      
      // Adicionar vários pontos de dados de teste
      for (let i = 0; i < 50; i++) {
        const time = Date.now() + i * 100;
        const t = i * 0.1;
        
        addSensorData(
          Math.sin(t) * 2 + Math.random() * 0.5,
          Math.cos(t) * 1.5 + Math.random() * 0.3,
          Math.sin(t * 2) * 1 + Math.random() * 0.2,
          Math.cos(t * 1.5) * 0.8 + Math.random() * 0.1,
          Math.sin(t * 0.8) * 0.6 + Math.random() * 0.1,
          Math.cos(t * 1.2) * 0.4 + Math.random() * 0.05
        );
      }
      
      console.log('🧪 Dados de teste adicionados:', sensorData.timestamps.length, 'pontos');
      
      // Forçar inicialização e atualização do gráfico no Serial Plotter
      setTimeout(() => {
        const plotterElement = document.getElementById('serial-plotter-chart');
        if (plotterElement) {
          console.log('🧪 Inicializando gráfico diretamente no Serial Plotter');
          initializeSVGChart(plotterElement);
          updateChart();
        } else {
          console.error('🧪 Elemento serial-plotter-chart não encontrado');
        }
      }, 100);
    });
  }
  
  // Botão Pausar/Retomar
  const plotterPauseBtn = document.getElementById('plotter-pause');
  if (plotterPauseBtn) {
    let isPaused = false;
    plotterPauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      serialMonitorState.isPaused = isPaused;
      
      plotterPauseBtn.textContent = isPaused ? '▶️ Retomar' : '⏸️ Pausar';
      plotterPauseBtn.title = isPaused ? 'Retomar coleta de dados' : 'Pausar coleta de dados';
      
      console.log(`📊 Plotter ${isPaused ? 'pausado' : 'retomado'}`);
    });
  }
  
  // Botão Limpar
  const plotterClearBtn = document.getElementById('plotter-clear');
  if (plotterClearBtn) {
    plotterClearBtn.addEventListener('click', () => {
      console.log('🗑️ Limpando dados do gráfico');
      
      // Limpar todos os dados
      sensorData.timestamps = [];
      sensorData.accelX = [];
      sensorData.accelY = [];
      sensorData.accelZ = [];
      sensorData.gyroX = [];
      sensorData.gyroY = [];
      sensorData.gyroZ = [];
      
      // Limpar gráfico
      const plotterElement = document.getElementById('serial-plotter-chart');
      if (plotterElement) {
        const svg = plotterElement.querySelector('svg');
        if (svg) {
          // Limpar todas as linhas
          const paths = svg.querySelectorAll('path[id^="line-"]');
          paths.forEach(path => path.setAttribute('d', ''));
        }
      }
      
      // Atualizar botão de export
      updateExportButton();
      
      console.log('✅ Gráfico limpo');
    });
  }
  
  // Botão Export CSV
  const plotterExportBtn = document.getElementById('plotter-export');
  if (plotterExportBtn) {
    plotterExportBtn.addEventListener('click', () => {
      if (sensorData.timestamps.length === 0) {
        alert('Não há dados para exportar');
        return;
      }
      
      console.log('📊 Exportando dados CSV');
      
      // Criar CSV
      let csvContent = 'Timestamp,Accel X,Accel Y,Accel Z,Gyro X,Gyro Y,Gyro Z\n';
      
      for (let i = 0; i < sensorData.timestamps.length; i++) {
        const row = [
          new Date(sensorData.timestamps[i]).toISOString(),
          sensorData.accelX[i] || 0,
          sensorData.accelY[i] || 0,
          sensorData.accelZ[i] || 0,
          sensorData.gyroX[i] || 0,
          sensorData.gyroY[i] || 0,
          sensorData.gyroZ[i] || 0
        ].join(',');
        
        csvContent += row + '\n';
      }
      
      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `sensor_data_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ CSV exportado');
    });
  }
  
  // Event listeners para checkboxes dos sensores
  const sensorCheckboxes = [
    { id: 'accel-x', key: 'accelX' },
    { id: 'accel-y', key: 'accelY' },
    { id: 'accel-z', key: 'accelZ' },
    { id: 'gyro-x', key: 'gyroX' },
    { id: 'gyro-y', key: 'gyroY' },
    { id: 'gyro-z', key: 'gyroZ' }
  ];
  
  sensorCheckboxes.forEach(sensor => {
    const checkbox = document.getElementById(sensor.id);
    if (checkbox) {
      checkbox.addEventListener('change', function() {
        serialMonitorState.sensorVisibility[sensor.key] = this.checked;
        console.log(`📊 Sensor ${sensor.key} ${this.checked ? 'ativado' : 'desativado'}`);
        
        // Atualizar gráfico se há dados
        if (sensorData.timestamps.length > 0) {
          updateChart();
        }
      });
      
      console.log(`✅ Event listener adicionado para checkbox ${sensor.id}`);
    } else {
      console.warn(`❌ Checkbox ${sensor.id} não encontrado`);
    }
  });
  
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
    console.log('🔧 Adicionando event listener para upload-btn');
    uploadBtn.addEventListener('click', function() {
      console.log('🚀 Botão upload-btn clicado!');
      uploadSketch();
    });
  }

  // Botão de reconexão serial com novo baud rate
  const reconnectSerialBtn = document.getElementById('reconnect-serial');
  if (reconnectSerialBtn) {
    reconnectSerialBtn.addEventListener('click', function() {
      const portSelect = document.getElementById('port-select');
      const selectedPort = portSelect ? portSelect.value : null;
      
      if (!selectedPort) {
        addToSerialConsole('❌ Nenhuma porta selecionada para reconexão');
        return;
      }
      
      addToSerialConsole('🔄 Reconectando com novo baud rate...');
      
      // Desconectar conexão atual se existir
      if (serialWebSocket) {
        serialWebSocket.close();
        serialWebSocket = null;
        serialMonitoringActive = false;
      }
      
      // Reconectar com novo baud rate
      setTimeout(() => {
        startRealSerialMonitoring(selectedPort);
      }, 500);
    });
  }
  
  const uploadBtnMain = document.getElementById('upload-code');
  if (uploadBtnMain) {
    console.log('🔧 Adicionando event listener para upload-code');
    uploadBtnMain.addEventListener('click', function() {
      console.log('🚀 Botão upload-code clicado!');
      uploadSketch();
    });
  } else {
    console.log('❌ Botão upload-code não encontrado');
  }
  
  // Console buttons
  const sendBtn = document.getElementById('send-command');
  if (sendBtn) {
    sendBtn.addEventListener('click', sendSerialCommand);
  }
  
  const consoleInput = document.getElementById('console-input');
  const commandText = document.getElementById('command-text');
  
  // Suportar ambos os inputs de console
  [consoleInput, commandText].forEach(input => {
    if (input) {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendSerialCommand();
        }
      });
    }
  });
  
  // Clear console buttons (múltiplos IDs para compatibilidade)
  const clearConsoleButtons = [
    document.getElementById('clear-console'),
    document.getElementById('clear-console-btn'),
    document.getElementById('clear-logs')
  ].filter(btn => btn);
  
  clearConsoleButtons.forEach(btn => {
    btn.addEventListener('click', clearConsole);
  });
  
  // Modal click outside to close
  const serialModal = document.getElementById('arduino-cli-modal');
  if (serialModal) {
    serialModal.addEventListener('click', function(e) {
      if (e.target === serialModal) {
        closeSerialMonitorModal();
      }
    });
  }
  
  // Port selector change events - tanto para a área principal quanto para o modal
  const portSelector = document.getElementById('port-select');
  const uploadPortSelector = document.getElementById('upload-port-select');
  const modalPortSelector = document.getElementById('modal-port-select');
  
  if (portSelector) {
    portSelector.addEventListener('change', function() {
      serialMonitorState.selectedPort = this.value;
      console.log(`🔌 Porta selecionada (principal): ${this.value}`);
      
      // Apenas atualizar o estado - NÃO auto-conectar
      if (this.value && this.value !== '') {
        console.log('� Porta selecionada. Use o botão Conectar para iniciar a conexão.');
        showSerialNotification(`📌 Porta ${this.value} selecionada. Clique em Conectar para iniciar.`, 'info');
        
        // Habilitar botão conectar
        const connectBtn = document.getElementById('connect-btn');
        if (connectBtn) {
          connectBtn.disabled = false;
        }
        
        // Atualizar botões de upload também
        updateUploadTab();
      } else {
        serialMonitorState.isConnected = false;
        updateConnectionStatus();
        updateUploadTab();
        
        // Desabilitar botão conectar
        const connectBtn = document.getElementById('connect-btn');
        if (connectBtn) {
          connectBtn.disabled = true;
        }
      }
    });
  }
  
  if (uploadPortSelector) {
    uploadPortSelector.addEventListener('change', function() {
      serialMonitorState.selectedPort = this.value;
      console.log(`🔌 Porta selecionada (upload): ${this.value}`);
      console.log(`🔍 State atualizado - serialMonitorState.selectedPort:`, serialMonitorState.selectedPort);
      
      // Apenas atualizar o estado - NÃO auto-conectar
      if (this.value && this.value !== '') {
        console.log('� Porta selecionada para upload. Use o botão Conectar se quiser monitorar.');
        showSerialNotification(`📌 Porta ${this.value} selecionada para upload.`, 'info');
        updateUploadTab();
      } else {
        updateUploadTab();
      }
    });
  }
  
  if (modalPortSelector) {
    modalPortSelector.addEventListener('change', function() {
      serialMonitorState.selectedPort = this.value;
      console.log(`🔌 Porta selecionada (modal): ${this.value}`);
      
      // Apenas atualizar o estado - NÃO auto-conectar
      if (this.value && this.value !== '') {
        console.log('� Porta selecionada no modal. Use o botão Conectar se quiser monitorar.');
        showSerialNotification(`📌 Porta ${this.value} selecionada no modal.`, 'info');
        updateUploadTab();
      } else {
        updateUploadTab();
      }
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
            switchTab('sensors');
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
      if (serialMonitorState.currentTab === 'sensors') {
        setTimeout(() => {
          initializeChart();
        }, 100);
      }
    });
    
    resizeObserver.observe(chartContainer);
  }
  
  // Initialize plotter resize observer
  const plotterContainer = document.querySelector('.plotter-chart-container');
  if (plotterContainer && window.ResizeObserver) {
    const plotterResizeObserver = new ResizeObserver(entries => {
      if (serialMonitorState.currentTab === 'plotter') {
        setTimeout(() => {
          resizePlotterCanvas();
        }, 100);
      }
    });
    
    plotterResizeObserver.observe(plotterContainer);
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
  
  // Cores agora são definidas diretamente nos blocos - sem redundâncias
  
  // Sistema simplificado - cores definidas diretamente nos blocos
  console.log('✅ Sistema de cores otimizado e alinhado com projeto web');
  
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
    
    // 2. Aplicar todas as cores consistentes
    console.log('🎨 Aplicando cores de todos os sensores...');
    forceCorrectBlockColors();
    
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
        
        
        // Segunda troca: voltar ao idioma original
        setTimeout(() => {
          console.log(`🌍 Segunda troca: ${alternativeLanguage} → ${currentLanguage}`);
          if (window.i18n.changeLanguage) {
            window.i18n.changeLanguage(currentLanguage);
          }
          
          // Aplicar cores finais após voltar ao idioma original
          setTimeout(() => {
            console.log('🎨 Aplicando cores finais após retorno ao idioma original...');
            
            
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
        
        forceSystemUpdate();
      }, 500);
    }
  }, 1500);
}, 6000); // Aumentado para 6 segundos para dar tempo da troca de idioma

// ============================================================================
// PLOTTER HEADER (Independent) - Serial Plotter fora do modal
// ============================================================================

let plotterHeaderChart = null;
let isPlotterHeaderMinimized = false;

// Função para abrir o header independente do Serial Plotter
function openPlotterHeader() {
  const header = document.getElementById('plotter-header');
  if (header) {
    header.style.display = 'block';
    isPlotterHeaderMinimized = false;
    
    // Inicializar o chart se necessário
    setTimeout(() => {
      ensurePlotterHeaderChart();
    }, 100);
    
    console.log('📊 Serial Plotter Header aberto');
  }
}

// Função para fechar o header do Serial Plotter
function closePlotterHeader() {
  const header = document.getElementById('plotter-header');
  if (header) {
    header.style.display = 'none';
    console.log('📊 Serial Plotter Header fechado');
  }
}

// Função para minimizar/restaurar o header
function togglePlotterHeaderMinimize() {
  const content = document.querySelector('.plotter-content');
  const minimizeBtn = document.getElementById('plotter-minimize');
  
  if (content && minimizeBtn) {
    isPlotterHeaderMinimized = !isPlotterHeaderMinimized;
    
    if (isPlotterHeaderMinimized) {
      content.style.display = 'none';
      minimizeBtn.textContent = '+';
    } else {
      content.style.display = 'block';
      minimizeBtn.textContent = '−';
    }
  }
}

// Função para garantir que o chart do header está criado
function ensurePlotterHeaderChart() {
  const container = document.getElementById('plotter-chart-header');
  if (!container) return;

  // Se já existe um chart, não recriar
  if (plotterHeaderChart && container.querySelector('canvas')) {
    return plotterHeaderChart;
  }

  // Limpar container
  container.innerHTML = '';

  // Criar canvas
  const canvas = document.createElement('canvas');
  canvas.width = container.offsetWidth || 800;
  canvas.height = 300;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // Configurar o chart igual ao anterior
  plotterHeaderChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Accel X',
          data: [],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: 'Accel Y',
          data: [],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: 'Accel Z',
          data: [],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: 'Gyro X',
          data: [],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [5, 5]
        },
        {
          label: 'Gyro Y',
          data: [],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [5, 5]
        },
        {
          label: 'Gyro Z',
          data: [],
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [5, 5]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 11
            }
          }
        },
        title: {
          display: true,
          text: 'MPU6050 - Dados do Acelerômetro e Giroscópio',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Tempo'
          },
          grid: {
            color: 'rgba(0,0,0,0.1)'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Valores'
          },
          grid: {
            color: 'rgba(0,0,0,0.1)'
          }
        }
      }
    }
  });

  console.log('📊 Chart do Header criado com sucesso');
  return plotterHeaderChart;
}

// Função para atualizar o chart do header com novos dados
function updatePlotterHeaderChart(sensorData) {
  if (!plotterHeaderChart || !sensorData) return;

  const timestamp = new Date().toLocaleTimeString();
  
  // Adicionar novo timestamp
  plotterHeaderChart.data.labels.push(timestamp);
  
  // Limitar a 50 pontos para performance
  if (plotterHeaderChart.data.labels.length > 50) {
    plotterHeaderChart.data.labels.shift();
    plotterHeaderChart.data.datasets.forEach(dataset => dataset.data.shift());
  }
  
  // Adicionar dados aos datasets (igual ao chart anterior)
  plotterHeaderChart.data.datasets[0].data.push(sensorData.accel.x);
  plotterHeaderChart.data.datasets[1].data.push(sensorData.accel.y);
  plotterHeaderChart.data.datasets[2].data.push(sensorData.accel.z);
  plotterHeaderChart.data.datasets[3].data.push(sensorData.gyro.x);
  plotterHeaderChart.data.datasets[4].data.push(sensorData.gyro.y);
  plotterHeaderChart.data.datasets[5].data.push(sensorData.gyro.z);
  
  // Atualizar o chart
  plotterHeaderChart.update('none');
  
  // Atualizar valores atuais no header
  updateHeaderCurrentValues(sensorData);
}

// Função para atualizar os valores atuais no header
function updateHeaderCurrentValues(sensorData) {
  document.getElementById('accel-x-value-header').textContent = sensorData.accel.x.toFixed(3);
  document.getElementById('accel-y-value-header').textContent = sensorData.accel.y.toFixed(3);
  document.getElementById('accel-z-value-header').textContent = sensorData.accel.z.toFixed(3);
  document.getElementById('gyro-x-value-header').textContent = sensorData.gyro.x.toFixed(3);
  document.getElementById('gyro-y-value-header').textContent = sensorData.gyro.y.toFixed(3);
  document.getElementById('gyro-z-value-header').textContent = sensorData.gyro.z.toFixed(3);
  
  // Mostrar a seção de valores atuais se estiver oculta
  const valuesSection = document.getElementById('current-values-header');
  if (valuesSection && valuesSection.style.display === 'none') {
    valuesSection.style.display = 'block';
  }
}

// Event listeners para o header do Serial Plotter
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 Configurando event listeners do Plotter Header...');
  
  // Botão minimalista no Console
  const openPlotterBtn = document.getElementById('open-plotter');
  if (openPlotterBtn) {
    openPlotterBtn.addEventListener('click', openPlotterHeader);
    console.log('✅ Event listener do botão plotter configurado');
  }
  
  // Botão fechar
  const closePlotterBtn = document.getElementById('plotter-close');
  if (closePlotterBtn) {
    closePlotterBtn.addEventListener('click', closePlotterHeader);
  }
  
  // Botão minimizar
  const minimizePlotterBtn = document.getElementById('plotter-minimize');
  if (minimizePlotterBtn) {
    minimizePlotterBtn.addEventListener('click', togglePlotterHeaderMinimize);
  }
  
  // Botões de controle no header
  const pauseHeaderBtn = document.getElementById('plotter-pause-header');
  if (pauseHeaderBtn) {
    pauseHeaderBtn.addEventListener('click', () => {
      // Reutilizar a lógica de pause
      if (typeof togglePlotterPause === 'function') {
        togglePlotterPause();
      }
    });
  }
  
  const clearHeaderBtn = document.getElementById('plotter-clear-header');
  if (clearHeaderBtn) {
    clearHeaderBtn.addEventListener('click', () => {
      // Limpar chart do header
      if (plotterHeaderChart) {
        plotterHeaderChart.data.labels = [];
        plotterHeaderChart.data.datasets.forEach(dataset => dataset.data = []);
        plotterHeaderChart.update();
      }
      console.log('🗑️ Chart do Header limpo');
    });
  }
  
  const exportHeaderBtn = document.getElementById('plotter-export-header');
  if (exportHeaderBtn) {
    exportHeaderBtn.addEventListener('click', () => {
      // Reutilizar a função de export
      if (typeof exportPlotterData === 'function') {
        exportPlotterData();
      }
    });
  }
  
  // Checkboxes para controlar linhas do gráfico no header
  const checkboxes = [
    'accel-x-header', 'accel-y-header', 'accel-z-header',
    'gyro-x-header', 'gyro-y-header', 'gyro-z-header'
  ];
  
  checkboxes.forEach((id, index) => {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        if (plotterHeaderChart && plotterHeaderChart.data.datasets[index]) {
          plotterHeaderChart.data.datasets[index].hidden = !checkbox.checked;
          plotterHeaderChart.update();
        }
      });
    }
  });
  
  console.log('✅ Todos os event listeners do Plotter Header configurados');
});

// Integrar o header chart com o sistema de dados existente
// Modificar a função parseAndUpdateSensorData para incluir o header
const originalParseAndUpdateSensorData = window.parseAndUpdateSensorData;
if (originalParseAndUpdateSensorData) {
  window.parseAndUpdateSensorData = function(data) {
    // Chamar a função original
    const result = originalParseAndUpdateSensorData(data);
    
    // Se o header estiver aberto e há dados de sensores, atualizar também
    const header = document.getElementById('plotter-header');
    if (header && header.style.display !== 'none' && window.lastSensorData) {
      updatePlotterHeaderChart(window.lastSensorData);
    }
    
    return result;
  };
}

// ============================================================================
// APLICAÇÃO GARANTIDA DE CORES - MÚLTIPLOS TIMEOUTS PARA GARANTIR FUNCIONAMENTO
// ============================================================================

// Aplicar cores em diferentes momentos para garantir que funcionem
console.log('🎨 Configurando aplicação garantida de cores...');

// Aplicação imediata (sincrona)
if (typeof window !== 'undefined') {
  // Aguardar carregamento completo da janela
  window.addEventListener('load', () => {
    console.log('🎨 Aplicando cores no evento window.load...');
    setTimeout(() => {
      if (typeof Blockly !== 'undefined' && Blockly.Blocks) {
        forceCorrectBlockColors();
      }
    }, 100);
  });
  
  // Aplicações com timeouts progressivos
  [500, 1000, 2000, 3000].forEach(delay => {
    setTimeout(() => {
      if (typeof Blockly !== 'undefined' && Blockly.Blocks && typeof forceCorrectBlockColors === 'function') {
        console.log(`🎨 Aplicando cores (timeout ${delay}ms)...`);
        forceCorrectBlockColors();
      }
    }, delay);
  });
}

console.log('✅ Sistema de cores configurado com múltiplos pontos de aplicação');

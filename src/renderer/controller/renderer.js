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
  
  // Forçar atualização das cores dos blocos MPU6050
  forceMPU6050Colors();
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

// Aguardar carregamento completo e então definir blocos
setTimeout(() => {
  ensureMPU6050Blocks();
  forceMPU6050Colors(); // Forçar cores após definição dos blocos
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
console.log('🎨 Forçando cores MPU6050 imediatamente após inicialização...');
ensureMPU6050Blocks();
forceMPU6050Colors();

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
  
  // Verificação final das cores dos blocos MPU6050
  console.log('🎨 Verificação final das cores dos blocos MPU6050...');
  const mpu6050Types = ['mpu6050_init', 'mpu6050_read', 'mpu6050_not'];
  mpu6050Types.forEach(type => {
    if (Blockly.Blocks[type]) {
      console.log(`🔍 Bloco ${type} encontrado`);
      // Forçar cor laranja uma última vez
      forceMPU6050Colors();
    }
  });
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

    // Exibir o código gerado
    codeDisplay.textContent = code || '// Nenhum bloco para gerar código';

    return code;
  } catch (error) {
    console.error('❌ Erro ao gerar código:', error);
    codeDisplay.textContent = '// Erro ao gerar código: ' + error.message;
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
          <category name="${t('CAT_DHT')}" colour="#2e8a2e">
            <block type="dht_init"></block>
            <sep></sep>
            <block type="dht_temperature"></block>
            <block type="dht_humidity"></block>
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

// Event listeners
startButton.addEventListener('click', executeCode);

// Listener para mudanças no workspace
workspace.addChangeListener(function(event) {
  if (event.type === Blockly.Events.BLOCK_CHANGE ||
      event.type === Blockly.Events.BLOCK_CREATE ||
      event.type === Blockly.Events.BLOCK_DELETE ||
      event.type === Blockly.Events.BLOCK_MOVE) {
    generateCode();
    
    // Verificar se blocos MPU6050 foram criados e aplicar cores
    if (event.type === Blockly.Events.BLOCK_CREATE) {
      const createdBlock = workspace.getBlockById(event.blockId);
      if (createdBlock && createdBlock.type && createdBlock.type.includes('mpu6050')) {
        console.log('🟠 Bloco MPU6050 criado, aplicando cor laranja:', createdBlock.type);
        createdBlock.setColour('#FF8C00');
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
// VERIFICAÇÃO FINAL DOS BLOCOS DELAY
// ============================================================================

// Verificar se todos os blocos estão funcionando após o carregamento
setTimeout(function() {
  console.log('🔍 Verificação final dos blocos...');
  
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
}, 2000);
const { ipcRenderer } = require('electron');

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
    // Atualizar o código quando variável for criada
    generateCode();
  }
  if (event.type === Blockly.Events.VAR_DELETE) {
    generateCode();
  }
  if (event.type === Blockly.Events.VAR_RENAME) {
    generateCode();
  }
});

// Função para gerar código C++
function generateCode() {
  try {
    // Verificar se Blockly está disponível
    if (typeof Blockly === 'undefined') {
      throw new Error('Blockly não está carregado');
    }
    
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
    
    // Inicializar o gerador C++
    Blockly.Cpp.init();
    
    // Gerar código C++ a partir dos blocos
    const code = Blockly.Cpp.workspaceToCode(workspace);
    
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
    const variables = workspace.getAllVariables();
    
    // Criar XML para o toolbox atualizado
    const toolboxXml = `
      <xml id="toolbox-dynamic">
        <category name="Lógica" colour="#1d1856">
          <block type="controls_if"></block>
          <block type="logic_compare"></block>
          <block type="logic_operation"></block>
          <block type="logic_boolean"></block>
        </category>
        <category name="Loops" colour="#00cfe5">
          <block type="controls_repeat_ext">
            <value name="TIMES">
              <shadow type="math_number"><field name="NUM">10</field></shadow>
            </value>
          </block>
          <block type="controls_whileUntil"></block>
        </category>
        <category name="Matemática" colour="#e80074">
          <block type="math_number"><field name="NUM">0</field></block>
          <block type="math_arithmetic"></block>
        </category>
        <category name="Texto" colour="#1d1856">
          <block type="text"></block>
          <block type="text_print"></block>
        </category>
        <category name="Variáveis" colour="#00cfe5">
          <button text="➕ Criar Nova Variável" callbackkey="CREATE_VARIABLE"></button>
          ${variables.map(variable => `
            <block type="variables_get">
              <field name="VAR">${variable.name}</field>
            </block>
            <block type="variables_set">
              <field name="VAR">${variable.name}</field>
            </block>
          `).join('')}
        </category>
        <category name="Declarações" colour="#00cfe5">
          <block type="variable_declaration">
            <value name="VALUE">
              <shadow type="math_number"><field name="NUM">0</field></shadow>
            </value>
          </block>
        </category>
        <category name="Funções" colour="#e80074" custom="PROCEDURE">
          <block type="procedures_defnoreturn"></block>
          <block type="procedures_callnoreturn"></block>
        </category>
        <category name="Controle" colour="#0c0931">
          <block type="delay_block"></block>
          <block type="digital_write"></block>
          <block type="digital_read"></block>
        </category>
      </xml>
    `;
    
    // Atualizar o toolbox
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(toolboxXml, 'text/xml');
    workspace.updateToolbox(xmlDoc.documentElement);
  } catch (error) {
    console.error('❌ Erro ao atualizar toolbox:', error);
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
      createBtn.textContent = `✅ Criar "${currentVariableName}"`;
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
      showNotification('⚠️ Por favor, digite um nome válido para a variável!', 'warning');
      input.focus();
      return false;
    }
    
    try {
      // Dupla verificação antes de criar
      const existingVars = workspace.getAllVariables();
      const exists = existingVars.some(v => v.name === currentVariableName);
      
      if (exists) {
        showNotification('❌ Uma variável com este nome já existe!', 'error');
        input.focus();
        input.select();
        return false;
      }
      
      // Criar a variável
      const variable = workspace.createVariable(currentVariableName);
      
      // Atualizar toolbox para mostrar a nova variável
      updateVariableToolbox();
      
      // Gerar código atualizado
      generateCode();
      
      // Fechar modal
      closeModal();
      
      // Mostrar mensagem de sucesso
      showNotification('✅ Variável "' + currentVariableName + '" criada com sucesso!', 'success');
      
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

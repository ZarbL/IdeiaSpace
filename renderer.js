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

// Função para gerar código C++
function generateCode() {
  try {
    // Inicializar o gerador C++
    Blockly.Cpp.init();
    
    // Gerar código C++ a partir dos blocos
    const code = Blockly.Cpp.workspaceToCode(workspace);
    
    // Exibir o código gerado
    codeDisplay.textContent = code || '// Nenhum bloco para gerar código';
    
    return code;
  } catch (error) {
    console.error('Erro ao gerar código:', error);
    codeDisplay.textContent = '// Erro ao gerar código: ' + error.message;
    return null;
  }
}

// Função para executar o código
function executeCode() {
  const code = generateCode();
  
  if (!code || code === '// Nenhum bloco para gerar código') {
    messageElement.textContent = 'Nenhum código para executar';
    return;
  }

  // Enviar código para o processo principal
  ipcRenderer.send('execute-code', code);
  
  messageElement.textContent = 'Executando código...';
  startButton.disabled = true;
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

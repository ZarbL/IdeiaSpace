window.addEventListener('DOMContentLoaded', () => {
  // Inicializar o gerador Arduino
  Blockly.Arduino.init();
  
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    grid: {
      spacing: 20,
      length: 2,
      colour: '#ccc',
      snap: true
    },
    trashcan: true,
    scrollbars: true,
    sounds: true
  });

  const updateCode = () => {
    try {
      // Gerar código Arduino completo
      const code = generateFullArduinoCode(workspace);
      document.getElementById('code-display').textContent = code;
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      document.getElementById('code-display').textContent = '// Erro ao gerar código: ' + error.message; 
    }
  };

  // Atualizar código quando o workspace mudar
  workspace.addChangeListener(() => {
    updateCode();
  });

  // Atualizar código inicial
  updateCode();

  // Botão de execução
  document.getElementById('startButton').addEventListener('click', () => {
    const messageEl = document.getElementById('message');
    messageEl.textContent = 'Código gerado com sucesso!';
    messageEl.style.color = 'green';
    
    setTimeout(() => {
      messageEl.textContent = '';
    }, 3000);
  });
});

// Gera o código completo com setup e loop
function generateFullArduinoCode(workspace) {
  try {
    // Gerar código do loop principal
    const loopCode = Blockly.Arduino.workspaceToCode(workspace);
    
    // Gerar código completo com includes, definições, setup e loop
    const fullCode = Blockly.Arduino.finish(loopCode);
    
    // Adicionar loop principal se não existir
    if (!fullCode.includes('void loop()')) {
      const includes = fullCode.includes('#include') ? '' : '#include <Arduino.h>\n\n';
      const setupSection = fullCode.includes('void setup()') ? '' : 'void setup() {\n  Serial.begin(9600);\n}\n\n';
      const loopWrapper = 'void loop() {\n' + indentCode(loopCode) + '\n}';
      return includes + fullCode + setupSection + loopWrapper;
    }
    
    return fullCode;
  } catch (error) {
    console.error('Erro na geração de código:', error);
    return '// Erro na geração de código: ' + error.message;
  }
}

// Função auxiliar para identar corretamente
function indentCode(code) {
  if (!code) return '';
  return code.split('\n').map(line => '  ' + line).join('\n');
}

// Adicionar métodos auxiliares ao gerador Arduino se não existirem
if (Blockly.Arduino) {
  // Método para obter código de valor
  Blockly.Arduino.valueToCode = function(block, name, order) {
    if (order === undefined) {
      order = Blockly.Arduino.ORDER_NONE;
    }
    var targetBlock = block.getInputTargetBlock(name);
    var code = Blockly.Arduino.blockToCode(targetBlock);
    if (Array.isArray(code)) {
      return [code[0], code[1]];
    }
    return [code, order];
  };

  // Método para obter código de statement
  Blockly.Arduino.statementToCode = function(block, name) {
    var targetBlock = block.getInputTargetBlock(name);
    var code = Blockly.Arduino.blockToCode(targetBlock);
    return code;
  };

  // Método para prefixar linhas
  Blockly.Arduino.prefixLines = function(text, prefix) {
    return text.split('\n').map(function(line) {
      return prefix + line;
    }).join('\n');
  };

  // Constante para indentação
  Blockly.Arduino.INDENT = '  ';
}

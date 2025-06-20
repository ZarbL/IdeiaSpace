window.addEventListener('DOMContentLoaded', () => {
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    grid: {
      spacing: 20,
      length: 2,
      colour: '#ccc',
      snap: true
    },
    trashcan: true
  });

  const updateCode = () => {
    try {
      const code = Blockly.Arduino.workspaceToCode(workspace);
      document.getElementById('code-display').textContent = code;
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      document.getElementById('code-display').textContent = '// Erro ao gerar código'; 
    }
  };

  workspace.addChangeListener(() => {
    updateCode();
  });
});

// Gera o código completo com setup e loop
function generateFullArduinoCode(workspace) {
  const loopCode = Blockly.Arduino.workspaceToCode(workspace);
  const includes = '#include <Arduino.h>';
  const setupCode = 'void setup() {\n  Serial.begin(9600);\n}\n';
  const loopWrapper = 'void loop() {\n' + indentCode(loopCode) + '\n}';
  return [includes, setupCode, loopWrapper].join('\n\n');
}

// Função auxiliar para identar corretamente
function indentCode(code) {
  return code.split('\n').map(line => '  ' + line).join('\n');
}

// Gerador para text_print (Serial.println)
Blockly.Arduino['text_print'] = function(block) {
  const msg = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_NONE) || '""';
  return 'Serial.println(' + msg + ');\n';
};

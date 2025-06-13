// blocoesp32_init.js
// Definição dos blocos customizados para ESP32 e geradores C++ correspondentes

// Define os blocos
Blockly.defineBlocksWithJsonArray([
  {
    "type": "mpu6050_read",
    "message0": "ler MPU6050 eixo %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "AXIS",
        "options": [
          ["X","x"],
          ["Y","y"],
          ["Z","z"]
        ]
      }
    ],
    "output": "Number",
    "colour": 230,
    "tooltip": "Lê valor do acelerômetro MPU6050",
    "helpUrl": ""
  },
  {
    "type": "delay_block",
    "message0": "esperar %1 ms",
    "args0": [
      {
        "type": "field_number",
        "name": "DELAY_TIME",
        "value": 1000,
        "min": 0,
        "max": 60000,
        "precision": 1
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "Espera por determinado tempo",
    "helpUrl": ""
  },
  {
    "type": "digital_write",
    "message0": "digitalWrite pino %1 para %2",
    "args0": [
      {
        "type": "field_number",
        "name": "PIN",
        "value": 13,
        "min": 0,
        "max": 40
      },
      {
        "type": "field_dropdown",
        "name": "STATE",
        "options": [
          ["HIGH", "HIGH"],
          ["LOW", "LOW"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Define valor digital em pino",
    "helpUrl": ""
  },
  {
    "type": "digital_read",
    "message0": "digitalRead pino %1",
    "args0": [
      {
        "type": "field_number",
        "name": "PIN",
        "value": 13,
        "min": 0,
        "max": 40
      }
    ],
    "output": "Boolean",
    "colour": 230,
    "tooltip": "Lê valor digital do pino",
    "helpUrl": ""
  }
]);

// Geradores C++ para os blocos
Blockly.Cpp = Blockly.Cpp || {};

// Gerador para leitura do MPU6050 eixo X/Y/Z
Blockly.Cpp['mpu6050_read'] = function(block) {
  var axis = block.getFieldValue('AXIS');
  // Pode ajustar o código conforme sua biblioteca MPU6050 específica
  var code = `mpu6050.read${axis.toUpperCase()}()`;
  return [code, Blockly.Cpp.ORDER_FUNCTION_CALL];
};

// Gerador para delay em milissegundos
Blockly.Cpp['delay_block'] = function(block) {
  var delayTime = block.getFieldValue('DELAY_TIME');
  var code = `delay(${delayTime});\n`;
  return code;
};

// Gerador para digitalWrite (escrita digital)
Blockly.Cpp['digital_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var state = block.getFieldValue('STATE');
  var code = `digitalWrite(${pin}, ${state});\n`;
  return code;
};

// Gerador para digitalRead (leitura digital)
Blockly.Cpp['digital_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var code = `digitalRead(${pin})`;
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

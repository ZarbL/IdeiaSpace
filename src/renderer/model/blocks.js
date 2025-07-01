/**
 * @license
 * Copyright 2024 IdeiaSpace
 * SPDX-License-Identifier: MIT
 */

/**
 * Custom blocks for C++ code generation.
 * @namespace Blockly.Blocks
 */

// Verificar se Blockly está disponível
if (typeof Blockly === 'undefined') {
  console.error('Blockly não está disponível quando blocks.js foi carregado');
}

// ============================================================================
// CUSTOM BLOCKS FOR C++
// ============================================================================

/**
 * Block for delay functionality.
 * @this {Blockly.Block}
 */
Blockly.Blocks['delay_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("delay")
        .appendField(new Blockly.FieldNumber(1000, 0, 60000, 100), "DELAY_TIME")
        .appendField("milliseconds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Delay execution for specified milliseconds");
    this.setHelpUrl("");
  }
};

/**
 * Block for digital write functionality.
 * @this {Blockly.Block}
 */
Blockly.Blocks['digital_write'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("digital write pin")
        .appendField(new Blockly.FieldDropdown([
          ["2", "2"],
          ["3", "3"],
          ["4", "4"],
          ["5", "5"],
          ["6", "6"],
          ["7", "7"],
          ["8", "8"],
          ["9", "9"],
          ["10", "10"],
          ["11", "11"],
          ["12", "12"],
          ["13", "13"]
        ]), "PIN")
        .appendField("to")
        .appendField(new Blockly.FieldDropdown([
          ["HIGH", "HIGH"],
          ["LOW", "LOW"]
        ]), "STATE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Set digital pin to HIGH or LOW");
    this.setHelpUrl("");
  }
};

/**
 * Block for digital read functionality.
 * @this {Blockly.Block}
 */
Blockly.Blocks['digital_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("digital read pin")
        .appendField(new Blockly.FieldDropdown([
          ["2", "2"],
          ["3", "3"],
          ["4", "4"],
          ["5", "5"],
          ["6", "6"],
          ["7", "7"],
          ["8", "8"],
          ["9", "9"],
          ["10", "10"],
          ["11", "11"],
          ["12", "12"],
          ["13", "13"]
        ]), "PIN");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("Read digital pin value (HIGH or LOW)");
    this.setHelpUrl("");
  }
};

/**
 * Block for variable declaration with type.
 * @this {Blockly.Block}
 */
Blockly.Blocks['variable_declaration'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("declarar")
        .appendField(new Blockly.FieldDropdown([
          ["int", "int"],
          ["double", "double"],
          ["string", "std::string"],
          ["bool", "bool"]
        ]), "TYPE")
        .appendField(new Blockly.FieldVariable("variavel"), "VAR");
    this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField("=");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Declara uma nova variável com tipo específico");
    this.setHelpUrl("");
  }
};

/**
 * Block for MPU6050 initialization.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_init'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔧 Inicializar MPU6050")
        .appendField("SCL:")
        .appendField(new Blockly.FieldDropdown([
          ["5", "5"],
          ["21", "21"],
          ["22", "22"]
        ]), "SCL_PIN")
        .appendField("SDA:")
        .appendField(new Blockly.FieldDropdown([
          ["4", "4"],
          ["20", "20"],
          ["21", "21"]
        ]), "SDA_PIN");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("Inicializa o sensor MPU6050 com os pinos SCL e SDA especificados");
    this.setHelpUrl("");
  }
};

/**
 * Block for reading MPU6050 acceleration values.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_accel_x'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📊 Aceleração - X");
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('Lê o valor de aceleração no eixo X do MPU6050');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading MPU6050 acceleration Y values.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_accel_y'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📊 Aceleração - Y");
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('Lê o valor de aceleração no eixo Y do MPU6050');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading MPU6050 acceleration Z values.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_accel_z'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📊 Aceleração - Z");
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('Lê o valor de aceleração no eixo Z do MPU6050');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading MPU6050 gyroscope X values.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_gyro_x'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🌀 Giro - X");
    this.setOutput(true, 'Number');
    this.setColour(270);
    this.setTooltip('Lê o valor de rotação no eixo X do MPU6050');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading MPU6050 gyroscope Y values.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_gyro_y'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🌀 Giro - Y");
    this.setOutput(true, 'Number');
    this.setColour(270);
    this.setTooltip('Lê o valor de rotação no eixo Y do MPU6050');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading MPU6050 gyroscope Z values.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_gyro_z'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🌀 Giro - Z");
    this.setOutput(true, 'Number');
    this.setColour(270);
    this.setTooltip('Lê o valor de rotação no eixo Z do MPU6050');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading MPU6050 sensor values (generic).
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📡 Ler MPU6050')
        .appendField(new Blockly.FieldDropdown([
          ['Aceleração X', 'ACCEL_X'],
          ['Aceleração Y', 'ACCEL_Y'],
          ['Aceleração Z', 'ACCEL_Z'],
          ['Giro X', 'GYRO_X'],
          ['Giro Y', 'GYRO_Y'],
          ['Giro Z', 'GYRO_Z']
        ]), 'MPU6050_AXIS');
    this.setOutput(true, 'Number');
    this.setColour(210);
    this.setTooltip('Lê um valor do sensor MPU6050');
    this.setHelpUrl('https://bipes.net.br');
  }
};

// Blocos MPU6050 definidos com sucesso

// ============================================================================
// BMP180 BLOCKS - Sensor de Pressão, Temperatura e Altitude
// ============================================================================

/**
 * Block for BMP180 initialization.
 * @this {Blockly.Block}
 */
Blockly.Blocks['bmp180_init'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔧 Inicializar BMP180")
        .appendField("SCL:")
        .appendField(new Blockly.FieldDropdown([
          ["5", "5"],
          ["21", "21"],
          ["22", "22"]
        ]), "SCL_PIN")
        .appendField("SDA:")
        .appendField(new Blockly.FieldDropdown([
          ["4", "4"],
          ["20", "20"],
          ["21", "21"]
        ]), "SDA_PIN");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("Inicializa o sensor BMP180 com os pinos SCL e SDA especificados");
    this.setHelpUrl("");
  }
};

/**
 * Block for reading BMP180 pressure values.
 * @this {Blockly.Block}
 */
Blockly.Blocks['bmp180_pressure'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📊 Pressão");
    this.setOutput(true, 'Number');
    this.setColour(200);
    this.setTooltip('Lê o valor de pressão do BMP180 em Pascals');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading BMP180 temperature values.
 * @this {Blockly.Block}
 */
Blockly.Blocks['bmp180_temperature'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🌡️ Temperatura");
    this.setOutput(true, 'Number');
    this.setColour(30);
    this.setTooltip('Lê o valor de temperatura do BMP180 em graus Celsius');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading BMP180 altitude values.
 * @this {Blockly.Block}
 */
Blockly.Blocks['bmp180_altitude'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📏 Altura");
    this.setOutput(true, 'Number');
    this.setColour(260);
    this.setTooltip('Lê o valor de altitude do BMP180 em metros');
    this.setHelpUrl('');
  }
};

// Blocos BMP180 definidos com sucesso

// ============================================================================
// LIBRARY BLOCKS - BIBLIOTECAS
// ============================================================================

/**
 * Block for including BMP180 library.
 * @this {Blockly.Block}
 */
Blockly.Blocks['library_bmp180'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📚")
        .appendField("Incluir biblioteca BMP180");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('Inclui as bibliotecas necessárias para o sensor BMP180 (pressão, temperatura, altitude)');
    this.setHelpUrl('');
  }
};

/**
 * Block for including MPU6050 library.
 * @this {Blockly.Block}
 */
Blockly.Blocks['library_mpu6050'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📚")
        .appendField("Incluir biblioteca MPU6050");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('Inclui as bibliotecas necessárias para o sensor MPU6050 (acelerômetro e giroscópio)');
    this.setHelpUrl('');
  }
};

/**
 * Block for including DHT library.
 * @this {Blockly.Block}
 */
Blockly.Blocks['library_dht'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📚")
        .appendField("Incluir biblioteca DHT")
        .appendField(new Blockly.FieldDropdown([
          ["DHT11", "DHT11"],
          ["DHT22", "DHT22"]
        ]), "TYPE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('Inclui as bibliotecas necessárias para sensores DHT11/DHT22 (temperatura e umidade)');
    this.setHelpUrl('');
  }
};

/**
 * Block for including Wire library (I2C).
 * @this {Blockly.Block}
 */
Blockly.Blocks['library_wire'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📚")
        .appendField("Incluir biblioteca Wire (I2C)");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('Inclui a biblioteca Wire para comunicação I2C');
    this.setHelpUrl('');
  }
};

/**
 * Block for including basic Arduino libraries.
 * @this {Blockly.Block}
 */
Blockly.Blocks['library_arduino_basic'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📚")
        .appendField("Incluir bibliotecas básicas Arduino");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('Inclui as bibliotecas básicas do Arduino (pinMode, digitalWrite, digitalRead, etc.)');
    this.setHelpUrl('');
  }
};

// Blocos de biblioteca definidos com sucesso
// ============================================================================
// DHT SENSOR BLOCKS - SENSORES DHT11/DHT22
// ============================================================================

/**
 * Block for initializing DHT sensor.
 * @this {Blockly.Block}
 */
Blockly.Blocks['dht_init'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔧")
        .appendField("Inicializar DHT")
        .appendField(new Blockly.FieldDropdown([
          ["DHT11", "DHT11"],
          ["DHT22", "DHT22"]
        ]), "TYPE")
        .appendField("no pino")
        .appendField(new Blockly.FieldDropdown([
          ["2", "2"],
          ["3", "3"],
          ["4", "4"],
          ["5", "5"],
          ["6", "6"],
          ["7", "7"],
          ["8", "8"],
          ["9", "9"],
          ["10", "10"],
          ["11", "11"],
          ["12", "12"],
          ["13", "13"],
          ["14", "14"],
          ["15", "15"]
        ]), "PIN");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Inicializa o sensor DHT11 ou DHT22 no pino especificado');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading DHT temperature.
 * @this {Blockly.Block}
 */
Blockly.Blocks['dht_temperature'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🌡️")
        .appendField("Temperatura DHT");
    this.setOutput(true, 'Number');
    this.setColour(30);
    this.setTooltip('Lê o valor de temperatura do sensor DHT em graus Celsius');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading DHT humidity.
 * @this {Blockly.Block}
 */
Blockly.Blocks['dht_humidity'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("💧")
        .appendField("Umidade DHT");
    this.setOutput(true, 'Number');
    this.setColour(200);
    this.setTooltip('Lê o valor de umidade do sensor DHT em porcentagem');
    this.setHelpUrl('');
  }
};

// Blocos DHT definidos com sucesso
// ============================================================================
// ARDUINO STRUCTURE BLOCKS - BLOCOS DE ESTRUTURA ARDUINO
// ============================================================================

/**
 * Block for void setup() function.
 * @this {Blockly.Block}
 */
Blockly.Blocks['arduino_setup'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⚙️ void setup()");
    this.appendStatementInput("SETUP_CODE")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('Função setup() do Arduino - executa uma vez no início');
    this.setHelpUrl('');
  }
};

/**
 * Block for void loop() function.
 * @this {Blockly.Block}
 */
Blockly.Blocks['arduino_loop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔁 void loop()");
    this.appendStatementInput("LOOP_CODE")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('Função loop() do Arduino - executa continuamente');
    this.setHelpUrl('');
  }
};

/**
 * Block for Serial.begin() function.
 * @this {Blockly.Block}
 */
Blockly.Blocks['arduino_serial_begin'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📡 Serial.begin(")
        .appendField(new Blockly.FieldNumber(9600, 300, 115200, 100), "BAUD_RATE")
        .appendField(")");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('Inicializa a comunicação serial com a velocidade especificada');
    this.setHelpUrl('');
  }
};

// Blocos de estrutura Arduino definidos com sucesso
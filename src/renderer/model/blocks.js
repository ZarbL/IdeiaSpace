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
 * Block for MPU6050 accelerometer range configuration.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_set_accel_range'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⚙️ MPU.setAccelerometer")
        .appendField(new Blockly.FieldDropdown([
          ["±2G", "MPU6050_RANGE_2_G"],
          ["±4G", "MPU6050_RANGE_4_G"],
          ["±8G", "MPU6050_RANGE_8_G"],
          ["±16G", "MPU6050_RANGE_16_G"]
        ]), "ACCEL_RANGE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Configura o range do acelerômetro do MPU6050');
    this.setHelpUrl('');
  }
};

/**
 * Block for MPU6050 gyroscope range configuration.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_set_gyro_range'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⚙️ MPU.setGyroRange")
        .appendField(new Blockly.FieldDropdown([
          ["±250°/s", "MPU6050_RANGE_250_DEG"],
          ["±500°/s", "MPU6050_RANGE_500_DEG"],
          ["±1000°/s", "MPU6050_RANGE_1000_DEG"],
          ["±2000°/s", "MPU6050_RANGE_2000_DEG"]
        ]), "GYRO_RANGE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Configura o range do giroscópio do MPU6050');
    this.setHelpUrl('');
  }
};

/**
 * Block for MPU6050 filter bandwidth configuration.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_set_filter_bandwidth'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⚙️ MPU.setFilterBandWidth")
        .appendField(new Blockly.FieldDropdown([
          ["260 Hz", "MPU6050_BAND_260_HZ"],
          ["184 Hz", "MPU6050_BAND_184_HZ"],
          ["94 Hz", "MPU6050_BAND_94_HZ"],
          ["44 Hz", "MPU6050_BAND_44_HZ"],
          ["21 Hz", "MPU6050_BAND_21_HZ"],
          ["10 Hz", "MPU6050_BAND_10_HZ"],
          ["5 Hz", "MPU6050_BAND_5_HZ"]
        ]), "FILTER_BANDWIDTH");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Configura a largura de banda do filtro do MPU6050');
    this.setHelpUrl('');
  }
};

/**
 * Block for MPU6050 sensors event variables declaration.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_sensors_event'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📡 sensors_event_t a, g, temp;");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Declara as variáveis de evento dos sensores do MPU6050');
    this.setHelpUrl('');
  }
};

/**
 * Block for MPU6050 get event function.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_get_event'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔄 mpu.getEvent(&a, &g, &temp);");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Obtém os eventos dos sensores do MPU6050');
    this.setHelpUrl('');
  }
};

// Blocos de configuração MPU6050 definidos com sucesso

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
// BH1750 BLOCKS - Sensor de Luminosidade
// ============================================================================

/**
 * Block for BH1750 initialization.
 * @this {Blockly.Block}
 */
Blockly.Blocks['bh1750_init'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("💡 Inicializar BH1750")
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
    this.setColour(45);
    this.setTooltip("Inicializa o sensor BH1750 com os pinos SCL e SDA especificados");
    this.setHelpUrl("");
  }
};

/**
 * Block for reading BH1750 light level in lux.
 * @this {Blockly.Block}
 */
Blockly.Blocks['bh1750_light_level'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("☀️ Luminosidade (lux)");
    this.setOutput(true, 'Number');
    this.setColour(60);
    this.setTooltip('Lê o valor de luminosidade do BH1750 em lux');
    this.setHelpUrl('');
  }
};

/**
 * Block for setting BH1750 measurement mode.
 * @this {Blockly.Block}
 */
Blockly.Blocks['bh1750_set_mode'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⚙️ Configurar modo BH1750:")
        .appendField(new Blockly.FieldDropdown([
          ["Alta resolução (1 lx)", "BH1750::CONTINUOUS_HIGH_RES_MODE"],
          ["Alta resolução 2 (0.5 lx)", "BH1750::CONTINUOUS_HIGH_RES_MODE_2"],
          ["Baixa resolução (4 lx)", "BH1750::CONTINUOUS_LOW_RES_MODE"],
          ["Uma medição alta res.", "BH1750::ONE_TIME_HIGH_RES_MODE"],
          ["Uma medição alta res. 2", "BH1750::ONE_TIME_HIGH_RES_MODE_2"],
          ["Uma medição baixa res.", "BH1750::ONE_TIME_LOW_RES_MODE"]
        ]), "MODE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(45);
    this.setTooltip("Configura o modo de medição do sensor BH1750");
    this.setHelpUrl("");
  }
};

/**
 * Block for BH1750 begin initialization.
 * @this {Blockly.Block}
 */
Blockly.Blocks['bh1750_begin'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🚀 Iniciar BH1750");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(45);
    this.setTooltip("Inicia a comunicação com o sensor BH1750");
    this.setHelpUrl("");
  }
};

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

/**
 * Block for including Adafruit_Sensor library.
 * @this {Blockly.Block}
 */
Blockly.Blocks['library_sensor'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📚")
        .appendField("Biblioteca AdaFruit");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('Inclui a biblioteca Adafruit_Sensor.h necessária para sensores Adafruit');
    this.setHelpUrl('');
  }
};

/**
 * Block for including BH1750 library.
 * @this {Blockly.Block}
 */
Blockly.Blocks['library_bh1750'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📚")
        .appendField("Incluir biblioteca BH1750");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('Inclui as bibliotecas necessárias para o sensor BH1750 (luminosidade)');
    this.setHelpUrl('');
  }
};

/**
 * Block for including HMC5883 library.
 * @this {Blockly.Block}
 */
Blockly.Blocks['library_hmc5883'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📚")
        .appendField("Biblioteca HMC5883");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('Inclui a biblioteca Adafruit_HMC5883_U.h para magnetômetro/bússola');
    this.setHelpUrl('');
  }
};

// Blocos de biblioteca definidos com sucesso
// ============================================================================
// HMC5883 BLOCKS - Sensor Magnetômetro/Bússola (3 Eixos)
// ============================================================================

/**
 * Block for HMC5883 initialization.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_init'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🧭 Inicializar HMC5883")
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
    this.setColour("#E74C3C");
    this.setTooltip("Inicializa o magnetômetro/bússola HMC5883 com os pinos SCL e SDA especificados");
    this.setHelpUrl("");
  }
};

/**
 * Block for HMC5883 begin initialization.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_begin'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🚀 HMC5883 Begin");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#DC143C");
    this.setTooltip("Inicia a comunicação com o magnetômetro HMC5883");
    this.setHelpUrl("");
  }
};

/**
 * Block for reading HMC5883 magnetic field X axis.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_mag_x'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🧲 Campo Magnético - X");
    this.setOutput(true, 'Number');
    this.setColour("#FF6B6B");
    this.setTooltip('Lê o valor do campo magnético no eixo X em microTesla (μT)');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading HMC5883 magnetic field Y axis.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_mag_y'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🧲 Campo Magnético - Y");
    this.setOutput(true, 'Number');
    this.setColour("#FF6B6B");
    this.setTooltip('Lê o valor do campo magnético no eixo Y em microTesla (μT)');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading HMC5883 magnetic field Z axis.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_mag_z'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🧲 Campo Magnético - Z");
    this.setOutput(true, 'Number');
    this.setColour("#FF6B6B");
    this.setTooltip('Lê o valor do campo magnético no eixo Z em microTesla (μT)');
    this.setHelpUrl('');
  }
};

/**
 * Block for calculating compass heading from HMC5883.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_heading'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🧭 Direção da Bússola (graus)");
    this.setOutput(true, 'Number');
    this.setColour("#8B0000");
    this.setTooltip('Calcula a direção da bússola em graus (0-360°) baseado nos valores X e Y');
    this.setHelpUrl('');
  }
};

/**
 * Block for setting HMC5883 gain/range.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_set_gain'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⚙️ Configurar Ganho HMC5883:")
        .appendField(new Blockly.FieldDropdown([
          ["±1.3 Ga (padrão)", "HMC5883_MAGGAIN_1_3"],
          ["±1.9 Ga", "HMC5883_MAGGAIN_1_9"],
          ["±2.5 Ga", "HMC5883_MAGGAIN_2_5"],
          ["±4.0 Ga", "HMC5883_MAGGAIN_4_0"],
          ["±4.7 Ga", "HMC5883_MAGGAIN_4_7"],
          ["±5.6 Ga", "HMC5883_MAGGAIN_5_6"],
          ["±8.1 Ga", "HMC5883_MAGGAIN_8_1"]
        ]), "GAIN");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#B22222");
    this.setTooltip("Configura o ganho/sensibilidade do magnetômetro HMC5883 (Gauss)");
    this.setHelpUrl("");
  }
};

/**
 * Block for HMC5883 sensor event declaration.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_event_declare'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📡 sensors_event_t event;");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#8B0000");
    this.setTooltip('Declara uma variável de evento para o sensor HMC5883');
    this.setHelpUrl('');
  }
};

/**
 * Block for HMC5883 get event function.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_get_event'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔄 mag.getEvent(&event);");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#8B0000");
    this.setTooltip('Obtém os dados mais recentes do magnetômetro HMC5883');
    this.setHelpUrl('');
  }
};

/**
 * Block for reading magnetic declination angle.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_declination'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🌍 Declinação Magnética:")
        .appendField(new Blockly.FieldNumber(0, -180, 180, 0.1), "DECLINATION")
        .appendField("graus");
    this.setOutput(true, 'Number');
    this.setColour("#A0522D");
    this.setTooltip('Define o ângulo de declinação magnética da sua localização para correção da bússola');
    this.setHelpUrl('');
  }
};

/**
 * Block for compass direction text.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_direction_text'] = {
  init: function() {
    this.appendValueInput("HEADING")
        .setCheck("Number")
        .appendField("🧭 Direção Cardinal:");
    this.setOutput(true, 'String');
    this.setColour("#CD853F");
    this.setTooltip('Converte o ângulo da bússola em direção cardinal (N, NE, E, SE, S, SW, W, NW)');
    this.setHelpUrl('');
  }
};

/**
 * Block for HMC5883 sensor object declaration.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_sensor_object'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🧭 Inicializador HMC5883");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#800000");
    this.setTooltip('Declara o objeto do sensor HMC5883 com ID único');
    this.setHelpUrl('');
  }
};

/**
 * Block for magnetic field strength calculation.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_field_strength'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🧲 Intensidade Total do Campo");
    this.setOutput(true, 'Number');
    this.setColour("#FF1493");
    this.setTooltip('Calcula a intensidade total do campo magnético usando sqrt(X² + Y² + Z²)');
    this.setHelpUrl('');
  }
};

/**
 * Block for HMC5883 sensor information.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_sensor_info'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔍 Sensor HMC5883:")
        .appendField(new Blockly.FieldDropdown([
          ["Sensor name", "sensor_name"],
          ["Sensor version", "sensor_version"], 
          ["Sensor id", "sensor_id"],
          ["Sensor minimo valor", "sensor_min_value"],
          ["Sensor maximo valor", "sensor_max_value"],
          ["Sensor de Resolução", "sensor_resolution"]
        ]), "INFO_TYPE");
    this.setOutput(true, 'String');
    this.setColour("#9932CC");
    this.setTooltip('Obtém informações específicas sobre o sensor HMC5883 (nome, versão, ID, valores min/max, resolução)');
    this.setHelpUrl('');
  }
};

/**
 * Block for HMC5883 display sensor details.
 * @this {Blockly.Block}
 */
Blockly.Blocks['hmc5883_display_sensor'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📋 Display do Sensor HMC5883");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#9932CC");
    this.setTooltip('Chama a função displaySensorDetails() para exibir informações detalhadas do sensor HMC5883');
    this.setHelpUrl('');
  }
};

// Blocos HMC5883 definidos com sucesso

// ============================================================================
// DELAY BLOCK - BLOCO DE DELAY COM VALOR CONECTÁVEL
// ============================================================================

/**
 * Block for delay function that accepts a connectable numeric value.
 * @this {Blockly.Block}
 */
Blockly.Blocks['delay_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⏱️ Delay");
    this.appendValueInput("DELAY_TIME")
        .setCheck("Number")
        .appendField("ms");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#e80074");
    this.setTooltip('Pausa a execução por um número específico de milissegundos');
    this.setHelpUrl('');
  }
};

// Bloco Delay definido com sucesso

// ============================================================================
// TESTE ALTERNATIVO - BLOCO DELAY SIMPLES
// ============================================================================

/**
 * Bloco de teste simples para delay
 */
if (typeof Blockly !== 'undefined' && Blockly.Blocks) {
  console.log('🔧 Definindo bloco delay_test...');
  
  Blockly.Blocks['delay_test'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("⏱️ Delay Teste")
          .appendField(new Blockly.FieldNumber(1000, 0, 60000, 100), "DELAY_TIME")
          .appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Bloco de teste para delay');
      this.setHelpUrl('');
    }
  };
  
  console.log('✅ Bloco delay_test definido com sucesso!');
  
  // Definir gerador também
  if (Blockly.Cpp) {
    Blockly.Cpp['delay_test'] = function(block) {
      var delayTime = block.getFieldValue('DELAY_TIME');
      return 'delay(' + delayTime + ');\n';
    };
    console.log('✅ Gerador delay_test definido com sucesso!');
  }
} else {
  console.error('❌ Blockly não está disponível para definir delay_test');
}

// ============================================================================
// BLOCK VERIFICATION - VERIFICAÇÃO DE BLOCOS
// ============================================================================

// Verificar se o bloco delay_function foi registrado corretamente
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      console.log('🔧 Verificando bloco delay_function...');
      if (Blockly.Blocks['delay_function']) {
        console.log('✅ Bloco delay_function registrado com sucesso!');
      } else {
        console.error('❌ Bloco delay_function não encontrado!');
      }
    }, 500);
  });
}

// Verificação imediata também
setTimeout(function() {
  console.log('🔧 Verificação imediata do bloco delay_function...');
  if (typeof Blockly !== 'undefined' && Blockly.Blocks && Blockly.Blocks['delay_function']) {
    console.log('✅ Bloco delay_function OK!');
  } else {
    console.error('❌ Bloco delay_function não disponível ainda!');
  }
}, 100);

// Bloco Delay definido com sucesso

// ============================================================================
// BOOLEAN BLOCK - BLOCO BOOLEANO PARA MATEMÁTICA
// ============================================================================

/**
 * Block for Boolean values (returns 1 or 0).
 * @this {Blockly.Block}
 */
Blockly.Blocks['math_boolean'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔢 Boolean")
        .appendField(new Blockly.FieldDropdown([
          ["1 (true)", "1"],
          ["0 (false)", "0"]
        ]), "BOOL_VALUE");
    this.setOutput(true, 'Boolean');
    this.setColour("#e80074"); // Cor pink da categoria Matemática
    this.setTooltip('Retorna um valor booleano: 1 para verdadeiro ou 0 para falso');
    this.setHelpUrl('');
  }
};

// Bloco Boolean definido com sucesso

// ============================================================================
// TEXT BLOCKS - BLOCOS DE TEXTO
// ============================================================================

/**
 * Block for text print with newline option.
 * @this {Blockly.Block}
 */
Blockly.Blocks['text_print'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck(['String', 'Number'])
        .appendField('📝 Imprimir');
    this.appendDummyInput()
        .appendField('quebra de linha:')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'ADD_NEWLINE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5C7CFA');
    this.setTooltip('Imprime texto no console serial. Marque a caixa para adicionar quebra de linha.');
    this.setHelpUrl('');
  }
};

/**
 * Block for text input field.
 * @this {Blockly.Block}
 */
Blockly.Blocks['text'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('💬')
        .appendField(new Blockly.FieldTextInput(''), 'TEXT');
    this.setOutput(true, 'String');
    this.setColour('#5C7CFA');
    this.setTooltip('Campo de texto para inserir strings');
    this.setHelpUrl('');
  }
};

/**
 * Block for text concatenation.
 * @this {Blockly.Block}
 */
Blockly.Blocks['text_join'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck(['String', 'Number'])
        .appendField('🔗 Juntar texto');
    this.appendValueInput('B')
        .setCheck(['String', 'Number'])
        .appendField('com');
    this.setOutput(true, 'String');
    this.setColour('#5C7CFA');
    this.setTooltip('Junta dois textos em um só');
    this.setHelpUrl('');
  }
};

// Bloco Text Print definido com sucesso

// ============================================================================
// SISTEMA DE CORES PARA BLOCOS CUSTOMIZADOS
// ============================================================================

// Aplicar cores consistentes aos blocos customizados existentes

// Blocos de delay - Roxo
if (Blockly.Blocks['delay_block']) {
  const originalDelayInit = Blockly.Blocks['delay_block'].init;
  Blockly.Blocks['delay_block'].init = function() {
    originalDelayInit.call(this);
    this.setColour("#8E44AD");
  };
}

// Blocos de hardware - Laranja
if (Blockly.Blocks['digital_write']) {
  const originalDigitalWriteInit = Blockly.Blocks['digital_write'].init;
  Blockly.Blocks['digital_write'].init = function() {
    originalDigitalWriteInit.call(this);
    this.setColour("#FF6B35");
  };
}

if (Blockly.Blocks['digital_read']) {
  const originalDigitalReadInit = Blockly.Blocks['digital_read'].init;
  Blockly.Blocks['digital_read'].init = function() {
    originalDigitalReadInit.call(this);
    this.setColour("#58D68D");
  };
}

// Blocos de variáveis - Azul
if (Blockly.Blocks['variable_declaration']) {
  const originalVarDeclInit = Blockly.Blocks['variable_declaration'].init;
  Blockly.Blocks['variable_declaration'].init = function() {
    originalVarDeclInit.call(this);
    this.setColour("#3498DB");
  };
}

// Blocos MPU6050 - Azul tecnológico
if (Blockly.Blocks['mpu6050_init']) {
  const originalMPUInit = Blockly.Blocks['mpu6050_init'].init;
  Blockly.Blocks['mpu6050_init'].init = function() {
    originalMPUInit.call(this);
    this.setColour("#2E86AB");
  };
}

// Aplicar cores aos outros blocos MPU6050
const mpuAccelBlocks = ['mpu6050_accel_x', 'mpu6050_accel_y', 'mpu6050_accel_z'];
mpuAccelBlocks.forEach(blockType => {
  if (Blockly.Blocks[blockType]) {
    const originalInit = Blockly.Blocks[blockType].init;
    Blockly.Blocks[blockType].init = function() {
      originalInit.call(this);
      this.setColour("#5DADE2");
    };
  }
});

const mpuGyroBlocks = ['mpu6050_gyro_x', 'mpu6050_gyro_y', 'mpu6050_gyro_z'];
mpuGyroBlocks.forEach(blockType => {
  if (Blockly.Blocks[blockType]) {
    const originalInit = Blockly.Blocks[blockType].init;
    Blockly.Blocks[blockType].init = function() {
      originalInit.call(this);
      this.setColour("#85C1E9");
    };
  }
});

const mpuConfigBlocks = ['mpu6050_set_accel_range', 'mpu6050_set_gyro_range', 'mpu6050_set_filter_bandwidth'];
mpuConfigBlocks.forEach(blockType => {
  if (Blockly.Blocks[blockType]) {
    const originalInit = Blockly.Blocks[blockType].init;
    Blockly.Blocks[blockType].init = function() {
      originalInit.call(this);
      this.setColour("#1B4F72");
    };
  }
});

// Blocos BH1750 - Amarelo/Dourado (Luminosidade)
if (Blockly.Blocks['bh1750_init']) {
  const originalBH1750Init = Blockly.Blocks['bh1750_init'].init;
  Blockly.Blocks['bh1750_init'].init = function() {
    originalBH1750Init.call(this);
    this.setColour("#F1C40F");
  };
}

if (Blockly.Blocks['bh1750_light_level']) {
  const originalBH1750Light = Blockly.Blocks['bh1750_light_level'].init;
  Blockly.Blocks['bh1750_light_level'].init = function() {
    originalBH1750Light.call(this);
    this.setColour("#FFD700");
  };
}

if (Blockly.Blocks['bh1750_set_mode']) {
  const originalBH1750Mode = Blockly.Blocks['bh1750_set_mode'].init;
  Blockly.Blocks['bh1750_set_mode'].init = function() {
    originalBH1750Mode.call(this);
    this.setColour("#F39C12");
  };
}

if (Blockly.Blocks['bh1750_begin']) {
  const originalBH1750Begin = Blockly.Blocks['bh1750_begin'].init;
  Blockly.Blocks['bh1750_begin'].init = function() {
    originalBH1750Begin.call(this);
    this.setColour("#FFCC00");
  };
}

if (Blockly.Blocks['library_bh1750']) {
  const originalLibBH1750 = Blockly.Blocks['library_bh1750'].init;
  Blockly.Blocks['library_bh1750'].init = function() {
    originalLibBH1750.call(this);
    this.setColour("#F4D03F");
  };
}

// Blocos BMP180 - Terracota/Laranja
if (Blockly.Blocks['bmp180_init']) {
  const originalBMPInit = Blockly.Blocks['bmp180_init'].init;
  Blockly.Blocks['bmp180_init'].init = function() {
    originalBMPInit.call(this);
    this.setColour("#DC7633");
  };
}

if (Blockly.Blocks['bmp180_pressure']) {
  const originalBMPPressure = Blockly.Blocks['bmp180_pressure'].init;
  Blockly.Blocks['bmp180_pressure'].init = function() {
    originalBMPPressure.call(this);
    this.setColour("#3498DB");
  };
}

if (Blockly.Blocks['bmp180_temperature']) {
  const originalBMPTemp = Blockly.Blocks['bmp180_temperature'].init;
  Blockly.Blocks['bmp180_temperature'].init = function() {
    originalBMPTemp.call(this);
    this.setColour("#E67E22");
  };
}

if (Blockly.Blocks['bmp180_altitude']) {
  const originalBMPAlt = Blockly.Blocks['bmp180_altitude'].init;
  Blockly.Blocks['bmp180_altitude'].init = function() {
    originalBMPAlt.call(this);
    this.setColour("#28B463");
  };
}

// Blocos de estrutura Arduino já definidos com cores corretas

// Blocos de bibliotecas - Roxo escuro
const libraryBlocks = ['library_bmp180', 'library_bh1750', 'library_mpu6050', 'library_dht', 'library_wire', 'library_arduino_basic', 'library_sensor', 'library_hmc5883'];
libraryBlocks.forEach(blockType => {
  if (Blockly.Blocks[blockType]) {
    const originalInit = Blockly.Blocks[blockType].init;
    Blockly.Blocks[blockType].init = function() {
      originalInit.call(this);
      this.setColour("#7D3C98");
    };
  }
});

// Blocos de tempo - Roxo
if (Blockly.Blocks['delay_function']) {
  const originalDelayFunc = Blockly.Blocks['delay_function'].init;
  Blockly.Blocks['delay_function'].init = function() {
    originalDelayFunc.call(this);
    this.setColour("#9B59B6");
  };
}

// Blocos de texto - Verde
if (Blockly.Blocks['text_print']) {
  const originalTextPrint = Blockly.Blocks['text_print'].init;
  Blockly.Blocks['text_print'].init = function() {
    originalTextPrint.call(this);
    this.setColour("#2ECC71");
  };
}

if (Blockly.Blocks['text']) {
  const originalText = Blockly.Blocks['text'].init;
  Blockly.Blocks['text'].init = function() {
    originalText.call(this);
    this.setColour("#27AE60");
  };
}

if (Blockly.Blocks['text_join']) {
  const originalTextJoin = Blockly.Blocks['text_join'].init;
  Blockly.Blocks['text_join'].init = function() {
    originalTextJoin.call(this);
    this.setColour("#28B463");
  };
}

// Bloco booleano matemático - Laranja
if (Blockly.Blocks['math_boolean']) {
  const originalMathBool = Blockly.Blocks['math_boolean'].init;
  Blockly.Blocks['math_boolean'].init = function() {
    originalMathBool.call(this);
    this.setColour("#D68910");
  };
}

// Blocos de estrutura Arduino definidos com sucesso
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

/**
 * Block for DHT begin initialization.
 * @this {Blockly.Block}
 */
Blockly.Blocks['dht_begin'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🚀")
        .appendField("DHT Begin");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Inicializa o sensor DHT - deve ser usado no setup()');
    this.setHelpUrl('');
  }
};

/**
 * Block for calculating heat index.
 * @this {Blockly.Block}
 */
Blockly.Blocks['dht_heat_index'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🌡️🔥")
        .appendField("Calcular Índice de Calor");
    this.appendValueInput("TEMPERATURE")
        .setCheck("Number")
        .appendField("Temperatura:");
    this.appendValueInput("HUMIDITY")
        .setCheck("Number")
        .appendField("Umidade:");
    this.appendValueInput("UNIT")
        .setCheck(["String", "Boolean"])
        .appendField("Condição:");
    this.setOutput(true, 'Number');
    this.setColour(30);
    this.setTooltip('Calcula o índice de calor usando temperatura, umidade e unidade (true para Fahrenheit, false para Celsius)');
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
    this.setColour("#E74C3C");
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
    this.setColour("#E67E22");
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
    this.setColour("#F39C12");
    this.setTooltip('Inicializa a comunicação serial com a velocidade especificada');
    this.setHelpUrl('');
  }
};

/**
 * Block for !Serial condition check.
 * @this {Blockly.Block}
 */
Blockly.Blocks['serial_not'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('❌ !Serial');
    this.setOutput(true, 'Boolean');
    this.setColour("#F39C12");
    this.setTooltip('Verifica se a comunicação serial NÃO está disponível');
    this.setHelpUrl('');
  }
};

/**
 * Block for void displaySensorDetails() function.
 * @this {Blockly.Block}
 */
Blockly.Blocks['void_display'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📋 void displaySensorDetails()");
    this.appendStatementInput("DISPLAY_CODE")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#9B59B6");
    this.setTooltip('Função para exibir detalhes dos sensores - útil para debug e informações');
    this.setHelpUrl('');
  }
};

// Blocos de estrutura Arduino definidos com sucesso

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

/**
 * Block for DHT begin initialization.
 * @this {Blockly.Block}
 */
Blockly.Blocks['dht_begin'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🚀")
        .appendField("DHT Begin");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Inicializa o sensor DHT - deve ser usado no setup()');
    this.setHelpUrl('');
  }
};

/**
 * Block for calculating heat index.
 * @this {Blockly.Block}
 */
Blockly.Blocks['dht_heat_index'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🌡️🔥")
        .appendField("Calcular Índice de Calor");
    this.appendValueInput("TEMPERATURE")
        .setCheck("Number")
        .appendField("Temperatura:");
    this.appendValueInput("HUMIDITY")
        .setCheck("Number")
        .appendField("Umidade:");
    this.appendValueInput("UNIT")
        .setCheck(["String", "Boolean"])
        .appendField("Condição:");
    this.setOutput(true, 'Number');
    this.setColour(30);
    this.setTooltip('Calcula o índice de calor usando temperatura, umidade e unidade (true para Fahrenheit, false para Celsius)');
    this.setHelpUrl('');
  }
};

// Blocos DHT definidos com sucesso
Blockly.defineBlocksWithJsonArray([
  {
    "type": "init_dht",
    "message0": "inicializar DHT11 no pino %1",
    "args0": [
      {
        "type": "field_number",
        "name": "PIN",
        "value": 2
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 200,
    "tooltip": "Inicializa o sensor DHT11",
    "helpUrl": ""
  },
  {
    "type": "read_temp",
    "message0": "ler temperatura",
    "output": "Number",
    "colour": 200,
    "tooltip": "Lê temperatura do DHT11",
    "helpUrl": ""
  },
  {
    "type": "read_humi",
    "message0": "ler umidade",
    "output": "Number",
    "colour": 200,
    "tooltip": "Lê umidade do DHT11",
    "helpUrl": ""
  },
  {
    "type": "init_mpu",
    "message0": "inicializar MPU6050",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 30,
    "tooltip": "Inicializa o sensor MPU6050",
    "helpUrl": ""
  },
  {
    "type": "read_mpu",
    "message0": "ler aceleração X",
    "output": "Number",
    "colour": 30,
    "tooltip": "Lê eixo X da aceleração",
    "helpUrl": ""
  }
]);

Blockly.Arduino['init_dht'] = function(block) {
  const pin = block.getFieldValue('PIN');
  Blockly.Arduino.includes_['dht'] = '#include <Adafruit_Sensor.h>\n#include <DHT.h>\n#include <DHT_U.h>';
  Blockly.Arduino.definitions_['dht_obj'] = `#define DHTPIN ${pin}\n#define DHTTYPE DHT11\nDHT dht(DHTPIN, DHTTYPE);`;
  Blockly.Arduino.setups_['dht_begin'] = 'dht.begin();';
  return '';
};

Blockly.Arduino['read_temp'] = function() {
  return ['dht.readTemperature()', Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['read_humi'] = function() {
  return ['dht.readHumidity()', Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['init_mpu'] = function() {
  Blockly.Arduino.includes_['mpu'] = '#include <Wire.h>\n#include <Adafruit_MPU6050.h>\n#include <Adafruit_Sensor.h>';
  Blockly.Arduino.definitions_['mpu_obj'] = 'Adafruit_MPU6050 mpu;';
  Blockly.Arduino.setups_['mpu_begin'] = 'Wire.begin();\n  mpu.begin();';
  return '';
};

Blockly.Arduino['read_mpu'] = function() {
  Blockly.Arduino.setups_['mpu_event'] = 'sensors_event_t a, g, temp;';
  Blockly.Arduino.setups_['mpu_get_event'] = 'mpu.getEvent(&a, &g, &temp);';
  return ['a.acceleration.x', Blockly.Arduino.ORDER_ATOMIC];
};
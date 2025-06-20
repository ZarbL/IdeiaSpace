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

// Os geradores Arduino estão definidos no arquivo generators/arduino.js
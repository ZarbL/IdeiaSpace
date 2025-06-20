# 🎯 Módulo Arduino do Blockly - Documentação Técnica

## 📋 Visão Geral

O **módulo Arduino do Blockly** é uma implementação completa e customizada desenvolvida especificamente para o projeto **IdeiaSpace Mission**. Este módulo permite a geração de código C++ para Arduino/ESP32 a partir de blocos visuais do Blockly.

## 📁 Estrutura de Arquivos

```
ideiaspace-mission/
├── generators/
│   └── arduino.js          # 🎯 GERADOR PRINCIPAL ARDUINO
├── blocks/
│   ├── custom_blocks.js    # Definições dos blocos customizados
│   └── blocoesp32_init.js  # Blocos específicos para ESP32
├── renderer.js             # Integração com a interface
└── index.html              # Carregamento dos scripts
```

## 🏗️ Arquitetura do Gerador

### Core do Gerador Arduino

O gerador está implementado em `generators/arduino.js` e segue a arquitetura padrão do Blockly:

```javascript
// Inicialização do gerador
Blockly.Arduino = new Blockly.Generator('Arduino');

// Estruturas de dados para organizar o código
Blockly.Arduino.includes_     // Bibliotecas (#include)
Blockly.Arduino.definitions_  // Definições (#define, variáveis)
Blockly.Arduino.setups_       // Código do setup()
Blockly.Arduino.functionNames_ // Funções customizadas
```

### Fluxo de Geração de Código

1. **Inicialização**: `Blockly.Arduino.init()`
2. **Processamento dos Blocos**: `Blockly.Arduino.workspaceToCode()`
3. **Organização**: Separação em includes, definitions, setup
4. **Finalização**: `Blockly.Arduino.finish()` - Montagem do código final

## 🔧 Funcionalidades Implementadas

### 📚 Blocos Básicos do Blockly

#### Lógica e Controle
```javascript
// IF/ELSE
Blockly.Arduino['controls_if'] = function(block) {
  // Gera: if (condição) { código } else { código }
};

// Comparações
Blockly.Arduino['logic_compare'] = function(block) {
  // Gera: a == b, a != b, a < b, etc.
};

// Operações Lógicas
Blockly.Arduino['logic_operation'] = function(block) {
  // Gera: a && b, a || b
};
```

#### Loops
```javascript
// For Loop
Blockly.Arduino['controls_repeat_ext'] = function(block) {
  // Gera: for (int i = 0; i < n; i++) { código }
};

// While Loop
Blockly.Arduino['controls_whileUntil'] = function(block) {
  // Gera: while (condição) { código }
};
```

#### Matemática
```javascript
// Números
Blockly.Arduino['math_number'] = function(block) {
  // Gera: 42, 3.14, etc.
};

// Operações Aritméticas
Blockly.Arduino['math_arithmetic'] = function(block) {
  // Gera: a + b, a * b, a / b, pow(a, b)
};
```

#### Texto e Saída
```javascript
// Strings
Blockly.Arduino['text'] = function(block) {
  // Gera: "Hello World"
};

// Serial Print
Blockly.Arduino['text_print'] = function(block) {
  // Gera: Serial.println("texto");
};
```

#### Variáveis e Funções
```javascript
// Obter Variável
Blockly.Arduino['variables_get'] = function(block) {
  // Gera: nome_da_variavel
};

// Definir Variável
Blockly.Arduino['variables_set'] = function(block) {
  // Gera: nome_da_variavel = valor;
};

// Definir Função
Blockly.Arduino['procedures_defnoreturn'] = function(block) {
  // Gera: void nome_funcao() { código }
};

// Chamar Função
Blockly.Arduino['procedures_callnoreturn'] = function(block) {
  // Gera: nome_funcao();
};
```

### 🚀 Blocos Customizados para ESP32

#### Sensores DHT (Temperatura e Umidade)

```javascript
// Inicialização do DHT
Blockly.Arduino['init_dht'] = function(block) {
  const pin = block.getFieldValue('PIN');
  Blockly.Arduino.includes_['dht'] = '#include <Adafruit_Sensor.h>\n#include <DHT.h>\n#include <DHT_U.h>';
  Blockly.Arduino.definitions_['dht_obj'] = `#define DHTPIN ${pin}\n#define DHTTYPE DHT11\nDHT dht(DHTPIN, DHTTYPE);`;
  Blockly.Arduino.setups_['dht_begin'] = 'dht.begin();';
  return '';
};

// Leitura de Temperatura
Blockly.Arduino['read_temp'] = function() {
  return ['dht.readTemperature()', Blockly.Arduino.ORDER_ATOMIC];
};

// Leitura de Umidade
Blockly.Arduino['read_humi'] = function() {
  return ['dht.readHumidity()', Blockly.Arduino.ORDER_ATOMIC];
};
```

#### Sensores MPU6050 (Acelerômetro/Giroscópio)

```javascript
// Inicialização do MPU6050
Blockly.Arduino['init_mpu'] = function() {
  Blockly.Arduino.includes_['mpu'] = '#include <Wire.h>\n#include <Adafruit_MPU6050.h>\n#include <Adafruit_Sensor.h>';
  Blockly.Arduino.definitions_['mpu_obj'] = 'Adafruit_MPU6050 mpu;';
  Blockly.Arduino.setups_['mpu_begin'] = 'Wire.begin();\n  mpu.begin();';
  return '';
};

// Leitura de Aceleração
Blockly.Arduino['read_mpu'] = function() {
  Blockly.Arduino.setups_['mpu_event'] = 'sensors_event_t a, g, temp;';
  Blockly.Arduino.setups_['mpu_get_event'] = 'mpu.getEvent(&a, &g, &temp);';
  return ['a.acceleration.x', Blockly.Arduino.ORDER_ATOMIC];
};
```

#### I/O Digital

```javascript
// Digital Write
Blockly.Arduino['digital_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var state = block.getFieldValue('STATE');
  return `digitalWrite(${pin}, ${state});\n`;
};

// Digital Read
Blockly.Arduino['digital_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  return [`digitalRead(${pin})`, Blockly.Arduino.ORDER_ATOMIC];
};
```

#### Controle de Tempo

```javascript
// Delay
Blockly.Arduino['delay_block'] = function(block) {
  var delayTime = block.getFieldValue('DELAY_TIME');
  return `delay(${delayTime});\n`;
};
```

## 📝 Exemplos de Geração de Código

### Exemplo 1: Leitura de Sensor DHT

**Blocos no Blockly:**
1. "inicializar DHT11 no pino 2"
2. "ler temperatura"
3. "Serial.println(temperatura)"

**Código Gerado:**
```cpp
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float temperatura = dht.readTemperature();
  Serial.println(temperatura);
}
```

### Exemplo 2: Controle de LED com Condicional

**Blocos no Blockly:**
1. "se temperatura > 25 então"
2. "digitalWrite pino 13 para HIGH"
3. "senão"
4. "digitalWrite pino 13 para LOW"

**Código Gerado:**
```cpp
void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
}

void loop() {
  if (temperatura > 25) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
}
```

### Exemplo 3: Loop com Contador

**Blocos no Blockly:**
1. "repetir 10 vezes"
2. "Serial.println(i)"
3. "esperar 1000 ms"

**Código Gerado:**
```cpp
void setup() {
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < 10; i++) {
    Serial.println(i);
    delay(1000);
  }
}
```

## 🔧 Configuração e Uso

### Carregamento do Módulo

```html
<!-- No index.html -->
<script src="generators/arduino.js"></script>
<script src="blocks/custom_blocks.js"></script>
```

### Inicialização no JavaScript

```javascript
// No renderer.js
Blockly.Arduino.init();

const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox'),
  // outras configurações...
});

// Geração de código
const code = Blockly.Arduino.finish(Blockly.Arduino.workspaceToCode(workspace));
```

### Estrutura do Toolbox

```xml
<xml id="toolbox" style="display: none">
  <category name="Sensores" colour="#FFAA00">
    <block type="init_dht"></block>
    <block type="read_temp"></block>
    <block type="read_humi"></block>
    <block type="init_mpu"></block>
    <block type="read_mpu"></block>
  </category>
  <!-- outras categorias... -->
</xml>
```

## 🐛 Debugging e Troubleshooting

### Problemas Comuns

1. **Erro: "Language Arduino does not know how to generate code"**
   - **Solução**: Verificar se o arquivo `generators/arduino.js` está sendo carregado
   - **Verificar**: Console do navegador para erros de carregamento

2. **Código não está sendo gerado**
   - **Solução**: Verificar se `Blockly.Arduino.init()` foi chamado
   - **Verificar**: Se os blocos estão conectados corretamente

3. **Includes não aparecem no código final**
   - **Solução**: Verificar se os blocos de inicialização estão sendo usados
   - **Verificar**: Se `Blockly.Arduino.includes_` está sendo populado

### Logs de Debug

```javascript
// Adicionar logs para debug
console.log('Includes:', Blockly.Arduino.includes_);
console.log('Definitions:', Blockly.Arduino.definitions_);
console.log('Setups:', Blockly.Arduino.setups_);
```

## 🚀 Extensibilidade

### Adicionando Novos Blocos

1. **Definir o bloco** em `blocks/custom_blocks.js`:
```javascript
Blockly.defineBlocksWithJsonArray([
  {
    "type": "meu_bloco",
    "message0": "meu bloco %1",
    "args0": [
      {
        "type": "field_number",
        "name": "VALOR",
        "value": 0
      }
    ],
    "output": "Number",
    "colour": 160
  }
]);
```

2. **Criar o gerador** em `generators/arduino.js`:
```javascript
Blockly.Arduino['meu_bloco'] = function(block) {
  const valor = block.getFieldValue('VALOR');
  return [valor, Blockly.Arduino.ORDER_ATOMIC];
};
```

3. **Adicionar ao toolbox**:
```xml
<block type="meu_bloco"></block>
```

### Adicionando Novas Bibliotecas

```javascript
// No gerador do bloco
Blockly.Arduino.includes_['minha_lib'] = '#include <MinhaBiblioteca.h>';
Blockly.Arduino.definitions_['minha_obj'] = 'MinhaClasse objeto;';
Blockly.Arduino.setups_['minha_init'] = 'objeto.begin();';
```

## 📚 Recursos Adicionais

### Documentação Oficial
- [Blockly Developer Documentation](https://developers.google.com/blockly)
- [Arduino Reference](https://www.arduino.cc/reference/)
- [ESP32 Arduino Core](https://github.com/espressif/arduino-esp32)

### Bibliotecas Utilizadas
- **DHT Sensor Library**: Para sensores de temperatura e umidade
- **Adafruit MPU6050**: Para acelerômetro/giroscópio
- **Wire Library**: Para comunicação I2C

### Exemplos de Projetos
- Verificar pasta `custom-generator-codelab/` para exemplos de geradores
- Verificar pasta `my-plugin/` para exemplos de plugins

---

**Desenvolvido pela Equipe IdeiaSpace** 🚀

*Para dúvidas técnicas: contato@ideiaspace.com.br* 
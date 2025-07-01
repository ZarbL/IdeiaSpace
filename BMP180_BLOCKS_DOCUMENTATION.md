# Documentação dos Blocos BMP180

## Sensor BMP180 - Pressão, Temperatura e Altitude

O sensor BMP180 foi implementado com sucesso no IdeiaSpace Mission seguindo o padrão dos blocos existentes. Os novos blocos estão disponíveis na categoria **"Pressão"** da barra de ferramentas.

### Blocos Implementados:

#### 1. 🔧 Inicializar BMP180
- **Tipo**: Bloco de ação (statement)
- **Função**: Inicializa o sensor BMP180 com os pinos SCL e SDA especificados
- **Parâmetros**:
  - SCL: Pin para clock (opções: 5, 21, 22)
  - SDA: Pin para dados (opções: 4, 20, 21)
- **Cor**: Verde (#120)
- **Código C++ gerado**:
  ```cpp
  #include <Wire.h>
  #include <Adafruit_BMP085.h>
  Adafruit_BMP085 bmp;
  
  // No setup():
  Wire.begin(SDA_PIN, SCL_PIN);
  if (!bmp.begin()) {
    Serial.println("BMP180 sensor não encontrado!");
    while (1) {}
  }
  ```

#### 2. 🌡️ Temperatura
- **Tipo**: Bloco de valor (value)
- **Função**: Lê o valor de temperatura do BMP180 em graus Celsius
- **Retorno**: Number (float)
- **Cor**: Vermelho (#30)
- **Código C++ gerado**: `bmp.readTemperature()`

#### 3. 📊 Pressão
- **Tipo**: Bloco de valor (value)
- **Função**: Lê o valor de pressão do BMP180 em Pascals
- **Retorno**: Number (long)
- **Cor**: Azul claro (#200)
- **Código C++ gerado**: `bmp.readPressure()`

#### 4. 📏 Altura
- **Tipo**: Bloco de valor (value)
- **Função**: Lê o valor de altitude do BMP180 em metros
- **Retorno**: Number (float)
- **Cor**: Roxo (#260)
- **Código C++ gerado**: `bmp.readAltitude()`

### Exemplo de Uso:

```cpp
#include <Wire.h>
#include <Adafruit_BMP085.h>

Adafruit_BMP085 bmp;

void setup() {
  Serial.begin(9600);
  Wire.begin(4, 5);
  if (!bmp.begin()) {
    Serial.println("BMP180 sensor não encontrado!");
    while (1) {}
  }
}

void loop() {
  Serial.print("Temperatura: ");
  Serial.print(bmp.readTemperature());
  Serial.println(" °C");
  
  Serial.print("Pressão: ");
  Serial.print(bmp.readPressure());
  Serial.println(" Pa");
  
  Serial.print("Altitude: ");
  Serial.print(bmp.readAltitude());
  Serial.println(" m");
  
  delay(1000);
}
```

### Biblioteca Necessária:
- **Adafruit_BMP085** (compatível com BMP180)
- Para instalar no Arduino IDE: Sketch → Include Library → Manage Libraries → Buscar "Adafruit BMP085"

### Conexões Físicas Típicas:
- **VCC**: 3.3V ou 5V
- **GND**: Ground
- **SCL**: Pin configurado no bloco (ex: D5)
- **SDA**: Pin configurado no bloco (ex: D4)

### Características do Sensor:
- **Pressão**: 300-1100 hPa (±1 hPa precisão)
- **Temperatura**: -40 a +85°C (±2°C precisão)
- **Altitude**: Calculada baseada na pressão atmosférica
- **Interface**: I2C
- **Tensão**: 1.8V a 3.6V

### Notas de Implementação:
1. Os blocos seguem o mesmo padrão visual e funcional do MPU6050
2. A inicialização é obrigatória antes de usar os blocos de leitura
3. Cada bloco de leitura automaticamente inclui as dependências necessárias
4. Os ícones foram escolhidos para representar visualmente cada medição
5. O código gerado é otimizado e segue as melhores práticas do Arduino

### Integração com o Sistema:
- ✅ Adicionado em `blocks.js`
- ✅ Gerador C++ em `cpp_generator.js`
- ✅ Interface HTML atualizada
- ✅ Categoria "Pressão" populada com os novos blocos

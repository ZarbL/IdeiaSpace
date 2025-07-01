# Exemplo de Uso dos Blocos MPU6050

## Blocos Disponíveis na Categoria "Sensores > Medidas Inerciais":

### 1. 🔧 Inicializar MPU6050
- **Descrição**: Configura os pinos SCL e SDA para comunicação I2C com o sensor
- **Pinos padrão**: SCL=5, SDA=4 (para ESP32)
- **Uso**: Deve ser usado uma vez, no início do programa

### 2. 📊 Blocos de Aceleração (separados):
- **Aceleração - X**: Lê aceleração no eixo X
- **Aceleração - Y**: Lê aceleração no eixo Y  
- **Aceleração - Z**: Lê aceleração no eixo Z

### 3. 🌀 Blocos de Giroscópio (separados):
- **Giro - X**: Lê velocidade angular no eixo X
- **Giro - Y**: Lê velocidade angular no eixo Y
- **Giro - Z**: Lê velocidade angular no eixo Z

### 4. 📡 Bloco Genérico MPU6050:
- **Ler MPU6050**: Dropdown com todas as opções (Aceleração X/Y/Z e Giro X/Y/Z)

## Exemplo de Código Gerado:

```cpp
#include <Wire.h>
#include <MPU6050.h>

MPU6050 mpu;

void setup() {
  Serial.begin(9600);
  Wire.begin(4, 5);
  mpu.begin();
}

void loop() {
  Serial.println(mpu.getAccelX());
  delay(1000);
}
```

## Como Usar:

1. Abra a categoria "Sensores"
2. Expandir "Medidas Inerciais"
3. Arraste o bloco "🔧 Inicializar MPU6050" primeiro
4. Configure os pinos SCL e SDA se necessário
5. Use os blocos de leitura (📊 para aceleração, 🌀 para giroscópio)
6. Combine com blocos de texto para exibir os valores no Serial Monitor

## Cores dos Blocos:
- **Inicialização**: Verde (cor 120)
- **Aceleração**: Azul claro (cor 230) 
- **Giroscópio**: Roxo (cor 270)
- **Genérico**: Azul médio (cor 210)

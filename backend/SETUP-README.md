# 🎯 Setup Completo do Backend IdeiaSpace

## ✅ Configuração Automática

O projeto está configurado para setup **100% automático**. Quando o usuário executa `npm start` na pasta principal, tudo é configurado automaticamente.

---

## 📋 O que é instalado automaticamente:

### 1. **Arduino CLI** 
- ✅ Download e instalação automática
- ✅ Configuração com caminhos relativos (portável)
- ✅ Versão: 1.0.4

### 2. **ESP32 Core (Platform)**
- ✅ esp32:esp32@3.3.2
- ✅ Todas as ferramentas de compilação
- ✅ Suporte para ESP32 Dev, Wrover, etc.

### 3. **Bibliotecas dos Sensores**
- ✅ **Adafruit MPU6050** - Acelerômetro/Giroscópio
- ✅ **Adafruit BMP085 Library** - BMP180 (Pressão/Temperatura)
- ✅ **Adafruit HMC5883 Unified** - Magnetômetro/Bússola
- ✅ **BH1750** - Sensor de Luminosidade
- ✅ **DHT sensor library** - DHT11/DHT22 (Temperatura/Umidade)
- ✅ **Adafruit SSD1306** - Display OLED
- ✅ **Adafruit GFX Library** - Biblioteca gráfica
- ✅ **Adafruit BusIO** - Comunicação I2C/SPI
- ✅ **Adafruit Unified Sensor** - Base para sensores Adafruit

---

## 🚀 Como usar (para o usuário final):

1. **Abrir o projeto:**
   ```bash
   npm start
   ```

2. **Tudo é configurado automaticamente!**
   - Arduino CLI é baixado e instalado
   - ESP32 core é instalado
   - Todas as bibliotecas são instaladas
   - Backend inicia automaticamente

3. **Criar código com blocos visuais**
   - Arrastar blocos de sensores
   - Código C++ é gerado automaticamente

4. **Upload para ESP32**
   - Clicar em "Executar"
   - Abrir modal "Arduino Development"
   - Selecionar porta COM
   - Clicar em "Upload"
   - Monitor serial mostra dados em tempo real

---

## 🔧 Scripts de Manutenção (opcional):

### Setup manual completo:
```bash
cd backend
npm run setup
```

### Instalar apenas ESP32 core:
```bash
cd backend
npm run install-esp32
```

### Instalar apenas bibliotecas:
```bash
cd backend
npm run install-libraries
```

### Verificar instalação:
```bash
cd backend
node check-prerequisites.js
```

---

## 📁 Estrutura de Diretórios:

```
backend/
├── arduino-cli/                    # Arduino CLI (portável)
│   ├── arduino-cli.exe             # Executável
│   ├── arduino-cli.yaml            # Configuração principal
│   └── config/
│       ├── data/                   # Cores instalados
│       │   └── packages/
│       │       └── esp32/          # ESP32 core e ferramentas
│       ├── downloads/              # Downloads temporários
│       └── user/
│           └── libraries/          # Bibliotecas instaladas
│               ├── Adafruit_MPU6050/
│               ├── Adafruit_BMP085_Library/
│               ├── Adafruit_HMC5883_Unified/
│               ├── BH1750/
│               ├── DHT_sensor_library/
│               └── ...
│
├── services/                       # Serviços do backend
│   ├── arduino-cli-service.js      # Gerencia Arduino CLI
│   └── serial-service.js           # Comunicação serial
│
├── server.js                       # Servidor Express + WebSocket
├── auto-setup.js                   # Setup automático
├── setup-esp32-core.js             # Instalador ESP32
├── setup-libraries.js              # Instalador de bibliotecas
└── install-arduino-cli.js          # Instalador Arduino CLI
```

---

## 🎯 Fluxo de Upload:

1. **Usuário cria código com blocos visuais**
2. **Código C++ é gerado automaticamente**
3. **Usuário abre modal "Arduino Development"**
4. **Seleciona porta COM (ex: COM8)**
5. **Clica em "Upload"**
6. **Backend:**
   - Cria arquivo temporário com o código
   - Compila com Arduino CLI
   - Faz upload para ESP32
   - Retorna logs em tempo real
7. **Monitor serial mostra dados dos sensores**

---

## 🔍 Troubleshooting:

### ESP32 não encontrado:
```bash
cd backend
npm run install-esp32
```

### Biblioteca faltando:
```bash
cd backend
npm run install-libraries
```

### Resetar tudo:
```bash
cd backend
rmdir /s /q arduino-cli
npm run setup
```

### Verificar status:
```bash
cd backend
.\arduino-cli\arduino-cli.exe --config-file .\arduino-cli\arduino-cli.yaml core list
.\arduino-cli\arduino-cli.exe --config-file .\arduino-cli\arduino-cli.yaml lib list
```

---

## 📊 Status Atual:

✅ **Arduino CLI** - Instalado e configurado  
✅ **ESP32 Core 3.3.2** - Instalado  
✅ **9 Bibliotecas** - Todas instaladas  
✅ **Portas COM** - Detectadas (COM3, COM4, COM5, COM6, COM8)  
✅ **Backend** - Funcionando na porta 3001  
✅ **WebSocket** - Funcionando na porta 8080  

---

## 🎉 Resultado:

**O usuário final não precisa fazer NADA!**  
Apenas executar `npm start` e começar a programar com blocos visuais! 🚀

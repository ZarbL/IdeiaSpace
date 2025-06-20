# 🚀 IdeiaSpace Mission

[![Electron Version](https://img.shields.io/badge/Electron-27.0.0-blue.svg)](https://electronjs.org/)
[![Blockly Version](https://img.shields.io/badge/Blockly-10.4.3-green.svg)](https://developers.google.com/blockly)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

O **IdeiaSpace Mission** é uma plataforma digital de programação em blocos desenvolvida pela **IdeiaSpace**, uma startup brasileira focada em educação STEAM (Ciência, Tecnologia, Engenharia, Artes e Matemática).

## 📋 Sobre o Projeto

### Missão
Transformar a educação brasileira através de uma **metodologia inovadora que conecta espaço e educação**, formando um instrumento transformador e emancipador social. Nossa missão é tornar o aluno **protagonista no processo educacional** através do uso do fascínio inato pela temática espacial.

### Objetivo Principal
Desenvolver uma **plataforma digital de programação em blocos** voltada para o **ensino de conceitos aeroespaciais**, com foco em **acessibilidade, interatividade e engajamento**. A plataforma supera as limitações da educação tradicional, oferecendo:

- ✅ **Ambiente intuitivo** para simulação e programação de elementos aeroespaciais
- ✅ **Recursos visuais** e desafios gamificados
- ✅ **Solução especializada** e inspiradora para aprendizado prático
- ✅ **Alinhamento** com padrões educacionais contemporâneos
- ✅ **Estímulo** para carreiras STEM

## 🛠️ Tecnologias Utilizadas

- **Electron** (v27.0.0) - Framework para aplicações desktop multiplataforma
- **Blockly** (v10.4.3) - Biblioteca Google para programação visual em blocos
- **Electron Forge** - Ferramenta para empacotamento e distribuição
- **HTML5/CSS3/JavaScript** - Interface e lógica da aplicação

## 📦 Instalação e Configuração

### Pré-requisitos

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **Git**

### Instalação Local

1. **Clone o repositório**
   ```bash
   git clone https://github.com/ideiaspace/ideiaspace-mission.git
   cd ideiaspace-mission
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute em modo desenvolvimento**
   ```bash
   npm start
   ```

## 🚀 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia a aplicação em modo desenvolvimento |
| `npm run dev` | Inicia a aplicação com flags de desenvolvimento |
| `npm run package` | Empacota a aplicação para distribuição |
| `npm run make` | Cria instaladores para diferentes plataformas |
| `npm run publish` | Publica a aplicação (requer configuração do GitHub) |
| `npm run lint` | Executa verificação de código com ESLint |

## 🏗️ Desenvolvimento

### Estrutura do Projeto

```
ideiaspace-mission/
├── assets/                 # Recursos estáticos (imagens, ícones)
│   └── logo.png
├── blocks/                 # Blocos customizados do Blockly
│   ├── blocoesp32_init.js
│   └── custom_blocks.js
├── generators/             # Geradores de código
│   └── arduino.js          # 🎯 IMPLEMENTAÇÃO DO MÓDULO ARDUINO
├── custom-generator-codelab/  # Exemplo de gerador customizado
├── my-plugin/              # Plugin de exemplo
├── main.js                 # Processo principal do Electron
├── preload.js              # Script de pré-carregamento
├── renderer.js             # Processo de renderização
├── index.html              # Interface principal
├── style.css               # Estilos da aplicação
├── script.js               # Scripts da interface
├── upload.js               # Funcionalidade de upload
├── package.json            # Configurações do projeto
├── forge.config.js         # Configuração Electron Forge
├── env.example             # Exemplo de variáveis
└── README.md               # Documentação principal
```

### 🎯 Implementação do Módulo Arduino

O **módulo Arduino do Blockly** está implementado no arquivo `generators/arduino.js`. Esta é uma implementação completa e customizada que inclui:

#### 📁 Localização
- **Arquivo Principal**: `generators/arduino.js`
- **Blocos Customizados**: `blocks/custom_blocks.js`
- **Integração**: `renderer.js`

#### 🔧 Funcionalidades Implementadas

##### **Geradores de Código Básicos**
- ✅ **Lógica**: `if/else`, comparações, operações lógicas
- ✅ **Loops**: `for`, `while`, `do-while`
- ✅ **Matemática**: operações aritméticas, números
- ✅ **Texto**: strings, `Serial.println()`
- ✅ **Variáveis**: declaração e uso
- ✅ **Funções**: definição e chamada

##### **Geradores ESP32 Customizados**
- ✅ **DHT Sensor**: inicialização e leitura de temperatura/umidade
- ✅ **MPU6050**: inicialização e leitura de aceleração
- ✅ **Digital I/O**: `digitalWrite()`, `digitalRead()`
- ✅ **Delay**: `delay()` em milissegundos

#### 🏗️ Arquitetura do Gerador

```javascript
// Estrutura do gerador Arduino
Blockly.Arduino = new Blockly.Generator('Arduino');

// Seções do código gerado
Blockly.Arduino.includes_     // #include statements
Blockly.Arduino.definitions_  // #define e declarações
Blockly.Arduino.setups_       // void setup() content
Blockly.Arduino.functionNames_ // funções customizadas
```

#### 📝 Exemplo de Geração de Código

```javascript
// Bloco: "inicializar DHT11 no pino 2"
Blockly.Arduino['init_dht'] = function(block) {
  const pin = block.getFieldValue('PIN');
  Blockly.Arduino.includes_['dht'] = '#include <DHT.h>';
  Blockly.Arduino.definitions_['dht_obj'] = `DHT dht(${pin}, DHT11);`;
  Blockly.Arduino.setups_['dht_begin'] = 'dht.begin();';
  return '';
};
```

**Código Gerado:**
```cpp
#include <DHT.h>

DHT dht(2, DHT11);

void setup() {
  dht.begin();
}

void loop() {
  // Código do usuário aqui
}
```

### Funcionalidades Principais

#### 🧩 Blocos de Programação
- **Lógica**: Controles condicionais, comparações, operações lógicas
- **Loops**: Repetições e estruturas de controle
- **Matemática**: Operações aritméticas e números
- **Texto**: Manipulação e exibição de texto
- **Variáveis**: Declaração e uso de variáveis
- **Funções**: Criação de procedimentos customizados
- **Sensores**: Blocos específicos para sensores ESP32
  - DHT (Temperatura e Umidade)
  - MPU (Acelerômetro/Giroscópio)

#### 🔧 Recursos Técnicos
- **Geração de código C++** em tempo real
- **Interface responsiva** e intuitiva
- **Suporte a múltiplas plataformas** (Windows, macOS, Linux)
- **Sistema de upload** para dispositivos ESP32

## 📦 Build e Distribuição

### Configuração do Electron Forge

O projeto está configurado com **Electron Forge** para facilitar o processo de build e distribuição. A configuração inclui:

#### Makers Configurados
- **Windows**: `.exe` (Squirrel) e `.zip`
- **macOS**: `.dmg` e `.zip`
- **Linux**: `.deb` (Debian/Ubuntu) e `.rpm` (Red Hat/Fedora)

#### Configuração de Empacotamento
```json
{
  "packagerConfig": {
    "name": "IdeiaSpace Mission",
    "icon": "./assets/logo.png",
    "asar": true,
    "overwrite": true
  }
}
```

### Processo de Build

1. **Empacotar a aplicação**
   ```bash
   npm run package
   ```

2. **Criar instaladores**
   ```bash
   npm run make
   ```

3. **Publicar (opcional)**
   ```bash
   npm run publish
   ```

### Arquivos Gerados

Após o build, os arquivos serão gerados em:
- `out/ideiaspace-mission-win32-x64/` - Windows
- `out/ideiaspace-mission-darwin-x64/` - macOS
- `out/ideiaspace-mission-linux-x64/` - Linux

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=development
ELECTRON_IS_DEV=true
```

### Debugging

Para debuggar a aplicação:

1. **Processo Principal**: Use `console.log()` no `main.js`
2. **Processo de Renderização**: Use DevTools (Ctrl+Shift+I / Cmd+Option+I)
3. **Preload**: Use `console.log()` no `preload.js`

### Hot Reload

Para desenvolvimento com hot reload:

```bash
npm run dev
```

## 📚 Documentação da API

### Blocos Customizados

#### Sensores DHT
```javascript
// Inicializar sensor DHT
init_dht(pin, type)

// Ler temperatura
read_temp()

// Ler umidade
read_humi()
```

#### Sensores MPU
```javascript
// Inicializar sensor MPU
init_mpu()

// Ler dados do MPU
read_mpu()
```

### Eventos da Aplicação

```javascript
// Evento de geração de código
Blockly.Arduino.addReservedWords('code');

// Evento de execução
document.getElementById('startButton').addEventListener('click', function() {
  // Lógica de execução
});
```

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Padrões de Código

- Use **ESLint** para verificação de código
- Siga as **convenções** do projeto
- Documente **novas funcionalidades**
- Teste suas **mudanças**

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Email**: contato@ideiaspace.com.br
- **Website**: [ideiaspace.com.br](https://ideiaspace.com.br)
- **GitHub Issues**: [Reportar Bug](https://github.com/ideiaspace/ideiaspace-mission/issues)

## 🙏 Agradecimentos

- **Google Blockly** - Biblioteca de programação visual
- **Electron Team** - Framework para aplicações desktop
- **Comunidade Open Source** - Contribuições e feedback

---

**Desenvolvido com ❤️ pela Equipe IdeiaSpace**

*Transformando a educação através da tecnologia espacial*
# 🛠️ Guia de Desenvolvimento - IdeiaSpace Mission

Este documento contém informações detalhadas para desenvolvedores que desejam contribuir ou trabalhar no projeto IdeiaSpace Mission.

## 📋 Índice

1. [Configuração do Ambiente](#configuração-do-ambiente)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Desenvolvimento de Blocos](#desenvolvimento-de-blocos)
4. [Processo de Build](#processo-de-build)
5. [Debugging](#debugging)
6. [Testes](#testes)
7. [Deploy](#deploy)

## 🔧 Configuração do Ambiente

### Requisitos do Sistema

- **Node.js**: v16.0.0 ou superior
- **npm**: v8.0.0 ou superior
- **Git**: v2.30.0 ou superior
- **Electron**: v27.0.0 (instalado automaticamente)

### Instalação Completa

```bash
# Clone o repositório
git clone https://github.com/ideiaspace/ideiaspace-mission.git
cd ideiaspace-mission

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env

# Inicie o modo desenvolvimento
npm run dev
```

### Estrutura de Arquivos

```
ideiaspace-mission/
├── assets/                 # Recursos estáticos
│   ├── logo.png           # Logo principal
│   └── logo.ico           # Ícone para Windows
├── blocks/                # Blocos customizados
│   ├── blocoesp32_init.js # Inicialização ESP32
│   └── custom_blocks.js   # Blocos personalizados
├── custom-generator-codelab/ # Exemplo de gerador
├── my-plugin/             # Plugin de exemplo
├── main.js                # Processo principal Electron
├── preload.js             # Script de pré-carregamento
├── renderer.js            # Processo de renderização
├── index.html             # Interface principal
├── style.css              # Estilos CSS
├── script.js              # Scripts da interface
├── upload.js              # Sistema de upload
├── package.json           # Configurações npm
├── forge.config.js        # Configuração Electron Forge
├── env.example            # Exemplo de variáveis
└── README.md              # Documentação principal
```

## 🏗️ Arquitetura do Projeto

### Fluxo de Dados

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Interface     │    │   Blockly       │    │   Gerador       │
│   (HTML/CSS)    │◄──►│   Workspace     │◄──►│   C++ Code      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Renderer      │    │   Custom        │    │   Upload        │
│   Process       │    │   Blocks        │    │   System        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Componentes Principais

#### 1. Processo Principal (`main.js`)
- Gerencia a janela principal do Electron
- Configura as preferências de segurança
- Controla o ciclo de vida da aplicação

#### 2. Processo de Renderização (`renderer.js`)
- Interface com o DOM
- Gerenciamento de eventos do Blockly
- Comunicação com o processo principal

#### 3. Blocos Customizados (`blocks/`)
- Definição de blocos específicos para ESP32
- Integração com sensores (DHT, MPU)
- Geração de código C++

## 🧩 Desenvolvimento de Blocos

### Estrutura de um Bloco

```javascript
// Exemplo de bloco customizado
Blockly.Blocks['init_dht'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Inicializar DHT")
        .appendField(new Blockly.FieldDropdown([
          ["DHT11", "DHT11"],
          ["DHT22", "DHT22"]
        ]), "TYPE")
        .appendField("no pino")
        .appendField(new Blockly.FieldNumber(2, 1, 40), "PIN");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Inicializa sensor DHT");
  }
};
```

### Gerador de Código

```javascript
// Gerador correspondente
Blockly.JavaScript['init_dht'] = function(block) {
  var dropdown_type = block.getFieldValue('TYPE');
  var number_pin = block.getFieldValue('PIN');
  
  var code = `DHT dht(${number_pin}, ${dropdown_type});\n`;
  return code;
};
```

### Adicionando Novos Blocos

1. **Defina o bloco** em `blocks/custom_blocks.js`
2. **Crie o gerador** correspondente
3. **Adicione ao toolbox** em `index.html`
4. **Teste** a funcionalidade

## 🔨 Processo de Build

### Build Local

```bash
# Empacotar aplicação
npm run package

# Criar instaladores
npm run make

# Verificar arquivos gerados
ls out/
```

### Build para Plataforma Específica

```bash
# Windows
npm run make -- --platform win32

# macOS
npm run make -- --platform darwin

# Linux
npm run make -- --platform linux
```

### Configuração de Build

O arquivo `forge.config.js` contém todas as configurações:

```javascript
module.exports = {
  packagerConfig: {
    name: "IdeiaSpace Mission",
    icon: "./assets/logo.png",
    asar: true,
    overwrite: true
  },
  makers: [
    // Configurações para cada plataforma
  ]
};
```

## 🐛 Debugging

### Debug do Processo Principal

```javascript
// main.js
console.log('Processo principal iniciado');

// Abrir DevTools automaticamente
win.webContents.openDevTools();
```

### Debug do Processo de Renderização

```javascript
// renderer.js
console.log('Processo de renderização carregado');

// Debug de eventos do Blockly
workspace.addChangeListener(function(event) {
  console.log('Evento Blockly:', event);
});
```

### Ferramentas de Debug

1. **DevTools**: Ctrl+Shift+I (Windows/Linux) ou Cmd+Option+I (macOS)
2. **Console**: Para logs e erros
3. **Network**: Para requisições HTTP
4. **Application**: Para storage e cache

### Debug de Blocos

```javascript
// Debug de geração de código
Blockly.JavaScript.addReservedWords('code');
console.log('Código gerado:', code);
```

## 🧪 Testes

### Testes Manuais

1. **Teste de Interface**
   - Verificar responsividade
   - Testar todos os blocos
   - Validar geração de código

2. **Teste de Funcionalidade**
   - Upload de código
   - Comunicação com ESP32
   - Persistência de dados

### Testes Automatizados

```bash
# Executar linting
npm run lint

# Verificar dependências
npm audit

# Testar build
npm run package
```

## 🚀 Deploy

### Preparação para Release

1. **Atualizar versão**
   ```bash
   npm version patch  # ou minor/major
   ```

2. **Build de produção**
   ```bash
   npm run make
   ```

3. **Testar instaladores**
   - Windows: `.exe` e `.zip`
   - macOS: `.dmg` e `.zip`
   - Linux: `.deb` e `.rpm`

### Publicação

```bash
# Publicar no GitHub
npm run publish

# Verificar release
# Acesse: https://github.com/ideiaspace/ideiaspace-mission/releases
```

### Configuração de CI/CD

```yaml
# .github/workflows/build.yml
name: Build and Release
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run make
      - uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: out/
```

## 📚 Recursos Adicionais

### Documentação Oficial

- [Electron Documentation](https://www.electronjs.org/docs)
- [Blockly Documentation](https://developers.google.com/blockly)
- [Electron Forge Documentation](https://www.electronforge.io/)

### Comunidade

- [Electron Discord](https://discord.gg/electron)
- [Blockly Google Group](https://groups.google.com/forum/#!forum/blockly)
- [IdeiaSpace Community](https://ideiaspace.com.br/community)

### Ferramentas Úteis

- **Electron DevTools**: Para debugging avançado
- **Blockly Developer Tools**: Para desenvolvimento de blocos
- **VS Code Extensions**: Electron e Blockly support

---

**Precisa de ajuda?** Entre em contato: contato@ideiaspace.com.br 
# IdeiaSpace Mission

Uma aplicação desktop desenvolvida com Electron para programação visual de placas ESP32 usando Blockly, com Arduino CLI integrado.

## 🚀 Visão Geral

O IdeiaSpace Mission é uma ferramenta educacional que combina programação visual com geração de código C++ para ESP32. Usando blocos visuais do Blockly, os usuários podem criar programas para microcontroladores de forma intuitiva, ideal para ensino de conceitos aeroespaciais e programação embarcada.

### Características Principais

- **Interface Visual Intuitiva**: Programação por blocos usando Blockly
- **Arduino CLI Integrado**: Upload direto para ESP32, sem Arduino IDE
- **Cores ESP32 Pré-instalados**: Suporte completo para ESP32
- **9 Bibliotecas Incluídas**: Sensores e displays prontos para usar
- **100% Offline**: Funciona sem internet após instalação
- **Aplicação Desktop**: Interface nativa usando Electron
- **Tempo Real**: Geração de código instantânea
- **Educacional**: Ideal para ensino de programação e aeroespacial

## � Para Usuários Finais

### Download e Instalação (Windows)

1. Baixe o instalador: **`IdeiaSpace-Mission-Setup.exe`**
2. Execute o instalador (duplo clique)
3. Aguarde a instalação (~30 segundos)
4. Abra do Menu Iniciar: **IdeiaSpace Mission**

**Pronto para usar!** ✨

Não precisa instalar Arduino IDE, drivers ou bibliotecas - tudo está incluído!

---

## 👨‍💻 Para Desenvolvedores

## �📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm
- Git
- Windows 10/11 (para build)

## 🛠️ Instalação (Desenvolvimento)

1. **Clone o repositório**:
```bash
git clone https://github.com/ZarbL/IdeiaSpace.git
cd IdeiaSpace
```

2. **Instale as dependências e configure tudo**:
```bash
npm run setup
```

Este comando irá:
- ✅ Instalar dependências do projeto
- ✅ Instalar dependências do backend
- ✅ Baixar e configurar Arduino CLI
- ✅ Instalar cores ESP32
- ✅ Instalar bibliotecas necessárias

⏱️ **Tempo estimado:** 5-15 minutos (depende da conexão)

3. **Execute em modo de desenvolvimento**:
```bash
npm start
```

## 📦 Criar Instalador para Distribuição

### Opção 1: Script Automático (Windows)
```cmd
build-windows.bat
```

### Opção 2: Linha de Comando
```bash
npm run build:windows
```

📁 **Resultado:** `out/make/squirrel.windows/x64/IdeiaSpace-Mission-Setup.exe`

📖 **Documentação completa:** [BUILD.md](./BUILD.md)  
⚡ **Guia rápido:** [QUICK-BUILD.md](./QUICK-BUILD.md)

## 🏗️ Estrutura do Projeto

```
IdeiaSpace/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.js             # Processo principal
│   │   └── preload.js          # Preload script
│   ├── renderer/               # Interface do usuário
│   │   ├── view/
│   │   │   ├── index.html      # Interface principal
│   │   │   └── style.css       # Estilos
│   │   ├── controller/
│   │   │   ├── renderer.js     # Lógica da interface
│   │   │   ├── arduino-cli-client.js
│   │   │   └── i18n.js         # Internacionalização
│   │   ├── model/
│   │   │   ├── blocks.js       # Definições Blockly
│   │   │   └── cpp_generator.js # Gerador C++
│   │   └── locales/
│   │       ├── pt-BR.json      # Português
│   │       └── en-US.json      # Inglês
│   └── assets/                 # Logo, ícones
├── backend/                    # Backend Node.js
│   ├── arduino-cli/           # Arduino CLI + ESP32 + Libs
│   │   ├── arduino-cli.exe
│   │   └── config/
│   │       ├── data/packages/esp32/
│   │       └── user/libraries/
│   ├── server.js              # Servidor HTTP/WebSocket
│   ├── config.js              # Configurações
│   ├── auto-setup.js          # Setup automático
│   └── services/              # Serviços (serial, arduino-cli)
├── build-prepare.js           # Preparação de build
├── build-validate.js          # Validação de build
├── .forge-hooks.js           # Hooks de build
├── forge.config.js           # Config Electron Forge
├── package.json              # Dependências e scripts
├── BUILD.md                  # Documentação de build
├── QUICK-BUILD.md            # Guia rápido
└── README.md                 # Este arquivo
```
├── CHANGELOG.md           # Histórico de mudanças
└── CPP_MODULE.md          # Documentação do módulo C++
```

## 🎯 Funcionalidades

### Blocos Disponíveis

#### Lógica e Controle
- **IF/ELSE**: Estruturas condicionais
- **Comparações**: Operadores de comparação (==, !=, <, >, etc.)
- **Operações Lógicas**: AND (&&), OR (||)
- **Booleanos**: true/false

#### Loops
- **Repeat**: Loop for com contador
- **While/Until**: Loops condicionais

#### Matemática
- **Números**: Valores numéricos
- **Operações Aritméticas**: +, -, *, /, ^

#### Texto
- **String**: Texto literal
- **Print**: Saída para console (std::cout)

#### Variáveis e Funções
- **Get/Set**: Manipulação de variáveis
- **Definir/Chamar**: Criação e uso de funções

#### Controle
- **Delay**: Pausa em millisegundos
- **Digital Write**: Controlar pino digital
- **Digital Read**: Ler pino digital

### Geração de Código

O sistema gera código C++ estruturado com:

```cpp
#include <iostream>
#include <chrono>
#include <thread>

void minhaFuncao() {
  std::cout << "Hello World!" << std::endl;
}

int main() {
  int contador = 0;
  
  for (int i = 0; i < 5; i++) {
    std::cout << "Iteração: " << i << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(1000));
    contador = contador + 1;
  }
  
  if (contador > 3) {
    std::cout << "Contador é maior que 3" << std::endl;
  }
  
  return 0;
}
```

## 🚀 Desenvolvimento

### Scripts Disponíveis

```bash
# Executar em modo de desenvolvimento
npm start

# Construir para produção
npm run make

# Empacotar aplicação
npm run package

# Publicar distribuição
npm run publish
```

### Configuração do Electron Forge

O projeto usa Electron Forge para build e distribuição. A configuração está em `forge.config.js`:

```javascript
module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon.ico'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
```

## 📦 Build e Distribuição

### Build Local

```bash
# Instalar dependências
npm install

# Construir aplicação
npm run make

# Os arquivos serão gerados em out/
```

### Distribuição

```bash
# Publicar para distribuição
npm run publish

# Isso irá:
# 1. Construir a aplicação
# 2. Criar instaladores
# 3. Fazer upload para GitHub Releases
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `env.example`:

```bash
# Configurações da aplicação
APP_NAME=IdeiaSpace Mission
APP_VERSION=1.0.0

# Configurações do GitHub
GITHUB_TOKEN=seu_token_aqui
GITHUB_REPO=seu-usuario/ideiaspace-mission

# Configurações de build
BUILD_TARGET=win32,linux,darwin
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage
```

## 📚 Documentação

- **[DEVELOPMENT.md](DEVELOPMENT.md)**: Guia completo para desenvolvedores
- **[CPP_MODULE.md](CPP_MODULE.md)**: Documentação do módulo C++
- **[CHANGELOG.md](CHANGELOG.md)**: Histórico de mudanças

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Padrões de Código

- Use ESLint para linting
- Siga as convenções do projeto
- Adicione testes para novas funcionalidades
- Documente mudanças importantes

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/ideiaspace-mission/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/ideiaspace-mission/wiki)
- **Email**: contato@ideiaspace.com.br

## 🏆 Roadmap

### Versão 1.1
- [ ] Suporte a classes C++
- [ ] Debugging visual
- [ ] Mais blocos matemáticos

### Versão 1.2
- [ ] Suporte a bibliotecas externas
- [ ] Templates C++
- [ ] Análise estática de código

### Versão 2.0
- [ ] Suporte a múltiplas linguagens
- [ ] Integração com IDEs
- [ ] Colaboração em tempo real

## 🙏 Agradecimentos

- **Blockly Team**: Pela excelente biblioteca de programação visual
- **Electron Team**: Pela plataforma desktop
- **Comunidade Open Source**: Por todas as contribuições

---

**Desenvolvido com ❤️ pela Equipe IdeiaSpace**

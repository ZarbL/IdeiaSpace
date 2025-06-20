# IdeiaSpace Mission

Uma aplicação desktop desenvolvida com Electron que permite programação visual usando Blockly para gerar código C++.

## 🚀 Visão Geral

O IdeiaSpace Mission é uma ferramenta educacional que combina programação visual com geração de código C++. Usando blocos visuais do Blockly, os usuários podem criar programas C++ de forma intuitiva e visual, ideal para aprendizado de programação.

### Características Principais

- **Interface Visual Intuitiva**: Programação por blocos usando Blockly
- **Geração de Código C++**: Código C++ padrão e limpo
- **Aplicação Desktop**: Interface nativa usando Electron
- **Tempo Real**: Geração de código instantânea
- **Educacional**: Ideal para ensino de programação

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Git

## 🛠️ Instalação

1. **Clone o repositório**:
```bash
git clone https://github.com/seu-usuario/ideiaspace-mission.git
cd ideiaspace-mission
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Execute em modo de desenvolvimento**:
```bash
npm start
```

## 🏗️ Estrutura do Projeto

```
IdeiaSpace/
├── assets/                 # Recursos estáticos (logo, imagens)
├── blocks/                 # Definições dos blocos customizados
│   └── custom_blocks.js    # Blocos C++ personalizados
├── generators/             # Geradores de código
│   └── cpp.js             # Gerador de código C++
├── .github/               # Configurações do GitHub
├── index.html             # Interface principal
├── main.js                # Processo principal do Electron
├── preload.js             # Script de pré-carregamento
├── renderer.js            # Processo de renderização
├── style.css              # Estilos da interface
├── package.json           # Configurações do projeto
├── forge.config.js        # Configuração do Electron Forge
├── README.md              # Este arquivo
├── DEVELOPMENT.md         # Guia de desenvolvimento
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
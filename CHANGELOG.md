# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2025-01-10

### ✨ Adicionado
- **Sensor BH1750** - Suporte completo para sensor de luminosidade
  - 💡 Bloco de inicialização com configuração de pinos I2C
  - ☀️ Bloco de leitura de luminosidade em lux (0-65535)
  - ⚙️ Bloco de configuração de modo de medição (6 opções de resolução)
  - 🚀 Bloco de inicialização de comunicação
  - 📚 Bloco de inclusão de biblioteca BH1750
- **Documentação BH1750** - Guia completo de uso e especificações técnicas
- **Estilos visuais** - Tema amarelo/dourado para blocos de luminosidade
- **Integração completa** - Aba dedicada na categoria Sensores

### 🔧 Melhorado
- **Organização de sensores** - Estrutura mais clara na categoria Sensores
- **Geração de código** - Suporte otimizado para comunicação I2C
- **Validação de biblioteca** - Sistema atualizado para incluir BH1750

### 🐛 Correções
- **Blocos BH1750** - Removida geração automática de bibliotecas, agora usa aba Bibliotecas dedicada
- **Ordem de código** - Corrigida prioridade de geração, biblioteca BH1750 agora aparece antes da inicialização
- **Biblioteca BH1750** - Removida geração automática do Wire.h, agora gera apenas BH1750.h específico
- **Inicialização BH1750** - Corrigido bloco para gerar declaração do objeto `BH1750 lightMeter;`
- **Leitura de luminosidade** - Corrigido gerador do bloco "Ler nível de luz BH1750" para gerar `lightMeter.readLightLevel()` ao invés de comandos de inicialização

### 🎯 Aplicações Aeroespaciais
- Monitoramento de condições de voo (dia/noite)
- Controle automático de painéis solares
- Sistemas de navegação baseados em luminosidade
- Controle de iluminação de sinalização
- Experimentos de radiação solar em altitude

## [1.0.0] - 2024-01-XX

### 🎉 Lançamento Inicial

#### ✨ Adicionado
- **Interface principal** com Blockly para programação visual
- **Blocos customizados** para sensores ESP32 (DHT, MPU)
- **Geração de código C++** em tempo real
- **Sistema de upload** para dispositivos ESP32
- **Interface responsiva** e moderna
- **Suporte multiplataforma** (Windows, macOS, Linux)
- **Configuração Electron Forge** para build e distribuição
- **Documentação completa** com README e guias de desenvolvimento
- **Workflow CI/CD** com GitHub Actions
- **Sistema de versionamento** semântico

#### 🧩 Blocos de Programação
- **Lógica**: Sensores condicionais, comparações, operações lógicas
- **Loops**: Repetições e estruturas de sensores
- **Matemática**: Operações aritméticas e números
- **Texto**: Manipulação e exibição de texto
- **Variáveis**: Declaração e uso de variáveis
- **Funções**: Criação de procedimentos customizados
- **Sensores ESP32**:
  - DHT (Temperatura e Umidade)
  - MPU (Acelerômetro/Giroscópio)

#### 🔧 Recursos Técnicos
- **Electron v27.0.0** como framework base
- **Blockly v10.4.3** para programação visual
- **Electron Forge** para empacotamento e distribuição
- **ESLint** para verificação de código
- **GitHub Actions** para CI/CD automatizado

#### 📚 Documentação
- **README.md** completo com instruções de instalação e uso
- **DEVELOPMENT.md** com guia detalhado para desenvolvedores
- **CHANGELOG.md** para histórico de mudanças
- **forge.config.js** com configurações de build
- **env.example** com variáveis de ambiente

#### 🚀 Distribuição
- **Windows**: Instalador `.exe` (Squirrel) e arquivo `.zip`
- **macOS**: Instalador `.dmg` e arquivo `.zip`
- **Linux**: Pacotes `.deb` (Debian/Ubuntu) e `.rpm` (Red Hat/Fedora)
- **Publicação automática** no GitHub Releases

### 🔄 Mudanças
- Migração de projeto simples para aplicação Electron completa
- Implementação de sistema de build automatizado
- Adição de documentação profissional

### 🐛 Correções
- Nenhuma correção aplicada (lançamento inicial)

---

## [0.1.0] - 2024-01-XX

### 🚧 Versão Beta

#### ✨ Adicionado
- **Protótipo inicial** da interface Blockly
- **Blocos básicos** para programação
- **Geração simples** de código C++
- **Interface básica** HTML/CSS

#### 🔧 Recursos Técnicos
- **Blockly** integração básica
- **JavaScript** para lógica da aplicação
- **CSS** para estilização básica

---

## 📋 Convenções

### Tipos de Mudanças
- **✨ Adicionado**: Novas funcionalidades
- **🔧 Recursos Técnicos**: Melhorias técnicas
- **🔄 Mudanças**: Mudanças em funcionalidades existentes
- **🐛 Correções**: Correções de bugs
- **🚀 Distribuição**: Mudanças relacionadas à distribuição
- **📚 Documentação**: Mudanças na documentação
- **🧩 Blocos**: Mudanças nos blocos de programação

### Versionamento
- **MAJOR.MINOR.PATCH**
  - **MAJOR**: Mudanças incompatíveis com versões anteriores
  - **MINOR**: Novas funcionalidades compatíveis
  - **PATCH**: Correções de bugs compatíveis

---

## 🔗 Links Úteis

- [GitHub Releases](https://github.com/ideiaspace/ideiaspace-mission/releases)
- [Documentação Completa](README.md)
- [Guia de Desenvolvimento](DEVELOPMENT.md)
- [Website IdeiaSpace](https://ideiaspace.com.br)

---

**Desenvolvido com ❤️ pela Equipe IdeiaSpace**
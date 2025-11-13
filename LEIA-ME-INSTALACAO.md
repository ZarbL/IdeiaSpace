# 🚀 IdeiaSpace Mission - Guia de Instalação

Bem-vindo ao **IdeiaSpace Mission**! Este guia irá ajudá-lo a configurar o aplicativo pela primeira vez.

---

## 📋 Requisitos Mínimos

- **Sistema Operacional:** Windows 10 ou superior (64-bit)
- **Memória RAM:** Mínimo 4 GB (recomendado 8 GB)
- **Espaço em Disco:** Mínimo 2 GB livres
- **Internet:** Conexão necessária para download inicial (~300-400 MB)
- **Porta USB:** Para conectar o ESP32

---

## 🎯 Opção 1: Instalação Automática (RECOMENDADO)

### Passo 1: Executar Script de Setup

1. **Extraia todos os arquivos** do ZIP para uma pasta no seu computador
2. **Localize o arquivo** `PRIMEIRO-SETUP.bat`
3. **Clique com botão direito** sobre ele
4. Selecione **"Executar como Administrador"**

![Setup Script](https://via.placeholder.com/600x150/4CAF50/FFFFFF?text=PRIMEIRO-SETUP.bat)

### Passo 2: Aguarde a Instalação

O script irá automaticamente:

✅ **Verificar Node.js** (incluído no aplicativo)  
✅ **Instalar dependências** do backend (~50 MB)  
✅ **Baixar Arduino CLI** (~30 MB)  
✅ **Instalar ESP32 cores** (~250 MB) - *Processo mais demorado*  
✅ **Instalar bibliotecas** Arduino necessárias

⏱️ **Tempo estimado:** 10-20 minutos (dependendo da internet)

### Passo 3: Executar o Aplicativo

1. Após o script concluir, feche a janela
2. Execute `IdeiaSpace-Mission.exe`
3. Clique no botão **"Iniciar Backend"**
4. Aguarde 15-30 segundos para o backend inicializar
5. **Pronto!** Comece a programar! 🎉

---

## 🔧 Opção 2: Instalação Manual (Durante Primeira Execução)

Se você **não executou** o `PRIMEIRO-SETUP.bat`:

### Passo 1: Executar o Aplicativo

1. Execute `IdeiaSpace-Mission.exe`

### Passo 2: Iniciar Backend

1. Na tela inicial, clique em **"Iniciar Backend"**
2. O aplicativo irá detectar que precisa instalar dependências
3. Um processo automático será iniciado

### Passo 3: Aguarde a Instalação Automática

O backend irá automaticamente:

✅ Instalar dependências Node.js  
✅ Baixar e configurar Arduino CLI  
✅ Instalar cores ESP32  
✅ Instalar bibliotecas

⏱️ **Tempo estimado:** 10-20 minutos

🔍 **Você pode acompanhar o progresso** através dos logs exibidos na interface

---

## ⚠️ Possíveis Problemas e Soluções

### ❌ "Falha ao Iniciar Backend" - Instantâneo

**Causa:** Node.js não encontrado ou dependências faltando

**Solução:**
1. Execute `PRIMEIRO-SETUP.bat` como Administrador
2. OU instale Node.js de: https://nodejs.org/
3. Execute o script novamente

---

### ❌ "Erro ao instalar cores ESP32"

**Causa:** Internet lenta ou instável

**Solução:**
1. Verifique sua conexão com internet
2. Tente novamente clicando em "Parar Backend" e depois "Iniciar Backend"
3. O sistema fará até 3 tentativas automáticas

---

### ❌ "Arduino CLI não encontrado"

**Causa:** Download do Arduino CLI falhou

**Solução:**
1. Abra um terminal (PowerShell) na pasta `resources\backend`
2. Execute: `node install-arduino-cli.js`
3. Reinicie o aplicativo

---

### ❌ Backend em "Modo Mínimo"

**Causa:** Instalação incompleta

**O que significa:**
- ❌ Upload de código desabilitado
- ❌ Serial monitor desabilitado
- ❌ Compilação desabilitada

**Solução:**
1. Pare o backend
2. Execute `PRIMEIRO-SETUP.bat` como Administrador
3. Ou aguarde o auto-setup completar na próxima inicialização

---

## 📦 O que foi instalado?

Após a instalação completa, você terá:

```
📁 IdeiaSpace-Mission/
├── 📄 IdeiaSpace-Mission.exe (Aplicativo principal)
├── 📄 PRIMEIRO-SETUP.bat (Script de instalação)
├── 📁 resources/
│   └── 📁 backend/
│       ├── 📦 node_modules/ (~150 MB - Dependências)
│       ├── 🔧 arduino-cli/ (~30 MB - Ferramenta CLI)
│       │   ├── arduino-cli.exe
│       │   └── config/
│       │       └── data/
│       │           └── packages/
│       │               └── esp32/ (~250 MB - Cores e compiladores)
│       └── 📚 user/libraries/ (Bibliotecas Arduino)
```

**Total:** ~500 MB após instalação completa

---

## 🎓 Primeiros Passos Após Instalação

### 1️⃣ Conectar o ESP32

1. Conecte seu ESP32 via USB
2. Aguarde o Windows instalar os drivers automaticamente
3. No IdeiaSpace, clique em "🔌 Detectar Portas"
4. Selecione a porta COM que apareceu

### 2️⃣ Criar Seu Primeiro Programa

1. Arraste blocos da paleta à esquerda
2. Monte sua lógica
3. Clique em "📤 Carregar para ESP32"
4. Aguarde a compilação e upload

### 3️⃣ Monitorar o Serial

1. Após o upload, clique em "🔍 Monitor Serial"
2. Veja em tempo real os dados do ESP32

---

## 🆘 Suporte

### Logs e Diagnóstico

Se encontrar problemas:

1. **Logs do Backend:** Visíveis na interface ao iniciar
2. **Console do Electron:** Pressione `Ctrl + Shift + I` (DevTools)
3. **Arquivos de Log:** `resources\backend\logs\`

### Informações do Sistema

No aplicativo, vá em:
- **"ℹ️ Status do Sistema"** para ver informações detalhadas
- **"🔧 Diagnóstico"** para executar testes automáticos

### Reportar Problemas

Se precisar de ajuda:

1. Anote a mensagem de erro completa
2. Capture screenshot da tela
3. Abra uma issue no GitHub
4. Inclua logs do console

---

## 🔄 Atualização

Para atualizar o IdeiaSpace:

1. Faça backup de seus projetos (se houver)
2. Baixe a nova versão
3. Extraia em uma nova pasta
4. **NÃO precisa** executar `PRIMEIRO-SETUP.bat` novamente
5. Copie a pasta `resources/backend` da versão antiga (opcional)

---

## ✅ Checklist de Instalação

Marque cada item ao completar:

- [ ] Extraí todos os arquivos do ZIP
- [ ] Executei `PRIMEIRO-SETUP.bat` como Administrador
- [ ] Aguardei a instalação completa (10-20 min)
- [ ] Executei `IdeiaSpace-Mission.exe`
- [ ] Cliquei em "Iniciar Backend" e aguardei
- [ ] Backend iniciou com sucesso
- [ ] Conectei o ESP32 via USB
- [ ] Portas COM foram detectadas
- [ ] Fiz o upload do primeiro programa de teste

---

## 📚 Recursos Adicionais

- 📖 **Documentação Completa:** [Em desenvolvimento]
- 🎥 **Vídeo Tutorial:** [Em desenvolvimento]
- 💬 **Comunidade:** [Discord/Forum]
- 🐛 **Report Bugs:** [GitHub Issues]

---

## 📄 Informações Técnicas

**Versão do Aplicativo:** 1.0.0  
**Electron:** 33.x  
**Node.js:** 20.x (embutido)  
**Arduino CLI:** Latest  
**ESP32 Core:** 2.x ou 3.x

---

<div align="center">

**🚀 Boa programação espacial! 🌌**

Desenvolvido com ❤️ para educação aeroespacial

</div>

# 🏗️ Instruções de Build - IdeiaSpace Mission

## ⚠️ IMPORTANTE - Pré-requisitos do Build

Antes de fazer o build do executável, você DEVE ter as dependências do backend instaladas:

### 1️⃣ Instalar Dependências do Backend

```bash
cd backend
npm install
cd ..
```

**Por quê?** O `node_modules` do backend contém dependências essenciais (Express, SerialPort, ws, cors) que **devem ser incluídas no build**. O Electron Forge vai copiar todo o diretório `backend/` (incluindo `node_modules/`) para `resources/backend/` no executável final.

### 2️⃣ Verificar Configuração do Forge

No `forge.config.js`, certifique-se que **NÃO** há exclusão de `node_modules` do backend:

```javascript
extraResources: [
  {
    from: 'backend',
    to: 'backend',
    filter: [
      '**/*',
      // NÃO EXCLUIR node_modules! São dependências necessárias
      '!test_esp32/**',
      '!**/.DS_Store',
      '!**/Thumbs.db'
    ]
  }
]
```

## 📦 Build do Executável

### Windows (Gerador ZIP)

```bash
npm run make
```

Isso irá:
1. Empacotar o Electron com Node.js embutido
2. Copiar `backend/` completo (com `node_modules/`) para `resources/backend/`
3. Copiar `PRIMEIRO-SETUP.bat` para a raiz
4. Criar ZIP em `out/make/zip/win32/x64/`

## 🎯 Estrutura Final do Executável

```
IdeiaSpace-Mission-win32-x64/
├── IdeiaSpace-Mission.exe          # Executável principal (Electron + Node.js embutido)
├── PRIMEIRO-SETUP.bat               # Script de configuração inicial
├── LEIA-ME-INSTALACAO.md           # Documentação para usuário
├── resources/
│   ├── app.asar                     # Frontend empacotado
│   └── backend/                     # Backend completo (extraResources)
│       ├── server.js
│       ├── auto-setup.js
│       ├── package.json
│       ├── node_modules/            # ⚠️ CRÍTICO: Deve estar presente!
│       │   ├── express/
│       │   ├── serialport/
│       │   ├── ws/
│       │   ├── cors/
│       │   └── ...
│       ├── arduino-cli/             # (vazio no build, será baixado)
│       └── services/
```

## ✅ Checklist Pré-Build

- [ ] `backend/node_modules/` existe e está completo
- [ ] `backend/package.json` está presente
- [ ] `forge.config.js` NÃO exclui `node_modules`
- [ ] `PRIMEIRO-SETUP.bat` existe na raiz
- [ ] `LEIA-ME-INSTALACAO.md` existe na raiz
- [ ] `src/main/main.js` usa `process.execPath` (não `'node'`)
- [ ] `backend/config.js` detecta ambiente empacotado

## 🧪 Testar o Build

### Teste Local (Antes do Build)

```bash
# Testar se backend funciona standalone
cd backend
npm start

# Em outro terminal, testar frontend
npm start
```

### Teste do Executável (Após Build)

1. Navegue até `out/IdeiaSpace-Mission-win32-x64/`
2. **NÃO execute o .exe ainda**
3. Primeiro execute `PRIMEIRO-SETUP.bat` (como Admin)
4. Aguarde instalação de Arduino CLI e cores ESP32 (10-20 min)
5. Depois execute `IdeiaSpace-Mission.exe`
6. Clique em "Iniciar Backend"
7. Deve iniciar em 15-30 segundos

### Teste em PC Limpo (Ideal)

1. Use uma VM Windows sem Node.js instalado
2. Copie o ZIP gerado
3. Extraia em `C:\IdeiaSpace\`
4. Execute `PRIMEIRO-SETUP.bat`
5. Aguarde conclusão
6. Execute `IdeiaSpace-Mission.exe`

## 🐛 Troubleshooting

### ❌ Erro: "Cannot find module 'express'"

**Causa:** `backend/node_modules/` não foi incluído no build

**Solução:**
1. Verifique `forge.config.js` - certifique-se que NÃO tem `'!node_modules/**'`
2. Delete pasta `out/`
3. Rode `cd backend && npm install && cd ..`
4. Rode `npm run make` novamente

### ❌ Erro: "Falha ao Iniciar backend" instantâneo

**Causas possíveis:**
1. Node.js do Electron não está sendo usado (check `process.execPath` no main.js)
2. Backend não encontrado (check `getBackendDir()` no config.js)
3. Dependências faltando (check `node_modules` no build)

**Solução:** Verifique logs do Electron (Ctrl+Shift+I DevTools)

### ❌ Auto-setup falha com "npm not found"

**Causa:** Usuário não tem Node.js instalado no sistema E o build não incluiu `node_modules`

**Solução:**
1. Garanta que `backend/node_modules/` está no build
2. Instrua usuário a executar `PRIMEIRO-SETUP.bat` DEPOIS de instalar Node.js

## 📝 Notas Importantes

### Node.js Embutido vs Sistema

- **Electron tem Node.js embutido** (`process.execPath`)
- Use este Node.js para executar `server.js` via `spawn(process.execPath, ['server.js'])`
- **npm NÃO está embutido** no Electron
- Por isso `backend/node_modules/` deve estar no build
- `auto-setup.js` usa npm para instalar dependências (falha se npm não disponível)
- Solução: Pré-instalar dependências antes do build

### Tamanho do Build

- Com `node_modules` incluído: ~150 MB
- Com Arduino CLI: ~30 MB adicional
- Com cores ESP32: ~250 MB adicional
- **Total esperado:** ~200 MB (ZIP) sem cores, ~450 MB com cores

### Performance

- Primeiro start: 10-20 minutos (auto-setup download de cores)
- Starts subsequentes: 15-30 segundos
- Com `PRIMEIRO-SETUP.bat`: Primeira abertura é instantânea

---

## 🚀 Resumo do Processo Completo

```bash
# 1. Preparar backend
cd backend
npm install  # ⚠️ OBRIGATÓRIO!
cd ..

# 2. Verificar forge.config.js
# Certifique-se que node_modules NÃO está excluído

# 3. Build
npm run make

# 4. Testar
cd out/IdeiaSpace-Mission-win32-x64/
.\PRIMEIRO-SETUP.bat  # Como Admin
.\IdeiaSpace-Mission.exe

# 5. Distribuir
# Compactar pasta completa em ZIP
# Instruir usuário a executar PRIMEIRO-SETUP.bat primeiro
```

---

**Data de última atualização:** 13/11/2025
**Versão:** 1.0.0

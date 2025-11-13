# 📦 Instalação do IdeiaSpace Mission

## ✅ Requisitos

- Windows 10/11 (64-bit)
- 5 GB de espaço livre em disco
- Conexão com internet (para primeira execução)

## 🚀 Instalação

### Método 1: Versão Portátil (Recomendado)

1. **Extraia o arquivo ZIP** `IdeiaSpace Mission-win32-x64-1.0.0.zip` em qualquer pasta
2. **Execute** `IdeiaSpace-Mission.exe`
3. **Aguarde** a configuração inicial (primeira execução pode demorar 3-5 minutos)

### ⚙️ Primeira Execução

Na primeira vez que você executar o aplicativo:

1. ✅ O sistema irá verificar os componentes
2. 📥 Baixará automaticamente o **Arduino CLI** e **ESP32 Core** (~500 MB)
3. 📚 Instalará as **bibliotecas necessárias**
4. 🎉 Abrirá o aplicativo pronto para uso!

> **Nota:** Mantenha a internet conectada durante a primeira execução

## 🔧 Componentes Instalados Automaticamente

- ✅ Arduino CLI
- ✅ ESP32 Core (v3.x)
- ✅ Bibliotecas:
  - Adafruit BMP085
  - Adafruit BusIO
  - Adafruit GFX Library
  - Adafruit HMC5883 Unified
  - Adafruit MPU6050
  - Adafruit SSD1306
  - E outras...

## ❓ Solução de Problemas

### O aplicativo não abre?
- Verifique se o Windows Defender não bloqueou o arquivo
- Execute como Administrador (botão direito > Executar como administrador)

### Download da primeira execução falhou?
- Verifique sua conexão com internet
- Desative temporariamente o firewall/antivírus
- Feche e abra o aplicativo novamente

### Erro de espaço em disco?
- Libere pelo menos 5 GB de espaço
- Os packages do ESP32 ocupam bastante espaço

## 📞 Suporte

Para reportar problemas ou obter ajuda:
- **Email:** contato@ideiaspace.com.br
- **GitHub:** https://github.com/ZarbL/IdeiaSpace

---

**IdeiaSpace Mission v1.0.0**  
Plataforma de programação em blocos para ensino aeroespacial

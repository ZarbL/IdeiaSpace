#!/usr/bin/env node

/**
 * Script de Diagnóstico do Backend IdeiaSpace
 * Realiza diagnóstico completo do sistema
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const os = require('os');

const execAsync = promisify(exec);

class SystemDiagnostic {
  constructor() {
    this.backendDir = __dirname;
    this.issues = [];
    this.warnings = [];
  }

  async run() {
    console.log('🔍 Diagnóstico Completo do Sistema IdeiaSpace\n');
    console.log('=' * 50);
    
    await this.checkSystemInfo();
    await this.checkNodeEnvironment();
    await this.checkProjectStructure();
    await this.checkDependencies();
    await this.checkArduinoCLI();
    await this.checkPorts();
    await this.checkPermissions();
    
    this.generateReport();
  }

  async checkSystemInfo() {
    console.log('\n📋 Informações do Sistema:');
    console.log(`   SO: ${os.type()} ${os.release()}`);
    console.log(`   Arquitetura: ${os.arch()}`);
    console.log(`   Memória Total: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`);
    console.log(`   Memória Livre: ${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`);
    console.log(`   CPUs: ${os.cpus().length}`);
  }

  async checkNodeEnvironment() {
    console.log('\n🔧 Ambiente Node.js:');
    
    try {
      const { stdout: nodeVersion } = await execAsync('node --version');
      console.log(`   Node.js: ${nodeVersion.trim()}`);
      
      const majorVersion = parseInt(nodeVersion.trim().slice(1).split('.')[0]);
      if (majorVersion < 16) {
        this.issues.push('Node.js versão muito antiga (necessário 16+)');
      }
    } catch (error) {
      this.issues.push('Node.js não encontrado');
    }

    try {
      const { stdout: npmVersion } = await execAsync('npm --version');
      console.log(`   NPM: ${npmVersion.trim()}`);
    } catch (error) {
      this.issues.push('NPM não encontrado');
    }
  }

  async checkProjectStructure() {
    console.log('\n📁 Estrutura do Projeto:');
    
    const requiredDirs = [
      'services',
      'arduino-cli',
      '../src',
      '../src/main',
      '../src/renderer'
    ];

    const requiredFiles = [
      'package.json',
      'server.js',
      'install-arduino-cli.js',
      'services/arduino-cli-service.js',
      'services/serial-service.js',
      '../package.json',
      '../src/main/main.js'
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.backendDir, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`   ✅ ${dir}/`);
      } else {
        console.log(`   ❌ ${dir}/`);
        this.issues.push(`Diretório ausente: ${dir}`);
      }
    }

    for (const file of requiredFiles) {
      const filePath = path.join(this.backendDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file}`);
        this.issues.push(`Arquivo ausente: ${file}`);
      }
    }
  }

  async checkDependencies() {
    console.log('\n📦 Dependências:');
    
    const packageJsonPath = path.join(this.backendDir, 'package.json');
    const nodeModulesPath = path.join(this.backendDir, 'node_modules');

    if (!fs.existsSync(packageJsonPath)) {
      this.issues.push('package.json do backend não encontrado');
      return;
    }

    if (!fs.existsSync(nodeModulesPath)) {
      console.log('   ❌ node_modules não encontrado');
      this.issues.push('Dependências não instaladas');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      for (const [dep, version] of Object.entries(dependencies)) {
        const depPath = path.join(nodeModulesPath, dep);
        if (fs.existsSync(depPath)) {
          console.log(`   ✅ ${dep}@${version}`);
        } else {
          console.log(`   ❌ ${dep}@${version}`);
          this.issues.push(`Dependência ausente: ${dep}`);
        }
      }
    } catch (error) {
      this.issues.push('Erro ao analisar dependências');
    }
  }

  async checkArduinoCLI() {
    console.log('\n⚙️ Arduino CLI:');
    
    const arduinoCliPath = path.join(this.backendDir, 'arduino-cli');
    const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
    const arduinoCliExePath = path.join(arduinoCliPath, executable);
    const configPath = path.join(arduinoCliPath, 'arduino-cli.yaml');

    if (!fs.existsSync(arduinoCliExePath)) {
      console.log('   ❌ Arduino CLI não encontrado');
      this.issues.push('Arduino CLI não instalado');
      return;
    }

    console.log('   ✅ Arduino CLI encontrado');

    try {
      const { stdout } = await execAsync(`"${arduinoCliExePath}" version`);
      console.log(`   ✅ Versão: ${stdout.trim()}`);
    } catch (error) {
      console.log('   ⚠️ Arduino CLI não executável');
      this.warnings.push('Arduino CLI pode ter problemas de execução');
    }

    if (fs.existsSync(configPath)) {
      console.log('   ✅ Configuração encontrada');
    } else {
      console.log('   ⚠️ Configuração não encontrada');
      this.warnings.push('Arduino CLI pode precisar de configuração');
    }

    // Verificar placas instaladas
    try {
      const { stdout } = await execAsync(`"${arduinoCliExePath}" core list`);
      if (stdout.includes('esp32:esp32')) {
        console.log('   ✅ ESP32 core instalado');
      } else {
        console.log('   ⚠️ ESP32 core não encontrado');
        this.warnings.push('ESP32 core pode não estar instalado');
      }
    } catch (error) {
      this.warnings.push('Não foi possível verificar cores instalados');
    }
  }

  async checkPorts() {
    console.log('\n🔌 Portas Seriais:');
    
    try {
      const SerialService = require('./services/serial-service');
      const serialService = new SerialService();
      const ports = await serialService.listPorts();
      
      if (ports.length > 0) {
        ports.forEach(port => {
          console.log(`   ✅ ${port.path} (${port.manufacturer || 'Desconhecido'})`);
        });
      } else {
        console.log('   ⚠️ Nenhuma porta serial encontrada');
        this.warnings.push('Nenhum dispositivo serial conectado');
      }
    } catch (error) {
      console.log('   ❌ Erro ao verificar portas seriais');
      this.issues.push('Serviço serial com problemas');
    }
  }

  async checkPermissions() {
    console.log('\n🔐 Permissões:');
    
    try {
      // Verificar permissões de escrita no diretório
      const testFile = path.join(this.backendDir, '.test-write');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('   ✅ Permissões de escrita ok');
    } catch (error) {
      console.log('   ❌ Sem permissões de escrita');
      this.issues.push('Permissões insuficientes no diretório');
    }

    // No Windows, verificar se é necessário executar como administrador
    if (os.platform() === 'win32') {
      try {
        await execAsync('net session 2>nul');
        console.log('   ✅ Executando como administrador');
      } catch (error) {
        console.log('   ⚠️ Não executando como administrador');
        this.warnings.push('Alguns recursos podem precisar de privilégios de administrador');
      }
    }
  }

  generateReport() {
    console.log('\n' + '=' * 50);
    console.log('📊 RELATÓRIO DE DIAGNÓSTICO');
    console.log('=' * 50);

    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 SISTEMA OK! Nenhum problema encontrado.');
      console.log('\n✅ O backend está pronto para funcionar.');
    } else {
      if (this.issues.length > 0) {
        console.log('\n❌ PROBLEMAS CRÍTICOS ENCONTRADOS:');
        this.issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue}`);
        });
      }

      if (this.warnings.length > 0) {
        console.log('\n⚠️ AVISOS:');
        this.warnings.forEach((warning, index) => {
          console.log(`   ${index + 1}. ${warning}`);
        });
      }

      console.log('\n🔧 SOLUÇÕES RECOMENDADAS:');
      if (this.issues.some(i => i.includes('Node.js'))) {
        console.log('   • Instale Node.js 16+ de nodejs.org');
      }
      if (this.issues.some(i => i.includes('Dependências'))) {
        console.log('   • Execute: npm install');
      }
      if (this.issues.some(i => i.includes('Arduino CLI'))) {
        console.log('   • Execute: npm run install-cli');
      }
      if (this.issues.some(i => i.includes('Arquivo ausente'))) {
        console.log('   • Verifique se todos os arquivos do projeto estão presentes');
      }
    }

    console.log('\n📞 SUPORTE:');
    console.log('   • GitHub: https://github.com/ideiaspace/ideiaspace-mission');
    console.log('   • Email: contato@ideiaspace.com.br');
    console.log('');
  }
}

// Executar diagnóstico se chamado diretamente
if (require.main === module) {
  const diagnostic = new SystemDiagnostic();
  diagnostic.run();
}

module.exports = SystemDiagnostic;
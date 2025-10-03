#!/usr/bin/env node

/**
 * Script de Verificação de Pré-requisitos do Backend IdeiaSpace
 * Verifica se tudo está configurado corretamente antes de iniciar
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

class PrerequisitesChecker {
  constructor() {
    this.backendDir = __dirname;
    this.hasErrors = false;
  }

  async run() {
    console.log('🔍 Verificando pré-requisitos do backend...\n');

    try {
      await this.checkNodeVersion();
      await this.checkDependencies();
      await this.checkArduinoCLI();
      await this.checkEssentialFiles();
      
      if (this.hasErrors) {
        console.log('\n⚠️ Alguns problemas foram encontrados.');
        console.log('💡 Execute "npm run backend:setup" para configurar automaticamente.\n');
        process.exit(1);
      } else {
        console.log('\n✅ Todos os pré-requisitos estão ok!');
        console.log('🚀 Backend pronto para iniciar.\n');
      }
      
    } catch (error) {
      console.error('\n❌ Erro crítico:', error.message);
      console.error('\n🔧 Execute "npm run backend:setup" para configurar o backend.\n');
      process.exit(1);
    }
  }

  async checkNodeVersion() {
    console.log('🔍 Verificando Node.js...');
    
    try {
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim();
      const majorVersion = parseInt(version.slice(1).split('.')[0]);
      
      if (majorVersion < 16) {
        throw new Error(`Node.js ${version} encontrado. Necessária versão 16 ou superior.`);
      }
      
      console.log(`   ✅ Node.js ${version}`);
    } catch (error) {
      console.log('   ❌ Node.js não encontrado ou versão incompatível');
      this.hasErrors = true;
    }
  }

  async checkDependencies() {
    console.log('📦 Verificando dependências...');
    
    const nodeModulesPath = path.join(this.backendDir, 'node_modules');
    const packageJsonPath = path.join(this.backendDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.log('   ❌ package.json não encontrado');
      this.hasErrors = true;
      return;
    }

    if (!fs.existsSync(nodeModulesPath)) {
      console.log('   ❌ node_modules não encontrado');
      console.log('   💡 Execute: npm install');
      this.hasErrors = true;
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      let missingDeps = [];
      for (const dep of Object.keys(dependencies)) {
        const depPath = path.join(nodeModulesPath, dep);
        if (!fs.existsSync(depPath)) {
          missingDeps.push(dep);
        }
      }

      if (missingDeps.length > 0) {
        console.log(`   ❌ Dependências faltando: ${missingDeps.join(', ')}`);
        console.log('   💡 Execute: npm install');
        this.hasErrors = true;
      } else {
        console.log('   ✅ Dependências instaladas');
      }
      
    } catch (error) {
      console.log('   ❌ Erro ao verificar dependências');
      this.hasErrors = true;
    }
  }

  async checkArduinoCLI() {
    console.log('⚙️ Verificando Arduino CLI...');
    
    const arduinoCliPath = path.join(this.backendDir, 'arduino-cli');
    // Detectar executável correto baseado no sistema operacional
    const executable = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
    const arduinoCliExePath = path.join(arduinoCliPath, executable);
    
    if (!fs.existsSync(arduinoCliExePath)) {
      console.log('   ❌ Arduino CLI não encontrado');
      console.log('   💡 Execute: npm run install-cli');
      this.hasErrors = true;
      return;
    }

    try {
      // Verificar se o Arduino CLI está funcionando
      const { stdout } = await execAsync(`"${arduinoCliExePath}" version`);
      const version = stdout.trim();
      console.log(`   ✅ Arduino CLI ${version.split(' ')[2] || 'instalado'}`);
    } catch (error) {
      console.log('   ⚠️ Arduino CLI encontrado mas pode ter problemas');
      console.log('   💡 Execute: npm run install-cli');
    }
  }

  async checkEssentialFiles() {
    console.log('📁 Verificando arquivos essenciais...');
    
    const requiredFiles = [
      'server.js',
      'services/arduino-cli-service.js',
      'services/serial-service.js',
      'install-arduino-cli.js'
    ];

    let missingFiles = [];
    for (const file of requiredFiles) {
      const filePath = path.join(this.backendDir, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      console.log(`   ❌ Arquivos faltando: ${missingFiles.join(', ')}`);
      this.hasErrors = true;
    } else {
      console.log('   ✅ Arquivos essenciais presentes');
    }
  }
}

// Executar verificação se chamado diretamente
if (require.main === module) {
  const checker = new PrerequisitesChecker();
  checker.run();
}

module.exports = PrerequisitesChecker;
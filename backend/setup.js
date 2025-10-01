#!/usr/bin/env node

/**
 * Script de Inicialização do Backend IdeiaSpace
 * Automatiza a instalação e configuração completa
 */

const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

class BackendSetup {
  constructor() {
    this.backendDir = __dirname;
    this.rootDir = path.join(__dirname, '..');
  }

  async run() {
    console.log('🚀 Configurando Backend do IdeiaSpace...\n');

    try {
      // Etapa 1: Verificar Node.js
      await this.checkNodeVersion();
      
      // Etapa 2: Instalar dependências
      await this.installDependencies();
      
      // Etapa 3: Configurar Arduino CLI
      await this.setupArduinoCLI();
      
      // Etapa 4: Testar configuração
      await this.testSetup();
      
      console.log('\n🎉 Backend configurado com sucesso!');
      console.log('\n📋 Próximos passos:');
      console.log('   1. cd backend');
      console.log('   2. npm start');
      console.log('\n🔗 O servidor estará disponível em:');
      console.log('   📡 HTTP API: http://localhost:3001');
      console.log('   🔌 WebSocket: ws://localhost:8080\n');
      
    } catch (error) {
      console.error('\n❌ Erro na configuração:', error.message);
      console.error('\n🔧 Tente executar manualmente:');
      console.error('   1. cd backend');
      console.error('   2. npm install');
      console.error('   3. npm run install-cli');
      console.error('   4. npm start\n');
      process.exit(1);
    }
  }

  async checkNodeVersion() {
    console.log('🔍 Verificando versão do Node.js...');
    
    try {
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim();
      const majorVersion = parseInt(version.slice(1).split('.')[0]);
      
      if (majorVersion < 16) {
        throw new Error(`Node.js ${version} encontrado. Necessária versão 16 ou superior.`);
      }
      
      console.log(`✅ Node.js ${version} - OK`);
    } catch (error) {
      throw new Error('Node.js não encontrado. Instale Node.js 16+ primeiro.');
    }
  }

  async installDependencies() {
    console.log('📦 Instalando dependências do backend...');
    
    return new Promise((resolve, reject) => {
      const npmProcess = spawn('npm', ['install'], {
        cwd: this.backendDir,
        stdio: 'pipe'
      });

      let output = '';
      npmProcess.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write('.');
      });

      npmProcess.stderr.on('data', (data) => {
        output += data.toString();
      });

      npmProcess.on('close', (code) => {
        console.log('');
        
        if (code === 0) {
          console.log('✅ Dependências instaladas com sucesso');
          resolve();
        } else {
          console.error('❌ Erro na instalação das dependências:');
          console.error(output);
          reject(new Error('Falha na instalação das dependências'));
        }
      });
    });
  }

  async setupArduinoCLI() {
    console.log('⚙️ Configurando Arduino CLI...');
    
    return new Promise((resolve, reject) => {
      const setupProcess = spawn('node', ['install-arduino-cli.js'], {
        cwd: this.backendDir,
        stdio: 'pipe'
      });

      let output = '';
      setupProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        // Mostrar saída em tempo real
        process.stdout.write(text);
      });

      setupProcess.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stderr.write(text);
      });

      setupProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Arduino CLI configurado com sucesso');
          resolve();
        } else {
          console.error('❌ Erro na configuração do Arduino CLI');
          reject(new Error('Falha na configuração do Arduino CLI'));
        }
      });
    });
  }

  async testSetup() {
    console.log('🧪 Testando configuração...');
    
    try {
      // Verificar arquivos essenciais
      const requiredFiles = [
        'server.js',
        'services/arduino-cli-service.js',
        'services/serial-service.js',
        'arduino-cli'
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(this.backendDir, file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Arquivo necessário não encontrado: ${file}`);
        }
      }

      // Verificar se Arduino CLI está executável
      const ArduinoCLIService = require('./services/arduino-cli-service');
      const cliService = new ArduinoCLIService();
      
      try {
        const health = await cliService.healthCheck();
        if (!health.success) {
          throw new Error('Arduino CLI não está funcionando corretamente');
        }
        console.log('✅ Arduino CLI funcionando');
      } catch (error) {
        console.log('⚠️ Arduino CLI pode precisar de configuração manual');
      }

      console.log('✅ Configuração validada');
      
    } catch (error) {
      console.error(`⚠️ Aviso na validação: ${error.message}`);
      console.log('💡 O backend pode ainda funcionar. Teste iniciando o servidor.');
    }
  }

  async updateMainPackageJson() {
    console.log('📝 Atualizando scripts do projeto principal...');
    
    try {
      const packagePath = path.join(this.rootDir, 'package.json');
      
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Adicionar scripts do backend se não existirem
        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }
        
        const newScripts = {
          'backend:install': 'cd backend && npm install',
          'backend:setup': 'cd backend && npm run setup',
          'backend:start': 'cd backend && npm start',
          'backend:dev': 'cd backend && npm run dev'
        };
        
        for (const [script, command] of Object.entries(newScripts)) {
          if (!packageJson.scripts[script]) {
            packageJson.scripts[script] = command;
          }
        }
        
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Scripts adicionados ao package.json principal');
      }
    } catch (error) {
      console.log('⚠️ Não foi possível atualizar package.json principal');
    }
  }
}

// Executar setup se chamado diretamente
if (require.main === module) {
  const setup = new BackendSetup();
  setup.run();
}

module.exports = BackendSetup;
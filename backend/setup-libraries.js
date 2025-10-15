#!/usr/bin/env node

/**
 * Script para instalar todas as bibliotecas necessárias para os sensores
 * Garante que todas as bibliotecas estejam disponíveis para compilação
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

class LibraryInstaller {
  constructor() {
    this.backendDir = __dirname;
    this.cliPath = path.join(this.backendDir, 'arduino-cli', 'arduino-cli.exe');
    this.configPath = path.join(this.backendDir, 'arduino-cli', 'arduino-cli.yaml');
    
    // Lista de bibliotecas necessárias para os sensores do projeto
    this.requiredLibraries = [
      { name: 'Adafruit MPU6050', sensor: 'MPU6050 (Acelerômetro/Giroscópio)' },
      { name: 'Adafruit Unified Sensor', sensor: 'Biblioteca base para sensores Adafruit' },
      { name: 'Adafruit BMP085 Library', sensor: 'BMP180 (Pressão/Temperatura)' },
      { name: 'Adafruit HMC5883 Unified', sensor: 'HMC5883 (Magnetômetro/Bússola)' },
      { name: 'BH1750', sensor: 'BH1750 (Luminosidade)' },
      { name: 'DHT sensor library', sensor: 'DHT11/DHT22 (Temperatura/Umidade)' },
      { name: 'Adafruit SSD1306', sensor: 'Display OLED SSD1306' },
      { name: 'Adafruit GFX Library', sensor: 'Biblioteca gráfica base' },
      { name: 'Adafruit BusIO', sensor: 'Biblioteca de comunicação I2C/SPI' }
    ];
  }

  async install() {
    console.log('📚 Instalador de Bibliotecas Arduino');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 ${this.requiredLibraries.length} bibliotecas serão verificadas/instaladas\n`);
    
    try {
      // Verificar se Arduino CLI existe
      if (!fs.existsSync(this.cliPath)) {
        throw new Error('❌ Arduino CLI não encontrado. Execute: npm run backend:setup');
      }

      // Atualizar índice de bibliotecas
      console.log('🔄 Atualizando índice de bibliotecas...');
      await this.updateLibraryIndex();
      console.log('✅ Índice atualizado!\n');

      // Verificar e instalar cada biblioteca
      let installed = 0;
      let alreadyInstalled = 0;
      let failed = 0;

      for (let i = 0; i < this.requiredLibraries.length; i++) {
        const lib = this.requiredLibraries[i];
        const num = `[${i + 1}/${this.requiredLibraries.length}]`;
        
        console.log(`${num} 📖 ${lib.name}`);
        console.log(`    ├─ Sensor: ${lib.sensor}`);
        
        const isInstalled = await this.checkLibraryInstalled(lib.name);
        
        if (isInstalled) {
          console.log(`    └─ ✅ Já instalada\n`);
          alreadyInstalled++;
        } else {
          console.log(`    ├─ 📥 Instalando...`);
          const success = await this.installLibrary(lib.name);
          
          if (success) {
            console.log(`    └─ ✅ Instalada com sucesso!\n`);
            installed++;
          } else {
            console.log(`    └─ ⚠️ Falha na instalação\n`);
            failed++;
          }
        }
      }

      // Resumo final
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Resumo da Instalação:');
      console.log(`   ✅ Já instaladas: ${alreadyInstalled}`);
      console.log(`   📥 Novas instalações: ${installed}`);
      if (failed > 0) {
        console.log(`   ⚠️ Falhas: ${failed}`);
      }
      console.log('');
      
      if (failed === 0) {
        console.log('🎉 Todas as bibliotecas estão disponíveis!');
        console.log('💡 Agora você pode compilar código para todos os sensores!');
      } else {
        console.log('⚠️ Algumas bibliotecas falharam. Tente novamente ou instale manualmente.');
      }

    } catch (error) {
      console.error('\n❌ Erro durante instalação:', error.message);
      console.error('\n💡 Possíveis soluções:');
      console.error('   1. Verifique sua conexão com a internet');
      console.error('   2. Tente novamente');
      console.error('   3. Execute: npm run backend:setup');
      process.exit(1);
    }
  }

  async updateLibraryIndex() {
    const command = `"${this.cliPath}" --config-file "${this.configPath}" lib update-index`;
    
    try {
      await execAsync(command, { 
        timeout: 120000, // 2 minutos
        maxBuffer: 1024 * 1024 * 50 // 50MB
      });
      return true;
    } catch (error) {
      console.log('⚠️ Aviso ao atualizar índice:', error.message);
      return false;
    }
  }

  async checkLibraryInstalled(libraryName) {
    try {
      const command = `"${this.cliPath}" --config-file "${this.configPath}" lib list`;
      const { stdout } = await execAsync(command, { timeout: 30000 });
      
      return stdout.toLowerCase().includes(libraryName.toLowerCase());
    } catch (error) {
      return false;
    }
  }

  async installLibrary(libraryName) {
    const command = `"${this.cliPath}" --config-file "${this.configPath}" lib install "${libraryName}"`;
    
    try {
      await execAsync(command, { 
        timeout: 120000, // 2 minutos
        maxBuffer: 1024 * 1024 * 10 // 10MB
      });
      return true;
    } catch (error) {
      console.log(`       Erro: ${error.message}`);
      return false;
    }
  }

  async listInstalledLibraries() {
    try {
      const command = `"${this.cliPath}" --config-file "${this.configPath}" lib list`;
      const { stdout } = await execAsync(command, { timeout: 30000 });
      
      console.log('\n📚 Bibliotecas Instaladas:');
      console.log(stdout);
    } catch (error) {
      console.log('⚠️ Não foi possível listar bibliotecas');
    }
  }
}

// Executar instalação se chamado diretamente
if (require.main === module) {
  const installer = new LibraryInstaller();
  installer.install();
}

module.exports = LibraryInstaller;

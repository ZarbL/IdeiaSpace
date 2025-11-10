/**
 * Validador de Build
 * Verifica se o instalador gerado está correto
 */

const fs = require('fs-extra');
const path = require('path');

class BuildValidator {
  constructor() {
    this.rootDir = __dirname;
    this.outDir = path.join(this.rootDir, 'out');
  }

  async validate() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║          🔍 VALIDAÇÃO DO BUILD GERADO                  ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    try {
      // 1. Verificar se a pasta out existe
      await this.checkOutputDirectory();

      // 2. Verificar instalador Squirrel
      await this.checkSquirrelInstaller();

      // 3. Verificar ZIP portátil
      await this.checkZipPortable();

      // 4. Verificar tamanho dos pacotes
      await this.checkPackageSizes();

      // 5. Gerar relatório final
      await this.generateReport();

      console.log('\n╔══════════════════════════════════════════════════════════╗');
      console.log('║         ✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO!            ║');
      console.log('╚══════════════════════════════════════════════════════════╝\n');

    } catch (error) {
      console.error('\n❌ VALIDAÇÃO FALHOU:', error.message);
      process.exit(1);
    }
  }

  async checkOutputDirectory() {
    console.log('📁 [1/5] Verificando diretório de saída...');

    if (!fs.existsSync(this.outDir)) {
      throw new Error('Diretório "out" não encontrado. Execute o build primeiro!');
    }

    console.log(`  ✅ Diretório encontrado: ${this.outDir}`);
  }

  async checkSquirrelInstaller() {
    console.log('📦 [2/5] Verificando instalador Squirrel...');

    const squirrelPath = path.join(this.outDir, 'make', 'squirrel.windows', 'x64');

    if (!fs.existsSync(squirrelPath)) {
      throw new Error('Instalador Squirrel não encontrado!');
    }

    // Procurar pelo Setup.exe
    const files = fs.readdirSync(squirrelPath);
    const setupExe = files.find(f => f.endsWith('Setup.exe'));

    if (!setupExe) {
      throw new Error('Setup.exe não encontrado no diretório Squirrel!');
    }

    const setupPath = path.join(squirrelPath, setupExe);
    const stats = fs.statSync(setupPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`  ✅ Instalador encontrado: ${setupExe}`);
    console.log(`  📊 Tamanho: ${sizeInMB} MB`);

    if (stats.size < 50 * 1024 * 1024) { // Menor que 50MB
      console.warn('  ⚠️ AVISO: Instalador muito pequeno! Pode estar faltando arquivos.');
    }

    return { path: setupPath, size: stats.size, name: setupExe };
  }

  async checkZipPortable() {
    console.log('📦 [3/5] Verificando versão portátil (ZIP)...');

    const zipPath = path.join(this.outDir, 'make', 'zip', 'win32', 'x64');

    if (!fs.existsSync(zipPath)) {
      console.log('  ⚠️ Versão ZIP não encontrada (opcional)');
      return null;
    }

    const files = fs.readdirSync(zipPath);
    const zipFile = files.find(f => f.endsWith('.zip'));

    if (!zipFile) {
      console.log('  ⚠️ Arquivo ZIP não encontrado (opcional)');
      return null;
    }

    const zipFilePath = path.join(zipPath, zipFile);
    const stats = fs.statSync(zipFilePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`  ✅ ZIP encontrado: ${zipFile}`);
    console.log(`  📊 Tamanho: ${sizeInMB} MB`);

    return { path: zipFilePath, size: stats.size, name: zipFile };
  }

  async checkPackageSizes() {
    console.log('📊 [4/5] Analisando tamanho dos pacotes...');

    const makeDir = path.join(this.outDir, 'make');

    if (!fs.existsSync(makeDir)) {
      throw new Error('Diretório make não encontrado!');
    }

    // Calcular tamanho total recursivamente
    const totalSize = await this.getDirSize(makeDir);
    const totalSizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

    console.log(`  📦 Tamanho total dos pacotes: ${totalSizeInMB} MB`);

    // Verificar se está dentro de limites razoáveis
    const maxSizeInMB = 1000; // 1GB
    const minSizeInMB = 100;  // 100MB

    if (totalSize > maxSizeInMB * 1024 * 1024) {
      console.warn(`  ⚠️ AVISO: Pacote muito grande! (>${maxSizeInMB}MB)`);
      console.warn('     Considere revisar o que está sendo empacotado.');
    }

    if (totalSize < minSizeInMB * 1024 * 1024) {
      console.warn(`  ⚠️ AVISO: Pacote muito pequeno! (<${minSizeInMB}MB)`);
      console.warn('     Pode estar faltando Arduino CLI ou cores ESP32.');
    }

    return totalSize;
  }

  async getDirSize(dirPath) {
    let totalSize = 0;

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        totalSize += await this.getDirSize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }

  async generateReport() {
    console.log('📝 [5/5] Gerando relatório de build...');

    const packageJson = require('./package.json');
    const makeDir = path.join(this.outDir, 'make');

    // Coletar informações
    const report = {
      projectName: packageJson.name,
      version: packageJson.version,
      buildDate: new Date().toISOString(),
      platform: 'win32',
      arch: 'x64',
      packages: []
    };

    // Listar todos os pacotes gerados
    if (fs.existsSync(makeDir)) {
      const makers = fs.readdirSync(makeDir);

      for (const maker of makers) {
        const makerPath = path.join(makeDir, maker);
        
        if (fs.statSync(makerPath).isDirectory()) {
          const size = await this.getDirSize(makerPath);
          report.packages.push({
            type: maker,
            size: size,
            sizeReadable: (size / (1024 * 1024)).toFixed(2) + ' MB'
          });
        }
      }
    }

    // Salvar relatório
    const reportPath = path.join(this.outDir, 'build-report.json');
    await fs.writeJson(reportPath, report, { spaces: 2 });

    console.log(`  ✅ Relatório salvo: ${reportPath}`);
    
    // Mostrar resumo
    console.log('\n  📋 Resumo do Build:');
    console.log(`     Projeto: ${report.projectName} v${report.version}`);
    console.log(`     Data: ${new Date(report.buildDate).toLocaleString()}`);
    console.log(`     Pacotes gerados: ${report.packages.length}`);
    
    report.packages.forEach(pkg => {
      console.log(`       - ${pkg.type}: ${pkg.sizeReadable}`);
    });
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const validator = new BuildValidator();
  validator.validate().catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = new BuildValidator();

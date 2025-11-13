/**
 * Script para limpar arquivos problemáticos dos pacotes ESP32
 * Remove symlinks quebrados e arquivos com caminhos muito longos
 */

const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

class ESP32Cleaner {
  constructor() {
    this.backendDir = path.join(__dirname, 'backend');
    this.packagesDir = path.join(this.backendDir, 'config', 'data', 'packages', 'esp32');
    this.arduinoPackagesDir = path.join(this.backendDir, 'arduino-cli', 'config', 'data', 'packages', 'esp32');
  }

  async clean() {
    console.log('🧹 Limpando arquivos problemáticos dos pacotes ESP32...\n');

    const dirsToClean = [this.packagesDir, this.arduinoPackagesDir];
    let totalRemoved = 0;

    for (const dir of dirsToClean) {
      if (fs.existsSync(dir)) {
        console.log(`📂 Processando: ${path.relative(__dirname, dir)}`);
        const removed = await this.cleanDirectory(dir);
        totalRemoved += removed;
      }
    }

    console.log(`\n✅ Limpeza concluída! ${totalRemoved} arquivo(s) removido(s)\n`);
  }

  async cleanDirectory(dir) {
    let removed = 0;

    try {
      // Padrões de arquivos problemáticos
      const patterns = [
        '**/*.a-gdb.py',           // Scripts GDB para bibliotecas estáticas (symlinks quebrados)
        '**/*.so-gdb.py',          // Scripts GDB para bibliotecas dinâmicas
        '**/picolibc/**/*',        // Biblioteca picolibc (caminhos muito longos)
        '**/*-gdb.py',             // Todos os scripts GDB
      ];

      for (const pattern of patterns) {
        const fullPattern = path.join(dir, pattern).replace(/\\/g, '/');
        
        try {
          const files = glob.sync(fullPattern, { 
            windowsPathsNoEscape: true,
            nodir: true 
          });

          for (const file of files) {
            try {
              // Verifica se é symlink ou arquivo real
              const stats = await fs.lstat(file);
              
              if (stats.isSymbolicLink()) {
                // Tenta ler o link
                try {
                  await fs.readlink(file);
                } catch (err) {
                  // Symlink quebrado - remove
                  await fs.remove(file);
                  console.log(`  🗑️  Removido symlink quebrado: ${path.basename(file)}`);
                  removed++;
                  continue;
                }
              }

              // Remove arquivo normal se corresponder aos padrões
              if (pattern.includes('picolibc') || pattern.includes('-gdb.py')) {
                await fs.remove(file);
                console.log(`  🗑️  Removido: ${path.relative(dir, file)}`);
                removed++;
              }
            } catch (err) {
              // Arquivo pode não existir ou não ser acessível - ignora
              if (err.code !== 'ENOENT') {
                console.log(`  ⚠️  Aviso: ${err.message}`);
              }
            }
          }
        } catch (err) {
          console.log(`  ⚠️  Erro ao buscar padrão ${pattern}: ${err.message}`);
        }
      }

      // Remove diretórios vazios de picolibc
      const picolibcDirs = glob.sync(path.join(dir, '**/picolibc').replace(/\\/g, '/'), {
        windowsPathsNoEscape: true
      });

      for (const picDir of picolibcDirs) {
        try {
          await fs.remove(picDir);
          console.log(`  🗑️  Removido diretório: ${path.relative(dir, picDir)}`);
          removed++;
        } catch (err) {
          // Ignora erros
        }
      }

    } catch (err) {
      console.error(`❌ Erro ao limpar ${dir}: ${err.message}`);
    }

    return removed;
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  const cleaner = new ESP32Cleaner();
  cleaner.clean()
    .then(() => {
      console.log('✅ Script concluído com sucesso!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Erro:', err);
      process.exit(1);
    });
}

module.exports = ESP32Cleaner;

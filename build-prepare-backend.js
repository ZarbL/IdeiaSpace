const fs = require('fs-extra');
const path = require('path');

// Diretórios que serão EXCLUÍDOS do build (usuário baixará na primeira execução)
const excludeDirs = [
  'backend/config/data/packages',
  'backend/config/downloads',
  'backend/arduino-cli/config',
  'backend/data/packages',
  'backend/downloads',
  '.github'
];

const backupDir = path.join(__dirname, '.build-backup-temp');

async function backup() {
  console.log('\n📦 Preparando backend para build (excluindo packages grandes)...\n');
  
  // Criar diretório de backup
  await fs.ensureDir(backupDir);
  
  for (const dir of excludeDirs) {
    const fullPath = path.join(__dirname, dir);
    if (await fs.pathExists(fullPath)) {
      const backupPath = path.join(backupDir, dir);
      console.log(`   ✓ Movendo temporariamente: ${dir}`);
      try {
        await fs.move(fullPath, backupPath, { overwrite: true });
      } catch (err) {
        console.log(`   ⚠️  Erro ao mover ${dir}: ${err.message}`);
      }
    }
  }
  
  console.log('\n✅ Backend preparado! Os packages serão baixados na primeira execução.\n');
}

async function restore() {
  console.log('\n♻️  Restaurando diretórios do backend...\n');
  
  if (!await fs.pathExists(backupDir)) {
    console.log('⚠️  Nenhum backup encontrado para restaurar.');
    return;
  }
  
  for (const dir of excludeDirs) {
    const backupPath = path.join(backupDir, dir);
    if (await fs.pathExists(backupPath)) {
      const fullPath = path.join(__dirname, dir);
      console.log(`   ✓ Restaurando: ${dir}`);
      try {
        await fs.move(backupPath, fullPath, { overwrite: true });
      } catch (err) {
        console.log(`   ⚠️  Erro ao restaurar ${dir}: ${err.message}`);
      }
    }
  }
  
  // Remover diretório de backup
  try {
    await fs.remove(backupDir);
  } catch (err) {
    console.log(`   ⚠️  Não foi possível remover backup: ${err.message}`);
  }
  
  console.log('\n✅ Diretórios restaurados!\n');
}

// Executar comando correto
const command = process.argv[2];

if (command === 'backup') {
  backup().catch(err => {
    console.error('❌ Erro no backup:', err);
    process.exit(1);
  });
} else if (command === 'restore') {
  restore().catch(err => {
    console.error('❌ Erro na restauração:', err);
    process.exit(1);
  });
} else {
  console.error('Uso: node build-prepare-backend.js [backup|restore]');
  process.exit(1);
}

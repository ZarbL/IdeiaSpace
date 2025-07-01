// Arquivo de debug para verificar se os blocos MPU6050 estão carregados
console.log('=== DEBUG: Verificando blocos MPU6050 ===');

// Aguardar carregamento completo
setTimeout(() => {
  
// Verificar se Blockly está carregado
if (typeof Blockly !== 'undefined') {
  console.log('✅ Blockly está carregado');
  
  // Verificar se os blocos estão registrados
  const mpu6050Blocks = [
    'mpu6050_init',
    'mpu6050_accel_x',
    'mpu6050_accel_y', 
    'mpu6050_accel_z',
    'mpu6050_gyro_x',
    'mpu6050_gyro_y',
    'mpu6050_gyro_z',
    'mpu6050_read'
  ];
  
  console.log('🔍 Verificando blocos MPU6050:');
  mpu6050Blocks.forEach(blockType => {
    if (Blockly.Blocks[blockType]) {
      console.log(`✅ ${blockType} - Registrado`);
    } else {
      console.log(`❌ ${blockType} - NÃO registrado`);
    }
  });
  
  // Verificar geradores C++
  if (Blockly.Cpp) {
    console.log('✅ Gerador C++ está carregado');
    console.log('🔍 Verificando geradores MPU6050:');
    mpu6050Blocks.forEach(blockType => {
      if (Blockly.Cpp[blockType]) {
        console.log(`✅ ${blockType} - Gerador registrado`);
      } else {
        console.log(`❌ ${blockType} - Gerador NÃO registrado`);
      }
    });
  } else {
    console.log('❌ Gerador C++ NÃO está carregado');
  }
  
  // Verificar se o workspace está disponível
  if (typeof workspace !== 'undefined') {
    console.log('✅ Workspace está disponível');
    
    // Listar todos os tipos de bloco disponíveis no toolbox
    const toolbox = workspace.getToolbox();
    if (toolbox) {
      console.log('✅ Toolbox carregado');
    } else {
      console.log('❌ Toolbox NÃO carregado');
    }
  } else {
    console.log('❌ Workspace NÃO está disponível');
  }
  
} else {
  console.log('❌ Blockly NÃO está carregado');
}

console.log('=== FIM DEBUG ===');

}, 3000); // Aguardar 3 segundos para carregamento completo

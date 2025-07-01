// Script para adicionar blocos MPU6050 manualmente ao workspace
function addMPU6050ToWorkspace() {
  console.log('🚀 Adicionando blocos MPU6050 manualmente ao workspace...');
  
  if (typeof workspace === 'undefined') {
    console.error('❌ Workspace não está disponível');
    return;
  }
  
  // Criar XML para os blocos MPU6050
  const mpu6050XML = `
    <xml>
      <block type="mpu6050_read" x="50" y="50">
        <field name="MPU6050_AXIS">ACCEL_X</field>
      </block>
    </xml>
  `;
  
  try {
    // Converter XML para DOM
    const parser = new DOMParser();
    const xml = parser.parseFromString(mpu6050XML, 'text/xml');
    
    // Adicionar blocos ao workspace
    Blockly.Xml.domToWorkspace(xml.documentElement, workspace);
    
    console.log('✅ Blocos MPU6050 adicionados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar blocos:', error);
  }
}

// Adicionar botão de teste na interface
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const buttonContainer = document.querySelector('.button-group');
    if (buttonContainer) {
      const testButton = document.createElement('button');
      testButton.id = 'testMPU6050Button';
      testButton.className = 'icon-button tooltip';
      testButton.setAttribute('data-tooltip', 'Testar MPU6050');
      testButton.textContent = '🧪';
      testButton.addEventListener('click', addMPU6050ToWorkspace);
      
      buttonContainer.appendChild(testButton);
      console.log('✅ Botão de teste MPU6050 adicionado');
    }
  }, 3000);
});

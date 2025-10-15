#!/usr/bin/env node

/**
 * Test script para verificar detecção do ESP32 core
 */

const ArduinoCLIService = require('./services/arduino-cli-service');

async function test() {
  console.log('🧪 Testando detecção do ESP32 Core...\n');
  
  const service = new ArduinoCLIService();
  
  try {
    const result = await service.checkEsp32CoreAvailable();
    
    console.log('\n📊 Resultado:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.installed) {
      console.log('\n✅ SUCESSO! ESP32 detectado!');
      console.log(`   Versão: ${result.version}`);
      console.log(`   ID: ${result.id}`);
      console.log(`   Método: ${result.method}`);
    } else {
      console.log('\n❌ FALHA! ESP32 não detectado!');
      if (result.message) {
        console.log(`   Mensagem: ${result.message}`);
      }
      if (result.error) {
        console.log(`   Erro: ${result.error}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    console.error(error.stack);
  }
}

test();

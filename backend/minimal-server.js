#!/usr/bin/env node

/**
 * Servidor Backend MÍNIMO - Fallback de Emergência
 * 
 * QUANDO USAR:
 * - Auto-setup falhou completamente
 * - Node modules não instalados
 * - Arduino CLI não disponível
 * 
 * FUNCIONALIDADE:
 * - API básica de ping/health
 * - Informa ao usuário que o setup completo é necessário
 * - Permite retry do auto-setup
 */

const http = require('http');
const path = require('path');

const PORT = process.env.PORT || 3001;

// Estado do servidor
const serverState = {
  status: 'minimal',
  startTime: new Date().toISOString(),
  message: 'Servidor mínimo - Setup completo necessário',
  setupRequired: true
};

// Criar servidor HTTP básico
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = req.url;
  
  // Ping básico
  if (url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      mode: 'minimal',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Health check - indica que setup é necessário
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'minimal',
      ready: false,
      setupRequired: true,
      timestamp: new Date().toISOString(),
      message: 'Auto-setup obrigatório: Arduino CLI, cores ESP32 e bibliotecas não instalados',
      limitations: [
        '❌ Arduino CLI não disponível',
        '❌ Cores ESP32 não instalados',
        '❌ Bibliotecas não disponíveis',
        '❌ Upload de código desabilitado',
        '❌ Serial monitor desabilitado',
        '❌ Compilação desabilitada'
      ],
      action_required: 'Execute o auto-setup pelo botão "Iniciar Backend"'
    }));
    return;
  }
  
  // Status do servidor
  if (url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ...serverState,
      uptime: Math.floor((Date.now() - new Date(serverState.startTime).getTime()) / 1000)
    }));
    return;
  }
  
  // Trigger retry do setup (apenas informa, não executa)
  if (url === '/retry-setup') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Servidor mínimo não pode executar setup. Reinicie o backend pelo Electron.',
      action: 'STOP_AND_RESTART_BACKEND'
    }));
    return;
  }
  
  // Todas as outras rotas retornam erro informativo
  res.writeHead(503, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Setup incompleto',
    message: 'O servidor está em modo mínimo. Auto-setup obrigatório não foi concluído.',
    endpoint: url,
    setupRequired: true,
    action: 'Reinicie o backend para executar o auto-setup'
  }));
});

// Iniciar servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  SERVIDOR BACKEND MÍNIMO ATIVO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
  console.log('');
  console.log('⚠️  ATENÇÃO: Funcionalidade EXTREMAMENTE limitada!');
  console.log('');
  console.log('📋 Este servidor foi iniciado porque:');
  console.log('   - Auto-setup falhou ou foi pulado');
  console.log('   - Dependencies não instaladas');
  console.log('   - Arduino CLI não disponível');
  console.log('');
  console.log('🔧 SOLUÇÃO:');
  console.log('   1. Pare este servidor');
  console.log('   2. Clique novamente em "Iniciar Backend"');
  console.log('   3. Aguarde o auto-setup completar');
  console.log('');
  console.log('💡 O auto-setup irá:');
  console.log('   ✓ Instalar dependências Node.js');
  console.log('   ✓ Baixar Arduino CLI');
  console.log('   ✓ Instalar cores ESP32');
  console.log('   ✓ Instalar bibliotecas necessárias');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Tratamento de erros
server.on('error', (err) => {
  console.error('❌ Erro no servidor mínimo:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já em uso. Outro backend pode estar rodando.`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor mínimo...');
  server.close(() => {
    console.log('✅ Servidor mínimo encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Recebido SIGINT, encerrando servidor mínimo...');
  server.close(() => {
    console.log('✅ Servidor mínimo encerrado');
    process.exit(0);
  });
});

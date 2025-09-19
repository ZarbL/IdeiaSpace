const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');

// Fix GPU, cache, GLES2 and virtualization issues
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--disable-gpu');
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-web-security');
app.commandLine.appendSwitch('--disable-features=VizDisplayCompositor');
app.commandLine.appendSwitch('--disable-dev-shm-usage');
app.commandLine.appendSwitch('--disk-cache-size=0');
app.commandLine.appendSwitch('--disable-extensions');
app.commandLine.appendSwitch('--disable-plugins');
app.commandLine.appendSwitch('--disable-background-timer-throttling');
app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('--disable-renderer-backgrounding');
// Fix GLES2 and virtualization errors
app.commandLine.appendSwitch('--disable-gl-extensions');
app.commandLine.appendSwitch('--disable-accelerated-2d-canvas');
app.commandLine.appendSwitch('--disable-accelerated-jpeg-decoding');
app.commandLine.appendSwitch('--disable-accelerated-mjpeg-decode');
app.commandLine.appendSwitch('--disable-accelerated-video-decode');
app.commandLine.appendSwitch('--disable-gpu-compositing');
app.commandLine.appendSwitch('--disable-gpu-rasterization');
app.commandLine.appendSwitch('--disable-gpu-memory-buffer-video-frames');
app.commandLine.appendSwitch('--use-gl=swiftshader');
app.commandLine.appendSwitch('--ignore-gpu-blacklist');
app.commandLine.appendSwitch('--disable-3d-apis');
app.commandLine.appendSwitch('--disable-webgl');
app.commandLine.appendSwitch('--disable-webgl2');

// Disable hardware acceleration completely
app.disableHardwareAcceleration();

// ============================================================================
// ARDUINO CLI BACKEND MANAGEMENT
// ============================================================================

let backendProcess = null;
let backendStatus = {
  running: false,
  port: 3001,
  wsPort: 8080,
  pid: null,
  startTime: null,
  lastError: null
};

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../../src/assets/logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      allowRunningInsecureContent: true,
      experimentalFeatures: true,
      enableRemoteModule: true,
      backgroundThrottling: false,
      hardwareAcceleration: false,
      offscreen: false
    },
    show: false // Don't show until ready
  });

  // Show window when ready to prevent visual glitches
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/view/index.html'));

  // Open the DevTools only in development mode
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
});

// Handle GPU process crashes
app.on('gpu-process-crashed', (event, killed) => {
  console.log('GPU process crashed, restarting...');
});

// Handle render process crashes
app.on('render-process-gone', (event, webContents, details) => {
  console.log('Render process gone, restarting...');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ============================================================================
// IPC HANDLERS - ARDUINO CLI BACKEND
// ============================================================================

// Iniciar backend
ipcMain.handle('start-arduino-backend', async () => {
  console.log('🚀 Recebida solicitação para iniciar backend Arduino CLI');
  
  if (backendProcess && !backendProcess.killed) {
    console.log('⚠️ Backend já está rodando');
    return { success: false, error: 'Backend já está rodando' };
  }

  try {
    const backendPath = path.join(__dirname, '../../backend/server.js');
    
    if (!fs.existsSync(backendPath)) {
      throw new Error(`Arquivo backend não encontrado: ${backendPath}`);
    }

    console.log(`📂 Iniciando backend em: ${backendPath}`);
    
    backendProcess = spawn('node', [backendPath], {
      cwd: path.join(__dirname, '../../backend'),
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    });

    backendStatus.running = true;
    backendStatus.pid = backendProcess.pid;
    backendStatus.startTime = new Date().toISOString();
    backendStatus.lastError = null;

    console.log(`✅ Backend iniciado com PID: ${backendProcess.pid}`);

    // Log output do backend
    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data.toString()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.log(`[Backend Error] ${data.toString()}`);
      backendStatus.lastError = data.toString();
    });

    backendProcess.on('close', (code) => {
      console.log(`🛑 Backend processo terminou com código: ${code}`);
      backendStatus.running = false;
      backendStatus.pid = null;
      backendProcess = null;
    });

    backendProcess.on('error', (error) => {
      console.error('❌ Erro no processo backend:', error.message);
      backendStatus.running = false;
      backendStatus.lastError = error.message;
      backendProcess = null;
    });

    // Aguardar um pouco para o backend inicializar
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return { 
      success: true, 
      status: backendStatus,
      message: 'Backend iniciado com sucesso!' 
    };

  } catch (error) {
    console.error('❌ Erro ao iniciar backend:', error.message);
    backendStatus.lastError = error.message;
    return { success: false, error: error.message };
  }
});

// Parar backend
ipcMain.handle('stop-arduino-backend', async () => {
  console.log('🛑 Recebida solicitação para parar backend Arduino CLI');
  
  if (!backendProcess || backendProcess.killed) {
    console.log('⚠️ Backend não está rodando');
    return { success: false, error: 'Backend não está rodando' };
  }

  try {
    console.log(`🔪 Terminando processo backend PID: ${backendProcess.pid}`);
    
    // Tentar terminar graciosamente primeiro
    backendProcess.kill('SIGTERM');
    
    // Se não terminar em 5 segundos, força a terminação
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        console.log('💀 Forçando terminação do backend...');
        backendProcess.kill('SIGKILL');
      }
    }, 5000);
    
    backendStatus.running = false;
    backendStatus.pid = null;
    backendProcess = null;
    
    return { 
      success: true, 
      message: 'Backend parado com sucesso!' 
    };

  } catch (error) {
    console.error('❌ Erro ao parar backend:', error.message);
    return { success: false, error: error.message };
  }
});

// Obter status do backend
ipcMain.handle('get-arduino-backend-status', async () => {
  return {
    success: true,
    status: backendStatus,
    isRunning: backendProcess && !backendProcess.killed
  };
});

// Testar conexão com backend
ipcMain.handle('test-arduino-backend', async () => {
  if (!backendStatus.running) {
    return { success: false, error: 'Backend não está rodando' };
  }

  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(`http://localhost:${backendStatus.port}/health`);
    const data = await response.json();
    
    return {
      success: response.ok,
      data: data,
      status: backendStatus
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: backendStatus
    };
  }
});

// Limpar processo ao fechar aplicação
app.on('before-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    console.log('🧹 Limpando processo backend antes de fechar...');
    backendProcess.kill('SIGTERM');
  }
});

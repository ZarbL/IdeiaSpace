/**
 * Preload Script Otimizado - IdeiaSpace
 * Carrega apenas o essencial para reduzir uso de memória
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expor apenas APIs essenciais
contextBridge.exposeInMainWorld('electronAPI', {
  // Arquivo I/O
  saveFile: (content) => ipcRenderer.invoke('save-file', content),
  openFile: () => ipcRenderer.invoke('open-file'),
  
  // Arduino CLI
  startBackend: () => ipcRenderer.invoke('start-arduino-backend'),
  stopBackend: () => ipcRenderer.invoke('stop-arduino-backend'),
  getBackendStatus: () => ipcRenderer.invoke('get-backend-status'),
  
  // I18n
  setLanguage: (lang) => ipcRenderer.invoke('set-language', lang),
  getCurrentLanguage: () => ipcRenderer.invoke('get-current-language'),
  
  // Performance
  optimizeMemory: () => {
    if (global.gc) global.gc();
    return Promise.resolve();
  }
});

// Otimização de memória no carregamento
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Preload otimizado carregado');
});
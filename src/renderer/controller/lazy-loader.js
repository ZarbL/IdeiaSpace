/**
 * Lazy Loading Manager - Carregamento sob demanda de componentes
 * Reduz consumo inicial de memória carregando apenas o necessário
 */

class LazyLoader {
  constructor() {
    this.loadedModules = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Carrega um módulo sob demanda
   * @param {string} moduleName - Nome do módulo
   * @param {Function} loader - Função que carrega o módulo
   * @returns {Promise} Promise do módulo carregado
   */
  async loadModule(moduleName, loader) {
    // Se já está carregado, retorna imediatamente
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName);
    }

    // Se está sendo carregado, aguarda o carregamento
    if (this.loadingPromises.has(moduleName)) {
      return this.loadingPromises.get(moduleName);
    }

    // Inicia carregamento
    console.log(`🔄 Carregando módulo: ${moduleName}`);
    const loadingPromise = loader().then(module => {
      this.loadedModules.set(moduleName, module);
      this.loadingPromises.delete(moduleName);
      console.log(`✅ Módulo carregado: ${moduleName}`);
      return module;
    }).catch(error => {
      this.loadingPromises.delete(moduleName);
      console.error(`❌ Erro ao carregar módulo ${moduleName}:`, error);
      throw error;
    });

    this.loadingPromises.set(moduleName, loadingPromise);
    return loadingPromise;
  }

  /**
   * Pré-carrega módulos em background
   * @param {Object} modules - Mapa de módulos para pré-carregar
   */
  preloadModules(modules) {
    Object.entries(modules).forEach(([name, loader]) => {
      setTimeout(() => {
        this.loadModule(name, loader);
      }, 100); // Pequeno delay para não bloquear UI
    });
  }

  /**
   * Remove módulo da memória
   * @param {string} moduleName - Nome do módulo
   */
  unloadModule(moduleName) {
    if (this.loadedModules.has(moduleName)) {
      this.loadedModules.delete(moduleName);
      console.log(`🗑️ Módulo removido da memória: ${moduleName}`);
    }
  }

  /**
   * Limpa todos os módulos carregados
   */
  clearAll() {
    this.loadedModules.clear();
    this.loadingPromises.clear();
    console.log('🧹 Todos os módulos lazy removidos da memória');
  }
}

// Instância global do lazy loader
window.lazyLoader = new LazyLoader();

// Definir módulos disponíveis para carregamento lazy
const LAZY_MODULES = {
  // Blocos MPU6050 (carregado apenas quando necessário)
  mpu6050: () => import('./components/mpu6050-blocks.js'),
  
  // Blocos HMC5883 (carregado apenas quando necessário)
  hmc5883: () => import('./components/hmc5883-blocks.js'),
  
  // Blocos DHT (carregado apenas quando necessário)
  dht: () => import('./components/dht-blocks.js'),
  
  // Blocos BH1750 (carregado apenas quando necessário)
  bh1750: () => import('./components/bh1750-blocks.js'),
  
  // Arduino CLI client (carregado apenas quando necessário)
  arduinoClient: () => import('./arduino-cli-client.js'),
  
  // Gerador de código C++ (carregado apenas quando necessário)
  cppGenerator: () => import('../model/cpp_generator.js')
};

/**
 * Carrega componente específico sob demanda
 * @param {string} componentName - Nome do componente
 * @returns {Promise} Promise do componente carregado
 */
window.loadComponent = async function(componentName) {
  const loader = LAZY_MODULES[componentName];
  if (!loader) {
    throw new Error(`Componente não encontrado: ${componentName}`);
  }
  
  return window.lazyLoader.loadModule(componentName, loader);
};

/**
 * Pré-carrega componentes essenciais em background
 */
window.preloadEssentials = function() {
  const essentials = ['arduinoClient', 'cppGenerator'];
  const modules = {};
  
  essentials.forEach(name => {
    if (LAZY_MODULES[name]) {
      modules[name] = LAZY_MODULES[name];
    }
  });
  
  window.lazyLoader.preloadModules(modules);
};

/**
 * Otimização de memória: limpa módulos não usados
 */
window.optimizeMemory = function() {
  // Forçar garbage collection se disponível
  if (window.gc) {
    window.gc();
  }
  
  // Limpar cache de imagens não usadas
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.isConnected) {
      img.src = '';
    }
  });
  
  console.log('🧹 Otimização de memória executada');
};

// Executar otimização de memória periodicamente
setInterval(window.optimizeMemory, 300000); // 5 minutos

console.log('🚀 Lazy Loading Manager inicializado');
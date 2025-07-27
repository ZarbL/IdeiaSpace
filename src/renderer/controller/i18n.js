// i18n.js - Gerenciador de tradução para IdeiaSpace

const i18n = {
  current: localStorage.getItem('language') || 'pt-BR',
  translations: {},
  
  async loadTranslations(lang) {
    try {
      const response = await fetch(`../locales/${lang}.json`);
      if (!response.ok) throw new Error('Falha ao carregar traduções');
      this.translations[lang] = await response.json();
      console.log(`✅ Traduções carregadas para ${lang}:`, Object.keys(this.translations[lang]).length, 'chaves');
    } catch (e) {
      console.error('❌ Erro ao carregar traduções:', e);
      this.translations[lang] = {};
    }
  },
  
  t(key) {
    const lang = this.current;
    return (this.translations[lang] && this.translations[lang][key]) ? this.translations[lang][key] : key;
  },
  
  async setLanguage(lang) {
    console.log(`🌐 Mudando idioma para: ${lang}`);
    console.log(`📊 Traduções disponíveis:`, Object.keys(this.translations));
    
    if (!this.translations[lang]) {
      console.log(`⚠️ Tradução não carregada para ${lang}, tentando carregar...`);
      await this.loadTranslations(lang);
    }
    if (this.translations[lang]) {
      console.log(`✅ Definindo idioma atual como: ${lang}`);
      this.current = lang;
      localStorage.setItem('language', lang);
      
      console.log('🔄 Aplicando traduções...');
      this.applyTranslations();
      
      console.log('🔄 Atualizando blocos Blockly...');
      this.updateBlocklyBlocks();
      
      console.log('🔄 Atualizando categorias do toolbox...');
      this.updateToolboxCategories();
      
      // Disparar evento customizado para outros componentes
      console.log('📡 Disparando evento languageChanged...');
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: lang, translations: this.translations[lang] } 
      }));
      
      console.log('✅ Processo de mudança de idioma concluído!');
    } else {
      console.error(`❌ Não foi possível carregar traduções para: ${lang}`);
    }
  },
  
  applyTranslations() {
    const lang = this.current;
    console.log(`🔄 Aplicando traduções para: ${lang}`);
    
    // Elementos com data-translate-key
    const elementsToTranslate = document.querySelectorAll('[data-translate-key]');
    console.log(`📋 Encontrados ${elementsToTranslate.length} elementos para traduzir`);
    
    elementsToTranslate.forEach(el => {
      const key = el.getAttribute('data-translate-key');
      if (key && this.translations[lang] && this.translations[lang][key]) {
        const oldText = el.textContent;
        const newText = this.translations[lang][key];
        el.textContent = newText;
        console.log(`🔄 Traduzido "${key}": "${oldText}" → "${newText}"`);
      } else {
        console.warn(`⚠️ Tradução não encontrada para chave "${key}" no idioma ${lang}`);
      }
    });
    
    // Elementos com data-translate-key-placeholder para placeholders
    const placeholderElements = document.querySelectorAll('[data-translate-key-placeholder]');
    console.log(`📋 Encontrados ${placeholderElements.length} placeholders para traduzir`);
    
    placeholderElements.forEach(el => {
      const key = el.getAttribute('data-translate-key-placeholder');
      if (key && this.translations[lang] && this.translations[lang][key]) {
        el.placeholder = this.translations[lang][key];
        console.log(`🔄 Placeholder traduzido "${key}"`);
      }
    });
    
    // Tooltips
    const tooltipElements = document.querySelectorAll('[data-tooltip-key]');
    console.log(`📋 Encontrados ${tooltipElements.length} tooltips para traduzir`);
    
    tooltipElements.forEach(el => {
      const key = el.getAttribute('data-tooltip-key');
      if (key && this.translations[lang] && this.translations[lang][key]) {
        el.setAttribute('data-tooltip', this.translations[lang][key]);
        console.log(`🔄 Tooltip traduzido "${key}"`);
      }
    });
    
    // Atualizar título da página
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
      pageTitle.textContent = this.t('pageTitle');
      console.log(`🔄 Título da página atualizado: "${pageTitle.textContent}"`);
    }
    
    // Atualizar cabeçalho do código
    const codeHeader = document.getElementById('codeHeader');
    if (codeHeader) {
      codeHeader.textContent = this.t('cppCodeTitle');
      console.log(`🔄 Cabeçalho do código atualizado: "${codeHeader.textContent}"`);
    }
    
    // Atualizar placeholder do código
    const codeDisplay = document.getElementById('code-display');
    if (codeDisplay && codeDisplay.textContent.includes('//')) {
      codeDisplay.textContent = this.t('cppCodePlaceholder');
      console.log(`🔄 Placeholder do código atualizado`);
    }
    
    // Atualizar tooltips específicos baseados no estado atual
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      const body = document.body;
      if (body.classList.contains('dark-mode')) {
        darkModeToggle.setAttribute('data-tooltip', this.t('darkModeTooltipLight'));
      } else {
        darkModeToggle.setAttribute('data-tooltip', this.t('darkModeTooltip'));
      }
    }
    
    console.log(`✅ Traduções aplicadas para ${lang}`);
  },
  
  updateBlocklyBlocks() {
    if (typeof Blockly === 'undefined' || !Blockly.Blocks) {
      console.log('⚠️ Blockly não disponível para tradução de blocos');
      return;
    }
    
    console.log('🔄 Atualizando traduções dos blocos Blockly...');
    const lang = this.current;
    
    // Atualizar bloco MPU6050 read se existir
    if (Blockly.Blocks['mpu6050_read']) {
      const originalInit = Blockly.Blocks['mpu6050_read'].init;
      Blockly.Blocks['mpu6050_read'].init = function() {
        originalInit.call(this);
        
        // Atualizar dropdown options
        const dropdown = this.getField('MPU6050_AXIS');
        if (dropdown) {
          const options = [
            [i18n.t('ACCEL_X'), 'ACCEL_X'],
            [i18n.t('ACCEL_Y'), 'ACCEL_Y'],
            [i18n.t('ACCEL_Z'), 'ACCEL_Z'],
            [i18n.t('GYRO_X'), 'GYRO_X'],
            [i18n.t('GYRO_Y'), 'GYRO_Y'],
            [i18n.t('GYRO_Z'), 'GYRO_Z']
          ];
          dropdown.menuGenerator_ = options;
        }
        
        this.setTooltip(i18n.t('mpu6050_read_tooltip'));
      };
    }
    
    // Atualizar outros blocos se necessário
    this.updateCustomBlockTranslations();
  },
  
  updateCustomBlockTranslations() {
    // Função para atualizar traduções específicas dos blocos customizados
    const blocks = [
      'mpu6050_init', 'mpu6050_not', 'bmp180_init', 
      'bmp180_temperature', 'bmp180_pressure', 'bmp180_altitude',
      'delay_function'
    ];
    
    blocks.forEach(blockType => {
      if (Blockly.Blocks[blockType]) {
        const block = Blockly.Blocks[blockType];
        if (block.setTooltip && this.t(`${blockType}_tooltip`)) {
          // Se o bloco já foi instanciado, atualizar tooltip
          const instances = workspace ? workspace.getBlocksByType(blockType) : [];
          instances.forEach(instance => {
            instance.setTooltip(this.t(`${blockType}_tooltip`));
          });
        }
      }
    });
  },
  
  updateToolboxCategories() {
    // Esta função será chamada quando a tradução mudar para atualizar o toolbox
    if (typeof workspace !== 'undefined' && workspace.updateToolbox) {
      console.log('🔄 Atualizando categorias do toolbox...');
      
      // Buscar o toolbox original
      const originalToolbox = document.getElementById('toolbox');
      if (originalToolbox) {
        // Clonar o toolbox e traduzir as categorias
        const translatedToolbox = this.translateToolbox(originalToolbox.cloneNode(true));
        workspace.updateToolbox(translatedToolbox);
      }
    }
  },
  
  translateToolbox(toolboxElement) {
    // Traduzir nomes das categorias
    const categories = toolboxElement.querySelectorAll('category[name]');
    categories.forEach(category => {
      const originalName = category.getAttribute('name');
      let translationKey = '';
      
      // Mapear nomes para chaves de tradução
      switch(originalName) {
        case 'Lógica': 
        case 'Logic': 
          translationKey = 'CAT_LOGIC'; 
          break;
        case 'Controle': 
        case 'Control': 
          translationKey = 'CAT_CONTROL'; 
          break;
        case 'Matemática': 
        case 'Math': 
          translationKey = 'CAT_MATH'; 
          break;
        case 'Texto': 
        case 'Text': 
          translationKey = 'CAT_TEXT'; 
          break;
        case 'Variáveis': 
        case 'Variables': 
          translationKey = 'CAT_VARIABLES'; 
          break;
        case 'Funções': 
        case 'Functions': 
          translationKey = 'CAT_FUNCTIONS'; 
          break;
        case 'Tempo': 
        case 'Time': 
          translationKey = 'CAT_TIME'; 
          break;
        case 'Bibliotecas': 
        case 'Libraries': 
          translationKey = 'CAT_LIBRARIES'; 
          break;
        case 'Sensores': 
        case 'Sensors': 
          translationKey = 'CAT_SENSORS'; 
          break;
        case 'MPU6050':
        case 'Medidas Inerciais':
        case 'Inertial Measurements':
          translationKey = 'CAT_MPU6050'; 
          break;
        case 'BMP180':
          translationKey = 'CAT_BMP180'; 
          break;
        case 'BH1750':
          translationKey = 'CAT_BH1750'; 
          break;
        case 'HMC5883':
          translationKey = 'CAT_HMC5883'; 
          break;
        case 'DHT':
          translationKey = 'CAT_DHT'; 
          break;
      }
      
      if (translationKey && this.t(translationKey)) {
        category.setAttribute('name', this.t(translationKey));
      }
    });
    
    // Traduzir botões
    const buttons = toolboxElement.querySelectorAll('button[text]');
    buttons.forEach(button => {
      const originalText = button.getAttribute('text');
      if (originalText.includes('Criar Nova Variável') || originalText.includes('Create New Variable')) {
        button.setAttribute('text', this.t('createVariableButton'));
      }
    });
    
    return toolboxElement;
  }
};

// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Inicializando sistema i18n...');
  console.log('📊 Estado inicial do DOM:', document.readyState);
  
  try {
    // Verificar se os elementos necessários existem
    const languageToggle = document.getElementById('languageToggle');
    const languageOptions = document.querySelectorAll('.language-option');
    console.log('🔍 Elemento languageToggle encontrado:', !!languageToggle);
    console.log('🔍 Opções de idioma encontradas:', languageOptions.length);
    
    // Carregar ambos os idiomas
    console.log('📥 Carregando traduções...');
    await i18n.loadTranslations('pt-BR');
    await i18n.loadTranslations('en-US');
    
    console.log('📊 Traduções carregadas:', Object.keys(i18n.translations));
    
    // Definir idioma atual
    console.log('🌐 Definindo idioma atual:', i18n.current);
    await i18n.setLanguage(i18n.current);
    
    console.log('✅ Sistema i18n inicializado com sucesso!');
    
    // Disponibilizar globalmente
    window.i18n = i18n;
    console.log('🌍 i18n disponibilizado globalmente:', !!window.i18n);
    
    // Testar uma tradução
    console.log('🧪 Teste de tradução para "pageTitle":', i18n.t('pageTitle'));
    
    // Verificar se os elementos HTML estão sendo traduzidos
    setTimeout(() => {
      const pageTitle = document.getElementById('pageTitle');
      if (pageTitle) {
        console.log('📝 Texto atual do título:', pageTitle.textContent);
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erro ao inicializar i18n:', error);
  }
});
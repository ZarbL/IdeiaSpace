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
    if (!this.translations[lang]) {
      await this.loadTranslations(lang);
    }
    if (this.translations[lang]) {
      this.current = lang;
      localStorage.setItem('language', lang);
      this.applyTranslations();
      this.updateBlocklyBlocks();
      this.updateToolboxCategories();
      
      // Disparar evento customizado para outros componentes
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: lang, translations: this.translations[lang] } 
      }));
    }
  },
  
  applyTranslations() {
    const lang = this.current;
    console.log(`🔄 Aplicando traduções para: ${lang}`);
    
    // Elementos com data-translate-key
    document.querySelectorAll('[data-translate-key]').forEach(el => {
      const key = el.getAttribute('data-translate-key');
      if (key && this.translations[lang] && this.translations[lang][key]) {
        el.textContent = this.translations[lang][key];
      }
    });
    
    // Elementos com data-translate-key-placeholder para placeholders
    document.querySelectorAll('[data-translate-key-placeholder]').forEach(el => {
      const key = el.getAttribute('data-translate-key-placeholder');
      if (key && this.translations[lang] && this.translations[lang][key]) {
        el.placeholder = this.translations[lang][key];
      }
    });
    
    // Tooltips
    document.querySelectorAll('[data-tooltip-key]').forEach(el => {
      const key = el.getAttribute('data-tooltip-key');
      if (key && this.translations[lang] && this.translations[lang][key]) {
        el.setAttribute('data-tooltip', this.translations[lang][key]);
      }
    });
    
    // Atualizar título da página
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
      pageTitle.textContent = this.t('pageTitle');
    }
    
    // Atualizar cabeçalho do código
    const codeHeader = document.getElementById('codeHeader');
    if (codeHeader) {
      codeHeader.textContent = this.t('cppCodeTitle');
    }
    
    // Atualizar placeholder do código
    const codeDisplay = document.getElementById('code-display');
    if (codeDisplay && codeDisplay.textContent.includes('//')) {
      codeDisplay.textContent = this.t('cppCodePlaceholder');
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
  
  // Carregar ambos os idiomas
  await i18n.loadTranslations('pt-BR');
  await i18n.loadTranslations('en-US');
  
  // Definir idioma atual
  await i18n.setLanguage(i18n.current);
  
  // Configurar botão de idioma
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', async function() {
      const nextLang = i18n.current === 'pt-BR' ? 'en-US' : 'pt-BR';
      await i18n.setLanguage(nextLang);
      langBtn.textContent = i18n.current === 'pt-BR' ? 'EN' : 'PT';
    });
    // Atualizar texto do botão ao carregar
    langBtn.textContent = i18n.current === 'pt-BR' ? 'EN' : 'PT';
  }
  
  console.log('✅ Sistema i18n inicializado com sucesso!');
});

// Disponibilizar globalmente
window.i18n = i18n;

// i18n.js - Gerenciador de tradução para IdeiaSpace

const i18n = {
  current: localStorage.getItem('language') || 'pt-BR',
  translations: {},
  originalBlockDefinitions: null, // Para armazenar definições originais dos blocos
  
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
      
      console.log(`✅ Idioma alterado para: ${lang}`);
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
    
    // Redefinir blocos com traduções
    this.redefineBlocksWithTranslations();
    
    // Traduzir blocos já instanciados no workspace
    this.translateExistingBlocks();
    
    // Atualizar toolbox para refletir as mudanças
    this.updateToolboxCategories();
  },
  
  redefineBlocksWithTranslations() {
    console.log('🔄 Redefinindo blocos com traduções...');
    
    // Redefinir bloco delay_block
    if (Blockly.Blocks['delay_block']) {
      Blockly.Blocks['delay_block'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('delay') || "delay")
            .appendField(new Blockly.FieldNumber(1000, 0, 60000, 100), "DELAY_TIME")
            .appendField(window.i18n.t('milliseconds') || "milliseconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip(window.i18n.t('delay_tooltip') || "Delay execution for specified milliseconds");
        this.setHelpUrl("");
      };
    }
    
    // Redefinir bloco digital_write
    if (Blockly.Blocks['digital_write']) {
      Blockly.Blocks['digital_write'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('digital_write_pin') || "digital write pin")
            .appendField(new Blockly.FieldDropdown([
              ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
              ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"],
              ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]
            ]), "PIN")
            .appendField(window.i18n.t('to') || "to")
            .appendField(new Blockly.FieldDropdown([
              ["HIGH", "HIGH"], ["LOW", "LOW"]
            ]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Set digital pin to HIGH or LOW");
        this.setHelpUrl("");
      };
    }
    
    // Redefinir bloco digital_read
    if (Blockly.Blocks['digital_read']) {
      Blockly.Blocks['digital_read'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('digital_read_pin') || "digital read pin")
            .appendField(new Blockly.FieldDropdown([
              ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
              ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"],
              ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]
            ]), "PIN");
        this.setOutput(true, null);
        this.setColour(230);
        this.setTooltip("Read digital pin value (HIGH or LOW)");
        this.setHelpUrl("");
      };
    }
    
    // Redefinir blocos MPU6050
    if (Blockly.Blocks['mpu6050_init']) {
      Blockly.Blocks['mpu6050_init'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('initialize_mpu6050') || "🔧 Inicializar MPU6050")
            .appendField(window.i18n.t('scl') || "SCL:")
            .appendField(new Blockly.FieldDropdown([
              ["5", "5"], ["21", "21"], ["22", "22"]
            ]), "SCL_PIN")
            .appendField(window.i18n.t('sda') || "SDA:")
            .appendField(new Blockly.FieldDropdown([
              ["4", "4"], ["20", "20"], ["21", "21"]
            ]), "SDA_PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip(window.i18n.t('mpu6050_init_tooltip') || "Inicializa o sensor MPU6050 com os pinos SCL e SDA especificados");
        this.setHelpUrl("");
      };
    }
    
    // Redefinir blocos de aceleração MPU6050
    ['mpu6050_accel_x', 'mpu6050_accel_y', 'mpu6050_accel_z'].forEach((blockType, index) => {
      const axis = ['x', 'y', 'z'][index].toUpperCase();
      if (Blockly.Blocks[blockType]) {
        Blockly.Blocks[blockType].init = function() {
          this.appendDummyInput()
              .appendField(window.i18n.t(`acceleration_${axis.toLowerCase()}`) || `📊 Aceleração - ${axis}`);
          this.setOutput(true, 'Number');
          this.setColour(230);
          this.setTooltip(`Lê o valor de aceleração no eixo ${axis} do MPU6050`);
          this.setHelpUrl('');
        };
      }
    });
    
    // Redefinir blocos de giroscópio MPU6050
    ['mpu6050_gyro_x', 'mpu6050_gyro_y', 'mpu6050_gyro_z'].forEach((blockType, index) => {
      const axis = ['x', 'y', 'z'][index].toUpperCase();
      if (Blockly.Blocks[blockType]) {
        Blockly.Blocks[blockType].init = function() {
          this.appendDummyInput()
              .appendField(window.i18n.t(`gyro_${axis.toLowerCase()}`) || `🔄 Giro - ${axis}`);
          this.setOutput(true, 'Number');
          this.setColour(270);
          this.setTooltip(`Lê o valor de rotação no eixo ${axis} do MPU6050`);
          this.setHelpUrl('');
        };
      }
    });
    
    // Redefinir blocos BMP180
    if (Blockly.Blocks['bmp180_init']) {
      Blockly.Blocks['bmp180_init'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('initialize_bmp180') || "🔧 Inicializar BMP180")
            .appendField(window.i18n.t('scl') || "SCL:")
            .appendField(new Blockly.FieldDropdown([
              ["5", "5"], ["21", "21"], ["22", "22"]
            ]), "SCL_PIN")
            .appendField(window.i18n.t('sda') || "SDA:")
            .appendField(new Blockly.FieldDropdown([
              ["4", "4"], ["20", "20"], ["21", "21"]
            ]), "SDA_PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("Inicializa o sensor BMP180 com os pinos SCL e SDA especificados");
        this.setHelpUrl("");
      };
    }
    
    if (Blockly.Blocks['bmp180_pressure']) {
      Blockly.Blocks['bmp180_pressure'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('pressure') || "📊 Pressão");
        this.setOutput(true, 'Number');
        this.setColour(200);
        this.setTooltip('Lê o valor de pressão do BMP180 em Pascals');
        this.setHelpUrl('');
      };
    }
    
    if (Blockly.Blocks['bmp180_temperature']) {
      Blockly.Blocks['bmp180_temperature'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('temperature') || "🌡️ Temperatura");
        this.setOutput(true, 'Number');
        this.setColour(30);
        this.setTooltip('Lê o valor de temperatura do BMP180 em graus Celsius');
        this.setHelpUrl('');
      };
    }
    
    if (Blockly.Blocks['bmp180_altitude']) {
      Blockly.Blocks['bmp180_altitude'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('altitude') || "📏 Altura");
        this.setOutput(true, 'Number');
        this.setColour(260);
        this.setTooltip('Lê o valor de altitude do BMP180 em metros');
        this.setHelpUrl('');
      };
    }
    
    // Redefinir blocos BH1750 (Light Sensor)
    if (Blockly.Blocks['bh1750_init']) {
      Blockly.Blocks['bh1750_init'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('initialize_bh1750') || "💡 Inicializar BH1750")
            .appendField(window.i18n.t('scl') || "SCL:")
            .appendField(new Blockly.FieldDropdown([
              ["5", "5"], ["21", "21"], ["22", "22"]
            ]), "SCL_PIN")
            .appendField(window.i18n.t('sda') || "SDA:")
            .appendField(new Blockly.FieldDropdown([
              ["4", "4"], ["20", "20"], ["21", "21"]
            ]), "SDA_PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("Inicializa o sensor BH1750 com os pinos SCL e SDA especificados");
        this.setHelpUrl("");
      };
    }
    
    if (Blockly.Blocks['bh1750_light_level']) {
      Blockly.Blocks['bh1750_light_level'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('light_level_lux') || "☀️ Luminosidade (lux)");
        this.setOutput(true, 'Number');
        this.setColour(60);
        this.setTooltip('Lê o valor de luminosidade do BH1750 em lux');
        this.setHelpUrl('');
      };
    }
    
    if (Blockly.Blocks['bh1750_set_mode']) {
      Blockly.Blocks['bh1750_set_mode'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('configure_bh1750_mode') || "⚙️ Configurar modo BH1750:")
            .appendField(new Blockly.FieldDropdown([
              ["Alta resolução (1 lx)", "BH1750::CONTINUOUS_HIGH_RES_MODE"],
              ["Alta resolução 2 (0.5 lx)", "BH1750::CONTINUOUS_HIGH_RES_MODE_2"],
              ["Baixa resolução (4 lx)", "BH1750::CONTINUOUS_LOW_RES_MODE"],
              ["Uma medição alta res.", "BH1750::ONE_TIME_HIGH_RES_MODE"],
              ["Uma medição alta res. 2", "BH1750::ONE_TIME_HIGH_RES_MODE_2"],
              ["Uma medição baixa res.", "BH1750::ONE_TIME_LOW_RES_MODE"]
            ]), "MODE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("Configura o modo de medição do sensor BH1750");
        this.setHelpUrl("");
      };
    }
    
    if (Blockly.Blocks['bh1750_begin']) {
      Blockly.Blocks['bh1750_begin'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('start_bh1750') || "🚀 Iniciar BH1750");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(45);
        this.setTooltip("Inicia a comunicação com o sensor BH1750");
        this.setHelpUrl("");
      };
    }
    
    // Redefinir blocos HMC5883 (Magnetometer)
    if (Blockly.Blocks['hmc5883_init']) {
      Blockly.Blocks['hmc5883_init'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('initialize_hmc5883') || "🧭 Inicializar HMC5883")
            .appendField(window.i18n.t('scl') || "SCL:")
            .appendField(new Blockly.FieldDropdown([
              ["5", "5"], ["21", "21"], ["22", "22"]
            ]), "SCL_PIN")
            .appendField(window.i18n.t('sda') || "SDA:")
            .appendField(new Blockly.FieldDropdown([
              ["4", "4"], ["20", "20"], ["21", "21"]
            ]), "SDA_PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#E74C3C");
        this.setTooltip("Inicializa o magnetômetro/bússola HMC5883 com os pinos SCL e SDA especificados");
        this.setHelpUrl("");
      };
    }
    
    if (Blockly.Blocks['hmc5883_begin']) {
      Blockly.Blocks['hmc5883_begin'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('hmc5883_begin') || "🚀 HMC5883 Begin");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#DC143C");
        this.setTooltip("Inicia a comunicação com o magnetômetro HMC5883");
        this.setHelpUrl("");
      };
    }
    
    // Redefinir blocos de campo magnético HMC5883
    ['hmc5883_mag_x', 'hmc5883_mag_y', 'hmc5883_mag_z'].forEach((blockType, index) => {
      const axis = ['x', 'y', 'z'][index].toLowerCase();
      if (Blockly.Blocks[blockType]) {
        Blockly.Blocks[blockType].init = function() {
          this.appendDummyInput()
              .appendField(window.i18n.t(`magnetic_field_${axis}`) || `🧲 Campo Magnético - ${axis.toUpperCase()}`);
          this.setOutput(true, 'Number');
          this.setColour("#FF6B6B");
          this.setTooltip(`Lê o valor do campo magnético no eixo ${axis.toUpperCase()} em microTesla (μT)`);
          this.setHelpUrl('');
        };
      }
    });
    
    if (Blockly.Blocks['hmc5883_heading']) {
      Blockly.Blocks['hmc5883_heading'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('compass_heading') || "🧭 Direção da Bússola (graus)");
        this.setOutput(true, 'Number');
        this.setColour("#8B0000");
        this.setTooltip('Calcula a direção da bússola em graus (0-360°) baseado nos valores X e Y');
        this.setHelpUrl('');
      };
    }
    
    // Blocos HMC5883 adicionais que estavam faltando
    if (Blockly.Blocks['hmc5883_sensor_object']) {
      Blockly.Blocks['hmc5883_sensor_object'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('hmc5883_initializer') || "🧭 Inicializador HMC5883");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);  
        this.setColour("#800000");
        this.setTooltip('Declara o objeto do sensor HMC5883 com ID único');
        this.setHelpUrl('');
      };
    }
    
    if (Blockly.Blocks['hmc5883_set_gain']) {
      Blockly.Blocks['hmc5883_set_gain'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('configure_hmc5883_gain') || "⚙️ Configurar Ganho HMC5883:")
            .appendField(new Blockly.FieldDropdown([
              ["±1.3 Ga (padrão)", "HMC5883_MAGGAIN_1_3"],
              ["±1.9 Ga", "HMC5883_MAGGAIN_1_9"],
              ["±2.5 Ga", "HMC5883_MAGGAIN_2_5"],
              ["±4.0 Ga", "HMC5883_MAGGAIN_4_0"],
              ["±4.7 Ga", "HMC5883_MAGGAIN_4_7"],
              ["±5.6 Ga", "HMC5883_MAGGAIN_5_6"],
              ["±8.1 Ga", "HMC5883_MAGGAIN_8_1"]
            ]), "GAIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#B22222");
        this.setTooltip("Configura o ganho/sensibilidade do magnetômetro HMC5883 (Gauss)");
        this.setHelpUrl("");
      };
    }
    
    if (Blockly.Blocks['hmc5883_declination']) {
      Blockly.Blocks['hmc5883_declination'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('magnetic_declination') || "🌍 Declinação Magnética:")
            .appendField(new Blockly.FieldNumber(0, -180, 180, 0.1), "DECLINATION")
            .appendField(window.i18n.t('degrees') || "graus");
        this.setOutput(true, 'Number');
        this.setColour("#A0522D");
        this.setTooltip('Define o ângulo de declinação magnética da sua localização para correção da bússola');
        this.setHelpUrl('');
      };
    }
    
    if (Blockly.Blocks['hmc5883_direction_text']) {
      Blockly.Blocks['hmc5883_direction_text'].init = function() {
        this.appendValueInput("HEADING")
            .setCheck("Number")
            .appendField(window.i18n.t('cardinal_direction') || "🧭 Direção Cardinal:");
        this.setOutput(true, 'String');
        this.setColour("#CD853F");
        this.setTooltip('Converte o ângulo da bússola em direção cardinal (N, NE, E, SE, S, SW, W, NW)');
        this.setHelpUrl('');
      };
    }
    
    if (Blockly.Blocks['hmc5883_sensor_info']) {
      Blockly.Blocks['hmc5883_sensor_info'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('sensor_hmc5883') || "🔍 Sensor HMC5883:")
            .appendField(new Blockly.FieldDropdown([
              ["Sensor name", "sensor_name"],
              ["Sensor version", "sensor_version"], 
              ["Sensor id", "sensor_id"],
              ["Sensor minimo valor", "sensor_min_value"],
              ["Sensor maximo valor", "sensor_max_value"],
              ["Sensor de Resolução", "sensor_resolution"]
            ]), "INFO_TYPE");
        this.setOutput(true, 'String');
        this.setColour("#9932CC");
        this.setTooltip('Obtém informações específicas sobre o sensor HMC5883 (nome, versão, ID, valores min/max, resolução)');
        this.setHelpUrl('');
      };
    }
    
    if (Blockly.Blocks['hmc5883_display_sensor']) {
      Blockly.Blocks['hmc5883_display_sensor'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('display_sensor_hmc5883') || "📋 Display do Sensor HMC5883");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#9932CC");
        this.setTooltip('Chama a função displaySensorDetails() para exibir informações detalhadas do sensor HMC5883');
        this.setHelpUrl('');
      };
    }
    
    if (Blockly.Blocks['heading_correction']) {
      Blockly.Blocks['heading_correction'].init = function() {
        this.appendValueInput("HEADING")
            .setCheck("Number")
            .appendField(window.i18n.t('correct_heading') || "🧭 Corrigir direção");
        this.appendValueInput("DECLINATION")
            .setCheck("Number")
            .appendField(window.i18n.t('declination_input') || "declinação:");
        this.appendDummyInput()
            .appendField(window.i18n.t('convert_to_degrees') || "converter para graus");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#D68910");
        this.setTooltip('Corrige o heading com declinação magnética, normaliza entre 0-2π e converte para graus. Cria a variável headingDegrees. Usado em navegação aeroespacial.');
        this.setHelpUrl('');
      };
    }
    
    // Redefinir blocos DHT (Temperature and Humidity)
    if (Blockly.Blocks['dht_init']) {
      Blockly.Blocks['dht_init'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('initialize_dht') || "🔧 Inicializar DHT")
            .appendField(new Blockly.FieldDropdown([
              ["DHT11", "DHT11"],
              ["DHT22", "DHT22"]
            ]), "TYPE")
            .appendField(window.i18n.t('on_pin') || "no pino")
            .appendField(new Blockly.FieldDropdown([
              ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
              ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"],
              ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"],
              ["14", "14"], ["15", "15"]
            ]), "PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip('Inicializa o sensor DHT11 ou DHT22 no pino especificado');
        this.setHelpUrl('');
      };
    }
    
    if (Blockly.Blocks['dht_temperature']) {
      Blockly.Blocks['dht_temperature'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('dht_temperature') || "🌡️ Temperatura DHT");
        this.setOutput(true, 'Number');
        this.setColour(30);
        this.setTooltip('Lê o valor de temperatura do sensor DHT em graus Celsius');
        this.setHelpUrl('');
      };
    }
    
    if (Blockly.Blocks['dht_humidity']) {
      Blockly.Blocks['dht_humidity'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('dht_humidity') || "💧 Umidade DHT");
        this.setOutput(true, 'Number');
        this.setColour(200);
        this.setTooltip('Lê o valor de umidade do sensor DHT em porcentagem');
        this.setHelpUrl('');
      };
    }
    
    if (Blockly.Blocks['dht_begin']) {
      Blockly.Blocks['dht_begin'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('dht_begin') || "🚀 DHT Begin");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip('Inicializa o sensor DHT - deve ser usado no setup()');
        this.setHelpUrl('');
      };
    }
    
    if (Blockly.Blocks['dht_heat_index']) {
      Blockly.Blocks['dht_heat_index'].init = function() {
        this.appendDummyInput()
            .appendField(window.i18n.t('calculate_heat_index') || "🌡️🔥 Calcular Índice de Calor");
        this.appendValueInput("TEMPERATURE")
            .setCheck("Number")
            .appendField(window.i18n.t('temperature_input') || "Temperatura:");
        this.appendValueInput("HUMIDITY")
            .setCheck("Number")
            .appendField(window.i18n.t('humidity_input') || "Umidade:");
        this.appendValueInput("UNIT")
            .setCheck(["String", "Boolean"])
            .appendField(window.i18n.t('condition_input') || "Condição:");
        this.setOutput(true, 'Number');
        this.setColour(30);
        this.setTooltip('Calcula o índice de calor usando temperatura, umidade e unidade (true para Fahrenheit, false para Celsius)');
        this.setHelpUrl('');
      };
    }
    
    console.log('✅ Blocos redefinidos com traduções!');
  },
  
  translateExistingBlocks() {
    const workspace = window.blocklyWorkspace;
    if (!workspace) {
      console.log('⚠️ Workspace não disponível para tradução');
      return;
    }
    
    const allBlocks = workspace.getAllBlocks();
    console.log(`🔄 Traduzindo ${allBlocks.length} blocos existentes...`);
    
    allBlocks.forEach(block => {
      this.translateBlockFields(block);
    });
    
    // Forçar redraw do workspace
    workspace.render();
  },
  
  translateBlockFields(block) {
    const blockType = block.type;
    
    // Mapeamento de tipos de blocos para suas traduções
    const blockTranslations = {
      'delay_block': {
        fields: [
          { text: 'delay', key: 'delay' },
          { text: 'milliseconds', key: 'milliseconds' }
        ]
      },
      'digital_write': {
        fields: [
          { text: 'digital write pin', key: 'digital_write_pin' },
          { text: 'to', key: 'to' }
        ]
      },
      'digital_read': {
        fields: [
          { text: 'digital read pin', key: 'digital_read_pin' }
        ]
      },
      'variable_declaration': {
        fields: [
          { text: 'declarar', key: 'declare' }
        ]
      },
      'int_variable_set': {
        fields: [
          { text: 'definir', key: 'set' }
        ]
      },
      'mpu6050_init': {
        fields: [
          { text: '🔧 Inicializar MPU6050', key: 'initialize_mpu6050' },
          { text: 'SCL:', key: 'scl' },
          { text: 'SDA:', key: 'sda' }
        ]
      },
      'mpu6050_accel_x': {
        fields: [
          { text: '📊 Aceleração - X', key: 'acceleration_x' }
        ]
      },
      'mpu6050_accel_y': {
        fields: [
          { text: '📊 Aceleração - Y', key: 'acceleration_y' }
        ]
      },
      'mpu6050_accel_z': {
        fields: [
          { text: '📊 Aceleração - Z', key: 'acceleration_z' }
        ]
      },
      'mpu6050_gyro_x': {
        fields: [
          { text: '🌀 Giro - X', key: 'gyro_x' }
        ]
      },
      'mpu6050_gyro_y': {
        fields: [
          { text: '🌀 Giro - Y', key: 'gyro_y' }
        ]
      },
      'mpu6050_gyro_z': {
        fields: [
          { text: '🌀 Giro - Z', key: 'gyro_z' }
        ]
      },
      'bmp180_init': {
        fields: [
          { text: '🔧 Inicializar BMP180', key: 'initialize_bmp180' },
          { text: 'SCL:', key: 'scl' },
          { text: 'SDA:', key: 'sda' }
        ]
      },
      'bmp180_pressure': {
        fields: [
          { text: '📊 Pressão', key: 'pressure' }
        ]
      },
      'bmp180_temperature': {
        fields: [
          { text: '🌡️ Temperatura', key: 'temperature' }
        ]
      },
      'bmp180_altitude': {
        fields: [
          { text: '📏 Altura', key: 'altitude' }
        ]
      },
      'bh1750_init': {
        fields: [
          { text: '💡 Inicializar BH1750', key: 'initialize_bh1750' },
          { text: 'SCL:', key: 'scl' },
          { text: 'SDA:', key: 'sda' }
        ]
      },
      'bh1750_light_level': {
        fields: [
          { text: '☀️ Luminosidade (lux)', key: 'light_level_lux' }
        ]
      },
      'bh1750_set_mode': {
        fields: [
          { text: '⚙️ Configurar modo BH1750:', key: 'configure_bh1750_mode' }
        ]
      },
      'bh1750_begin': {
        fields: [
          { text: '🚀 Iniciar BH1750', key: 'start_bh1750' }
        ]
      },
      'library_arduino_basic': {
        fields: [
          { text: '📚 Incluir bibliotecas básicas Arduino', key: 'include_basic_arduino' }
        ]
      },
      'library_wire': {
        fields: [
          { text: '📚 Incluir biblioteca Wire (I2C)', key: 'include_wire' }
        ]
      },
      'library_sensor': {
        fields: [
          { text: '📚 Biblioteca AdaFruit', key: 'include_adafruit' }
        ]
      },
      'library_bmp180': {
        fields: [
          { text: '📚 Incluir biblioteca BMP180', key: 'include_library' }
        ]
      },
      'library_mpu6050': {
        fields: [
          { text: '📚 Incluir biblioteca MPU6050', key: 'include_library' }
        ]
      },
      'library_bh1750': {
        fields: [
          { text: '📚 Incluir biblioteca BH1750', key: 'include_library' }
        ]
      },
      'library_hmc5883': {
        fields: [
          { text: '📚 Biblioteca HMC5883', key: 'include_library' }
        ]
      },
      'library_dht': {
        fields: [
          { text: '📚 Incluir biblioteca DHT', key: 'include_library' }
        ]
      },
      'hmc5883_init': {
        fields: [
          { text: '🧭 Inicializar HMC5883', key: 'initialize_hmc5883' },
          { text: 'SCL:', key: 'scl' },
          { text: 'SDA:', key: 'sda' }
        ]
      },
      'hmc5883_begin': {
        fields: [
          { text: '🚀 HMC5883 Begin', key: 'hmc5883_begin' }
        ]
      },
      'hmc5883_mag_x': {
        fields: [
          { text: '🧲 Campo Magnético - X', key: 'magnetic_field_x' }
        ]
      },
      'hmc5883_mag_y': {
        fields: [
          { text: '🧲 Campo Magnético - Y', key: 'magnetic_field_y' }
        ]
      },
      'hmc5883_mag_z': {
        fields: [
          { text: '🧲 Campo Magnético - Z', key: 'magnetic_field_z' }
        ]
      },
      'hmc5883_heading': {
        fields: [
          { text: '🧭 Direção da Bússola (graus)', key: 'compass_heading' }
        ]
      },
      'bh1750_init': {
        fields: [
          { text: '💡 Inicializar BH1750', key: 'initialize_bh1750' },
          { text: 'SCL:', key: 'scl' },
          { text: 'SDA:', key: 'sda' }
        ]
      },
      'bh1750_light_level': {
        fields: [
          { text: '☀️ Luminosidade (lux)', key: 'light_level_lux' }
        ]
      },
      'bh1750_set_mode': {
        fields: [
          { text: '⚙️ Configurar modo BH1750:', key: 'configure_bh1750_mode' }
        ]
      },
      'bh1750_begin': {
        fields: [
          { text: '🚀 Iniciar BH1750', key: 'start_bh1750' }
        ]
      },
      'dht_init': {
        fields: [
          { text: '🔧 Inicializar DHT', key: 'initialize_dht' },
          { text: 'no pino', key: 'on_pin' }
        ]
      },
      'dht_temperature': {
        fields: [
          { text: '🌡️ Temperatura DHT', key: 'dht_temperature' }
        ]
      },
      'dht_humidity': {
        fields: [
          { text: '💧 Umidade DHT', key: 'dht_humidity' }
        ]
      },
      'dht_begin': {
        fields: [
          { text: '🚀 DHT Begin', key: 'dht_begin' }
        ]
      },
      'dht_heat_index': {
        fields: [
          { text: '🌡️🔥 Calcular Índice de Calor', key: 'calculate_heat_index' },
          { text: 'Temperatura:', key: 'temperature_input' },
          { text: 'Umidade:', key: 'humidity_input' },
          { text: 'Condição:', key: 'condition_input' }
        ]
      },
      'hmc5883_sensor_object': {
        fields: [
          { text: '🧭 Inicializador HMC5883', key: 'hmc5883_initializer' }
        ]
      },
      'hmc5883_set_gain': {
        fields: [
          { text: '⚙️ Configurar Ganho HMC5883:', key: 'configure_hmc5883_gain' }
        ]
      },
      'hmc5883_declination': {
        fields: [
          { text: '🌍 Declinação Magnética:', key: 'magnetic_declination' },
          { text: 'graus', key: 'degrees' }
        ]
      },
      'hmc5883_direction_text': {
        fields: [
          { text: '🧭 Direção Cardinal:', key: 'cardinal_direction' }
        ]
      },
      'hmc5883_sensor_info': {
        fields: [
          { text: '🔍 Sensor HMC5883:', key: 'sensor_hmc5883' }
        ]
      },
      'hmc5883_display_sensor': {
        fields: [
          { text: '📋 Display do Sensor HMC5883', key: 'display_sensor_hmc5883' }
        ]
      },
      'heading_correction': {
        fields: [
          { text: '🧭 Corrigir direção', key: 'correct_heading' },
          { text: 'declinação:', key: 'declination_input' },
          { text: 'converter para graus', key: 'convert_to_degrees' }
        ]
      }
    };
    
    const translation = blockTranslations[blockType];
    if (!translation) return;
    
    // Obter todos os inputs do bloco
    const inputList = block.inputList;
    
    inputList.forEach(input => {
      input.fieldRow.forEach(field => {
        if (field.constructor.name === 'FieldLabel') {
          const currentText = field.getText();
          
          // Procurar tradução correspondente
          translation.fields.forEach(fieldTranslation => {
            if (currentText.includes(fieldTranslation.text.replace(/🔧|📊|🔄/g, '').trim()) || 
                currentText === fieldTranslation.text) {
              const translatedText = this.t(fieldTranslation.key);
              if (translatedText && translatedText !== fieldTranslation.key) {
                field.setValue(translatedText);
              }
            }
          });
        }
      });
    });
  },
  
  updateBlockDefinitions() {
    // Atualizar definições dos blocos para futuras instâncias
    const self = this;
    
    // Backup das definições originais se ainda não foi feito
    if (!this.originalBlockDefinitions) {
      this.originalBlockDefinitions = {};
    }
    
    // Lista de blocos a serem traduzidos
    const blocksToTranslate = [
      'delay_block', 'digital_write', 'digital_read', 'variable_declaration',
      'int_variable_set', 'mpu6050_init', 'mpu6050_accel_x', 'mpu6050_accel_y',
      'mpu6050_accel_z', 'mpu6050_gyro_x', 'mpu6050_gyro_y', 'mpu6050_gyro_z',
      'bmp180_init', 'bmp180_pressure', 'bmp180_temperature', 'bmp180_altitude',
      'bh1750_init', 'bh1750_light_level', 'bh1750_set_mode', 'bh1750_begin',
      'library_arduino_basic', 'library_wire', 'library_sensor', 'library_bmp180',
      'library_mpu6050', 'library_bh1750', 'library_hmc5883', 'library_dht',
      'hmc5883_init', 'hmc5883_begin', 'hmc5883_mag_x', 'hmc5883_mag_y',
      'hmc5883_mag_z', 'hmc5883_heading'
    ];
    
    blocksToTranslate.forEach(blockType => {
      if (Blockly.Blocks[blockType]) {
        // Salvar definição original se ainda não foi salva
        if (!this.originalBlockDefinitions[blockType]) {
          this.originalBlockDefinitions[blockType] = Blockly.Blocks[blockType].init;
        }
        
        // Criar nova função init traduzida
        Blockly.Blocks[blockType].init = this.createTranslatedInit(blockType);
      }
    });
  },
  
  createTranslatedInit(blockType) {
    const self = this;
    const originalInit = this.originalBlockDefinitions[blockType];
    
    return function() {
      // Chamar init original
      originalInit.call(this);
      
      // Aplicar traduções baseadas no tipo do bloco
      self.applyBlockTypeTranslation(this, blockType);
    };
  },
  
  applyBlockTypeTranslation(block, blockType) {
    const inputList = block.inputList;
    
    inputList.forEach(input => {
      input.fieldRow.forEach(field => {
        if (field.constructor.name === 'FieldLabel') {
          const currentText = field.getText();
          let translationKey = null;
          
          // Mapear texto atual para chave de tradução baseado no tipo do bloco
          switch(blockType) {
            case 'delay_block':
              if (currentText === 'delay') translationKey = 'delay';
              else if (currentText === 'milliseconds') translationKey = 'milliseconds';
              break;
            case 'digital_write':
              if (currentText === 'digital write pin') translationKey = 'digital_write_pin';
              else if (currentText === 'to') translationKey = 'to';
              break;
            case 'digital_read':
              if (currentText === 'digital read pin') translationKey = 'digital_read_pin';
              break;
            case 'variable_declaration':
              if (currentText === 'declarar') translationKey = 'declare';
              break;
            case 'int_variable_set':
              if (currentText === 'definir') translationKey = 'set';
              break;
            case 'mpu6050_init':
              if (currentText.includes('Inicializar MPU6050')) translationKey = 'initialize_mpu6050';
              else if (currentText === 'SCL:') translationKey = 'scl';
              else if (currentText === 'SDA:') translationKey = 'sda';
              break;
            case 'mpu6050_accel_x':
              if (currentText.includes('Aceleração - X')) translationKey = 'acceleration_x';
              break;
            case 'mpu6050_accel_y':
              if (currentText.includes('Aceleração - Y')) translationKey = 'acceleration_y';
              break;
            case 'mpu6050_accel_z':
              if (currentText.includes('Aceleração - Z')) translationKey = 'acceleration_z';
              break;
            case 'mpu6050_gyro_x':
              if (currentText.includes('Giro - X')) translationKey = 'gyro_x';
              break;
            case 'mpu6050_gyro_y':
              if (currentText.includes('Giro - Y')) translationKey = 'gyro_y';
              break;
            case 'mpu6050_gyro_z':
              if (currentText.includes('Giro - Z')) translationKey = 'gyro_z';
              break;
            case 'bmp180_init':
              if (currentText.includes('Inicializar BMP180')) translationKey = 'initialize_bmp180';
              else if (currentText === 'SCL:') translationKey = 'scl';
              else if (currentText === 'SDA:') translationKey = 'sda';
              break;
            case 'bmp180_pressure':
              if (currentText.includes('Pressão')) translationKey = 'pressure';
              break;
            case 'bmp180_temperature':
              if (currentText.includes('Temperatura')) translationKey = 'temperature';
              break;
            case 'bmp180_altitude':
              if (currentText.includes('Altura')) translationKey = 'altitude';
              break;
            case 'bh1750_init':
              if (currentText.includes('Inicializar BH1750')) translationKey = 'initialize_bh1750';
              else if (currentText === 'SCL:') translationKey = 'scl';
              else if (currentText === 'SDA:') translationKey = 'sda';
              break;
            case 'bh1750_light_level':
              if (currentText.includes('Luminosidade (lux)')) translationKey = 'light_level_lux';
              break;
            case 'bh1750_set_mode':
              if (currentText.includes('Configurar modo BH1750:')) translationKey = 'configure_bh1750_mode';
              break;
            case 'bh1750_begin':
              if (currentText.includes('Iniciar BH1750')) translationKey = 'start_bh1750';
              break;
            case 'library_arduino_basic':
              if (currentText.includes('Incluir bibliotecas básicas Arduino')) translationKey = 'include_basic_arduino';
              break;
            case 'library_wire':
              if (currentText.includes('Incluir biblioteca Wire (I2C)')) translationKey = 'include_wire';
              break;
            case 'library_sensor':
              if (currentText.includes('Biblioteca AdaFruit')) translationKey = 'include_adafruit';
              break;
            case 'library_bmp180':
            case 'library_mpu6050':
            case 'library_bh1750':
            case 'library_hmc5883':
            case 'library_dht':
              if (currentText.includes('Incluir biblioteca') || currentText.includes('Biblioteca')) {
                translationKey = 'include_library';
              }
              break;
            case 'hmc5883_init':
              if (currentText.includes('Inicializar HMC5883')) translationKey = 'initialize_hmc5883';
              else if (currentText === 'SCL:') translationKey = 'scl';
              else if (currentText === 'SDA:') translationKey = 'sda';
              break;
            case 'hmc5883_begin':
              if (currentText.includes('HMC5883 Begin')) translationKey = 'hmc5883_begin';
              break;
            case 'hmc5883_mag_x':
              if (currentText.includes('Campo Magnético - X')) translationKey = 'magnetic_field_x';
              break;
            case 'hmc5883_mag_y':
              if (currentText.includes('Campo Magnético - Y')) translationKey = 'magnetic_field_y';
              break;
            case 'hmc5883_mag_z':
              if (currentText.includes('Campo Magnético - Z')) translationKey = 'magnetic_field_z';
              break;
            case 'hmc5883_heading':
              if (currentText.includes('Direção da Bússola (graus)')) translationKey = 'compass_heading';
              break;
            case 'bh1750_init':
              if (currentText.includes('Inicializar BH1750')) translationKey = 'initialize_bh1750';
              else if (currentText === 'SCL:') translationKey = 'scl';
              else if (currentText === 'SDA:') translationKey = 'sda';
              break;
            case 'bh1750_light_level':
              if (currentText.includes('Luminosidade (lux)')) translationKey = 'light_level_lux';
              break;
            case 'bh1750_set_mode':
              if (currentText.includes('Configurar modo BH1750:')) translationKey = 'configure_bh1750_mode';
              break;
            case 'bh1750_begin':
              if (currentText.includes('Iniciar BH1750')) translationKey = 'start_bh1750';
              break;
            case 'dht_init':
              if (currentText.includes('Inicializar DHT')) translationKey = 'initialize_dht';
              else if (currentText === 'no pino') translationKey = 'on_pin';
              break;
            case 'dht_temperature':
              if (currentText.includes('Temperatura DHT')) translationKey = 'dht_temperature';
              break;
            case 'dht_humidity':
              if (currentText.includes('Umidade DHT')) translationKey = 'dht_humidity';
              break;
            case 'dht_begin':
              if (currentText.includes('DHT Begin')) translationKey = 'dht_begin';
              break;
            case 'dht_heat_index':
              if (currentText.includes('Calcular Índice de Calor')) translationKey = 'calculate_heat_index';
              else if (currentText === 'Temperatura:') translationKey = 'temperature_input';
              else if (currentText === 'Umidade:') translationKey = 'humidity_input';
              else if (currentText === 'Condição:') translationKey = 'condition_input';
              break;
          }
          
          if (translationKey) {
            const translatedText = this.t(translationKey);
            if (translatedText && translatedText !== translationKey) {
              field.setValue(translatedText);
            }
          }
        }
      });
    });
  },
  
  // Função pública para forçar tradução dos blocos (útil para debug)
  forceTranslateBlocks() {
    console.log('🔄 Forçando tradução de todos os blocos...');
    
    // Verificar se o workspace está disponível
    const workspace = window.blocklyWorkspace;
    if (!workspace) {
      console.error('❌ Workspace não disponível!');
      return;
    }
    
    console.log('📊 Estado atual:');
    console.log('- Idioma atual:', this.current);
    console.log('- Blocos no workspace:', workspace.getAllBlocks().length);
    console.log('- Definições de blocos disponíveis:', Object.keys(Blockly.Blocks).length);
    
    // Redefinir blocos
    this.redefineBlocksWithTranslations();
    
    // Traduzir blocos existentes
    this.translateExistingBlocks();
    
    // Atualizar toolbox
    this.updateToolboxCategories();
    
    console.log('✅ Tradução forçada concluída!');
    
    // Verificar se as traduções foram aplicadas
    setTimeout(() => {
      const allBlocks = workspace.getAllBlocks();
      console.log('🔍 Verificação pós-tradução:');
      allBlocks.forEach((block, index) => {
        console.log(`- Bloco ${index + 1}: ${block.type}`);
        // Tentar obter o texto do primeiro campo
        if (block.inputList && block.inputList.length > 0) {
          const firstInput = block.inputList[0];
          if (firstInput.fieldRow && firstInput.fieldRow.length > 0) {
            const firstField = firstInput.fieldRow[0];
            if (firstField.getText) {
              console.log(`  Texto: "${firstField.getText()}"`);
            }
          }
        }
      });
    }, 500);
  },
  
  updateCustomBlockTranslations() {
    // Função para atualizar traduções específicas dos blocos customizados
    const workspace = window.blocklyWorkspace;
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
    const workspace = window.blocklyWorkspace;
    if (workspace && workspace.updateToolbox) {
      console.log('🔄 Atualizando categorias do toolbox...');
      
      // Buscar o toolbox original
      const originalToolbox = document.getElementById('toolbox');
      if (originalToolbox) {
        // Clonar o toolbox e traduzir as categorias
        const translatedToolbox = this.translateToolbox(originalToolbox.cloneNode(true));
        
        // Atualizar o toolbox - isso força a recriação dos blocos com as novas definições
        workspace.updateToolbox(translatedToolbox);
        
        // Pequeno delay e forçar refresh adicional para garantir que os blocos sejam recriados
        setTimeout(() => {
          workspace.refreshToolboxSelection();
          console.log('✅ Toolbox atualizado com traduções!');
        }, 100);
      }
    } else {
      console.log('⚠️ Workspace não disponível para atualização do toolbox');
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
  
  // Configurar botão de idioma (se existir o botão antigo)
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
  
  // Aguardar o Blockly estar pronto e então aplicar traduções iniciais
  setTimeout(() => {
    if (window.blocklyWorkspace) {
      console.log('🔄 Aplicando traduções iniciais dos blocos...');
      i18n.redefineBlocksWithTranslations();
      i18n.updateToolboxCategories();
    } else {
      console.log('⚠️ Blockly workspace ainda não está pronto, aguardando...');
      // Tentar novamente após mais tempo
      setTimeout(() => {
        if (window.blocklyWorkspace) {
          console.log('🔄 Aplicando traduções iniciais dos blocos (tentativa 2)...');
          i18n.redefineBlocksWithTranslations();
          i18n.updateToolboxCategories();
        }
      }, 2000);
    }
  }, 1500);
  
  console.log('✅ Sistema i18n inicializado com sucesso!');
});

// Listener para quando o Blockly estiver pronto
window.addEventListener('blocklyReady', function(event) {
  console.log('🚀 Blockly está pronto! Aplicando traduções dos blocos...');
  if (window.i18n) {
    window.i18n.redefineBlocksWithTranslations();
    window.i18n.updateToolboxCategories();
  }
});

// Disponibilizar globalmente
window.i18n = i18n;
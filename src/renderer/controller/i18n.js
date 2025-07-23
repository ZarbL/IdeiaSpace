// i18n.js - Gerenciador de tradução para IdeiaSpace

const i18n = {
  current: localStorage.getItem('language') || 'pt-BR',
  translations: {},
  async loadTranslations(lang) {
    try {
      const response = await fetch(`../locales/${lang}.json`);
      if (!response.ok) throw new Error('Falha ao carregar traduções');
      this.translations[lang] = await response.json();
    } catch (e) {
      console.error('Erro ao carregar traduções:', e);
      this.translations[lang] = {};
    }
  },
  t(key) {
    const lang = this.current;
    return (this.translations[lang] && this.translations[lang][key]) ? this.translations[lang][key] : key;
  },
  async setLanguage(lang) {
    if (!this.translations[lang]) {
      await this.loadTranslations(lang);
    }
    if (this.translations[lang]) {
      this.current = lang;
      localStorage.setItem('language', lang);
      this.applyTranslations();
    }
  },
  applyTranslations() {
    const lang = this.current;
    // Elementos com data-translate-key
    document.querySelectorAll('[data-translate-key]').forEach(el => {
      const key = el.getAttribute('data-translate-key');
      if (key && this.translations[lang] && this.translations[lang][key]) {
        el.textContent = this.translations[lang][key];
      }
    });
    // Elementos com data-translate-key-placeholder
    document.querySelectorAll('[data-translate-key-placeholder]').forEach(el => {
      const key = el.getAttribute('data-translate-key-placeholder');
      if (key && this.translations[lang] && this.translations[lang][key]) {
        el.textContent = this.translations[lang][key];
      }
    });
    // Tooltips
    document.querySelectorAll('[data-tooltip-key]').forEach(el => {
      const key = el.getAttribute('data-tooltip-key');
      if (key && this.translations[lang] && this.translations[lang][key]) {
        el.setAttribute('data-tooltip', this.translations[lang][key]);
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', async function() {
  await i18n.loadTranslations('pt-BR');
  await i18n.loadTranslations('en-US');
  await i18n.setLanguage(i18n.current);
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', async function() {
      const nextLang = i18n.current === 'pt-BR' ? 'en-US' : 'pt-BR';
      await i18n.setLanguage(nextLang);
      langBtn.textContent = i18n.current === 'pt-BR' ? 'EN' : 'PT';
    });
    // Atualiza texto do botão ao carregar
    langBtn.textContent = i18n.current === 'pt-BR' ? 'EN' : 'PT';
  }
});

window.i18n = i18n;

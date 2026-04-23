// GreenVCI — Language Switcher Engine
(function () {
  'use strict';

  const SUPPORTED = ['es', 'en', 'zh', 'ko'];
  const LANG_META = {
    es: { label: 'ESP', flag: '🇲🇽' },
    en: { label: 'ENG', flag: '🇺🇸' },
    zh: { label: '中文', flag: '🇨🇳' },
    ko: { label: '한국어', flag: '🇰🇷' },
  };

  // ── Detect / restore language ─────────────────────
  function detectLang() {
    const stored = localStorage.getItem('gvci-lang');
    if (stored && SUPPORTED.includes(stored)) return stored;
    const browser = (navigator.language || 'es').slice(0, 2).toLowerCase();
    const map = { zh: 'zh', ko: 'ko', en: 'en' };
    return map[browser] || 'es';
  }

  // ── Apply translations to the DOM ─────────────────
  function applyLang(lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['es'];

    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    // Placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) el.placeholder = dict[key];
    });

    // HTML content (for elements that need it)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    // Update <html lang="">
    document.documentElement.lang = lang;

    // Update switcher button
    const btn = document.getElementById('lang-current');
    if (btn) {
      const m = LANG_META[lang];
      btn.innerHTML = `<span class="ls-flag">${m.flag}</span><span class="ls-code">${m.label}</span><svg class="ls-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }

    // Mark active in menu
    document.querySelectorAll('.ls-option').forEach(opt => {
      opt.classList.toggle('ls-option--active', opt.dataset.lang === lang);
    });

    localStorage.setItem('gvci-lang', lang);
  }

  // ── Build the switcher widget ─────────────────────
  function buildSwitcher() {
    const widget = document.createElement('div');
    widget.id = 'lang-switcher';
    widget.setAttribute('role', 'navigation');
    widget.setAttribute('aria-label', 'Language selector');

    const current = LANG_META[detectLang()];
    widget.innerHTML = `
      <button id="lang-current" class="ls-btn" aria-haspopup="listbox" aria-expanded="false">
        <span class="ls-flag">${current.flag}</span>
        <span class="ls-code">${current.label}</span>
        <svg class="ls-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div id="lang-menu" class="ls-menu" role="listbox">
        ${SUPPORTED.map(l => `
          <button class="ls-option" data-lang="${l}" role="option">
            <span class="ls-flag">${LANG_META[l].flag}</span>
            <span class="ls-label">${LANG_META[l].label}</span>
          </button>
        `).join('')}
      </div>
    `;

    document.body.appendChild(widget);

    const btn = widget.querySelector('#lang-current');
    const menu = widget.querySelector('#lang-menu');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.classList.toggle('ls-menu--open');
      btn.setAttribute('aria-expanded', open);
    });

    widget.querySelectorAll('.ls-option').forEach(opt => {
      opt.addEventListener('click', () => {
        applyLang(opt.dataset.lang);
        menu.classList.remove('ls-menu--open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', () => {
      menu.classList.remove('ls-menu--open');
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  // ── Boot ──────────────────────────────────────────
  function init() {
    buildSwitcher();
    applyLang(detectLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

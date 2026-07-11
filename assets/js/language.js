/**
 * Joy Guru Tours & Travels - Language Switcher UI & Action Controller
 */

(function() {
  const LANG_NAMES = {
    en: 'English',
    hi: 'हिन्दी',
    bn: 'বাংলা',
    as: 'অসমীয়া'
  };

  document.addEventListener('DOMContentLoaded', function() {
    injectLanguageSwitcher();
  });

  function injectLanguageSwitcher() {
    // Find navbar right side container
    let container = document.querySelector('header .flex.items-center.gap-4');
    let needsRelativeWrapper = false;

    // Fallback if container is not found (like in Login & Signup page)
    if (!container) {
      const headerDiv = document.querySelector('header .max-w-7xl');
      if (headerDiv) {
        // Create a wrapper div to place next to the back button
        const backBtn = headerDiv.querySelector('a');
        if (backBtn) {
          container = document.createElement('div');
          container.className = 'flex items-center gap-4';
          backBtn.parentNode.insertBefore(container, backBtn);
          container.appendChild(backBtn);
        }
      }
    }

    if (!container) return;

    // Create dropdown switcher element
    const langDiv = document.createElement('div');
    langDiv.className = 'relative inline-block text-left z-[100]';
    langDiv.id = 'language-switcher-container';

    const currentLang = localStorage.getItem('jg_selected_lang') || 'en';
    const langLabel = LANG_NAMES[currentLang] || 'English';

    langDiv.innerHTML = `
      <button id="lang-select-btn" class="text-xs bg-muted hover:bg-muted/80 text-primary font-bold px-2.5 py-1.5 rounded-lg border border-border flex items-center gap-1 transition-all select-none">
        <iconify-icon icon="lucide:languages" class="text-secondary text-sm"></iconify-icon>
        <span id="lang-selected-label" class="hidden md:inline">${langLabel}</span>
        <iconify-icon icon="lucide:chevron-down" class="text-[10px] opacity-60 hidden md:inline-block"></iconify-icon>
      </button>
      
      <div id="lang-dropdown-menu" class="absolute right-0 mt-2 w-32 bg-card border border-border shadow-xl rounded-xl py-1.5 z-[100] hidden animate-fade-in text-left">
        <button data-lang="en" class="w-full text-left px-4 py-2 text-xs font-bold hover:bg-muted text-primary transition-all flex items-center justify-between">
          <span>English</span>
          <iconify-icon icon="lucide:check" class="text-secondary text-xs hidden"></iconify-icon>
        </button>
        <button data-lang="hi" class="w-full text-left px-4 py-2 text-xs font-bold hover:bg-muted text-primary transition-all flex items-center justify-between">
          <span>हिन्दी</span>
          <iconify-icon icon="lucide:check" class="text-secondary text-xs hidden"></iconify-icon>
        </button>
        <button data-lang="bn" class="w-full text-left px-4 py-2 text-xs font-bold hover:bg-muted text-primary transition-all flex items-center justify-between">
          <span>বাংলা</span>
          <iconify-icon icon="lucide:check" class="text-secondary text-xs hidden"></iconify-icon>
        </button>
        <button data-lang="as" class="w-full text-left px-4 py-2 text-xs font-bold hover:bg-muted text-primary transition-all flex items-center justify-between">
          <span>অসমীয়া</span>
          <iconify-icon icon="lucide:check" class="text-secondary text-xs hidden"></iconify-icon>
        </button>
      </div>
    `;

    // Prepend inside navbar container (so it sits next to user/login/notification actions)
    container.insertBefore(langDiv, container.firstChild);

    // Bind events
    const selectBtn = langDiv.querySelector('#lang-select-btn');
    const menu = langDiv.querySelector('#lang-dropdown-menu');
    const optionBtns = menu.querySelectorAll('button[data-lang]');

    // Toggle dropdown
    selectBtn.onclick = function(e) {
      e.stopPropagation();
      menu.classList.toggle('hidden');
      if (!menu.classList.contains('hidden')) {
        document.addEventListener('click', outsideClickListener);
      }
    };

    function outsideClickListener(e) {
      if (menu && !langDiv.contains(e.target)) {
        menu.classList.add('hidden');
        document.removeEventListener('click', outsideClickListener);
      }
    }

    // Set active option checkmark on load
    updateActiveCheckmark(currentLang);

    // Bind option click triggers
    optionBtns.forEach(btn => {
      btn.onclick = async function() {
        const lang = btn.getAttribute('data-lang');
        
        // Hide dropdown
        menu.classList.add('hidden');
        document.removeEventListener('click', outsideClickListener);
        
        // Update switcher labels
        langDiv.querySelector('#lang-selected-label').textContent = LANG_NAMES[lang];
        updateActiveCheckmark(lang);

        // Call core switcher API
        if (window.i18nEngine) {
          await window.i18nEngine.switchLanguage(lang);
        }
      };
    });

    function updateActiveCheckmark(lang) {
      optionBtns.forEach(btn => {
        const icon = btn.querySelector('iconify-icon');
        if (icon) {
          if (btn.getAttribute('data-lang') === lang) {
            icon.classList.remove('hidden');
            btn.classList.add('bg-muted/50');
          } else {
            icon.classList.add('hidden');
            btn.classList.remove('bg-muted/50');
          }
        }
      });
    }

    // Sync state if language is changed from another script
    window.addEventListener('jg-language-changed', function(e) {
      const newLang = e.detail.lang;
      const label = langDiv.querySelector('#lang-selected-label');
      if (label) label.textContent = LANG_NAMES[newLang];
      updateActiveCheckmark(newLang);
    });
  }
})();

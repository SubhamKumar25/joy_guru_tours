/**
 * Joy Guru Tours & Travels - Global Internationalization (i18n) Engine
 */

window.i18nEngine = (function() {
  let currentLang = localStorage.getItem('jg_selected_lang') || 'en';
  let translationsCache = {};
  let observer = null;
  let isTranslating = false;

  // Initialize
  async function init() {
    await loadLanguage(currentLang);
    translatePage();
    setupMutationObserver();
  }

  // Load language dictionary from json
  async function loadLanguage(lang) {
    if (translationsCache[lang]) {
      return translationsCache[lang];
    }

    try {
      const response = await fetch(`./locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load locale file for ${lang}`);
      }
      const data = await response.json();
      translationsCache[lang] = data;
      return data;
    } catch (e) {
      console.warn(`Could not load locale "${lang}", using English fallback.`, e);
      translationsCache[lang] = {};
      return {};
    }
  }

  // Translate string with fallback
  function translateString(str) {
    if (!str) return str;
    const cleanStr = str.trim();
    if (!cleanStr) return str;

    const dict = translationsCache[currentLang] || {};
    
    // Exact match or fallback to English (original)
    return dict[cleanStr] !== undefined ? dict[cleanStr] : cleanStr;
  }

  // Recursively translate DOM nodes
  function translateElement(element) {
    if (!element) return;

    // Skip scripts, styles, and iconify-icons themselves
    const skipTags = ['SCRIPT', 'STYLE', 'IFRAME', 'NOSCRIPT', 'ICONIFY-ICON'];
    if (skipTags.includes(element.tagName)) return;

    // 1. Translate attributes (placeholders, values for buttons)
    if (element.placeholder) {
      if (element._originalPlaceholder === undefined) {
        element._originalPlaceholder = element.placeholder;
      }
      element.placeholder = translateString(element._originalPlaceholder);
    }

    if (element.title) {
      if (element._originalTitle === undefined) {
        element._originalTitle = element.title;
      }
      element.title = translateString(element._originalTitle);
    }

    if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
      if (element._originalValue === undefined) {
        element._originalValue = element.value;
      }
      element.value = translateString(element._originalValue);
    }

    // 2. Translate text nodes directly
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i];
      
      if (child.nodeType === Node.TEXT_NODE) {
        const textVal = child.nodeValue.trim();
        if (textVal && textVal.length > 0) {
          // Exclude raw numbers or pure symbols
          if (/^[0-9\s₹\-\+\:\,\.\/\•]+$/.test(textVal)) continue;

          if (child._originalText === undefined) {
            child._originalText = child.nodeValue;
          }
          
          const translated = translateString(child._originalText.trim());
          // Keep formatting (spaces around text)
          const leadingSpaces = child._originalText.match(/^\s*/)[0];
          const trailingSpaces = child._originalText.match(/\s*$/)[0];
          child.nodeValue = leadingSpaces + translated + trailingSpaces;
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        translateElement(child);
      }
    }
  }

  // Translate whole body page
  function translatePage() {
    isTranslating = true;
    translateElement(document.body);
    isTranslating = false;
  }

  // Monitor DOM mutations (to translate dynamically rendered components like list cards and notifications)
  function setupMutationObserver() {
    if (observer) {
      observer.disconnect();
    }

    observer = new MutationObserver(function(mutations) {
      if (isTranslating) return;

      // Throttling dynamic translation runs
      let shouldTranslate = false;
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (mutation.addedNodes.length > 0) {
          shouldTranslate = true;
          break;
        }
      }

      if (shouldTranslate) {
        isTranslating = true;
        mutations.forEach(m => {
          m.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              translateElement(node);
            }
          });
        });
        isTranslating = false;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Switch Language API
  async function switchLanguage(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem('jg_selected_lang', lang);
    await loadLanguage(lang);
    
    // Execute translation update smoothly
    translatePage();
    
    // Dispatch global event for switcher updates
    window.dispatchEvent(new CustomEvent('jg-language-changed', { detail: { lang } }));
  }

  // Trigger init on DOM load immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init: init,
    switchLanguage: switchLanguage,
    getCurrentLanguage: () => currentLang,
    translateString: translateString
  };
})();

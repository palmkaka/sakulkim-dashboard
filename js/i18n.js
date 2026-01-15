// ============================================
// SAKULKIM DASHBOARD - I18N (Internationalization)
// Language switching functionality
// ============================================

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('lang') || DEFAULT_LANG || 'th';
        this.translations = {};
        this.loadedLanguages = new Set();
    }

    async init() {
        await this.loadLanguage(this.currentLang);
        this.applyTranslations();
    }

    async loadLanguage(lang) {
        if (this.loadedLanguages.has(lang)) {
            return;
        }

        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);

            this.translations[lang] = await response.json();
            this.loadedLanguages.add(lang);
        } catch (error) {
            console.error(`Error loading language ${lang}:`, error);
            // Fallback to Thai if loading fails
            if (lang !== 'th') {
                await this.loadLanguage('th');
            }
        }
    }

    async setLanguage(lang) {
        if (!this.loadedLanguages.has(lang)) {
            await this.loadLanguage(lang);
        }

        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        this.applyTranslations();

        // Update lang attribute on html
        document.documentElement.setAttribute('lang', lang);

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Try fallback to Thai
                value = this.translations['th'];
                for (const k2 of keys) {
                    if (value && typeof value === 'object' && k2 in value) {
                        value = value[k2];
                    } else {
                        return key; // Return key if translation not found
                    }
                }
                return value;
            }
        }

        return value;
    }

    t(key, params = {}) {
        let translation = this.getTranslation(key);

        if (typeof translation !== 'string') {
            return key;
        }

        // Replace parameters like {name} with values
        Object.keys(params).forEach(param => {
            translation = translation.replace(new RegExp(`{${param}}`, 'g'), params[param]);
        });

        return translation;
    }

    applyTranslations() {
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            // Check if it's an input placeholder
            if (element.hasAttribute('data-i18n-placeholder')) {
                element.placeholder = translation;
            } else if (element.hasAttribute('data-i18n-title')) {
                element.title = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Apply to placeholders
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // Apply to titles
        const titles = document.querySelectorAll('[data-i18n-title]');
        titles.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
    }

    // Format number according to locale
    formatNumber(number, options = {}) {
        const locale = this.currentLang === 'th' ? 'th-TH' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    }

    // Format currency
    formatCurrency(amount) {
        return this.formatNumber(amount, NUMBER_FORMAT.currency);
    }

    // Format date according to locale
    formatDate(date, format = 'short') {
        const locale = this.currentLang === 'th' ? 'th-TH' : 'en-US';
        const options = DATE_FORMAT[format] || DATE_FORMAT.short;

        if (typeof date === 'string') {
            date = new Date(date);
        }

        return new Intl.DateTimeFormat(locale, options).format(date);
    }

    // Get month name
    getMonthName(monthIndex, short = false) {
        const months = short ? 'months_short' : 'months';
        const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        return this.t(`${months}.${monthKeys[monthIndex]}`);
    }

    // Get all month names
    getAllMonthNames(short = false) {
        const months = short ? 'months_short' : 'months';
        const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        return monthKeys.map(key => this.t(`${months}.${key}`));
    }

    // Get current language
    getCurrentLang() {
        return this.currentLang;
    }

    // Check if current language is RTL
    isRTL() {
        return ['ar', 'he', 'fa'].includes(this.currentLang);
    }
}

// Create global instance
const i18n = new I18n();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n, i18n };
}

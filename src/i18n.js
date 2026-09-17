import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en/translation.json';
import kuTranslation from './locales/ku/translation.json';

const savedLang = localStorage.getItem('app_lang') || 'en';

// Apply RTL immediately on startup so layout is correct before render
document.documentElement.dir = savedLang === 'ku' ? 'rtl' : 'ltr';
document.documentElement.lang = savedLang;

const resources = {
  en: {
    translation: enTranslation
  },
  ku: {
    translation: kuTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

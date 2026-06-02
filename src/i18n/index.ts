import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './locales/en/common.json';
import zh from './locales/zh/common.json';

const deviceLanguage = getLocales()[0]?.languageCode || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: ['zh', 'en'].includes(deviceLanguage) ? deviceLanguage : 'zh',
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false,
  },
});

export const setAppLanguage = (lang: 'zh' | 'en') => {
  i18n.changeLanguage(lang);
};

export default i18n;

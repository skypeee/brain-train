import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Taro from '@tarojs/taro';
import en from './locales/en/common.json';
import zh from './locales/zh/common.json';

const systemInfo = Taro.getStorageSync('appLanguage') || 'zh';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: ['zh', 'en'].includes(systemInfo) ? systemInfo : 'zh',
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false,
  },
});

export const setAppLanguage = (lang: 'zh' | 'en') => {
  Taro.setStorageSync('appLanguage', lang);
  i18n.changeLanguage(lang);
};

export default i18n;

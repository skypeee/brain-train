import { create } from 'zustand';
import Taro from '@tarojs/taro';

type ValidationMode = 'none' | 'conflicts' | 'auto-check';
type Language = 'zh' | 'en';

interface SettingsStore {
  validationMode: ValidationMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  language: Language;
  isLoaded: boolean;
  setValidationMode: (mode: ValidationMode) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setLanguage: (lang: Language) => void;
  loadSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  validationMode: 'auto-check',
  soundEnabled: false,
  hapticsEnabled: true,
  language: 'zh',
  isLoaded: false,

  setValidationMode: (mode) => {
    set({ validationMode: mode });
    Taro.setStorageSync('validationMode', mode);
  },

  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    Taro.setStorageSync('soundEnabled', enabled);
  },

  setHapticsEnabled: (enabled) => {
    set({ hapticsEnabled: enabled });
    Taro.setStorageSync('hapticsEnabled', enabled);
  },

  setLanguage: (lang) => {
    set({ language: lang });
    Taro.setStorageSync('language', lang);
    Taro.setStorageSync('appLanguage', lang);
  },

  loadSettings: () => {
    const vm = Taro.getStorageSync('validationMode') as ValidationMode;
    const se = Taro.getStorageSync('soundEnabled');
    const he = Taro.getStorageSync('hapticsEnabled');
    const lang = Taro.getStorageSync('language') as Language;
    set({
      validationMode: vm || 'auto-check',
      soundEnabled: se === true || se === 'true',
      hapticsEnabled: he !== false && he !== 'false',
      language: (lang === 'en' ? 'en' : 'zh') as Language,
      isLoaded: true,
    });
  },
}));

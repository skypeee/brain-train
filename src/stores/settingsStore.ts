import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  validationMode: 'auto-check',
  soundEnabled: false,
  hapticsEnabled: true,
  language: 'zh',
  isLoaded: false,

  setValidationMode: (mode) => {
    set({ validationMode: mode });
    AsyncStorage.setItem('validationMode', mode);
  },

  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    AsyncStorage.setItem('soundEnabled', JSON.stringify(enabled));
  },

  setHapticsEnabled: (enabled) => {
    set({ hapticsEnabled: enabled });
    AsyncStorage.setItem('hapticsEnabled', JSON.stringify(enabled));
  },

  setLanguage: (lang) => {
    set({ language: lang });
    AsyncStorage.setItem('language', lang);
  },

  loadSettings: async () => {
    const [vm, se, he, lang] = await Promise.all([
      AsyncStorage.getItem('validationMode'),
      AsyncStorage.getItem('soundEnabled'),
      AsyncStorage.getItem('hapticsEnabled'),
      AsyncStorage.getItem('language'),
    ]);
    set({
      validationMode: (vm as ValidationMode) || 'auto-check',
      soundEnabled: se === 'true',
      hapticsEnabled: he !== 'false',
      language: (lang === 'en' ? 'en' : 'zh') as Language,
      isLoaded: true,
    });
  },
}));

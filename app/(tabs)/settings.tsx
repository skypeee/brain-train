import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, Vibrate, Eye, LogIn } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { setAppLanguage } from '../../src/i18n';
import { isSupabaseConfigured } from '../../src/supabase/client';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const {
    validationMode,
    soundEnabled,
    hapticsEnabled,
    language,
    isLoaded,
    setValidationMode,
    setSoundEnabled,
    setHapticsEnabled,
    setLanguage,
    loadSettings,
  } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setAppLanguage(language);
  }, [language]);

  if (!isLoaded) return null;

  const isAutoCheck = validationMode === 'auto-check';

  return (
    <View className="flex-1 bg-white dark:bg-gray-950 px-6 pt-16">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t('settings.title')}
      </Text>

      {/* Validation Mode */}
      <Text className="text-gray-500 dark:text-gray-400 font-medium mb-3 uppercase text-sm tracking-wider">
        {t('settings.validation')}
      </Text>
      <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Eye stroke="#229CF8" size={22} />
            <View>
              <Text className="text-gray-900 dark:text-white font-semibold">
                {t('settings.autoCheck')}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {t('settings.autoCheckDesc')}
              </Text>
            </View>
          </View>
          <Switch
            value={isAutoCheck}
            onValueChange={(v) => setValidationMode(v ? 'auto-check' : 'none')}
            trackColor={{ false: '#D1D5DB', true: '#229CF8' }}
          />
        </View>
        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Eye stroke="#9CA3AF" size={22} />
            <View>
              <Text className="text-gray-900 dark:text-white font-semibold">
                {t('settings.zenMode')}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {t('settings.zenModeDesc')}
              </Text>
            </View>
          </View>
          <Switch
            value={!isAutoCheck}
            onValueChange={(v) => setValidationMode(v ? 'none' : 'auto-check')}
            trackColor={{ false: '#D1D5DB', true: '#229CF8' }}
          />
        </View>
      </View>

      {/* Feedback */}
      <Text className="text-gray-500 dark:text-gray-400 font-medium mb-3 uppercase text-sm tracking-wider">
        {t('settings.feedback')}
      </Text>
      <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Volume2 stroke="#229CF8" size={22} />
          <View>
            <Text className="text-gray-900 dark:text-white font-semibold">{t('settings.sound')}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">{t('settings.soundDesc')}</Text>
          </View>
        </View>
        <Switch
          value={soundEnabled}
          onValueChange={setSoundEnabled}
          trackColor={{ false: '#D1D5DB', true: '#229CF8' }}
        />
      </View>

      <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Vibrate stroke="#229CF8" size={22} />
          <View>
            <Text className="text-gray-900 dark:text-white font-semibold">{t('settings.haptics')}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">{t('settings.hapticsDesc')}</Text>
          </View>
        </View>
        <Switch
          value={hapticsEnabled}
          onValueChange={setHapticsEnabled}
          trackColor={{ false: '#D1D5DB', true: '#229CF8' }}
        />
      </View>

      {/* Language */}
      <Text className="text-gray-500 dark:text-gray-400 font-medium mb-3 uppercase text-sm tracking-wider">
        {t('settings.language')}
      </Text>
      <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Eye stroke="#229CF8" size={22} />
          <View>
            <Text className="text-gray-900 dark:text-white font-semibold">
              {language === 'zh' ? '中文' : 'English'}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {t('settings.languageDesc')}
            </Text>
          </View>
        </View>
        <Switch
          value={language === 'en'}
          onValueChange={(v) => {
            const lang = v ? 'en' : 'zh';
            setLanguage(lang);
          }}
          trackColor={{ false: '#D1D5DB', true: '#229CF8' }}
        />
      </View>

      {/* Account */}
      <Text className="text-gray-500 dark:text-gray-400 font-medium mb-3 uppercase text-sm tracking-wider">
        {t('settings.account')}
      </Text>
      <TouchableOpacity
        className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-4 flex-row items-center justify-between"
        onPress={() => router.push('/auth/sign-in')}
        disabled={!isSupabaseConfigured}
      >
        <View className="flex-row items-center gap-3">
          <LogIn stroke="#229CF8" size={22} />
          <View>
            <Text className="text-gray-900 dark:text-white font-semibold">{t('settings.account')}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {isSupabaseConfigured ? t('settings.accountDesc') : t('settings.accountDisabled')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <Text className="text-center text-gray-400 dark:text-gray-500 text-sm mt-8">
        {t('settings.version')}
      </Text>
    </View>
  );
}

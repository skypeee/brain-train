import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User } from 'lucide-react-native';

export default function SignUpScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  return (
    <View className="flex-1 bg-white dark:bg-gray-950 px-6 pt-16">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {t('auth.createAccount')}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-8">
        {t('auth.createPrompt')}
      </Text>

      <View className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 flex-row items-center mb-4">
        <User stroke="#9CA3AF" size={20} />
        <TextInput
          className="flex-1 ml-3 text-gray-900 dark:text-white"
          placeholder={t('auth.username')}
          placeholderTextColor="#9CA3AF"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <View className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 flex-row items-center mb-4">
        <Mail stroke="#9CA3AF" size={20} />
        <TextInput
          className="flex-1 ml-3 text-gray-900 dark:text-white"
          placeholder={t('auth.email')}
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 flex-row items-center mb-6">
        <Lock stroke="#9CA3AF" size={20} />
        <TextInput
          className="flex-1 ml-3 text-gray-900 dark:text-white"
          placeholder={t('auth.password')}
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity className="bg-brand-500 rounded-2xl p-4 mb-4">
        <Text className="text-white text-center font-semibold text-lg">{t('auth.signUp')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-brand-500 text-center">
          {t('auth.hasAccount')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

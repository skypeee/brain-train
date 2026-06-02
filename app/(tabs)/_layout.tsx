import { Tabs } from 'expo-router';
import { House, Gamepad2, BarChart3, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#229CF8',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <House stroke={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: t('tabs.games'),
          tabBarIcon: ({ color, size }) => <Gamepad2 stroke={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('tabs.stats'),
          tabBarIcon: ({ color, size }) => <BarChart3 stroke={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, size }) => <Settings stroke={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

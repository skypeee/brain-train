import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Clock, Lightbulb, Target } from 'lucide-react-native';

interface GameIntroProps {
  i18nKey: string;
  color?: string;
}

export function GameIntro({ i18nKey, color = '#229CF8' }: GameIntroProps) {
  const { t } = useTranslation();
  const rows = [
    { label: t('gameIntro.goal'), text: t(`${i18nKey}.goal`), Icon: Target },
    { label: t('gameIntro.use'), text: t(`${i18nKey}.use`), Icon: Clock },
    { label: t('gameIntro.tip'), text: t(`${i18nKey}.tip`), Icon: Lightbulb },
  ];

  return (
    <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 mb-8">
      {rows.map(({ label, text, Icon }, index) => (
        <View
          key={label}
          className={`flex-row items-start gap-3 ${index < rows.length - 1 ? 'mb-4' : ''}`}
        >
          <View className="rounded-lg p-2" style={{ backgroundColor: `${color}18` }}>
            <Icon stroke={color} size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 dark:text-white font-semibold text-sm mb-0.5">
              {label}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm leading-5">
              {text}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

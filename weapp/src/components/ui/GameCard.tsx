import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Icon } from './Icon';

interface GameCardProps {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color?: string;
  available?: boolean;
  onPress?: (id: string) => void;
}

const iconMap: Record<string, string> = {
  sudoku: 'grid',
  cps: 'zap',
  reaction: 'gauge',
  tensecond: 'clock',
  sbti: 'zap',
  schulte: 'grid',
  stroop: 'palette',
  memory: 'brain',
  pomodoro: 'timer',
  breathing: 'wind',
  frog: 'sprout',
  nback: 'headphones',
};

export function GameCard({
  id,
  name,
  description,
  iconName,
  color = '#229CF8',
  available = true,
  onPress,
}: GameCardProps) {
  const icon = iconMap[iconName] || 'zap';

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '28px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        opacity: available ? 1 : 0.5,
        marginBottom: '16px',
      }}
      onClick={() => {
        if (available && onPress) {
          Taro.vibrateShort({ type: 'light' });
          onPress(id);
        }
      }}
    >
      <View
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '14px',
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '24px',
        }}
      >
        <Icon name={icon as any} size={36} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: '30px',
            fontWeight: '600',
            color: '#1A1A2E',
            marginBottom: '6px',
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontSize: '24px',
            color: '#64748B',
          }}
        >
          {description}
        </Text>
      </View>
      <Icon name='chevron-right' size={20} color='#94A3B8' />
    </View>
  );
}

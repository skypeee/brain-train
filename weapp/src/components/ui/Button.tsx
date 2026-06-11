import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-blue-500 text-white',
  secondary: 'bg-gray-100 text-gray-900',
  ghost: 'bg-transparent text-blue-500',
};

const sizeStyles: Record<string, string> = {
  sm: 'py-8 px-16 text-24',
  md: 'py-12 px-20 text-28',
  lg: 'py-16 px-24 text-32',
};

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
}: ButtonProps) {
  return (
    <View
      className={`button ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-40' : ''}`}
      style={{
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
      }}
      onClick={() => {
        if (!disabled && !loading) {
          Taro.vibrateShort({ type: 'light' });
          onPress();
        }
      }}
    >
      <Text>{loading ? '...' : title}</Text>
    </View>
  );
}

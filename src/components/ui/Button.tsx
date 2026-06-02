import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  className = '',
}: ButtonProps) {
  const base = 'items-center justify-center rounded-xl';
  const variants = {
    primary: 'bg-brand-500 active:bg-brand-600',
    secondary: 'bg-gray-100 dark:bg-gray-800 active:bg-gray-200',
    ghost: 'bg-transparent active:bg-gray-100 dark:active:bg-gray-800',
  };
  const sizes = {
    sm: 'px-3 py-2',
    md: 'px-5 py-3',
    lg: 'px-6 py-4',
  };
  const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };
  const textColors = {
    primary: 'text-white',
    secondary: 'text-gray-900 dark:text-white',
    ghost: 'text-brand-500',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#229CF8'} />
      ) : (
        <Text className={`font-semibold ${textSizes[size]} ${textColors[variant]}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

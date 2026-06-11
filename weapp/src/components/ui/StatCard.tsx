import { View, Text } from '@tarojs/components';

interface StatCardProps {
  value: string | number;
  label: string;
  color?: string;
}

export function StatCard({ value, label, color }: StatCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        padding: '32px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      }}
    >
      <Text
        style={{
          fontSize: 26,
          fontWeight: '700',
          color: color || '#1A1A2E',
          fontFamily: 'monospace',
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: '#64748B',
          marginTop: '8px',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

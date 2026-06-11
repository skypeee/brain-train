import { View } from '@tarojs/components';

interface SkeletonProps {
  width?: number;
  height?: number;
  radius?: number;
}

function Block({ width, height = 32, radius = 8 }: SkeletonProps) {
  return (
    <View
      style={{
        width: width ? `${width}px` : '100%',
        height: `${height}px`,
        borderRadius: `${radius}px`,
        backgroundColor: '#E8EDF2',
      }}
    />
  );
}

export function Skeleton({ width, height, radius }: SkeletonProps) {
  return <Block width={width} height={height} radius={radius} />;
}

export function HomeSkeleton() {
  return (
    <View style={{ padding: '40px 32px 0' }}>
      <Block width={180} height={36} radius={8} />
      <View style={{ height: 16 }} />
      <Block width={240} height={20} radius={6} />
      <View style={{ height: 40 }} />
      <Block height={140} radius={20} />
      <View style={{ height: 24 }} />
      <Block height={90} radius={20} />
      <View style={{ height: 24 }} />
      <View style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
        <Block height={100} radius={14} />
        <Block height={100} radius={14} />
        <Block height={100} radius={14} />
      </View>
    </View>
  );
}

export function StatsSkeleton() {
  return (
    <View style={{ padding: '40px 32px 0' }}>
      <Block width={160} height={36} radius={8} />
      <View style={{ height: 32 }} />
      <View style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
        <Block height={100} radius={14} />
        <Block height={100} radius={14} />
        <Block height={100} radius={14} />
      </View>
      <View style={{ height: 32 }} />
      <Block height={200} radius={20} />
    </View>
  );
}

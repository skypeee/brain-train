import { View } from 'react-native';

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number;
}

export function Skeleton({ className = '', width, height = 16 }: SkeletonProps) {
  return (
    <View
      className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`}
      style={[{ width, height }] as any}
    />
  );
}

export function StatsSkeleton() {
  return (
    <View className="px-6 pt-16">
      <Skeleton width={160} height={32} className="mb-6" />
      <View className="flex-row gap-3 mb-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="flex-1 rounded-2xl" height={100} />
        ))}
      </View>
      <Skeleton className="rounded-2xl" height={80} />
    </View>
  );
}

export function BoardSkeleton() {
  return (
    <View className="items-center">
      <Skeleton width="90%" className="aspect-square rounded-lg" height={360} />
      <View className="flex-row gap-2 mt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="rounded-xl" width={52} height={48} />
        ))}
      </View>
    </View>
  );
}

export function HomeSkeleton() {
  return (
    <View className="px-6 pt-16">
      <Skeleton width={180} height={32} className="mb-2" />
      <Skeleton width={240} height={18} className="mb-8" />
      <Skeleton className="rounded-2xl mb-6" height={120} />
      <Skeleton className="rounded-2xl mb-6" height={90} />
      <Skeleton className="rounded-2xl" height={130} />
    </View>
  );
}

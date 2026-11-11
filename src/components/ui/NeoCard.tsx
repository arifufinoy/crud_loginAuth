import React from 'react';
import { View } from 'react-native';

import { cn } from '@/utils/cn';

interface NeoCardProps {
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  shadowClassName?: string;
  offset?: 'sm' | 'md';
}

export function NeoCard({
  children,
  className,
  bodyClassName,
  shadowClassName,
  offset = 'md',
}: NeoCardProps) {
  return (
    <View className={cn('relative', className)}>
      <View
        className={cn(
          'absolute inset-0 rounded-2xl bg-ink',
          offset === 'sm' ? 'translate-x-1 translate-y-1' : 'translate-x-1.5 translate-y-1.5',
          shadowClassName,
        )}
      />
      <View className={cn('rounded-2xl border-[3px] border-ink bg-white', bodyClassName)}>
        {children}
      </View>
    </View>
  );
}

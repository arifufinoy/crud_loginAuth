import React from 'react';
import { Text, View } from 'react-native';

import { NeoLottie, type AnimationName } from '@/components/NeoLottie';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';

interface EmptyStateProps {
  title: string;
  description: string;
  animation?: AnimationName;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  animation = 'emptyProjects',
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <NeoCard bodyClassName="items-center bg-cream px-5 py-6">
      <NeoLottie name={animation} className={compact ? 'h-24 w-24' : 'h-36 w-36'} />
      <Text className="mt-1 text-center font-display text-lg uppercase text-ink">{title}</Text>
      <Text className="mt-1.5 text-center text-sm leading-5 text-muted">{description}</Text>
      {actionLabel && onAction ? (
        <View className="mt-4 w-full">
          <NeoButton label={actionLabel} onPress={onAction} size="sm" variant="sky" />
        </View>
      ) : null}
    </NeoCard>
  );
}

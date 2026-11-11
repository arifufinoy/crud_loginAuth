import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { NeoCard } from '@/components/ui/NeoCard';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: number | string;
  tone: 'lime' | 'sky' | 'yellow' | 'pink' | 'violet' | 'mint';
  caption?: string;
}

const TONES = {
  lime: 'bg-lime',
  sky: 'bg-sky',
  yellow: 'bg-yellow',
  pink: 'bg-pink',
  violet: 'bg-violet',
  mint: 'bg-mint',
} as const;

export function StatCard({ label, value, tone, caption }: StatCardProps) {
  return (
    <NeoCard className="flex-1" bodyClassName={cn('p-3.5', TONES[tone])} offset="sm">
      <Text className="font-display text-[9px] uppercase leading-3 tracking-[1.4px] text-ink/80">
        {label}
      </Text>
      <Text className="mt-1 font-display text-3xl text-ink">{value}</Text>
      {caption ? (
        <Text className="mt-0.5 text-[9px] uppercase tracking-wide text-ink/60">{caption}</Text>
      ) : null}
    </NeoCard>
  );
}

export function SectionTitle({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="mb-3 mt-1 flex-row items-center justify-between">
      <Text className="font-display text-sm uppercase tracking-[1.5px] text-ink">{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text className="font-display text-[10px] uppercase tracking-wider text-muted underline">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

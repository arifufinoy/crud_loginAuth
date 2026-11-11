import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@/utils/cn';

interface NeoHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
  className?: string;
}

export function NeoHeader({ title, subtitle, back = true, right, className }: NeoHeaderProps) {
  return (
    <View className={cn('mb-5 flex-row items-center gap-3', className)}>
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/dashboard'))}
          className="h-11 w-11 items-center justify-center rounded-xl border-[3px] border-ink bg-white active:translate-x-0.5 active:translate-y-0.5">
          <Text className="font-display text-lg text-ink">←</Text>
        </Pressable>
      ) : null}
      <View className="flex-1">
        <Text className="font-display text-2xl uppercase tracking-tight text-ink" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

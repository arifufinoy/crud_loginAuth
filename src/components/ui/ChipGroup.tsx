import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@/utils/cn';

type Tone = 'lime' | 'sky' | 'pink' | 'yellow' | 'violet' | 'mint' | 'white';

const TONES: Record<Tone, string> = {
  lime: 'bg-lime',
  sky: 'bg-sky',
  pink: 'bg-pink',
  yellow: 'bg-yellow',
  violet: 'bg-violet',
  mint: 'bg-mint',
  white: 'bg-white',
};

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  tone?: Tone;
}

interface ChipGroupProps<T extends string> {
  label?: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  error?: string;
}

export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: ChipGroupProps<T>) {
  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="font-display text-[10px] uppercase tracking-[2px] text-ink">{label}</Text>
      ) : null}
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}>
              <View
                className={cn(
                  'rounded-lg border-[3px] border-ink px-3 py-2',
                  selected ? TONES[option.tone ?? 'lime'] : 'bg-white',
                  selected && 'translate-x-0.5 translate-y-0.5',
                )}>
                <Text
                  className={cn(
                    'font-display text-[10px] uppercase tracking-wider',
                    selected ? 'text-ink' : 'text-muted',
                  )}>
                  {option.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text className="text-xs font-medium text-danger">{error}</Text> : null}
    </View>
  );
}

import React from 'react';
import { Text, View } from 'react-native';

import { NeoLottie } from '@/components/NeoLottie';

export function LoadingScreen({ label = 'Cargando tu espacio...' }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-paper px-8">
      <NeoLottie name="loading" className="h-48 w-48" />
      <Text className="font-display text-base uppercase tracking-[2px] text-ink">Acadex</Text>
      <Text className="text-center text-sm text-muted">{label}</Text>
    </View>
  );
}

export function InlineLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <View className="items-center justify-center gap-1 py-8">
      <NeoLottie name="loading" className="h-28 w-28" />
      <Text className="text-xs uppercase tracking-widest text-muted">{label}</Text>
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <View className="items-center justify-center rounded-xl border-[3px] border-ink bg-pink px-4 py-6">
      <Text className="text-center font-display text-sm uppercase text-ink">
        No se pudo cargar
      </Text>
      <Text className="mt-1 text-center text-xs text-ink/70">{message}</Text>
    </View>
  );
}

import React from 'react';
import { Text, View } from 'react-native';

import { NeoLottie, type AnimationName } from '@/components/NeoLottie';
import { cn } from '@/utils/cn';

interface AuthHeroProps {
  title: string;
  subtitle: string;
  animation: AnimationName;
  tone?: 'lime' | 'sky' | 'pink' | 'violet' | 'yellow';
  eyebrow?: string;
}

const TONES = {
  lime: 'bg-lime',
  sky: 'bg-sky',
  pink: 'bg-pink',
  violet: 'bg-violet',
  yellow: 'bg-yellow',
} as const;

export function BrandMark() {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="h-10 w-10 -rotate-3 items-center justify-center rounded-lg border-[3px] border-ink bg-lime">
        <Text className="font-display text-lg text-ink">A</Text>
      </View>
      <View>
        <Text className="font-display text-xl uppercase tracking-[2px] text-ink">Acadex</Text>
        <Text className="text-[8px] uppercase tracking-[3px] text-muted">Gestor académico</Text>
      </View>
    </View>
  );
}

export function AuthHero({
  title,
  subtitle,
  animation,
  tone = 'lime',
  eyebrow = 'Proyectos + tareas',
}: AuthHeroProps) {
  return (
    <View className="mb-5">
      <View className="mb-4 flex-row items-center justify-between">
        <BrandMark />
        <View className="rotate-2 rounded-md border-2 border-ink bg-white px-2 py-1">
          <Text className="font-display text-[8px] uppercase tracking-[1.5px] text-ink">MVP</Text>
        </View>
      </View>

      <View className="relative">
        <View className="absolute inset-0 translate-x-2 translate-y-2 rounded-3xl bg-ink" />
        <View
          className={cn(
            'flex-row items-center gap-1 overflow-hidden rounded-3xl border-[3px] border-ink px-4 py-3',
            TONES[tone],
          )}>
          <View className="flex-1">
            <Text className="font-display text-[9px] uppercase tracking-[2px] text-ink/60">
              {eyebrow}
            </Text>
            <Text className="mt-1 font-display text-xl uppercase leading-6 text-ink">
              {title}
            </Text>
            <Text className="mt-1.5 text-xs leading-4 text-ink/70">{subtitle}</Text>
          </View>
          <NeoLottie name={animation} className="h-28 w-28" />
        </View>
      </View>
    </View>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <View className="mb-4 rounded-xl border-[3px] border-ink bg-pink px-3 py-2.5">
      <Text className="font-display text-[10px] uppercase tracking-wider text-ink">
        Revisa esto
      </Text>
      <Text className="mt-0.5 text-xs leading-4 text-ink/80">{message}</Text>
    </View>
  );
}

export function ConfigNotice() {
  return (
    <View className="mb-4 rounded-xl border-[3px] border-ink bg-yellow px-3 py-2.5">
      <Text className="font-display text-[10px] uppercase tracking-wider text-ink">
        Falta configurar Supabase
      </Text>
      <Text className="mt-0.5 text-xs leading-4 text-ink/80">
        Copia `.env.example` a `.env` y completa tu URL y anon key. Luego reinicia el servidor.
      </Text>
    </View>
  );
}

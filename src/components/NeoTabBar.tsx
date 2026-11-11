import type { BottomTabBarProps } from 'expo-router/js-tabs';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/utils/cn';

const ICONS: Record<string, string> = {
  dashboard: '⌂',
  projects: '▦',
  tasks: '✓',
  profile: '◉',
};

const LABELS: Record<string, string> = {
  dashboard: 'Inicio',
  projects: 'Proyectos',
  tasks: 'Tareas',
  profile: 'Perfil',
};

const COLORS: Record<string, string> = {
  dashboard: 'bg-lime',
  projects: 'bg-sky',
  tasks: 'bg-yellow',
  profile: 'bg-pink',
};

export function NeoTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t-[3px] border-ink bg-paper px-3 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
      <View className="flex-row gap-2">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const name = route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? LABELS[name]}
              onPress={onPress}
              className="flex-1">
              <View
                className={cn(
                  'items-center justify-center gap-0.5 rounded-lg border-[3px] border-ink py-1.5',
                  focused ? COLORS[name] ?? 'bg-lime' : 'bg-white',
                  focused && 'translate-x-0.5 -translate-y-0.5',
                )}>
                <Text className="font-display text-base leading-5 text-ink">{ICONS[name] ?? '•'}</Text>
                <Text className="font-display text-[9px] uppercase tracking-wide text-ink">
                  {LABELS[name] ?? name}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

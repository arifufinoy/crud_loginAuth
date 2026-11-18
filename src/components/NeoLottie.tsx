import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';

import { cn } from '@/utils/cn';

export const animations = {
  welcome: require('../../animaciones/dashboard-grid.json'),
  register: require('../../animaciones/notification.json'),
  loading: require('../../animaciones/loading-spinner.json'),
  dashboard: require('../../animaciones/kpi-meter.json'),
  emptyProjects: require('../../animaciones/folder.json'),
  projectsEmpty: require('../../animaciones/projects-empty.json'),
  emptyTasks: require('../../animaciones/calendar.json'),
  success: require('../../animaciones/notification.json'),
  taskCreated: require('../../animaciones/task-completed.json'),
  calendar: require('../../animaciones/calendar.json'),
} as const;

export type AnimationName = keyof typeof animations;

interface NeoLottieProps {
  name: AnimationName;
  className?: string;
  loop?: boolean;
  autoPlay?: boolean;
  speed?: number;
}

/**
 * Lottie needs explicit dimensions on web, so the Uniwind class is applied to
 * a wrapper and the animation fills it. This keeps every size controlled by
 * Tailwind classes instead of ad-hoc StyleSheet objects.
 */
export function NeoLottie({
  name,
  className = 'h-32 w-32',
  loop = true,
  autoPlay = true,
  speed = 1,
}: NeoLottieProps) {
  return (
    <View className={cn('shrink-0', className)} pointerEvents="none">
      <LottieView
        source={animations[name]}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        resizeMode="contain"
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/utils/cn';

interface ScreenProps extends Pick<ScrollViewProps, 'refreshControl'> {
  children: React.ReactNode;
  scroll?: boolean;
  tabBar?: boolean;
  className?: string;
  contentClassName?: string;
  keyboard?: boolean;
}

export function Screen({
  children,
  scroll = true,
  tabBar = false,
  className,
  contentClassName,
  keyboard = true,
  refreshControl,
}: ScreenProps) {
  const content = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={cn('px-5 pt-3', tabBar ? 'pb-36' : 'pb-10', contentClassName)}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}>
      {children}
    </ScrollView>
  ) : (
    <View className={cn('flex-1 px-5 pb-10 pt-3', contentClassName)}>{children}</View>
  );

  return (
    <SafeAreaView
      className={cn('flex-1 bg-paper', className)}
      edges={tabBar ? ['top', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}>
      {keyboard ? (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

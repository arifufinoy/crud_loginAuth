import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { cn } from '@/utils/cn';

type Variant = 'lime' | 'ink' | 'pink' | 'sky' | 'yellow' | 'white' | 'violet';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, { surface: string; text: string }> = {
  lime: { surface: 'bg-lime', text: 'text-ink' },
  ink: { surface: 'bg-ink', text: 'text-white' },
  pink: { surface: 'bg-pink', text: 'text-ink' },
  sky: { surface: 'bg-sky', text: 'text-ink' },
  yellow: { surface: 'bg-yellow', text: 'text-ink' },
  white: { surface: 'bg-white', text: 'text-ink' },
  violet: { surface: 'bg-violet', text: 'text-ink' },
};

const SIZES: Record<Size, { padding: string; text: string; height: string }> = {
  sm: { padding: 'px-3 py-2', text: 'text-xs', height: 'min-h-[40px]' },
  md: { padding: 'px-5 py-3', text: 'text-sm', height: 'min-h-[52px]' },
  lg: { padding: 'px-6 py-4', text: 'text-base', height: 'min-h-[58px]' },
};

interface NeoButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  shadowClassName?: string;
  style?: ViewStyle;
}

export function NeoButton({
  label,
  variant = 'lime',
  size = 'md',
  loading = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  className,
  labelClassName,
  shadowClassName,
  disabled,
  ...props
}: NeoButtonProps) {
  const palette = VARIANTS[variant];
  const sizing = SIZES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn('relative', fullWidth && 'w-full', isDisabled && 'opacity-50', className)}
      {...props}>
      {({ pressed }) => (
        <>
          <View
            className={cn(
              'absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-xl bg-ink',
              shadowClassName,
            )}
          />
          <View
            className={cn(
              'flex-row items-center justify-center gap-2 rounded-xl border-[3px] border-ink',
              palette.surface,
              sizing.padding,
              sizing.height,
              fullWidth && 'w-full',
              pressed && !isDisabled && 'translate-x-1.5 translate-y-1.5',
            )}>
            {loading ? (
              <ActivityIndicator size="small" color={variant === 'ink' ? '#ffffff' : '#111111'} />
            ) : (
              <>
                {leftIcon}
                <Text
                  numberOfLines={1}
                  className={cn(
                    'font-display uppercase tracking-wide',
                    palette.text,
                    sizing.text,
                    labelClassName,
                  )}>
                  {label}
                </Text>
                {rightIcon}
              </>
            )}
          </View>
        </>
      )}
    </Pressable>
  );
}

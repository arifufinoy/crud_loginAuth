import React, { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/utils/cn';

interface NeoInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  hint?: string;
  rightSlot?: React.ReactNode;
  required?: boolean;
  containerClassName?: string;
}

export function NeoInput({
  label,
  error,
  hint,
  rightSlot,
  required,
  secureTextEntry,
  containerClassName,
  ...props
}: NeoInputProps) {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      <View className="flex-row items-center justify-between">
        <Text className="font-display text-[10px] uppercase tracking-[2px] text-ink">
          {label}
          {required ? <Text className="text-danger"> *</Text> : null}
        </Text>
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            onPress={() => setHidden((value) => !value)}
            hitSlop={8}>
            <Text className="font-display text-[10px] uppercase tracking-wider text-muted">
              {hidden ? 'Mostrar' : 'Ocultar'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View
        className={cn(
          'flex-row items-center gap-2 rounded-xl border-[3px] bg-white px-3',
          error ? 'border-danger' : 'border-ink',
        )}>
        <TextInput
          className={
            props.multiline
              ? 'min-h-[100px] flex-1 py-2 text-[15px] text-ink'
              : 'min-h-[48px] flex-1 py-2 text-[15px] text-ink'
          }
          placeholderTextColor="#948978"
          secureTextEntry={secureTextEntry ? hidden : false}
          autoCorrect={false}
          {...props}
        />
        {rightSlot}
      </View>

      {error ? (
        <Text className="text-xs font-medium text-danger">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}

import React from 'react';
import { Text, View } from 'react-native';

import { NeoButton } from '@/components/ui/NeoButton';

interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoogleButton({ onPress, loading, disabled }: GoogleButtonProps) {
  return (
    <NeoButton
      label="Continuar con Google"
      variant="white"
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      leftIcon={
        <View className="h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-paper">
          <Text className="font-display text-xs text-ink">G</Text>
        </View>
      }
    />
  );
}

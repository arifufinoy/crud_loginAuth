import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { NeoLottie } from '@/components/NeoLottie';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { Screen } from '@/components/ui/Screen';

export default function NotFoundScreen() {
  return (
    <Screen>
      <View className="w-full max-w-md self-center items-center pt-20">
        <NeoCard bodyClassName="items-center gap-3 bg-cream p-6">
          <NeoLottie name="emptyProjects" className="h-40 w-40" />
          <Text className="text-center font-display text-3xl uppercase text-ink">404</Text>
          <Text className="text-center font-display text-sm uppercase text-ink">
            Esta pantalla no existe
          </Text>
          <Text className="text-center text-sm text-muted">
            El enlace puede haber expirado o la ruta está mal escrita.
          </Text>
          <View className="mt-2 w-full">
            <NeoButton
              label="Ir al inicio"
              variant="lime"
              onPress={() => router.replace('/(app)/(tabs)/dashboard')}
            />
          </View>
        </NeoCard>
      </View>
    </Screen>
  );
}

import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { NeoLottie } from '@/components/NeoLottie';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { LoadingScreen } from '@/components/ui/Loading';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/utils/errors';

export default function AuthCallbackScreen() {
  const { session, loading, recoveryMode, completeAuthFromUrl } = useAuth();
  const params = useLocalSearchParams<{
    code?: string;
    flow?: string;
    error_description?: string;
  }>();
  const [error, setError] = useState('');
  const attempted = useRef<string | null>(null);
  const linkingUrl = Linking.useLinkingURL();

  const effectiveUrl =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.href
      : linkingUrl && linkingUrl.includes('auth-callback')
        ? linkingUrl
        : params.code
          ? `crud://auth-callback?code=${encodeURIComponent(params.code)}&flow=${params.flow ?? 'oauth'}`
          : null;

  const flow =
    params.flow ??
    (effectiveUrl && (effectiveUrl.includes('type=recovery') || effectiveUrl.includes('flow=recovery'))
      ? 'recovery'
      : undefined);
  const isRecovery = flow === 'recovery';
  const visibleError = error || params.error_description || '';

  // On native the PKCE code (or recovery tokens in the hash) must be exchanged
  // manually. On web supabase-js already detects the URL when the client mounts.
  useEffect(() => {
    if (loading || session || params.error_description) return;
    if (!effectiveUrl || attempted.current === effectiveUrl) return;
    if (!effectiveUrl.includes('code=') && !effectiveUrl.includes('access_token=')) return;

    attempted.current = effectiveUrl;
    completeAuthFromUrl(effectiveUrl).catch((err) => {
      setError(getErrorMessage(err));
    });
  }, [
    loading,
    session,
    params.error_description,
    effectiveUrl,
    completeAuthFromUrl,
  ]);

  useEffect(() => {
    if (loading) return;
    if (params.error_description) return;
    if (session && !visibleError) {
      if (isRecovery || recoveryMode) {
        router.replace('/(auth)/reset-password');
      } else {
        router.replace('/(app)/(tabs)/dashboard');
      }
    }
  }, [loading, session, visibleError, isRecovery, recoveryMode, params.error_description]);

  if (visibleError) {
    return (
      <Screen>
        <View className="w-full max-w-md self-center pt-16">
          <NeoCard bodyClassName="items-center gap-3 border-danger p-5">
            <NeoLottie name="register" className="h-32 w-32" loop={false} />
            <Text className="text-center font-display text-lg uppercase text-ink">
              No pudimos completar el acceso
            </Text>
            <Text className="text-center text-sm leading-5 text-muted">{visibleError}</Text>
            <View className="mt-2 w-full">
              <NeoButton
                label="Volver al login"
                variant="ink"
                onPress={() => router.replace('/(auth)/login')}
              />
            </View>
          </NeoCard>
        </View>
      </Screen>
    );
  }

  return <LoadingScreen label="Validando tu acceso seguro..." />;
}

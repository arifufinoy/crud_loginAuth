import { Redirect, Stack, usePathname } from 'expo-router';
import React from 'react';

import { LoadingScreen } from '@/components/ui/Loading';
import { useAuth } from '@/context/auth-context';

export default function AuthLayout() {
  const { session, loading, recoveryMode } = useAuth();
  const pathname = usePathname();
  const onResetScreen = pathname.includes('reset-password');

  if (loading) return <LoadingScreen label="Preparando el acceso..." />;

  if (recoveryMode && session && !onResetScreen) {
    return <Redirect href="/(auth)/reset-password" />;
  }

  if (session && !recoveryMode && !onResetScreen) {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}

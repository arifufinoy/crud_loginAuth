import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { LoadingScreen } from '@/components/ui/Loading';
import { useAuth } from '@/context/auth-context';

export default function AppLayout() {
  const { session, loading, recoveryMode } = useAuth();

  if (loading) return <LoadingScreen label="Cargando tus proyectos..." />;

  if (!session) return <Redirect href="/(auth)/login" />;

  if (recoveryMode) return <Redirect href="/(auth)/reset-password" />;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="project/new" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="project/[id]" />
      <Stack.Screen name="project/edit/[id]" />
      <Stack.Screen name="task/new" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="task/edit/[id]" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}

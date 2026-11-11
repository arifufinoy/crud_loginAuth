import { Redirect } from 'expo-router';
import React from 'react';

import { LoadingScreen } from '@/components/ui/Loading';
import { useAuth } from '@/context/auth-context';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen label="Restaurando tu sesión..." />;

  return <Redirect href={session ? '/(app)/(tabs)/dashboard' : '/(auth)/login'} />;
}

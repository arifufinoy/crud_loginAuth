import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { isSupabaseConfigured, supabase } from '@/services/supabase';

WebBrowser.maybeCompleteAuthSession();

type AuthFlow = 'oauth' | 'recovery' | 'signup';

interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  recoveryMode: boolean;
  isConfigured: boolean;
  displayName: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeAuthFromUrl: (url: string) => Promise<Session | null>;
  setRecoveryMode: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const RECOVERY_STORAGE_KEY = 'acadex.recovery-mode';

function redirectUrl(flow: AuthFlow): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/auth-callback?flow=${flow}`;
  }
  return Linking.createURL('auth-callback', { queryParams: { flow } });
}

function extractParams(rawUrl: string) {
  const query = rawUrl.includes('?') ? rawUrl.split('?')[1]?.split('#')[0] ?? '' : '';
  const hash = rawUrl.includes('#') ? rawUrl.split('#')[1] ?? '' : '';
  const params = new URLSearchParams(query);
  const hashParams = new URLSearchParams(hash);
  return {
    code: params.get('code'),
    flow: params.get('flow') ?? hashParams.get('type'),
    error: params.get('error_description') ?? hashParams.get('error_description'),
    accessToken: hashParams.get('access_token'),
    refreshToken: hashParams.get('refresh_token'),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryModeState] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(RECOVERY_STORAGE_KEY)
      .then((stored) => {
        if (mounted && stored === 'true') setRecoveryModeState(true);
      })
      .catch(() => undefined);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'SIGNED_OUT') {
        setRecoveryModeState(false);
        AsyncStorage.removeItem(RECOVERY_STORAGE_KEY).catch(() => undefined);
      }
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryModeState(true);
        AsyncStorage.setItem(RECOVERY_STORAGE_KEY, 'true').catch(() => undefined);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Keep token refresh healthy while the app moves between background/foreground.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    supabase.auth.startAutoRefresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => {
      subscription.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  const setRecoveryMode = useCallback((value: boolean) => {
    setRecoveryModeState(value);
    if (value) {
      AsyncStorage.setItem(RECOVERY_STORAGE_KEY, 'true').catch(() => undefined);
    } else {
      AsyncStorage.removeItem(RECOVERY_STORAGE_KEY).catch(() => undefined);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async ({ fullName, email, password }: SignUpInput) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: redirectUrl('signup'),
      },
    });
    if (error) throw error;
    return { needsConfirmation: !data.session };
  }, []);

  const completeAuthFromUrl = useCallback(
    async (url: string) => {
      const { code, flow, error, accessToken, refreshToken } = extractParams(url);
      if (error) throw new Error(error);
      if (flow === 'recovery') setRecoveryMode(true);

      const {
        data: { session: existing },
      } = await supabase.auth.getSession();
      if (existing) return existing;

      if (accessToken && refreshToken) {
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
        return data.session;
      }

      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
        return data.session;
      }

      return null;
    },
    [setRecoveryMode],
  );

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = redirectUrl('oauth');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: Platform.OS !== 'web',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) throw error;

    if (Platform.OS === 'web') return;

    if (!data.url) throw new Error('No se pudo iniciar el flujo de Google.');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success' && result.url) {
      await completeAuthFromUrl(result.url);
    }
  }, [completeAuthFromUrl]);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: redirectUrl('recovery'),
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    setRecoveryMode(false);
  }, [setRecoveryMode]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const email = session?.user.email;
      if (!email) throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (verifyError) throw new Error('La contraseña actual no es correcta.');

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    [session?.user.email],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRecoveryMode(false);
  }, [setRecoveryMode]);

  const displayName = useMemo(() => {
    const metadata = session?.user.user_metadata ?? {};
    const fallback = session?.user.email?.split('@')[0] ?? 'Estudiante';
    return (metadata.full_name as string | undefined)?.trim() || (metadata.name as string) || fallback;
  }, [session?.user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      recoveryMode,
      isConfigured: isSupabaseConfigured,
      displayName,
      signIn,
      signUp,
      signInWithGoogle,
      sendPasswordReset,
      updatePassword,
      changePassword,
      signOut,
      completeAuthFromUrl,
      setRecoveryMode,
    }),
    [
      session,
      loading,
      recoveryMode,
      displayName,
      signIn,
      signUp,
      signInWithGoogle,
      sendPasswordReset,
      updatePassword,
      changePassword,
      signOut,
      completeAuthFromUrl,
      setRecoveryMode,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}

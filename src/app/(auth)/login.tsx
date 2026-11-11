import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthHero, ConfigNotice, FormError } from '@/components/auth/AuthHero';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoInput } from '@/components/ui/NeoInput';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/utils/errors';
import { validateEmail } from '@/utils/validation';

export default function LoginScreen() {
  const { signIn, signInWithGoogle, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async () => {
    setFormError('');
    const emailError = validateEmail(email);
    const passwordError = password ? undefined : 'La contraseña es obligatoria.';
    setErrors({ email: emailError, password: passwordError });
    if (emailError || passwordError) return;

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setFormError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Screen contentClassName="pb-10">
      <View className="w-full max-w-md self-center">
        <AuthHero
          title="Menos caos, más entregas."
          subtitle="Centraliza tus proyectos académicos, tareas y fechas límite en un solo lugar."
          animation="welcome"
          tone="lime"
        />

        {!isConfigured ? <ConfigNotice /> : null}

        <NeoCard bodyClassName="gap-4 p-4">
          <View>
            <Text className="font-display text-xl uppercase tracking-tight text-ink">
              Bienvenido de vuelta
            </Text>
            <Text className="mt-0.5 text-xs text-muted">Ingresa con tu cuenta para continuar.</Text>
          </View>

          {formError ? <FormError message={formError} /> : null}

          <NeoInput
            label="Correo electrónico"
            placeholder="tu@correo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            error={errors.email}
            required
          />

          <NeoInput
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            error={errors.password}
            required
          />

          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            className="self-end"
            hitSlop={6}>
            <Text className="font-display text-[10px] uppercase tracking-wider text-ink underline">
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>

          <NeoButton
            label="Iniciar sesión"
            onPress={handleSubmit}
            loading={loading}
            disabled={googleLoading}
            variant="ink"
            rightIcon={<Text className="font-display text-base text-lime">→</Text>}
          />

          <View className="flex-row items-center gap-3">
            <View className="h-[3px] flex-1 bg-ink/15" />
            <Text className="font-display text-[9px] uppercase tracking-[2px] text-muted">o</Text>
            <View className="h-[3px] flex-1 bg-ink/15" />
          </View>

          <GoogleButton onPress={handleGoogle} loading={googleLoading} disabled={loading} />
        </NeoCard>

        <View className="mt-5 flex-row items-center justify-center gap-1.5">
          <Text className="text-xs text-muted">¿Aún no tienes cuenta?</Text>
          <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={6}>
            <Text className="font-display text-[10px] uppercase tracking-wider text-ink underline">
              Regístrate gratis
            </Text>
          </Pressable>
        </View>

        <Text className="mt-4 text-center text-[9px] uppercase tracking-[1.5px] text-muted">
          Seguridad Supabase · Sesión persistente · RLS
        </Text>
      </View>
    </Screen>
  );
}

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
import { useFeedback } from '@/context/feedback-context';
import { getErrorMessage } from '@/utils/errors';
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
} from '@/utils/validation';

interface Errors {
  fullName?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export default function RegisterScreen() {
  const { signUp, signInWithGoogle, isConfigured } = useAuth();
  const { showSuccess } = useFeedback();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async () => {
    setFormError('');
    const nextErrors: Errors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirmPassword(password, confirm),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const { needsConfirmation } = await signUp({ fullName, email, password });
      if (needsConfirmation) {
        showSuccess(
          'Cuenta creada',
          'Te enviamos un correo de confirmación. Ábrelo y luego inicia sesión.',
        );
        router.replace('/(auth)/login');
      }
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
          title="Tu semestre, bajo control."
          subtitle="Crea tu cuenta y empieza a organizar proyectos, tareas y prioridades."
          animation="register"
          tone="sky"
          eyebrow="Nuevo estudiante"
        />

        {!isConfigured ? <ConfigNotice /> : null}

        <NeoCard bodyClassName="gap-4 p-4">
          <View>
            <Text className="font-display text-xl uppercase tracking-tight text-ink">
              Crear cuenta
            </Text>
            <Text className="mt-0.5 text-xs text-muted">Solo necesitas unos segundos.</Text>
          </View>

          {formError ? <FormError message={formError} /> : null}

          <NeoInput
            label="Nombre completo"
            placeholder="Ana María Torres"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            error={errors.fullName}
            required
          />

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
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            error={errors.password}
            hint="Usa al menos 8 caracteres, una letra y un número."
            required
          />

          <NeoInput
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            error={errors.confirm}
            required
          />

          <NeoButton
            label="Crear mi cuenta"
            onPress={handleSubmit}
            loading={loading}
            disabled={googleLoading}
            variant="ink"
            rightIcon={<Text className="font-display text-base text-sky">+</Text>}
          />

          <View className="flex-row items-center gap-3">
            <View className="h-[3px] flex-1 bg-ink/15" />
            <Text className="font-display text-[9px] uppercase tracking-[2px] text-muted">o</Text>
            <View className="h-[3px] flex-1 bg-ink/15" />
          </View>

          <GoogleButton onPress={handleGoogle} loading={googleLoading} disabled={loading} />
        </NeoCard>

        <View className="mt-5 flex-row items-center justify-center gap-1.5">
          <Text className="text-xs text-muted">¿Ya tienes cuenta?</Text>
          <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={6}>
            <Text className="font-display text-[10px] uppercase tracking-wider text-ink underline">
              Inicia sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { FormError } from '@/components/auth/AuthHero';
import { NeoLottie } from '@/components/NeoLottie';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoHeader } from '@/components/ui/NeoHeader';
import { NeoInput } from '@/components/ui/NeoInput';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/context/auth-context';
import { useFeedback } from '@/context/feedback-context';
import { getErrorMessage } from '@/utils/errors';
import { validateConfirmPassword, validatePassword } from '@/utils/validation';

export default function ChangePasswordScreen() {
  const { changePassword, updatePassword, user } = useAuth();
  const { showSuccess } = useFeedback();
  const isGoogleAccount = user?.app_metadata?.provider === 'google';

  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setFormError('');
    const nextErrors = {
      current: !isGoogleAccount && !current ? 'Ingresa tu contraseña actual.' : undefined,
      password: validatePassword(password),
      confirm: validateConfirmPassword(password, confirm),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    if (!isGoogleAccount && current === password) {
      setErrors({ ...nextErrors, password: 'La nueva contraseña debe ser diferente.' });
      return;
    }

    setLoading(true);
    try {
      if (isGoogleAccount) await updatePassword(password);
      else await changePassword(current, password);
      showSuccess('Contraseña actualizada', 'Tu nueva contraseña ya está activa.');
      router.replace('/(app)/(tabs)/profile');
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View className="w-full max-w-xl self-center">
        <NeoHeader title="Cambiar contraseña" subtitle="Protege tu cuenta" />

        <NeoCard bodyClassName="gap-4 p-5">
          <View className="items-center">
            <NeoLottie name="register" className="h-24 w-24" />
            <Text className="text-center font-display text-lg uppercase text-ink">
              Nueva clave de acceso
            </Text>
            <Text className="mt-1 text-center text-xs leading-4 text-muted">
              {isGoogleAccount
                ? 'Tu cuenta usa Google. Aquí puedes crear una contraseña para ingresar también con correo.'
                : 'Confirma tu contraseña actual y define una nueva.'}
            </Text>
          </View>

          {isGoogleAccount ? (
            <View className="rounded-lg border-2 border-ink bg-cream px-3 py-2">
              <Text className="text-[10px] leading-4 text-ink/70">
                Cuenta de Google detectada: no se solicita contraseña actual porque tu identidad se
                validó con OAuth.
              </Text>
            </View>
          ) : (
            <NeoInput
              label="Contraseña actual"
              placeholder="••••••••"
              value={current}
              onChangeText={setCurrent}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              error={errors.current}
              required
            />
          )}

          {formError ? <FormError message={formError} /> : null}

          <NeoInput
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            error={errors.password}
            hint="Al menos una letra y un número."
            required
          />

          <NeoInput
            label="Confirmar nueva contraseña"
            placeholder="••••••••"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            error={errors.confirm}
            required
          />

          <NeoButton
            label="Guardar contraseña"
            onPress={submit}
            loading={loading}
            variant="ink"
            rightIcon={<Text className="font-display text-base text-lime">✓</Text>}
          />
        </NeoCard>
      </View>
    </Screen>
  );
}

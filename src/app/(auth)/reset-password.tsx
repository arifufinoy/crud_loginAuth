import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { BrandMark, FormError } from '@/components/auth/AuthHero';
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

export default function ResetPasswordScreen() {
  const { session, updatePassword } = useAuth();
  const { showSuccess } = useFeedback();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setFormError('');
    const nextErrors = {
      password: validatePassword(password),
      confirm: validateConfirmPassword(password, confirm),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await updatePassword(password);
      showSuccess('Contraseña actualizada', 'Ya puedes usar tu nueva contraseña.');
      router.replace('/(app)/(tabs)/dashboard');
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Screen>
        <View className="w-full max-w-md self-center">
          <BrandMark />
          <NeoCard className="mt-6" bodyClassName="items-center gap-3 p-5">
            <NeoLottie name="emptyProjects" className="h-32 w-32" />
            <Text className="text-center font-display text-lg uppercase text-ink">
              Enlace no válido
            </Text>
            <Text className="text-center text-sm text-muted">
              Tu enlace de recuperación expiró o ya fue utilizado. Solicita uno nuevo desde el
              login.
            </Text>
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

  return (
    <Screen>
      <View className="w-full max-w-md self-center">
        <View className="mb-4">
          <BrandMark />
        </View>
        <NeoHeader
          title="Nueva contraseña"
          subtitle="Elige una clave segura que puedas recordar"
          back={false}
        />

        <NeoCard bodyClassName="gap-4 p-5">
          <View className="items-center">
            <NeoLottie name="welcome" className="h-28 w-28" />
            <Text className="text-center font-display text-lg uppercase text-ink">
              Define tu nueva clave
            </Text>
            <Text className="mt-1 text-center text-xs leading-4 text-muted">
              Mínimo 8 caracteres, con al menos una letra y un número.
            </Text>
          </View>

          {formError ? <FormError message={formError} /> : null}

          <NeoInput
            label="Nueva contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            error={errors.password}
            required
          />

          <NeoInput
            label="Confirmar contraseña"
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
            label="Actualizar contraseña"
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

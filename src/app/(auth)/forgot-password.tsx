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
import { getErrorMessage } from '@/utils/errors';
import { validateEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setFormError('');
    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) return;

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentClassName="pb-10">
      <View className="w-full max-w-md self-center">
        <View className="mb-4">
          <BrandMark />
        </View>
        <NeoHeader title="Recuperar acceso" subtitle="Te enviaremos un enlace seguro" />

        {sent ? (
          <NeoCard bodyClassName="items-center gap-2 bg-cream p-5">
            <NeoLottie name="success" className="h-32 w-32" loop={false} />
            <Text className="text-center font-display text-xl uppercase text-ink">
              Revisa tu correo
            </Text>
            <Text className="text-center text-sm leading-5 text-muted">
              Enviamos un enlace de recuperación a{' '}
              <Text className="font-medium text-ink">{email.trim().toLowerCase()}</Text>. Abre el
              enlace desde este dispositivo para crear una nueva contraseña.
            </Text>
            <View className="mt-3 w-full gap-2">
              <NeoButton label="Reenviar enlace" variant="sky" size="sm" loading={loading} onPress={submit} />
              <NeoButton
                label="Volver al login"
                variant="white"
                size="sm"
                onPress={() => router.replace('/(auth)/login')}
              />
            </View>
          </NeoCard>
        ) : (
          <NeoCard bodyClassName="gap-4 p-5">
            <View className="items-center">
              <NeoLottie name="register" className="h-28 w-28" />
              <Text className="text-center font-display text-lg uppercase text-ink">
                ¿Olvidaste tu contraseña?
              </Text>
              <Text className="mt-1 text-center text-xs leading-4 text-muted">
                Escribe el correo con el que te registraste y te enviaremos un enlace temporal.
              </Text>
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
              error={error}
              required
            />

            <NeoButton
              label="Enviar enlace"
              onPress={submit}
              loading={loading}
              variant="ink"
              rightIcon={<Text className="font-display text-base text-lime">→</Text>}
            />
            <NeoButton
              label="Cancelar"
              variant="white"
              size="sm"
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace('/(auth)/login')
              }
            />
          </NeoCard>
        )}

        <Text className="mt-5 text-center text-[9px] uppercase tracking-[1.5px] text-muted">
          El enlace caduca por seguridad. Revisa también tu carpeta de spam.
        </Text>
      </View>
    </Screen>
  );
}

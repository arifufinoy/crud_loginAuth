import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { NeoLottie } from '@/components/NeoLottie';
import { NeoCard } from '@/components/ui/NeoCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { NeoButton } from '@/components/ui/NeoButton';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/context/auth-context';
import { formatDateTime, initialsFromName } from '@/utils/dates';

function MenuRow({
  title,
  subtitle,
  onPress,
  tone = 'bg-white',
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  tone?: string;
}) {
  return (
    <Pressable onPress={onPress} className="active:translate-x-0.5 active:translate-y-0.5">
      <View className="flex-row items-center justify-between rounded-xl border-[3px] border-ink bg-white px-3 py-3">
        <View className="flex-row items-center gap-3">
          <View className={`h-9 w-9 rounded-lg border-2 border-ink ${tone}`} />
          <View>
            <Text className="font-display text-xs uppercase tracking-wide text-ink">{title}</Text>
            <Text className="text-[10px] text-muted">{subtitle}</Text>
          </View>
        </View>
        <Text className="font-display text-base text-ink">→</Text>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, displayName, signOut, isConfigured } = useAuth();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const provider = user?.app_metadata?.provider ?? 'email';
  const createdAt = user?.created_at ? formatDateTime(user.created_at) : '—';
  const lastSignIn = user?.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : '—';

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
      setConfirmSignOut(false);
    }
  };

  return (
    <Screen tabBar>
      <View className="w-full max-w-2xl self-center">
        <View className="mb-4">
          <Text className="font-display text-[9px] uppercase tracking-[3px] text-muted">
            Cuenta y configuración
          </Text>
          <Text className="mt-0.5 font-display text-2xl uppercase tracking-tight text-ink">
            Mi perfil
          </Text>
        </View>

        <View className="relative mb-5">
          <View className="absolute inset-0 translate-x-2 translate-y-2 rounded-3xl bg-ink" />
          <View className="flex-row items-center gap-4 rounded-3xl border-[3px] border-ink bg-violet px-4 py-4">
            <View className="h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-ink bg-white">
              <Text className="font-display text-xl text-ink">{initialsFromName(displayName)}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-display text-lg uppercase leading-6 text-ink" numberOfLines={2}>
                {displayName}
              </Text>
              <Text className="text-xs text-ink/70" numberOfLines={1}>
                {user?.email ?? 'Sin correo'}
              </Text>
              <View className="mt-1.5 flex-row flex-wrap gap-1.5">
                <View className="rounded-md border-2 border-ink bg-lime px-2 py-0.5">
                  <Text className="font-display text-[8px] uppercase tracking-wider text-ink">
                    {provider === 'google' ? 'Google OAuth' : 'Correo'}
                  </Text>
                </View>
                <View className="rounded-md border-2 border-ink bg-white px-2 py-0.5">
                  <Text className="font-display text-[8px] uppercase tracking-wider text-ink">
                    Verificado
                  </Text>
                </View>
              </View>
            </View>
            <NeoLottie name="dashboard" className="h-20 w-20" />
          </View>
        </View>

        <View className="mb-5">
          <NeoCard bodyClassName="gap-2.5 p-4">
            <Text className="font-display text-[10px] uppercase tracking-[2px] text-ink">
              Acciones de cuenta
            </Text>
            <MenuRow
              title="Cambiar contraseña"
              subtitle="Actualiza tu clave de acceso"
              tone="bg-yellow"
              onPress={() => router.push('/(app)/change-password')}
            />
            <MenuRow
              title="Mis proyectos"
              subtitle="Gestiona tus proyectos académicos"
              tone="bg-lime"
              onPress={() => router.push('/(app)/(tabs)/projects')}
            />
            <MenuRow
              title="Mis tareas"
              subtitle="Revisa pendientes y completadas"
              tone="bg-sky"
              onPress={() => router.push('/(app)/(tabs)/tasks')}
            />
          </NeoCard>
        </View>

        <View className="mb-5">
          <NeoCard bodyClassName="gap-2 p-4">
            <Text className="font-display text-[10px] uppercase tracking-[2px] text-ink">
              Detalles de la sesión
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Creada</Text>
              <Text className="text-xs font-medium text-ink">{createdAt}</Text>
            </View>
            <View className="h-[2px] bg-ink/10" />
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Último acceso</Text>
              <Text className="text-xs font-medium text-ink">{lastSignIn}</Text>
            </View>
            <View className="h-[2px] bg-ink/10" />
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Backend</Text>
              <Text className="text-xs font-medium text-ink">
                {isConfigured ? 'Supabase conectado' : 'Sin configurar'}
              </Text>
            </View>
            <View className="h-[2px] bg-ink/10" />
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Seguridad</Text>
              <Text className="text-xs font-medium text-ink">RLS por usuario</Text>
            </View>
          </NeoCard>
        </View>

        <NeoCard bodyClassName="bg-pink p-4">
          <Text className="font-display text-[10px] uppercase tracking-[2px] text-ink">
            Zona de salida
          </Text>
          <Text className="mt-1 text-xs text-ink/70">
            Tu sesión se conserva en el dispositivo. Al cerrar sesión deberás autenticarte de nuevo.
          </Text>
          <View className="mt-3">
            <NeoButton
              label="Cerrar sesión"
              variant="ink"
              onPress={() => setConfirmSignOut(true)}
              rightIcon={<Text className="font-display text-base text-pink">↗</Text>}
            />
          </View>
        </NeoCard>

        <Text className="mt-5 text-center text-[9px] uppercase tracking-[1.5px] text-muted">
          Acadex MVP · Expo SDK 57 · Uniwind · Lottie
        </Text>
      </View>

      <ConfirmDialog
        visible={confirmSignOut}
        title="¿Cerrar sesión?"
        message="Volverás a la pantalla de login. Tus proyectos y tareas seguirán guardados en Supabase."
        confirmLabel="Salir"
        cancelLabel="Quedarme"
        loading={signingOut}
        onConfirm={handleSignOut}
        onCancel={() => setConfirmSignOut(false)}
      />
    </Screen>
  );
}

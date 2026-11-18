import {
  ArchivoBlack_400Regular,
  useFonts as useArchivoFonts,
} from '@expo-google-fonts/archivo-black';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
  useFonts as useSpaceFonts,
} from '@expo-google-fonts/space-grotesk';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/auth-context';
import { FeedbackProvider } from '@/context/feedback-context';
import '../../global.css';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [archivoLoaded] = useArchivoFonts({ ArchivoBlack_400Regular });
  const [spaceLoaded] = useSpaceFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  const fontsLoaded = archivoLoaded && spaceLoaded;
  const [fontLoadTimedOut, setFontLoadTimedOut] = useState(false);

  // A device without network access must still be able to reach the app. The
  // bundled font packages normally load immediately, but the timeout prevents
  // a permanent white screen if one of them cannot be resolved.
  useEffect(() => {
    if (fontsLoaded) return;

    const timeout = setTimeout(() => setFontLoadTimedOut(true), 4000);
    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded || fontLoadTimedOut) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontLoadTimedOut, fontsLoaded]);

  if (!fontsLoaded && !fontLoadTimedOut) return <BootFallback />;

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <AuthProvider>
          <FeedbackProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="auth-callback" options={{ animation: 'fade' }} />
              <Stack.Screen name="+not-found" options={{ animation: 'fade' }} />
            </Stack>
          </FeedbackProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Expo Router renders this boundary when a native screen throws during
// rendering. Without it, a native runtime exception can look like a blank
// screen after the splash/loading view has disappeared.
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <GestureHandlerRootView className="flex-1 items-center justify-center bg-[#C8FF4D] px-6">
      <StatusBar style="dark" />
      <View className="w-full max-w-md rounded-2xl border-[3px] border-ink bg-white p-5">
        <Text className="font-display text-xl uppercase text-ink">Acadex no pudo abrirse</Text>
        <Text className="mt-2 text-sm text-ink/70">
          Ocurrió un error al cargar esta pantalla. Reinicia la vista para continuar.
        </Text>
        <Text selectable className="mt-3 text-xs text-ink/60">
          {error.message || 'Error desconocido'}
        </Text>
        <Pressable onPress={retry} className="mt-4 rounded-xl bg-ink px-4 py-3">
          <Text className="text-center font-display text-xs uppercase text-lime">Reintentar</Text>
        </Pressable>
      </View>
    </GestureHandlerRootView>
  );
}

function BootFallback() {
  return (
    <GestureHandlerRootView className="flex-1 items-center justify-center bg-[#C8FF4D]">
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { NeoLottie, type AnimationName } from '@/components/NeoLottie';
import { NeoButton } from '@/components/ui/NeoButton';

type FeedbackKind = 'success' | 'error';

interface FeedbackState {
  kind: FeedbackKind;
  title: string;
  message?: string;
  animation?: AnimationName;
}

interface FeedbackContextValue {
  showSuccess: (title: string, message?: string, animation?: AnimationName) => void;
  showError: (title: string, message?: string) => void;
  hide: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const showSuccess = useCallback(
    (title: string, message?: string, animation: AnimationName = 'success') => {
      setFeedback({ kind: 'success', title, message, animation });
    },
    [],
  );

  const showError = useCallback((title: string, message?: string) => {
    setFeedback({ kind: 'error', title, message });
  }, []);

  const hide = useCallback(() => setFeedback(null), []);

  const value = useMemo(
    () => ({ showSuccess, showError, hide }),
    [showSuccess, showError, hide],
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Modal visible={!!feedback} transparent animationType="fade" onRequestClose={hide}>
        <Pressable className="flex-1 items-center justify-center bg-ink/70 px-6" onPress={hide}>
          <Pressable
            className="w-full max-w-md" onPress={(event) => event.stopPropagation()}
          >
            <View className="relative">
              <View className="absolute inset-0 translate-x-2 translate-y-2 rounded-3xl bg-ink" />
              <View className="overflow-hidden rounded-3xl border-[3px] border-ink bg-white">
                <View
                  className={
                    feedback?.kind === 'error'
                      ? 'items-center border-b-[3px] border-ink bg-pink px-5 py-4'
                      : 'items-center border-b-[3px] border-ink bg-lime px-5 py-4'
                  }
                >
                  <Text className="font-display text-xs uppercase tracking-[3px] text-ink">
                    {feedback?.kind === 'error' ? 'Ups, algo falló' : 'Operación exitosa'}
                  </Text>
                </View>
                <View className="items-center px-5 pb-6 pt-2">
                  <NeoLottie
                    name={feedback?.kind === 'error' ? 'register' : feedback?.animation ?? 'success'}
                    className="h-36 w-36"
                    loop={false}
                  />
                  <Text className="text-center font-display text-xl text-ink">
                    {feedback?.title}
                  </Text>
                  {feedback?.message ? (
                    <Text className="mt-2 text-center text-sm leading-5 text-muted">
                      {feedback.message}
                    </Text>
                  ) : null}
                  <View className="mt-5 w-full">
                    <NeoButton
                      label={feedback?.kind === 'error' ? 'Entendido' : 'Genial'}
                      variant={feedback?.kind === 'error' ? 'pink' : 'lime'}
                      onPress={hide}
                    />
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextValue {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
  return context;
}

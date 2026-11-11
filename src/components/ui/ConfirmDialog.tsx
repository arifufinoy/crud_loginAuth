import React from 'react';
import { Modal, Text, View } from 'react-native';

import { NeoLottie } from '@/components/NeoLottie';
import { NeoButton } from '@/components/ui/NeoButton';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-ink/70 px-6">
        <View className="w-full max-w-md">
          <View className="relative">
            <View className="absolute inset-0 translate-x-2 translate-y-2 rounded-3xl bg-ink" />
            <View className="overflow-hidden rounded-3xl border-[3px] border-ink bg-white">
              <View className="items-center border-b-[3px] border-ink bg-pink px-4 py-3">
                <Text className="font-display text-xs uppercase tracking-[2px] text-ink">
                  Confirmación
                </Text>
              </View>
              <View className="items-center px-5 pb-6 pt-2">
                <NeoLottie name="emptyProjects" className="h-28 w-28" loop />
                <Text className="text-center font-display text-lg uppercase text-ink">{title}</Text>
                <Text className="mt-2 text-center text-sm leading-5 text-muted">{message}</Text>
                <View className="mt-5 w-full flex-row gap-3">
                  <View className="flex-1">
                    <NeoButton label={cancelLabel} variant="white" size="sm" onPress={onCancel} />
                  </View>
                  <View className="flex-1">
                    <NeoButton
                      label={confirmLabel}
                      variant="pink"
                      size="sm"
                      loading={loading}
                      onPress={onConfirm}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

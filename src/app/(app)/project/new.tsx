import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { ProjectForm } from '@/components/forms/ProjectForm';
import { NeoHeader } from '@/components/ui/NeoHeader';
import { Screen } from '@/components/ui/Screen';
import { useFeedback } from '@/context/feedback-context';
import { createProject } from '@/services/projects';
import type { ProjectInput } from '@/types';
import { getErrorMessage } from '@/utils/errors';

export default function NewProjectScreen() {
  const { showSuccess } = useFeedback();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (input: ProjectInput) => {
    setLoading(true);
    setError('');
    try {
      const project = await createProject(input);
      showSuccess('Proyecto creado', 'Ya está guardado en Supabase.');
      router.replace({ pathname: '/project/[id]', params: { id: project.id } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View className="w-full max-w-xl self-center">
        <NeoHeader title="Nuevo proyecto" subtitle="Define el objetivo y su fecha límite" />
        <View className="mb-4 rounded-xl border-[3px] border-ink bg-cream px-3 py-2.5">
          <Text className="font-display text-[10px] uppercase tracking-wider text-ink">
            Tip académico
          </Text>
          <Text className="mt-0.5 text-xs leading-4 text-ink/70">
            Usa un título corto y una descripción con el entregable concreto. Después podrás crear
            tareas dentro del proyecto.
          </Text>
        </View>
        <ProjectForm submitLabel="Crear proyecto" loading={loading} serverError={error} onSubmit={submit} />
      </View>
    </Screen>
  );
}

import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { TaskForm } from '@/components/forms/TaskForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState, LoadingScreen } from '@/components/ui/Loading';
import { NeoHeader } from '@/components/ui/NeoHeader';
import { Screen } from '@/components/ui/Screen';
import { useFeedback } from '@/context/feedback-context';
import { createTask, getProjects } from '@/services/projects';
import type { Project, TaskInput } from '@/types';
import { getErrorMessage } from '@/utils/errors';

export default function NewTaskScreen() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const { showSuccess } = useFeedback();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getProjects()
      .then((data) => mounted && setProjects(data))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const submit = async (input: TaskInput) => {
    setSaving(true);
    setError('');
    try {
      await createTask(input);
      showSuccess(
        'Tarea creada',
        'Quedó guardada en Supabase y vinculada al proyecto.',
        'taskCreated',
      );
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen label="Preparando la tarea..." />;

  return (
    <Screen>
      <View className="w-full max-w-xl self-center">
        <NeoHeader title="Nueva tarea" subtitle="Asígnala a uno de tus proyectos" />

        {projects.length === 0 ? (
          <EmptyState
            title="Primero crea un proyecto"
            description="Las tareas siempre viven dentro de un proyecto. Crea uno para continuar."
            animation="emptyProjects"
            actionLabel="Crear proyecto"
            onAction={() => router.replace('/(app)/project/new')}
          />
        ) : (
          <>
            {error ? (
              <View className="mb-4">
                <ErrorState message={error} />
              </View>
            ) : null}
            <View className="mb-4 rounded-xl border-[3px] border-ink bg-cream px-3 py-2.5">
              <Text className="font-display text-[10px] uppercase tracking-wider text-ink">
                Prioriza bien
              </Text>
              <Text className="mt-0.5 text-xs leading-4 text-ink/70">
                Usa prioridad alta solo para entregas cercanas. Las tareas completadas alimentan tus
                estadísticas.
              </Text>
            </View>
            <TaskForm
              projects={projects}
              initial={{ project_id: projectId ?? projects[0]?.id }}
              submitLabel="Crear tarea"
              loading={saving}
              serverError={error}
              onSubmit={submit}
            />
          </>
        )}
      </View>
    </Screen>
  );
}

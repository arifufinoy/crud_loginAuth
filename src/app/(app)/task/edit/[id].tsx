import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { TaskForm } from '@/components/forms/TaskForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState, LoadingScreen } from '@/components/ui/Loading';
import { NeoHeader } from '@/components/ui/NeoHeader';
import { Screen } from '@/components/ui/Screen';
import { useFeedback } from '@/context/feedback-context';
import { getProjects, getTask, updateTask } from '@/services/projects';
import type { Project, TaskInput, TaskWithProject } from '@/types';
import { getErrorMessage } from '@/utils/errors';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showSuccess } = useFeedback();
  const [task, setTask] = useState<TaskWithProject | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(id ? '' : 'Tarea no válida.');

  useEffect(() => {
    let mounted = true;
    if (!id) return;

    Promise.all([getTask(id), getProjects()])
      .then(([nextTask, nextProjects]) => {
        if (!mounted) return;
        if (!nextTask) setError('La tarea no existe o no tienes acceso.');
        setTask(nextTask);
        setProjects(nextProjects);
      })
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  const submit = async (input: TaskInput) => {
    if (!task) return;
    setSaving(true);
    setError('');
    try {
      await updateTask(task.id, input);
      showSuccess('Tarea actualizada', 'Los cambios se guardaron en Supabase.');
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen label="Cargando tarea..." />;

  return (
    <Screen>
      <View className="w-full max-w-xl self-center">
        <NeoHeader title="Editar tarea" subtitle={task?.title} />
        {!task || projects.length === 0 ? (
          <EmptyState
            title="Tarea no disponible"
            description={error || 'No se pudo cargar la tarea o sus proyectos.'}
            animation="emptyTasks"
            actionLabel="Volver"
            onAction={() => router.back()}
          />
        ) : (
          <>
            {error ? (
              <View className="mb-4">
                <ErrorState message={error} />
              </View>
            ) : null}
            <TaskForm
              key={task.id}
              projects={projects}
              initial={{
                project_id: task.project_id,
                title: task.title,
                description: task.description ?? '',
                status: task.status,
                priority: task.priority,
                due_date: task.due_date,
              }}
              submitLabel="Guardar cambios"
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

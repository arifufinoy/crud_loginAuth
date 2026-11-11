import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ProjectForm } from '@/components/forms/ProjectForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState, LoadingScreen } from '@/components/ui/Loading';
import { NeoHeader } from '@/components/ui/NeoHeader';
import { Screen } from '@/components/ui/Screen';
import { useFeedback } from '@/context/feedback-context';
import { getProject, updateProject } from '@/services/projects';
import type { Project, ProjectInput } from '@/types';
import { getErrorMessage } from '@/utils/errors';

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showSuccess } = useFeedback();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(id ? '' : 'Proyecto no válido.');

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    getProject(id)
      .then((data) => {
        if (!mounted) return;
        if (!data) setError('El proyecto no existe o no tienes acceso.');
        setProject(data);
      })
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const submit = async (input: ProjectInput) => {
    if (!project) return;
    setSaving(true);
    setError('');
    try {
      await updateProject(project.id, input);
      showSuccess('Proyecto actualizado', 'Los cambios se guardaron en Supabase.');
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen label="Cargando proyecto..." />;

  return (
    <Screen>
      <View className="w-full max-w-xl self-center">
        <NeoHeader title="Editar proyecto" subtitle={project?.title} />
        {!project ? (
          <EmptyState
            title="Proyecto no disponible"
            description={error || 'No se pudo cargar el proyecto.'}
            animation="emptyProjects"
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
            <ProjectForm
              key={project.id}
              initial={{
                title: project.title,
                description: project.description ?? '',
                status: project.status,
                start_date: project.start_date,
                deadline: project.deadline,
              }}
              submitLabel="Guardar cambios"
              loading={saving}
              onSubmit={submit}
            />
          </>
        )}
      </View>
    </Screen>
  );
}

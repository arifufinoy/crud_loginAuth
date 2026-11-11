import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { NeoLottie } from '@/components/NeoLottie';
import { SectionTitle } from '@/components/StatCard';
import { TaskCard } from '@/components/TaskCard';
import { ProjectStatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState, LoadingScreen } from '@/components/ui/Loading';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoHeader } from '@/components/ui/NeoHeader';
import { Screen } from '@/components/ui/Screen';
import { useFeedback } from '@/context/feedback-context';
import { useProject } from '@/hooks/use-project';
import { deleteProject, deleteTask, updateTaskStatus } from '@/services/projects';
import type { TaskWithProject } from '@/types';
import { formatDate } from '@/utils/dates';
import { getErrorMessage } from '@/utils/errors';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { project, tasks, loading, error, reload } = useProject(id);
  const { showSuccess, showError } = useFeedback();
  const [confirmProject, setConfirmProject] = useState(false);
  const [toDeleteTask, setToDeleteTask] = useState<TaskWithProject | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <LoadingScreen label="Abriendo proyecto..." />;

  if (!project) {
    return (
      <Screen>
        <View className="w-full max-w-xl self-center">
          <NeoHeader title="Proyecto" subtitle="No disponible" />
          <EmptyState
            title="Proyecto no disponible"
            description={error || 'No se encontró el proyecto o no tienes acceso.'}
            animation="emptyProjects"
            actionLabel="Volver a proyectos"
            onAction={() => router.replace('/(app)/(tabs)/projects')}
          />
        </View>
      </Screen>
    );
  }

  const completed = tasks.filter((task) => task.status === 'completed').length;
  const progress = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  const toggleTask = async (task: TaskWithProject) => {
    setBusyId(task.id);
    try {
      await updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed');
      reload();
    } catch (err) {
      showError('No se pudo actualizar', getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const removeProject = async () => {
    setDeleting(true);
    try {
      await deleteProject(project.id);
      setConfirmProject(false);
      showSuccess('Proyecto eliminado', 'También se eliminaron sus tareas asociadas.');
      router.replace('/(app)/(tabs)/projects');
    } catch (err) {
      showError('No se pudo eliminar', getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const removeTask = async () => {
    if (!toDeleteTask) return;
    setDeleting(true);
    try {
      await deleteTask(toDeleteTask.id);
      setToDeleteTask(null);
      reload();
      showSuccess('Tarea eliminada', 'La tarea se borró de Supabase.');
    } catch (err) {
      showError('No se pudo eliminar', getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Screen>
      <View className="w-full max-w-2xl self-center">
        <NeoHeader
          title="Detalle"
          subtitle={project.title}
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar proyecto"
              onPress={() =>
                router.push({ pathname: '/project/edit/[id]', params: { id: project.id } })
              }
              className="h-11 w-11 items-center justify-center rounded-xl border-[3px] border-ink bg-sky active:translate-x-0.5 active:translate-y-0.5">
              <Text className="font-display text-base text-ink">✎</Text>
            </Pressable>
          }
        />

        <View className="relative mb-5">
          <View className="absolute inset-0 translate-x-2 translate-y-2 rounded-3xl bg-ink" />
          <View className="overflow-hidden rounded-3xl border-[3px] border-ink bg-white">
            <View className="flex-row items-start gap-3 bg-lime p-4">
              <View className="flex-1">
                <Text className="font-display text-[9px] uppercase tracking-[2px] text-ink/60">
                  Proyecto académico
                </Text>
                <Text className="mt-1 font-display text-xl uppercase leading-6 text-ink">
                  {project.title}
                </Text>
                <View className="mt-2 flex-row">
                  <ProjectStatusBadge status={project.status} />
                </View>
              </View>
              <NeoLottie name="dashboard" className="h-20 w-20" />
            </View>

            <View className="gap-3 p-4">
              <Text className="text-sm leading-5 text-ink/80">
                {project.description?.trim() || 'Sin descripción. Edita el proyecto para agregar una.'}
              </Text>

              <View className="flex-row gap-2">
                <View className="flex-1 rounded-lg border-2 border-ink bg-cream px-2.5 py-2">
                  <Text className="font-display text-[8px] uppercase tracking-wider text-muted">
                    Inicio
                  </Text>
                  <Text className="mt-0.5 text-xs font-medium text-ink">
                    {formatDate(project.start_date)}
                  </Text>
                </View>
                <View className="flex-1 rounded-lg border-2 border-ink bg-pink px-2.5 py-2">
                  <Text className="font-display text-[8px] uppercase tracking-wider text-ink/60">
                    Fecha límite
                  </Text>
                  <Text className="mt-0.5 text-xs font-medium text-ink">
                    {formatDate(project.deadline)}
                  </Text>
                </View>
              </View>

              <View>
                <View className="mb-1 flex-row justify-between">
                  <Text className="font-display text-[9px] uppercase tracking-wider text-ink">
                    Avance de tareas
                  </Text>
                  <Text className="font-display text-[9px] text-ink">
                    {completed}/{tasks.length} · {progress}%
                  </Text>
                </View>
                <View className="h-5 overflow-hidden rounded-md border-[3px] border-ink bg-white">
                  <View className="h-full bg-lime" style={{ width: `${progress}%` }} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {error ? (
          <View className="mb-4">
            <ErrorState message={error} />
          </View>
        ) : null}

        <View className="mb-5 flex-row gap-2">
          <View className="flex-1">
            <NeoButton
              label="Nueva tarea"
              variant="lime"
              size="sm"
              onPress={() =>
                router.push({ pathname: '/task/new', params: { projectId: project.id } })
              }
            />
          </View>
          <View className="flex-1">
            <NeoButton
              label="Editar"
              variant="sky"
              size="sm"
              onPress={() =>
                router.push({ pathname: '/project/edit/[id]', params: { id: project.id } })
              }
            />
          </View>
          <View className="flex-1">
            <NeoButton
              label="Eliminar"
              variant="pink"
              size="sm"
              onPress={() => setConfirmProject(true)}
            />
          </View>
        </View>

        <SectionTitle title={`Tareas (${tasks.length})`} />
        {tasks.length === 0 ? (
          <EmptyState
            title="Sin tareas en este proyecto"
            description="Agrega la primera tarea para empezar a medir el avance."
            animation="emptyTasks"
            actionLabel="Crear tarea"
            onAction={() =>
              router.push({ pathname: '/task/new', params: { projectId: project.id } })
            }
            compact
          />
        ) : (
          <View className="gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={{ ...task, project: { id: project.id, title: project.title } }}
                busy={busyId === task.id}
                onToggle={toggleTask}
                onDelete={setToDeleteTask}
              />
            ))}
          </View>
        )}

        <NeoCard className="mt-5" bodyClassName="bg-cream p-3">
          <Text className="text-[10px] leading-4 text-muted">
            Creado el {formatDate(project.created_at.slice(0, 10))}. Los cambios se guardan
            directamente en Supabase y están protegidos por RLS.
          </Text>
        </NeoCard>
      </View>

      <ConfirmDialog
        visible={confirmProject}
        title="¿Eliminar proyecto?"
        message={`"${project.title}" y todas sus tareas se borrarán de Supabase. Esta acción no se puede deshacer.`}
        loading={deleting}
        onConfirm={removeProject}
        onCancel={() => setConfirmProject(false)}
      />

      <ConfirmDialog
        visible={!!toDeleteTask}
        title="¿Eliminar tarea?"
        message={`"${toDeleteTask?.title ?? ''}" se borrará permanentemente.`}
        loading={deleting}
        onConfirm={removeTask}
        onCancel={() => setToDeleteTask(null)}
      />
    </Screen>
  );
}

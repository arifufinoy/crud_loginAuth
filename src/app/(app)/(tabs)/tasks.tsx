import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';

import { TaskCard } from '@/components/TaskCard';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState, InlineLoader } from '@/components/ui/Loading';
import { NeoInput } from '@/components/ui/NeoInput';
import { Screen } from '@/components/ui/Screen';
import { useFeedback } from '@/context/feedback-context';
import { useTasks, type TaskFilter } from '@/hooks/use-tasks';
import { deleteTask } from '@/services/projects';
import type { TaskWithProject } from '@/types';
import { getErrorMessage } from '@/utils/errors';

const FILTERS: { value: TaskFilter; label: string; tone: 'lime' | 'yellow' | 'sky' }[] = [
  { value: 'all', label: 'Todas', tone: 'lime' },
  { value: 'pending', label: 'Pendientes', tone: 'yellow' },
  { value: 'in_progress', label: 'En curso', tone: 'sky' },
  { value: 'completed', label: 'Completadas', tone: 'lime' },
];

export default function TasksScreen() {
  const {
    tasks,
    allTasks,
    loading,
    refreshing,
    error,
    filter,
    setFilter,
    search,
    setSearch,
    busyId,
    toggleStatus,
    refresh,
    reload,
  } = useTasks();
  const { showSuccess, showError } = useFeedback();
  const [toDelete, setToDelete] = useState<TaskWithProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteTask(toDelete.id);
      setToDelete(null);
      reload();
      showSuccess('Tarea eliminada', 'La tarea se eliminó de Supabase.');
    } catch (err) {
      showError('No se pudo eliminar', getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Screen
      tabBar
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor="#111111"
          colors={['#111111']}
        />
      }>
      <View className="w-full max-w-2xl self-center">
        <View className="mb-4 flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="font-display text-[9px] uppercase tracking-[3px] text-muted">
              {allTasks.filter((task) => task.status !== 'completed').length} por cerrar
            </Text>
            <Text className="mt-0.5 font-display text-2xl uppercase tracking-tight text-ink">
              Tareas
            </Text>
            <Text className="mt-0.5 text-xs text-muted">Marca, edita y prioriza.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Crear tarea"
            onPress={() => router.push('/(app)/task/new')}
            className="h-12 w-12 items-center justify-center rounded-xl border-[3px] border-ink bg-sky active:translate-x-0.5 active:translate-y-0.5">
            <Text className="font-display text-2xl leading-7 text-ink">+</Text>
          </Pressable>
        </View>

        <View className="mb-3">
          <NeoInput
            label="Buscar tarea"
            placeholder="Título o proyecto..."
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <ChipGroup label="Estado" options={FILTERS} value={filter} onChange={setFilter} />
        </View>

        {error ? (
          <View className="mb-4">
            <ErrorState message={error} />
          </View>
        ) : null}

        {loading ? (
          <InlineLoader label="Cargando tareas..." />
        ) : tasks.length === 0 ? (
          <EmptyState
            title={allTasks.length === 0 ? 'Sin tareas todavía' : 'Sin coincidencias'}
            description={
              allTasks.length === 0
                ? 'Crea tu primera tarea y asígnala a un proyecto para no perder ninguna entrega.'
                : 'Cambia el filtro o limpia la búsqueda para ver más tareas.'
            }
            animation="emptyTasks"
            actionLabel={allTasks.length === 0 ? 'Crear tarea' : 'Limpiar filtros'}
            onAction={() => {
              if (allTasks.length === 0) router.push('/(app)/task/new');
              else {
                setFilter('all');
                setSearch('');
              }
            }}
          />
        ) : (
          <View className="gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                busy={busyId === task.id}
                onToggle={toggleStatus}
                onDelete={setToDelete}
              />
            ))}
          </View>
        )}
      </View>

      <ConfirmDialog
        visible={!!toDelete}
        title="¿Eliminar tarea?"
        message={`"${toDelete?.title ?? ''}" se borrará permanentemente de Supabase. Esta acción no se puede deshacer.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Screen>
  );
}

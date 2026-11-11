import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';

import { NeoLottie } from '@/components/NeoLottie';
import { ProjectCard } from '@/components/ProjectCard';
import { SectionTitle, StatCard } from '@/components/StatCard';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState, LoadingScreen } from '@/components/ui/Loading';
import { NeoButton } from '@/components/ui/NeoButton';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/context/auth-context';
import { useDashboard } from '@/hooks/use-dashboard';
import { updateTaskStatus } from '@/services/projects';
import type { TaskWithProject } from '@/types';
import { formatTimeGreeting, initialsFromName } from '@/utils/dates';

export default function DashboardScreen() {
  const { displayName, signOut } = useAuth();
  const { stats, projects, tasks, loading, refreshing, error, refresh, reload } = useDashboard();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (loading) return <LoadingScreen label="Cargando tu dashboard..." />;

  const pending = tasks
    .filter((task) => task.status !== 'completed')
    .sort((a, b) => {
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return b.created_at.localeCompare(a.created_at);
    })
    .slice(0, 3);

  const toggleTask = async (task: TaskWithProject) => {
    setBusyId(task.id);
    try {
      await updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed');
      reload();
    } finally {
      setBusyId(null);
    }
  };

  const today = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

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
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="font-display text-[9px] uppercase tracking-[3px] text-muted">
              Acadex · {today}
            </Text>
            <Text className="mt-0.5 font-display text-lg uppercase tracking-tight text-ink">
              {formatTimeGreeting()}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
            onPress={() => router.push('/(app)/(tabs)/profile')}
            className="h-12 w-12 items-center justify-center rounded-xl border-[3px] border-ink bg-pink active:translate-x-0.5 active:translate-y-0.5">
            <Text className="font-display text-sm text-ink">{initialsFromName(displayName)}</Text>
          </Pressable>
        </View>

        <View className="relative mb-5">
          <View className="absolute inset-0 translate-x-2 translate-y-2 rounded-3xl bg-ink" />
          <View className="flex-row items-center overflow-hidden rounded-3xl border-[3px] border-ink bg-ink px-4 py-4">
            <View className="flex-1">
              <Text className="font-display text-[9px] uppercase tracking-[2px] text-lime">
                Tu espacio de trabajo
              </Text>
              <Text className="mt-1 font-display text-2xl uppercase leading-7 text-white">
                Hola, {displayName.split(' ')[0]}
              </Text>
              <Text className="mt-1.5 text-xs leading-4 text-white/70">
                Tienes {stats.pendingTasks} tareas pendientes y {stats.activeProjects} proyectos
                activos. ¡A darle!
              </Text>
              <View className="mt-3 flex-row items-center gap-2">
                <View className="rounded-md border-2 border-lime bg-lime px-2 py-0.5">
                  <Text className="font-display text-[9px] uppercase tracking-wider text-ink">
                    {stats.completedTasks} completadas
                  </Text>
                </View>
                <Pressable onPress={() => router.push('/(app)/(tabs)/tasks')}>
                  <Text className="font-display text-[9px] uppercase tracking-wider text-white underline">
                    Ver tareas →
                  </Text>
                </Pressable>
              </View>
            </View>
            <NeoLottie name="dashboard" className="h-32 w-32" />
          </View>
        </View>

        {error ? (
          <View className="mb-4">
            <ErrorState message={error} />
          </View>
        ) : null}

        <View className="mb-2 flex-row gap-3">
          <StatCard label="Proyectos" value={stats.totalProjects} tone="lime" caption="Totales" />
          <StatCard label="Activos" value={stats.activeProjects} tone="sky" caption="En marcha" />
        </View>
        <View className="mb-5 flex-row gap-3">
          <StatCard label="Pendientes" value={stats.pendingTasks} tone="yellow" caption="Tareas" />
          <StatCard label="Completadas" value={stats.completedTasks} tone="pink" caption="Tareas" />
        </View>

        <View className="mb-5 flex-row gap-3">
          <View className="flex-1">
            <NeoButton
              label="Nuevo proyecto"
              variant="lime"
              size="sm"
              onPress={() => router.push('/(app)/project/new')}
            />
          </View>
          <View className="flex-1">
            <NeoButton
              label="Nueva tarea"
              variant="sky"
              size="sm"
              onPress={() => router.push('/(app)/task/new')}
            />
          </View>
        </View>

        <SectionTitle
          title="Proyectos recientes"
          actionLabel="Ver todos"
          onAction={() => router.push('/(app)/(tabs)/projects')}
        />
        {projects.length === 0 ? (
          <EmptyState
            title="Sin proyectos todavía"
            description="Crea tu primer proyecto académico y empieza a organizar tus entregas."
            animation="emptyProjects"
            actionLabel="Crear proyecto"
            onAction={() => router.push('/(app)/project/new')}
            compact
          />
        ) : (
          <View className="gap-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </View>
        )}

        <View className="mt-6">
          <SectionTitle
            title="Próximas tareas"
            actionLabel="Ver todas"
            onAction={() => router.push('/(app)/(tabs)/tasks')}
          />
          {pending.length === 0 ? (
            <EmptyState
              title="Todo al día"
              description="No tienes tareas pendientes. Crea una nueva o revisa tus proyectos."
              animation="emptyTasks"
              actionLabel="Crear tarea"
              onAction={() => router.push('/(app)/task/new')}
              compact
            />
          ) : (
            <View className="gap-3">
              {pending.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  busy={busyId === task.id}
                  onToggle={toggleTask}
                />
              ))}
            </View>
          )}
        </View>

        <View className="mt-6 flex-row items-center justify-center gap-2">
          <Text className="text-[10px] uppercase tracking-widest text-muted">Sesión segura</Text>
          <Pressable onPress={signOut} hitSlop={8}>
            <Text className="font-display text-[10px] uppercase tracking-wider text-ink underline">
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

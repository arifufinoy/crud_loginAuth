import { router } from 'expo-router';
import React from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';

import { ProjectCard } from '@/components/ProjectCard';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState, InlineLoader } from '@/components/ui/Loading';
import { NeoInput } from '@/components/ui/NeoInput';
import { Screen } from '@/components/ui/Screen';
import { useProjects, type ProjectFilter } from '@/hooks/use-projects';

const FILTERS: { value: ProjectFilter; label: string; tone: 'white' | 'lime' | 'yellow' | 'sky' | 'violet' }[] = [
  { value: 'all', label: 'Todos', tone: 'lime' },
  { value: 'active', label: 'Activos', tone: 'lime' },
  { value: 'paused', label: 'En pausa', tone: 'yellow' },
  { value: 'completed', label: 'Completados', tone: 'sky' },
  { value: 'archived', label: 'Archivados', tone: 'violet' },
];

export default function ProjectsScreen() {
  const {
    projects,
    allProjects,
    loading,
    refreshing,
    error,
    filter,
    setFilter,
    search,
    setSearch,
    refresh,
  } = useProjects();

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
              {allProjects.length} registrados
            </Text>
            <Text className="mt-0.5 font-display text-2xl uppercase tracking-tight text-ink">
              Proyectos
            </Text>
            <Text className="mt-0.5 text-xs text-muted">Filtra, busca y entra al detalle.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Crear proyecto"
            onPress={() => router.push('/(app)/project/new')}
            className="h-12 w-12 items-center justify-center rounded-xl border-[3px] border-ink bg-lime active:translate-x-0.5 active:translate-y-0.5">
            <Text className="font-display text-2xl leading-7 text-ink">+</Text>
          </Pressable>
        </View>

        <View className="mb-3">
          <NeoInput
            label="Buscar proyecto"
            placeholder="Título o descripción..."
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
          <InlineLoader label="Buscando proyectos..." />
        ) : projects.length === 0 ? (
          <EmptyState
            title={allProjects.length === 0 ? 'Aún no hay proyectos' : 'Sin coincidencias'}
            description={
              allProjects.length === 0
                ? 'Crea un proyecto para agrupar tus tareas, fechas y entregas.'
                : 'Prueba con otro estado o limpia la búsqueda.'
            }
            animation="projectsEmpty"
            actionLabel={allProjects.length === 0 ? 'Crear proyecto' : 'Limpiar filtros'}
            onAction={() => {
              if (allProjects.length === 0) router.push('/(app)/project/new');
              else {
                setFilter('all');
                setSearch('');
              }
            }}
          />
        ) : (
          <View className="gap-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

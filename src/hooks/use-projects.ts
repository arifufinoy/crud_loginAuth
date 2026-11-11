import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import { getProjects } from '@/services/projects';
import type { Project, ProjectStatus } from '@/types';
import { getErrorMessage } from '@/utils/errors';

export type ProjectFilter = 'all' | ProjectStatus;

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [search, setSearch] = useState('');
  const hasLoaded = useRef(false);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (!hasLoaded.current) setLoading(true);
    else if (mode === 'refresh') setRefreshing(true);
    setError('');
    try {
      setProjects(await getProjects());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      hasLoaded.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load('initial');
    }, [load]),
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesFilter = filter === 'all' || project.status === filter;
      const matchesSearch =
        !term ||
        project.title.toLowerCase().includes(term) ||
        (project.description ?? '').toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [projects, filter, search]);

  return {
    projects: filtered,
    allProjects: projects,
    loading,
    refreshing,
    error,
    filter,
    setFilter,
    search,
    setSearch,
    refresh: () => load('refresh'),
    reload: () => load('initial'),
  };
}

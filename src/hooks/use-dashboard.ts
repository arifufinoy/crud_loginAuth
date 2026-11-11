import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { getDashboardStats, getRecentProjects, getTasks } from '@/services/projects';
import type { DashboardStats, Project, TaskWithProject } from '@/types';
import { getErrorMessage } from '@/utils/errors';

const EMPTY_STATS: DashboardStats = {
  totalProjects: 0,
  activeProjects: 0,
  pendingTasks: 0,
  completedTasks: 0,
};

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const hasLoaded = useRef(false);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (!hasLoaded.current) setLoading(true);
    else if (mode === 'refresh') setRefreshing(true);
    setError('');
    try {
      const [nextStats, nextProjects, nextTasks] = await Promise.all([
        getDashboardStats(),
        getRecentProjects(4),
        getTasks(),
      ]);
      setStats(nextStats);
      setProjects(nextProjects);
      setTasks(nextTasks);
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

  return {
    stats,
    projects,
    tasks,
    loading,
    refreshing,
    error,
    refresh: () => load('refresh'),
    reload: () => load('initial'),
  };
}

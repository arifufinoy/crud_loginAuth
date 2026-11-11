import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import { getTasks, updateTaskStatus } from '@/services/projects';
import type { TaskStatus, TaskWithProject } from '@/types';
import { getErrorMessage } from '@/utils/errors';

export type TaskFilter = 'all' | TaskStatus;

export function useTasks(projectId?: string) {
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!hasLoaded.current) setLoading(true);
      else if (mode === 'refresh') setRefreshing(true);
      setError('');
      try {
        setTasks(await getTasks(projectId));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        hasLoaded.current = true;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [projectId],
  );

  useFocusEffect(
    useCallback(() => {
      load('initial');
    }, [load]),
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch =
        !term ||
        task.title.toLowerCase().includes(term) ||
        (task.project?.title ?? '').toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  const toggleStatus = useCallback(
    async (task: TaskWithProject) => {
      const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
      setBusyId(task.id);
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item)),
      );
      try {
        await updateTaskStatus(task.id, nextStatus);
      } catch (err) {
        setTasks((current) =>
          current.map((item) => (item.id === task.id ? { ...item, status: task.status } : item)),
        );
        setError(getErrorMessage(err));
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  return {
    tasks: filtered,
    allTasks: tasks,
    loading,
    refreshing,
    error,
    filter,
    setFilter,
    search,
    setSearch,
    busyId,
    toggleStatus,
    refresh: () => load('refresh'),
    reload: () => load('initial'),
  };
}

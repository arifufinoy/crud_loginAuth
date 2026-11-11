import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { getProject, getProjectTasks } from '@/services/projects';
import type { Project, Task } from '@/types';
import { getErrorMessage } from '@/utils/errors';

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const hasLoaded = useRef(false);

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!id) {
        setLoading(false);
        setError('Proyecto no válido.');
        return;
      }
      if (!hasLoaded.current) setLoading(true);
      else if (mode === 'refresh') setRefreshing(true);
      setError('');
      try {
        const [nextProject, nextTasks] = await Promise.all([getProject(id), getProjectTasks(id)]);
        if (!nextProject) {
          setError('El proyecto no existe o no tienes acceso.');
          setProject(null);
          setTasks([]);
          return;
        }
        setProject(nextProject);
        setTasks(nextTasks);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        hasLoaded.current = true;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useFocusEffect(
    useCallback(() => {
      load('initial');
    }, [load]),
  );

  return {
    project,
    tasks,
    loading,
    refreshing,
    error,
    refresh: () => load('refresh'),
    reload: () => load('initial'),
  };
}

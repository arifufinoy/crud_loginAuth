import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { TaskPriorityBadge, TaskStatusBadge } from '@/components/ui/Badge';
import { NeoCard } from '@/components/ui/NeoCard';
import type { TaskWithProject } from '@/types';
import { cn } from '@/utils/cn';
import { formatDate, isOverdue } from '@/utils/dates';

interface TaskCardProps {
  task: TaskWithProject;
  onToggle?: (task: TaskWithProject) => void;
  onDelete?: (task: TaskWithProject) => void;
  busy?: boolean;
}

export function TaskCard({ task, onToggle, onDelete, busy }: TaskCardProps) {
  const completed = task.status === 'completed';
  const overdue = !completed && isOverdue(task.due_date);

  return (
    <NeoCard bodyClassName="overflow-hidden" offset="sm">
      <View className="flex-row">
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: completed, busy }}
          accessibilityLabel={completed ? 'Marcar como pendiente' : 'Marcar como completada'}
          disabled={busy || !onToggle}
          onPress={() => onToggle?.(task)}
          className={cn(
            'w-14 items-center justify-center border-r-[3px] border-ink',
            completed ? 'bg-lime' : 'bg-cream',
          )}>
          <View
            className={cn(
              'h-7 w-7 items-center justify-center rounded-md border-[3px] border-ink',
              completed ? 'bg-ink' : 'bg-white',
            )}>
            {completed ? <Text className="font-display text-sm text-lime">✓</Text> : null}
          </View>
        </Pressable>

        <View className="flex-1 gap-2 p-3">
          <View className="flex-row items-start justify-between gap-2">
            <Pressable
              className="flex-1"
              onPress={() => router.push({ pathname: '/task/edit/[id]', params: { id: task.id } })}>
              <Text
                className={cn(
                  'font-display text-sm uppercase leading-5',
                  completed ? 'text-muted line-through' : 'text-ink',
                )}
                numberOfLines={2}>
                {task.title}
              </Text>
              <Text className="mt-0.5 text-[10px] uppercase tracking-wider text-muted" numberOfLines={1}>
                {task.project?.title ?? 'Proyecto'}
              </Text>
            </Pressable>
            {onDelete ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Eliminar tarea"
                onPress={() => onDelete(task)}
                className="h-8 w-8 items-center justify-center rounded-md border-2 border-ink bg-white active:bg-pink">
                <Text className="font-display text-xs text-ink">✕</Text>
              </Pressable>
            ) : null}
          </View>

          <View className="flex-row flex-wrap items-center gap-1.5">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
            <View
              className={cn(
                'rounded-md border-2 border-ink px-2 py-0.5',
                overdue ? 'bg-danger' : 'bg-white',
              )}>
              <Text
                className={cn(
                  'font-display text-[9px] uppercase tracking-[1px]',
                  overdue ? 'text-white' : 'text-ink',
                )}>
                {overdue ? 'Vencida · ' : ''}
                {formatDate(task.due_date)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </NeoCard>
  );
}

import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Badge, ProjectStatusBadge } from '@/components/ui/Badge';
import { NeoCard } from '@/components/ui/NeoCard';
import type { Project } from '@/types';
import { cn } from '@/utils/cn';
import { formatDate, isOverdue } from '@/utils/dates';

const STATUS_BAND: Record<Project['status'], string> = {
  active: 'bg-lime',
  paused: 'bg-yellow',
  completed: 'bg-sky',
  archived: 'bg-violet',
};

export function ProjectCard({ project, className }: { project: Project; className?: string }) {
  const overdue = project.deadline ? isOverdue(project.deadline) && project.status !== 'completed' : false;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })}
      className={cn('active:translate-x-0.5 active:translate-y-0.5', className)}>
      <NeoCard bodyClassName="overflow-hidden">
        <View className={cn('h-2.5 w-full border-b-[3px] border-ink', STATUS_BAND[project.status])} />
        <View className="gap-2 p-4">
          <View className="flex-row items-start justify-between gap-2">
            <Text
              className="flex-1 font-display text-base uppercase leading-5 text-ink"
              numberOfLines={2}>
              {project.title}
            </Text>
            <ProjectStatusBadge status={project.status} />
          </View>

          {project.description ? (
            <Text className="text-xs leading-4 text-muted" numberOfLines={2}>
              {project.description}
            </Text>
          ) : null}

          <View className="mt-1 flex-row items-center justify-between">
            <Badge
              label={overdue ? 'Vencido' : formatDate(project.deadline)}
              tone={overdue ? 'pink' : 'white'}
            />
            <Text className="font-display text-[10px] uppercase tracking-wider text-ink">
              Ver detalle →
            </Text>
          </View>
        </View>
      </NeoCard>
    </Pressable>
  );
}

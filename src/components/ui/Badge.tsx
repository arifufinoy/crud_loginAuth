import React from 'react';
import { Text, View } from 'react-native';

import type { ProjectStatus, TaskPriority, TaskStatus } from '@/types';
import { PROJECT_STATUS_LABEL, TASK_PRIORITY_LABEL, TASK_STATUS_LABEL } from '@/types';
import { cn } from '@/utils/cn';

type BadgeTone = 'lime' | 'sky' | 'pink' | 'yellow' | 'violet' | 'mint' | 'white' | 'ink';

const TONES: Record<BadgeTone, { bg: string; text: string }> = {
  lime: { bg: 'bg-lime', text: 'text-ink' },
  sky: { bg: 'bg-sky', text: 'text-ink' },
  pink: { bg: 'bg-pink', text: 'text-ink' },
  yellow: { bg: 'bg-yellow', text: 'text-ink' },
  violet: { bg: 'bg-violet', text: 'text-ink' },
  mint: { bg: 'bg-mint', text: 'text-ink' },
  white: { bg: 'bg-white', text: 'text-ink' },
  ink: { bg: 'bg-ink', text: 'text-white' },
};

export function Badge({
  label,
  tone = 'white',
  className,
}: {
  label: string;
  tone?: BadgeTone;
  className?: string;
}) {
  const palette = TONES[tone];
  return (
    <View
      className={cn(
        'rounded-md border-2 border-ink px-2 py-0.5',
        palette.bg,
        className,
      )}>
      <Text className={cn('font-display text-[9px] uppercase tracking-[1.5px]', palette.text)}>
        {label}
      </Text>
    </View>
  );
}

const PROJECT_TONE: Record<ProjectStatus, BadgeTone> = {
  active: 'lime',
  paused: 'yellow',
  completed: 'sky',
  archived: 'white',
};

const TASK_TONE: Record<TaskStatus, BadgeTone> = {
  pending: 'yellow',
  in_progress: 'sky',
  completed: 'lime',
};

const PRIORITY_TONE: Record<TaskPriority, BadgeTone> = {
  low: 'mint',
  medium: 'yellow',
  high: 'pink',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge label={PROJECT_STATUS_LABEL[status]} tone={PROJECT_TONE[status]} />;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge label={TASK_STATUS_LABEL[status]} tone={TASK_TONE[status]} />;
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge label={`Prioridad ${TASK_PRIORITY_LABEL[priority]}`} tone={PRIORITY_TONE[priority]} />;
}

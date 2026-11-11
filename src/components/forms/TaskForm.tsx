import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { FormError } from '@/components/auth/AuthHero';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoInput } from '@/components/ui/NeoInput';
import type { Project, TaskInput, TaskPriority, TaskStatus } from '@/types';
import { isValidISODate } from '@/utils/dates';
import { validateRequired } from '@/utils/validation';

const STATUS_OPTIONS: { value: TaskStatus; label: string; tone: 'yellow' | 'sky' | 'lime' }[] = [
  { value: 'pending', label: 'Pendiente', tone: 'yellow' },
  { value: 'in_progress', label: 'En curso', tone: 'sky' },
  { value: 'completed', label: 'Completada', tone: 'lime' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; tone: 'mint' | 'yellow' | 'pink' }[] = [
  { value: 'low', label: 'Baja', tone: 'mint' },
  { value: 'medium', label: 'Media', tone: 'yellow' },
  { value: 'high', label: 'Alta', tone: 'pink' },
];

interface TaskFormProps {
  projects: Project[];
  initial?: Partial<TaskInput>;
  submitLabel: string;
  loading?: boolean;
  serverError?: string;
  onSubmit: (input: TaskInput) => Promise<void> | void;
}

export function TaskForm({
  projects,
  initial,
  submitLabel,
  loading,
  serverError,
  onSubmit,
}: TaskFormProps) {
  const [projectId, setProjectId] = useState(initial?.project_id ?? projects[0]?.id ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'pending');
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const submit = async () => {
    const nextErrors = {
      projectId: projectId ? undefined : 'Selecciona un proyecto.',
      title: validateRequired(title, 'El título', 3),
      dueDate: dueDate && !isValidISODate(dueDate) ? 'Usa el formato AAAA-MM-DD.' : undefined,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    await onSubmit({
      project_id: projectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      due_date: dueDate || null,
    });
  };

  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: project.title.length > 24 ? `${project.title.slice(0, 24)}…` : project.title,
    tone: 'sky' as const,
  }));

  return (
    <NeoCard bodyClassName="gap-4 p-4">
      {serverError ? <FormError message={serverError} /> : null}

      <View className="gap-1.5">
        <ChipGroup
          label="Proyecto"
          options={projectOptions}
          value={projectId}
          onChange={setProjectId}
          error={errors.projectId}
        />
        <Text className="text-[10px] text-muted">
          La tarea quedará vinculada al proyecto seleccionado.
        </Text>
      </View>

      <NeoInput
        label="Título de la tarea"
        placeholder="Ej. Diseñar pantalla de login"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
        maxLength={120}
        required
      />

      <NeoInput
        label="Descripción"
        placeholder="Detalles, criterios o recordatorios..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        maxLength={500}
      />

      <ChipGroup label="Estado" options={STATUS_OPTIONS} value={status} onChange={setStatus} />

      <ChipGroup
        label="Prioridad"
        options={PRIORITY_OPTIONS}
        value={priority}
        onChange={setPriority}
      />

      <NeoInput
        label="Fecha de entrega"
        placeholder="AAAA-MM-DD"
        value={dueDate}
        onChangeText={setDueDate}
        error={errors.dueDate}
        maxLength={10}
        keyboardType="numbers-and-punctuation"
        hint="Opcional · formato AAAA-MM-DD"
      />

      <NeoButton label={submitLabel} onPress={submit} loading={loading} variant="ink" />
    </NeoCard>
  );
}

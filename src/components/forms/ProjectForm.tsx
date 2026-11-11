import React, { useState } from 'react';
import { View } from 'react-native';

import { FormError } from '@/components/auth/AuthHero';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoInput } from '@/components/ui/NeoInput';
import type { ProjectInput, ProjectStatus } from '@/types';
import { isValidISODate, todayISO } from '@/utils/dates';
import { validateRequired } from '@/utils/validation';

const STATUS_OPTIONS: { value: ProjectStatus; label: string; tone: 'lime' | 'yellow' | 'sky' | 'violet' }[] = [
  { value: 'active', label: 'Activo', tone: 'lime' },
  { value: 'paused', label: 'En pausa', tone: 'yellow' },
  { value: 'completed', label: 'Completado', tone: 'sky' },
  { value: 'archived', label: 'Archivado', tone: 'violet' },
];

interface ProjectFormProps {
  initial?: Partial<ProjectInput>;
  submitLabel: string;
  loading?: boolean;
  serverError?: string;
  onSubmit: (input: ProjectInput) => Promise<void> | void;
}

export function ProjectForm({
  initial,
  submitLabel,
  loading,
  serverError,
  onSubmit,
}: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'active');
  const [startDate, setStartDate] = useState(initial?.start_date ?? todayISO());
  const [deadline, setDeadline] = useState(initial?.deadline ?? '');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const submit = async () => {
    const nextErrors = {
      title: validateRequired(title, 'El título', 3),
      startDate:
        startDate && !isValidISODate(startDate) ? 'Usa el formato AAAA-MM-DD.' : undefined,
      deadline:
        deadline && !isValidISODate(deadline) ? 'Usa el formato AAAA-MM-DD.' : undefined,
    };
    if (startDate && deadline && isValidISODate(startDate) && isValidISODate(deadline)) {
      if (deadline < startDate) nextErrors.deadline = 'La fecha límite no puede ser anterior al inicio.';
    }
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      start_date: startDate || null,
      deadline: deadline || null,
    });
  };

  return (
    <NeoCard bodyClassName="gap-4 p-4">
      {serverError ? <FormError message={serverError} /> : null}

      <NeoInput
        label="Título del proyecto"
        placeholder="Ej. Proyecto final de Aplicaciones Móviles"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
        maxLength={120}
        required
      />

      <NeoInput
        label="Descripción"
        placeholder="¿De qué trata? ¿Qué debes entregar?"
        value={description}
        onChangeText={setDescription}
        error={errors.description}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        maxLength={500}
      />

      <ChipGroup
        label="Estado"
        options={STATUS_OPTIONS}
        value={status}
        onChange={setStatus}
        error={errors.status}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <NeoInput
            label="Inicio"
            placeholder="AAAA-MM-DD"
            value={startDate}
            onChangeText={setStartDate}
            error={errors.startDate}
            maxLength={10}
            keyboardType="numbers-and-punctuation"
            hint="Formato AAAA-MM-DD"
          />
        </View>
        <View className="flex-1">
          <NeoInput
            label="Fecha límite"
            placeholder="AAAA-MM-DD"
            value={deadline}
            onChangeText={setDeadline}
            error={errors.deadline}
            maxLength={10}
            keyboardType="numbers-and-punctuation"
            hint="Opcional"
          />
        </View>
      </View>

      <NeoButton label={submitLabel} onPress={submit} loading={loading} variant="ink" />
    </NeoCard>
  );
}

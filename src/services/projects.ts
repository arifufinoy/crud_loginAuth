import type {
  DashboardStats,
  Project,
  ProjectInput,
  Task,
  TaskInput,
  TaskWithProject,
} from '@/types';

import { supabase } from './supabase';

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/* PROJECTS                                                            */
/* ------------------------------------------------------------------ */

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  throwIfError(error);
  return (data ?? []) as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  throwIfError(error);
  return data as Project | null;
}

export async function getRecentProjects(limit = 4): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  throwIfError(error);
  return (data ?? []) as Project[];
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');

  const { data, error } = await supabase
    .from('projects')
    .insert({ ...input, user_id: userData.user.id })
    .select()
    .single();
  throwIfError(error);
  return data as Project;
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  throwIfError(error);
}

/* ------------------------------------------------------------------ */
/* TASKS                                                               */
/* ------------------------------------------------------------------ */

export async function getTasks(projectId?: string): Promise<TaskWithProject[]> {
  let query = supabase
    .from('tasks')
    .select('*, project:projects(id, title)')
    .order('created_at', { ascending: false });

  if (projectId) query = query.eq('project_id', projectId);

  const { data, error } = await query;
  throwIfError(error);
  return (data ?? []) as unknown as TaskWithProject[];
}

export async function getTask(id: string): Promise<TaskWithProject | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, project:projects(id, title)')
    .eq('id', id)
    .maybeSingle();
  throwIfError(error);
  return data as unknown as TaskWithProject | null;
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  throwIfError(error);
  return (data ?? []) as Task[];
}

export async function createTask(input: TaskInput): Promise<Task> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...input, user_id: userData.user.id })
    .select()
    .single();
  throwIfError(error);
  return data as Task;
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return data as Task;
}

export async function updateTaskStatus(
  id: string,
  status: Task['status'],
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  throwIfError(error);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  throwIfError(error);
}

/* ------------------------------------------------------------------ */
/* DASHBOARD                                                           */
/* ------------------------------------------------------------------ */

export async function getDashboardStats(): Promise<DashboardStats> {
  const [projects, tasks] = await Promise.all([
    supabase.from('projects').select('status'),
    supabase.from('tasks').select('status'),
  ]);

  throwIfError(projects.error);
  throwIfError(tasks.error);

  const projectRows = projects.data ?? [];
  const taskRows = tasks.data ?? [];

  return {
    totalProjects: projectRows.length,
    activeProjects: projectRows.filter((p) => p.status === 'active').length,
    pendingTasks: taskRows.filter((t) => t.status !== 'completed').length,
    completedTasks: taskRows.filter((t) => t.status === 'completed').length,
  };
}

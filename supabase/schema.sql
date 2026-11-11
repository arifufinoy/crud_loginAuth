-- ============================================================
-- ACADEX · DEBER 6
-- Esquema Supabase: proyectos, tareas, triggers, índices y RLS
-- Ejecuta TODO este archivo en Supabase > SQL Editor > New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- TABLA: projects
-- ------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(btrim(title)) between 1 and 120),
  description text check (description is null or char_length(description) <= 1000),
  status      text not null default 'active'
              check (status in ('active', 'paused', 'completed', 'archived')),
  start_date  date,
  deadline    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint projects_dates_check
    check (deadline is null or start_date is null or deadline >= start_date)
);

-- ------------------------------------------------------------
-- TABLA: tasks
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(btrim(title)) between 1 and 120),
  description text check (description is null or char_length(description) <= 1000),
  status      text not null default 'pending'
              check (status in ('pending', 'in_progress', 'completed')),
  priority    text not null default 'medium'
              check (priority in ('low', 'medium', 'high')),
  due_date    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ÍNDICES
-- ------------------------------------------------------------
create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_deadline_idx on public.projects (deadline);
create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_due_date_idx on public.tasks (due_date);
create index if not exists tasks_priority_idx on public.tasks (priority);

-- ------------------------------------------------------------
-- updated_at automático
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- Solo usuarios autenticados reciben permisos de tabla.
revoke all on public.projects from anon;
revoke all on public.tasks from anon;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;

-- =========================== PROJECTS =======================
drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
on public.projects for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
on public.projects for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
on public.projects for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
on public.projects for delete
to authenticated
using (auth.uid() = user_id);

-- ============================ TASKS =========================
-- Una tarea es visible/editable solo si pertenece al usuario Y su
-- proyecto también le pertenece. Esto evita tareas cruzadas.
drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
on public.tasks for select
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.projects p
    where p.id = tasks.project_id and p.user_id = auth.uid()
  )
);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
on public.tasks for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.projects p
    where p.id = tasks.project_id and p.user_id = auth.uid()
  )
);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
on public.tasks for update
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.projects p
    where p.id = tasks.project_id and p.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.projects p
    where p.id = tasks.project_id and p.user_id = auth.uid()
  )
);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
on public.tasks for delete
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.projects p
    where p.id = tasks.project_id and p.user_id = auth.uid()
  )
);

-- ------------------------------------------------------------
-- Verificación rápida (opcional)
-- ------------------------------------------------------------
-- select tablename, rowsecurity from pg_tables
-- where schemaname = 'public' and tablename in ('projects', 'tasks');
--
-- select schemaname, tablename, policyname, cmd
-- from pg_policies
-- where schemaname = 'public' and tablename in ('projects', 'tasks')
-- order by tablename, cmd;

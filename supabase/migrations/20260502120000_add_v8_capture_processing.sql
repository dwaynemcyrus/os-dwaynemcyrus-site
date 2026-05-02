alter table public.items
add column if not exists parent_id uuid references public.items(id) on delete set null,
add column if not exists kind text not null default 'capture',
add column if not exists is_archived boolean not null default false,
add column if not exists waiting_reason text,
add column if not exists delegated_to text,
add column if not exists metadata jsonb not null default '{}'::jsonb,
add column if not exists completed_at timestamptz,
add column if not exists archived_at timestamptz,
add column if not exists incubated_at timestamptz;

alter table public.items
alter column type drop not null,
alter column status set default 'later';

alter table public.items
drop constraint if exists items_type_check;

alter table public.items
drop constraint if exists items_status_check;

alter table public.items
drop constraint if exists items_kind_check;

alter table public.items
drop constraint if exists items_action_type_check;

alter table public.items
drop constraint if exists items_capture_type_check;

alter table public.items
drop constraint if exists items_nonempty_content_check;

alter table public.items
drop constraint if exists items_completed_at_check;

alter table public.items
drop constraint if exists items_incubated_at_check;

update public.items
set
  metadata = coalesce(metadata, '{}'::jsonb) ||
    jsonb_strip_nulls(
      jsonb_build_object(
        'legacyType', type,
        'legacySubtype', subtype
      )
    ),
  kind = case
    when type in ('task', 'project') then 'action'
    when type = 'reference' then 'reference'
    when type = 'media' then 'reference'
    when type in ('content', 'idea', 'journal') then 'creation'
    else 'capture'
  end,
  type = case
    when type in ('task', 'project') then type
    when type = 'reference' and subtype in ('book', 'article') then 'literature'
    when type = 'reference' and subtype = 'note' then 'slip'
    when type = 'reference' then 'link'
    when type = 'media' and subtype in ('book', 'article') then 'literature'
    when type = 'media' then 'link'
    when type in ('content', 'idea', 'journal') then 'essay'
    else null
  end,
  status = case
    when type in ('incubate', 'someday') then 'incubate'
    when status = 'waiting' then 'waiting'
    else 'later'
  end,
  incubated_at = case
    when type in ('incubate', 'someday') then coalesce(incubated_at, updated_at)
    else incubated_at
  end
where kind = 'capture'
  and (
    type is not null
    or status = 'backlog'
    or status = 'waiting'
  );

alter table public.items
add constraint items_kind_check check (
  kind in ('capture', 'action', 'reference', 'creation')
);

alter table public.items
add constraint items_status_check check (
  status in ('later', 'active', 'waiting', 'paused', 'complete', 'incubate')
);

alter table public.items
add constraint items_action_type_check check (
  kind <> 'action'
  or type in ('task', 'project', 'habit')
);

alter table public.items
add constraint items_capture_type_check check (
  kind <> 'capture'
  or type is null
);

alter table public.items
add constraint items_nonempty_content_check check (
  length(trim(content)) > 0
);

alter table public.items
add constraint items_completed_at_check check (
  status <> 'complete'
  or completed_at is not null
);

alter table public.items
add constraint items_incubated_at_check check (
  status <> 'incubate'
  or incubated_at is not null
);

create index if not exists items_kind_state_idx
  on public.items (user_id, kind, is_trashed, is_archived);

create index if not exists items_parent_idx
  on public.items (user_id, parent_id);

create index if not exists items_kind_type_idx
  on public.items (user_id, kind, type);

create table if not exists public.type_registry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint type_registry_kind_check check (kind in ('reference', 'creation', 'log')),
  constraint type_registry_name_check check (length(name) > 0 and btrim(name) = name)
);

create unique index if not exists type_registry_user_kind_name_idx
  on public.type_registry (user_id, kind, lower(name));

create index if not exists type_registry_user_kind_idx
  on public.type_registry (user_id, kind, name);

drop trigger if exists set_type_registry_updated_at on public.type_registry;

create trigger set_type_registry_updated_at
before update on public.type_registry
for each row
execute function public.set_updated_at();

alter table public.type_registry enable row level security;

drop policy if exists "select own" on public.type_registry;
create policy "select own"
on public.type_registry for select
using (auth.uid() = user_id);

drop policy if exists "insert own" on public.type_registry;
create policy "insert own"
on public.type_registry for insert
with check (auth.uid() = user_id);

drop policy if exists "update own" on public.type_registry;
create policy "update own"
on public.type_registry for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "delete own" on public.type_registry;
create policy "delete own"
on public.type_registry for delete
using (auth.uid() = user_id);

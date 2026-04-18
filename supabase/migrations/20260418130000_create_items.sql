create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  content text not null,
  type text not null default 'unknown',
  status text not null default 'backlog',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  device_created_at timestamptz,
  device_updated_at timestamptz,
  sync_state text not null default 'synced',
  last_synced_at timestamptz,
  is_trashed boolean not null default false,
  trashed_at timestamptz,
  constraint items_type_check check (
    type in ('unknown', 'task', 'idea', 'content', 'journal', 'reference', 'someday')
  ),
  constraint items_status_check check (
    status in ('backlog')
  ),
  constraint items_sync_state_check check (
    sync_state in ('pending_sync', 'synced', 'sync_error')
  )
);

create index if not exists items_user_idx
  on public.items (user_id);

create index if not exists items_created_idx
  on public.items (user_id, created_at desc);

create index if not exists items_sync_idx
  on public.items (user_id, sync_state);

create index if not exists items_trashed_idx
  on public.items (user_id, is_trashed);

drop trigger if exists set_items_updated_at on public.items;

create trigger set_items_updated_at
before update on public.items
for each row
execute function public.set_updated_at();

alter table public.items enable row level security;

drop policy if exists "select own" on public.items;
create policy "select own"
on public.items for select
using (auth.uid() = user_id);

drop policy if exists "insert own" on public.items;
create policy "insert own"
on public.items for insert
with check (auth.uid() = user_id);

drop policy if exists "update own" on public.items;
create policy "update own"
on public.items for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

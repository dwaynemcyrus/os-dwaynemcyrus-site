update public.items
set type = 'incubate'
where type = 'someday';

alter table public.items
drop constraint if exists items_type_check;

alter table public.items
add constraint items_type_check check (
  type in (
    'unknown',
    'task',
    'idea',
    'content',
    'journal',
    'reference',
    'project',
    'incubate'
  )
);

create index if not exists items_type_created_idx
  on public.items (user_id, type, created_at desc);

create index if not exists items_type_updated_idx
  on public.items (user_id, type, updated_at desc);

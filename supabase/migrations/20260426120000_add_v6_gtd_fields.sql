-- Add media to type constraint
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
    'incubate',
    'media'
  )
);

-- Add waiting to status values
alter table public.items
drop constraint if exists items_status_check;

alter table public.items
add constraint items_status_check check (
  status in ('backlog', 'waiting')
);

-- New columns
alter table public.items
add column if not exists subtype text;

alter table public.items
add column if not exists start_at timestamptz;

alter table public.items
add column if not exists end_at timestamptz;

-- Constrain subtype values
alter table public.items
drop constraint if exists items_subtype_check;

alter table public.items
add constraint items_subtype_check check (
  subtype is null
  or subtype in ('note', 'article', 'book', 'video', 'podcast')
);

-- Index for calendar view (items with scheduled dates)
create index if not exists items_calendar_idx
  on public.items (user_id, start_at, end_at)
  where start_at is not null or end_at is not null;

-- Index for waiting view
create index if not exists items_status_idx
  on public.items (user_id, status, updated_at desc);

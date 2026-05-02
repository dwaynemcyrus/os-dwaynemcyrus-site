update public.items
set
  metadata = coalesce(metadata, '{}'::jsonb) ||
    jsonb_strip_nulls(
      jsonb_build_object(
        'requeuedFromKind', kind,
        'requeuedFromType', type,
        'requeuedFromStatus', status
      )
    ),
  kind = 'capture',
  type = null,
  status = 'later',
  updated_at = now()
where kind <> 'capture'
  or type is not null
  or status <> 'later';

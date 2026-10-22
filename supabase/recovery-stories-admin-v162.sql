-- AFV162: draft, archive, and manual ordering support for temporary Recovery Stories.
-- Run once in the Supabase SQL Editor before using the new admin features.
-- Existing stories remain active and keep their existing expiry timestamps.

alter table public.recovery_stories
  add column if not exists admin_status text not null default 'active'
    check (admin_status in ('active', 'draft', 'archived')),
  add column if not exists sort_order integer not null default 0;

update public.recovery_stories
set admin_status = case
  when is_active = false then 'archived'
  else 'active'
end
where admin_status is null or admin_status not in ('active', 'draft', 'archived');

-- The column default marks pre-existing rows as active, so preserve legacy archive state.
update public.recovery_stories set admin_status = 'archived' where is_active = false and admin_status = 'active';

create index if not exists recovery_stories_admin_status_sort_order_idx
  on public.recovery_stories (admin_status, sort_order, published_at desc);

-- Public listing remains server-mediated. Keep RLS and existing grants/policies unchanged.

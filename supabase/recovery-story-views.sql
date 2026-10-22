-- AFV152: private total view counts for temporary Recovery Stories.
-- Run once in the Supabase SQL Editor for the project's database.

create table if not exists public.recovery_story_view_counts (
  story_id uuid primary key references public.recovery_stories(id) on delete cascade,
  views bigint not null default 0 check (views >= 0),
  updated_at timestamptz not null default now()
);

alter table public.recovery_story_view_counts enable row level security;
-- Intentionally create no anon/authenticated policies. Reads are performed server-side
-- with the service-role secret only after the admin identity has been verified.

create or replace function public.increment_recovery_story_view(p_story_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.recovery_stories
    where id = p_story_id and is_active = true and expires_at > now()
  ) then
    return;
  end if;

  insert into public.recovery_story_view_counts (story_id, views, updated_at)
  values (p_story_id, 1, now())
  on conflict (story_id) do update
    set views = public.recovery_story_view_counts.views + 1,
        updated_at = now();
end;
$$;

revoke all on function public.increment_recovery_story_view(uuid) from public, anon, authenticated;
grant execute on function public.increment_recovery_story_view(uuid) to service_role;
grant select, insert, update, delete on public.recovery_story_view_counts to service_role;

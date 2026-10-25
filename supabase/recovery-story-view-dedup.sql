-- Arisu Fix: deduplicate Recovery Story views per browser session.
-- Run once in the MAIN Supabase project's SQL Editor before deploying the code changes.

begin;

create table if not exists public.recovery_story_view_events (
  story_id uuid not null references public.recovery_stories(id) on delete cascade,
  session_id uuid not null,
  viewed_at timestamptz not null default now(),
  constraint recovery_story_view_events_pkey primary key (story_id, session_id)
);

alter table public.recovery_story_view_events enable row level security;
revoke all on table public.recovery_story_view_events from public, anon, authenticated;
grant select, insert, update, delete on table public.recovery_story_view_events to service_role;

create or replace function public.record_recovery_story_view(
  p_story_id uuid,
  p_session_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_rows integer;
begin
  if p_story_id is null or p_session_id is null then
    return false;
  end if;

  if not exists (
    select 1
    from public.recovery_stories
    where id = p_story_id
      and is_active = true
      and expires_at > now()
  ) then
    return false;
  end if;

  -- The primary key guarantees one event per story and session, even for
  -- simultaneous/repeated requests. Only a newly inserted event increments views.
  insert into public.recovery_story_view_events (story_id, session_id, viewed_at)
  values (p_story_id, p_session_id, now())
  on conflict (story_id, session_id) do nothing;

  get diagnostics inserted_rows = row_count;
  if inserted_rows = 0 then
    return false;
  end if;

  insert into public.recovery_story_view_counts (story_id, views, updated_at)
  values (p_story_id, 1, now())
  on conflict (story_id) do update
    set views = public.recovery_story_view_counts.views + 1,
        updated_at = now();

  return true;
end;
$$;

revoke all on function public.record_recovery_story_view(uuid, uuid) from public, anon, authenticated;
grant execute on function public.record_recovery_story_view(uuid, uuid) to service_role;

commit;

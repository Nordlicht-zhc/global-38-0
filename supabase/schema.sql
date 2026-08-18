-- Run this in the Supabase SQL Editor before enabling cloud saves.
create table if not exists public.cloud_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  slot text not null default 'default' check (slot = 'default'),
  payload jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, slot)
);

alter table public.cloud_saves enable row level security;

drop policy if exists "Users can read their own cloud saves" on public.cloud_saves;
create policy "Users can read their own cloud saves"
  on public.cloud_saves for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own cloud saves" on public.cloud_saves;
create policy "Users can create their own cloud saves"
  on public.cloud_saves for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own cloud saves" on public.cloud_saves;
create policy "Users can update their own cloud saves"
  on public.cloud_saves for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on table public.cloud_saves to authenticated;
revoke all on table public.cloud_saves from anon;

create index if not exists cloud_saves_user_id_idx
  on public.cloud_saves using btree (user_id);

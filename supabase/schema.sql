-- Quranodoro — Supabase schema
-- This mirrors the migrations already applied to the project via the
-- Supabase MCP server. Kept here for reference / fresh-project setup.
-- Enable Email auth (with confirmation) under Authentication → Providers,
-- and Google under Authentication → Providers → Google for OAuth sign-in.

-- Shared updated_at maintenance
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Profiles: one row per user, created automatically on signup
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Auto-create a profile row whenever a new auth user is created.
-- display_name is only taken from explicit signup metadata; OAuth users
-- (e.g. Google) are left null so the app can prompt them for the name
-- they want displayed.
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = ''
language plpgsql
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Only the auth trigger may run this; never via the REST API.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Do not expose an email lookup RPC: it enables account enumeration.

-- ------------------------------------------------------------
-- Per-user app state (settings, presets, farm) as JSON snapshots
-- ------------------------------------------------------------
create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  farm jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

create policy "Users manage own state"
  on public.user_state for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- One row per completed Pomodoro phase (drives analytics)
-- ------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  completed_at timestamptz not null,
  phase text not null check (phase in ('focus', 'shortBreak', 'longBreak')),
  duration_minutes integer not null check (duration_minutes > 0),
  preset_id text not null,
  growth_points integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_completed_idx
  on public.sessions (user_id, completed_at desc);

alter table public.sessions enable row level security;

create policy "Users manage own sessions"
  on public.sessions for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

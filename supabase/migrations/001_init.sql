-- TraceDay 时间记录表
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  start_minutes int not null check (start_minutes >= 0 and start_minutes < 1440),
  end_minutes int not null check (end_minutes > start_minutes and end_minutes <= 1440),
  title text not null default '',
  notes text,
  efficiency text not null default 'none' check (efficiency in ('none', 'high', 'medium', 'low')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists time_entries_user_date_idx
  on public.time_entries (user_id, entry_date);

alter table public.time_entries enable row level security;

create policy "Users can read own entries"
  on public.time_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on public.time_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on public.time_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.time_entries for delete
  using (auth.uid() = user_id);

-- 自动更新 updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists time_entries_updated_at on public.time_entries;
create trigger time_entries_updated_at
  before update on public.time_entries
  for each row execute function public.set_updated_at();

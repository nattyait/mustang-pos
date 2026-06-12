create table if not exists app_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists app_state_state_gin_idx on app_state using gin (state);

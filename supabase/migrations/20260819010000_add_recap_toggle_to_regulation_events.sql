-- Filet de sécurité : recrée le journal d'historique append-only des
-- régulations s'il n'existe pas déjà (il est normalement créé en amont,
-- cette table n'apparaît dans aucune migration précédente du dépôt).
create table if not exists public.timetable_regulation_events (
  id uuid primary key default gen_random_uuid(),
  service_id text not null,
  line text not null,
  service_date date not null,
  status text not null,
  delay_minutes integer not null default 0,
  public_message text,
  created_by_discord_id text,
  created_by_name text,
  created_at timestamptz not null default now()
);

-- Permet de retirer une régulation précise du récap mensuel (case
-- "Retirer du récap" au moment de cliquer sur "Réinitialiser" côté
-- Régulation de départ), sans jamais supprimer la ligne du journal
-- d'historique lui-même (traçabilité conservée).
alter table public.timetable_regulation_events
  add column if not exists included_in_recap boolean not null default true;

create index if not exists timetable_regulation_events_date_idx
  on public.timetable_regulation_events(service_date, service_id);

alter table public.timetable_regulation_events enable row level security;

drop policy if exists "Service role manages regulation events" on public.timetable_regulation_events;
create policy "Service role manages regulation events"
  on public.timetable_regulation_events for all to service_role using (true) with check (true);
